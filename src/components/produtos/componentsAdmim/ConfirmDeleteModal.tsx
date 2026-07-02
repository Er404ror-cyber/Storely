import { memo } from 'react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import type { TranslateFn } from '../../../dashboard/Products';

interface ConfirmDeleteModalProps {
  open: boolean;
  loading: boolean;
  productName: string;
  onClose: () => void;
  onConfirm: () => void;
  t: TranslateFn;
}

export const ConfirmDeleteModal = memo(({
  open,
  loading,
  productName,
  onClose,
  onConfirm,
  t,
}: ConfirmDeleteModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-slate-950/45 p-3 sm:items-center">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle size={18} />
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-black text-slate-900">
              {t('delete_product_confirm_title')}
            </h3>
            <p className="mt-1 break-words text-sm leading-relaxed text-slate-500">
              {t('delete_product_confirm_text')}{' '}
              <span className="font-bold text-slate-800">{productName}</span>
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-[11px] font-black uppercase tracking-[0.1em] text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {t('btn_cancel')}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 text-[11px] font-black uppercase tracking-[0.1em] text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {t('btn_delete')}
          </button>
        </div>
      </div>
    </div>
  );
});

ConfirmDeleteModal.displayName = 'ConfirmDeleteModal';