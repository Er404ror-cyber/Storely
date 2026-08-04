import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { FilterOptionOption } from 'react-select';
import currencyCodes from 'currency-codes';
import toast from 'react-hot-toast';

import { supabase } from '../../../lib/supabase';
import {
  getUserGeoCurrency,
  getCurrencyCountry,
  countryCodeToFlag,
  getCurrencyDisplayName,
} from '../../../utils/geoUserCurrency';
import type { CurrencyOption } from '../../../types/productsListTypes';

export interface Store {
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

type CachePayload<T> = { data: T; savedAt: number; expiresAt: number; };

const ADMIN_STORE_CACHE_KEY = 'storelyy_admin_store_cache';
const ADMIN_STORE_CACHE_TTL = 1000 * 60 * 5;

function readLocalCache<T>(key: string): CachePayload<T> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachePayload<T>;
    if (!parsed || typeof parsed.savedAt !== 'number' || typeof parsed.expiresAt !== 'number' || parsed.data == null) {
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
  const payload: CachePayload<T> = { data, savedAt: now, expiresAt: now + ttl };
  try {
    localStorage.setItem(key, JSON.stringify(payload));
    return payload;
  } catch {
    return null;
  }
}

export function useCurrencyLogic(store: Store | null | undefined, language: string, t: any, hasProducts: boolean) {
  const queryClient = useQueryClient();
  
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [geoCurrencySuggestion, setGeoCurrencySuggestion] = useState<ReturnType<typeof getUserGeoCurrency> | null>(null);
  const [isDirtyCurrency, setIsDirtyCurrency] = useState(false);
  const [isCurrencyEditing, setIsCurrencyEditing] = useState(false);
  const initializedStoreIdRef = useRef<string | null>(null);

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
      setSelectedCurrency(suggested || '');
      setIsDirtyCurrency(false);
      setIsCurrencyEditing(true);
      return;
    }

    if (!isDirtyCurrency) {
      if (persistedCurrency) {
        if (selectedCurrency !== persistedCurrency) setSelectedCurrency(persistedCurrency);
        setGeoCurrencySuggestion(null);
        return;
      }
      if (!selectedCurrency) {
        const geo = getUserGeoCurrency();
        const suggested = geo?.currency?.trim()?.toUpperCase() || '';
        setGeoCurrencySuggestion(geo);
        if (suggested) setSelectedCurrency(suggested);
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
        .select('*')
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
        writeLocalCache<Store>(ADMIN_STORE_CACHE_KEY, { ...cached.data, ...updatedStore, currency: updatedStore.currency }, ADMIN_STORE_CACHE_TTL);
      } else {
        writeLocalCache<Store>(ADMIN_STORE_CACHE_KEY, updatedStore, ADMIN_STORE_CACHE_TTL);
      }
      
      setSelectedCurrency(updatedStore.currency?.trim()?.toUpperCase() || '');
      setGeoCurrencySuggestion(null);
      setIsDirtyCurrency(false);
      setIsCurrencyEditing(false);
      toast.success(t('currency_save_success'));
    },
    onError: () => toast.error(t('currency_save_error')),
  });

  const currencyOptions = useMemo<CurrencyOption[]>(() => {
    const locale = language === 'pt' ? 'pt-PT' : 'en';
    return currencyCodes.codes().map((code) => {
      const info = currencyCodes.code(code);
      if (!info) return null;
      const country = getCurrencyCountry(code);
      const flag = countryCodeToFlag(country);
      const displayName = getCurrencyDisplayName(code, locale) || info.currency || code;
      return { value: code, label: `${code} - ${displayName}`, search: `${code} ${displayName} ${info.currency || ''}`.toLowerCase(), flag, country };
    }).filter((item): item is CurrencyOption => item !== null).sort((a, b) => a.value === selectedCurrency ? -1 : b.value === selectedCurrency ? 1 : a.value.localeCompare(b.value));
  }, [language, selectedCurrency]);

  const selectedCurrencyOption = useMemo(() => currencyOptions.find((opt) => opt.value === selectedCurrency) || null, [currencyOptions, selectedCurrency]);
  
  const backendCurrency = store?.currency?.trim()?.toUpperCase() || '';
  const hasCurrencyChanges = useMemo(() => !!selectedCurrency && selectedCurrency !== backendCurrency, [selectedCurrency, backendCurrency]);

  const handleCurrencyChange = useCallback((val: CurrencyOption | null) => {
    if (!val) return;
    setSelectedCurrency(val.value.toUpperCase());
    setIsDirtyCurrency(true);
  }, []);

  const filterCurrencyOption = useCallback((option: FilterOptionOption<CurrencyOption>, rawInput: string) => {
    const term = rawInput.toLowerCase().trim();
    if (!term) return true;
    return option.data.value.toLowerCase().includes(term) || option.data.label.toLowerCase().includes(term) || option.data.search.includes(term);
  }, []);

  const handleSaveCurrency = useCallback(() => {
    if (!selectedCurrency || !store?.id || saveCurrencyMutation.isPending) {
      if (!selectedCurrency) toast.error(t('currency_required_text'));
      return;
    }
    saveCurrencyMutation.mutate(selectedCurrency);
  }, [selectedCurrency, store?.id, saveCurrencyMutation, t]);

  const storeCurrency = backendCurrency || selectedCurrency || 'USD';
  const hasCompletedGuide = !!backendCurrency && hasProducts;

  // Removido o envio dos estilos e do formatLabel, eles vão ficar no componente visual
  return {
    backendCurrency,
    storeCurrency,
    hasCompletedGuide,
    currencyProps: {
      backendCurrency,
      isCurrencyEditing,
      selectedCurrencyOption,
      currencyOptions,
      hasCurrencyChanges,
      saveCurrencyPending: saveCurrencyMutation.isPending,
      geoCurrencySuggestion,
      setIsCurrencyEditing,
      setSelectedCurrency,
      setIsDirtyCurrency,
      handleCurrencyChange,
      filterCurrencyOption,
      handleSaveCurrency,
    }
  };
}