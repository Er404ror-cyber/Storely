import { Outlet, useParams } from "react-router-dom";
import { StoreHeader } from "../components/header";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useEffect, useMemo, useRef, useState } from "react";
import { StorePageLinksSection } from "../components/public/StorePageLinks";

type StorePublicData = {
  id: string;
  name: string;
  settings: any;
  logo_url: string | null;
  whatsapp_number?: string | null;
  owner_email?: string | null;
  slug?: string | null;
  updated_at_name?: string | null;
  [key: string]: any;
};

type StoreCachePayload = {
  data: StorePublicData;
  savedAt: number;
  expiresAt: number;
  version: number;
  signature: string;
};

type DataSource = "cache" | "network" | "none";

const STORE_CACHE_TTL = 1000 * 60 * 60 * 4; // 4 hours
const STORE_CACHE_VERSION = 3;

const mascotImages = [
  "/img/Mascote.png",
  "/img/Mascote2.png",
  "/img/Mascote4.png",
];

const socialIcons = ["whatsapp", "instagram", "twitter", "github"];

function getCacheKey(slug?: string) {
  return `store-cache:v${STORE_CACHE_VERSION}:${slug}`;
}

function safeNow() {
  return Date.now();
}

function buildStoreSignature(data: Partial<StorePublicData> | null | undefined) {
  if (!data) return "";

  return JSON.stringify({
    id: data.id ?? null,
    slug: data.slug ?? null,
    name: data.name ?? null,
    logo_url: data.logo_url ?? null,
    whatsapp_number: data.whatsapp_number ?? null,
    owner_email: data.owner_email ?? null,
    updated_at_name: data.updated_at_name ?? null,
    settings: data.settings ?? null,
  });
}

function isValidCachePayload(value: unknown): value is StoreCachePayload {
  if (!value || typeof value !== "object") return false;

  const payload = value as StoreCachePayload;

  return (
    !!payload.data &&
    typeof payload.savedAt === "number" &&
    typeof payload.expiresAt === "number" &&
    typeof payload.version === "number" &&
    typeof payload.signature === "string"
  );
}

function readStoreCache(slug?: string): StoreCachePayload | null {
  if (!slug || typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(getCacheKey(slug));
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (!isValidCachePayload(parsed)) {
      localStorage.removeItem(getCacheKey(slug));
      return null;
    }

    if (parsed.version !== STORE_CACHE_VERSION) {
      localStorage.removeItem(getCacheKey(slug));
      return null;
    }

    if (safeNow() >= parsed.expiresAt) {
      localStorage.removeItem(getCacheKey(slug));
      return null;
    }

    return parsed;
  } catch {
    try {
      localStorage.removeItem(getCacheKey(slug));
    } catch {}
    return null;
  }
}

function writeStoreCache(slug: string | undefined, data: StorePublicData) {
  if (!slug || typeof window === "undefined") return null;

  const now = safeNow();

  const payload: StoreCachePayload = {
    data,
    savedAt: now,
    expiresAt: now + STORE_CACHE_TTL,
    version: STORE_CACHE_VERSION,
    signature: buildStoreSignature(data),
  };

  try {
    localStorage.setItem(getCacheKey(slug), JSON.stringify(payload));
    return payload;
  } catch {
    return null;
  }
}

function clearStoreCache(slug?: string) {
  if (!slug || typeof window === "undefined") return;

  try {
    localStorage.removeItem(getCacheKey(slug));
  } catch {}
}

function formatRemainingTime(ms: number) {
  if (ms <= 0) return "expired";

  const totalMinutes = Math.floor(ms / 1000 / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
  }

  return `${String(minutes).padStart(2, "0")}m`;
}

function shouldRefreshInBackground(cache: StoreCachePayload | null) {
  if (!cache) return true;

  const remaining = cache.expiresAt - safeNow();

  // refresh silently if less than 20 minutes remain
  return remaining <= 1000 * 60 * 20;
}

function getSocialLinks(settings: any) {
  const social = settings?.social_links || settings?.socials || settings?.social || {};

  const possible = [
    {
      key: "whatsapp",
      icon: "whatsapp",
      href:
        social?.whatsapp ||
        settings?.whatsapp_link ||
        null,
    },
    {
      key: "instagram",
      icon: "instagram",
      href: social?.instagram || settings?.instagram || null,
    },
    {
      key: "twitter",
      icon: "twitter",
      href: social?.twitter || social?.x || settings?.twitter || settings?.x || null,
    },
    {
      key: "github",
      icon: "github",
      href: social?.github || settings?.github || null,
    },
  ];

  return possible.filter((item) => typeof item.href === "string" && item.href.trim().length > 0);
}

export function PublicLayout() {
  const { storeSlug } = useParams();

  const initialCache = useMemo(() => readStoreCache(storeSlug), [storeSlug]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [source, setSource] = useState<DataSource>(initialCache ? "cache" : "none");
  const [expiresAt, setExpiresAt] = useState<number>(initialCache?.expiresAt ?? 0);
  const [remainingMs, setRemainingMs] = useState<number>(
    initialCache ? Math.max(initialCache.expiresAt - safeNow(), 0) : 0
  );

  const expiryTimeoutRef = useRef<number | null>(null);
  const backgroundRefreshRef = useRef(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % mascotImages.length);
    }, 6000);

    return () => window.clearInterval(interval);
  }, []);

  const {
    data: store,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery<StorePublicData>({
    queryKey: ["store-public", storeSlug],
    enabled: !!storeSlug,
    initialData: initialCache?.data,
    staleTime: STORE_CACHE_TTL,
    gcTime: STORE_CACHE_TTL * 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("slug", storeSlug)
        .single();

      if (error) throw error;

      const payload = writeStoreCache(storeSlug, data as StorePublicData);

      if (payload) {
        setExpiresAt(payload.expiresAt);
        setRemainingMs(Math.max(payload.expiresAt - safeNow(), 0));
      } else {
        setExpiresAt(0);
        setRemainingMs(0);
      }

      setSource("network");
      return data as StorePublicData;
    },
  });

  useEffect(() => {
    if (!storeSlug) return;

    const cache = readStoreCache(storeSlug);

    if (cache) {
      setSource("cache");
      setExpiresAt(cache.expiresAt);
      setRemainingMs(Math.max(cache.expiresAt - safeNow(), 0));
    } else {
      setSource("none");
      setExpiresAt(0);
      setRemainingMs(0);
    }
  }, [storeSlug]);

  useEffect(() => {
    if (!expiresAt) {
      setRemainingMs(0);
      return;
    }

    const tick = window.setInterval(() => {
      const next = Math.max(expiresAt - safeNow(), 0);
      setRemainingMs(next);
    }, 60_000);

    const firstNext = Math.max(expiresAt - safeNow(), 0);
    setRemainingMs(firstNext);

    return () => window.clearInterval(tick);
  }, [expiresAt]);

  useEffect(() => {
    if (expiryTimeoutRef.current) {
      window.clearTimeout(expiryTimeoutRef.current);
      expiryTimeoutRef.current = null;
    }

    if (!storeSlug || !expiresAt) return;

    const delay = Math.max(expiresAt - safeNow(), 0);

    expiryTimeoutRef.current = window.setTimeout(async () => {
      clearStoreCache(storeSlug);
      setRemainingMs(0);
      setSource("none");
      backgroundRefreshRef.current = true;
      await refetch();
      backgroundRefreshRef.current = false;
    }, delay + 50);

    return () => {
      if (expiryTimeoutRef.current) {
        window.clearTimeout(expiryTimeoutRef.current);
        expiryTimeoutRef.current = null;
      }
    };
  }, [expiresAt, refetch, storeSlug]);

  useEffect(() => {
    if (!storeSlug || !initialCache) return;
    if (!shouldRefreshInBackground(initialCache)) return;
    if (backgroundRefreshRef.current) return;

    backgroundRefreshRef.current = true;

    const timeout = window.setTimeout(async () => {
      try {
        await refetch();
      } finally {
        backgroundRefreshRef.current = false;
      }
    }, 1200);

    return () => {
      window.clearTimeout(timeout);
      backgroundRefreshRef.current = false;
    };
  }, [storeSlug, initialCache, refetch]);

  useEffect(() => {
    if (!storeSlug || !store) return;

    const cache = readStoreCache(storeSlug);
    const nextSignature = buildStoreSignature(store);

    if (!cache) {
      const payload = writeStoreCache(storeSlug, store);
      if (payload) {
        setExpiresAt(payload.expiresAt);
        setRemainingMs(Math.max(payload.expiresAt - safeNow(), 0));
      }
      return;
    }

    if (cache.signature !== nextSignature) {
      const payload = writeStoreCache(storeSlug, store);
      if (payload) {
        setExpiresAt(payload.expiresAt);
        setRemainingMs(Math.max(payload.expiresAt - safeNow(), 0));
      }
    }
  }, [storeSlug, store]);

  const socialLinks = useMemo(() => getSocialLinks(store?.settings), [store?.settings]);

  if (isLoading && !store) {
    return (
      <div className="h-screen flex items-center justify-center animate-pulse text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
        Loading Store...
      </div>
    );
  }

  if (isError || !store) {
    return (
      <div className="h-screen flex items-center justify-center font-black italic text-slate-400">
        404 | STORE NOT FOUND
      </div>
    );
  }

  const sourceText =
    source === "cache"
      ? "loaded from local cache"
      : source === "network"
      ? "loaded from network"
      : "waiting for refresh";

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col">
      <StoreHeader storeId={store.id} />

      <main className="flex-1">
        <Outlet context={{ storeId: store.id, store }} />
        <StorePageLinksSection storeId={store.id} />
      </main>

      <footer className="relative w-full border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-black transition-colors duration-500 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-8 pt-16 pb-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-6">
            <div className="relative flex flex-col items-center md:items-start min-w-[120px]">
              <div className="absolute -top-[72px] flex flex-col items-center pointer-events-none select-none">
                <img
                  src={mascotImages[activeIndex]}
                  alt="Mascot"
                  className="h-24 md:h-24 w-auto object-contain transition-all duration-700 ease-out hover:-translate-y-1"
                  loading="lazy"
                />
                <div className="w-10 h-1.5 bg-black/5 dark:bg-cyan-400/10 rounded-full mt-1" />
              </div>

              <span className="pt-3 text-[11px] font-black tracking-[0.5em] uppercase bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent text-center md:text-left">
                STORELY
              </span>
            </div>

            <div className="flex flex-col items-center justify-center order-3 md:order-2 gap-2.5 text-center">
              <span className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
                © {new Date().getFullYear()} {store.name}
                <span className="hidden md:inline mx-2 opacity-30">•</span>
                <span className="block md:inline">Storely All Rights Reserved</span>
              </span>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-[8px] md:text-[9px] uppercase tracking-[0.25em] font-bold border ${
                    remainingMs > 0
                      ? "text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-900/50 dark:bg-emerald-950/30"
                      : "text-amber-600 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-900/50 dark:bg-amber-950/30"
                  }`}
                >
                  cache {formatRemainingTime(remainingMs)}
                </span>

                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-[8px] md:text-[9px] uppercase tracking-[0.25em] font-bold border ${
                    source === "cache"
                      ? "text-blue-600 border-blue-200 bg-blue-50 dark:text-blue-400 dark:border-blue-900/50 dark:bg-blue-950/30"
                      : source === "network"
                      ? "text-violet-600 border-violet-200 bg-violet-50 dark:text-violet-400 dark:border-violet-900/50 dark:bg-violet-950/30"
                      : "text-slate-500 border-slate-200 bg-slate-50 dark:text-slate-400 dark:border-slate-800 dark:bg-slate-900/40"
                  }`}
                >
                  {sourceText}
                </span>

                {isFetching && (
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-[8px] md:text-[9px] uppercase tracking-[0.25em] font-bold border text-slate-500 border-slate-200 bg-slate-50 dark:text-slate-400 dark:border-slate-800 dark:bg-slate-900/40">
                    syncing...
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={async () => {
                  clearStoreCache(storeSlug);
                  setExpiresAt(0);
                  setRemainingMs(0);
                  setSource("none");
                  await refetch();
                }}
                className="mt-1 text-[8px] md:text-[9px] uppercase tracking-[0.3em] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                refresh cache now
              </button>
            </div>

            <div className="flex justify-center md:justify-end gap-5 order-2 md:order-3">
              {socialLinks.length > 0
                ? socialLinks.map((item) => (
                    <a
                      key={item.key}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.key}
                      className="opacity-45 hover:opacity-100 hover:scale-110 transition-all duration-300 dark:invert"
                    >
                      <img
                        src={`/img/${item.icon}.png`}
                        alt={item.key}
                        className="h-4 w-4 object-contain"
                        loading="lazy"
                      />
                    </a>
                  ))
                : socialIcons.map((icon) => (
                    <span
                      key={icon}
                      aria-hidden="true"
                      className="opacity-20 dark:invert"
                    >
                      <img
                        src={`/img/${icon}.png`}
                        alt={icon}
                        className="h-4 w-4 object-contain"
                        loading="lazy"
                      />
                    </span>
                  ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}