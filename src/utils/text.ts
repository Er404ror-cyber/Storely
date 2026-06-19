export const LIMITS = {
  category: 12,
  title: 25,
  description: 80,
};

export const CACHE_TIME = 1000 * 60 * 20;
export const CACHE_VERSION = "v10";
export const PRODUCTS_LIMIT = 32;
export const INITIAL_VISIBLE = 12;

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

export function readCache<T>(key: string): T | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
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

export function writeCache<T>(key: string, data: T) {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify({ version: CACHE_VERSION, data, expiresAt: Date.now() + CACHE_TIME }));
  } catch {}
}

// Algoritmo Fuzzy de altíssima performance (Subsequência) para não torrar a CPU
export function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase().replace(/\s+/g, '');
  const t = text.toLowerCase();
  
  if (t.includes(q)) return true; // Match direto rápido
  
  let i = 0, j = 0;
  while (i < q.length && j < t.length) {
    if (q[i] === t[j]) i++;
    j++;
  }
  return i === q.length; // Match de subsequência (ex: "iph" encontra "iphone")
}