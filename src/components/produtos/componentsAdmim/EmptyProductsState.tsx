import { memo } from 'react';
import { Store, Plus } from 'lucide-react';
import type { TranslateFn } from '../../../dashboard/Products';

interface EmptyProductsStateProps {
  onAdd: () => void;
  t: TranslateFn;
}

export const EmptyProductsState = memo(({ onAdd, t }: EmptyProductsStateProps) => {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center px-4 py-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
        <Store size={24} />
      </div>

      <h3 className="mt-4 text-base font-black text-slate-900">{t('products_empty_title')}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        {t('products_empty_description')}
      </p>

      <button
        onClick={onAdd}
        className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 text-[11px] font-black uppercase tracking-[0.1em] text-white transition hover:bg-blue-700"
      >
        <Plus size={14} />
        {t('btn_new_product')}
      </button>
    </div>
  );
});

EmptyProductsState.displayName = 'EmptyProductsState';