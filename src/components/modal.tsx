import React, { useEffect, useRef, useState, MouseEvent, ChangeEvent } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize2, Share2, Check, Minimize2 } from 'lucide-react';
import type { MediaItem } from './sections/helpers';

interface MediaModalProps {
  media: MediaItem | null;
  onClose: () => void;
  t: (key: string) => string;
}

export const MediaModal: React.FC<MediaModalProps> = ({ media, onClose, t }) => {
  // Refs com tipagem explícita
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null); // Adicionado (faltava no original)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // States
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // 1. Controle de Visibilidade
  const handleInteraction = (): void => {
    setVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setVisible(false), 2000);
  };

  useEffect(() => {
    handleInteraction();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  // 2. Loop de Progresso (requestAnimationFrame)
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

  const handleShare = async (e: MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.stopPropagation();
    if (!media?.url) return;
    
    const shareText = `${media.url}\n\nProject: ${window.location.href}`;
    
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Portfolio', text: shareText });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch (err) {
      console.error("Erro ao compartilhar:", err);
    }
  };

  const toggleFullscreen = (e: MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err: Error) => {
        console.error(`Erro ao entrar em fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

 const togglePlay = (e?: React.MouseEvent): void => {
  if (e) e.stopPropagation();
  const v = videoRef.current;
  
  if (v) {
    if (v.paused) {
      v.play();
    } else {
      v.pause();
    }
  }
};

  const handleProgressChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (videoRef.current) {
      const time = (Number(e.target.value) / 100) * videoRef.current.duration;
      videoRef.current.currentTime = time;
    }
  };

  if (!media) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[10000] bg-black overflow-hidden flex items-center justify-center touch-none"
      style={{ contain: 'strict' }}
      onMouseMove={handleInteraction}
      onPointerMove={handleInteraction}
      onClick={onClose}
    >
      {/* HEADER */}
      <div className={`absolute top-0 w-full p-4 md:p-10 flex justify-between items-start z-[100] transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="p-2 select-none">
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em]">
            {media.type}
          </span>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <button 
            onClick={handleShare} 
            className="p-3 md:px-6 bg-zinc-900/80 border border-white/10 rounded-xl text-white backdrop-none"
          >
            {copied ? <Check size={18} className="text-green-500" /> : <Share2 size={18} />}
          </button>
          <button 
            className="flex items-center gap-3 px-6 py-3 md:px-8 bg-white text-black rounded-xl font-bold italic active:scale-95"
            onClick={(e: MouseEvent) => { e.stopPropagation(); onClose(); }}
          >
            <span className="text-xs hidden md:block uppercase font-black tracking-tighter">
              {t('exit') || 'Sair'}
            </span>
            <X size={20} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* VIEWPORT */}
      <div className="w-full h-full flex items-center justify-center pointer-events-none">
        <div 
          className="relative w-full h-full flex items-center justify-center pointer-events-auto" 
          onClick={(e: MouseEvent) => e.stopPropagation()}
        >
          {media.type === 'video' ? (
            <div className="w-full h-full flex items-center justify-center">
              <video 
                ref={videoRef}
                src={media.url}
                autoPlay 
                muted={isMuted}
                loop 
                playsInline
                disablePictureInPicture
                controlsList="nodownload"
                className="w-full h-full object-contain cursor-pointer"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onClick={() => togglePlay()}
              />
              
              {/* CONTROLES */}
              <div className={`absolute bottom-0 left-0 w-full p-6 md:p-10 bg-gradient-to-t from-black to-transparent transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="max-w-3xl mx-auto flex flex-col gap-5">
                  <div className="w-full h-[3px] bg-white/10 relative overflow-hidden group">
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
                    <div className="flex items-center gap-8">
                      <button onClick={() => togglePlay()} className="text-white hover:scale-110 transition-transform">
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                      </button>
                      <button onClick={() => setIsMuted(!isMuted)} className="text-white/40 hover:text-white transition-colors">
                        {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                      </button>
                    </div>
                    
                    <button 
                      onClick={toggleFullscreen}
                      className="p-2 text-white/60 hover:text-white transition-all hover:bg-white/10 rounded-lg"
                    >
                      {isFullscreen ? <Minimize2 size={22} /> : <Maximize2 size={22} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <img src={media.url} className="w-full h-full object-contain" alt="" />
          )}
        </div>
      </div>
    </div>
  );
};