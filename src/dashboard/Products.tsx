import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Plus, Package, Loader2, Power } from 'lucide-react';
import { useAdminStore } from '../hooks/useAdminStore';
import { supabase } from '../lib/supabase';

export function Products() {
  const { data: store } = useAdminStore();
  const queryClient = useQueryClient();

  // 1. Buscar Produtos
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', store?.id],
    queryFn: async () => {
      const { data } = await supabase.from('products').select('*').eq('store_id', store?.id);
      return data || [];
    },
    enabled: !!store?.id
  });

  // 2. Criar Produto
  const addMutation = useMutation({
    mutationFn: async () => {
      const name = prompt("Nome do produto:");
      const price = prompt("Preço (ex: 500):");
      if (!name || !price) return;

      await supabase.from('products').insert([{
        store_id: store?.id,
        name,
        price: parseFloat(price),
        is_active: true
      }]);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });

  // 3. Alternar Ativo/Inativo
  const toggleMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: boolean }) => {
      await supabase.from('products').update({ is_active: !status }).eq('id', id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });

  if (isLoading) return <Loader2 className="animate-spin m-10" />;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="text-blue-600" /> Meus Produtos
        </h1>
        <button 
          onClick={() => addMutation.mutate()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-blue-700 transition"
        >
          <Plus size={20} /> Adicionar Produto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-semibold text-sm">Produto</th>
              <th className="p-4 font-semibold text-sm">Preço</th>
              <th className="p-4 font-semibold text-sm">Status</th>
              <th className="p-4 font-semibold text-sm">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition">
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4 text-gray-600">MT {p.price.toLocaleString()}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {p.is_active ? 'Ativo' : 'Pausado'}
                  </span>
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => toggleMutation.mutate({ id: p.id, status: p.is_active })}
                    className={`p-2 rounded-lg transition-colors ${p.is_active ? 'text-orange-500 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'}`}
                    title={p.is_active ? "Desativar" : "Ativar"}
                  >
                    <Power size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}