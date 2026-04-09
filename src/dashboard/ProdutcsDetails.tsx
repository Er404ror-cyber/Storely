import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ChevronLeft,
  Edit3,
  Loader2,
  Maximize2,
  Minus,
  Plus,
  Share2,
  Store,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAdminStore } from "../hooks/useAdminStore";
import { supabase } from "../lib/supabase";
import type { MediaItem } from "../types/library";
import { MediaModal } from "../components/modal";
import { ProductForm } from "../components/produtos/ProductForm";
import { useTranslate } from "../context/LanguageContext";

export interface ProductFormData {
  name: string;
  category: string;
  price: string;
  unit: string;
  full_description: string;
  main_image: string;
  gallery: string[];
  currency?: string;
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
  currency?: string | null;
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
} as const;

const FALLBACK_CURRENCY = "USD";
const PLACEHOLDER_IMAGE =
  "https://via.placeholder.com/1400x1200/f4f4f5/18181b?text=Product";

  function normalizeCurrency(
    storeCurrency?: string | null,
    storeSettingsCurrency?: string | null,
    productCurrency?: string | null,
    adminCurrency?: string | null
  ) {
    return (
      storeCurrency?.trim()?.toUpperCase() ||
      storeSettingsCurrency?.trim()?.toUpperCase() ||
      productCurrency?.trim()?.toUpperCase() ||
      adminCurrency?.trim()?.toUpperCase() ||
      FALLBACK_CURRENCY
    );
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
  const { storeSlug, productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const pageState = useMemo(
    () => (location.state || {}) as ProductLocationState,
    [location.state]
  );
  const { pathname } = location;

  const { t, language } = useTranslate();
  const { data: adminStore } = useAdminStore();

  const scrollRef = useRef<HTMLDivElement>(null);

  const isEditorRoute = pathname.includes("admin");
  const forceLightUI = isEditorRoute;
  const showVisitStore = !pageState?.fromStore;

  const pageBgClass = forceLightUI
    ? "bg-white text-slate-900"
    : "bg-white text-slate-900 dark:bg-zinc-950 dark:text-zinc-100";

  const navClass = forceLightUI
    ? "border-slate-200 bg-white/92"
    : "border-slate-200 bg-white/92 dark:border-zinc-800 dark:bg-zinc-950/92";

  const panelClass = forceLightUI
    ? "border-slate-200 bg-white"
    : "border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900";

  const softPanelClass = forceLightUI
    ? "border-slate-200 bg-slate-50"
    : "border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900/60";

  const imageWrapClass = forceLightUI
    ? "bg-slate-100"
    : "bg-slate-100 dark:bg-zinc-900";

  const mutedTextClass = forceLightUI
    ? "text-slate-500"
    : "text-slate-500 dark:text-zinc-400";

  const strongTextClass = forceLightUI
    ? "text-slate-950"
    : "text-slate-950 dark:text-white";

  const softMutedTextClass = forceLightUI
    ? "text-slate-400"
    : "text-slate-400 dark:text-zinc-500";

  const hoverSoftClass = forceLightUI
    ? "hover:bg-slate-100"
    : "hover:bg-slate-100 dark:hover:bg-zinc-900";

  const ringCardClass = forceLightUI
    ? "bg-white ring-1 ring-slate-200"
    : "bg-white ring-1 ring-slate-200 dark:bg-zinc-950 dark:ring-zinc-700";

  const thumbBaseClass = forceLightUI
    ? "border-slate-200 hover:border-slate-400"
    : "border-slate-200 hover:border-slate-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-500";

  const [isEditing, setIsEditing] = useState(isCreating);
  const [quantity, setQuantity] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pauseCarousel, setPauseCarousel] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);

  const stateProduct = pageState?.product;
  const stateStore = pageState?.store;

  const emptyFormData = useMemo<ProductFormData>(
    () => ({
      name: "",
      category: "",
      price: "",
      unit: "un",
      full_description: "",
      main_image: "",
      gallery: [],
      currency: normalizeCurrency(
        adminStore?.currency,
        adminStore?.settings?.currency,
        undefined,
        undefined
      ),
    }),
    [adminStore?.currency, adminStore?.settings?.currency]
  );

  const [initialData, setInitialData] = useState<ProductFormData>(emptyFormData);

  const { data: publicStore } = useQuery({
    queryKey: ["public-store", storeSlug],
    queryFn: async (): Promise<PublicStoreData | null> => {
      if (!storeSlug) return null;
  
      const { data, error } = await supabase
        .from("stores")
        .select("id, whatsapp_number, slug, currency, settings, name, logo_url, description")
        .eq("slug", storeSlug)
        .single();
  
      if (error) return null;
      return data as PublicStoreData;
    },
    enabled: !!storeSlug && !stateStore,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    initialData: stateStore ?? undefined,
  });

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: async (): Promise<ProductRow | null> => {
      if (isCreating || !productId) return null;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error) throw error;
      return data as ProductRow;
    },
    enabled: !!productId && !isCreating && !stateProduct,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    initialData: stateProduct ?? undefined,
  });

  const resolvedStore = stateStore || publicStore || null;
  const resolvedProduct = stateProduct || product || null;
  useEffect(() => {
    if (isCreating) {
      setInitialData(emptyFormData);
      return;
    }
  
    if (!resolvedProduct) return;
  
    const resolvedCurrency = normalizeCurrency(
      resolvedStore?.currency,
      resolvedStore?.settings?.currency,
      resolvedProduct.currency,
      adminStore?.currency || adminStore?.settings?.currency
    );
  
    const normalizedMainImage =
      resolvedProduct.main_image ||
      (Array.isArray(resolvedProduct.gallery)
        ? resolvedProduct.gallery[0]
        : "") ||
      "";
  
    const normalizedGallery = Array.isArray(resolvedProduct.gallery)
      ? resolvedProduct.gallery.filter(Boolean)
      : normalizedMainImage
      ? [normalizedMainImage]
      : [];
  
    setInitialData({
      name: resolvedProduct.name ?? "",
      category: resolvedProduct.category ?? "",
      price:
        resolvedProduct.price != null
          ? toMoneyValue(resolvedProduct.price).toFixed(2)
          : "",
      unit: resolvedProduct.unit ?? "un",
      full_description: resolvedProduct.full_description ?? "",
      main_image: normalizedMainImage,
      gallery: normalizedGallery,
      currency: resolvedCurrency,
    });
  
    setActiveIndex(0);
  
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      setShowScrollHint(true);
    }
  }, [
    resolvedProduct,
  
    resolvedStore?.currency,
    resolvedStore?.settings?.currency,
  
    adminStore?.currency,
    adminStore?.settings?.currency,
  
    isCreating,
    emptyFormData,
  ]);

  const previews = useMemo(() => {
    const merged = [initialData.main_image, ...(initialData.gallery || [])]
      .filter(Boolean)
      .filter((value, index, arr) => arr.indexOf(value) === index);

    return merged.length ? merged : [PLACEHOLDER_IMAGE];
  }, [initialData.main_image, initialData.gallery]);

  useEffect(() => {
    if (previews.length <= 1 || isEditing || pauseCarousel) return;

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % previews.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [previews.length, isEditing, pauseCarousel]);

  useEffect(() => {
    if (activeIndex >= previews.length) setActiveIndex(0);
  }, [activeIndex, previews.length]);

  const unitPrice = useMemo(() => toMoneyValue(initialData.price), [initialData.price]);
  const totalPrice = useMemo(() => unitPrice * quantity, [unitPrice, quantity]);

  const currency = useMemo(() => {
    return normalizeCurrency(
      resolvedStore?.currency,
      resolvedStore?.settings?.currency,
      initialData.currency,
      adminStore?.currency || adminStore?.settings?.currency
    );
  }, [
    resolvedStore?.currency,
    resolvedStore?.settings?.currency,
    initialData.currency,
    adminStore?.currency,
    adminStore?.settings?.currency,
  ]);

  const translatedUnit = useMemo(() => {
    const key =
      UNIT_TRANSLATION_KEY_MAP[
        initialData.unit as keyof typeof UNIT_TRANSLATION_KEY_MAP
      ];
  
    return key ? t(key) : initialData.unit;
  }, [initialData.unit, t]);

  const locale = language === "pt" ? "pt-PT" : "en-US";

  const localizedUnitPrice = useMemo(() => {
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits: unitPrice % 1 === 0 ? 0 : 2,
      }).format(unitPrice);
    } catch {
      return `${currency} ${unitPrice.toFixed(unitPrice % 1 === 0 ? 0 : 2)}`;
    }
  }, [currency, unitPrice, locale]);

  const localizedTotalPrice = useMemo(() => {
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits: totalPrice % 1 === 0 ? 0 : 2,
      }).format(totalPrice);
    } catch {
      return `${currency} ${totalPrice.toFixed(totalPrice % 1 === 0 ? 0 : 2)}`;
    }
  }, [currency, totalPrice, locale]);

  const storeName = useMemo(() => {
    return resolvedStore?.name?.trim() || resolvedStore?.slug || "Store";
  }, [resolvedStore?.name, resolvedStore?.slug]);

  const safeDescription = useMemo(() => {
    return clampText(initialData.full_description, 120);
  }, [initialData.full_description]);

  const siteUrl = useMemo(() => {
    return getStoreUrl(resolvedStore?.slug || storeSlug);
  }, [resolvedStore?.slug, storeSlug]);

  const productPageUrl = useMemo(() => {
    return window.location.href;
  }, []);

  const mainImageUrl = useMemo(() => {
    return previews[0] || initialData.main_image || "";
  }, [previews, initialData.main_image]);

  const handleBack = useCallback(() => {
    if (isCreating) {
      onClose?.();
      return;
    }

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(`/${storeSlug}`);
  }, [isCreating, navigate, onClose, storeSlug]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop > 20) {
      setShowScrollHint(false);
    }
  }, []);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: initialData.name || "Product",
      text: `${t("product_details_share_text")} ${initialData.name}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(t("product_details_share_success"));
      }
    } catch {
      //
    }
  }, [initialData.name, t]);

  const openImagePreview = useCallback(() => {
    const url = previews[activeIndex];
    if (!url) return;

    setPreviewMedia({
      url,
      type: "image",
      id: String(activeIndex),
    });
  }, [activeIndex, previews]);

  const handleWhatsAppOrder = useCallback(() => {
    const whatsapp =
      resolvedStore?.whatsapp_number || adminStore?.whatsapp_number;
  
    if (!whatsapp) {
      toast.error(t("product_details_whatsapp_unavailable"));
      return;
    }
  
    const cleanNumber = whatsapp.replace(/\D/g, "");
    const platformName = "Storely";
    const platformUrl = window.location.origin;
  
    const lines = [
      `*${platformName}*`,
      "",
      "Olá! Tenho interesse neste produto.",
      "Hello! I'm interested in this product.",
      "",
      `• Produto / Product: ${initialData.name}`,
      `• Loja / Store: ${storeName}`,
      `• Quantidade / Quantity: ${quantity}`,
      `• Unidade / Unit: ${translatedUnit}`,
      `• Preço / Price: ${localizedUnitPrice}`,
      `• Total: ${localizedTotalPrice}`,
      safeDescription ? `• Resumo / Summary: ${safeDescription}` : "",
      "",
      mainImageUrl ? `• Imagem / Image: ${mainImageUrl}` : "",
      `• Link / Product link: ${productPageUrl}`,
      `• Platform / Plataforma: ${platformUrl}`,
      "",
      "Pode confirmar disponibilidade?",
      "Could you confirm availability?",
      "",
      `— ${platformName}`,
    ].filter(Boolean);
  
    const message = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, "_blank");
  }, [
    resolvedStore?.whatsapp_number,
    adminStore?.whatsapp_number,
    initialData.name,
    storeName,
    quantity,
    translatedUnit,
    localizedUnitPrice,
    localizedTotalPrice,
    safeDescription,
    mainImageUrl,
    productPageUrl,
    t,
  ]);
  if (isLoading && !isCreating && !resolvedProduct) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${pageBgClass}`}>
        <Loader2 className="animate-spin text-slate-700" size={30} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen overflow-x-hidden ${pageBgClass}`}>
      {!isEditing && previewMedia ? (
        <MediaModal
          media={previewMedia}
          onClose={() => setPreviewMedia(null)}
          t={t as (key: string, variables?: Record<string, unknown>) => string}
        />
      ) : null}

      <nav
        className={`fixed left-0 right-0 top-0 z-[120] flex h-16 items-center justify-between border-b px-4  md:px-6 ${navClass}`}
      >
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={handleBack}
            className={`rounded-full p-2 transition ${hoverSoftClass}`}
            aria-label="back"
          >
            <ChevronLeft size={22} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {!isEditorRoute ? (
            <button
              type="button"
              onClick={handleShare}
              className={`rounded-full p-2.5 text-slate-600 transition ${hoverSoftClass}`}
              aria-label="share"
            >
              <Share2 size={18} />
            </button>
          ) : null}

          {isEditorRoute && !isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-white transition hover:bg-slate-800"
            >
              <Edit3 size={14} />
              <span className="text-[10px] font-black uppercase tracking-wider">
                {t("product_details_edit")}
              </span>
            </button>
          ) : null}

          {isEditorRoute && isEditing && !isCreating ? (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-slate-600 transition hover:bg-slate-50"
            >
              <X size={14} />
              <span className="text-[10px] font-black uppercase tracking-wider">
                {t("product_details_cancel")}
              </span>
            </button>
          ) : null}
        </div>
      </nav>

      <main className="mx-auto w-full max-w-7xl px-0 pb-16 md:pt-12 md:px-4 lg:px-6">
        {isEditing && isEditorRoute ? (
          <div className="px-4 pt-6 md:px-0">
            <ProductForm
              productId={isCreating ? undefined : productId}
              isCreating={isCreating}
              initialData={initialData}
              onCancel={() => {
                if (isCreating) onClose?.();
                else setIsEditing(false);
              }}
              onSuccess={() => {
                if (isCreating) onClose?.();
                else setIsEditing(false);
              }}
            />
          </div>
        ) : (
          <>
            <section className={`border-b pb-2 ${forceLightUI ? "border-slate-200 bg-white" : "border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"}`}>
              <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 px-0 md:px-4 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6 lg:px-6">
                <div className="min-w-0">
                  <div className={`overflow-hidden rounded-none shadow-none md:rounded-[2rem] ${imageWrapClass}`}>
                    <div
                      className="relative aspect-[1/0.92] min-h-[420px] w-full sm:aspect-[1.15/0.86] xl:min-h-[520px] lg:aspect-[1.12/1]"
                      onMouseEnter={() => setPauseCarousel(true)}
                      onMouseLeave={() => setPauseCarousel(false)}
                    >
                      <img
                        key={activeIndex}
                        src={previews[activeIndex] || PLACEHOLDER_IMAGE}
                        alt={initialData.name || "Product"}
                        loading={activeIndex === 0 ? "eager" : "lazy"}
                        decoding="async"
                        fetchPriority={activeIndex === 0 ? "high" : "low"}
                        draggable={false}
                        sizes="(max-width: 1024px) 100vw, 58vw"
                        className="h-full w-full object-cover object-center"
                      />

                      <button
                        type="button"
                        onClick={openImagePreview}
                        className="absolute right-4 top-4 z-20 rounded-full bg-black/40 p-2 text-white  transition hover:bg-black/60"
                        aria-label={t("product_details_gallery_open")}
                      >
                        <Maximize2 size={18} />
                      </button>
                    </div>
                  </div>

                  {previews.length > 1 ? (
                    <div className="px-4 pb-1 pt-3 md:px-0">
                      <div className="flex gap-3 overflow-x-auto pb-1">
                        {previews.map((img, index) => (
                          <button
                            key={`${img}-${index}`}
                            type="button"
                            onClick={() => setActiveIndex(index)}
                            className={`group relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border bg-white shadow-sm transition md:h-24 md:w-24 ${
                              index === activeIndex
                                ? forceLightUI
                                  ? "border-slate-900 ring-2 ring-slate-900/10"
                                  : "border-slate-900 ring-2 ring-slate-900/10 dark:border-white dark:ring-white/10"
                                : thumbBaseClass
                            }`}
                          >
                            <img
                              src={img}
                              alt={`${initialData.name || "Product"} ${index + 1}`}
                              loading="lazy"
                              decoding="async"
                              fetchPriority="low"
                              draggable={false}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="min-w-0 px-4 pb-4 pt-1 md:px-0 md:pt-0">
                  <div className="space-y-4">
                    <span
                      className={`inline-flex max-w-full overflow-hidden break-words rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] [overflow-wrap:anywhere] ${
                        forceLightUI
                          ? "bg-slate-100 text-slate-600"
                          : "bg-slate-100 text-slate-600 dark:bg-zinc-900 dark:text-zinc-300"
                      }`}
                    >
                      {initialData.category || t("common_category_general")}
                    </span>

                    <h1
                      className={`max-w-full overflow-hidden break-words text-[clamp(1.8rem,4vw,3.2rem)] font-extrabold leading-[1.02] tracking-tight [overflow-wrap:anywhere] ${strongTextClass}`}
                    >
                      {initialData.name}
                    </h1>

                    <div className={`rounded-[1.8rem] border p-5 shadow-sm ${panelClass}`}>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className={`text-[10px] font-black uppercase tracking-[0.16em] ${softMutedTextClass}`}>
                            {t("product_details_final_value")}
                          </p>

                          <div
                            className={`mt-1 break-words text-[clamp(1.8rem,4vw,2.8rem)] font-black leading-none tracking-tight ${strongTextClass}`}
                          >
                            {localizedTotalPrice}
                          </div>

                          <p
                            className={`mt-2 max-w-full break-words text-xs [overflow-wrap:anywhere] ${mutedTextClass}`}
                          >
                            {localizedUnitPrice} / {translatedUnit}
                          </p>
                        </div>

                        <div className="shrink-0">
                          <p className={`mb-2 text-[10px] font-black uppercase tracking-[0.16em] ${softMutedTextClass}`}>
                            {t("product_details_quantity")}
                          </p>

                          <div
                            className={`inline-flex items-center gap-3 rounded-2xl px-2.5 py-2.5 text-slate-900 ${
                              forceLightUI
                                ? "bg-slate-100"
                                : "bg-slate-100 dark:bg-zinc-950 dark:text-white"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                              className={`rounded-full p-1.5 text-slate-500 transition ${
                                forceLightUI
                                  ? "hover:bg-white hover:text-slate-900"
                                  : "hover:bg-white hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                              }`}
                            >
                              <Minus size={18} />
                            </button>

                            <span className="min-w-[2rem] text-center text-lg font-black tabular-nums">
                              {quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => setQuantity((prev) => prev + 1)}
                              className={`rounded-full p-1.5 text-slate-500 transition ${
                                forceLightUI
                                  ? "hover:bg-white hover:text-slate-900"
                                  : "hover:bg-white hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                              }`}
                            >
                              <Plus size={18} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleWhatsAppOrder}
                        className="mt-4 flex w-full items-center justify-center gap-3 rounded-[1.2rem] bg-slate-950 py-4 text-[11px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-slate-800 active:scale-[0.995]"
                      >
                        {t("product_details_confirm_whatsapp")}
                        <ArrowRight size={16} />
                      </button>
                    </div>

                    {!isEditorRoute && showVisitStore ? (
                      <div className={`rounded-[1.8rem] border p-5 shadow-sm ${softPanelClass}`}>
                        <p className={`text-[10px] font-black uppercase tracking-[0.15em] ${softMutedTextClass}`}>
                          Store
                        </p>

                        <div className="mt-3 flex items-center gap-3">
                          <div className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl ${ringCardClass}`}>
                            {resolvedStore?.logo_url ? (
                              <img
                                src={resolvedStore.logo_url}
                                alt={storeName}
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Store
                                size={22}
                                className={forceLightUI ? "text-slate-500" : "text-slate-500 dark:text-zinc-400"}
                              />
                            )}
                          </div>

                          <div className="min-w-0">
                            <h2 className={`truncate text-base font-black ${strongTextClass}`}>
                              {storeName}
                            </h2>
                            {!!resolvedStore?.description?.trim() && (
                              <p className={`mt-1 line-clamp-2 break-words text-sm ${mutedTextClass}`}>
                                {resolvedStore.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <a
                          href={siteUrl}
                          className={`mt-4 inline-flex w-full items-center justify-center rounded-[1rem] border bg-white px-4 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-slate-900 transition hover:bg-slate-100 ${
                            forceLightUI
                              ? "border-slate-200"
                              : "border-slate-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-800"
                          }`}
                        >
                          Open site
                        </a>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>

            <section className="mx-auto w-full max-w-7xl px-4 pt-5 md:px-4 lg:px-6">
              <div className={`min-w-0 rounded-[1.8rem] border p-5 shadow-sm ${panelClass}`}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${softMutedTextClass}`}>
                    {t("product_details_details")}
                  </span>
                </div>

                <div
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className={`custom-v-scroll max-h-[320px] overflow-y-auto whitespace-pre-wrap break-words [overflow-wrap:anywhere] pr-2 text-sm leading-relaxed ${mutedTextClass}`}
                >
                  {initialData.full_description || t("product_details_no_description")}
                </div>

                {showScrollHint && initialData.full_description?.length > 260 ? (
                  <div
                    className={`pointer-events-none mt-2 h-10 bg-gradient-to-t ${
                      forceLightUI
                        ? "from-white to-transparent"
                        : "from-white to-transparent dark:from-zinc-900"
                    }`}
                  />
                ) : null}
              </div>
            </section>
          </>
        )}
      </main>

      <style>{`
        .custom-v-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .custom-v-scroll::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 9999px;
        }
      `}</style>
    </div>
  );
}