import { useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAdminStore } from "../../../hooks/useAdminStore";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";
import { Loader2, Package, Search, Plus, Target, X, RotateCcw } from "lucide-react";
import { useTranslate } from "../../../context/LanguageContext";
import { LayoutGrid, LayoutList } from "../../produtos/layouts";

const LIMITS = { category: 12, title: 30, description: 100 };
const FONT_SIZE_MAP = {
  small: { title: "text-xl md:text-2xl", desc: "text-xs md:text-sm" },
  base: { title: "text-2xl md:text-3xl", desc: "text-sm md:text-base" },
  medium: { title: "text-3xl md:text-4xl", desc: "text-base md:text-lg" },
  large: { title: "text-4xl md:text-5xl", desc: "text-lg md:text-xl" },
};

export type SectionStyles = {
  theme?: 'dark' | 'light';
  align?: 'center' | 'left' | 'justify';
  fontSize?: 'small' | 'medium' | 'large' | 'base';
  cols?: string | number;
};

interface ShowcaseProps {
  content: { title?: string; category?: string; description?: string; };
  style: SectionStyles;
  onUpdate?: (field: string, value: string) => void;
}

export function ProductShowcase({ content, style, onUpdate }: ShowcaseProps) {
  const { t } = useTranslate();
  const { data: store } = useAdminStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { storeSlug, pageSlug } = useParams();
  
  const isDark = style?.theme === 'dark';
  const isReadOnly = !location.pathname.includes('/editor/');

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(() => t("common_all"));
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const selectedSize = FONT_SIZE_MAP[style?.fontSize as keyof typeof FONT_SIZE_MAP || 'medium'];

  // Handlers otimizados
  const handleTextChange = useCallback((field: string, value: string, limit: number) => {
    const sanitized = value.replace(/[\n\r]/g, "").slice(0, limit);
    onUpdate?.(field, sanitized);
  }, [onUpdate]);

  const preventEnter = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") e.preventDefault();
  }, []);

  const { data: products, isLoading } = useQuery({
    queryKey: ["public-products", store?.id],
    queryFn: async () => {
      if (!store?.id) return [];
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", store?.id)
        .eq("is_active", true);
      return data || [];
    },
    enabled: !!store?.id,
    staleTime: 1000 * 60 * 5, // Cache de 5 minutos para performance
  });

 // Estados de Filtro
 

  // Funções para Limpar Filtros
  const clearFilters = useCallback(() => {
    setSelectedCategory(t("common_all"));
    setMaxPrice(null);
    setSearchTerm("");
  }, [t]);

 

  const absoluteMaxPrice = useMemo(() => {
    if (!products?.length) return 10000;
    return Math.max(...products.map(p => p.price));
  }, [products]);

  const categories = useMemo(() => {
    const cats = products?.map(p => p.category).filter(Boolean) || [];
    return [t("common_all"), ...Array.from(new Set(cats))];
  }, [products, t]);

  const displayProducts = useMemo(() => {
    if (!products) return [];
    const term = searchTerm.toLowerCase();
    const filtered = products.filter(p => {
      const matchesSearch = !term || p.name.toLowerCase().includes(term);
      const matchesCategory = selectedCategory === t("common_all") || p.category === selectedCategory;
      const matchesPrice = maxPrice === null ? true : p.price <= maxPrice;
      return matchesSearch && matchesCategory && matchesPrice;
    });
    return showAll || filtered.length <= 6 ? filtered : filtered.slice(0, 6);
  }, [products, searchTerm, selectedCategory, maxPrice, showAll, t]);

  const hasActiveFilters = selectedCategory !== t("common_all") || maxPrice !== null || searchTerm !== "";

  const handleProductClick = useCallback((productId: string) => {
    if (!isReadOnly) return;
    navigate(`/${storeSlug}/${pageSlug || "home"}/${productId}`);
  }, [isReadOnly, navigate, storeSlug, pageSlug]);

  const alignClass = style?.align === 'center' ? 'text-center items-center' : 'text-left items-start';
  
  const inputBaseClass = isReadOnly 
    ? "bg-transparent border-none p-0 m-0 resize-none focus:ring-0 cursor-default overflow-hidden block pointer-events-none" 
    : "w-full transition-all duration-200 border-b border-transparent hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50/50 dark:hover:bg-white/5 focus:bg-transparent focus:border-blue-500 focus:ring-0 outline-none px-1 py-0.5 cursor-edit";

  return (
    <section className={`py-12 px-6 transition-colors duration-500 ${isDark ? 'bg-[#0a0a0a] text-zinc-100' : 'bg-white text-slate-900'}`}>
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <header className={`mb-8 flex flex-col w-full ${alignClass}`}>
          <div className={`flex flex-col gap-1 w-full max-w-3xl ${style?.align === 'center' ? 'mx-auto' : ''}`}>
            
            <div className="relative group w-fit">
              <input
                readOnly={isReadOnly}
                value={content?.category || ""}
                onKeyDown={preventEnter}
                onChange={(e) => handleTextChange("category", e.target.value, LIMITS.category)}
                placeholder={t("showcase_defaultCategory")}
                className={`${inputBaseClass} ${style?.align === 'center' ? 'text-center' : ''} text-blue-500 dark:text-blue-400 font-bold text-[10px] uppercase tracking-[0.2em]`}
              />
            </div>

            <div className="relative group w-full">
              <textarea
                readOnly={isReadOnly}
                value={content?.title || ""}
                onKeyDown={preventEnter}
                onChange={(e) => handleTextChange("title", e.target.value, LIMITS.title)}
                placeholder={t("showcase_defaultTitle")}
                rows={1}
                className={`${inputBaseClass} ${style?.align === 'center' ? 'text-center' : ''} ${selectedSize?.title} font-extrabold tracking-tight leading-tight uppercase resize-none`}
              />
            </div>

            <div className="relative group w-full mt-1">
              <textarea
                readOnly={isReadOnly}
                value={content?.description || ""}
                onKeyDown={preventEnter}
                onChange={(e) => handleTextChange("description", e.target.value, LIMITS.description)}
                placeholder={t("showcase_defaultDescription")}
                rows={2}
                className={`${inputBaseClass} ${style?.align === 'center' ? 'text-center mx-auto' : ''} ${selectedSize?.desc} text-zinc-500 dark:text-zinc-400 font-medium leading-snug max-w-2xl resize-none`}
              />
            </div>
          </div>
        </header>

        {/* FILTROS */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className={`flex items-center gap-3 flex-1 px-5 py-3 rounded-2xl border ${isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-slate-50 border-slate-100'}`}>
              <Search size={18} className="opacity-40" />
              <input 
                type="text" 
                value={searchTerm}
                placeholder={t("showcase_searchPlaceholder")}
                className="bg-transparent border-none outline-none w-full text-sm font-semibold"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && <button onClick={() => setSearchTerm("")}><X size={14} /></button>}
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${
                    selectedCategory === cat ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20" : isDark ? "bg-zinc-900 border-zinc-800 text-zinc-400" : "bg-white border-slate-200 text-slate-500"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* RANGE DE PREÇO */}
          <div className={`grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-6 px-6 py-4 rounded-3xl border ${isDark ? 'bg-zinc-900/20 border-zinc-800' : 'bg-slate-50/30 border-slate-100'}`}>
             <div className="flex items-center gap-3">
                <Target size={16} className="text-blue-600" />
                <span className="text-[10px] font-bold uppercase opacity-60">{t("showcase_maxPrice")}</span>
             </div>
             <input 
                type="range" min="0" max={absoluteMaxPrice} 
                value={maxPrice ?? absoluteMaxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full appearance-none accent-blue-600 cursor-pointer"
             />
             <div className={`flex items-center border rounded-xl px-3 py-2 min-w-[100px] ${isDark ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <span className="text-xs mr-1 opacity-40">R$</span>
              <input 
                type="text"
                value={maxPrice === null ? "" : maxPrice}
                placeholder={t("filter_unlimited")}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setMaxPrice(val === "" ? null : Number(val));
                }}
                className="bg-transparent font-bold text-sm w-full outline-none text-center"
              />
            </div>
          </div>
        </div>

        {/* BARRA DE FILTROS ATIVOS (NOVIDADE) */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-8 animate-in fade-in slide-in-from-top-1">
            <span className="text-[10px] font-black uppercase tracking-tighter opacity-40 mr-2">{t("showcase_filter_active")}</span>
            
            {selectedCategory !== t("common_all") && (
              <button 
                onClick={() => setSelectedCategory(t("common_all"))}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[10px] font-bold text-blue-500 hover:bg-blue-500/20 transition-all"
              >
                {selectedCategory} <X size={12} />
              </button>
            )}

            {maxPrice !== null && (
              <button 
                onClick={() => setMaxPrice(null)}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[10px] font-bold text-blue-500 hover:bg-blue-500/20 transition-all"
              >
                {t("showcase_price_up_to").replace("{{price}}", String(maxPrice))} <X size={12} />
              </button>
            )}

            <button 
              onClick={clearFilters}
              className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold opacity-60 hover:opacity-100 transition-all"
            >
              <RotateCcw size={12} /> {t("showcase_clear_all")}
            </button>
          </div>
        )}

        {/* LISTAGEM */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
          ) : (
            <>
              {Number(style?.cols) === 1 ? (
                <LayoutList products={displayProducts} onAction={handleProductClick} isDark={isDark} t={t} />
              ) : (
                <LayoutGrid products={displayProducts} onAction={handleProductClick} cols={Number(style?.cols) || 3} isDark={isDark} t={t} />
              )}

              {!showAll && (products?.length || 0) > 6 && (
                <div className="mt-12 flex justify-center">
                  <button 
                    onClick={() => setShowAll(true)} 
                    className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all active:scale-95 ${
                      isDark ? 'bg-white text-black hover:bg-zinc-100' : 'bg-zinc-900 text-white hover:bg-black'
                    }`}
                  >
                    <Plus size={16} /> {t("showcase_viewFull")}
                  </button>
                </div>
              )}
            </>
          )}

          {!isLoading && displayProducts.length === 0 && (
            <div className="text-center py-20 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
              <Package size={40} className="mx-auto mb-4 opacity-10 text-zinc-500" />
              <p className="text-xs font-bold uppercase tracking-widest opacity-40">{t("showcase_empty")}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}