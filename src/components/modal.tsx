import React, { 
  useEffect, 
  useRef, 
  useState, 
  type MouseEvent, 
  type ChangeEvent,
  type TouchEvent,
  type WheelEvent
} from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize2, Share2, Check, Minimize2, ZoomOut } from 'lucide-react';
import { createPortal } from 'react-dom';
import type { MediaItem } from '../types/library';

interface MediaModalProps {
  media: MediaItem | null;
  onClose: () => void;
  t: (key: string) => string;
}

export const MediaModal: React.FC<MediaModalProps> = ({ media, onClose, t }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // States para Zoom e Pan
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Refs de auxílio para os gestos
  const initialDistance = useRef<number>(0);
  const initialScale = useRef<number>(1);
  const lastPosition = useRef({ x: 0, y: 0 });
  const initialTouch = useRef({ x: 0, y: 0 });
  
  // States para Swipe-to-close
  const [touchStartY, setTouchStartY] = useState<number>(0);
  const [touchEndY, setTouchEndY] = useState<number>(0);

  // 1. Controle de Visibilidade
  const handleInteraction = (): void => {
    setVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setVisible(false), 2500);
  };

  const toggleVisibility = (e: React.MouseEvent | React.TouchEvent): void => {
    e.stopPropagation();
    setVisible((prev) => !prev);
    if (!visible) handleInteraction();
  };

  useEffect(() => {
    handleInteraction();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  // 2. Loop de Progresso do Vídeo
  useEffect(() => {
    let frameId: number;
    const step = (): void => {
      if (videoRef.current && progressBarRef.current && isPlaying) {
        const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        progressBarRef.current.style.transform = `scaleX(${(progress || 0) / 100})`;
      }
      frameId = requestAnimationFrame(step);
    };
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying]);

  // 3. Fullscreen Listeners
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 4. Lógica de Gestos: Pinch-to-Zoom, Pan e Swipe-to-close
  const getDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const onTouchStart = (e: TouchEvent) => {
    handleInteraction();
    setIsDragging(true);

    if (e.touches.length === 2) {
      initialDistance.current = getDistance(e.touches);
      initialScale.current = scale;
    } else if (e.touches.length === 1) {
      initialTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastPosition.current = { ...position };
      setTouchStartY(e.touches[0].clientY);
    }
  };

  const onTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = getDistance(e.touches);
      const newScale = Math.min(Math.max(1, initialScale.current * (dist / initialDistance.current)), 5);
      setScale(newScale);
    } else if (e.touches.length === 1) {
      if (scale > 1) {
        const deltaX = e.touches[0].clientX - initialTouch.current.x;
        const deltaY = e.touches[0].clientY - initialTouch.current.y;
        setPosition({
          x: lastPosition.current.x + deltaX,
          y: lastPosition.current.y + deltaY
        });
      } else {
        setTouchEndY(e.touches[0].clientY);
      }
    }
  };

  const onTouchEnd = () => {
    setIsDragging(false);

    if (scale === 1 && touchStartY > 0 && touchEndY > 0) {
      const swipeDistance = touchEndY - touchStartY;
      if (swipeDistance > 75) {
        onClose();
      }
    }
    
    setTouchStartY(0);
    setTouchEndY(0);

    if (scale < 1) {
      resetZoom();
    }
  };

  const onWheel = (e: WheelEvent) => {
    const delta = e.deltaY * -0.01;
    const newScale = Math.min(Math.max(1, scale + delta), 5);
    setScale(newScale);
    if (newScale === 1) setPosition({ x: 0, y: 0 });
  };

  const handleDoubleClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2.5);
    }
  };

  // Função centralizada para remover o Zoom
  const resetZoom = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    setScale(1);
    setPosition({ x: 0, y: 0 });
    handleInteraction();
  };

  // 5. Partilha
  const handleShare = async (e: MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.stopPropagation();
    if (!media?.url) return;
    
    const currentUrl = window.location.href;
    const shareText = t('share_text') || 'Dá uma vista de olhos neste conteúdo!';
    
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Portfólio', text: shareText, url: currentUrl });
      } else {
        const copyContent = `${shareText}\n\nSite: ${currentUrl}\nMídia: ${media.url}`;
        await navigator.clipboard.writeText(copyContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') console.error("Erro ao compartilhar:", err);
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

  const handleProgressChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (videoRef.current) {
      const time = (Number(e.target.value) / 100) * videoRef.current.duration;
      videoRef.current.currentTime = time;
    }
    handleInteraction();
  };

  if (!media) return null;

  return createPortal(
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[10000] bg-black overflow-hidden flex items-center justify-center touch-none transition-opacity"
      style={{ contain: 'strict' }}
      onMouseMove={handleInteraction}
      onClick={onClose}
    >
      {/* HEADER */}
      <div className={`absolute top-0 left-0 w-full p-4 md:p-8 flex justify-between items-start z-[100] transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="p-2 select-none">
          <span className="text-[10px] md:text-xs font-bold text-white/50 bg-black/40 px-3 py-1.5 rounded-full uppercase tracking-[0.2em] ">
            {media.type}
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-3 pointer-events-auto">
          <button 
            onClick={handleShare} 
            className="flex items-center justify-center w-11 h-11 md:w-auto md:px-6 md:py-3 bg-zinc-800/80 hover:bg-zinc-700 border border-white/10 rounded-full md:rounded-xl text-white transition-colors active:scale-95"
          >
            {copied ? <Check size={18} className="text-green-500" /> : <Share2 size={18} />}
          </button>
          
          <button 
            className="flex items-center justify-center gap-2 w-11 h-11 md:w-auto md:px-6 md:py-3 bg-white text-black rounded-full md:rounded-xl font-bold active:scale-95 transition-transform"
            onClick={(e: MouseEvent) => { e.stopPropagation(); onClose(); }}
          >
            <span className="text-xs hidden md:block uppercase font-black tracking-tighter">
              {t('exit') || 'Sair'}
            </span>
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* BOTÃO FLUTUANTE DE RESET ZOOM (Aparece apenas quando tem zoom) */}
      {scale > 1 && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[150] pointer-events-auto">
          <button
            onClick={resetZoom}
            onTouchEnd={(e) => { e.preventDefault(); resetZoom(e); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-black/70  border border-white/20 text-white rounded-full shadow-xl hover:bg-black/90 active:scale-95 transition-all animate-in fade-in zoom-in-95"
          >
            <ZoomOut size={18} />
            <span className="text-[11px] font-black uppercase tracking-widest">
              {t('reset_zoom') || 'Remover Zoom'}
            </span>
          </button>
        </div>
      )}

      {/* VIEWPORT COM ZOOM E PAN */}
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
          className={`relative flex items-center justify-center w-full h-full will-change-transform ${!isDragging ? 'transition-transform duration-200 ease-out' : ''}`}
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
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
            />
          ) : (
            <img src={media.url} className="w-full h-full object-contain pointer-events-none select-none" alt="Media view" />
          )}
        </div>
      </div>

      {/* CONTROLES DO VÍDEO */}
      {media.type === 'video' && (
        <div 
          className={`absolute bottom-0 left-0 w-full p-6 pb-10 md:p-10 bg-gradient-to-t from-black via-black/80 to-transparent transition-all duration-300 z-[100] ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            <div className="w-full h-1.5 md:h-[3px] bg-white/20 relative overflow-hidden group rounded-full cursor-pointer">
              <div 
                ref={progressBarRef} 
                className="absolute inset-0 bg-white origin-left" 
                style={{ transform: 'scaleX(0)' }}
              />
              <input
                type="range" min="0" max="100" step="0.1"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleProgressChange}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 md:gap-8">
                <button onClick={togglePlay} className="text-white hover:scale-110 active:scale-95 transition-transform p-2">
                  {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
                </button>
                <button onClick={() => setIsMuted(!isMuted)} className="text-white/60 hover:text-white transition-colors p-2">
                  {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
              </div>
              
              <button 
                onClick={toggleFullscreen}
                className="p-3 text-white/60 hover:text-white transition-all hover:bg-white/10 rounded-full md:rounded-lg"
              >
                {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};