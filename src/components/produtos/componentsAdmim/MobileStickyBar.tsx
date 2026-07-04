import { memo } from "react";
import { ShoppingBag } from "lucide-react";

interface MobileStickyBarProps {
  localizedTotalPrice: string;
  handleWhatsAppOrder: () => void;
  mutedTextClass: string;
  strongTextClass: string;
  t: any;
}

export const MobileStickyBar = memo(function MobileStickyBar({
  localizedTotalPrice,
  handleWhatsAppOrder,
  mutedTextClass,
  strongTextClass,
  t,
}: MobileStickyBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[10020] border-t border-slate-200 bg-white/90 p-4 pb-safe backdrop-blur-lg md:hidden dark:border-zinc-800 dark:bg-zinc-950/90 transform-gpu">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex flex-col">
          <span className={`text-[10px] font-bold uppercase ${mutedTextClass}`}>
            {t("wa_total") || "Total"}
          </span>
          <span className={`text-lg font-black leading-none tabular-nums ${strongTextClass}`}>
            {localizedTotalPrice}
          </span>
        </div>
        <button
          onClick={handleWhatsAppOrder}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 text-[12px] font-black uppercase tracking-wider text-white shadow-lg active:scale-95 transform-gpu dark:bg-white dark:text-slate-950"
        >
          <ShoppingBag size={16} />
          {t("product_details_confirm_whatsapp") || "Comprar"}
        </button>
      </div>
    </div>
  );
});