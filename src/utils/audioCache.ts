import {
  LS_AUDIO_CACHE_META_KEY,
  AUDIO_CACHE_NAME,
  SESSION_ROUTE_KIND_PREFIX,
  type CacheMetaMap,
  type RouteKind,
  type NavigationMode,
}  from "../types/publicAudio";

export function readSavedVolume(maxVolume: number, defaultVolume: number): number {
  if (typeof window === "undefined") return defaultVolume;
  try {
    const raw = window.localStorage.getItem("storely_public_bg_audio_volume_v23");
    if (!raw) return defaultVolume;
    const parsed = Number(raw);
    return Math.max(0, Math.min(parsed, maxVolume)) || defaultVolume;
  } catch {
    return defaultVolume;
  }
}

export function getSafeStoreCacheId(storeId?: string | null, storeName?: string | null): string {
  const raw = (storeId || storeName || "default-store").trim().toLowerCase();
  return raw.replace(/[^a-z0-9_-]+/g, "_").slice(0, 120) || "default-store";
}

export function getDocumentNavigationMode(): NavigationMode {
  if (typeof window === "undefined" || typeof performance === "undefined") return "unknown";
  const entries = performance.getEntriesByType?.("navigation") as PerformanceNavigationTiming[] | undefined;
  const type = entries?.[0]?.type;
  if (type === "navigate" || type === "reload" || type === "back_forward" || type === "prerender") {
    return type;
  }
  return "unknown";
}

export function readPreviousRouteKind(storeId?: string | null, storeName?: string | null): RouteKind | null {
  if (typeof window === "undefined") return null;
  try {
    const key = `${SESSION_ROUTE_KIND_PREFIX}${getSafeStoreCacheId(storeId, storeName)}`;
    const raw = window.sessionStorage.getItem(key);
    if (raw === "blog" || raw === "store" || raw === "other") return raw;
    return null;
  } catch {
    return null;
  }
}

export function writeCurrentRouteKind(storeId: string | null | undefined, storeName: string | null | undefined, kind: RouteKind) {
  if (typeof window === "undefined") return;
  try {
    const key = `${SESSION_ROUTE_KIND_PREFIX}${getSafeStoreCacheId(storeId, storeName)}`;
    window.sessionStorage.setItem(key, kind);
  } catch {}
}

export async function getCachedAudioBlobUrl(storeCacheId: string, expectedUrl: string): Promise<string | null> {
  if (typeof window === "undefined" || !("caches" in window)) return null;
  try {
    const raw = window.localStorage.getItem(LS_AUDIO_CACHE_META_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as CacheMetaMap;
    const meta = map[storeCacheId];
    
    if (!meta || meta.url !== expectedUrl || meta.expiresAt <= Date.now()) return null;

    const cache = await caches.open(AUDIO_CACHE_NAME);
    const response = await cache.match(meta.cacheRequestUrl);
    if (!response || !response.ok) return null;

    const blob = await response.blob();
    return blob.size > 0 ? URL.createObjectURL(blob) : null;
  } catch {
    return null;
  }
}