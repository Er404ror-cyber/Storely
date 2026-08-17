import React, { useRef, useEffect, memo, useState } from 'react';

export interface MediaData {
  url: string; 
  type: 'image' | 'video';
}

export interface MediaRendererProps {
  media?: MediaData;
  className?: string;
  isEditable?: boolean;
}

/* =========================
   ULTRA LOW POWER ENGINE
========================= */

const visibleMap = new Map<HTMLVideoElement, number>();
const videoOrderMap = new WeakMap<HTMLVideoElement, number>();

let playing: HTMLVideoElement | null = null;
let playIndex = 0;
let rafPending = false;
let token = 0;

/* ===== Utilities ===== */

const hardPauseAll = () => {
  visibleMap.forEach((_, v) => {
    if (!v.paused) {
      v.pause();
      v.removeAttribute('controls'); 
    }
  });
};

const buildQueue = () =>
  [...visibleMap.entries()]
    .sort((a, b) => a[1] - b[1])
    .map(([v]) => v);

const flush = () => {
  rafPending = false;
  const queue = buildQueue();

  if (!queue.length) {
    hardPauseAll();
    playing = null;
    playIndex = 0;
    return;
  }

  if (playIndex >= queue.length) playIndex = 0;
  const next = queue[playIndex];

  if (playing === next) return;

  const my = ++token;
  hardPauseAll();
  playing = next;

  requestAnimationFrame(() => {
    if (my !== token) return;
    next.play().catch(() => {
      // Evita erros no console caso o autoplay seja bloqueado pelo celular
    });
  });
};

const schedule = () => {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(flush);
};

const register = (video: HTMLVideoElement, order: number) => {
  visibleMap.set(video, order);
  if (!playing) schedule();
};

const unregister = (video: HTMLVideoElement) => {
  const was = playing === video;
  visibleMap.delete(video);
  if (was) playIndex++;
  schedule();
};

const playNext = () => {
  playIndex++;
  schedule();
};

/* ===== Global Observer ===== */
let globalObserver: IntersectionObserver | null = null;

const getObserver = () => {
  if (!globalObserver && typeof window !== 'undefined') {
    globalObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            const order = videoOrderMap.get(video) ?? 0;
            register(video, order);
          } else {
            unregister(video);
            video.pause();
          }
        });
      },
      { threshold: 0.5, rootMargin: '100px' } 
    );
  }
  return globalObserver;
};

/* =========================
        COMPONENT
========================= */

let orderCounter = 0;

const MediaRendererComponent: React.FC<MediaRendererProps> = ({ media, className = '', isEditable = false }) => {
  const ref = useRef<HTMLVideoElement | HTMLImageElement>(null);
  const order = useRef(orderCounter++);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [media?.url]);

  useEffect(() => {
    if (!media?.url || media.type !== 'video' || isEditable || hasError) return;
  
    const video = ref.current as HTMLVideoElement;
    if (!video) return;

    videoOrderMap.set(video, order.current);
    const observer = getObserver();
    if (!observer) return;
    
    observer.observe(video);
    video.onended = playNext; 
  
    return () => {
      observer.unobserve(video);
      unregister(video);
      video.pause();
    };
  }, [media?.url, media?.type, isEditable, hasError]);
  
  /* =========================
          RENDER
  ========================= */

  if (!media?.url) {
    return <div className={`${className} bg-zinc-200 dark:bg-zinc-800`} style={{ contain: 'layout paint' }} />;
  }

  // OTIMIZAÇÃO SEGURA: Aceleração por GPU sem layout shift
  const sharedStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'block',
    backfaceVisibility: 'hidden',
    pointerEvents: isEditable ? 'none' : 'auto'
  };

  if (media.type === 'video') {
    const isBlob = media.url.startsWith('blob:');
    
    const videoSrc = isBlob 
      ? media.url.split('#')[0] 
      : (media.url.includes('#t=') ? media.url : `${media.url}#t=0.001`);

    if (hasError && isEditable) {
      return (
        <div 
          className={`${className} bg-slate-900 flex flex-col items-center justify-center p-6 text-center`} 
          style={{ ...sharedStyles, contain: 'layout paint' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
          <span className="text-white text-[11px] font-bold">Pré-visualização Indisponível</span>
          <span className="text-slate-400 text-[10px] mt-1 max-w-[80%] leading-tight">
            Formato não suportado localmente.<br/>Funcionará perfeitamente após sincronizar.
          </span>
        </div>
      );
    }

    return (
      <div className="relative w-full h-full overflow-hidden" style={{ contain: 'layout paint' }}>
        {/* Skeleton Shimmer enquanto o primeiro frame do vídeo não carrega */}
        <div
          className={`absolute inset-0 z-0 bg-zinc-300/70 dark:bg-zinc-800/70 animate-pulse transition-opacity duration-500 ease-out ${
            isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        />

        <video
          key={videoSrc} 
          ref={ref as React.RefObject<HTMLVideoElement>}
          src={videoSrc}
          className={`${className} transition-opacity duration-500 ease-out transform-gpu ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          muted
          playsInline 
          preload={isBlob ? "auto" : "metadata"}
          crossOrigin={isBlob ? undefined : "anonymous"}
          disablePictureInPicture
          disableRemotePlayback
          style={sharedStyles}
          autoPlay={false} 
          controls={false} 
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }} 
          onLoadedData={(e) => {
            setIsLoaded(true);
            try {
              if (e.currentTarget.currentTime === 0) {
                e.currentTarget.currentTime = 0.001;
              }
            } catch (err) {
              // Ignora silenciosamente se o navegador bloquear o salto de frame
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ contain: 'layout paint' }}>
      {/* Skeleton Shimmer para imagem */}
      <div
        className={`absolute inset-0 z-0 bg-zinc-300/70 dark:bg-zinc-800/70 animate-pulse transition-opacity duration-500 ease-out ${
          isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      />

      <img
        ref={ref as React.RefObject<HTMLImageElement>}
        src={media.url}
        className={`${className} transition-opacity duration-500 ease-out transform-gpu ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        alt="Hero media"
        loading="lazy"
        decoding="async" 
        style={sharedStyles}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
      />
    </div>
  );
};

export const MediaRenderer = memo(MediaRendererComponent, (prev, next) => {
  return (
    prev.media?.url === next.media?.url && 
    prev.media?.type === next.media?.type &&
    prev.className === next.className &&
    prev.isEditable === next.isEditable
  );
});