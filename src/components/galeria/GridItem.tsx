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
  
  // Deteta se estamos no modo Pinterest (nem 1 nem 2 colunas fixas)
  const isPinterest = cols !== '1' && cols !== '2';

  const getItemClass = (): string => {
    // Grelhas Fixas (1 ou 2) - Mantêm proporções rígidas (aspect-ratio) para não quebrar a simetria
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

    // Layout Pinterest (Masonry) orgânico:
    // 1. inline-block: É obrigatório para elementos não serem cortados a meio da coluna.
    // 2. h-auto: Permite que formatos retrato/paisagem coexistam sem cortar nada.
    // 3. min-h-[100px]: Previne que o layout colapse a 0px antes da net carregar a imagem.
    return 'break-inside-avoid-column inline-block w-full mb-4 min-h-[100px] h-auto';
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
      className={`relative rounded-2xl overflow-hidden group border border-zinc-600/60 dark:border-zinc-800/50 
        transition-[transform,box-shadow,border-color,ring-width] duration-300 cursor-pointer shadow-sm transform-gpu
        bg-zinc-200 dark:bg-zinc-900 
        ${isEditable ? 'select-none' : ''}
        ${isSelected && isEditable ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-950 scale-[0.98]' : 'hover:scale-[1.01] hover:shadow-md'}
        ${isTooLarge && isEditable && !isSelected ? 'ring-2 ring-red-500' : ''}
        ${getItemClass()}
      `}
    >
      {/* 
        A Mágica do formato original:
        Se for Pinterest, a div abraça o conteúdo (relative) e a imagem dita a altura (h-auto).
        Se for grelha fixa, forçamos o preenchimento absoluto (absolute inset-0) e cortamos excessos (object-cover).
      */}
      <div className={`${isPinterest ? 'relative w-full' : 'absolute inset-0'} pointer-events-none flex items-center justify-center`}>
        <MediaRenderer
          media={{ url: item.url, type: item.type }}
          className={`w-full transform-gpu group-hover:scale-103 transition-transform duration-500 ease-out block ${
            isPinterest ? 'h-auto object-contain' : 'h-full object-cover'
          }`}
        />
      </div>

      {/* Indicador Numérico de Posição (Editor) */}
      {isEditable && (
        <div className="absolute top-3 left-3 bg-black/70 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md border border-white/10 pointer-events-none z-20">
          {index + 1}
        </div>
      )}

      {/* Badge de tamanho do Ficheiro */}
      {isEditable && (
        <div
          className={`absolute top-3 right-3 px-1.5 py-0.5 rounded text-[8px] font-black z-30 border border-white/10 pointer-events-none shadow-sm ${
            isTooLarge ? 'bg-red-600 text-white' : 'bg-black/80 text-white/90'
          }`}
        >
          {item.size ? `${itemMB.toFixed(1)} MB` : t('gallery_scanning') || 'SCANEANDO...'}
        </div>
      )}

      {/* Ícone de Alerta de Peso */}
      {isTooLarge && isEditable && (
        <div className="absolute top-3 right-3 bg-red-600 text-white p-1.5 rounded-md shadow-md pointer-events-none z-20">
          <ShieldAlert size={12} />
        </div>
      )}

      {/* Badge "NOVO" */}
      {item.isTemp && isEditable && (
        <div className="absolute bottom-3 left-3 bg-blue-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider pointer-events-none shadow-sm z-20">
          {t('gallery_new_badge') || 'NOVO'}
        </div>
      )}

      {/* Overlay de seleção ativa no Editor */}
      {isSelected && isEditable && (
        <div className="absolute inset-0 bg-blue-500/15 dark:bg-blue-500/25 flex items-center justify-center pointer-events-none z-10 transition-opacity">
          <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg transform scale-105">
            <SlidersHorizontal size={14} />
          </div>
        </div>
      )}
    </div>
  );
});

GridItem.displayName = 'GridItem';