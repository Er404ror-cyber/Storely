import { memo } from 'react';
import { Check, Info, Loader2, X, AlertTriangle } from 'lucide-react';
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

  // É verdadeiro APENAS quando o sistema está ocupado a processar algo
  const isBusy = isSaving || isSyncingPhotos || isCancelling;

  // É verdadeiro se houver QUALQUER tipo de erro (para mudar a cor do botão para cinzento)
  const hasErrors = !canSave || hasOrphanBlobs || hasPendingUploads || hasAnyLocalBlob;

  const pendingItems = [];
  if (fieldErrors.name) pendingItems.push(t('product_form_pending_name', { defaultValue: 'Nome' }));
  if (fieldErrors.category) pendingItems.push(t('product_form_pending_category', { defaultValue: 'Categoria' }));
  if (fieldErrors.price) pendingItems.push(t('product_form_pending_price', { defaultValue: 'Preço' }));
  if (fieldErrors.cover) pendingItems.push(t('product_form_pending_cover', { defaultValue: 'Capa' }));
  if (fieldErrors.images) pendingItems.push(t('product_form_pending_images', { defaultValue: 'Imagens' }));
  
  if (hasOrphanBlobs && pendingItems.length === 0) {
    pendingItems.push(t('product_form_orphan_blob', { defaultValue: 'Substitua imagens inválidas (a vermelho)' }));
  } else if (hasPendingUploads && pendingItems.length === 0) {
    pendingItems.push(t('product_form_sync_before_saving', { defaultValue: 'Sincronize as fotos pendentes' }));
  }

  return (
    <div className="pointer-events-none fixed bottom-4 left-0 right-0 z-50 px-3 md:px-6">
      <div className="mx-auto w-full max-w-xl md:max-w-md xl:max-w-2xl">
        <section className={`pointer-events-auto rounded-[1.25rem] border bg-white/95 p-4 shadow-2xl transition-all ${
          hasOrphanBlobs ? 'border-red-300 ring-2 ring-red-500/20' : 'border-slate-200'
        }`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            
            {/* Lado Esquerdo: Indicadores e Mensagens de Status */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {isCancelling ? (
                  <Loader2 size={15} className="animate-spin text-red-500 shrink-0" />
                ) : isSyncingPhotos ? (
                  <Loader2 size={15} className="animate-spin text-blue-500 shrink-0" />
                ) : hasOrphanBlobs ? (
                  <AlertTriangle size={15} className="text-red-600 shrink-0" />
                ) : (
                  <Info size={15} className={hasAnyLocalBlob ? "text-amber-500 shrink-0" : "text-blue-500 shrink-0"} />
                )}
                
                <p className={`text-[11px] font-black uppercase tracking-wider ${
                  isCancelling || hasOrphanBlobs ? "text-red-600" : "text-slate-900"
                }`}>
                  {isCancelling
                    ? t('product_form_cancelling_title', { defaultValue: 'A Cancelar...' })
                    : isSyncingPhotos
                    ? t('cacheStatusSyncing', { defaultValue: 'A Sincronizar...' })
                    : hasOrphanBlobs
                    ? t('product_form_orphan_global_alert', { defaultValue: 'Ação Necessária' })
                    : hasAnyLocalBlob
                    ? t('setup_action_needed', { defaultValue: 'Ação Necessária' })
                    : pendingItems.length > 0
                    ? t('product_form_pending_title', { defaultValue: 'Pendente' })
                    : t('product_form_ready_title', { defaultValue: 'Pronto' })}
                </p>
              </div>

              <p className={`mt-1 text-xs leading-tight ${hasOrphanBlobs ? 'text-red-500 font-semibold' : 'text-slate-500'}`}>
                {isCancelling
                  ? t('product_form_cleaning_photos', { defaultValue: 'A limpar fotos enviadas da nuvem...' })
                  : isSyncingPhotos
                  ? t('cacheStatusSyncing', { defaultValue: 'A sincronizar fotos...' })
                  : hasOrphanBlobs
                  ? t('product_form_orphan_blob_prevent_save', { defaultValue: 'Não é possível guardar. Substitua as fotos danificadas (a vermelho).' })
                  : hasPendingUploads
                  ? t('gallery_pending_local', { defaultValue: 'Sincronize as novas fotos antes de salvar.' })
                  : pendingItems.length > 0
                  ? pendingItems.join(' • ')
                  : t('product_form_ready_subtitle', { defaultValue: 'Pode salvar as alterações' })}
              </p>
            </div>

            {/* Lado Direito: Ações */}
            <div className="flex shrink-0 items-center gap-2">
              
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

              {/* TRUQUE DE UX AQUI: O botão parece desativado (cinza) quando há erros, mas continua clicável (disabled={isBusy}) */}
              <button
                type="button"
                disabled={isBusy} // Bloqueia APENAS se estiver a carregar
                onClick={onSave}  // Deixa o clique passar para o ProductForm disparar o Toast
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-[11px] font-black uppercase transition-all ${
                  isSaving
                    ? 'bg-slate-800 text-white cursor-wait shadow-md'
                    : !hasErrors
                    ? 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-105 active:scale-95 shadow-md'
                    : 'bg-slate-200 text-slate-500 hover:bg-slate-300 active:scale-95' // Fica cinza para indicar erro, mas permite clicar
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