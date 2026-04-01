import { useState, useEffect, useMemo, memo, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import type { StylesConfig, FilterOptionOption } from 'react-select';
import currencyCodes from 'currency-codes';
import {
  Plus,
  Loader2,
  LayoutGrid,
  Save,
  Search,
  Edit,
  Package,
  X,
  Tag,
  Power,
  Coins,
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
  <div className="w-14 h-14 md:w-12 md:h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 shadow-sm">
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
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
      <span className="text-base leading-none shrink-0">{option.flag}</span>
      <span className="truncate font-extrabold text-[12px]">{option.label}</span>
    </div>
  );
});

CurrencyOptionLabel.displayName = 'CurrencyOptionLabel';

const SELECT_STYLES: StylesConfig<CurrencyOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: 42,
    borderRadius: 12,
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
    fontSize: 11,
    fontWeight: 800,
  }),
  placeholder: (base) => ({
    ...base,
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 700,
  }),
  singleValue: (base) => ({
    ...base,
    color: '#0f172a',
    fontSize: 11,
    fontWeight: 800,
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
    boxShadow: '0 12px 40px rgba(15,23,42,0.12)',
  }),
  menuList: (base) => ({
    ...base,
    padding: 6,
    maxHeight: 280,
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: 10,
    fontSize: 11,
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

export function ProductsList() {
  const { t, language } = useTranslate();
  const queryClient = useQueryClient();

  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [suggestedGeoInfo, setSuggestedGeoInfo] =
    useState<ReturnType<typeof getUserGeoCurrency> | null>(null);
  const [isDirtyCurrency, setIsDirtyCurrency] = useState(false);

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
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
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
        setSuggestedGeoInfo(null);
        setIsDirtyCurrency(false);
        return;
      }

      const geo = getUserGeoCurrency();
      setSuggestedGeoInfo(geo);
      setSelectedCurrency(geo.currency.trim().toUpperCase());
      setIsDirtyCurrency(false);
      return;
    }

    if (!isDirtyCurrency) {
      if (persistedCurrency) {
        if (selectedCurrency !== persistedCurrency) {
          setSelectedCurrency(persistedCurrency);
        }
        setSuggestedGeoInfo(null);
        return;
      }

      if (!selectedCurrency) {
        const geo = getUserGeoCurrency();
        setSuggestedGeoInfo(geo);
        setSelectedCurrency(geo.currency.trim().toUpperCase());
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
        old
          ? {
              ...old,
              ...updatedStore,
              currency: updatedStore.currency,
            }
          : updatedStore
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

      setSelectedCurrency(updatedStore.currency?.trim().toUpperCase() || '');
      setSuggestedGeoInfo(null);
      setIsDirtyCurrency(false);

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
    if (!selectedCurrency || !store?.id || saveCurrencyMutation.isPending) return;
    saveCurrencyMutation.mutate(selectedCurrency);
  }, [selectedCurrency, store?.id, saveCurrencyMutation]);

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products', store?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', store?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
    enabled: !!store?.id,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: boolean }) => {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', store?.id] });
    },
  });

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return products;

    return products.filter((p) => {
      const name = p.name?.toLowerCase() || '';
      const category = p.category?.toLowerCase() || '';
      const price = String(p.price ?? '');
      const currency = String(p.currency ?? store?.currency ?? '').toLowerCase();

      return (
        name.includes(term) ||
        category.includes(term) ||
        price.includes(term) ||
        currency.includes(term)
      );
    });
  }, [products, searchTerm, store?.currency]);

  if (isLoadingStore || !store) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-600 font-sans antialiased pb-20">
      <nav className="bg-white/80 border-b border-slate-200 sticky top-0 z-40 h-16 flex items-center px-4 lg:px-10">
        <div className="max-w-[1600px] w-full mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-xl text-white shadow-lg">
              <Package size={18} />
            </div>
            <div>
              <h1 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-tight leading-none">
                {t('inventory_title')}
              </h1>
              <p className="text-[9px] md:text-[10px] text-blue-600 font-bold uppercase tracking-widest">
                {store.name}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-black uppercase transition-all shadow-lg active:scale-95"
          >
            <Plus size={16} strokeWidth={3} />
            <span className="hidden sm:inline">{t('btn_new_product')}</span>
          </button>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto p-4 lg:p-10 space-y-8">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_140px] gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
            <div className="p-4 md:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      backendCurrency
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    <Coins size={16} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-[13px] md:text-sm font-black text-slate-900 leading-none">
                      {t('currency_section_title')}
                    </h3>
                    <p className="mt-1 text-[10px] md:text-[11px] text-slate-500 leading-relaxed">
                      {backendCurrency
                        ? t('currency_saved_text')
                        : t('currency_required_text')}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${
                    backendCurrency
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {backendCurrency
                    ? t('currency_saved_badge')
                    : t('currency_required_badge')}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {selectedCurrencyOption ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-bold text-slate-700">
                    <span>{selectedCurrencyOption.flag}</span>
                    <span className="truncate">{selectedCurrencyOption.label}</span>
                  </span>
                ) : null}

                {!backendCurrency && suggestedGeoInfo ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-700">
                      <span>{countryCodeToFlag(suggestedGeoInfo.country)}</span>
                      <span>{t('currency_suggested_prefix')}</span>
                      <span className="font-black text-slate-900">{selectedCurrency}</span>
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-bold text-slate-700">
                      <span>{t('currency_source_prefix')}</span>
                      <span className="font-black text-slate-900">{suggestedGeoInfo.source}</span>
                    </span>
                  </>
                ) : null}
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-3 items-center">
                <div className="min-w-0">
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
                </div>

                <button
                  onClick={handleSaveCurrency}
                  disabled={!hasCurrencyChanges || saveCurrencyMutation.isPending}
                  className="h-[42px] px-4 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.14em] transition-all shadow-sm hover:bg-blue-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {saveCurrencyMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  {t('save_currency')}
                </button>
              </div>

              {!backendCurrency ? (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-white/80 px-3 py-2">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                  <p className="text-[10px] md:text-[11px] font-medium leading-relaxed text-amber-800">
                    {t('currency_save_hint')}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 flex flex-col justify-center shadow-sm min-h-[120px] relative overflow-hidden">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {t('stat_total')}
            </span>

            <div className="relative z-10">
              <h2 className="mt-2 text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">
                {filteredProducts.length}
              </h2>

              <p className="mt-1 text-[11px] text-slate-500 font-medium">
                {t('product')}
              </p>
            </div>

            <LayoutGrid className="absolute -right-5 -bottom-5 text-slate-100" size={92} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 md:p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input
                type="text"
                placeholder={t('placeholder_search')}
                className="w-full bg-slate-50/50 border border-slate-200 pl-10 pr-4 py-3 rounded-xl text-xs font-bold outline-none focus:bg-white transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="p-2 md:p-0">
            <div className="flex flex-col md:divide-y md:divide-slate-100 gap-2 md:gap-0">
              <div className="hidden md:flex bg-slate-50/50 text-slate-400 text-[9px] uppercase font-black tracking-widest border-b border-slate-100 px-6 py-4">
                <div className="flex-[2]">{t('product')}</div>
                <div className="flex-1">{t('price')}</div>
                <div className="flex-1 text-center">{t('status')}</div>
                <div className="flex-1 text-right">{t('actions')}</div>
              </div>

              {filteredProducts.map((p) => {
                const productCurrency = p.currency || store.currency || selectedCurrency || 'USD';

                return (
                  <div
                    key={p.id}
                    style={{ contentVisibility: 'auto', containIntrinsicSize: '80px' }}
                    className="flex flex-col md:flex-row md:items-center bg-white border border-slate-100 md:border-none rounded-2xl md:rounded-none p-4 md:px-6 md:py-4 hover:bg-slate-50/50 transition-colors gap-4 md:gap-0 shadow-sm md:shadow-none"
                  >
                    <div className="flex-[2] flex items-center gap-4">
                      <ProductImage src={p.main_image} alt={p.name} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm md:text-sm font-bold text-slate-900 truncate">{p.name}</p>
                        <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase mt-1">
                          <Tag size={10} className="text-blue-400" /> {p.category}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:contents pt-3 border-t border-slate-100 md:border-none md:pt-0">
                      <div className="flex-1">
                        <span className="text-sm md:text-sm font-black text-slate-900 flex items-baseline gap-1">
                          <span className="text-[10px] opacity-50 font-bold">{productCurrency}</span>
                          {Number(p.price || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex-1 flex justify-center md:justify-center">
                        <button
                          onClick={() => toggleMutation.mutate({ id: p.id, status: p.is_active })}
                          className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 md:py-1.5 w-full md:w-auto rounded-xl md:rounded-full text-[10px] font-black uppercase tracking-tight transition-all ${
                            p.is_active
                              ? 'bg-green-50 text-green-600 hover:bg-green-100'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          <Power size={12} />
                          {p.is_active ? t('status_active') : t('status_paused')}
                        </button>
                      </div>

                      <div className="flex-1 flex justify-end">
                        <Link
                          to={`/admin/produtos/${p.id}`}
                          state={{ fromStore: true }}
                          className="inline-flex items-center justify-center gap-2 p-3 md:px-3 md:py-2 bg-blue-50 text-blue-600 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-all text-[10px] font-black uppercase"
                        >
                          <Edit className="w-4 h-4 md:w-3.5 md:h-3.5" />
                          <span className="hidden md:inline">{t('view_product')}</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="p-10 text-center text-slate-400 text-sm font-bold">
                  {t('no_products_found')}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {isAdding && (
        <div className="fixed inset-0 bg-white z-[150] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 h-16 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <Plus size={16} className="text-blue-600" strokeWidth={3} />
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">
                {t('new_product')}
              </span>
            </div>

            <button
              onClick={() => setIsAdding(false)}
              className="p-2 hover:bg-slate-100 rounded-full transition-all"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <ProductDetails isCreating={true} onClose={() => setIsAdding(false)} />
        </div>
      )}
    </div>
  );
}