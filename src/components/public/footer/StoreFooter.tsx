import { useEffect, useMemo, useState, useRef, useCallback } from "react";import { getSocialLinks, readStoreCache, clearStoreCache } from "../../../utils/storeCache";
import type { StorePublicData } from "../../../utils/storeCache";

const mascotImages = ["/img/Mascote.png", "/img/Mascote2.png", "/img/Mascote4.png"];
const socialIcons = ["whatsapp", "instagram", "twitter", "github"];

type StoreFooterProps = {
  store: StorePublicData;
  source: "none" | "cache" | "network";
  isFetching: boolean;
  storeSlug: string | undefined;
  forceRefresh: () => Promise<void>;
};

export function StoreFooter({ store, source, isFetching, storeSlug, forceRefresh }: StoreFooterProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const cacheTextRef = useRef<HTMLSpanElement>(null);

  // 1. Troca de mascote otimizada por GPU
  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % mascotImages.length);
    }, 6000);
    return () => window.clearInterval(interval);
  }, []);

  // Auxiliar para calcular string do cache de forma estática
  const getCacheString = useCallback(() => {
    const cache = readStoreCache(storeSlug);
    if (!cache) return "No Cache";
    
    const remaining = cache.expiresAt - Date.now();
    if (remaining <= 0) {
      clearStoreCache(storeSlug);
      return "Expired";
    }
    
    const hours = Math.floor(remaining / 1000 / 60 / 60);
    const minutes = Math.floor((remaining / 1000 / 60) % 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }, [storeSlug]);

  // 2. Performance Extrema: Atualiza o texto do DOM diretamente, pulando o ciclo de Render do React
  useEffect(() => {
    const updateCacheDOM = () => {
      if (cacheTextRef.current) {
        cacheTextRef.current.textContent = `cache ${getCacheString()}`;
      }
    };

    // Atualiza imediatamente na montagem ou quando mudar o slug/fetch
    updateCacheDOM();

    // Roda em background a cada 60s alterando apenas a string de texto do DOM
    const interval = window.setInterval(updateCacheDOM, 60000);
    return () => window.clearInterval(interval);
  }, [getCacheString, isFetching]);

  const socialLinks = useMemo(() => getSocialLinks(store?.settings), [store?.settings]);

  return (
    <footer className="relative w-full border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-black transition-colors duration-500 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-16 pb-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-6">
          
          {/* Mascot / Logo Section - Otimizado por Hardware (GPU) */}
          <div className="relative flex flex-col items-center md:items-start min-w-[120px]">
            <div className="absolute -top-[72px] flex flex-col items-center pointer-events-none select-none">
              <img
                src={mascotImages[activeIndex]}
                alt="Mascot"
                className="h-24 w-auto object-contain transition-all duration-700 ease-out will-change-transform"
                style={{ transform: "translate3d(0,0,0)" }}
                loading="lazy"
              />
              <div className="w-10 h-1.5 bg-black/5 dark:bg-cyan-400/10 rounded-full mt-1" />
            </div>
            <span className="pt-3 text-[11px] font-black tracking-[0.5em] uppercase bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
              STORELY
            </span>
          </div>

          {/* Status / Cache Controls */}
          <div className="flex flex-col items-center justify-center order-3 md:order-2 gap-2.5 text-center">
            <span className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 font-medium">
              © {new Date().getFullYear()} {store?.name}
              <span className="hidden md:inline mx-2 opacity-30">•</span>
              <span className="block md:inline">Storely All Rights Reserved</span>
            </span>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {/* Referência direta injetada aqui */}
              <span 
                ref={cacheTextRef}
                className="inline-flex items-center rounded-full px-3 py-1 text-[8px] md:text-[9px] uppercase tracking-[0.25em] font-bold border text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-900/50 dark:bg-emerald-950/30"
              >
                cache...
              </span>

              <span className={`inline-flex items-center rounded-full px-3 py-1 text-[8px] md:text-[9px] uppercase tracking-[0.25em] font-bold border ${
                source === "cache" 
                  ? "text-blue-600 border-blue-200 bg-blue-50 dark:text-blue-400 dark:border-blue-900/50 dark:bg-blue-950/30" 
                  : "text-violet-600 border-violet-200 bg-violet-50 dark:text-violet-400 dark:border-violet-900/50 dark:bg-violet-950/30"
              }`}>
                {source === "cache" ? "loaded from local cache" : "loaded from network"}
              </span>

              {isFetching && (
                <span className="inline-flex items-center rounded-full px-3 py-1 text-[8px] md:text-[9px] uppercase tracking-[0.25em] font-bold border text-slate-500 border-slate-200 bg-slate-50 dark:text-slate-400 dark:border-slate-800 dark:bg-slate-900/40 animate-pulse will-change-opacity">
                  syncing...
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={forceRefresh}
              className="mt-1 text-[8px] md:text-[9px] uppercase tracking-[0.3em] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              refresh cache now
            </button>
          </div>

          {/* Social Links */}
          <div className="flex justify-center md:justify-end gap-5 order-2 md:order-3">
            {socialLinks.length > 0
              ? socialLinks.map((item) => (
                  <a
                    key={item.key}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.key}
                    className="opacity-45 hover:opacity-100 hover:scale-110 transition-all duration-300 dark:invert will-change-transform"
                  >
                    <img src={`/img/${item.icon}.png`} alt={item.key} className="h-4 w-4 object-contain" loading="lazy" />
                  </a>
                ))
              : socialIcons.map((icon) => (
                  <span key={icon} aria-hidden="true" className="opacity-20 dark:invert">
                    <img src={`/img/${icon}.png`} alt={icon} className="h-4 w-4 object-contain" loading="lazy" />
                  </span>
                ))}
          </div>

        </div>
      </div>
    </footer>
  );
}