import { useState, useMemo, memo, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Printer, 
  X, 
  Building2, 
  Phone, 
  Mail, 
  Globe, 
  AlertCircle, 
  ArrowUpRight, 
  Languages, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Loader2 
} from 'lucide-react';
import { generateStorePresentationPDF, type StoreDBData } from '../../utils/generateStorePresentationPDF';
import { useTranslate } from '../../context/LanguageContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  store: StoreDBData;
}

// Dicionário estático fora do ciclo de render para economizar memória e garbage collection
const FALLBACK_DICTIONARY: Record<'pt' | 'en', Record<string, string>> = {
  pt: {
    pdf_doc_badge: 'Carta de Apresentação Comercial',
    pdf_doc_subtitle: 'Dossiê profissional A4 para clientes, parceiros e propostas',
    modal_feature_desc: 'Gera um documento em folha timbrada com a apresentação da sua marca, catálogo de produtos em tempo real e contactos verificados.',
    pdf_about_title: 'Descrição da Loja',
    pdf_about_default_desc: 'Fornecemos artigos selecionados com garantia de qualidade, preços transparentes e atendimento direto.',
    pdf_contact_whatsapp: 'WhatsApp Comercial',
    pdf_contact_email: 'E-mail de Contacto',
    pdf_contact_unavailable: 'Não configurado',
    modal_doc_lang: 'Idioma da Folha:',
    modal_missing_alert: 'Dados obrigatórios em falta para gerar o PDF',
    modal_missing_desc: 'Para emitir um documento oficial válido, preencha os dados em falta nas definições.',
    modal_go_settings: 'Ir às Definições para Preencher',
    modal_official_store: 'Loja Oficial',
    modal_official_logo: 'Logotipo Oficial',
    modal_generate_btn: 'Gerar Documento PDF A4',
    modal_generating: 'A preparar documento...',
    modal_preview_tag: 'Pré-visualização do Conteúdo'
  },
  en: {
    pdf_doc_badge: 'Commercial Presentation Letter',
    pdf_doc_subtitle: 'Professional A4 business dossier for clients, partners & proposals',
    modal_feature_desc: 'Generates a branded formal document featuring your company overview, live catalog link, and verified communication channels.',
    pdf_about_title: 'Store Description',
    pdf_about_default_desc: 'We provide curated products with verified provenance, transparent pricing, and fast fulfillment.',
    pdf_contact_whatsapp: 'Business WhatsApp',
    pdf_contact_email: 'Contact Email',
    pdf_contact_unavailable: 'Not configured',
    modal_doc_lang: 'Document Language:',
    modal_missing_alert: 'Mandatory information missing to generate PDF',
    modal_missing_desc: 'To generate a valid official dossier, complete the missing details in settings.',
    modal_go_settings: 'Go to Settings to Complete',
    modal_official_store: 'Official Store',
    modal_official_logo: 'Official Logo',
    modal_generate_btn: 'Generate A4 PDF Document',
    modal_generating: 'Preparing document...',
    modal_preview_tag: 'Content Preview'
  }
};

export const PresentationLetterModal = memo(function PresentationLetterModal({
  isOpen,
  onClose,
  store
}: Props) {
  const { t: systemT, language: systemLanguage } = useTranslate();

  const isEnglish = useMemo(() => systemLanguage?.toLowerCase().startsWith('en'), [systemLanguage]);
  const [selectedLanguage, setSelectedLanguage] = useState<'pt' | 'en'>(isEnglish ? 'en' : 'pt');
  const [hasManualOverride, setHasManualOverride] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hasManualOverride) {
      setSelectedLanguage(isEnglish ? 'en' : 'pt');
    }
  }, [isEnglish, hasManualOverride]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleClose = useCallback(() => {
    if (isGenerating) return;
    setHasManualOverride(false);
    setIsGenerating(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onClose();
  }, [onClose, isGenerating]);

  const baseUrl = useMemo(() => {
    return typeof window !== 'undefined' ? window.location.origin : 'https://storelyy.vercel.app';
  }, []);

  const productsUrl = useMemo(() => {
    return store?.slug ? `${baseUrl}/${store.slug}/products` : `${baseUrl}/store/products`;
  }, [store?.slug, baseUrl]);

  const modalT = useCallback((key: string): string => {
    const currentIsSysLang = selectedLanguage === (isEnglish ? 'en' : 'pt');
    if (currentIsSysLang) {
      const translated = (systemT as (k: string) => string)(key);
      if (translated && translated !== key) return translated;
    }
    return FALLBACK_DICTIONARY[selectedLanguage]?.[key] || (systemT as (k: string) => string)(key) || key;
  }, [selectedLanguage, isEnglish, systemT]);

  // Diagnóstico estrito local sem disparar chamadas de API
  const missingFields = useMemo(() => {
    const missing: { label: string; field: string }[] = [];
    
    if (!store?.whatsapp_number && !store?.settings?.phone) {
      missing.push({ 
        label: modalT('pdf_contact_whatsapp'), 
        field: 'whatsapp_number' 
      });
    }
    if (!store?.owner_email && !store?.settings?.email) {
      missing.push({ 
        label: modalT('pdf_contact_email'), 
        field: 'owner_email' 
      });
    }
    if (!store?.description?.trim()) {
      missing.push({ 
        label: modalT('pdf_about_title'), 
        field: 'description' 
      });
    }
    if (!store?.logo_url) {
      missing.push({ 
        label: modalT('modal_official_logo'), 
        field: 'logo_url' 
      });
    }

    return missing;
  }, [store, modalT]);

  const hasMissingData = missingFields.length > 0;

  const handleManualLanguageChange = useCallback((lang: 'pt' | 'en') => {
    if (isGenerating) return;
    setSelectedLanguage(lang);
    setHasManualOverride(true);
  }, [isGenerating]);

  // Gerador de PDF protegido com debounce
  const handlePrintPDF = useCallback(() => {
    if (hasMissingData || isGenerating) return;

    setIsGenerating(true);

    try {
      generateStorePresentationPDF({
        store,
        baseUrl,
        language: selectedLanguage
      });
    } catch (error) {
      console.error('Erro ao gerar apresentação PDF:', error);
    } finally {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setIsGenerating(false);
      }, 1200);
    }
  }, [hasMissingData, isGenerating, store, baseUrl, selectedLanguage]);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
  @keyframes sheetSlideUpHW {
    from {
      transform: translate3d(0, 100%, 0);
    }
    to {
      transform: translate3d(0, 0, 0);
    }
  }
  @keyframes backdropFadeHW {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .anim-sheet-up {
    animation: sheetSlideUpHW 0.18s ease-out forwards;
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    perspective: 1000px;
    contain: layout paint;
  }
  .anim-backdrop-fade {
    animation: backdropFadeHW 0.12s linear forwards;
    background-color: rgba(0, 0, 0, 0.55);
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    backface-visibility: hidden;
    contain: strict;
  }
`}</style>

      {/* Backdrop com isolamento de render */}
      <div 
        className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/50 anim-backdrop-fade overflow-x-hidden w-full lg:pl-72 xl:pl-72 box-border transform-gpu"
        style={{ contain: 'layout style paint' }}
        onClick={handleClose}
      >
        <div 
          className="w-full bg-[#fafafa] rounded-t-[2rem] lg:rounded-t-3xl p-4.5 sm:p-6 lg:p-7 shadow-[0_-12px_45px_rgba(0,0,0,0.12)] border-t border-zinc-200/90 space-y-3.5 max-h-[90vh] overflow-y-auto overflow-x-hidden anim-sheet-up pb-8 sm:pb-7 box-border transform-gpu"
          style={{ contain: 'content' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Puxador mobile */}
          <div 
            className="w-12 h-1.5 bg-zinc-300 rounded-full mx-auto -mt-1 mb-2 shrink-0 cursor-pointer lg:hidden" 
            onClick={handleClose} 
          />

          <div className="max-w-5xl mx-auto w-full space-y-3.5 min-w-0">
            
            {/* Cabeçalho */}
            <div className="flex items-center justify-between border-b border-zinc-200/70 pb-3 gap-2 min-w-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50/90 border border-indigo-100/80 text-indigo-600 flex items-center justify-center font-bold shadow-2xs shrink-0">
                  <FileText size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-black text-zinc-900 truncate tracking-tight">
                    {modalT('pdf_doc_badge')}
                  </h3>
                  <p className="text-xs text-zinc-500 truncate">
                    {modalT('pdf_doc_subtitle')}
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={handleClose}
                disabled={isGenerating}
                className="p-1.5 rounded-xl hover:bg-zinc-200/70 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer shrink-0 active:scale-95 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Caixa Informativa */}
            <div className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100/70 flex items-start gap-2.5 text-xs text-indigo-950 leading-relaxed">
              <Sparkles size={15} className="text-indigo-600 shrink-0 mt-0.5" />
              <span>{modalT('modal_feature_desc')}</span>
            </div>

            {/* Seletor de Idioma */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-2xl bg-zinc-100/80 border border-zinc-200/70 gap-2 min-w-0">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 min-w-0 truncate">
                <Languages size={15} className="text-indigo-600 shrink-0" />
                <span className="truncate">{modalT('modal_doc_lang')}</span>
              </div>

              <div className="flex items-center gap-1 p-0.5 rounded-xl bg-zinc-200/70 shrink-0">
                <button
                  type="button"
                  onClick={() => handleManualLanguageChange('pt')}
                  disabled={isGenerating}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                    selectedLanguage === 'pt' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  Português
                </button>
                <button
                  type="button"
                  onClick={() => handleManualLanguageChange('en')}
                  disabled={isGenerating}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                    selectedLanguage === 'en' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Alerta de Dados Pendentes */}
            {hasMissingData && (
              <div className="p-3.5 rounded-2xl bg-amber-50/95 border border-amber-200 text-xs space-y-2.5 min-w-0">
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <div className="flex items-start gap-2 font-black text-amber-950 min-w-0">
                    <AlertCircle size={17} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="truncate text-xs sm:text-sm font-bold">
                        {modalT('modal_missing_alert')} ({missingFields.length}):
                      </div>
                      <div className="text-[11px] font-normal text-amber-800">
                        {modalT('modal_missing_desc')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {missingFields.map((f, i) => (
                    <span key={f.field || i} className="px-2.5 py-1 rounded-lg bg-white border border-amber-300/80 text-[11px] font-semibold text-amber-900 shadow-2xs">
                      ✕ {f.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Pré-visualização com dados reais */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white/80 border border-zinc-200/80 text-xs space-y-2.5 text-zinc-700 leading-relaxed max-h-48 sm:max-h-56 overflow-y-auto overflow-x-hidden min-w-0 shadow-2xs">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2 gap-2 min-w-0">
                <div className="flex items-center gap-2 font-black text-zinc-900 text-sm min-w-0 flex-1">
                  <Building2 size={16} className="text-indigo-600 shrink-0" />
                  <span className="truncate">{store?.name || modalT('modal_official_store')}</span>
                </div>
                <div className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 shrink-0">
                  <CheckCircle2 size={11} className="shrink-0" />
                  <span>/{store?.slug || 'store'}</span>
                </div>
              </div>
              
              <p className="text-zinc-600 text-xs break-words">
                {store?.description || (
                  <span className="text-amber-600 font-medium italic">
                    {modalT('pdf_contact_unavailable')}
                  </span>
                )}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-zinc-600 font-medium min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Phone size={12} className={store?.whatsapp_number ? 'text-emerald-600 shrink-0' : 'text-amber-600 shrink-0'} />
                  <span className={`truncate ${!store?.whatsapp_number ? 'text-amber-600 italic' : ''}`}>
                    {store?.whatsapp_number || modalT('pdf_contact_unavailable')}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <Mail size={12} className={store?.owner_email ? 'text-indigo-600 shrink-0' : 'text-amber-600 shrink-0'} />
                  <span className={`truncate ${!store?.owner_email ? 'text-amber-600 italic' : ''}`}>
                    {store?.owner_email || modalT('pdf_contact_unavailable')}
                  </span>
                </div>
              </div>

              <div className="pt-2 text-indigo-700 font-mono font-bold text-[11px] break-all border-t border-zinc-100 flex items-start sm:items-center gap-1.5 min-w-0">
                <Globe size={13} className="shrink-0 mt-0.5 sm:mt-0" />
                <span className="break-all">{productsUrl}</span>
              </div>
            </div>

            {/* Botão de Ação: Link do Router se faltar dados */}
            <div className="pt-1">
              {hasMissingData ? (
                <Link
                  to="/admin/settings"
                  onClick={onClose}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold transition-all active:scale-95 shadow-md shadow-amber-500/20 cursor-pointer text-center no-underline"
                >
                  <Lock size={16} className="shrink-0" />
                  <span className="truncate">{modalT('modal_go_settings')}</span>
                  <ArrowUpRight size={15} className="shrink-0" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handlePrintPDF}
                  disabled={isGenerating}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold transition-all active:scale-95 shadow-md shadow-indigo-500/15 cursor-pointer disabled:opacity-80 disabled:cursor-wait"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={18} className="shrink-0 animate-spin" />
                      <span className="truncate">{modalT('modal_generating')}</span>
                    </>
                  ) : (
                    <>
                      <Printer size={16} className="shrink-0" />
                      <span className="truncate">
                        {modalT('modal_generate_btn')} ({selectedLanguage.toUpperCase()})
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
});

PresentationLetterModal.displayName = 'PresentationLetterModal';