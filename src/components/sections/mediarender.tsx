import React, { useRef, useEffect, memo } from 'react';

export interface MediaData {
  url: string; 
  type: 'image' | 'video';
}

interface MediaRendererProps {
  media?: MediaData;
  className?: string;
}

/* =========================
   ULTRA LOW POWER ENGINE
========================= */

const visibleMap = new Map<HTMLVideoElement, number>();
const videoOrderMap = new WeakMap<HTMLVideoElement, number>(); // Otimização: Mapeamento sem poluir o DOM

let playing: HTMLVideoElement | null = null;
let playIndex = 0;
let rafPending = false;
let token = 0;

/* ===== Utilities ===== */

const hardPauseAll = () => {
  visibleMap.forEach((_, v) => {
    if (!v.paused) {
      v.pause();
      v.removeAttribute('controls'); // Segurança extra para evitar repinturas de UI nativa
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

  // Usa requestAnimationFrame para iniciar o vídeo sincronizado com a taxa de atualização da tela (poupa bateria)
  requestAnimationFrame(() => {
    if (my !== token) return;
    next.play().catch(() => {
      // Ignora erros de autoplay (ex: usuário ainda não interagiu com a página)
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

/* ===== Global Observer (Otimização de CPU) ===== */
// Instância única para toda a aplicação. Muito mais leve do que um por componente.
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
      { threshold: 0.6, rootMargin: '160px' }
    );
  }
  return globalObserver;
};

/* =========================
        COMPONENT
========================= */

let orderCounter = 0;

const MediaRendererComponent: React.FC<MediaRendererProps> = ({ media, className = '' }) => {
  const ref = useRef<HTMLVideoElement | HTMLImageElement>(null);
  const order = useRef(orderCounter++);
  const hoverTimer = useRef<number | null>(null);

  // Memoiza a verificação da rota para não rodar regex em todo render
  const isEditor = React.useMemo(() => 
    typeof window !== 'undefined' && /^\/admin\/editor\/[^/]+/.test(window.location.pathname), 
  []);

  useEffect(() => {
    if (!media?.url || media.type !== 'video' || isEditor) return;
  
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
  }, [media?.url, media?.type, isEditor]);
  

  /* ===== Editor hover (Mouse events) ===== */
  useEffect(() => {
    if (!media?.url || media.type !== 'video' || !isEditor) return;
  
    const video = ref.current as HTMLVideoElement;
    if (!video) return;
  
    const onEnter = () => {
      hoverTimer.current = window.setTimeout(() => {
        register(video, order.current);
      }, 1000); // Reduzi para 1s para parecer mais responsivo no editor
    };
  
    const onLeave = () => {
      if (hoverTimer.current) {
        clearTimeout(hoverTimer.current);
        hoverTimer.current = null;
      }
      unregister(video);
      video.pause();
    };
  
    video.addEventListener('mouseenter', onEnter, { passive: true });
    video.addEventListener('mouseleave', onLeave, { passive: true });
    video.onended = playNext;
  
    return () => {
      video.removeEventListener('mouseenter', onEnter);
      video.removeEventListener('mouseleave', onLeave);
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      unregister(video);
      video.pause();
    };
  }, [media?.url, media?.type, isEditor]);
  

  /* =========================
          RENDER
  ========================= */

  if (!media?.url) {
    return <div className={`${className} bg-zinc-200 dark:bg-zinc-800`} />;
  }

  // Estilos comuns focados em performance
  const sharedStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    // 'contentVisibility' diz ao browser para não renderizar o que está fora da tela (Salva muita GPU)
    contentVisibility: 'auto',
    contain: 'layout paint style'
  };

  if (media.type === 'video') {
    // Truque do Fragmento (#t=0.001) para forçar o thumbnail sem baixar tudo
    const videoSrc = media.url.includes('#t=') ? media.url : `${media.url}#t=0.001`;

    return (
      <video
        ref={ref as React.RefObject<HTMLVideoElement>}
        className={className}
        muted
        playsInline
        preload="metadata" // Essencial: não baixa o vídeo inteiro à toa
        crossOrigin="anonymous"
        disablePictureInPicture // Poupa recursos no background
        disableRemotePlayback   // Evita buscas de dispositivos (AirPlay/Chromecast)
        style={sharedStyles}
        onLoadedMetadata={(e) => {
          // Fallback para iOS/Safari garantirem a pintura do primeiro frame
          if (e.currentTarget.currentTime === 0) {
            e.currentTarget.currentTime = 0.001;
          }
        }}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
    );
  }

  return (
    <img
      ref={ref as React.RefObject<HTMLImageElement>}
      src={media.url}
      className={className}
      alt="Media content"
      loading="lazy"
      decoding="async" // Tira o trabalho de decodificação de imagem da thread principal
      style={sharedStyles}
    />
  );
};

// Exportamos usando React.memo para evitar que a Galeria re-renderize as mídias à toa
export const MediaRenderer = memo(MediaRendererComponent, (prev, next) => {
  return prev.media?.url === next.media?.url && prev.className === next.className;
});