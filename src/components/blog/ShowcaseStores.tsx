import { useMemo, memo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';

// 1. Define strict interfaces
interface Store {
  slug: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  main_image: string;
  created_at: string;
  stores: Store | Store[]; // Supabase joins often return arrays
}

interface ProcessedProduct {
  id: string;
  nome: string;
  categoria: string;
  imagem: string;
  timeAgo: string;
  storeSlug: string;
  storeName: string;
}

const ProductCard = memo(({ prod, onNavigate }: { 
  prod: ProcessedProduct; 
  onNavigate: (slug: string, id: string) => void 
}) => (
  <div 
    onClick={() => onNavigate(prod.storeSlug, prod.id)}
    className="flex-shrink-0 w-[240px] md:w-full inline-block mb-4 group cursor-pointer break-inside-avoid"
  >
    <div className="relative rounded-xl overflow-hidden border-zinc-700 shadow-sm">
      <img 
        src={prod.imagem} 
        className="w-full h-auto block transform transition-transform duration-500 md:group-hover:scale-105" 
        alt={prod.nome}
        loading="lazy"
      />
      <div className="absolute top-3 left-3 max-w-[75%] bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
         <span className="text-[8px] font-black uppercase text-zinc-900 tracking-tighter truncate block">
           {prod.storeName}
         </span>
      </div>
    </div>

    <div className="mt-3 px-1 w-full overflow-hidden">
      <h3 className="text-[12px] font-black uppercase tracking-tight truncate w-full">
        {prod.nome}
      </h3>
      <div className="flex items-center gap-2 mt-0.5 w-full">
        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest truncate max-w-[60%] shrink-0">
          {prod.categoria || 'Geral'}
        </span>
        <span className="w-1 h-1 rounded-full bg-zinc-200 shrink-0" />
        <p className="text-zinc-400 text-[9px] font-medium lowercase whitespace-nowrap">
           {prod.timeAgo}
        </p>
      </div>
    </div>
  </div>
));

ProductCard.displayName = 'ProductCard';

export const ShowcaseStores = () => {
  const navigate = useNavigate();

  const { data: rawProducts, isLoading } = useQuery({
    queryKey: ["public-showcase-v-final-aspect"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id, 
          name, 
          category, 
          main_image, 
          created_at, 
          stores!inner ( slug, name )
        `)
        .eq("is_active", true)
        .order('created_at', { ascending: false })
        .limit(40);
      
      if (error) throw error;
      // We cast to Product[] to handle the join typing
      return data as unknown as Product[];
    },
    staleTime: 1000 * 60 * 30,
  });

  const processed = useMemo(() => {
    if (!rawProducts) return { row1: [], row2: [], all: [] };

    const storeGroups: Record<string, ProcessedProduct[]> = {};
    
    rawProducts.forEach(p => {
      // Handle the case where stores is an array or a single object
      const storeData = Array.isArray(p.stores) ? p.stores[0] : p.stores;
      const slug = storeData?.slug || 'unknown';
      
      if (!storeGroups[slug]) storeGroups[slug] = [];
      
      storeGroups[slug].push({
        id: p.id,
        nome: p.name,
        categoria: p.category,
        imagem: p.main_image,
        timeAgo: formatDistanceToNow(new Date(p.created_at), { addSuffix: true, locale: pt }),
        storeSlug: slug,
        storeName: storeData?.name || 'Loja'
      });
    });

    const interleaved: ProcessedProduct[] = [];
    const slugs = Object.keys(storeGroups);
    
    // Interleaving logic
    for (let i = 0; i < 10; i++) {
      slugs.forEach(slug => {
        const item = storeGroups[slug][i];
        if (item && interleaved.length < 20) {
          interleaved.push(item);
        }
      });
    }

    return {
      row1: interleaved.filter((_, i) => i % 2 === 0),
      row2: interleaved.filter((_, i) => i % 2 !== 0),
      all: interleaved
    };
  }, [rawProducts]);

  const handleNavigate = useCallback((slug: string, id: string) => {
    navigate(`/${slug}/blog/${id}`);
  }, [navigate]);

  if (isLoading || processed.all.length === 0) return null;
  return (
    <div className="w-full flex flex-col gap-8">
      
      

      {/* MOBILE: Agrupado por Formatos Semelhantes nas duas linhas */}
      <div className="md:hidden flex flex-col gap-4">
        <div className="flex overflow-x-auto gap-4 px-6 snap-x snap-mandatory scrollbar-hide">
          {processed.row1.map(p => <ProductCard key={p.id} prod={p} onNavigate={handleNavigate} />)}
        </div>
        <div className="flex overflow-x-auto gap-4 px-6 snap-x snap-mandatory scrollbar-hide">
          {processed.row2.map(p => <ProductCard key={p.id} prod={p} onNavigate={handleNavigate} />)}
        </div>
      </div>

      {/* DESKTOP: Masonry Puro (Sem Vácuo) */}
      <div className="hidden md:block columns-1 sm:columns-3 lg:columns-4 gap-4 space-y-0 px-6 lg:px-0">
        {processed.all.map(p => (
          <ProductCard key={p.id} prod={p} onNavigate={handleNavigate} />
        ))}
      </div>
    </div>
  );
};