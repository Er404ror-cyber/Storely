import { useMemo } from 'react';
import { CloudUpload, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslate } from '../../context/LanguageContext';
import type { Section, ModalType } from '../../types/editor';
import { AddSectionModal } from './AddSectionModal'; // <-- IMPORT DO NOVO FICHEIRO

type TranslateFn = ReturnType<typeof useTranslate>['t'];

export interface ModalsProps {
  sections: Section[];
  activeModal: ModalType;
  showAddModal: boolean;
  isSaving: boolean;
  hasPendingUploads: boolean;
  setActiveModal: (modal: ModalType | null) => void;
  setShowAddModal: (show: boolean) => void;
  handleManualSave: () => void;
  handleDiscard: () => void;
  resetBlocker: () => void;
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  setEditingId: (id: string | null) => void;
  setShowMobileSidebar: (show: boolean) => void;
}

type PendingLike = {
  isTemp?: boolean;
  size?: number;
  name?: string;
  url?: string;
};

// Utilitários isolados fora do render para melhor performance
function getSectionPendingItems(section: Section): PendingLike[] {
  const content = (section.content || {}) as any;
  const images = Array.isArray(content?.images) ? content.images : [];
  const media = content?.media ? [content.media] : [];
  const singleImagePending = content?.pendingImage ? [content.pendingImage] : [];
  return [...images, ...media, ...singleImagePending].filter(Boolean);
}

function sectionHasPendingUploads(section: Section) {
  return getSectionPendingItems(section).some((item) => item?.isTemp);
}

function getReadableSectionName(type: string, t: TranslateFn) {
  const key = `section_${type}` as Parameters<TranslateFn>[0];
  const translated = t(key);
  if (translated && translated !== key) return translated;
  return type.replace(/[_-]+/g, ' ').replace(/([A-Z])/g, ' $1').trim();
}

export function EditorModals({
  sections,
  activeModal,
  showAddModal,
  isSaving,
  hasPendingUploads,
  setActiveModal,
  setShowAddModal,
  handleManualSave,
  handleDiscard,
  resetBlocker,
  setSections,
  setEditingId,
}: ModalsProps) {
  const { t } = useTranslate();

  const pendingSections = useMemo(() => {
    return sections.filter(sectionHasPendingUploads);
  }, [sections]);

  const hasPending = hasPendingUploads || pendingSections.length > 0;

  const pendingSectionLabels = useMemo(() => {
    return pendingSections.map((section) => ({
      id: section.id,
      label: getReadableSectionName(String(section.type), t),
    }));
  }, [pendingSections, t]);

  return (
    <>
      {/* MODAL DE SEGURANÇA (MANTIDO NESTE FICHEIRO) */}
      {activeModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-[3rem] border border-white/20 bg-white p-8 text-center shadow-2xl">
            <div
              className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${
                hasPending
                  ? 'animate-pulse bg-amber-50 text-amber-600'
                  : 'bg-blue-50 text-blue-600'
              }`}
            >
              {hasPending ? <CloudUpload size={32} /> : <AlertCircle size={32} />}
            </div>

            <h3 className="mb-2 text-xl font-black uppercase tracking-tight italic">
              {hasPending
                ? t('editor_modal_sync_required')
                : activeModal === 'SAVE'
                  ? t('editor_modal_save_title')
                  : t('editor_modal_pending_changes_title')}
            </h3>

            {hasPending ? (
              <div className="mb-6 px-2">
                <p className="mb-4 text-[11px] leading-relaxed text-slate-500">
                  {t('editor_modal_sync_warning')}
                </p>

                {pendingSectionLabels.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                      {t('sectionsNeedSaving')}
                    </p>

                    <div className="flex flex-wrap justify-center gap-2">
                      {pendingSectionLabels.map((section) => (
                        <span
                          key={section.id}
                          className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-[9px] font-black uppercase italic text-amber-700"
                        >
                          {section.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="mb-8 px-4 text-[11px] leading-relaxed text-slate-500">
                {activeModal === 'SAVE'
                  ? t('editor_modal_save_desc')
                  : t('editor_modal_nav_changes_desc')}
              </p>
            )}

            <div className="flex flex-col gap-2">
              {(activeModal === 'SAVE' || activeModal === 'NAVIGATION') && (
                <button
                  type="button"
                  onClick={handleManualSave}
                  disabled={hasPending || isSaving}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl p-4 text-[12px] font-black uppercase tracking-widest transition-transform will-change-transform ${
                    hasPending || isSaving
                      ? 'cursor-not-allowed bg-slate-100 text-slate-300 opacity-80'
                      : 'bg-blue-600 text-white shadow-lg shadow-blue-100 hover:scale-[1.02] active:scale-95'
                  }`}
                >
                  {isSaving && <Loader2 className="animate-spin" size={14} />}
                  {isSaving ? t('processing') : t('editor_modal_btn_save')}
                </button>
              )}

              {(activeModal === 'DISCARD' || activeModal === 'NAVIGATION') && (
                <button
                  type="button"
                  onClick={handleDiscard}
                  disabled={isSaving}
                  className={`w-full rounded-2xl p-4 text-[12px] font-black uppercase tracking-widest transition-colors ${
                    isSaving
                      ? 'cursor-not-allowed bg-slate-50 text-slate-300'
                      : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'
                  }`}
                >
                  {hasPendingUploads
                    ? t('editor_modal_btn_discard_all')
                    : t('editor_modal_btn_discard')}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  resetBlocker();
                }}
                disabled={isSaving}
                className={`mt-2 w-full rounded-2xl p-4 text-[12px] font-black uppercase tracking-widest transition-colors ${
                  isSaving
                    ? 'cursor-not-allowed text-slate-200'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
              >
                {t('editor_modal_btn_continue')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ADICIONAR BLOCO (ISOLADO E IMPORTADO) */}
      <AddSectionModal 
        showAddModal={showAddModal} 
        setShowAddModal={setShowAddModal} 
        setSections={setSections} 
        setEditingId={setEditingId} 
      />
    </>
  );
}