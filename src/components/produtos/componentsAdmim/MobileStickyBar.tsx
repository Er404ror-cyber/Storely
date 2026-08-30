import { memo } from "react";
import { MessageCircle } from "lucide-react";

interface MobileStickyBarProps {
  localizedTotalPrice: string;
  handleWhatsAppOrder: () => void;
  mutedTextClass: string;
  strongTextClass: string;
  t: (key: string, options?: { defaultValue?: string }) => string;
}

export const MobileStickyBar = memo(function MobileStickyBar({
  localizedTotalPrice,
  handleWhatsAppOrder,
  mutedTextClass,
  strongTextClass,
  t,
}: MobileStickyBarProps) {
  return (
    <aside
      aria-label={t("checkout_bar", { defaultValue: "Barra de finalização" })}
      className="fixed bottom-0 inset-x-0 z-40 box-border w-full border-t border-slate-200/90 bg-white/95 px-4 pt-2.5 pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))]  md:hidden dark:border-zinc-800/90 dark:bg-zinc-950/95"
    >
      <div className="flex w-full items-center justify-between gap-3.5 max-w-lg mx-auto">
        {/* Bloco de Preço: Moeda e valor inteiros sem corte */}
        <div className="flex shrink-0 flex-col justify-center min-w-max">
          <span className={`text-[11px] font-bold uppercase tracking-wider leading-none ${mutedTextClass}`}>
            {t("wa_total", { defaultValue: "Total" })}
          </span>
          <span
            className={`whitespace-nowrap text-base sm:text-lg font-black tracking-tight leading-tight tabular-nums mt-0.5 text-emerald-600 dark:text-emerald-400 ${strongTextClass}`}
          >
            {localizedTotalPrice}
          </span>
        </div>

        {/* Botão de Alta Conversão */}
        <button
          type="button"
          onClick={handleWhatsAppOrder}
          className="flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-xs font-black uppercase tracking-wider text-white shadow-xs transition-colors duration-150 active:bg-emerald-700 dark:bg-emerald-500 dark:active:bg-emerald-600"
        >
          <MessageCircle size={16} className="shrink-0 fill-current stroke-none" />
          <span className="truncate">
            {t("product_details_confirm_whatsapp", { defaultValue: "Pedir Agora" })}
          </span>
        </button>
      </div>
    </aside>
  );
});