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
  canSave: boolean;
  fieldErrors: Record<string, string>;
  onSave: () => void;
  onCancel?: () => void;
}

export const ProductActionBar = memo(function ProductActionBar({
  isCreating, hasAnyLocalBlob, hasPendingUploads, hasOrphanBlobs, isSyncingPhotos, isSaving, canSave, fieldErrors, onSave, onCancel
}: ProductActionBarProps) {
  const { t } = useTranslate();

  const pendingItems = [];
  if (fieldErrors.name) pendingItems.push(t('product_form_pending_name'));
  if (fieldErrors.category) pendingItems.push(t('product_form_pending_category'));
  if (fieldErrors.price) pendingItems.push(t('product_form_pending_price'));
  if (fieldErrors.cover) pendingItems.push(t('product_form_pending_cover'));
  if (fieldErrors.images) pendingItems.push(t('product_form_pending_images'));
  if (hasPendingUploads && pendingItems.length === 0) pendingItems.push(t('product_form_sync_before_saving', { defaultValue: 'Sincronize as fotos' }));
  if (hasOrphanBlobs && pendingItems.length === 0) pendingItems.push(t('product_form_orphan_blob', { defaultValue: 'Substitua imagens inválidas' }));

  return (
    <div className="pointer-events-none fixed bottom-4 left-0 right-0 z-50 px-3 md:px-6">
      <div className="mx-auto w-full max-w-xl md:max-w-md xl:max-w-2xl">
        <section className="pointer-events-auto rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Info size={14} className={hasAnyLocalBlob ? "text-amber-500" : "text-blue-500"} />
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-900">
                  {hasAnyLocalBlob ? t('setup_action_needed', { defaultValue: 'Ação Necessária' }) : pendingItems.length > 0 ? t('product_form_pending_title') : t('product_form_ready_title')}
                </p>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {isSyncingPhotos ? t('cacheStatusSyncing', { defaultValue: 'A sincronizar...' }) : hasOrphanBlobs ? t('product_form_orphan_blob_desc', { defaultValue: 'Apague imagens locais.' }) : hasPendingUploads ? t('gallery_pending_local', { defaultValue: 'Sincronize as novas fotos.' }) : pendingItems.length > 0 ? pendingItems.join(' • ') : t('product_form_ready_subtitle')}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button type="button" onClick={onCancel} className="rounded-2xl border border-slate-200 px-4 py-3 text-[11px] font-black uppercase text-slate-600 hover:bg-slate-50"><X size={14} /></button>
              <button type="button" disabled={!canSave || isSaving || isSyncingPhotos} onClick={onSave} className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-[11px] font-black uppercase transition ${canSave ? 'bg-slate-900 text-white hover:scale-105 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} {isCreating ? t('product_form_create_action') : t('product_form_save_action')}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
});