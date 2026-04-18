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
};

type StoreCachePayload = {
  data: StorePublicData;
  savedAt: number;
  expiresAt: number;
};

type DataSource = "cache" | "network" | "none";

const STORE_CACHE_TTL = 1000 * 60 * 60;

const mascotImages = [
  "/img/Mascote.png",
  "/img/Mascote2.png",
  "/img/Mascote4.png",
];

const socialIcons = ["whatsapp", "instagram", "twitter", "github"];


function getCacheKey(slug?: string) {
  return `store-cache:${slug}`;
}

function readStoreCache(slug?: string): StoreCachePayload | null {
  if (!slug || typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(getCacheKey(slug));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoreCachePayload;

    if (
      !parsed ||
      !parsed.data ||
      typeof parsed.savedAt !== "number" ||
      typeof parsed.expiresAt !== "number"
    ) {
      localStorage.removeItem(getCacheKey(slug));
      return null;
    }

    if (Date.now() >= parsed.expiresAt) {
      localStorage.removeItem(getCacheKey(slug));
      return null;
    }

    return parsed;
  } catch {
    localStorage.removeItem(getCacheKey(slug));
    return null;
  }
}

function writeStoreCache(slug: string | undefined, data: StorePublicData) {
  if (!slug || typeof window === "undefined") return null;

  const now = Date.now();

  const payload: StoreCachePayload = {
    data,
    savedAt: now,
    expiresAt: now + STORE_CACHE_TTL,
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

  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function PublicLayout() {
  const { storeSlug } = useParams();

  const initialCache = useMemo(() => readStoreCache(storeSlug), [storeSlug]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [source, setSource] = useState<DataSource>(initialCache ? "cache" : "none");
  const [expiresAt, setExpiresAt] = useState<number>(initialCache?.expiresAt ?? 0);
  const [remainingMs, setRemainingMs] = useState<number>(
    initialCache ? Math.max(initialCache.expiresAt - Date.now(), 0) : 0
  );

  const expiryTimeoutRef = useRef<number | null>(null);

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
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: STORE_CACHE_TTL * 3,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("id, name, settings, logo_url, whatsapp_number")
        .eq("slug", storeSlug)
        .single();

      if (error) throw error;

      const payload = writeStoreCache(storeSlug, data);

      if (payload) {
        setExpiresAt(payload.expiresAt);
        setRemainingMs(Math.max(payload.expiresAt - Date.now(), 0));
      } else {
        setExpiresAt(0);
        setRemainingMs(0);
      }

      setSource("network");
      return data;
    },
  });

  useEffect(() => {
    if (!storeSlug) return;

    const cache = readStoreCache(storeSlug);

    if (cache) {
      setSource("cache");
      setExpiresAt(cache.expiresAt);
      setRemainingMs(Math.max(cache.expiresAt - Date.now(), 0));
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
      const next = Math.max(expiresAt - Date.now(), 0);
      setRemainingMs(next);
    }, 1000);

    return () => window.clearInterval(tick);
  }, [expiresAt]);

  useEffect(() => {
    if (expiryTimeoutRef.current) {
      window.clearTimeout(expiryTimeoutRef.current);
      expiryTimeoutRef.current = null;
    }

    if (!storeSlug || !expiresAt) return;

    const delay = Math.max(expiresAt - Date.now(), 0);

    expiryTimeoutRef.current = window.setTimeout(async () => {
      clearStoreCache(storeSlug);
      setRemainingMs(0);
      setSource("none");
      await refetch();
    }, delay + 50);

    return () => {
      if (expiryTimeoutRef.current) {
        window.clearTimeout(expiryTimeoutRef.current);
        expiryTimeoutRef.current = null;
      }
    };
  }, [expiresAt, refetch, storeSlug]);

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
              {socialIcons.map((icon) => (
                <a
                  key={icon}
                  href="#"
                  aria-label={icon}
                  className="opacity-45 hover:opacity-100 hover:scale-110 transition-all duration-300 dark:invert"
                >
                  <img
                    src={`/img/${icon}.png`}
                    alt={icon}
                    className="h-4 w-4 object-contain"
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}