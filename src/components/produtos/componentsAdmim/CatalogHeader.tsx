import { useState, useMemo, useEffect, useCallback, memo } from "react";
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
  Package 
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
  const [editableTitle, setEditableTitle] = useState(initialTitle || fallbackTitle);
  const [editableSubtitle, setEditableSubtitle] = useState(initialSubtitle || fallbackSubtitle);
  const [copiedLink, setCopiedLink] = useState(false);
  const [coverIndex, setCoverIndex] = useState(0);

  useEffect(() => {
    setEditableTitle(initialTitle || fallbackTitle);
    setEditableSubtitle(initialSubtitle || fallbackSubtitle);
  }, [initialTitle, initialSubtitle, fallbackTitle, fallbackSubtitle]);

  // Alinhamento simétrico contido em container seguro
  const alignContainerClass = useMemo(() => {
    if (isCenter) return "items-center text-center mx-auto";
    return "items-start text-left";
  }, [isCenter]);

  const alignFlexClass = useMemo(() => {
    if (isCenter) return "justify-center";
    return "justify-start";
  }, [isCenter]);

  // Slideshow com baixo consumo e pausa em segundo plano
  useEffect(() => {
    if (isEditor || categoryCoverImages.length <= 1) return;

    let intervalId: NodeJS.Timeout | null = null;
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

  const handleShare = useCallback(async () => {
    if (isEditor) return;
    const currentUrl = window.location.href;
    const shareTitle = `${storeName} | ${t("catalog_title") || "Catálogo Oficial"}`;
    const shareText = t("share_store_recommendation_msg", { store: storeName }) || 
      `Dá uma olhada nos produtos da ${storeName}! Encontrei ótimas opções no catálogo oficial:`;

    if (navigator.share) {
      try {
        let filesArray: File[] = [];
        if (storeLogo && navigator.canShare) {
          try {
            const res = await fetch(storeLogo);
            const blob = await res.blob();
            const ext = blob.type.split("/")[1] || "png";
            const file = new File([blob], `logo-${activeStoreSlug || "store"}.${ext}`, { type: blob.type });
            if (navigator.canShare({ files: [file] })) {
              filesArray = [file];
            }
          } catch {
            // Ignora falha de imagem e partilha só texto
          }
        }

        await navigator.share({
          title: shareTitle,
          text: `${shareText}\n`,
          url: currentUrl,
          ...(filesArray.length > 0 ? { files: filesArray } : {})
        });
        return;
      } catch (err: any) {
        if (err.name === "AbortError") return;
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${shareText} ${currentUrl}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  }, [isEditor, storeName, storeLogo, activeStoreSlug, t]);

  const handleBlurText = useCallback((field: "title" | "subtitle", value: string) => {
    let sanitized = value.trim().replace(/\s+/g, " ");
    if (!sanitized) {
      sanitized = field === "title" ? fallbackTitle : fallbackSubtitle;
      if (field === "title") setEditableTitle(fallbackTitle);
      else setEditableSubtitle(fallbackSubtitle);
    }
    onUpdateText(field, sanitized);
  }, [fallbackTitle, fallbackSubtitle, onUpdateText]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>, maxLength: number) => {
    e.preventDefault();
    const plainText = e.clipboardData.getData("text/plain").replace(/[\r\n]+/g, " ");
    const sanitized = plainText.slice(0, maxLength);
    document.execCommand("insertText", false, sanitized);
  }, []);

  return (
    <div className={`w-full border-b transition-colors duration-150 ${designPalette.bg} ${designPalette.border}`}>
      
      {/* BANNER MOBILE (h-52 sm:h-60) */}
      <div className="relative w-full h-52 sm:h-60 md:hidden bg-zinc-950 overflow-hidden select-none">
        {isEditor ? (
          editorMockupImage ? (
            <img 
              src={editorMockupImage} 
              alt="Mockup Mobile" 
              className="absolute inset-0 h-full w-full object-cover object-center filter brightness-[0.88] pointer-events-none" 
            />
          ) : (
            <div className={`h-full w-full opacity-60 ${designPalette.bg}`} />
          )
        ) : (
          categoryCoverImages.length > 0 ? (
            categoryCoverImages.map((imgUrl, idx) => (
              <img 
                key={imgUrl}
                src={imgUrl} 
                alt="Banner Mobile" 
                className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none filter brightness-[0.88]"
                style={{ 
                  opacity: categoryCoverImages.length === 1 ? 1 : (idx === coverIndex ? 1 : 0), 
                  transition: "opacity 0.8s ease-in-out",
                  willChange: "opacity" 
                }}
                loading={idx === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            ))
          ) : (
            <div className={`h-full w-full opacity-60 ${designPalette.bg}`} />
          )
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
        
        <div className="absolute top-3.5 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
          {activeStoreSlug && !isEditor ? (
            <Link 
              to={`/${activeStoreSlug}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 text-white text-xs font-semibold border border-white/20 active:scale-95 transition-transform"
            >
              <ArrowLeft size={13} className="stroke-[2.5]" />
              <span>{t("common_home") || "Início"}</span>
            </Link>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 text-white text-[11px] font-semibold border border-white/10 select-none opacity-80">
              <Home size={12} />
              <span>{t("common_home") || "Início"}</span>
            </div>
          )}

          <div className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${designPalette.badge}`}>
            <Sparkles size={10} className="text-amber-400" />
            <span>{t("catalog_collection") || "Coleção"}</span>
          </div>
        </div>
      </div>

      {/* CONTAINER PRINCIPAL DO HERO */}
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-8 py-5 sm:py-6 md:py-8">
        
        {/* DESKTOP (md+) */}
        <div className="hidden md:grid md:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Coluna Esquerda: Marca e Informações */}
          <div className={`md:col-span-7 flex flex-col justify-center min-w-0 pr-4 lg:pr-8 ${alignContainerClass}`}>
            
            <div className={`flex items-center gap-2.5 mb-3 w-full ${alignFlexClass}`}>
              {activeStoreSlug && !isEditor ? (
                <Link 
                  to={`/${activeStoreSlug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/90 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold transition-colors border border-zinc-200 dark:border-zinc-700"
                >
                  <ArrowLeft size={13} className="stroke-[2.5]" />
                  <span>{t("common_home") || "Página Inicial"}</span>
                </Link>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/60 text-zinc-500 text-xs font-semibold border border-zinc-200 dark:border-zinc-700 select-none opacity-80">
                  <Home size={13} />
                  <span>{t("common_home") || "Página Inicial"}</span>
                </div>
              )}

              <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${designPalette.badge}`}>
                <Sparkles size={11} className="shrink-0 text-amber-500" />
                <span>{t("catalog_collection") || "Coleção Oficial"}</span>
              </div>
            </div>

            {/* Marca */}
            <div className={`flex items-center gap-4 min-w-0 w-full ${alignFlexClass}`}>
              <div 
                className="h-16 w-16 lg:h-20 lg:w-20 rounded-2xl border-2 overflow-hidden shrink-0 flex items-center justify-center ring-1 ring-black/5"
                style={{
                  borderColor: isDark ? "#27272a" : "#ffffff",
                  backgroundColor: isDark ? "#18181b" : "#f4f4f5"
                }}
              >
                {storeLogo ? (
                  <img src={storeLogo} alt={storeName} className="h-full w-full object-cover" decoding="async" />
                ) : (
                  <Store className="h-8 w-8 text-zinc-400" />
                )}
              </div>

              <div className={`flex flex-col min-w-0 ${isCenter ? "items-center" : "items-start"}`}>
                <div className={`flex items-center gap-2 flex-wrap ${alignFlexClass}`}>
                  <h1 className={`text-xl lg:text-2xl font-black tracking-tight truncate ${isDark ? "text-white" : "text-zinc-900"}`}>
                    {storeName}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:bg-blue-400/20 dark:text-blue-400 border border-blue-500/20 shrink-0">
                    <CheckCircle2 size={11} className="stroke-[2.5]" />
                    {t("verified_store") || "Oficial"}
                  </span>
                </div>

                <div className={`flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5 ${alignFlexClass}`}>
                  <span className={`px-1.5 py-0.2 rounded text-[11px] ${isDark ? "bg-zinc-800 text-zinc-200" : "bg-zinc-200/80 text-zinc-800"}`}>
                    @{activeStoreSlug || "catalogo"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                    <ShieldCheck size={13} />
                    {t("safe_browsing") || "Verificado"}
                  </span>
                </div>
              </div>
            </div>

            {/* Título & Descrição */}
            <div className={`mt-3.5 flex flex-col w-full max-w-[480px] ${alignContainerClass}`}>
              <div className="relative w-full group">
                <h2 
                  className={`w-full font-bold transition-all outline-none leading-snug break-words text-balance line-clamp-2 ${currentFonts.title} ${isDark ? "text-white" : "text-zinc-900"} ${isEditor ? "border border-dashed border-amber-500/40 hover:border-amber-500 bg-amber-500/[0.02] rounded px-2 py-1 cursor-text text-[16px] md:text-inherit" : ""}`}
                  contentEditable={isEditor}
                  suppressContentEditableWarning={true}
                  onKeyDown={(e) => { 
                    if (e.key === "Enter") e.preventDefault(); 
                    if (e.currentTarget.textContent!.length >= MAX_TITLE && e.key !== "Backspace" && !e.key.startsWith("Arrow")) e.preventDefault();
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
                  <span className="absolute -bottom-4 right-1 text-[8px] font-mono opacity-40 select-none pointer-events-none">
                    {editableTitle.length}/{MAX_TITLE}
                  </span>
                )}
              </div>

              <div className="relative w-full group mt-1.5">
                <p 
                  className={`w-full font-medium outline-none leading-relaxed text-xs lg:text-sm break-words line-clamp-3 ${isDark ? "text-zinc-400" : "text-zinc-600"} ${isEditor ? "border border-dashed border-amber-500/40 hover:border-amber-500 bg-amber-500/[0.02] rounded px-2 py-1 cursor-text text-[16px] md:text-inherit" : ""}`}
                  contentEditable={isEditor}
                  suppressContentEditableWarning={true}
                  onKeyDown={(e) => { 
                    if (e.key === "Enter") e.preventDefault(); 
                    if (e.currentTarget.innerText.length >= MAX_SUBTITLE && e.key !== "Backspace" && !e.key.startsWith("Arrow")) e.preventDefault();
                  }}
                  onPaste={(e) => handlePaste(e, MAX_SUBTITLE)}
                  onBlur={(e) => {
                    const text = e.currentTarget.innerText || "";
                    const final = text.trim() || fallbackSubtitle;
                    setEditableSubtitle(final);
                    handleBlurText("subtitle", final);
                  }}
                >
                  {editableSubtitle}
                </p>
                {isEditor && (
                  <span className="absolute -bottom-4 right-1 text-[8px] font-mono opacity-40 select-none pointer-events-none">
                    {editableSubtitle.length}/{MAX_SUBTITLE}
                  </span>
                )}
              </div>
            </div>

            {/* Métricas e Botões */}
            <div className={`mt-5 flex flex-wrap items-center gap-2.5 w-full ${alignFlexClass}`}>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold ${isDark ? "bg-zinc-900/60 border-zinc-800 text-zinc-300" : "bg-white border-zinc-200 text-zinc-700"}`}>
                <Package size={13} className="text-zinc-400" />
                <span><strong>{processedProductsCount}</strong> {t("products") || "produtos"}</span>
              </div>

              {categoriesCount > 0 && (
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold ${isDark ? "bg-zinc-900/60 border-zinc-800 text-zinc-300" : "bg-white border-zinc-200 text-zinc-700"}`}>
                  <Layers size={13} className="text-zinc-400" />
                  <span><strong>{categoriesCount}</strong> {t("categories") || "categorias"}</span>
                </div>
              )}

              {onSaleCount > 0 && (
                <button
                  type="button"
                  disabled={isEditor}
                  onClick={onToggleDiscounts}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all border ${
                    isEditor ? "opacity-75 cursor-default" : "active:scale-95 cursor-pointer"
                  } ${
                    onlyDiscounts 
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" 
                      : isDark ? "bg-emerald-950/30 text-emerald-400 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  <Percent size={12} className="stroke-[3]" />
                  <span>{onlyDiscounts ? (t("catalog_show_all") || "Ver Todos") : (t("catalog_filter_discounts") || "Promoções")}</span>
                  <span className="px-1 py-0.2 rounded text-[10px] bg-black/20 text-current font-extrabold">
                    {onSaleCount}
                  </span>
                </button>
              )}

              <button
                type="button"
                disabled={isEditor}
                onClick={handleShare}
                title={t("common_share") || "Partilhar Catálogo"}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-md font-bold text-xs border transition-all ${
                  isEditor ? "opacity-75 cursor-default" : "active:scale-95 cursor-pointer"
                } ${
                  isDark ? "border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800" : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check size={13} className="text-emerald-500 stroke-[2.5]" />
                    <span className="text-emerald-500">{t("link_copied") || "Copiado!"}</span>
                  </>
                ) : (
                  <>
                    <Share2 size={13} />
                    <span>{t("common_share") || "Recomendar"}</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Coluna Direita: Showcase (Mockup Visual / Slider) */}
          <div className="md:col-span-5 relative select-none">
            <div className="relative h-52 lg:h-60 w-full rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 bg-zinc-950" style={{ transform: "translateZ(0)" }}>
              {isEditor ? (
                <div className="relative h-full w-full">
                  {editorMockupImage ? (
                    <img 
                      src={editorMockupImage} 
                      alt="Mockup Showcase" 
                      className="h-full w-full object-cover object-center filter brightness-95" 
                    />
                  ) : (
                    <div className={`h-full w-full opacity-70 ${designPalette.bg}`} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/70 border border-white/20 text-white text-[10px] font-semibold">
                      <Sparkles size={11} className="text-amber-400" />
                      <span>{t("catalog_highlights") || "Destaques"}</span>
                    </div>
                    <div className="px-2 py-0.5 rounded-full bg-black/50 text-[9px] text-zinc-300 font-mono">
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
                        className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none filter brightness-95"
                        style={{ 
                          opacity: categoryCoverImages.length === 1 ? 1 : (idx === coverIndex ? 1 : 0), 
                          transition: "opacity 0.8s ease-in-out",
                          willChange: "opacity"
                        }}
                        loading={idx === 0 ? "eager" : "lazy"}
                        decoding="async"
                      />
                    ))
                  ) : (
                    <div className={`h-full w-full opacity-60 ${designPalette.bg}`} />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/70 border border-white/20 text-white text-[10px] font-semibold">
                      <Sparkles size={11} className="text-amber-400" />
                      <span>{t("catalog_recent_highlights") || "Destaques"}</span>
                    </div>

                    {categoryCoverImages.length > 1 && (
                      <div className="px-2 py-0.5 rounded-full bg-black/50 text-[9px] text-zinc-300 font-mono">
                        {coverIndex + 1} / {categoryCoverImages.length}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

        </div>

        {/* MOBILE LAYOUT (< md) */}
        <div className={`md:hidden flex flex-col min-w-0 ${alignContainerClass}`}>
          
          {/* Logo + Identificação */}
          <div className={`flex items-center gap-3 -mt-9 sm:-mt-11 mb-2 relative z-10 w-full ${isCenter ? "flex-col justify-center text-center" : "flex-row justify-start text-left"}`}>
            <div 
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border-2 overflow-hidden shrink-0 flex items-center justify-center ring-1 ring-black/10"
              style={{
                borderColor: isDark ? "#09090b" : "#ffffff",
                backgroundColor: isDark ? "#18181b" : "#ffffff"
              }}
            >
              {storeLogo ? (
                <img src={storeLogo} alt={storeName} className="h-full w-full object-cover" decoding="async" />
              ) : (
                <Store className="h-8 w-8 text-zinc-400" />
              )}
            </div>

            <div className={`flex flex-col min-w-0 ${isCenter ? "items-center pt-1" : "items-start flex-1 pt-4 sm:pt-6"}`}>
              <div className="flex items-center gap-1.5 min-w-0">
                <h1 className={`text-base sm:text-lg font-black tracking-tight truncate ${isDark ? "text-white" : "text-zinc-900"}`}>
                  {storeName}
                </h1>
                <CheckCircle2 size={13} className="text-blue-500 fill-blue-500/20 shrink-0" />
              </div>
              <span className="text-[11px] font-semibold text-zinc-500">
                @{activeStoreSlug || "catalogo"}
              </span>
            </div>
          </div>

          {/* Títulos Mobile */}
          <div className={`flex flex-col w-full max-w-md ${alignContainerClass} space-y-0.5 mt-1 min-w-0`}>
            <div className="relative w-full">
              <h2 
                className={`w-full font-bold leading-snug break-words text-balance line-clamp-2 ${currentFonts.title} ${isDark ? "text-white" : "text-zinc-900"} ${isEditor ? "border border-dashed border-amber-500/40 rounded px-1 text-[16px]" : ""}`}
                contentEditable={isEditor}
                suppressContentEditableWarning={true}
                onKeyDown={(e) => { 
                  if (e.key === "Enter") e.preventDefault(); 
                  if (e.currentTarget.textContent!.length >= MAX_TITLE && e.key !== "Backspace" && !e.key.startsWith("Arrow")) e.preventDefault();
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
            </div>

            <div className="relative w-full">
              <p 
                className={`w-full font-normal leading-relaxed text-xs break-words line-clamp-3 ${isDark ? "text-zinc-400" : "text-zinc-600"} ${isEditor ? "border border-dashed border-amber-500/40 rounded px-1 text-[16px]" : ""}`}
                contentEditable={isEditor}
                suppressContentEditableWarning={true}
                onPaste={(e) => handlePaste(e, MAX_SUBTITLE)}
                onBlur={(e) => {
                  const text = e.currentTarget.innerText || "";
                  const final = text.trim() || fallbackSubtitle;
                  setEditableSubtitle(final);
                  handleBlurText("subtitle", final);
                }}
              >
                {editableSubtitle}
              </p>
            </div>
          </div>

          {/* Barra de Ações Mobile */}
          <div className="w-full mt-3 pt-2.5 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
              <span className="flex items-center gap-1">
                <Package size={12} className="text-zinc-400" />
                <strong>{processedProductsCount}</strong> {t("products") || "itens"}
              </span>
              <span>•</span>
              <span>{storeCurrency}</span>
            </div>

            <div className="flex items-center gap-1.5">
              {onSaleCount > 0 && (
                <button
                  type="button"
                  disabled={isEditor}
                  onClick={onToggleDiscounts}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border ${
                    isEditor ? "opacity-75 cursor-default" : "active:scale-95 cursor-pointer"
                  } ${
                    onlyDiscounts 
                      ? "bg-emerald-600 text-white border-emerald-600" 
                      : isDark ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  <Percent size={10} className="stroke-[3]" />
                  <span>{onSaleCount} {t("on_sale") || "off"}</span>
                </button>
              )}

              <button
                type="button"
                disabled={isEditor}
                onClick={handleShare}
                className={`p-1.5 rounded-full border transition-all ${
                  isEditor ? "opacity-75 cursor-default" : "active:scale-95 cursor-pointer"
                } ${
                  isDark ? "border-zinc-700 bg-zinc-900 text-zinc-200" : "border-zinc-300 bg-white text-zinc-700"
                }`}
                title={t("common_share") || "Partilhar"}
              >
                {copiedLink ? <Check size={13} className="text-emerald-500" /> : <Share2 size={13} />}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
});