import { useMemo, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Package, Search, Plus } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useTranslate } from "../../../context/LanguageContext";
import { LayoutGrid, LayoutList, ProductShowcaseSkeleton } from "../../produtos/layouts";
import { useAdminStore } from "../../../hooks/useAdminStore";

import { cacheKey, CACHE_VERSION, INITIAL_VISIBLE, readCache, writeCache } from "../../../utils/text";
import { HeaderText } from "../../produtos/HeaderText";
import { useStoreProducts, SUPER_CACHE_CONFIG } from "../../../hooks/useStoreProducts";

export type SectionStyles = {
  theme?: "dark" | "light";
  align?: "center" | "left" | "justify";
  fontSize?: "small" | "base" | "medium" | "large";
  cols?: string | number;
};

export interface ShowcaseProps {
  content: { title?: string; category?: string; description?: string };
  style: SectionStyles;
  onUpdate?: (field: string, value: string) => void;
}

export function ProductShowcase({ content, style, onUpdate }: ShowcaseProps) {
  const { t } = useTranslate();
  const location = useLocation();
  const navigate = useNavigate();
  const { storeSlug, pageSlug } = useParams();
  const { data: adminStore } = useAdminStore();

  const isEditor = location.pathname.includes("/editor/");
  const isReadOnly = !isEditor;
  const isDark = style?.theme === "dark";

  const layoutCols = Math.min(Math.max(Number(style?.cols) || 4, 1), 4);
  const activeStoreSlug = isReadOnly ? storeSlug : adminStore?.slug;

  const { data: publicStore, isLoading: isLoadingStore } = useQuery({
    queryKey: ["public-store-info", storeSlug],
    initialData: () => {
      if (!storeSlug) return undefined;
      const key = cacheKey("storely_public_store", CACHE_VERSION, storeSlug);
      return readCache<{ id: string; currency: string | null }>(key, storeSlug) || undefined;
    },
    queryFn: async () => {
      if (!storeSlug) return null;
      const key = cacheKey("storely_public_store", CACHE_VERSION, storeSlug);
      const cached = readCache<{ id: string; currency: string | null }>(key, storeSlug);
      if (cached) return cached;

      const { data, error } = await supabase
        .from("stores")
        .select("id,currency")
        .eq("slug", storeSlug)
        .maybeSingle();

      if (error || !data) return null;

      const safeStore = { id: String(data.id), currency: data.currency ? String(data.currency) : null };
      writeCache(key, safeStore, storeSlug);
      return safeStore;
    },
    enabled: Boolean(storeSlug && isReadOnly),
    ...SUPER_CACHE_CONFIG,
  });

  const effectiveStoreId = publicStore?.id || adminStore?.id || null;
  const storeCurrency = publicStore?.currency || adminStore?.currency || "MZN";

  const { data: storeBundle, isLoading: isLoadingProducts } = useStoreProducts(
    effectiveStoreId, 
    storeCurrency, 
    activeStoreSlug, 
    t
  );

  // Normalização anti-crash: garante que 'products' é estritamente um Array
  const products = useMemo(() => {
    if (Array.isArray(storeBundle)) return storeBundle;
    if (storeBundle && Array.isArray((storeBundle as any).products)) return (storeBundle as any).products;
    return [];
  }, [storeBundle]);

  const isLoading = (isLoadingStore || isLoadingProducts) && products.length === 0;

  const displayProducts = useMemo(() => {
    return products.slice(0, INITIAL_VISIBLE);
  }, [products]);

  const handleProductClick = useCallback((productId: string) => {
    if (!isReadOnly || !storeSlug) return;
    const clickedProduct = products.find((p: any) => p.id === productId);
    navigate(`/${storeSlug}/${pageSlug || "home"}/${productId}`, { 
      state: { 
        fromStore: true,
        product: clickedProduct, 
        initialProducts: products,
        storeCurrency,
        effectiveStoreId
      } 
    });
  }, [isReadOnly, navigate, storeSlug, pageSlug, products, storeCurrency, effectiveStoreId]);

  const handleOpenSearch = useCallback(() => {
    if (isEditor || !activeStoreSlug) return;
    navigate(`/${activeStoreSlug}/products`, {
      state: {
        openSearch: true,
        initialProducts: products,
        storeCurrency,
        effectiveStoreId
      }
    });
  }, [isEditor, activeStoreSlug, navigate, products, storeCurrency, effectiveStoreId]);

  const handleViewFullCatalog = useCallback(() => {
    if (isEditor || !activeStoreSlug) return;
    navigate(`/${activeStoreSlug}/products`, {
      state: {
        initialProducts: products,
        storeCurrency,
        effectiveStoreId
      }
    });
  }, [isEditor, activeStoreSlug, navigate, products, storeCurrency, effectiveStoreId]);

  return (
    <section 
      className={`px-3 py-6 md:px-6 md:py-9 overflow-hidden ${isDark ? "bg-[#0a0a0a] text-zinc-100" : "bg-white text-slate-900"}`} 
      style={{ contentVisibility: "auto", contain: "layout style", transform: "translateZ(0)" }}
    >
      <div className="mx-auto w-full max-w-6xl min-w-0">
        <HeaderText content={content} style={style} isReadOnly={isReadOnly} isDark={isDark} t={t} onUpdate={onUpdate} />

        {isReadOnly && (
          <div className="mb-6 w-full max-w-xl">
            <button 
              type="button"
              onClick={handleOpenSearch}
              className={`flex w-full min-w-0 items-center gap-2 rounded-2xl border px-4 py-3 transition-transform active:scale-[0.99] cursor-text ${isDark ? "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800" : "bg-slate-50 border-slate-200 hover:bg-slate-100"}`}
            >
              <Search size={18} className="shrink-0 opacity-40 text-current" />
              <span className="w-full text-left min-w-0 bg-transparent border-none outline-none text-base md:text-sm font-semibold truncate opacity-50">
                {t("showcase_searchPlaceholder") || "Pesquisar produtos..."}
              </span>
            </button>
          </div>
        )}

        <div className="w-full grid grid-cols-1 min-h-[300px]">
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

              {isReadOnly && products.length > INITIAL_VISIBLE && (
                <div className="mt-8 flex justify-center">
                  <button 
                    type="button" 
                    onClick={handleViewFullCatalog} 
                    className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-[11px] font-bold uppercase tracking-widest transition-transform active:scale-95 ${isDark ? "bg-white text-black hover:bg-zinc-200" : "bg-zinc-900 text-white hover:bg-zinc-800"}`}
                  >
                    <Plus size={16} /> {t("showcase_viewFull") || "Ver Catálogo Completo"}
                  </button>
                </div>
              )}
            </div>
          )}

          {!isLoading && products.length === 0 && (
            <div className="rounded-3xl border border-dashed border-zinc-200 py-16 text-center dark:border-zinc-800">
              <Package size={38} className="mx-auto mb-4 text-zinc-500 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest opacity-50">
                {t("showcase_empty") || "Nenhum produto disponível"}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}