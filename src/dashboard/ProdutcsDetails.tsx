import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAdminStore } from '../hooks/useAdminStore';
import { supabase } from '../lib/supabase';
import type { MediaItem } from '../types/library';
import { MediaModal } from '../components/modal';
import { ProductForm } from '../components/produtos/ProductForm';
import { useTranslate } from '../context/LanguageContext';

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

export function ProductDetails({
  isCreating = false,
  onClose,
}: ProductDetailsProps) {
  const { storeSlug, productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const { t } = useTranslate();
  const { data: adminStore } = useAdminStore();

  const scrollRef = useRef<HTMLDivElement>(null);

  const isEditorRoute = pathname.includes('admin');
  const showVisitStore = !location.state?.fromStore;

  const [isEditing, setIsEditing] = useState(isCreating);
  const [quantity, setQuantity] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pauseCarousel, setPauseCarousel] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);

  const emptyFormData = useMemo<ProductFormData>(
    () => ({
      name: '',
      category: '',
      price: '',
      unit: 'un',
      full_description: '',
      main_image: '',
      gallery: [],
      currency: adminStore?.settings?.currency || 'USD',
    }),
    [adminStore?.settings?.currency]
  );

  const [initialData, setInitialData] = useState<ProductFormData>(emptyFormData);

  const { data: publicStore } = useQuery({
    queryKey: ['public-store', storeSlug],
    queryFn: async () => {
      if (!storeSlug) return null;

      const { data, error } = await supabase
        .from('stores')
        .select('id, whatsapp_number, slug, settings')
        .eq('slug', storeSlug)
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!storeSlug,
  });

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (isCreating || !productId) return null;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!productId && !isCreating,
  });


  useEffect(() => {
    if (isCreating) {
      setInitialData(emptyFormData);
      return;
    }

    if (!product) return;

    setInitialData({
      name: product.name ?? '',
      category: product.category ?? '',
      price: product.price != null ? Number(product.price).toFixed(2) : '',
      unit: product.unit ?? 'un',
      full_description: product.full_description ?? '',
      main_image: product.main_image ?? '',
      gallery: Array.isArray(product.gallery) ? product.gallery : [],
      currency:
        product.currency ||
        publicStore?.settings?.currency ||
        adminStore?.settings?.currency ||
        'MZN',
    });

    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      setShowScrollHint(true);
    }
  }, [product, isCreating, emptyFormData, publicStore?.settings?.currency, adminStore?.settings?.currency]);

  const previews = useMemo(
    () => [initialData.main_image, ...(initialData.gallery || [])].filter(Boolean),
    [initialData.main_image, initialData.gallery]
  );

  useEffect(() => {
    if (previews.length <= 1 || isEditing || pauseCarousel) return;

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % previews.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [previews.length, isEditing, pauseCarousel]);

  useEffect(() => {
    if (activeIndex >= previews.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, previews.length]);

  const totalPrice = useMemo(() => {
    return (Number(initialData.price) || 0) * quantity;
  }, [initialData.price, quantity]);

  const currency = initialData.currency || publicStore?.settings?.currency || adminStore?.settings?.currency || 'MZN';

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
      title: initialData.name,
      text: `${t('product_details_share_text')} ${initialData.name}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(t('product_details_share_success'));
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
      type: 'image',
      id: String(activeIndex),
    });
  }, [activeIndex, previews]);

  const handleWhatsAppOrder = useCallback(() => {
    const whatsapp = publicStore?.whatsapp_number || adminStore?.whatsapp_number;

    if (!whatsapp) {
      toast.error(t('product_details_whatsapp_unavailable'));
      return;
    }

    const cleanNumber = whatsapp.replace(/\D/g, '');
    const message = encodeURIComponent(
      `${t('product_details_order_message_intro')}\n*${initialData.name}*\n${t('product_details_quantity')}: ${quantity}\n${t('product_details_total')}: ${currency} ${totalPrice.toFixed(2)}`
    );

    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  }, [
    publicStore?.whatsapp_number,
    adminStore?.whatsapp_number,
    initialData.name,
    quantity,
    currency,
    totalPrice,
    t,
  ]);

  if (isLoading && !isCreating) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-blue-500" size={30} />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      {!isEditing && previewMedia ? (
        <MediaModal
          media={previewMedia}
          onClose={() => setPreviewMedia(null)}
          t={t as (key: string) => string}
        />
      ) : null}

      <nav className="fixed left-0 right-0 top-0 z-[120] flex h-16 items-center justify-between border-b border-slate-100 bg-white/95 px-4  md:px-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleBack}
            className="rounded-full p-2 transition hover:bg-slate-100"
          >
            <ChevronLeft size={22} />
          </button>

          {!isEditing && showVisitStore ? (
            <button
              type="button"
              onClick={() => navigate(`/${storeSlug}`)}
              className="hidden items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-slate-600 shadow-sm transition hover:bg-slate-50 md:flex"
            >
              <Store size={15} />
              <span className="text-[10px] font-black uppercase tracking-wider">
                {t('product_details_visit_store')}
              </span>
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {!isEditorRoute ? (
            <button
              type="button"
              onClick={handleShare}
              className="rounded-full p-2.5 text-slate-600 transition hover:bg-slate-100"
            >
              <Share2 size={18} />
            </button>
          ) : null}

          {isEditorRoute && !isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-white transition hover:bg-blue-600"
            >
              <Edit3 size={14} />
              <span className="text-[10px] font-black uppercase tracking-wider">
                {t('product_details_edit')}
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
                {t('product_details_cancel')}
              </span>
            </button>
          ) : null}
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-24 md:px-6">
        {isEditing && isEditorRoute ? (
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
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14">
            <div className="lg:sticky lg:top-24">
              <div
                className="group relative aspect-[1/1.05] overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 shadow-sm"
                onClick={openImagePreview}
                onMouseEnter={() => setPauseCarousel(true)}
                onMouseLeave={() => setPauseCarousel(false)}
              >
                <img
                  key={activeIndex}
                  src={previews[activeIndex] || 'https://via.placeholder.com/800'}
                  alt={initialData.name || 'Product'}
                  loading="eager"
                  className="h-full w-full object-cover"
                />

                <div className="absolute right-4 top-4 rounded-full bg-black/20 p-2 opacity-0 transition group-hover:opacity-100">
                  <Maximize2 size={18} className="text-white" />
                </div>

                {previews.length > 1 ? (
                  <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/25 p-2">
                    {previews.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveIndex(index);
                        }}
                        className={`rounded-full transition ${
                          index === activeIndex ? 'h-2 w-7 bg-white' : 'h-2 w-2 bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="space-y-3">
                <span className="text-[11px] font-black uppercase tracking-[0.35em] text-blue-600">
                  {initialData.category || t('common_category_general')}
                </span>

                <h1 className="break-words text-[clamp(1.6rem,5vw,2.4rem)] font-extrabold uppercase leading-[1.05] tracking-tight text-slate-900">
                  {initialData.name}
                </h1>
              </div>

              <div className="rounded-[1.8rem] border border-slate-200 bg-slate-50 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {t('product_details_details')}
                  </span>
                </div>

                <div
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="custom-v-scroll max-h-[220px] overflow-y-auto whitespace-pre-wrap break-words pr-2 text-sm leading-relaxed text-slate-600"
                >
                  {initialData.full_description || t('product_details_no_description')}
                </div>

                {showScrollHint && initialData.full_description?.length > 200 ? (
                  <div className="pointer-events-none mt-2 h-8 bg-gradient-to-t from-slate-50 to-transparent" />
                ) : null}
              </div>

              <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {t('product_details_final_value')}
                    </p>

                    <div className="mt-1 text-4xl font-black tracking-tight text-slate-900">
                      <span className="mr-2 text-xl text-blue-600">{currency}</span>
                      {totalPrice.toFixed(2)}
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      {currency} {Number(initialData.price || 0).toFixed(2)} / {initialData.unit}
                    </p>
                  </div>

                  <div className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className="p-1 text-slate-400 transition hover:text-slate-900"
                    >
                      <Minus size={18} />
                    </button>

                    <span className="w-6 text-center text-lg font-black tabular-nums">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => prev + 1)}
                      className="p-1 text-slate-400 transition hover:text-slate-900"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleWhatsAppOrder}
                  className="mt-6 flex w-full items-center justify-center gap-3 rounded-[1.3rem] bg-slate-900 py-4 text-[11px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-blue-600"
                >
                  {t('product_details_confirm_whatsapp')}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .custom-v-scroll::-webkit-scrollbar { width: 4px; }
        .custom-v-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }
      `}</style>
    </div>
  );
}