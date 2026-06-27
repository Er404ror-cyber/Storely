import { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Package, Sparkles } from "lucide-react";

import { LayoutGrid, LayoutList, ProductShowcaseSkeleton } from "../../produtos/layouts";
import { useTranslate } from "../../../context/LanguageContext";
import { supabase } from "../../../lib/supabase";
import { useAdminStore } from "../../../hooks/useAdminStore";

import { safeText, cacheKey, readCache, writeCache,  CACHE_VERSION } from "../../../utils/text";
import { STORE_CACHE_TTL } from "../../../utils/storeCache";

// ==========================================
// CONFIGURAÇÃO DE LIMITES & AMOCONTROL
// ==========================================
const EDITOR_PREVIEW_LIMIT = 5; 
const MAX_TITLE = 60;
const MAX_SUBTITLE = 120;

export type SectionStyles = {
  theme?: "dark" | "light";
  align?: "center" | "left" | "justify";
  cols?: string | number;
  fontSize?: "small" | "base" | "medium" | "large";
};

export interface CatalogProps {
  content: { title?: string; subtitle?: string; empty_text?: string };
  style: SectionStyles;
  storeId?: string;
  store_id?: string;
  section?: any;
  // CORREÇÃO: Usando o mesmo padrão de nomenclatura e payload do ProductShowcase
  onUpdate?: (field: string, value: string) => void;
}

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  main_image: string;
  created_at?: string;
  currency: string;
  store_id: string;
};

const HERO_PALETTES = {
  dark: [
    { bg: "bg-[#110d1a]", border: "border-purple-900/30", badge: "bg-purple-500/10 text-purple-300 border-purple-800/20" },
    { bg: "bg-[#061414]", border: "border-teal-900/30", badge: "bg-teal-500/10 text-teal-300 border-teal-800/20" },
    { bg: "bg-[#16100b]", border: "border-amber-900/30", badge: "bg-amber-500/10 text-amber-300 border-amber-800/20" },
    { bg: "bg-[#080d1a]", border: "border-indigo-900/30", badge: "bg-indigo-500/10 text-indigo-300 border-indigo-800/20" },
    { bg: "bg-[#140b10]", border: "border-pink-900/30", badge: "bg-pink-500/10 text-pink-300 border-pink-800/20" },
    { bg: "bg-[#06140b]", border: "border-emerald-900/30", badge: "bg-emerald-500/10 text-emerald-300 border-emerald-800/20" },
    { bg: "bg-[#1c0d0d]", border: "border-red-900/30", badge: "bg-red-500/10 text-red-300 border-red-800/20" },
    { bg: "bg-[#121315]", border: "border-zinc-800/40", badge: "bg-zinc-700/30 text-zinc-300 border-zinc-700/20" },
    { bg: "bg-gradient-to-br from-purple-950/20 via-zinc-950 to-[#050505]", border: "border-purple-500/10", badge: "bg-purple-500/10 text-purple-300 border-purple-500/20" },
    { bg: "bg-gradient-to-br from-teal-950/20 via-zinc-950 to-[#050505]", border: "border-teal-500/10", badge: "bg-teal-500/10 text-teal-300 border-teal-500/20" },
    { bg: "bg-gradient-to-br from-amber-950/15 via-zinc-950 to-[#050505]", border: "border-amber-500/10", badge: "bg-amber-500/10 text-amber-300 border-amber-500/20" },
    { bg: "bg-gradient-to-br from-indigo-950/20 via-zinc-950 to-[#050505]", border: "border-indigo-500/10", badge: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20" }
  ],
  light: [
    { bg: "bg-purple-50/50", border: "border-purple-100/70", badge: "bg-purple-100/90 text-black border-purple-200" },
    { bg: "bg-teal-50/50", border: "border-teal-100/70", badge: "bg-teal-100/90 text-black border-teal-200" },
    { bg: "bg-amber-50/40", border: "border-amber-100/70", badge: "bg-amber-100/90 text-black border-amber-200" },
    { bg: "bg-sky-50/50", border: "border-sky-100/70", badge: "bg-sky-100/90 text-black border-sky-200" },
    { bg: "bg-rose-50/40", border: "border-rose-100/70", badge: "bg-rose-100/90 text-black border-rose-200" },
    { bg: "bg-emerald-50/40", border: "border-emerald-100/70", badge: "bg-emerald-100/90 text-black border-emerald-200" },
    { bg: "bg-orange-50/40", border: "border-orange-100/70", badge: "bg-orange-100/90 text-black border-orange-200" },
    { bg: "bg-zinc-50/60", border: "border-zinc-200/60", badge: "bg-zinc-200/90 text-black border-zinc-300/60" },
    { bg: "bg-gradient-to-br from-purple-50/40 via-zinc-50/20 to-white", border: "border-purple-100", badge: "bg-purple-100 text-black border-purple-200" },
    { bg: "bg-gradient-to-br from-teal-50/40 via-zinc-50/20 to-white", border: "border-teal-100", badge: "bg-teal-100 text-black border-teal-200" },
    { bg: "bg-gradient-to-br from-amber-50/30 via-zinc-50/10 to-white", border: "border-amber-100", badge: "bg-amber-100 text-black border-amber-200" },
    { bg: "bg-gradient-to-br from-indigo-50/40 via-zinc-50/20 to-white", border: "border-indigo-100", badge: "bg-blue-100 text-black border-blue-200" }
  ]
};

const FONT_SIZE_MAPS = {
  small: {
    title: "text-base sm:text-lg md:text-xl font-bold",
    subtitle: "text-[11px] leading-normal"
  },
  base: {
    title: "text-lg sm:text-xl md:text-2xl font-extrabold",
    subtitle: "text-xs leading-relaxed"
  },
  medium: {
    title: "text-xl sm:text-2xl md:text-3xl font-black",
    subtitle: "text-xs sm:text-sm leading-relaxed"
  },
  large: {
    title: "text-2xl sm:text-3xl md:text-4xl font-black tracking-tight",
    subtitle: "text-sm leading-relaxed"
  }
};

export function ProductsCatalog(props: CatalogProps) {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const location = useLocation();
  const { storeSlug, pageSlug } = useParams();
  
  const isEditor = location.pathname.includes("/editor/");
  const isReadOnly = !isEditor;
  const isDark = props.style?.theme === "dark";
  const allLabel = t("common_all") || "Todos";

  // Fallbacks estáticos traduzidos
  const fallbackTitle = useMemo(() => t("catalog_default_title") || "Catálogo Completo", [t]);
  const fallbackSubtitle = useMemo(() => t("catalog_default_subtitle") || "Confira os nossos produtos disponíveis", [t]);

  const [selectedCategory, setSelectedCategory] = useState<string>(allLabel);
 /* const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);*/

  const [editableTitle, setEditableTitle] = useState(props.content?.title || fallbackTitle);
  const [editableSubtitle, setEditableSubtitle] = useState(props.content?.subtitle || fallbackSubtitle);

  useEffect(() => {
    setEditableTitle(props.content?.title || fallbackTitle);
    setEditableSubtitle(props.content?.subtitle || fallbackSubtitle);
  }, [props.content, fallbackTitle, fallbackSubtitle]);

  const layoutCols = Math.min(Math.max(Number(props.style?.cols) || 4, 1), 4);
  const sizePreference = props.style?.fontSize || "base";
  const currentFonts = FONT_SIZE_MAPS[sizePreference];

  const { data: adminStore } = useAdminStore();

  const { data: publicStore, isLoading: isLoadingPublicStore } = useQuery({
    queryKey: ["catalog-public-store-info", storeSlug],
    queryFn: async () => {
      if (!storeSlug) return null;
      const key = cacheKey("storely_public_store", CACHE_VERSION, storeSlug);
      const cached = readCache<{ id: string; currency: string | null; slug: string }>(key, storeSlug);
      if (cached) return cached;

      const { data, error } = await supabase.from("stores").select("id, currency, slug").eq("slug", storeSlug).maybeSingle();
      if (error || !data) return null;

      const safeStore = { id: String(data.id), currency: data.currency ? String(data.currency) : null, slug: String(data.slug) };
      writeCache(key, safeStore, storeSlug);
      return safeStore;
    },
    enabled: Boolean(storeSlug && isReadOnly),
    staleTime: STORE_CACHE_TTL,
  });

  const effectiveStoreId = isReadOnly 
    ? (publicStore?.id || props.storeId || props.store_id || props.section?.store_id)
    : (props.storeId || props.store_id || props.section?.store_id || adminStore?.id);

  const storeCurrency = isReadOnly ? (publicStore?.currency || "MZN") : (adminStore?.currency || "MZN");
  const activeStoreSlug = isReadOnly ? (storeSlug || publicStore?.slug) : adminStore?.slug;

  const designPalette = useMemo(() => {
    if (!effectiveStoreId) return isDark ? HERO_PALETTES.dark[0] : HERO_PALETTES.light[0];
    let hash = 0;
    for (let i = 0; i < effectiveStoreId.length; i++) {
      hash = effectiveStoreId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % HERO_PALETTES[isDark ? "dark" : "light"].length;
    return HERO_PALETTES[isDark ? "dark" : "light"][index];
  }, [effectiveStoreId, isDark]);

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["catalog-products-full", effectiveStoreId, storeCurrency],
    queryFn: async () => {
      if (!effectiveStoreId) return [];
      const key = cacheKey("store_catalog", CACHE_VERSION, effectiveStoreId);
      const cached = readCache<Product[]>(key, activeStoreSlug);
      if (cached) return cached;

      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, category, main_image, created_at, store_id")
        .eq("store_id", effectiveStoreId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) return [];

      const mapped = (data || []).map((product) => ({
        id: String(product.id),
        name: safeText(product.name, 70),
        price: Number(product.price) || 0,
        category: safeText(product.category, 40) || t("common_general") || "Geral",
        main_image: product.main_image || "",
        created_at: product.created_at,
        store_id: String(product.store_id),
        currency: storeCurrency,
      })) as Product[];

      writeCache(key, mapped, activeStoreSlug);
      return mapped;
    },
    enabled: !!effectiveStoreId,
    staleTime: STORE_CACHE_TTL,
  });

  const isLoading = (isLoadingPublicStore || isLoadingProducts) && products.length === 0;

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return [allLabel, ...Array.from(set)];
  }, [products, allLabel]);

  const displayProducts = useMemo(() => {
    const filtered = (isReadOnly && selectedCategory !== allLabel)
      ? products.filter(p => p.category === selectedCategory)
      : products;
    
    if (isEditor) {
      return filtered.slice(0, EDITOR_PREVIEW_LIMIT);
    }
    
    return filtered/*.slice(0, visibleCount)*/;
  }, [products, selectedCategory,/* visibleCount, */ allLabel, isReadOnly, isEditor]);

 /* const totalFiltered = (isReadOnly && selectedCategory !== allLabel)
    ? products.filter(p => p.category === selectedCategory).length
    : products.length;*/

  const handleProductClick = useCallback((productId: string) => {
    if (isEditor || !activeStoreSlug) return;
    navigate(`/${activeStoreSlug}/${pageSlug || "products"}/${productId}`, { state: { fromStore: true } });
  }, [isEditor, activeStoreSlug, navigate, pageSlug]);

  const handleBlurText = (field: "title" | "subtitle", value: string) => {
    // Evita salvar strings em branco usando fallbacks obrigatórios
    let sanitized = value.trim();
    if (!sanitized) {
      sanitized = field === "title" ? fallbackTitle : fallbackSubtitle;
      if (field === "title") setEditableTitle(fallbackTitle);
      else setEditableSubtitle(fallbackSubtitle);
    }

    // CORREÇÃO: Chama o onUpdate enviando o campo e o valor (Ex: props.onUpdate("title", "Meu Título"))
    if (props.onUpdate) {
      props.onUpdate(field, sanitized);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>, maxLength: number) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain").slice(0, maxLength);
    document.execCommand("insertText", false, text);
  };

  if (!effectiveStoreId) return null;

  const alignClass = props.style?.align === 'center' 
    ? 'text-center items-center mx-auto' 
    : props.style?.align === 'justify' 
      ? 'text-left items-stretch w-full' 
      : 'text-left items-start';

  return (
    <>
      <section 
        className={`w-full overflow-hidden select-none subpixel-antialiased ${isDark ? "bg-[#050505] text-zinc-100" : "bg-white text-black"}`}
        style={{ 
          contentVisibility: 'auto', 
          containIntrinsicSize: '650px', 
          isolation: "isolate",
          transform: "translateZ(0)"
        }}
      >
        {/* INTRO HERO COMPACTA */}
        <div className={`relative w-full border-b px-4 py-6 md:px-8 md:py-10 flex flex-col justify-center transition-all duration-200 ${designPalette.bg} ${designPalette.border}`}>
          <div className="mx-auto w-full max-w-[1400px] relative z-10">
            <div className={`flex flex-col max-w-3xl ${alignClass}`}>
              
              <div className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest mb-3 shadow-sm ${designPalette.badge}`}>
                <Sparkles size={9} className="shrink-0" />
                <span>{t("catalog_collection") || "Coleção"}</span>
              </div>

              {/* TÍTULO EDITÁVEL E CONTROLADO */}
              <div className="w-full relative group mb-1.5 will-change-[transform,opacity]">
                <h2 
                  className={`transition-all outline-none ${currentFonts.title} ${
                    isDark ? "text-white" : "text-black"
                  } ${
                    isEditor 
                      ? "border border-dashed border-zinc-400/20 hover:border-amber-500/40 bg-amber-500/[0.01] focus:bg-amber-500/[0.03] rounded-lg px-2.5 py-1 cursor-text focus:border-solid focus:border-amber-500 focus:ring-1 focus:ring-amber-500/10" 
                      : ""
                  }`}
                  contentEditable={isEditor}
                  suppressContentEditableWarning={true}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.preventDefault();
                    if (e.currentTarget.textContent!.length >= MAX_TITLE && e.key !== "Backspace" && !e.key.startsWith("Arrow")) {
                      e.preventDefault();
                    }
                  }}
                  onPaste={(e) => handlePaste(e, MAX_TITLE)}
                  onBlur={(e) => {
                    const text = e.currentTarget.textContent?.slice(0, MAX_TITLE) || "";
                    const final = text.trim() || fallbackTitle;
                    setEditableTitle(final);
                    handleBlurText("title", final);
                  }}
                >
                  {editableTitle}
                </h2>
                {isEditor && (
                  <span className={`absolute right-2 bottom-0.5 text-[8px] font-mono opacity-30 pointer-events-none ${isDark ? "text-zinc-400" : "text-black"}`}>
                    {editableTitle.length}/{MAX_TITLE}
                  </span>
                )}
              </div>

              {/* DESCRIÇÃO EDITÁVEL E CONTROLADA */}
              <div className="w-full relative group will-change-[transform,opacity]">
                <p 
                  data-placeholder={t("catalog_add_description") || "Adicione uma descrição..."}
                  className={`transition-all outline-none font-medium empty:before:text-zinc-400/60 empty:before:content-[attr(data-placeholder)] ${currentFonts.subtitle} ${
                    isDark ? "text-zinc-400" : "text-zinc-800"
                  } ${
                    isEditor 
                      ? "border border-dashed border-zinc-400/20 hover:border-amber-500/40 bg-amber-500/[0.01] focus:bg-amber-500/[0.03] rounded-lg px-2.5 py-1 cursor-text focus:border-solid focus:border-amber-500 focus:ring-1 focus:ring-amber-500/10 min-h-[2em]" 
                      : ""
                  }`}
                  contentEditable={isEditor}
                  suppressContentEditableWarning={true}
                  onKeyDown={(e) => {
                    const currentText = e.currentTarget.innerText || "";
                    
                    // Permite apenas UMA quebra de linha real (máximo de 2 linhas textuais estruturadas)
                    if (e.key === "Enter") {
                      const lineCount = (currentText.match(/\n/g) || []).length;
                      if (lineCount >= 1) {
                        e.preventDefault();
                      }
                    }

                    if (currentText.length >= MAX_SUBTITLE && e.key !== "Backspace" && !e.key.startsWith("Arrow")) {
                      e.preventDefault();
                    }
                  }}
                  onPaste={(e) => handlePaste(e, MAX_SUBTITLE)}
                  onBlur={(e) => {
                    const text = e.currentTarget.innerText || "";
                    const final = text.trim() || fallbackSubtitle;
                    setEditableSubtitle(final);
                    handleBlurText("subtitle", final);
                  }}
                >
                  {editableSubtitle === fallbackSubtitle && isEditor ? "" : editableSubtitle}
                </p>
                {isEditor && (
                  <span className={`absolute right-2 bottom-0.5 text-[8px] font-mono opacity-30 pointer-events-none ${isDark ? "text-zinc-400" : "text-black"}`}>
                    {editableSubtitle.length}/{MAX_SUBTITLE}
                  </span>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* PRODUTOS LISTA/GRID */}
        <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8 md:py-10">
          
          {isReadOnly && !isLoading && categories.length > 1 && (
            <div className="mb-6 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1" style={{ transform: "translateZ(0)" }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => { setSelectedCategory(cat);
                    /* setVisibleCount(INITIAL_VISIBLE);*/ }}
                  className={`shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-all active:scale-[0.97] border ${
                    selectedCategory === cat 
                    ? (isDark ? "bg-white border-white text-black" : "bg-zinc-950 border-zinc-950 text-white shadow-xs") 
                    : (isDark ? "bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:bg-zinc-800/80" : "bg-white border-zinc-200 text-slate-600 hover:bg-zinc-50")
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* INDICADOR EXCLUSIVO DO EDITOR */}
          {isEditor && products.length > 0 && (
            <div className="mb-3.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 select-none pointer-events-none">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {t("catalog_layout_sample") || "Amostra de Layout"} ({displayProducts.length} {t("common_of") || "de"} {products.length} {t("catalog_actives") || "ativos"})
            </div>
          )}

          <div className="w-full grid grid-cols-1 min-h-[220px]" style={{ contain: "layout style" }}>
            {isLoading ? (
              <div className="w-full"><ProductShowcaseSkeleton cols={layoutCols} isDark={isDark} /></div>
            ) : (
              <div className="w-full animate-in fade-in duration-200 select-text">
                {layoutCols === 1 ? (
                  <LayoutList products={displayProducts} onAction={handleProductClick} isDark={isDark} t={t} />
                ) : (
                  <LayoutGrid products={displayProducts} onAction={handleProductClick} cols={layoutCols} isDark={isDark} t={t} />
                )}

                {/* BOTÃO CARREGAR MAIS APENAS EM MODO PÚBLICO 
                {isReadOnly && visibleCount < totalFiltered && (
                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount(v => v + INITIAL_VISIBLE)}
                      className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border ${
                        isDark ? "bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800" : "bg-white border-zinc-200 text-slate-900 hover:bg-zinc-50"
                      }`}
                    >
                      <Plus size={12} /> {t("showcase_viewFull") || "Carregar Mais"}
                    </button>
                  </div>
                )}*/}
              </div>
            )}

            {!isLoading && products.length === 0 && (
              <div className={`rounded-xl border border-dashed py-12 flex flex-col items-center justify-center ${
                isDark ? "border-zinc-800 bg-zinc-900/5" : "border-zinc-200 bg-zinc-50/30"
              }`}>
                <Package size={30} className="mb-2 text-zinc-500 opacity-25" />
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">{props.content?.empty_text || t("catalog_no_products") || "Nenhum produto cadastrado"}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}