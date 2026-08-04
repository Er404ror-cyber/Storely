import { memo, useMemo } from 'react';
import type { JSX } from 'react';

interface GallerySkeletonProps {
  cols: string;
  count?: number;
}

// 1. PERFORMANCE: Movemos este array para FORA do componente.
// Se ficar lá dentro, o React recria este array do zero a cada renderização.
const PINTEREST_HEIGHTS = ['h-[120px]', 'h-[220px]', 'h-[160px]', 'h-[250px]', 'h-[190px]', 'h-[140px]'];

export const GallerySkeleton = memo(function GallerySkeleton({ 
  cols, 
  count = 6 
}: GallerySkeletonProps): JSX.Element {
  
  const containerLayoutClass = useMemo(() => {
    if (cols === '1') return 'grid grid-cols-4 md:grid-cols-8 gap-2 w-full';
    if (cols === '2') return 'grid grid-cols-3 md:grid-cols-4 gap-2 w-full';
    return 'columns-2 sm:columns-3 lg:columns-4 xl:columns-4 gap-3 w-full block';
  }, [cols]);

  // 2. PERFORMANCE: Memoizamos a criação do array.
  // Sem o useMemo, a engine do JavaScript vai alocar espaço para este array sempre que houver um re-render.
  const mockItems = useMemo(() => Array.from({ length: count }), [count]);

  return (
    <div 
      // 3. UX: Adicionamos animate-fade-in (ou transition-opacity) para uma entrada suave
      className={`${containerLayoutClass} transition-opacity duration-700 ease-in-out`} 
    >
      {mockItems.map((_, index) => {
        let itemClass = '';

        if (cols === '1') {
          itemClass = index === 0 
            ? 'col-span-4 md:row-span-2 md:col-span-6 aspect-[9/8] md:aspect-[16/9]' 
            : 'col-span-2 md:col-span-2 aspect-[4/3] md:aspect-[6/5]';
        } else if (cols === '2') {
          itemClass = index === 0 
            ? 'col-span-2 row-span-3 md:col-span-2 md:row-span-3 h-full min-h-[200px]' 
            : 'col-span-1 aspect-[6/5] md:aspect-[4/3]';
        } else {
          itemClass = `break-inside-avoid-column inline-block w-full mb-2 ${PINTEREST_HEIGHTS[index % PINTEREST_HEIGHTS.length]}`;
        }

        return (
          <div 
            key={index}
            className={`
              relative rounded-2xl overflow-hidden 
              bg-zinc-200/80 dark:bg-zinc-800/60 
              animate-pulse 
              transform-gpu will-change-transform
              ${itemClass}
            `}
          >
            {/* 4. UX/DESIGN: Ícone stroke leve invés de fill pesado, opacidade mínima */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] dark:opacity-10">
              <svg className="w-8 h-8 text-zinc-900 dark:text-zinc-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
});