import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { AdminStore, AdminPage } from '../types/admin';
import {
  ADMIN_STORE_CACHE_KEY,
  ADMIN_STORE_CACHE_TTL,
  ADMIN_PAGES_CACHE_TTL,
  readCache,
  writeCache,
  getAdminPagesCacheKey,
  generateSlug,
  type DataSource,
} from '../utils/adminCache';
import { useTranslate } from '../context/LanguageContext';

export function useAdminStoreData() {
  const queryClient = useQueryClient();
  const { t } = useTranslate();

  // 1. Leitura única e estritamente síncrona do LocalStorage no topo do Hook
  const initialStoreCache = useMemo(() => readCache<AdminStore>(ADMIN_STORE_CACHE_KEY), []);
  const safeStoreId = initialStoreCache?.data?.id ?? '';

  const initialPagesCache = useMemo(() => {
    return safeStoreId ? readCache<AdminPage[]>(getAdminPagesCacheKey(safeStoreId)) : null;
  }, [safeStoreId]);

  // Estados locais sincronizados incondicionalmente no mount
  const [storeCacheLeft, setStoreCacheLeft] = useState(() => 
    initialStoreCache ? Math.max(initialStoreCache.expiresAt - Date.now(), 0) : 0
  );
  const [source, setSource] = useState<DataSource>(() => initialStoreCache ? 'cache' : 'none');
  const [timeLeft, setTimeLeft] = useState('');

  // Trava de segurança para impedir requisições concorrentes
  const isRefetchingRef = useRef(false);

  // 2. Query Principal da Loja - Configuração estática e linear
  const {
    data: store,
    isLoading: storeLoading,
    isFetching: storeFetching,
    refetch: refetchStore,
  } = useQuery<AdminStore>({
    queryKey: ['admin-store'],
    // Injeta os dados do cache diretamente. Se existirem, a query assume o estado 'success' na hora
    initialData: initialStoreCache?.data || undefined,
    initialDataUpdatedAt: initialStoreCache?.savedAt,
    staleTime: ADMIN_STORE_CACHE_TTL,
    gcTime: ADMIN_STORE_CACHE_TTL * 2,
    refetchOnMount: false,             // ⚡ Impede a verificação na internet ao montar
    refetchOnWindowFocus: false,       // ⚡ Impede a verificação ao mudar de aba
    refetchOnReconnect: false,         // ⚡ Impede a verificação ao voltar a rede
    retry: 1,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const { data, error } = await supabase
        .from('stores')
        .select('id, name, slug, owner_id, logo_url, updated_at_name, created_at, currency, description, whatsapp_number, settings, owner_email')
        .eq('owner_id', user.id)
        .single();

      if (error) throw error;

      writeCache(ADMIN_STORE_CACHE_KEY, data as AdminStore, ADMIN_STORE_CACHE_TTL);
      return data as AdminStore;
    },
  });

  // Chave de busca incondicional estável baseada na melhor informação disponível
  const currentStoreId = store?.id || safeStoreId;

  // 3. Query das Páginas da Loja
  const { data: pages = [], isLoading: pagesLoading } = useQuery<AdminPage[]>({
    queryKey: ['admin-pages', currentStoreId],
    enabled: !!currentStoreId,
    initialData: initialPagesCache?.data || undefined,
    initialDataUpdatedAt: initialPagesCache?.savedAt,
    staleTime: ADMIN_PAGES_CACHE_TTL,
    gcTime: ADMIN_PAGES_CACHE_TTL * 2,
    refetchOnMount: false,             // ⚡ Lê do cache do LocalStorage no mount
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    queryFn: async () => {
      if (!currentStoreId) throw new Error('Store ID missing');
      
      const { data, error } = await supabase
        .from('pages')
        .select('id, store_id, title, slug, type, is_home, created_at')
        .eq('store_id', currentStoreId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      writeCache(getAdminPagesCacheKey(currentStoreId), data as AdminPage[], ADMIN_PAGES_CACHE_TTL);
      return data as AdminPage[];
    },
  });

  // Atualiza o indicador visual de origem dos dados
  useEffect(() => {
    if (storeFetching) {
      setSource('network');
    } else if (store) {
      setSource('cache');
    }
  }, [storeFetching, store]);

  // 4. Mutation inteligente: Edita na nuvem, grava no cache e zera o tempo
  const updateStoreMutation = useMutation({
    mutationFn: async (name: string) => {
      const cleanName = name.trim();
      const newSlug = generateSlug(cleanName);

      if (!store || !cleanName) throw new Error(t('invalid_store_name'));
      if (cleanName.toLowerCase() === store.name.toLowerCase() || newSlug === store.slug) {
        return store;
      }

      const { data: existingStore, error: slugCheckError } = await supabase
        .from('stores')
        .select('id')
        .eq('slug', newSlug)
        .neq('id', store.id)
        .maybeSingle();

      if (slugCheckError) throw slugCheckError;
      if (existingStore) throw new Error(t('name_taken'));

      const { data, error } = await supabase
        .from('stores')
        .update({ name: cleanName, slug: newSlug, updated_at_name: new Date().toISOString() })
        .eq('id', store.id)
        .select('*')
        .single();

      if (error) throw new Error(error.code === '23505' ? t('name_taken') : error.message);
      return data as AdminStore;
    },
    onSuccess: (updatedStore) => {
      if (!updatedStore) return;

      // Injeta direto na memória ativa do React Query sem encostar na rede
      queryClient.setQueryData(['admin-store'], updatedStore);
      queryClient.setQueryData(['admin-full-settings'], (old: any) => old ? { ...old, ...updatedStore } : old);

      // ⚡ ESCREVE NO CACHE LOCAL IMEDIATAMENTE COM O NOVO TEMPO DE 2 HORAS
      const payload = writeCache(ADMIN_STORE_CACHE_KEY, updatedStore, ADMIN_STORE_CACHE_TTL);
      if (payload) {
        setStoreCacheLeft(Math.max(payload.expiresAt - Date.now(), 0));
      }
      
      setSource('cache');
      toast.success(t('update_success'));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Cronómetro de restrição de 24 horas para troca de nome
  useEffect(() => {
    if (!store?.updated_at_name) {
      setTimeLeft('');
      return;
    }
    const updatedAt = store.updated_at_name;
    const updateCountdown = () => {
      const diff = new Date(updatedAt).getTime() + 24 * 60 * 60 * 1000 - Date.now();
      if (diff <= 0) {
        setTimeLeft('');
        return false;
      }
      setTimeLeft(`${Math.floor(diff / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}m`);
      return true;
    };
    
    const active = updateCountdown();
    if (!active) return;

    const interval = window.setInterval(updateCountdown, 60000);
    return () => window.clearInterval(interval);
  }, [store?.updated_at_name]);

  // 5. Sincronizador Passivo de Ciclo Contínuo (Controlador Rígido)
  useEffect(() => {
    let active = true;
    
    const syncCacheLeft = () => {
      if (!active) return;
      const cache = readCache<AdminStore>(ADMIN_STORE_CACHE_KEY);
      
      if (cache) {
        const remaining = cache.expiresAt - Date.now();
        
        if (remaining <= 0) {
          setStoreCacheLeft(0);
          // O tempo do LocalStorage acabou de verdade: sincroniza e busca os dados novos da API
          if (!storeFetching && !isRefetchingRef.current) {
            isRefetchingRef.current = true;
            refetchStore().finally(() => {
              isRefetchingRef.current = false;
            });
          }
        } else {
          // O tempo é válido: atualiza apenas o estado numérico sem tocar no Supabase
          setStoreCacheLeft(remaining);
        }
      } else {
        setStoreCacheLeft(0);
        if (!storeFetching && !isRefetchingRef.current) {
          isRefetchingRef.current = true;
          setSource('none');
          refetchStore().finally(() => {
            isRefetchingRef.current = false;
          });
        }
      }
    };
    
    const interval = window.setInterval(syncCacheLeft, 1000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [storeFetching, refetchStore]);

  return {
    store,
    pages,
    storeLoading,
    pagesLoading,
    storeFetching,
    updateStoreMutation,
    storeCacheLeft,
    source,
    timeLeft,
  };
}