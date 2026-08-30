import { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Home, ShoppingBag, Store } from "lucide-react";
import { FALLBACK_STORE } from "../../../utils/constants";

interface StoreTrustCardProps {
  storeName: string;
  storeLogo: string;
  siteUrl: string;
  softPanelClass: string;
  strongTextClass: string;
  mutedTextClass: string;
  t: (key: string, options?: { defaultValue?: string }) => string;
}

export const StoreTrustCard = memo(function StoreTrustCard({
  storeName,
  storeLogo,
  siteUrl,
  softPanelClass,
  strongTextClass,
  t,
}: StoreTrustCardProps) {
  const productsUrl = useMemo(() => {
    const cleanUrl = (siteUrl || "").replace(/\/+$/, "");
    return `${cleanUrl}/products`;
  }, [siteUrl]);

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 shadow-xs ${softPanelClass}`}
      style={{ contentVisibility: "auto", containIntrinsicSize: "0 130px" }}
    >
      {/* Identidade Visual da Loja */}
      <div className="flex items-center gap-3.5">
        <div className="relative h-13 w-13 shrink-0 overflow-hidden rounded-xl bg-white shadow-2xs ring-1 ring-slate-200/80 dark:ring-zinc-700">
          <img
            src={storeLogo || FALLBACK_STORE}
            alt={storeName}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_STORE;
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className={`truncate text-base font-bold ${strongTextClass}`}>
              {storeName}
            </h2>
            <BadgeCheck size={16} className="text-blue-500 shrink-0" />
          </div>

          <div className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
            <Store size={12} className="shrink-0 text-slate-400 dark:text-zinc-500" />
            <span className="truncate">
              {t("official_store", { defaultValue: "Loja Oficial" })}
            </span>
          </div>
        </div>
      </div>

      {/* Botões de Ação Direta */}
      <div className="mt-3.5 grid grid-cols-2 gap-2">
        <Link
          to={siteUrl}
          className="flex h-9.5 items-center justify-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          <Home size={13.5} className="shrink-0 text-slate-400 dark:text-zinc-500" />
          <span className="truncate">
            {t("store_page_links_home_badge", { defaultValue: "Início" })}
          </span>
        </Link>

        <Link
          to={productsUrl}
          className="flex h-9.5 items-center justify-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-50/60 px-3 text-xs font-semibold text-emerald-800 shadow-2xs hover:bg-emerald-100/70 active:scale-[0.98] dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-950/50"
        >
          <ShoppingBag size={13.5} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="truncate">
            {t("nav_products", { defaultValue: "Produtos" })}
          </span>
        </Link>
      </div>
    </div>
  );
});