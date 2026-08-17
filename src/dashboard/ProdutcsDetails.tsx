import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createPortal } from "react-dom";

import { useAdminStore } from "../hooks/useAdminStore";
import { useStorePublic } from "../hooks/useStorePublic";
import { supabase } from "../lib/supabase";
import { ProductForm } from "../components/produtos/ProductForm";
import { useTranslate } from "../context/LanguageContext";
import { FALLBACK_CURRENCY, FALLBACK_PRODUCT } from "../utils/constants";
import { ProductGallery } from "../components/produtos/componentsAdmim/ProductGallery";
import { ProductCheckout } from "../components/produtos/componentsAdmim/ProductCheckout";
import { ProductDescription } from "../components/produtos/componentsAdmim/ProductDescription";
import { StoreTrustCard } from "../components/produtos/componentsAdmim/StoreTrustCard";
import { RelatedProductsCache } from "../components/produtos/componentsAdmim/RelatedProductsCache";
import { MobileStickyBar } from "../components/produtos/componentsAdmim/MobileStickyBar";
import { useWhatsAppOrder } from "../hooks/useWhatsAppOrder";
import { ProductDetailsNav } from "../components/ProductDetails/ProductDetailsNav";

export interface ProductFormData {
  name: string; category: string; price: string; unit: string; full_description: string; main_image: string; gallery: string[]; stock?: number;
  discount_percent?: string;
}
interface ProductDetailsProps { isCreating?: boolean; onClose?: () => void; }
type PublicStoreData = { id?: string; slug: string; name?: string; whatsapp_number?: string | null; currency?: string | null; settings?: any; logo_url?: string | null; description?: string | null; };
type ProductRow = { 
  id: string; store_id?: string | null; name?: string | null; slug?: string | null;
  price?: number | string | null; description?: string | null; image_url?: string | null;
  is_active?: boolean | null; created_at?: string | null; category?: string | null; 
  gallery?: string[] | null; main_image?: string | null; full_description?: string | null; 
  unit?: string | null; stock?: number | null;
  discount_percent?: number | null;
};
type ProductLocationState = { product?: ProductRow; store?: PublicStoreData; source?: string; searchMode?: string; fromStore?: boolean; };

const UNIT_TRANSLATION_KEY_MAP = {
  un: "product_form_unit_un", peca: "product_form_unit_peca", pacote: "product_form_unit_pacote", caixa: "product_form_unit_caixa", kit: "product_form_unit_kit", conjunto: "product_form_unit_conjunto", par: "product_form_unit_par",
  kg: "product_form_unit_kg", g: "product_form_unit_g", l: "product_form_unit_l", ml: "product_form_unit_ml",
  fardo: "product_form_unit_fardo", cento: "product_form_unit_cento",
  servico: "product_form_unit_servico",
  hora: "product_form_unit_hora", dia: "product_form_unit_dia", semana: "product_form_unit_semana", mes: "product_form_unit_mes", ano: "product_form_unit_ano",
  m: "product_form_unit_m", cm: "product_form_unit_cm", mm: "product_form_unit_mm", rolo: "product_form_unit_rolo",
  m2: "product_form_unit_m2", m3: "product_form_unit_m3", t: "product_form_unit_t",
} as const;

export function ProductDetails({ isCreating = false, onClose }: ProductDetailsProps) {
  const params = useParams();
  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();

  const storeSlug = useMemo(() => params.storeSlug || pathname.split("/").filter(Boolean)[0] || "", [params.storeSlug, pathname]);
  const { productId } = params;
  
  const pageState = useMemo(() => (location.state || {}) as ProductLocationState, [location.state]);

  const { t, language } = useTranslate();
  const { data: adminStore } = useAdminStore();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { sendWhatsAppOrder } = useWhatsAppOrder();
  const isEditorRoute = pathname.includes("admin");
  const forceLightUI = isEditorRoute;
  const showVisitStore = !pageState?.fromStore;

  const styles = useMemo(() => ({
    pageBg: forceLightUI ? "bg-slate-50 text-slate-900" : "bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-100",
    nav: forceLightUI ? "border-slate-200 bg-white/92 " : "border-slate-200 bg-white/92  dark:border-zinc-800 dark:bg-zinc-950/92",
    panel: forceLightUI ? "border-slate-200 bg-white" : "border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
    softPanel: forceLightUI ? "border-slate-200 bg-slate-50" : "border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900/60",
    imageWrap: forceLightUI ? "bg-slate-200" : "bg-slate-200 dark:bg-zinc-900",
    mutedText: forceLightUI ? "text-slate-500" : "text-slate-500 dark:text-zinc-400",
    strongText: forceLightUI ? "text-slate-950" : "text-slate-950 dark:text-white",
    softMutedText: forceLightUI ? "text-slate-400" : "text-slate-400 dark:text-zinc-500",
    hoverSoft: forceLightUI ? "hover:bg-slate-100" : "hover:bg-slate-100 dark:hover:bg-zinc-900"
  }), [forceLightUI]);

  const [isEditing, setIsEditing] = useState(isCreating);
  const [quantity, setQuantity] = useState(1);
  const [customNote, setCustomNote] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: "auto" }); 
  }, [productId]);

  const { data: publicStore } = useStorePublic(storeSlug);

  const { data: product } = useQuery({
    queryKey: ["product", productId],
    queryFn: async (): Promise<ProductRow | null> => {
      if (isCreating || !productId) return null;
      const queryCache = queryClient.getQueriesData<ProductRow[]>({ queryKey: ["products"] });
      for (const [_, cachedProducts] of queryCache) {
        if (cachedProducts && Array.isArray(cachedProducts)) {
          const found = cachedProducts.find((p) => p.id === productId);
          if (found) return found;
        }
      }
      const { data, error } = await supabase.from("products").select("*").eq("id", productId).single();
      if (error) throw error;
      return data as ProductRow;
    },
    enabled: !!productId && !isCreating, 
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60 * 24,
    initialData: () => {
      if (pageState?.product) return pageState.product;
      const queryCache = queryClient.getQueriesData<ProductRow[]>({ queryKey: ["products"] });
      for (const [_, cachedProducts] of queryCache) {
        if (cachedProducts && Array.isArray(cachedProducts)) {
          const found = cachedProducts.find((p) => p.id === productId);
          if (found) return found;
        }
      }
      return undefined;
    },
  });

  const resolvedProduct = product || null; 
  const resolvedStore = (pageState?.store || publicStore || null) as PublicStoreData | null;

  const initialData = useMemo<ProductFormData>(() => {
    if (isCreating || !resolvedProduct) {
      return { name: "", category: "", price: "", unit: "un", full_description: "", main_image: "", gallery: [], discount_percent: "" };
    }
    const normalizedMainImage = resolvedProduct.main_image || resolvedProduct.image_url || (Array.isArray(resolvedProduct.gallery) ? resolvedProduct.gallery[0] : "") || "";
    return {
      name: resolvedProduct.name ?? "",
      category: resolvedProduct.category ?? "",
      price: resolvedProduct.price != null ? Number(resolvedProduct.price).toFixed(2) : "",
      unit: resolvedProduct.unit ?? "un",
      full_description: resolvedProduct.full_description ?? resolvedProduct.description ?? "",
      main_image: normalizedMainImage,
      gallery: Array.isArray(resolvedProduct.gallery) ? resolvedProduct.gallery.filter(Boolean) : normalizedMainImage ? [normalizedMainImage] : [],
      stock: resolvedProduct.stock ?? undefined,
      discount_percent: resolvedProduct.discount_percent != null ? String(resolvedProduct.discount_percent) : "",
    };
  }, [resolvedProduct, isCreating]);

  const handleProductUpdateSuccess = useCallback((updatedProductData?: any) => {
    if (updatedProductData && productId) {
      queryClient.setQueryData(["product", productId], (old: any) => ({ ...old, ...updatedProductData }));
      queryClient.setQueriesData({ queryKey: ["products"] }, (oldList: any) => {
        if (!Array.isArray(oldList)) return oldList;
        return oldList.map(p => p.id === productId ? { ...p, ...updatedProductData } : p);
      });
    }
  
    if (onClose) {
      onClose();
    } else {
      setIsEditing(false);
      navigate(`/admin/produtos`);
    }
  }, [queryClient, productId, onClose, navigate]);

  useEffect(() => {
    setQuantity(1);
    setCustomNote("");
  }, [productId]);

  const previews = useMemo(() => {
    const merged = [initialData.main_image, ...(initialData.gallery || [])].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
    return merged.length ? merged : [];
  }, [initialData.main_image, initialData.gallery]);

  const unitPriceOriginal = useMemo(() => Number(initialData.price || 0), [initialData.price]);
  const discountPercent = useMemo(() => {
    const val = parseInt(initialData.discount_percent || "0", 10);
    return isNaN(val) ? 0 : val;
  }, [initialData.discount_percent]);

  const unitPriceFinal = useMemo(() => {
    if (discountPercent > 0) return unitPriceOriginal - (unitPriceOriginal * (discountPercent / 100));
    return unitPriceOriginal;
  }, [unitPriceOriginal, discountPercent]);

  const totalPriceFinal = useMemo(() => unitPriceFinal * quantity, [unitPriceFinal, quantity]);

  const currency = useMemo(() => (resolvedStore?.currency || resolvedStore?.settings?.currency || adminStore?.currency || FALLBACK_CURRENCY).toUpperCase(), [resolvedStore, adminStore]);
  const locale = language === "pt" ? "pt-PT" : "en-US";

  const formatMoney = useCallback((val: number) => {
    try { return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: val % 1 === 0 ? 0 : 2 }).format(val); } 
    catch { return `${currency} ${val.toFixed(val % 1 === 0 ? 0 : 2)}`; }
  }, [locale, currency]);

  const translatedUnit = UNIT_TRANSLATION_KEY_MAP[initialData.unit as keyof typeof UNIT_TRANSLATION_KEY_MAP] ? t(UNIT_TRANSLATION_KEY_MAP[initialData.unit as keyof typeof UNIT_TRANSLATION_KEY_MAP] as any) : initialData.unit;

  // Gatilhos Mentais de Venda Embutidos e Dinâmicos via Traduções
  const handleWhatsAppOrder = useCallback(() => {
    const totalOriginal = unitPriceOriginal * quantity;
    const totalSaved = totalOriginal - totalPriceFinal;

    let optimizedNote = "";
    
    if (discountPercent > 0) {
      optimizedNote = `${t("whatsapp_discount_title" as any)} ${discountPercent}${t("whatsapp_discount_suffix" as any)}\n\n${t("whatsapp_price_from" as any)}${formatMoney(totalOriginal)}~\n${t("whatsapp_price_to" as any)}${formatMoney(totalPriceFinal)}*\n${t("whatsapp_savings_prefix" as any)}${formatMoney(totalSaved)}${t("whatsapp_savings_suffix" as any)}`;
      
      if (customNote) {
        optimizedNote += `\n\n${t("whatsapp_customer_note" as any)} ${customNote}`;
      }
    } else {
      optimizedNote = customNote;
    }

    sendWhatsAppOrder({
      storeName: resolvedStore?.name || storeSlug,
      whatsappNumber: resolvedStore?.whatsapp_number || adminStore?.whatsapp_number,
      productName: initialData.name,
      quantity,
      unit: translatedUnit,
      totalPrice: formatMoney(totalPriceFinal),
      customNote: optimizedNote, 
      imageUrl: initialData.main_image,
    });
  }, [sendWhatsAppOrder, resolvedStore, adminStore, storeSlug, initialData.name, quantity, translatedUnit, totalPriceFinal, formatMoney, customNote, initialData.main_image, discountPercent, unitPriceOriginal, t]);

  const handleShare = useCallback(async () => {
    const shareData = { title: initialData?.name || "Storely", text: `Confira ${initialData?.name || "este link"}!`, url: window.location.href };
    if (navigator.share && navigator.canShare?.(shareData)) {
      try { await navigator.share(shareData); } catch (err) { console.log("Erro share nativo", err); }
    } else {
      try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); } 
      catch (err) { console.log("Erro clipboard", err); }
    }
  }, [initialData?.name]);

  return createPortal(
    <div ref={scrollRef} className={`fixed inset-0 z-[10000] h-[100dvh] w-full overflow-y-auto overflow-x-hidden ${styles.pageBg}`}>
      <ProductDetailsNav
        isCreating={isCreating} onClose={onClose} isEditorRoute={isEditorRoute}
        isEditing={isEditing} setIsEditing={setIsEditing} handleShare={handleShare}
        copied={copied} storeSlug={storeSlug} navClass={styles.nav} 
        hoverSoftClass={styles.hoverSoft} t={t}
      />

      <main className="mx-auto w-full max-w-6xl px-0 pb-36 md:px-4 md:pt-10 lg:px-8">
        {isEditing && isEditorRoute ? (
          <div className="px-4 pt-6 md:px-0">
            <ProductForm 
              productId={isCreating ? undefined : productId} 
              isCreating={isCreating} 
              initialData={initialData} 
              onCancel={() => (isCreating ? onClose?.() : setIsEditing(false))} 
              onSuccess={handleProductUpdateSuccess} 
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] md:gap-10 lg:gap-14">
              <ProductGallery images={previews} productName={initialData.name} fallbackImage={FALLBACK_PRODUCT} imageWrapClass={styles.imageWrap} t={t} />

              <div className="px-4 pt-4 md:px-0 md:pt-0 flex flex-col">
                <span className={`inline-block mb-3 self-start rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${forceLightUI ? "bg-slate-200/60 text-slate-700" : "bg-slate-200/60 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300"}`}>
                  {initialData.category || t("common_category_general" as any) || "Geral"}
                </span>
                
                <h1 className={`text-[2rem] md:text-[2.5rem] font-extrabold leading-[1.15] tracking-tight mb-2 [overflow-wrap:anywhere] ${styles.strongText}`}>
                  {initialData.name}
                </h1>
                
                <div className="flex flex-wrap items-end gap-3 mb-8">
                  <p className={`text-2xl font-black tracking-tight ${styles.strongText}`}>
                    {formatMoney(unitPriceFinal)} <span className="text-[15px] font-semibold text-slate-500">/ {translatedUnit}</span>
                  </p>
                  
                  {discountPercent > 0 && (
                    <>
                      <p className="text-lg font-semibold text-slate-400 line-through mb-[2px]">
                        {formatMoney(unitPriceOriginal)}
                      </p>
                      <span className="mb-1 rounded-lg bg-amber-100 px-2 py-0.5 text-[11px] font-black text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                        -{discountPercent}%
                      </span>
                    </>
                  )}
                </div>

                <ProductCheckout quantity={quantity} setQuantity={setQuantity} customNote={customNote} setCustomNote={setCustomNote} localizedTotalPrice={formatMoney(totalPriceFinal)} translatedUnit={translatedUnit} handleWhatsAppOrder={handleWhatsAppOrder} forceLightUI={forceLightUI} panelClass={styles.panel} softMutedTextClass={styles.softMutedText} strongTextClass={styles.strongText} isEditorRoute={isEditorRoute} t={t} />

                {!isEditorRoute && showVisitStore && (
                  <StoreTrustCard storeName={resolvedStore?.name || storeSlug} storeLogo={resolvedStore?.logo_url || ""} siteUrl={window.location.origin + "/" + storeSlug} softPanelClass={styles.softPanel} strongTextClass={styles.strongText} mutedTextClass={styles.mutedText} t={t} />
                )}
              </div>
            </div>

            {/* Componente de Descrição Estruturada */}
            <ProductDescription
              fullDescription={initialData.full_description}
              styles={{ mutedText: styles.mutedText, strongText: styles.strongText }}
              t={t}
            />

            {!isEditorRoute && !isEditing && (
              <div style={{ contentVisibility: 'auto', containIntrinsicSize: '0 400px' }}>
                <RelatedProductsCache currentProductId={productId || ""} currentCategory={initialData.category} currentStoreId={resolvedStore?.id} storeSlugFallback={storeSlug} panelClass={styles.panel} strongTextClass={styles.strongText} mutedTextClass={styles.mutedText} formatMoney={formatMoney} t={t} />
              </div>
            )}
          </>
        )}
      </main>

      {!isEditing && <MobileStickyBar localizedTotalPrice={formatMoney(totalPriceFinal)} handleWhatsAppOrder={handleWhatsAppOrder} mutedTextClass={styles.mutedText} strongTextClass={styles.strongText} t={t} />}

      <style>{`.pb-safe { padding-bottom: max(1rem, env(safe-area-inset-bottom)); } .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>, document.body
  );
}