import { memo, useCallback, useMemo, useState } from "react";
import { type LayoutProps, type Product, sortProductsByDate, safeText, formatPrice, IMAGE_FALLBACK } from "./layout.utils";
import { ProductImage, ProductLabel, ModernScrollRow } from "./LayoutShared";
import { Sparkles } from "lucide-react";

// CARTÃO PINTEREST ADAPTÁVEL AO FORMATO REAL DA IMAGEM
const PinterestProductCard = memo(function PinterestProductCard({
  product,
  onAction,
  isDark,
}: {
  product: Product;
  onAction: (id: string) => void;
  isDark: boolean;
}) {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const name = safeText(product.name);

  return (
    <div className="mb-3 sm:mb-4 inline-block w-full break-inside-avoid transform-gpu">
      <button
        type="button"
        onClick={() => onAction(product.id)}
        className="group flex w-full cursor-pointer flex-col text-left transition-transform active:scale-[0.98]"
      >
        <div
          className={`relative w-full overflow-hidden rounded-xl border ${
            isDark ? "border-white/5 bg-zinc-900" : "border-zinc-200 bg-zinc-100"
          }`}
          style={{
            aspectRatio: aspectRatio ? `${aspectRatio}` : "4 / 5",
            transition: "aspect-ratio 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <img
            src={product.main_image || IMAGE_FALLBACK}
            alt={name}
            loading="lazy"
            decoding="async"
            draggable={false}
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth && img.naturalHeight) {
                setAspectRatio(img.naturalWidth / img.naturalHeight);
              }
              setIsLoaded(true);
            }}
            onError={(e) => {
              e.currentTarget.src = IMAGE_FALLBACK;
              setIsLoaded(true);
            }}
            // A CORREÇÃO ESTÁ AQUI: m-0, p-0, block, absolute inset-0.
            // Cravamos a imagem em 100% do espaço gerado pelo aspectRatio, matando qualquer sobra.
            className={`absolute inset-0 m-0 block h-full w-full border-none p-0 object-cover object-center transition-all duration-500 md:group-hover:scale-105 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Badge de Desconto */}
          {product.discount_percent && product.discount_percent > 0 ? (
            <div className="absolute right-2 top-2 z-10 flex items-center gap-0.5 rounded-md bg-rose-600 px-1.5 py-0.5 text-[9px] font-black text-white shadow-sm md:text-[10px]">
              <Sparkles size={9} className="opacity-90" /> -{product.discount_percent}%
            </div>
          ) : null}

          {/* Badge de Preço */}
          <div
            className={`absolute bottom-2 right-2 flex max-w-[75%] items-center truncate rounded-full border px-2 py-1 text-[9px] font-black leading-none shadow-sm md:text-[10px] ${
              isDark
                ? "border-zinc-700/50 bg-zinc-900 text-white shadow-black/60"
                : "border-zinc-200/80 bg-white text-zinc-900"
            }`}
          >
            {formatPrice(product.currency, product.final_price || product.price)}
          </div>
        </div>

        {/* Informações do Produto (Pinterest) */}
        <div className="mt-2 min-w-0 px-1 pb-1">
          <h3
            className={`line-clamp-2 min-w-0 text-[11px] font-semibold leading-tight transition-colors md:text-[12px] ${
              isDark ? "text-zinc-300 md:group-hover:text-white" : "text-zinc-700 md:group-hover:text-black"
            }`}
            title={name}
          >
            {name}
          </h3>

          {product.has_discount && (
            <p className="mt-0.5 truncate text-[10px] font-bold text-zinc-400 line-through md:text-[11px] dark:text-zinc-500">
              {formatPrice(product.currency, product.original_price)}
            </p>
          )}
        </div>
      </button>
    </div>
  );
});

function GridComponent({ products = [], onAction, cols, isDark }: LayoutProps & { cols: number }) {
  const sortedProducts = useMemo(() => sortProductsByDate(products), [products]);

  const handleAction = useCallback(
    (id: string) => {
      if (id) onAction(id);
    },
    [onAction]
  );

  const { featured, rowsOfRemaining } = useMemo(() => {
    const feat = sortedProducts.slice(0, 3);
    const remain = sortedProducts.slice(3);
    const rows: Product[][] = [];
    for (let i = 0; i < remain.length; i += 4) {
      rows.push(remain.slice(i, i + 4));
    }
    return { featured: feat, rowsOfRemaining: rows };
  }, [sortedProducts]);

  if (!sortedProducts.length) return null;

  // LAYOUT 1 e 2 (Destaque + Scroll)
  if (cols === 2) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-4 px-0 md:px-4" style={{ contain: "layout paint" }}>
        <div className="flex h-auto flex-col gap-3 md:grid md:h-[450px] md:grid-cols-6 md:grid-rows-2">
          {featured.map((p, idx) => {
            const isMain = idx === 0;
            const name = safeText(p.name);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleAction(p.id)}
                className={`${
                  isMain
                    ? "aspect-square md:col-span-4 md:row-span-2 md:aspect-auto"
                    : "aspect-square md:col-span-2 md:row-span-1 md:aspect-auto"
                } group relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 text-left active:scale-[0.99] dark:border-zinc-800 dark:bg-zinc-900 will-change-transform`}
                style={{ transform: "translateZ(0)" }}
              >
                <ProductImage
                  src={p.main_image}
                  alt={name}
                  priority={isMain}
                  width={isMain ? 1000 : 500}
                  height={isMain ? 1000 : 500}
                  discount={p.discount_percent}
                  className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <ProductLabel name={name} product={p} size={isMain ? "lg" : "sm"} />
              </button>
            );
          })}
        </div>

        {rowsOfRemaining.map((row, rowIndex) => (
          <ModernScrollRow key={rowIndex}>
            {row.map((p) => {
              const name = safeText(p.name);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleAction(p.id)}
                  className="group w-[260px] sm:w-[280px] shrink-0 snap-start text-left md:w-[calc(33.333%-12px)] will-change-transform"
                  style={{ transform: "translateZ(0)" }}
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
                    <ProductImage
                      src={p.main_image}
                      alt={name}
                      width={500}
                      height={500}
                      discount={p.discount_percent}
                      className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                    <ProductLabel name={name} product={p} isDark={isDark} />
                  </div>
                </button>
              );
            })}
          </ModernScrollRow>
        ))}
      </div>
    );
  }

  // LAYOUT 4 - MASONRY BASEADO NO FORMATO REAL DE CADA IMAGEM
  return (
    <div className="mx-auto max-w-[1400px] px-2 md:px-4" style={{ isolation: "isolate" }}>
      <div className="columns-2 gap-2 sm:gap-3 md:columns-3 lg:columns-4">
        {sortedProducts.map((p) => (
          <PinterestProductCard
            key={p.id}
            product={p}
            onAction={handleAction}
            isDark={isDark}
          />
        ))}
      </div>
    </div>
  );
}

export const LayoutGrid = memo(GridComponent);