import { useState, useEffect, useDeferredValue, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Loader2, Store, Globe, ListFilter } from "lucide-react";
import { useTranslate } from "../../../context/LanguageContext";
import { supabase } from "../../../lib/supabase";
import { getCategoryStyle, normalizeCategory, getSmartSynonyms, CATEGORY_SYNONYMS } from "../../../utils/categories";

interface FloatingSearchProps {
  currentStoreId: string;
  storeCurrency: string;
  activeStoreSlug?: string;
}

export function FloatingSearch({ currentStoreId, storeCurrency, activeStoreSlug }: FloatingSearchProps) {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const deferredTerm = useDeferredValue(searchTerm);
  
  const [triggerGlobal, setTriggerGlobal] = useState(false);
  const [showGlobalCats, setShowGlobalCats] = useState(false);

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

  // 1. Busca Local
  const { data: localProducts = [] } = useQuery({
    queryKey: ["search-local", currentStoreId],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("id, name, price, category, main_image, description").eq("store_id", currentStoreId).eq("is_active", true);
      return data || [];
    },
    enabled: isOpen,
    staleTime: 1000 * 60 * 60,
  });

  // 2. Inteligência Semântica (Cria Query Dinâmica)
  const smartQueryString = useMemo(() => {
    if (deferredTerm.length < 2) return "";
    const synonyms = getSmartSynonyms(deferredTerm);
    
    // Constrói uma query "OR" que procura o termo ou sinónimos no nome, categoria E descrição
    return synonyms.map(word => 
      `name.ilike.%${word}%,category.ilike.%${word}%,description.ilike.%${word}%`
    ).join(',');
  }, [deferredTerm]);

  // 3. Busca Global (Avançada, leve, sem inner)
  const { data: globalProducts = [], isLoading: isLoadingGlobal } = useQuery({
    queryKey: ["search-global", smartQueryString],
    queryFn: async () => {
      if (!smartQueryString) return [];
      
      const { data, error } = await supabase
        .from("products")
        .select(`id, name, price, main_image, store_id, stores ( slug, name )`)
        .neq("store_id", currentStoreId)
        .eq("is_active", true)
        .or(smartQueryString) // Injeção da IA (multi-línguas/sinónimos/descrição)
        .limit(15);
        
      if (error) return [];
      return data || [];
    },
    enabled: triggerGlobal && deferredTerm.length >= 2,
    staleTime: 1000 * 60 * 5,
  });

  // Categorias Locais
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

  // Busca Local em tempo real
  const localResults = useMemo(() => {
    if (!deferredTerm) return [];
    const synonyms = getSmartSynonyms(deferredTerm);
    
    return localProducts.filter(p => {
      const targetStr = `${p.name} ${p.category} ${p.description || ""}`.toLowerCase();
      return synonyms.some(syn => targetStr.includes(syn));
    });
  }, [localProducts, deferredTerm]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setSearchTerm(""), 300);
  }, []);

  const handleNavigate = useCallback((slug: string, id: string) => {
    handleClose();
    if(slug) navigate(`/${slug}/products/${id}`);
  }, [handleClose, navigate]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[99999] flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-2xl shadow-slate-900/50 hover:scale-105 active:scale-95 transition-transform transform-gpu"
        aria-label="Pesquisar"
      >
        <Search size={24} />
      </button>
    );
  }

  return (
    // NOTA: top-[70px] ou top-16 baixa a janela para não tapar o teu header
    <div className="fixed inset-x-0 bottom-0 top-16 z-[99999] flex flex-col bg-black/95  animate-in fade-in duration-300 rounded-t-3xl border-t border-white/10" style={{ isolation: 'isolate' }}>
      
      {/* HEADER DA PESQUISA */}
      <div className="flex shrink-0 items-center justify-between px-6 py-6 pb-2">
        <h2 className="text-2xl font-black tracking-tight text-white">{t("search_title") || "Search"}</h2>
        <button onClick={handleClose} className="rounded-full bg-white/10 p-2 text-white active:scale-90 transition-transform">
          <X size={20} />
        </button>
      </div>

      {/* ÁREA DE SCROLL */}
      <div className="flex-1 overflow-y-auto px-2 pb-20 no-scrollbar" style={{ overscrollBehavior: 'contain' }}>
        
        {/* ESTADO INICIAL (Sem pesquisa) */}
        {!deferredTerm ? (
          <div className="mt-6 animate-in fade-in zoom-in-[0.98] duration-300">
            
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                 {showGlobalCats ? "Global Categories" : (t("search_in_store") || "In this Store")}
               </h3>
               
               {/* Botão de explorar outras lojas (Categorias Globais baseadas nos nossos estilos base) */}
               <button 
                 onClick={() => setShowGlobalCats(!showGlobalCats)}
                 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 bg-blue-400/10 px-3 py-1.5 rounded-full"
               >
                 <ListFilter size={12} /> {showGlobalCats ? "Ver Locais" : "Explorar Outras Lojas"}
               </button>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
              {/* Se o utilizador quiser ver as globais, mostramos o dicionário todo, senão mostramos as locais */}
              {(showGlobalCats 
  ? Object.values(getCategoryStyle("")).map(() => Object.values(getCategoryStyle("tech"))) 
  : categories
).map((cat: any, idx) => {
                 // Hack para mostrar todas as categorias na view Global
                 const displayCat = showGlobalCats ? { name: Object.keys(CATEGORY_SYNONYMS)[idx] || "Mais", ...Object.values(getCategoryStyle(Object.keys(CATEGORY_SYNONYMS)[idx] || ""))[0] as any } : cat;
                 
                 if (!displayCat.name) return null;

                 return (
                  <button
                    key={displayCat.name + idx}
                    onClick={() => setSearchTerm(displayCat.name)}
                    className={`group relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-gradient-to-br ${displayCat.color || "from-slate-600 to-zinc-800"} p-4 text-left shadow-lg active:scale-95 transition-transform transform-gpu`}
                  >
                    <span className="absolute -bottom-2 -right-4 text-7xl opacity-20 transition-transform group-hover:scale-110 group-hover:-rotate-12">
                      {displayCat.emoji || "📦"}
                    </span>
                    <span className="absolute bottom-4 left-4 right-4 text-sm font-black text-white leading-tight shadow-black/50 drop-shadow-md line-clamp-2">
                      {displayCat.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-10 animate-in fade-in">
            
            {/* SUGESTÕES DE PESQUISA (Chips rápidos) */}
            {getSmartSynonyms(deferredTerm).length > 1 && (
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center mr-2">{t("search_suggestions") || "Suggest"}:</span>
                {getSmartSynonyms(deferredTerm).slice(0, 4).map(syn => (
                  <button key={syn} onClick={() => setSearchTerm(syn)} className="px-3 py-1 text-xs font-bold text-white bg-white/10 rounded-full hover:bg-white/20">
                    {syn}
                  </button>
                ))}
              </div>
            )}

            {/* Resultados Loja Atual */}
            {localResults.length > 0 ? (
              <div>
                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
                  {t("search_in_store") || "In this Store"}
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {localResults.map(p => (
                    <button 
                      key={p.id} 
                      onClick={() => activeStoreSlug && handleNavigate(activeStoreSlug, p.id)}
                      className="flex w-full items-center gap-4 rounded-2xl bg-white/5 p-3 text-left hover:bg-white/10 active:scale-[0.98] transition-all transform-gpu"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-800">
                        <img src={p.main_image} alt={p.name} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-bold text-white leading-tight">{p.name}</h4>
                        <p className="mt-1 text-xs font-black text-zinc-400 tracking-tight">{storeCurrency} {p.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/5 bg-white/5 py-6 text-center">
                 <p className="text-sm font-semibold text-zinc-500">Nenhum resultado nesta loja.</p>
              </div>
            )}

            {/* Busca Global Manual e Dinâmica */}
            {deferredTerm.length >= 2 && (
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                  <Globe size={14} /> {t("search_global_title") || "Other Stores"}
                  {isLoadingGlobal && <Loader2 size={12} className="animate-spin text-zinc-400" />}
                </h3>
                
                {!triggerGlobal ? (
                  <button
                    onClick={() => setTriggerGlobal(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-5 text-sm font-bold text-blue-400 active:scale-[0.98] transition-transform"
                  >
                    <Search size={16} /> 
                    {t("search_global_btn") || "Search global for"} "{deferredTerm}"
                  </button>
                ) : globalProducts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 animate-in fade-in">
                    {globalProducts.map((p: any) => {
                      const storeData = Array.isArray(p.stores) ? p.stores[0] : p.stores;
                      return (
                      <button 
                        key={p.id} 
                        onClick={() => storeData?.slug && handleNavigate(storeData.slug, p.id)}
                        className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-zinc-900/50 p-3 text-left hover:bg-zinc-800 active:scale-[0.98] transition-all transform-gpu"
                      >
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-800">
                          <img src={p.main_image} alt={p.name} className="absolute inset-0 h-full w-full object-cover opacity-80" loading="lazy" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-bold text-white leading-tight">{p.name}</h4>
                          <p className="mt-1 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                            <Store size={10} /> {storeData?.name || "Loja Externa"}
                          </p>
                        </div>
                      </button>
                    )})}
                  </div>
                ) : !isLoadingGlobal ? (
                   <div className="rounded-2xl border border-white/5 bg-white/5 py-10 text-center">
                     <p className="text-sm font-semibold text-zinc-500">{t("search_no_results") || "No results found."}</p>
                   </div>
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>

      {/* INPUT FLUTUANTE INFERIOR */}
      <div className="absolute bottom-0 left-0 right-0 z-10  bg-black/0  pb-4 px-4  md:border-none md:bg-gradient-to-t md:from-black md:to-transparent md:p-8">
        <div className="mx-auto flex max-w-2xl items-center gap-3 rounded-full  bg-black/80  border-white/20  p-2 pr-4 shadow-2xl  border  focus-within:bg-white/15 focus-within:border-white/50 transition-all transform-gpu">
          <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded-full  bg-white/10 text-white">
            <Search size={20} />
          </div>
          <input
            autoFocus
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("search_placeholder") || "Pesquisar (ex: Snack, Roupa...)"}
            className="w-full bg-transparent   text-base md:text-lg font-semibold text-white placeholder-zinc-100 outline-none"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="text-zinc-400 hover:text-white shrink-0 active:scale-90 p-2 transition-transform">
              <X size={20} />
            </button>
          )}
        </div>
      </div>

    </div>
  );
}