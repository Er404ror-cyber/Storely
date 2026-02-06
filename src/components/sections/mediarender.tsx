import React, { useRef, useEffect } from 'react';

export interface MediaData {
  url: string; 
  type: 'image' | 'video';
}

interface MediaRendererProps {
  media?: MediaData;
  className: string;
}
/* =========================
   ULTRA LOW POWER ENGINE
========================= */

const visibleMap = new Map<HTMLVideoElement, number>();
let playing: HTMLVideoElement | null = null;
let playIndex = 0;
let rafPending = false;
let token = 0;

/* ===== Utilities ===== */

const hardPauseAll = () => {
  visibleMap.forEach((_, v) => {
    if (!v.paused) v.pause();
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
    next.play().catch(() => {});
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

/* =========================
        COMPONENT
========================= */

let orderCounter = 0;

export const MediaRenderer: React.FC<MediaRendererProps> = ({ media, className }) => {
  const ref = useRef<HTMLVideoElement | HTMLImageElement>(null);
  const order = useRef(orderCounter++);
  const hoverTimer = useRef<number | null>(null);

  const isEditor = /^\/admin\/editor\/[^/]+/.test(location.pathname);

  /* ===== Normal pages ===== */

  useEffect(() => {
    if (!media?.url || media.type !== 'video' || isEditor) return;
  
    const video = ref.current as HTMLVideoElement;
    if (!video) return;
  
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          register(video, order.current);
        } else {
          unregister(video);
          video.pause();
        }
      },
      { threshold: 0.6, rootMargin: '160px' }
    );
  
    observer.observe(video);
    video.onended = playNext;
  
    return () => {
      observer.disconnect();
      unregister(video);
      video.pause();
    };
  }, [media?.url, media?.type, isEditor]);
  

  /* ===== Editor hover ===== */

  useEffect(() => {
    if (!media?.url || media.type !== 'video' || !isEditor) return;
  
    const video = ref.current as HTMLVideoElement;
    if (!video) return;
  
    const onEnter = () => {
      hoverTimer.current = window.setTimeout(() => {
        register(video, order.current);
      }, 2000);
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
  

  /* ========================= */

  if (!media?.url) {
    return <div className={`${className} bg-slate-200`} />;
  }

  if (media.type === 'video') {
    return (
      <video
        ref={ref as React.RefObject<HTMLVideoElement>}
        className={className}
        muted
        playsInline
        preload="metadata"
        crossOrigin="anonymous"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          contain: 'layout paint style'
        }}
      >
        <source src={media.url} type="video/mp4" />
      </video>
    );
  }

  return (
    <img
      ref={ref as React.RefObject<HTMLImageElement>}
      src={media.url}
      className={className}
      alt=""
      loading="lazy"
      decoding="async"
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        objectFit: 'cover',
        contain: 'layout paint style'
      }}
    />
  );
};
