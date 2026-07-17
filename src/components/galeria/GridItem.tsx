import { memo } from 'react';
import type { JSX, MouseEvent } from 'react';
import { ShieldAlert, SlidersHorizontal } from 'lucide-react';
import type { MediaItem } from '../sections/main';
import { MediaRenderer } from '../sections/mediarender';

const PHOTO_LIMIT = 1 * 1024 * 1024;
const VIDEO_LIMIT = 10 * 1024 * 1024;

export interface GridItemProps {
  item: MediaItem;
  index: number;
  totalItems: number;
  isEditable: boolean;
  cols: string;
  onPreview: (item: MediaItem) => void;
  onDragStart: (index: number) => void;
  onDrop: (index: number) => void;
  t: (key: string) => string;
  activeEditIndex?: number | null;
  setActiveEditIndex?: (index: number | null) => void;
}

export const GridItem = memo(function GridItem({ 
  item, index, isEditable, cols, 
  onPreview, onDragStart, onDrop, t,
  activeEditIndex = null, setActiveEditIndex
}: GridItemProps): JSX.Element {
  const itemMB = (item.size || 0) / (1024 * 1024);
  const limit = item.type === 'video' ? VIDEO_LIMIT : PHOTO_LIMIT;
  const isTooLarge = (item.size || 0) > limit;
  const isSelected = activeEditIndex === index;

  const getItemClass = (): string => {
    if (cols === '1') {
      return index === 0 
        ? 'col-span-4 md:row-span-3 md:col-span-5 aspect-[16/9]' 
        : 'col-span-2 md:col-span-1 aspect-[4/3] md:aspect-[9/8]';
    }
    if (cols === '2') {
      return index === 0 
        ? 'col-span-3 row-span-3 aspect-[4/3]' 
        : 'col-span-1 aspect-[4/3]';
    }

    
    return 'break-inside-avoid-column inline-flex w-full mb-4 h-auto';
  };

  const handleInteraction = (ev: MouseEvent<HTMLDivElement>) => {
    if (isEditable && setActiveEditIndex) {
      ev.stopPropagation();
      if (isSelected) {
        setActiveEditIndex(null);
      } else {
        setActiveEditIndex(index);
      }
    } else {
      onPreview(item);
    }
  };

  return (
    <div
      draggable={isEditable}
      onDragStart={isEditable ? () => onDragStart(index) : undefined}
      onDragOver={isEditable ? (e) => e.preventDefault() : undefined}
      onDrop={isEditable ? () => onDrop(index) : undefined}
      onClick={handleInteraction}
      className={`relative rounded-2xl overflow-hidden group border border-zinc-200/60 dark:border-zinc-800/50 
        transition-all duration-300 cursor-pointer shadow-sm transform-gpu backface-hidden will-change-transform
        ${isEditable ? 'select-none' : ''}
        ${isSelected && isEditable ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-950 scale-[0.98]' : 'hover:scale-[1.01] hover:shadow-md'}
        ${isTooLarge && isEditable && !isSelected ? 'ring-2 ring-red-500' : 'bg-zinc-100 dark:bg-zinc-900'}
        ${getItemClass()}
      `}
    >
      {/* Container dinâmico flexível: adapta-se perfeitamente sem deixar espaços em branco */}
      <div className={`${cols !== '1' && cols !== '2' ? 'relative w-full' : 'absolute inset-0'} pointer-events-none bg-zinc-100 dark:bg-zinc-950`}>
        <MediaRenderer
          media={{ url: item.url, type: item.type }}
          className="w-full h-full object-cover transform-gpu group-hover:scale-103 transition-transform duration-500 ease-out"
        />
      </div>

      {/* Indicador Numérico de Posição (Editor) */}
      {isEditable && (
        <div className="absolute top-3 left-3 bg-black/60 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow border border-white/10 pointer-events-none z-20">
          {index + 1}
        </div>
      )}

      {/* Badge de tamanho do Ficheiro */}
      {isEditable && (
        <div
          className={`absolute top-3 right-3 px-1.5 py-0.5 rounded text-[8px] font-black z-30 border border-white/10 pointer-events-none backdrop-blur-sm ${
            isTooLarge ? 'bg-red-600 text-white' : 'bg-black/50 text-white/90'
          }`}
        >
          {item.size ? `${itemMB.toFixed(1)} MB` : t('gallery_scanning')}
        </div>
      )}

      {isTooLarge && isEditable && (
        <div className="absolute top-3 right-3 bg-red-600 text-white p-1.5 rounded-md shadow animate-pulse pointer-events-none z-20">
          <ShieldAlert size={12} />
        </div>
      )}

      {item.isTemp && isEditable && (
        <div className="absolute bottom-3 left-3 bg-blue-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider pointer-events-none shadow-sm z-20">
          {t('gallery_new_badge')}
        </div>
      )}

      {/* Overlay de seleção ativa no Editor */}
      {isSelected && isEditable && (
        <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center pointer-events-none z-10 transition-opacity">
          <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg transform scale-105">
            <SlidersHorizontal size={14} />
          </div>
        </div>
      )}
    </div>
  );
});

GridItem.displayName = 'GridItem';