import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  Edit3,
  ImageOff,
  Loader2,
  Maximize2,
  Minus,
  Plus,
  Share2,
  X,
  ShieldCheck,
  MessageCircle,
  BadgeCheck,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { createPortal } from "react-dom";

import { useAdminStore } from "../hooks/useAdminStore";
import { useStorePublic } from "../hooks/useStorePublic";
import { supabase } from "../lib/supabase";
import type { MediaItem } from "../types/library";
import { MediaModal } from "../components/modal";
import { ProductForm } from "../components/produtos/ProductForm";
import { useTranslate } from "../context/LanguageContext";
import { FALLBACK_CURRENCY, FALLBACK_PRODUCT, FALLBACK_STORE } from "../utils/constants";


export interface ProductFormData {
  name: string;
  category: string;
  price: string;
  unit: string;
  full_description: string;
  main_image: string;
  gallery: string[];
}

interface ProductDetailsProps {
  isCreating?: boolean;
  onClose?: () => void;
}

type PublicStoreData = {
  id?: string;
  slug: string;
  name?: string;
  whatsapp_number?: string | null;
  currency?: string | null;
  settings?: {
    currency?: string;
    [key: string]: unknown;
  } | null;
  logo_url?: string | null;
  description?: string | null;
};

type ProductRow = {
  id: string;
  name?: string | null;
  category?: string | null;
  price?: number | string | null;
  unit?: string | null;
  full_description?: string | null;
  main_image?: string | null;
  gallery?: string[] | null;
  store_id?: string | null;
};

type ProductLocationState = {
  product?: ProductRow;
  store?: PublicStoreData;
  source?: "feed" | "search" | "store";
  searchMode?: string;
  fromStore?: boolean;
};

const UNIT_TRANSLATION_KEY_MAP = {
  un: "product_form_unit_un",
  par: "product_form_unit_par",
  kit: "product_form_unit_kit",
  pacote: "product_form_unit_pacote",
  caixa: "product_form_unit_caixa",
  kg: "product_form_unit_kg",
  g: "product_form_unit_g",
  l: "product_form_unit_l",
  ml: "product_form_unit_ml",
  m: "product_form_unit_m",
  cm: "product_form_unit_cm",
  m2: "product_form_unit_m2",
  m3: "product_form_unit_m3",
  hora: "product_form_unit_hora",
  dia: "product_form_unit_dia",
  semana: "product_form_unit_semana",
  mes: "product_form_unit_mes",
  servico: "product_form_unit_servico",
  peca: "product_form_unit_peca",
} as const;

const PLACEHOLDER_IMAGE = FALLBACK_PRODUCT;

function normalizeCurrency(storeCurrency?: string | null, storeSettingsCurrency?: string | null, adminCurrency?: string | null) {
  return storeCurrency?.trim()?.toUpperCase() || storeSettingsCurrency?.trim()?.toUpperCase() || adminCurrency?.trim()?.toUpperCase() || FALLBACK_CURRENCY;
}

function toMoneyValue(price: string | number | null | undefined) {
  const value = typeof price === "number" ? price : Number(price || 0);
  return Number.isFinite(value) ? value : 0;
}

function clampText(value: string | null | undefined, max = 120) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

function getStoreUrl(storeSlug?: string) {
  if (!storeSlug) return window.location.origin;
  return `${window.location.origin}/${storeSlug}`;
}

export function ProductDetails({
  isCreating = false,
  onClose,
}: ProductDetailsProps) {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  const storeSlug = useMemo(() => {
    if (params.storeSlug) return params.storeSlug;
    const segments = pathname.split("/").filter(Boolean);
    return segments[0] || "";
  }, [params.storeSlug, pathname]);

  const { productId } = params;

  const pageState = useMemo(() => (location.state || {}) as ProductLocationState, [location.state]);

  const { t, language } = useTranslate();
  const { data: adminStore } = useAdminStore();

  const scrollRef = useRef<HTMLDivElement>(null);

  const isEditorRoute = pathname.includes("admin");
  const forceLightUI = isEditorRoute;
  const showVisitStore = !pageState?.fromStore;

  const pageBgClass = forceLightUI
    ? "bg-slate-50 text-slate-900"
    : "bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-100";

  const navClass = forceLightUI
    ? "border-slate-200 bg-white/92 "
    : "border-slate-200 bg-white/92  dark:border-zinc-800 dark:bg-zinc-950/92";

  const panelClass = forceLightUI
    ? "border-slate-200 bg-white"
    : "border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900";

  const softPanelClass = forceLightUI
    ? "border-slate-200 bg-slate-50"
    : "border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900/60";

  const imageWrapClass = forceLightUI ? "bg-slate-200" : "bg-slate-200 dark:bg-zinc-900";
  const mutedTextClass = forceLightUI ? "text-slate-500" : "text-slate-500 dark:text-zinc-400";
  const strongTextClass = forceLightUI ? "text-slate-950" : "text-slate-950 dark:text-white";
  const softMutedTextClass = forceLightUI ? "text-slate-400" : "text-slate-400 dark:text-zinc-500";
  const hoverSoftClass = forceLightUI ? "hover:bg-slate-100" : "hover:bg-slate-100 dark:hover:bg-zinc-900";

  const [isEditing, setIsEditing] = useState(isCreating);
  const [quantity, setQuantity] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pauseCarousel, setPauseCarousel] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [noImg, setNoImg] = useState(false);

  // ==========================================
  // BLOQUEIO DE SCROLL NATIVO
  // Impede que a página de trás "role" quando o modal está aberto
  // ==========================================
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const emptyFormData = useMemo<ProductFormData>(() => ({
    name: "", category: "", price: "", unit: "un", full_description: "", main_image: "", gallery: [],
  }), []);

  const [initialData, setInitialData] = useState<ProductFormData>(emptyFormData);

  const { data: publicStore } = useStorePublic(storeSlug);

  // ==========================================
  // OTIMIZAÇÃO DE API E CACHE EXTREMO (Para o plano Free do Supabase)
  // staleTime: 1 hora, gcTime: 24 horas (Evita recargas constantes)
  // ==========================================
  const { data: product, isLoading } = useQuery({
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

  useEffect(() => {
    if (isCreating) {
      setInitialData(emptyFormData);
      return;
    }
    if (!resolvedProduct) return;

    const normalizedMainImage = resolvedProduct.main_image || (Array.isArray(resolvedProduct.gallery) ? resolvedProduct.gallery[0] : "") || "";
    const normalizedGallery = Array.isArray(resolvedProduct.gallery) ? resolvedProduct.gallery.filter(Boolean) : normalizedMainImage ? [normalizedMainImage] : [];

    setInitialData({
      name: resolvedProduct.name ?? "",
      category: resolvedProduct.category ?? "",
      price: resolvedProduct.price != null ? toMoneyValue(resolvedProduct.price).toFixed(2) : "",
      unit: resolvedProduct.unit ?? "un",
      full_description: resolvedProduct.full_description ?? "",
      main_image: normalizedMainImage,
      gallery: normalizedGallery,
    });
    setActiveIndex(0);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [resolvedProduct, isCreating, emptyFormData]);

  const previews = useMemo(() => {
    const merged = [initialData.main_image, ...(initialData.gallery || [])].filter(Boolean).filter((value, index, arr) => arr.indexOf(value) === index);
    return merged.length ? merged : [PLACEHOLDER_IMAGE];
  }, [initialData.main_image, initialData.gallery]);

  useEffect(() => {
    if (previews.length <= 1 || isEditing || pauseCarousel) return;
    const timer = window.setInterval(() => setActiveIndex((prev) => (prev + 1) % previews.length), 4200);
    return () => window.clearInterval(timer);
  }, [previews.length, isEditing, pauseCarousel]);

  const unitPrice = useMemo(() => toMoneyValue(initialData.price), [initialData.price]);
  const totalPrice = useMemo(() => unitPrice * quantity, [unitPrice, quantity]);

  const currency = useMemo(() => {
    return normalizeCurrency(resolvedStore?.currency, resolvedStore?.settings?.currency, adminStore?.currency || adminStore?.settings?.currency);
  }, [resolvedStore, adminStore]);

  const translatedUnit = useMemo(() => {
    const key = UNIT_TRANSLATION_KEY_MAP[initialData.unit as keyof typeof UNIT_TRANSLATION_KEY_MAP];
    return key ? t(key as any) : initialData.unit;
  }, [initialData.unit, t]);

  const locale = language === "pt" ? "pt-PT" : "en-US";

  const formatMoney = (val: number) => {
    try {
      return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: val % 1 === 0 ? 0 : 2 }).format(val);
    } catch {
      return `${currency} ${val.toFixed(val % 1 === 0 ? 0 : 2)}`;
    }
  };

  const localizedUnitPrice = formatMoney(unitPrice);
  const localizedTotalPrice = formatMoney(totalPrice);

  const storeName = resolvedStore?.name?.trim() || resolvedStore?.slug || "Store";
  const safeDescription = clampText(initialData.full_description, 120);
  const siteUrl = getStoreUrl(resolvedStore?.slug || storeSlug);
  const productPageUrl = window.location.href;

  const handleBack = useCallback(() => {
    if (isCreating) { onClose?.(); return; }
    if (window.history.length > 1) { navigate(-1); return; }
    navigate(`/${storeSlug}`);
  }, [isCreating, navigate, onClose, storeSlug]);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: initialData.name || "Product",
      text: `${t("product_details_share_text" as any) || "Check out this product:"} ${initialData.name}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(t("product_details_share_success" as any) || "Link copied!");
      }
    } catch {}
  }, [initialData.name, t]);

  const openImagePreview = useCallback(() => {
    const url = previews[activeIndex];
    if (!url) return;
    setPreviewMedia({ url, type: "image", id: String(activeIndex) });
  }, [activeIndex, previews]);

  const handleWhatsAppOrder = useCallback(() => {
    const whatsapp = resolvedStore?.whatsapp_number || adminStore?.whatsapp_number;
    if (!whatsapp) {
      toast.error(t("product_details_whatsapp_unavailable" as any) || "WhatsApp indisponível.");
      return;
    }

    const cleanNumber = whatsapp.replace(/\D/g, "");
    
    // Traduções Dinâmicas para a mensagem do WhatsApp (Garante que a mensagem vai no idioma do cliente)
    const txtGreeting = t("wa_greeting" as any) || "Olá! Tenho interesse neste produto.";
    const txtProduct = t("wa_product" as any) || "Produto";
    const txtStore = t("wa_store" as any) || "Loja";
    const txtQuantity = t("wa_quantity" as any) || "Quantidade";
    const txtUnit = t("wa_unit" as any) || "Unidade";
    const txtPrice = t("wa_price" as any) || "Preço";
    const txtTotal = t("wa_total" as any) || "Total";
    const txtSummary = t("wa_summary" as any) || "Resumo";
    const txtLink = t("wa_link" as any) || "Link";
    const txtConfirm = t("wa_confirm" as any) || "Pode confirmar a disponibilidade?";

    const lines = [
      `*Storely*`,
      "",
      txtGreeting,
      "",
      `• ${txtProduct}: ${initialData.name}`,
      `• ${txtStore}: ${storeName}`,
      `• ${txtQuantity}: ${quantity}`,
      `• ${txtUnit}: ${translatedUnit}`,
      `• ${txtPrice}: ${localizedUnitPrice}`,
      `• ${txtTotal}: *${localizedTotalPrice}*`,
      safeDescription ? `• ${txtSummary}: ${safeDescription}` : "",
      `• ${txtLink}: ${productPageUrl}`,
      "",
      txtConfirm
    ].filter(Boolean);

    const message = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, "_blank");
  }, [resolvedStore, adminStore, initialData.name, storeName, quantity, translatedUnit, localizedUnitPrice, localizedTotalPrice, safeDescription, productPageUrl, t]);

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>, fallback: string, setErr: (v: boolean) => void) => {
    const tg = e.currentTarget;
    if (tg.src !== fallback) { tg.src = fallback; setErr(true); }
  };
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = FALLBACK_STORE;
  };

  if (isLoading && !isCreating && !resolvedProduct) {
    return createPortal(
      <div className={`fixed inset-0 z-[10000] flex items-center justify-center ${pageBgClass}`}>
        <Loader2 className="animate-spin text-slate-700" size={30} />
      </div>,
      document.body
    );
  }

  // ==========================================
  // O PORTAL DEFINITIVO (Z-index 10000 cobrindo tudo, inclusive o Header z-40)
  // Utilização de 100dvh para lidar com a barra de navegação dos iPhones
  // ==========================================
  return createPortal(
    <div className={`fixed inset-0 z-[10000] h-[100dvh] w-full overflow-y-auto overflow-x-hidden ${pageBgClass}`}>
      
      {!isEditing && previewMedia ? (
        <MediaModal media={previewMedia} onClose={() => setPreviewMedia(null)} t={t as any} />
      ) : null}

      <nav className={`sticky top-0 z-[10010] flex h-16 items-center justify-between border-b px-4 md:px-6 shadow-sm ${navClass}`}>
        <button type="button" onClick={handleBack} className={`rounded-full p-2 transition ${hoverSoftClass}`} aria-label="back">
          <ChevronLeft size={24} />
        </button>

        <div className="flex items-center gap-2">
          {!isEditorRoute && (
            <button type="button" onClick={handleShare} className={`rounded-full p-2.5 transition ${hoverSoftClass}`}>
              <Share2 size={20} />
            </button>
          )}

          {isEditorRoute && !isEditing && (
            <button type="button" onClick={() => setIsEditing(true)} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-white transition hover:bg-slate-800 shadow-sm">
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

      <main className="mx-auto w-full max-w-6xl px-0 pb-32 md:px-4 md:pt-8 lg:px-8">
        {isEditing && isEditorRoute ? (
          <div className="px-4 pt-6 md:px-0">
            <ProductForm
              productId={isCreating ? undefined : productId}
              isCreating={isCreating}
              initialData={initialData}
              onCancel={() => (isCreating ? onClose?.() : setIsEditing(false))}
              onSuccess={() => (isCreating ? onClose?.() : setIsEditing(false))}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] md:gap-8 lg:gap-12 lg:grid-cols-[1.2fr_1fr]">
            
            {/* ==========================================
                COLUNA ESQUERDA: Galeria Otimizada (Anti-CLS)
                ========================================== */}
            <div className="flex flex-col">
              <div className={`overflow-hidden md:rounded-3xl shadow-sm ${imageWrapClass}`}>
                <div
                  className="relative aspect-square w-full sm:aspect-[4/3] md:aspect-square"
                  onMouseEnter={() => setPauseCarousel(true)}
                  onMouseLeave={() => setPauseCarousel(false)}
                >
                  <img
                    key={activeIndex}
                    src={previews[activeIndex] || PLACEHOLDER_IMAGE}
                    alt={initialData.name || "Product"}
                    loading={activeIndex === 0 ? "eager" : "lazy"}
                    fetchPriority={activeIndex === 0 ? "high" : "low"}
                    className="h-full w-full object-cover object-center transform-gpu"
                    onError={(e) => handleImgError(e, FALLBACK_PRODUCT, setNoImg)}
                  />
                  {noImg && (
                    <div className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] bg-white/90 shadow-sm ">
                      <ImageOff size={12} className="text-slate-500" />
                      {t("noImage" as any) || "Sem Imagem"}
                    </div>
                  )}
                  <button type="button" onClick={openImagePreview} className="absolute right-4 top-4 z-20 rounded-full bg-black/50 p-2.5 text-white transition hover:bg-black/70 ">
                    <Maximize2 size={20} />
                  </button>
                </div>
              </div>

              {previews.length > 1 && (
                <div className="px-4 py-4 md:px-0">
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                    {previews.map((img, index) => (
                      <button
                        key={`${img}-${index}`}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        className={`group relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border transition-all ${index === activeIndex ? "border-slate-900 ring-2 ring-slate-900/10 shadow-md dark:border-white" : "border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100 dark:border-zinc-700"}`}
                      >
                        <img src={img} alt="Thumb" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ==========================================
                COLUNA DIREITA: Detalhes e Conversão (Psicologia)
                ========================================== */}
            <div className="px-4 pt-2 md:px-0 md:pt-0">
              
              <span className={`inline-block mb-3 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${forceLightUI ? "bg-slate-200/60 text-slate-700" : "bg-slate-200/60 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300"}`}>
                {initialData.category || t("common_category_general" as any) || "Geral"}
              </span>

              <h1 className={`text-[2rem] md:text-[2.5rem] font-extrabold leading-[1.1] tracking-tight mb-2 [overflow-wrap:anywhere] ${strongTextClass}`}>
                {initialData.name}
              </h1>

              <p className={`text-2xl font-black tracking-tight mb-6 ${strongTextClass}`}>
                {localizedUnitPrice} <span className="text-sm font-semibold text-slate-500">/ {translatedUnit}</span>
              </p>

              {/* BOX CENTRAL DE AÇÃO */}
              <div className={`rounded-3xl border p-5 shadow-sm mb-8 ${panelClass}`}>
                
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.16em] mb-2 ${softMutedTextClass}`}>
                      {t("product_details_quantity" as any) || "Quantidade"}
                    </p>
                    <div className={`inline-flex items-center gap-4 rounded-2xl p-1.5 ${forceLightUI ? "bg-slate-100" : "bg-slate-100 dark:bg-zinc-950"}`}>
                      <button type="button" onClick={() => setQuantity((p) => Math.max(1, p - 1))} className="rounded-xl bg-white p-2 text-slate-700 shadow-sm transition hover:scale-105 active:scale-95 dark:bg-zinc-800 dark:text-zinc-300">
                        <Minus size={18} />
                      </button>
                      <span className="min-w-[2rem] text-center text-lg font-black tabular-nums">{quantity}</span>
                      <button type="button" onClick={() => setQuantity((p) => p + 1)} className="rounded-xl bg-white p-2 text-slate-700 shadow-sm transition hover:scale-105 active:scale-95 dark:bg-zinc-800 dark:text-zinc-300">
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <p className={`text-[10px] font-black uppercase tracking-[0.16em] ${softMutedTextClass}`}>
                      {t("product_details_final_value" as any) || "Valor Final"}
                    </p>
                    <div className={`text-3xl font-black tabular-nums ${strongTextClass}`}>{localizedTotalPrice}</div>
                  </div>
                </div>

                <div className="hidden md:block">
                  <button onClick={handleWhatsAppOrder} className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-slate-900 py-4 text-[12px] font-black uppercase tracking-[0.16em] text-white shadow-lg transition hover:bg-slate-800 active:scale-[0.98] dark:bg-white dark:text-slate-950">
                    <span className="relative z-10 flex items-center gap-2">
                      <MessageCircle size={18} />
                      {t("product_details_confirm_whatsapp" as any) || "Pedir via WhatsApp"}
                    </span>
                  </button>
                  <div className="mt-4 flex items-center justify-center gap-4 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1"><ShieldCheck size={14}/> {t("safe_contact" as any) || "Contacto Direto"}</span>
                  </div>
                </div>
              </div>

              {/* DESCRIÇÃO COMPLETA */}
              <div className="mb-8">
                <h3 className={`text-[11px] font-black uppercase tracking-[0.15em] mb-3 ${softMutedTextClass}`}>
                  {t("product_details_details" as any) || "Detalhes do Produto"}
                </h3>
                <div className={`text-[15px] leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere] ${mutedTextClass}`}>
                  {initialData.full_description || t("product_details_no_description" as any) || "Sem descrição disponível."}
                </div>
              </div>

              {/* TRUST SIGNALS (Box da Loja) */}
              {!isEditorRoute && showVisitStore && (
                <div className={`rounded-3xl border p-5 transition hover:shadow-md ${softPanelClass}`}>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:ring-zinc-700">
                      <img src={resolvedStore?.logo_url || FALLBACK_STORE} alt={storeName} className="h-full w-full object-cover" 
                      onError={handleImageError}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h2 className={`truncate text-lg font-black ${strongTextClass}`}>{storeName}</h2>
                        <BadgeCheck size={16} className="text-blue-500 shrink-0" />
                      </div>
                      <p className={`truncate text-sm mt-0.5 ${mutedTextClass}`}>{t("Vendedor_Verificado" as any) || "Vendedor Verificado"}
                      </p>
                    </div>
                  </div>
                  <Link to={siteUrl} className={`mt-4 flex w-full items-center justify-center rounded-xl bg-white border border-slate-200 py-3 text-[11px] font-black uppercase tracking-wider text-slate-900 shadow-sm transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-800`}>
                    {t("Open_site" as any) || "Visitar Loja"}
                  </Link>
                </div>
              )}

            </div>
          </div>
        )}
      </main>

   
      {!isEditing && (
        <div className={`fixed bottom-0 left-0 right-0 z-[10020] border-t border-slate-200 bg-white/90 p-4 pb-safe backdrop-blur-lg md:hidden dark:border-zinc-800 dark:bg-zinc-950/90`}>
          <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
            <div className="flex flex-col">
              <span className={`text-[10px] font-bold uppercase ${mutedTextClass}`}>{t("wa_total" as any) || "Total"}</span>
              <span className={`text-lg font-black leading-none tabular-nums ${strongTextClass}`}>{localizedTotalPrice}</span>
            </div>
            <button onClick={handleWhatsAppOrder} className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 text-[11px] font-black uppercase tracking-wider text-white shadow-lg active:scale-95 dark:bg-white dark:text-slate-950">
              <MessageCircle size={16} />
              {t("product_details_confirm_whatsapp" as any) || "Comprar"}
            </button>
          </div>
        </div>
      )}

      <style>{`
        /* Utilitários de Performance e UX */
        .pb-safe { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>,
    document.body
  );
}