import { useMemo, useState, useEffect, useDeferredValue } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
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
} from "../../utils/constants";
import {
  chunk,
  compactRelativeLabel,
  getShortRelativeTime,
  normalizeText,
  resolveStoreCurrency,
  seededHash,
  similarityScore,
  exactLikeScore,
  sortProductsStableByCache,
  sortStoresStableByCache,
} from "../../utils/marketplaceutils";
import {
  readStorelyCache,
  writeStorelyCache,
  clearStorelyCache,
} from "../../components/blog/storage";

interface UseShowcaseDataProps {
  debouncedQuery: string;
  selectedCategory: string;
  selectedStore: string;
  localeCode: "en" | "pt";
  userHasAccount: boolean;
  t: (key: string, vars?: Record<string, unknown>) => string;
}

export const useShowcaseData = ({
  debouncedQuery,
  selectedCategory,
  selectedStore,
  localeCode,
  userHasAccount,
  t,
}: UseShowcaseDataProps) => {
  const initialCache = useMemo(() => readStorelyCache(), []);
  const [expiresAt, setExpiresAt] = useState<number>(initialCache?.expiresAt ?? 0);
  const [cacheSeed, setCacheSeed] = useState<number>(
    initialCache?.savedAt ? seededHash(String(initialCache.savedAt), initialCache.savedAt) : 0
  );

  // MANTEMOS V9 para não quebrar o Blog, mas verificamos se os dados têm desconto!
  const { data: rows = initialCache?.data ?? [], isLoading, isFetching, refetch } = useQuery<ProductRow[]>({
    queryKey: ["storely-public-smart-v9"], 
    initialData: initialCache?.data,
    staleTime: STORELY_CACHE_TTL,
    gcTime: STORELY_CACHE_TTL * 2,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    placeholderData: (prev) => prev,
    queryFn: async () => {
      const cache = readStorelyCache();
      
      // CACHE BUSTER: Se o cache existe mas não tem a coluna de descontos, forçamos a busca na DB.
      const isOutdatedCache = cache && cache.data && cache.data.length > 0 && !("discount_percent" in cache.data[0]);

      if (cache && !isOutdatedCache) {
        setExpiresAt(cache.expiresAt);
        setCacheSeed(seededHash(String(cache.savedAt), cache.savedAt));
        return cache.data;
      }

      if (isOutdatedCache) {
        clearStorelyCache();
      }

      const { data, error } = await supabase
        .from("products")
        .select(`id, store_id, name, slug, price, discount_percent, description, image_url, is_active, created_at, category, gallery, main_image, full_description, unit, stores!inner (id, slug, name, description, logo_url, whatsapp_number, settings, currency)`)
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
    let timeout: number | null = null;
    if (!expiresAt) return;
    const delay = Math.max(expiresAt - Date.now(), 0);

    timeout = window.setTimeout(() => {
      clearStorelyCache();
      setExpiresAt(0);
      setCacheSeed(0);
    }, delay + 50);

    return () => {
      if (timeout) window.clearTimeout(timeout);
    };
  }, [expiresAt]);

  const catalog = useMemo(() => {
    const products: ProductItem[] = rows.map((row: any) => {
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

      const basePrice = row.price ? Number(row.price) : 0;
      const discPercent = row.discount_percent ? Number(row.discount_percent) : 0;
      const hasDiscount = discPercent > 0;
      const finalPrice = hasDiscount ? basePrice - (basePrice * (discPercent / 100)) : basePrice;

      return {
        id: row.id, name, category,
        image: row.main_image || row.image_url || FALLBACK_PRODUCT,
        gallery: Array.isArray(row.gallery) ? row.gallery.filter(Boolean) : row.main_image ? [row.main_image] : [],
        description: row.full_description?.trim() || row.description?.trim() || "",
        unit: row.unit?.trim() || "un",
        createdAt: row.created_at, createdAtValue, timeAgoShort: shortLabel,
        storeSlug: store?.slug || "store", storeName, storeDescription,
        storeLogo: store?.logo_url || "", storeWhatsApp: store?.whatsapp_number || null,
        
        price: basePrice, 
        currency: resolveStoreCurrency(store, FALLBACK_CURRENCY),
        
        hasDiscount,
        originalPrice: hasDiscount ? basePrice : null,
        finalPrice,
        discountPercent: hasDiscount ? discPercent : null,

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

    return { 
      products, 
      stores: Array.from(storeMap.values()), 
      categories: Array.from(new Set(products.map(p => p.category).filter((v): v is string => Boolean(v)))).sort((a, b) => a.localeCompare(b)) 
    };
  }, [rows, t, localeCode]);

  const products = catalog?.products ?? EMPTY_PRODUCTS;
  const stores = catalog?.stores ?? EMPTY_STORES;
  const catalogCategories = catalog?.categories ?? EMPTY_CATEGORIES;

  const allCategories = useMemo(() => {
    return [...catalogCategories].sort((a, b) => seededHash(a, cacheSeed || 1) - seededHash(b, cacheSeed || 1) || a.localeCompare(b));
  }, [catalogCategories, cacheSeed]);

  const horizontalCategories = useMemo(() => ["all", ...allCategories], [allCategories]);

  const searchSuggestions = useMemo(() => {
    const q = debouncedQuery.trim();
    if (!q) return [];
    
    return [
      ...products.map(p => ({ type: "product" as const, value: p.name, score: similarityScore(q, p.searchName) + similarityScore(q, p.searchCategory) * 0.45 + similarityScore(q, p.searchStore) * 0.25 })),
      ...stores.map(s => ({ type: "store" as const, value: s.name, score: similarityScore(q, s.searchName) + similarityScore(q, s.searchDescription) * 0.25 })),
      ...allCategories.map(c => ({ type: "category" as const, value: c, score: similarityScore(q, c) })),
    ]
    .filter(item => item.score > 15)
    .sort((a, b) => b.score - a.score)
    .filter((item, index, self) => index === self.findIndex((t) => t.type === item.type && normalizeText(t.value) === normalizeText(item.value)))
    .slice(0, MAX_SEARCH_SUGGESTIONS);
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
    if (!debouncedQuery.trim()) return products.filter(p => (selectedCategory === "all" || p.category === selectedCategory) && (selectedStore === "all" || p.storeSlug === selectedStore));
    return [...searchAnalysis.topExactProducts, ...searchAnalysis.topApproxProducts, ...searchAnalysis.topRelatedProducts].filter(p => (selectedCategory === "all" || p.category === selectedCategory) && (selectedStore === "all" || p.storeSlug === selectedStore));
  }, [debouncedQuery, products, searchAnalysis, selectedCategory, selectedStore]);

  const scopedStores = useMemo(() => {
    if (!debouncedQuery.trim()) return stores.filter(s => (selectedCategory === "all" || s.categories.includes(selectedCategory)) && (selectedStore === "all" || s.slug === selectedStore));
    return [...searchAnalysis.topExactStores, ...searchAnalysis.topApproxStores, ...searchAnalysis.topRelatedStores].filter(s => (selectedCategory === "all" || s.categories.includes(selectedCategory)) && (selectedStore === "all" || s.slug === selectedStore));
  }, [debouncedQuery, stores, searchAnalysis, selectedCategory, selectedStore]);

  const sections = useMemo<FeedSection[]>(() => {
    const stableMainFeed = sortProductsStableByCache(scopedProducts, cacheSeed || 1, "main-feed");
    const fallbackProducts = sortProductsStableByCache(products.filter(item => !new Set(scopedProducts.map(i => i.id)).has(item.id)).sort((a, b) => b.createdAtValue - a.createdAtValue), cacheSeed || 1, "fallback-feed").slice(0, MAX_FALLBACK_PRODUCTS);
    const newestProducts = sortProductsStableByCache([...scopedProducts].sort((a, b) => b.createdAtValue - a.createdAtValue), cacheSeed || 1, "recent-feed").slice(0, STRIP_SIZE);
    const highlightedStores = sortStoresStableByCache(scopedStores, cacheSeed || 1, "stores-feed").slice(0, STORES_STRIP_SIZE);
    const mainGroups = chunk(stableMainFeed.slice(0, GRID_PAGE_SIZE * 3), GRID_PAGE_SIZE);

    if (!scopedProducts.length && !scopedStores.length) {
      return fallbackProducts.length ? [{ id: "empty", type: "empty-state" }, { id: "empty-fallback-products", type: "products-grid", title: t("storely_other_products_we_have"), items: fallbackProducts }] : [{ id: "empty", type: "empty-state" }];
    }
    const out: FeedSection[] = [];

    if (debouncedQuery.trim()) {
      if (searchAnalysis.mode === "exact" && searchAnalysis.topExactProducts.length) out.push({ id: "exact-products", type: "products-grid", title: t("storely_found_products"), items: sortProductsStableByCache(searchAnalysis.topExactProducts, cacheSeed || 1, "search-exact").slice(0, GRID_PAGE_SIZE) });
      else if (searchAnalysis.mode === "approximate" && searchAnalysis.topApproxProducts.length) out.push({ id: "approx-products", type: "products-grid", title: t("storely_close_matches"), items: sortProductsStableByCache(searchAnalysis.topApproxProducts, cacheSeed || 1, "search-approx").slice(0, GRID_PAGE_SIZE) });
      else if (searchAnalysis.mode === "related" && searchAnalysis.topRelatedProducts.length) out.push({ id: "related-products-main", type: "products-grid", title: t("storely_related_products"), items: sortProductsStableByCache(searchAnalysis.topRelatedProducts, cacheSeed || 1, "search-related").slice(0, GRID_PAGE_SIZE) });
      else out.push({ id: "fallback-products-main", type: "products-grid", title: t("storely_suggestions_for_you"), items: stableMainFeed.slice(0, GRID_PAGE_SIZE) });

      const mergedSearchStores = [...sortStoresStableByCache(searchAnalysis.topExactStores, cacheSeed || 1, "ex"), ...sortStoresStableByCache(searchAnalysis.topApproxStores, cacheSeed || 1, "ap")].filter((item, idx, arr) => arr.findIndex(x => x.slug === item.slug) === idx);
      if (mergedSearchStores.length) out.push({ id: "search-stores", type: "stores-strip", title: searchAnalysis.mode === "exact" ? t("storely_matching_stores") : t("storely_similar_stores"), items: mergedSearchStores.slice(0, STORES_STRIP_SIZE) });
      if (searchAnalysis.topRelatedProducts.length) out.push({ id: "search-related-products", type: "products-strip", title: t("storely_related_products"), items: sortProductsStableByCache(searchAnalysis.topRelatedProducts, cacheSeed || 1, "rel-prod").slice(0, STRIP_SIZE) });
      if (searchAnalysis.topRelatedStores.length) out.push({ id: "search-related-stores", type: "stores-strip", title: t("storely_related_stores"), items: sortStoresStableByCache(searchAnalysis.topRelatedStores, cacheSeed || 1, "rel-store").slice(0, STORES_STRIP_SIZE) });
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
  }, [scopedProducts, scopedStores, products, debouncedQuery, searchAnalysis, cacheSeed, userHasAccount, t]);

  const deferredSections = useDeferredValue(sections);

  const searchStatusText = useMemo(() => {
    if (!debouncedQuery.trim()) return "";
    if (searchAnalysis.mode === "exact") return t("storely_search_exact");
    if (searchAnalysis.mode === "approximate") return t("storely_search_no_exact_but_close");
    if (searchAnalysis.mode === "related") return t("storely_search_no_exact_but_related");
    if (searchAnalysis.mode === "fallback") return t("storely_search_nothing_close");
    return "";
  }, [debouncedQuery, searchAnalysis.mode, t]);

  return {
    rows,
    products,
    stores,
    isLoading,
    isFetching,
    refetch,
    searchSuggestions,
    searchAnalysis,
    horizontalCategories,
    deferredSections,
    searchStatusText,
    cacheSeed,
  };
};