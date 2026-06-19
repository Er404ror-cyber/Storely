import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { StorePublicData } from "../utils/storeCache";
import { readStoreCache, writeStoreCache, clearStoreCache, STORE_CACHE_TTL } from "../utils/storeCache";

export function useStorePublic(storeSlug: string | undefined) {
  const queryClient = useQueryClient();
  const cacheKey = ["store-public", storeSlug];

  const query = useQuery<StorePublicData>({
    queryKey: cacheKey,
    enabled: !!storeSlug,
    // initialData garante renderização imediata sem tela de loading
    initialData: () => {
      return readStoreCache(storeSlug)?.data;
    },
    // staleTime dinâmico avaliado na inicialização da Query
    staleTime: () => {
      const currentCache = readStoreCache(storeSlug);
      return currentCache ? Math.max(currentCache.expiresAt - Date.now(), 0) : 0;
    },
    gcTime: STORE_CACHE_TTL * 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("slug", storeSlug)
        .single();

      if (error) throw error;
      
      // Cria um novo cache fresco e reseta o cronômetro para 4 horas
      writeStoreCache(storeSlug, data as StorePublicData);
      return data as StorePublicData;
    },
  });

  const forceRefresh = async () => {
    // 1. Apaga fisicamente o cache local antigo
    clearStoreCache(storeSlug); 
    
    // 2. Remove os dados antigos da memória do TanStack Query para evitar vazamento de estado
    queryClient.removeQueries({ queryKey: cacheKey });
    
    // 3. Executa a busca limpa diretamente da API externa
    await query.refetch();
  };

  // Determinação precisa da origem do dado técnico atual
  let source: "none" | "cache" | "network" = "none";
  if (query.data) {
    // Se a query buscou dados após a montagem do componente, a origem passa a ser Network de forma transparente
    source = query.isFetchedAfterMount ? "network" : "cache";
  }

  return {
    ...query,
    source,
    forceRefresh,
  };
}