import { useState, useEffect, useMemo, memo, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import type { StylesConfig, FilterOptionOption } from 'react-select';
import currencyCodes from 'currency-codes';
import {
  Plus,
  Loader2,
  Save,
  Search,
  Edit,
  Package,
  X,
  Tag,
  Power,
  Coins,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Circle,
  PauseCircle,
  Boxes,
  Store,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { supabase } from '../lib/supabase';
import { useTranslate } from '../context/LanguageContext';
import { ProductDetails } from './ProdutcsDetails';
import {
  getUserGeoCurrency,
  getCurrencyCountry,
  countryCodeToFlag,
  getCurrencyDisplayName,
} from '../utils/geoUserCurrency';
type TranslateFn = ReturnType<typeof useTranslate>['t'];
interface Store {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  logo_url: string | null;
  settings: Record<string, unknown> | null;
  updated_at_name: string | null;
  owner_email: string | null;
  whatsapp_number: string | null;
  currency: string | null;
}

interface Product {
  id: string;
  name: string;
  category?: string | null;
  price: number;
  currency?: string | null;
  is_active: boolean;
  main_image: string;
  store_id: string;
  created_at?: string;
}

type CurrencyOption = {
  value: string;
  label: string;
  search: string;
  flag: string;
  country: string;
};

type CachePayload<T> = {
  data: T;
  savedAt: number;
  expiresAt: number;
};

const ADMIN_STORE_CACHE_KEY = 'storelyy_admin_store_cache';
const ADMIN_STORE_CACHE_TTL = 1000 * 60 * 5;

function readLocalCache<T>(key: string): CachePayload<T> | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CachePayload<T>;

    if (
      !parsed ||
      typeof parsed.savedAt !== 'number' ||
      typeof parsed.expiresAt !== 'number' ||
      parsed.data == null
    ) {
      localStorage.removeItem(key);
      return null;
    }

    if (Date.now() >= parsed.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

function writeLocalCache<T>(key: string, data: T, ttl: number): CachePayload<T> | null {
  if (typeof window === 'undefined') return null;

  const now = Date.now();
  const payload: CachePayload<T> = {
    data,
    savedAt: now,
    expiresAt: now + ttl,
  };

  try {
    localStorage.setItem(key, JSON.stringify(payload));
    return payload;
  } catch {
    return null;
  }
}

const ProductImage = memo(({ src, alt }: { src: string; alt: string }) => (
  <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover"
      loading="lazy"
      decoding="async"
      onError={(e) => {
        e.currentTarget.src =
          'https://antoniogaspar.pt/wp-content/uploads/2023/06/ag-blog-featured-img.svg';
      }}
    />
  </div>
));

ProductImage.displayName = 'ProductImage';

const CurrencyOptionLabel = memo(({ option }: { option: CurrencyOption }) => {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-sm leading-none shrink-0">{option.flag}</span>
      <span className="truncate font-semibold text-[12px] text-slate-900">{option.label}</span>
    </div>
  );
});

CurrencyOptionLabel.displayName = 'CurrencyOptionLabel';

const SELECT_STYLES: StylesConfig<CurrencyOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: 42,
    borderRadius: 14,
    borderColor: state.isFocused ? '#2563eb' : '#e2e8f0',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(37,99,235,0.08)' : 'none',
    backgroundColor: '#fff',
    cursor: 'text',
    transition: 'all 160ms ease',
    '&:hover': {
      borderColor: state.isFocused ? '#2563eb' : '#cbd5e1',
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 8px',
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    color: '#0f172a',
    fontSize: 12,
    fontWeight: 700,
  }),
  placeholder: (base) => ({
    ...base,
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 600,
  }),
  singleValue: (base) => ({
    ...base,
    color: '#0f172a',
    fontSize: 12,
    fontWeight: 700,
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
    borderRadius: 16,
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    boxShadow: '0 12px 28px rgba(15,23,42,0.12)',
  }),
  menuList: (base) => ({
    ...base,
    padding: 6,
    maxHeight: 280,
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 700,
    backgroundColor: state.isSelected ? '#eff6ff' : state.isFocused ? '#f8fafc' : '#fff',
    color: '#0f172a',
    cursor: 'pointer',
    padding: '8px 10px',
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({
    ...base,
    color: '#94a3b8',
    '&:hover': { color: '#64748b' },
  }),
};

function ConfirmDeleteModal({
  open,
  loading,
  productName,
  onClose,
  onConfirm,
  t,
}: {
  open: boolean;
  loading: boolean;
  productName: string;
  onClose: () => void;
  onConfirm: () => void;
  t: TranslateFn;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-slate-950/45 p-3 sm:items-center">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle size={18} />
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-black text-slate-900">
              {t('delete_product_confirm_title')}
            </h3>
            <p className="mt-1 break-words text-sm leading-relaxed text-slate-500">
              {t('delete_product_confirm_text')}{' '}
              <span className="font-bold text-slate-800">{productName}</span>
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-[11px] font-black uppercase tracking-[0.1em] text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {t('btn_cancel')}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 text-[11px] font-black uppercase tracking-[0.1em] text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {t('btn_delete')}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProgressGuide({
  hasCurrency,
  hasProducts,
  t,
}: {
  hasCurrency: boolean;
  hasProducts: boolean;
  t: TranslateFn;
}) {
  const items = [
    { done: hasCurrency, label: t('products_tutorial_step_1_title') },
    { done: hasProducts, label: t('products_tutorial_step_2_title') },
    { done: hasProducts, label: t('products_tutorial_step_3_title') },
  ];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
      <div className="flex flex-col gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-black text-slate-900">{t('products_tutorial_title')}</h3>
          <p className="mt-1 text-xs text-slate-500">{t('products_tutorial_description')}</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={index}
              className={`flex min-w-0 items-center gap-2 rounded-2xl px-3 py-2 text-[11px] font-semibold ${
                item.done
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {item.done ? (
                <CheckCircle2 size={14} className="shrink-0" />
              ) : (
                <Circle size={14} className="shrink-0" />
              )}
              <span className="truncate">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EmptyProductsState({
  onAdd,
  t,
}: {
  onAdd: () => void;
  t: TranslateFn;
}) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center px-4 py-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
        <Store size={24} />
      </div>

      <h3 className="mt-4 text-base font-black text-slate-900">{t('products_empty_title')}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        {t('products_empty_description')}
      </p>

      <button
        onClick={onAdd}
        className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 text-[11px] font-black uppercase tracking-[0.1em] text-white transition hover:bg-blue-700"
      >
        <Plus size={14} />
        {t('btn_new_product')}
      </button>
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate text-lg font-black text-slate-900">{value}</p>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  count,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between md:p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
          {icon}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-black text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">{count}</p>
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function ProductCard({
  product,
  storeCurrency,
  onToggle,
  onDelete,
  togglePending,
  t,
}: {
  product: Product;
  storeCurrency: string;
  onToggle: () => void;
  onDelete: () => void;
  togglePending: boolean;
  t: TranslateFn;
}) {
  return (
    <div
      style={{ contentVisibility: 'auto', containIntrinsicSize: '340px' }}
      className="min-w-0 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm"
    >
       <Link
          to={`/admin/produtos/${product.id}`}
          state={{ fromStore: true }}>
      <ProductImage src={product.main_image} alt={product.name} />
      </Link>
      <div className="mt-3 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="min-w-0 flex-1 truncate text-sm font-black text-slate-900">
            {product.name}
          </h3>

          <span
            className={`inline-flex shrink-0 items-center rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${
              product.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {product.is_active ? t('status_active') : t('status_paused')}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {product.category ? (
            <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              <Tag size={11} className="shrink-0 text-blue-500" />
              <span className="truncate">{product.category}</span>
            </span>
          ) : null}

          <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-800">
            <Coins size={11} className="shrink-0 text-emerald-600" />
            <span className="truncate">
              {storeCurrency} {Number(product.price || 0).toLocaleString()}
            </span>
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={onToggle}
          disabled={togglePending}
          className={`inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-xl px-3 text-[11px] font-black uppercase tracking-[0.08em] transition disabled:opacity-50 ${
            product.is_active
              ? 'bg-green-50 text-green-700 hover:bg-green-100'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Power size={13} className="shrink-0" />
          <span className="truncate">
            {product.is_active ? t('pause_product') : t('activate_product')}
          </span>
        </button>

        <Link
          to={`/admin/produtos/${product.id}`}
          state={{ fromStore: true }}
          className="inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-xl bg-blue-50 px-3 text-[11px] font-black uppercase tracking-[0.08em] text-blue-700 transition hover:bg-blue-600 hover:text-white"
        >
          <Edit size={13} className="shrink-0" />
          <span className="truncate">{t('view_product')}</span>
        </Link>
      </div>

      <button
        onClick={onDelete}
        className="mt-2 inline-flex h-10 w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 text-[11px] font-black uppercase tracking-[0.08em] text-red-600 transition hover:bg-red-50"
      >
        <Trash2 size={13} className="shrink-0" />
        <span className="truncate">{t('btn_delete')}</span>
      </button>
    </div>
  );
}

export function ProductsList() {
  const { t, language } = useTranslate();
  const queryClient = useQueryClient();

  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [geoCurrencySuggestion, setGeoCurrencySuggestion] =
    useState<ReturnType<typeof getUserGeoCurrency> | null>(null);
  const [isDirtyCurrency, setIsDirtyCurrency] = useState(false);
  const [isCurrencyEditing, setIsCurrencyEditing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const initializedStoreIdRef = useRef<string | null>(null);

  const { data: store, isLoading: isLoadingStore } = useQuery<Store>({
    queryKey: ['admin-store'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('stores')
        .select(
          'id, owner_id, name, slug, description, created_at, logo_url, settings, updated_at_name, owner_email, whatsapp_number, currency'
        )
        .eq('owner_id', user.id)
        .single();

      if (error) throw error;
      return data as Store;
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 0,
  });

  useEffect(() => {
    if (!store?.id) return;

    const backendCurrency = store.currency?.trim()?.toUpperCase() || '';
    const localStoreCache = readLocalCache<Store>(ADMIN_STORE_CACHE_KEY);
    const cachedCurrency = localStoreCache?.data?.currency?.trim()?.toUpperCase() || '';

    const persistedCurrency = backendCurrency || cachedCurrency;
    const isNewStoreContext = initializedStoreIdRef.current !== store.id;

    if (isNewStoreContext) {
      initializedStoreIdRef.current = store.id;

      if (persistedCurrency) {
        setSelectedCurrency(persistedCurrency);
        setGeoCurrencySuggestion(null);
        setIsDirtyCurrency(false);
        setIsCurrencyEditing(false);
        return;
      }

      const geo = getUserGeoCurrency();
      const suggested = geo?.currency?.trim()?.toUpperCase() || '';

      setGeoCurrencySuggestion(geo);

      if (suggested) {
        setSelectedCurrency(suggested);
      } else {
        setSelectedCurrency('');
      }

      setIsDirtyCurrency(false);
      setIsCurrencyEditing(true);
      return;
    }

    if (!isDirtyCurrency) {
      if (persistedCurrency) {
        if (selectedCurrency !== persistedCurrency) {
          setSelectedCurrency(persistedCurrency);
        }
        setGeoCurrencySuggestion(null);
        return;
      }

      if (!selectedCurrency) {
        const geo = getUserGeoCurrency();
        const suggested = geo?.currency?.trim()?.toUpperCase() || '';
        setGeoCurrencySuggestion(geo);

        if (suggested) {
          setSelectedCurrency(suggested);
        }
      }
    }
  }, [store?.id, store?.currency, isDirtyCurrency, selectedCurrency]);

  const saveCurrencyMutation = useMutation({
    mutationFn: async (currency: string) => {
      if (!store?.id) throw new Error('Store not found');

      const cleanCurrency = currency.trim().toUpperCase();

      const { data, error } = await supabase
        .from('stores')
        .update({ currency: cleanCurrency })
        .eq('id', store.id)
        .select(
          'id, owner_id, name, slug, description, created_at, logo_url, settings, updated_at_name, owner_email, whatsapp_number, currency'
        )
        .single();

      if (error) throw error;

      return data as Store;
    },
    onSuccess: (updatedStore) => {
      queryClient.setQueryData<Store>(['admin-store'], (old) =>
        old ? { ...old, ...updatedStore, currency: updatedStore.currency } : updatedStore
      );

      const cached = readLocalCache<Store>(ADMIN_STORE_CACHE_KEY);

      if (cached?.data) {
        writeLocalCache<Store>(
          ADMIN_STORE_CACHE_KEY,
          {
            ...cached.data,
            ...updatedStore,
            currency: updatedStore.currency,
          },
          ADMIN_STORE_CACHE_TTL
        );
      } else {
        writeLocalCache<Store>(ADMIN_STORE_CACHE_KEY, updatedStore, ADMIN_STORE_CACHE_TTL);
      }

      setSelectedCurrency(updatedStore.currency?.trim()?.toUpperCase() || '');
      setGeoCurrencySuggestion(null);
      setIsDirtyCurrency(false);
      setIsCurrencyEditing(false);

      toast.success(t('currency_save_success'));
    },
    onError: (error) => {
      console.error('save currency error:', error);
      toast.error(t('currency_save_error'));
    },
  });

  const currencyOptions = useMemo<CurrencyOption[]>(() => {
    const locale = language === 'pt' ? 'pt-PT' : 'en';

    return currencyCodes
      .codes()
      .map((code) => {
        const info = currencyCodes.code(code);
        if (!info) return null;

        const country = getCurrencyCountry(code);
        const flag = countryCodeToFlag(country);
        const displayName = getCurrencyDisplayName(code, locale) || info.currency || code;

        return {
          value: code,
          label: `${code} - ${displayName}`,
          search: `${code} ${displayName} ${info.currency || ''}`.toLowerCase(),
          flag,
          country,
        };
      })
      .filter((item): item is CurrencyOption => item !== null)
      .sort((a, b) => {
        if (a.value === selectedCurrency) return -1;
        if (b.value === selectedCurrency) return 1;
        return a.value.localeCompare(b.value);
      });
  }, [language, selectedCurrency]);

  const selectedCurrencyOption = useMemo(
    () => currencyOptions.find((opt) => opt.value === selectedCurrency) || null,
    [currencyOptions, selectedCurrency]
  );

  const handleCurrencyChange = useCallback((val: CurrencyOption | null) => {
    if (!val) return;
    setSelectedCurrency(val.value.toUpperCase());
    setIsDirtyCurrency(true);
  }, []);

  const filterCurrencyOption = useCallback(
    (option: FilterOptionOption<CurrencyOption>, rawInput: string) => {
      const term = rawInput.toLowerCase().trim();
      if (!term) return true;

      return (
        option.data.value.toLowerCase().includes(term) ||
        option.data.label.toLowerCase().includes(term) ||
        option.data.search.includes(term)
      );
    },
    []
  );

  const formatCurrencyOptionLabel = useCallback(
    (option: CurrencyOption) => <CurrencyOptionLabel option={option} />,
    []
  );

  const backendCurrency = store?.currency?.trim()?.toUpperCase() || '';

  const hasCurrencyChanges = useMemo(
    () => !!selectedCurrency && selectedCurrency !== backendCurrency,
    [selectedCurrency, backendCurrency]
  );

  const handleSaveCurrency = useCallback(() => {
    if (!selectedCurrency || !store?.id || saveCurrencyMutation.isPending) {
      if (!selectedCurrency) {
        toast.error(t('currency_required_text'));
      }
      return;
    }
    saveCurrencyMutation.mutate(selectedCurrency);
  }, [selectedCurrency, store?.id, saveCurrencyMutation, t]);

  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['products', store?.id],
    queryFn: async () => {
      if (!store?.id) return [];

      const { data, error } = await supabase
        .from('products')
        .select('id, name, category, price, is_active, main_image, store_id, created_at')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
    enabled: !!store?.id,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 0,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: boolean }) => {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !status })
        .eq('id', id);

      if (error) throw error;

      return { id, newStatus: !status };
    },
    onSuccess: ({ id, newStatus }) => {
      queryClient.setQueryData<Product[]>(['products', store?.id], (old = []) =>
        old.map((item) => (item.id === id ? { ...item, is_active: newStatus } : item))
      );

      toast.success(
        newStatus ? t('product_activated_success') : t('product_paused_success')
      );
    },
    onError: () => {
      toast.error(t('product_status_update_error'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      return productId;
    },
    onSuccess: (productId) => {
      queryClient.setQueryData<Product[]>(['products', store?.id], (old = []) =>
        old.filter((item) => item.id !== productId)
      );
      setDeleteTarget(null);
      toast.success(t('product_delete_success'));
    },
    onError: () => {
      toast.error(t('product_delete_error'));
    },
  });

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return products;

    return products.filter((p) => {
      const name = p.name?.toLowerCase() || '';
      const category = p.category?.toLowerCase() || '';
      const price = String(p.price ?? '');
      const currency = String(store?.currency ?? selectedCurrency ?? '').toLowerCase();

      return (
        name.includes(term) ||
        category.includes(term) ||
        price.includes(term) ||
        currency.includes(term)
      );
    });
  }, [products, searchTerm, store?.currency, selectedCurrency]);

  const activeProducts = useMemo(
    () => filteredProducts.filter((p) => p.is_active),
    [filteredProducts]
  );

  const pausedProducts = useMemo(
    () => filteredProducts.filter((p) => !p.is_active),
    [filteredProducts]
  );

  const activeProductsCount = useMemo(
    () => products.filter((p) => p.is_active).length,
    [products]
  );

  const pausedProductsCount = useMemo(
    () => products.filter((p) => !p.is_active).length,
    [products]
  );

  if (isLoadingStore || !store) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const storeCurrency = store.currency || selectedCurrency || 'USD';
  const hasProducts = products.length > 0;
  const hasCompletedGuide = !!backendCurrency && hasProducts;

  const addButton = (
    <button
      onClick={() => setIsAdding(true)}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 text-[11px] font-black uppercase tracking-[0.1em] text-white transition hover:bg-blue-700"
    >
      <Plus size={14} />
      {t('btn_new_product')}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-700 antialiased">
      <main className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-4 md:px-6 md:py-6 xl:px-8">
        <div className="space-y-3 md:space-y-4">
          <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                    <Package size={17} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-black uppercase tracking-[0.12em] text-blue-600">
                      {store.name}
                    </p>
                    <h1 className="truncate text-base font-black text-slate-900 sm:text-lg">
                      {t('inventory_title')}
                    </h1>
                  </div>
                </div>
              </div>

              {addButton}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
  <div className="flex items-start gap-3">
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
        backendCurrency ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
      }`}
    >
      <Coins size={16} />
    </div>

    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
        {t('currency_section_title')}
      </p>

      {!isCurrencyEditing && backendCurrency ? (
        <>
        <span className="shrink-0 text-sm">{selectedCurrencyOption?.flag || '🌍'}</span>
        <span className="truncate text-sm font-bold text-slate-900">
          {selectedCurrencyOption?.label || backendCurrency}
        </span>
      <div className="mt-1 flex min-w-0 items-center gap-2">
        <span
className="
inline-flex
max-w-full
items-center
justify-center
rounded-full
bg-emerald-50
px-2
py-0.5
text-[9px]
font-black
uppercase
text-emerald-700
break-words
"
>
{t('currency_saved_text')}
</span>
      </div>

      <button
        onClick={() => {
          setSelectedCurrency(backendCurrency);
          setIsDirtyCurrency(false);
          setIsCurrencyEditing(true);
        }}
        className="mt-3 w-full inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-[11px] font-black uppercase tracking-[0.1em] text-slate-700 transition hover:bg-slate-50"
      >
        {t('btn_edit')}
      </button>
    </>
      ) : (
        <>
          <p className="mt-1 text-xs text-slate-500">
            {t('currency_section_help_text')}
          </p>

          {!backendCurrency && geoCurrencySuggestion?.currency ? (
            <p className="mt-1 text-[11px] text-slate-500">
              {t('currency_suggested_prefix')}{' '}
              <span className="font-black text-slate-900">
                {geoCurrencySuggestion.currency.toUpperCase()}
              </span>
            </p>
          ) : null}

          {!backendCurrency ? (
            <p className="mt-1 text-[11px] font-black text-red-600">
              {t('currency_must_save_notice')}
            </p>
          ) : null}

          <div className="mt-3 space-y-2">
            <Select<CurrencyOption, false>
              options={currencyOptions}
              styles={SELECT_STYLES}
              value={selectedCurrencyOption}
              onChange={handleCurrencyChange}
              filterOption={filterCurrencyOption}
              formatOptionLabel={formatCurrencyOptionLabel}
              placeholder={t('currency_placeholder')}
              isSearchable
              menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
              menuPosition="fixed"
            />

            <div className="flex gap-2">
              {backendCurrency ? (
                <button
                  onClick={() => {
                    setSelectedCurrency(backendCurrency);
                    setIsDirtyCurrency(false);
                    setIsCurrencyEditing(false);
                  }}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-[11px] font-black uppercase tracking-[0.1em] text-slate-700 transition hover:bg-slate-50"
                >
                  {t('btn_cancel')}
                </button>
              ) : null}

              <button
                onClick={handleSaveCurrency}
                disabled={!hasCurrencyChanges || saveCurrencyMutation.isPending}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-[11px] font-black uppercase tracking-[0.1em] text-white transition hover:bg-blue-600 disabled:opacity-50"
              >
                {saveCurrencyMutation.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {t('save_currency')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  </div>
</section>

          {!hasCompletedGuide && (
            <ProgressGuide hasCurrency={!!backendCurrency} hasProducts={hasProducts} t={t} />
          )}

          <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full min-w-0 sm:max-w-md">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                  size={15}
                />
                <input
                  type="text"
                  placeholder={t('placeholder_search')}
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 sm:justify-end">
                <span className="text-[11px] font-semibold text-slate-400">
                  {filteredProducts.length} {t('product')}
                </span>
              </div>
            </div>
          </section>

          {isLoadingProducts ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
              <Loader2 className="animate-spin text-blue-600" size={24} />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <EmptyProductsState onAdd={() => setIsAdding(true)} t={t} />
            </div>
          ) : (
            <>
              <SectionHeader
                icon={<Boxes size={17} />}
                title={t('active_products_title')}
                count={activeProducts.length}
                action={addButton}
              />

              {activeProducts.length > 0 ? (
                <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {activeProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      storeCurrency={storeCurrency}
                      onToggle={() =>
                        toggleMutation.mutate({ id: product.id, status: product.is_active })
                      }
                      onDelete={() => setDeleteTarget(product)}
                      togglePending={toggleMutation.isPending}
                      t={t}
                    />
                  ))}
                </section>
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-sm font-semibold text-slate-500 shadow-sm">
                  {t('no_active_products')}
                </div>
              )}

              {pausedProducts.length > 0 && (
                <>
                  <SectionHeader
                    icon={<PauseCircle size={17} />}
                    title={t('paused_products_title')}
                    count={pausedProducts.length}
                    action={addButton}
                  />

                  <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {pausedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        storeCurrency={storeCurrency}
                        onToggle={() =>
                          toggleMutation.mutate({ id: product.id, status: product.is_active })
                        }
                        onDelete={() => setDeleteTarget(product)}
                        togglePending={toggleMutation.isPending}
                        t={t}
                      />
                    ))}
                  </section>
                </>
              )}
            </>
          )}

          <section className="grid grid-cols-2 gap-2 md:gap-3 lg:grid-cols-4">
            <StatCard label={t('stat_total')} value={products.length} />
            <StatCard label={t('status_active')} value={activeProductsCount} />
            <StatCard label={t('status_paused')} value={pausedProductsCount} />
            <StatCard label={t('currency')} value={backendCurrency || '—'} />
          </section>
        </div>
      </main>

      {isAdding && (
        <div className="fixed inset-0 bg-white z-[150] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-3 sm:px-4 md:px-6 h-14 flex items-center justify-between z-10">
            <div className="flex items-center gap-2 min-w-0">
              <Plus size={15} className="text-blue-600 shrink-0" strokeWidth={3} />
              <span className="truncate text-[11px] font-black uppercase tracking-[0.1em] text-slate-900">
                {t('new_product')}
              </span>
            </div>

            <button
              onClick={() => setIsAdding(false)}
              className="p-2 hover:bg-slate-100 rounded-full transition-all"
            >
              <X size={18} className="text-slate-400" />
            </button>
          </div>

          <ProductDetails isCreating={true} onClose={() => setIsAdding(false)} />
        </div>
      )}

      <ConfirmDeleteModal
        open={!!deleteTarget}
        loading={deleteMutation.isPending}
        productName={deleteTarget?.name || ''}
        onClose={() => {
          if (!deleteMutation.isPending) setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (!deleteTarget?.id || deleteMutation.isPending) return;
          deleteMutation.mutate(deleteTarget.id);
        }}
        t={t}
      />
    </div>
  );
}