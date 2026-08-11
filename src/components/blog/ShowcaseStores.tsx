import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { LayoutGrid } from "lucide-react";

import { supabase } from "../../lib/supabase";
import { useTranslate } from "../../context/LanguageContext";

import type { ProductItem, StoreItem } from "../../types/Marketplace";
import { FALLBACK_CURRENCY, CATEGORY_SCROLL_STEP } from "../../utils/constants";
import { bumpScore, hasStorelyAccount, idle, normalizeText, smoothScrollBy, useDebouncedValue } from "../../utils/marketplaceutils";
import {
  clearStorelyCache,
  getHistory,
  getPrefs,
  pushHistory,
  readShowcaseState,
  saveShowcaseStateNow,
  setPrefs,
} from "./storage";

import { ProductCard, SellerCTA, EmptyState, SectionHeader } from "./UIHelpers";
import { HorizontalProductsStrip, HorizontalStoresStrip } from "./Strips";
import { ShowcaseSidebar } from "./showcaseStores/ShowcaseSidebar";
import { ShowcaseMobileHeader } from "./showcaseStores/ShowcaseMobileHeader";
import { useShowcaseData } from "../../pages/home/useShowcaseData";

export const ShowcaseStores = () => {
  const { t, lang } = useTranslate() as { t: (key: string, vars?: Record<string, unknown>) => string; lang?: string };

  const location = useLocation();
  const navigationType = useNavigationType();
  const { pathname } = location;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isEditorRoute = pathname.includes("admin");
  const localeCode: "pt" | "en" = lang === "en" ? "en" : "pt";
  const localeForPrice = lang === "en" ? "en-US" : "pt-PT";

  const searchRef = useRef<HTMLDivElement | null>(null);
  const desktopSearchRef = useRef<HTMLDivElement | null>(null);
  const stickySentinelRef = useRef<HTMLDivElement | null>(null);
  const categoryRailRef = useRef<HTMLDivElement | null>(null);

  const [hasSession, setHasSession] = useState(false);
  const initialUiState = useMemo(() => readShowcaseState(), []);
  const [prefs, setPrefsState] = useState(() => getPrefs());
  const [history, setHistoryState] = useState(() => getHistory());

  const [query, setQuery] = useState(initialUiState?.query ?? "");
  const [selectedCategory, setSelectedCategory] = useState(initialUiState?.selectedCategory ?? "all");
  const [selectedStore, setSelectedStore] = useState(initialUiState?.selectedStore ?? "all");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFilters, setShowFilters] = useState(initialUiState?.showFilters ?? false);
  const [isCompact, setIsCompact] = useState(false);

  const debouncedQuery = useDebouncedValue(query, 220);
  const limitedHistory = useMemo(() => history.slice(0, 3), [history]);
  const userHasAccount = useMemo(() => hasStorelyAccount(), []);

  // CARREGAR DADOS DO HOOK
  const {
    rows,
    stores,
    isLoading,
    isFetching,
    refetch,
    searchSuggestions,
    horizontalCategories,
    deferredSections,
    searchStatusText,
    searchAnalysis,
  } = useShowcaseData({
    debouncedQuery,
    selectedCategory,
    selectedStore,
    localeCode,
    userHasAccount,
    t,
  });

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
    const save = () => saveShowcaseStateNow({ query, selectedCategory, selectedStore, showFilters, pathname });
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
    return () => { cancelled = true; window.clearTimeout(t1); };
  }, [initialUiState, navigationType, pathname]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isOutsideMobile = searchRef.current ? !searchRef.current.contains(target) : true;
      const isOutsideDesktop = desktopSearchRef.current ? !desktopSearchRef.current.contains(target) : true;
      if (isOutsideMobile && isOutsideDesktop) setShowDropdown(false);
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

  const savePrefsState = useCallback((next: typeof prefs) => { setPrefsState(next); idle(() => setPrefs(next)); }, []);

  const handleProductClick = useCallback((item: ProductItem) => {
    const next = { categories: bumpScore(prefs.categories, item.category, 3), stores: bumpScore(prefs.stores, item.storeSlug, 4), products: bumpScore(prefs.products, item.id, 2), searches: prefs.searches };
    setPrefsState(next); idle(() => setPrefs(next));
    saveShowcaseStateNow({ query, selectedCategory, selectedStore, showFilters, pathname });

    const matchedStore = stores.find(s => s.slug === item.storeSlug) as (StoreItem & { currency?: string }) | undefined;
    const originalRow = rows.find(r => r.id === item.id) as any;
    
    const productState = { 
      id: item.id, 
      name: originalRow?.name || item.name, 
      category: originalRow?.category || item.category, 
      price: originalRow?.price ?? item.price, 
      unit: originalRow?.unit || item.unit || "un", 
      full_description: originalRow?.full_description || originalRow?.description || item.description || "", 
      main_image: originalRow?.main_image || originalRow?.image_url || item.image || "", 
      gallery: originalRow?.gallery || (item.gallery?.length ? item.gallery : item.image ? [item.image] : []), 
      store_id: matchedStore?.id || item.storeSlug,
      has_discount: item.hasDiscount,
      original_price: item.originalPrice,
      final_price: item.finalPrice,
      discount_percent: item.discountPercent
    };

    const storeState = matchedStore ? { 
      id: matchedStore.id, slug: matchedStore.slug, name: matchedStore.name, whatsapp_number: matchedStore.whatsapp_number || null, 
      currency: matchedStore.currency || item.currency || FALLBACK_CURRENCY,
      settings: matchedStore.settings || { currency: item.currency || FALLBACK_CURRENCY }, 
      logo_url: matchedStore.logoUrl || "", description: matchedStore.description || "" 
    } : { 
      id: item.storeSlug, slug: item.storeSlug, name: item.storeName, whatsapp_number: item.storeWhatsApp || null, 
      currency: item.currency || FALLBACK_CURRENCY, settings: { currency: item.currency || FALLBACK_CURRENCY }, 
      logo_url: item.storeLogo || "", description: item.storeDescription || "" 
    };

    navigate(`/${item.storeSlug}/blog/${item.id}`, { 
      state: { product: productState, store: storeState, source: debouncedQuery.trim() ? "search" : "feed", searchMode: searchAnalysis.mode } 
    });
  }, [navigate, prefs, stores, rows, debouncedQuery, searchAnalysis, query, selectedCategory, selectedStore, showFilters, pathname]);

  const handleStoreClick = useCallback((slug: string) => {
    const store = stores.find(s => s.slug === slug) as (StoreItem & { currency?: string }) | undefined;
    const next = { categories: prefs.categories, stores: bumpScore(prefs.stores, slug, 5), products: prefs.products, searches: prefs.searches };
    setPrefsState(next); idle(() => setPrefs(next));
    saveShowcaseStateNow({ query, selectedCategory, selectedStore, showFilters, pathname });

    const storeState = store ? { 
      id: store.id, slug: store.slug, name: store.name, whatsapp_number: store.whatsapp_number || null, 
      currency: store.currency || FALLBACK_CURRENCY, settings: store.settings || { }, 
      logo_url: store.logoUrl || "", description: store.description || "" 
    } : undefined;

    navigate(`/${slug}`, { state: { store: storeState, source: debouncedQuery.trim() ? "search" : "feed", searchMode: searchAnalysis.mode } });
  }, [navigate, prefs, stores, debouncedQuery, searchAnalysis, query, selectedCategory, selectedStore, showFilters, pathname]);

  const submitSearch = useCallback((value?: string) => {
    const term = (value ?? query).trim(); if (!term) return;
    pushHistory(term); setHistoryState(getHistory());
    const next = { ...prefs, searches: bumpScore(prefs.searches, normalizeText(term), 2) };
    savePrefsState(next); setQuery(term); setShowDropdown(false);
  }, [prefs, query, savePrefsState]);

  const clearSearchAndFilters = useCallback(() => { setQuery(""); setSelectedCategory("all"); setSelectedStore("all"); }, []);

  const refreshShowcaseCache = useCallback(async () => {
    clearStorelyCache(); 
    queryClient.invalidateQueries({ queryKey: ["storely-public-smart-v9"] }); 
    await refetch(); 
  }, [queryClient, refetch]);

  const handleCategoryRailLeft = useCallback(() => { smoothScrollBy(categoryRailRef.current, -CATEGORY_SCROLL_STEP); }, []);
  const handleCategoryRailRight = useCallback(() => { smoothScrollBy(categoryRailRef.current, CATEGORY_SCROLL_STEP); }, []);

  if (isLoading && !rows.length) {
    return (
      <section className="w-full px-0 py-4">
        <div className="space-y-6 animate-pulse">
          <div className="h-14 lg:h-12 w-full rounded-2xl bg-zinc-200 dark:bg-zinc-800/80 mb-6" />
          <div className="px-2">
            <div className="h-6 w-1/3 rounded-md bg-zinc-200 dark:bg-zinc-800/80 mb-4" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="aspect-square w-full rounded-[1.4rem] bg-zinc-200 dark:bg-zinc-800/80" />
                  <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800/80" />
                  <div className="h-4 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800/80" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full px-0 py-4">
      <div ref={stickySentinelRef} className="h-px w-full" />
      
      <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:px-4 xl:px-6">

        {!isEditorRoute && (
          <ShowcaseMobileHeader
            query={query} setQuery={setQuery} setShowDropdown={setShowDropdown} showDropdown={showDropdown}
            submitSearch={submitSearch} searchSuggestions={searchSuggestions} limitedHistory={limitedHistory}
            showFilters={showFilters} setShowFilters={setShowFilters} horizontalCategories={horizontalCategories}
            selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
            selectedStore={selectedStore} setSelectedStore={setSelectedStore} stores={stores}
            clearSearchAndFilters={clearSearchAndFilters} refreshShowcaseCache={refreshShowcaseCache}
            isFetching={isFetching} isCompact={isCompact} categoryRailRef={categoryRailRef}
            handleCategoryRailLeft={handleCategoryRailLeft} handleCategoryRailRight={handleCategoryRailRight} t={t}
          />
        )}

        {!isEditorRoute && (
          <ShowcaseSidebar
            query={query} setQuery={setQuery} setShowDropdown={setShowDropdown} showDropdown={showDropdown}
            submitSearch={submitSearch} searchSuggestions={searchSuggestions} limitedHistory={limitedHistory}
            horizontalCategories={horizontalCategories} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
            selectedStore={selectedStore} setSelectedStore={setSelectedStore} stores={stores}
            searchStatusText={searchStatusText} totalRows={rows.length} clearSearchAndFilters={clearSearchAndFilters}
            refreshShowcaseCache={refreshShowcaseCache} isFetching={isFetching} t={t}
          />
        )}

        <div className="flex-1 min-w-0 space-y-6 w-full pb-8">
          {deferredSections.map((section) => {
            if (section.type === "products-grid") {
              return (
                <section key={section.id} className="px-2">
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
        .custom-v-scroll::-webkit-scrollbar { width: 4px; }
        .custom-v-scroll::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 9999px; }
        .dark .custom-v-scroll::-webkit-scrollbar-thumb { background: #3f3f46; }
      `}</style>
    </section>
  );
};

export default ShowcaseStores;