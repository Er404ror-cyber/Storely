import { useMemo, memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Store, Compass, ArrowUpRight } from "lucide-react";
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
  t: (key: string, options?: { defaultValue?: string }) => string;
}

interface ProcessedProduct extends ProductRow {
  targetSlug: string;
  storeData: unknown;
  originalPrice: number;
  discount: number;
  finalPrice: number;
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
  const location = useLocation();
  const isBlog = location.pathname.includes("/blog");

  const defaultProductName = t("product_default_name", { defaultValue: "Produto" });

  const { sameStoreItems, otherStoresItems } = useMemo(() => {
    if (!currentProductId) return { sameStoreItems: [], otherStoresItems: [] };

    const globalCache = queryClient.getQueryData<ProductRow[]>(["storely-public-smart-v9"]);
    if (!globalCache || globalCache.length === 0) {
      return { sameStoreItems: [], otherStoresItems: [] };
    }

    const sameStore: ProcessedProduct[] = [];
    const otherStores: ProcessedProduct[] = [];

    const mapItem = (p: ProductRow): ProcessedProduct => {
      const storeInfo = Array.isArray(p.stores) ? p.stores[0] : p.stores;
      const originalPrice = Number(p.price) || 0;
      
      // Safely access optional/dynamic discount_percent if present in raw cache
      const rawDiscountValue = (p as Record<string, unknown>).discount_percent;
      const rawDiscount = Number(rawDiscountValue) || 0;
      const discount = rawDiscount > 0 ? (rawDiscount > 99 ? 99 : rawDiscount) : 0;
      const finalPrice = discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice;

      return {
        ...p,
        targetSlug: (storeInfo as { slug?: string } | null | undefined)?.slug || storeSlugFallback,
        storeData: storeInfo,
        originalPrice,
        discount,
        finalPrice,
      };
    };

    for (let i = 0, len = globalCache.length; i < len; i++) {
      const p = globalCache[i];
      if (p.id === currentProductId) continue;

      const storeObj = Array.isArray(p.stores) ? p.stores[0] : p.stores;
      const sId = p.store_id || (storeObj as { id?: string } | null | undefined)?.id;

      if (currentStoreId && sId === currentStoreId && sameStore.length < 4) {
        sameStore.push(mapItem(p));
      } else if ((!currentStoreId || sId !== currentStoreId) && p.category === currentCategory && otherStores.length < 4) {
        otherStores.push(mapItem(p));
      }

      if (sameStore.length === 4 && otherStores.length === 4) break;
    }

    return { sameStoreItems: sameStore, otherStoresItems: otherStores };
  }, [queryClient, currentProductId, currentCategory, currentStoreId, storeSlugFallback]);

  if (sameStoreItems.length === 0 && otherStoresItems.length === 0) return null;

  const renderProductCard = (item: ProcessedProduct) => (
    <Link
      key={item.id}
      to={isBlog ? `/${item.targetSlug}/blog/${item.id}` : `/${item.targetSlug}/products/${item.id}`}
      state={{ product: item, store: item.storeData }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 ${panelClass}`}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-zinc-950">
        <img
          src={item.main_image || (item.gallery && item.gallery[0]) || FALLBACK_PRODUCT}
          alt={item.name || defaultProductName}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_PRODUCT;
          }}
        />

        {item.discount > 0 && (
          <span className="absolute top-2 left-2 rounded-lg bg-amber-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
            -{item.discount}%
          </span>
        )}

        <span
          aria-label={t("view_product", { defaultValue: "Ver produto" })}
          className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-2xs  dark:bg-zinc-900/90 dark:text-zinc-200"
        >
          <ArrowUpRight size={13} className="stroke-[2.5]" />
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between p-3 sm:p-3.5">
        <h4 className={`truncate text-xs sm:text-sm font-bold ${strongTextClass}`} title={item.name ?? ""}>
          {item.name || defaultProductName}
        </h4>

        <div className="mt-2 flex flex-col gap-0.5">
          <span className="text-sm sm:text-base font-black tracking-tight tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatMoney(item.finalPrice)}
          </span>

          {item.discount > 0 && (
            <span className={`text-[11px] font-medium line-through tabular-nums opacity-60 ${mutedTextClass}`}>
              {formatMoney(item.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );

  return (
    <section 
      className="mt-12 md:mt-16 space-y-9 border-t border-slate-200/80 pt-8 sm:pt-10 dark:border-zinc-800/80 px-4 md:px-0"
      style={{ contentVisibility: "auto", containIntrinsicSize: "0 400px" }}
    >
      {sameStoreItems.length > 0 && (
        <div>
          <div className="flex items-center gap-2.5 mb-3.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400 shrink-0">
              <Store size={15} />
            </span>
            <div className="min-w-0">
              <h3 className={`truncate text-sm sm:text-base font-extrabold tracking-tight ${strongTextClass}`}>
                {t("more_from_this_store", { defaultValue: "Aproveite o mesmo pedido" })}
              </h3>
              <p className={`truncate text-[11px] font-medium ${mutedTextClass}`}>
                {t("buy_together_tip", { defaultValue: "Peça outros itens desta loja no mesmo frete" })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:gap-4">
            {sameStoreItems.map(renderProductCard)}
          </div>
        </div>
      )}

      {otherStoresItems.length > 0 && (
        <div>
          <div className="flex items-center gap-2.5 mb-3.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400 shrink-0">
              <Compass size={15} />
            </span>
            <div className="min-w-0">
              <h3 className={`truncate text-sm sm:text-base font-extrabold tracking-tight ${strongTextClass}`}>
                {t("explore_other_stores", { defaultValue: "Outras opções populares" })}
              </h3>
              <p className={`truncate text-[11px] font-medium ${mutedTextClass}`}>
                {t("similar_in_category", { defaultValue: "Modelos semelhantes em outras lojas" })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:gap-4">
            {otherStoresItems.map(renderProductCard)}
          </div>
        </div>
      )}
    </section>
  );
});