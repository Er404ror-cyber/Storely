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

/* =========================================================================
   ULTRA-LOW POWER VIDEO ENGINE (SAFE GPU CLEANUP, NO BLACK SCREEN)
========================================================================= */

const visibleMap = new Map<HTMLVideoElement, number>();
const videoOrderMap = new WeakMap<HTMLVideoElement, number>();

let playing: HTMLVideoElement | null = null;
let playIndex = 0;
let rafPending = false;
let token = 0;

const hardPauseAll = () => {
  visibleMap.forEach((_, v) => {
    if (!v.paused) {
      try {
        v.pause();
      } catch {}
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

  if (playing === next && !next.paused) return;

  const currentToken = ++token;
  hardPauseAll();
  playing = next;

  requestAnimationFrame(() => {
    if (currentToken !== token || !next.isConnected) return;
    
    // Tenta reproduzir apenas se estiver pronto ou pronto para carregar
    const playPromise = next.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Ignora silenciosamente bloqueios nativos de autoplay
      });
    }
  });
};

const schedule = () => {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(flush);
};

const register = (video: HTMLVideoElement, order: number) => {
  visibleMap.set(video, order);
  schedule();
};

const unregister = (video: HTMLVideoElement) => {
  const wasPlaying = playing === video;
  visibleMap.delete(video);
  if (wasPlaying) {
    try {
      video.pause();
    } catch {}
    playing = null;
  }
  schedule();
};

const playNext = () => {
  playIndex++;
  schedule();
};

/* ===== Global Visibility Observer ===== */
let globalObserver: IntersectionObserver | null = null;

const getObserver = () => {
  if (!globalObserver && typeof window !== 'undefined') {
    globalObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting && video.isConnected) {
            const order = videoOrderMap.get(video) ?? 0;
            register(video, order);
          } else {
            unregister(video);
          }
        });
      },
      { threshold: 0.2, rootMargin: '50px' } 
    );

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        hardPauseAll();
        playing = null;
      } else {
        schedule();
      }
    }, { passive: true });
  }
  return globalObserver;
};

/* =========================================================================
                                COMPONENT
========================================================================= */

let orderCounter = 0;

const MediaRendererComponent: React.FC<MediaRendererProps> = ({ 
  media, 
  className = '', 
  isEditable = false 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const order = useRef(orderCounter++);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [media?.url]);

  useEffect(() => {
    if (!media?.url || media.type !== 'video' || isEditable || hasError) return;
  
    const video = videoRef.current;
    if (!video) return;

    videoOrderMap.set(video, order.current);
    const observer = getObserver();
    if (observer) {
      observer.observe(video);
    }
    
    const handleEnded = () => playNext();
    video.addEventListener('ended', handleEnded);
  
    return () => {
      video.removeEventListener('ended', handleEnded);
      
      if (observer) {
        observer.unobserve(video);
      }
      unregister(video);

      // Pausa limpa sem corromper o src do elemento nativo
      try {
        video.pause();
        video.currentTime = 0;
      } catch {}
    };
  }, [media?.url, media?.type, isEditable, hasError]);
  
  /* =========================
          RENDER
  ========================= */

  if (!media?.url) {
    return <div className={`${className} bg-zinc-200 dark:bg-zinc-800`} />;
  }

  const sharedStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'block',
    objectFit: 'cover',
    pointerEvents: isEditable ? 'none' : 'auto',
  };

  if (media.type === 'video') {
    if (hasError && isEditable) {
      return (
        <div 
          className={`${className} bg-slate-900 flex flex-col items-center justify-center p-6 text-center`} 
          style={sharedStyles}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
          <span className="text-white text-[11px] font-bold">Pré-visualização Indisponível</span>
          <span className="text-slate-400 text-[10px] mt-1 max-w-[80%] leading-tight">
            Formato não suportado localmente.<br/>Funcionará perfeitamente após sincronizar.
          </span>
        </div>
      );
    }

    return (
      <div className="relative w-full h-full overflow-hidden bg-zinc-200 dark:bg-zinc-900">
        <video
          ref={videoRef}
          src={media.url}
          className={className}
          muted
          playsInline 
          loop
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          style={sharedStyles}
          autoPlay={false} 
          controls={false} 
          onError={() => setHasError(true)} 
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-zinc-200 dark:bg-zinc-900">
      <img
        ref={imgRef}
        src={media.url}
        className={className}
        alt="Media"
        loading="lazy"
        decoding="async" 
        style={sharedStyles}
        onError={() => setHasError(true)}
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