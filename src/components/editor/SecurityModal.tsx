import { CloudUpload, AlertCircle, Loader2, X } from 'lucide-react';
import { SectionLibrary } from '../sections/main';
import { useTranslate } from '../../context/LanguageContext';
import type { Section, ModalType } from '../../types/editor';
import { memo, useMemo, useCallback } from 'react';

type TranslateFn = ReturnType<typeof useTranslate>['t'];

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

interface BlockItemProps {
  type: string;
  previewUrl?: string;
  onClick: (type: string) => void;
  t: TranslateFn;
}

type PendingLike = {
  isTemp?: boolean;
  size?: number;
  name?: string;
  url?: string;
};

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

const BlockItem = memo(
  ({ type, previewUrl, onClick, t }: BlockItemProps) => {
    return (
      <button
        type="button"
        onClick={() => onClick(type)}
        className="group relative flex flex-col rounded-[2.2rem] border border-slate-100 bg-white p-2 transition-all duration-200 active:scale-95 will-change-transform transform-gpu"
      >
        <div className="relative mb-4 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[1.7rem] border border-slate-50 bg-slate-50 pointer-events-none">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="flex h-full w-full flex-col gap-2 p-4">
              <div className="h-2 w-3/4 rounded-full bg-slate-200" />
              <div className="h-2 w-full rounded-full bg-slate-100" />
              <div className="mt-auto grid grid-cols-3 gap-1">
                <div className="h-6 rounded-lg bg-slate-200" />
                <div className="h-6 rounded-lg bg-slate-200" />
                <div className="h-6 rounded-lg bg-slate-200" />
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-blue-600 opacity-0 transition-opacity duration-200 group-hover:opacity-5" />
        </div>

        <div className="pointer-events-none px-3 pb-2 text-left">
          <span className="block text-[10px] font-black uppercase leading-tight tracking-tight text-slate-800">
            {getReadableSectionName(type, t)}
          </span>
        </div>
      </button>
    );
  },
  (prev, next) => prev.type === next.type && prev.previewUrl === next.previewUrl
);

BlockItem.displayName = 'BlockItem';

const SECTION_PREVIEWS: Record<string, string> = {
  hero_comercial:
    'https://png.pngtree.com/thumb_back/fh260/background/20241106/pngtree-a-captivating-image-of-small-planet-surrounded-by-dew-kissed-grass-image_16516199.jpg',
  galeria_grid: '',
  vitrine_produtos: '',
  contacto_mapa: '',
  estatisticas_larga: '',
  servicos_modern: '',
  hero_minimalista: '',
  tabela_precos: '',
  depoimentos_clientes: '',
  faq_acordion: '',
  rodape_simples: '',
  texto_narrativo:'https://png.pngtree.com/thumb_back/fh260/background/20241106/pngtree-a-captivating-image-of-small-planet-surrounded-by-dew-kissed-grass-image_16516199.jpg',
  texto_imagem_showcase:'https://png.pngtree.com/thumb_back/fh260/background/20241106/pngtree-a-captivating-image-of-small-planet-surrounded-by-dew-kissed-grass-image_16516199.jpg',
};

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

  const handleAddSection = useCallback(
    (selectedType: string) => {
      const newId = crypto.randomUUID();

      const newSection: Section = {
        id: newId,
        type: selectedType as any,
        content: {},
        style: {
          cols: '1',
          theme: 'light',
          align: 'left',
          fontSize: 'base',
        },
      } as Section;

      setSections((prev) => [...prev, newSection]);
      setEditingId(newId);
      setShowAddModal(false);
    },
    [setSections, setEditingId, setShowAddModal]
  );

  return (
    <>
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
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl p-4 text-[12px] font-black uppercase tracking-widest transition-all ${
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
                  className={`w-full rounded-2xl p-4 text-[12px] font-black uppercase tracking-widest transition-all ${
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
                className={`mt-2 w-full rounded-2xl p-4 text-[12px] font-black uppercase tracking-widest transition-all ${
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

      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-slate-900/40 animate-in fade-in duration-200 md:items-center">
          <div className="absolute inset-0" onClick={() => setShowAddModal(false)} />

          <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[2.5rem] bg-white shadow-2xl animate-in slide-in-from-bottom-6 duration-300 md:rounded-[3rem]">
            <div className="flex shrink-0 items-start justify-between bg-white px-8 pt-8 pb-4">
              <div>
                <h3 className="leading-none font-black text-3xl uppercase tracking-tighter italic text-slate-900">
                  {t('modal_library_title')}
                </h3>
                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                  {t('modal_library_subtitle')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-full bg-slate-50 p-2 text-slate-400 transition-colors hover:bg-slate-100"
              >
                <X size={24} />
              </button>
            </div>

            <div
              className="custom-scrollbar grid flex-1 grid-cols-2 gap-4 overflow-y-auto bg-white p-6 md:grid-cols-3 md:p-8"
              style={{ contain: 'content', contentVisibility: 'auto' } as React.CSSProperties}
            >
              {(Object.keys(SectionLibrary) as Array<keyof typeof SectionLibrary>).map(
                (type) => (
                  <BlockItem
                    key={type}
                    type={type}
                    previewUrl={SECTION_PREVIEWS[type]}
                    t={t}
                    onClick={handleAddSection}
                  />
                )
              )}
            </div>

            <div className="h-8 shrink-0 bg-white md:hidden" />
          </div>
        </div>
      )}
    </>
  );
}