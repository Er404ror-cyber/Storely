import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useMemo, useCallback } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  category: string;
  main_image: string;
  created_at?: string | Date;
}

interface LayoutProps {
  products: Product[];
  onAction: (id: string) => void;
  isDark: boolean;
  t: any;
}

const sortProductsByDate = (items: Product[]) => {
  return [...items].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });
};


const ProductLabel = ({ name, price, currency, size = "sm" }: any) => (
  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 md:left-2 md:translate-x-0 z-20 flex items-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full p-1 pl-3 shadow-sm transition-all duration-500">
    <span className={`font-bold mr-2 truncate text-zinc-900 dark:text-zinc-100 ${size === "lg" ? "text-[11px] max-w-[100px] md:max-w-[180px]" : "text-[9px] max-w-[70px] md:max-w-[130px]"}`}>
      {name}
    </span>
    <span className="bg-blue-600 text-white px-2.5 py-1 rounded-full text-[10px] font-black whitespace-nowrap flex-shrink-0 tracking-tighter">
      {currency} {price.toLocaleString()}
    </span>
  </div>
);
const ModernScrollRow = ({ children }: { children: React.ReactNode }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.9;
      // 'smooth' é mantido mas o 'contain' no CSS evita o lag
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="relative w-full flex flex-col overflow-hidden">
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-3 pb-2 px-1 snap-x snap-mandatory scrollbar-none"
        style={{ 
            WebkitOverflowScrolling: 'touch', 
            contentVisibility: 'auto',
            contain: 'content'
        }}
      >
        {children}
      </div>

      <div className="flex justify-end gap-2 mt-1">
        <button 
          onClick={() => scroll('left')} 
          className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 active:bg-blue-600 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <button 
          onClick={() => scroll('right')} 
          className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 active:bg-blue-600 transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export const LayoutGrid = ({ products, onAction, cols, isDark }: LayoutProps & { cols: number }) => {
  const sortedProducts = useMemo(() => sortProductsByDate(products), [products]);
  const handleAction = useCallback((id: string) => onAction(id), [onAction]);

  // Divide o processamento para evitar gargalo de renderização inicial
  const { featured, rowsOfRemaining } = useMemo(() => {
    const feat = sortedProducts.slice(0, 3);
    const remain = sortedProducts.slice(3);
    const rows = [];
    for (let i = 0; i < remain.length; i += 4) rows.push(remain.slice(i, i + 4));
    return { featured: feat, rowsOfRemaining: rows };
  }, [sortedProducts]);

  if (cols === 2) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-4 md:px-4">
        {/* GRID HERO - Estático para máxima performance */}
        <div className="flex flex-col md:grid md:grid-cols-6 md:grid-rows-2 gap-3 h-auto md:h-[500px]">
          {featured.map((p, idx) => (
            <div 
              key={p.id} 
              onClick={() => handleAction(p.id)} 
              className={`${idx === 0 ? "md:col-span-4 md:row-span-2" : "md:col-span-2 md:row-span-1"} group relative overflow-hidden rounded-2xl bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 cursor-pointer`}
              style={{ contain: 'paint' }}
            >
              <img 
                src={p.main_image} 
                className="w-full h-full object-cover" 
                alt={p.name} 
                loading="lazy" 
                decoding="async" 
              />
              <ProductLabel name={p.name} price={p.price} currency={p.currency} size={idx === 0 ? "lg" : "sm"} />
            </div>
          ))}
        </div>

        {/* FILEIRAS OTIMIZADAS */}
        {rowsOfRemaining.map((row, rowIndex) => (
          <ModernScrollRow key={rowIndex}>
            {row.map((p) => (
              <div 
                key={p.id} 
                onClick={() => handleAction(p.id)} 
                className="w-[280px] md:w-[calc(30%-12px)] flex-shrink-0 snap-start"
              >
                <div className="aspect-[16/12] md:aspect-[16/9] rounded-xl overflow-hidden relative bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
                  <img src={p.main_image} className="w-full h-full object-cover" alt={p.name} loading="lazy" decoding="async" />
                  <ProductLabel name={p.name} price={p.price} currency={p.currency} />
                </div>
              </div>
            ))}
          </ModernScrollRow>
        ))}
      </div>
    );
  }

  // Layout Padrão para outras colunas
  return (
    <div className="max-w-[1400px] mx-auto md:px-4">
      {/* Masonry Layout usando colunas nativas (mais leve que Grid para Pinterest) */}
      <div className={`
        columns-2 gap-2
        md:columns-3 md:gap-3
        lg:columns-${cols || 4}
        space-y-4 md:space-y-4
      `}>
        {sortedProducts.map((p) => (
          <div 
            key={p.id} 
            onClick={() => onAction(p.id)} 
            className="break-inside-avoid group cursor-pointer flex flex-col transform-gpu"
            style={{ contain: 'layout paint' }} // Performance: Isola o card para a GPU não recalcular a página toda
          >
            <div className={`
              relative overflow-hidden rounded-xl border transition-colors duration-300
              ${isDark ? "bg-zinc-900 border-white/5" : "bg-zinc-50 border-zinc-100"}
            `}>
              {/* h-auto é o segredo do Pinterest. 
                  decoding="async" evita travamentos ao carregar muitas imagens. */}
              <img 
                src={p.main_image} 
                alt={p.name}
                loading="lazy"
                decoding="async"
                className="w-full h-auto aspect-square md:aspect-auto object-cover block"
              />
              
              {/* Price Tag Minimalista e Sólida (Sem Blur para Performance) */}
              <div className={`
                absolute bottom-3 right-3 px-3 py-1.5 rounded-xl text-[10px] font-black border
                ${isDark 
                  ? "bg-zinc-950 border-white/10 text-white" 
                  : "bg-white border-zinc-200 text-zinc-900 shadow-sm"}
              `}>
                {p.currency} {p.price.toLocaleString()}
              </div>
            </div>
  
            {/* Texto com tipografia refinada */}
            <h3 className={`
              mt-3 px-2 text-[13px] font-semibold leading-tight line-clamp-2 transition-colors
              ${isDark ? "text-zinc-400 group-hover:text-zinc-100" : "text-zinc-600 group-hover:text-black"}
            `}>
              {p.name}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export const LayoutList = ({ products, onAction, isDark }: LayoutProps) => {
  const sorted = sortProductsByDate(products);
  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 px-4">
      {sorted.map((p) => (
        <div key={p.id} onClick={() => onAction(p.id)} className={`group flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${isDark ? "bg-zinc-900/50 border-white/5 hover:bg-zinc-900" : "bg-white border-zinc-100 hover:shadow-md"}`}>
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                <img src={p.main_image} className="w-full h-full object-cover" alt={p.name} />
            </div>
            <h3 className="font-bold text-sm md:text-base leading-tight line-clamp-1">{p.name}</h3>
          </div>
          <div className="text-right flex flex-col items-end gap-1 ml-3">
            <span className="text-sm md:text-lg font-black">{p.currency} {p.price.toLocaleString()}</span>
            <ArrowRight size={16} className="text-blue-500 opacity-0 group-hover:opacity-100 transition" />
          </div>
        </div>
      ))}
    </div>
  );
};