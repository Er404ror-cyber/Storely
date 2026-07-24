import { memo, useMemo } from 'react';
import type { JSX } from 'react';

interface GallerySkeletonProps {
  cols: string;
  count?: number;
}

export const GallerySkeleton = memo(function GallerySkeleton({ 
  cols, 
  count = 6 
}: GallerySkeletonProps): JSX.Element {
  
  // Imita exatamente a lógica de colunas do componente real
  const containerLayoutClass = useMemo(() => {
    if (cols === '1') return 'grid grid-cols-4 md:grid-cols-8 gap-2 w-full';
    if (cols === '2') return 'grid grid-cols-3 md:grid-cols-4 gap-2 w-full';
    return 'columns-2 sm:columns-3 lg:columns-4 xl:columns-4 gap-3 w-full block';
  }, [cols]);

  // Cria um array falso com a quantidade de itens para carregar
  const mockItems = Array.from({ length: count });

  // Alturas aleatórias estáticas para o modo Pinterest parecer natural
  const pinterestHeights = ['h-[120px]', 'h-[220px]', 'h-[160px]', 'h-[250px]', 'h-[190px]', 'h-[140px]'];

  return (
    <div 
      className={containerLayoutClass} 
      style={{ contentVisibility: 'auto', contain: 'layout paint' }} // Otimização de bateria
    >
      {mockItems.map((_, index) => {
        let itemClass = '';

        // Imita as dimensões do GridItem.tsx original
        if (cols === '1') {
          itemClass = index === 0 
            ? 'col-span-4 md:row-span-2 md:col-span-6 aspect-[9/8] md:aspect-[16/9]' 
            : 'col-span-2 md:col-span-2 aspect-[4/3] md:aspect-[6/5]';
        } else if (cols === '2') {
          itemClass = index === 0 
            ? 'col-span-2 row-span-3 md:col-span-2 md:row-span-3 h-full min-h-[200px]' 
            : 'col-span-1 aspect-[6/5] md:aspect-[4/3]';
        } else {
          // Layout Pinterest (Masonry)
          itemClass = `break-inside-avoid-column inline-block w-full mb-2 ${pinterestHeights[index % pinterestHeights.length]}`;
        }

        return (
          <div 
            key={index}
            className={`
              relative rounded-2xl overflow-hidden 
              bg-zinc-300 dark:bg-zinc-800 
              animate-pulse transform-gpu
              ${itemClass}
            `}
          >
            {/* Opcional: Adicionar um ícone de imagem leve no centro do placeholder */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <svg className="w-8 h-8 text-zinc-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"/>
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
});