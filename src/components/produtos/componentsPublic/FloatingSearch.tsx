import { useState, useEffect, useDeferredValue, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, X } from "lucide-react";

import { useTranslate } from "../../../context/LanguageContext";
import { supabase } from "../../../lib/supabase";
import { getCategoryStyle, normalizeCategory, getSmartSynonyms } from "../../../utils/categories";
import { STORE_CACHE_TTL } from "../../../utils/storeCache"; 
import { readCache, writeCache, cacheKey, CACHE_VERSION } from "../../../utils/text";
import { useProductIntelligence } from "../../../utils/ProductIntelligence"; 

import { SearchSuggestionsView } from "./SearchSuggestionsView";
import { SearchResultsView } from "./SearchResultsView";
import { SearchInputField } from "./SearchInputField";
import { MOCK_GLOBAL_CATEGORIES } from "./SearchMocks";

interface FloatingSearchProps {
  currentStoreId: string;
  storeCurrency: string;
  activeStoreSlug?: string;
  theme?: "light" | "dark"; 
}

function getTypoDistance(a: string, b: string, maxLimit = 2): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  
  if (Math.abs(a.length - b.length) > maxLimit) return maxLimit + 1;
  
  let prevRow = Array.from({ length: b.length + 1 }, (_, i) => i);
  let currRow = new Array(b.length + 1);
  
  for (let i = 0; i < a.length; i++) {
    currRow[0] = i + 1;
    for (let j = 0; j < b.length; j++) {
      const cost = a[i] === b[j] ? 0 : 1;
      currRow[j + 1] = Math.min(
        currRow[j] + 1,       
        prevRow[j + 1] + 1,   
        prevRow[j] + cost     
      );
    }
    const temp = prevRow;
    prevRow = currRow;
    currRow = temp;
  }
  return prevRow[b.length];
}

export function FloatingSearch({ currentStoreId, storeCurrency, activeStoreSlug }: FloatingSearchProps) {
  const { t } = useTranslate();
  const { enrichProductsIntelligently } = useProductIntelligence();
  
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const isProductsRoute = location.pathname.includes('/products');
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const deferredTerm = useDeferredValue(searchTerm);
  
  const [triggerGlobal, setTriggerGlobal] = useState(false);
  const [showGlobalCats, setShowGlobalCats] = useState(false);

  // DETETAR NAVEGAÇÃO EXTERNA PARA ABRIR AUTOMATICAMENTE
  useEffect(() => {
    const state = location.state as any;
    if (state?.openSearch && isProductsRoute) {
      setIsOpen(true);
      navigate(location.pathname, { replace: true, state: { ...state, openSearch: false } });
    }
  }, [location.state, isProductsRoute, navigate, location.pathname]);

  const targetCacheKey = useMemo(() => {
    return cacheKey("store_catalog", CACHE_VERSION, currentStoreId);
  }, [currentStoreId]);

  const smartQueryString = useMemo(() => {
    if (deferredTerm.length < 2) return "";
    const synonyms = getSmartSynonyms(deferredTerm);
    return synonyms.map(word => 
      `name.ilike.%${word}%,category.ilike.%${word}%,description.ilike.%${word}%`
    ).join(',');
  }, [deferredTerm]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = '';
      setTriggerGlobal(false);
      setShowGlobalCats(false);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    setTriggerGlobal(false);
  }, [deferredTerm]);

  const { data: rawLocalProducts = [] } = useQuery({
    queryKey: ["search-local-products-list", currentStoreId],
    queryFn: () => {
      const stateProducts = (location.state as any)?.initialProducts;
      if (stateProducts && Array.isArray(stateProducts) && stateProducts.length > 0) {
        writeCache(targetCacheKey, stateProducts, activeStoreSlug);
        queryClient.setQueryData(["catalog-products-full", currentStoreId, storeCurrency], stateProducts);
        return stateProducts;
      }

      const cached = readCache<any[]>(targetCacheKey, activeStoreSlug);
      if (cached && cached.length > 0) return cached;

      const liveCatalogData = queryClient.getQueryData<any[]>(["catalog-products-full", currentStoreId, storeCurrency]);
      if (liveCatalogData && liveCatalogData.length > 0) {
        writeCache(targetCacheKey, liveCatalogData, activeStoreSlug);
        return liveCatalogData;
      }
      
      return [];
    },
    enabled: isOpen && isProductsRoute,
    staleTime: STORE_CACHE_TTL,
    gcTime: STORE_CACHE_TTL,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const localProducts = useMemo(() => {
    if (rawLocalProducts.length > 0 && !rawLocalProducts[0].metadata) {
      return enrichProductsIntelligently(rawLocalProducts);
    }
    return rawLocalProducts;
  }, [rawLocalProducts, enrichProductsIntelligently]);

  const { data: globalProducts = [], isLoading: isLoadingGlobal } = useQuery({
    queryKey: ["search-global-products-list", smartQueryString],
    queryFn: async () => {
      if (!smartQueryString) return [];
      const key = cacheKey("search_global_products", CACHE_VERSION, smartQueryString);
      const cached = readCache<any[]>(key, activeStoreSlug);
      if (cached) return cached;

      const { data, error } = await supabase
        .from("products")
        .select(`id, name, price, discount_percent, main_image, store_id, stores ( slug, name )`)
        .neq("store_id", currentStoreId)
        .eq("is_active", true)
        .or(smartQueryString)
        .limit(12);
        
      if (error) return [];
      
      // OTIMIZAÇÃO: Cálculo de descontos processado em memória (Custo de CPU praticamente 0ms para 12 items)
      const finalData = (data || []).map((row: any) => {
        const basePrice = row.price ? Number(row.price) : 0;
        const discPercent = row.discount_percent ? Number(row.discount_percent) : 0;
        const hasDiscount = discPercent > 0;
        const finalPrice = hasDiscount ? basePrice - (basePrice * (discPercent / 100)) : basePrice;

        return {
          ...row,
          hasDiscount,
          originalPrice: hasDiscount ? basePrice : null,
          finalPrice,
          discountPercent: hasDiscount ? discPercent : null,
        };
      });

      writeCache(key, finalData, activeStoreSlug);
      return finalData;
    },
    enabled: triggerGlobal && deferredTerm.length >= 2 && isProductsRoute,
    staleTime: STORE_CACHE_TTL,
    gcTime: STORE_CACHE_TTL,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const categories = useMemo(() => {
    const categoryMap = new Map<string, { name: string; image: string | null }>();
    
    localProducts.forEach(p => {
      const parent = p.metadata?.parentCategory;
      const child = p.metadata?.subCategory;
      const prodImage = p.main_image || null; 
      
      if (parent) {
        const normParent = normalizeCategory(parent);
        if (!categoryMap.has(normParent) || (categoryMap.has(normParent) && !categoryMap.get(normParent)?.image)) {
          categoryMap.set(normParent, { name: parent, image: prodImage });
        }
      }
      if (child) {
        const normChild = normalizeCategory(child);
        if (!categoryMap.has(normChild) || (categoryMap.has(normChild) && !categoryMap.get(normChild)?.image)) {
          categoryMap.set(normChild, { name: child, image: prodImage });
        }
      }
    });

    return Array.from(categoryMap.entries()).map(([norm, data]) => {
      const style = getCategoryStyle(data.name);
      return { 
        name: data.name, 
        searchKey: norm, 
        emoji: style.emoji,
        color: style.color,
        image: data.image
      };
    });
  }, [localProducts]);

  const activeSuggestions = useMemo(() => {
    if (deferredTerm.length < 2) return [];
    
    const cleanString = (str: string) => 
      str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

    const cleanTerm = cleanString(deferredTerm);
    const queryWords = cleanTerm.split(/\s+/).filter(w => w.length > 0);

    const fuzzyMatchField = (fieldValue: string) => {
      const fieldClean = cleanString(fieldValue);
      if (!fieldClean) return false;
      if (fieldClean.includes(cleanTerm)) return true;
      const fieldWords = fieldClean.split(/\s+/);
      return queryWords.every(qWord => {
        const maxErrors = qWord.length <= 4 ? 1 : 2;
        return fieldWords.some(fWord => {
          if (fWord.startsWith(qWord)) return true;
          if (Math.abs(qWord.length - fWord.length) > maxErrors + 2) return false;
          const fWordPrefix = fWord.substring(0, qWord.length);
          if (getTypoDistance(fWordPrefix, qWord, maxErrors) <= maxErrors) return true;
          return getTypoDistance(fWord, qWord, maxErrors) <= maxErrors;
        });
      });
    };

    const matches = [];
    const seen = new Set<string>();

    for (const p of localProducts) {
      const searchableFields = [
        p.name, 
        p.metadata?.subCategory, 
        p.metadata?.parentCategory,
        p.metadata?.gender,
        ...(p.metadata?.attributes || [])
      ].filter(Boolean);

      for (const field of searchableFields) {
        if (fuzzyMatchField(field)) {
          const fieldClean = field.trim();
          if (!seen.has(fieldClean)) {
            seen.add(fieldClean);
            matches.push(fieldClean);
          }
        }
      }
      if (matches.length >= 6) break; 
    }

    return matches;
  }, [localProducts, deferredTerm]);
 
  const localResults = useMemo(() => {
    if (!deferredTerm) return [];
    
    const cleanString = (str: string) => 
      str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

    const cleanTerm = cleanString(deferredTerm);
    if (!cleanTerm) return [];

    const synonyms = getSmartSynonyms(cleanTerm).map(syn => cleanString(syn));
    
    const fuzzyMatch = (target: string, query: string) => {
      if (!target) return false;
      if (target.includes(query) || query.includes(target)) return true;
      if (query.length >= 4) {
        const partialQuery = query.substring(0, Math.floor(query.length * 0.8));
        return target.includes(partialQuery);
      }
      return false;
    };

    return localProducts.filter(p => {
      const metadataValues = p.metadata ? [
        p.metadata.parentCategory,
        p.metadata.subCategory,
        p.metadata.gender,
        ...(p.metadata.sizes || []),
        ...(p.metadata.attributes || [])
      ].join(" ") : "";

      const targetStr = cleanString(`${p.name} ${p.category} ${p.description || ""} ${metadataValues}`);
      
      const hasDirectMatch = synonyms.some(syn => targetStr.includes(syn)) || 
                             fuzzyMatch(targetStr, cleanTerm);
                             
      if (hasDirectMatch) return true;

      const productCategoryLower = cleanString(p.metadata?.subCategory || p.category || "");
      const matchedCategory = MOCK_GLOBAL_CATEGORIES.find(cat => 
        cleanString(cat.searchQuery) === productCategoryLower || 
        cleanString(cat.slug) === productCategoryLower ||
        cleanString(t(cat.nameKey as any)) === productCategoryLower
      );

      if (matchedCategory) {
        return matchedCategory.keywords.some(keyword => {
          const cleanKeyword = cleanString(keyword);
          return (
            fuzzyMatch(cleanKeyword, cleanTerm) ||
            synonyms.some(syn => fuzzyMatch(cleanKeyword, syn))
          );
        });
      }

      return false;
    });
  }, [localProducts, deferredTerm, t]);
  
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setSearchTerm(""), 300);
  }, []);

  const handleNavigate = useCallback((slug: string, id: string) => {
    handleClose();
    if (slug) {
      const clickedProduct = localProducts.find(p => p.id === id) || globalProducts.find(p => p.id === id);

      navigate(`/${slug}/products/${id}`, {
        state: {
          fromStore: true,
          product: clickedProduct,
          initialProducts: localProducts, 
          storeCurrency: storeCurrency,
          effectiveStoreId: currentStoreId
        }
      });
    }
  }, [handleClose, navigate, localProducts, globalProducts, storeCurrency, currentStoreId]);

  const handleToggleGlobal = useCallback(() => setShowGlobalCats(p => !p), []);
  const handleSelectCategory = useCallback((name: string) => setSearchTerm(name), []);
  const handleTriggerGlobal = useCallback(() => setTriggerGlobal(true), []);
  const handleClearInput = useCallback(() => setSearchTerm(""), []);

  if (!isProductsRoute) return null;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[20] flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-950 border border-zinc-200/10 dark:border-zinc-800/40 "
      >
        <Search size={22} />
      </button>
    );
  }

  const isDark = document.documentElement.classList.contains("dark");

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col transition-colors duration-200 isolation-isolate h-[100dvh] overflow-hidden select-none bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 ">
      <div className="order-1 flex shrink-0 items-center justify-between px-6 py-4 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-950/40 text-zinc-800 dark:text-zinc-100">
        <h2 className="text-base font-black tracking-widest uppercase opacity-90">{t("search_title") || "Pesquisa"}</h2>
        <button 
          onClick={handleClose} 
          className="rounded-full p-2 transition-colors active:scale-90 cursor-pointer bg-zinc-200/40 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/80 dark:hover:bg-zinc-800"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>

      <div className="order-2 lg:order-3 z-20 shrink-0 bg-transparent ">
        <SearchInputField
          searchTerm={searchTerm}
          isDark={isDark}
          placeholder={t("search_placeholder") || "O que procuras hoje?..."}
          suggestions={activeSuggestions}
          onChangeTerm={setSearchTerm}
          t={t as any}
          onSelectSuggestion={(val) => setSearchTerm(val)}
          onClear={handleClearInput}
        />
      </div>

      <div className="order-3 md:order-2 flex-1 overflow-y-auto px-4 py-6 no-scrollbar overscroll-contain ">
        {!deferredTerm ? (
          <SearchSuggestionsView
            showGlobalCats={showGlobalCats}
            categories={categories}
            t={t as any}
            isDark={isDark}
            onToggleGlobal={handleToggleGlobal}
            onSelectCategory={handleSelectCategory}
          />
        ) : (
          <SearchResultsView
            localResults={localResults}
            globalProducts={globalProducts}
            isLoadingGlobal={isLoadingGlobal}
            triggerGlobal={triggerGlobal}
            deferredTerm={deferredTerm}
            storeCurrency={storeCurrency}
            isDark={isDark}
            t={t as any}
            onTriggerGlobal={handleTriggerGlobal}
            onNavigateProduct={handleNavigate} 
            activeStoreSlug={activeStoreSlug}
          />
        )}
      </div>
    </div>
  );
}