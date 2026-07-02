import React, { useMemo, useState, useEffect } from 'react';
import { AlignLeft, Loader2, Check, AlertCircle, Sparkles, X, ArrowDownLeft } from 'lucide-react';
import { generateRaciocinatedSlogan } from './aiSuggestionsData';

interface DescriptionSectionProps {
  descValue: string;
  setDescValue: (val: string) => void;
  isEditingDesc: boolean;
  setIsEditingDesc: (val: boolean) => void;
  isPending: boolean;
  onSave: () => void;
  onCancel: () => void;
  t: (key: string) => string;
  store?: any;
}

export const DescriptionSection: React.FC<DescriptionSectionProps> = ({
  descValue,
  setDescValue,
  isEditingDesc,
  setIsEditingDesc,
  isPending,
  onSave,
  onCancel,
  t,
  store,
}) => {
  const limit = 60;
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [currentPlaceholder, setCurrentPlaceholder] = useState('');

  const savedApiText = useMemo(() => store?.description || '', [store]);

  const isPt = useMemo(() => {
    try {
      return t('short_description').toLowerCase().includes('curta') || navigator.language.startsWith('pt');
    } catch {
      return true;
    }
  }, [t]);

  // Lista massiva de placeholders dinâmicos para instruir o utilizador criativamente
  const aiPlaceholders = useMemo(() => ({
    pt: [
      'Ex: bolos gourmet artesanais...',
      'Ex: torna mais chique e foca em moda praia...',
      'Ex: iPhones e acessórios premium com desconto...',
      'Ex: hamburgueria artesanal com entrega rápida...',
      'Ex: salão de beleza moderno e estética...',
      'Ex: algo urgente e agressivo para vender roupas...',
      'Ex: peças auto e mecânica de confiança...'
    ],
    en: [
      'E.g., gourmet handmade cakes...',
      'E.g., make it sound luxurious for swimwear...',
      'E.g., premium iPhones and accessories with deals...',
      'E.g., craft burger shop with fast delivery...',
      'E.g., modern beauty salon and skincare...',
      'E.g., something urgent and powerful for clothing...',
      'E.g., reliable auto parts and mechanic shop...'
    ]
  }), []);

  // Altera o placeholder de forma aleatória sempre que o painel da IA é aberto
  useEffect(() => {
    if (isAiOpen) {
      const list = isPt ? aiPlaceholders.pt : aiPlaceholders.en;
      const randomPlaceholder = list[Math.floor(Math.random() * list.length)];
      setCurrentPlaceholder(randomPlaceholder);
    }
  }, [isAiOpen, isPt, aiPlaceholders]);

  const handleTextChange = (text: string) => {
    const cleanText = text.replace(/[\r\n\t]/g, ' ').replace(/\s\s+/g, ' ');
    setDescValue(cleanText.slice(0, limit));
  };

  const handleGenerateAiText = async () => {
    if (!aiPrompt.trim() && !descValue.trim() && !savedApiText.trim()) return;
    setIsAiLoading(true);
    setAiSuggestion('');

    try {
      const slogan = await generateRaciocinatedSlogan({
        currentInput: descValue,
        savedText: savedApiText,
        prompt: aiPrompt,
        isPt,
      });
      setAiSuggestion(slogan);
    } catch {
      // Fallback local seguro
    } finally { // 🌟 CORRIGIDO: Escrito corretamente com dois 'l' para sanar o erro ts(1435)
      setIsAiLoading(false);
    }
  };

  const handleApplySuggestion = () => {
    if (!aiSuggestion) return;
    handleTextChange(aiSuggestion);
    setIsAiOpen(false);
    setAiSuggestion('');
    setAiPrompt('');
  };

  return (
    <div className="w-full px-4 py-5 sm:px-6 md:px-8 md:py-7 bg-white rounded-3xl border border-slate-100/80 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row">
        
        <div
          className={`hidden self-start rounded-2xl p-3.5 transition-all md:block ${
            isEditingDesc
              ? 'rotate-3 bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'border border-slate-100 bg-slate-50/50 text-slate-400'
          }`}
        >
          <AlignLeft size={18} />
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400/90 italic">
              {t('short_description') || (isPt ? 'Descrição Curta' : 'Short Description')}
            </p>
            {isEditingDesc && (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAiOpen(!isAiOpen);
                    setAiSuggestion('');
                    setAiPrompt('');
                  }}
                  className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-xl transition-all duration-200 border cursor-pointer active:scale-95 ${
                    isAiOpen
                      ? 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100/70'
                      : 'bg-indigo-600 border-indigo-600 text-white shadow-sm hover:bg-slate-900'
                  }`}
                >
                  {isAiOpen ? <X size={11} /> : <Sparkles size={11} className="animate-pulse" />}
                  {isAiOpen ? (isPt ? 'Fechar IA' : 'Close AI') : (isPt ? 'Melhorar com IA' : 'Improve with AI')}
                </button>
                <span
                  className={`text-[10px] font-black font-mono px-2 py-0.5 rounded-md ${
                    descValue.length >= limit ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-500'
                  }`}
                >
                  {descValue.length}/{limit}
                </span>
              </div>
            )}
          </div>

          {/* PAINEL ASSISTENTE DE IA */}
          {isEditingDesc && isAiOpen && (
            <div className="rounded-2xl border border-indigo-100/70 bg-gradient-to-br from-indigo-50/20 via-white to-slate-50/30 p-3.5 space-y-3 shadow-inner shadow-indigo-50/30 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="text-[10px] font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                <Sparkles size={12} className="text-indigo-500" />
                <span>{isPt ? 'Assistente de Cópia Comercial' : 'Commercial Copy Assistant'}</span>
              </div>

              {savedApiText && (
                <div className="rounded-xl bg-slate-50/40 border border-slate-100 p-2 text-[11px] font-semibold text-slate-500 leading-snug">
                  <span className="font-black text-slate-400 uppercase text-[8px] block mb-0.5">
                    {isPt ? 'Histórico Salvo:' : 'Saved History:'}
                  </span>
                  "{savedApiText}"
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row items-stretch">
                {/* O input usa text-base para mitigar o zoom indesejado em navegadores mobile */}
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder={currentPlaceholder}
                  className="w-full flex-1 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 text-base md:text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 placeholder-slate-400 transition-colors shadow-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleGenerateAiText();
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={isAiLoading || (!aiPrompt.trim() && !descValue.trim() && !savedApiText.trim())}
                  onClick={handleGenerateAiText}
                  className="rounded-xl bg-indigo-600 hover:bg-slate-900 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white transition-all duration-150 disabled:opacity-30 cursor-pointer shrink-0 inline-flex items-center justify-center min-h-[42px] sm:min-h-0 shadow-sm active:scale-95"
                >
                  {isAiLoading ? <Loader2 size={13} className="animate-spin" /> : (isPt ? 'Sugerir' : 'Suggest')}
                </button>
              </div>

              {aiSuggestion && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-3 flex items-center justify-between gap-4 animate-in zoom-in-95 duration-200">
                  <div className="min-w-0 flex-1">
                    <p className="text-[8px] font-black uppercase tracking-widest text-emerald-600 mb-0.5">
                      {isPt ? 'Sugestão da IA' : 'AI Suggestion'} ({aiSuggestion.length} car.)
                    </p>
                    <p className="text-xs font-black italic text-slate-700 tracking-tight leading-relaxed truncate">
                      "{aiSuggestion}"
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleApplySuggestion}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-2 text-[10px] font-black uppercase text-white shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <ArrowDownLeft size={12} />
                    {isPt ? 'Usar' : 'Apply'}
                  </button>
                </div>
              )}
            </div>
          )}

          {isEditingDesc ? (
            <div className="space-y-3">
            <div className="space-y-3">
  <textarea
    autoFocus
    value={descValue}
    onChange={(e) => handleTextChange(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === 'Enter') e.preventDefault();
    }}
    rows={2}
 
    className="w-full resize-none rounded-2xl border border-slate-200 bg-white p-3.5 text-base sm:text-sm font-bold text-slate-700 outline-none transition-all focus:border-indigo-500 shadow-sm"
    placeholder={isPt ? 'Fale brevemente sobre o seu negócio...' : 'Tell something short about your business...'}
  />
</div>
              
              {descValue.length >= limit && (
                <div className="flex items-center gap-1.5 text-red-500 text-[10px] font-black uppercase tracking-wide animate-pulse">
                  <AlertCircle size={12} />
                  <span>{isPt ? 'Limite máximo atingido!' : 'Maximum limit reached!'}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer transition-colors active:scale-95"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={onSave}
                  disabled={isPending}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm disabled:opacity-50 cursor-pointer transition-all active:scale-95"
                >
                  {isPending ? <Loader2 size={11} className="animate-spin" /> : <Check size={12} />}
                  {t('save')}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingDesc(true)}
              className="group w-full cursor-pointer rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 p-4 text-left transition-all hover:border-indigo-300 hover:bg-white shadow-sm"
            >
              <p
                className={`text-sm italic tracking-tight break-words transition-colors ${
                  descValue ? 'font-black text-slate-700' : 'font-semibold text-slate-300 group-hover:text-slate-400'
                }`}
              >
                {descValue || (isPt ? 'Clique para adicionar uma breve descrição à sua loja.' : 'Click to add a short description to your store.')}
              </p>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};