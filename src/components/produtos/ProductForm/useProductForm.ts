import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import { deleteFromCloudinary, uploadToCloudinary } from '../../../utils/cloud';
import {
  composePrice,
  createProductSlug,
  normalizeCategory,
  normalizePriceString,
  splitPrice,
  PRODUCT_IMAGE_SLOTS,
  PRODUCT_IMAGE_LIMIT,
} from '../productForm.utils';

import { DEFAULT_SLOT, TOKEN_TTL_MS } from './ProductForm.types';
import type { SlotState, PersistedSlotToken } from './ProductForm.types';

import type { ProductFormData } from '../ProductForm';
import { useTranslate } from '../../../context/LanguageContext';
import { useAdminStore } from '../../../hooks/useAdminStore';
import { supabase } from '../../../lib/supabase';

interface UseProductFormProps {
  productId?: string;
  isCreating?: boolean;
  initialData: ProductFormData;
  onCancel?: () => void;
  onSuccess?: (data?: Record<string, unknown> | null) => void;
}

export function useProductForm({ productId, isCreating, initialData, onCancel, onSuccess }: UseProductFormProps) {
  const { t } = useTranslate();
  const { data: adminStore } = useAdminStore();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ProductFormData>(initialData);
  const [priceMajor, setPriceMajor] = useState('');
  const [priceCents, setPriceCents] = useState('');
  
  const [slots, setSlots] = useState<SlotState[]>(() => Array(PRODUCT_IMAGE_SLOTS).fill(DEFAULT_SLOT));
  const [visibleCount, setVisibleCount] = useState(2);
  const [isSyncingPhotos, setIsSyncingPhotos] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Rastreamento estrito de tokens da sessão para prevenção de lixo na nuvem
  const newlyUploadedTokensRef = useRef<Set<string>>(new Set());
  const isSavedRef = useRef(false);
  const isInitializedRef = useRef(false);
  const latestSlots = useRef(slots);

  const storageKey = useMemo(() => {
    return `product-form-tokens:${adminStore?.id || 'no-store'}:${productId || 'new'}`;
  }, [adminStore?.id, productId]);

  // Inicialização estável e única dos dados (evita reset em re-renders do componente pai)
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const restoredTokens: (string | null)[] = Array(PRODUCT_IMAGE_SLOTS).fill(null);
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedSlotToken[];
        const now = Date.now();
        parsed.forEach(item => {
          if (item && item.slot >= 0 && item.slot < PRODUCT_IMAGE_SLOTS && (now - item.savedAt <= TOKEN_TTL_MS)) {
            restoredTokens[item.slot] = item.token;
          }
        });
      }
    } catch (err) {
      console.warn('[LocalStorage] Restauração de tokens ignorada:', err);
    }

    const cleanMain = initialData.main_image?.startsWith('http') ? initialData.main_image : '';
    const cleanGallery = (initialData.gallery || []).filter(img => Boolean(img) && img.startsWith('http'));

    const mergedImages = [
      cleanMain,
      ...cleanGallery.slice(0, PRODUCT_IMAGE_SLOTS - 1),
    ];

    const initialSlots = Array.from({ length: PRODUCT_IMAGE_SLOTS }, (_, i): SlotState => ({
      ...DEFAULT_SLOT,
      preview: mergedImages[i] || '',
      deleteToken: restoredTokens[i] || null,
    }));

    setSlots(initialSlots);

    const filledCount = mergedImages.filter(Boolean).length;
    setVisibleCount(Math.min(PRODUCT_IMAGE_SLOTS, Math.max(2, filledCount + 1)));

    const parsed = splitPrice(initialData.price);
    setPriceMajor(parsed.major || '');
    setPriceCents(parsed.cents === '00' ? '' : parsed.cents);
  }, [initialData, storageKey]);

  // Sincronização do preço
  useEffect(() => {
    const centsForSave = priceCents === '' ? '00' : priceCents.padEnd(2, '0').slice(0, 2);
    setFormData(prev => ({ ...prev, price: composePrice(priceMajor, centsForSave) }));
  }, [priceMajor, priceCents]);

  // Persistência segura de tokens no localStorage
  useEffect(() => {
    const tokensToSave = slots
      .map((s, slot) => s.deleteToken ? { slot, token: s.deleteToken, savedAt: Date.now() } : null)
      .filter(Boolean);

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(tokensToSave));
    } catch (err) {
      console.warn('[LocalStorage] Falha ao persistir tokens:', err);
    }
  }, [slots, storageKey]);

  useEffect(() => {
    latestSlots.current = slots;
  }, [slots]);

  // Limpeza de recursos e fotos órfãs na desmontagem do componente
  useEffect(() => {
    const newlyUploadedTokens = newlyUploadedTokensRef.current;

    return () => {
      // Se a página for fechada/navegada sem salvar, remove os arquivos recém-enviados do Cloudinary
      if (!isSavedRef.current && newlyUploadedTokens.size > 0) {
        console.log(`[Cloudinary Cleanup] Fechamento sem salvar. Limpando ${newlyUploadedTokens.size} foto(s)...`);
        newlyUploadedTokens.forEach(token => {
          deleteFromCloudinary(token)
            .then(() => console.log(`[Cloudinary Cleanup] Foto apagada: ${token}`))
            .catch(err => console.error(`[Cloudinary Cleanup] Erro ao apagar foto: ${token}`, err));
        });
        newlyUploadedTokens.clear();
      }

      // Libera memória de ObjectURLs
      latestSlots.current.forEach(s => { 
        if (s.preview.startsWith('blob:')) {
          URL.revokeObjectURL(s.preview);
        }
      });
    };
  }, []);

  const updateSlot = useCallback((index: number, partial: Partial<SlotState>) => {
    setSlots(prev => {
      const next = [...prev];
      next[index] = { ...next[index], ...partial };
      return next;
    });
  }, []);

  // Upload com tratamento de conexões instáveis
  const handleFileSelect = useCallback(async (file: File | undefined, index: number) => {
    if (!file || slots[index].isProcessing) return;

    if (file.size > PRODUCT_IMAGE_LIMIT) {
      updateSlot(index, { error: t('product_form_image_too_large'), file: null });
      return;
    }

    // Se já havia uma imagem na nuvem no mesmo slot nesta sessão, remove a anterior
    if (slots[index].deleteToken) {
      const oldToken = slots[index].deleteToken!;
      console.log(`[Cloudinary] Substituição. Apagando foto anterior: ${oldToken}`);
      deleteFromCloudinary(oldToken)
        .then(() => console.log(`[Cloudinary] Foto anterior removida: ${oldToken}`))
        .catch(err => console.error(`[Cloudinary] Erro ao remover anterior:`, err));
      newlyUploadedTokensRef.current.delete(oldToken);
    }

    if (slots[index].preview.startsWith('blob:')) {
      URL.revokeObjectURL(slots[index].preview);
    }

    const localBlobUrl = URL.createObjectURL(file);

    updateSlot(index, {
      preview: localBlobUrl,
      file,
      size: file.size,
      error: '',
      isProcessing: true,
      deleteToken: null,
    });

    if (index === visibleCount - 1) {
      setVisibleCount(prev => Math.min(PRODUCT_IMAGE_SLOTS, prev + 1));
    }

    try {
      const uploaded = await uploadToCloudinary(file);
      const permanentUrl = uploaded?.url;

      if (!permanentUrl) throw new Error(t('product_form_upload_error'));

      URL.revokeObjectURL(localBlobUrl);

      if (uploaded?.delete_token) {
        newlyUploadedTokensRef.current.add(uploaded.delete_token);
        console.log(`[Cloudinary] Nova foto registrada: ${uploaded.delete_token}`);
      }

      updateSlot(index, {
        preview: permanentUrl,
        deleteToken: uploaded.delete_token ?? null,
        file: null,
        isProcessing: false,
        error: '',
      });
    } catch {
      // Conexão lenta/falha: preserva o arquivo local para possibilitar retry via botão de sincronização
      updateSlot(index, {
        isProcessing: false,
        error: t('product_form_upload_error', { defaultValue: 'Falha no envio. Clique em Sincronizar.' }),
      });
    }
  }, [slots, visibleCount, updateSlot, t]);

  // Remoção individual
  const removePhoto = useCallback(async (index: number) => {
    if (slots[index].isProcessing) return;

    const { deleteToken, file, preview } = slots[index];
    updateSlot(index, { isProcessing: true });

    try {
      if (deleteToken) {
        console.log(`[Cloudinary] Removendo foto individual: ${deleteToken}`);
        const result = await deleteFromCloudinary(deleteToken);
        newlyUploadedTokensRef.current.delete(deleteToken);
        if (result?.ok) {
          toast.success(t('product_form_photo_removed_cloud'));
        } else {
          toast.error(t('product_form_photo_removed_cloud_failed'));
        }
      } else if (file) {
        toast.success(t('product_form_photo_removed'));
      }
    } catch (err) {
      console.error(`[Cloudinary] Erro ao remover foto:`, err);
      toast.error(t('product_form_photo_removed_cloud_failed'));
    } finally {
      if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);

      setSlots(prev => {
        const next = [...prev];
        if (index === 0) {
          next[0] = { ...DEFAULT_SLOT }; 
        } else {
          next.splice(index, 1);
          next.push({ ...DEFAULT_SLOT }); 
        }
        return next;
      });
    }
  }, [slots, updateSlot, t]);

  // Sincronização manual em lote
  const handleSyncPhotos = async () => {
    setIsSyncingPhotos(true);
    let successCount = 0;

    const promises = slots.map(async (slot, index) => {
      if (!slot.file) return null;
      updateSlot(index, { isProcessing: true, error: '' });
      try {
        const uploaded = await uploadToCloudinary(slot.file);
        const permanentUrl = uploaded?.url;
        if (!permanentUrl) throw new Error();
        return { index, uploaded, permanentUrl };
      } catch {
        updateSlot(index, { error: t('product_form_upload_error'), isProcessing: false });
        return null;
      }
    });

    const results = await Promise.all(promises);

    setSlots(prev => {
      const next = [...prev];
      results.forEach(res => {
        if (!res) return;
        successCount++;
        const { index, uploaded, permanentUrl } = res;
        
        if (next[index].preview.startsWith('blob:')) {
          URL.revokeObjectURL(next[index].preview);
        }
        
        if (uploaded?.delete_token) {
          newlyUploadedTokensRef.current.add(uploaded.delete_token);
        }

        next[index] = {
          ...next[index],
          preview: permanentUrl,
          deleteToken: uploaded.delete_token ?? null,
          file: null,
          isProcessing: false,
          error: '',
        };
      });
      return next;
    });

    if (successCount > 0) {
      toast.success(t('product_form_photos_synced_success', { count: successCount }));
    }
    setIsSyncingPhotos(false);
  };

  // Cancelamento com limpeza assíncrona garantida e estado de carregamento
  const handleCancel = useCallback(async () => {
    setIsCancelling(true);
    try {
      const tokensToDelete = Array.from(newlyUploadedTokensRef.current);
      
      if (tokensToDelete.length > 0) {
        console.log(`[Cloudinary Cancel] Cancelando. Removendo ${tokensToDelete.length} foto(s)...`);
        await Promise.allSettled(
          tokensToDelete.map(async (token) => {
            try {
              await deleteFromCloudinary(token);
              console.log(`[Cloudinary Cancel] Foto apagada: ${token}`);
            } catch (err) {
              console.error(`[Cloudinary Cancel] Falha ao apagar: ${token}`, err);
            }
          })
        );
        newlyUploadedTokensRef.current.clear();
      }

      // Revoga blobs locais
      latestSlots.current.forEach(s => {
        if (s.preview.startsWith('blob:')) {
          URL.revokeObjectURL(s.preview);
        }
      });

      if (isCreating) {
        try {
          window.localStorage.removeItem(storageKey);
        } catch (err) {
          console.warn('[LocalStorage] Erro ao limpar storageKey:', err);
        }
      }

      onCancel?.();
    } finally {
      setIsCancelling(false);
    }
  }, [onCancel, isCreating, storageKey]);

  const hasPendingUploads = slots.some(s => s.file !== null || (s.preview.startsWith('blob:') && !s.isProcessing));
  const hasOrphanBlobs = slots.some(s => s.preview.startsWith('blob:') && s.file === null);
  const hasAnyLocalBlob = slots.some(s => s.preview.startsWith('blob:'));
  const isAnyProcessing = slots.some(s => s.isProcessing);

  const fieldErrors = useMemo(() => {
    const name = formData.name.trim().length === 0 ? t('product_form_error_name_required') : formData.name.trim().length < 2 ? t('product_form_error_name_short') : '';
    const category = formData.category.trim().length === 0 ? t('product_form_error_category_required') : '';
    const price = !formData.price ? t('product_form_error_price_required') : Number(formData.price) <= 0 ? t('product_form_error_price_invalid') : '';
    const cover = !slots[0].preview || slots[0].preview.startsWith('blob:') ? t('product_form_error_cover_required') : '';
    const images = slots.some(s => Boolean(s.error)) ? t('product_form_error_images_invalid') : '';
    return { name, category, price, cover, images };
  }, [formData, slots, t]);

  const canSave = !fieldErrors.name && 
    !fieldErrors.category && 
    !fieldErrors.price && 
    !fieldErrors.cover && 
    !fieldErrors.images && 
    !hasAnyLocalBlob && 
    !isAnyProcessing && 
    !isSyncingPhotos &&
    !isCancelling;

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!adminStore?.id) throw new Error(t('product_form_store_not_found'));
      if (hasAnyLocalBlob || hasPendingUploads) {
        throw new Error(t('product_form_blobs_prevent_save', { defaultValue: 'Existem fotos pendentes de envio. Sincronize as fotos antes de salvar.' }));
      }

      const validMainImage = slots[0].preview.startsWith('http') ? slots[0].preview : '';
      const validGallery = slots.slice(1).map(s => s.preview).filter(url => Boolean(url) && url.startsWith('http'));

      if (!validMainImage) {
        throw new Error(t('product_form_error_cover_required'));
      }

      const parsedDiscount = parseInt(formData.discount_percent || '0', 10);
      const safeDiscountPercent = isNaN(parsedDiscount) ? 0 : Math.min(100, Math.max(0, parsedDiscount));

      const payload = {
        name: formData.name.trim(),
        slug: createProductSlug(formData.name),
        category: normalizeCategory(formData.category),
        price: Number(normalizePriceString(formData.price)),
        unit: formData.unit.trim() || 'un',
        full_description: formData.full_description.trim(),
        main_image: validMainImage,
        gallery: validGallery,
        store_id: adminStore.id,
        discount_percent: safeDiscountPercent,
      };

      if (isCreating) {
        const { data, error } = await supabase.from('products').insert([payload]).select().single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase.from('products').update(payload).eq('id', productId).select().single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: async (updatedProduct) => {
      isSavedRef.current = true;
      newlyUploadedTokensRef.current.clear();

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['product', productId] }),
        queryClient.invalidateQueries({ queryKey: ['store-recent-product-categories', adminStore?.id] }),
      ]);
      toast.success(isCreating ? t('product_form_created_success') : t('product_form_updated_success'));
      onSuccess?.(updatedProduct as Record<string, unknown>);
    },
    onError: (error: Error) => {
      toast.error(error.message || t('product_form_save_error'));
    },
  });

  return {
    formData,
    setFormData,
    priceMajor,
    setPriceMajor,
    priceCents,
    setPriceCents,
    slots,
    visibleCount,
    setVisibleCount,
    fieldErrors,
    hasPendingUploads,
    hasOrphanBlobs,
    hasAnyLocalBlob,
    canSave,
    isSyncingPhotos,
    isCancelling,
    handleFileSelect,
    removePhoto,
    handleSyncPhotos,
    handleCancel,
    saveMutation,
    adminStore,
  };
}