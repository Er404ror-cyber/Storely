import { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Package } from "lucide-react";

import { LayoutGrid, LayoutList, ProductShowcaseSkeleton } from "../../produtos/layouts";
import { useTranslate } from "../../../context/LanguageContext";
import { useAdminStore } from "../../../hooks/useAdminStore";

import { cacheKey, writeCache, CACHE_VERSION } from "../../../utils/text";
import { useStoreProducts } from "../../../hooks/useStoreProducts"; 
import { FONT_SIZE_MAPS, HERO_PALETTES } from "../../produtos/componentsAdmim/theme";

import { useProductIntelligence } from "../../../utils/ProductIntelligence";
import { CatalogFilters } from "../../produtos/componentsAdmim/CatalogFilters";
import { CatalogHeader } from "../../produtos/componentsAdmim/CatalogHeader";

const EDITOR_PREVIEW_LIMIT = 4;

export type SectionStyles = {
  theme?: "dark" | "light";
  align?: "center" | "left" | "justify";
  cols?: string | number;
  fontSize?: "small" | "base" | "medium" | "large";
};

export interface CatalogProps {
  content: { title?: string; subtitle?: string; empty_text?: string };
  style: SectionStyles;
  storeId?: string;
  store_id?: string;
  section?: any;
  onUpdate?: (field: string, value: string) => void;
}

export function ProductsCatalog(props: CatalogProps) {
  const { t } = useTranslate();
  const { enrichProductsIntelligently } = useProductIntelligence();

  const navigate = useNavigate();
  const location = useLocation();
  const { storeSlug, pageSlug } = useParams();
  const queryClient = useQueryClient();

  const isEditor = location.pathname.includes("/editor/");
  const isReadOnly = !isEditor;
  const isDark = props.style?.theme === "dark";
  const isCenter = props.style?.align === "center";

  const [activeParent, setActiveParent] = useState<string>("Todos");
  const [activeChild, setActiveChild] = useState<string>("");
  const [activeAttribute, setActiveAttribute] = useState<string>("");
  const [onlyDiscounts, setOnlyDiscounts] = useState<boolean>(false);

  const fallbackTitle = useMemo(() => t("catalog_default_title") || "Catálogo Oficial", [t]);
  const fallbackSubtitle = useMemo(() => t("catalog_default_subtitle") || "Explore produtos selecionados com garantia e qualidade.", [t]);

  const layoutCols = Math.min(Math.max(Number(props.style?.cols) || 4, 1), 4);
  const currentFonts = FONT_SIZE_MAPS[props.style?.fontSize || "base"];

  const { data: adminStore } = useAdminStore();

  const rawStoreId = props.storeId || props.store_id || props.section?.store_id;
  const effectiveStoreId = isReadOnly ? rawStoreId : (rawStoreId || adminStore?.id);

  // Leitura síncrona do cache
  const { data: storeBundle, isLoading: isLoadingProducts } = useStoreProducts(
    effectiveStoreId, 
    adminStore?.currency || "MZN", 
    storeSlug || adminStore?.slug, 
    t
  );

  // 1. Extração garantida como Array plano
  const rawProducts = useMemo(() => {
    if (Array.isArray(storeBundle)) return storeBundle;
    if (storeBundle && Array.isArray((storeBundle as any).products)) return (storeBundle as any).products;
    return [];
  }, [storeBundle]);

  const fetchedStore = useMemo(() => {
    if (storeBundle && !Array.isArray(storeBundle) && (storeBundle as any).store) {
      return (storeBundle as any).store;
    }
    return null;
  }, [storeBundle]);

  const activeStoreSlug = isReadOnly ? (storeSlug || fetchedStore?.slug) : adminStore?.slug;
  const storeName = isReadOnly ? (fetchedStore?.name || t("store_official_title") || "Loja Oficial") : (adminStore?.name || t("store_official_title") || "Loja Oficial");
  const storeLogo = isReadOnly ? fetchedStore?.logo_url : adminStore?.logo_url;
  const storeCurrency = isReadOnly ? (fetchedStore?.currency || "MZN") : (adminStore?.currency || "MZN");

  const resolvedStoreId = effectiveStoreId || fetchedStore?.id;

  // 1. Sorteia o índice UMA ÚNICA VEZ ao carregar o componente
const [randomPaletteIndex] = useState(() => 
  Math.floor(Math.random() * HERO_PALETTES.dark.length)
);

// 2. Apenas alterna o tema (dark/light) mantendo o mesmo índice de cor
const designPalette = useMemo(() => {
  const list = HERO_PALETTES[isDark ? "dark" : "light"];
  return list[randomPaletteIndex % list.length];
}, [isDark, randomPaletteIndex]);
  // 2. Processamento defensivo garantindo que o retorno seja sempre um Array
  const processedProducts = useMemo(() => {
    const safeRaw = Array.isArray(rawProducts) ? rawProducts : [];
    const enriched = enrichProductsIntelligently ? enrichProductsIntelligently(safeRaw) : safeRaw;

    const targetArray = Array.isArray(enriched) 
      ? enriched 
      : (enriched && Array.isArray((enriched as any).products) ? (enriched as any).products : safeRaw);

    return targetArray.map((p: any) => {
      const discount = Number(p.discount_percent) || 0;
      const hasDiscount = discount > 0;
      const originalPrice = Number(p.price) || 0;
      const finalPrice = hasDiscount ? originalPrice - (originalPrice * (discount / 100)) : originalPrice;

      return {
        ...p,
        discount_percent: discount,
        has_discount: hasDiscount,
        original_price: originalPrice,
        final_price: finalPrice
      };
    });
  }, [rawProducts, enrichProductsIntelligently]);

  // Capa: 1 produto mais recente de cada categoria existente
  const categoryCoverImages = useMemo(() => {
    if (!processedProducts.length) return [];
    const categoryMap = new Map<string, string>();

    for (const p of processedProducts) {
      const img = p.image_url || p.main_image || p.gallery?.[0];
      if (!img) continue;

      const cat = p.metadata?.parentCategory || p.category || (t("common_general") || "Geral");
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, img);
      }
    }
    return Array.from(categoryMap.values());
  }, [processedProducts, t]);

  const editorMockupImage = useMemo(() => {
    return categoryCoverImages[0] || processedProducts[0]?.image_url || processedProducts[0]?.main_image || null;
  }, [categoryCoverImages, processedProducts]);

  const categoriesCount = useMemo(() => {
    const categories = new Set(processedProducts.map((p: any) => p.metadata?.parentCategory || p.category).filter(Boolean));
    return categories.size;
  }, [processedProducts]);

  const onSaleCount = useMemo(() => {
    return processedProducts.filter((p: any) => p.has_discount).length;
  }, [processedProducts]);

  useEffect(() => {
    if (processedProducts.length > 0 && resolvedStoreId) {
      const searchCacheKey = cacheKey("store_catalog", CACHE_VERSION, resolvedStoreId);
      writeCache(searchCacheKey, processedProducts, activeStoreSlug);
      queryClient.setQueryData(["catalog-products-full", resolvedStoreId, storeCurrency], processedProducts);
    }
  }, [processedProducts, resolvedStoreId, storeCurrency, activeStoreSlug, queryClient]);

  const isLoading = isLoadingProducts && processedProducts.length === 0;

  // 3. Filtragem garantida como Array
  const displayProducts = useMemo(() => {
    let filtered = Array.isArray(processedProducts) ? processedProducts : [];

    if (!isEditor && onlyDiscounts) {
      filtered = filtered.filter((p: any) => p.has_discount);
    }

    if (!isEditor && activeParent !== "Todos") {
      filtered = filtered.filter((p: any) => p.metadata?.parentCategory === activeParent);
    }

    if (!isEditor && activeChild) {
      filtered = filtered.filter((p: any) => p.metadata?.subCategory === activeChild);
    }

    if (!isEditor && activeAttribute) {
      const genderFilters = ["Homem", "Mulher", "Criança", "Men", "Women", "Kids"];
      const isGenderFilter = genderFilters.includes(activeAttribute);

      filtered = filtered.filter((p: any) => {
        if (isGenderFilter) {
          return p.metadata?.gender === activeAttribute || !p.metadata?.gender;
        }

        return (
          (p.metadata?.sizes || []).includes(activeAttribute) ||
          (p.metadata?.attributes || []).includes(activeAttribute)
        );
      });
    }

    if (isEditor) return filtered.slice(0, EDITOR_PREVIEW_LIMIT);
    return filtered;
  }, [processedProducts, activeParent, activeChild, activeAttribute, onlyDiscounts, isEditor]);

  const handleProductClick = useCallback((productId: string) => {
    if (isEditor || !activeStoreSlug) return;
    const clickedProduct = processedProducts.find((p: any) => p.id === productId);

    navigate(`/${activeStoreSlug}/${pageSlug || "products"}/${productId}`, { 
      state: { 
        fromStore: true,
        product: clickedProduct,
        initialProducts: processedProducts,
        storeCurrency: storeCurrency,
        effectiveStoreId: resolvedStoreId
      } 
    });
  }, [isEditor, activeStoreSlug, navigate, pageSlug, processedProducts, storeCurrency, resolvedStoreId]);

  const handleUpdateText = useCallback((field: "title" | "subtitle", value: string) => {
    if (props.onUpdate) {
      props.onUpdate(field, value);
    }
  }, [props]);

  const handleToggleDiscounts = useCallback(() => {
    setOnlyDiscounts((prev) => !prev);
  }, []);

  return (
    <section 
      className={`w-full overflow-hidden subpixel-antialiased ${isDark ? "bg-[#09090b] text-zinc-100" : "bg-[#fcfcfd] text-zinc-900"}`} 
      style={{ contentVisibility: "auto", contain: "layout style", transform: "translateZ(0)" }}
    >
      {/* HEADER MODULARIZADO */}
      <CatalogHeader
        isEditor={isEditor}
        isDark={isDark}
        isCenter={isCenter}
        storeName={storeName}
        storeLogo={storeLogo}
        activeStoreSlug={activeStoreSlug}
        storeCurrency={storeCurrency}
        designPalette={designPalette}
        currentFonts={currentFonts}
        initialTitle={props.content?.title}
        initialSubtitle={props.content?.subtitle}
        fallbackTitle={fallbackTitle}
        fallbackSubtitle={fallbackSubtitle}
        processedProductsCount={processedProducts.length}
        categoriesCount={categoriesCount}
        onSaleCount={onSaleCount}
        categoryCoverImages={categoryCoverImages}
        editorMockupImage={editorMockupImage}
        onlyDiscounts={onlyDiscounts}
        onToggleDiscounts={handleToggleDiscounts}
        onUpdateText={handleUpdateText}
        t={t as (key: string, params?: Record<string, any>) => string}
              />

      {/* ÁREA DE FILTROS & LISTA DE PRODUTOS */}
      <div className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 md:px-8 md:py-6">

        {/* Filtros Hierárquicos (Apenas no modo público) */}
        {isReadOnly && !isLoading && processedProducts.length > 0 && (
          <div className="mb-5">
            <CatalogFilters
              products={processedProducts}
              activeParent={activeParent}
              setActiveParent={setActiveParent}
              activeChild={activeChild}
              setActiveChild={setActiveChild}
              activeAttribute={activeAttribute}
              setActiveAttribute={setActiveAttribute}
              isDark={isDark}
            />
          </div>
        )}

        {/* Grade de Produtos */}
        <div className="w-full grid grid-cols-1 min-h-[220px]">
          {isLoading ? (
            <div className="w-full">
              <ProductShowcaseSkeleton cols={layoutCols} isDark={isDark} />
            </div>
          ) : (
            <div className="w-full select-text">
              {layoutCols === 1 ? (
                <LayoutList products={displayProducts} onAction={handleProductClick} isDark={isDark} t={t} />
              ) : (
                <LayoutGrid products={displayProducts} onAction={handleProductClick} cols={layoutCols} isDark={isDark} t={t} />
              )}
            </div>
          )}

          {/* Estado Vazio */}
          {!isLoading && displayProducts.length === 0 && (
            <div className={`rounded-xl border border-dashed py-12 flex flex-col items-center justify-center text-center px-4 ${isDark ? "border-zinc-800 bg-zinc-900/20" : "border-zinc-300 bg-zinc-50"}`}>
              <Package size={32} className="mb-2 text-zinc-400 opacity-50" />
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
                {onlyDiscounts ? (t("catalog_no_discounts_title") || "Nenhum Produto em Promoção") : (t("catalog_no_products_title") || "Nenhum Produto Encontrado")}
              </h3>
              <p className="text-[11px] text-zinc-500 mt-1 max-w-xs">
                {onlyDiscounts 
                  ? (t("catalog_no_discounts_desc") || "Não há produtos com desconto ativo no momento.") 
                  : (props.content?.empty_text || t("catalog_no_products_desc") || "Não encontramos itens para estes filtros.")}
              </p>
              {onlyDiscounts && !isEditor && (
                <button
                  type="button"
                  onClick={handleToggleDiscounts}
                  className={`mt-3 px-3.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                    isDark ? "bg-zinc-800 text-white hover:bg-zinc-700" : "bg-zinc-900 text-white hover:bg-black"
                  }`}
                >
                  {t("catalog_show_all") || "Mostrar Todos os Produtos"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}