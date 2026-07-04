import { useMemo, memo } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type { ProductRow } from "../../../types/Marketplace";
import { FALLBACK_PRODUCT } from "../../../utils/constants";


interface RelatedProductsCacheProps {
  currentProductId: string;
  currentCategory: string;
  currentStoreId?: string;
  storeSlugFallback: string;
  panelClass: string;
  strongTextClass: string;
  mutedTextClass: string;
  formatMoney: (val: number) => string;
  t: any;
  
}

export const RelatedProductsCache = memo(function RelatedProductsCache({
  currentProductId,
  currentCategory,
  currentStoreId,
  storeSlugFallback,
  panelClass,
  strongTextClass,
  mutedTextClass,
  formatMoney,
  t,
}: RelatedProductsCacheProps) {
  const queryClient = useQueryClient();

  const relatedItems = useMemo(() => {
    if (!currentProductId || !currentCategory) return [];

    const globalCache = queryClient.getQueryData<ProductRow[]>(["storely-public-smart-v9"]) || [];
    
    // 1. Prioridade: Produtos da mesma Categoria (De qualquer loja!)
    let matches = globalCache.filter(p => p.id !== currentProductId && p.category === currentCategory);

    // 2. Se não houver 4 produtos da mesma categoria, preenche com produtos da MESMA LOJA
    if (matches.length < 4 && currentStoreId) {
      const sameStore = globalCache.filter(p => {
        if (p.id === currentProductId || matches.some(m => m.id === p.id)) return false;
        const sId = p.store_id || (Array.isArray(p.stores) ? p.stores[0]?.id : p.stores?.id);
        return sId === currentStoreId;
      });
      matches = [...matches, ...sameStore];
    }

    return matches.slice(0, 4).map(p => {
      const storeInfo = Array.isArray(p.stores) ? p.stores[0] : p.stores;
      return {
        ...p,
        targetSlug: storeInfo?.slug || storeSlugFallback,
        storeData: storeInfo
      };
    });
  }, [queryClient, currentProductId, currentCategory, currentStoreId, storeSlugFallback]);

  if (!relatedItems || relatedItems.length === 0) return null;

  return (
    <div className="mt-16 md:mt-24 border-t border-slate-200 pt-12 dark:border-zinc-800 px-4 md:px-0">
      <h3 className={`text-2xl font-extrabold tracking-tight mb-8 ${strongTextClass}`}>
        {t("related_products") || "Também pode gostar"}
      </h3>
      
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
        {relatedItems.map((rel) => (
          <Link 
            key={rel.id}
            to={`/${rel.targetSlug}/blog/${rel.id}`}
            state={{ product: rel, store: rel.storeData }}
            className={`group flex flex-col overflow-hidden rounded-3xl border transition hover:shadow-md ${panelClass}`}
          >
            <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-zinc-900">
              <img
                src={rel.main_image || FALLBACK_PRODUCT}
                alt={rel.name || "Produto"}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 transform-gpu"
                onError={(e) => { e.currentTarget.src = FALLBACK_PRODUCT; }}
              />
            </div>
            <div className="flex flex-col p-4">
              <h4 className={`truncate text-sm font-bold ${strongTextClass}`}>
                {rel.name}
              </h4>
              <p className={`mt-1 text-[13px] font-black ${mutedTextClass}`}>
                {formatMoney(Number(rel.price || 0))}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
});