import { memo, useCallback, useMemo, useState } from 'react';
import type { JSX, MouseEvent, DragEvent } from 'react';
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

const GridItemComponent = ({ 
  item, index, isEditable, cols, 
  onPreview, onDragStart, onDrop, t,
  activeEditIndex = null, setActiveEditIndex
}: GridItemProps): JSX.Element => {
  
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const isSelected = activeEditIndex === index;
  const isPinterest = cols !== '1' && cols !== '2';

  const isTooLarge = useMemo(() => {
    const limit = item.type === 'video' ? VIDEO_LIMIT : PHOTO_LIMIT;
    return (item.size || 0) > limit;
  }, [item.size, item.type]);

  const itemMB = useMemo(() => (item.size || 0) / (1024 * 1024), [item.size]);

  const itemClass = useMemo(() => {
    if (cols === '1') {
      return index === 0 
        ? 'col-span-4 md:row-span-2 md:col-span-6 aspect-[9/8] md:aspect-[16/9]' 
        : 'col-span-2 md:col-span-2 aspect-[4/3] md:aspect-[6/5]';
    }
    
    if (cols === '2') {
      return index === 0 
        ? 'col-span-2 row-span-3 md:col-span-2 md:row-span-3 h-full' 
        : 'col-span-1 aspect-[6/5] md:aspect-[6/5]';
    }

    // CORREÇÃO AQUI: break-inside-avoid mais forte e margem mb-3 para casar com o gap-3 do container
    return 'break-inside-avoid inline-block w-full mb-3 min-h-[100px] h-auto';
  }, [cols, index]);

  const handleInteraction = useCallback((ev: MouseEvent<HTMLDivElement>) => {
    if (isEditable && setActiveEditIndex) {
      ev.stopPropagation();
      setActiveEditIndex(isSelected ? null : index);
    } else {
      onPreview(item);
    }
  }, [isEditable, setActiveEditIndex, isSelected, index, onPreview, item]);

  const handleDragStart = useCallback((e: DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', index.toString());
    }
    onDragStart(index);
  }, [onDragStart, index]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  }, [isDragOver]);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    setIsDragging(false);
    onDrop(index);
  }, [onDrop, index]);

  return (
    <div
      draggable={isEditable}
      onDragStart={isEditable ? handleDragStart : undefined}
      onDragEnd={isEditable ? handleDragEnd : undefined}
      onDragOver={isEditable ? handleDragOver : undefined}
      onDragLeave={isEditable ? handleDragLeave : undefined}
      onDrop={isEditable ? handleDrop : undefined}
      onClick={handleInteraction}
      // CORREÇÃO AQUI: Adicionado transform-gpu e will-change-transform para evitar os cards fantasmas
      className={`relative rounded-2xl overflow-hidden group border border-zinc-600/60 dark:border-zinc-800/50 
        cursor-pointer bg-zinc-200 dark:bg-zinc-900 
        transition-colors duration-200 ease-in-out
        transform-gpu will-change-transform
        ${isEditable ? 'select-none' : ''}
        ${isDragging ? 'opacity-40 z-0' : 'opacity-100 z-10'}
        ${isDragOver ? 'ring-2 ring-blue-500 bg-blue-500/20' : ''}
        ${isSelected && isEditable && !isDragOver ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-950' : ''}
        ${!isSelected && !isDragOver ? 'hover:border-zinc-500/80 dark:hover:border-zinc-700' : ''}
        ${isTooLarge && isEditable && !isSelected ? 'ring-2 ring-red-500' : ''}
        ${itemClass}
      `}
    >
      <div className={`${isPinterest ? 'relative w-full' : 'absolute inset-0'} pointer-events-none flex items-center justify-center`}>
        <MediaRenderer
          media={{ url: item.url, type: item.type }}
          className={`w-full block ${isPinterest ? 'h-auto object-contain' : 'h-full object-cover'}`}
        />
      </div>

      {isEditable && (
        <div className="absolute top-3 left-3 bg-black/70 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md border border-white/10 pointer-events-none z-20">
          {index + 1}
        </div>
      )}

      {isEditable && (
        <div
          className={`absolute top-3 right-3 px-1.5 py-0.5 rounded text-[8px] font-black z-30 border border-white/10 pointer-events-none shadow-sm ${
            isTooLarge ? 'bg-red-600 text-white' : 'bg-black/80 text-white/90'
          }`}
        >
          {item.size ? `${itemMB.toFixed(1)} MB` : t('gallery_scanning') || 'SCANEANDO...'}
        </div>
      )}

      {isTooLarge && isEditable && (
        <div className="absolute top-3 right-3 bg-red-600 text-white p-1.5 rounded-md shadow-md pointer-events-none z-20">
          <ShieldAlert size={12} />
        </div>
      )}

      {item.isTemp && isEditable && (
        <div className="absolute bottom-3 left-3 bg-blue-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider pointer-events-none shadow-sm z-20">
          {t('gallery_new_badge') || 'NOVO'}
        </div>
      )}

      {isSelected && isEditable && !isDragging && (
        <div className="absolute inset-0 bg-blue-500/15 dark:bg-blue-500/25 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg">
            <SlidersHorizontal size={14} />
          </div>
        </div>
      )}
    </div>
  );
};

GridItemComponent.displayName = 'GridItem';

export const GridItem = memo(GridItemComponent, (prev, next) => {
  const wasSelected = prev.activeEditIndex === prev.index;
  const isSelected = next.activeEditIndex === next.index;
  
  if (wasSelected !== isSelected) return false; 
  
  return (
    prev.item === next.item &&
    prev.cols === next.cols &&
    prev.isEditable === next.isEditable &&
    prev.index === next.index
  );
});