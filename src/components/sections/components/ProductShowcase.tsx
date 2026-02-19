import { useState, useMemo } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useAdminStore } from "../../../hooks/useAdminStore";
import type { SectionProps } from "../main";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";
import { Loader2, ArrowRight, Package, Plus, Search } from "lucide-react";

export function ProductShowcase({ content, style }: SectionProps) {
  const { data: store } = useAdminStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { storeSlug, pageSlug } = useParams();

  // Estados de Filtro
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [maxPrice, setMaxPrice] = useState<number>(20000);

  const isEditor = location.pathname.includes("/admin/editor");
  const layout = Number((style as any)?.cols) || 1;

  const { data: products, isLoading } = useQuery({
    queryKey: ["public-products", store?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", store?.id)
        .eq("is_active", true) // Regra: Apenas ativos (ignora pausados)
        .order("created_at", { ascending: false }); // Regra: Mais recentes primeiro

      if (error) throw error;
      return data;
    },
    enabled: !!store?.id,
  });

  // Extração de categorias únicas
  const categories = useMemo(() => {
    const cats = products?.map((p) => p.category).filter(Boolean) || [];
    return ["Todos", ...Array.from(new Set(cats))];
  }, [products]);

  // Lógica de Filtragem combinada
  const filteredProducts = useMemo(() => {
    return products?.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "Todos" || p.category === selectedCategory;
      const matchesPrice = p.price <= maxPrice;
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, searchTerm, selectedCategory, maxPrice]);

  const handleAction = (productId: string) => {
    if (isEditor) return;
    const sSlug = storeSlug || store?.slug;
    const pSlug = pageSlug || "home";
    if (sSlug) navigate(`/${sSlug}/${pSlug}/${productId}`);
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <span className="text-xs font-black uppercase tracking-widest opacity-40">
          Sincronizando vitrine...
        </span>
      </div>
    );
  }

  const commonProps = { products: filteredProducts, onAction: handleAction };

  return (
    <section className="py-16 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto">
        
        {/* HEADER - Título e Descrição editáveis */}
        <div className="mb-12 text-center">
          {content?.category && (
            <span className="text-blue-600 font-black text-xs uppercase tracking-[0.3em]">
              {content.category}
            </span>
          )}
          <h2 className="text-3xl md:text-5xl font-black mt-3 break-words">
            {content?.title || "Nossos Produtos"}
          </h2>
          {content?.description && (
            <p className="opacity-60 max-w-2xl mx-auto mt-4 text-sm md:text-base">
              {content.description}
            </p>
          )}
        </div>

        {/* FILTROS E BUSCA */}
        <div className="mb-10 flex flex-col md:flex-row gap-6 items-center justify-between p-6 rounded-[2rem] bg-slate-50/5">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
            <input 
              type="text"
              placeholder="Buscar..."
              className="w-full pl-12 pr-4 py-3 rounded-full bg-slate-100/10 border-none focus:ring-2 focus:ring-blue-500 text-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition ${
                  selectedCategory === cat 
                  ? "bg-blue-600 text-white" 
                  : "bg-slate-100/10 hover:bg-slate-100/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 min-w-[200px]">
            <span className="text-[10px] font-bold uppercase opacity-40">Preço</span>
            <input 
              type="range" 
              min="0" 
              max="20000" 
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1 bg-blue-600/20 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-xs font-bold">${maxPrice}</span>
          </div>
        </div>

        {/* EXIBIÇÃO DOS PRODUTOS */}
        <div className="min-h-[300px]">
          {filteredProducts && filteredProducts.length > 0 ? (
            <>
              {layout === 1 && <LayoutInteractiveList {...commonProps} />}
              {layout === 2 && <LayoutHorizontalStage {...commonProps} />}
              {layout === 4 && <LayoutOrganicMasonry {...commonProps} />}
              {![1, 2, 4].includes(layout) && <LayoutInteractiveList {...commonProps} />}
            </>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-slate-500/20 rounded-3xl">
              <Package className="mx-auto opacity-20 mb-4" size={40} />
              <p className="text-xs font-black uppercase tracking-widest opacity-40">
                Nenhum produto encontrado
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// --- LAYOUTS COM SUPORTE A TÍTULOS LONGOS ---

const LayoutInteractiveList = ({ products, onAction }: any) => (
  <div className="flex flex-col border-t border-slate-500/10">
    {products?.map((p: any) => (
      <div
        key={p.id}
        onClick={() => onAction(p.id)}
        className="group flex items-center justify-between py-8 border-b border-slate-500/10 cursor-pointer hover:px-6 transition-all duration-500"
      >
        <div className="flex items-center gap-6 overflow-hidden">
          <div className="hidden md:block w-0 group-hover:w-40 h-24 overflow-hidden rounded-2xl transition-all duration-500 opacity-0 group-hover:opacity-100 flex-shrink-0">
            <img src={p.main_image} className="w-full h-full object-cover" alt="" />
          </div>
          <h3 className="text-xl md:text-5xl font-black tracking-tighter opacity-60 group-hover:opacity-100 transition truncate pr-4">
            {p.name}
          </h3>
        </div>
        <div className="flex flex-col items-end flex-shrink-0">
          <span className="text-lg md:text-2xl font-black whitespace-nowrap">
            {p.currency} {p.price.toLocaleString()}
          </span>
          <span className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 uppercase tracking-widest">
            Ver detalhes
          </span>
        </div>
      </div>
    ))}
  </div>
);

const LayoutHorizontalStage = ({ products, onAction }: any) => (
  <div className="flex overflow-x-auto gap-6 pb-6 snap-x no-scrollbar">
    {products?.map((p: any) => (
      <div
        key={p.id}
        onClick={() => onAction(p.id)}
        className="min-w-[280px] md:min-w-[450px] aspect-[16/11] bg-slate-500/5 rounded-[2.5rem] overflow-hidden relative cursor-pointer snap-center group"
      >
        <img src={p.main_image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-700" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8 text-white">
          <h3 className="text-2xl font-black line-clamp-2 leading-tight">{p.name}</h3>
          <div className="flex justify-between items-center mt-4">
            <span className="text-xl font-medium">{p.currency} {p.price.toLocaleString()}</span>
            <div className="p-3 bg-white text-black rounded-full shadow-lg flex-shrink-0"><Plus size={18} /></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const LayoutOrganicMasonry = ({ products, onAction }: any) => (
  <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
    {products?.map((p: any, idx: number) => (
      <div
        key={p.id}
        onClick={() => onAction(p.id)}
        className={`relative break-inside-avoid rounded-[2rem] overflow-hidden group cursor-pointer bg-slate-500/5 ${
          idx % 3 === 0 ? "aspect-[3/4]" : "aspect-square"
        }`}
      >
        <img src={p.main_image} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" alt="" />
        <div className="absolute top-4 left-4 bg-white/90 text-black px-4 py-2 rounded-full font-black text-[10px] shadow-xl">
          {p.currency} {p.price.toLocaleString()}
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-blue-600/90 text-white p-6 text-center">
          <div className="max-w-full">
            <h3 className="text-lg font-black mb-4 line-clamp-3">{p.name}</h3>
            <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center mx-auto flex-shrink-0">
              <ArrowRight size={20} />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);