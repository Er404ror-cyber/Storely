import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { LayoutGrid } from "lucide-react";

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
} from "../../utils/constants";
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
import { ProductCard, SellerCTA, EmptyState, SectionHeader } from "./UIHelpers";
import { HorizontalProductsStrip, HorizontalStoresStrip } from "./Strips";
import { ShowcaseSidebar } from "./showcaseStores/ShowcaseSidebar";
import { ShowcaseMobileHeader } from "./showcaseStores/ShowcaseMobileHeader";



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
  const desktopSearchRef = useRef<HTMLDivElement | null>(null);
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
    };

    const t1 = window.setTimeout(restore, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(t1);
    };
  }, [initialUiState, navigationType, pathname]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isOutsideMobile = searchRef.current ? !searchRef.current.contains(target) : true;
      const isOutsideDesktop = desktopSearchRef.current ? !desktopSearchRef.current.contains(target) : true;
      
      if (isOutsideMobile && isOutsideDesktop) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutside, { passive: true });
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    const node = stickySentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => { setIsCompact(!entry.isIntersecting); }, { threshold: 0.1 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

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
      clearStorelyCache(); setExpiresAt(0); setCacheSeed(0);
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

    const storeMap = new Map<string, StoreItem & { currency?: string }>();
    
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
        currency: store?.currency || p.currency, 
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

  const savePrefsState = useCallback((next: typeof prefs) => { setPrefsState(next); idle(() => setPrefs(next)); }, []);

  const handleProductClick = useCallback((item: ProductItem) => {
    const next = { categories: bumpScore(prefs.categories, item.category, 3), stores: bumpScore(prefs.stores, item.storeSlug, 4), products: bumpScore(prefs.products, item.id, 2), searches: prefs.searches };
    setPrefsState(next); idle(() => setPrefs(next));
    saveShowcaseStateNow({ query, selectedCategory, selectedStore, showFilters, pathname });

    const matchedStore = stores.find(s => s.slug === item.storeSlug) as (StoreItem & { currency?: string }) | undefined;
    
    const productState = { 
      id: item.id, 
      name: item.name, 
      category: item.category, 
      price: item.price, 
      unit: item.unit || "un", 
      full_description: item.description || "", 
      main_image: item.image || "", 
      gallery: item.gallery?.length ? item.gallery : item.image ? [item.image] : [], 
      store_id: matchedStore?.id || item.storeSlug 
    };

    const storeState = matchedStore ? { 
      id: matchedStore.id, 
      slug: matchedStore.slug, 
      name: matchedStore.name, 
      whatsapp_number: matchedStore.whatsapp_number || null, 
      currency: matchedStore.currency || item.currency || FALLBACK_CURRENCY,
      settings: matchedStore.settings || { currency: item.currency || FALLBACK_CURRENCY }, 
      logo_url: matchedStore.logoUrl || "", 
      description: matchedStore.description || "" 
    } : { 
      id: item.storeSlug, 
      slug: item.storeSlug, 
      name: item.storeName, 
      whatsapp_number: item.storeWhatsApp || null, 
      currency: item.currency || FALLBACK_CURRENCY,
      settings: { currency: item.currency || FALLBACK_CURRENCY }, 
      logo_url: item.storeLogo || "", 
      description: item.storeDescription || "" 
    };

    navigate(`/${item.storeSlug}/blog/${item.id}`, { state: { product: productState, store: storeState, source: debouncedQuery.trim() ? "search" : "feed", searchMode: searchAnalysis.mode } });
  }, [navigate, prefs, stores, debouncedQuery, searchAnalysis.mode, query, selectedCategory, selectedStore, showFilters, pathname]);

  const handleStoreClick = useCallback((slug: string) => {
    const store = stores.find(s => s.slug === slug) as (StoreItem & { currency?: string }) | undefined;
    const next = { categories: prefs.categories, stores: bumpScore(prefs.stores, slug, 5), products: prefs.products, searches: prefs.searches };
    setPrefsState(next); idle(() => setPrefs(next));
    saveShowcaseStateNow({ query, selectedCategory, selectedStore, showFilters, pathname });

    const storeState = store ? { 
      id: store.id, 
      slug: store.slug, 
      name: store.name, 
      whatsapp_number: store.whatsapp_number || null, 
      currency: store.currency || FALLBACK_CURRENCY,
      settings: store.settings || { }, 
      logo_url: store.logoUrl || "", 
      description: store.description || "" 
    } : undefined;

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
      if (payload) { setExpiresAt(payload.expiresAt); setCacheSeed(seededHash(String(payload.savedAt), payload.savedAt)); }
    } else { setExpiresAt(0); setCacheSeed(0); }
  }, [queryClient, refetch]);

  const handleCategoryRailLeft = useCallback(() => { smoothScrollBy(categoryRailRef.current, -CATEGORY_SCROLL_STEP); }, []);
  const handleCategoryRailRight = useCallback(() => { smoothScrollBy(categoryRailRef.current, CATEGORY_SCROLL_STEP); }, []);

  if (isLoading && !rows.length) {
    return (
      <section className="w-full px-0 py-4">
        <div className="space-y-5 animate-pulse-fast">
          <div className="h-11 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-8 w-3/4 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-[1.4rem] border border-zinc-200 dark:border-zinc-800">
                <div className="aspect-[4/4.8] bg-zinc-200 dark:bg-zinc-800" />
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
      
      <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:px-4 xl:px-6">

        {/* TOP BAR - MOBILE */}
        {!isEditorRoute && (
          <ShowcaseMobileHeader
            query={query}
            setQuery={setQuery}
            setShowDropdown={setShowDropdown}
            showDropdown={showDropdown}
            submitSearch={submitSearch}
            searchSuggestions={searchSuggestions}
            limitedHistory={limitedHistory}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            horizontalCategories={horizontalCategories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedStore={selectedStore}
            setSelectedStore={setSelectedStore}
            stores={stores}
            clearSearchAndFilters={clearSearchAndFilters}
            refreshShowcaseCache={refreshShowcaseCache}
            isFetching={isFetching}
            isCompact={isCompact}
            categoryRailRef={categoryRailRef}
            handleCategoryRailLeft={handleCategoryRailLeft}
            handleCategoryRailRight={handleCategoryRailRight}
            t={t}
          />
        )}

        {/* SIDEBAR - DESKTOP */}
        {!isEditorRoute && (
          <ShowcaseSidebar
            query={query}
            setQuery={setQuery}
            setShowDropdown={setShowDropdown}
            showDropdown={showDropdown}
            submitSearch={submitSearch}
            searchSuggestions={searchSuggestions}
            limitedHistory={limitedHistory}
            horizontalCategories={horizontalCategories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedStore={selectedStore}
            setSelectedStore={setSelectedStore}
            stores={stores}
            searchStatusText={searchStatusText}
            totalRows={rows.length}
            clearSearchAndFilters={clearSearchAndFilters}
            refreshShowcaseCache={refreshShowcaseCache}
            isFetching={isFetching}
            t={t}
          />
        )}

        {/* FEED PRINCIPAL */}
        <div className="flex-1 min-w-0 space-y-6 w-full pb-8">
          {sections.map((section) => {
            if (section.type === "products-grid") {
              return (
                <section key={section.id} style={{ contentVisibility: "auto", containIntrinsicSize: "auto 500px" }} className="px-2 ">
                  {section.title && <SectionHeader icon={<LayoutGrid size={15} />} title={section.title} subtle={`${section.items.length}`} />}
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
                <section key={section.id} className="px-2 md:px-0">
                  <HorizontalStoresStrip title={section.title} items={section.items} onStoreClick={handleStoreClick} viewStore={t("storely_view_store")} />
                </section>
              );
            }
            if (section.type === "cta") {
              return !hasSession && (
                <section className="px-2 md:px-0" key={section.id}>
                  <SellerCTA title={t("storely_sell_cta_title")} subtitle={t("storely_sell_cta_subtitle")} cta={t("storely_sell_now")} onClick={() => navigate("/auth")} />
                </section>
              );
            }
            return <EmptyState key={section.id} title={t("storely_no_results_title")} subtitle={t("storely_no_results_subtitle")} suggestionTitle={t("storely_try_these")} suggestionItems={searchAnalysis.suggestionTerms} onSuggestionClick={submitSearch} />;
          })}
        </div>

      </div>

      <style>{`
        .custom-v-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-v-scroll::-webkit-scrollbar-thumb {
          background: #e4e4e7;
          border-radius: 9999px;
        }
        .dark .custom-v-scroll::-webkit-scrollbar-thumb {
          background: #3f3f46;
        }
      `}</style>
    </section>
  );
};

export default ShowcaseStores;