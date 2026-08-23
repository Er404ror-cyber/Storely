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

  const newlyUploadedTokensRef = useRef<Set<string>>(new Set());
  const isSavedRef = useRef(false);
  const isInitializedRef = useRef(false);
  const latestSlots = useRef(slots);

  const storageKey = useMemo(() => {
    return `product-form-tokens:${adminStore?.id || 'no-store'}:${productId || 'new'}`;
  }, [adminStore?.id, productId]);

  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    console.log('[Image Manager] Inicializando form. Lendo LocalStorage key:', storageKey);

    const restoredTokens: (string | null)[] = Array(PRODUCT_IMAGE_SLOTS).fill(null);
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedSlotToken[];
        const now = Date.now();
        parsed.forEach(item => {
          if (item && item.slot >= 0 && item.slot < PRODUCT_IMAGE_SLOTS && (now - item.savedAt <= TOKEN_TTL_MS)) {
            restoredTokens[item.slot] = item.token;
            // GARANTIA: Readicionar ao ref para que, se não houver save, seja limpo no unmount
            newlyUploadedTokensRef.current.add(item.token);
            console.log(`[Image Manager] Token temporário restaurado para slot ${item.slot}:`, item.token);
          }
        });
      }
    } catch {
      console.warn('[Image Manager] Falha ao ler LocalStorage silenciosamente ignorada.');
    }

    let foundCorruptImages = false;

    const rawImages = [
      initialData.main_image || '',
      ...(initialData.gallery || [])
    ].slice(0, PRODUCT_IMAGE_SLOTS);

    const initialSlots = Array.from({ length: PRODUCT_IMAGE_SLOTS }, (_, i): SlotState => {
      const url = rawImages[i] || '';
      const isLegacyLocal = url.startsWith('blob:') || url.startsWith('data:');
      
      if (isLegacyLocal && url) {
        foundCorruptImages = true;
      }

      return {
        ...DEFAULT_SLOT,
        preview: url,
        deleteToken: restoredTokens[i] || null,
        error: isLegacyLocal ? t('product_form_image_corrupt_hint', { defaultValue: 'Inválido' }) : '',
      };
    });

    setSlots(initialSlots);

    if (foundCorruptImages) {
      setTimeout(() => {
        toast.error(t('product_form_orphan_global_alert_desc', { defaultValue: 'Fotos inválidas detetadas (invisíveis para clientes). Apague ou substitua as fotos a vermelho.' }), { duration: 6000 });
      }, 500);
    }

    const filledCount = rawImages.filter(Boolean).length;
    setVisibleCount(Math.min(PRODUCT_IMAGE_SLOTS, Math.max(2, filledCount + 1)));

    const parsed = splitPrice(initialData.price);
    setPriceMajor(parsed.major || '');
    setPriceCents(parsed.cents === '00' ? '' : parsed.cents);
  }, [initialData, storageKey, t]);

  useEffect(() => {
    const centsForSave = priceCents === '' ? '00' : priceCents.padEnd(2, '0').slice(0, 2);
    setFormData(prev => ({ ...prev, price: composePrice(priceMajor, centsForSave) }));
  }, [priceMajor, priceCents]);

  useEffect(() => {
    const tokensToSave = slots
      .map((s, slot) => s.deleteToken ? { slot, token: s.deleteToken, savedAt: Date.now() } : null)
      .filter(Boolean);
    try { 
      if (tokensToSave.length > 0) {
        window.localStorage.setItem(storageKey, JSON.stringify(tokensToSave)); 
        console.log('[Image Manager] Progresso salvo no LocalStorage:', tokensToSave);
      } else {
        window.localStorage.removeItem(storageKey);
        console.log('[Image Manager] Sem tokens temporários. LocalStorage limpo.');
      }
    } catch {
      // Ignora falhas de gravação
    }
  }, [slots, storageKey]);

  useEffect(() => {
    latestSlots.current = slots;
  }, [slots]);

  useEffect(() => {
    return () => {
      const pendingTokens = Array.from(newlyUploadedTokensRef.current);
      if (!isSavedRef.current && pendingTokens.length > 0) {
        console.log('[Image Manager] Unmount DETETADO sem salvar! Apagando lixo da nuvem:', pendingTokens);
        pendingTokens.forEach(token => deleteFromCloudinary(token).catch(() => {}));
        newlyUploadedTokensRef.current.clear();
      } else if (isSavedRef.current) {
        console.log('[Image Manager] Unmount após Save. Imagens protegidas com sucesso.');
      }
      latestSlots.current.forEach(s => { 
        if (s.preview.startsWith('blob:')) URL.revokeObjectURL(s.preview);
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

  const handleImageError = useCallback((index: number) => {
    updateSlot(index, { error: t('product_form_image_corrupt_hint', { defaultValue: 'Invisível p/ clientes. Substitua.' }) });
  }, [updateSlot, t]);

  const handleFileSelect = useCallback(async (file: File | undefined, index: number) => {
    if (!file || slots[index].isProcessing) return;

    // Se o user envia uma nova foto, desmarca o isSavedRef para proteger o novo fluxo
    isSavedRef.current = false;

    if (file.size > PRODUCT_IMAGE_LIMIT) {
      updateSlot(index, { error: t('product_form_image_too_large'), file: null });
      return;
    }

    if (slots[index].deleteToken) {
      const oldToken = slots[index].deleteToken!;
      console.log(`[Image Manager] Substituindo slot ${index}. Deletando token pendente:`, oldToken);
      deleteFromCloudinary(oldToken).catch(() => {});
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
        console.log(`[Image Manager] Upload slot ${index} bem sucedido. Recebido deleteToken:`, uploaded.delete_token);
        newlyUploadedTokensRef.current.add(uploaded.delete_token);
      }

      updateSlot(index, {
        preview: permanentUrl,
        deleteToken: uploaded.delete_token ?? null,
        file: null,
        isProcessing: false,
        error: '',
      });
    } catch {
      updateSlot(index, {
        isProcessing: false,
        error: t('product_form_upload_error', { defaultValue: 'Falha no envio.' }),
      });
    }
  }, [slots, visibleCount, updateSlot, t]);

  const removePhoto = useCallback(async (index: number) => {
    if (slots[index].isProcessing) return;

    const { deleteToken, file, preview } = slots[index];
    updateSlot(index, { isProcessing: true });
    
    // Qualquer remoção desmarca o estado de guardado global
    isSavedRef.current = false;

    try {
      if (deleteToken) {
        console.log(`[Image Manager] Removendo foto pendente via Cloudinary com token:`, deleteToken);
        await deleteFromCloudinary(deleteToken);
        newlyUploadedTokensRef.current.delete(deleteToken);
        toast.success(t('product_form_photo_removed_cloud'));
      } else if (file || preview) {
        console.log(`[Image Manager] Removendo referência da foto oficial ou local apenas da UI.`);
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

    const pendingUploads = slots
      .map((slot, index) => ({ slot, index }))
      .filter(item => item.slot.file !== null);

    if (pendingUploads.length === 0) {
      setIsSyncingPhotos(false);
      return;
    }

    setSlots(prev => {
      const next = [...prev];
      pendingUploads.forEach(({ index }) => {
        next[index] = { ...next[index], isProcessing: true, error: '' };
      });
      return next;
    });

    const results = await Promise.all(
      pendingUploads.map(async ({ slot, index }) => {
        try {
          const uploaded = await uploadToCloudinary(slot.file!);
          if (!uploaded?.url) throw new Error();
          return { index, success: true, url: uploaded.url, deleteToken: uploaded.delete_token };
        } catch {
          return { index, success: false };
        }
      })
    );

    setSlots(prev => {
      const next = [...prev];
      results.forEach(res => {
        const { index } = res;
        if (res.success) {
          successCount++;
          if (next[index].preview.startsWith('blob:')) {
            URL.revokeObjectURL(next[index].preview);
          }
          if (res.deleteToken) {
             console.log(`[Image Manager] Sincronização gerou token no slot ${index}:`, res.deleteToken);
             newlyUploadedTokensRef.current.add(res.deleteToken);
          }
          next[index] = {
            ...next[index],
            preview: res.url!,
            deleteToken: res.deleteToken ?? null,
            file: null,
            isProcessing: false,
            error: '',
          };
        } else {
          next[index] = {
            ...next[index],
            isProcessing: false,
            error: t('product_form_upload_error', { defaultValue: 'Falha.' }),
          };
        }
      });
      return next;
    });

    if (successCount > 0) {
      toast.success(t('product_form_photos_synced_success', { count: successCount }));
    }
    setIsSyncingPhotos(false);
  };

  const handleCancel = useCallback(async () => {
    setIsCancelling(true);
    try {
      const tokensToDelete = Array.from(newlyUploadedTokensRef.current);
      if (tokensToDelete.length > 0) {
        console.log(`[Image Manager] Cancelamento acionado! Eliminando rascunhos:`, tokensToDelete);
        await Promise.allSettled(tokensToDelete.map(token => deleteFromCloudinary(token)));
        newlyUploadedTokensRef.current.clear();
      }
      latestSlots.current.forEach(s => {
        if (s.preview.startsWith('blob:')) URL.revokeObjectURL(s.preview);
      });
      try { window.localStorage.removeItem(storageKey); } catch { /* ignore */ }
      onCancel?.();
    } finally {
      setIsCancelling(false);
    }
  }, [onCancel, storageKey]);

  const hasPendingUploads = slots.some(s => s.file !== null);
  const hasAnyLocalBlob = slots.some(s => s.preview.startsWith('blob:') || s.preview.startsWith('data:'));
  const hasOrphanBlobs = slots.some(s => (s.preview.startsWith('blob:') || s.preview.startsWith('data:')) && s.file === null);
  
  const hasBrokenImages = hasOrphanBlobs || slots.some(s => Boolean(s.error));
  const isAnyProcessing = slots.some(s => s.isProcessing);

  const fieldErrors = useMemo(() => {
    const name = formData.name.trim().length === 0 ? t('product_form_error_name_required') : formData.name.trim().length < 2 ? t('product_form_error_name_short') : '';
    const category = formData.category.trim().length === 0 ? t('product_form_error_category_required') : '';
    const price = !formData.price ? t('product_form_error_price_required') : Number(formData.price) <= 0 ? t('product_form_error_price_invalid') : '';
    const cover = !slots[0].preview || !slots[0].preview.startsWith('http') ? t('product_form_error_cover_required') : '';
    const images = hasBrokenImages ? t('product_form_error_images_invalid') : '';
    
    return { name, category, price, cover, images };
  }, [formData, slots, hasBrokenImages, t]);

  const canSave = !fieldErrors.name && 
    !fieldErrors.category && 
    !fieldErrors.price && 
    !fieldErrors.cover && 
    !fieldErrors.images && 
    !hasAnyLocalBlob && 
    !hasBrokenImages && 
    !isAnyProcessing && 
    !isSyncingPhotos &&
    !isCancelling;

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!adminStore?.id) throw new Error(t('product_form_store_not_found'));
      
      if (hasBrokenImages) throw new Error(t('product_form_orphan_blob_prevent_save', { defaultValue: 'Não é possível guardar. Substitua as fotos danificadas primeiro.' }));
      if (hasPendingUploads) throw new Error(t('product_form_blobs_prevent_save', { defaultValue: 'Existem fotos pendentes de envio. Sincronize antes de salvar.' }));

      const validMainImage = slots[0].preview.startsWith('http') ? slots[0].preview : '';
      const validGallery = slots.slice(1).map(s => s.preview).filter(url => Boolean(url) && url.startsWith('http'));

      if (!validMainImage) throw new Error(t('product_form_error_cover_required'));

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
      console.log('[Image Manager] Base de dados guardada! Promovendo imagens de temporárias a permanentes...');
      
      // MARCO CRUCIAL: Sinaliza que os tokens não devem ser apagados na desmontagem
      isSavedRef.current = true;
      newlyUploadedTokensRef.current.clear();

      // LIMPEZA CRUCIAL DO ESTADO E DO LOCAL STORAGE
      try { 
        window.localStorage.removeItem(storageKey); 
        console.log('[Image Manager] LocalStorage limpo com sucesso após save.');
      } catch {}
      
      setSlots(prev => prev.map(s => ({ ...s, deleteToken: null })));
      console.log('[Image Manager] DeleteTokens removidos da UI. As imagens estão seguras.');

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
    handleImageError,
    saveMutation,
    adminStore,
  };
}