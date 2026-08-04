import React, { memo } from 'react';
import { Camera, Trash2, Upload } from 'lucide-react';
import { MAX_IMAGE_SIZE_MB } from '../sections/helpers';
import type { TranslateFn } from '../../types/TextTypes';

const COMPRESS_LINK = 'https://www.iloveimg.com/compress-image';

interface ImageCardProps {
  imageSrc: string;
  imageAlt: string;
  isEditable: boolean;
  isDark: boolean;
  selectedFile: File | null;
  isUploading: boolean;
  localError: string;
  overLimit: boolean;
  resolvedImage: string;
  weightText: string;
  heightClass?: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  t: TranslateFn;
  handleChooseFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleConfirmUpload: () => void;
  handleCancelPendingImage: () => void;
  handleRemoveImage: () => void;
}

export const ImageCard = memo(({
  imageSrc, imageAlt, isEditable, isDark, selectedFile, isUploading, localError,
  overLimit, resolvedImage, weightText, heightClass = 'h-[240px] md:h-[320px]',
  fileInputRef, t, handleChooseFile, handleConfirmUpload, handleCancelPendingImage, handleRemoveImage
}: ImageCardProps) => {
  
  const buttonTone = isDark ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800';
  const ghostButtonTone = isDark ? 'bg-slate-800 text-slate-100 hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200';

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-2xl transform-gpu will-change-transform">
        <img
          src={imageSrc}
          alt={imageAlt}
          className={`${heightClass} w-full object-cover bg-slate-100 dark:bg-slate-900`}
          loading="lazy"
          decoding="async" // CPU Optimization: descarrega descodificação nativa para a thread secundária
        />
      </div>

      {isEditable && (
        <div className="mt-4">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleChooseFile} />
          
          {/* FIX DE CONTRASTE: Cores aprimoradas para leitura perfeita no claro e escuro */}
          {!overLimit && (
            <div className="mt-3 rounded-2xl border border-indigo-300 bg-indigo-100 px-4 py-3 text-[14px] font-bold text-indigo-900 shadow-sm transition-colors dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-200">
              {!selectedFile ? t('imageReadyConfirmHelp') : t('imageSectionSimpleHelp')}
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-3 text-base font-black transition-transform active:scale-95 ${buttonTone}`}
            >
              <Camera size={16} />
              {resolvedImage || selectedFile ? t('changePhoto') : t('choosePhoto')}
            </button>

            {!!selectedFile && !overLimit && (
              <button
                type="button"
                onClick={handleConfirmUpload}
                disabled={isUploading}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-base font-black text-white transition-transform active:scale-95 hover:bg-emerald-500 disabled:opacity-60"
              >
                <Upload size={16} />
                {isUploading ? t('savingPhoto') : t('confirmPhoto')}
              </button>
            )}

            {(resolvedImage || selectedFile) && (
              <button
                type="button"
                onClick={selectedFile ? handleCancelPendingImage : handleRemoveImage}
                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-3 text-base font-black transition-transform active:scale-95 ${ghostButtonTone}`}
              >
                <Trash2 size={16} />
                {selectedFile ? t('cancel') : t('removePhoto')}
              </button>
            )}
          </div>

          {overLimit && (
            <a href={COMPRESS_LINK} target="_blank" rel="noreferrer" className="mt-2 inline-block w-full">
              <div className="rounded-xl border border-amber-500/40 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800 shadow-sm dark:bg-amber-950/30 dark:text-amber-300">
                <div>{t('imageTooLargeMustCompress')}</div>
                <div className="underline underline-offset-2">{t('compressPhotoLink')}</div>
              </div>
            </a>
          )}

          <div className={`mt-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
            isDark ? 'border-slate-800 bg-slate-900/80 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600'
          }`}>
            <div>{t('imageWeight')}: {weightText}</div>
            <div>{t('imageSizeLimit', { size: String(MAX_IMAGE_SIZE_MB) })}</div>
          </div>

          {!!localError && (
            <div className="mt-2 rounded-xl border border-red-500/40 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 dark:bg-red-950/30 dark:text-red-400">
              {localError}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
ImageCard.displayName = 'ImageCard';