import { memo, useCallback, useState, useEffect, useRef } from "react";
import { ChevronLeft, Share2, Edit3, X, Home, Check } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface ProductDetailsNavProps {
  isCreating: boolean;
  onClose?: () => void;
  isEditorRoute: boolean;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  handleShare: () => void;
  copied: boolean;
  storeSlug: string;
  navClass?: string;
  hoverSoftClass?: string;
  t: (key: string | any, ...args: any[]) => string;
}

const BTN_BASE =
  "pointer-events-auto transform-gpu flex h-10 w-10 items-center justify-center rounded-2xl " +
  "bg-white text-zinc-700 shadow-md ring-1 ring-black/10 " +
  "transition-[transform,background-color,color] duration-150 ease-out " +
  "hover:bg-zinc-50 hover:text-black hover:scale-105 active:scale-90 active:bg-zinc-100 " +
  "dark:bg-zinc-900 dark:text-zinc-200 dark:ring-white/15 dark:shadow-black/50 " +
  "dark:hover:bg-zinc-800 dark:hover:text-white dark:active:bg-zinc-700";

const BTN_EDIT =
  "pointer-events-auto transform-gpu flex h-10 items-center gap-2 rounded-2xl " +
  "bg-zinc-950 px-4 text-white shadow-md ring-1 ring-white/20 " +
  "transition-[transform,background-color] duration-150 ease-out " +
  "hover:bg-black hover:scale-105 active:scale-95 " +
  "dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100";

const BTN_CANCEL =
  `${BTN_BASE} !w-auto gap-2 px-4 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300`;

export const ProductDetailsNav = memo(function ProductDetailsNav({
  isCreating,
  onClose,
  isEditorRoute,
  isEditing,
  setIsEditing,
  handleShare,
  copied,
  storeSlug,
  navClass = "",
  hoverSoftClass = "",
  t,
}: ProductDetailsNavProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsScrolled(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const handleHomeClick = useCallback(() => {
    if (pathname.includes("blog")) {
      navigate("/", { replace: true });
    } else {
      navigate(`/${storeSlug}`, { replace: true });
    }
  }, [pathname, storeSlug, navigate]);

  const handleBack = useCallback(() => {
    if (isCreating) {
      onClose?.();
    } else {
      navigate(-1);
    }
  }, [isCreating, onClose, navigate]);

  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
  }, [setIsEditing]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
  }, [setIsEditing]);

  return (
    <>
      {/* Sentinela no topo para alternar layouts com zero custo contínuo */}
      <div
        ref={sentinelRef}
        aria-hidden="true"
        className="absolute top-0 left-0 h-px w-full pointer-events-none opacity-0"
      />

      <header
        style={{ willChange: "background-color, border-color, box-shadow" }}
        className={`sticky top-0 z-[10010] flex h-16 w-full items-center justify-between px-4 transition-[background-color,border-color,box-shadow] duration-200 ease-out md:px-6 ${
          isScrolled
            ? "pointer-events-none !bg-transparent !border-transparent !shadow-none"
            : "pointer-events-auto border-b border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950"
        } ${navClass}`}
      >
        {/* Botão Voltar */}
        <button
          type="button"
          onClick={handleBack}
          className={`${BTN_BASE} ${hoverSoftClass}`}
          aria-label="Voltar"
        >
          <ChevronLeft size={20} className="stroke-[2.25]" />
        </button>

        {/* Ações da Direita */}
        <div className="pointer-events-none flex items-center gap-2">
          <button
            type="button"
            onClick={handleHomeClick}
            className={`${BTN_BASE} ${hoverSoftClass}`}
            aria-label="Início"
            title={pathname.includes("blog") ? "Ir para o Início Geral" : "Ir para o Início da Loja"}
          >
            <Home size={17} className="stroke-[2.25]" />
          </button>

          {!isEditorRoute && (
            <button
              type="button"
              onClick={handleShare}
              className={`${BTN_BASE} ${hoverSoftClass}`}
              aria-label={copied ? "Link copiado" : "Compartilhar"}
              title={copied ? "Link copiado!" : "Compartilhar"}
            >
              {copied ? (
                <Check size={17} className="stroke-[2.5] text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Share2 size={17} className="stroke-[2.25]" />
              )}
            </button>
          )}

          {/* Botão de Editar */}
          {isEditorRoute && !isEditing && (
            <button
              type="button"
              onClick={handleStartEdit}
              className={BTN_EDIT}
            >
              <Edit3 size={14} className="stroke-[2.5]" />
              <span className="text-xs font-semibold tracking-wide">
                {t("product_details_edit") || "Editar"}
              </span>
            </button>
          )}

          {/* Botão de Cancelar */}
          {isEditorRoute && isEditing && !isCreating && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className={BTN_CANCEL}
            >
              <X size={15} className="stroke-[2.5]" />
              <span className="text-xs font-semibold tracking-wide">
                {t("product_details_cancel") || "Cancelar"}
              </span>
            </button>
          )}
        </div>
      </header>
    </>
  );
});