import { memo } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Store } from "lucide-react";
import { FALLBACK_STORE } from "../../../utils/constants";

interface StoreTrustCardProps {
  storeName: string;
  storeLogo: string;
  siteUrl: string;
  softPanelClass: string;
  strongTextClass: string;
  mutedTextClass: string;
  t: any;
}

export const StoreTrustCard = memo(function StoreTrustCard({
  storeName,
  storeLogo,
  siteUrl,
  softPanelClass,
  strongTextClass,
  mutedTextClass,
  t,
}: StoreTrustCardProps) {
  return (
    <div className={`rounded-3xl border p-5 transition hover:shadow-md ${softPanelClass}`}>
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:ring-zinc-700">
          <img
            src={storeLogo || FALLBACK_STORE}
            alt={storeName}
            className="h-full w-full object-cover"
            onError={(e) => { e.currentTarget.src = FALLBACK_STORE; }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className={`truncate text-lg font-black ${strongTextClass}`}>{storeName}</h2>
            <BadgeCheck size={16} className="text-blue-500 shrink-0" />
          </div>
          <p className={`truncate text-sm mt-0.5 ${mutedTextClass}`}>
            {t("Vendedor_Verificado") || "Vendedor Verificado"}
          </p>
        </div>
      </div>
      <Link
        to={siteUrl}
        className="mt-4 flex w-full items-center justify-center rounded-xl bg-white border border-slate-200 py-3 text-[11px] font-black uppercase tracking-wider text-slate-900 shadow-sm transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-800"
      >
        <Store size={14} className="mr-2" />
        {t("Open_site") || "Ver toda a Loja"}
      </Link>
    </div>
  );
});