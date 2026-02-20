import { ArrowRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  category: string;
  main_image: string;
}

interface LayoutProps {
  products: Product[];
  onAction: (id: string) => void;
  isDark: boolean;
  t: any;
}

export const LayoutGrid = ({ products, onAction, cols, isDark }: LayoutProps & { cols: number }) => {
  const maxWidthClass =
    cols === 2 ? "max-w-4xl" :
    cols === 4 ? "max-w-6xl" :
    "max-w-[1400px]";
//aspect-[1/1.05]
  const aspect = cols === 2 ? "aspect-auto" : "aspect-auto";

  return (
    <div className={`${maxWidthClass} mx-auto grid grid-cols-2 md:grid-cols-${cols} gap-x-5 gap-y-10 md:gap-x-8`}>
      {products.map((p) => (
        <div
          key={p.id}
          onClick={() => onAction(p.id)}
          className="group cursor-pointer flex flex-col"
        >
          <div className={`${aspect} rounded-2xl overflow-hidden relative mb-4 transition-all duration-500 ${isDark ? "bg-zinc-900" : "bg-zinc-50"}`}>
            <img
              src={p.main_image}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt={p.name}
              loading="lazy"
            />
            <div className={`absolute bottom-3 right-3 px-3 py-1.5 rounded-xl text-xs font-bold border ${isDark ? "bg-black/40 border-white/10 text-white" : "bg-white/80 border-zinc-200 text-zinc-900"}`}>
              {p.currency} {p.price.toLocaleString()}
            </div>
          </div>
          <div className="space-y-1 px-1">
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.25em] opacity-80">{p.category}</p>
            <h3 className={`font-semibold ${cols === 2 ? "text-base md:text-lg" : "text-sm md:text-base"} leading-tight transition-colors line-clamp-2 ${isDark ? "text-zinc-200 group-hover:text-white" : "text-zinc-800 group-hover:text-black"}`}>
              {p.name}
            </h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export const LayoutList = ({ products, onAction, isDark }: LayoutProps) => (
  <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
    {products.map((p) => (
      <div
        key={p.id}
        onClick={() => onAction(p.id)}
        className={`group flex items-center justify-between p-3 rounded-2xl transition-all duration-200 active:scale-[0.98] border cursor-pointer ${isDark ? "bg-zinc-900/50 border-white/5 hover:bg-zinc-900" : "bg-white border-zinc-100 hover:shadow-md"}`}
      >
        <div className="flex items-center gap-4 min-w-0">
          <img src={p.main_image} className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover" alt={p.name} />
          <div className="min-w-0">
            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{p.category}</span>
            <h3 className="font-bold text-sm md:text-base leading-tight line-clamp-1">{p.name}</h3>
          </div>
        </div>
        <div className="text-right flex flex-col items-end gap-1 ml-3">
          <span className="text-sm md:text-lg font-black tabular-nums whitespace-nowrap">{p.currency} {p.price.toLocaleString()}</span>
          <ArrowRight size={16} className="text-blue-500 opacity-0 group-hover:opacity-100 transition" />
        </div>
      </div>
    ))}
  </div>
);