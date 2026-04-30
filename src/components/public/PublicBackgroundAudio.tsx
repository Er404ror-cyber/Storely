import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Store,
} from "lucide-react";
import { getCurrencyPresentation } from "../../utils/currencyMeta";

type BackgroundAudioSettings = {
  enabled?: boolean;
  type?: "audio" | null;
  url?: string | null;
  volume?: number;
  autoplay_on_scroll?: boolean;
  startAt?: number;
  endAt?: number;
};

type PublicBackgroundAudioProps = {
  settings?: BackgroundAudioSettings | null;
  storeName?: string;
  storeId?: string | null;
  storeDescription?: string | null;
  storeCurrency?: string | null;
};

const REAL_MAX_VOLUME = 0.05;
const DEFAULT_REAL_VOLUME = 0.02;
const DEFAULT_SEGMENT_SECONDS = 60;

const LS_VOLUME_KEY = "storely_public_bg_audio_volume_v23";
const LS_AUDIO_CACHE_META_KEY = "storely_public_bg_audio_cache_meta_v11";
const SESSION_ROUTE_KIND_PREFIX = "storely_route_kind_v3:";

const AUDIO_CACHE_NAME = "storely-public-audio-cache-v11";
const AUDIO_CACHE_TTL_DAYS = 7;

type IntroPhase =
  | "hidden"
  | "entering"
  | "visible"
  | "pressed"
  | "leaving";
type RouteKind = "blog" | "store" | "other";
type NavigationMode = "navigate" | "reload" | "back_forward" | "prerender" | "unknown";

type CacheMetaRecord = {
  storeCacheId: string;
  url: string;
  cacheRequestUrl: string;
  expiresAt: number;
  savedAt: number;
};

type CacheMetaMap = Record<string, CacheMetaRecord>;

function clamp(num: number, min: number, max: number) {
  return Math.max(min, Math.min(num, max));
}

function isPlayableBackgroundAudioUrl(url?: string | null) {
  if (!url) return false;

  const clean = url.split("?")[0].toLowerCase();

  return (
    clean.endsWith(".mp3") ||
    clean.endsWith(".m4a") ||
    clean.endsWith(".aac") ||
    clean.endsWith(".ogg") ||
    clean.endsWith(".wav") ||
    clean.endsWith(".webm") ||
    clean.endsWith(".flac") ||
    clean.includes("/video/upload/") ||
    clean.includes("/raw/upload/")
  );
}

function readSavedVolume(): number | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(LS_VOLUME_KEY);
    if (!raw) return null;

    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return null;

    const safe = clamp(parsed, 0, REAL_MAX_VOLUME);
    if (safe <= 0) return DEFAULT_REAL_VOLUME;

    return safe;
  } catch {
    return null;
  }
}

function saveVolume(volume: number) {
  if (typeof window === "undefined") return;

  try {
    const safe = clamp(volume, 0, REAL_MAX_VOLUME);
    window.localStorage.setItem(LS_VOLUME_KEY, String(safe));
  } catch {}
}

function clearSavedVolume() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(LS_VOLUME_KEY);
  } catch {}
}

function realVolumeToUiPercent(realVolume: number) {
  return Math.round((clamp(realVolume, 0, REAL_MAX_VOLUME) / REAL_MAX_VOLUME) * 100);
}

function uiPercentToRealVolume(percent: number) {
  return (clamp(percent, 0, 100) / 100) * REAL_MAX_VOLUME;
}

function isAudibleMedia(el: HTMLMediaElement) {
  const volume = Number.isFinite(el.volume) ? el.volume : 1;
  return !el.paused && !el.muted && volume > 0;
}

function getSafeStoreCacheId(storeId?: string | null, storeName?: string | null) {
  const raw = (storeId || storeName || "default-store").trim().toLowerCase();
  return raw.replace(/[^a-z0-9_-]+/g, "_").slice(0, 120) || "default-store";
}

function isCacheApiAvailable() {
  return typeof window !== "undefined" && "caches" in window;
}

function getNow() {
  return Date.now();
}

function getTtlMs(days = AUDIO_CACHE_TTL_DAYS) {
  return days * 24 * 60 * 60 * 1000;
}

function buildCacheRequestUrl(storeCacheId: string, originalUrl: string) {
  const encodedUrl = encodeURIComponent(originalUrl);
  return `https://storely.cache.local/audio/${storeCacheId}?src=${encodedUrl}`;
}

function readCacheMetaMap(): CacheMetaMap {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(LS_AUDIO_CACHE_META_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as CacheMetaMap;
  } catch {
    return {};
  }
}

function writeCacheMetaMap(nextMap: CacheMetaMap) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(LS_AUDIO_CACHE_META_KEY, JSON.stringify(nextMap));
  } catch {}
}

function getCacheMeta(storeCacheId: string): CacheMetaRecord | null {
  const map = readCacheMetaMap();
  return map[storeCacheId] || null;
}

function setCacheMeta(record: CacheMetaRecord) {
  const map = readCacheMetaMap();
  map[record.storeCacheId] = record;
  writeCacheMetaMap(map);
}

function removeCacheMeta(storeCacheId: string) {
  const map = readCacheMetaMap();
  delete map[storeCacheId];
  writeCacheMetaMap(map);
}

async function removeCachedAudioByRequestUrl(cacheRequestUrl?: string | null) {
  if (!cacheRequestUrl || !isCacheApiAvailable()) return;

  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    await cache.delete(cacheRequestUrl, { ignoreSearch: false });
  } catch {}
}

async function getCachedAudioBlobUrl(
  storeCacheId: string,
  expectedUrl: string
): Promise<string | null> {
  if (!isCacheApiAvailable()) return null;

  const meta = getCacheMeta(storeCacheId);
  if (!meta) return null;
  if (meta.url !== expectedUrl) return null;
  if (meta.expiresAt <= getNow()) return null;

  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const response = await cache.match(meta.cacheRequestUrl, { ignoreSearch: false });
    if (!response || !response.ok) return null;

    const blob = await response.blob();
    if (!blob || blob.size <= 0) return null;

    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

async function cacheAudioForStore(storeCacheId: string, originalUrl: string): Promise<void> {
  if (!isCacheApiAvailable()) return;

  const previous = getCacheMeta(storeCacheId);
  const nextRequestUrl = buildCacheRequestUrl(storeCacheId, originalUrl);

  if (previous && previous.url !== originalUrl) {
    await removeCachedAudioByRequestUrl(previous.cacheRequestUrl);
    removeCacheMeta(storeCacheId);
  }

  try {
    const response = await fetch(originalUrl, {
      mode: "cors",
      credentials: "omit",
      cache: "force-cache",
    });

    if (!response.ok) return;

    const cache = await caches.open(AUDIO_CACHE_NAME);
    await cache.put(nextRequestUrl, response.clone());

    setCacheMeta({
      storeCacheId,
      url: originalUrl,
      cacheRequestUrl: nextRequestUrl,
      savedAt: getNow(),
      expiresAt: getNow() + getTtlMs(),
    });
  } catch {}
}

async function validateAndWarmAudioCache(storeCacheId: string, originalUrl: string): Promise<void> {
  if (!isCacheApiAvailable()) return;

  const meta = getCacheMeta(storeCacheId);

  if (meta && meta.url !== originalUrl) {
    await removeCachedAudioByRequestUrl(meta.cacheRequestUrl);
    removeCacheMeta(storeCacheId);
  }

  const freshMeta = getCacheMeta(storeCacheId);

  if (freshMeta && freshMeta.url === originalUrl && freshMeta.expiresAt > getNow()) {
    return;
  }

  if (freshMeta && freshMeta.expiresAt <= getNow()) {
    await removeCachedAudioByRequestUrl(freshMeta.cacheRequestUrl);
    removeCacheMeta(storeCacheId);
  }

  await cacheAudioForStore(storeCacheId, originalUrl);
}

function trimDescription(text?: string | null, max = 110) {
  const cleaned = (text || "").replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max).trim()}…`;
}

function getRouteKind(pathname: string): RouteKind {
  if (pathname.includes("/blog/")) return "blog";
  if (pathname.startsWith("/")) return "store";
  return "other";
}

function getRouteSessionKey(storeId?: string | null, storeName?: string | null) {
  return `${SESSION_ROUTE_KIND_PREFIX}${getSafeStoreCacheId(storeId, storeName)}`;
}

function readPreviousRouteKind(storeId?: string | null, storeName?: string | null): RouteKind | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(getRouteSessionKey(storeId, storeName));
    if (raw === "blog" || raw === "store" || raw === "other") return raw;
    return null;
  } catch {
    return null;
  }
}

function writeCurrentRouteKind(
  storeId: string | null | undefined,
  storeName: string | null | undefined,
  kind: RouteKind
) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(getRouteSessionKey(storeId, storeName), kind);
  } catch {}
}

function getDocumentNavigationMode(): NavigationMode {
  if (typeof window === "undefined" || typeof performance === "undefined") return "unknown";

  const entries = performance.getEntriesByType?.("navigation") as
    | PerformanceNavigationTiming[]
    | undefined;

  const type = entries?.[0]?.type;

  if (
    type === "navigate" ||
    type === "reload" ||
    type === "back_forward" ||
    type === "prerender"
  ) {
    return type;
  }

  return "unknown";
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
  const introHideTimerRef = useRef<number | null>(null);
  const introPressTimerRef = useRef<number | null>(null);
  const introEnterTimerRef = useRef<number | null>(null);
  const cacheWarmInFlightRef = useRef(false);
  const hasSegmentEndedRef = useRef(false);
  const hasActivatedFromOverlayRef = useRef(false);
  const isFirstRouteEvaluationRef = useRef(true);
  const documentNavigationModeRef = useRef<NavigationMode>(getDocumentNavigationMode());

  const currentRouteKind = useMemo(() => getRouteKind(pathname), [pathname]);
  const isBlogRoute = currentRouteKind === "blog";

  const shortDescription = useMemo(
    () => trimDescription(storeDescription, 110),
    [storeDescription]
  );

  const currencyInfo = useMemo(
    () => getCurrencyPresentation(storeCurrency),
    [storeCurrency]
  );

  const hasAudio = useMemo(() => {
    const enabled = settings?.enabled === true;
    const type = settings?.type ?? "audio";
    const url = settings?.url?.trim() ?? "";

    return (
      !isBlogRoute &&
      enabled &&
      type === "audio" &&
      !!url &&
      isPlayableBackgroundAudioUrl(url)
    );
  }, [isBlogRoute, settings]);

  const audioUrl = settings?.url?.trim() ?? "";

  const startAt = useMemo(() => {
    const value = typeof settings?.startAt === "number" ? settings.startAt : 0;
    return Math.max(0, value);
  }, [settings?.startAt]);

  const endAt = useMemo(() => {
    const raw =
      typeof settings?.endAt === "number"
        ? settings.endAt
        : startAt + DEFAULT_SEGMENT_SECONDS;

    return Math.max(startAt + 1, raw);
  }, [settings?.endAt, startAt]);

  const storeCacheId = useMemo(
    () => getSafeStoreCacheId(storeId, storeName),
    [storeId, storeName]
  );

  const initialRealVolume = useMemo(() => {
    const saved = readSavedVolume();
    if (saved !== null) return saved;

    const fromSettings =
      typeof settings?.volume === "number" ? settings.volume : DEFAULT_REAL_VOLUME;

    return clamp(fromSettings, 0, REAL_MAX_VOLUME) || DEFAULT_REAL_VOLUME;
  }, [settings?.volume]);

  const [realVolume, setRealVolume] = useState(initialRealVolume);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isLoadingSource, setIsLoadingSource] = useState(false);
  const [introPhase, setIntroPhase] = useState<IntroPhase>("entering");

  const clearIntroTimers = useCallback(() => {
    if (introHideTimerRef.current !== null) {
      window.clearTimeout(introHideTimerRef.current);
      introHideTimerRef.current = null;
    }
    if (introPressTimerRef.current !== null) {
      window.clearTimeout(introPressTimerRef.current);
      introPressTimerRef.current = null;
    }
    if (introEnterTimerRef.current !== null) {
      window.clearTimeout(introEnterTimerRef.current);
      introEnterTimerRef.current = null;
    }
  }, []);

  const startIntroEntrance = useCallback(() => {
    clearIntroTimers();
    setIntroPhase("entering");

    introEnterTimerRef.current = window.setTimeout(() => {
      setIntroPhase("visible");
    }, 18);
  }, [clearIntroTimers]);

  const revokeObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const applyVolume = useCallback((nextRealVolume: number) => {
    const el = audioRef.current;
    if (!el) return;

    const safe = clamp(nextRealVolume, 0, REAL_MAX_VOLUME) || DEFAULT_REAL_VOLUME;
    el.volume = safe;
    el.muted = false;
    el.defaultMuted = false;
  }, []);

  const pauseAudio = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;

    try {
      el.pause();
    } catch {}

    if (mountedRef.current) setIsPlaying(false);
  }, []);

  const seekIntoSegmentIfNeeded = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;

    const current = Number.isFinite(el.currentTime) ? el.currentTime : 0;
    if (current < startAt || current >= endAt) {
      try {
        el.currentTime = startAt;
      } catch {}
    }
  }, [startAt, endAt]);

  const leaveIntro = useCallback(() => {
    if (introPhase === "hidden" || introPhase === "leaving") return;

    setIntroPhase("pressed");

    introPressTimerRef.current = window.setTimeout(() => {
      setIntroPhase("leaving");
      introHideTimerRef.current = window.setTimeout(() => {
        setIntroPhase("hidden");
      }, 220);
    }, 90);
  }, [introPhase]);

  const tryPlayNowFromGesture = useCallback(async () => {
    const el = audioRef.current;
    if (!el || !hasAudio || playInFlightRef.current || hasSegmentEndedRef.current) return false;

    playInFlightRef.current = true;

    try {
      applyVolume(realVolume);
      seekIntoSegmentIfNeeded();
      await el.play();

      lastUserPausedRef.current = false;
      resumeOnVisibleRef.current = true;
      hasActivatedFromOverlayRef.current = true;

      if (mountedRef.current) {
        setIsPlaying(true);
      }

      return true;
    } catch {
      if (mountedRef.current) {
        setIsPlaying(false);
      }
      return false;
    } finally {
      playInFlightRef.current = false;
    }
  }, [applyVolume, hasAudio, realVolume, seekIntoSegmentIfNeeded]);

  const warmCacheInBackground = useCallback(async () => {
    if (!hasAudio || !audioUrl) return;
    if (cacheWarmInFlightRef.current) return;

    cacheWarmInFlightRef.current = true;
    try {
      await validateAndWarmAudioCache(storeCacheId, audioUrl);
    } finally {
      cacheWarmInFlightRef.current = false;
    }
  }, [audioUrl, hasAudio, storeCacheId]);

  const prepareAudioSource = useCallback(async () => {
    const el = audioRef.current;
    if (!el || !hasAudio || !audioUrl) return;

    setIsLoadingSource(true);
    setLoadError(false);
    setIsReady(false);

    revokeObjectUrl();

    try {
      const cachedBlobUrl = await getCachedAudioBlobUrl(storeCacheId, audioUrl);

      el.src = cachedBlobUrl || audioUrl;
      if (cachedBlobUrl) objectUrlRef.current = cachedBlobUrl;

      el.preload = "auto";
      (el as HTMLMediaElement & { playsInline?: boolean }).playsInline = true;
      el.loop = false;
      el.muted = false;
      el.defaultMuted = false;

      try {
        el.load();
      } catch {}

      void warmCacheInBackground();
    } catch {
      el.src = audioUrl;
      el.preload = "auto";

      try {
        el.load();
      } catch {}

      void warmCacheInBackground();
    } finally {
      if (mountedRef.current) setIsLoadingSource(false);
    }
  }, [audioUrl, hasAudio, revokeObjectUrl, storeCacheId, warmCacheInBackground]);

  const handleOverlayActivate = useCallback(async () => {
    leaveIntro();

    if (!hasAudio) return;

    const el = audioRef.current;
    if (!el) return;

    if (!el.src) {
      await prepareAudioSource();
    }

    await tryPlayNowFromGesture();
  }, [hasAudio, leaveIntro, prepareAudioSource, tryPlayNowFromGesture]);

  const togglePlayback = useCallback(async () => {
    const el = audioRef.current;
    if (!el || !hasAudio || loadError) return;

    if (isPlaying) {
      lastUserPausedRef.current = true;
      resumeOnVisibleRef.current = false;
      pauseAudio();
      return;
    }

    if (hasSegmentEndedRef.current) {
      try {
        el.currentTime = startAt;
      } catch {}
      hasSegmentEndedRef.current = false;
    }

    lastUserPausedRef.current = false;

    if (!el.src) {
      await prepareAudioSource();
    }

    await tryPlayNowFromGesture();
  }, [hasAudio, isPlaying, loadError, pauseAudio, prepareAudioSource, startAt, tryPlayNowFromGesture]);

  const handleVolumePercentChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextPercent = clamp(Number(e.target.value), 0, 100);
      const nextReal = uiPercentToRealVolume(nextPercent);

      setRealVolume(nextReal);
      applyVolume(nextReal);
      saveVolume(nextReal);
    },
    [applyVolume]
  );

  const handleResetVolume = useCallback(() => {
    clearSavedVolume();
    const fallback = DEFAULT_REAL_VOLUME;
    setRealVolume(fallback);
    applyVolume(fallback);
  }, [applyVolume]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearIntroTimers();
      revokeObjectUrl();
    };
  }, [clearIntroTimers, revokeObjectUrl]);

  useEffect(() => {
    const saved = readSavedVolume();
    const next = clamp(
      saved ?? (typeof settings?.volume === "number" ? settings.volume : DEFAULT_REAL_VOLUME),
      0,
      REAL_MAX_VOLUME
    ) || DEFAULT_REAL_VOLUME;

    setRealVolume(next);
    applyVolume(next);
  }, [settings?.volume, applyVolume]);

  useEffect(() => {
    const previousKind = readPreviousRouteKind(storeId, storeName);

    if (isBlogRoute) {
      setIntroPhase("hidden");
      setIsOpen(false);
      writeCurrentRouteKind(storeId, storeName, "blog");
      isFirstRouteEvaluationRef.current = false;
      return;
    }

    let shouldShow = false;

    if (isFirstRouteEvaluationRef.current) {
      const navMode = documentNavigationModeRef.current;
      shouldShow =
        navMode === "navigate" ||
        previousKind === "blog";
    } else {
      shouldShow = previousKind === "blog";
    }

    if (shouldShow) {
      startIntroEntrance();
    } else {
      clearIntroTimers();
      setIntroPhase("hidden");
    }

    setIsOpen(false);
    hasActivatedFromOverlayRef.current = false;
    writeCurrentRouteKind(storeId, storeName, "store");
    isFirstRouteEvaluationRef.current = false;
  }, [pathname, isBlogRoute, storeId, storeName, clearIntroTimers, startIntroEntrance]);

  useEffect(() => {
    if (!hasAudio) {
      setIsReady(false);
      setLoadError(false);
      setIsPlaying(false);
      setIsLoadingSource(false);
      playInFlightRef.current = false;
      lastUserPausedRef.current = false;
      resumeOnVisibleRef.current = false;
      hasSegmentEndedRef.current = false;

      const el = audioRef.current;
      if (el) {
        try {
          el.pause();
        } catch {}
        el.removeAttribute("src");
      }

      revokeObjectUrl();
      return;
    }

    const el = audioRef.current;
    if (!el) return;

    setIsReady(false);
    setLoadError(false);
    setIsPlaying(false);
    setIsLoadingSource(false);

    playInFlightRef.current = false;
    lastUserPausedRef.current = false;
    resumeOnVisibleRef.current = false;
    hasSegmentEndedRef.current = false;

    try {
      el.pause();
    } catch {}

    el.removeAttribute("src");
    revokeObjectUrl();

    void prepareAudioSource();

    return () => {
      try {
        el.pause();
      } catch {}
      revokeObjectUrl();
    };
  }, [hasAudio, prepareAudioSource, revokeObjectUrl]);

  useEffect(() => {
    if (!hasAudio) return;

    const el = audioRef.current;
    if (!el) return;

    const onLoadedMetadata = () => {
      setIsReady(true);
      setLoadError(false);
      applyVolume(realVolume);

      try {
        const current = Number.isFinite(el.currentTime) ? el.currentTime : 0;
        if (current < startAt || current > endAt) {
          el.currentTime = startAt;
        }
      } catch {}
    };

    const onCanPlay = () => {
      setIsReady(true);
      setLoadError(false);
      applyVolume(realVolume);
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsReady(false);
    const onPlaying = () => {
      setIsReady(true);
      setIsPlaying(true);
    };

    const onTimeUpdate = () => {
      if (!Number.isFinite(el.currentTime)) return;

      if (el.currentTime >= endAt) {
        hasSegmentEndedRef.current = true;
        resumeOnVisibleRef.current = false;

        try {
          el.pause();
        } catch {}

        try {
          el.currentTime = endAt;
        } catch {}
      }
    };

    const onEnded = () => {
      hasSegmentEndedRef.current = true;
      resumeOnVisibleRef.current = false;
      setIsPlaying(false);
    };

    const onError = () => {
      setLoadError(true);
      setIsReady(false);
      setIsPlaying(false);
    };

    el.addEventListener("loadedmetadata", onLoadedMetadata);
    el.addEventListener("canplay", onCanPlay);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("waiting", onWaiting);
    el.addEventListener("playing", onPlaying);
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("ended", onEnded);
    el.addEventListener("error", onError);

    return () => {
      el.removeEventListener("loadedmetadata", onLoadedMetadata);
      el.removeEventListener("canplay", onCanPlay);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("waiting", onWaiting);
      el.removeEventListener("playing", onPlaying);
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("error", onError);
    };
  }, [applyVolume, endAt, hasAudio, realVolume, startAt]);

  useEffect(() => {
    if (!hasAudio) return;

    const handleVisibilityChange = async () => {
      const el = audioRef.current;
      if (!el) return;

      if (document.hidden) {
        resumeOnVisibleRef.current =
          !el.paused && !lastUserPausedRef.current && !hasSegmentEndedRef.current;

        try {
          el.pause();
        } catch {}

        if (mountedRef.current) setIsPlaying(false);
        return;
      }

      if (
        resumeOnVisibleRef.current &&
        !lastUserPausedRef.current &&
        !hasSegmentEndedRef.current &&
        hasActivatedFromOverlayRef.current
      ) {
        await tryPlayNowFromGesture();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hasAudio, tryPlayNowFromGesture]);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsidePointer = (event: PointerEvent) => {
      const root = rootRef.current;
      const target = event.target as Node | null;
      if (!root || !target) return;

      if (!root.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsidePointer, true);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointer, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!hasAudio) return;

    const handleOtherMedia = (event: Event) => {
      const self = audioRef.current;
      const target = event.target;

      if (!self || !target || target === self) return;
      if (!(target instanceof HTMLMediaElement)) return;

      if (isAudibleMedia(target)) {
        resumeOnVisibleRef.current = false;
        pauseAudio();
      }
    };

    document.addEventListener("play", handleOtherMedia, true);
    document.addEventListener("volumechange", handleOtherMedia, true);

    return () => {
      document.removeEventListener("play", handleOtherMedia, true);
      document.removeEventListener("volumechange", handleOtherMedia, true);
    };
  }, [hasAudio, pauseAudio]);

  useEffect(() => {
    if (!hasAudio) return;

    const handleIframeFocusLikePlayback = () => {
      const active = document.activeElement;
      if (active instanceof HTMLIFrameElement) {
        resumeOnVisibleRef.current = false;
        pauseAudio();
      }
    };

    window.addEventListener("blur", handleIframeFocusLikePlayback);
    return () => {
      window.removeEventListener("blur", handleIframeFocusLikePlayback);
    };
  }, [hasAudio, pauseAudio]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (isBlogRoute) return;

    const shouldLock =
      introPhase === "entering" ||
      introPhase === "visible" ||
      introPhase === "pressed" ||
      introPhase === "leaving";

    if (!shouldLock) return;

    const html = document.documentElement;
    const body = document.body;

    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyTouchAction = body.style.touchAction;
    const previousBodyOverscroll = body.style.overscrollBehavior;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    body.style.overscrollBehavior = "none";

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.touchAction = previousBodyTouchAction;
      body.style.overscrollBehavior = previousBodyOverscroll;
    };
  }, [introPhase, isBlogRoute]);

  if (isBlogRoute) return null;

  const showIntro = introPhase !== "hidden";
  const volumePercent = realVolumeToUiPercent(realVolume);

  const statusText = loadError
    ? "Unavailable"
    : isPlaying
      ? "Playing"
      : isLoadingSource
        ? "Loading"
        : isReady
          ? hasSegmentEndedRef.current
            ? "Ended"
            : "Ready"
          : "Standby";

  return (
    <>
      {hasAudio ? <audio ref={audioRef} /> : null}

      {showIntro ? (
        <div
          className={[
            "fixed inset-0 z-[2147483646] overflow-hidden touch-none transition-all duration-300 ease-out",
  introPhase === "entering" ? "opacity-0 scale-[1.015]" : "",            introPhase === "entering" ? "opacity-0 scale-[1.015]" : "",
            introPhase === "visible" ? "opacity-100 scale-100" : "",
            introPhase === "pressed" ? "opacity-100 scale-[0.997]" : "",
            introPhase === "leaving" ? "opacity-0 scale-[1.01]" : "",
          ].join(" ")}
          role="button"
          tabIndex={0}
          aria-label="Enter store"
          onPointerUp={(e) => {
            if (e.pointerType === "mouse" || e.pointerType === "touch" || e.pointerType === "pen") {
              void handleOverlayActivate();
            }
          }}
          onClick={(e) => {
            e.preventDefault();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              void handleOverlayActivate();
            }
          }}
          onWheel={(e) => e.preventDefault()}
          onTouchMove={(e) => e.preventDefault()}
        >
          <div
            className={[
              "absolute inset-0 bg-black/64  transition-opacity duration-300",
              introPhase === "entering" ? "opacity-0" : "",
              introPhase === "visible" ? "opacity-100" : "",
              introPhase === "pressed" ? "opacity-95" : "",
              introPhase === "leaving" ? "opacity-0" : "",
            ].join(" ")}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))]" />

          <div className="absolute inset-0 opacity-75">
            <div
              className={[
                "absolute left-1/2 top-[18%] h-44 w-[84%] max-w-[900px] -translate-x-1/2 rounded-[38px] border border-white/10 bg-white/[0.03] shadow-[0_18px_60px_rgba(0,0,0,0.12)] transition-all duration-300",
                introPhase === "entering" ? "translate-y-6 scale-[1.02] opacity-0" : "",
                introPhase === "visible" ? "translate-y-0 scale-100 opacity-100" : "",
                introPhase === "pressed" ? "translate-y-2 scale-[0.994] opacity-100" : "",
                introPhase === "leaving" ? "translate-y-4 scale-[1.01] opacity-0" : "",
              ].join(" ")}
            />
            <div
              className={[
                "absolute left-1/2 top-[31%] h-52 w-[92%] max-w-[1160px] -translate-x-1/2 rounded-[46px] border border-white/8 bg-white/[0.022] shadow-[0_20px_70px_rgba(0,0,0,0.14)] transition-all duration-300",
                introPhase === "entering" ? "translate-y-8 scale-[1.024] opacity-0" : "",
                introPhase === "visible" ? "translate-y-0 scale-100 opacity-100" : "",
                introPhase === "pressed" ? "translate-y-4 scale-[0.988] opacity-100" : "",
                introPhase === "leaving" ? "translate-y-6 scale-[1.012] opacity-0" : "",
              ].join(" ")}
            />
          </div>

          <div className="relative flex h-full items-center justify-center px-5">
            <div
              className={[
                "w-full max-w-xl transition-all duration-300 ease-out",
                introPhase === "entering" ? "opacity-0 translate-y-6 scale-[1.02]" : "",
                introPhase === "visible" ? "opacity-100 translate-y-0 scale-100" : "",
                introPhase === "pressed" ? "opacity-100 scale-[0.988] translate-y-[1px]" : "",
                introPhase === "leaving" ? "opacity-0 translate-y-3 scale-[1.01]" : "",
              ].join(" ")}
            >
              <div className="mx-auto flex max-w-md flex-col items-center">
                <div className="mb-5 flex h-15 w-15 items-center justify-center rounded-[24px] border border-white/14 bg-white/[0.08] text-white shadow-[0_8px_30px_rgba(0,0,0,0.14)]">
                  <Store size={20} />
                </div>

                <div className="text-center">
                  <div className="max-w-[280px] truncate text-[25px] font-semibold tracking-tight text-white sm:max-w-[420px] sm:text-[33px]">
                    {storeName || "Store"}
                  </div>

                  {shortDescription ? (
                    <p className="mx-auto mt-3 max-w-[320px] text-center text-[12px] leading-relaxed text-white/70 sm:max-w-[440px] sm:text-[13px]">
                      {shortDescription}
                    </p>
                  ) : null}

                  {currencyInfo ? (
                    <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] text-white/86">
                      <span className="text-[14px] leading-none">{currencyInfo.flag}</span>
                      <span className="truncate">
                        {currencyInfo.country}
                        <span className="mx-1 opacity-40">•</span>
                        {currencyInfo.code}
                        {currencyInfo.symbol ? (
                          <span className="ml-1 opacity-80">{currencyInfo.symbol}</span>
                        ) : null}
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="mt-8 flex items-center gap-3">
                  <div className="h-px w-10 bg-white/14" />
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2">
                    <span className="inline-flex h-2 w-2 rounded-full bg-white/80" />
                    <span className="text-[12px] font-medium text-white/85">
                      Tap anywhere
                    </span>
                  </div>
                  <div className="h-px w-10 bg-white/14" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {hasAudio ? (
        <div
          ref={rootRef}
          className="fixed bottom-2 right-0 z-[2147483647] pointer-events-auto"
        >
          <div
            className={[
              "flex items-center rounded-l-2xl border border-r-0 shadow-lg  transition-transform duration-300",
              "border-slate-200/90 bg-white/88 text-slate-900",
              "dark:border-white/10 dark:bg-[#090b10]/82 dark:text-white",
              isOpen ? "translate-x-0" : "translate-x-[calc(100%-42px)]",
            ].join(" ")}
          >
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className="flex h-9 w-[42px] shrink-0 items-center justify-center text-slate-700 transition hover:text-slate-950 dark:text-slate-200 dark:hover:text-white"
              aria-label={isOpen ? "Hide audio controls" : "Show audio controls"}
              title={isOpen ? "Hide audio controls" : "Show audio controls"}
            >
              <div className="flex flex-col items-center justify-center gap-0.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/10">
                  {isPlaying ? <Volume2 size={10} /> : <VolumeX size={10} />}
                </div>
                <div className="max-w-[32px] truncate text-[6px] font-bold leading-none text-slate-500 dark:text-white/55">
                  {isPlaying ? "ON" : "AUDIO"}
                </div>
              </div>
            </button>

            <div className="flex h-9 items-center gap-1 pl-1 pr-1.5 sm:gap-1.5 sm:pr-2">
              <button
                type="button"
                onClick={() => void togglePlayback()}
                disabled={loadError}
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-900 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                aria-label={isPlaying ? "Pause audio" : "Play audio"}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Volume2 size={10} /> : <VolumeX size={10} />}
              </button>

              <div className="min-w-0 max-w-[80px] sm:max-w-[100px]">
                <div className="truncate text-[9px] font-semibold leading-none text-slate-900 dark:text-white">
                  {storeName || "Store"}
                </div>
                <div className="mt-0.5 truncate text-[7px] leading-none text-slate-500 dark:text-white/55">
                  {statusText}
                </div>
              </div>

              <div className="flex min-w-[70px] items-center gap-1 sm:min-w-[100px] sm:gap-1.5">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={volumePercent}
                  onChange={handleVolumePercentChange}
                  className="w-10 accent-slate-900 dark:accent-white sm:w-16"
                  aria-label="Audio volume"
                  disabled={loadError}
                />
                <span className="w-6 shrink-0 text-right text-[7px] font-semibold text-slate-500 dark:text-white/55">
                  {volumePercent}%
                </span>
              </div>

              <button
                type="button"
                onClick={handleResetVolume}
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Reset saved volume"
                title="Reset saved volume"
              >
                <RotateCcw size={10} />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label={isOpen ? "Hide audio controls" : "Show audio controls"}
                title={isOpen ? "Hide audio controls" : "Show audio controls"}
              >
                {isOpen ? <ChevronRight size={10} /> : <ChevronLeft size={10} />}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
});