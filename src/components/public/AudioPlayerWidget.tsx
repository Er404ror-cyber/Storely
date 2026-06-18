import React from "react";
import { Volume2, VolumeX } from "lucide-react";

type AudioPlayerWidgetProps = {
  rootRef: React.RefObject<HTMLDivElement | null>;
  isPlaying: boolean;
  loadError: boolean;
  togglePlayback: () => void;
};

export const AudioPlayerWidget = React.memo(function AudioPlayerWidget({
  rootRef,
  isPlaying,
  loadError,
  togglePlayback,
}: AudioPlayerWidgetProps) {

  const handlePlaybackClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    togglePlayback();
  };

  return (
    <div ref={rootRef} className="fixed bottom-4 right-0 z-[2147483647] pointer-events-auto">
      <div 
        className={`flex items-center shadow-[0_4px_14px_rgba(0,0,0,0.25)] rounded-l-full border border-r-0 transition-all duration-200 ease-in-out ${
          isPlaying 
            ? "border-slate-800 bg-slate-940 text-white dark:border-white/10 dark:bg-[#0d1117]" 
            : "border-slate-300 bg-slate-100 text-slate-600 dark:border-white/5 dark:bg-[#161b22] dark:text-slate-400"
        }`}
      >
        {/* BOTÃO EM MEIA PÍLULA PERFEITA - ALTO CONTRASTE EM FUNDOS CLAROS E ESCUROS */}
        <button
          type="button"
          onClick={handlePlaybackClick}
          disabled={loadError}
          className="flex h-8 w-[22px] sm:h-9 sm:w-[28px] shrink-0 flex-col items-center justify-center gap-0.5 cursor-pointer select-none disabled:opacity-40 transition-transform active:scale-90 pl-1 "
          aria-label={isPlaying ? "Pausar áudio" : "Tocar áudio"}
        >
          {/* Ícone Micro com feedback visual garantido */}
          <div className="flex h-3 w-3 sm:h-3.5 sm:w-3.5 items-center justify-center shrink-0">
            {isPlaying ? (
              <Volume2 size={10} className="animate-pulse text-emerald-400 dark:text-emerald-400" />
            ) : (
              <VolumeX size={10} className="text-slate-500 dark:text-slate-400" />
            )}
          </div>
          
          {/* Texto com peso de fonte Bold para leitura instantânea */}
          <span className={`text-[5px] sm:text-[5.5px] font-black tracking-wider uppercase leading-none select-none ${
            isPlaying ? "text-white/95" : "text-slate-600 dark:text-slate-400"
          }`}>
            {isPlaying ? "ON" : "OFF"}
          </span>
        </button>
      </div>
    </div>
  );
});

AudioPlayerWidget.displayName = "AudioPlayerWidget";