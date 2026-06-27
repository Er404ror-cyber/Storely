import { memo, useEffect, useState } from "react";
import { ArrowRight, ShoppingBag, MapPin, Globe, Tag, Volume2 } from "lucide-react";
import type { IntroPhase } from "../../../types/publicAudio";
import { useTranslate } from "../../../context/LanguageContext";

interface PublicIntroOverlayProps {
  introPhase: IntroPhase;
  storeName?: string;
  shortDescription: string;
  currencyInfo: { flag: string; country: string; code: string; symbol?: string } | null;
  onActivate: () => void;
}

const PHASE_CLASSES: Record<IntroPhase, string> = {
  hidden: "hidden",
  entering: "opacity-0 pointer-events-none",
  visible: "opacity-100",
  pressed: "opacity-95 scale-[0.995]",
  leaving: "opacity-0 pointer-events-none",
};

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

  // 2. Bloqueio rígido de scroll do Body (Apenas no modo ecrã cheio)
  useEffect(() => {
    if (!isMinimalMode && introPhase !== "hidden" && introPhase !== "leaving") {
      const originalOverflowY = document.documentElement.style.overflowY;
      const originalBodyOverflow = document.body.style.overflow;
      
      document.documentElement.style.overflowY = "hidden";
      document.body.style.overflow = "hidden";
      
      return () => {
        document.documentElement.style.overflowY = originalOverflowY;
        document.body.style.overflow = originalBodyOverflow;
      };
    }
  }, [isMinimalMode, introPhase]);

  if (introPhase === "hidden") return null;

  // Ativação síncrona nativa com tipagem estrita para o React
  const handleFullModeActivation = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onActivate(); 
    localStorage.setItem(storageKey, String(Date.now()));
    setIsMinimalMode(true);
    setShowMinimalButton(false);
  };

  const handleMinimalModeActivation = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onActivate(); 
    localStorage.setItem(storageKey, String(Date.now()));
    setShowMinimalButton(false);
  };

  // =========================================================================
  // CASO 1: MODO DISCRETO / MINIMALISTA (Entrou nos últimos 10 min)
  // =========================================================================
  if (isMinimalMode) {
    if (!showMinimalButton) return null;

    return (
      <div className="fixed inset-x-0 bottom-10 z-[2147483646] p-0 pointer-events-none w-full flex justify-center items-center">
        <button
          onClick={handleMinimalModeActivation}
          type="button"
          className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/20 bg-slate-950/95 px-6 py-3.5 text-white shadow-2xl  transition-all active:scale-95 hover:bg-slate-900 cursor-pointer animate-fade-in"
          style={{ willChange: "transform, opacity" }}
        >
          <Volume2 size={14} className="text-white shrink-0 animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-wider whitespace-nowrap">
            {t("activate_audio") || "Ativar Som"}
          </span>
          <ArrowRight size={12} strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  // =========================================================================
  // CASO 2: CAPA COMPLETA DE ENTRADA (Primeiro acesso)
  // =========================================================================
  return (
    <div
      onClick={handleFullModeActivation}
      className={`fixed inset-0 z-[2147483646] overflow-hidden touch-none select-none cursor-pointer transition-all duration-300 ease-out will-change-[opacity,transform] ${PHASE_CLASSES[introPhase]}`}
      style={{ transform: "translateZ(0)" }}
    >
      <div className="absolute inset-0 bg-slate-950/80 pointer-events-none" />

      <div className="relative flex h-full flex-col justify-between p-6 md:p-12 text-white max-w-xl mx-auto pointer-events-none">
        
        {/* Topo */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 w-full">
          <div className="flex items-center gap-2 text-white/30">
            <ShoppingBag size={12} strokeWidth={2.5} />
            <span className="text-[9px] font-black tracking-[0.25em] uppercase">
              {t("official_store") || "Official Store / Loja Oficial"}
            </span>
          </div>
          {currencyInfo && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-white/50 uppercase">
              <span role="img" aria-label={currencyInfo.country} className="text-xs">
                {currencyInfo.flag}
              </span>
              <span>{currencyInfo.code}</span>
            </div>
          )}
        </div>

        {/* Centro */}
        <div className="w-full py-6 my-auto flex flex-col justify-center text-left overflow-hidden">
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase sm:text-5xl md:text-6xl leading-[0.9] break-words line-clamp-3">
            {storeName || "Storely Boutique"}
          </h1>

          <div className="mt-8 space-y-4 border-t border-b border-white/10 py-6 w-full">
            {shortDescription && (
              <div className="flex gap-4 items-start pb-1">
                <Tag size={14} className="text-white/40 mt-0.5 shrink-0" />
                <p className="text-xs md:text-sm font-medium leading-relaxed text-white/70 line-clamp-4 overflow-hidden break-words">
                  {shortDescription}
                </p>
              </div>
            )}

            {currencyInfo && (
              <>
                <div className="h-px bg-white/5 w-full" />
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-white/60">
                  <MapPin size={14} className="text-white/40 shrink-0" />
                  <div className="flex items-center gap-2 max-w-full truncate">
                    <span role="img" aria-label={currencyInfo.country} className="text-sm shrink-0">
                      {currencyInfo.flag}
                    </span>
                    <span className="truncate">{currencyInfo.country}</span>
                  </div>
                </div>

                <div className="h-px bg-white/5 w-full" />
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-white/60">
                  <Globe size={14} className="text-white/40 shrink-0" />
                  <span className="text-[11px] truncate">
                    {t("currency_label") || "Catálogo em:"}{" "}
                    <span className="text-white">
                      {currencyInfo.code} {currencyInfo.symbol ? `(${currencyInfo.symbol})` : ""}
                    </span>
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div className="mt-auto w-full pt-4 flex flex-col items-center shrink-0">
          <div className="group relative flex items-center justify-center gap-3 rounded-full border border-white/20 bg-white/10 px-8 py-3.5 text-white shadow-2xl  transition-all duration-150 w-auto max-w-xs">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-center leading-none whitespace-nowrap">
              {t("enter_btn") || "Entrar na Loja"}
            </span>
            <ArrowRight size={13} strokeWidth={2.5} className="text-white transition-transform group-hover:translate-x-1 shrink-0" />
          </div>

          <p className="text-center text-[8px] font-bold uppercase tracking-[0.3em] text-white/20 mt-6 max-w-full truncate">
            {t("click_anywhere") || "Clique para acessar"}
          </p>
        </div>

      </div>
    </div>
  );
});

PublicIntroOverlay.displayName = "PublicIntroOverlay";