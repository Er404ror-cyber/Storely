import React, { useMemo } from "react";

interface ProductResult {
  id: string;
  name: string;
  price: number;
  category: string;
  main_image: string;
  stores?: { slug: string; name: string } | { slug: string; name: string }[];
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

  return (
    <button
      onClick={onClick}
      className="
        relative
        w-full
        aspect-[4/3]
        overflow-hidden
        rounded-2xl
        bg-zinc-900
        cursor-pointer
        active:scale-[0.99]
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
         transition-transform duration-500 hover:scale-105
          select-none
        "
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

      <div className="absolute top-3 left-3 z-10">
      <span className="text-[8px] font-bold uppercase tracking-widest text-white bg-white/5 px-1 py-0.5 rounded-full border border-white/10">
  {truncate(product.category)}
</span>
      </div>

      <div className="absolute bottom-3 left-3 right-3 z-10">
        <h4 className="text-[11px] font-bold text-white leading-tight truncate mb-1.5 opacity-90">
          {truncate(product.name)}
        </h4>

        <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-[12px] font-black text-emerald-400 tracking-tighter">
            {currency} {Number(product.price).toLocaleString()}
          </span>
        </div>
      </div>

      {isGlobal && storeInfo && (
        <div className="absolute top-3 right-3 z-10">
          <span className="text-[8px] font-black uppercase tracking-widest text-emerald-300 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
            {truncate(storeInfo.name)}
          </span>
        </div>
      )}
    </button>
  );
});