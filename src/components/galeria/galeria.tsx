import { memo } from 'react';
import type { ChangeEvent, JSX } from 'react';
import { 
  Camera, X, Trash2, RefreshCcw, ShieldAlert, 
  Database, ChevronLeft, ChevronRight, Tag, CloudUpload,
  Image as ImageIcon
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
        <span {...editableProps(isEditable, (v) => onUpdate?.('category', v))} className="text-[9px] font-bold uppercase tracking-wider focus:outline-none">
          {(content.category as string) || t('gallery_default_category' as K)}
        </span>
      </div>

      <h1 {...editableProps(isEditable, (v) => onUpdate?.('title', v))} className={`font-black uppercase tracking-tight focus:outline-none ${getFontSize(style.fontSize, 'h2')}`}>
        {(content.title as string) || t('gallery_default_title' as K)}
      </h1>

      <p {...editableProps(isEditable, (v) => onUpdate?.('description', v))} className="opacity-50 text-[10px] md:text-[11px] uppercase tracking-wide font-medium focus:outline-none">
        {(content.description as string) || t('gallery_default_desc' as K)}
      </p>
    </header>
  );
});

// --- 3. ESTADO VAZIO (TUTORIAL) ---
export interface EmptyStateProps {
  isEditable: boolean;
  onUploadTrigger: () => void;
  t: (key: string) => string;
}

export const EmptyState = memo(function EmptyState({ isEditable, onUploadTrigger, t }: EmptyStateProps): JSX.Element {
  return (
    <div className="py-12 md:py-16 flex flex-col items-center select-none bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="text-center flex flex-col items-center gap-5 px-4">
        <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-2">
          <ImageIcon size={20} className="text-zinc-400" />
        </div>
        
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">{t('gallery_tutorial_subtitle')}</h3>
          <p className="text-sm md:text-base font-medium text-zinc-800 dark:text-zinc-200">{t('gallery_tutorial_title')}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 text-[10px] font-medium text-zinc-500">
          <div className="flex items-center gap-1.5"><Database size={12}/> 10 {t('gallery_items')}</div>
          <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 my-auto" />
          <div className="flex items-center gap-1.5">Fotos {t('gallery_max_1mb')}</div>
          <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 my-auto" />
          <div className="flex items-center gap-1.5">Vídeos {t('gallery_max_10mb')}</div>
        </div>

        {isEditable && (
          <button onClick={onUploadTrigger} className="mt-2 flex items-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-[11px] font-bold uppercase transition-opacity hover:opacity-90 active:scale-95">
            <CloudUpload size={14} /> {t('gallery_add')}
          </button>
        )}
      </div>
    </div>
  );
});

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
  if (selectedIndex === null || !items || items.length === 0 || !items[selectedIndex]) {
    return null;
  }

  const item = items[selectedIndex];
  const index = selectedIndex;
  const limit = item.type === 'video' ? VIDEO_LIMIT : PHOTO_LIMIT;
  const isTooLarge = (item.size || 0) > limit;

  return (
    <div className="fixed top-20 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[480px] z-[100] select-none flex flex-col items-center">
      
      {/* ALERTA ACOPLADO (Se arquivo for muito pesado) */}
      {isTooLarge && (
        <div className="bg-red-600 text-white w-full max-w-[95%] px-4 py-2 rounded-t-xl flex items-center justify-between text-[10px] font-bold border-b border-red-700 shadow-sm">
          <span className="flex items-center gap-1.5"><ShieldAlert size={12}/>            {t('gallery_compress').toUpperCase()} ({item.type === 'video' ? 'MAX 10MB' : 'MAX 1MB'})</span>
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

      {/* BARRA PRINCIPAL (Command Bar) */}
      <div className={`w-full bg-zinc-950 dark:bg-zinc-900 border border-zinc-800 p-1.5 flex items-center justify-between shadow-md
        ${isTooLarge ? 'rounded-b-xl rounded-t-sm' : 'rounded-xl'}
      `}>
        
        {/* NAVEGAÇÃO: Info clara da posição */}
        <div className="flex items-center bg-zinc-900 dark:bg-zinc-950 border border-zinc-800 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => onMove(index, index - 1)}
            disabled={index === 0}
            className="p-2 text-zinc-300 hover:text-white disabled:opacity-20 active:scale-90 transition-transform"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="px-2 text-[10px] font-bold text-zinc-400 whitespace-nowrap min-w-[3rem] text-center">
            {index + 1} <span className="opacity-50">/</span> {items.length}
          </div>
          <button
            type="button"
            onClick={() => onMove(index, index + 1)}
            disabled={index === items.length - 1}
            className="p-2 text-zinc-300 hover:text-white disabled:opacity-20 active:scale-90 transition-transform"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* AÇÕES CENTRALIZADAS */}
        <div className="flex items-center gap-1 mx-2 flex-1 justify-end">
          <label className="flex items-center gap-1.5 h-9 px-3 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white active:scale-95 rounded-lg cursor-pointer text-[10px] font-bold uppercase transition-colors">
            <Camera size={14} />
            <span className="hidden sm:inline">{t('changeMedia') || 'Trocar'}</span>
            <input type="file" className="hidden" accept="image/*,video/*" onChange={(ev) => onUpload(ev, index)} />
          </label>

          <button
            type="button"
            onClick={() => onRemove(index)}
            className="flex items-center justify-center h-9 w-9 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white active:scale-95 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>

        <div className="w-px h-6 bg-zinc-800 shrink-0 mx-1" />

        {/* BOTÃO FECHAR */}
        <button 
          type="button"
          onClick={onClose}
          className="flex items-center justify-center h-9 w-9 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg active:scale-95 transition-transform"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
});