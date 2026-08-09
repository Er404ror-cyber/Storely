import React, { useMemo } from "react";

interface ProductResult {
  id: string;
  name: string;
  price: number;
  category: string;
  main_image: string;
  stores?: { slug: string; name: string } | { slug: string; name: string }[];
  hasDiscount?: boolean;
  originalPrice?: number | null;
  finalPrice?: number | null;
  discountPercent?: number | null;
}

interface SearchResultCardProps {
  product: ProductResult;
  currency: string;
  isGlobal?: boolean;
  onClick: () => void;
}

export const SearchResultCard = React.memo(function SearchResultCard({
  product,
  currency,
  isGlobal = false,
  onClick,
}: SearchResultCardProps) {
  const storeInfo = useMemo(() => {
    if (!product.stores) return null;
    return Array.isArray(product.stores)
      ? product.stores[0]
      : product.stores;
  }, [product.stores]);

  const truncate = (text?: string, max = 14) => {
    if (!text) return "";
    return text.length > max ? `${text.slice(0, max)}...` : text;
  };

  // Resolve o preço a exibir (usa finalPrice se existir desconto)
  const displayPrice = product.hasDiscount && product.finalPrice != null 
    ? product.finalPrice 
    : product.price;

  return (
    <button
      onClick={onClick}
      className="
        relative
        w-full
        aspect-[4/4]
        overflow-hidden
        rounded-2xl
        bg-zinc-900
        cursor-pointer
        active:scale-[0.99]
        group
        transform-gpu
      "
      style={{
        contentVisibility: "auto",
        contain: "layout paint style",
        containIntrinsicSize: "240px",
      }}
    >
      <img
        src={product.main_image}
        alt={product.name}
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        draggable={false}
        className="
          absolute
          inset-0
          h-full
          w-full
          object-cover
          opacity-90
          transition-transform duration-500 group-hover:scale-105
          select-none
        "
      />

      {/* Degradê subtil para legibilidade */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

      {/* ÁREA SUPERIOR ESQUERDA: Categoria e Badge de Desconto */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5 pr-2">
        <span className="text-[8px] font-bold uppercase tracking-widest text-white bg-white/10 px-1.5 py-0.5 rounded-full border border-white/10 shadow-sm ">
          {truncate(product.category)}
        </span>
        
        {/* Mostra a Badge de desconto se existir */}
        {product.hasDiscount && product.discountPercent && (
          <span className="text-[9px] font-black tracking-wider text-white bg-rose-600 px-1.5 py-0.5 rounded-full shadow-sm">
            -{product.discountPercent}%
          </span>
        )}
      </div>

      {/* ÁREA INFERIOR: Título e Preço */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-col items-start w-full">
        <h4 className="text-[11px] font-bold text-white leading-tight truncate mb-1.5 opacity-90 w-full text-left">
          {truncate(product.name)}
        </h4>

        <div className="inline-flex items-center px-3 py-1.5   gap-2 w-[90%]">
          {/* Caixa Preço Destaque (Muda de cor com base na promoção) */}
          <div className={`inline-flex items-center px-2 py-1 rounded-xl border transition-colors shadow-sm ${
            product.hasDiscount 
              ? "bg-rose-500/20 border-rose-500/30" 
              : "bg-emerald-500/10 border-emerald-500/20"
          }`}>
            <span className={`text-[12px] font-black tracking-tighter ${
              product.hasDiscount ? "text-rose-400" : "text-emerald-400"
            }`}>
              {currency} {Number(displayPrice).toLocaleString()}
            </span>
          </div>

          {/* Ancoragem de Preço: Preço Original Riscado */}
          {product.hasDiscount && product.originalPrice && (
            <span className=" text-[9px] font-bold text-white/50 line-through mb-1 truncate">
              {currency} {Number(product.originalPrice).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* BADGE GLOBAL DE LOJA */}
      {isGlobal && storeInfo && (
        <div className="absolute top-3 right-3 z-10">
          <span className="text-[8px] font-black uppercase tracking-widest text-emerald-300 bg-black/40 px-2 py-0.5 rounded-full border border-white/10 ">
            {truncate(storeInfo.name)}
          </span>
        </div>
      )}
    </button>
  );
});