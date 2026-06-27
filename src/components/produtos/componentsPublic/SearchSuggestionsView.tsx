import React from "react";
import { ListFilter } from "lucide-react";
import { SearchCategoryCard } from "./SearchCategoryCard";
import { MOCK_GLOBAL_CATEGORIES, type MockCategory } from "./SearchMocks";

interface SearchSuggestionsViewProps {
  showGlobalCats: boolean;
  categories: any[];
  // Ajustada a assinatura para aceitar a função estrita do useTranslate sem conflitos
  t: (key: any, variables?: any) => string; 
  isDark: boolean;
  onToggleGlobal: () => void;
  onSelectCategory: (name: string) => void;
}

export const SearchSuggestionsView = React.memo(function SearchSuggestionsView({
  showGlobalCats,
  categories,
  t,
  isDark,
  onToggleGlobal,
  onSelectCategory
}: SearchSuggestionsViewProps) {
  return (
    <div className="animate-in fade-in zoom-in-[0.99] duration-150 transform-gpu">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-zinc-500" : "text-slate-400"}`}>
          {showGlobalCats ? t("search_global_categories" as any) || "Categorias Globais" : t("search_in_store" as any) || "Nesta Loja"}
        </h3>
        <button 
          onClick={onToggleGlobal}
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-blue-500 hover:text-blue-400 bg-blue-500/10 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer transform-gpu active:scale-95"
        >
          <ListFilter size={11} /> 
          {showGlobalCats ? t("search_see_local" as any) || "Ver Locais" : t("search_see_global" as any) || "Outras Lojas"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {showGlobalCats ? (
          MOCK_GLOBAL_CATEGORIES.map((cat: MockCategory, idx: number) => (
            <SearchCategoryCard
              key={cat.slug + idx}
              // Usa t() dinâmico na nameKey convertida em any e passa a searchQuery como instruído para o filtro interno
              name={t(cat.nameKey as any) || cat.slug}
              emoji={cat.emoji}
              color={cat.color}
              index={idx}
              onClick={() => onSelectCategory(cat.searchQuery)}
            />
          ))
        ) : categories.length > 0 ? (
          categories.map((cat: any, idx: number) => (
            <SearchCategoryCard
              key={cat.searchKey + idx}
              name={cat.name}
              emoji={cat.emoji || "📦"}
              color={cat.color}
              index={idx}
              onClick={() => onSelectCategory(cat.name)}
            />
          ))
        ) : (
          <div className={`col-span-2 text-center py-8 rounded-xl border border-dashed ${
            isDark ? "border-zinc-800 text-zinc-600" : "border-slate-200 text-slate-400"
          }`}>
            <p className="text-xs font-medium">{t("search_no_categories" as any) || "Nenhuma categoria carregada localmente."}</p>
          </div>
        )}
      </div>
    </div>
  );
});