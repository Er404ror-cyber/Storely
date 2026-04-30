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

const formatPrice = (currency: string, price: number) => {
  return `${currency || ""} ${Number(price || 0).toLocaleString()}`;
};

const ProductLabel = ({ name, price, currency, size = "sm" }: any) => (
  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 md:left-2 md:translate-x-0 z-20 flex items-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full p-1 pl-3 shadow-sm">
    <span
      className={`font-bold mr-2 truncate text-zinc-900 dark:text-zinc-100 ${
        size === "lg"
          ? "text-[11px] max-w-[100px] md:max-w-[180px]"
          : "text-[9px] max-w-[70px] md:max-w-[130px]"
      }`}
    >
      {name}
    </span>

    <span className="bg-blue-600 text-white px-2.5 py-1 rounded-full text-[10px] font-black whitespace-nowrap flex-shrink-0 tracking-tighter">
      {formatPrice(currency, price)}
    </span>
  </div>
);

const ModernScrollRow = ({ children }: { children: React.ReactNode }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    el.scrollBy({
      left: direction === "left" ? -el.clientWidth * 0.9 : el.clientWidth * 0.9,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="relative w-full flex flex-col overflow-hidden">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-3 pb-2 px-1 snap-x snap-mandatory scrollbar-none"
        style={{
          WebkitOverflowScrolling: "touch",
          contentVisibility: "auto",
          contain: "content",
        }}
      >
        {children}
      </div>

      <div className="flex justify-end gap-2 mt-1">
        <button
          onClick={() => scroll("left")}
          className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 active:bg-blue-600 transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={() => scroll("right")}
          className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 active:bg-blue-600 transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export const LayoutGrid = ({
  products,
  onAction,
  cols,
  isDark,
}: LayoutProps & { cols: number }) => {
  const sortedProducts = useMemo(() => sortProductsByDate(products), [products]);

  const handleAction = useCallback(
    (id: string) => onAction(id),
    [onAction]
  );

  const { featured, rowsOfRemaining } = useMemo(() => {
    const feat = sortedProducts.slice(0, 3);
    const remain = sortedProducts.slice(3);

    const rows = [];
    for (let i = 0; i < remain.length; i += 4) {
      rows.push(remain.slice(i, i + 4));
    }

    return { featured: feat, rowsOfRemaining: rows };
  }, [sortedProducts]);

  if (cols === 2) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-4 md:px-4">
        {/* Só as 3 primeiras compactas */}
        <div className="flex flex-col md:grid md:grid-cols-6 md:grid-rows-2 gap-3 h-auto md:h-[450px]">
          {featured.map((p, idx) => (
            <div
              key={p.id}
              onClick={() => handleAction(p.id)}
              className={`${
                idx === 0
                  ? "md:col-span-4 md:row-span-2 aspect-[16/10] md:aspect-auto"
                  : "md:col-span-2 md:row-span-1 aspect-[16/10] md:aspect-auto"
              } group relative overflow-hidden rounded-2xl bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 cursor-pointer`}
              style={{ contain: "layout paint" }}
            >
              <img
                src={p.main_image}
                className="w-full h-full object-cover"
                alt={p.name}
                loading="lazy"
                decoding="async"
              />

              <ProductLabel
                name={p.name}
                price={p.price}
                currency={p.currency}
                size={idx === 0 ? "lg" : "sm"}
              />
            </div>
          ))}
        </div>

        {/* As outras continuam como estavam */}
        {rowsOfRemaining.map((row, rowIndex) => (
          <ModernScrollRow key={rowIndex}>
            {row.map((p) => (
              <div
                key={p.id}
                onClick={() => handleAction(p.id)}
                className="w-[280px] md:w-[calc(30%-12px)] flex-shrink-0 snap-start"
                style={{ contain: "layout paint" }}
              >
                <div className="aspect-[16/12] md:aspect-[16/9] rounded-xl overflow-hidden relative bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
                  <img
                    src={p.main_image}
                    className="w-full h-full object-cover"
                    alt={p.name}
                    loading="lazy"
                    decoding="async"
                  />

                  <ProductLabel
                    name={p.name}
                    price={p.price}
                    currency={p.currency}
                  />
                </div>
              </div>
            ))}
          </ModernScrollRow>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto md:px-4">
      <div
        className={`
          columns-2 gap-2
          md:columns-3 md:gap-3
          lg:columns-4
          space-y-4 md:space-y-4
        `}
      >
        {sortedProducts.map((p) => (
          <div
            key={p.id}
            onClick={() => handleAction(p.id)}
            className="break-inside-avoid group cursor-pointer flex flex-col transform-gpu"
            style={{ contain: "layout paint" }}
          >
            <div
              className={`
                relative overflow-hidden rounded-xl border transition-colors duration-300
                ${isDark ? "bg-zinc-900 border-white/5" : "bg-zinc-50 border-zinc-100"}
              `}
            >
              <img
                src={p.main_image}
                alt={p.name}
                loading="lazy"
                decoding="async"
                className="w-full h-auto aspect-square md:aspect-auto object-cover block"
              />

              <div
                className={`
                  absolute bottom-3 right-3 px-3 py-1.5 rounded-xl text-[10px] font-black border
                  ${
                    isDark
                      ? "bg-zinc-950 border-white/10 text-white"
                      : "bg-white border-zinc-200 text-zinc-900 shadow-sm"
                  }
                `}
              >
                {formatPrice(p.currency, p.price)}
              </div>
            </div>

            <h3
              className={`
                mt-3 px-2 text-[13px] font-semibold leading-tight line-clamp-2 transition-colors
                ${
                  isDark
                    ? "text-zinc-400 group-hover:text-zinc-100"
                    : "text-zinc-600 group-hover:text-black"
                }
              `}
            >
              {p.name}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export const LayoutList = ({ products, onAction, isDark }: LayoutProps) => {
  const sorted = useMemo(() => sortProductsByDate(products), [products]);

  return (
    <div className="max-w-6xl mx-auto px-3 md:px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {sorted.map((p, index) => (
          <button
            key={p.id}
            onClick={() => onAction(p.id)}
            className={`
              group overflow-hidden rounded-2xl border text-left
              transition-transform duration-200 active:scale-[0.98]
              ${
                isDark
                  ? "bg-zinc-950 border-white/10 hover:border-white/20"
                  : "bg-white border-zinc-200 hover:shadow-md"
              }
            `}
            style={{ contain: "layout paint" }}
          >
            <div className="flex items-center gap-3 p-2.5">
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <img
                  src={p.main_image}
                  alt={p.name}
                  loading={index < 4 ? "eager" : "lazy"}
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                {p.category && (
                  <p className="mb-1 line-clamp-1 text-[9px] font-black uppercase tracking-[0.14em] text-blue-500">
                    {p.category}
                  </p>
                )}

                <h3
                  className={`
                    line-clamp-2 text-sm font-bold leading-snug
                    ${isDark ? "text-zinc-100" : "text-zinc-950"}
                  `}
                >
                  {p.name}
                </h3>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <span
                    className={`
                      truncate text-sm font-black
                      ${isDark ? "text-white" : "text-zinc-900"}
                    `}
                  >
                    {formatPrice(p.currency, p.price)}
                  </span>

                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export const ProductShowcaseSkeleton = ({
  cols,
  isDark,
}: {
  cols: number;
  isDark: boolean;
}) => {
  if (cols === 1) {
    return (
      <div className="max-w-6xl mx-auto px-3 md:px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className={`
                rounded-2xl border p-2.5 flex items-center gap-3
                ${
                  isDark
                    ? "bg-zinc-950 border-white/10"
                    : "bg-white border-zinc-200"
                }
              `}
            >
              <div className="h-20 w-20 flex-shrink-0 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
  
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-2.5 w-16 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="h-3.5 w-full rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="h-3.5 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="h-4 w-20 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (cols === 2) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-4 md:px-4">
        <div className="flex flex-col md:grid md:grid-cols-6 md:grid-rows-2 gap-3 h-auto md:h-[390px]">
          <div className="md:col-span-4 md:row-span-2 aspect-[16/10] md:aspect-auto rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="md:col-span-2 md:row-span-1 aspect-[16/10] md:aspect-auto rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="md:col-span-2 md:row-span-1 aspect-[16/10] md:aspect-auto rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 md:px-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="space-y-3">
          <div className="aspect-square rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="h-3 w-4/5 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>
      ))}
    </div>
  );
};