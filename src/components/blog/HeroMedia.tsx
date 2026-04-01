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

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  return reduced;
}

function useSaveData() {
  const [saveData, setSaveData] = useState(false);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;

    const nav = navigator as Navigator & {
      connection?: {
        saveData?: boolean;
        effectiveType?: string;
      };
      mozConnection?: {
        saveData?: boolean;
        effectiveType?: string;
      };
      webkitConnection?: {
        saveData?: boolean;
        effectiveType?: string;
      };
    };

    const connection =
      nav.connection || nav.mozConnection || nav.webkitConnection || undefined;

    const nextSaveData = Boolean(connection?.saveData);
    const isSlowNetwork =
      connection?.effectiveType === 'slow-2g' ||
      connection?.effectiveType === '2g';

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

  const [isNearViewport, setIsNearViewport] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasMountedVideo, setHasMountedVideo] = useState(false);

  const disableVideo = prefersReducedMotion || saveData;

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setIsNearViewport(true);
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const near = entry.isIntersecting || entry.intersectionRatio > 0;
        const visibleNow = entry.isIntersecting && entry.intersectionRatio >= 0.35;

        setIsNearViewport(near);
        setIsVisible(visibleNow);

        if (near) {
          setHasMountedVideo(true);
        }
      },
      {
        root: null,
        rootMargin: '180px 0px 180px 0px',
        threshold: [0, 0.12, 0.35, 0.6],
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (disableVideo || !isNearViewport) return;
    setHasMountedVideo(true);
  }, [disableVideo, isNearViewport]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || disableVideo || !hasMountedVideo) return;

    if (isVisible) {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          // autoplay pode ser bloqueado em alguns browsers
        });
      }
      return;
    }

    video.pause();

    try {
      video.currentTime = 0;
    } catch {
      // alguns browsers podem impedir ajustes em certos estados
    }
  }, [disableVideo, hasMountedVideo, isVisible]);

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

      {!disableVideo && hasMountedVideo ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          loop
          playsInline
          preload="none"
          poster={posterSrc}
          disablePictureInPicture
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : null}

      {/* overlay estável e leve para legibilidade */}
      <div className="absolute inset-0 bg-white/76 dark:bg-zinc-950/72" />

      {/* leve reforço de contraste sem blur */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/28 via-white/12 to-transparent dark:from-zinc-950/22 dark:via-zinc-950/8 dark:to-transparent" />
    </div>
  );
});