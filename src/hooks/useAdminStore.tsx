import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useAdminStore() {
  return useQuery({
    queryKey: ['admin-store'],
    queryFn: async () => {
      // 1. Verificar a sessão atual de forma explícita
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("Sessão não encontrada");
      }

      // 2. Buscar a loja vinculada ao ID do utilizador
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', session.user.id)
        .maybeSingle(); // maybeSingle não dá erro se não encontrar, retorna null

      if (storeError) throw storeError;
      if (!store) throw new Error("Nenhuma loja encontrada para este utilizador");

      return store;
    },
    retry: false, // Não tenta novamente se falhar a auth
    staleTime: 1000 * 60 * 5, // Cache de 5 minutos
  });
}