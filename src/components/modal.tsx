import React, { 
  useEffect, 
  useRef, 
  useState, 
  useCallback,
  type MouseEvent, 
  type ChangeEvent,
  type TouchEvent,
  type WheelEvent
} from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize2, Share2, Check, Minimize2, ZoomOut, ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';
import type { MediaItem } from '../types/library';

interface MediaModalProps {
  media: MediaItem | null;
  onClose: () => void;
  t: (key: string | any, ...args: any[]) => string;
}

export const MediaModal: React.FC<MediaModalProps> = ({ media, onClose, t }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeAnimTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [videoProgress, setVideoProgress] = useState<number>(0);

  // States para Zoom e Pan
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // States para Swipe-to-Close suave
  const [swipeY, setSwipeY] = useState<number>(0);
  const [isSwiping, setIsSwiping] = useState<boolean>(false);

  // Refs de auxílio
  const initialDistance = useRef<number>(0);
  const initialScale = useRef<number>(1);
  const lastPosition = useRef({ x: 0, y: 0 });
  const initialTouch = useRef({ x: 0, y: 0 });
  const touchStartY = useRef<number>(0);
  const hasMoved = useRef<boolean>(false);

  const handleInteraction = useCallback((): void => {
    setVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
    }, 3000);
  }, []);

  // 1. Resetar estados e disparar timer SEMPRE que uma nova mídia for aberta
  useEffect(() => {
    if (media) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setSwipeY(0);
      setIsSwiping(false);
      setIsDragging(false);
      handleInteraction(); // Garante que inicia a contagem de 3s logo na abertura
    }
    
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (closeAnimTimerRef.current) clearTimeout(closeAnimTimerRef.current);
    };
  }, [media, handleInteraction]);

  const toggleVisibility = (e: React.MouseEvent | React.TouchEvent): void => {
    e.stopPropagation();
    if (hasMoved.current) return;
    setVisible((prev) => {
      const nextState = !prev;
      if (nextState) {
        handleInteraction();
      } else if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      return nextState;
    });
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const getDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getMidpoint = (touches: React.TouchList) => ({
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2
  });

  // --- LÓGICA DE GESTOS ---
  const onTouchStart = (e: TouchEvent) => {
    handleInteraction();
    hasMoved.current = false;

    if (e.touches.length === 2) {
      setIsSwiping(false);
      setIsDragging(true);
      initialDistance.current = getDistance(e.touches);
      initialScale.current = scale;
    } else if (e.touches.length === 1) {
      touchStartY.current = e.touches[0].clientY;
      initialTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      
      if (scale === 1) {
        setIsSwiping(true);
        setIsDragging(false);
      } else {
        setIsSwiping(false);
        setIsDragging(true);
        lastPosition.current = { ...position };
      }
    }
  };

  const onTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      hasMoved.current = true;
      const dist = getDistance(e.touches);
      const targetScale = Math.min(Math.max(1, initialScale.current * (dist / initialDistance.current)), 4);
      
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const mid = getMidpoint(e.touches);
        const center = { x: rect.width / 2, y: rect.height / 2 };
        const factor = targetScale / scale - 1;
        const dx = (mid.x - center.x - position.x) * factor;
        const dy = (mid.y - center.y - position.y) * factor;
        setPosition((prev) => ({ x: prev.x - dx, y: prev.y - dy }));
      }
      setScale(targetScale);
    } else if (e.touches.length === 1) {
      if (scale > 1 && isDragging) {
        hasMoved.current = true;
        const deltaX = e.touches[0].clientX - initialTouch.current.x;
        const deltaY = e.touches[0].clientY - initialTouch.current.y;
        setPosition({
          x: lastPosition.current.x + deltaX,
          y: lastPosition.current.y + deltaY
        });
      } else if (scale === 1 && isSwiping) {
        const deltaY = e.touches[0].clientY - touchStartY.current;
        if (Math.abs(deltaY) > 10) hasMoved.current = true;
        setSwipeY(deltaY);
      }
    }
  };

  const onTouchEnd = () => {
    if (scale === 1 && isSwiping) {
      if (Math.abs(swipeY) > 100) {
        const direction = swipeY > 0 ? 1 : -1;
        setSwipeY(direction * window.innerHeight);
        
        closeAnimTimerRef.current = setTimeout(() => {
          onClose();
          setTimeout(() => setSwipeY(0), 50); 
        }, 200);
      } else {
        setSwipeY(0);
      }
    } else if (scale < 1) {
      resetZoom();
    }

    setIsDragging(false);
    setIsSwiping(false);
    setTimeout(() => { hasMoved.current = false; }, 50);
  };

  const onWheel = (e: WheelEvent) => {
    const delta = e.deltaY * -0.005;
    const newScale = Math.min(Math.max(1, scale + delta), 4);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const center = { x: rect.width / 2, y: rect.height / 2 };
      const factor = newScale / scale - 1;
      const dx = (e.clientX - center.x - position.x) * factor;
      const dy = (e.clientY - center.y - position.y) * factor;
      setPosition((prev) => ({ x: prev.x - dx, y: prev.y - dy }));
    }
    setScale(newScale);
    if (newScale === 1) setPosition({ x: 0, y: 0 });
  };

  const handleDoubleClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (scale > 1) {
      resetZoom();
    } else {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const center = { x: rect.width / 2, y: rect.height / 2 };
        const targetScale = 2.5;
        const factor = targetScale - 1;
        const dx = (e.clientX - center.x) * factor;
        const dy = (e.clientY - center.y) * factor;
        setPosition({ x: -dx, y: -dy });
        setScale(targetScale);
      }
    }
  };

  const resetZoom = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    setScale(1);
    setPosition({ x: 0, y: 0 });
    handleInteraction();
  };

  const handleShare = async (e: MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.stopPropagation();
    if (!media?.url) return;
    const currentUrl = window.location.href;
    const shareText = t('share_text') || 'Dá uma vista de olhos neste conteúdo!';

    try {
      if (navigator.share) {
        let fileToShare: File | null = null;
        try {
          const response = await fetch(media.url);
          const blob = await response.blob();
          const ext = media.url.split('.').pop()?.split('?')[0] || (media.type === 'video' ? 'mp4' : 'jpg');
          const mimeType = blob.type || (media.type === 'video' ? 'video/mp4' : 'image/jpeg');
          fileToShare = new File([blob], `media.${ext}`, { type: mimeType });
        } catch (fetchErr) {
          console.warn("Falha no ficheiro, enviando link.", fetchErr);
        }

        if (fileToShare && navigator.canShare && navigator.canShare({ files: [fileToShare] })) {
          await navigator.share({ title: 'Portfólio', text: shareText, url: currentUrl, files: [fileToShare] });
          return;
        }
        await navigator.share({ title: 'Portfólio', text: shareText, url: currentUrl });
      } else {
        const copyContent = `${shareText}\n\nSite: ${currentUrl}\nMídia: ${media.url}`;
        await navigator.clipboard.writeText(copyContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') console.error(err);
    }
  };

  const toggleFullscreen = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    const elem = containerRef.current;
    const video = videoRef.current;
    if (!document.fullscreenElement) {
      if (elem?.requestFullscreen) elem.requestFullscreen();
      else if (video && (video as any).webkitEnterFullscreen) (video as any).webkitEnterFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const togglePlay = (e?: React.MouseEvent): void => {
    if (e) e.stopPropagation();
    const v = videoRef.current;
    if (v) {
      if (v.paused) v.play();
      else v.pause();
    }
    handleInteraction();
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(progress || 0);
    }
  };

  const handleProgressChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (videoRef.current) {
      const time = (Number(e.target.value) / 100) * videoRef.current.duration;
      videoRef.current.currentTime = time;
      setVideoProgress(Number(e.target.value));
    }
    handleInteraction();
  };

  if (!media) return null;

  const bgOpacity = Math.max(0, 1 - Math.abs(swipeY) / 300);

  return createPortal(
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[10000] overflow-hidden flex items-center justify-center touch-none transition-colors duration-200"
      style={{ 
        backgroundColor: `rgba(0, 0, 0, ${bgOpacity})`,
        contain: 'strict' 
      }}
      onMouseMove={handleInteraction}
      onClick={() => { if (!hasMoved.current) onClose(); }}
    >
      {scale === 1 && (
        <div 
          className={`absolute top-2 left-1/2 -translate-x-1/2 z-[110] flex flex-col items-center gap-1 pointer-events-none transition-all duration-300 ${
            visible && swipeY === 0 ? 'opacity-80 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}
        >
          <div className="w-10 h-1 bg-white/40 rounded-full" />
          <span className="text-[10px] font-medium text-white/70 uppercase tracking-widest flex items-center gap-0.5">
            <ChevronDown size={12} /> {t('swipe_down_to_close') || 'Deslize para fechar'}
          </span>
        </div>
      )}

      <div className={`absolute top-0 left-0 w-full p-4 md:p-8 flex justify-between items-start z-[100] transition-all duration-300 ${visible && swipeY === 0 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="p-2 select-none">
          <span className="text-[10px] md:text-xs font-bold text-white/60 bg-black/50 px-3 py-1.5 rounded-full uppercase tracking-[0.2em]">
            {media.type}
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-3 pointer-events-auto">
          <button 
            onClick={handleShare} 
            className="flex items-center justify-center w-11 h-11 md:w-auto md:px-5 md:py-2.5 bg-zinc-800/80 hover:bg-zinc-700 border border-white/10 rounded-full md:rounded-xl text-white transition-all active:scale-95"
            aria-label="Compartilhar"
          >
            {copied ? <Check size={18} className="text-green-500" /> : <Share2 size={18} />}
          </button>
          
          <button 
            className="flex items-center justify-center gap-2 w-11 h-11 md:w-auto md:px-5 md:py-2.5 bg-white text-black rounded-full md:rounded-xl font-bold active:scale-95 transition-all shadow-lg"
            onClick={(e: MouseEvent) => { e.stopPropagation(); onClose(); }}
          >
            <span className="text-xs hidden md:block uppercase font-black tracking-tighter">
              {t('exit') || 'Sair'}
            </span>
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {scale > 1 && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[150] pointer-events-auto">
          <button
            onClick={resetZoom}
            onTouchEnd={(e) => { e.preventDefault(); resetZoom(e); }}
            className="flex items-center gap-2 px-4 py-2 bg-black/70 border border-white/20 text-white rounded-full shadow-xl hover:bg-black/90 active:scale-95 transition-all animate-in fade-in zoom-in-95"
          >
            <ZoomOut size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {t('reset_zoom') || 'Remover Zoom'}
            </span>
          </button>
        </div>
      )}

      {/* ÁREA DE INTERAÇÃO */}
      <div 
        className="w-full h-full flex items-center justify-center pointer-events-auto overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onWheel={onWheel}
        onDoubleClick={handleDoubleClick}
        onClick={toggleVisibility}
      >
        <div 
          className={`relative flex items-center justify-center w-full h-full will-change-transform ${
            !isDragging && !isSwiping ? 'transition-transform duration-200 ease-out' : ''
          }`}
          style={{ 
            transform: `translate(${position.x}px, ${position.y + swipeY}px) scale(${scale})`,
            cursor: scale > 1 ? 'grab' : 'auto'
          }}
        >
          {media.type === 'video' ? (
            <video 
              ref={videoRef}
              src={media.url}
              autoPlay 
              muted={isMuted}
              loop 
              playsInline
              disablePictureInPicture
              controlsList="nodownload"
              className="w-full h-full object-contain pointer-events-none"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={handleTimeUpdate}
            />
          ) : (
            <img 
              src={media.url} 
              className="w-full h-full object-contain pointer-events-none select-none" 
              alt="Media view" 
              loading="eager"
              decoding="async"
            />
          )}
        </div>
      </div>

      {media.type === 'video' && (
        <div 
          className={`absolute bottom-0 left-0 w-full p-6 pb-8 md:p-8 bg-gradient-to-t from-black via-black/80 to-transparent transition-all duration-300 z-[100] ${visible && swipeY === 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="max-w-3xl mx-auto flex flex-col gap-4">
            <div className="w-full h-1.5 bg-white/20 relative overflow-hidden group rounded-full cursor-pointer">
              <div 
                className="absolute inset-0 bg-white origin-left" 
                style={{ transform: `scaleX(${videoProgress / 100})` }}
              />
              <input
                type="range" min="0" max="100" step="0.1"
                value={videoProgress}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleProgressChange}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 md:gap-6">
                <button onClick={togglePlay} className="text-white hover:scale-110 active:scale-95 transition-transform p-2">
                  {isPlaying ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" />}
                </button>
                <button onClick={() => setIsMuted(!isMuted)} className="text-white/70 hover:text-white transition-colors p-2">
                  {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                </button>
              </div>
              
              <button 
                onClick={toggleFullscreen}
                className="p-2.5 text-white/70 hover:text-white transition-all hover:bg-white/10 rounded-full md:rounded-lg"
              >
                {isFullscreen ? <Minimize2 size={22} /> : <Maximize2 size={22} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};