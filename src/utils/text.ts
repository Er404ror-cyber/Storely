import { readStoreCache, STORE_CACHE_TTL } from "./storeCache";

export const LIMITS = {
  category: 12,
  title: 25,
  description: 80,
};

export const CACHE_TIME = 1000 * 60 * 20;
export const CACHE_VERSION = "v10";
export const PRODUCTS_LIMIT = 32;
export const INITIAL_VISIBLE = 6;

export function safeText(value: unknown, limit: number): string {
  return String(value || "")
    .replace(/[\n\r]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

export function cacheKey(...parts: Array<string | number | null | undefined>): string {
  return parts.filter(Boolean).join("_");
}

// LÊ O CACHE FILHO - Verifica a Assinatura Genética (parentSavedAt)
export function readCache<T>(key: string, parentSlug?: string | null): T | null {
  try {
    if (typeof window === "undefined") return null;

    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    // 1. Validação de Subordinação Absoluta: 
    // Se o pai reseta, o 'savedAt' dele muda. O filho descobre a fraude e suicida-se.
    if (parentSlug) {
      const parentCache = readStoreCache(parentSlug);
      if (!parentCache || parentCache.savedAt !== parsed.parentSavedAt) {
        localStorage.removeItem(key);
        return null;
      }
    }

    if (parsed.version !== CACHE_VERSION || Date.now() > parsed.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.data as T;
  } catch {
    try { localStorage.removeItem(key); } catch {}
    return null;
  }
}

// ESCREVE O CACHE FILHO - Regista a Impressão Digital do Pai
export function writeCache<T>(key: string, data: T, parentSlug?: string | null) {
  try {
    if (typeof window === "undefined") return;

    let expiresAt = Date.now() + CACHE_TIME; 
    let parentSavedAt = null;

    // Sincroniza o tempo de morte E guarda a assinatura de quem era o pai na altura
    if (parentSlug) {
      const parentCache = readStoreCache(parentSlug);
      if (parentCache) {
        expiresAt = parentCache.expiresAt;
        parentSavedAt = parentCache.savedAt; // <-- O Segredo da Sincronização Perfeita
      } else {
        expiresAt = Date.now() + STORE_CACHE_TTL;
      }
    }

    localStorage.setItem(key, JSON.stringify({ version: CACHE_VERSION, data, expiresAt, parentSavedAt }));
  } catch {}
}

// Algoritmo Fuzzy de altíssima performance (Subsequência)
export function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase().replace(/\s+/g, '');
  const t = text.toLowerCase();
  
  if (t.includes(q)) return true; 
  
  let i = 0, j = 0;
  while (i < q.length && j < t.length) {
    if (q[i] === t[j]) i++;
    j++;
  }
  return i === q.length; 
}