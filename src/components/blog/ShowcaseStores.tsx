import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Store,
  ShoppingBag,
  Sparkles,
  UserPlus,
  ChevronRight,
  Clock3,
  SlidersHorizontal,
  X,
  RefreshCw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { pt, enUS } from "date-fns/locale";
import { supabase } from "../../lib/supabase";
import { useTranslate } from "../../context/LanguageContext";

/* =========================
   Types
========================= */

type ProductStore = {
  slug: string;
  name: string;
  description?: string | null;
  logo_url?: string | null;
  settings?: Record<string, any> | null;
};

type ProductRow = {
  id: string;
  name: string;
  category: string | null;
  main_image: string | null;
  created_at: string;
  stores: ProductStore | ProductStore[] | null;
};

type ProductItem = {
  id: string;
  name: string;
  category: string;
  image: string;
  createdAt: string;
  timeAgo: string;
  storeSlug: string;
  storeName: string;
  storeDescription: string;
  storeLogo: string;
};

type StoreItem = {
  slug: string;
  name: string;
  description: string;
  logoUrl: string;
  heroImage: string;
  total: number;
  categories: string[];
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
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";

const FALLBACK_STORE =
  "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=900&q=80";

const LS_PREFS = "storely-prefs-v8";
const LS_HISTORY = "storely-history-v8";
const LS_AUTH_HINT = "storely-auth-user";

const STORELY_CACHE_KEY = "storely-public-cache-v4";
const STORELY_CACHE_VERSION = 4;
const STORELY_CACHE_TTL = 1000 * 60 * 20;
const MAX_RECENT_SEARCHES = 3;
const MAX_SEARCH_SUGGESTIONS = 6;
const MAX_FALLBACK_PRODUCTS = 8;

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
  const q = normalizeText(query);
  const t = normalizeText(target);
  const qc = normalizeCompact(query);
  const tc = normalizeCompact(target);

  if (!q || !t) return 0;
  if (q === t) return 300;
  if (qc === tc) return 290;
  if (t.startsWith(q)) return 160;
  if (tc.startsWith(qc)) return 150;
  if (t.includes(q)) return 120;
  if (tc.includes(qc)) return 115;
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

function rotate<T>(arr: T[], offset: number) {
  if (!arr.length) return arr;
  const n = ((offset % arr.length) + arr.length) % arr.length;
  return [...arr.slice(n), ...arr.slice(0, n)];
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

function useDebouncedValue<T>(value: T, delay = 180) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

function formatRemainingTime(ms: number, expiredLabel: string) {
  if (ms <= 0) return expiredLabel;

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

function hasStorelyAccount() {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(localStorage.getItem(LS_AUTH_HINT));
  } catch {
    return false;
  }
}

/* =========================
   Local state persistence
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
   UI bits
========================= */

const SectionHeader = memo(function SectionHeader({
  icon,
  title,
  subtle,
  playful = false,
}: {
  icon: React.ReactNode;
  title: string;
  subtle?: string;
  playful?: boolean;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${
            playful
              ? "bg-gradient-to-br from-fuchsia-100 to-blue-100 text-fuchsia-700 dark:from-fuchsia-950/40 dark:to-blue-950/40 dark:text-fuchsia-300"
              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
          }`}
        >
          {icon}
        </div>
        <h3 className="text-sm font-black uppercase tracking-[0.14em] text-zinc-900 dark:text-zinc-100">
          {title}
        </h3>
      </div>
      {subtle ? (
        <span className="text-[10px] font-black uppercase tracking-[0.12em] text-zinc-400">
          {subtle}
        </span>
      ) : null}
    </div>
  );
});

const ProductCard = memo(function ProductCard({
  item,
  onClick,
  compact = false,
}: {
  item: ProductItem;
  onClick: (item: ProductItem) => void;
  compact?: boolean;
}) {
  return (
    <article
      onClick={() => onClick(item)}
      className={`group cursor-pointer overflow-hidden rounded-[1.35rem] border border-zinc-200 bg-white shadow-sm transition-transform duration-150 hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-zinc-900 ${
        compact ? "w-[190px] min-w-[190px]" : "w-full"
      }`}
    >
      <div className="relative aspect-[4/4.8] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <img
          src={item.image || FALLBACK_PRODUCT}
          alt={item.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
        <div className="absolute left-2.5 top-2.5 max-w-[78%] rounded-full bg-white/92 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-zinc-900">
          <span className="block truncate">{item.storeName}</span>
        </div>
      </div>

      <div className="space-y-1.5 p-3">
        <h4 className="line-clamp-2 text-[13px] font-black leading-tight tracking-tight text-zinc-950 dark:text-zinc-50">
          {item.name}
        </h4>

        <div className="flex items-center gap-2 text-[10px]">
          <span className="truncate font-black uppercase tracking-wide text-blue-600">
            {item.category}
          </span>
          <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <span className="truncate text-zinc-500 dark:text-zinc-400">
            {item.timeAgo}
          </span>
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
      className="w-[235px] min-w-[235px] overflow-hidden rounded-[1.55rem] border border-blue-100 bg-gradient-to-b from-blue-50 to-white text-left shadow-sm transition-transform duration-150 hover:-translate-y-0.5 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <img
          src={item.heroImage || FALLBACK_STORE}
          alt={item.name}
          loading="lazy"
          decoding="async"
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
          {item.categories.slice(0, 2).map((cat) => (
            <span
              key={cat}
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

function ProductsStrip({
  title,
  items,
  onProductClick,
  playful = false,
}: {
  title: string;
  items: ProductItem[];
  onProductClick: (item: ProductItem) => void;
  playful?: boolean;
}) {
  return (
    <section>
      <SectionHeader
        icon={<ShoppingBag size={15} />}
        title={title}
        subtle={`${items.length}`}
        playful={playful}
      />
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {items.map((item) => (
          <div key={item.id} className="snap-start">
            <ProductCard item={item} onClick={onProductClick} compact />
          </div>
        ))}
      </div>
    </section>
  );
}

function StoresStrip({
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
  return (
    <section>
      <SectionHeader
        icon={<Store size={15} />}
        title={title}
        subtle={`${items.length}`}
      />
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 scrollbar-hide">
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

  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement | null>(null);
  const refreshSeed = useRef(
    Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100000)
  ).current;

  const initialCache = useMemo(() => readStorelyCache(), []);
  const dateLocale = lang === "en" ? enUS : pt;
  const userHasAccount = useMemo(() => hasStorelyAccount(), []);

  const [prefs, setPrefsState] = useState<PreferenceState>(() => getPrefs());
  const [history, setHistoryState] = useState<SearchHistoryItem[]>(() => getHistory());

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStore, setSelectedStore] = useState("all");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number>(initialCache?.expiresAt ?? 0);
  const [remainingMs, setRemainingMs] = useState<number>(
    initialCache ? Math.max(initialCache.expiresAt - Date.now(), 0) : 0
  );
  const [isCompact, setIsCompact] = useState(false);

  const debouncedQuery = useDebouncedValue(query, 180);
  const expiryTimeoutRef = useRef<number | null>(null);

 

  const limitedHistory = useMemo(
    () => history.slice(0, MAX_RECENT_SEARCHES),
    [history]
  );

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (!searchRef.current) return;
      if (!searchRef.current.contains(e.target as Node)) setShowDropdown(false);
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;

      ticking = true;
      window.requestAnimationFrame(() => {
        const next = window.scrollY > 90;
        setIsCompact((prev) => (prev !== next ? next : prev));
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!expiresAt) {
      setRemainingMs(0);
      return;
    }

    const interval = window.setInterval(() => {
      setRemainingMs(Math.max(expiresAt - Date.now(), 0));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [expiresAt]);

  const {
    data: rows = initialCache?.data ?? [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery<ProductRow[]>({
    queryKey: ["storely-public-smart-v5"],
    initialData: initialCache?.data,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: STORELY_CACHE_TTL * 3,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          category,
          main_image,
          created_at,
          stores!inner (
            slug,
            name,
            description,
            logo_url,
            settings
          )
        `)
        .eq("is_active", true)
        .not("main_image", "is", null)
        .limit(160);

      if (error) throw error;

      const payload = writeStorelyCache((data || []) as ProductRow[]);
      if (payload) {
        setExpiresAt(payload.expiresAt);
        setRemainingMs(Math.max(payload.expiresAt - Date.now(), 0));
      }

      return (data || []) as ProductRow[];
    },
  });

  useEffect(() => {
    if (expiryTimeoutRef.current) {
      window.clearTimeout(expiryTimeoutRef.current);
      expiryTimeoutRef.current = null;
    }

    if (!expiresAt) return;

    const delay = Math.max(expiresAt - Date.now(), 0);

    expiryTimeoutRef.current = window.setTimeout(async () => {
      clearStorelyCache();
      setExpiresAt(0);
      setRemainingMs(0);
      await refetch();
    }, delay + 50);

    return () => {
      if (expiryTimeoutRef.current) {
        window.clearTimeout(expiryTimeoutRef.current);
        expiryTimeoutRef.current = null;
      }
    };
  }, [expiresAt, refetch]);

  const products = useMemo<ProductItem[]>(() => {
    return rows
      .map((row) => {
        const store = Array.isArray(row.stores) ? row.stores[0] : row.stores;

        return {
          id: row.id,
          name: row.name?.trim() || t("storely_product_fallback"),
          category: row.category?.trim() || t("storely_general"),
          image: row.main_image || FALLBACK_PRODUCT,
          createdAt: row.created_at,
          timeAgo: formatDistanceToNow(new Date(row.created_at), {
            addSuffix: true,
            locale: dateLocale,
          }),
          storeSlug: store?.slug || "store",
          storeName: store?.name || t("storely_store_fallback"),
          storeDescription:
            store?.description?.trim() || t("storely_store_default_description"),
          storeLogo: store?.logo_url || "",
        };
      })
      .filter((item) => item.id && item.storeSlug);
  }, [rows, t, dateLocale]);

  const stores = useMemo<StoreItem[]>(() => {
    const grouped = new Map<string, StoreItem>();

    for (const p of products) {
      if (!grouped.has(p.storeSlug)) {
        grouped.set(p.storeSlug, {
          slug: p.storeSlug,
          name: p.storeName,
          description: p.storeDescription,
          logoUrl: p.storeLogo || "",
          heroImage: p.image || FALLBACK_STORE,
          total: 1,
          categories: [p.category],
        });
      } else {
        const current = grouped.get(p.storeSlug)!;
        current.total += 1;
        if (!current.categories.includes(p.category)) current.categories.push(p.category);
      }
    }

    return Array.from(grouped.values());
  }, [products]);

  const allCategories = useMemo(() => {
    const values = Array.from(new Set(products.map((p) => p.category))).sort((a, b) =>
      a.localeCompare(b)
    );

    const scored = values.map((cat) => ({
      value: cat,
      score:
        (prefs.categories[cat] || 0) * 10 +
        (seededHash(`${cat}-${refreshSeed}`, refreshSeed) % 100),
    }));

    return scored.sort((a, b) => b.score - a.score).map((x) => x.value);
  }, [products, prefs.categories, refreshSeed]);

  const quickCategoryChips = useMemo(() => {
    return [
      "all",
      ...rotate(allCategories, refreshSeed % Math.max(allCategories.length, 1)).slice(0, 6),
    ];
  }, [allCategories, refreshSeed]);

  const searchSuggestions = useMemo(() => {
    const q = debouncedQuery.trim();
    if (!q) return [];

    const results = [
      ...products.map((p) => ({
        type: "product",
        value: p.name,
        score:
          similarityScore(q, p.name) +
          similarityScore(q, p.category) * 0.45 +
          similarityScore(q, p.storeName) * 0.25,
      })),
      ...stores.map((s) => ({
        type: "store",
        value: s.name,
        score:
          similarityScore(q, s.name) + similarityScore(q, s.description) * 0.25,
      })),
      ...allCategories.map((c) => ({
        type: "category",
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
      const exactScore = exactLikeScore(q, p.name);
      const nameScore = similarityScore(q, p.name);
      const categoryScore = similarityScore(q, p.category);
      const storeScore = similarityScore(q, p.storeName);
      const fullScore = similarityScore(
        q,
        `${p.name} ${p.category} ${p.storeName} ${p.storeDescription}`
      );
  
      return {
        item: p,
        exactScore,
        score: Math.max(nameScore, fullScore, categoryScore * 0.8, storeScore * 0.7),
      };
    });
  
    const storeScored = stores.map((s) => {
      const exactScore = exactLikeScore(q, s.name);
      const nameScore = similarityScore(q, s.name);
      const descScore = similarityScore(q, s.description);
      const categoryScore = Math.max(
        ...s.categories.map((cat) => similarityScore(q, cat)),
        0
      );
  
      return {
        item: s,
        exactScore,
        score: Math.max(nameScore, descScore * 0.5, categoryScore * 0.8),
      };
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
  
    [...topExactProducts, ...topApproxProducts].slice(0, 10).forEach((p) => {
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
      .slice(0, 24);
  
    const topRelatedStores = stores
      .filter(
        (s) =>
          (relatedStoreSlugs.has(s.slug) ||
            s.categories.some((cat) => relatedCategories.has(cat))) &&
          !topExactStores.some((x) => x.slug === s.slug) &&
          !topApproxStores.some((x) => x.slug === s.slug)
      )
      .slice(0, 12);
  
    let mode: SearchMode = "none";
  
    if (topExactProducts.length || topExactStores.length) {
      mode = "exact";
    } else if (topApproxProducts.length || topApproxStores.length) {
      mode = "approximate";
    } else if (topRelatedProducts.length || topRelatedStores.length) {
      mode = "related";
    } else {
      mode = "fallback";
    }
  
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
  
  const isExactSearch = useMemo(
    () => Boolean(debouncedQuery.trim()) && searchAnalysis.mode === "exact",
    [debouncedQuery, searchAnalysis.mode]
  );

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

  const recommendedFeed = useMemo(() => {
    const scored = scopedProducts.map((p) => {
      const interestScore =
        (prefs.categories[p.category] || 0) * 8 +
        (prefs.stores[p.storeSlug] || 0) * 10 +
        (prefs.products[p.id] || 0) * 4 +
        (prefs.searches[normalizeText(p.name)] || 0) * 2 +
        (prefs.searches[normalizeText(p.category)] || 0) * 2 +
        (prefs.searches[normalizeText(p.storeName)] || 0) * 2;

      const freshnessScore = new Date(p.createdAt).getTime() / 1000000000;
      const randomScore = seededHash(`${p.id}-${refreshSeed}`, refreshSeed) % 2000;

      return {
        ...p,
        rank: interestScore * 100000 + freshnessScore + randomScore,
      };
    });

    const grouped = new Map<string, typeof scored>();

    for (const item of scored) {
      if (!grouped.has(item.storeSlug)) grouped.set(item.storeSlug, []);
      grouped.get(item.storeSlug)!.push(item);
    }

    const buckets = Array.from(grouped.entries())
      .map(([slug, items]) => ({
        slug,
        items: [...items].sort((a, b) => b.rank - a.rank),
        storeRank:
          (prefs.stores[slug] || 0) * 1000 +
          (seededHash(`${slug}-${refreshSeed}`, refreshSeed) % 500),
      }))
      .sort((a, b) => b.storeRank - a.storeRank);

    const rotatedBuckets = rotate(
      buckets,
      refreshSeed % Math.max(buckets.length, 1)
    );

    const result: ProductItem[] = [];
    let i = 0;
    let added = true;

    while (added) {
      added = false;
      for (const bucket of rotatedBuckets) {
        const item = bucket.items[i];
        if (item) {
          result.push(item);
          added = true;
        }
      }
      i++;
    }

    return result;
  }, [scopedProducts, prefs, refreshSeed]);

  const fallbackProducts = useMemo(() => {
    const excludedIds = new Set(scopedProducts.map((item) => item.id));

    return products
      .filter((item) => !excludedIds.has(item.id))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, MAX_FALLBACK_PRODUCTS);
  }, [products, scopedProducts]);

  const newestGroups = useMemo(() => {
    const recent = [...scopedProducts].sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
    );
    const groups = chunk(recent, 4);
    return rotate(
      groups,
      seededHash(`recent-${refreshSeed}`, refreshSeed) %
        Math.max(groups.length || 1, 1)
    );
  }, [scopedProducts, refreshSeed]);

  const storeGroups = useMemo(() => {
    const randomized = [...scopedStores].sort((a, b) => {
      const sa = seededHash(`${a.slug}-${refreshSeed}`, refreshSeed);
      const sb = seededHash(`${b.slug}-${refreshSeed}`, refreshSeed);
      return sa - sb;
    });

    const groups = chunk(randomized, 4);
    return rotate(
      groups,
      seededHash(`stores-${refreshSeed}`, refreshSeed) %
        Math.max(groups.length || 1, 1)
    );
  }, [scopedStores, refreshSeed]);

  const mainGroups = useMemo(() => chunk(recommendedFeed, 8), [recommendedFeed]);

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
      if (searchAnalysis.mode === "exact" && searchAnalysis.topExactProducts.length) {
        out.push({
          id: "exact-products",
          type: "products-grid",
          title: t("storely_found_products"),
          items: searchAnalysis.topExactProducts.slice(0, 8),
        });
      } else if (
        searchAnalysis.mode === "approximate" &&
        searchAnalysis.topApproxProducts.length
      ) {
        out.push({
          id: "approx-products",
          type: "products-grid",
          title: t("storely_close_matches"),
          items: searchAnalysis.topApproxProducts.slice(0, 8),
        });
      } else if (
        searchAnalysis.mode === "related" &&
        searchAnalysis.topRelatedProducts.length
      ) {
        out.push({
          id: "related-products-main",
          type: "products-grid",
          title: t("storely_related_products"),
          items: searchAnalysis.topRelatedProducts.slice(0, 8),
        });
      } else {
        out.push({
          id: "fallback-products-main",
          type: "products-grid",
          title: t("storely_suggestions_for_you"),
          items: scopedProducts.slice(0, 8),
        });
      }

      if (searchAnalysis.topExactStores.length || searchAnalysis.topApproxStores.length) {
        out.push({
          id: "search-stores",
          type: "stores-strip",
          title:
            searchAnalysis.mode === "exact"
              ? t("storely_matching_stores")
              : t("storely_similar_stores"),
          items: [
            ...searchAnalysis.topExactStores,
            ...searchAnalysis.topApproxStores,
          ].slice(0, 8),
        });
      }

      if (searchAnalysis.topRelatedProducts.length) {
        out.push({
          id: "search-related-products",
          type: "products-strip",
          title: t("storely_related_products"),
          items: searchAnalysis.topRelatedProducts.slice(0, 10),
        });
      }

      if (searchAnalysis.topRelatedStores.length) {
        out.push({
          id: "search-related-stores",
          type: "stores-strip",
          title: t("storely_related_stores"),
          items: searchAnalysis.topRelatedStores.slice(0, 8),
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

    if (newestGroups[0]?.length) {
      out.push({
        id: "recent-1",
        type: "products-strip",
        title: t("storely_new_products"),
        items: newestGroups[0],
      });
    }

    const inserts: FeedSection[] = [];

    if (storeGroups[0]?.length) {
      inserts.push({
        id: "stores-1",
        type: "stores-strip",
        title: t("storely_available_stores"),
        items: storeGroups[0],
      });
    }

    if (newestGroups[1]?.length) {
      inserts.push({
        id: "recent-2",
        type: "products-strip",
        title: t("storely_more_new_products"),
        items: newestGroups[1],
      });
    }

    if (storeGroups[1]?.length) {
      inserts.push({
        id: "stores-2",
        type: "stores-strip",
        title: t("storely_more_stores"),
        items: storeGroups[1],
      });
    }

    const rotatedInserts = rotate(
      inserts,
      seededHash(`insert-${refreshSeed}`, refreshSeed) %
        Math.max(inserts.length || 1, 1)
    );

    mainGroups.forEach((group, index) => {
      out.push({
        id: `grid-${index}`,
        type: "products-grid",
        items: group,
        title: t("storely_main_feed"),
      });

      if (index < rotatedInserts.length) out.push(rotatedInserts[index]);
      if (index === 1 && !userHasAccount) out.push({ id: "cta", type: "cta" });
    });

    return out;
  }, [
    scopedProducts,
    scopedStores,
    newestGroups,
    storeGroups,
    mainGroups,
    refreshSeed,
    t,
    debouncedQuery,
    searchAnalysis.mode,
    searchAnalysis.topExactProducts,
    searchAnalysis.topApproxProducts,
    searchAnalysis.topRelatedProducts,
    searchAnalysis.topExactStores,
    searchAnalysis.topApproxStores,
    searchAnalysis.topRelatedStores,
    userHasAccount,
    fallbackProducts,
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
    setPrefs(next);
  }, []);

  const handleProductClick = useCallback(
    (item: ProductItem) => {
      const next: PreferenceState = {
        categories: bumpScore(prefs.categories, item.category, 3),
        stores: bumpScore(prefs.stores, item.storeSlug, 4),
        products: bumpScore(prefs.products, item.id, 2),
        searches: prefs.searches,
      };

      savePrefsState(next);

      navigate(`/${item.storeSlug}/blog/${item.id}`, {
        state: {
          product: item,
          source: debouncedQuery.trim() ? "search" : "feed",
          searchMode: searchAnalysis.mode,
        },
      });
    },
    [navigate, prefs, savePrefsState, debouncedQuery, searchAnalysis.mode]
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

      savePrefsState(next);

      navigate(`/${slug}`, {
        state: {
          store,
          source: debouncedQuery.trim() ? "search" : "feed",
          searchMode: searchAnalysis.mode,
        },
      });
    },
    [navigate, prefs, savePrefsState, stores, debouncedQuery, searchAnalysis.mode]
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

  if (!products.length) return null;

  return (
    <section className="w-full px-0  py-4">
      <div className="space-y-8">
        <div
          className={`sticky  z-20 transition-all duration-200 ${
            isCompact ? "top-[68px] md:top-[64px]" : "top-[92px]"
          }`}
        >
          <div
            className={`w-full   border-zinc-200 bg-white/95 shadow-xs  dark:border-zinc-800 dark:bg-zinc-950/95 ${
              isCompact ? "p-3 md:px-8" : "p-3 md:px-8"
            }`}
          >
            <div className="flex items-center gap-2" ref={searchRef}>
              <div className="relative min-w-0 flex-1">
                <div
                  className={`flex items-center gap-3 rounded-full bg-zinc-100 px-4 transition-all dark:bg-zinc-900 ${
                    isCompact ? "h-9" : "h-11"
                  }`}
                >
                  <Search
                    size={isCompact ? 14 : 16}
                    className="shrink-0 text-zinc-400"
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
                    className={`h-full w-full bg-transparent font-medium outline-none placeholder:text-zinc-400 dark:text-white ${
                      isCompact ? "text-[13px]" : "text-sm"
                    }`}
                  />
                  {query ? (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="text-zinc-400"
                    >
                      <X size={14} />
                    </button>
                  ) : null}
                </div>

                {showDropdown && (searchSuggestions.length > 0 || limitedHistory.length > 0) ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+8px)] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
                    {query.trim() ? (
                      <div className="border-b border-zinc-100 p-2.5 dark:border-zinc-900">
                        <div className="mb-1.5 px-2 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-400">
                          {t("storely_suggestions")}
                        </div>
                        <div className="space-y-1">
                          {searchSuggestions.map((item, idx) => (
                            <button
                              key={`${item.type}-${item.value}-${idx}`}
                              type="button"
                              onClick={() => submitSearch(item.value)}
                              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-900"
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

                    {limitedHistory.length > 0 ? (
                      <div className="p-2.5">
                        <div className="mb-1.5 px-2 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-400">
                          {t("storely_recent_searches")}
                        </div>
                        <div className="space-y-1">
                          {limitedHistory.map((item) => (
                            <button
                              key={`${item.value}-${item.ts}`}
                              type="button"
                              onClick={() => submitSearch(item.value)}
                              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-900"
                            >
                              <span className="truncate">{item.value}</span>
                              <Clock3 size={13} className="text-zinc-400" />
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
                onClick={() => setShowFilters((v) => !v)}
                className={`inline-flex items-center justify-center rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 ${
                  isCompact ? "h-9 w-9" : "h-11 w-11"
                }`}
              >
                <SlidersHorizontal size={isCompact ? 14 : 16} />
              </button>

              {!userHasAccount && !isCompact ? (
                <button
                  type="button"
                  onClick={() => navigate("/auth")}
                  className={`hidden items-center justify-center rounded-full bg-zinc-950 px-4 font-black uppercase tracking-[0.12em] text-white dark:bg-white dark:text-zinc-900 md:inline-flex ${
                    isCompact ? "h-9 text-[10px]" : "h-11 text-[11px]"
                  }`}
                >
                  {t("storely_sell_now")}
                </button>
              ) : null}
            </div>

            <div className="mt-2 flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {quickCategoryChips.map((chip) => {
                const active =
                  chip === "all"
                    ? selectedCategory === "all"
                    : selectedCategory === chip;

                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setSelectedCategory(chip)}
                    className={`whitespace-nowrap rounded-full px-3 py-2 text-[9px] font-black uppercase tracking-[0.12em] transition-transform hover:scale-[1.01] ${
                      active
                        ? "bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white"
                        : "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                    }`}
                  >
                    {chip === "all" ? t("storely_explore") : chip}
                  </button>
                );
              })}
            </div>

            {showFilters ? (
              <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-semibold outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                >
                  <option value="all">{t("storely_all_categories")}</option>
                  {allCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-semibold outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                >
                  <option value="all">{t("storely_all_stores")}</option>
                  {stores.map((store) => (
                    <option key={store.slug} value={store.slug}>
                      {store.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={clearSearchAndFilters}
                  className="h-10 rounded-xl bg-zinc-100 px-4 text-xs font-black uppercase tracking-[0.12em] text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                >
                  {t("storely_clear_filters")}
                </button>
              </div>
            ) : null}


{ !isCompact &&
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {debouncedQuery.trim() ? (
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  {searchStatusText}
                </span>
              ) : null}

              <span
                className={`rounded-full px-2.5 py-1 text-[6px] font-black uppercase tracking-[0.12em] ${
                  remainingMs > 0
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                    : "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
                }`}
              >
                {t("storely_cache")}{" "}
                {formatRemainingTime(remainingMs, t("storely_cache_expired"))}
              </span>

              {isFetching ? (
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[6px] font-black uppercase tracking-[0.12em] text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  {t("storely_syncing")}
                </span>
              ) : null}

              <button
                type="button"
                onClick={async () => {
                  clearStorelyCache();
                  setExpiresAt(0);
                  setRemainingMs(0);
                  await refetch();
                }}
                className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-[6px] font-black uppercase tracking-[0.12em] text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
              >
                <RefreshCw size={10} />
                {t("storely_refresh_cache")}
              </button>
            </div>}

            {debouncedQuery.trim() && searchAnalysis.mode !== "exact" ? (
              <div className="mt-2 rounded-2xl hidden border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300">
                {searchAnalysis.mode === "approximate"
                  ? t("storely_search_message_close")
                  : searchAnalysis.mode === "related"
                  ? t("storely_search_message_related")
                  : t("storely_search_message_fallback")}
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-7 px-2 lg:px-8">
          {sections.map((section) => {
            if (section.type === "products-strip") {
              return (
                <ProductsStrip
                  key={section.id}
                  title={section.title}
                  items={section.items}
                  onProductClick={handleProductClick}
                  playful={isExactSearch}
                />
              );
            }

            if (section.type === "stores-strip") {
              return (
                <StoresStrip
                  key={section.id}
                  title={section.title}
                  items={section.items}
                  onStoreClick={handleStoreClick}
                  viewStore={t("storely_view_store")}
                />
              );
            }

            if (section.type === "products-grid") {
              return (
                <section key={section.id}>
                  {section.title ? (
                    <SectionHeader
                      icon={<Sparkles size={15} />}
                      title={section.title}
                      subtle={`${section.items.length}`}
                      playful={isExactSearch}
                    />
                  ) : null}

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                    {section.items.map((item) => (
                      <ProductCard
                        key={item.id}
                        item={item}
                        onClick={handleProductClick}
                      />
                    ))}
                  </div>
                </section>
              );
            }

            if (section.type === "empty-state") {
              return (
                <EmptyState
                  key={section.id}
                  title={t("storely_search_empty_title")}
                  subtitle={t("storely_search_empty_subtitle")}
                  suggestionTitle={t("storely_try_these")}
                  suggestionItems={searchAnalysis.suggestionTerms.slice(0, 6)}
                  onSuggestionClick={submitSearch}
                />
              );
            }

            if (section.type === "cta") {
              return (
                <SellerCTA
                  key={section.id}
                  title={t("storely_cta_title")}
                  subtitle={t("storely_cta_subtitle")}
                  cta={t("storely_sell_now")}
                  onClick={() => navigate("/auth")}
                />
              );
            }

            return null;
          })}
        </div>
      </div>
    </section>
  );
};