export type BackgroundAudioSettings = {
    enabled?: boolean;
    type?: "audio" | null;
    url?: string | null;
    volume?: number;
    autoplay_on_scroll?: boolean;
    startAt?: number;
    endAt?: number;
  };
  
  export type PublicBackgroundAudioProps = {
    settings?: BackgroundAudioSettings | null;
    storeName?: string;
    storeId?: string | null;
    storeDescription?: string | null;
    storeCurrency?: string | null;
  };
  
  export type IntroPhase = "hidden" | "entering" | "visible" | "pressed" | "leaving";
  export type RouteKind = "blog" | "store" | "other";
  export type NavigationMode = "navigate" | "reload" | "back_forward" | "prerender" | "unknown";
  
  export const REAL_MAX_VOLUME = 1;
  export const DEFAULT_REAL_VOLUME = 1;
  export const DEFAULT_SEGMENT_SECONDS = 60;
  
  export const LS_VOLUME_KEY = "storely_public_bg_audio_volume_v23";
  export const LS_AUDIO_CACHE_META_KEY = "storely_public_bg_audio_cache_meta_v11";
  export const SESSION_ROUTE_KIND_PREFIX = "storely_route_kind_v3:";
  export const AUDIO_CACHE_NAME = "storely-public-audio-cache-v11";
  
  export type CacheMetaRecord = {
    storeCacheId: string;
    url: string;
    cacheRequestUrl: string;
    expiresAt: number;
    savedAt: number;
  };
  
  export type CacheMetaMap = Record<string, CacheMetaRecord>;
  
  export function clamp(num: number, min: number, max: number) {
    return Math.max(min, Math.min(num, max));
  }
  
  export function isPlayableBackgroundAudioUrl(url?: string | null) {
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