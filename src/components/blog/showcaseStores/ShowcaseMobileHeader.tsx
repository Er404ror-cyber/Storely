import React  from "react";
import { Search, SlidersHorizontal, X, RefreshCw, Clock3 } from "lucide-react";
import { RailControls } from "../UIHelpers";

interface ShowcaseMobileHeaderProps {
  query: string;
  setQuery: (val: string) => void;
  setShowDropdown: (val: boolean) => void;
  showDropdown: boolean;
  submitSearch: (val?: string) => void;
  searchSuggestions: Array<{ type: "product" | "store" | "category"; value: string }>;
  limitedHistory: Array<{ value: string; ts: number }>;
  showFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  horizontalCategories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedStore: string;
  setSelectedStore: (store: string) => void;
  stores: Array<{ slug: string; name: string }>;
  clearSearchAndFilters: () => void;
  refreshShowcaseCache: () => void;
  isFetching: boolean;
  isCompact: boolean;
  categoryRailRef: React.RefObject<HTMLDivElement | null>;
  handleCategoryRailLeft: () => void;
  handleCategoryRailRight: () => void;
  t: (key: string) => string;
}

export const ShowcaseMobileHeader = React.memo(({
  query,
  setQuery,
  setShowDropdown,
  showDropdown,
  submitSearch,
  searchSuggestions,
  limitedHistory,
  showFilters,
  setShowFilters,
  horizontalCategories,
  selectedCategory,
  setSelectedCategory,
  selectedStore,
  setSelectedStore,
  stores,
  clearSearchAndFilters,
  refreshShowcaseCache,
  isFetching,
  isCompact,
  categoryRailRef,
  handleCategoryRailLeft,
  handleCategoryRailRight,
  t,
}: ShowcaseMobileHeaderProps) => {
  const hasActiveFilters = query || selectedCategory !== "all" || selectedStore !== "all";

  return (
    <div className={`lg:hidden sticky top-17 z-20 border-zinc-200 bg-white/90 p-3 pb-2 dark:border-zinc-800 dark:bg-zinc-950/85 mb-4 ${isCompact ? "shadow-sm" : ""}`}>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => {
                // CORREÇÃO: Delay para dar tempo de computar o clique nas sugestões antes de sumir
                setTimeout(() => setShowDropdown(false), 200);
              }}
              onKeyDown={(e) => { if (e.key === "Enter") submitSearch(); }}
              placeholder={t("storely_search_placeholder")}
              className="w-full rounded-full border border-zinc-200 bg-zinc-50 pl-10 pr-24 font-semibold text-zinc-900 outline-none transition dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 h-10 text-base md:text-[12px]"
            />
            <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
              {query && (
                <button type="button" onClick={() => { setQuery(""); submitSearch(""); }} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-200/70 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
                  <X size={14} />
                </button>
              )}
              <button type="button" onClick={() => submitSearch()} className="inline-flex h-8 items-center justify-center rounded-full bg-zinc-950 px-3 text-[10px] font-black uppercase tracking-[0.12em] text-white dark:bg-white dark:text-zinc-900">
                {t("storely_search")}
              </button>
            </div>

            {showDropdown && (searchSuggestions.length > 0 || limitedHistory.length > 0) && (
              <div className="absolute left-0 right-0 top-[calc(100%+10px)] overflow-hidden rounded-[1.35rem] border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
                {/* Sugestões de Pesquisa */}
                {searchSuggestions.length > 0 && (
                  <div className="p-2">
                    <p className="px-2 pb-1 text-[8px] font-black uppercase tracking-[0.12em] text-zinc-400">{t("storely_suggestions")}</p>
                    <div className="space-y-1">
                      {searchSuggestions.map((item, idx) => (
                        <button 
                          key={`mob-sug-${idx}`} 
                          type="button" 
                          // CORREÇÃO: Intercepta o evento antes do desfoque nativo do mobile acontecer
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setQuery(item.value);
                            submitSearch(item.value);
                            setShowDropdown(false);
                          }} 
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
                        >
                          <span className="truncate">{item.value}</span>
                          <span className="ml-3 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-400">{item.type}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Histórico Recente */}
                {!query && limitedHistory.length > 0 && (
                  <div className="border-t border-zinc-100 p-2 dark:border-zinc-900">
                    <p className="px-2 pb-1 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-400">{t("storely_recent_searches")}</p>
                    <div className="space-y-1">
                      {limitedHistory.map((item, idx) => (
                        <button 
                          key={`mob-hist-${idx}`} 
                          type="button" 
                          // CORREÇÃO: Aplicação no histórico para funcionar ao clicar nos itens passados
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setQuery(item.value);
                            submitSearch(item.value);
                            setShowDropdown(false);
                          }} 
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
                        >
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
          <button type="button" onClick={() => setShowFilters(prev => !prev)} className="inline-flex shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 h-10 w-10">
            <SlidersHorizontal size={16} />
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-col gap-1 mt-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[10px] font-black uppercase tracking-[0.12em] text-zinc-400">{t("storely_categories")}</div>
              <RailControls onLeft={handleCategoryRailLeft} onRight={handleCategoryRailRight} ariaLabel={t("storely_categories")} />
            </div>
            <div ref={categoryRailRef} className="overflow-x-auto pb-1 scrollbar-hide">
              <div className="flex min-w-max items-center gap-2">
                {horizontalCategories.map((cat) => (
                  <button key={`mob-cat-${cat}`} type="button" onClick={() => setSelectedCategory(cat)} className={`shrink-0 rounded-full px-3 py-2 text-[8px] font-black uppercase tracking-[0.12em] transition ${selectedCategory === cat ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-900" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"}`}>
                    {cat === "all" ? t("storely_all") : cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)} className="h-10 rounded-full border border-zinc-200 bg-white px-3 text-[10px] font-semibold text-zinc-700 outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                <option value="all">{t("storely_all_stores")}</option>
                {stores.map(st => <option key={`mob-st-${st.slug}`} value={st.slug}>{st.name}</option>)}
              </select>
              {hasActiveFilters && (
                <button type="button" onClick={clearSearchAndFilters} className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-200 px-3 text-[8px] font-black uppercase bg-red-100 dark:bg-red-950/40 tracking-[0.12em] text-red-700 dark:border-zinc-800 dark:text-red-400">{t("storely_clear")}</button>
              )}
              <button type="button" onClick={refreshShowcaseCache} disabled={isFetching} className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-200 px-4 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-600 disabled:opacity-60 dark:border-zinc-800 dark:text-zinc-300">
                <RefreshCw size={10} className={isFetching ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

ShowcaseMobileHeader.displayName = "ShowcaseMobileHeader";