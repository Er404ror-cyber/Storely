import React, { memo, useEffect, useState } from "react";
import { ArrowRight, MapPin, Globe, Tag, Volume2, Sparkles } from "lucide-react";
import type { IntroPhase } from "../../../types/publicAudio";
import { useTranslate } from "../../../context/LanguageContext";

interface PublicIntroOverlayProps {
  introPhase: IntroPhase;
  storeName?: string;
  shortDescription: string;
  currencyInfo: { flag: string; country: string; code: string; symbol?: string } | null;
  onActivate: () => void;
}

export const PublicIntroOverlay = memo(function PublicIntroOverlay({
  introPhase,
  storeName,
  shortDescription,
  currencyInfo,
  onActivate,
}: PublicIntroOverlayProps) {
  const { t } = useTranslate();
  const [isMinimalMode, setIsMinimalMode] = useState<boolean>(false);
  const [showMinimalButton, setShowMinimalButton] = useState<boolean>(true);
  
  // Estados locais para controlar rigorosamente a física de entrada e saída
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isLeavingLocal, setIsLeavingLocal] = useState<boolean>(false);

  const storeId = storeName ? storeName.toLowerCase().replace(/[^a-z0-9]/g, "-") : "default-store";
  const storageKey = `storely_intro_dismissed_${storeId}`;

  // 1. Controle de Sessão / LocalStorage
  useEffect(() => {
    const TEN_MINUTES = 600000;
    const lastDismissed = localStorage.getItem(storageKey);
    const now = Date.now();

    if (lastDismissed && now - Number(lastDismissed) < TEN_MINUTES) {
      setIsMinimalMode(true);
      const timer = setTimeout(() => {
        setShowMinimalButton(false);
      }, 7000);
      return () => clearTimeout(timer);
    } else {
      setIsMinimalMode(false);
    }
  }, [storageKey, storeName]);

  // 2. Dispara a animação de chegada (Fade In & Slide Up) um frame após a montagem
  useEffect(() => {
    if (introPhase === "visible" && !isMinimalMode) {
      const raf = requestAnimationFrame(() => {
        setIsMounted(true);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [introPhase, isMinimalMode]);

  // 3. Bloqueio nativo do scroll do corpo
  useEffect(() => {
    if (!isMinimalMode && introPhase !== "hidden" && introPhase !== "leaving" && !isLeavingLocal) {
      const originalOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.documentElement.style.overflow = originalOverflow;
      };
    }
  }, [isMinimalMode, introPhase, isLeavingLocal]);

  if (introPhase === "hidden") return null;

  const handleActivation = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    onActivate();
    localStorage.setItem(storageKey, String(Date.now()));
    
    // Inicia a transição de saída invertendo o estado de montagem e ativando a saída
    setIsLeavingLocal(true);
    setIsMounted(false);
    
    // Aguarda os 500ms da animação de saída nativa por hardware antes de chavear para o mini-botão
    setTimeout(() => {
      setIsMinimalMode(true);
      setShowMinimalButton(false);
    }, 500); 
  };

  // =========================================================================
  // MODO DISCRETO / MINIMALISTA
  // =========================================================================
  if (isMinimalMode) {
    if (!showMinimalButton) return null;

    return (
      <div className="fixed inset-x-0 bottom-6 z-[2147483646] p-0 pointer-events-none w-full flex justify-center items-center">
        <button
          onClick={handleActivation}
          type="button"
          className="pointer-events-auto flex items-center gap-3 rounded-full bg-[#090A0F]/95 px-5 py-3 text-white shadow-2xl transition-all active:scale-95 text-[10px] font-black uppercase tracking-[0.2em] border border-[#7B61FF]/40  dynamic-gpu animate-[brandSlideUp_0.4s_ease-out]"
        >
          <Volume2 size={13} className="text-[#7B61FF] shrink-0" />
          <span>{t("activate_audio") || "Ativar Som"}</span>
          <ArrowRight size={11} strokeWidth={2.5} className="text-[#7B61FF]" />
        </button>
      </div>
    );
  }

  // Define os gatilhos dinâmicos baseados no frame de montagem e desmontagem real
  const isLayerActive = isMounted && !isLeavingLocal && introPhase !== "leaving";

  return (
    <div
      className={`fixed inset-0 z-[2147483646] flex flex-col justify-end md:justify-center p-6 sm:p-12 md:p-24 select-none dynamic-gpu transition-all duration-500 ease-in-out ${
        isLayerActive ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Película Protetora Gradiente Transparente */}
      <div 
        onClick={handleActivation}
        className="absolute inset-0 bg-gradient-to-t from-[#090A0F]/98 via-[#090A0F]/80 to-transparent md:bg-gradient-to-r md:from-[#090A0F]/98 md:via-[#090A0F]/75 md:to-transparent cursor-pointer touch-none z-0"
      />

      {/* Bloco Narrativo de Marca - Efeito Simétrico de Entrada e Saída (Slide & Scale) */}
      <div
        className={`relative w-full max-w-[500px] text-left z-10 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) dynamic-gpu ${
          isLayerActive 
            ? "opacity-100 translate-y-0 scale-100" 
            : "opacity-0 translate-y-6 scale-[0.98]"
        }`}
      >
        {/* Micro Tag */}
        <div className="flex items-center gap-2 text-[#7B61FF] text-[10px] font-black uppercase tracking-[0.3em] mb-3">
          <Sparkles size={12} className="shrink-0 text-[#7B61FF] animate-pulse" />
          <span>{t("official_store") || "Espaço Verificado"}</span>
        </div>

        {/* Título Principal */}
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white uppercase leading-[0.95] break-words drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          {storeName || "Storely Boutique"}
        </h1>

        {/* Linha Neon */}
        <div className="w-12 h-[2.5px] bg-[#7B61FF] my-5" />

        {/* Detalhes do Catálogo */}
        <div className="space-y-4 max-w-sm">
          {shortDescription && (
            <div className="flex gap-3 items-start">
              <Tag size={13} className="text-[#7B61FF]/80 mt-0.5 shrink-0" />
              <p className="text-[11px] sm:text-xs font-semibold leading-relaxed text-slate-200/95 break-words drop-shadow-sm antialiased">
                {shortDescription}
              </p>
            </div>
          )}

          {currencyInfo && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">
              <div className="flex items-center gap-1.5 max-w-full truncate">
                <MapPin size={12} className="text-slate-500 shrink-0" />
                <span role="img" aria-label={currencyInfo.country} className="text-xs shrink-0">{currencyInfo.flag}</span>
                <span className="truncate text-slate-200">{currencyInfo.country}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Globe size={12} className="text-slate-500 shrink-0" />
                <span className="text-white tracking-wider">
                  {currencyInfo.code} {currencyInfo.symbol ? `(${currencyInfo.symbol})` : ""}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* CTA Principal */}
        <div className="mt-8 w-full max-w-xs flex flex-col items-start shrink-0 pb-safari-dynamic">
          <button
            onClick={handleActivation}
            type="button"
            className="group w-full flex items-center justify-between rounded-full bg-white text-black pl-7 pr-1.5 py-1.5 font-black text-[10px] sm:text-[11px] uppercase tracking-[0.25em] shadow-[0_20px_50px_rgba(123,97,255,0.25)] hover:bg-[#7B61FF] hover:text-white transition-all duration-300 ease-out cursor-pointer touch-manipulation active:scale-[0.985]"
          >
            <span>{t("enter_btn") || "Ver Catálogo"}</span>
            <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white transition-transform group-hover:translate-x-0.5 duration-300">
              <ArrowRight size={13} strokeWidth={2.5} />
            </div>
          </button>

          <button
            onClick={handleActivation}
            type="button"
            className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400/80 hover:text-white transition-colors mt-5 bg-transparent border-none p-0 cursor-pointer hidden sm:block"
          >
            {t("click_anywhere") || "Ou clique na vitrine exposta para entrar"}
          </button>
        </div>

      </div>

      <style>{`
        .dynamic-gpu {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }
        @keyframes brandSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
});

PublicIntroOverlay.displayName = "PublicIntroOverlay";