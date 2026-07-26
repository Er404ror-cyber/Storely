import type { CachePayload } from "../../../types/productsListTypes";

export const ADMIN_STORE_CACHE_KEY = 'storelyy_admin_store_cache';
export const ADMIN_STORE_CACHE_TTL = 1000 * 60 * 5; // 5 minutos

export function readLocalCache<T>(key: string): CachePayload<T> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachePayload<T>;
    if (!parsed || typeof parsed.savedAt !== 'number' || typeof parsed.expiresAt !== 'number' || parsed.data == null) {
      localStorage.removeItem(key);
      return null;
    }
    if (Date.now() >= parsed.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

export function writeLocalCache<T>(key: string, data: T, ttl: number): CachePayload<T> | null {
  if (typeof window === 'undefined') return null;
  const now = Date.now();
  const payload: CachePayload<T> = { data, savedAt: now, expiresAt: now + ttl };
  try {
    localStorage.setItem(key, JSON.stringify(payload));
    return payload;
  } catch {
    return null;
  }
}