import { useState, useMemo, useEffect, useCallback, memo, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  Sparkles, 
  CheckCircle2, 
  Home, 
  ArrowLeft, 
  Store, 
  Share2, 
  Layers, 
  Check, 
  Percent, 
  ShieldCheck, 
  Package,
  ArrowDown
} from "lucide-react";

const MAX_TITLE = 45;
const MAX_SUBTITLE = 90;

export interface CatalogHeaderProps {
  isEditor: boolean;
  isDark: boolean;
  isCenter: boolean;
  storeName: string;
  storeLogo?: string;
  activeStoreSlug?: string;
  storeCurrency: string;
  designPalette: {
    bg: string;
    border: string;
    badge: string;
  };
  currentFonts: {
    title: string;
    subtitle: string;
  };
  initialTitle?: string;
  initialSubtitle?: string;
  fallbackTitle: string;
  fallbackSubtitle: string;
  processedProductsCount: number;
  categoriesCount: number;
  onSaleCount: number;
  categoryCoverImages: string[];
  editorMockupImage: string | null;
  onlyDiscounts: boolean;
  onToggleDiscounts: () => void;
  onUpdateText: (field: "title" | "subtitle", value: string) => void;
  t: (key: string, params?: Record<string, any>) => string;
}

export const CatalogHeader = memo(function CatalogHeader({
  isEditor,
  isDark,
  isCenter,
  storeName,
  storeLogo,
  activeStoreSlug,
  storeCurrency,
  designPalette,
  currentFonts,
  initialTitle,
  initialSubtitle,
  fallbackTitle,
  fallbackSubtitle,
  processedProductsCount,
  categoriesCount,
  onSaleCount,
  categoryCoverImages,
  editorMockupImage,
  onlyDiscounts,
  onToggleDiscounts,
  onUpdateText,
  t
}: CatalogHeaderProps) {
  const currentTitle = (initialTitle || fallbackTitle).slice(0, MAX_TITLE);
  const currentSubtitle = (initialSubtitle || fallbackSubtitle).slice(0, MAX_SUBTITLE);

  const [titleCount, setTitleCount] = useState(currentTitle.length);
  const [subCount, setSubCount] = useState(currentSubtitle.length);
  const [copiedLink, setCopiedLink] = useState(false);
  const [coverIndex, setCoverIndex] = useState(0);

  const desktopTitleRef = useRef<HTMLHeadingElement | null>(null);
  const desktopSubRef = useRef<HTMLParagraphElement | null>(null);
  const mobileTitleRef = useRef<HTMLHeadingElement | null>(null);
  const mobileSubRef = useRef<HTMLParagraphElement | null>(null);
  const headerContainerRef = useRef<HTMLDivElement | null>(null);

  const isEditingTitleRef = useRef(false);
  const isEditingSubRef = useRef(false);

  // Sincronização direta de DOM sem re-render do cursor
  useEffect(() => {
    if (!isEditingTitleRef.current) {
      if (desktopTitleRef.current) desktopTitleRef.current.textContent = currentTitle;
      if (mobileTitleRef.current) mobileTitleRef.current.textContent = currentTitle;
      setTitleCount(currentTitle.length);
    }
    if (!isEditingSubRef.current) {
      if (desktopSubRef.current) desktopSubRef.current.textContent = currentSubtitle;
      if (mobileSubRef.current) mobileSubRef.current.textContent = currentSubtitle;
      setSubCount(currentSubtitle.length);
    }
  }, [currentTitle, currentSubtitle]);

  const alignContainerClass = useMemo(() => {
    return isCenter ? "items-center text-center mx-auto" : "items-start text-left";
  }, [isCenter]);

  const alignFlexClass = useMemo(() => {
    return isCenter ? "justify-center" : "justify-start";
  }, [isCenter]);

  // Slideshow com suspensão de hardware em segundo plano
  useEffect(() => {
    if (isEditor || categoryCoverImages.length <= 1) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;
    const startTimer = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        setCoverIndex((prev) => (prev + 1) % categoryCoverImages.length);
      }, 7000);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (intervalId) clearInterval(intervalId);
      } else {
        startTimer();
      }
    };

    startTimer();
    document.addEventListener("visibilitychange", handleVisibilityChange, { passive: true });

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [categoryCoverImages.length, isEditor]);

  // Partilha Nativa
  const handleShare = useCallback(async () => {
    if (isEditor) return;
    const currentUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareTitle = `${storeName} | ${t("catalog_title") || "Catálogo Oficial"}`;
    const shareText = t("share_store_recommendation_msg", { store: storeName }) || 
      `Dá uma olhada nos produtos da ${storeName}! Catálogo oficial:`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: currentUrl
        });
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") return;
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(`${shareText} ${currentUrl}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  }, [isEditor, storeName, t]);

  const scrollToProducts = useCallback(() => {
    const productsTarget = 
      document.getElementById("catalog-products-section") || 
      document.getElementById("sec-products") || 
      document.querySelector("[data-section='products']");

    if (productsTarget) {
      const targetTop = productsTarget.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: Math.max(0, targetTop - 16),
        behavior: "smooth"
      });
    } else if (headerContainerRef.current) {
      const headerBottom = headerContainerRef.current.getBoundingClientRect().bottom + window.pageYOffset;
      window.scrollTo({
        top: Math.max(0, headerBottom - 8),
        behavior: "smooth"
      });
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLElement>, maxLength: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      return;
    }
    const isControlKey = e.ctrlKey || e.metaKey || e.altKey;
    const isNavigation = [
      "Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Tab", "Home", "End"
    ].includes(e.key);

    if (!isControlKey && !isNavigation) {
      const currentLength = (e.currentTarget.textContent || "").length;
      const selection = window.getSelection();
      const hasSelection = selection && selection.toString().length > 0;
      
      if (currentLength >= maxLength && !hasSelection) {
        e.preventDefault();
      }
    }
  }, []);

  const handleInput = useCallback((e: React.FormEvent<HTMLElement>, field: "title" | "subtitle", maxLength: number) => {
    const raw = e.currentTarget.textContent || "";
    if (raw.length > maxLength) {
      const trimmed = raw.slice(0, maxLength);
      e.currentTarget.textContent = trimmed;
      
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(e.currentTarget);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
    const currentLen = (e.currentTarget.textContent || "").length;
    if (field === "title") setTitleCount(currentLen);
    else setSubCount(currentLen);
  }, []);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLElement>, maxLength: number) => {
    e.preventDefault();
    const cleanText = e.clipboardData.getData("text/plain").replace(/[\r\n\t]+/g, " ").trim();
    const selection = window.getSelection();
    const currentText = e.currentTarget.textContent || "";
    const selectedLen = selection ? selection.toString().length : 0;
    const allowed = maxLength - (currentText.length - selectedLen);
    
    if (allowed > 0) {
      const sanitized = cleanText.slice(0, allowed);
      document.execCommand("insertText", false, sanitized);
    }
  }, []);

  const handleBlurText = useCallback((field: "title" | "subtitle", e: React.FocusEvent<HTMLElement>) => {
    if (field === "title") isEditingTitleRef.current = false;
    else isEditingSubRef.current = false;

    const max = field === "title" ? MAX_TITLE : MAX_SUBTITLE;
    let sanitized = (e.currentTarget.textContent || "").trim().replace(/\s+/g, " ").slice(0, max);
    
    if (!sanitized) {
      sanitized = field === "title" ? fallbackTitle : fallbackSubtitle;
      e.currentTarget.textContent = sanitized;
    }
    
    if (field === "title") setTitleCount(sanitized.length);
    else setSubCount(sanitized.length);

    onUpdateText(field, sanitized);
  }, [fallbackTitle, fallbackSubtitle, onUpdateText]);

  return (
    <div 
      ref={headerContainerRef}
      className={`w-full border-b transition-colors duration-150 ${designPalette.bg} ${designPalette.border}`}
      style={{ contain: "layout style paint" }}
    >
      {/* BANNER MOBILE */}
      <div className="relative w-full min-h-[280px] md:hidden bg-zinc-950 overflow-hidden flex flex-col justify-between p-4 select-none">
        
        {/* Imagens com Fade Cruzado Suave */}
        {isEditor ? (
          editorMockupImage ? (
            <img 
              src={editorMockupImage} 
              alt="Mockup Mobile" 
              className="absolute inset-0 h-full w-full object-cover object-center opacity-70 pointer-events-none" 
            />
          ) : (
            <div className={`absolute inset-0 opacity-60 ${designPalette.bg}`} />
          )
        ) : (
          categoryCoverImages.length > 0 ? (
            categoryCoverImages.map((imgUrl, idx) => (
              <img 
                key={imgUrl}
                src={imgUrl} 
                alt="Banner Mobile" 
                className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none"
                style={{ 
                  opacity: idx === coverIndex ? 0.70 : 0,
                  transition: "opacity 1000ms cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: "translateZ(0)",
                  willChange: "opacity"
                }}
                loading={idx === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            ))
          ) : (
            <div className={`absolute inset-0 opacity-60 ${designPalette.bg}`} />
          )
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/60 pointer-events-none" />

        {/* 1. TOPO DA CAPA */}
        <div className="relative z-10 flex items-center justify-between pointer-events-auto">
          {activeStoreSlug && !isEditor ? (
            <Link 
              to={`/${activeStoreSlug}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 text-white text-xs font-bold border border-white/20 active:scale-95 transition-transform shadow-xs"
            >
              <ArrowLeft size={14} className="stroke-[2.5]" />
              <span>{t("common_home") || "Início"}</span>
            </Link>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 text-white/90 text-xs font-semibold border border-white/10 select-none">
              <Home size={13} />
              <span>{t("common_home") || "Início"}</span>
            </div>
          )}

          <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${designPalette.badge}`}>
            <Sparkles size={11} className="text-amber-400" />
            <span>{t("catalog_collection") || "Coleção"}</span>
          </div>
        </div>

        {/* 2. CENTRO E FUNDO DA CAPA */}
        <div className="relative z-10 space-y-3.5 pt-3">
          <div className={`flex items-center gap-3 ${isCenter ? "flex-col text-center" : "flex-row text-left"}`}>
            <div className="h-16 w-16 rounded-2xl border-2 border-white/30 bg-zinc-900 overflow-hidden shrink-0 flex items-center justify-center shadow-lg">
              {storeLogo ? (
                <img src={storeLogo} alt={storeName} className="h-full w-full object-cover" decoding="async" />
              ) : (
                <Store className="h-8 w-8 text-white/80" />
              )}
            </div>

            <div className="min-w-0 max-w-full">
              <div className={`flex items-center gap-1.5 flex-wrap ${isCenter ? "justify-center" : "justify-start"}`}>
                <h1 className="text-lg font-black tracking-tight text-white drop-shadow-sm truncate max-w-[200px] sm:max-w-xs">
                  {storeName}
                </h1>
                <CheckCircle2 size={16} className="text-blue-400 fill-blue-400/20 shrink-0" />
              </div>

              <div className={`flex items-center gap-2 mt-1 text-xs ${isCenter ? "justify-center" : "justify-start"}`}>
                <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-white/20 text-white border border-white/10 truncate max-w-[120px]">
                  @{activeStoreSlug || "catalogo"}
                </span>
                <span className="text-white/40">•</span>
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 drop-shadow-xs">
                  <ShieldCheck size={12} />
                  {t("safe_browsing") || "Oficial"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isEditor}
              onClick={handleShare}
              className="w-full h-10 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-white/20 hover:bg-white/30 active:bg-white/35 text-white border border-white/20 shadow-xs transition-transform active:scale-[0.98] cursor-pointer disabled:opacity-70"
            >
              {copiedLink ? (
                <>
                  <Check size={15} className="text-emerald-400 stroke-[2.5]" />
                  <span className="text-emerald-400">{t("link_copied") || "Copiado!"}</span>
                </>
              ) : (
                <>
                  <Share2 size={15} className="text-white/80" />
                  <span>{t("common_share") || "Recomendar"}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={scrollToProducts}
              className="w-full h-10 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-white text-zinc-950 hover:bg-zinc-100 shadow-md active:scale-[0.98] transition-transform cursor-pointer font-black"
            >
              <span>{t("catalog_view_products") || "Apreciar Já"}</span>
              <ArrowDown size={14} className="shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* ÁREA INFERIOR */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        
        {/* DESKTOP (md+) */}
        <div className="hidden md:grid md:grid-cols-12 gap-8 items-center">
          <div className={`md:col-span-7 flex flex-col justify-center min-w-0 pr-4 ${alignContainerClass}`}>
            
            <div className={`flex items-center gap-2.5 mb-3 w-full ${alignFlexClass}`}>
              {activeStoreSlug && !isEditor ? (
                <Link 
                  to={`/${activeStoreSlug}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors border ${
                    isDark 
                      ? "bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800" 
                      : "bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  <ArrowLeft size={13} className="stroke-[2.5]" />
                  <span>{t("common_home") || "Página Inicial"}</span>
                </Link>
              ) : (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border opacity-80 select-none ${
                  isDark ? "bg-zinc-900 border-zinc-800 text-zinc-400" : "bg-zinc-100 border-zinc-200 text-zinc-500"
                }`}>
                  <Home size={13} />
                  <span>{t("common_home") || "Página Inicial"}</span>
                </div>
              )}

              <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${designPalette.badge}`}>
                <Sparkles size={12} className="shrink-0 text-amber-500" />
                <span>{t("catalog_collection") || "Coleção Oficial"}</span>
              </div>
            </div>

            <div className={`flex items-center gap-4 min-w-0 w-full ${alignFlexClass}`}>
              <div 
                className={`h-16 w-16 lg:h-18 lg:w-18 rounded-2xl border-2 overflow-hidden shrink-0 flex items-center justify-center shadow-xs ${
                  isDark ? "border-zinc-800 bg-zinc-900" : "border-zinc-200 bg-zinc-50"
                }`}
              >
                {storeLogo ? (
                  <img src={storeLogo} alt={storeName} className="h-full w-full object-cover" decoding="async" />
                ) : (
                  <Store className={`h-8 w-8 ${isDark ? "text-zinc-600" : "text-zinc-400"}`} />
                )}
              </div>

              <div className={`flex flex-col min-w-0 ${isCenter ? "items-center" : "items-start"}`}>
                <div className={`flex items-center gap-2 flex-wrap ${alignFlexClass}`}>
                  <h1 className={`text-xl lg:text-2xl font-black tracking-tight truncate max-w-xs lg:max-w-md ${
                    isDark ? "text-white" : "text-zinc-950"
                  }`}>
                    {storeName}
                  </h1>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0 ${
                    isDark ? "bg-blue-950/40 text-blue-300 border-blue-800/60" : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}>
                    <CheckCircle2 size={11} className="stroke-[2.5]" />
                    {t("verified_store") || "Oficial"}
                  </span>
                </div>

                <div className={`flex items-center gap-2 text-xs font-medium mt-1 ${alignFlexClass} ${
                  isDark ? "text-zinc-400" : "text-zinc-500"
                }`}>
                  <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold truncate max-w-[160px] ${
                    isDark ? "bg-zinc-900 text-zinc-300 border border-zinc-800" : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                  }`}>
                    @{activeStoreSlug || "catalogo"}
                  </span>
                  <span>•</span>
                  <span className={`flex items-center gap-1 font-bold ${
                    isDark ? "text-emerald-400" : "text-emerald-600"
                  }`}>
                    <ShieldCheck size={13} />
                    {t("safe_browsing") || "Verificado"}
                  </span>
                </div>
              </div>
            </div>

            {/* Container Desktop */}
            <div className={`mt-3.5 flex flex-col w-full max-w-xl min-w-0 ${alignContainerClass}`}>
              <div className="relative w-full group min-w-0">
                <h2 
                  ref={desktopTitleRef}
                  className={`w-full font-black leading-snug break-words [overflow-wrap:anywhere] hyphens-auto line-clamp-2 outline-none ${currentFonts.title} ${
                    isDark ? "text-white" : "text-zinc-900"
                  } ${isEditor ? "border border-dashed border-amber-500/40 hover:border-amber-500 focus:border-amber-500 bg-amber-500/[0.03] rounded-lg px-2 py-1 cursor-text" : ""}`}
                  contentEditable={isEditor}
                  suppressContentEditableWarning={true}
                  onFocus={() => { isEditingTitleRef.current = true; }}
                  onKeyDown={(e) => handleKeyDown(e, MAX_TITLE)}
                  onInput={(e) => handleInput(e, "title", MAX_TITLE)}
                  onPaste={(e) => handlePaste(e, MAX_TITLE)}
                  onBlur={(e) => handleBlurText("title", e)}
                >
                  {currentTitle}
                </h2>
                {isEditor && (
                  <div className="flex justify-end mt-0.5">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 shadow-xs">
                      {titleCount}/{MAX_TITLE}
                    </span>
                  </div>
                )}
              </div>

              <div className="relative w-full group mt-1 min-w-0">
                <p 
                  ref={desktopSubRef}
                  className={`w-full font-medium leading-relaxed text-xs lg:text-sm break-words [overflow-wrap:anywhere] hyphens-auto line-clamp-3 outline-none ${
                    isDark ? "text-zinc-400" : "text-zinc-600"
                  } ${isEditor ? "border border-dashed border-amber-500/40 hover:border-amber-500 focus:border-amber-500 bg-amber-500/[0.03] rounded-lg px-2 py-1 cursor-text" : ""}`}
                  contentEditable={isEditor}
                  suppressContentEditableWarning={true}
                  onFocus={() => { isEditingSubRef.current = true; }}
                  onKeyDown={(e) => handleKeyDown(e, MAX_SUBTITLE)}
                  onInput={(e) => handleInput(e, "subtitle", MAX_SUBTITLE)}
                  onPaste={(e) => handlePaste(e, MAX_SUBTITLE)}
                  onBlur={(e) => handleBlurText("subtitle", e)}
                >
                  {currentSubtitle}
                </p>
                {isEditor && (
                  <div className="flex justify-end mt-0.5">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 shadow-xs">
                      {subCount}/{MAX_SUBTITLE}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className={`mt-5 flex flex-wrap items-center gap-2.5 w-full ${alignFlexClass}`}>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300" : "bg-zinc-50 border-zinc-200 text-zinc-700"
              }`}>
                <Package size={14} className={isDark ? "text-zinc-400" : "text-zinc-500"} />
                <span><strong>{processedProductsCount}</strong> {t("products") || "produtos"}</span>
              </div>

              {categoriesCount > 0 && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                  isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300" : "bg-zinc-50 border-zinc-200 text-zinc-700"
                }`}>
                  <Layers size={14} className={isDark ? "text-zinc-400" : "text-zinc-500"} />
                  <span><strong>{categoriesCount}</strong> {t("categories") || "categorias"}</span>
                </div>
              )}

              {onSaleCount > 0 && (
                <button
                  type="button"
                  disabled={isEditor}
                  onClick={onToggleDiscounts}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-transform border ${
                    isEditor ? "opacity-70 cursor-default" : "active:scale-95 cursor-pointer shadow-xs"
                  } ${
                    onlyDiscounts 
                      ? "bg-emerald-600 text-white border-emerald-600" 
                      : isDark 
                        ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/50" 
                        : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  <Percent size={12} className="stroke-[3]" />
                  <span>{onlyDiscounts ? (t("catalog_show_all") || "Ver Todos") : (t("catalog_filter_discounts") || "Promoções")}</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/20 text-current font-black">
                    {onSaleCount}
                  </span>
                </button>
              )}

              <button
                type="button"
                disabled={isEditor}
                onClick={handleShare}
                className={`inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-xl font-bold text-xs border shadow-xs transition-transform ${
                  isEditor ? "opacity-70 cursor-default" : "active:scale-95 cursor-pointer"
                } ${
                  isDark 
                    ? "border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white" 
                    : "border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50"
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check size={14} className="text-emerald-500 stroke-[2.5]" />
                    <span className="text-emerald-500">{t("link_copied") || "Copiado!"}</span>
                  </>
                ) : (
                  <>
                    <Share2 size={14} className={isDark ? "text-zinc-400" : "text-zinc-500"} />
                    <span>{t("common_share") || "Recomendar"}</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Showcase Desktop com Fade Cruzado Suave */}
          <div className="md:col-span-5 relative select-none">
            <div className={`relative h-52 lg:h-60 w-full rounded-3xl overflow-hidden border shadow-sm ${
              isDark ? "border-zinc-800 bg-zinc-900" : "border-zinc-200 bg-zinc-100"
            }`}>
              {isEditor ? (
                <div className="relative h-full w-full">
                  {editorMockupImage ? (
                    <img 
                      src={editorMockupImage} 
                      alt="Mockup Showcase" 
                      className="h-full w-full object-cover object-center" 
                    />
                  ) : (
                    <div className={`h-full w-full opacity-70 ${designPalette.bg}`} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between z-10">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 border border-white/20 text-white text-[10px] font-bold">
                      <Sparkles size={11} className="text-amber-400" />
                      <span>{t("catalog_highlights") || "Destaques"}</span>
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-black/60 text-[10px] text-zinc-300 font-mono font-bold">
                      1 / {Math.max(categoriesCount, 1)}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {categoryCoverImages.length > 0 ? (
                    categoryCoverImages.map((imgUrl, idx) => (
                      <img 
                        key={imgUrl}
                        src={imgUrl} 
                        alt="Showcase do Catálogo" 
                        className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none"
                        style={{ 
                          opacity: idx === coverIndex ? 1 : 0,
                          transition: "opacity 1000ms cubic-bezier(0.4, 0, 0.2, 1)",
                          transform: "translateZ(0)",
                          willChange: "opacity"
                        }}
                        loading={idx === 0 ? "eager" : "lazy"}
                        decoding="async"
                      />
                    ))
                  ) : (
                    <div className={`h-full w-full opacity-60 ${designPalette.bg}`} />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />

                  <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between z-10">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 border border-white/20 text-white text-[10px] font-bold">
                      <Sparkles size={11} className="text-amber-400" />
                      <span>{t("catalog_recent_highlights") || "Destaques"}</span>
                    </div>

                    {categoryCoverImages.length > 1 && (
                      <div className="px-2.5 py-1 rounded-full bg-black/60 text-[10px] text-zinc-300 font-mono font-bold">
                        {coverIndex + 1} / {categoryCoverImages.length}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* TEXTOS MOBILE COM TRAVA DE AUTO-ZOOM */}
        <div className={`md:hidden flex flex-col min-w-0 w-full ${alignContainerClass} space-y-2.5`}>
          
          <div className={`flex flex-col w-full min-w-0 ${alignContainerClass} space-y-1`}>
            <div className="relative w-full group min-w-0">
              <h2 
                ref={mobileTitleRef}
                style={isEditor ? { fontSize: "16px" } : undefined}
                className={`w-full font-black leading-snug break-words [overflow-wrap:anywhere] hyphens-auto line-clamp-2 outline-none ${
                  isEditor ? "text-[16px]" : `${currentFonts.title} text-base sm:text-lg`
                } ${
                  isDark ? "text-white" : "text-zinc-950"
                } ${isEditor ? "border border-dashed border-amber-500/40 rounded-lg p-1.5 cursor-text" : ""}`}
                contentEditable={isEditor}
                suppressContentEditableWarning={true}
                onFocus={() => { isEditingTitleRef.current = true; }}
                onKeyDown={(e) => handleKeyDown(e, MAX_TITLE)}
                onInput={(e) => handleInput(e, "title", MAX_TITLE)}
                onPaste={(e) => handlePaste(e, MAX_TITLE)}
                onBlur={(e) => handleBlurText("title", e)}
              >
                {currentTitle}
              </h2>
              {isEditor && (
                <div className="flex justify-end mt-0.5">
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 shadow-xs">
                    {titleCount}/{MAX_TITLE}
                  </span>
                </div>
              )}
            </div>

            <div className="relative w-full group min-w-0">
              <p 
                ref={mobileSubRef}
                style={isEditor ? { fontSize: "16px" } : undefined}
                className={`w-full font-medium leading-relaxed break-words [overflow-wrap:anywhere] hyphens-auto line-clamp-3 outline-none ${
                  isEditor ? "text-[16px]" : "text-xs"
                } ${
                  isDark ? "text-zinc-400" : "text-zinc-600"
                } ${isEditor ? "border border-dashed border-amber-500/40 rounded-lg p-1.5 cursor-text" : ""}`}
                contentEditable={isEditor}
                suppressContentEditableWarning={true}
                onFocus={() => { isEditingSubRef.current = true; }}
                onKeyDown={(e) => handleKeyDown(e, MAX_SUBTITLE)}
                onInput={(e) => handleInput(e, "subtitle", MAX_SUBTITLE)}
                onPaste={(e) => handlePaste(e, MAX_SUBTITLE)}
                onBlur={(e) => handleBlurText("subtitle", e)}
              >
                {currentSubtitle}
              </p>
              {isEditor && (
                <div className="flex justify-end mt-0.5">
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 shadow-xs">
                    {subCount}/{MAX_SUBTITLE}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Badge Informativo Mobile */}
          <div className={`w-full flex items-center justify-between gap-2 py-2 px-3 rounded-xl border text-xs font-bold ${
            isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300" : "bg-zinc-100 border-zinc-200 text-zinc-700"
          }`}>
            <span className="flex items-center gap-1.5 truncate">
              <Package size={13} className={`shrink-0 ${isDark ? "text-zinc-400" : "text-zinc-500"}`} />
              <span className="truncate"><strong>{processedProductsCount}</strong> {t("products") || "produtos"}</span>
            </span>

            {categoriesCount > 0 && (
              <>
                <span className={isDark ? "text-zinc-700" : "text-zinc-300"}>•</span>
                <span className="flex items-center gap-1.5 truncate">
                  <Layers size={13} className={`shrink-0 ${isDark ? "text-zinc-400" : "text-zinc-500"}`} />
                  <span className="truncate"><strong>{categoriesCount}</strong> {t("categories") || "cat"}</span>
                </span>
              </>
            )}

            <span className={isDark ? "text-zinc-700" : "text-zinc-300"}>•</span>
            <span className={`font-black shrink-0 ${isDark ? "text-white" : "text-zinc-900"}`}>{storeCurrency}</span>
          </div>

          {/* Filtro Promoções Mobile */}
          {onSaleCount > 0 && (
            <div className="w-full">
              <button
                type="button"
                disabled={isEditor}
                onClick={onToggleDiscounts}
                className={`w-full h-9 px-3 rounded-xl text-[11px] font-bold transition-transform border flex items-center justify-center gap-1.5 shadow-xs ${
                  isEditor ? "opacity-70 cursor-default" : "active:scale-[0.98] cursor-pointer"
                } ${
                  onlyDiscounts 
                    ? "bg-emerald-600 text-white border-emerald-600" 
                    : isDark 
                      ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/60" 
                      : "bg-emerald-50 text-emerald-800 border-emerald-200"
                }`}
              >
                <Percent size={12} className="stroke-[3] shrink-0" />
                <span className="truncate">
                  {onlyDiscounts 
                    ? (t("catalog_show_all") || "Mostrar Todos os Produtos") 
                    : (t("catalog_filter_discounts") || "Ver Apenas Promoções")}
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-black/20 text-current font-black shrink-0">
                  {onSaleCount}
                </span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
});

CatalogHeader.displayName = "CatalogHeader";