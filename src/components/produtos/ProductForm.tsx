import { memo, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import type { ChangeEvent, KeyboardEvent, FocusEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlignLeft,
  Check,
  CloudLightning,
  ImagePlus,
  Info,
  Loader2,
  Package2,
  PencilLine,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { supabase } from '../../lib/supabase';
import { deleteFromCloudinary, uploadToCloudinary } from '../../utils/cloud';
import { useAdminStore } from '../../hooks/useAdminStore';
import { useTranslate } from '../../context/LanguageContext';
import {
  composePrice,
  createProductSlug,
  formatBytes, // Importado para mostrar os tamanhos das imagens
  normalizeCategory,
  normalizePriceString,
  PRODUCT_IMAGE_LIMIT,
  PRODUCT_IMAGE_SLOTS,
  PRODUCT_LIMITS,
  PRODUCT_UNIT_OPTIONS,
  sanitizeCents,
  sanitizeMajor,
  splitPrice,
} from './productForm.utils';
import { MOCK_GLOBAL_CATEGORIES } from './componentsPublic/SearchMocks';

export interface ProductFormData {
  name: string;
  category: string;
  price: string;
  unit: string;
  full_description: string;
  main_image: string;
  gallery: string[];
}

interface ProductFormProps {
  productId?: string;
  isCreating?: boolean;
  initialData: ProductFormData;
  onCancel?: () => void;
  onSuccess?: (updatedProduct?: Record<string, unknown> | null) => void;
}

type PersistedSlotToken = {
  slot: number;
  token: string;
  savedAt: number;
};

const TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutos
const IMAGE_COMPRESS_URL = 'https://imagecompressor.com/';

export const ProductForm = memo(function ProductForm({
  productId,
  isCreating = false,
  initialData,
  onCancel,
  onSuccess,
}: ProductFormProps) {
  const { t } = useTranslate();
  const { data: adminStore } = useAdminStore();
  const queryClient = useQueryClient();

  // Referências aos URLs locais (blobs) apenas para garantir a limpeza de RAM (memory leaks)
  const localUrlsRef = useRef<string[]>(Array(PRODUCT_IMAGE_SLOTS).fill(''));

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category: '',
    price: '',
    unit: 'un',
    full_description: '',
    main_image: '',
    gallery: [],
  });

  const [priceMajor, setPriceMajor] = useState('');
  const [priceCents, setPriceCents] = useState('');

  const [previews, setPreviews] = useState<string[]>(Array(PRODUCT_IMAGE_SLOTS).fill(''));
  const [tempFiles, setTempFiles] = useState<(File | null)[]>(Array(PRODUCT_IMAGE_SLOTS).fill(null));
  const [tempDeleteTokens, setTempDeleteTokens] = useState<(string | null)[]>(Array(PRODUCT_IMAGE_SLOTS).fill(null));
  const [fileSizes, setFileSizes] = useState<number[]>(Array(PRODUCT_IMAGE_SLOTS).fill(0));
  const [uploadErrors, setUploadErrors] = useState<string[]>(Array(PRODUCT_IMAGE_SLOTS).fill(''));
  const [processingSlots, setProcessingSlots] = useState<boolean[]>(Array(PRODUCT_IMAGE_SLOTS).fill(false));
  const [visibleExtraSlots, setVisibleExtraSlots] = useState(0);
  const [isSyncingPhotos, setIsSyncingPhotos] = useState(false);

  // Chave única para o localStorage baseada no produto e loja atual
  const storageKey = useMemo(() => {
    const storePart = adminStore?.id || 'no-store';
    const productPart = productId || (isCreating ? 'new-product' : 'unknown-product');
    return `product-form-delete-tokens:${storePart}:${productPart}`;
  }, [adminStore?.id, productId, isCreating]);

  // Gestão de Tokens de Apagamento Locais (TTL de 10 mins)
  const loadPersistedTokens = useCallback((): (string | null)[] => {
    if (typeof window === 'undefined') return Array(PRODUCT_IMAGE_SLOTS).fill(null);
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return Array(PRODUCT_IMAGE_SLOTS).fill(null);
      
      const parsed = JSON.parse(raw) as PersistedSlotToken[];
      const now = Date.now();
      const result = Array(PRODUCT_IMAGE_SLOTS).fill(null) as (string | null)[];
      const stillValid: PersistedSlotToken[] = [];
      
      for (const item of parsed || []) {
        if (typeof item?.slot !== 'number' || typeof item?.token !== 'string' || typeof item?.savedAt !== 'number') continue;
        if (item.slot < 0 || item.slot >= PRODUCT_IMAGE_SLOTS) continue;
        if (now - item.savedAt > TOKEN_TTL_MS) continue; // Ignora tokens expirados
        
        result[item.slot] = item.token;
        stillValid.push(item);
      }
      
      window.localStorage.setItem(storageKey, JSON.stringify(stillValid));
      return result;
    } catch {
      return Array(PRODUCT_IMAGE_SLOTS).fill(null);
    }
  }, [storageKey]);

  const persistTokens = useCallback(
    (tokens: (string | null)[]) => {
      if (typeof window === 'undefined') return;
      try {
        const now = Date.now();
        const payload: PersistedSlotToken[] = tokens
          .map((token, slot) => (token ? { slot, token, savedAt: now } : null))
          .filter(Boolean) as PersistedSlotToken[];
        window.localStorage.setItem(storageKey, JSON.stringify(payload));
      } catch (error) {
        console.error('[ProductForm] Falha ao persistir tokens de deleção:', error);
      }
    },
    [storageKey]
  );

  const updateDeleteTokens = useCallback(
    (updater: (prev: (string | null)[]) => (string | null)[]) => {
      setTempDeleteTokens((prev) => {
        const next = updater(prev);
        persistTokens(next);
        return next;
      });
    },
    [persistTokens]
  );

  const clearPersistedSlotToken = useCallback(
    (index: number) => {
      updateDeleteTokens((prev) => {
        const next = [...prev];
        next[index] = null;
        return next;
      });
    },
    [updateDeleteTokens]
  );

  // PREVENÇÃO DE LEAKS: Limpeza absoluta de blobs ao desmontar componente
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      localUrlsRef.current.forEach((url) => {
        if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    };
  }, []);

  // Sincronização inicial de dados baseados na prop `initialData`
  useEffect(() => {
    const mergedImages = [
      initialData.main_image || '',
      ...(initialData.gallery || []).slice(0, PRODUCT_IMAGE_SLOTS - 1),
    ];
    const parsed = splitPrice(initialData.price);
    const restoredTokens = loadPersistedTokens();

    setFormData({
      name: initialData.name || '',
      category: initialData.category || '',
      price: initialData.price ? normalizePriceString(initialData.price) : '',
      unit: initialData.unit || 'un',
      full_description: initialData.full_description || '',
      main_image: initialData.main_image || '',
      gallery: initialData.gallery || [],
    });

    setPriceMajor(parsed.major || '');
    setPriceCents(parsed.cents === '00' ? '' : parsed.cents);

    const nextPreviews = [
      ...mergedImages,
      ...Array(Math.max(0, PRODUCT_IMAGE_SLOTS - mergedImages.length)).fill(''),
    ].slice(0, PRODUCT_IMAGE_SLOTS);

    setPreviews(nextPreviews);
    setTempFiles(Array(PRODUCT_IMAGE_SLOTS).fill(null));
    setTempDeleteTokens(restoredTokens);
    
    // Tentamos recuperar tamanhos das imagens, mas para URLs existentes será 0, o que está correto
    setFileSizes(Array(PRODUCT_IMAGE_SLOTS).fill(0)); 
    setUploadErrors(Array(PRODUCT_IMAGE_SLOTS).fill(''));
    setProcessingSlots(Array(PRODUCT_IMAGE_SLOTS).fill(false));

    const existingExtras = nextPreviews.slice(1).filter(Boolean).length;
    setVisibleExtraSlots(Math.min(PRODUCT_IMAGE_SLOTS - 1, existingExtras + 1));
  }, [initialData, loadPersistedTokens]);

  // Sincroniza a composição do preço numérico sempre que os inputs mudam
  useEffect(() => {
    const centsForSave = priceCents === '' ? '00' : priceCents.padEnd(2, '0').slice(0, 2);
    setFormData((prev) => ({
      ...prev,
      price: composePrice(priceMajor, centsForSave),
    }));
  }, [priceMajor, priceCents]);

  const { data: recentStoreCategories = [] } = useQuery({
    queryKey: ['store-recent-product-categories', adminStore?.id],
    enabled: !!adminStore?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('category, created_at')
        .eq('store_id', adminStore!.id)
        .not('category', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      const unique = new Set<string>();
      const ordered: string[] = [];
      for (const item of data || []) {
        const category = normalizeCategory(item.category || '');
        if (!category || unique.has(category.toLowerCase())) continue;
        unique.add(category.toLowerCase());
        ordered.push(category);
        if (ordered.length >= 6) break;
      }
      return ordered;
    },
  });

  const setSlotProcessing = useCallback((index: number, value: boolean) => {
    setProcessingSlots((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const handleFieldChange = useCallback((field: keyof ProductFormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handlePriceMajorChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setPriceMajor(sanitizeMajor(e.target.value));
  }, []);
  
  const handlePriceMajorBlur = useCallback(() => {
    setPriceMajor((prev) => sanitizeMajor(prev));
  }, []);

  const handlePriceCentsChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setPriceCents(sanitizeCents(e.target.value).slice(0, 2));
  }, []);
  
  const handlePriceCentsBlur = useCallback(() => {
    if (!priceMajor) { 
      setPriceCents(''); 
      return; 
    }
    setPriceCents((prev) => {
      const clean = sanitizeCents(prev).slice(0, 2);
      return clean === '' ? '00' : clean.padEnd(2, '0');
    });
  }, [priceMajor]);

  const handleDescriptionChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.slice(0, PRODUCT_LIMITS.description);
    setFormData((prev) => ({ ...prev, full_description: value }));
  }, []);

  // Formatação Inteligente do Texto no OnBlur
  const handleDescriptionBlur = useCallback((e: FocusEvent<HTMLTextAreaElement>) => {
    let cleaned = e.target.value.trim();
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    setFormData((prev) => ({ ...prev, full_description: cleaned }));
  }, []);

  const handleDescriptionKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key !== 'Enter') return;
      const breaks = (formData.full_description.match(/\n/g) || []).length;
      if (breaks >= PRODUCT_LIMITS.maxBreaks) e.preventDefault();
    },
    [formData.full_description]
  );

  const clearPhotoSlot = useCallback(
    (index: number) => {
      if (localUrlsRef.current[index] && localUrlsRef.current[index].startsWith('blob:')) {
        URL.revokeObjectURL(localUrlsRef.current[index]);
        localUrlsRef.current[index] = '';
      }

      setPreviews((prev) => { const next = [...prev]; next[index] = ''; return next; });
      setTempFiles((prev) => { const next = [...prev]; next[index] = null; return next; });
      clearPersistedSlotToken(index);
      setFileSizes((prev) => { const next = [...prev]; next[index] = 0; return next; });
      setUploadErrors((prev) => { const next = [...prev]; next[index] = ''; return next; });

      setFormData((prev) => {
        if (index === 0) return { ...prev, main_image: '' };
        const nextGallery = [...(prev.gallery || [])];
        nextGallery[index - 1] = '';
        return { ...prev, gallery: nextGallery.filter(Boolean) };
      });

      if (index > 0) {
        setVisibleExtraSlots((prev) => {
          const lastFilledExtraIndex = previews
            .slice(1)
            .reduce((acc, value, extraIndex) => (value ? extraIndex + 1 : acc), 0);
          return Math.max(1, Math.max(prev, lastFilledExtraIndex) - 1);
        });
      }
    },
    [clearPersistedSlotToken, previews]
  );

  // ADICIONAR IMAGEM (Apenas local. O upload real ocorre apenas no Sync)
  const handleFileSelect = useCallback(
    async (e: ChangeEvent<HTMLInputElement>, index: number) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (processingSlots[index]) {
        e.target.value = '';
        return;
      }

      const isTooLarge = file.size > PRODUCT_IMAGE_LIMIT;
      setFileSizes((prev) => { const next = [...prev]; next[index] = file.size; return next; });
      
      if (isTooLarge) {
        setUploadErrors((prev) => { const next = [...prev]; next[index] = t('product_form_image_too_large', { defaultValue: 'A imagem é demasiado grande.' }); return next; });
        setTempFiles((prev) => { const next = [...prev]; next[index] = null; return next; });
        e.target.value = '';
        return;
      }

      // Limpa os erros de upload anteriores desta slot ao selecionar uma nova foto válida
      setUploadErrors((prev) => { const next = [...prev]; next[index] = ''; return next; });
      setTempFiles((prev) => { const next = [...prev]; next[index] = file; return next; });

      // Se havia uma imagem anterior que estava na nuvem, removemos para evitar ficheiros fantasmas
      const previousToken = tempDeleteTokens[index];
      if (previousToken) {
        try {
          await deleteFromCloudinary(previousToken);
        } catch (err) {
          console.error("Erro ao apagar imagem substituída na nuvem", err);
        }
        clearPersistedSlotToken(index);
      }

      if (localUrlsRef.current[index] && localUrlsRef.current[index].startsWith('blob:')) {
        URL.revokeObjectURL(localUrlsRef.current[index]);
      }

      const objectUrl = URL.createObjectURL(file);
      localUrlsRef.current[index] = objectUrl;

      setPreviews((prev) => { const next = [...prev]; next[index] = objectUrl; return next; });

      if (index > 0 && index === visibleExtraSlots) {
        setVisibleExtraSlots((prev) => Math.min(PRODUCT_IMAGE_SLOTS - 1, prev + 1));
      }

      e.target.value = '';
    },
    [processingSlots, tempDeleteTokens, clearPersistedSlotToken, visibleExtraSlots, t]
  );

  // REMOVER IMAGEM (Com suporte a idiomas pelo Context e alertas de erro ativos)
  const removePhoto = useCallback(
    async (index: number) => {
      if (processingSlots[index]) return;

      const token = tempDeleteTokens[index];
      const isLocalOnly = tempFiles[index] !== null;

      setSlotProcessing(index, true);

      try {
        if (token) {
          const result = await deleteFromCloudinary(token);
          if (result && result.ok) {
            toast.success(t('product_form_photo_removed_cloud', { defaultValue: 'Foto removida permanentemente da nuvem.' }));
          } else {
            toast.error(t('product_form_photo_removed_cloud_failed', { defaultValue: 'A exclusão na nuvem falhou ou expirou.' }));
          }
        } else if (isLocalOnly) {
          toast.success(t('product_form_photo_removed', { defaultValue: 'Foto removida com sucesso.' }));
        }
      } catch (error) {
        console.error("Falha ao remover foto", error);
        toast.error(t('product_form_photo_removed_cloud_failed', { defaultValue: 'Ocorreu um erro ao remover a foto.' }));
      } finally {
        clearPhotoSlot(index);
        setSlotProcessing(index, false);
      }
    },
    [clearPhotoSlot, processingSlots, setSlotProcessing, tempDeleteTokens, tempFiles, t]
  );

  // SINCRONIZAÇÃO EM MASSA (Upload de blobs para URLs oficais no Cloudinary)
  const handleSyncPhotos = async () => {
    setIsSyncingPhotos(true);
    let successCount = 0;

    try {
      const promises = tempFiles.map(async (file, index) => {
        if (!file) return null;
        
        setSlotProcessing(index, true);
        
        // Limpa erros passados nesta slot para poder tentar outra vez (Retry seguro)
        setUploadErrors(prev => { 
          const n = [...prev]; 
          n[index] = ''; 
          return n; 
        });

        try {
          const uploaded = await uploadToCloudinary(file);
          return { index, uploaded };
        } catch (err: unknown) {
          console.error(`[Cloudinary Sync] Slot ${index} failed:`, err);
          setUploadErrors(prev => { 
            const n = [...prev]; 
            n[index] = t('product_form_upload_error', { defaultValue: 'Falha ao enviar esta imagem.' }); 
            return n; 
          });
          return null; // Mantém a foto na lista de pendentes locais (permitindo novo click)
        } finally {
          setSlotProcessing(index, false);
        }
      });

      const results = await Promise.all(promises);

      const nextPreviews = [...previews];
      const nextFiles = [...tempFiles];
      const nextTokens = [...tempDeleteTokens];

      results.forEach(res => {
        if (!res) return; // Ignora os que falharam
        successCount++;
        const { index, uploaded } = res;
        
        nextPreviews[index] = uploaded.url;
        nextTokens[index] = uploaded.delete_token ?? null;
        nextFiles[index] = null; // Liberta a dependência local (ficheiro finalizado)

        // Limpa BLOB local da RAM com segurança (já temos o link final do servidor)
        if (localUrlsRef.current[index] && localUrlsRef.current[index].startsWith('blob:')) {
          URL.revokeObjectURL(localUrlsRef.current[index]);
          localUrlsRef.current[index] = '';
        }
      });

      setPreviews(nextPreviews);
      setTempFiles(nextFiles);
      updateDeleteTokens(() => nextTokens);

      setFormData(prev => {
        const finalMain = nextPreviews[0] || '';
        const finalGallery = nextPreviews.slice(1).filter(Boolean);
        return { ...prev, main_image: finalMain, gallery: finalGallery };
      });

      if (successCount > 0) {
        toast.success(t('product_form_photos_synced_success', { 
          count: successCount, 
          defaultValue: `${successCount} foto(s) sincronizada(s) com sucesso!` 
        }));
      }
    } catch (error) {
      console.error("[General Sync Error]", error);
      toast.error(t('product_form_sync_general_error', { defaultValue: 'Erro geral de rede ao tentar sincronizar.' }));
    } finally {
      setIsSyncingPhotos(false);
    }
  };

  const hasUnsyncedPhotos = tempFiles.some(file => file !== null);

  const fieldErrors = useMemo(() => {
    // Proteções de segurança contra falsos-positivos de null exceptions
    const safeName = formData.name || '';
    const safeCat = formData.category || '';
    
    const name = safeName.trim().length === 0 ? t('product_form_error_name_required') : safeName.trim().length < 2 ? t('product_form_error_name_short') : '';
    const category = safeCat.trim().length === 0 ? t('product_form_error_category_required') : '';
    const price = !formData.price ? t('product_form_error_price_required') : Number(formData.price) <= 0 ? t('product_form_error_price_invalid') : '';
    const cover = !previews[0] ? t('product_form_error_cover_required') : '';
    const images = uploadErrors.some(Boolean) ? t('product_form_error_images_invalid') : '';

    return { name, category, price, cover, images };
  }, [formData.name, formData.category, formData.price, previews, uploadErrors, t]);

  const pendingItems = useMemo(() => {
    const items: string[] = [];
    if (fieldErrors.name) items.push(t('product_form_pending_name'));
    if (fieldErrors.category) items.push(t('product_form_pending_category'));
    if (fieldErrors.price) items.push(t('product_form_pending_price'));
    if (fieldErrors.cover) items.push(t('product_form_pending_cover'));
    if (fieldErrors.images) items.push(t('product_form_pending_images'));
    if (hasUnsyncedPhotos && items.length === 0) {
      items.push(t('product_form_sync_before_saving', { defaultValue: 'Sincronize as fotos antes de salvar' }));
    }
    return items;
  }, [fieldErrors, hasUnsyncedPhotos, t]);

  const canSave = useMemo(() => {
    return (
      !fieldErrors.name &&
      !fieldErrors.category &&
      !fieldErrors.price &&
      !fieldErrors.cover &&
      !fieldErrors.images &&
      !hasUnsyncedPhotos &&
      !processingSlots.some(Boolean)
    );
  }, [fieldErrors, hasUnsyncedPhotos, processingSlots]);

  const visibleSlots = useMemo(() => {
    const total = 1 + visibleExtraSlots;
    return Array.from({ length: Math.min(PRODUCT_IMAGE_SLOTS, total) }, (_, i) => i);
  }, [visibleExtraSlots]);

  const canAddMoreImages = visibleSlots.length < PRODUCT_IMAGE_SLOTS;
  const hasLargeImageError = uploadErrors.some((error) => error === t('product_form_image_too_large'));

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!adminStore?.id) throw new Error(t('product_form_store_not_found'));
      if (hasUnsyncedPhotos) {
        throw new Error(t('product_form_sync_required', { defaultValue: 'Ação não permitida: Sincronize as fotos antes de prosseguir.' }));
      }

      // DOUBLE-GUARD EXTREMO: Garante que os URLs enviados para o Supabase SÃO APENAS URLs autênticos da Cloudinary.
      const safeMainImage = formData.main_image?.startsWith('blob:') ? '' : (formData.main_image || '');
      const safeGallery = (formData.gallery || []).filter(url => url && !url.startsWith('blob:'));

      const payload = {
        name: formData.name.trim(),
        slug: createProductSlug(formData.name),
        category: normalizeCategory(formData.category),
        price: Number(normalizePriceString(formData.price)),
        unit: formData.unit.trim() || 'un',
        full_description: formData.full_description.trim(),
        main_image: safeMainImage,
        gallery: safeGallery,
        store_id: adminStore.id,
      };

      if (isCreating) {
        const { data, error } = await supabase.from('products').insert([payload]).select().single();
        if (error) throw error;
        return data as Record<string, unknown>;
      }

      if (!productId) throw new Error(t('product_form_product_not_found'));

      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;
      return data as Record<string, unknown>;
    },
    onSuccess: async (updatedProduct) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['product', productId] }),
        queryClient.invalidateQueries({ queryKey: ['store-recent-product-categories', adminStore?.id] }),
      ]);

      toast.success(isCreating ? t('product_form_created_success') : t('product_form_updated_success'));
      onSuccess?.(updatedProduct);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : t('product_form_save_error');
      toast.error(message);
    },
  });

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-40">
      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
            <Package2 size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-base font-black uppercase tracking-wide text-slate-900">
              {isCreating ? t('product_form_create_title') : t('product_form_edit_title')}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{t('product_form_intro')}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* AQUI ESTÁ A CORREÇÃO DA GRELHA (grid-cols-2 no mobile) */}
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {visibleSlots.map((index) => {
              const preview = previews[index];
              const isCover = index === 0;
              const hasError = Boolean(uploadErrors[index]);
              const isProcessing = processingSlots[index];
              const isUnsynced = tempFiles[index] !== null; 

              return (
                <div key={index} className="flex flex-col gap-2">
                  <div
                    className={`relative aspect-square overflow-hidden rounded-[1.25rem] border transition-all ${
                      preview
                        ? hasError
                          ? 'border-red-400 bg-red-50 ring-2 ring-red-400/20'
                          : isUnsynced
                          ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-400/20'
                          : isCover
                          ? 'border-blue-300 bg-slate-50'
                          : 'border-slate-200 bg-slate-50'
                        : 'border-dashed border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-slate-100'
                    }`}
                  >
                    {preview || isProcessing ? (
                      <>
                        {preview && (
                          <img
                            src={preview}
                            alt=""
                            loading="lazy"
                            className={`h-full w-full object-cover transition-opacity duration-300 ${isProcessing ? 'opacity-30' : 'opacity-100'}`}
                          />
                        )}
                        
                        {isProcessing && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 backdrop-blur-[2px]">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                          </div>
                        )}

                        <div className="absolute right-2 top-2 flex gap-2">
                          <label className={`cursor-pointer rounded-xl bg-white p-2 text-slate-700 shadow-sm transition hover:scale-105 ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}>
                            <PencilLine size={14} />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => void handleFileSelect(e, index)}
                              disabled={isProcessing}
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => void removePhoto(index)}
                            disabled={isProcessing}
                            className="rounded-xl bg-white p-2 text-red-500 shadow-sm transition hover:scale-105 hover:text-red-600 disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="absolute left-2 top-2 rounded-xl bg-slate-950/85 px-2 py-1 text-[10px] font-black text-white">
                          {isCover ? t('product_form_cover') : t('product_form_extra_image_label', { number: index })}
                        </div>

                        {/* Tamanho da Imagem e Status */}
                        <div className="absolute bottom-2 flex w-full items-center justify-between px-2">
                          {!!fileSizes[index] && (
                            <div className="rounded-lg bg-slate-900/80 px-2 py-1 text-[9px] font-bold text-white shadow-sm backdrop-blur-md">
                              {formatBytes(fileSizes[index])}
                            </div>
                          )}
                          
                          {isUnsynced && !isProcessing && (
                            <div className="rounded-xl bg-amber-500 px-1 py-1 text-[7px] sm:text-[8px] font-black uppercase text-white ">
                              {t('editor_modal_pending_media_title', { defaultValue: 'Pendente' })}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <label className="group flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 p-3 text-center transition">
                        <div className="rounded-full bg-white p-3 shadow-sm transition group-hover:scale-110 group-hover:text-blue-500">
                          <UploadCloud size={20} className="text-slate-400 group-hover:text-blue-500" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-wide text-slate-500 group-hover:text-blue-600">
                          {isCover ? t('product_form_add_cover') : t('product_form_add_image')}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => void handleFileSelect(e, index)}
                          disabled={isProcessing}
                        />
                      </label>
                    )}
                  </div>

                  {uploadErrors[index] ? (
                    <p className="text-[11px] font-semibold text-red-500">
                      {uploadErrors[index]}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {canAddMoreImages ? (
              <button
                type="button"
                onClick={() => setVisibleExtraSlots((prev) => Math.min(PRODUCT_IMAGE_SLOTS - 1, prev + 1))}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
              >
                <ImagePlus size={15} className="text-slate-400" />
                {t('product_form_add_more_images')}
              </button>
            ) : <div />}

            {hasUnsyncedPhotos && (
              <button
                type="button"
                onClick={handleSyncPhotos}
                disabled={isSyncingPhotos}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-[11px] font-black uppercase tracking-wider text-white shadow-md shadow-blue-600/20 transition hover:scale-[1.02] hover:bg-blue-700 active:scale-95 disabled:opacity-50"
              >
                {isSyncingPhotos ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    {t('cacheStatusSyncing', { defaultValue: 'A sincronizar...' })}
                  </>
                ) : (
                  <>
                    <CloudLightning size={16} />
                    {t('gallery_btn_sync', { defaultValue: 'Sincronizar Fotos' })}
                  </>
                )}
              </button>
            )}
          </div>

          <div className="space-y-2 pt-2">
            <p className="text-xs text-slate-500">{t('product_form_image_help')}</p>

            {hasLargeImageError ? (
              <a
                href={IMAGE_COMPRESS_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-100"
              >
                {t('product_form_compress_image_link')}
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                {t('product_form_name_label')}
              </label>
              <span className="text-[10px] font-bold text-slate-400">
                {formData.name.length}/{PRODUCT_LIMITS.name}
              </span>
            </div>

            <input
              type="text"
              maxLength={PRODUCT_LIMITS.name}
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder={t('product_form_name_placeholder')}
              className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-bold outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
            {fieldErrors.name ? (
              <p className="mt-2 text-xs font-semibold text-amber-600">{fieldErrors.name}</p>
            ) : null}
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-[11px] font-black uppercase tracking-wider text-slate-500">
              {t('product_form_price_label')}
            </label>

            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-3 transition-colors focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
              <div className="flex items-end gap-3">
                <div className="min-w-0 flex-1">
                  <span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {t('product_form_price_whole')}
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={priceMajor}
                    onChange={handlePriceMajorChange}
                    onBlur={handlePriceMajorBlur}
                    placeholder="0"
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-2xl font-black outline-none transition focus:border-blue-500"
                  />
                </div>

                <div className="pb-3 text-2xl font-black text-slate-300">.</div>

                <div className="w-24">
                  <span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {t('product_form_price_cents')}
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={priceCents}
                    onChange={handlePriceCentsChange}
                    onBlur={handlePriceCentsBlur}
                    placeholder="00"
                    className={`h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-center text-xl font-black outline-none transition focus:border-blue-500 ${
                      priceCents === '' || priceCents === '00'
                        ? 'text-slate-300'
                        : 'text-slate-700'
                    }`}
                  />
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-500">{t('product_form_price_help')}</p>
            </div>

            {fieldErrors.price ? (
              <p className="mt-2 text-xs font-semibold text-amber-600">{fieldErrors.price}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-black uppercase tracking-wider text-slate-500">
              {t('product_form_category_label')}
            </label>

            <select
              value={formData.category || ""} 
              onChange={(e) => handleFieldChange('category', e.target.value)}
              className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
            >
              <option value="" disabled hidden>
                {t('product_form_category_placeholder', { defaultValue: 'Selecione uma categoria' })}
              </option>

              {MOCK_GLOBAL_CATEGORIES.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.emoji} {t(category.nameKey as never)} 
                </option>
              ))}
            </select>

            {recentStoreCategories.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {recentStoreCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleFieldChange('category', category)}
                    className="rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-black uppercase tracking-wide text-slate-600 transition hover:bg-slate-200"
                  >
                    {category}
                  </button>
                ))}
              </div>
            ) : null}

            {fieldErrors.category ? (
              <p className="mt-2 text-xs font-semibold text-amber-600">{fieldErrors.category}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-black uppercase tracking-wider text-slate-500">
              {t('product_form_unit_label')}
            </label>

            <select
              value={formData.unit}
              onChange={(e) => handleFieldChange('unit', e.target.value)}
              className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
            >
              {PRODUCT_UNIT_OPTIONS.map((unit) => (
                <option key={unit} value={unit}>
                  {t(`product_form_unit_${unit}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <AlignLeft size={14} className="text-blue-500" />
                {t('product_form_description_label')}
              </label>
              <span className="text-[10px] font-bold text-slate-400">
                {formData.full_description.length}/{PRODUCT_LIMITS.description}
              </span>
            </div>

            <textarea
              value={formData.full_description}
              onChange={handleDescriptionChange}
              onBlur={handleDescriptionBlur}
              onKeyDown={handleDescriptionKeyDown}
              placeholder={t('product_form_description_placeholder')}
              className="min-h-[180px] w-full resize-none rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />

            <p className="mt-2 text-xs text-slate-500">
              {t('product_form_description_help')}
            </p>
          </div>
        </div>
      </section>

      <div className="pointer-events-none fixed bottom-4 left-0 right-0 z-50 px-3 md:px-6">
        <div className="mx-auto w-full max-w-xl md:max-w-md xl:max-w-2xl">
          <section className="pointer-events-auto rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Info size={14} className={hasUnsyncedPhotos ? "text-amber-500" : "text-blue-500"} />
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-900">
                    {hasUnsyncedPhotos
                      ? t('setup_action_needed', { defaultValue: 'Ação Necessária' })
                      : pendingItems.length > 0
                      ? t('product_form_pending_title')
                      : t('product_form_ready_title')}
                  </p>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  {isSyncingPhotos
                    ? t('cacheStatusSyncing', { defaultValue: 'A sincronizar...' })
                    : hasUnsyncedPhotos
                    ? t('gallery_pending_local', { defaultValue: 'Existem fotos por sincronizar.' })
                    : pendingItems.length > 0
                    ? pendingItems.join(' • ')
                    : t('product_form_ready_subtitle')}
                </p>

                {fieldErrors.cover ? (
                  <p className="mt-2 text-xs font-semibold text-amber-600">{fieldErrors.cover}</p>
                ) : null}
                {fieldErrors.images ? (
                  <p className="mt-1 text-xs font-semibold text-amber-600">{fieldErrors.images}</p>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-600 transition hover:bg-slate-50"
                >
                  <X size={14} />
                </button>

                <button
                  type="button"
                  disabled={!canSave || saveMutation.isPending || isSyncingPhotos}
                  onClick={() => saveMutation.mutate()}
                  className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-[11px] font-black uppercase tracking-wider transition ${
                    canSave
                      ? 'bg-slate-900 text-white hover:scale-105 hover:bg-slate-800 active:scale-95'
                      : 'cursor-not-allowed bg-slate-200 text-slate-400'
                  }`}
                >
                  {saveMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  {isCreating ? t('product_form_create_action') : t('product_form_save_action')}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
});