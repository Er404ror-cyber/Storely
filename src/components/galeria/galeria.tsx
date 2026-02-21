import React from 'react';
import type { ChangeEvent } from 'react';
import { 
  Camera, X, Trash2, RefreshCcw, ShieldAlert, 
  Database, ChevronLeft, ChevronRight, 
  Tag, CloudUpload 
} from 'lucide-react';
import { 
  editableProps, getFontSize, 
} from '../sections/helpers';
import type { GalleryHeaderProps, MediaItem} from '../sections/main';
import { MediaRenderer } from '../sections/mediarender';

// Constantes Locais
const PHOTO_LIMIT = 1 * 1024 * 1024;
const VIDEO_LIMIT = 10 * 1024 * 1024;
const COMPRESS_PHOTO = "https://www.iloveimg.com/compress-image";
const COMPRESS_VIDEO = "https://videocompress.ai/";

// --- 1. Dashboard de Armazenamento ---
export interface StorageDashboardProps {
  stats: {
    totalWeightMB: number;
    isOverTotalLimit: boolean;
    hasPendingUploads: boolean;
    isAtLimit: boolean;
    hasIndividualErrors: boolean;
  };
  isSyncing: boolean;
  onSync: () => void;
  onUploadTrigger: () => void;
  t: (key: string) => string;
}

export const StorageDashboard: React.FC<StorageDashboardProps> = ({ 
  stats, isSyncing, onSync, onUploadTrigger, t 
}) => {
  const { totalWeightMB, isOverTotalLimit, hasPendingUploads, isAtLimit, hasIndividualErrors } = stats;
  
  const isSyncBlocked = isOverTotalLimit || hasIndividualErrors;

  return (
    <div className="mb-6 space-y-2">
      <div
        className={`p-3 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row 
          sm:items-center sm:justify-between gap-3 sm:gap-4
          ${
            hasPendingUploads
              ? 'bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-900/30'
              : 'bg-zinc-100/80 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800'
          }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6">

          {/* Storage */}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-1">
              <Database size={10} /> {t('gallery_storage')}
            </span>

            <span
              className={`text-sm font-black transition-colors ${
                isOverTotalLimit
                  ? 'text-red-600 dark:text-red-50'
                  : 'text-zinc-900 dark:text-blue-400'
              }`}
            >
              {totalWeightMB.toFixed(1)}
              <span className="text-[10px] ml-1 text-zinc-400">/ 15 MB</span>
            </span>
          </div>

          {/* Sync Status */}
          {hasPendingUploads && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 lg:gap-3 px-3 py-2.5 bg-white dark:bg-zinc-950 rounded-xl border border-blue-200 shadow-sm">
        
            <div className="flex flex-col leading-tight">
              <span className="text-[9px] sm:text-[9px] font-black text-blue-600 uppercase">
                {isSyncBlocked ? t('gallery_action_blocked') : t('gallery_action_required')}
              </span>
          
              <span className="text-[11px] sm:text-[11px] text-gray-400 font-bold">
                {isOverTotalLimit 
                  ? t('gallery_error_total_limit') 
                  : hasIndividualErrors 
                    ? t('gallery_error_individual') 
                    : t('gallery_pending_local')}
              </span>
            </div>
          
            <button
              onClick={onSync}
              disabled={isSyncing || isSyncBlocked}
              className={`w-full sm:w-auto mt-1 sm:mt-0 px-4 py-2.5 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all 
                ${isSyncBlocked 
                  ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed grayscale' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                }`}
            >
              {isSyncing 
                ? <RefreshCcw size={12} className="animate-spin" /> 
                : <CloudUpload size={12} />}
                
              {isSyncBlocked ? t('gallery_btn_blocked') : t('gallery_btn_sync')}
            </button>
          
          </div>
          
          )}
        </div>

        {/* Upload */}
        <button
          disabled={isAtLimit || isSyncing}
          onClick={onUploadTrigger}
          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-[10px] 
            font-black uppercase tracking-wider transition-all shadow-lg 
            flex items-center justify-center gap-2
            ${
              isAtLimit
                ? 'bg-zinc-200 text-zinc-400 dark:bg-zinc-800 cursor-not-allowed'
                : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 active:scale-95'
            }`}
        >
          {isAtLimit ? <X size={14} /> : '+'}
          {isAtLimit ? t('gallery_limit_reached') : t('gallery_add')}
        </button>
      </div>

      {/* Mensagem de alerta condicional baseada no tipo de erro */}
      {hasPendingUploads && (
        <div
          className={`flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2
            w-full rounded-lg border px-3 py-2 text-[11px] font-medium
            ${isSyncBlocked
              ? 'border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-400'
              : 'border-blue-500/30 bg-blue-500/5 text-blue-700 dark:text-blue-400'}
          `}
        >
          {/* Mensagem */}
          <div className="flex items-center gap-2">
            <ShieldAlert size={14} className="shrink-0 opacity-80" />

            <span className="leading-snug">
              {hasIndividualErrors
                ? t('gallery_msg_error')
                : t('gallery_msg_ready')}
            </span>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2 pl-6 xl:pl-0">
            <a
              href="https://www.iloveimg.com/compress-image"
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-current/30 px-2 py-1 text-[10px]
                hover:bg-black/5 dark:hover:bg-white/10 transition"
            >
              {t('gallery_compress_images')}
            </a>

            <a
              href="https://www.freeconvert.com/video-compressor"
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-current/30 px-2 py-1 text-[10px]
                hover:bg-black/5 dark:hover:bg-white/10 transition"
            >
              {t('gallery_compress_videos')}
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 2. Cabeçalho da Galeria ---
export const GalleryHeader = <K extends string,>({ 
  content, 
  style, 
  isEditable, 
  onUpdate, 
  t 
}: GalleryHeaderProps<K>) => (
  <header className={`mb-6 flex flex-col gap-0.5 ${style.align === 'center' ? 'items-center text-center' : 'items-start text-left'}`}>
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 mb-2">
      <Tag size={12} />
      <span 
        {...editableProps(isEditable, (v) => onUpdate?.('category', v))} 
        className="text-[9px] font-black uppercase tracking-[0.2em]"
      >
        {(content.category as string) || t('gallery_default_category' as K)}
      </span>
    </div>

    <h1 
      {...editableProps(isEditable, (v) => onUpdate?.('title', v))}
      className={`font-black uppercase tracking-tight leading-none ${getFontSize(style.fontSize, 'h2')}`}
    >
      {(content.title as string) || t('gallery_default_title' as K)}
    </h1>

    <p 
      {...editableProps(isEditable, (v) => onUpdate?.('description', v))}
      className="opacity-40 dark:opacity-50 text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold"
    >
      {(content.description as string) || t('gallery_default_desc' as K)}
    </p>
  </header>
);

// --- 3. Estado Vazio (Blueprint) ---
export interface EmptyStateProps {
  isEditable: boolean;
  onUploadTrigger: () => void;
  t: (key: string) => string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ isEditable, onUploadTrigger, t }) => (
  <div className="relative py-14 md:py-20 mt-4 flex flex-col items-center overflow-hidden">
    <div className="absolute inset-0 flex items-center justify-center opacity-20 dark:opacity-10 pointer-events-none">
      <div className="grid grid-cols-3 gap-4 w-full max-w-2xl px-6">
        <div className="aspect-[4/3] border border-current rounded-2xl flex items-center justify-center">
          <Camera size={24} className="opacity-20" />
        </div>
        <div className="aspect-[4/3] border border-current rounded-2xl border-dashed" />
        <div className="aspect-[4/3] border border-current rounded-2xl" />
      </div>
    </div>

    <div className="relative z-10 text-center flex flex-col items-center gap-8">
      <div className="space-y-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
          {t('gallery_tutorial_subtitle')}
        </h3>
        <p className="text-sm md:text-base font-bold max-w-[280px] md:max-w-md mx-auto leading-snug">
          {t('gallery_tutorial_title')}
        </p>
      </div>

      <div className="flex items-center gap-6 md:gap-8 py-3 px-6 md:px-10 rounded-2xl md:rounded-full border border-current/10 ">
        <div className="flex flex-col items-center">
          <span className="text-[8px] font-black opacity-40 uppercase tracking-tighter">{t('gallery_limit_label')}</span>
          <span className="text-[10px] font-bold">10 {t('gallery_items')}</span>
        </div>
        <div className="w-px h-6 bg-current opacity-10" />
        <div className="flex flex-col items-center">
          <span className="text-[8px] font-black opacity-40 uppercase tracking-tighter">{t('gallery_type_photos')}</span>
          <span className="text-[10px] font-bold">{t('gallery_max_1mb')}</span>
        </div>
        <div className="w-px h-6 bg-current opacity-10" />
        <div className="flex flex-col items-center">
          <span className="text-[8px] font-black opacity-40 uppercase tracking-tighter">{t('gallery_type_videos')}</span>
          <span className="text-[10px] font-bold">{t('gallery_max_10mb')}</span>
        </div>
      </div>

      {isEditable && (
        <button 
          onClick={onUploadTrigger}
          className="group flex items-center gap-3 px-8 py-3.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] hover:scale-[1.02] active:scale-95 transition-all shadow-sm shadow-zinc-200/50 dark:shadow-none"
        >
          <CloudUpload size={14} className="group-hover:-translate-y-1 transition-transform" />
          {t('gallery_add')}
        </button>
      )}
    </div>
  </div>
);

// --- 4. Item da Grid ---
export interface GridItemProps {
  item: MediaItem;
  index: number;
  totalItems: number;
  isEditable: boolean;
  cols: string;
  onPreview: (item: MediaItem) => void;
  onRemove: (index: number) => void;
  onUpload: (e: ChangeEvent<HTMLInputElement>, index: number) => void;
  onMove: (from: number, to: number) => void;
  onDragStart: (index: number) => void;
  onDrop: (index: number) => void;
  t: (key: string) => string;
}

export const GridItem: React.FC<GridItemProps> = ({ 
  item, index, totalItems, isEditable, cols, 
  onPreview, onRemove, onUpload, onMove, onDragStart, onDrop, t 
}) => {
  const itemMB = (item.size || 0) / (1024 * 1024);
  const limit = item.type === 'video' ? VIDEO_LIMIT : PHOTO_LIMIT;
  const isTooLarge = (item.size || 0) > limit;

  const getItemClass = (): string => {
    if (cols === '1') return index === 0 ? 'col-span-4 md:row-span-3 md:col-span-5 aspect-[16/9]' : 'col-span-2 md:col-span-1 aspect-[4/3] md:aspect-[9/8]';
    if (cols === '2') return index === 0 ? 'col-span-3 row-span-3 aspect-[4/3]' : 'col-span-1 aspect-[4/3]';
    return 'break-inside-avoid mb-2';
  };

  return (
    <div
      draggable={isEditable}
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop(index)}
      className={`relative rounded-xl overflow-hidden group dark:border dark:border-zinc-800/50 ${getItemClass()}
        ${isTooLarge && isEditable ? 'ring-2 ring-red-500 ring-offset-1' : 'bg-zinc-100 dark:bg-zinc-900'}
      `}
    >
      <div className="w-full h-full cursor-pointer" onClick={() => onPreview(item)}>
        <MediaRenderer
          media={{ url: item.url, type: item.type }}
          className="w-full h-full object-cover"
        />
      </div>

      {item.isTemp && isEditable && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-blue-500/5">
          <div className="bg-blue-600 text-white text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
            {t('gallery_new_badge')}
          </div>
        </div>
      )}

      {isEditable && (
        <>
          <div
            className={`absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] font-black z-30 border border-white/10
            ${isTooLarge ? 'bg-red-600 text-white' : 'bg-black/50 text-white/90'}`}
          >
            {item.size ? `${itemMB.toFixed(1)} MB` : t('gallery_scanning')}
          </div>

          {isTooLarge && (
            <a
              href={item.type === 'video' ? COMPRESS_VIDEO : COMPRESS_PHOTO}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(ev) => ev.stopPropagation()}
              className="absolute inset-x-2 bottom-2 bg-red-600 text-white text-[8px] font-black text-center py-3 rounded-lg flex items-center justify-center gap-1 uppercase z-[40]"
            >
              <RefreshCcw size={10} /> {t('gallery_compress')}
            </a>
          )}

          <div className="absolute inset-0 bg-black/10 dark:bg-black/30 md:opacity-0 md:group-hover:opacity-100 z-20 pointer-events-none">
            <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 pointer-events-auto">
              <label className="p-1.5 bg-blue-600 text-white rounded-lg cursor-pointer shadow-md">
                <Camera size={14} />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={(ev) => onUpload(ev, index)}
                />
              </label>

              <button
                onClick={(ev) => { ev.stopPropagation(); onRemove(index); }}
                className="p-1.5 bg-white dark:bg-zinc-800 text-red-500 dark:text-red-400 rounded-lg shadow-md"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 pointer-events-auto">
              <button
                onClick={(ev) => { ev.stopPropagation(); onMove(index, index - 1); }}
                disabled={index === 0}
                className={`p-1.5 rounded-lg shadow-lg ${index === 0 ? 'bg-zinc-500/20 text-zinc-400' : 'bg-white/90 dark:bg-zinc-800 text-zinc-900 dark:text-white'}`}
              >
                <ChevronLeft size={12} />
              </button>

              <div className="bg-black/80 px-1 py-0 rounded-full">
                <span className="text-[9px] text-white font-black">{index + 1}</span>
              </div>

              <button
                onClick={(ev) => { ev.stopPropagation(); onMove(index, index + 1); }}
                disabled={index === totalItems - 1}
                className={`p-1.5 rounded-lg shadow-lg ${index === totalItems - 1 ? 'bg-zinc-500/20 text-zinc-400' : 'bg-white/90 dark:bg-zinc-800 text-zinc-900 dark:text-white'}`}
              >
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};