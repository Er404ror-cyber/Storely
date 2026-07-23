import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Edit3,  Share2, X, AlignLeft, Home, Check } from "lucide-react";
import { createPortal } from "react-dom";

import { useAdminStore } from "../hooks/useAdminStore";
import { useStorePublic } from "../hooks/useStorePublic";
import { supabase } from "../lib/supabase";
import { ProductForm } from "../components/produtos/ProductForm";
import { useTranslate } from "../context/LanguageContext";
import { FALLBACK_CURRENCY, FALLBACK_PRODUCT } from "../utils/constants";
import { ProductGallery } from "../components/produtos/componentsAdmim/ProductGallery";
import { ProductCheckout } from "../components/produtos/componentsAdmim/ProductCheckout";
import { StoreTrustCard } from "../components/produtos/componentsAdmim/StoreTrustCard";
import { RelatedProductsCache } from "../components/produtos/componentsAdmim/RelatedProductsCache";
import { MobileStickyBar } from "../components/produtos/componentsAdmim/MobileStickyBar";
import { useWhatsAppOrder } from "../hooks/useWhatsAppOrder";



// [As tuas interfaces mantêm-se iguais]
export interface ProductFormData {
  name: string; category: string; price: string; unit: string; full_description: string; main_image: string; gallery: string[];
}
interface ProductDetailsProps { isCreating?: boolean; onClose?: () => void; }
type PublicStoreData = { id?: string; slug: string; name?: string; whatsapp_number?: string | null; currency?: string | null; settings?: any; logo_url?: string | null; description?: string | null; };
type ProductRow = { id: string; name?: string | null; category?: string | null; price?: number | string | null; unit?: string | null; full_description?: string | null; main_image?: string | null; gallery?: string[] | null; store_id?: string | null; };
type ProductLocationState = { product?: ProductRow; store?: PublicStoreData; source?: string; searchMode?: string; fromStore?: boolean; };

const UNIT_TRANSLATION_KEY_MAP = {
  un: "product_form_unit_un", par: "product_form_unit_par", kit: "product_form_unit_kit", pacote: "product_form_unit_pacote", caixa: "product_form_unit_caixa", kg: "product_form_unit_kg", g: "product_form_unit_g", l: "product_form_unit_l", ml: "product_form_unit_ml", m: "product_form_unit_m", cm: "product_form_unit_cm", m2: "product_form_unit_m2", m3: "product_form_unit_m3", hora: "product_form_unit_hora", dia: "product_form_unit_dia", semana: "product_form_unit_semana", mes: "product_form_unit_mes", servico: "product_form_unit_servico", peca: "product_form_unit_peca",
} as const;

export function ProductDetails({ isCreating = false, onClose }: ProductDetailsProps) {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  const storeSlug = useMemo(() => params.storeSlug || pathname.split("/").filter(Boolean)[0] || "", [params.storeSlug, pathname]);
  const { productId } = params;
  const pageState = useMemo(() => (location.state || {}) as ProductLocationState, [location.state]);

  const { t, language } = useTranslate();
  const { data: adminStore } = useAdminStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { sendWhatsAppOrder } = useWhatsAppOrder(); // <-- Hook já importado
  const isEditorRoute = pathname.includes("admin");
  const forceLightUI = isEditorRoute;
  const showVisitStore = !pageState?.fromStore;

  // CSS Classes
  const pageBgClass = forceLightUI ? "bg-slate-50 text-slate-900" : "bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-100";
  const navClass = forceLightUI ? "border-slate-200 bg-white/92 " : "border-slate-200 bg-white/92  dark:border-zinc-800 dark:bg-zinc-950/92";
  const panelClass = forceLightUI ? "border-slate-200 bg-white" : "border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900";
  const softPanelClass = forceLightUI ? "border-slate-200 bg-slate-50" : "border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900/60";
  const imageWrapClass = forceLightUI ? "bg-slate-200" : "bg-slate-200 dark:bg-zinc-900";
  const mutedTextClass = forceLightUI ? "text-slate-500" : "text-slate-500 dark:text-zinc-400";
  const strongTextClass = forceLightUI ? "text-slate-950" : "text-slate-950 dark:text-white";
  const softMutedTextClass = forceLightUI ? "text-slate-400" : "text-slate-400 dark:text-zinc-500";
  const hoverSoftClass = forceLightUI ? "hover:bg-slate-100" : "hover:bg-slate-100 dark:hover:bg-zinc-900";

  const [isEditing, setIsEditing] = useState(isCreating);
  const [quantity, setQuantity] = useState(1);
  const [customNote, setCustomNote] = useState("");
  const [copied, setCopied] = useState(false);
  


  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const { data: publicStore } = useStorePublic(storeSlug);

  const { data: product } = useQuery({
    queryKey: ["product", productId],
    queryFn: async (): Promise<ProductRow | null> => {
      if (isCreating || !productId) return null;
      const { data, error } = await supabase.from("products").select("*").eq("id", productId).single();
      if (error) throw error;
      return data as ProductRow;
    },
    enabled: !!productId && !isCreating && !pageState?.product,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    initialData: pageState?.product ?? undefined,
  });

  const resolvedStore = (pageState?.store || publicStore || null) as PublicStoreData | null;
  const resolvedProduct = pageState?.product || product || null;

  const [initialData, setInitialData] = useState<ProductFormData>({ name: "", category: "", price: "", unit: "un", full_description: "", main_image: "", gallery: [] });

  useEffect(() => {
    if (isCreating) return;
    if (!resolvedProduct) return;

    const normalizedMainImage = resolvedProduct.main_image || (Array.isArray(resolvedProduct.gallery) ? resolvedProduct.gallery[0] : "") || "";
    setInitialData({
      name: resolvedProduct.name ?? "",
      category: resolvedProduct.category ?? "",
      price: resolvedProduct.price != null ? Number(resolvedProduct.price).toFixed(2) : "",
      unit: resolvedProduct.unit ?? "un",
      full_description: resolvedProduct.full_description ?? "",
      main_image: normalizedMainImage,
      gallery: Array.isArray(resolvedProduct.gallery) ? resolvedProduct.gallery.filter(Boolean) : normalizedMainImage ? [normalizedMainImage] : [],
    });
    setQuantity(1);
    setCustomNote("");
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [resolvedProduct, isCreating]);

  const previews = useMemo(() => {
    const merged = [initialData.main_image, ...(initialData.gallery || [])].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
    return merged.length ? merged : [];
  }, [initialData.main_image, initialData.gallery]);

  const unitPrice = useMemo(() => Number(initialData.price || 0), [initialData.price]);
  const totalPrice = useMemo(() => unitPrice * quantity, [unitPrice, quantity]);

  const currency = useMemo(() => (resolvedStore?.currency || resolvedStore?.settings?.currency || adminStore?.currency || FALLBACK_CURRENCY).toUpperCase(), [resolvedStore, adminStore]);
  const locale = language === "pt" ? "pt-PT" : "en-US";

  const formatMoney = useCallback((val: number) => {
    try { return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: val % 1 === 0 ? 0 : 2 }).format(val); } 
    catch { return `${currency} ${val.toFixed(val % 1 === 0 ? 0 : 2)}`; }
  }, [locale, currency]);

  const translatedUnit = UNIT_TRANSLATION_KEY_MAP[initialData.unit as keyof typeof UNIT_TRANSLATION_KEY_MAP] ? t(UNIT_TRANSLATION_KEY_MAP[initialData.unit as keyof typeof UNIT_TRANSLATION_KEY_MAP] as any) : initialData.unit;

  const handleWhatsAppOrder = useCallback(() => {
    // 💡 SOLUÇÃO: Passamos initialData.main_image para ter o link direto do Cloudinary
    sendWhatsAppOrder({
      storeName: resolvedStore?.name || storeSlug,
      whatsappNumber: resolvedStore?.whatsapp_number || adminStore?.whatsapp_number,
      productName: initialData.name,
      quantity,
      unit: translatedUnit,
      totalPrice: formatMoney(totalPrice),
      customNote,
      imageUrl: initialData.main_image, // <-- ADICIONADO AQUI: Link direto da foto
    });
  }, [
    sendWhatsAppOrder, 
    resolvedStore, 
    adminStore, 
    storeSlug, 
    initialData.name, 
    quantity, 
    translatedUnit, 
    totalPrice, 
    formatMoney, 
    customNote,
    initialData.main_image // <-- Adicionado ao array de dependências
  ]);


const handleShare = async () => {
  const shareData = {
    title: initialData?.name || "Storely",
    text: `Confira ${initialData?.name || "este link"}!`,
    url: window.location.href,
  };

  // Se for mobile / tiver suporte ao share nativo
  if (navigator.share && navigator.canShare?.(shareData)) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      console.log("Erro ao compartilhar nativamente", err);
    }
  } else {
    // Fallback para Desktop: Copiar link
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reseta o ícone após 2 segundos
    } catch (err) {
      console.log("Erro ao copiar link", err);
    }
  }
};
  return createPortal(
    <div className={`fixed inset-0 z-[10000] h-[100dvh] w-full overflow-y-auto overflow-x-hidden ${pageBgClass}`}>
<nav className={`sticky top-0 z-[10010] flex h-16 items-center justify-between border-b px-4 md:px-6 shadow-sm ${navClass}`}>
               
        <button 
      type="button" 
      onClick={() => isCreating ? onClose?.() : navigate(-1)} 
      className={`rounded-full p-2 transition ${hoverSoftClass}`} 
      aria-label="back"
    >
      <ChevronLeft size={24} />
    </button>

        <div className="flex items-center gap-3">
          
        <button 
  type="button" 
  onClick={() => {
    // Se a rota contiver "products" ou "p", volta para a home da loja
    if (pathname.includes("products") || pathname.includes("/p/")) {
      navigate(`/${storeSlug}`, { replace: true });
    } 
    // Se a rota contiver "blog", volta para o marketplace geral
    else if (pathname.includes("blog")) {
      navigate("/", { replace: true });
    } 
    // Fallback de segurança por precaução
    else {
      navigate(`/${storeSlug}`, { replace: true });
    }
  }} 
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
            <button type="button" onClick={() => setIsEditing(true)} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-white shadow-sm transition hover:bg-slate-800">
              <Edit3 size={16} />
              <span className="text-[11px] font-black uppercase tracking-wider">{t("product_details_edit" as any) || "Editar"}</span>
            </button>
          )}

          {isEditorRoute && isEditing && !isCreating && (
            <button type="button" onClick={() => setIsEditing(false)} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-slate-600 transition hover:bg-slate-50">
              <X size={16} />
              <span className="text-[11px] font-black uppercase tracking-wider">{t("product_details_cancel" as any) || "Cancelar"}</span>
            </button>
          )}
        </div>
      </nav>

      <main className="mx-auto w-full max-w-6xl px-0 pb-36 md:px-4 md:pt-10 lg:px-8">
        {isEditing && isEditorRoute ? (
          <div className="px-4 pt-6 md:px-0">
            <ProductForm productId={isCreating ? undefined : productId} isCreating={isCreating} initialData={initialData} onCancel={() => (isCreating ? onClose?.() : setIsEditing(false))} onSuccess={() => setIsEditing(false)} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] md:gap-10 lg:gap-14">
              <ProductGallery images={previews} productName={initialData.name} fallbackImage={FALLBACK_PRODUCT} imageWrapClass={imageWrapClass} t={t} />

              <div className="px-4 pt-4 md:px-0 md:pt-0 flex flex-col">
                <span className={`inline-block mb-3 self-start rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${forceLightUI ? "bg-slate-200/60 text-slate-700" : "bg-slate-200/60 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300"}`}>
                  {initialData.category || t("common_category_general" as any) || "Geral"}
                </span>
                <h1 className={`text-[2rem] md:text-[2.5rem] font-extrabold leading-[1.15] tracking-tight mb-2 [overflow-wrap:anywhere] ${strongTextClass}`}>{initialData.name}</h1>
                <p className={`text-2xl font-black tracking-tight mb-8 ${strongTextClass}`}>{formatMoney(unitPrice)} <span className="text-[15px] font-semibold text-slate-500">/ {translatedUnit}</span></p>

                <ProductCheckout quantity={quantity} setQuantity={setQuantity} customNote={customNote} setCustomNote={setCustomNote} localizedTotalPrice={formatMoney(totalPrice)} translatedUnit={translatedUnit} handleWhatsAppOrder={handleWhatsAppOrder} forceLightUI={forceLightUI} panelClass={panelClass} softMutedTextClass={softMutedTextClass} strongTextClass={strongTextClass} isEditorRoute={isEditorRoute} t={t} />

                {!isEditorRoute && showVisitStore && (
                  <StoreTrustCard storeName={resolvedStore?.name || storeSlug} storeLogo={resolvedStore?.logo_url || ""} siteUrl={window.location.origin + "/" + storeSlug} softPanelClass={softPanelClass} strongTextClass={strongTextClass} mutedTextClass={mutedTextClass} t={t} />
                )}
              </div>
            </div>

            {initialData.full_description && (
              <div className="mt-12 md:mt-20 border-t border-slate-200 pt-10 dark:border-zinc-800 px-4 md:px-0">
                <div className="flex items-center gap-2 mb-6"><AlignLeft size={20} className={mutedTextClass} /><h3 className={`text-xl font-extrabold tracking-tight ${strongTextClass}`}>{t("product_details_details" as any) || "Details"}</h3></div>
                <div className={`max-w-3xl text-[16px] leading-loose whitespace-pre-wrap [overflow-wrap:anywhere] ${mutedTextClass}`}>{initialData.full_description}</div>
              </div>
            )}

            {!isEditorRoute && !isEditing && (
              <RelatedProductsCache currentProductId={productId || ""} currentCategory={initialData.category} currentStoreId={resolvedStore?.id} storeSlugFallback={storeSlug} panelClass={panelClass} strongTextClass={strongTextClass} mutedTextClass={mutedTextClass} formatMoney={formatMoney} t={t} />
            )}
          </>
        )}
      </main>

      {!isEditing && <MobileStickyBar localizedTotalPrice={formatMoney(totalPrice)} handleWhatsAppOrder={handleWhatsAppOrder} mutedTextClass={mutedTextClass} strongTextClass={strongTextClass} t={t} />}

      <style>{`.pb-safe { padding-bottom: max(1rem, env(safe-area-inset-bottom)); } .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>, document.body
  );
}