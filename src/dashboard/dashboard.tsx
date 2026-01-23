import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, FileText, Layout, ArrowUpRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

 function Dashboard() {
  // 1. Buscar estatísticas simples via React Query
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [products, pages, stores] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('pages').select('*', { count: 'exact', head: true }),
        supabase.from('stores').select('*', { count: 'exact', head: true }),
      ]);

      return {
        productsCount: products.count || 0,
        pagesCount: pages.count || 0,
        storesCount: stores.count || 0,
      };
    },
  });

  if (isLoading) return <div className="p-8">Carregando resumo...</div>;

  const cards = [
    { label: 'Total de Produtos', value: stats?.productsCount, icon: <ShoppingBag />, color: 'bg-blue-500' },
    { label: 'Páginas Criadas', value: stats?.pagesCount, icon: <FileText />, color: 'bg-green-500' },
    { label: 'Minhas Lojas', value: stats?.storesCount, icon: <Layout />, color: 'bg-purple-500' },
  ];

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Bem-vindo, Vendedor!</h1>
        <p className="text-gray-500">Aqui está o que está a acontecer na sua loja hoje.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5">
            <div className={`${card.color} p-3 rounded-lg text-white`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase font-semibold">{card.label}</p>
              <p className="text-2xl font-black text-gray-800">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 p-6 bg-linear-to-r from-blue-600 to-indigo-700 rounded-2xl text-white flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">A sua loja está online!</h2>
          <p className="opacity-90">Personalize o seu catálogo e comece a vender agora.</p>
        </div>
        <button className="bg-white text-blue-600 px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-gray-100 transition">
          Ver Minha Loja <ArrowUpRight size={18} />
        </button>
      </div>
    </div>
  );
}
export default Dashboard;