import { memo } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import type { TranslateFn } from '../../../dashboard/Products';

interface ProgressGuideProps {
  hasCurrency: boolean;
  hasProducts: boolean;
  t: TranslateFn;
}

export const ProgressGuide = memo(({ hasCurrency, hasProducts, t }: ProgressGuideProps) => {
  const items = [
    { done: hasCurrency, label: t('products_tutorial_step_1_title') },
    { done: hasProducts, label: t('products_tutorial_step_2_title') },
    { done: hasProducts, label: t('products_tutorial_step_3_title') },
  ];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
      <div className="flex flex-col gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-black text-slate-900">{t('products_tutorial_title')}</h3>
          <p className="mt-1 text-xs text-slate-500">{t('products_tutorial_description')}</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={index}
              className={`flex min-w-0 items-center gap-2 rounded-2xl px-3 py-2 text-[11px] font-semibold ${
                item.done ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {item.done ? (
                <CheckCircle2 size={14} className="shrink-0" />
              ) : (
                <Circle size={14} className="shrink-0" />
              )}
              <span className="truncate">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

ProgressGuide.displayName = 'ProgressGuide';