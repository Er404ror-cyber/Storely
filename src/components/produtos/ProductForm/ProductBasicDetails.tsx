import { memo, useCallback } from 'react';
import type {  FocusEvent } from 'react';
import { AlignLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PRODUCT_LIMITS, PRODUCT_UNIT_OPTIONS, sanitizeCents, sanitizeMajor, normalizeCategory }  from '../productForm.utils';
import { supabase } from '../../../lib/supabase';
import { MOCK_GLOBAL_CATEGORIES } from '../componentsPublic/SearchMocks';
import type { ProductFormData } from '../ProductForm';
import { useTranslate } from '../../../context/LanguageContext';

interface ProductBasicDetailsProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  priceMajor: string;
  setPriceMajor: React.Dispatch<React.SetStateAction<string>>;
  priceCents: string;
  setPriceCents: React.Dispatch<React.SetStateAction<string>>;
  fieldErrors: Record<string, string>;
  adminStoreId?: string;
}

export const ProductBasicDetails = memo(function ProductBasicDetails({
  formData, setFormData, priceMajor, setPriceMajor, priceCents, setPriceCents, fieldErrors, adminStoreId
}: ProductBasicDetailsProps) {
  const { t } = useTranslate();

  const { data: recentCategories = [] } = useQuery({
    queryKey: ['store-recent-categories', adminStoreId],
    enabled: !!adminStoreId,
    queryFn: async () => {
      const { data } = await supabase.from('products').select('category').eq('store_id', adminStoreId!).order('created_at', { ascending: false }).limit(5);
      const unique = new Set<string>();
      return (data || []).reduce<string[]>((acc, curr) => {
        const cat = normalizeCategory(curr.category || '');
        if (cat && !unique.has(cat.toLowerCase()) && acc.length < 6) { unique.add(cat.toLowerCase()); acc.push(cat); }
        return acc;
      }, []);
    },
  });

  const handleField = useCallback((field: keyof ProductFormData, val: string) => setFormData(p => ({ ...p, [field]: val })), [setFormData]);

  // FAXINA INTELIGENTE DA DESCRIÇÃO (Espaços duplos, pontuação, etc)
  const handleDescriptionBlur = useCallback((e: FocusEvent<HTMLTextAreaElement>) => {
    let cleaned = e.target.value;
    cleaned = cleaned.split('\n').map(line => line.trimEnd()).join('\n'); // Tira espaços sobrando no fim das frases
    cleaned = cleaned.replace(/[ \t]{2,}/g, ' '); // Tira espaços duplos
    cleaned = cleaned.replace(/ ([,.;:?!])/g, '$1'); // Corrige: "palavra ," para "palavra,"
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n'); // Limita as quebras de linha
    handleField('full_description', cleaned.trim());
  }, [handleField]);

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">{t('product_form_name_label')}</label>
            <span className="text-[10px] font-bold text-slate-400">{formData.name.length}/{PRODUCT_LIMITS.name}</span>
          </div>
          <input type="text" maxLength={PRODUCT_LIMITS.name} value={formData.name} onChange={(e) => handleField('name', e.target.value)} placeholder={t('product_form_name_placeholder')} className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-bold outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50" />
          {fieldErrors.name && <p className="mt-2 text-xs font-semibold text-amber-600">{fieldErrors.name}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-[11px] font-black uppercase tracking-wider text-slate-500">{t('product_form_price_label')}</label>
          <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-3 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
            <div className="flex items-end gap-3">
              <div className="min-w-0 flex-1">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-slate-400">{t('product_form_price_whole')}</span>
                <input type="text" inputMode="numeric" value={priceMajor} onChange={e => setPriceMajor(sanitizeMajor(e.target.value))} onBlur={() => setPriceMajor(prev => sanitizeMajor(prev))} placeholder="0" className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-2xl font-black outline-none focus:border-blue-500" />
              </div>
              <div className="pb-3 text-2xl font-black text-slate-300">.</div>
              <div className="w-24">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-slate-400">{t('product_form_price_cents')}</span>
                <input type="text" inputMode="numeric" value={priceCents} onChange={e => setPriceCents(sanitizeCents(e.target.value).slice(0, 2))} onBlur={() => setPriceCents(prev => prev === '' && priceMajor ? '00' : prev.padEnd(2, '0'))} placeholder="00" className="h-14 w-full rounded-2xl border border-slate-200 px-4 text-center text-xl font-black outline-none focus:border-blue-500" />
              </div>
            </div>
          </div>
          {fieldErrors.price && <p className="mt-2 text-xs font-semibold text-amber-600">{fieldErrors.price}</p>}
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-black uppercase text-slate-500">{t('product_form_category_label')}</label>
          <select value={formData.category} onChange={e => handleField('category', e.target.value)} className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50">
            <option value="" disabled hidden>{t('product_form_category_placeholder', { defaultValue: 'Selecione...' })}</option>
            {MOCK_GLOBAL_CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.emoji} {t(c.nameKey as never)}</option>)}
          </select>
          {recentCategories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {recentCategories.map(c => <button key={c} type="button" onClick={() => handleField('category', c)} className="rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-black uppercase text-slate-600 hover:bg-slate-200">{c}</button>)}
            </div>
          )}
          {fieldErrors.category && <p className="mt-2 text-xs font-semibold text-amber-600">{fieldErrors.category}</p>}
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-black uppercase text-slate-500">{t('product_form_unit_label')}</label>
          <select value={formData.unit} onChange={e => handleField('unit', e.target.value)} className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50">
            {PRODUCT_UNIT_OPTIONS.map(u => <option key={u} value={u}>{t(`product_form_unit_${u}`)}</option>)}
          </select>
        </div>

        <div className="md:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <label className="flex items-center gap-2 text-[11px] font-black uppercase text-slate-500"><AlignLeft size={14} className="text-blue-500" /> {t('product_form_description_label')}</label>
            <span className="text-[10px] font-bold text-slate-400">{formData.full_description.length}/{PRODUCT_LIMITS.description}</span>
          </div>
          <textarea value={formData.full_description} onChange={e => handleField('full_description', e.target.value.slice(0, PRODUCT_LIMITS.description))} onBlur={handleDescriptionBlur} onKeyDown={(e) => { if (e.key === 'Enter' && (formData.full_description.match(/\n/g)||[]).length >= PRODUCT_LIMITS.maxBreaks) e.preventDefault(); }} placeholder={t('product_form_description_placeholder')} className="min-h-[180px] w-full resize-none rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50" />
        </div>
      </div>
    </section>
  );
});