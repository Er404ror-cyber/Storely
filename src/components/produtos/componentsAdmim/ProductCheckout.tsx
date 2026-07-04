import { memo } from "react";
import { Minus, Plus, MessageSquarePlus, MessageCircle, ShieldCheck } from "lucide-react";

interface ProductCheckoutProps {
  quantity: number;
  setQuantity: (q: number | ((prev: number) => number)) => void;
  customNote: string;
  setCustomNote: (note: string) => void;
  localizedTotalPrice: string;
  translatedUnit: string;
  handleWhatsAppOrder: () => void;
  forceLightUI: boolean;
  panelClass: string;
  softMutedTextClass: string;
  strongTextClass: string;
  isEditorRoute: boolean;
  t: any;
}

export const ProductCheckout = memo(function ProductCheckout({
  quantity,
  setQuantity,
  customNote,
  setCustomNote,
  localizedTotalPrice,
  handleWhatsAppOrder,
  forceLightUI,
  panelClass,
  softMutedTextClass,
  strongTextClass,
  isEditorRoute,
  t,
}: ProductCheckoutProps) {
  return (
    <div className={`rounded-3xl border p-5 md:p-6 shadow-sm mb-6 transition-colors ${panelClass}`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <p className={`text-[10px] font-black uppercase tracking-[0.16em] mb-2 ${softMutedTextClass}`}>
            {t("product_details_quantity") || "Quantidade"}
          </p>
          <div className={`inline-flex items-center gap-4 rounded-2xl p-1.5 ${forceLightUI ? "bg-slate-100" : "bg-slate-100 dark:bg-zinc-950"}`}>
            <button
              type="button"
              onClick={() => setQuantity((p) => Math.max(1, p - 1))}
              className="rounded-xl bg-white p-2 text-slate-700 shadow-sm transition active:scale-95 dark:bg-zinc-800 dark:text-zinc-300 transform-gpu"
            >
              <Minus size={18} />
            </button>
            <span className="min-w-[2.5rem] text-center text-lg font-black tabular-nums">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((p) => p + 1)}
              className="rounded-xl bg-white p-2 text-slate-700 shadow-sm transition active:scale-95 dark:bg-zinc-800 dark:text-zinc-300 transform-gpu"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div className="sm:text-right">
          <p className={`text-[10px] font-black uppercase tracking-[0.16em] ${softMutedTextClass}`}>
            {t("product_details_final_value") || "Total"}
          </p>
          <div className={`text-3xl font-black tabular-nums ${strongTextClass}`}>{localizedTotalPrice}</div>
        </div>
      </div>

      {!isEditorRoute && (
        <div className="mb-6 relative">
          <div className="absolute left-3 top-3.5 text-slate-400 dark:text-zinc-500 pointer-events-none">
            <MessageSquarePlus size={16} />
          </div>
          <textarea
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder={t("add_note_placeholder") || "Adicionar nota (ex: Cor, tamanho)..."}
            className={`w-full resize-none rounded-2xl border bg-transparent py-3 pl-10 pr-4 text-base md:text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 ${
              forceLightUI
                ? "border-slate-200 text-slate-900 placeholder:text-slate-400"
                : "border-slate-200 text-slate-900 placeholder:text-slate-400 dark:border-zinc-800 dark:text-white dark:placeholder:text-zinc-600"
            }`}
            rows={2}
          />
        </div>
      )}

      <div className="hidden md:block">
        <button
          onClick={handleWhatsAppOrder}
          className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-slate-900 py-4 text-[13px] font-black uppercase tracking-[0.16em] text-white shadow-lg transition active:scale-[0.98] transform-gpu dark:bg-white dark:text-slate-950"
        >
          <MessageCircle size={18} />
          {t("product_details_confirm_whatsapp") || "Pedir via WhatsApp"}
        </button>
        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
          <ShieldCheck size={16} /> {t("safe_contact") || "Contacto Seguro"}
        </div>
      </div>
    </div>
  );
});