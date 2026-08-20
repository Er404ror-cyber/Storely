import { memo, useCallback, useState } from 'react';
import { 
  AlertCircle, 
  AlertTriangle,
  CloudLightning, 
  ImageOff, 
  ImagePlus, 
  Loader2, 
  Lock, 
  PencilLine, 
  Trash2, 
  UploadCloud 
} from 'lucide-react';
import { formatBytes, PRODUCT_IMAGE_SLOTS } from '../productForm.utils';
import { IMAGE_COMPRESS_URL } from './ProductForm.types';
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
  hasOrphanBlobs: boolean; 
  onImageError: (index: number) => void;
}

export const ProductImageGallery = memo(function ProductImageGallery({
  slots,
  visibleCount,
  onAddMore,
  onFileSelect,
  onRemovePhoto,
  onSyncPhotos,
  isSyncingPhotos,
  hasPendingUploads,
  onImageError, 
  hasOrphanBlobs,
}: ProductImageGalleryProps) {
  const { t } = useTranslate();
  
  const [corruptedSlots, setCorruptedSlots] = useState<Record<number, boolean>>({});

  const hasCover = Boolean(slots[0]?.preview && !corruptedSlots[0]);
  const canAddMore = hasCover && visibleCount < PRODUCT_IMAGE_SLOTS;
  const hasLargeError = slots.some(s => s.error === t('product_form_image_too_large'));

  const extraSlots = Array.from({ length: Math.max(0, visibleCount - 1) }, (_, i) => i + 1);

  const handleValidateAndSelect = useCallback(async (file: File | undefined, index: number) => {
    if (!file) return;

    setCorruptedSlots(prev => ({ ...prev, [index]: false }));

    if (!file.type.startsWith('image/')) {
      onFileSelect(undefined, index);
      return;
    }

    try {
      if (typeof createImageBitmap !== 'undefined') {
        const bitmap = await createImageBitmap(file);
        bitmap.close(); 
      } else {
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          const objectUrl = URL.createObjectURL(file);
          img.onload = () => { URL.revokeObjectURL(objectUrl); resolve(); };
          img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Corrupt Image')); };
          img.src = objectUrl;
        });
      }
      onFileSelect(file, index);
    } catch {
      setCorruptedSlots(prev => ({ ...prev, [index]: true }));
      onFileSelect(undefined, index);
    }
  }, [onFileSelect]);

  const handleRemove = useCallback((index: number) => {
    setCorruptedSlots(prev => ({ ...prev, [index]: false }));
    onRemovePhoto(index);
  }, [onRemovePhoto]);

  const renderSlotCard = useCallback((index: number, isCover: boolean) => {
    const slot = slots[index] || {};
    const { preview = '', isProcessing = false, error = '', file = null, size } = slot;
    const isCorrupted = Boolean(corruptedSlots[index]);
    
    // ANÁLISE INFALÍVEL: Identifica local vs nuvem (blob e base64)
    const isLocalBlob = preview.startsWith('blob:') || preview.startsWith('data:');
    const isPendingSync = file !== null;
    
    // É Órfã/Lixo se for local mas NÃO tiver ficheiro na RAM (veio da DB corrompida)
    const isOrphanBlob = isLocalBlob && !isPendingSync;
    
    const hasError = Boolean(error) || isOrphanBlob || isCorrupted;
    const isWarning = isLocalBlob && !hasError;
    const isLocked = !isCover && !hasCover;

    return (
      <div key={index} className="flex flex-col gap-1 w-full">
        <div
          className={`relative aspect-square w-full overflow-hidden rounded-2xl border transition-all ${
            isLocked
              ? 'border-slate-200/80 bg-slate-100/70 opacity-60 cursor-not-allowed select-none'
              : hasError
              ? 'border-red-400 bg-red-50/80 ring-2 ring-red-400/20'
              : preview
              ? isWarning
                ? 'border-amber-400 bg-amber-50/80 ring-2 ring-amber-400/20'
                : isCover
                ? 'border-blue-400 bg-slate-50 ring-2 ring-blue-400/20 shadow-sm'
                : 'border-slate-200 bg-slate-50 shadow-sm hover:border-slate-300'
              : 'border-dashed border-slate-300 bg-slate-50/80 hover:border-blue-400 hover:bg-slate-100/80'
          }`}
        >
          {(isCorrupted || isOrphanBlob) ? (
            /* AVISO DE ERRO (Textos compactos para mobile) */
            <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-red-50/95 z-20">
              <div className="rounded-full bg-red-100 p-1.5 text-red-600 mb-0.5 shadow-sm">
                <ImageOff size={14} />
              </div>
              <span className="text-[9px] font-black text-red-700 leading-tight uppercase">
                {t('product_form_image_corrupt', { defaultValue: 'Foto Inválida' })}
              </span>
              <span className="text-[7px] sm:text-[8px] text-red-600 mt-0.5 max-w-[95%] leading-snug font-bold border border-red-200/50 bg-red-100/50 px-1 py-0.5 rounded">
                {t('product_form_image_corrupt_hint', { defaultValue: 'Invisível p/ clientes. Substitua.' })}
              </span>
              
              <div className="flex items-center gap-1 mt-1.5">
                <label className="cursor-pointer rounded bg-white border border-red-200 px-1.5 py-1 text-[8px] sm:text-[9px] font-bold text-slate-700 shadow-sm hover:bg-slate-50">
                  {t('product_form_replace', { defaultValue: 'Trocar' })}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleValidateAndSelect(e.target.files?.[0], index)}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="rounded bg-red-600 px-1.5 py-1 text-[8px] sm:text-[9px] font-bold text-white shadow-sm hover:bg-red-700"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            </div>
          ) : preview || isProcessing ? (
            <>
              {preview && (
                <img
                  src={preview}
                  alt=""
                  onError={() => {
                    setCorruptedSlots(prev => ({ ...prev, [index]: true }));
                    onImageError(index); 
                  }}
                  className={`h-full w-full object-cover transition-opacity duration-300 ${
                    isProcessing ? 'opacity-30' : 'opacity-100'
                  }`}
                />
              )}

              {/* MARCADOR DE ILUSÃO COMPACTO */}
              {isLocalBlob && !isProcessing && !isOrphanBlob && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 z-10 pointer-events-none">
                  <div className="bg-amber-500 text-white text-[8px] sm:text-[9px] font-black uppercase px-1.5 py-1 rounded shadow-md text-center flex flex-col items-center gap-0 border border-amber-400">
                    <span>⚠️ {t('product_form_image_local_only', { defaultValue: 'Local' })}</span>
                    <span className="text-[6px] sm:text-[7px] font-bold opacity-90">
                      {t('product_form_image_not_saved', { defaultValue: 'Não salvo' })}
                    </span>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-slate-950/40 z-20">
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                  <span className="text-[8px] sm:text-[9px] font-black text-white uppercase tracking-wider">
                    {t('uploading', { defaultValue: 'Enviando...' })}
                  </span>
                </div>
              )}

              <div className="absolute inset-x-1.5 top-1.5 flex items-start justify-between gap-1 pointer-events-none z-20">
                <div className={`rounded-lg px-1.5 py-0.5 text-[8px] sm:text-[9px] font-black text-white truncate min-w-0 shadow-sm ${
                  isCover ? 'bg-blue-600' : 'bg-slate-950/85'
                }`}>
                  {isCover ? t('product_form_cover', { defaultValue: 'Capa' }) : t('product_form_extra_image_label', { number: index })}
                </div>

                <div className="flex gap-1 shrink-0 pointer-events-auto">
                  <label
                    className={`cursor-pointer rounded-lg bg-white/95 p-1 text-slate-700 shadow-sm hover:scale-105 transition-transform ${
                      isProcessing ? 'pointer-events-none opacity-50' : ''
                    }`}
                  >
                    <PencilLine size={12} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleValidateAndSelect(e.target.files?.[0], index)}
                      disabled={isProcessing}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    disabled={isProcessing}
                    className="rounded-lg bg-white/95 p-1 text-red-500 shadow-sm hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div className="absolute bottom-1.5 flex w-full items-center justify-between px-1.5 pointer-events-none z-20">
                {!!size && (
                  <div className="rounded border border-slate-700/50 bg-slate-900/80 px-1 py-0.5 text-[7px] sm:text-[8px] font-bold text-white shadow-sm">
                    {formatBytes(size)}
                  </div>
                )}
                {isLocalBlob && !isProcessing && !isOrphanBlob && (
                  <div className="rounded bg-amber-500 px-1 py-0.5 text-[6px] sm:text-[7px] font-black uppercase text-white shadow-sm ml-auto">
                    {t('editor_modal_pending_media_title', { defaultValue: 'Pendente' })}
                  </div>
                )}
              </div>
            </>
          ) : isLocked ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center pointer-events-none select-none">
              <div className="rounded-full bg-slate-200/90 p-2 text-slate-400">
                <Lock size={12} />
              </div>
              <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 leading-tight">
                {t('product_form_add_cover_first', { defaultValue: 'Adicione a capa primeiro' })}
              </span>
            </div>
          ) : (
            <label className="group flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 p-2 text-center transition">
              <div className="rounded-full bg-white p-2 shadow-sm transition group-hover:scale-110">
                <UploadCloud size={14} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-black uppercase text-slate-500 tracking-tight">
                {isCover ? t('product_form_add_cover', { defaultValue: 'Capa' }) : t('product_form_add_image', { defaultValue: 'Adicionar' })}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleValidateAndSelect(e.target.files?.[0], index)}
                disabled={isProcessing}
              />
            </label>
          )}
        </div>
      </div>
    );
  }, [slots, hasCover, corruptedSlots, handleValidateAndSelect, handleRemove, t]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 md:p-6 shadow-sm">
      
      {/* ALERTA GLOBAL OTIMIZADO PARA MOBILE */}
      {hasOrphanBlobs && (
        <div className="flex items-start gap-2 rounded-2xl bg-red-50 p-3 sm:p-4 border border-red-200 shadow-sm mb-4 sm:mb-5">
          <AlertTriangle className="shrink-0 text-red-600 mt-0.5" size={16} />
          <div>
            <strong className="text-xs font-black text-red-800 uppercase tracking-tight">
              {t('product_form_orphan_global_alert', { defaultValue: 'Ação Necessária' })}
            </strong>
            <p className="text-[10px] sm:text-xs text-red-700 mt-0.5 leading-snug">
              {t('product_form_orphan_global_alert_desc', { defaultValue: 'Fotos inválidas detetadas (invisíveis para clientes). Apague ou substitua as fotos a vermelho antes de salvar.' })}
            </p>
          </div>
        </div>
      )}

      {/* Cabeçalho */}
      <div className="mb-4 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-900">
            {t('product_form_images_title', { defaultValue: 'Galeria de Imagens' })}
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-500">
            {t('product_form_images_subtitle', { defaultValue: 'As imagens são salvas e otimizadas na nuvem.' })}
          </p>
        </div>

        {hasPendingUploads && (
          <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-2.5 py-1.5 text-[9px] sm:text-[10px] font-bold text-amber-700 border border-amber-200/60 self-start sm:self-auto shadow-sm">
            <AlertCircle size={12} className="shrink-0 text-amber-600" />
            <span>{t('product_form_pending_warning', { defaultValue: 'Fotos pendentes de envio' })}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-12 md:gap-5 mb-4 sm:mb-5">
        <div className="md:col-span-4 flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-900">
              {t('product_form_cover', { defaultValue: 'Foto de Capa' })}
            </span>
            <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold text-blue-600">
              {t('product_form_cover_required_tag', { defaultValue: 'Principal' })}
            </span>
          </div>
          <div className="w-full max-w-[220px] sm:max-w-none mx-auto sm:mx-0">
            {renderSlotCard(0, true)}
          </div>
        </div>

        <div className="md:col-span-8 flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-900">
              {t('product_form_extra_images_title', { defaultValue: 'Fotos Adicionais' })}
            </span>
            {!hasCover && (
              <span className="text-[8px] sm:text-[9px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50">
                {t('product_form_cover_needed_hint', { defaultValue: 'Defina a capa' })}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-3">
            {extraSlots.map((index) => renderSlotCard(index, false))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-slate-100">
        {canAddMore ? (
          <button
            type="button"
            onClick={onAddMore}
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-700 hover:bg-slate-100 transition-colors w-full sm:w-auto"
          >
            <ImagePlus size={14} className="text-slate-400" /> {t('product_form_add_more_images', { defaultValue: 'Adicionar Fotos' })}
          </button>
        ) : (
          <div className="hidden sm:block" />
        )}

        {hasPendingUploads && (
          <button
            type="button"
            onClick={onSyncPhotos}
            disabled={isSyncingPhotos}
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-blue-600 px-4 py-2.5 text-[10px] sm:text-[11px] font-black uppercase text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition-colors w-full sm:w-auto"
          >
            {isSyncingPhotos ? (
              <>
                <Loader2 size={14} className="animate-spin" /> {t('cacheStatusSyncing', { defaultValue: 'A sincronizar...' })}
              </>
            ) : (
              <>
                <CloudLightning size={14} /> {t('gallery_btn_sync', { defaultValue: 'Sincronizar' })}
              </>
            )}
          </button>
        )}
      </div>

      {hasLargeError && (
        <div className="mt-3">
          <a
            href={IMAGE_COMPRESS_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-[10px] sm:text-xs font-bold text-amber-700 hover:bg-amber-100 transition-colors"
          >
            {t('product_form_compress_image_link', { defaultValue: 'Comprimir imagem online' })}
          </a>
        </div>
      )}
    </section>
  );
});