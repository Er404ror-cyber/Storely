import React, { useRef, useCallback, memo } from 'react';
import { Camera, CloudLightning, Settings } from 'lucide-react';
import type { MediaContent } from './types';
import { deleteFromCloudinary, handleFileUpload } from '../sections/helpers';

interface AdminControlsProps {
  isEditable: boolean;
  isMounted: boolean;
  content: { phone?: string; media?: { size?: number; delete_token?: string } };
  isCenter?: boolean;
  isDark?: boolean;
  t: (key: any, variables?: any) => string;
  onUpdate?: (field: string, value: string | number | null | MediaContent) => void;
  handleSync: () => void;
  isSyncing: boolean;
  mediaSizeMB: number;
  currentLimit: number;
  isOverLimit: boolean;
  isTemp: boolean;
  mediaType: 'image' | 'video';
}

export const AdminControls = memo(({ isEditable, isMounted, content, isCenter, isDark, t, onUpdate, handleSync, isSyncing, mediaSizeMB, currentLimit, isOverLimit, isTemp, mediaType }: AdminControlsProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePickFile = useCallback(() => fileInputRef.current?.click(), []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (content.media?.delete_token) {
      deleteFromCloudinary({ delete_token: content.media.delete_token }).catch(console.error);
    }

    handleFileUpload(file, (newMedia) => {
      const normalizedMedia: MediaContent = { ...newMedia, size: newMedia.size ?? 0, isTemp: true };
      onUpdate?.('media', normalizedMedia);
    });

    e.target.value = '';
  }, [onUpdate, content.media]);

  const hasPhone = !!(content.phone && content.phone.replace(/\D/g, '').length > 0);

  if (!isEditable || !isMounted) return null;

  return (
    <div className={`mt-5 w-full max-w-[270px] rounded-xl border p-3 flex flex-col gap-3 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'} ${isCenter ? 'mx-auto' : 'mr-auto'}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-black uppercase tracking-wide text-slate-400">{t('mediaSettings')}</span>
        <span className={`text-[9px] font-black px-2 py-1 rounded-full ${hasPhone ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
          {hasPhone ? t('whatsappActive') : t('numberMissing')}
        </span>
      </div>

      {!hasPhone && (
        <div className="rounded-lg border-amber-200 bg-amber-50 px-3 py-2">
          <div className="flex items-center gap-2 mb-1">
            <Settings size={14} className="text-amber-600 shrink-0" />
            <span className="text-[10px] font-black text-amber-700">{t('addNumberHint')}</span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handlePickFile}
        className={`h-11 rounded-lg font-black text-[10px] uppercase transition-colors flex items-center justify-center gap-2 ${isOverLimit ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-blue-600 text-white'}`}
      >
        <Camera size={14} />
        {isOverLimit ? t('tryAnother') : t('changeMedia')}
      </button>

      <input ref={fileInputRef} type="file" className="hidden" accept="image/*,video/*" onChange={handleFileChange} />

      {!!content.media?.size && (
        <div className="rounded-lg border border-slate-200 px-3 py-2 flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold text-slate-500">{t('weight')}</span>
          <span className={`text-[10px] font-black ${isOverLimit ? 'text-red-600' : 'text-emerald-600'}`}>{mediaSizeMB.toFixed(2)} MB / {currentLimit} MB</span>
        </div>
      )}

      {isOverLimit && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 flex flex-col gap-2">
          <p className="text-[10px] font-bold text-red-600 leading-tight">{t('limitExceeded')}</p>
          <a href={mediaType === 'video' ? 'https://www.freeconvert.com/video-compressor' : 'https://tinypng.com/'} target="_blank" rel="noreferrer" className="h-9 rounded-lg bg-white border border-red-200 text-red-600 text-[10px] font-black flex items-center justify-center no-underline">
            {t('compressNow')}
          </a>
        </div>
      )}

      {isTemp && !isOverLimit && (
        <button type="button" onClick={handleSync} disabled={isSyncing} className="h-11 rounded-lg bg-emerald-500 text-white font-black text-[10px] uppercase flex items-center justify-center gap-2 disabled:opacity-60">
          {isSyncing ? t('syncing') : <><CloudLightning size={14} />{t('syncNow')}</>}
        </button>
      )}
    </div>
  );
});

AdminControls.displayName = 'AdminControls';