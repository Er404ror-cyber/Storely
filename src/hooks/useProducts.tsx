import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useProducts(storeId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['products', storeId],
    queryFn: async () => {
      const { data } = await supabase.from('products').select('*').eq('store_id', storeId);
      return data;
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string, is_active: boolean }) => {
      await supabase.from('products').update({ is_active }).eq('id', id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });

  return { ...query, toggleMutation };
}