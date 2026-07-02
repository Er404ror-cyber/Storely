import React, { memo } from 'react';
import type { ChangeEvent } from 'react';
import { 
  Camera, X, Trash2, RefreshCcw, ShieldAlert, 
  Database, ChevronLeft, ChevronRight, 
  Tag, CloudUpload, SlidersHorizontal 
} from 'lucide-react';
import { editableProps, getFontSize } from '../sections/helpers';
import type { GalleryHeaderProps, MediaItem } from '../sections/main';
import { MediaRenderer } from '../sections/mediarender';

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

export const StorageDashboard: React.FC<StorageDashboardProps> = memo(({ 
  stats, isSyncing, onSync, onUploadTrigger, t 
}) => {
  const { totalWeightMB, isOverTotalLimit, hasPendingUploads, isAtLimit, hasIndividualErrors } = stats;
  const isSyncBlocked = isOverTotalLimit || hasIndividualErrors;

  return (
    <div className="mb-6 space-y-2 select-none">
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
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-1">
              <Database size={10} /> {t('gallery_storage')}
            </span>

            <span
              className={`text-sm font-black transition-colors ${
                isOverTotalLimit ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-blue-400'
              }`}
            >
              {totalWeightMB.toFixed(1)}
              <span className="text-[10px] ml-1 text-zinc-400">/ 15 MB</span>
            </span>
          </div>

          {hasPendingUploads && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 lg:gap-3 px-3 py-2.5 bg-white dark:bg-zinc-950 rounded-xl border border-blue-200 dark:border-zinc-800 shadow-sm">
              <div className="flex flex-col leading-tight">
                <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase">
                  {isSyncBlocked ? t('gallery_action_blocked') : t('gallery_action_required')}
                </span>
                <span className="text-[11px] text-gray-400 font-bold">
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
                className={`w-full sm:w-auto px-4 py-2.5 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all transform-gpu active:scale-95
                  ${isSyncBlocked 
                    ? 'bg-zinc-200 text-zinc-400 dark:bg-zinc-800 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
              >
                {isSyncing ? <RefreshCcw size={12} className="animate-spin" /> : <CloudUpload size={12} />}
                {isSyncBlocked ? t('gallery_btn_blocked') : t('gallery_btn_sync')}
              </button>
            </div>
          )}
        </div>

        <button
          disabled={isAtLimit || isSyncing}
          onClick={onUploadTrigger}
          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-[10px] 
            font-black uppercase tracking-wider transition-all shadow-md transform-gpu active:scale-95
            flex items-center justify-center gap-2
            ${
              isAtLimit
                ? 'bg-zinc-200 text-zinc-400 dark:bg-zinc-800 cursor-not-allowed shadow-none'
                : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90'
            }`}
        >
          {isAtLimit ? <X size={14} /> : '+'}
          {isAtLimit ? t('gallery_limit_reached') : t('gallery_add')}
        </button>
      </div>

      {hasPendingUploads && (
        <div
          className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2
            w-full rounded-lg border px-3 py-2 text-[11px] font-medium
            ${isSyncBlocked
              ? 'border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-400'
              : 'border-blue-500/30 bg-blue-500/5 text-blue-700 dark:text-blue-400'}
          `}
        >
          <div className="flex items-center gap-2">
            <ShieldAlert size={14} className="shrink-0 opacity-80" />
            <span className="leading-snug">
              {hasIndividualErrors ? t('gallery_msg_error') : t('gallery_msg_ready')}
            </span>
          </div>

          <div className="flex items-center gap-2 pl-6 sm:pl-0 core-actions">
            <a href={COMPRESS_PHOTO} target="_blank" rel="noreferrer" className="rounded-md border border-current/30 px-2 py-1 text-[10px] hover:bg-black/5 dark:hover:bg-white/10 transition">
              {t('gallery_compress_images')}
            </a>
            <a href={COMPRESS_VIDEO} target="_blank" rel="noreferrer" className="rounded-md border border-current/30 px-2 py-1 text-[10px] hover:bg-black/5 dark:hover:bg-white/10 transition">
              {t('gallery_compress_videos')}
            </a>
          </div>
        </div>
      )}
    </div>
  );
});
StorageDashboard.displayName = 'StorageDashboard';

// --- 2. Cabeçalho da Galeria ---
export const GalleryHeader = memo(<K extends string,>({ content, style, isEditable, onUpdate, t }: GalleryHeaderProps<K>) => (
  <header className={`mb-6 flex flex-col gap-0.5 ${style.align === 'center' ? 'items-center text-center' : 'items-start text-left'}`}>
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 mb-2 select-none">
      <Tag size={12} />
      <span {...editableProps(isEditable, (v) => onUpdate?.('category', v))} className="text-[9px] font-black uppercase tracking-[0.2em] focus:outline-none">
        {(content.category as string) || t('gallery_default_category' as K)}
      </span>
    </div>

    <h1 {...editableProps(isEditable, (v) => onUpdate?.('title', v))} className={`font-black uppercase tracking-tight leading-none focus:outline-none ${getFontSize(style.fontSize, 'h2')}`}>
      {(content.title as string) || t('gallery_default_title' as K)}
    </h1>

    <p {...editableProps(isEditable, (v) => onUpdate?.('description', v))} className="opacity-40 dark:opacity-50 text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold focus:outline-none">
      {(content.description as string) || t('gallery_default_desc' as K)}
    </p>
  </header>
));
GalleryHeader.displayName = 'GalleryHeader';

// --- 3. Estado Vazio ---
export interface EmptyStateProps {
  isEditable: boolean;
  onUploadTrigger: () => void;
  t: (key: string) => string;
}

export const EmptyState: React.FC<EmptyStateProps> = memo(({ isEditable, onUploadTrigger, t }) => (
  <div className="relative py-14 md:py-20 mt-4 flex flex-col items-center overflow-hidden select-none">
    <div className="absolute inset-0 flex items-center justify-center opacity-20 dark:opacity-10 pointer-events-none">
      <div className="grid grid-cols-3 gap-4 w-full max-w-2xl px-6">
        <div className="aspect-[4/3] border border-current rounded-2xl flex items-center justify-center"><Camera size={24} className="opacity-20" /></div>
        <div className="aspect-[4/3] border border-current rounded-2xl border-dashed" />
        <div className="aspect-[4/3] border border-current rounded-2xl" />
      </div>
    </div>

    <div className="relative z-10 text-center flex flex-col items-center gap-8">
      <div className="space-y-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">{t('gallery_tutorial_subtitle')}</h3>
        <p className="text-sm md:text-base font-bold max-w-[280px] md:max-w-md mx-auto leading-snug">{t('gallery_tutorial_title')}</p>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 py-3 px-6 rounded-2xl md:rounded-full border border-current/10 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="flex flex-col items-center"><span className="text-[8px] font-black opacity-40 uppercase tracking-tighter">{t('gallery_limit_label')}</span><span className="text-[10px] font-bold">10 {t('gallery_items')}</span></div>
        <div className="hidden sm:block w-px h-6 bg-current opacity-10" />
        <div className="flex flex-col items-center"><span className="text-[8px] font-black opacity-40 uppercase tracking-tighter">{t('gallery_type_photos')}</span><span className="text-[10px] font-bold">{t('gallery_max_1mb')}</span></div>
        <div className="hidden sm:block w-px h-6 bg-current opacity-10" />
        <div className="flex flex-col items-center"><span className="text-[8px] font-black opacity-40 uppercase tracking-tighter">{t('gallery_type_videos')}</span><span className="text-[10px] font-bold">{t('gallery_max_10mb')}</span></div>
      </div>

      {isEditable && (
        <button onClick={onUploadTrigger} className="group flex items-center gap-3 px-8 py-3.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all transform-gpu hover:scale-[1.02] active:scale-95 shadow-md">
          <CloudUpload size={14} className="transition-transform duration-200 group-hover:-translate-y-0.5" />
          {t('gallery_add')}
        </button>
      )}
    </div>
  </div>
));
EmptyState.displayName = 'EmptyState';

// --- 4. Item da Grid (Refatorado para ser limpo e interativo) ---
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
  // Types corretos e seguros para o componente funcionar com a Toolbar
  activeEditIndex?: number | null;
  setActiveEditIndex?: (index: number | null) => void;
}

export const GridItem: React.FC<GridItemProps> = memo(({ 
  item, index, isEditable, cols, 
  onPreview, onDragStart, onDrop, t,
  activeEditIndex = null, setActiveEditIndex
}) => {
  const itemMB = (item.size || 0) / (1024 * 1024);
  const limit = item.type === 'video' ? VIDEO_LIMIT : PHOTO_LIMIT;
  const isTooLarge = (item.size || 0) > limit;
  const isSelected = activeEditIndex === index;

  const getItemClass = (): string => {
    if (cols === '1') return index === 0 ? 'col-span-4 md:row-span-3 md:col-span-5 aspect-[16/9]' : 'col-span-2 md:col-span-1 aspect-[4/3] md:aspect-[9/8]';
    if (cols === '2') return index === 0 ? 'col-span-3 row-span-3 aspect-[4/3]' : 'col-span-1 aspect-[4/3]';
    return 'break-inside-avoid mb-2 aspect-[4/3]';
  };

  const handleInteraction = (ev: React.MouseEvent) => {
    ev.stopPropagation();
    if (isEditable && setActiveEditIndex) {
      if (isSelected) {
        // Se já está selecionado e toca de novo, remove a seleção (toggle clássico)
        setActiveEditIndex(null);
      } else {
        // Foca para edição abrindo a barra inferior
        setActiveEditIndex(index);
      }
    } else {
      onPreview(item);
    }
  };

  return (
    <div
      draggable={isEditable}
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop(index)}
      onClick={handleInteraction}
      className={`relative rounded-xl overflow-hidden group border dark:border-zinc-800/50 
        transition-all duration-200 transform-gpu will-change-transform touch-none select-none cursor-pointer
        ${isSelected && isEditable ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-950 scale-[0.98]' : ''}
        ${isTooLarge && isEditable && !isSelected ? 'ring-2 ring-red-500' : 'bg-zinc-100 dark:bg-zinc-900'}
        ${getItemClass()}
      `}
    >
      <div className="w-full h-full overflow-hidden pointer-events-none">
        <MediaRenderer
          media={{ url: item.url, type: item.type }}
          className="w-full h-full object-cover backface-hidden"
        />
      </div>

      <div className="absolute top-2 left-2 bg-black/60 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center  shadow border border-white/10 pointer-events-none">
        {index + 1}
      </div>

{isEditable && (
        <div
          className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-black z-30 border border-white/10 pointer-events-none backdrop-blur-sm ${
            isTooLarge
              ? 'bg-red-600 text-white'
              : 'bg-black/50 text-white/90'
          }`}
        >
          {item.size ? `${itemMB.toFixed(1)} MB` : t('gallery_scanning')}
        </div>
      )}
      {isTooLarge && isEditable && (
        <div className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-md shadow animate-pulse pointer-events-none">
          <ShieldAlert size={12} />
        </div>
      )}

      {item.isTemp && isEditable && (
        <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider pointer-events-none shadow-sm">
          {t('gallery_new_badge')}
        </div>
      )}

      {/* Overlay visual para saber qual está ativo */}
      {isSelected && isEditable && (
        <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center pointer-events-none transition-opacity">
          <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg transform scale-110">
            <SlidersHorizontal size={16} />
          </div>
        </div>
      )}
    </div>
  );
});
GridItem.displayName = 'GridItem';

// --- 5. BOTTOM TOOLBAR (O Painel Global de Ações) ---
export interface GlobalEditToolbarProps {
  items: MediaItem[];
  selectedIndex: number | null;
  onClose: () => void;
  onRemove: (index: number) => void;
  onUpload: (e: ChangeEvent<HTMLInputElement>, index: number) => void;
  onMove: (from: number, to: number) => void;
  t: (key: string) => string;
}

export const GlobalEditToolbar: React.FC<GlobalEditToolbarProps> = memo(({
  items, selectedIndex, onClose, onRemove, onUpload, onMove, t
}) => {
  if (selectedIndex === null || !items || items.length === 0 || !items[selectedIndex]) {
    return null;
  }

  const item = items[selectedIndex];
  const index = selectedIndex;
  const limit = item.type === 'video' ? VIDEO_LIMIT : PHOTO_LIMIT;
  const isTooLarge = (item.size || 0) > limit;

  return (
    <div className="fixed bottom-6 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[480px] z-[99] bg-zinc-950/98 dark:bg-zinc-900/98 text-white  rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.24)] border border-zinc-800 p-2 select-none animate-in slide-in-from-bottom-8 duration-200 fade-in">
      
      {/* Alerta de Compressão (Aparece apenas quando necessário, no topo da barra) */}
      {isTooLarge && (
        <div className="mb-2 px-1">
          <a
            href={item.type === 'video' ? COMPRESS_VIDEO : COMPRESS_PHOTO}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-red-600/90 hover:bg-red-600 text-white text-[10px] font-black py-2 rounded-xl transition-all shadow-sm w-full"
          >
            <RefreshCcw size={12} className="animate-spin" style={{ animationDuration: '2s' }} />
            {t('gallery_compress').toUpperCase()} ({item.type === 'video' ? 'MAX 10MB' : 'MAX 1MB'})
          </a>
        </div>
      )}

      {/* Controlos numa linha única */}
      <div className="flex items-center gap-2 w-full">
        
        {/* Bloco 1: Navegação (Sempre visível) */}
        <div className="flex items-center bg-zinc-800/80 p-1 rounded-xl shrink-0">
          <button
            onClick={() => onMove(index, index - 1)}
            disabled={index === 0}
            className="p-2 hover:bg-zinc-700 text-white rounded-lg disabled:opacity-20 transition-all active:scale-95 transform-gpu"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[10px] font-black px-1.5 text-zinc-400 tabular-nums">
            {index + 1} / {items.length}
          </span>
          <button
            onClick={() => onMove(index, index + 1)}
            disabled={index === items.length - 1}
            className="p-2 hover:bg-zinc-700 text-white rounded-lg disabled:opacity-20 transition-all active:scale-95 transform-gpu"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Bloco 2: Ações Principais (Camera + Lixo) expandem-se para preencher o espaço */}
        <div className="flex items-center gap-1.5 flex-1 justify-end">
          <label className="flex items-center justify-center gap-2 h-10 px-3 md:px-4 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl cursor-pointer text-[10px] font-black uppercase tracking-wider transition-all shadow-md transform-gpu shrink-0">
            <Camera size={16} />
            {/* Texto escondido em ecrãs muito pequenos para salvar espaço */}
            <span className="hidden sm:inline">{t('changeMedia') || 'Trocar'}</span>
            <input
              type="file"
              className="hidden"
              accept="image/*,video/*"
              onChange={(ev) => onUpload(ev, index)}
            />
          </label>

          <button
            onClick={() => onRemove(index)}
            className="flex items-center justify-center h-10 w-10 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white active:scale-95 rounded-xl transition-all shrink-0 transform-gpu"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Separador vertical subtil */}
        <div className="w-px h-6 bg-zinc-800 shrink-0 mx-0.5"></div>

        {/* Bloco 3: Fechar Toolbar */}
        <button 
          onClick={onClose}
          className="flex items-center justify-center h-10 w-10 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all active:scale-95 shrink-0"
        >
          <X size={18} />
        </button>
        
      </div>
    </div>
  );
});
GlobalEditToolbar.displayName = 'GlobalEditToolbar';
