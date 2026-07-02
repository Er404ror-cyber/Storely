import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  REAL_MAX_VOLUME,
  DEFAULT_SEGMENT_SECONDS,
  type PublicBackgroundAudioProps,
  type IntroPhase,
  isPlayableBackgroundAudioUrl,
} from "../../../types/publicAudio";

import {
  getSafeStoreCacheId,
  getDocumentNavigationMode,
  readPreviousRouteKind,
  writeCurrentRouteKind,
  getCachedAudioBlobUrl,
} from "../../../utils/audioCache";

import { getCurrencyPresentation } from "../../../utils/currencyMeta";
import { PublicIntroOverlay } from "./PublicIntroOverlay";
import { AudioPlayerWidget } from "./AudioPlayerWidget";

function getRouteKind(pathname: string): "blog" | "store" | "other" {
  if (pathname.includes("/blog/")) return "blog";
  if (pathname.startsWith("/")) return "store";
  return "other";
}

export const PublicBackgroundAudio = memo(function PublicBackgroundAudio({
  settings,
  storeName,
  storeId,
  storeDescription,
  storeCurrency,
}: PublicBackgroundAudioProps) {
  const location = useLocation();
  const pathname = location.pathname.toLowerCase();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const mountedRef = useRef(false);
  const playInFlightRef = useRef(false);
  const resumeOnVisibleRef = useRef(false);
  const lastUserPausedRef = useRef(false);
  const objectUrlRef = useRef<string | null>(null);
  const introTimerRef = useRef<number | null>(null);

  // Guarda de forma performática a referência do último elemento ou identificador que mutou o background
  const activeExternalMediaRef = useRef<any>(null);

  const currentRouteKind = useMemo(() => getRouteKind(pathname), [pathname]);
  const isBlogRoute = currentRouteKind === "blog";

  const hasAudio = useMemo(() => {
    if (isBlogRoute || !settings?.enabled) return false;
    const url = settings?.url?.trim() ?? "";
    return !!url && isPlayableBackgroundAudioUrl(url);
  }, [isBlogRoute, settings]);

  const rawAudioUrl = settings?.url?.trim() ?? "";
  
  const audioUrl = useMemo(() => {
    if (!rawAudioUrl.includes("cloudinary.com") || rawAudioUrl.includes("/co_volume:")) {
      return rawAudioUrl;
    }
    return rawAudioUrl.replace("/upload/", "/upload/co_volume:5/");
  }, [rawAudioUrl]);

  const startAt = useMemo(() => Math.max(0, settings?.startAt ?? 0), [settings?.startAt]);
  const endAt = useMemo(() => Math.max(startAt + 1, settings?.endAt ?? (startAt + DEFAULT_SEGMENT_SECONDS)), [settings?.endAt, startAt]);
  const storeCacheId = useMemo(() => getSafeStoreCacheId(storeId, storeName), [storeId, storeName]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [introPhase, setIntroPhase] = useState<IntroPhase>("hidden");

  const shortDescription = useMemo(() => (storeDescription || "").slice(0, 110), [storeDescription]);
  const currencyInfo = useMemo(() => getCurrencyPresentation(storeCurrency), [storeCurrency]);

  const applyVolume = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = REAL_MAX_VOLUME; 
  }, []);

  const prepareAudioSource = useCallback(async () => {
    const el = audioRef.current;
    if (!el || !hasAudio || !audioUrl) return;

    setLoadError(false);

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    try {
      const cachedBlob = await getCachedAudioBlobUrl(storeCacheId, audioUrl);
      el.src = cachedBlob || audioUrl;
      if (cachedBlob) objectUrlRef.current = cachedBlob;

      el.preload = "auto";
      (el as any).playsInline = true;
      el.loop = false;
      
      el.load();
      el.muted = true;
      el.volume = 0;
    } catch {
      el.src = audioUrl;
      el.load();
    }
  }, [audioUrl, hasAudio, storeCacheId]);

  const tryPlayNowFromGesture = useCallback(async () => {
    const el = audioRef.current;
    if (!el || !hasAudio || playInFlightRef.current) return false;

    playInFlightRef.current = true;
    try {
      el.muted = true;
      el.volume = 0;

      if (el.currentTime < startAt || el.currentTime >= endAt) {
        el.currentTime = startAt;
      }

      await el.play();
      applyVolume();

      el.muted = false;
      lastUserPausedRef.current = false;
      resumeOnVisibleRef.current = true;
      if (mountedRef.current) setIsPlaying(true);
      return true;
    } catch (err) {
      console.warn("[Audio Playback] Intercetado pelo bloqueio nativo do browser:", err);
      if (mountedRef.current) setIsPlaying(false);
      return false;
    } finally {
      playInFlightRef.current = false;
    }
  }, [hasAudio, startAt, endAt, applyVolume]);

  const handleOverlayActivate = useCallback(async () => {
    setIntroPhase("pressed");
    
    if (hasAudio) {
      await tryPlayNowFromGesture();
    }

    introTimerRef.current = window.setTimeout(() => {
      setIntroPhase("leaving");
      introTimerRef.current = window.setTimeout(() => {
        setIntroPhase("hidden");
      }, 220);
    }, 90);
  }, [hasAudio, tryPlayNowFromGesture]);

  const togglePlayback = useCallback(async () => {
    const el = audioRef.current;
    if (!el || !hasAudio || loadError) return;

    if (isPlaying) {
      lastUserPausedRef.current = true;
      resumeOnVisibleRef.current = false;
      el.pause();
      setIsPlaying(false);
      return;
    }

    if (el.currentTime >= endAt) el.currentTime = startAt;
    lastUserPausedRef.current = false;
    await tryPlayNowFromGesture();
  }, [hasAudio, isPlaying, loadError, startAt, endAt, tryPlayNowFromGesture]);

  useEffect(() => {
    if (hasAudio) {
      prepareAudioSource();
    }
  }, [hasAudio, prepareAudioSource]);

  useEffect(() => {
    mountedRef.current = true;
    
    const previousKind = readPreviousRouteKind(storeId, storeName);
    const navMode = getDocumentNavigationMode();
    
    if (hasAudio && (navMode === "navigate" || previousKind === "blog")) {
      setIntroPhase("entering");
      window.requestAnimationFrame(() => setIntroPhase("visible"));
    } else {
      setIntroPhase("hidden");
    }

    writeCurrentRouteKind(storeId, storeName, isBlogRoute ? "blog" : "store");

    return () => {
      mountedRef.current = false;
      if (introTimerRef.current) window.clearTimeout(introTimerRef.current);
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, [hasAudio, isBlogRoute, storeId, storeName]);

  useEffect(() => {
    if (!hasAudio) {
      setIsPlaying(false);
      const el = audioRef.current;
      if (el) {
        el.pause();
        el.removeAttribute("src");
      }
      return;
    }

    const el = audioRef.current;
    if (!el) return;

    const onCanPlay = () => applyVolume();
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    
    const onTimeUpdate = () => {
      if (el.currentTime >= endAt) {
        el.pause();
        el.currentTime = startAt;
        setIsPlaying(false);
      }
    };

    const onError = () => {
      setLoadError(true);
    };

    el.addEventListener("canplay", onCanPlay);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("error", onError);

    return () => {
      el.removeEventListener("canplay", onCanPlay);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("error", onError);
    };
  }, [hasAudio, startAt, endAt, applyVolume]);

  // =========================================================================
  // CONTROLADOR DE VISIBILIDADE INTELIGENTE (PAGE VISIBILITY API)
  // =========================================================================
  useEffect(() => {
    if (!hasAudio) return;

    const handleVisibilityChange = () => {
      const el = audioRef.current;
      if (!el) return;

      if (document.hidden) {
        // Se saiu do separador e o áudio estava de facto a tocar (ON)
        if (!el.paused && isPlaying) {
          resumeOnVisibleRef.current = true; // Valida permissão para retoma
          el.pause();
          setIsPlaying(false);
        } else {
          // Se já estava em pausa, limpa o token para não ativar sozinho no retorno
          resumeOnVisibleRef.current = false;
        }
      } else {
        // O utilizador regressou à aba da loja
        if (
          resumeOnVisibleRef.current && 
          !lastUserPausedRef.current && 
          !activeExternalMediaRef.current
        ) {
          resumeOnVisibleRef.current = false; // Consome o token sincronamente
          tryPlayNowFromGesture();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hasAudio, isPlaying, tryPlayNowFromGesture]);

  // =========================================================================
  // INTERCEPTADOR DE MÍDIAS EXTERNAS MULTI-CENÁRIO (TRAVA ANTI-BOUNCE)
  // =========================================================================
  useEffect(() => {
    if (!hasAudio) return;

    // Dispara a retomada garantindo que limpa o bloqueio ANTES do disparo
    const triggerAudioResume = () => {
      const localAudio = audioRef.current;
      if (localAudio && localAudio.paused && !lastUserPausedRef.current && !document.hidden) {
        activeExternalMediaRef.current = null; // Destrava a referência primeiro
        tryPlayNowFromGesture();               // Executa a reprodução
      }
    };

    const forceAudioPause = (sourceIdentifier: any) => {
      const localAudio = audioRef.current;
      if (localAudio && !localAudio.paused) {
        activeExternalMediaRef.current = sourceIdentifier;
        setIsPlaying(false);
        localAudio.pause();
      }
    };

    // Valida mídias nativas (HTML5 local)
    const handleAudibleCheck = (target: HTMLMediaElement | null) => {
      const localAudio = audioRef.current;
      if (!target || target === localAudio || !localAudio) return;

      const hasAudibleSound = !target.muted && target.volume > 0;

      if (hasAudibleSound && !localAudio.paused) {
        forceAudioPause(target);
      } else if (!hasAudibleSound && target === activeExternalMediaRef.current) {
        triggerAudioResume();
      }
    };

    const handleExternalMediaPlay = (e: Event) => handleAudibleCheck(e.target as HTMLMediaElement | null);
    const handleExternalVolumeChange = (e: Event) => handleAudibleCheck(e.target as HTMLMediaElement | null);
    const handleExternalMediaStop = (e: Event) => {
      if (e.target === activeExternalMediaRef.current) triggerAudioResume();
    };

    // Comunicação postMessage (YouTube e Spotify)
    const handleIframeMessages = (e: MessageEvent) => {
      try {
        let data = e.data;
        if (typeof data === "string") {
          data = JSON.parse(data);
        }

        if (data?.event === "infoDelivery" && data?.info) {
          if (data.info.playerState === 1) {
            forceAudioPause("iframe-media");
          } else if (data.info.playerState === 2 || data.info.playerState === 0) {
            triggerAudioResume();
          }
        }
        if (data?.type === "hub" && data?.event === "play") forceAudioPause("iframe-media");
        if (data?.type === "hub" && data?.event === "pause") triggerAudioResume();

        if (data?.type === "playback_update" && data?.payload) {
          if (data.payload.is_paused === false) {
            forceAudioPause("iframe-media");
          } else if (data.payload.is_paused === true) {
            triggerAudioResume();
          }
        }
      } catch {}
    };

    // Polling tático de foco (Apple Music, SoundCloud, embeds genéricos)
    const checkIframeFocusClick = () => {
      const activeEl = document.activeElement;
      
      if (activeEl && activeEl.tagName === "IFRAME") {
        if (activeExternalMediaRef.current !== activeEl && activeExternalMediaRef.current !== "iframe-media") {
          forceAudioPause(activeEl);
        }
      } else {
        if (activeExternalMediaRef.current && typeof activeExternalMediaRef.current !== "string" && activeExternalMediaRef.current.tagName === "IFRAME") {
          triggerAudioResume();
        }
      }
    };

    // MutationObserver para mídias ou iframes deletados dinamicamente
    const observer = new MutationObserver(() => {
      const currentActive = activeExternalMediaRef.current;
      if (currentActive && typeof currentActive !== "string") {
        if (!document.body.contains(currentActive)) {
          triggerAudioResume();
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("play", handleExternalMediaPlay, { capture: true });
    window.addEventListener("volumechange", handleExternalVolumeChange, { capture: true });
    window.addEventListener("pause", handleExternalMediaStop, { capture: true });
    window.addEventListener("ended", handleExternalMediaStop, { capture: true });
    window.addEventListener("message", handleIframeMessages);
    
    const focusTimer = setInterval(checkIframeFocusClick, 500);
    
    return () => {
      observer.disconnect();
      clearInterval(focusTimer);
      window.removeEventListener("play", handleExternalMediaPlay, { capture: true });
      window.removeEventListener("volumechange", handleExternalVolumeChange, { capture: true });
      window.removeEventListener("pause", handleExternalMediaStop, { capture: true });
      window.removeEventListener("ended", handleExternalMediaStop, { capture: true });
      window.removeEventListener("message", handleIframeMessages);
    };
  }, [hasAudio, tryPlayNowFromGesture]);

  if (!hasAudio) return null;

  return (
    <>
      <audio ref={audioRef} />

      <PublicIntroOverlay
        introPhase={introPhase}
        storeName={storeName}
        shortDescription={shortDescription}
        currencyInfo={currencyInfo}
        onActivate={handleOverlayActivate}
      />

      <AudioPlayerWidget 
        rootRef={rootRef}
        isPlaying={isPlaying}
        loadError={loadError}
        togglePlayback={togglePlayback}
      />
    </>
  );
});

PublicBackgroundAudio.displayName = "PublicBackgroundAudio";