import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Store,
  ShoppingBag,
  UserPlus,
  ChevronRight,
  Clock3,
  SlidersHorizontal,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useTranslate } from "../../context/LanguageContext";

/* =========================
   Types
========================= */


type ProductStore = {
  id?: string;
  slug?: string;
  name?: string | null;
  description?: string | null;
  logo_url?: string | null;
  whatsapp_number?: string | null;
  settings?: Record<string, unknown> | null;
  currency?: string | null;
};

type ProductRow = {
  id: string;
  name: string | null;
  category: string | null;
  main_image: string | null;
  gallery?: string[] | null;
  full_description?: string | null;
  unit?: string | null;
  created_at: string;
  price: number | string | null;
  currency?: string | null;
  stores?: ProductStore | ProductStore[] | null;
};

type ProductItem = {
  id: string;
  name: string;
  category: string;
  image: string;
  gallery: string[];
  description: string;
  unit: string;
  createdAt: string;
  createdAtValue: number;
  timeAgoShort: string;
  storeSlug: string;
  storeName: string;
  storeDescription: string;
  storeLogo: string;
  storeWhatsApp?: string | null;
  price: number | null;
  currency: string;

  searchName: string;
  searchCategory: string;
  searchStore: string;
  searchDescription: string;
  searchFull: string;
};

type StoreItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  logoUrl: string;
  heroImage?: string;
  whatsapp_number?: string | null;
  settings?: Record<string, unknown> | null;

  total: number;
  categories: string[];
  searchName: string;
  searchDescription: string;
  searchCategories: string;
};



type PreferenceState = {
  categories: Record<string, number>;
  stores: Record<string, number>;
  products: Record<string, number>;
  searches: Record<string, number>;
};

type SearchHistoryItem = {
  value: string;
  ts: number;
};

type StorelyCachePayload = {
  version: number;
  data: ProductRow[];
  savedAt: number;
  expiresAt: number;
};

type ShowcaseViewState = {
  query: string;
  selectedCategory: string;
  selectedStore: string;
  showFilters: boolean;
  scrollY: number;
};

type FeedSection =
  | { id: string; type: "products-grid"; items: ProductItem[]; title?: string }
  | { id: string; type: "products-strip"; title: string; items: ProductItem[] }
  | { id: string; type: "stores-strip"; title: string; items: StoreItem[] }
  | { id: string; type: "cta" }
  | { id: string; type: "empty-state" };

type SearchMode =
  | "default"
  | "exact"
  | "approximate"
  | "related"
  | "fallback"
  | "none";

/* =========================
   Constants
========================= */

const FALLBACK_PRODUCT =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=640&q=72";

const FALLBACK_STORE =
  "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=720&q=72";

const LS_PREFS = "storely-prefs-v12";
const LS_HISTORY = "storely-history-v12";
const LS_AUTH_HINT = "storely-auth-user";

const STORELY_CACHE_KEY = "storely-public-cache-v9";
const STORELY_CACHE_VERSION = 9;
const STORELY_CACHE_TTL = 1000 * 60 * 60 * 2;
const STORELY_STATE_KEY = "storely-showcase-ui-v4";

const MAX_PRODUCTS_FETCH = 72;
const MAX_RECENT_SEARCHES = 3;
const MAX_SEARCH_SUGGESTIONS = 4;
const MAX_FALLBACK_PRODUCTS = 8;
const GRID_PAGE_SIZE = 8;
const STRIP_SIZE = 10;
const STORES_STRIP_SIZE = 8;
const CATEGORY_SCROLL_STEP = 260;
const STRIP_SCROLL_STEP = 320;
const FALLBACK_CURRENCY = "USD";

const EMPTY_PRODUCTS: ProductItem[] = [];
const EMPTY_STORES: StoreItem[] = [];
const EMPTY_CATEGORIES: string[] = [];
/* =========================
   Utils
========================= */

function parseJSON<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

function normalizeCompact(value: string) {
  return normalizeText(value).replace(/\s+/g, "");
}

function tokenize(value: string) {
  return normalizeText(value).split(/\s+/).filter(Boolean);
}

function exactLikeScore(query: string, target: string) {
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

function similarityScore(query: string, target: string) {
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

function seededHash(str: string, seed: number) {
  let h = 2166136261 ^ seed;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return Math.abs(h >>> 0);
}

function stableShuffle<T>(items: T[], seed: number) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = seededHash(`${seed}-${i}`, seed) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

function bumpScore(obj: Record<string, number>, key: string, amount = 1) {
  if (!key) return obj;
  return {
    ...obj,
    [key]: Math.min((obj[key] || 0) + amount, 100),
  };
}

function useDebouncedValue<T>(value: T, delay = 220) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

function formatRemainingShort(ms: number, expiredLabel: string) {
  if (ms <= 0) return expiredLabel;
  const totalMinutes = Math.ceil(ms / 60000);
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
}

function parsePrice(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function resolveStoreCurrency(store: ProductStore | null | undefined, fallback = "USD") {
  const direct = typeof store?.currency === "string" ? store.currency.trim() : "";
  const fromSettings =
    typeof store?.settings === "object" &&
    store?.settings !== null &&
    typeof (store.settings as Record<string, unknown>).currency === "string"
      ? String((store.settings as Record<string, unknown>).currency).trim()
      : "";

  return direct || fromSettings || fallback;
}

function formatProductPrice(value: number | null, currency: string, locale: string) {
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

function getShortRelativeTime(date: string, locale: "pt" | "en") {
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

function compactRelativeLabel(label: string) {
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

function interleaveByStore(items: ProductItem[]) {
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

function diversifyProducts(items: ProductItem[], recentWindow = 4, maxRecentSameStore = 1) {
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

function sortProductsStableByCache(
  items: ProductItem[],
  cacheSeed: number,
  groupKey: string
) {
  const shuffled = stableShuffle(items, seededHash(groupKey, cacheSeed));
  return diversifyProducts(interleaveByStore(shuffled), 4, 1);
}

function sortStoresStableByCache(
  items: StoreItem[],
  cacheSeed: number,
  groupKey: string
) {
  const base = [...items].sort((a, b) => {
    const totalDiff = b.total - a.total;
    if (totalDiff !== 0) return totalDiff;
    return a.name.localeCompare(b.name);
  });

  return stableShuffle(base, seededHash(groupKey, cacheSeed));
}

function hasStorelyAccount() {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(localStorage.getItem(LS_AUTH_HINT));
  } catch {
    return false;
  }
}
function idle(cb: () => void) {
  if (typeof window === "undefined") return;

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => cb());
  } else {
    setTimeout(cb, 1);
  }
}
function smoothScrollBy(node: HTMLDivElement | null, left: number) {
  if (!node) return;
  node.scrollBy({ left, behavior: "smooth" });
}

/* =========================
   Local persistence
========================= */

function getPrefs(): PreferenceState {
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

function setPrefs(prefs: PreferenceState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_PREFS, JSON.stringify(prefs));
  } catch {}
}

function getHistory(): SearchHistoryItem[] {
  if (typeof window === "undefined") return [];
  return parseJSON<SearchHistoryItem[]>(
    window.localStorage.getItem(LS_HISTORY),
    []
  ).slice(0, MAX_RECENT_SEARCHES);
}

function setHistory(history: SearchHistoryItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      LS_HISTORY,
      JSON.stringify(history.slice(0, MAX_RECENT_SEARCHES))
    );
  } catch {}
}

function pushHistory(value: string) {
  const cleaned = value.trim();
  if (!cleaned) return;

  const next = getHistory().filter(
    (item) => normalizeText(item.value) !== normalizeText(cleaned)
  );

  next.unshift({ value: cleaned, ts: Date.now() });
  setHistory(next.slice(0, MAX_RECENT_SEARCHES));
}

function readShowcaseState(): ShowcaseViewState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORELY_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ShowcaseViewState;
  } catch {
    return null;
  }
}

function writeShowcaseState(state: ShowcaseViewState) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORELY_STATE_KEY, JSON.stringify(state));
  } catch {}
}

/* =========================
   Cache helpers
========================= */

function readStorelyCache(): StorelyCachePayload | null {
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

function writeStorelyCache(data: ProductRow[]) {
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

function clearStorelyCache() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORELY_CACHE_KEY);
  } catch {}
}

/* =========================
   UI helpers
========================= */

const RailControls = memo(function RailControls({
  onLeft,
  onRight,
  ariaLabel,
}: {
  onLeft: () => void;
  onRight: () => void;
  ariaLabel: string;
}) {
  return (
    <div className="sm:flex hidden items-center gap-1">
      <button
        type="button"
        aria-label={`${ariaLabel} left`}
        onClick={onLeft}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
      >
        <ChevronLeft size={14} />
      </button>
      <button
        type="button"
        aria-label={`${ariaLabel} right`}
        onClick={onRight}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
      >
        <ChevronRightIcon size={14} />
      </button>
    </div>
  );
});

const SectionHeader = memo(function SectionHeader({
  icon,
  title,
  subtle,
  controls,
}: {
  icon: React.ReactNode;
  title: string;
  subtle?: string;
  controls?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-black uppercase tracking-[0.14em] text-zinc-900 dark:text-zinc-100">
            {title}
          </h3>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {subtle ? (
          <span className="text-[10px] font-black uppercase tracking-[0.12em] text-zinc-400">
            {subtle}
          </span>
        ) : null}
        {controls}
      </div>
    </div>
  );
});

const ProductCard = memo(function ProductCard({
  item,
  onClick,
  compact = false,
  locale = "en-US",
}: {
  item: ProductItem;
  onClick: (item: ProductItem) => void;
  compact?: boolean;
  locale?: string;
}) {
  const localizedPrice = formatProductPrice(item.price, item.currency, locale);

  return (
    <article
      onClick={() => onClick(item)}
      className={`group cursor-pointer overflow-hidden rounded-[1.35rem] border border-zinc-200 bg-white shadow-sm transition-transform duration-150 hover:-translate-y-0.5  dark:border-zinc-800 dark:bg-zinc-900 ${
        compact ? "w-[190px] min-w-[190px]" : "w-full"
      }`}
      style={{ contentVisibility: "auto", containIntrinsicSize: "400px" }}
    >
      <div className="relative aspect-[4/4.8] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <img
          src={item.image || FALLBACK_PRODUCT}
          alt={item.name}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          draggable={false}
          width={380}
          height={456}
          sizes={
            compact
              ? "190px"
              : "(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
          }
          className="h-full w-full object-cover"
        />

        <div className="absolute left-2.5 top-2.5 max-w-[78%] rounded-full bg-white/92 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-zinc-900">
          <span className="block truncate">{item.storeName}</span>
        </div>
      </div>

      <div className="space-y-2 p-3">
        <h4 className="line-clamp-2 text-[13px] font-black leading-tight tracking-tight text-zinc-950 dark:text-zinc-50">
          {item.name}
        </h4>

        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex items-center gap-2 text-[10px]">
            <span className="truncate font-black uppercase tracking-wide text-blue-600">
              {item.category}
            </span>
            <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span className="truncate text-zinc-500 dark:text-zinc-400">
              {item.timeAgoShort}
            </span>
          </div>

          {localizedPrice ? (
            <span className="shrink-0 text-[12px] font-black tracking-tight text-zinc-950 dark:text-zinc-50">
              {localizedPrice}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
});

const StoreCard = memo(function StoreCard({
  item,
  onClick,
  viewStore,
}: {
  item: StoreItem;
  onClick: (slug: string) => void;
  viewStore: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(item.slug)}
      className="w-[235px] min-w-[235px]  overflow-hidden rounded-[1.55rem] border border-blue-100 bg-gradient-to-b from-blue-50 to-white text-left shadow-sm transition-transform duration-150 hover:-translate-y-0.5 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950"
      style={{ contentVisibility: "auto", containIntrinsicSize: "320px" }}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <img
          src={item.heroImage || FALLBACK_STORE}
          alt={item.name}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          width={376}
          height={212}
          className="h-full w-full object-cover"
        />
        <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white">
          <Store size={11} />
          Store
        </div>
      </div>

      <div className="space-y-2.5 p-4">
        <div className="flex items-center gap-2">
          <img
            src={item.logoUrl || item.heroImage || FALLBACK_STORE}
            alt={item.name}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            width={36}
            height={36}
            className="h-9 w-9 rounded-full border border-white/70 object-cover shadow-sm"
          />
          <div className="min-w-0">
            <h4 className="truncate text-sm font-black tracking-tight text-zinc-950 dark:text-zinc-50">
              {item.name}
            </h4>
            <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              {item.total} products
            </p>
          </div>
        </div>

        <p className="line-clamp-2 text-[12px] leading-relaxed text-zinc-600 dark:text-zinc-300">
          {item.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
  {item.categories.slice(0, 2).map((cat, index) => (
    <span
      key={`${item.slug}-${cat}-${index}`}
      className="rounded-full bg-white px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-zinc-600 shadow-sm dark:bg-zinc-900 dark:text-zinc-300"
    >
      {cat}
    </span>
  ))}
</div>

        <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.12em] text-blue-600">
          {viewStore}
          <ChevronRight size={12} />
        </div>
      </div>
    </button>
  );
});

const SellerCTA = memo(function SellerCTA({
  title,
  subtitle,
  cta,
  onClick,
}: {
  title: string;
  subtitle: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-zinc-950 p-5 text-white shadow-sm dark:border-zinc-800">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em]">
            <UserPlus size={12} />
            Storely
          </div>
          <h3 className="text-xl font-black tracking-tight md:text-2xl">{title}</h3>
          <p className="mt-1 text-sm text-white/75">{subtitle}</p>
        </div>

        <button
          type="button"
          onClick={onClick}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-white px-5 text-sm font-black uppercase tracking-[0.12em] text-zinc-900"
        >
          {cta}
        </button>
      </div>
    </section>
  );
});

function HorizontalProductsStrip({
  title,
  items,
  onProductClick,
  locale,
}: {
  title: string;
  items: ProductItem[];
  onProductClick: (item: ProductItem) => void;
  locale: string;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);

  const handleLeft = useCallback(() => {
    smoothScrollBy(railRef.current, -STRIP_SCROLL_STEP);
  }, []);

  const handleRight = useCallback(() => {
    smoothScrollBy(railRef.current, STRIP_SCROLL_STEP);
  }, []);

  return (
    <section
    className="px-2 md:px-4 "
    style={{ contentVisibility: "auto", containIntrinsicSize: "520px" }}>
      <SectionHeader
        icon={<ShoppingBag size={15} />}
        title={title}
        subtle={`${items.length}`}
        controls={<RailControls onLeft={handleLeft} onRight={handleRight} ariaLabel={title} />}
      />

      <div
        ref={railRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 scrollbar-hide"
      >
        {items.map((item) => (
          <div key={item.id} className="snap-start">
            <ProductCard item={item} onClick={onProductClick} compact locale={locale} />
          </div>
        ))}
      </div>
    </section>
  );
}

function HorizontalStoresStrip({
  title,
  items,
  onStoreClick,
  viewStore,
}: {
  title: string;
  items: StoreItem[];
  onStoreClick: (slug: string) => void;
  viewStore: string;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);

  const handleLeft = useCallback(() => {
    smoothScrollBy(railRef.current, -STRIP_SCROLL_STEP);
  }, []);

  const handleRight = useCallback(() => {
    smoothScrollBy(railRef.current, STRIP_SCROLL_STEP);
  }, []);

  return (
    <section style={{ contentVisibility: "auto", containIntrinsicSize: "400px" }}>
      <SectionHeader
        icon={<Store size={15} />}
        title={title}
        subtle={`${items.length}`}
        controls={<RailControls onLeft={handleLeft} onRight={handleRight} ariaLabel={title} />}
      />

      <div
        ref={railRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 scrollbar-hide"
      >
        {items.map((item) => (
          <div key={item.slug} className="snap-start">
            <StoreCard item={item} onClick={onStoreClick} viewStore={viewStore} />
          </div>
        ))}
      </div>
    </section>
  );
}

function EmptyState({
  title,
  subtitle,
  suggestionTitle,
  suggestionItems,
  onSuggestionClick,
}: {
  title: string;
  subtitle: string;
  suggestionTitle: string;
  suggestionItems: string[];
  onSuggestionClick: (value: string) => void;
}) {
  return (
    <section className="rounded-[1.5rem] border border-dashed border-zinc-300 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="max-w-2xl">
        <h3 className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          {subtitle}
        </p>

        {suggestionItems.length > 0 ? (
          <div className="mt-4">
            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.12em] text-zinc-400">
              {suggestionTitle}
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestionItems.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onSuggestionClick(item)}
                  className="rounded-full bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-zinc-700 shadow-sm dark:bg-zinc-950 dark:text-zinc-300"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* =========================
   Main
========================= */

export const ShowcaseStores = () => {
  const { t, lang } = useTranslate() as {
    t: (key: string, vars?: Record<string, unknown>) => string;
    lang?: string;
  };
  const { pathname } = location;
  const [hasSession, setHasSession] = useState(false);

  const isEditorRoute = pathname.includes("admin");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const searchRef = useRef<HTMLDivElement | null>(null);
  const stickySentinelRef = useRef<HTMLDivElement | null>(null);
  const categoryRailRef = useRef<HTMLDivElement | null>(null);
  const expiryTimeoutRef = useRef<number | null>(null);

  const initialCache = useMemo(() => readStorelyCache(), []);
  const initialUiState = useMemo(() => readShowcaseState(), []);
  const localeCode: "pt" | "en" = lang === "en" ? "en" : "pt";
  const localeForPrice = lang === "en" ? "en-US" : "pt-PT";
  const userHasAccount = useMemo(() => hasStorelyAccount(), []);

  const [prefs, setPrefsState] = useState<PreferenceState>(() => getPrefs());
  const [history, setHistoryState] = useState<SearchHistoryItem[]>(() => getHistory());

  const [query, setQuery] = useState(initialUiState?.query ?? "");
  const [selectedCategory, setSelectedCategory] = useState(
    initialUiState?.selectedCategory ?? "all"
  );
  const [selectedStore, setSelectedStore] = useState(
    initialUiState?.selectedStore ?? "all"
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFilters, setShowFilters] = useState(initialUiState?.showFilters ?? false);
  const [expiresAt, setExpiresAt] = useState<number>(initialCache?.expiresAt ?? 0);
  const [remainingMs, setRemainingMs] = useState<number>(
    initialCache ? Math.max(initialCache.expiresAt - Date.now(), 0) : 0
  );
  const [isCompact, setIsCompact] = useState(false);
  const [cacheSeed, setCacheSeed] = useState<number>(
    initialCache?.savedAt ? seededHash(String(initialCache.savedAt), initialCache.savedAt) : 0
  );

  const debouncedQuery = useDebouncedValue(query, 220);
  const debouncedUiState = useDebouncedValue(
    {
      query,
      selectedCategory,
      selectedStore,
      showFilters,
    },
    350
  );

  const limitedHistory = useMemo(
    () => history.slice(0, MAX_RECENT_SEARCHES),
    [history]
  );

  useEffect(() => {
    writeShowcaseState({
      ...debouncedUiState,
      scrollY: window.scrollY,
    });
  }, [debouncedUiState]);
  useEffect(() => {
    let mounted = true;
  
    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setHasSession(!!data.session?.user);
    }
  
    void loadSession();
  
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setHasSession(!!session?.user);
    });
  
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!initialUiState?.scrollY) return;
    const id = window.setTimeout(() => {
      window.scrollTo({ top: initialUiState.scrollY, behavior: "auto" });
    }, 0);
    return () => window.clearTimeout(id);
  }, [initialUiState]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (!searchRef.current) return;
      if (!searchRef.current.contains(e.target as Node)) setShowDropdown(false);
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    const node = stickySentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCompact(!entry.isIntersecting);
      },
      { threshold: 1 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!expiresAt) {
      setRemainingMs(0);
      return;
    }

    setRemainingMs(Math.max(expiresAt - Date.now(), 0));

    const interval = window.setInterval(() => {
      setRemainingMs(Math.max(expiresAt - Date.now(), 0));
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [expiresAt]);

  const {
    data: rows = initialCache?.data ?? [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery<ProductRow[]>({
    queryKey: ["storely-public-smart-v9"],
    initialData: initialCache?.data,
    staleTime: STORELY_CACHE_TTL,
    gcTime: STORELY_CACHE_TTL * 2,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    queryFn: async () => {
      const cache = readStorelyCache();
  
      if (cache) {
        setExpiresAt(cache.expiresAt);
        setRemainingMs(Math.max(cache.expiresAt - Date.now(), 0));
        setCacheSeed(seededHash(String(cache.savedAt), cache.savedAt));
        return cache.data;
      }
  
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          category,
          main_image,
          gallery,
          full_description,
          unit,
          created_at,
          price,
          currency,
          stores!inner (
            id,
            slug,
            name,
            description,
            logo_url,
            whatsapp_number,
            settings,
            currency
          )
        `)
        .eq("is_active", true)
        .not("main_image", "is", null)
        .order("created_at", { ascending: false })
        .limit(MAX_PRODUCTS_FETCH);
  
      if (error) throw error;
  
      const safeData = ((data || []) as ProductRow[]).filter(
        (item) => item?.id && item?.name && item?.created_at
      );
  
      const payload = writeStorelyCache(safeData);
      if (payload) {
        setExpiresAt(payload.expiresAt);
        setRemainingMs(Math.max(payload.expiresAt - Date.now(), 0));
        setCacheSeed(seededHash(String(payload.savedAt), payload.savedAt));
      }
  
      return safeData;
    },
  });

  useEffect(() => {
    if (expiryTimeoutRef.current) {
      window.clearTimeout(expiryTimeoutRef.current);
      expiryTimeoutRef.current = null;
    }

    if (!expiresAt) return;

    const delay = Math.max(expiresAt - Date.now(), 0);

    expiryTimeoutRef.current = window.setTimeout(() => {
      clearStorelyCache();
      setExpiresAt(0);
      setRemainingMs(0);
      setCacheSeed(0);
    }, delay + 50);

    return () => {
      if (expiryTimeoutRef.current) {
        window.clearTimeout(expiryTimeoutRef.current);
        expiryTimeoutRef.current = null;
      }
    };
  }, [expiresAt]);

  const catalog = useMemo(() => {
    const products: ProductItem[] = rows
      .map((row) => {
        const store = Array.isArray(row.stores) ? row.stores[0] : row.stores;
        const name = row.name?.trim() || t("storely_product_fallback");
        const category = row.category?.trim() || t("storely_general");
        const storeName = store?.name?.trim() || t("storely_store_fallback");
        const storeDescription =
          store?.description?.trim() || t("storely_store_default_description");
  
        const createdAtValue = new Date(row.created_at).getTime();
  
        const shortLabel = compactRelativeLabel(
          getShortRelativeTime(row.created_at, localeCode)
        );
  
        const searchName = normalizeText(name);
        const searchCategory = normalizeText(category);
        const searchStore = normalizeText(storeName);
        const searchDescription = normalizeText(storeDescription);
  
        return {
          id: row.id,
          name,
          category,
          image: row.main_image || FALLBACK_PRODUCT,
          gallery: Array.isArray(row.gallery)
            ? row.gallery.filter(Boolean)
            : row.main_image
              ? [row.main_image]
              : [],
          description: row.full_description?.trim() || "",
          unit: row.unit?.trim() || "un",
          createdAt: row.created_at,
          createdAtValue,
          timeAgoShort: shortLabel,
          storeSlug: store?.slug || "store",
          storeName,
          storeDescription,
          storeLogo: store?.logo_url || "",
          storeWhatsApp: store?.whatsapp_number || null,
          price: parsePrice(row.price),
          currency:
            resolveStoreCurrency(store, row.currency || FALLBACK_CURRENCY) ||
            FALLBACK_CURRENCY,
  
          searchName,
          searchCategory,
          searchStore,
          searchDescription,
          searchFull: `${searchName} ${searchCategory} ${searchStore} ${searchDescription}`,
        };
      })
      .filter((item) => item.id && item.storeSlug);
  
    const storeMap = new Map<string, StoreItem>();
  
    for (const p of products) {
      const row = rows.find((r) => r.id === p.id);
      const store = Array.isArray(row?.stores) ? row?.stores[0] : row?.stores;
  
      const existing = storeMap.get(p.storeSlug);
  
      if (existing) {
        existing.total += 1;
  
        if (!existing.categories.includes(p.category)) {
          existing.categories.push(p.category);
          existing.searchCategories = normalizeText(
            existing.categories.join(" ")
          );
        }
  
        if (!existing.heroImage && p.image) {
          existing.heroImage = p.image;
        }
  
        continue;
      }
  
      storeMap.set(p.storeSlug, {
        id: store?.id || p.storeSlug,
        slug: p.storeSlug,
        name: p.storeName,
        description: p.storeDescription,
        logoUrl: p.storeLogo || "",
        heroImage: p.image || FALLBACK_STORE,
        whatsapp_number: store?.whatsapp_number || null,
        settings:
          typeof store?.settings === "object" && store?.settings !== null
            ? (store.settings as Record<string, unknown>)
            : { currency: p.currency || FALLBACK_CURRENCY },
  
        total: 1,
        categories: [p.category],
        searchName: normalizeText(p.storeName),
        searchDescription: normalizeText(p.storeDescription),
        searchCategories: normalizeText(p.category),
      });
    }
  
    const stores = Array.from(storeMap.values());
  
    const categories = Array.from(
      new Set(
        products
          .map((p) => p.category)
          .filter((value): value is string => Boolean(value))
      )
    ).sort((a, b) => a.localeCompare(b));
  
    return { products, stores, categories };
  }, [rows, t, localeCode]);

  const products = catalog?.products ?? EMPTY_PRODUCTS;
  const stores = catalog?.stores ?? EMPTY_STORES;
  const catalogCategories = catalog?.categories ?? EMPTY_CATEGORIES;

const allCategories = useMemo(() => {
  const ordered = [...catalogCategories].sort((a, b) => {
    const aSeed = seededHash(a, cacheSeed || 1);
    const bSeed = seededHash(b, cacheSeed || 1);
    return aSeed - bSeed || a.localeCompare(b);
  });

  return ordered;
}, [catalogCategories, cacheSeed]);

  const horizontalCategories = useMemo(() => {
    return ["all", ...allCategories];
  }, [allCategories]);

  const searchSuggestions = useMemo(() => {
    const q = debouncedQuery.trim();
    if (!q) return [];

    const results = [
      ...products.map((p) => ({
        type: "product" as const,
        value: p.name,
        score:
          similarityScore(q, p.searchName) +
          similarityScore(q, p.searchCategory) * 0.45 +
          similarityScore(q, p.searchStore) * 0.25,
      })),
      ...stores.map((s) => ({
        type: "store" as const,
        value: s.name,
        score:
          similarityScore(q, s.searchName) +
          similarityScore(q, s.searchDescription) * 0.25,
      })),
      ...allCategories.map((c) => ({
        type: "category" as const,
        value: c,
        score: similarityScore(q, c),
      })),
    ]
      .filter((item) => item.score > 15)
      .sort((a, b) => b.score - a.score);

    const seen = new Set<string>();

    return results
      .filter((item) => {
        const key = `${item.type}-${normalizeText(item.value)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, MAX_SEARCH_SUGGESTIONS);
  }, [debouncedQuery, products, stores, allCategories]);

  const searchAnalysis = useMemo(() => {
    const q = debouncedQuery.trim();

    if (!q) {
      return {
        mode: "default" as SearchMode,
        topExactProducts: [] as ProductItem[],
        topApproxProducts: [] as ProductItem[],
        topRelatedProducts: [] as ProductItem[],
        topExactStores: [] as StoreItem[],
        topApproxStores: [] as StoreItem[],
        topRelatedStores: [] as StoreItem[],
        suggestionTerms: [] as string[],
      };
    }

    const productScored = products.map((p) => {
      const exactScore = Math.max(
        exactLikeScore(q, p.searchName),
        exactLikeScore(q, p.searchCategory),
        exactLikeScore(q, p.searchStore)
      );

      const score = Math.max(
        similarityScore(q, p.searchName),
        similarityScore(q, p.searchFull),
        similarityScore(q, p.searchCategory) * 0.8,
        similarityScore(q, p.searchStore) * 0.7
      );

      return { item: p, exactScore, score };
    });

    const storeScored = stores.map((s) => {
      const exactScore = Math.max(
        exactLikeScore(q, s.searchName),
        exactLikeScore(q, s.searchCategories)
      );

      const score = Math.max(
        similarityScore(q, s.searchName),
        similarityScore(q, s.searchDescription) * 0.5,
        similarityScore(q, s.searchCategories) * 0.8
      );

      return { item: s, exactScore, score };
    });

    const topExactProducts = productScored
      .filter((x) => x.exactScore >= 150)
      .sort((a, b) => b.exactScore - a.exactScore || b.score - a.score)
      .map((x) => x.item);

    const topApproxProducts = productScored
      .filter((x) => x.score >= 26 && !topExactProducts.some((p) => p.id === x.item.id))
      .sort((a, b) => b.score - a.score)
      .map((x) => x.item);

    const topExactStores = storeScored
      .filter((x) => x.exactScore >= 150)
      .sort((a, b) => b.exactScore - a.exactScore || b.score - a.score)
      .map((x) => x.item);

    const topApproxStores = storeScored
      .filter((x) => x.score >= 24 && !topExactStores.some((s) => s.slug === x.item.slug))
      .sort((a, b) => b.score - a.score)
      .map((x) => x.item);

    const relatedCategories = new Set<string>();
    const relatedStoreSlugs = new Set<string>();

    [...topExactProducts, ...topApproxProducts].slice(0, 8).forEach((p) => {
      relatedCategories.add(p.category);
      relatedStoreSlugs.add(p.storeSlug);
    });

    [...topExactStores, ...topApproxStores].slice(0, 6).forEach((s) => {
      relatedStoreSlugs.add(s.slug);
      s.categories.forEach((cat) => relatedCategories.add(cat));
    });

    const topRelatedProducts = products
      .filter(
        (p) =>
          (relatedCategories.has(p.category) || relatedStoreSlugs.has(p.storeSlug)) &&
          !topExactProducts.some((x) => x.id === p.id) &&
          !topApproxProducts.some((x) => x.id === p.id)
      )
      .slice(0, 16);

    const topRelatedStores = stores
      .filter(
        (s) =>
          (relatedStoreSlugs.has(s.slug) ||
            s.categories.some((cat) => relatedCategories.has(cat))) &&
          !topExactStores.some((x) => x.slug === s.slug) &&
          !topApproxStores.some((x) => x.slug === s.slug)
      )
      .slice(0, 8);

    let mode: SearchMode = "none";
    if (topExactProducts.length || topExactStores.length) mode = "exact";
    else if (topApproxProducts.length || topApproxStores.length) mode = "approximate";
    else if (topRelatedProducts.length || topRelatedStores.length) mode = "related";
    else mode = "fallback";

    const suggestionTerms = [
      ...new Set([
        ...allCategories.slice(0, 4),
        ...stores.slice(0, 3).map((s) => s.name),
        ...products.slice(0, 3).map((p) => p.category),
      ]),
    ].slice(0, 8);

    return {
      mode,
      topExactProducts,
      topApproxProducts,
      topRelatedProducts,
      topExactStores,
      topApproxStores,
      topRelatedStores,
      suggestionTerms,
    };
  }, [debouncedQuery, products, stores, allCategories]);

  const scopedProducts = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return products.filter((p) => {
        const categoryOk = selectedCategory === "all" || p.category === selectedCategory;
        const storeOk = selectedStore === "all" || p.storeSlug === selectedStore;
        return categoryOk && storeOk;
      });
    }

    const ordered = [
      ...searchAnalysis.topExactProducts,
      ...searchAnalysis.topApproxProducts,
      ...searchAnalysis.topRelatedProducts,
    ];

    return ordered.filter((p) => {
      const categoryOk = selectedCategory === "all" || p.category === selectedCategory;
      const storeOk = selectedStore === "all" || p.storeSlug === selectedStore;
      return categoryOk && storeOk;
    });
  }, [
    debouncedQuery,
    products,
    searchAnalysis.topExactProducts,
    searchAnalysis.topApproxProducts,
    searchAnalysis.topRelatedProducts,
    selectedCategory,
    selectedStore,
  ]);

  const scopedStores = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return stores.filter((s) => {
        const categoryOk =
          selectedCategory === "all" || s.categories.includes(selectedCategory);
        const storeOk = selectedStore === "all" || s.slug === selectedStore;
        return categoryOk && storeOk;
      });
    }

    const ordered = [
      ...searchAnalysis.topExactStores,
      ...searchAnalysis.topApproxStores,
      ...searchAnalysis.topRelatedStores,
    ];

    return ordered.filter((s) => {
      const categoryOk =
        selectedCategory === "all" || s.categories.includes(selectedCategory);
      const storeOk = selectedStore === "all" || s.slug === selectedStore;
      return categoryOk && storeOk;
    });
  }, [
    debouncedQuery,
    stores,
    searchAnalysis.topExactStores,
    searchAnalysis.topApproxStores,
    searchAnalysis.topRelatedStores,
    selectedCategory,
    selectedStore,
  ]);

  const stableMainFeed = useMemo(() => {
    return sortProductsStableByCache(scopedProducts, cacheSeed || 1, "main-feed");
  }, [scopedProducts, cacheSeed]);

  const fallbackProducts = useMemo(() => {
    const excludedIds = new Set(scopedProducts.map((item) => item.id));
    const raw = products
      .filter((item) => !excludedIds.has(item.id))
      .sort((a, b) => b.createdAtValue - a.createdAtValue);

    return sortProductsStableByCache(raw, cacheSeed || 1, "fallback-feed").slice(
      0,
      MAX_FALLBACK_PRODUCTS
    );
  }, [products, scopedProducts, cacheSeed]);

  const newestProducts = useMemo(() => {
    const recent = [...scopedProducts].sort((a, b) => b.createdAtValue - a.createdAtValue);
    return sortProductsStableByCache(recent, cacheSeed || 1, "recent-feed").slice(
      0,
      STRIP_SIZE
    );
  }, [scopedProducts, cacheSeed]);

  const highlightedStores = useMemo(() => {
    return sortStoresStableByCache(scopedStores, cacheSeed || 1, "stores-feed").slice(
      0,
      STORES_STRIP_SIZE
    );
  }, [scopedStores, cacheSeed]);

  const mainGroups = useMemo(() => {
    return chunk(stableMainFeed.slice(0, GRID_PAGE_SIZE * 3), GRID_PAGE_SIZE);
  }, [stableMainFeed]);

  const searchExactProductsStable = useMemo(
    () =>
      sortProductsStableByCache(
        searchAnalysis.topExactProducts,
        cacheSeed || 1,
        "search-exact-products"
      ),
    [searchAnalysis.topExactProducts, cacheSeed]
  );

  const searchApproxProductsStable = useMemo(
    () =>
      sortProductsStableByCache(
        searchAnalysis.topApproxProducts,
        cacheSeed || 1,
        "search-approx-products"
      ),
    [searchAnalysis.topApproxProducts, cacheSeed]
  );

  const searchRelatedProductsStable = useMemo(
    () =>
      sortProductsStableByCache(
        searchAnalysis.topRelatedProducts,
        cacheSeed || 1,
        "search-related-products"
      ),
    [searchAnalysis.topRelatedProducts, cacheSeed]
  );

  const searchExactStoresStable = useMemo(
    () =>
      sortStoresStableByCache(
        searchAnalysis.topExactStores,
        cacheSeed || 1,
        "search-exact-stores"
      ),
    [searchAnalysis.topExactStores, cacheSeed]
  );

  const searchApproxStoresStable = useMemo(
    () =>
      sortStoresStableByCache(
        searchAnalysis.topApproxStores,
        cacheSeed || 1,
        "search-approx-stores"
      ),
    [searchAnalysis.topApproxStores, cacheSeed]
  );

  const searchRelatedStoresStable = useMemo(
    () =>
      sortStoresStableByCache(
        searchAnalysis.topRelatedStores,
        cacheSeed || 1,
        "search-related-stores"
      ),
    [searchAnalysis.topRelatedStores, cacheSeed]
  );

  const sections = useMemo<FeedSection[]>(() => {
    if (!scopedProducts.length && !scopedStores.length) {
      return fallbackProducts.length
        ? [
            { id: "empty", type: "empty-state" },
            {
              id: "empty-fallback-products",
              type: "products-grid",
              title: t("storely_other_products_we_have"),
              items: fallbackProducts,
            },
          ]
        : [{ id: "empty", type: "empty-state" }];
    }

    const out: FeedSection[] = [];

    if (debouncedQuery.trim()) {
      if (searchAnalysis.mode === "exact" && searchExactProductsStable.length) {
        out.push({
          id: "exact-products",
          type: "products-grid",
          title: t("storely_found_products"),
          items: searchExactProductsStable.slice(0, GRID_PAGE_SIZE),
        });
      } else if (searchAnalysis.mode === "approximate" && searchApproxProductsStable.length) {
        out.push({
          id: "approx-products",
          type: "products-grid",
          title: t("storely_close_matches"),
          items: searchApproxProductsStable.slice(0, GRID_PAGE_SIZE),
        });
      } else if (searchAnalysis.mode === "related" && searchRelatedProductsStable.length) {
        out.push({
          id: "related-products-main",
          type: "products-grid",
          title: t("storely_related_products"),
          items: searchRelatedProductsStable.slice(0, GRID_PAGE_SIZE),
        });
      } else {
        out.push({
          id: "fallback-products-main",
          type: "products-grid",
          title: t("storely_suggestions_for_you"),
          items: stableMainFeed.slice(0, GRID_PAGE_SIZE),
        });
      }

      const mergedSearchStores = [
        ...searchExactStoresStable,
        ...searchApproxStoresStable,
      ].filter((item, index, arr) => arr.findIndex((x) => x.slug === item.slug) === index);

      if (mergedSearchStores.length) {
        out.push({
          id: "search-stores",
          type: "stores-strip",
          title:
            searchAnalysis.mode === "exact"
              ? t("storely_matching_stores")
              : t("storely_similar_stores"),
          items: mergedSearchStores.slice(0, STORES_STRIP_SIZE),
        });
      }

      if (searchRelatedProductsStable.length) {
        out.push({
          id: "search-related-products",
          type: "products-strip",
          title: t("storely_related_products"),
          items: searchRelatedProductsStable.slice(0, STRIP_SIZE),
        });
      }

      if (searchRelatedStoresStable.length) {
        out.push({
          id: "search-related-stores",
          type: "stores-strip",
          title: t("storely_related_stores"),
          items: searchRelatedStoresStable.slice(0, STORES_STRIP_SIZE),
        });
      }

      if (
        searchAnalysis.mode === "fallback" ||
        (!scopedProducts.length && fallbackProducts.length)
      ) {
        out.push({
          id: "search-fallback-feed",
          type: "products-grid",
          title: t("storely_other_products_we_have"),
          items: fallbackProducts,
        });
      }

      return out;
    }

    if (newestProducts.length) {
      out.push({
        id: "recent-1",
        type: "products-strip",
        title: t("storely_new_products"),
        items: newestProducts,
      });
    }

    if (mainGroups[0]?.length) {
      out.push({
        id: "grid-0",
        type: "products-grid",
        title: t("storely_main_feed"),
        items: mainGroups[0],
      });
    }

    if (highlightedStores.length) {
      out.push({
        id: "stores-1",
        type: "stores-strip",
        title: t("storely_available_stores"),
        items: highlightedStores,
      });
    }

    if (mainGroups[1]?.length) {
      out.push({
        id: "grid-1",
        type: "products-grid",
        title: t("storely_main_feed"),
        items: mainGroups[1],
      });
    }

    if (!userHasAccount) {
      out.push({ id: "cta", type: "cta" });
    }

    if (mainGroups[2]?.length) {
      out.push({
        id: "grid-2",
        type: "products-grid",
        title: t("storely_main_feed"),
        items: mainGroups[2],
      });
    }

    return out;
  }, [
    scopedProducts,
    scopedStores,
    fallbackProducts,
    debouncedQuery,
    searchAnalysis.mode,
    searchExactProductsStable,
    searchApproxProductsStable,
    searchRelatedProductsStable,
    searchExactStoresStable,
    searchApproxStoresStable,
    searchRelatedStoresStable,
    stableMainFeed,
    newestProducts,
    highlightedStores,
    mainGroups,
    userHasAccount,
    t,
  ]);

  const searchStatusText = useMemo(() => {
    if (!debouncedQuery.trim()) return "";

    if (searchAnalysis.mode === "exact") return t("storely_search_exact");
    if (searchAnalysis.mode === "approximate") {
      return t("storely_search_no_exact_but_close");
    }
    if (searchAnalysis.mode === "related") {
      return t("storely_search_no_exact_but_related");
    }
    if (searchAnalysis.mode === "fallback") {
      return t("storely_search_nothing_close");
    }

    return "";
  }, [debouncedQuery, searchAnalysis.mode, t]);

  const savePrefsState = useCallback((next: PreferenceState) => {
    setPrefsState(next);
    idle(() => setPrefs(next));
  }, []);

  const handleProductClick = useCallback(
    (item: ProductItem) => {
      const next: PreferenceState = {
        categories: bumpScore(prefs.categories, item.category, 3),
        stores: bumpScore(prefs.stores, item.storeSlug, 4),
        products: bumpScore(prefs.products, item.id, 2),
        searches: prefs.searches,
      };
  
      setPrefsState(next);
      idle(() => setPrefs(next));
  
      const matchedStore = stores.find((s) => s.slug === item.storeSlug);
  
      const productState = {
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        currency: item.currency,
        main_image: item.image || "",
        gallery: item.gallery?.length ? item.gallery : item.image ? [item.image] : [],
        full_description: item.description || "",
        unit: item.unit || "un",
        store_id: matchedStore?.id || item.storeSlug,
      };
  
      const storeState = matchedStore
        ? {
            id: matchedStore.id,
            slug: matchedStore.slug,
            name: matchedStore.name,
            whatsapp_number: matchedStore.whatsapp_number || null,
            settings:
              matchedStore.settings || { currency: item.currency || FALLBACK_CURRENCY },
            logo_url: matchedStore.logoUrl || "",
            heroImage: matchedStore.heroImage || "",
            description: matchedStore.description || "",
          }
        : {
            id: item.storeSlug,
            slug: item.storeSlug,
            name: item.storeName,
            whatsapp_number: item.storeWhatsApp || null,
            settings: { currency: item.currency || FALLBACK_CURRENCY },
            logo_url: item.storeLogo || "",
            heroImage: item.image || "",
            description: item.storeDescription || "",
          };
  
      console.log("[ShowcaseStores] product click state =>", {
        product: productState,
        store: storeState,
        source: debouncedQuery.trim() ? "search" : "feed",
        searchMode: searchAnalysis.mode,
      });
  
      navigate(`/${item.storeSlug}/blog/${item.id}`, {
        state: {
          product: productState,
          store: storeState,
          source: debouncedQuery.trim() ? "search" : "feed",
          searchMode: searchAnalysis.mode,
        },
      });
    },
    [navigate, prefs, stores, debouncedQuery, searchAnalysis.mode]
  );
  const handleStoreClick = useCallback(
    (slug: string) => {
      const store = stores.find((s) => s.slug === slug);
  
      const next: PreferenceState = {
        categories: prefs.categories,
        stores: bumpScore(prefs.stores, slug, 5),
        products: prefs.products,
        searches: prefs.searches,
      };
  
      setPrefsState(next);
      idle(() => setPrefs(next));
  
      const storeState = store
        ? {
            id: store.id,
            slug: store.slug,
            name: store.name,
            whatsapp_number: store.whatsapp_number || null,
            settings: store.settings || { currency: FALLBACK_CURRENCY },
            logo_url: store.logoUrl || "",
            heroImage: store.heroImage || "",
            description: store.description || "",
          }
        : undefined;
  
      console.log("[ShowcaseStores] store click state =>", {
        store: storeState,
        source: debouncedQuery.trim() ? "search" : "feed",
        searchMode: searchAnalysis.mode,
      });
  
      navigate(`/${slug}`, {
        state: {
          store: storeState,
          source: debouncedQuery.trim() ? "search" : "feed",
          searchMode: searchAnalysis.mode,
        },
      });
    },
    [navigate, prefs, stores, debouncedQuery, searchAnalysis.mode]
  );

  const submitSearch = useCallback(
    (value?: string) => {
      const term = (value ?? query).trim();
      if (!term) return;

      pushHistory(term);
      setHistoryState(getHistory());

      const normalized = normalizeText(term);
      const next: PreferenceState = {
        ...prefs,
        searches: bumpScore(prefs.searches, normalized, 2),
      };

      savePrefsState(next);
      setQuery(term);
      setShowDropdown(false);
    },
    [prefs, query, savePrefsState]
  );

  const clearSearchAndFilters = useCallback(() => {
    setQuery("");
    setSelectedCategory("all");
    setSelectedStore("all");
  }, []);

{/*  const handleManualRefresh = useCallback(async () => {
    clearStorelyCache();
    setExpiresAt(0);
    setRemainingMs(0);
    setCacheSeed(0);
    await queryClient.invalidateQueries({ queryKey: ["storely-public-smart-v9"] });
    await refetch();
  }, [queryClient, refetch]);
*/}

  const refreshShowcaseCache = useCallback(async () => {
    clearStorelyCache();
  
    queryClient.removeQueries({ queryKey: ["storely-public-smart-v9"] });
  
    const result = await refetch();
  
    const freshRows = result.data ?? [];
  
    if (freshRows.length) {
      const payload = writeStorelyCache(freshRows);
      if (payload) {
        setExpiresAt(payload.expiresAt);
        setRemainingMs(Math.max(payload.expiresAt - Date.now(), 0));
        setCacheSeed(seededHash(String(payload.savedAt), payload.savedAt));
      }
    } else {
      setExpiresAt(0);
      setRemainingMs(0);
      setCacheSeed(0);
    }
  }, [queryClient, refetch]);

  const handleCategoryRailLeft = useCallback(() => {
    smoothScrollBy(categoryRailRef.current, -CATEGORY_SCROLL_STEP);
  }, []);

  const handleCategoryRailRight = useCallback(() => {
    smoothScrollBy(categoryRailRef.current, CATEGORY_SCROLL_STEP);
  }, []);

  if (isLoading && !rows.length) {
    return (
      <section className="w-full px-0 py-4">
        <div className="space-y-5 animate-pulse">
          <div className="h-11 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-8 w-3/4 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-[1.4rem] border border-zinc-200 dark:border-zinc-800"
              >
                <div className="aspect-[4/4.8] bg-zinc-200 dark:bg-zinc-800" />
                <div className="space-y-2 p-3">
                  <div className="h-4 rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-3 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full px-0 py-4">
      <div ref={stickySentinelRef} className="h-px w-full" />

      <div className="space-y-5">
        {!isEditorRoute &&
        <div
          ref={searchRef}
          className={`sticky top-17 lg:top-16 z-20   border-zinc-200 bg-white/90 p-3 pb-2  dark:border-zinc-800  dark:bg-zinc-950/85 ${
            isCompact ? " lg:px-4 shadow-sm" : " lg:px-4"
          }`}
        >
          <div className="flex flex-col ">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitSearch();
                  }}
                  placeholder={t("storely_search_placeholder")}
                  className={`w-full rounded-full border border-zinc-200 bg-zinc-50 pl-10 pr-24 font-semibold text-zinc-900 outline-none transition dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 ${
                    isCompact
                      ? "h-10 text-base md:text-[12px]"
                      : "h-10 text-base md:text-[12px]"
                  }`}
                />

                <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
                  {query ? (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-200/70 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    >
                      <X size={14} />
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => submitSearch()}
                    className="inline-flex h-8 items-center justify-center rounded-full bg-zinc-950 px-3 text-[10px] font-black uppercase tracking-[0.12em] text-white dark:bg-white dark:text-zinc-900"
                  >
                    {t("storely_search")}
                  </button>
                </div>

                {showDropdown && (searchSuggestions.length > 0 || limitedHistory.length > 0) ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+10px)] overflow-hidden rounded-[1.35rem] border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
                    {searchSuggestions.length > 0 ? (
                      <div className="p-2">
                        <p className="px-2 pb-1 text-[8px] font-black uppercase tracking-[0.12em] text-zinc-400">
                          {t("storely_suggestions")}
                        </p>
                        <div className="space-y-1">
                          {searchSuggestions.map((item, idx) => (
                            <button
                              key={`${item.type}-${item.value}-${idx}`}
                              type="button"
                              onClick={() => submitSearch(item.value)}
                              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
                            >
                              <span className="truncate">{item.value}</span>
                              <span className="ml-3 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-400">
                                {item.type}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {!query && limitedHistory.length > 0 ? (
                      <div className="border-t border-zinc-100 p-2 dark:border-zinc-900">
                        <p className="px-2 pb-1 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-400">
                          {t("storely_recent_searches")}
                        </p>
                        <div className="space-y-1">
                          {limitedHistory.map((item) => (
                            <button
                              key={`${item.value}-${item.ts}`}
                              type="button"
                              onClick={() => submitSearch(item.value)}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
                            >
                              <Clock3 size={14} className="text-zinc-400" />
                              <span className="truncate">{item.value}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className={`inline-flex shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 ${
                  isCompact ? "h-10 w-10" : "h-10 w-10"
                }`}
              >
                <SlidersHorizontal size={16} />
              </button>
            </div>

            {showFilters ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[10px] mt-1 md:mt-0 font-black uppercase tracking-[0.12em] text-zinc-400">
                    {t("storely_categories")}
                  </div>
                  <RailControls
                    onLeft={handleCategoryRailLeft}
                    onRight={handleCategoryRailRight}
                    ariaLabel={t("storely_categories")}
                  />
                </div>

                <div
                  ref={categoryRailRef}
                  className="overflow-x-auto pb-1 scrollbar-hide"
                >
                  <div className="flex min-w-max items-center gap-2">
                    {horizontalCategories.map((cat) => {
                      const active = selectedCategory === cat;
                      const label = cat === "all" ? t("storely_all") : cat;

                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`shrink-0 rounded-full px-3 py-2 text-[8px] font-black uppercase tracking-[0.12em] transition ${
                            active
                              ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-900"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="md:flex hidden flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="h-10 rounded-full border border-zinc-200 bg-white px-3 text-[10px] font-semibold text-zinc-700 outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                    >
                      <option value="all">{t("storely_all_categories")}</option>
                      {allCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedStore}
                      onChange={(e) => setSelectedStore(e.target.value)}
                      className="h-10 rounded-full border border-zinc-200 bg-white px-3 text-[10px] font-semibold text-zinc-700 outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                    >
                      <option value="all">{t("storely_all_stores")}</option>
                      {stores.map((store) => (
                        <option key={store.slug} value={store.slug}>
                          {store.name}
                        </option>
                      ))}
                    </select>

                    {(query || selectedCategory !== "all" || selectedStore !== "all") && (
                      <button
                        type="button"
                        onClick={clearSearchAndFilters}
                        className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-200 px-3 text-[8px] font-black uppercase bg-red-200 dark:bg-red-800 tracking-[0.12em] text-zinc-800 dark:border-zinc-800 dark:text-zinc-50"
                      >
                        {t("storely_clear")}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={refreshShowcaseCache}
                      disabled={isFetching}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-200 px-4 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-600 disabled:opacity-60 dark:border-zinc-800 dark:text-zinc-300"
                    >
                      <RefreshCw size={10} className={isFetching ? "animate-spin" : ""} />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[8px]">
                    {searchStatusText ? (
                      <span className="rounded-full bg-blue-50 px-3 py-1.5 font-black uppercase tracking-[0.12em] text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                        {searchStatusText}
                      </span>
                    ) : null}

                    <span className="rounded-full bg-zinc-100 px-3 py-1.5 font-black uppercase tracking-[0.12em] text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                      {rows.length} {t("storely_products")}
                    </span>

                    <span className="rounded-full bg-zinc-100 px-3 py-1.5 font-black uppercase tracking-[0.12em] text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                      {stores.length} {t("storely_stores")}
                    </span>

                    <span className="rounded-full bg-zinc-100 px-3 py-1.5 font-black uppercase tracking-[0.12em] text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                      {formatRemainingShort(remainingMs, t("storely_cache_expired"))}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>}

        {sections.map((section) => {
          if (section.type === "products-grid") {
            return (
              <section
                key={section.id}
                style={{ contentVisibility: "auto", containIntrinsicSize: "850px" }}
                className="px-2 md:px-4"
              >
                {section.title ? (
                  <SectionHeader
                    icon={<ShoppingBag size={15} />}
                    title={section.title}
                    subtle={`${section.items.length}`}
                  />
                ) : null}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                  {section.items.map((item) => (
                    <ProductCard
                      key={item.id}
                      item={item}
                      onClick={handleProductClick}
                      locale={localeForPrice}
                    />
                  ))}
                </div>
              </section>
            );
          }

          if (section.type === "products-strip") {
            return (
              
              <HorizontalProductsStrip
                key={section.id}
                title={section.title}
                items={section.items}
                onProductClick={handleProductClick}
                locale={localeForPrice}
              />
            );
          }

if (section.type === "stores-strip") {
  return (
    <section
      key={section.id}
      className="px-2 md:px-4"
    >
      <HorizontalStoresStrip
        title={section.title}
        items={section.items}
        onStoreClick={handleStoreClick}
        viewStore={t("storely_view_store")}
      />
    </section>
  );
}
          if (section.type === "cta") {
            return !hasSession && (
              <section className="px-2 md:px-4" key={section.id}>
                <SellerCTA
                  title={t("storely_sell_cta_title")}
                  subtitle={t("storely_sell_cta_subtitle")}
                  cta={t("storely_sell_now")}
                  onClick={() => navigate("/auth")}
                />
              </section>
            );
          }

          return (
            <EmptyState
              key={section.id}
              title={t("storely_no_results_title")}
              subtitle={t("storely_no_results_subtitle")}
              suggestionTitle={t("storely_try_these")}
              suggestionItems={searchAnalysis.suggestionTerms}
              onSuggestionClick={(value) => submitSearch(value)}
            />
          );
        })}
      </div>
    </section>
  );
};

export default ShowcaseStores;