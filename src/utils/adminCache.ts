import type { CachePayload } from '../types/admin';

export const MINUTOS_DE_CACHE_STORE = 120;
export const MINUTOS_DE_CACHE_PAGES = 120;

export const ADMIN_STORE_CACHE_TTL = 1000 * 60 * MINUTOS_DE_CACHE_STORE;
export const ADMIN_PAGES_CACHE_TTL = 1000 * 60 * MINUTOS_DE_CACHE_PAGES;
export const ADMIN_STORE_CACHE_KEY = 'storelyy_admin_store_cache';

export type DataSource = 'cache' | 'network' | 'none';

export function getAdminPagesCacheKey(storeId?: string): string {
  return `storelyy_admin_pages_cache:${storeId ?? 'unknown'}`;
}

export function generateSlug(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export function readCache<T>(key: string): CachePayload<T> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachePayload<T>;
    if (
      !parsed ||
      typeof parsed.savedAt !== 'number' ||
      typeof parsed.expiresAt !== 'number' ||
      parsed.data == null
    ) {
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

export function writeCache<T>(key: string, data: T, ttl: number): CachePayload<T> | null {
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

export function clearCache(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {}
}

export function formatCacheRemaining(ms: number): string {
  if (ms <= 0) return '0s';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}