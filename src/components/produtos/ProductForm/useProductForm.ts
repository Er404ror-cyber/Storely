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
  onSuccess?: (data?: Record<string, unknown> | null) => void;
}

export function useProductForm({ productId, isCreating, initialData, onSuccess }: UseProductFormProps) {
  const { t } = useTranslate();
  const { data: adminStore } = useAdminStore();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ProductFormData>(initialData);
  const [priceMajor, setPriceMajor] = useState('');
  const [priceCents, setPriceCents] = useState('');
  
  const [slots, setSlots] = useState<SlotState[]>(Array(PRODUCT_IMAGE_SLOTS).fill(DEFAULT_SLOT));
  const [visibleCount, setVisibleCount] = useState(2);
  const [isSyncingPhotos, setIsSyncingPhotos] = useState(false);

  // useRef para armazenar a versão mais recente dos slots sem disparar re-renders
  // Isso resolve o aviso do exhaustive-deps e garante limpeza real da RAM
  const latestSlots = useRef(slots);

  const storageKey = useMemo(() => {
    return `product-form-tokens:${adminStore?.id || 'no-store'}:${productId || 'new'}`;
  }, [adminStore?.id, productId]);

  useEffect(() => {
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
    } catch { /* Ignora erros de localstorage */ }

    const mergedImages = [
      initialData.main_image || '',
      ...(initialData.gallery || []).slice(0, PRODUCT_IMAGE_SLOTS - 1),
    ];

    const initialSlots = Array.from({ length: PRODUCT_IMAGE_SLOTS }, (_, i): SlotState => ({
      ...DEFAULT_SLOT,
      preview: mergedImages[i] || '',
      deleteToken: restoredTokens[i] || null,
    }));

    setSlots(initialSlots);

    const parsed = splitPrice(initialData.price);
    setPriceMajor(parsed.major || '');
    setPriceCents(parsed.cents === '00' ? '' : parsed.cents);
  }, [initialData, storageKey]);

  useEffect(() => {
    const centsForSave = priceCents === '' ? '00' : priceCents.padEnd(2, '0').slice(0, 2);
    setFormData(prev => ({ ...prev, price: composePrice(priceMajor, centsForSave) }));
  }, [priceMajor, priceCents]);

  useEffect(() => {
    const tokensToSave = slots
      .map((s, slot) => s.deleteToken ? { slot, token: s.deleteToken, savedAt: Date.now() } : null)
      .filter(Boolean);
    window.localStorage.setItem(storageKey, JSON.stringify(tokensToSave));
  }, [slots, storageKey]);

  // Sincroniza a ref com o estado mais atualizado
  useEffect(() => {
    latestSlots.current = slots;
  }, [slots]);

  // Prevenção Perfeita de Memory Leaks
  useEffect(() => {
    return () => {
      // Limpa as imagens locais da RAM ao desmontar o componente baseado nos últimos dados reais
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

  const handleFileSelect = useCallback(async (file: File | undefined, index: number) => {
    if (!file || slots[index].isProcessing) return;

    if (file.size > PRODUCT_IMAGE_LIMIT) {
      updateSlot(index, { error: t('product_form_image_too_large'), file: null });
      return;
    }

    if (slots[index].deleteToken) {
      deleteFromCloudinary(slots[index].deleteToken!).catch(() => {});
    }
    if (slots[index].preview.startsWith('blob:')) {
      URL.revokeObjectURL(slots[index].preview);
    }

    updateSlot(index, {
      preview: URL.createObjectURL(file),
      file,
      size: file.size,
      error: '',
      deleteToken: null,
    });

    if (index === visibleCount - 1) {
      setVisibleCount(prev => Math.min(PRODUCT_IMAGE_SLOTS, prev + 1));
    }
  }, [slots, visibleCount, updateSlot, t]);

  const removePhoto = useCallback(async (index: number) => {
    if (slots[index].isProcessing) return;

    const { deleteToken, file, preview } = slots[index];
    updateSlot(index, { isProcessing: true });

    try {
      if (deleteToken) {
        const result = await deleteFromCloudinary(deleteToken);
        if (result?.ok) toast.success(t('product_form_photo_removed_cloud'));
        else toast.error(t('product_form_photo_removed_cloud_failed'));
      } else if (file) {
        toast.success(t('product_form_photo_removed'));
      }
    } catch {
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

  const handleSyncPhotos = async () => {
    setIsSyncingPhotos(true);
    let successCount = 0;

    const promises = slots.map(async (slot, index) => {
      if (!slot.file) return null;
      updateSlot(index, { isProcessing: true, error: '' });
      try {
        const uploaded = await uploadToCloudinary(slot.file);
        return { index, uploaded };
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
        const { index, uploaded } = res;
        
        if (next[index].preview.startsWith('blob:')) URL.revokeObjectURL(next[index].preview);
        
        next[index] = {
          ...next[index],
          preview: uploaded.url,
          deleteToken: uploaded.delete_token ?? null,
          file: null,
          isProcessing: false,
        };
      });
      return next;
    });

    if (successCount > 0) {
      toast.success(t('product_form_photos_synced_success', { count: successCount }));
    }
    setIsSyncingPhotos(false);
  };

  const fieldErrors = useMemo(() => {
    const name = formData.name.trim().length === 0 ? t('product_form_error_name_required') : formData.name.trim().length < 2 ? t('product_form_error_name_short') : '';
    const category = formData.category.trim().length === 0 ? t('product_form_error_category_required') : '';
    const price = !formData.price ? t('product_form_error_price_required') : Number(formData.price) <= 0 ? t('product_form_error_price_invalid') : '';
    const cover = !slots[0].preview ? t('product_form_error_cover_required') : '';
    const images = slots.some(s => s.error) ? t('product_form_error_images_invalid') : '';
    return { name, category, price, cover, images };
  }, [formData, slots, t]);

  const hasPendingUploads = slots.some(s => s.file !== null);
  const hasOrphanBlobs = slots.some(s => s.preview.startsWith('blob:') && s.file === null);
  const hasAnyLocalBlob = slots.some(s => s.preview.startsWith('blob:'));

  const canSave = !fieldErrors.name && !fieldErrors.category && !fieldErrors.price && !fieldErrors.cover && !fieldErrors.images && !hasAnyLocalBlob && !slots.some(s => s.isProcessing);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!adminStore?.id) throw new Error(t('product_form_store_not_found'));
      if (hasAnyLocalBlob) throw new Error(t('product_form_blobs_prevent_save'));

      // 🚀 Tratamento de segurança para o desconto antes de salvar
      const parsedDiscount = parseInt(formData.discount_percent || '0', 10);
      const safeDiscountPercent = isNaN(parsedDiscount) ? 0 : Math.min(100, Math.max(0, parsedDiscount));

      const payload = {
        name: formData.name.trim(),
        slug: createProductSlug(formData.name),
        category: normalizeCategory(formData.category),
        price: Number(normalizePriceString(formData.price)),
        unit: formData.unit.trim() || 'un',
        full_description: formData.full_description.trim(),
        main_image: slots[0].preview,
        gallery: slots.slice(1).map(s => s.preview).filter(Boolean),
        store_id: adminStore.id,
        discount_percent: safeDiscountPercent, // 🚀 Campo novo adicionado aqui
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
    formData, setFormData, priceMajor, setPriceMajor, priceCents, setPriceCents,
    slots, visibleCount, setVisibleCount,
    fieldErrors, hasPendingUploads, hasOrphanBlobs, hasAnyLocalBlob, canSave,
    isSyncingPhotos, handleFileSelect, removePhoto, handleSyncPhotos, saveMutation,
    adminStore
  };
}