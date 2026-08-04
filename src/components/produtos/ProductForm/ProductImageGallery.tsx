import { memo } from 'react';
import { CloudLightning, ImagePlus, Loader2, PencilLine, Trash2, UploadCloud } from 'lucide-react';
import { formatBytes, PRODUCT_IMAGE_SLOTS }  from '../productForm.utils';
import {  IMAGE_COMPRESS_URL } from './ProductForm.types';
import type { SlotState } from './ProductForm.types';
import { useTranslate } from '../../../context/LanguageContext';

interface ProductImageGalleryProps {
  slots: SlotState[];
  visibleCount: number;
  onAddMore: () => void;
  onFileSelect: (file: File | undefined, index: number) => void;
  onRemovePhoto: (index: number) => void;
  onSyncPhotos: () => void;
  isSyncingPhotos: boolean;
  hasPendingUploads: boolean;
}

export const ProductImageGallery = memo(function ProductImageGallery({
  slots, visibleCount, onAddMore, onFileSelect, onRemovePhoto, onSyncPhotos, isSyncingPhotos, hasPendingUploads
}: ProductImageGalleryProps) {
  const { t } = useTranslate();
  const visibleSlots = Array.from({ length: visibleCount }, (_, i) => i);
  const canAddMore = visibleCount < PRODUCT_IMAGE_SLOTS;
  const hasLargeError = slots.some(s => s.error === t('product_form_image_too_large'));

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-5">
        <h2 className="text-base font-black uppercase tracking-wide text-slate-900">
          {t('product_form_images_title', { defaultValue: 'Galeria de Imagens' })}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 mb-4">
        {visibleSlots.map((index) => {
          const { preview, isProcessing, error, file, size } = slots[index];
          const isCover = index === 0;
          const isLocalBlob = preview.startsWith('blob:');
          const isPendingSync = file !== null;
          const isOrphanBlob = isLocalBlob && !isPendingSync; 
          const hasError = Boolean(error) || isOrphanBlob;
          const isWarning = isLocalBlob && !hasError;

          return (
            <div key={index} className="flex flex-col gap-2">
              <div className={`relative aspect-square overflow-hidden rounded-[1.25rem] border transition-all ${
                preview 
                  ? hasError ? 'border-red-400 bg-red-50 ring-2 ring-red-400/20' 
                  : isWarning ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-400/20'
                  : isCover ? 'border-blue-300 bg-slate-50' : 'border-slate-200 bg-slate-50'
                  : 'border-dashed border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-slate-100'
              }`}>
                {preview || isProcessing ? (
                  <>
                    {preview && <img src={preview} alt="" className={`h-full w-full object-cover ${isProcessing ? 'opacity-30' : 'opacity-100'}`} />}
                    {isProcessing && <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 backdrop-blur-[2px]"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>}
                    
                    {/* Contentor flex que gere os espaços e evita sobreposições no telemóvel */}
                    <div className="absolute inset-x-2 top-2 flex items-start justify-between gap-1 pointer-events-none">
                      
                      {/* Label da Imagem (com truncate para encolher se necessário) */}
                      <div className="rounded-xl bg-slate-950/85 px-2 py-1 text-[10px] font-black text-white truncate min-w-0">
                        {isCover ? t('product_form_cover') : t('product_form_extra_image_label', { number: index })}
                      </div>

                      {/* Botões de Ação (shrink-0 garante que não perdem espaço para o texto) */}
                      <div className="flex gap-1 sm:gap-2 shrink-0 pointer-events-auto">
                        <label className={`cursor-pointer rounded-lg sm:rounded-xl bg-white p-1.5 sm:p-2 text-slate-700 shadow-sm hover:scale-105 ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}>
                          <PencilLine size={14} />
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => onFileSelect(e.target.files?.[0], index)} disabled={isProcessing} />
                        </label>
                        <button type="button" onClick={() => onRemovePhoto(index)} disabled={isProcessing} className="rounded-lg sm:rounded-xl bg-white p-1.5 sm:p-2 text-red-500 shadow-sm hover:scale-105 disabled:opacity-50">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="absolute bottom-2 flex w-full items-center justify-between px-2">
                      {!!size && <div className="rounded-lg bg-slate-900/80 px-2 py-1 text-[9px] font-bold text-white backdrop-blur-md">{formatBytes(size)}</div>}
                      {isLocalBlob && !isProcessing && (
                        <div className={`rounded-xl px-1 py-1 text-[6px] sm:text-[8px] font-black uppercase text-white shadow-sm ${isOrphanBlob ? 'bg-red-500' : 'bg-amber-500'}`}>
                          {isOrphanBlob ? t('editor_modal_orphan_media', { defaultValue: 'Inválida' }) : t('editor_modal_pending_media_title', { defaultValue: 'Pendente' })}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <label className="group flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 p-3 text-center transition">
                    <div className="rounded-full bg-white p-3 shadow-sm transition group-hover:scale-110"><UploadCloud size={20} className="text-slate-400 group-hover:text-blue-500" /></div>
                    <span className="text-[11px] font-black uppercase text-slate-500">{isCover ? t('product_form_add_cover') : t('product_form_add_image')}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => onFileSelect(e.target.files?.[0], index)} disabled={isProcessing} />
                  </label>
                )}
              </div>
              {error ? <p className="text-[11px] font-semibold text-red-500">{error}</p>
                : isOrphanBlob ? <p className="text-[10px] font-bold text-red-500 leading-tight">{t('product_form_orphan_blob_desc', { defaultValue: 'Apague ou reenvie a foto.' })}</p> 
                : null}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {canAddMore ? (
          <button type="button" onClick={onAddMore} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-700 hover:bg-slate-100">
            <ImagePlus size={15} className="text-slate-400" /> {t('product_form_add_more_images')}
          </button>
        ) : <div />}

        {hasPendingUploads && (
          <button type="button" onClick={onSyncPhotos} disabled={isSyncingPhotos} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-[11px] font-black uppercase text-white shadow-md hover:bg-blue-700 disabled:opacity-50">
            {isSyncingPhotos ? <><Loader2 size={15} className="animate-spin" /> {t('cacheStatusSyncing', { defaultValue: 'A sincronizar...' })}</> : <><CloudLightning size={16} /> {t('gallery_btn_sync', { defaultValue: 'Sincronizar Fotos' })}</>}
          </button>
        )}
      </div>

      {hasLargeError && (
        <div className="mt-4"><a href={IMAGE_COMPRESS_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100">{t('product_form_compress_image_link')}</a></div>
      )}
    </section>
  );
});