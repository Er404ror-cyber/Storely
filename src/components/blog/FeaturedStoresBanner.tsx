import React from "react";
import { CheckCircle2, ArrowUpRight, ShoppingBag, Store as StoreIcon } from "lucide-react";
import type { StoreItem, ProductItem } from "../../types/Marketplace";

interface FeaturedStoresBannerProps {
  stores: StoreItem[];
  products: ProductItem[];
  onStoreClick: (slug: string) => void;
  onProductClick: (product: ProductItem) => void;
  viewStoreText?: string;
}

// Cores temáticas para dar variação aos cards de lojas em destaque
const BANNER_GRADIENTS = [
  "from-slate-900 via-blue-950/80 to-slate-900 border-blue-500/20",
  "from-zinc-900 via-stone-900/90 to-zinc-950 border-amber-500/20",
  "from-zinc-950 via-purple-950/70 to-zinc-900 border-purple-500/20",
  "from-slate-950 via-emerald-950/70 to-zinc-900 border-emerald-500/20",
];

export const FeaturedStoresBanner: React.FC<FeaturedStoresBannerProps> = ({
  stores,
  products,
  onStoreClick,
  onProductClick,
  viewStoreText = "Ver loja",
}) => {
  // Seleciona até 3 lojas com produtos
  const featuredStores = React.useMemo(() => {
    return stores.slice(0, 3).map((store, index) => {
      // Encontra o produto mais recente/associado a esta loja
      const latestProduct = products.find((p) => p.storeSlug === store.slug);
      return {
        store,
        latestProduct,
        gradient: BANNER_GRADIENTS[index % BANNER_GRADIENTS.length],
      };
    });
  }, [stores, products]);

  if (!featuredStores.length) return null;

  return (
    <section className="w-full px-2 my-6 space-y-4">
      <div className="flex items-center gap-2 mb-2 px-1">
        <StoreIcon size={18} className="text-blue-500" />
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Lojas em Destaque
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        {featuredStores.map(({ store, latestProduct, gradient }) => {
          const bannerImage = latestProduct?.image || store.logoUrl;
          const totalProductsCount = products.filter((p) => p.storeSlug === store.slug).length;

          return (
            <div
              key={store.id}
              onClick={() => onStoreClick(store.slug)}
              className={`relative group overflow-hidden rounded-2xl md:rounded-3xl border bg-gradient-to-r ${gradient} p-4 sm:p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.005]`}
            >
              {/* Capa do Produto em Destaque com Fade Gradiente à Direita */}
              {bannerImage && (
                <div className="absolute right-0 top-0 bottom-0 w-1/2 sm:w-2/5 overflow-hidden pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity duration-300">
                  <img
                    src={bannerImage}
                    alt={store.name}
                    className="w-full h-full object-cover object-center filter blur-[1px] group-hover:blur-0 transition-all duration-500 scale-105 group-hover:scale-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
                </div>
              )}

              {/* Conteúdo Principal Estilo YouTube */}
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                  {/* Foto de Perfil (Logo) Circular com Borda */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white/20 shadow-xl bg-zinc-800">
                      {store.logoUrl ? (
                        <img
                          src={store.logoUrl}
                          alt={store.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-white font-bold text-xl">
                          {store.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Informações da Loja */}
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-lg sm:text-xl font-black text-white truncate tracking-tight">
                        {store.name}
                      </h3>
                      <CheckCircle2 size={16} className="text-blue-400 fill-blue-400/20 flex-shrink-0" />
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-300/80 truncate">
                      @{store.slug} • {totalProductsCount} {totalProductsCount === 1 ? 'produto' : 'produtos'}
                    </p>

                    {latestProduct && (
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full mt-1">
                        <ShoppingBag size={12} />
                        <span className="truncate">Novo: {latestProduct.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex items-center gap-2 pt-2 sm:pt-0 pointer-events-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStoreClick(store.slug);
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-black font-bold text-xs sm:text-sm rounded-full hover:bg-zinc-200 active:scale-95 transition-all shadow-md"
                  >
                    <span>{viewStoreText}</span>
                    <ArrowUpRight size={16} />
                  </button>

                  {latestProduct && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onProductClick(latestProduct);
                      }}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold text-xs sm:text-sm rounded-full active:scale-95 transition-all backdrop-blur-md"
                      title="Ver produto recente"
                    >
                      <ShoppingBag size={15} />
                      <span className="hidden md:inline">Ver Destaque</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};