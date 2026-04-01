import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlignLeft,
  Check,
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
import {
  deleteFromCloudinary,
  uploadToCloudinary,
  type CloudinaryDeleteResult,
} from '../../utils/cloud';
import { useAdminStore } from '../../hooks/useAdminStore';
import { useTranslate } from '../../context/LanguageContext';
import {
  composePrice,
  createProductSlug,
  formatBytes,
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

interface ProductFormProps {
  productId?: string;
  isCreating?: boolean;
  initialData: ProductFormData;
  onCancel?: () => void;
  onSuccess?: () => void;
}

type PersistedSlotToken = {
  slot: number;
  token: string;
  savedAt: number;
};

const TOKEN_TTL_MS = 10 * 60 * 1000;

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

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category: '',
    price: '',
    unit: 'un',
    full_description: '',
    main_image: '',
    gallery: [],
    currency: initialData.currency,
  });

  const [priceMajor, setPriceMajor] = useState('');
  const [priceCents, setPriceCents] = useState('');

  const [previews, setPreviews] = useState<string[]>(
    Array(PRODUCT_IMAGE_SLOTS).fill('')
  );
  const [tempFiles, setTempFiles] = useState<(File | null)[]>(
    Array(PRODUCT_IMAGE_SLOTS).fill(null)
  );
  const [tempDeleteTokens, setTempDeleteTokens] = useState<(string | null)[]>(
    Array(PRODUCT_IMAGE_SLOTS).fill(null)
  );
  const [fileSizes, setFileSizes] = useState<number[]>(
    Array(PRODUCT_IMAGE_SLOTS).fill(0)
  );
  const [uploadErrors, setUploadErrors] = useState<string[]>(
    Array(PRODUCT_IMAGE_SLOTS).fill('')
  );
  const [processingSlots, setProcessingSlots] = useState<boolean[]>(
    Array(PRODUCT_IMAGE_SLOTS).fill(false)
  );

  const storageKey = useMemo(() => {
    const storePart = adminStore?.id || 'no-store';
    const productPart = productId || (isCreating ? 'new-product' : 'unknown-product');
    return `product-form-delete-tokens:${storePart}:${productPart}`;
  }, [adminStore?.id, productId, isCreating]);

  const loadPersistedTokens = useCallback((): (string | null)[] => {
    if (typeof window === 'undefined') {
      return Array(PRODUCT_IMAGE_SLOTS).fill(null);
    }

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return Array(PRODUCT_IMAGE_SLOTS).fill(null);

      const parsed = JSON.parse(raw) as PersistedSlotToken[];
      const now = Date.now();
      const result = Array(PRODUCT_IMAGE_SLOTS).fill(null) as (string | null)[];
      const stillValid: PersistedSlotToken[] = [];

      for (const item of parsed || []) {
        if (
          typeof item?.slot !== 'number' ||
          typeof item?.token !== 'string' ||
          typeof item?.savedAt !== 'number'
        ) {
          continue;
        }

        if (item.slot < 0 || item.slot >= PRODUCT_IMAGE_SLOTS) continue;
        if (now - item.savedAt > TOKEN_TTL_MS) continue;

        result[item.slot] = item.token;
        stillValid.push(item);
      }

      window.localStorage.setItem(storageKey, JSON.stringify(stillValid));
      return result;
    } catch (error) {
      console.error('[ProductForm] failed to restore delete tokens:', error);
      return Array(PRODUCT_IMAGE_SLOTS).fill(null);
    }
  }, [storageKey]);

  const persistTokens = useCallback(
    (tokens: (string | null)[]) => {
      if (typeof window === 'undefined') return;

      try {
        const now = Date.now();
        const payload: PersistedSlotToken[] = tokens
          .map((token, slot) =>
            token
              ? {
                  slot,
                  token,
                  savedAt: now,
                }
              : null
          )
          .filter(Boolean) as PersistedSlotToken[];

        window.localStorage.setItem(storageKey, JSON.stringify(payload));
      } catch (error) {
        console.error('[ProductForm] failed to persist delete tokens:', error);
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
      currency: initialData.currency,
    });

    setPriceMajor(parsed.major || '');
    setPriceCents(parsed.cents === '00' ? '' : parsed.cents);

    setPreviews(
      [
        ...mergedImages,
        ...Array(Math.max(0, PRODUCT_IMAGE_SLOTS - mergedImages.length)).fill(''),
      ].slice(0, PRODUCT_IMAGE_SLOTS)
    );

    setTempFiles(Array(PRODUCT_IMAGE_SLOTS).fill(null));
    setTempDeleteTokens(restoredTokens);
    setFileSizes(Array(PRODUCT_IMAGE_SLOTS).fill(0));
    setUploadErrors(Array(PRODUCT_IMAGE_SLOTS).fill(''));
    setProcessingSlots(Array(PRODUCT_IMAGE_SLOTS).fill(false));
  }, [initialData, loadPersistedTokens]);

  useEffect(() => {
    const centsForSave =
      priceCents === '' ? '00' : priceCents.padEnd(2, '0').slice(0, 2);

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
        .limit(20);

      if (error) throw error;

      const unique = new Set<string>();
      const ordered: string[] = [];

      for (const item of data || []) {
        const category = normalizeCategory(item.category || '');
        if (!category) continue;
        if (unique.has(category.toLowerCase())) continue;
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

  const handleFieldChange = useCallback(
    (field: keyof ProductFormData, value: string | string[]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

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
      if (clean === '') return '00';
      return clean.padEnd(2, '0');
    });
  }, [priceMajor]);

  const handleCategoryBlur = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      category: normalizeCategory(prev.category),
    }));
  }, []);

  const handleDescriptionChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value.slice(0, PRODUCT_LIMITS.description);
      const breaks = (value.match(/\n/g) || []).length;

      if (breaks <= PRODUCT_LIMITS.maxBreaks) {
        setFormData((prev) => ({ ...prev, full_description: value }));
      }
    },
    []
  );

  const handleDescriptionKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key !== 'Enter') return;
      const breaks = (formData.full_description.match(/\n/g) || []).length;
      if (breaks >= PRODUCT_LIMITS.maxBreaks) {
        e.preventDefault();
      }
    },
    [formData.full_description]
  );

  const clearPhotoSlot = useCallback(
    (index: number) => {
      setPreviews((prev) => {
        const next = [...prev];
        next[index] = '';
        return next;
      });

      setTempFiles((prev) => {
        const next = [...prev];
        next[index] = null;
        return next;
      });

      clearPersistedSlotToken(index);

      setFileSizes((prev) => {
        const next = [...prev];
        next[index] = 0;
        return next;
      });

      setUploadErrors((prev) => {
        const next = [...prev];
        next[index] = '';
        return next;
      });

      setFormData((prev) => {
        if (index === 0) {
          return {
            ...prev,
            main_image: '',
          };
        }

        const nextGallery = [...(prev.gallery || [])];
        nextGallery[index - 1] = '';
        return {
          ...prev,
          gallery: nextGallery.filter(Boolean),
        };
      });
    },
    [clearPersistedSlotToken]
  );

  const replaceSlotWithNewFile = useCallback(
    async (index: number, file: File) => {
      const previousToken = tempDeleteTokens[index];
      let cloudDeleteResult: CloudinaryDeleteResult | null = null;

      if (previousToken) {
        console.log(
          `[Cloudinary] replacing slot ${index}, deleting previous image with token`
        );
        cloudDeleteResult = await deleteFromCloudinary(previousToken);
      }

      clearPersistedSlotToken(index);

      setFileSizes((prev) => {
        const next = [...prev];
        next[index] = file.size;
        return next;
      });

      const tooLarge = file.size > PRODUCT_IMAGE_LIMIT;

      setUploadErrors((prev) => {
        const next = [...prev];
        next[index] = tooLarge ? t('product_form_image_too_large') : '';
        return next;
      });

      setTempFiles((prev) => {
        const next = [...prev];
        next[index] = tooLarge ? null : file;
        return next;
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => {
          const next = [...prev];
          next[index] = String(reader.result || '');
          return next;
        });
      };
      reader.readAsDataURL(file);

      if (previousToken) {
        if (cloudDeleteResult?.ok) {
          toast.success(t('product_form_image_replaced_cloud'));
        } else {
          toast(t('product_form_image_replaced_local_only_after_cloud_fail'), {
            icon: '⚠️',
          });
        }
      } else {
        toast.success(t('product_form_image_replaced_local'));
      }
    },
    [clearPersistedSlotToken, t, tempDeleteTokens]
  );

  const handleFileSelect = useCallback(
    async (e: ChangeEvent<HTMLInputElement>, index: number) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (processingSlots[index]) {
        e.target.value = '';
        return;
      }

      setSlotProcessing(index, true);

      try {
        await replaceSlotWithNewFile(index, file);
      } catch (error) {
        console.error(`[ProductForm] failed to replace slot ${index}:`, error);
        toast.error(t('product_form_image_replace_error'));
      } finally {
        setSlotProcessing(index, false);
        e.target.value = '';
      }
    },
    [processingSlots, replaceSlotWithNewFile, setSlotProcessing, t]
  );

  const removePhoto = useCallback(
    async (index: number) => {
      if (processingSlots[index]) return;

      const token = tempDeleteTokens[index];
      setSlotProcessing(index, true);

      try {
        if (token) {
          console.log(`[Cloudinary] removing image at slot ${index} using delete token`);

          const result = await deleteFromCloudinary(token);

          if (result.ok) {
            console.log(`[Cloudinary] image at slot ${index} removed successfully`);
            clearPhotoSlot(index);
            toast.success(t('product_form_image_removed_cloud'));
          } else {
            console.warn(
              `[Cloudinary] slot ${index} token expired or deletion failed:`,
              result.message
            );
            clearPhotoSlot(index);
            toast(t('product_form_image_removed_local_only_after_cloud_fail'), {
              icon: '⚠️',
            });
          }
        } else {
          console.log(
            `[Cloudinary] slot ${index} has no delete token. Local state will be cleared only`
          );
          clearPhotoSlot(index);
          toast.success(t('product_form_image_removed_local'));
        }
      } catch (error) {
        console.error(`[Cloudinary] failed to remove image at slot ${index}:`, error);
        clearPhotoSlot(index);
        toast(t('product_form_image_removed_local_only_after_cloud_fail'), {
          icon: '⚠️',
        });
      } finally {
        setSlotProcessing(index, false);
      }
    },
    [clearPhotoSlot, processingSlots, setSlotProcessing, t, tempDeleteTokens]
  );

  const fieldErrors = useMemo(() => {
    const name =
      formData.name.trim().length === 0
        ? t('product_form_error_name_required')
        : formData.name.trim().length < 2
        ? t('product_form_error_name_short')
        : '';

    const category =
      formData.category.trim().length === 0
        ? t('product_form_error_category_required')
        : '';

    const price =
      !formData.price
        ? t('product_form_error_price_required')
        : Number(formData.price) <= 0
        ? t('product_form_error_price_invalid')
        : '';

    const cover = !previews[0] ? t('product_form_error_cover_required') : '';

    const images = uploadErrors.some(Boolean)
      ? t('product_form_error_images_invalid')
      : '';

    return { name, category, price, cover, images };
  }, [formData.name, formData.category, formData.price, previews, uploadErrors, t]);

  const pendingItems = useMemo(() => {
    const items: string[] = [];
    if (fieldErrors.name) items.push(t('product_form_pending_name'));
    if (fieldErrors.category) items.push(t('product_form_pending_category'));
    if (fieldErrors.price) items.push(t('product_form_pending_price'));
    if (fieldErrors.cover) items.push(t('product_form_pending_cover'));
    if (fieldErrors.images) items.push(t('product_form_pending_images'));
    return items;
  }, [fieldErrors, t]);

  const canSave = useMemo(() => {
    return (
      !fieldErrors.name &&
      !fieldErrors.category &&
      !fieldErrors.price &&
      !fieldErrors.cover &&
      !fieldErrors.images
    );
  }, [fieldErrors]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!adminStore?.id) {
        throw new Error(t('product_form_store_not_found'));
      }

      const uploads = await Promise.all(
        tempFiles.map(async (file, index) => {
          if (!file) return null;

          const uploaded = await uploadToCloudinary(file);
          console.log(`[Cloudinary] uploaded slot ${index}:`, uploaded);

          return {
            index,
            url: uploaded.url,
            delete_token: uploaded.delete_token ?? null,
          };
        })
      );

      updateDeleteTokens((prev) => {
        const next = [...prev];
        uploads.forEach((item) => {
          if (!item) return;
          next[item.index] = item.delete_token;
        });
        return next;
      });

      const uploadedMain = uploads.find((item) => item?.index === 0)?.url;
      const finalMainImage = uploadedMain || formData.main_image || previews[0] || '';

      const nextGallery = [...(formData.gallery || [])];
      uploads.forEach((item) => {
        if (!item || item.index === 0) return;
        nextGallery[item.index - 1] = item.url;
      });

      const payload = {
        name: formData.name.trim(),
        slug: createProductSlug(formData.name),
        category: normalizeCategory(formData.category),
        price: Number(normalizePriceString(formData.price)),
        unit: formData.unit.trim() || 'un',
        full_description: formData.full_description.trim(),
        main_image: finalMainImage,
        gallery: nextGallery.filter(Boolean),
        store_id: adminStore.id,
        currency: initialData.currency || adminStore?.settings?.currency || 'MZN',
      };

      if (isCreating) {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
        return;
      }

      if (!productId) {
        throw new Error(t('product_form_product_not_found'));
      }

      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', productId);

      if (error) throw error;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['product', productId] }),
        queryClient.invalidateQueries({
          queryKey: ['store-recent-product-categories', adminStore?.id],
        }),
      ]);

      toast.success(
        isCreating ? t('product_form_created_success') : t('product_form_updated_success')
      );
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : t('product_form_save_error');
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

          <div className="min-w-0">
            <h2 className="text-base font-black uppercase tracking-wide text-slate-900">
              {isCreating ? t('product_form_create_title') : t('product_form_edit_title')}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{t('product_form_intro')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: PRODUCT_IMAGE_SLOTS }).map((_, index) => {
            const preview = previews[index];
            const isCover = index === 0;
            const hasError = Boolean(uploadErrors[index]);
            const isProcessing = processingSlots[index];

            return (
              <div key={index} className="flex flex-col gap-2">
                <div
                  className={`relative aspect-square overflow-hidden rounded-[1.25rem] border ${
                    preview
                      ? hasError
                        ? 'border-red-300 bg-red-50'
                        : isCover
                        ? 'border-blue-300 bg-slate-50'
                        : 'border-slate-200 bg-slate-50'
                      : 'border-dashed border-slate-300 bg-slate-50'
                  }`}
                >
                  {preview ? (
                    <>
                      <img
                        src={preview}
                        alt=""
                        loading="lazy"
                        className={`h-full w-full object-cover ${isProcessing ? 'opacity-50' : ''}`}
                      />

                      <div className="absolute right-2 top-2 flex gap-2">
                        <label className="cursor-pointer rounded-xl bg-white p-2 text-slate-700 shadow-sm">
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
                          className="rounded-xl bg-white p-2 text-red-500 shadow-sm disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>

                      {isCover ? (
                        <div className="absolute left-2 top-2 rounded-xl bg-blue-600 px-2 py-1 text-[10px] font-black text-white">
                          {t('product_form_cover')}
                        </div>
                      ) : null}

                      <div className="absolute bottom-2 left-2 rounded-lg bg-black/70 px-2 py-1 text-[10px] font-bold text-white">
                        {formatBytes(fileSizes[index])}
                      </div>
                    </>
                  ) : (
                    <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 p-3 text-center">
                      <UploadCloud size={20} className="text-slate-400" />
                      <span className="text-[11px] font-black uppercase tracking-wide text-slate-500">
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

        <p className="mt-4 text-xs text-slate-500">{t('product_form_image_help')}</p>
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
              className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-bold outline-none focus:border-blue-500 focus:bg-white"
            />
            {fieldErrors.name ? (
              <p className="mt-2 text-xs font-semibold text-amber-600">{fieldErrors.name}</p>
            ) : null}
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-[11px] font-black uppercase tracking-wider text-slate-500">
              {t('product_form_price_label')}
            </label>

            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-3">
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
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-2xl font-black outline-none focus:border-blue-500"
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
                    className={`h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-center text-xl font-black outline-none focus:border-blue-500 ${
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

            <input
              type="text"
              maxLength={PRODUCT_LIMITS.category}
              value={formData.category}
              onChange={(e) => handleFieldChange('category', e.target.value)}
              onBlur={handleCategoryBlur}
              placeholder={t('product_form_category_placeholder')}
              className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-bold outline-none focus:border-blue-500 focus:bg-white"
            />

            {recentStoreCategories.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {recentStoreCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleFieldChange('category', category)}
                    className="rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-black uppercase tracking-wide text-slate-600"
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
              className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-bold outline-none focus:border-blue-500 focus:bg-white"
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
              onKeyDown={handleDescriptionKeyDown}
              placeholder={t('product_form_description_placeholder')}
              className="min-h-[180px] w-full resize-none rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
            />

            <p className="mt-2 text-xs text-slate-500">
              {t('product_form_description_help')}
            </p>
          </div>
        </div>
      </section>

      <div className="pointer-events-none fixed bottom-4 left-0 right-0 z-50 px-3 md:px-6">
        <div className="mx-auto w-full max-w-xl md:max-w-md xl:max-w-2xl">
          <section className="pointer-events-auto rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-lg">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Info size={14} className="text-blue-500" />
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-900">
                    {pendingItems.length > 0
                      ? t('product_form_pending_title')
                      : t('product_form_ready_title')}
                  </p>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  {pendingItems.length > 0
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
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-600"
                >
                  <X size={14} />
                </button>

                <button
                  type="button"
                  disabled={!canSave || saveMutation.isPending}
                  onClick={() => saveMutation.mutate()}
                  className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-[11px] font-black uppercase tracking-wider ${
                    canSave
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-200 text-slate-400'
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