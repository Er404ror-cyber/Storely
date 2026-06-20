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
    <div ref={rootRef} className="fixed bottom-4 left-0 z-[2147483647] pointer-events-auto">
      <div 
        className={`flex items-center shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-r-full border border-l-0 transition-all duration-200 ease-in-out ${
          isPlaying 
            ? "border-slate-900 bg-slate-950 text-white dark:border-white/10 dark:bg-[#0d1117]" 
            : "border-slate-400 bg-slate-900 text-slate-200 dark:border-white/10 dark:bg-[#161b22] dark:text-slate-400"
        }`} // MODIFICADO: No Light Mode e OFF, agora ele usa bg-slate-900 e texto claro para garantir leitura perfeita em qualquer site.
      >
        {/* BOTÃO EM MEIA PÍLULA PERFEITA */}
        <button
          type="button"
          onClick={handlePlaybackClick}
          disabled={loadError}
          className="flex h-8 w-[18px] sm:h-9 md:w-[24px] shrink-0 flex-col items-center justify-center gap-0.5 cursor-pointer select-none disabled:opacity-40 transition-transform active:scale-90 pr-1"
          aria-label={isPlaying ? "Pausar áudio" : "Tocar áudio"}
        >
          {/* Ícone Micro com feedback visual garantido */}
          <div className="flex h-3 w-3 sm:h-3.5 sm:w-3.5 items-center justify-center shrink-0">
            {isPlaying ? (
              <Volume2 size={11} className="animate-pulse text-emerald-400 dark:text-emerald-400" />
            ) : (
              <VolumeX size={11} className="text-rose-400 dark:text-rose-400/80" /> 
            )} {/* MODIFICADO: VolumeX agora é vermelho suave (rose-400) no OFF para dar leitura visual instantânea */}
          </div>
          
          {/* Texto com peso de fonte Bold para leitura instantânea */}
          <span className={`text-[5.5px] sm:text-[6px] font-black tracking-wider uppercase leading-none select-none ${
            isPlaying ? "text-emerald-400" : "text-white/90 dark:text-slate-400"
          }`}>
            {isPlaying ? "ON" : "OFF"}
          </span>
        </button>
      </div>
    </div>
  );
});

AudioPlayerWidget.displayName = "AudioPlayerWidget";