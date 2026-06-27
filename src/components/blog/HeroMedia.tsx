import { memo, useEffect, useRef, useState } from 'react';

type HeroBackgroundMediaProps = {
  videoSrc: string; 
  posterSrc: string;
  className?: string;
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);

    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return reduced;
}

function useSaveData() {
  const [saveData, setSaveData] = useState(false);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;

    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    };

    const connection = nav.connection;
    const nextSaveData = Boolean(connection?.saveData);
    const isSlowNetwork = connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g';

    setSaveData(nextSaveData || isSlowNetwork);
  }, []);

  return saveData;
}

export const HeroBackgroundMedia = memo(function HeroBackgroundMedia({
  videoSrc,
  posterSrc,
  className = '',
}: HeroBackgroundMediaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const prefersReducedMotion = usePrefersReducedMotion();
  const saveData = useSaveData();
  const disableVideo = prefersReducedMotion || saveData;

  const [videoState, setVideoState] = useState({
    hasMounted: false,
    isVisible: false,
  });

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setVideoState({ hasMounted: true, isVisible: true });
      return;
    }
  
    // Ajustado para 30% de visibilidade
    const MIN_VISIBILITY_RATIO = 0.30;
  
    const observer = new IntersectionObserver(
      ([entry]) => {
        const near = entry.isIntersecting;
        
        // Só considera visível se tiver pelo menos 30% na tela
        const visibleNow = entry.isIntersecting && entry.intersectionRatio >= MIN_VISIBILITY_RATIO;
  
        setVideoState(prev => {
          const nextMounted = prev.hasMounted || near;
          if (prev.hasMounted === nextMounted && prev.isVisible === visibleNow) {
            return prev;
          }
          return { hasMounted: nextMounted, isVisible: visibleNow };
        });
      },
      {
        root: null,
        rootMargin: '0px', // Sem margens externas para não distorcer o cálculo dos 30%
        threshold: [0, MIN_VISIBILITY_RATIO], // Monitora a entrada e o corte de 30%
      }
    );
  
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // CORREÇÃO: Controle nativo de Play/Pause sem quebrar as tags <source>
  useEffect(() => {
    const video = videoRef.current;
    if (!video || disableVideo || !videoState.hasMounted) return;

    if (videoState.isVisible) {
      // O play() nativo do navegador é assíncrono
      video.play().catch(() => {
        // Evita logs de erro se o autoplay for bloqueado temporariamente
      });
    } else {
      // Apenas pausar nativamente poupa 100% de CPU/GPU sem quebrar o player
      video.pause();
    }
  }, [disableVideo, videoState.hasMounted, videoState.isVisible]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <img
        src={posterSrc}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        decoding="async"
        fetchPriority="high"
      />

      {!disableVideo && videoState.hasMounted ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          loop
          playsInline
          preload="none"
          poster={posterSrc}
          disablePictureInPicture
          disableRemotePlayback
        >
          {/* WebM primeiro por performance de processamento */}
          <source src={`${videoSrc}.webm`} type="video/webm" />
          <source src={`${videoSrc}.mp4`} type="video/mp4" />
        </video>
      ) : null}

      <div className="absolute inset-0 bg-black/72 dark:bg-zinc-950/72" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/28 via-white/12 to-transparent dark:from-zinc-950/22 dark:via-zinc-950/8 dark:to-transparent" />
    </div>
  );
});