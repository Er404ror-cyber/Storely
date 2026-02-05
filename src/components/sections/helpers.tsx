import React from 'react';
import type { MediaItem } from '../../types/library';
import { toast } from 'react-hot-toast'; // Certifique-se de ter o react-hot-toast instalado


export const MAX_FILE_SIZE_MB = 50;

export const getTheme = (theme: string | undefined) => 
  theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900';

// No seu arquivo de helpers
export const getFontSize = (size: string = 'medium', type: 'h1' | 'h2' | 'h3' | 'p' = 'h1') => {
  const sizes: any = {
    h1: { small: 'text-3xl', medium: 'text-5xl', large: 'text-7xl' },
    h2: { small: 'text-2xl', medium: 'text-4xl', large: 'text-6xl' },
    h3: { small: 'text-xl', medium: 'text-2xl', large: 'text-4xl' },
    p:  { small: 'text-sm',  medium: 'text-base', large: 'text-lg' }
  };

  // Fallback de segurança: se o tipo não existir, usa h1. Se o tamanho não existir, usa medium.
  const selectedType = sizes[type] || sizes['h1'];
  return selectedType[size] || selectedType['medium'];
};

export const editableProps = (isEditable: boolean, onBlur: (val: string) => void) => ({
  contentEditable: isEditable,
  suppressContentEditableWarning: true,
  onBlur: (e: React.FocusEvent<HTMLElement>) => onBlur(e.currentTarget.innerText),
  className: `outline-none focus:ring-2 focus:ring-blue-500/40 rounded px-1 transition-all`
});


export const handleMultipleUploads = async (
  files: FileList, 
  currentItems: MediaItem[],
  indexToReplace: number | null = null, // Se vier index, ele substitui
  callback: (newMedia: MediaItem[]) => void
) => {
  const limit = 10;
  const filesArray = Array.from(files);
  
  const uploadPromises = filesArray.map(file => {
    return new Promise<MediaItem>((resolve) => {
      const isVideo = file.type.startsWith('video');
      const reader = new FileReader();
      reader.onload = (e) => {
        let result = e.target?.result as string;
        if (isVideo) result = result.replace(/^data:video\/[^;]+;/, 'data:video/mp4;');
        resolve({
          id: crypto.randomUUID(),
          url: result,
          type: isVideo ? 'video' : 'image'
        });
      };
      reader.readAsDataURL(file);
    });
  });

  const newResults = await Promise.all(uploadPromises);
  let finalArray = [...currentItems];

  if (indexToReplace !== null) {
    // Modo Substituir 1 foto
    finalArray[indexToReplace] = newResults[0];
  } else {
    // Modo Adicionar várias
    finalArray = [...finalArray, ...newResults].slice(0, limit);
  }

  callback(finalArray);
};
export const handleFileUpload = (
  file: File, 
  callback: (media: MediaItem) => void
) => {
  const isVideo = file.type.startsWith('video');
  const reader = new FileReader();

  reader.onload = (e) => {
    let result = e.target?.result as string;
    
    if (isVideo) {
      // Força o cabeçalho data:video/mp4 independente do formato original
      result = result.replace(/^data:video\/[^;]+;/, 'data:video/mp4;');
      callback({ url: result, type: 'video' });
    } else {
      callback({ url: result, type: 'image' });
    }
  };
  reader.readAsDataURL(file);
};
export const MediaRenderer: React.FC<{ 
  media?: { url: string; type: 'image' | 'video' }; 
  className: string;
  isVisivel?: boolean;
}> = ({ media, className, isVisivel }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (media?.type === 'video' && videoRef.current) {
      if (isVisivel) {
        videoRef.current.play().catch(() => {}); // Play automático se visível
      } else {
        videoRef.current.pause();
      }
    }
  }, [isVisivel, media?.type]);

  if (!media?.url) return <div className={`${className} bg-slate-200 animate-pulse rounded-3xl`} />;

  if (media.type === 'video') {
    return (
      <video 
        ref={videoRef}
        className={className}
        muted loop playsInline preload="metadata"
        style={{ objectFit: 'cover', width: '100%' }}
      >
        <source src={media.url} type="video/mp4" />
      </video>
    );
  }
  return <img src={media.url} className={className} alt="" loading="lazy" style={{ width: '100%' }} />;
};