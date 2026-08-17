import { memo, useCallback, useMemo, useState, useEffect, useRef } from 'react';
import type { FocusEvent } from 'react';
import { 
  AlignLeft, 
  Percent, 
  ArrowRight, 
  Tag, 
  Sparkles, 
  UserCheck, 
  X,
  Ruler, 
  Shirt, 
  Layers, 
  Palette,
  Plus
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PRODUCT_LIMITS, PRODUCT_UNIT_OPTIONS, normalizeCategory } from '../productForm.utils';
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

type HelperTab = 'audience' | 'sizes' | 'styles' | 'materials' | 'colors';

interface SmartTagDefinition {
  id: string;
  labelKey: string;
  defaultLabel: string;
  valueKey: string;
  defaultValue: string;
  regex: RegExp;
}

const TAB_ORDER: HelperTab[] = ['audience', 'sizes', 'styles', 'materials', 'colors'];

const GROUP_CONFIG: Record<HelperTab, { headerKey: string; defaultHeader: string }> = {
  audience: { headerKey: 'group_header_audience', defaultHeader: 'Público' },
  sizes: { headerKey: 'group_header_sizes', defaultHeader: 'Tamanhos' },
  styles: { headerKey: 'group_header_styles', defaultHeader: 'Estilo' },
  materials: { headerKey: 'group_header_materials', defaultHeader: 'Material' },
  colors: { headerKey: 'group_header_colors', defaultHeader: 'Cores' },
};

// 🚀 Vocabulário calibrado para acionar os filtros do useProductIntelligence
const STATIC_TAG_GROUPS: Record<HelperTab, SmartTagDefinition[]> = {
  audience: [
    { id: 'kids', labelKey: 'quick_tag_kids', defaultLabel: '👶 Criança', valueKey: 'val_kids', defaultValue: 'Infantil (Criança / Bebé)', regex: /\b(criança|crianca|infantil|infantis|bebé|bebe|kids|baby)\b/i },
    { id: 'women', labelKey: 'quick_tag_women', defaultLabel: '👩 Mulher', valueKey: 'val_women', defaultValue: 'Feminino (Mulher)', regex: /\b(mulher|feminino|feminina|senhora|women)\b/i },
    { id: 'men', labelKey: 'quick_tag_men', defaultLabel: '👨 Homem', valueKey: 'val_men', defaultValue: 'Masculino (Homem)', regex: /\b(homem|masculino|rapaz|men)\b/i },
    { id: 'unisex', labelKey: 'quick_tag_unisex', defaultLabel: '✨ Unissexo', valueKey: 'val_unisex', defaultValue: 'Unissexo', regex: /\b(unissexo|unisex)\b/i },
    { id: 'adult', labelKey: 'quick_tag_adult', defaultLabel: '🧑 Adulto', valueKey: 'val_adult', defaultValue: 'Adulto', regex: /\b(adulto|adultos)\b/i },
  ],
  sizes: [
    { id: 'size_p', labelKey: 'quick_tag_p', defaultLabel: '📏 P', valueKey: 'val_p', defaultValue: 'Tam: P', regex: /\b(?:tamanho|tam|size)\s*[:=]?\s*p\b/i },
    { id: 'size_m', labelKey: 'quick_tag_m', defaultLabel: '📏 M', valueKey: 'val_m', defaultValue: 'Tam: M', regex: /\b(?:tamanho|tam|size)\s*[:=]?\s*m\b/i },
    { id: 'size_g', labelKey: 'quick_tag_g', defaultLabel: '📏 G', valueKey: 'val_g', defaultValue: 'Tam: G', regex: /\b(?:tamanho|tam|size)\s*[:=]?\s*g\b/i },
    { id: 'size_gg', labelKey: 'quick_tag_gg', defaultLabel: '📏 GG', valueKey: 'val_gg', defaultValue: 'Tam: GG', regex: /\b(?:tamanho|tam|size)\s*[:=]?\s*gg\b/i },
    { id: 'size_onesize', labelKey: 'quick_tag_onesize', defaultLabel: '📏 Único', valueKey: 'val_onesize', defaultValue: 'Tamanho Único', regex: /\b(tamanho único|tamanho unico|one size)\b/i },
    { id: 'size_plussize', labelKey: 'quick_tag_plussize', defaultLabel: '➕ Plus Size', valueKey: 'val_plussize', defaultValue: 'Plus Size', regex: /\b(plus size|tamanho grande)\b/i },
  ],
  styles: [
    { id: 'casual', labelKey: 'quick_tag_casual', defaultLabel: '👟 Casual', valueKey: 'val_casual', defaultValue: 'Casual / Dia a dia', regex: /\b(casual|streetwear|dia a dia)\b/i },
    { id: 'social', labelKey: 'quick_tag_social', defaultLabel: '👔 Social', valueKey: 'val_social', defaultValue: 'Social / Trabalho', regex: /\b(social|trabalho|blazer|alfaiataria)\b/i },
    { id: 'fitness', labelKey: 'quick_tag_fitness', defaultLabel: '⚡ Fitness', valueKey: 'val_fitness', defaultValue: 'Treino / Fitness', regex: /\b(treino|academia|fitness|desporto)\b/i },
    { id: 'party', labelKey: 'quick_tag_party', defaultLabel: '🎉 Festa', valueKey: 'val_party', defaultValue: 'Festa / Eventos', regex: /\b(festa|evento|casamento)\b/i },
    { id: 'combo', labelKey: 'quick_tag_combo', defaultLabel: '📦 Kit / Combo', valueKey: 'val_combo', defaultValue: 'Kit / Combo', regex: /\b(kit|combo)\b/i },
  ],
  materials: [
    { id: 'cotton', labelKey: 'quick_tag_cotton', defaultLabel: '🌿 Algodão', valueKey: 'val_cotton', defaultValue: '100% Algodão', regex: /\b(algodao|algodão|cotton)\b/i },
    { id: 'leather', labelKey: 'quick_tag_leather', defaultLabel: '🧥 Couro', valueKey: 'val_leather', defaultValue: 'Couro / Pele', regex: /\b(couro|pele|leather)\b/i },
    { id: 'jeans', labelKey: 'quick_tag_jeans', defaultLabel: '👖 Jeans', valueKey: 'val_jeans', defaultValue: 'Jeans / Denim', regex: /\b(jeans|denim|ganga)\b/i },
  ],
  colors: [
    { id: 'black', labelKey: 'quick_tag_black', defaultLabel: '⚫ Preto', valueKey: 'val_black', defaultValue: 'Preto', regex: /\b(preto|preta|black)\b/i },
    { id: 'white', labelKey: 'quick_tag_white', defaultLabel: '⚪ Branco', valueKey: 'val_white', defaultValue: 'Branco', regex: /\b(branco|branca|white)\b/i },
    { id: 'blue', labelKey: 'quick_tag_blue', defaultLabel: '🔵 Azul', valueKey: 'val_blue', defaultValue: 'Azul', regex: /\b(azul|blue)\b/i },
    { id: 'red', labelKey: 'quick_tag_red', defaultLabel: '🔴 Vermelho', valueKey: 'val_red', defaultValue: 'Vermelho', regex: /\b(vermelho|vermelha|red)\b/i },
    { id: 'pink', labelKey: 'quick_tag_pink', defaultLabel: '🌸 Rosa', valueKey: 'val_pink', defaultValue: 'Rosa', regex: /\b(rosa|pink)\b/i },
    { id: 'gold', labelKey: 'quick_tag_gold', defaultLabel: '✨ Dourado', valueKey: 'val_gold', defaultValue: 'Dourado', regex: /\b(dourado|dourada|gold)\b/i },
  ],
};

const ALL_TAGS = Object.values(STATIC_TAG_GROUPS).flat();
const SYSTEM_TAG_LINE_REGEX = /^•\s*(Público|Tamanhos?|Estilos?|Materiais?|Material|Cores?|Audience|Sizes?|Styles?|Materials?|Colors?):\s*(.*)$/i;

export const ProductBasicDetails = memo(function ProductBasicDetails({
  formData,
  setFormData,
  priceMajor,
  setPriceMajor,
  priceCents,
  setPriceCents,
  fieldErrors,
  adminStoreId,
}: ProductBasicDetailsProps) {
  const { t } = useTranslate();
  const [activeTab, setActiveTab] = useState<HelperTab>('audience');

  // Estado que guarda APENAS o que o utilizador digitou
  const [userText, setUserText] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const isInternalUpdate = useRef(false);

  // Extrai as tags para os botões e limpa 100% da caixa de texto do utilizador
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    const raw = formData.full_description || '';
    const lines = raw.split('\n');
    const matchedIds: string[] = [];
    const pureUserLines: string[] = [];

    lines.forEach(line => {
      const cleanLine = line.trim();
      const match = cleanLine.match(SYSTEM_TAG_LINE_REGEX);

      if (match) {
        const valuesString = match[2];
        ALL_TAGS.forEach(tag => {
          if (tag.regex.test(valuesString) && !matchedIds.includes(tag.id)) {
            matchedIds.push(tag.id);
          }
        });
        return; // Nunca insere tags do sistema na caixa de texto
      }

      // Suporte a tags antigas de formato legado "• Tag Individual"
      if (cleanLine.startsWith('•')) {
        let isLegacyTag = false;
        ALL_TAGS.forEach(tag => {
          if (tag.regex.test(cleanLine)) {
            if (!matchedIds.includes(tag.id)) matchedIds.push(tag.id);
            isLegacyTag = true;
          }
        });
        if (isLegacyTag) return;
      }

      pureUserLines.push(line);
    });

    setUserText(pureUserLines.join('\n').trim());
    setSelectedTagIds(matchedIds);
  }, [formData.full_description]);

  // Sincroniza o payload com o formato agrupado por linha (Ex: "• Tamanhos: Tam: P, Tam: M")
  const syncCombinedDescription = useCallback((text: string, tagIds: string[]) => {
    const groupLines: string[] = [];

    TAB_ORDER.forEach(groupKey => {
      const groupDefs = STATIC_TAG_GROUPS[groupKey];
      const activeInGroup = tagIds
        .map(id => groupDefs.find(tDef => tDef.id === id))
        .filter(Boolean)
        .map(tDef => t((tDef?.valueKey || '') as any, { defaultValue: tDef?.defaultValue || '' }));

      if (activeInGroup.length > 0) {
        const header = t((GROUP_CONFIG[groupKey].headerKey || '') as any, { defaultValue: GROUP_CONFIG[groupKey].defaultHeader });
        groupLines.push(`• ${header}: ${activeInGroup.join(', ')}`);
      }
    });

    const compactTagsBlock = groupLines.length > 0 ? `\n\n${groupLines.join('\n')}` : '';
    const combined = `${text.trim()}${compactTagsBlock}`.trim();

    isInternalUpdate.current = true;
    setFormData(prev => ({
      ...prev,
      full_description: combined.slice(0, PRODUCT_LIMITS.description),
    }));
  }, [setFormData, t]);

  const handleUserTextChange = useCallback((newText: string) => {
    setUserText(newText);
    syncCombinedDescription(newText, selectedTagIds);
  }, [selectedTagIds, syncCombinedDescription]);

  const handleUserTextBlur = useCallback((e: FocusEvent<HTMLTextAreaElement>) => {
    let cleaned = e.target.value;
    cleaned = cleaned.split('\n').map(line => line.trimEnd()).join('\n');
    cleaned = cleaned.replace(/[ \t]{2,}/g, ' ');
    cleaned = cleaned.replace(/ ([,.;:?!])/g, '$1');
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    const finalClean = cleaned.trim();
    setUserText(finalClean);
    syncCombinedDescription(finalClean, selectedTagIds);
  }, [selectedTagIds, syncCombinedDescription]);

  const handleToggleTag = useCallback((tagId: string) => {
    setSelectedTagIds(prev => {
      const next = prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId];
      syncCombinedDescription(userText, next);
      return next;
    });
  }, [userText, syncCombinedDescription]);

  const { data: recentCategories = [] } = useQuery({
    queryKey: ['store-recent-categories', adminStoreId],
    enabled: !!adminStoreId,
    staleTime: 1000 * 60 * 10,
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('category')
        .eq('store_id', adminStoreId!)
        .order('created_at', { ascending: false })
        .limit(6);

      const unique = new Set<string>();
      return (data || []).reduce<string[]>((acc, curr) => {
        const cat = normalizeCategory(curr.category || '');
        if (cat && !unique.has(cat.toLowerCase()) && acc.length < 6) {
          unique.add(cat.toLowerCase());
          acc.push(cat);
        }
        return acc;
      }, []);
    },
  });

  const handleField = useCallback((field: keyof ProductFormData, val: string) => {
    setFormData(p => ({ ...p, [field]: val }));
  }, [setFormData]);

  // Controles de preço
  const handleMajorChange = useCallback((val: string) => {
    const raw = val.replace(/\D/g, '');
    if (!raw) {
      setPriceMajor('');
      return;
    }
    const sanitized = raw.replace(/^0+(?=\d)/, '').slice(0, 8);
    setPriceMajor(sanitized);
  }, [setPriceMajor]);

  const handleCentsChange = useCallback((val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 2);
    setPriceCents(raw);
  }, [setPriceCents]);

  const handleCentsBlur = useCallback(() => {
    setPriceCents(prev => {
      if (!prev) return priceMajor ? '00' : '';
      if (prev.length === 1) return `${prev}0`;
      return prev;
    });
  }, [priceMajor, setPriceCents]);

  const handleDiscountChange = useCallback((val: string) => {
    const num = parseInt(val.replace(/\D/g, ''), 10);
    if (isNaN(num) || num <= 0) return handleField('discount_percent', '');
    if (num > 100) return handleField('discount_percent', '100');
    handleField('discount_percent', num.toString());
  }, [handleField]);

  const { basePrice, discountPercent, finalPrice } = useMemo(() => {
    const majorNum = parseInt(priceMajor || '0', 10);
    const centsNum = parseInt(priceCents ? priceCents.padEnd(2, '0').slice(0, 2) : '0', 10);
    const totalCents = (isNaN(majorNum) ? 0 : majorNum * 100) + (isNaN(centsNum) ? 0 : centsNum);

    const discount = Math.min(100, Math.max(0, parseInt(formData.discount_percent || '0', 10) || 0));
    const finalCents = Math.round(totalCents * (1 - discount / 100));

    return {
      basePrice: totalCents / 100,
      discountPercent: discount,
      finalPrice: finalCents / 100,
    };
  }, [priceMajor, priceCents, formData.discount_percent]);

  const activeTagItems = STATIC_TAG_GROUPS[activeTab];

  // Tags selecionadas ordenadas por categoria
  const orderedSelectedTags = useMemo(() => {
    const list: Array<{ id: string; label: string; tab: HelperTab }> = [];
    TAB_ORDER.forEach(groupKey => {
      const groupDefs = STATIC_TAG_GROUPS[groupKey];
      selectedTagIds.forEach(id => {
        const found = groupDefs.find(tDef => tDef.id === id);
        if (found) {
          list.push({
            id: found.id,
            label: t(found.labelKey as any, { defaultValue: found.defaultLabel }),
            tab: groupKey,
          });
        }
      });
    });
    return list;
  }, [selectedTagIds, t]);

  return (
    <section 
      className="rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:p-5 md:p-6 shadow-sm"
      style={{ contain: 'content' }}
    >
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
        
        {/* NOME DO PRODUTO */}
        <div className="md:col-span-2">
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              {t('product_form_name_label' as any)}
            </label>
            <span className="text-[10px] font-bold text-slate-400">
              {formData.name.length}/{PRODUCT_LIMITS.name}
            </span>
          </div>
          <input
            type="text"
            maxLength={PRODUCT_LIMITS.name}
            value={formData.name}
            onChange={(e) => handleField('name', e.target.value)}
            placeholder={t('product_form_name_placeholder' as any)}
            className="h-13 sm:h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-black text-slate-900 outline-none transition-colors duration-150 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
          {fieldErrors.name && <p className="mt-1.5 text-xs font-semibold text-amber-600">{fieldErrors.name}</p>}
        </div>

        {/* PREÇO E DESCONTO */}
        <div className="md:col-span-2">
          <div className="mb-1.5 flex items-center gap-2">
            <Tag size={14} className="text-blue-500" />
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              {t('product_form_pricing_label' as any)}
            </label>
          </div>
          
          <div className="flex flex-col gap-2.5 sm:gap-3 md:flex-row md:items-start">
            <div className="flex-1 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-2.5 sm:p-3 transition-colors duration-150 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
              <div className="flex items-end gap-2 sm:gap-3">
                <div className="min-w-0 flex-1">
                  <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {t('product_form_price_original' as any)}
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={priceMajor}
                    onChange={e => handleMajorChange(e.target.value)}
                    placeholder="0"
                    className="h-12 sm:h-14 w-full rounded-2xl border border-slate-200 bg-white px-3 sm:px-4 text-xl sm:text-2xl font-black outline-none transition-colors duration-150 focus:border-blue-500"
                  />
                </div>
                <div className="pb-2 text-2xl font-black text-slate-300">.</div>
                <div className="w-20 sm:w-24">
                  <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {t('product_form_price_cents' as any)}
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={priceCents}
                    onChange={e => handleCentsChange(e.target.value)}
                    onBlur={handleCentsBlur}
                    placeholder="00"
                    className="h-12 sm:h-14 w-full rounded-2xl border border-slate-200 bg-white px-2 text-center text-lg sm:text-xl font-black outline-none transition-colors duration-150 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="w-full md:w-40 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-2.5 sm:p-3 transition-colors duration-150 focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-100">
              <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-400">
                {t('product_form_discount_label' as any)}
              </span>
              <div className="relative">
                <Percent size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.discount_percent || ''}
                  onChange={e => handleDiscountChange(e.target.value)}
                  placeholder="0"
                  className="h-12 sm:h-14 w-full rounded-2xl border border-slate-200 bg-white pl-3.5 pr-9 text-xl sm:text-2xl font-black text-amber-600 outline-none transition-colors duration-150 focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {fieldErrors.price && <p className="mt-1.5 text-xs font-semibold text-amber-600">{fieldErrors.price}</p>}

          {basePrice > 0 && (
            <div className={`mt-2.5 flex items-center justify-between rounded-xl px-3.5 py-2.5 border transition-colors duration-150 ${
              discountPercent > 0 
                ? 'bg-amber-50 text-amber-900 border-amber-200/60' 
                : 'bg-slate-50 text-slate-600 border-slate-200/80'
            }`}>
              <span className="text-xs font-black uppercase tracking-wide">
                {t('product_form_final_price_label' as any)}
              </span>
              <div className="flex items-center gap-2.5">
                {discountPercent > 0 && (
                  <>
                    <span className="text-sm font-bold text-amber-900/50 line-through">
                      {basePrice.toFixed(2)}
                    </span>
                    <ArrowRight size={13} className="text-amber-500" />
                  </>
                )}
                <span className="text-base sm:text-lg font-black tracking-tight">
                  {finalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* CATEGORIA */}
        <div>
          <label className="mb-1.5 block text-[11px] font-black uppercase text-slate-500">
            {t('product_form_category_label' as any)}
          </label>
          <select
            value={formData.category}
            onChange={e => handleField('category', e.target.value)}
            className="h-13 sm:h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-black text-slate-700 outline-none transition-colors duration-150 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          >
            <option value="" disabled hidden>{t('product_form_category_placeholder' as any)}</option>
            {MOCK_GLOBAL_CATEGORIES.map(c => (
              <option key={c.slug} value={c.slug}>
                {c.emoji} {t(c.nameKey as any)}
              </option>
            ))}
          </select>
          {recentCategories.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {recentCategories.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleField('category', c)}
                  className="rounded-xl bg-slate-100 px-2.5 py-1.5 text-[10px] font-black uppercase text-slate-700 hover:bg-slate-200 transition-colors duration-150"
                >
                  {c}
                </button>
              ))}
            </div>
          )}
          {fieldErrors.category && <p className="mt-1.5 text-xs font-semibold text-amber-600">{fieldErrors.category}</p>}
        </div>

        {/* UNIDADE */}
        <div>
          <label className="mb-1.5 block text-[11px] font-black uppercase text-slate-500">
            {t('product_form_unit_label' as any)}
          </label>
          <select
            value={formData.unit}
            onChange={e => handleField('unit', e.target.value)}
            className="h-13 sm:h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-black text-slate-700 outline-none transition-colors duration-150 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          >
            {PRODUCT_UNIT_OPTIONS.map(u => (
              <option key={u} value={u}>
                {t(`product_form_unit_${u}` as any)}
              </option>
            ))}
          </select>
        </div>

        {/* ÁREA DA DESCRIÇÃO (TEXTO LIVRE DO USUÁRIO) */}
        <div className="md:col-span-2">
          <div className="mb-1.5 flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-[11px] font-black uppercase text-slate-500">
              <AlignLeft size={14} className="text-blue-500" /> {t('product_form_description_label' as any)}
            </label>
            <span className="text-[10px] font-bold text-slate-400">
              {formData.full_description.length}/{PRODUCT_LIMITS.description}
            </span>
          </div>

          <textarea
            value={userText}
            onChange={e => handleUserTextChange(e.target.value.slice(0, PRODUCT_LIMITS.description))}
            onBlur={handleUserTextBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (userText.match(/\n/g) || []).length >= PRODUCT_LIMITS.maxBreaks) {
                e.preventDefault();
              }
            }}
            placeholder={t('product_form_description_placeholder' as any)}
            className="min-h-[120px] sm:min-h-[140px] w-full resize-none rounded-[1.25rem] border border-slate-200 bg-slate-50 p-3.5 sm:p-4 text-sm font-semibold text-slate-800 outline-none transition-colors duration-150 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 leading-relaxed"
          />

          {/* BADGES ATIVOS (GERENCIADOS VISUALMENTE) */}
          {orderedSelectedTags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 mr-0.5">
                {t('selected_tags_label' as any, { defaultValue: 'Ativas:' })}
              </span>
              {orderedSelectedTags.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleToggleTag(item.id)}
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-2.5 py-1 text-[10px] font-black text-white shadow-xs hover:bg-red-600 transition-colors duration-150"
                >
                  <span>{item.label}</span>
                  <X size={11} className="stroke-[3]" />
                </button>
              ))}
            </div>
          )}

          {/* ASSISTENTE DE TAGS RÁPIDAS (SELETOR) */}
          <div className="mt-3 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-2.5 sm:p-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 border-b border-slate-200/70 pb-2">
              <div className="flex items-center gap-1 text-slate-800">
                <Sparkles size={12} className="text-blue-600 shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {t('product_form_smart_helper_title' as any, { defaultValue: 'Adicionar Tags Rápidas' })}
                </span>
              </div>

              {/* Seletor de Abas em Negrito */}
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('audience')}
                  className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-wider transition-colors duration-150 ${
                    activeTab === 'audience' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <UserCheck size={10} /> {t('tab_audience' as any, { defaultValue: 'Público' })}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('sizes')}
                  className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-wider transition-colors duration-150 ${
                    activeTab === 'sizes' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Ruler size={10} /> {t('tab_sizes' as any, { defaultValue: 'Tamanhos' })}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('styles')}
                  className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-wider transition-colors duration-150 ${
                    activeTab === 'styles' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Shirt size={10} /> {t('tab_styles' as any, { defaultValue: 'Estilo' })}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('materials')}
                  className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-wider transition-colors duration-150 ${
                    activeTab === 'materials' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Layers size={10} /> {t('tab_materials' as any, { defaultValue: 'Material' })}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('colors')}
                  className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-wider transition-colors duration-150 ${
                    activeTab === 'colors' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Palette size={10} /> {t('tab_colors' as any, { defaultValue: 'Cores' })}
                </button>
              </div>
            </div>

            {/* Chips Rápidos da Aba Ativa */}
            <div className="flex flex-wrap items-center gap-1 pt-0.5">
              {activeTagItems.map((tag) => {
                const label = t(tag.labelKey as any, { defaultValue: tag.defaultLabel });
                const isSelected = selectedTagIds.includes(tag.id);

                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleToggleTag(tag.id)}
                    className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[10px] font-black transition-all duration-150 select-none shadow-xs ${
                      isSelected
                        ? 'bg-blue-600 text-white ring-1 ring-blue-600'
                        : 'bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-100 border border-slate-200 active:scale-95'
                    }`}
                  >
                    <span>{label}</span>
                    {isSelected ? (
                      <X size={10} className="stroke-[3]" />
                    ) : (
                      <Plus size={10} className="stroke-[3] text-slate-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
});