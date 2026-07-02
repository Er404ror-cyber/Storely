import React from "react";
import { Globe, Loader2, Search } from "lucide-react";
import { SearchResultCard } from "./SearchResultCard";

interface SearchResultsViewProps {
  localResults: any[];
  globalProducts: any[];
  isLoadingGlobal: boolean;
  triggerGlobal: boolean;
  deferredTerm: string;
  storeCurrency: string;
  isDark: boolean; // Mantido apenas para compatibilidade de assinatura se necessário
  t: (key: any, variables?: any) => string;
  onTriggerGlobal: () => void;
  onNavigateProduct: (slug: string, id: string) => void;
  activeStoreSlug?: string;
}

export const SearchResultsView = React.memo(function SearchResultsView({
  localResults,
  globalProducts,
  isLoadingGlobal,
  triggerGlobal,
  deferredTerm,
  storeCurrency,
  t,
  onTriggerGlobal,
  onNavigateProduct,
  activeStoreSlug
}: SearchResultsViewProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-150 transform-gpu">
      <div>
        <h3 className="mb-3 px-1 text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          {t("search_local_results" as any) || "Artigos da Loja"}
        </h3>
        
        {localResults.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
            {localResults.map(p => (
              <SearchResultCard
                key={p.id}
                product={p}
                currency={storeCurrency}
                onClick={() => activeStoreSlug && onNavigateProduct(activeStoreSlug, p.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl py-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/10 text-zinc-400 dark:text-zinc-600">
             <p className="text-xs font-semibold">{t("search_no_local_results" as any) || "Nenhum artigo encontrado nesta loja."}</p>
          </div>
        )}
      </div>

      {deferredTerm.length >= 2 && (
        <div className="pt-5 border-t border-zinc-200/60 dark:border-zinc-900">
          <h3 className="mb-3 flex items-center gap-2 px-1 text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            <Globe size={12} /> {t("search_global_title" as any) || "Explorar o Ecossistema"}
            {isLoadingGlobal && <Loader2 size={12} className="animate-spin text-zinc-500" />}
          </h3>
          
          {!triggerGlobal ? (
            <button
              onClick={onTriggerGlobal}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-black uppercase tracking-wider transition-all transform-gpu cursor-pointer border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 active:scale-[0.98]"
            >
              <Search size={14} /> 
              {t("search_global_button" as any) || "Pesquisar fora desta loja"}
            </button>
          ) : globalProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 animate-in fade-in duration-200">
              {globalProducts.map((p: any) => {
                const storeData = Array.isArray(p.stores) ? p.stores[0] : p.stores;
                return (
                  <SearchResultCard
                    key={p.id}
                    product={p}
                    currency={storeCurrency}
                    isGlobal={true}
                    onClick={() => storeData?.slug && onNavigateProduct(storeData.slug, p.id)}
                  />
                )
              })}
            </div>
          ) : !isLoadingGlobal ? (
             <div className="rounded-xl py-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/10 text-zinc-400 dark:text-zinc-600">
               <p className="text-xs font-semibold">{t("search_no_global_results" as any) || "Nenhum resultado global encontrado."}</p>
             </div>
          ) : null}
        </div>
      )}
    </div>
  );
});