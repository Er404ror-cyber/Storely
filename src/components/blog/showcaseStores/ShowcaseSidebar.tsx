import React, { useEffect } from "react";
import { Search, X, Filter, RefreshCw, LayoutGrid, Store } from "lucide-react";
import type { StoreItem } from "../../../types/Marketplace";

interface ShowcaseSidebarProps {
  query: string;
  setQuery: (val: string) => void;
  setShowDropdown: (val: boolean) => void;
  showDropdown: boolean;
  submitSearch: (val?: string) => void;
  searchSuggestions: Array<{ type: "product" | "store" | "category"; value: string }>;
  limitedHistory: Array<{ value: string; ts: number }>;
  horizontalCategories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedStore: string;
  setSelectedStore: (store: string) => void;
  stores: StoreItem[];
  searchStatusText: string;
  totalRows: number;
  clearSearchAndFilters: () => void;
  refreshShowcaseCache: () => void;
  isFetching: boolean;
  t: (key: string) => string;
}

export const ShowcaseSidebar = React.memo(({
  query,
  setQuery,
  setShowDropdown,
  showDropdown,
  submitSearch,
  searchSuggestions,
  limitedHistory,
  horizontalCategories,
  selectedCategory,
  setSelectedCategory,
  selectedStore,
  setSelectedStore,
  stores,
  searchStatusText,
  totalRows,
  clearSearchAndFilters,
  refreshShowcaseCache,
  isFetching,
  t,
}: ShowcaseSidebarProps) => {
  const hasActiveFilters = query || selectedCategory !== "all" || selectedStore !== "all";

  // Efeito de scroll adaptado para Desktop / Mobile
  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    const targetTop = isMobile ? 450 : 415;

    window.scrollTo({ 
      top: targetTop, 
      behavior: "smooth" 
    });
  }, [query, selectedCategory, selectedStore]);

  return (
    <aside className="hidden lg:flex flex-col w-[260px] xl:w-[280px] shrink-0 sticky top-24 space-y-6 rounded-[1.8rem] border border-zinc-200 bg-white/50 p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/50 h-max max-h-[85vh] overflow-hidden ">
      
      {/* Header do Painel */}
      <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-900 pb-3">
        <Filter size={15} className="text-zinc-400 dark:text-zinc-500" />
        <h2 className="text-[11px] font-black uppercase tracking-[0.15em]">{t("storely_filters_search") || "Filtros & Busca"}</h2>
      </div>

      {/* Input de Pesquisa Desktop */}
      <div className="relative z-50">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => {
            setTimeout(() => setShowDropdown(false), 200);
          }}
          onKeyDown={(e) => { if (e.key === "Enter") submitSearch(); }}
          placeholder={t("storely_search_placeholder")}
          className="w-full rounded-2xl border border-zinc-200 bg-white pl-10 pr-10 font-semibold text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-700 h-11 text-xs"
        />
        {query && (
          <button 
            type="button" 
            onClick={() => { setQuery(""); submitSearch(""); }} 
            className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center justify-center h-7 w-7 rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <X size={14} />
          </button>
        )}

        {/* Dropdown de Sugestões */}
        {showDropdown && (searchSuggestions.length > 0 || limitedHistory.length > 0) && (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] overflow-hidden rounded-[1.35rem] border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            {searchSuggestions.length > 0 && (
              <div className="p-2">
                <p className="px-2 pb-1 text-[8px] font-black uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">{t("storely_suggestions")}</p>
                <div className="space-y-1">
                  {searchSuggestions.map((item, idx) => (
                    <button 
                      key={`desktop-sug-${idx}`} 
                      type="button" 
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setQuery(item.value);
                        submitSearch(item.value);
                        setShowDropdown(false);
                      }} 
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/60"
                    >
                      <span className="truncate">{item.value}</span>
                      <span className="ml-3 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">{item.type}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Categorias */}
      <div className="space-y-2.5 flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center gap-1.5 px-1 text-zinc-400 dark:text-zinc-500">
          <LayoutGrid size={13} />
          <h3 className="text-[10px] font-black uppercase tracking-[0.12em]">{t("storely_categories")}</h3>
        </div>
        
        <div className="flex flex-col gap-1 overflow-y-auto pr-1 custom-v-scroll pb-2 flex-1 max-h-[220px]">
          {horizontalCategories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={`desktop-cat-${cat}`}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150 ${
                  isSelected 
                    ? "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-sm font-bold translate-x-0.5" 
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                {cat === "all" ? t("storely_all") : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lojas */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 px-1 text-zinc-400 dark:text-zinc-500">
          <Store size={13} />
          <h3 className="text-[10px] font-black uppercase tracking-[0.12em]">{t("storely_stores")}</h3>
        </div>
        <div className="relative">
          <select 
            value={selectedStore} 
            onChange={(e) => setSelectedStore(e.target.value)} 
            className="w-full h-10 rounded-xl border border-zinc-200 bg-white/80 dark:bg-zinc-900 dark:border-zinc-800 px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none shadow-sm transition-colors focus:border-zinc-300 dark:focus:border-zinc-700 cursor-pointer appearance-none"
          >
            {/* Adicionado bg-zinc-900 nas options para forçar fundo correto no dark mode de navegadores Chromium */}
            <option value="all" className="dark:bg-zinc-900">{t("storely_all_stores")}</option>
            {stores.map(st => <option key={`desktop-st-${st.slug}`} value={st.slug} className="dark:bg-zinc-900">{st.name}</option>)}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 border-l border-r-4 border-b-4 border-transparent border-t-zinc-400 dark:border-t-zinc-500 h-0 w-0" />
        </div>
      </div>

      {/* Footer / Status */}
      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 space-y-3 mt-auto">
        <div className="flex flex-wrap gap-1.5">
          {searchStatusText && (
            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              {searchStatusText}
            </span>
          )}
          <span className="rounded-md bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {totalRows} {t("storely_products")}
          </span>
             <span className="rounded-md bg-zinc-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">{stores.length} {t("storely_stores")}</span>
              </div>
        
        <div className="flex items-center gap-2 pt-1">
          {hasActiveFilters && (
            <button 
              type="button" 
              onClick={clearSearchAndFilters} 
              className="flex-1 h-9 items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 text-[9px] font-black uppercase tracking-[0.12em] text-red-600 transition dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
            >
              {t("storely_clear")}
            </button>
          )}
          <button 
            type="button" 
            onClick={refreshShowcaseCache} 
            disabled={isFetching} 
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition disabled:opacity-50 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
          </button>
        </div>
      </div>
    </aside>
  );
});

ShowcaseSidebar.displayName = "ShowcaseSidebar";