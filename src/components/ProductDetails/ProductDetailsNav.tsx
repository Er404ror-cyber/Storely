import { memo } from "react";
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
  navClass: string;
  hoverSoftClass: string;
  t: any;
}

export const ProductDetailsNav = memo(function ProductDetailsNav({
  isCreating,
  onClose,
  isEditorRoute,
  isEditing,
  setIsEditing,
  handleShare,
  copied,
  storeSlug,
  navClass,
  hoverSoftClass,
  t,
}: ProductDetailsNavProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleHomeClick = () => {
    if (pathname.includes("products") || pathname.includes("/p/")) {
      navigate(`/${storeSlug}`, { replace: true });
    } else if (pathname.includes("blog")) {
      navigate("/", { replace: true });
    } else {
      navigate(`/${storeSlug}`, { replace: true });
    }
  };

  return (
    <nav className={`sticky top-0 z-[10010] flex h-16 items-center justify-between border-b px-4 md:px-6 shadow-sm ${navClass}`}>
      <button
        type="button"
        onClick={() => (isCreating ? onClose?.() : navigate(-1))}
        className={`rounded-full p-2 transition ${hoverSoftClass}`}
        aria-label="back"
      >
        <ChevronLeft size={24} />
      </button>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleHomeClick}
          className="flex items-center justify-center rounded-full bg-slate-100 p-2.5 text-slate-700 shadow-sm transition hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transform-gpu active:scale-95"
          aria-label="home"
          title={pathname.includes("blog") ? "Ir para o Início Geral" : "Ir para o Início da Loja"}
        >
          <Home size={18} />
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-zinc-700"></div>

        {!isEditorRoute && (
          <button
            type="button"
            onClick={handleShare}
            className={`rounded-full p-2.5 transition ${hoverSoftClass}`}
            aria-label={copied ? "Link copiado" : "Compartilhar"}
            title={copied ? "Link copiado!" : "Compartilhar"}
          >
            {copied ? (
              <Check size={20} className="text-green-600 dark:text-green-400" />
            ) : (
              <Share2 size={20} />
            )}
          </button>
        )}

        {isEditorRoute && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-white shadow-sm transition hover:bg-slate-800"
          >
            <Edit3 size={16} />
            <span className="text-[11px] font-black uppercase tracking-wider">
              {t("product_details_edit" as any) || "Editar"}
            </span>
          </button>
        )}

        {isEditorRoute && isEditing && !isCreating && (
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-slate-600 transition hover:bg-slate-50"
          >
            <X size={16} />
            <span className="text-[11px] font-black uppercase tracking-wider">
              {t("product_details_cancel" as any) || "Cancelar"}
            </span>
          </button>
        )}
      </div>
    </nav>
  );
});