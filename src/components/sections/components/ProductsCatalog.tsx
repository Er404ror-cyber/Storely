import { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, Sparkles } from "lucide-react";

import { LayoutGrid, LayoutList, ProductShowcaseSkeleton } from "../../produtos/layouts";
import { useTranslate } from "../../../context/LanguageContext";
import { supabase } from "../../../lib/supabase";
import { useAdminStore } from "../../../hooks/useAdminStore";

import { cacheKey, readCache, writeCache, CACHE_VERSION } from "../../../utils/text";
import { useStoreProducts, SUPER_CACHE_CONFIG } from "../../../hooks/useStoreProducts"; 
import { FONT_SIZE_MAPS, HERO_PALETTES } from "../../produtos/componentsAdmim/theme";

import { enrichProductsIntelligently } from "../../../utils/ProductIntelligence";
import { CatalogFilters } from "../../produtos/componentsAdmim/CatalogFilters";

const EDITOR_PREVIEW_LIMIT = 5; 
const MAX_TITLE = 60;
const MAX_SUBTITLE = 120;

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
  const currentLang = "pt"; 

  const navigate = useNavigate();
  const location = useLocation();
  const { storeSlug, pageSlug } = useParams();
  const queryClient = useQueryClient();
  
  const isEditor = location.pathname.includes("/editor/");
  const isReadOnly = !isEditor;
  const isDark = props.style?.theme === "dark";

  const [activeParent, setActiveParent] = useState<string>("Todos");
  const [activeChild, setActiveChild] = useState<string>("");
  const [activeAttribute, setActiveAttribute] = useState<string>("");

  const fallbackTitle = useMemo(() => t("catalog_default_title") || "Catálogo Completo", [t]);
  const fallbackSubtitle = useMemo(() => t("catalog_default_subtitle") || "Confira os nossos produtos disponíveis", [t]);

  const [editableTitle, setEditableTitle] = useState(props.content?.title || fallbackTitle);
  const [editableSubtitle, setEditableSubtitle] = useState(props.content?.subtitle || fallbackSubtitle);

  useEffect(() => {
    setEditableTitle(props.content?.title || fallbackTitle);
    setEditableSubtitle(props.content?.subtitle || fallbackSubtitle);
  }, [props.content, fallbackTitle, fallbackSubtitle]);

  const layoutCols = Math.min(Math.max(Number(props.style?.cols) || 4, 1), 4);
  const currentFonts = FONT_SIZE_MAPS[props.style?.fontSize || "base"];

  const { data: adminStore } = useAdminStore();

  const { data: publicStore, isLoading: isLoadingPublicStore } = useQuery({
    queryKey: ["public-store-info", storeSlug], 
    queryFn: async () => {
      if (!storeSlug) return null;
      const key = cacheKey("storely_public_store", CACHE_VERSION, storeSlug);
      const cached = readCache<{ id: string; currency: string | null; slug: string }>(key, storeSlug);
      if (cached) return cached;
      
      const { data, error } = await supabase
        .from("stores")
        .select("id, currency, slug")
        .eq("slug", storeSlug)
        .maybeSingle();
        
      if (error || !data) return null;
      
      const safeStore = { 
        id: String(data.id), 
        currency: data.currency ? String(data.currency) : null, 
        slug: String(data.slug) 
      };
      writeCache(key, safeStore, storeSlug);
      return safeStore;
    },
    enabled: Boolean(storeSlug && isReadOnly),
    ...SUPER_CACHE_CONFIG,
  });

  const effectiveStoreId = isReadOnly 
    ? (publicStore?.id || props.storeId || props.store_id || props.section?.store_id)
    : (props.storeId || props.store_id || props.section?.store_id || adminStore?.id);

  const storeCurrency = isReadOnly ? (publicStore?.currency || "MZN") : (adminStore?.currency || "MZN");
  const activeStoreSlug = isReadOnly ? (storeSlug || publicStore?.slug) : adminStore?.slug;
  
  const designPalette = useMemo(() => {
    if (!effectiveStoreId) return isDark ? HERO_PALETTES.dark[0] : HERO_PALETTES.light[0];
    let hash = 0;
    for (let i = 0; i < effectiveStoreId.length; i++) hash = effectiveStoreId.charCodeAt(i) + ((hash << 5) - hash);
    const index = Math.abs(hash) % HERO_PALETTES[isDark ? "dark" : "light"].length;
    return HERO_PALETTES[isDark ? "dark" : "light"][index];
  }, [effectiveStoreId, isDark]);

  const { data: rawProducts = [], isLoading: isLoadingProducts } = useStoreProducts(
    effectiveStoreId, 
    storeCurrency, 
    activeStoreSlug, 
    t
  );

  const processedProducts = useMemo(() => {
    return enrichProductsIntelligently(rawProducts, currentLang as "pt" | "en");
  }, [rawProducts, currentLang]);

  useEffect(() => {
    if (processedProducts.length > 0 && effectiveStoreId) {
      const searchCacheKey = cacheKey("store_catalog", CACHE_VERSION, effectiveStoreId);
      writeCache(searchCacheKey, processedProducts, activeStoreSlug);
      queryClient.setQueryData(["catalog-products-full", effectiveStoreId, storeCurrency], processedProducts);
    }
  }, [processedProducts, effectiveStoreId, storeCurrency, activeStoreSlug, queryClient]);

  const isLoading = (isLoadingPublicStore || isLoadingProducts) && processedProducts.length === 0;

  // ==========================================
  // LÓGICA DE FILTRAGEM ATUALIZADA (UNISSEXO)
  // ==========================================
  const displayProducts = useMemo(() => {
    let filtered = processedProducts;

    if (activeParent !== "Todos") {
      filtered = filtered.filter(p => p.metadata?.parentCategory === activeParent);
    }
    
    if (activeChild) {
      filtered = filtered.filter(p => p.metadata?.subCategory === activeChild);
    }
    
    if (activeAttribute) {
      // 1. Dicionário de Géneros Conhecidos
      const genderFilters = ["Homem", "Mulher", "Criança", "Men", "Women", "Kids"];
      const isGenderFilter = genderFilters.includes(activeAttribute);

      filtered = filtered.filter(p => {
        if (isGenderFilter) {
          // REGRA DE OURO: Mostra se o produto for do género selecionado OU se não tiver nenhum género (Unissexo/Neutro)
          return p.metadata?.gender === activeAttribute || !p.metadata?.gender;
        }
        
        // Se for um tamanho, cor ou material, tem de corresponder exatamente.
        return (
          (p.metadata?.sizes || []).includes(activeAttribute) ||
          (p.metadata?.attributes || []).includes(activeAttribute)
        );
      });
    }

    if (isEditor) return filtered.slice(0, EDITOR_PREVIEW_LIMIT);
    return filtered;
  }, [processedProducts, activeParent, activeChild, activeAttribute, isEditor]);

  const handleProductClick = useCallback((productId: string) => {
    if (isEditor || !activeStoreSlug) return;
    const clickedProduct = processedProducts.find(p => p.id === productId);

    navigate(`/${activeStoreSlug}/${pageSlug || "products"}/${productId}`, { 
      state: { 
        fromStore: true,
        product: clickedProduct,
        initialProducts: processedProducts,
        storeCurrency: storeCurrency,
        effectiveStoreId: effectiveStoreId
      } 
    });
  }, [isEditor, activeStoreSlug, navigate, pageSlug, processedProducts, storeCurrency, effectiveStoreId]);

  const handleBlurText = (field: "title" | "subtitle", value: string) => {
    let sanitized = value.trim();
    if (!sanitized) {
      sanitized = field === "title" ? fallbackTitle : fallbackSubtitle;
      if (field === "title") setEditableTitle(fallbackTitle);
      else setEditableSubtitle(fallbackSubtitle);
    }
    if (props.onUpdate) props.onUpdate(field, sanitized);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>, maxLength: number) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain").slice(0, maxLength);
    document.execCommand("insertText", false, text);
  };

  if (!effectiveStoreId) return null;

  const alignClass = props.style?.align === 'center' ? 'text-center items-center mx-auto' : props.style?.align === 'justify' ? 'text-left items-stretch w-full' : 'text-left items-start';

  return (
    <section className={`w-full overflow-hidden subpixel-antialiased ${isDark ? "bg-[#050505] text-zinc-100" : "bg-white text-black"}`} style={{ contentVisibility: 'auto', containIntrinsicSize: '650px', isolation: "isolate", transform: "translateZ(0)" }}>
      
      {/* HEADER DA SECÇÃO */}
      <div className={`relative w-full border-b px-4 py-6 md:px-8 md:py-10 flex flex-col justify-center transition-all duration-200 ${designPalette.bg} ${designPalette.border}`}>
        <div className="mx-auto w-full max-w-[1400px] relative z-10">
          <div className={`flex flex-col max-w-3xl ${alignClass}`}>
            <div className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest mb-3 shadow-sm ${designPalette.badge}`}>
              <Sparkles size={9} className="shrink-0" /><span>{t("catalog_collection") || "Coleção"}</span>
            </div>
            
            <div className="w-full relative group mb-1.5 will-change-[transform,opacity]">
              <h2 className={`transition-all outline-none ${currentFonts.title} ${isDark ? "text-white" : "text-black"} ${isEditor ? "border border-dashed border-zinc-400/20 hover:border-amber-500/40 bg-amber-500/[0.01] focus:bg-amber-500/[0.03] rounded-lg px-2.5 py-1 cursor-text focus:border-solid focus:border-amber-500 focus:ring-1 focus:ring-amber-500/10" : ""}`} contentEditable={isEditor} suppressContentEditableWarning={true} onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); if (e.currentTarget.textContent!.length >= MAX_TITLE && e.key !== "Backspace" && !e.key.startsWith("Arrow")) e.preventDefault(); }} onPaste={(e) => handlePaste(e, MAX_TITLE)} onBlur={(e) => { const text = e.currentTarget.textContent?.slice(0, MAX_TITLE) || ""; const final = text.trim() || fallbackTitle; setEditableTitle(final); handleBlurText("title", final); }}>{editableTitle}</h2>
              {isEditor && <span className={`absolute right-2 bottom-0.5 text-[8px] font-mono opacity-30 pointer-events-none ${isDark ? "text-zinc-400" : "text-black"}`}>{editableTitle.length}/{MAX_TITLE}</span>}
            </div>

            <div className="w-full relative group will-change-[transform,opacity]">
              <p data-placeholder={t("catalog_add_description") || "Adicione uma descrição..."} className={`transition-all outline-none font-medium empty:before:text-zinc-400/60 empty:before:content-[attr(data-placeholder)] ${currentFonts.subtitle} ${isDark ? "text-zinc-400" : "text-zinc-800"} ${isEditor ? "border border-dashed border-zinc-400/20 hover:border-amber-500/40 bg-amber-500/[0.01] focus:bg-amber-500/[0.03] rounded-lg px-2.5 py-1 cursor-text focus:border-solid focus:border-amber-500 focus:ring-1 focus:ring-amber-500/10 min-h-[2em]" : ""}`} contentEditable={isEditor} suppressContentEditableWarning={true} onKeyDown={(e) => { const currentText = e.currentTarget.innerText || ""; if (e.key === "Enter") { const lineCount = (currentText.match(/\n/g) || []).length; if (lineCount >= 1) e.preventDefault(); } if (currentText.length >= MAX_SUBTITLE && e.key !== "Backspace" && !e.key.startsWith("Arrow")) e.preventDefault(); }} onPaste={(e) => handlePaste(e, MAX_SUBTITLE)} onBlur={(e) => { const text = e.currentTarget.innerText || ""; const final = text.trim() || fallbackSubtitle; setEditableSubtitle(final); handleBlurText("subtitle", final); }}>{editableSubtitle === fallbackSubtitle && isEditor ? "" : editableSubtitle}</p>
              {isEditor && <span className={`absolute right-2 bottom-0.5 text-[8px] font-mono opacity-30 pointer-events-none ${isDark ? "text-zinc-400" : "text-black"}`}>{editableSubtitle.length}/{MAX_SUBTITLE}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8 md:py-10">
        
        {/* FILTROS HIERÁRQUICOS */}
        {isReadOnly && !isLoading && processedProducts.length > 0 && (
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
        )}

        {isEditor && processedProducts.length > 0 && (
          <div className="mb-3.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 select-none pointer-events-none">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />{t("catalog_layout_sample") || "Amostra de Layout"} ({displayProducts.length} {t("common_of") || "de"} {processedProducts.length} {t("catalog_actives") || "ativos"})
          </div>
        )}

        {/* LISTA DE PRODUTOS */}
        <div className="w-full grid grid-cols-1 min-h-[220px]" style={{ contain: "layout style" }}>
          {isLoading ? (
            <div className="w-full"><ProductShowcaseSkeleton cols={layoutCols} isDark={isDark} /></div>
          ) : (
            <div className="w-full animate-in fade-in duration-200 select-text">
              {layoutCols === 1 ? (
                <LayoutList products={displayProducts} onAction={handleProductClick} isDark={isDark} t={t} />
              ) : (
                <LayoutGrid products={displayProducts} onAction={handleProductClick} cols={layoutCols} isDark={isDark} t={t} />
              )}
            </div>
          )}

          {/* EMPTY STATE */}
          {!isLoading && displayProducts.length === 0 && (
            <div className={`rounded-xl border border-dashed py-12 flex flex-col items-center justify-center ${isDark ? "border-zinc-800 bg-zinc-900/5" : "border-zinc-200 bg-zinc-50/30"}`}>
              <Package size={30} className="mb-2 text-zinc-500 opacity-25" />
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">{props.content?.empty_text || "Nenhum produto encontrado com estes filtros"}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}