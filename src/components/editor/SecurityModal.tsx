import { CloudUpload, AlertCircle, Loader2, X } from 'lucide-react';
import { SectionLibrary } from '../sections/main';
import { useTranslate } from '../../context/LanguageContext';
import type { Section, ModalType } from '../../types/editor';
import { memo, useMemo, useCallback } from 'react';

interface ModalsProps {
  sections: Section[];
  activeModal: ModalType;
  showAddModal: boolean;
  isSaving: boolean;
  hasPendingUploads: boolean;
  setActiveModal: (modal: ModalType) => void;
  setShowAddModal: (show: boolean) => void;
  handleManualSave: () => void;
  handleDiscard: () => void;
  resetBlocker: () => void;
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  setEditingId: (id: string | null) => void;
  setShowMobileSidebar: (show: boolean) => void;
}

// BlockItem otimizado com memo e comparador estrito
const BlockItem = memo(({ type, previewUrl, onClick, t }: any) => {
  return (
    <button 
      onClick={() => onClick(type)} 
      className="group relative flex flex-col p-2 bg-white rounded-[2.2rem] border border-slate-100 transition-all duration-200 active:scale-95 will-change-transform transform-gpu"
    >
      <div className="aspect-[4/3] w-full bg-slate-50 rounded-[1.7rem] mb-4 overflow-hidden flex items-center justify-center relative border border-slate-50 pointer-events-none">
        {previewUrl ? (
          <img 
            src={previewUrl} 
            alt="" 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full p-4 flex flex-col gap-2">
            <div className="h-2 w-3/4 bg-slate-200 rounded-full" />
            <div className="h-2 w-full bg-slate-100 rounded-full" />
            <div className="mt-auto grid grid-cols-3 gap-1">
              <div className="h-6 bg-slate-200 rounded-lg" />
              <div className="h-6 bg-slate-200 rounded-lg" />
              <div className="h-6 bg-slate-200 rounded-lg" />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-200" />
      </div>

      <div className="px-3 pb-2 text-left pointer-events-none">
        <span className="text-[10px] font-black uppercase tracking-tight text-slate-800 block leading-tight">
          {t(`section_${type}`) || type.replace(/([A-Z])/g, ' $1').trim()}
        </span>
      </div>
    </button>
  );
}, (prev, next) => prev.type === next.type && prev.previewUrl === next.previewUrl);

BlockItem.displayName = 'BlockItem';

const SECTION_PREVIEWS: Record<string, string> = {
  hero_comercial: "https://png.pngtree.com/thumb_back/fh260/background/20241106/pngtree-a-captivating-image-of-small-planet-surrounded-by-dew-kissed-grass-image_16516199.jpg", 
  galeria_grid: "",
  vitrine_produtos: "",
  contacto_mapa: "",
  estatisticas_larga: "",
  servicos_modern: "",
  hero_minimalista: "",
  tabela_precos: "",
  depoimentos_clientes: "",
  faq_acordion: "",
  rodape_simples: ""
};

export function EditorModals({
  sections, activeModal, showAddModal, isSaving, hasPendingUploads,
  setActiveModal, setShowAddModal, handleManualSave, handleDiscard, resetBlocker,
  setSections, setEditingId
}: ModalsProps) {
  const { t } = useTranslate();

  // 1. Otimização de Cálculo: Filtra apenas quando as 'sections' mudam de verdade
  const pendingSections = useMemo(() => {
    return sections.filter(s => {
      const content = s.content as any;
      const mediaItems = content.images || (content.media ? [content.media] : []);
      return mediaItems.some((img: any) => img.isTemp);
    });
  }, [sections]);

  const hasPending = pendingSections.length > 0;

  // 2. Otimização de Funções: Impede que o BlockItem re-renderize por causa de nova referência de função
  const handleAddSection = useCallback((selectedType: string) => {
    const newId = crypto.randomUUID();
    
    // Criamos o objeto explicitamente como Section para o TS não reclamar
    const newSection: Section = { 
      id: newId, 
      type: selectedType as any, // 'any' aqui se o seu tipo Section.type for um Enum específico
      content: {}, 
      style: { 
        cols: '1', 
        theme: 'light', 
        align: 'left', 
        fontSize: 'base' 
      } 
    } as Section; // <--- O segredo está aqui

    setSections(prev => [...prev, newSection]);
    setEditingId(newId);
    setShowAddModal(false);
  }, [setSections, setEditingId, setShowAddModal]);

  return (
    <>
      {/* MODAL DE SEGURANÇA */}
      {activeModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl text-center border border-white/20">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
              hasPending ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-blue-50 text-blue-600'
            }`}>
              {hasPending ? <CloudUpload size={32} /> : <AlertCircle size={32} />}
            </div>

            <h3 className="text-xl font-black mb-2 uppercase tracking-tight italic">
              {hasPending ? "Sincronização Necessária" : activeModal === 'SAVE' ? t('editor_modal_save_title') : t('editor_modal_pending_changes_title')}
            </h3>

            {hasPending ? (
              <div className="mb-6 px-2">
                <p className="text-slate-500 text-[11px] mb-4 leading-relaxed">
                  {t('editor_modal_sync_warning')}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {pendingSections.map((s, idx) => (
                    <span key={idx} className="px-3 py-1 bg-amber-50 text-amber-700 text-[9px] font-black rounded-full border border-amber-100 uppercase italic">
                      {s.type.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-[11px] mb-8 px-4 leading-relaxed">
                {activeModal === 'SAVE' ? t('editor_modal_save_desc') : t('editor_modal_nav_changes_desc')}
              </p>
            )}

            <div className="flex flex-col gap-2">
              {(activeModal === 'SAVE' || activeModal === 'NAVIGATION') && (
                <button 
                  onClick={handleManualSave} 
                  disabled={hasPending || isSaving}
                  className={`w-full p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    (hasPending || isSaving) ? 'bg-slate-100 text-slate-300 cursor-not-allowed opacity-80' : 'bg-blue-600 text-white shadow-lg shadow-blue-100 hover:scale-[1.02] active:scale-95'
                  }`}
                >
                  {isSaving && <Loader2 className="animate-spin" size={14} />}
                  {isSaving ? 'A Processar...' : t('editor_modal_btn_save')}
                </button>
              )}

              {(activeModal === 'DISCARD' || activeModal === 'NAVIGATION') && (
                <button 
                  onClick={handleDiscard} 
                  disabled={isSaving}
                  className={`w-full p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    isSaving ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'
                  }`}
                >
                  {hasPendingUploads ? t('editor_modal_btn_discard_all') : t('editor_modal_btn_discard')}
                </button>
              )}

              <button 
                onClick={() => { setActiveModal(null); resetBlocker(); }} 
                disabled={isSaving}
                className={`w-full p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest mt-2 transition-all ${
                  isSaving ? 'text-slate-200 cursor-not-allowed' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
              >
                {t('editor_modal_btn_continue')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-slate-900/40 animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setShowAddModal(false)} />

          <div className="relative bg-white w-full max-w-2xl md:rounded-[3rem] rounded-t-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
            <div className="px-8 pt-8 pb-4 flex justify-between items-start bg-white shrink-0">
              <div>
                <h3 className="font-black text-3xl uppercase tracking-tighter text-slate-900 italic leading-none">
                  {t('modal_library_title')}
                </h3>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-2">
                  {t('modal_library_subtitle')}
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* 3. Otimização de Layout: isola o conteúdo para evitar recalculação de layout global */}
            <div 
              className="flex-1 overflow-y-auto p-6 md:p-8 grid grid-cols-2 lg:grid-cols-3 gap-4 bg-white custom-scrollbar"
              style={{ 
                contain: 'content', 
                contentVisibility: 'auto' 
              } as any}
            >
              {(Object.keys(SectionLibrary) as Array<keyof typeof SectionLibrary>).map((type) => (
                <BlockItem 
                  key={type} 
                  type={type} 
                  previewUrl={SECTION_PREVIEWS[type]} 
                  t={t}
                  onClick={handleAddSection} 
                />
              ))}
            </div>

            <div className="h-8 bg-white shrink-0 md:hidden" />
          </div>
        </div>
      )}
    </>
  );
}