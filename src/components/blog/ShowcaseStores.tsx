import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { Search, SlidersHorizontal, X, RefreshCw, Clock3, ShoppingBag } from "lucide-react";

import { supabase } from "../../lib/supabase";
import { useTranslate } from "../../context/LanguageContext";

import type { FeedSection, ProductItem, ProductRow, SearchMode, StoreItem } from "../../types/Marketplace";
import {
  EMPTY_CATEGORIES,
  EMPTY_PRODUCTS,
  EMPTY_STORES,
  FALLBACK_CURRENCY,
  FALLBACK_PRODUCT,
  FALLBACK_STORE,
  GRID_PAGE_SIZE,
  MAX_PRODUCTS_FETCH,
  MAX_SEARCH_SUGGESTIONS,
  MAX_FALLBACK_PRODUCTS,
  STORES_STRIP_SIZE,
  STRIP_SIZE,
  STORELY_CACHE_TTL,
  CATEGORY_SCROLL_STEP,
} from "./constants";
import {
  bumpScore,
  chunk,
  compactRelativeLabel,
  getShortRelativeTime,
  hasStorelyAccount,
  idle,
  normalizeText,
  parsePrice,
  resolveStoreCurrency,
  seededHash,
  similarityScore,
  exactLikeScore,
  smoothScrollBy,
  sortProductsStableByCache,
  sortStoresStableByCache,
  useDebouncedValue,
  formatRemainingShort,
} from "../../utils/marketplaceutils";
import {
  clearStorelyCache,
  getHistory,
  getPrefs,
  pushHistory,
  readShowcaseState,
  readStorelyCache,
  saveShowcaseStateNow,
  setPrefs,
  writeStorelyCache,
} from "./storage";
import { ProductCard, RailControls, SellerCTA, EmptyState, SectionHeader } from "./UIHelpers";
import { HorizontalProductsStrip, HorizontalStoresStrip } from "./Strips";

export const ShowcaseStores = () => {
  const { t, lang } = useTranslate() as {
    t: (key: string, vars?: Record<string, unknown>) => string;
    lang?: string;
  };

  const location = useLocation();
  const navigationType = useNavigationType();
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

  const [prefs, setPrefsState] = useState(() => getPrefs());
  const [history, setHistoryState] = useState(() => getHistory());

  const [query, setQuery] = useState(initialUiState?.query ?? "");
  const [selectedCategory, setSelectedCategory] = useState(initialUiState?.selectedCategory ?? "all");
  const [selectedStore, setSelectedStore] = useState(initialUiState?.selectedStore ?? "all");
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
  const limitedHistory = useMemo(() => history.slice(0, 3), [history]);
  const userHasAccount = useMemo(() => hasStorelyAccount(), []);

  useEffect(() => {
    let mounted = true;
    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setHasSession(!!data.session?.user);
    }
    void loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setHasSession(!!session?.user);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const save = () => {
      saveShowcaseStateNow({ query, selectedCategory, selectedStore, showFilters, pathname });
    };
    window.addEventListener("scroll", save, { passive: true });
    window.addEventListener("pagehide", save);
    return () => {
      window.removeEventListener("scroll", save);
      window.removeEventListener("pagehide", save);
      save();
    };
  }, [query, selectedCategory, selectedStore, showFilters, pathname]);

  useEffect(() => {
    if (navigationType !== "POP" || !initialUiState || initialUiState.pathname !== pathname) return;
    let cancelled = false;

    const restore = () => {
      if (cancelled) return;
      const top = Number.isFinite(initialUiState.scrollY) ? initialUiState.scrollY : 0;
      window.scrollTo({ top, behavior: "auto" });

      const t2 = window.setTimeout(() => { if (!cancelled) window.scrollTo({ top, behavior: "auto" }); }, 120);
      const t3 = window.setTimeout(() => { if (!cancelled) window.scrollTo({ top, behavior: "auto" }); }, 260);

      return () => {
        window.clearTimeout(t2);
        window.clearTimeout(t3);
      };
    };

    const t1 = window.setTimeout(restore, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(t1);
    };
  }, [initialUiState, navigationType, pathname]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    const node = stickySentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => { setIsCompact(!entry.isIntersecting); }, { threshold: 1 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!expiresAt) { setRemainingMs(0); return; }
    setRemainingMs(Math.max(expiresAt - Date.now(), 0));
    const interval = window.setInterval(() => { setRemainingMs(Math.max(expiresAt - Date.now(), 0)); }, 60000);
    return () => window.clearInterval(interval);
  }, [expiresAt]);

  const { data: rows = initialCache?.data ?? [], isLoading, isFetching, refetch } = useQuery<ProductRow[]>({
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
        .select(`id, name, category, main_image, gallery, full_description, unit, created_at, price, stores!inner (id, slug, name, description, logo_url, whatsapp_number, settings, currency)`)
        .eq("is_active", true)
        .not("main_image", "is", null)
        .order("created_at", { ascending: false })
        .limit(MAX_PRODUCTS_FETCH);

      if (error) throw error;
      const safeData = ((data || []) as ProductRow[]).filter(item => item?.id && item?.name && item?.created_at);

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
    if (expiryTimeoutRef.current) { window.clearTimeout(expiryTimeoutRef.current); expiryTimeoutRef.current = null; }
    if (!expiresAt) return;
    const delay = Math.max(expiresAt - Date.now(), 0);

    expiryTimeoutRef.current = window.setTimeout(() => {
      clearStorelyCache(); setExpiresAt(0); setRemainingMs(0); setCacheSeed(0);
    }, delay + 50);

    return () => { if (expiryTimeoutRef.current) { window.clearTimeout(expiryTimeoutRef.current); expiryTimeoutRef.current = null; } };
  }, [expiresAt]);

  const catalog = useMemo(() => {
    const products: ProductItem[] = rows.map((row) => {
      const store = Array.isArray(row.stores) ? row.stores[0] : row.stores;
      const name = row.name?.trim() || t("storely_product_fallback");
      const category = row.category?.trim() || t("storely_general");
      const storeName = store?.name?.trim() || t("storely_store_fallback");
      const storeDescription = store?.description?.trim() || t("storely_store_default_description");
      const createdAtValue = new Date(row.created_at).getTime();
      const shortLabel = compactRelativeLabel(getShortRelativeTime(row.created_at, localeCode));

      const searchName = normalizeText(name);
      const searchCategory = normalizeText(category);
      const searchStore = normalizeText(storeName);
      const searchDescription = normalizeText(storeDescription);

      return {
        id: row.id, name, category,
        image: row.main_image || FALLBACK_PRODUCT,
        gallery: Array.isArray(row.gallery) ? row.gallery.filter(Boolean) : row.main_image ? [row.main_image] : [],
        description: row.full_description?.trim() || "",
        unit: row.unit?.trim() || "un",
        createdAt: row.created_at, createdAtValue, timeAgoShort: shortLabel,
        storeSlug: store?.slug || "store", storeName, storeDescription,
        storeLogo: store?.logo_url || "", storeWhatsApp: store?.whatsapp_number || null,
        price: parsePrice(row.price), currency: resolveStoreCurrency(store, FALLBACK_CURRENCY),
        searchName, searchCategory, searchStore, searchDescription,
        searchFull: `${searchName} ${searchCategory} ${searchStore} ${searchDescription}`,
      };
    }).filter(item => item.id && item.storeSlug);

    const storeMap = new Map<string, StoreItem>();
    for (const p of products) {
      const row = rows.find(r => r.id === p.id);
      const store = Array.isArray(row?.stores) ? row?.stores[0] : row?.stores;
      const existing = storeMap.get(p.storeSlug);

      if (existing) {
        existing.total += 1;
        if (!existing.categories.includes(p.category)) {
          existing.categories.push(p.category);
          existing.searchCategories = normalizeText(existing.categories.join(" "));
        }
        if (!existing.heroImage && p.image) existing.heroImage = p.image;
        continue;
      }

      storeMap.set(p.storeSlug, {
        id: store?.id || p.storeSlug, slug: p.storeSlug, name: p.storeName, description: p.storeDescription, logoUrl: p.storeLogo || "",
        heroImage: p.image || FALLBACK_STORE, whatsapp_number: store?.whatsapp_number || null,
        settings: typeof store?.settings === "object" && store?.settings !== null ? (store.settings as Record<string, unknown>) : { currency: resolveStoreCurrency(store, FALLBACK_CURRENCY) },
        total: 1, categories: [p.category], searchName: normalizeText(p.storeName), searchDescription: normalizeText(p.storeDescription), searchCategories: normalizeText(p.category),
      });
    }

    const stores = Array.from(storeMap.values());
    const categories = Array.from(new Set(products.map(p => p.category).filter((v): v is string => Boolean(v)))).sort((a, b) => a.localeCompare(b));
    return { products, stores, categories };
  }, [rows, t, localeCode]);

  const products = catalog?.products ?? EMPTY_PRODUCTS;
  const stores = catalog?.stores ?? EMPTY_STORES;
  const catalogCategories = catalog?.categories ?? EMPTY_CATEGORIES;

  const allCategories = useMemo(() => {
    return [...catalogCategories].sort((a, b) => {
      const aSeed = seededHash(a, cacheSeed || 1);
      const bSeed = seededHash(b, cacheSeed || 1);
      return aSeed - bSeed || a.localeCompare(b);
    });
  }, [catalogCategories, cacheSeed]);

  const horizontalCategories = useMemo(() => ["all", ...allCategories], [allCategories]);

  const searchSuggestions = useMemo(() => {
    const q = debouncedQuery.trim();
    if (!q) return [];
    const results = [
      ...products.map(p => ({ type: "product" as const, value: p.name, score: similarityScore(q, p.searchName) + similarityScore(q, p.searchCategory) * 0.45 + similarityScore(q, p.searchStore) * 0.25 })),
      ...stores.map(s => ({ type: "store" as const, value: s.name, score: similarityScore(q, s.searchName) + similarityScore(q, s.searchDescription) * 0.25 })),
      ...allCategories.map(c => ({ type: "category" as const, value: c, score: similarityScore(q, c) })),
    ].filter(item => item.score > 15).sort((a, b) => b.score - a.score);

    const seen = new Set<string>();
    return results.filter(item => {
      const key = `${item.type}-${normalizeText(item.value)}`;
      if (seen.has(key)) return false;
      seen.add(key); return true;
    }).slice(0, MAX_SEARCH_SUGGESTIONS);
  }, [debouncedQuery, products, stores, allCategories]);

  const searchAnalysis = useMemo(() => {
    const q = debouncedQuery.trim();
    if (!q) {
      return { mode: "default" as SearchMode, topExactProducts: [], topApproxProducts: [], topRelatedProducts: [], topExactStores: [], topApproxStores: [], topRelatedStores: [], suggestionTerms: [] };
    }

    const productScored = products.map(p => ({
      item: p,
      exactScore: Math.max(exactLikeScore(q, p.searchName), exactLikeScore(q, p.searchCategory), exactLikeScore(q, p.searchStore)),
      score: Math.max(similarityScore(q, p.searchName), similarityScore(q, p.searchFull), similarityScore(q, p.searchCategory) * 0.8, similarityScore(q, p.searchStore) * 0.7)
    }));

    const storeScored = stores.map(s => ({
      item: s,
      exactScore: Math.max(exactLikeScore(q, s.searchName), exactLikeScore(q, s.searchCategories)),
      score: Math.max(similarityScore(q, s.searchName), similarityScore(q, s.searchDescription) * 0.5, similarityScore(q, s.searchCategories) * 0.8)
    }));

    const topExactProducts = productScored.filter(x => x.exactScore >= 150).sort((a, b) => b.exactScore - a.exactScore || b.score - a.score).map(x => x.item);
    const topApproxProducts = productScored.filter(x => x.score >= 26 && !topExactProducts.some(p => p.id === x.item.id)).sort((a, b) => b.score - a.score).map(x => x.item);
    const topExactStores = storeScored.filter(x => x.exactScore >= 150).sort((a, b) => b.exactScore - a.exactScore || b.score - a.score).map(x => x.item);
    const topApproxStores = storeScored.filter(x => x.score >= 24 && !topExactStores.some(s => s.slug === x.item.slug)).sort((a, b) => b.score - a.score).map(x => x.item);

    const relatedCategories = new Set<string>();
    const relatedStoreSlugs = new Set<string>();

    [...topExactProducts, ...topApproxProducts].slice(0, 8).forEach(p => { relatedCategories.add(p.category); relatedStoreSlugs.add(p.storeSlug); });
    [...topExactStores, ...topApproxStores].slice(0, 6).forEach(s => { relatedStoreSlugs.add(s.slug); s.categories.forEach(cat => relatedCategories.add(cat)); });

    const topRelatedProducts = products.filter(p => (relatedCategories.has(p.category) || relatedStoreSlugs.has(p.storeSlug)) && !topExactProducts.some(x => x.id === p.id) && !topApproxProducts.some(x => x.id === p.id)).slice(0, 16);
    const topRelatedStores = stores.filter(s => (relatedStoreSlugs.has(s.slug) || s.categories.some(cat => relatedCategories.has(cat))) && !topExactStores.some(x => x.slug === s.slug) && !topApproxStores.some(x => x.slug === s.slug)).slice(0, 8);

    let mode: SearchMode = "none";
    if (topExactProducts.length || topExactStores.length) mode = "exact";
    else if (topApproxProducts.length || topApproxStores.length) mode = "approximate";
    else if (topRelatedProducts.length || topRelatedStores.length) mode = "related";
    else mode = "fallback";

    const suggestionTerms = [...new Set([...allCategories.slice(0, 4), ...stores.slice(0, 3).map(s => s.name), ...products.slice(0, 3).map(p => p.category)])].slice(0, 8);

    return { mode, topExactProducts, topApproxProducts, topRelatedProducts, topExactStores, topApproxStores, topRelatedStores, suggestionTerms };
  }, [debouncedQuery, products, stores, allCategories]);

  const scopedProducts = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return products.filter(p => (selectedCategory === "all" || p.category === selectedCategory) && (selectedStore === "all" || p.storeSlug === selectedStore));
    }
    return [...searchAnalysis.topExactProducts, ...searchAnalysis.topApproxProducts, ...searchAnalysis.topRelatedProducts].filter(p => (selectedCategory === "all" || p.category === selectedCategory) && (selectedStore === "all" || p.storeSlug === selectedStore));
  }, [debouncedQuery, products, searchAnalysis, selectedCategory, selectedStore]);

  const scopedStores = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return stores.filter(s => (selectedCategory === "all" || s.categories.includes(selectedCategory)) && (selectedStore === "all" || s.slug === selectedStore));
    }
    return [...searchAnalysis.topExactStores, ...searchAnalysis.topApproxStores, ...searchAnalysis.topRelatedStores].filter(s => (selectedCategory === "all" || s.categories.includes(selectedCategory)) && (selectedStore === "all" || s.slug === selectedStore));
  }, [debouncedQuery, stores, searchAnalysis, selectedCategory, selectedStore]);

  const stableMainFeed = useMemo(() => sortProductsStableByCache(scopedProducts, cacheSeed || 1, "main-feed"), [scopedProducts, cacheSeed]);
  const fallbackProducts = useMemo(() => {
    const excludedIds = new Set(scopedProducts.map(item => item.id));
    return sortProductsStableByCache(products.filter(item => !excludedIds.has(item.id)).sort((a, b) => b.createdAtValue - a.createdAtValue), cacheSeed || 1, "fallback-feed").slice(0, MAX_FALLBACK_PRODUCTS);
  }, [products, scopedProducts, cacheSeed]);

  const newestProducts = useMemo(() => sortProductsStableByCache([...scopedProducts].sort((a, b) => b.createdAtValue - a.createdAtValue), cacheSeed || 1, "recent-feed").slice(0, STRIP_SIZE), [scopedProducts, cacheSeed]);
  const highlightedStores = useMemo(() => sortStoresStableByCache(scopedStores, cacheSeed || 1, "stores-feed").slice(0, STORES_STRIP_SIZE), [scopedStores, cacheSeed]);
  const mainGroups = useMemo(() => chunk(stableMainFeed.slice(0, GRID_PAGE_SIZE * 3), GRID_PAGE_SIZE), [stableMainFeed]);

  const searchExactProductsStable = useMemo(() => sortProductsStableByCache(searchAnalysis.topExactProducts, cacheSeed || 1, "search-exact-products"), [searchAnalysis.topExactProducts, cacheSeed]);
  const searchApproxProductsStable = useMemo(() => sortProductsStableByCache(searchAnalysis.topApproxProducts, cacheSeed || 1, "search-approx-products"), [searchAnalysis.topApproxProducts, cacheSeed]);
  const searchRelatedProductsStable = useMemo(() => sortProductsStableByCache(searchAnalysis.topRelatedProducts, cacheSeed || 1, "search-related-products"), [searchAnalysis.topRelatedProducts, cacheSeed]);
  const searchExactStoresStable = useMemo(() => sortStoresStableByCache(searchAnalysis.topExactStores, cacheSeed || 1, "search-exact-stores"), [searchAnalysis.topExactStores, cacheSeed]);
  const searchApproxStoresStable = useMemo(() => sortStoresStableByCache(searchAnalysis.topApproxStores, cacheSeed || 1, "search-approx-stores"), [searchAnalysis.topApproxStores, cacheSeed]);
  const searchRelatedStoresStable = useMemo(() => sortStoresStableByCache(searchAnalysis.topRelatedStores, cacheSeed || 1, "search-related-stores"), [searchAnalysis.topRelatedStores, cacheSeed]);

  const sections = useMemo<FeedSection[]>(() => {
    if (!scopedProducts.length && !scopedStores.length) {
      return fallbackProducts.length ? [{ id: "empty", type: "empty-state" }, { id: "empty-fallback-products", type: "products-grid", title: t("storely_other_products_we_have"), items: fallbackProducts }] : [{ id: "empty", type: "empty-state" }];
    }
    const out: FeedSection[] = [];

    if (debouncedQuery.trim()) {
      if (searchAnalysis.mode === "exact" && searchExactProductsStable.length) out.push({ id: "exact-products", type: "products-grid", title: t("storely_found_products"), items: searchExactProductsStable.slice(0, GRID_PAGE_SIZE) });
      else if (searchAnalysis.mode === "approximate" && searchApproxProductsStable.length) out.push({ id: "approx-products", type: "products-grid", title: t("storely_close_matches"), items: searchApproxProductsStable.slice(0, GRID_PAGE_SIZE) });
      else if (searchAnalysis.mode === "related" && searchRelatedProductsStable.length) out.push({ id: "related-products-main", type: "products-grid", title: t("storely_related_products"), items: searchRelatedProductsStable.slice(0, GRID_PAGE_SIZE) });
      else out.push({ id: "fallback-products-main", type: "products-grid", title: t("storely_suggestions_for_you"), items: stableMainFeed.slice(0, GRID_PAGE_SIZE) });

      const mergedSearchStores = [...searchExactStoresStable, ...searchApproxStoresStable].filter((item, idx, arr) => arr.findIndex(x => x.slug === item.slug) === idx);
      if (mergedSearchStores.length) out.push({ id: "search-stores", type: "stores-strip", title: searchAnalysis.mode === "exact" ? t("storely_matching_stores") : t("storely_similar_stores"), items: mergedSearchStores.slice(0, STORES_STRIP_SIZE) });
      if (searchRelatedProductsStable.length) out.push({ id: "search-related-products", type: "products-strip", title: t("storely_related_products"), items: searchRelatedProductsStable.slice(0, STRIP_SIZE) });
      if (searchRelatedStoresStable.length) out.push({ id: "search-related-stores", type: "stores-strip", title: t("storely_related_stores"), items: searchRelatedStoresStable.slice(0, STORES_STRIP_SIZE) });
      if (searchAnalysis.mode === "fallback" || (!scopedProducts.length && fallbackProducts.length)) out.push({ id: "search-fallback-feed", type: "products-grid", title: t("storely_other_products_we_have"), items: fallbackProducts });
      return out;
    }

    if (newestProducts.length) out.push({ id: "recent-1", type: "products-strip", title: t("storely_new_products"), items: newestProducts });
    if (mainGroups[0]?.length) out.push({ id: "grid-0", type: "products-grid", title: t("storely_main_feed"), items: mainGroups[0] });
    if (highlightedStores.length) out.push({ id: "stores-1", type: "stores-strip", title: t("storely_available_stores"), items: highlightedStores });
    if (mainGroups[1]?.length) out.push({ id: "grid-1", type: "products-grid", title: t("storely_main_feed"), items: mainGroups[1] });
    if (!userHasAccount) out.push({ id: "cta", type: "cta" });
    if (mainGroups[2]?.length) out.push({ id: "grid-2", type: "products-grid", title: t("storely_main_feed"), items: mainGroups[2] });
    return out;
  }, [scopedProducts, scopedStores, fallbackProducts, debouncedQuery, searchAnalysis.mode, searchExactProductsStable, searchApproxProductsStable, searchRelatedProductsStable, searchExactStoresStable, searchApproxStoresStable, searchRelatedStoresStable, stableMainFeed, newestProducts, highlightedStores, mainGroups, userHasAccount, t]);

  const searchStatusText = useMemo(() => {
    if (!debouncedQuery.trim()) return "";
    if (searchAnalysis.mode === "exact") return t("storely_search_exact");
    if (searchAnalysis.mode === "approximate") return t("storely_search_no_exact_but_close");
    if (searchAnalysis.mode === "related") return t("storely_search_no_exact_but_related");
    if (searchAnalysis.mode === "fallback") return t("storely_search_nothing_close");
    return "";
  }, [debouncedQuery, searchAnalysis.mode, t]);

  const savePrefsState = useCallback((next: any) => { setPrefsState(next); idle(() => setPrefs(next)); }, []);

  const handleProductClick = useCallback((item: ProductItem) => {
    const next = { categories: bumpScore(prefs.categories, item.category, 3), stores: bumpScore(prefs.stores, item.storeSlug, 4), products: bumpScore(prefs.products, item.id, 2), searches: prefs.searches };
    setPrefsState(next); idle(() => setPrefs(next));
    saveShowcaseStateNow({ query, selectedCategory, selectedStore, showFilters, pathname });

    const matchedStore = stores.find(s => s.slug === item.storeSlug);
    const productState = { id: item.id, name: item.name, category: item.category, price: item.price, currency: item.currency, main_image: item.image || "", gallery: item.gallery?.length ? item.gallery : item.image ? [item.image] : [], full_description: item.description || "", unit: item.unit || "un", store_id: matchedStore?.id || item.storeSlug };
    const storeState = matchedStore ? { id: matchedStore.id, slug: matchedStore.slug, name: matchedStore.name, whatsapp_number: matchedStore.whatsapp_number || null, settings: matchedStore.settings || { currency: item.currency || "USD" }, logo_url: matchedStore.logoUrl || "", heroImage: matchedStore.heroImage || "", description: matchedStore.description || "" } : { id: item.storeSlug, slug: item.storeSlug, name: item.storeName, whatsapp_number: item.storeWhatsApp || null, settings: { currency: item.currency || "USD" }, logo_url: item.storeLogo || "", heroImage: item.image || "", description: item.storeDescription || "" };

    navigate(`/${item.storeSlug}/blog/${item.id}`, { state: { product: productState, store: storeState, source: debouncedQuery.trim() ? "search" : "feed", searchMode: searchAnalysis.mode } });
  }, [navigate, prefs, stores, debouncedQuery, searchAnalysis.mode, query, selectedCategory, selectedStore, showFilters, pathname]);

  const handleStoreClick = useCallback((slug: string) => {
    const store = stores.find(s => s.slug === slug);
    const next = { categories: prefs.categories, stores: bumpScore(prefs.stores, slug, 5), products: prefs.products, searches: prefs.searches };
    setPrefsState(next); idle(() => setPrefs(next));
    saveShowcaseStateNow({ query, selectedCategory, selectedStore, showFilters, pathname });

    const storeState = store ? { id: store.id, slug: store.slug, name: store.name, whatsapp_number: store.whatsapp_number || null, settings: store.settings || { currency: "USD" }, logo_url: store.logoUrl || "", heroImage: store.heroImage || "", description: store.description || "" } : undefined;
    navigate(`/${slug}`, { state: { store: storeState, source: debouncedQuery.trim() ? "search" : "feed", searchMode: searchAnalysis.mode } });
  }, [navigate, prefs, stores, debouncedQuery, searchAnalysis.mode, query, selectedCategory, selectedStore, showFilters, pathname]);

  const submitSearch = useCallback((value?: string) => {
    const term = (value ?? query).trim(); if (!term) return;
    pushHistory(term); setHistoryState(getHistory());
    const next = { ...prefs, searches: bumpScore(prefs.searches, normalizeText(term), 2) };
    savePrefsState(next); setQuery(term); setShowDropdown(false);
  }, [prefs, query, savePrefsState]);

  const clearSearchAndFilters = useCallback(() => { setQuery(""); setSelectedCategory("all"); setSelectedStore("all"); }, []);

  const refreshShowcaseCache = useCallback(async () => {
    clearStorelyCache(); queryClient.removeQueries({ queryKey: ["storely-public-smart-v9"] });
    const result = await refetch(); const freshRows = result.data ?? [];
    if (freshRows.length) {
      const payload = writeStorelyCache(freshRows);
      if (payload) { setExpiresAt(payload.expiresAt); setRemainingMs(Math.max(payload.expiresAt - Date.now(), 0)); setCacheSeed(seededHash(String(payload.savedAt), payload.savedAt)); }
    } else { setExpiresAt(0); setRemainingMs(0); setCacheSeed(0); }
  }, [queryClient, refetch]);

  const handleCategoryRailLeft = useCallback(() => { smoothScrollBy(categoryRailRef.current, -CATEGORY_SCROLL_STEP); }, []);
  const handleCategoryRailRight = useCallback(() => { smoothScrollBy(categoryRailRef.current, CATEGORY_SCROLL_STEP); }, []);

  if (isLoading && !rows.length) {
    return (
      <section className="w-full px-0 py-4">
        <div className="space-y-5 animate-pulse">
          <div className="h-11 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-8 w-3/4 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-[1.4rem] border border-zinc-200 dark:border-zinc-800">
                <div className="aspect-[4/4.8] bg-zinc-200 dark:bg-zinc-800" />
                <div className="space-y-2 p-3"><div className="h-4 rounded bg-zinc-200 dark:bg-zinc-800" /><div className="h-3 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" /></div>
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
        {!isEditorRoute && (
          <div ref={searchRef} className={`sticky top-17 lg:top-16 z-20 border-zinc-200 bg-white/90 p-3 pb-2 dark:border-zinc-800 dark:bg-zinc-950/85 ${isCompact ? "lg:px-4 shadow-sm" : "lg:px-4"}`}>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input value={query} onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }} onFocus={() => setShowDropdown(true)} onKeyDown={(e) => { if (e.key === "Enter") submitSearch(); }} placeholder={t("storely_search_placeholder")} className="w-full rounded-full border border-zinc-200 bg-zinc-50 pl-10 pr-24 font-semibold text-zinc-900 outline-none transition dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 h-10 text-base md:text-[12px]" />
                  <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
                    {query ? <button type="button" onClick={() => setQuery("")} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-200/70 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"><X size={14} /></button> : null}
                    <button type="button" onClick={() => submitSearch()} className="inline-flex h-8 items-center justify-center rounded-full bg-zinc-950 px-3 text-[10px] font-black uppercase tracking-[0.12em] text-white dark:bg-white dark:text-zinc-900">{t("storely_search")}</button>
                  </div>
                  {showDropdown && (searchSuggestions.length > 0 || limitedHistory.length > 0) && (
                    <div className="absolute left-0 right-0 top-[calc(100%+10px)] overflow-hidden rounded-[1.35rem] border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
                      {searchSuggestions.length > 0 && (
                        <div className="p-2">
                          <p className="px-2 pb-1 text-[8px] font-black uppercase tracking-[0.12em] text-zinc-400">{t("storely_suggestions")}</p>
                          <div className="space-y-1">
                            {searchSuggestions.map((item, idx) => (
                              <button key={`${item.type}-${item.value}-${idx}`} type="button" onClick={() => submitSearch(item.value)} className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900">
                                <span className="truncate">{item.value}</span>
                                <span className="ml-3 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-400">{item.type}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {!query && limitedHistory.length > 0 && (
                        <div className="border-t border-zinc-100 p-2 dark:border-zinc-900">
                          <p className="px-2 pb-1 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-400">{t("storely_recent_searches")}</p>
                          <div className="space-y-1">
                            {limitedHistory.map((item) => (
                              <button key={`${item.value}-${item.ts}`} type="button" onClick={() => submitSearch(item.value)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900">
                                <Clock3 size={14} className="text-zinc-400" />
                                <span className="truncate">{item.value}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button type="button" onClick={() => setShowFilters(prev => !prev)} className="inline-flex shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 h-10 w-10"><SlidersHorizontal size={16} /></button>
              </div>

              {showFilters && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[10px] mt-1 md:mt-0 font-black uppercase tracking-[0.12em] text-zinc-400">{t("storely_categories")}</div>
                    <RailControls onLeft={handleCategoryRailLeft} onRight={handleCategoryRailRight} ariaLabel={t("storely_categories")} />
                  </div>
                  <div ref={categoryRailRef} className="overflow-x-auto pb-1 scrollbar-hide">
                    <div className="flex min-w-max items-center gap-2">
                      {horizontalCategories.map((cat) => (
                        <button key={cat} type="button" onClick={() => setSelectedCategory(cat)} className={`shrink-0 rounded-full px-3 py-2 text-[8px] font-black uppercase tracking-[0.12em] transition ${selectedCategory === cat ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-900" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"}`}>{cat === "all" ? t("storely_all") : cat}</button>
                      ))}
                    </div>
                  </div>
                  <div className="md:flex hidden flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="h-10 rounded-full border border-zinc-200 bg-white px-3 text-[10px] font-semibold text-zinc-700 outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                        <option value="all">{t("storely_all_categories")}</option>
                        {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)} className="h-10 rounded-full border border-zinc-200 bg-white px-3 text-[10px] font-semibold text-zinc-700 outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                        <option value="all">{t("storely_all_stores")}</option>
                        {stores.map(st => <option key={st.slug} value={st.slug}>{st.name}</option>)}
                      </select>
                      {(query || selectedCategory !== "all" || selectedStore !== "all") && (
                        <button type="button" onClick={clearSearchAndFilters} className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-200 px-3 text-[8px] font-black uppercase bg-red-200 dark:bg-red-800 tracking-[0.12em] text-zinc-800 dark:border-zinc-800 dark:text-zinc-50">{t("storely_clear")}</button>
                      )}
                      <button type="button" onClick={refreshShowcaseCache} disabled={isFetching} className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-200 px-4 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-600 disabled:opacity-60 dark:border-zinc-800 dark:text-zinc-300"><RefreshCw size={10} className={isFetching ? "animate-spin" : ""} /></button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[8px]">
                      {searchStatusText && <span className="rounded-full bg-blue-50 px-3 py-1.5 font-black uppercase tracking-[0.12em] text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">{searchStatusText}</span>}
                      <span className="rounded-full bg-zinc-100 px-3 py-1.5 font-black uppercase tracking-[0.12em] text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">{rows.length} {t("storely_products")}</span>
                      <span className="rounded-full bg-zinc-100 px-3 py-1.5 font-black uppercase tracking-[0.12em] text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">{stores.length} {t("storely_stores")}</span>
                      <span className="rounded-full bg-zinc-100 px-3 py-1.5 font-black uppercase tracking-[0.12em] text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">{formatRemainingShort(remainingMs, t("storely_cache_expired"))}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {sections.map((section) => {
          if (section.type === "products-grid") {
            return (
              <section key={section.id} style={{ contentVisibility: "auto", containIntrinsicSize: "850px" }} className="px-2 md:px-4">
                {section.title && <SectionHeader icon={<ShoppingBag size={15} />} title={section.title} subtle={`${section.items.length}`} />}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                  {section.items.map(item => <ProductCard key={item.id} item={item} onClick={handleProductClick} locale={localeForPrice} />)}
                </div>
              </section>
            );
          }
          if (section.type === "products-strip") {
            return <HorizontalProductsStrip key={section.id} title={section.title} items={section.items} onProductClick={handleProductClick} locale={localeForPrice} />;
          }
          if (section.type === "stores-strip") {
            return (
              <section key={section.id} className="px-2 md:px-4">
                <HorizontalStoresStrip title={section.title} items={section.items} onStoreClick={handleStoreClick} viewStore={t("storely_view_store")} />
              </section>
            );
          }
          if (section.type === "cta") {
            return !hasSession && (
              <section className="px-2 md:px-4" key={section.id}>
                <SellerCTA title={t("storely_sell_cta_title")} subtitle={t("storely_sell_cta_subtitle")} cta={t("storely_sell_now")} onClick={() => navigate("/auth")} />
              </section>
            );
          }
          return <EmptyState key={section.id} title={t("storely_no_results_title")} subtitle={t("storely_no_results_subtitle")} suggestionTitle={t("storely_try_these")} suggestionItems={searchAnalysis.suggestionTerms} onSuggestionClick={submitSearch} />;
        })}
      </div>
    </section>
  );
};

export default ShowcaseStores;