import { useState, useEffect, useDeferredValue, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, X } from "lucide-react";

import { useTranslate } from "../../../context/LanguageContext";
import { supabase } from "../../../lib/supabase";
import { getCategoryStyle, normalizeCategory, getSmartSynonyms } from "../../../utils/categories";
import { STORE_CACHE_TTL } from "../../../utils/storeCache"; 
import { readCache, writeCache, cacheKey, CACHE_VERSION } from "../../../utils/text";

// Importações Modulares Nativas
import { SearchSuggestionsView } from "./SearchSuggestionsView";
import { SearchResultsView } from "./SearchResultsView";
import { SearchInputField } from "./SearchInputField";
import { MOCK_GLOBAL_CATEGORIES } from "./SearchMocks";

interface FloatingSearchProps {
  currentStoreId: string;
  storeCurrency: string;
  activeStoreSlug?: string;
  theme?: "light" | "dark"; // Mantido para compatibilidade se necessário nas assinaturas
}

export function FloatingSearch({ currentStoreId, storeCurrency, activeStoreSlug }: FloatingSearchProps) {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const isProductsRoute = location.pathname.includes('/products');
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const deferredTerm = useDeferredValue(searchTerm);
  
  const [triggerGlobal, setTriggerGlobal] = useState(false);
  const [showGlobalCats, setShowGlobalCats] = useState(false);

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

  // Query Local Passiva (Zero Chamadas API)
  const { data: localProducts = [] } = useQuery({
    queryKey: ["search-local-products-list", currentStoreId],
    queryFn: () => {
      const cached = readCache<any[]>(targetCacheKey, activeStoreSlug);
      if (cached) return cached;

      const liveCatalogData = queryClient.getQueryData<any[]>([
        "catalog-products-full", 
        currentStoreId, 
        storeCurrency
      ]);

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

  // Query Global Autorizada (Única com fetch de rede para outras lojas)
  const { data: globalProducts = [], isLoading: isLoadingGlobal } = useQuery({
    queryKey: ["search-global-products-list", smartQueryString],
    queryFn: async () => {
      if (!smartQueryString) return [];
      const key = cacheKey("search_global_products", CACHE_VERSION, smartQueryString);
      const cached = readCache<any[]>(key, activeStoreSlug);
      if (cached) return cached;

      const { data, error } = await supabase
        .from("products")
        .select(`id, name, price, main_image, store_id, stores ( slug, name )`)
        .neq("store_id", currentStoreId)
        .eq("is_active", true)
        .or(smartQueryString)
        .limit(12);
        
      if (error) return [];
      const finalData = data || [];
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
    const categoryMap = new Map<string, string>();
    localProducts.forEach(p => {
      if (!p.category) return;
      const norm = normalizeCategory(p.category);
      if (!categoryMap.has(norm)) categoryMap.set(norm, p.category);
    });

    return Array.from(categoryMap.entries()).map(([norm, original]) => {
      const style = getCategoryStyle(norm);
      return { name: original, searchKey: norm, ...style };
    });
  }, [localProducts]);
 
  const localResults = useMemo(() => {
    if (!deferredTerm) return [];
    
    const cleanString = (str: string) => 
      str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

    const cleanTerm = cleanString(deferredTerm);
    if (!cleanTerm) return [];

    const synonyms = getSmartSynonyms(cleanTerm).map(syn => cleanString(syn));
    
    const fuzzyMatch = (target: string, query: string) => {
      if (target.includes(query) || query.includes(target)) return true;
      if (query.length >= 4) {
        const partialQuery = query.substring(0, Math.floor(query.length * 0.8));
        return target.includes(partialQuery);
      }
      return false;
    };

    return localProducts.filter(p => {
      const targetStr = cleanString(`${p.name} ${p.category} ${p.description || ""}`);
      
      const hasDirectMatch = synonyms.some(syn => targetStr.includes(syn)) || 
                             fuzzyMatch(targetStr, cleanTerm);
                             
      if (hasDirectMatch) return true;

      const productCategoryLower = cleanString(p.category || "");
      
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
    if (slug) navigate(`/${slug}/products/${id}`);
  }, [handleClose, navigate]);

  const handleToggleGlobal = useCallback(() => setShowGlobalCats(p => !p), []);
  const handleSelectCategory = useCallback((name: string) => setSearchTerm(name), []);
  const handleTriggerGlobal = useCallback(() => setTriggerGlobal(true), []);
  const handleClearInput = useCallback(() => setSearchTerm(""), []);

  if (!isProductsRoute) return null;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[99999] flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 transform-gpu cursor-pointer bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-950 border border-zinc-200/10 dark:border-zinc-800/40"
      >
        <Search size={22} />
      </button>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-[99999] flex flex-col transition-colors duration-200 isolation-isolate h-[100dvh] overflow-hidden select-none bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100"
    >
      {/* Top Header Fixo Premium - Escopo nativo de Tailwind cascata */}
      <div className="flex shrink-0 items-center justify-between px-6 py-4 border-b backdrop-blur-md transform-gpu border-zinc-200/60 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80 text-zinc-800 dark:text-zinc-100">
        <h2 className="text-base font-black tracking-widest uppercase">{t("search_title") || "Pesquisa"}</h2>
        <button 
          onClick={handleClose} 
          className="rounded-full p-2 transition-all duration-200 active:scale-90 transform-gpu cursor-pointer bg-zinc-200/50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800"
        >
          <X size={16} />
        </button>
      </div>

      {/* Área Central de Scroll */}
      <div className="flex-1 overflow-y-auto px-4 py-6 no-scrollbar overscroll-contain">
        {!deferredTerm ? (
          <SearchSuggestionsView
            showGlobalCats={showGlobalCats}
            categories={categories}
            t={t as any}
            isDark={document.documentElement.classList.contains("dark")} // Passa dinamicamente olhando o DOM nativo caso os filhos dependam disso
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
            isDark={document.documentElement.classList.contains("dark")}
            t={t as any}
            onTriggerGlobal={handleTriggerGlobal}
            onNavigateProduct={handleNavigate}
            activeStoreSlug={activeStoreSlug}
          />
        )}
      </div>

      {/* Área de Entrada Inferior Imune ao Teclado Móvel */}
      <SearchInputField
        searchTerm={searchTerm}
        isDark={document.documentElement.classList.contains("dark")}
        placeholder={t("search_placeholder") || "O que procuras hoje?..."}
        onChangeTerm={setSearchTerm}
        onClear={handleClearInput}
      />
    </div>
  );
}