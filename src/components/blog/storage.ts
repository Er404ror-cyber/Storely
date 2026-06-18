import type { PreferenceState, SearchHistoryItem, ShowcaseViewState, ProductRow, StorelyCachePayload } from "../../types/Marketplace";
import { LS_PREFS, LS_HISTORY, STORELY_STATE_KEY, STORELY_CACHE_KEY, STORELY_CACHE_VERSION, STORELY_CACHE_TTL, MAX_RECENT_SEARCHES } from "./constants";
import { normalizeText, parseJSON } from "../../utils/marketplaceutils";

export function getPrefs(): PreferenceState {
  if (typeof window === "undefined") {
    return { categories: {}, stores: {}, products: {}, searches: {} };
  }
  return parseJSON<PreferenceState>(window.localStorage.getItem(LS_PREFS), {
    categories: {},
    stores: {},
    products: {},
    searches: {},
  });
}

export function setPrefs(prefs: PreferenceState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_PREFS, JSON.stringify(prefs));
  } catch {}
}

export function getHistory(): SearchHistoryItem[] {
  if (typeof window === "undefined") return [];
  return parseJSON<SearchHistoryItem[]>(
    window.localStorage.getItem(LS_HISTORY),
    []
  ).slice(0, MAX_RECENT_SEARCHES);
}

export function setHistory(history: SearchHistoryItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      LS_HISTORY,
      JSON.stringify(history.slice(0, MAX_RECENT_SEARCHES))
    );
  } catch {}
}

export function pushHistory(value: string) {
  const cleaned = value.trim();
  if (!cleaned) return;

  const next = getHistory().filter(
    (item) => normalizeText(item.value) !== normalizeText(cleaned)
  );

  next.unshift({ value: cleaned, ts: Date.now() });
  setHistory(next.slice(0, MAX_RECENT_SEARCHES));
}

export function readShowcaseState(): ShowcaseViewState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORELY_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ShowcaseViewState;
  } catch {
    return null;
  }
}

export function writeShowcaseState(state: ShowcaseViewState) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORELY_STATE_KEY, JSON.stringify(state));
  } catch {}
}

export function saveShowcaseStateNow(state: {
  query: string;
  selectedCategory: string;
  selectedStore: string;
  showFilters: boolean;
  pathname: string;
}) {
  if (typeof window === "undefined") return;
  writeShowcaseState({
    query: state.query,
    selectedCategory: state.selectedCategory,
    selectedStore: state.selectedStore,
    showFilters: state.showFilters,
    scrollY: window.scrollY || window.pageYOffset || 0,
    savedAt: Date.now(),
    pathname: state.pathname,
  });
}

export function readStorelyCache(): StorelyCachePayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORELY_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StorelyCachePayload;

    if (
      !parsed ||
      parsed.version !== STORELY_CACHE_VERSION ||
      !Array.isArray(parsed.data) ||
      typeof parsed.savedAt !== "number" ||
      typeof parsed.expiresAt !== "number"
    ) {
      localStorage.removeItem(STORELY_CACHE_KEY);
      return null;
    }

    if (Date.now() >= parsed.expiresAt) {
      localStorage.removeItem(STORELY_CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(STORELY_CACHE_KEY);
    return null;
  }
}

export function writeStorelyCache(data: ProductRow[]) {
  if (typeof window === "undefined") return null;
  const now = Date.now();
  const payload: StorelyCachePayload = {
    version: STORELY_CACHE_VERSION,
    data,
    savedAt: now,
    expiresAt: now + STORELY_CACHE_TTL,
  };
  try {
    localStorage.setItem(STORELY_CACHE_KEY, JSON.stringify(payload));
    return payload;
  } catch {
    return null;
  }
}

export function clearStorelyCache() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORELY_CACHE_KEY);
  } catch {}
}