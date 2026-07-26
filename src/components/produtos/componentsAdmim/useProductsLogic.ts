import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import currencyCodes from 'currency-codes';
import toast from 'react-hot-toast';

import { 
  getUserGeoCurrency, 
  getCurrencyCountry, 
  countryCodeToFlag, 
  getCurrencyDisplayName 
} from '../../../utils/geoUserCurrency';
import { 
  readLocalCache, 
  writeLocalCache, 
  ADMIN_STORE_CACHE_KEY, 
  ADMIN_STORE_CACHE_TTL 
} from './productsListCache';
import type { Store, Product, CurrencyOption } from '../../../types/productsListTypes';
import { supabase } from '../../../lib/supabase';

export function useProductsLogic(language: string, t: any) {
  const queryClient = useQueryClient();

  // Estados Locais
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [geoCurrencySuggestion, setGeoCurrencySuggestion] = useState<ReturnType<typeof getUserGeoCurrency> | null>(null);
  const [isDirtyCurrency, setIsDirtyCurrency] = useState(false);
  const [isCurrencyEditing, setIsCurrencyEditing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const [layoutMode, setLayoutMode] = useState<'grid' | 'table'>('table');
  const [isMobile, setIsMobile] = useState(false);
  const initializedStoreIdRef = useRef<string | null>(null);

  // Responsividade Inteligente (Auto-Layout)
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setLayoutMode(mobile ? 'grid' : 'table');
    };
    
    handleResize(); // Executa na montagem
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1. FETCH: Dados da Loja (Store)
  const { data: store, isLoading: isLoadingStore } = useQuery<Store>({
    queryKey: ['admin-store'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user.id)
        .single();
        
      if (error) throw error;
      return data as Store;
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // 2. FETCH: Produtos
  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['products', store?.id],
    queryFn: async () => {
      if (!store?.id) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!store?.id,
    staleTime: 1000 * 60 * 10,
  });

  // 3. LÓGICA: Inicialização da Moeda
  useEffect(() => {
    if (!store?.id) return;
    
    const backendCurrency = store.currency?.trim()?.toUpperCase() || '';
    const cachedCurrency = readLocalCache<Store>(ADMIN_STORE_CACHE_KEY)?.data?.currency?.trim()?.toUpperCase() || '';
    const persistedCurrency = backendCurrency || cachedCurrency;
    
    if (initializedStoreIdRef.current !== store.id) {
      initializedStoreIdRef.current = store.id;
      
      if (persistedCurrency) {
        setSelectedCurrency(persistedCurrency);
        return;
      }
      
      const geo = getUserGeoCurrency();
      setGeoCurrencySuggestion(geo);
      setSelectedCurrency(geo?.currency?.trim()?.toUpperCase() || '');
      setIsCurrencyEditing(true);
    }
  }, [store?.id, store?.currency]);

  // 4. MUTAÇÕES: Guardar Moeda
  const saveCurrencyMutation = useMutation({
    mutationFn: async (currency: string) => {
      if (!store?.id) throw new Error('Store not found');
      
      const clean = currency.trim().toUpperCase();
      const { data, error } = await supabase
        .from('stores')
        .update({ currency: clean })
        .eq('id', store.id)
        .select()
        .single();
        
      if (error) throw error;
      return data as Store;
    },
    onSuccess: (updatedStore) => {
      queryClient.setQueryData<Store>(['admin-store'], (old) => old ? { ...old, ...updatedStore } : updatedStore);
      writeLocalCache<Store>(ADMIN_STORE_CACHE_KEY, updatedStore, ADMIN_STORE_CACHE_TTL);
      
      setIsCurrencyEditing(false);
      setIsDirtyCurrency(false);
      toast.success(t('currency_save_success') || 'Moeda atualizada!');
    },
  });

  // 5. MUTAÇÕES: Pausar/Ativar Produto
  const toggleMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: boolean }) => {
      const { error } = await supabase.from('products').update({ is_active: !status }).eq('id', id);
      if (error) throw error;
      return { id, newStatus: !status };
    },
    onSuccess: ({ id, newStatus }) => {
      queryClient.setQueryData<Product[]>(['products', store?.id], (old = []) => 
        old.map(p => p.id === id ? { ...p, is_active: newStatus } : p)
      );
      toast.success(newStatus ? (t('product_activated_success') || 'Ativado!') : (t('product_paused_success') || 'Pausado!'));
    }
  });

  // 6. MUTAÇÕES: Atualizar Produto (Garante que edições refletem instantaneamente no cache global)
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, updatedData }: { id: string; updatedData: Partial<Product> }) => {
      const { data, error } = await supabase
        .from('products')
        .update(updatedData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Product;
    },
    onSuccess: (updatedProduct) => {
      // Atualiza a lista geral no cache
      queryClient.setQueryData<Product[]>(['products', store?.id], (old = []) => 
        old.map(p => p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p)
      );
      // Atualiza o detalhe específico no cache
      queryClient.setQueryData<Product>(['product', updatedProduct.id], (old) => 
        old ? { ...old, ...updatedProduct } : updatedProduct
      );
      toast.success(t('product_update_success') || 'Produto atualizado com sucesso!');
    }
  });

  // 7. MUTAÇÕES: Apagar Produto
  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      return productId;
    },
    onSuccess: (productId) => {
      queryClient.setQueryData<Product[]>(['products', store?.id], (old = []) => 
        old.filter(p => p.id !== productId)
      );
      setDeleteTarget(null);
      toast.success(t('product_delete_success') || 'Produto apagado!');
    }
  });

  // 8. COMPUTAÇÕES: Lista de Moedas
  const currencyOptions = useMemo<CurrencyOption[]>(() => {
    const loc = language === 'pt' ? 'pt-PT' : 'en';
    
    return currencyCodes.codes().map(code => {
      const info = currencyCodes.code(code);
      if (!info) return null;
      
      const country = getCurrencyCountry(code);
      return {
        value: code,
        label: `${code} - ${getCurrencyDisplayName(code, loc) || info.currency || code}`,
        search: `${code} ${info.currency}`.toLowerCase(),
        flag: countryCodeToFlag(country),
        country
      };
    }).filter((i): i is CurrencyOption => i !== null)
      .sort((a, b) => {
        if (a.value === selectedCurrency) return -1;
        if (b.value === selectedCurrency) return 1;
        return a.label.localeCompare(b.label);
      });
  }, [language, selectedCurrency]);

  // 9. COMPUTAÇÕES: Filtragem da Pesquisa
  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return products;
    
    return products.filter((p) => 
      p.name?.toLowerCase().includes(term) || 
      p.category?.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  // 10. AÇÕES
  const handleSaveCurrency = useCallback(() => {
    saveCurrencyMutation.mutate(selectedCurrency);
  }, [saveCurrencyMutation, selectedCurrency]);

  const handleToggleProduct = useCallback((p: Product) => {
    toggleMutation.mutate({ id: p.id, status: p.is_active });
  }, [toggleMutation]);

  const handleUpdateProduct = useCallback((id: string, updatedData: Partial<Product>) => {
    updateProductMutation.mutate({ id, updatedData });
  }, [updateProductMutation]);

  const handleDeleteProduct = useCallback((id: string) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  return {
    state: {
      store, 
      isLoadingStore, 
      products, 
      isLoadingProducts,
      isAdding, 
      searchTerm, 
      selectedCurrency, 
      geoCurrencySuggestion,
      isDirtyCurrency, 
      isCurrencyEditing, 
      deleteTarget,
      layoutMode, 
      isMobile, 
      currencyOptions, 
      filteredProducts
    },
    actions: {
      setIsAdding, 
      setSearchTerm, 
      setSelectedCurrency, 
      setIsDirtyCurrency,
      setIsCurrencyEditing, 
      setDeleteTarget, 
      setLayoutMode,
      saveCurrency: handleSaveCurrency,
      toggleProduct: handleToggleProduct,
      updateProduct: handleUpdateProduct,
      deleteProduct: handleDeleteProduct
    },
    status: {
      isSavingCurrency: saveCurrencyMutation.isPending,
      isToggling: toggleMutation.isPending,
      isUpdating: updateProductMutation.isPending,
      isDeleting: deleteMutation.isPending
    }
  };
}