import { memo, useCallback, useMemo } from "react";
import {
  Minus,
  Plus,
  MessageSquarePlus,
  MessageCircle,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface ProductCheckoutProps {
  quantity: number;
  setQuantity: (q: number | ((prev: number) => number)) => void;
  customNote: string;
  setCustomNote: (note: string) => void;
  localizedTotalPrice: string;
  translatedUnit: string;
  handleWhatsAppOrder: () => void;
  forceLightUI: boolean;
  panelClass?: string;
  softMutedTextClass?: string;
  strongTextClass?: string;
  isEditorRoute?: boolean;
  maxQuantity?: number;
  t: (key: string) => string;
}

export const ProductCheckout = memo(function ProductCheckout({
  quantity,
  setQuantity,
  customNote,
  setCustomNote,
  localizedTotalPrice,
  translatedUnit,
  handleWhatsAppOrder,
  forceLightUI,
  panelClass = "",
  softMutedTextClass = "text-slate-500 dark:text-zinc-400",
  strongTextClass = "text-slate-800 dark:text-zinc-100",
  isEditorRoute = false,
  maxQuantity = 20,
  t,
}: ProductCheckoutProps) {
  const safeLimit = Math.max(1, maxQuantity);
  const currentQuantity = Math.min(Math.max(1, Number(quantity) || 1), safeLimit);

  const isMin = currentQuantity <= 1;
  const isMax = currentQuantity >= safeLimit;

  const handleDecrement = useCallback(() => {
    setQuantity((prev) => {
      const val = Number(prev) || 1;
      return val > 1 ? val - 1 : 1;
    });
  }, [setQuantity]);

  const handleIncrement = useCallback(() => {
    setQuantity((prev) => {
      const val = Number(prev) || 1;
      return val < safeLimit ? val + 1 : safeLimit;
    });
  }, [setQuantity, safeLimit]);

  // Preço reduzido de leve para melhor equilíbrio visual
  const priceTextSize = useMemo(() => {
    const len = localizedTotalPrice.length;
    if (len > 18) return "text-lg sm:text-xl";
    if (len > 12) return "text-xl sm:text-2xl";
    return "text-2xl sm:text-3xl";
  }, [localizedTotalPrice.length]);

  const containerBg = forceLightUI
    ? "border-slate-200 bg-white"
    : "border-slate-200 bg-white dark:border-zinc-700/60 dark:bg-zinc-950";

  return (
    <div
      className={`mb-6 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 sm:p-5 dark:border-zinc-800/80 dark:bg-zinc-900/80 ${panelClass}`}
    >
      {/* Controles Principais */}
      <div className="mb-4 flex flex-col gap-3.5 sm:flex-row sm:items-end sm:justify-between">
        
        {/* Controle de Quantidade */}
        <div className="w-full sm:w-auto sm:shrink-0">
          <div className="mb-1.5 flex items-center justify-between">
            <label
              className={`block text-xs font-semibold uppercase tracking-wider ${softMutedTextClass}`}
            >
              {t("product_details_quantity") || "Quantidade"}
            </label>

            {isMax && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200/60 dark:border-amber-800/40 dark:bg-amber-950/40 dark:text-amber-300">
                {t("limit_reached") || "Limite atingido"} ({safeLimit} {translatedUnit || "un."})
              </span>
            )}
          </div>

          <div
            className={`flex h-12 w-full select-none items-center rounded-xl border shadow-xs sm:w-[185px] ${containerBg}`}
          >
            <button
              type="button"
              disabled={isMin}
              onClick={handleDecrement}
              aria-label={t("decrease_quantity") || "Diminuir quantidade"}
              className="flex h-full w-12 items-center justify-center text-slate-600 transition-colors active:bg-slate-100 disabled:pointer-events-none disabled:opacity-25 dark:text-zinc-300 dark:active:bg-zinc-800"
            >
              <Minus size={17} strokeWidth={2.2} />
            </button>

            <div className="flex flex-1 flex-col items-center justify-center border-x border-slate-100 px-1 dark:border-zinc-800/80">
              <span
                className={`text-xl font-bold tabular-nums leading-none ${strongTextClass}`}
              >
                {currentQuantity}
              </span>
              <span
                className={`mt-0.5 text-[9px] font-medium uppercase tracking-wider ${softMutedTextClass}`}
              >
                {translatedUnit || "un"}
              </span>
            </div>

            <button
              type="button"
              disabled={isMax}
              onClick={handleIncrement}
              aria-label={t("increase_quantity") || "Aumentar quantidade"}
              className="flex h-full w-12 items-center justify-center text-slate-600 transition-colors active:bg-slate-100 disabled:pointer-events-none disabled:opacity-25 dark:text-zinc-300 dark:active:bg-zinc-800"
            >
              <Plus size={17} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* Totalizador */}
        <div className="flex min-w-0 flex-row items-baseline justify-between gap-2 border-t border-slate-200/70 pt-3 sm:flex-col sm:items-end sm:justify-center sm:border-0 sm:pt-0 dark:border-zinc-800">
          <span
            className={`shrink-0 text-xs font-semibold uppercase tracking-wider ${softMutedTextClass}`}
          >
            {t("product_details_final_value") || "Total a Pagar"}
          </span>

          <div
            title={localizedTotalPrice}
            className={`max-w-full truncate font-bold tracking-tight tabular-nums text-emerald-700 dark:text-emerald-400 ${priceTextSize}`}
          >
            {localizedTotalPrice}
          </div>
        </div>
      </div>

      {/* Campo de Observações (16px base no mobile para prevenir zoom nativo no iOS/Android) */}
      {!isEditorRoute && (
        <div className="relative mb-4">
          <div className="pointer-events-none absolute left-3.5 top-3 text-slate-400 dark:text-zinc-500">
            <MessageSquarePlus size={17} />
          </div>

          <textarea
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            maxLength={200}
            placeholder={
              t("add_note_placeholder") ||
              "Alguma preferência? (ex: cor, tamanho)..."
            }
            className={`w-full resize-none rounded-xl border py-2.5 pl-9 pr-3 text-base sm:text-sm font-normal placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 ${
              forceLightUI
                ? "border-slate-200 bg-white text-slate-800"
                : "border-slate-200 bg-white text-slate-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            }`}
            rows={2}
          />
        </div>
      )}

      {/* Botão de Finalização */}
      <div className="block">
        <button
          type="button"
          onClick={handleWhatsAppOrder}
          className="transform-gpu flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 text-sm sm:text-base font-bold uppercase tracking-wide text-white shadow-xs transition-colors active:scale-[0.99]"
        >
          <MessageCircle size={19} className="fill-current" />
          <span>
            {t("product_details_confirm_whatsapp") || "Pedir pelo WhatsApp"}
          </span>
        </button>

        {/* Gatilhos de Confiança */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs font-normal text-slate-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={15} className="text-emerald-600 dark:text-emerald-400" />
            {t("safe_contact") || "Atendimento Seguro"}
          </span>
          <span className="flex items-center gap-1.5">
            <Zap size={14} className="text-amber-600 dark:text-amber-400" />
            {t("fast_response") || "Resposta Rápida"}
          </span>
        </div>
      </div>
    </div>
  );
});