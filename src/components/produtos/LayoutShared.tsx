import { memo, useCallback, useRef, useState, useEffect, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { formatPrice, IMAGE_FALLBACK, type Product } from "./layout.utils";

export const ProductImage = memo(function ProductImage({
  src, alt, priority = false, className = "", width = 700, height = 500, discount,
}: {
  src?: string | null; alt: string; priority?: boolean; className?: string;
  width?: number; height?: number; discount?: number;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <img
        src={src || IMAGE_FALLBACK}
        alt={alt || "Product"}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        draggable={false}
        // A MAGIA ESTÁ AQUI: Adicionado transição suave e aumento de saturação no hover
        className={` hover:saturate-125 ${className}`}
        onError={(e) => { e.currentTarget.src = IMAGE_FALLBACK; }}
      />
      {discount && discount > 0 ? (
        <div className="absolute top-2 right-2 md:top-3 md:right-3 flex items-center gap-1 rounded-lg bg-rose-600 px-2 py-1 text-[10px] md:text-[11px] font-black text-white shadow-md shadow-rose-900/20 shrink-0 z-10 animate-in fade-in zoom-in duration-300">
          <Sparkles size={10} className="opacity-80" /> -{discount}%
        </div>
      ) : null}
    </div>
  );
});
export const ProductLabel = memo(function ProductLabel({
  name, product, size = "sm", isDark = false, // <-- Recebe a propriedade isDark
}: {
  name: string; product: Product; size?: "sm" | "lg"; isDark?: boolean;
}) {
  const isLg = size === "lg";
  
  return (
    <div 
      // Alterna o fundo e borda baseado no isDark (removido dark:bg...)
      className={`absolute bottom-1.5 left-1.5 z-20 flex w-auto max-w-[calc(100%-0.75rem)] items-center rounded-full border p-0.5 pl-2 pr-0.5 shadow-sm md:bottom-2 md:left-2 md:max-w-[calc(100%-1rem)] md:p-1 md:pl-2.5 md:pr-1 ${
        isDark ? "border-zinc-800 bg-zinc-950" : "border-zinc-200 bg-white"
      }`}
    >
      <span
        // Alterna a cor do texto baseado no isDark
        className={["truncate font-bold leading-none", isDark ? "text-zinc-100" : "text-zinc-900", isLg ? "max-w-[80px] text-[10px] md:max-w-[160px] md:text-[11px]" : "max-w-[55px] text-[8px] md:max-w-[110px] md:text-[10px]"].join(" ")}
        title={name}
      >
        {name}
      </span>

      <div className="ml-1.5 flex min-w-0 shrink-0 items-center md:ml-2">
        {product.has_discount && (
          <span className="mr-1 hidden truncate text-[8px] font-bold text-zinc-400 line-through md:block md:text-[9px]">
            {formatPrice(product.currency, product.original_price)}
          </span>
        )}
        <span
          className={["shrink-0 truncate rounded-full px-1.5 py-0.5 text-[8px] font-black leading-none text-white md:px-2 md:py-1 md:text-[10px]", product.has_discount ? "bg-rose-600" : "bg-blue-600", isLg ? "max-w-[80px] sm:max-w-[100px]" : "max-w-[60px] sm:max-w-[85px]"].join(" ")}
        >
          {formatPrice(product.currency, product.final_price || product.price)}
        </span>
      </div>
    </div>
  );
});

export const ModernScrollRow = memo(function ModernScrollRow({ 
  children, isDark = false // <-- Recebe a propriedade isDark
}: { 
  children: ReactNode; isDark?: boolean; 
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    const isAtStart = el.scrollLeft <= 5;
    const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 5;
    
    setCanScrollLeft(!isAtStart);
    setCanScrollRight(!isAtEnd);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    const timeout = setTimeout(checkScroll, 300);
    return () => {
      window.removeEventListener("resize", checkScroll);
      clearTimeout(timeout);
    };
  }, [checkScroll, children]);

  const scroll = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === "left" ? -el.clientWidth * 0.85 : el.clientWidth * 0.85, behavior: "smooth" });
  }, []);

  return (
    <div className="relative w-full overflow-hidden group/row">
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="scrollbar-none flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-2 sm:gap-3 transform-gpu"
        style={{ WebkitOverflowScrolling: "touch", contain: "layout paint" }}
      >
        {children}
      </div>
      
      {canScrollLeft && (
        <button 
          type="button" 
          onClick={() => scroll("left")} 
          // Alterna o gradiente e a cor da seta usando isDark
          className={`absolute bottom-2 left-0 top-0 z-10 flex w-10 md:w-14 cursor-pointer items-center justify-center bg-gradient-to-r opacity-50 transition-opacity duration-300 hover:opacity-100 md:opacity-0 md:group-hover/row:opacity-100 ${
            isDark ? "from-black/90 to-transparent text-white" : "from-white/90 to-transparent text-zinc-900"
          }`}
        >
          <ChevronLeft size={36} className="drop-shadow-sm transition-transform hover:-translate-x-1" />
        </button>
      )}

      {canScrollRight && (
        <button 
          type="button" 
          onClick={() => scroll("right")} 
          // Alterna o gradiente e a cor da seta usando isDark
          className={`absolute bottom-2 right-0 top-0 z-10 flex w-10 md:w-14 cursor-pointer items-center justify-center bg-gradient-to-l opacity-50 transition-opacity duration-300 hover:opacity-100 md:opacity-0 md:group-hover/row:opacity-100 ${
            isDark ? "from-black/90 to-transparent text-white" : "from-white/90 to-transparent text-zinc-900"
          }`}
        >
          <ChevronRight size={36} className="drop-shadow-sm transition-transform hover:translate-x-1" />
        </button>
      )}
    </div>
  );
});