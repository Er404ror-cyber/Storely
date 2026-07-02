import { useState, useEffect } from "react";
import type { ProductItem, StoreItem, ProductStore } from "../types/Marketplace";

export function parseJSON<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

export function normalizeCompact(value: string) {
  return normalizeText(value).replace(/\s+/g, "");
}

export function tokenize(value: string) {
  return normalizeText(value).split(/\s+/).filter(Boolean);
}

export function exactLikeScore(query: string, target: string) {
  if (!query || !target) return 0;
  const q = normalizeText(query);
  const t = normalizeText(target);
  const qc = normalizeCompact(query);
  const tc = normalizeCompact(target);

  if (!q || !t) return 0;
  if (q === t) return 300;
  if (qc === tc) return 290;
  if (t.startsWith(q)) return 170;
  if (tc.startsWith(qc)) return 165;
  if (t.includes(q)) return 130;
  if (tc.includes(qc)) return 125;
  return 0;
}

export function similarityScore(query: string, target: string) {
  const exactBoost = exactLikeScore(query, target);
  if (exactBoost > 0) return exactBoost;

  const q = normalizeText(query);
  const t = normalizeText(target);
  if (!q || !t) return 0;

  const qTokens = tokenize(q);
  const tTokens = tokenize(t);
  let score = 0;

  for (const token of qTokens) {
    if (tTokens.includes(token)) score += 22;
    else if (t.includes(token)) score += 12;
  }

  if (qTokens.length > 1 && qTokens.every((token) => t.includes(token))) {
    score += 18;
  }
  return score;
}

export function seededHash(str: string, seed: number) {
  let h = 2166136261 ^ seed;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return Math.abs(h >>> 0);
}

export function stableShuffle<T>(items: T[], seed: number) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = seededHash(`${seed}-${i}`, seed) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

export function bumpScore(obj: Record<string, number>, key: string, amount = 1) {
  if (!key) return obj;
  return {
    ...obj,
    [key]: Math.min((obj[key] || 0) + amount, 100),
  };
}

export function useDebouncedValue<T>(value: T, delay = 220) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function formatRemainingShort(ms: number, expiredLabel: string) {
  if (ms <= 0) return expiredLabel;
  const totalMinutes = Math.ceil(ms / 60000);
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
}

export function parsePrice(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function resolveStoreCurrency(store: ProductStore | null | undefined, fallback = "USD") {
  const direct = typeof store?.currency === "string" ? store.currency.trim() : "";
  const fromSettings =
    typeof store?.settings === "object" &&
    store?.settings !== null &&
    typeof (store.settings as Record<string, unknown>).currency === "string"
      ? String((store.settings as Record<string, unknown>).currency).trim()
      : "";
  return direct || fromSettings || fallback;
}

export function formatProductPrice(value: number | null, currency: string, locale: string) {
  if (value == null) return "";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(value % 1 === 0 ? 0 : 2)}`;
  }
}

export function getShortRelativeTime(date: string, locale: "pt" | "en") {
  const now = Date.now();
  const value = new Date(date).getTime();
  const diffMs = value - now;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const abs = Math.abs(diffMs);

  if (abs < hour) {
    const v = Math.round(diffMs / minute) || -1;
    return rtf.format(v, "minute");
  }
  if (abs < day) {
    const v = Math.round(diffMs / hour);
    return rtf.format(v, "hour");
  }
  if (abs < week) {
    const v = Math.round(diffMs / day);
    return rtf.format(v, "day");
  }
  const v = Math.round(diffMs / week);
  return rtf.format(v, "week");
}

export function compactRelativeLabel(label: string) {
  return label
    .replace(/\s+/g, " ")
    .replace("minutes ago", "m")
    .replace("minute ago", "m")
    .replace("hours ago", "h")
    .replace("hour ago", "h")
    .replace("days ago", "d")
    .replace("day ago", "d")
    .replace("weeks ago", "w")
    .replace("week ago", "w")
    .replace("há ", "")
    .replace(" minutos", "m")
    .replace(" minuto", "m")
    .replace(" horas", "h")
    .replace(" hora", "h")
    .replace(" dias", "d")
    .replace(" dia", "d")
    .replace(" semanas", "w")
    .replace(" semana", "w")
    .trim();
}

export function interleaveByStore(items: ProductItem[]) {
  const byStore = new Map<string, ProductItem[]>();
  for (const item of items) {
    if (!byStore.has(item.storeSlug)) byStore.set(item.storeSlug, []);
    byStore.get(item.storeSlug)!.push(item);
  }
  const buckets = Array.from(byStore.values());
  const result: ProductItem[] = [];
  let hasItems = true;
  let index = 0;

  while (hasItems) {
    hasItems = false;
    for (const bucket of buckets) {
      const item = bucket[index];
      if (item) {
        result.push(item);
        hasItems = true;
      }
    }
    index++;
  }
  return result;
}

export function diversifyProducts(items: ProductItem[], recentWindow = 4, maxRecentSameStore = 1) {
  const groups = new Map<string, ProductItem[]>();
  for (const item of items) {
    if (!groups.has(item.storeSlug)) groups.set(item.storeSlug, []);
    groups.get(item.storeSlug)!.push(item);
  }
  const buckets = Array.from(groups.entries()).map(([slug, bucket]) => ({
    slug,
    bucket: [...bucket],
  }));

  const result: ProductItem[] = [];
  const recentStores: string[] = [];

  while (buckets.some((entry) => entry.bucket.length > 0)) {
    let placed = false;
    for (const entry of buckets) {
      if (!entry.bucket.length) continue;
      const recentCount = recentStores.filter((slug) => slug === entry.slug).length;
      if (recentCount >= maxRecentSameStore) continue;

      const item = entry.bucket.shift();
      if (!item) continue;
      result.push(item);
      recentStores.push(entry.slug);
      if (recentStores.length > recentWindow) recentStores.shift();
      placed = true;
    }

    if (!placed) {
      for (const entry of buckets) {
        const item = entry.bucket.shift();
        if (!item) continue;
        result.push(item);
        recentStores.push(entry.slug);
        if (recentStores.length > recentWindow) recentStores.shift();
      }
    }
  }
  return result;
}

export function sortProductsStableByCache(items: ProductItem[], cacheSeed: number, groupKey: string) {
  const shuffled = stableShuffle(items, seededHash(groupKey, cacheSeed));
  return diversifyProducts(interleaveByStore(shuffled), 4, 1);
}

export function sortStoresStableByCache(items: StoreItem[], cacheSeed: number, groupKey: string) {
  const base = [...items].sort((a, b) => {
    const totalDiff = b.total - a.total;
    if (totalDiff !== 0) return totalDiff;
    return a.name.localeCompare(b.name);
  });
  return stableShuffle(base, seededHash(groupKey, cacheSeed));
}

export function hasStorelyAccount() {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(localStorage.getItem("storely-auth-user"));
  } catch {
    return false;
  }
}

export function idle(cb: () => void) {
  if (typeof window === "undefined") return;
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => cb());
  } else {
    setTimeout(cb, 1);
  }
}

export function smoothScrollBy(node: HTMLDivElement | null, left: number) {
  if (!node) return;
  node.scrollBy({ left, behavior: "smooth" });
}