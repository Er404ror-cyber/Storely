import { useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Package, Plus } from "lucide-react";

import { LayoutGrid, LayoutList, ProductShowcaseSkeleton } from "../../produtos/layouts";
import { useTranslate } from "../../../context/LanguageContext";
import { supabase } from "../../../lib/supabase";
import { useAdminStore } from "../../../hooks/useAdminStore";

import { safeText, cacheKey, readCache, writeCache, INITIAL_VISIBLE, CACHE_VERSION } from "../../../utils/text";
import { STORE_CACHE_TTL } from "../../../utils/storeCache";

export type SectionStyles = {
  theme?: "dark" | "light";
  align?: "center" | "left" | "justify";
  cols?: string | number;
};

export interface CatalogProps {
  content: { title?: string; subtitle?: string; empty_text?: string };
  style: SectionStyles;
  storeId?: string;
  store_id?: string;
  section?: any;
}

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  main_image: string;
  created_at?: string;
  currency: string;
  store_id: string;
};

export function ProductsCatalog(props: CatalogProps) {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const location = useLocation();
  const { storeSlug, pageSlug } = useParams();
  
  const isEditor = location.pathname.includes("/editor/");
  const isReadOnly = !isEditor;
  const isDark = props.style?.theme === "dark";
  const allLabel = t("common_all") || "Todos";

  const [selectedCategory, setSelectedCategory] = useState<string>(allLabel);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const layoutCols = Math.min(Math.max(Number(props.style?.cols) || 4, 1), 4);
  const { data: adminStore } = useAdminStore();

  const { data: publicStore, isLoading: isLoadingPublicStore } = useQuery({
    queryKey: ["catalog-public-store-info", storeSlug],
    queryFn: async () => {
      if (!storeSlug) return null;
      const key = cacheKey("storely_public_store", CACHE_VERSION, storeSlug);
      // Leitura subordinada ao Pai
      const cached = readCache<{ id: string; currency: string | null; slug: string }>(key, storeSlug);
      if (cached) return cached;

      const { data, error } = await supabase.from("stores").select("id, currency, slug").eq("slug", storeSlug).maybeSingle();
      if (error || !data) return null;

      const safeStore = { id: String(data.id), currency: data.currency ? String(data.currency) : null, slug: String(data.slug) };
      // Escrita sincronizada com o Pai
      writeCache(key, safeStore, storeSlug);
      return safeStore;
    },
    enabled: Boolean(storeSlug && isReadOnly),
    staleTime: STORE_CACHE_TTL,
  });

  const effectiveStoreId = isReadOnly 
    ? (publicStore?.id || props.storeId || props.store_id || props.section?.store_id)
    : (props.storeId || props.store_id || props.section?.store_id || adminStore?.id);

  const storeCurrency = isReadOnly 
    ? (publicStore?.currency || "MZN") 
    : (adminStore?.currency || "MZN");

  const activeStoreSlug = isReadOnly ? (storeSlug || publicStore?.slug) : adminStore?.slug;

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["catalog-products-full", effectiveStoreId, storeCurrency],
    queryFn: async () => {
      if (!effectiveStoreId) return [];
      const key = cacheKey("store_catalog", CACHE_VERSION, effectiveStoreId);
      // Leitura subordinada ao Pai
      const cached = readCache<Product[]>(key, activeStoreSlug);
      if (cached) return cached;

      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, category, main_image, created_at, store_id")
        .eq("store_id", effectiveStoreId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) return [];

      const mapped = (data || []).map((product) => ({
        id: String(product.id),
        name: safeText(product.name, 70),
        price: Number(product.price) || 0,
        category: safeText(product.category, 40) || "Geral",
        main_image: product.main_image || "",
        created_at: product.created_at,
        store_id: String(product.store_id),
        currency: storeCurrency,
      })) as Product[];

      // Escrita sincronizada com o Pai
      writeCache(key, mapped, activeStoreSlug);
      return mapped;
    },
    enabled: !!effectiveStoreId,
    staleTime: STORE_CACHE_TTL,
  });

  const isLoading = (isLoadingPublicStore || isLoadingProducts) && products.length === 0;

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return [allLabel, ...Array.from(set)];
  }, [products, allLabel]);

  const displayProducts = useMemo(() => {
    const filtered = (isReadOnly && selectedCategory !== allLabel)
      ? products.filter(p => p.category === selectedCategory)
      : products;
    return filtered.slice(0, visibleCount);
  }, [products, selectedCategory, visibleCount, allLabel, isReadOnly]);

  const totalFiltered = (isReadOnly && selectedCategory !== allLabel)
    ? products.filter(p => p.category === selectedCategory).length
    : products.length;

  const handleProductClick = useCallback((productId: string) => {
    if (isEditor || !activeStoreSlug) return;
    navigate(`/${activeStoreSlug}/${pageSlug || "products"}/${productId}`, { state: { fromStore: true } });
  }, [isEditor, activeStoreSlug, navigate, pageSlug]);

  if (!effectiveStoreId) return null;

  const alignClass = props.style?.align === 'center' 
    ? 'text-center items-center' 
    : props.style?.align === 'justify' 
      ? 'text-justify items-stretch' 
      : 'text-left items-start';

  return (
    <>
      <section 
        className={`px-3 py-10 md:px-6 md:py-16 overflow-hidden ${isDark ? "bg-[#0a0a0a] text-zinc-100" : "bg-white text-slate-900"}`} 
        style={{ 
          contentVisibility: 'auto', 
          containIntrinsicSize: '800px',
          isolation: "isolate",
          backfaceVisibility: "hidden",
          transform: "translate3d(0, 0, 0)"
        }}
      >
        <div className="mx-auto w-full max-w-[1400px] min-w-0">
          
          <div className={`mb-10 flex flex-col ${alignClass}`}>
            <h2 className="text-3xl font-black tracking-tight md:text-5xl">{props.content?.title || 'Catálogo Completo'}</h2>
            {props.content?.subtitle && <p className="mt-4 text-sm md:text-base font-medium opacity-60 max-w-2xl">{props.content.subtitle}</p>}
          </div>

          {isReadOnly && !isLoading && categories.length > 1 && (
            <div className="mb-8 flex items-center gap-2 overflow-x-auto no-scrollbar pb-2" style={{ transform: "translateZ(0)" }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => { setSelectedCategory(cat); setVisibleCount(INITIAL_VISIBLE); }}
                  className={`shrink-0 rounded-2xl px-5 py-2.5 text-xs font-bold uppercase tracking-wide transition-colors active:scale-[0.98] ${
                    selectedCategory === cat 
                    ? (isDark ? "bg-white text-black" : "bg-zinc-900 text-white") 
                    : (isDark ? "bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800" : "bg-slate-50 text-slate-600 hover:bg-slate-100")
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="w-full grid grid-cols-1 min-h-[400px]">
            {isLoading ? (
              <div className="w-full"><ProductShowcaseSkeleton cols={layoutCols} isDark={isDark} /></div>
            ) : (
              <div className="w-full animate-in fade-in duration-500">
                {layoutCols === 1 ? (
                  <LayoutList products={displayProducts} onAction={handleProductClick} isDark={isDark} t={t} />
                ) : (
                  <LayoutGrid products={displayProducts} onAction={handleProductClick} cols={layoutCols} isDark={isDark} t={t} />
                )}

                {visibleCount < totalFiltered && (
                  <div className="mt-12 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount(v => v + INITIAL_VISIBLE)}
                      className={`flex items-center gap-2 rounded-2xl px-8 py-4 text-[11px] font-black uppercase tracking-widest transition-transform active:scale-95 ${isDark ? "bg-zinc-800 text-white hover:bg-zinc-700" : "bg-slate-100 text-slate-900 hover:bg-slate-200"}`}
                    >
                      <Plus size={18} /> {t("showcase_viewFull") || "Carregar Mais"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {!isLoading && products.length === 0 && (
              <div className="rounded-3xl border border-dashed border-zinc-200 py-24 flex flex-col items-center justify-center dark:border-zinc-800">
                <Package size={48} className="mb-4 text-zinc-500 opacity-20" />
                <p className="text-sm font-bold uppercase tracking-widest opacity-50">{props.content?.empty_text || "Nenhum produto"}</p>
              </div>
            )}
          </div>
        </div>
      </section>


    </>
  );
}