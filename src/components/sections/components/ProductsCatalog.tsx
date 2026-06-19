

import { useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Package,  Plus } from "lucide-react";


// IMPORTANTE: Ajusta estes caminhos para baterem certo com a localização real dos teus ficheiros!
import { LayoutGrid, LayoutList, ProductShowcaseSkeleton } from "../../produtos/layouts";
import { useTranslate } from "../../../context/LanguageContext";
import { supabase } from "../../../lib/supabase";
import { useAdminStore } from "../../../hooks/useAdminStore";
import { FloatingSearch } from "../../produtos/componentsPublic/FloatingSearch";

import { cacheKey, readCache, writeCache, INITIAL_VISIBLE, CACHE_VERSION, CACHE_TIME } from "../../../utils/text";
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
  const isDark = props.style?.theme === "dark";
  const allLabel = t("common_all") || "Todos";

  const [selectedCategory, setSelectedCategory] = useState<string>(allLabel);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const layoutCols = Math.min(Math.max(Number(props.style?.cols) || 4, 1), 4);
  const { data: adminStore } = useAdminStore();
  const finalStoreId = props.storeId || props.store_id || props.section?.store_id || adminStore?.id;

  const { data: storeInfo, isLoading: isLoadingStore } = useQuery({
    queryKey: ["catalog-store-info", finalStoreId],
    queryFn: async () => {
      if (!finalStoreId) return null;
      const key = cacheKey("store_info", CACHE_VERSION, finalStoreId);
      const cached = readCache<{id: string, currency: string, slug: string}>(key);
      if (cached) return cached;

      const { data, error } = await supabase.from("stores").select("id, currency, slug").eq("id", finalStoreId).single();
      if (error) throw error;
      
      writeCache(key, data);
      return data;
    },
    enabled: !!finalStoreId,
    staleTime: CACHE_TIME,
  });

  const storeCurrency = storeInfo?.currency || adminStore?.currency || "MZN";
  const activeStoreSlug = storeSlug || storeInfo?.slug;

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["catalog-products-full", finalStoreId, storeCurrency],
    queryFn: async () => {
      if (!finalStoreId) return [];
      const key = cacheKey("store_catalog", CACHE_VERSION, finalStoreId);
      const cached = readCache<Product[]>(key);
      if (cached) return cached;

      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, category, main_image, created_at, store_id")
        .eq("store_id", finalStoreId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((product) => ({
        ...product,
        id: String(product.id),
        price: Number(product.price) || 0,
        category: (product.category || "").trim() || "Geral",
        main_image: product.main_image || "",
        currency: storeCurrency,
      })) as Product[];

      writeCache(key, mapped);
      return mapped;
    },
    enabled: !!finalStoreId && !!storeCurrency,
    staleTime: CACHE_TIME,
  });

  const isLoading = isLoadingStore || isLoadingProducts;

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => set.add(p.category));
    return [allLabel, ...Array.from(set)];
  }, [products, allLabel]);

  const displayProducts = useMemo(() => {
    const filtered = selectedCategory === allLabel 
      ? products 
      : products.filter(p => p.category === selectedCategory);
    return filtered.slice(0, visibleCount);
  }, [products, selectedCategory, visibleCount, allLabel]);

  const totalFiltered = selectedCategory === allLabel 
    ? products.length 
    : products.filter(p => p.category === selectedCategory).length;

  const handleProductClick = useCallback((productId: string) => {
    if (isEditor || !activeStoreSlug) return;
    navigate(`/${activeStoreSlug}/${pageSlug || "products"}/${productId}`, { state: { fromStore: true } });
  }, [isEditor, activeStoreSlug, navigate, pageSlug]);

  if (!finalStoreId) return null;

  // Se removemos o "right", a lógica fica assim:
const alignClass = props.style?.align === 'center' 
? 'text-center items-center' 
: props.style?.align === 'justify' 
  ? 'text-justify items-stretch' 
  : 'text-left items-start';

  return (
    <>
      <section className={`px-3 py-10 md:px-6 md:py-16 overflow-hidden ${isDark ? "bg-[#0a0a0a] text-zinc-100" : "bg-white text-slate-900"}`} style={{ contentVisibility: 'auto', containIntrinsicSize: '800px' }}>
        <div className="mx-auto w-full max-w-[1400px] min-w-0">
          
          <div className={`mb-10 flex flex-col ${alignClass}`}>
            <h2 className="text-3xl font-black tracking-tight md:text-5xl">{props.content?.title || 'Catálogo Completo'}</h2>
            {props.content?.subtitle && <p className="mt-4 text-sm md:text-base font-medium opacity-60 max-w-2xl">{props.content.subtitle}</p>}
          </div>

          {/* Navegação de Categorias Super Leve */}
          {!isLoading && categories.length > 1 && (
            <div className="mb-8 flex items-center gap-2 overflow-x-auto no-scrollbar pb-2" style={{ transform: "translateZ(0)" }}>
              {categories.map((cat) => (
                <button
                  key={cat}
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
                      onClick={() => setVisibleCount(v => v + INITIAL_VISIBLE)}
                      className={`flex items-center gap-2 rounded-2xl px-8 py-4 text-[11px] font-black uppercase tracking-widest transition-transform active:scale-95 ${isDark ? "bg-zinc-800 text-white hover:bg-zinc-700" : "bg-slate-100 text-slate-900 hover:bg-slate-200"}`}
                    >
                      <Plus size={18} /> Carregar Mais
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

      {/* Injeção do Search Flutuante */}
      {!isEditor && <FloatingSearch currentStoreId={finalStoreId} storeCurrency={storeCurrency} activeStoreSlug={activeStoreSlug} />}
    </>
  );
}