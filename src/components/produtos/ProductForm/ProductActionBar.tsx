import { memo } from 'react';
import { Check, Info, Loader2, X } from 'lucide-react';
import { useTranslate } from '../../../context/LanguageContext';

interface ProductActionBarProps {
  isCreating: boolean;
  hasAnyLocalBlob: boolean;
  hasPendingUploads: boolean;
  hasOrphanBlobs: boolean;
  isSyncingPhotos: boolean;
  isSaving: boolean;
  isCancelling?: boolean;
  canSave: boolean;
  fieldErrors: Record<string, string>;
  onSave: () => void;
  onCancel?: () => void;
}

export const ProductActionBar = memo(function ProductActionBar({
  isCreating,
  hasAnyLocalBlob,
  hasPendingUploads,
  hasOrphanBlobs,
  isSyncingPhotos,
  isSaving,
  isCancelling = false,
  canSave,
  fieldErrors,
  onSave,
  onCancel,
}: ProductActionBarProps) {
  const { t } = useTranslate();

  const isBusy = isSaving || isSyncingPhotos || isCancelling;

  const pendingItems = [];
  if (fieldErrors.name) pendingItems.push(t('product_form_pending_name'));
  if (fieldErrors.category) pendingItems.push(t('product_form_pending_category'));
  if (fieldErrors.price) pendingItems.push(t('product_form_pending_price'));
  if (fieldErrors.cover) pendingItems.push(t('product_form_pending_cover'));
  if (fieldErrors.images) pendingItems.push(t('product_form_pending_images'));
  if (hasPendingUploads && pendingItems.length === 0) {
    pendingItems.push(t('product_form_sync_before_saving', { defaultValue: 'Sincronize as fotos' }));
  }
  if (hasOrphanBlobs && pendingItems.length === 0) {
    pendingItems.push(t('product_form_orphan_blob', { defaultValue: 'Substitua imagens inválidas' }));
  }

  return (
    <div className="pointer-events-none fixed bottom-4 left-0 right-0 z-50 px-3 md:px-6">
      <div className="mx-auto w-full max-w-xl md:max-w-md xl:max-w-2xl">
        <section className="pointer-events-auto rounded-[1.25rem] border border-slate-200 bg-white/95   p-4 shadow-2xl transition-all">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            
            {/* Lado Esquerdo: Indicadores e Mensagens de Status */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {isCancelling ? (
                  <Loader2 size={15} className="animate-spin text-red-500 shrink-0" />
                ) : isSyncingPhotos ? (
                  <Loader2 size={15} className="animate-spin text-blue-500 shrink-0" />
                ) : (
                  <Info size={15} className={hasAnyLocalBlob ? "text-amber-500 shrink-0" : "text-blue-500 shrink-0"} />
                )}
                
                <p className={`text-[11px] font-black uppercase tracking-wider ${
                  isCancelling ? "text-red-600" : "text-slate-900"
                }`}>
                  {isCancelling
                    ? t('product_form_cancelling_title', { defaultValue: 'A Cancelar...' })
                    : isSyncingPhotos
                    ? t('cacheStatusSyncing', { defaultValue: 'A Sincronizar...' })
                    : hasAnyLocalBlob
                    ? t('setup_action_needed', { defaultValue: 'Ação Necessária' })
                    : pendingItems.length > 0
                    ? t('product_form_pending_title')
                    : t('product_form_ready_title')}
                </p>
              </div>

              <p className="mt-1 text-xs text-slate-500 leading-tight">
                {isCancelling
                  ? t('product_form_cleaning_photos', { defaultValue: 'A limpar fotos enviadas da nuvem...' })
                  : isSyncingPhotos
                  ? t('cacheStatusSyncing', { defaultValue: 'A sincronizar fotos...' })
                  : hasOrphanBlobs
                  ? t('product_form_orphan_blob_desc', { defaultValue: 'Apague ou reenvie as imagens inválidas.' })
                  : hasPendingUploads
                  ? t('gallery_pending_local', { defaultValue: 'Sincronize as novas fotos antes de salvar.' })
                  : pendingItems.length > 0
                  ? pendingItems.join(' • ')
                  : t('product_form_ready_subtitle')}
              </p>
            </div>

            {/* Lado Direito: Ações com Proteção Anti-Spam */}
            <div className="flex shrink-0 items-center gap-2">
              
              {/* Botão Cancelar com Loader Ativo */}
              <button
                type="button"
                disabled={isBusy}
                onClick={onCancel}
                className={`flex items-center justify-center gap-1.5 rounded-2xl border px-4 py-3 text-[11px] font-black uppercase transition-all ${
                  isCancelling
                    ? 'border-red-200 bg-red-50 text-red-600 cursor-wait shadow-sm'
                    : isBusy
                    ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 active:scale-95'
                }`}
                title={isCancelling ? t('btn_waiting', { defaultValue: 'Aguarde...' }) : t('common_cancel', { defaultValue: 'Cancelar' })}
              >
                {isCancelling ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-red-500" />
                    <span>{t('btn_waiting', { defaultValue: 'Aguarde...' })}</span>
                  </>
                ) : (
                  <>
                    <X size={14} />
                    <span className="hidden sm:inline">{t('common_cancel', { defaultValue: 'Cancelar' })}</span>
                  </>
                )}
              </button>

              {/* Botão Salvar */}
              <button
                type="button"
                disabled={!canSave || isBusy}
                onClick={onSave}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-[11px] font-black uppercase transition-all ${
                  isSaving
                    ? 'bg-slate-800 text-white cursor-wait shadow-md'
                    : canSave && !isBusy
                    ? 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-105 active:scale-95 shadow-md'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isSaving ? <Loader2 size={14} className="animate-spin text-white" /> : <Check size={14} />}
                {isCreating ? t('product_form_create_action') : t('product_form_save_action')}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
});