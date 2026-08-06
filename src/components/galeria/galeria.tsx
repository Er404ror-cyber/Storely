import { memo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ChangeEvent, JSX } from 'react';
import { 
  Camera, X, Trash2, RefreshCcw, ShieldAlert, 
  Database, ChevronLeft, ChevronRight, Tag, CloudUpload,
} from 'lucide-react';
import { editableProps, getFontSize } from '../sections/helpers';
import type { GalleryHeaderProps, MediaItem } from '../sections/main';

const PHOTO_LIMIT = 1 * 1024 * 1024;
const VIDEO_LIMIT = 10 * 1024 * 1024;
const COMPRESS_PHOTO = "https://www.iloveimg.com/compress-image";
const COMPRESS_VIDEO = "https://videocompress.ai/";

// --- 1. DASHBOARD DE ARMAZENAMENTO ---
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

export const StorageDashboard = memo(function StorageDashboard({ 
  stats, isSyncing, onSync, onUploadTrigger, t 
}: StorageDashboardProps): JSX.Element {
  const { totalWeightMB, isOverTotalLimit, hasPendingUploads, isAtLimit, hasIndividualErrors } = stats;
  const isSyncBlocked = isOverTotalLimit || hasIndividualErrors;

  return (
    <div className="mb-6 space-y-2 select-none">
      <div
        className={`p-3 sm:p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3
          ${hasPendingUploads
            ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50'
            : 'bg-zinc-100 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800'
          }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-5 flex-1">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <Database size={12} /> {t('gallery_storage')}
            </span>
            <span className={`text-sm font-black ${isOverTotalLimit ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
              {totalWeightMB.toFixed(1)}
              <span className="text-[10px] ml-1 font-medium text-zinc-500">/ 15 MB</span>
            </span>
          </div>

          {hasPendingUploads && (
            <div className="flex items-center justify-between sm:justify-start gap-3 bg-white dark:bg-zinc-950 px-3 py-2 rounded-lg border border-blue-100 dark:border-zinc-800 flex-1 sm:flex-none">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase leading-none mb-0.5">
                  {isSyncBlocked ? t('gallery_action_blocked') : t('gallery_action_required')}
                </span>
                <span className="text-[10px] text-zinc-500 leading-none">
                  {isOverTotalLimit ? t('gallery_error_total_limit') : hasIndividualErrors ? t('gallery_error_individual') : t('gallery_pending_local')}
                </span>
              </div>
            
              <button
                onClick={onSync}
                disabled={isSyncing || isSyncBlocked}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase flex items-center gap-1.5 transition-opacity active:scale-95
                  ${isSyncBlocked ? 'bg-zinc-200 text-zinc-400 dark:bg-zinc-800 cursor-not-allowed' : 'bg-blue-600 text-white'}`}
              >
                {isSyncing ? <RefreshCcw size={12} className="animate-spin" /> : <CloudUpload size={12} />}
                <span className="hidden xs:inline">{isSyncBlocked ? t('gallery_btn_blocked') : t('gallery_btn_sync')}</span>
              </button>
            </div>
          )}
        </div>

        <button
          disabled={isAtLimit || isSyncing}
          onClick={onUploadTrigger}
          className={`w-full sm:w-auto px-4 py-2.5 rounded-lg text-[11px] font-bold uppercase flex items-center justify-center gap-1.5 transition-opacity active:scale-95
            ${isAtLimit
              ? 'bg-zinc-200 text-zinc-400 dark:bg-zinc-800 cursor-not-allowed'
              : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90'
            }`}
        >
          {isAtLimit ? <X size={14} /> : <Camera size={14} />}
          {isAtLimit ? t('gallery_limit_reached') : t('gallery_add')}
        </button>
      </div>

      {hasPendingUploads && (
        <div className={`flex flex-col sm:flex-row sm:items-center gap-2 rounded-lg border px-3 py-2 text-[11px]
          ${isSyncBlocked ? 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400' : 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400'}`}>
          <ShieldAlert size={14} className="shrink-0" />
          <span className="flex-1 font-medium">{hasIndividualErrors ? t('gallery_msg_error') : t('gallery_msg_ready')}</span>
          <div className="flex gap-2">
            <a href={COMPRESS_PHOTO} target="_blank" rel="noreferrer" className="underline opacity-80 hover:opacity-100">{t('gallery_compress_images')}</a>
            <span className="opacity-40">|</span>
            <a href={COMPRESS_VIDEO} target="_blank" rel="noreferrer" className="underline opacity-80 hover:opacity-100">{t('gallery_compress_videos')}</a>
          </div>
        </div>
      )}
    </div>
  );
});

// --- 2. CABEÇALHO DA GALERIA ---
export const GalleryHeader = memo(function GalleryHeader<K extends string>({ 
  content, style, isEditable, onUpdate, t 
}: GalleryHeaderProps<K>): JSX.Element {
  return (
    <header className={`mb-6 flex flex-col gap-1 ${style.align === 'center' ? 'items-center text-center' : 'items-start text-left'}`}>
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-1 select-none">
        <Tag size={10} />
        <span 
          {...editableProps(isEditable, (v) => onUpdate?.('category', v))} 
          className="text-[9px] focus:text-[16px] md:focus:text-[9px] transition-all duration-200 font-bold uppercase tracking-wider focus:outline-none"
        >
          {(content.category as string) || t('gallery_default_category' as K)}
        </span>
      </div>

      <h1 
        {...editableProps(isEditable, (v) => onUpdate?.('title', v))} 
        className={`font-black uppercase tracking-tight focus:outline-none ${getFontSize(style.fontSize, 'h2')}`}
      >
        {(content.title as string) || t('gallery_default_title' as K)}
      </h1>

      <p 
        {...editableProps(isEditable, (v) => onUpdate?.('description', v))} 
        className="opacity-50 text-[10px] md:text-[11px] focus:text-[16px] md:focus:text-[11px] transition-all duration-200 uppercase tracking-wide font-medium focus:outline-none"
      >
        {(content.description as string) || t('gallery_default_desc' as K)}
      </p>
    </header>
  );
});


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
// --- 4. BARRA DE EDIÇÃO GLOBAL (BOTTOM TOOLBAR) ---
export interface GlobalEditToolbarProps {
  items: MediaItem[];
  selectedIndex: number | null;
  onClose: () => void;
  onRemove: (index: number) => void;
  onUpload: (e: ChangeEvent<HTMLInputElement>, index: number) => void;
  onMove: (from: number, to: number) => void;
  t: (key: string) => string;
}

export const GlobalEditToolbar = memo(function GlobalEditToolbar({
  items, selectedIndex, onClose, onRemove, onUpload, onMove, t
}: GlobalEditToolbarProps): JSX.Element | null {
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || selectedIndex === null || !items || items.length === 0 || !items[selectedIndex]) {
    return null;
  }

  const item = items[selectedIndex];
  const index = selectedIndex;
  const limit = item.type === 'video' ? VIDEO_LIMIT : PHOTO_LIMIT;
  const isTooLarge = (item.size || 0) > limit;

  // CORREÇÃO: "top-24 md:top-28" baixa a tool para não colidir com o Header fixo.
  const toolbarContent = (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-[999999] flex flex-col items-center w-[90vw] sm:w-[480px] max-w-full select-none animate-in slide-in-from-top-4 fade-in duration-200 mx-auto drop-shadow-2xl rounded-2xl pointer-events-auto">
      
      {isTooLarge && (
        <div className="bg-red-600 text-white w-full px-4 py-2 rounded-t-xl flex items-center justify-between text-[10px] font-bold border-b border-red-700 shadow-sm">
          <span className="flex items-center gap-1.5">
            <ShieldAlert size={12}/> 
            {t('gallery_compress').toUpperCase()} ({item.type === 'video' ? 'MAX 10MB' : 'MAX 1MB'})
          </span>
          <a
            href={item.type === 'video' ? COMPRESS_VIDEO : COMPRESS_PHOTO}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors flex items-center gap-1"
          >
            <RefreshCcw size={10} /> {t('gallery_compress').toUpperCase()}
          </a>
        </div>
      )}

      <div className={`w-full bg-zinc-950/90 backdrop-blur-xl dark:bg-zinc-900/95 border border-zinc-800/80 p-2 flex items-center justify-between shadow-2xl
        ${isTooLarge ? 'rounded-b-2xl rounded-t-sm' : 'rounded-2xl'}
      `}>
        
        <div className="flex items-center bg-zinc-900/50 dark:bg-zinc-950/50 border border-zinc-800/50 rounded-xl p-0.5">
          <button
            type="button"
            onClick={() => onMove(index, index - 1)}
            disabled={index === 0}
            className="p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg disabled:opacity-20 active:scale-95 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="px-3 text-[11px] font-bold text-zinc-300 whitespace-nowrap min-w-[3.5rem] text-center">
            {index + 1} <span className="opacity-40">/</span> {items.length}
          </div>
          <button
            type="button"
            onClick={() => onMove(index, index + 1)}
            disabled={index === items.length - 1}
            className="p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg disabled:opacity-20 active:scale-95 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2 mx-3 flex-1 justify-end">
          <label className="flex items-center gap-2 h-10 px-4 bg-blue-600/15 text-blue-400 hover:bg-blue-600 hover:text-white active:scale-95 rounded-xl cursor-pointer text-[11px] font-bold uppercase transition-colors">
            <Camera size={14} />
            <span className="hidden sm:inline">{t('changeMedia') || 'Trocar'}</span>
            <input type="file" className="hidden" accept="image/*,video/*" onChange={(ev) => onUpload(ev, index)} />
          </label>

          <button
            type="button"
            onClick={() => onRemove(index)}
            className="flex items-center justify-center h-10 w-10 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white active:scale-95 rounded-xl transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="w-px h-7 bg-zinc-800 shrink-0 mx-1" />

        <button 
          type="button"
          onClick={onClose}
          className="flex items-center justify-center h-10 w-10 ml-2 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700 border border-zinc-700/50 rounded-xl active:scale-95 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );

  return createPortal(toolbarContent, document.body);
});