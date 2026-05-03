import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  memo,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  currency?: string | null;
  category?: string | null;
  main_image?: string | null;
  created_at?: string | Date | null;
}

interface LayoutProps {
  products: Product[];
  onAction: (id: string) => void;
  isDark: boolean;
  t?: any;
}

const safeText = (value?: string | null) => String(value || "").trim();

const sortProductsByDate = (items: Product[]) => {
  return [...items].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });
};

const formatPrice = (currency?: string | null, price?: number) => {
  return `${currency || ""} ${Number(price || 0).toLocaleString()}`.trim();
};

const imageFallback =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='800' height='600' fill='%23e4e4e7'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' fill='%2371717a' font-family='Arial' font-size='28'%3ENo image%3C/text%3E%3C/svg%3E";

const ProductImage = memo(function ProductImage({
  src,
  alt,
  priority = false,
  className,
  width = 700,
  height = 500,
}: {
  src?: string | null;
  alt: string;
  priority?: boolean;
  className: string;
  width?: number;
  height?: number;
}) {
  return (
    <img
      src={src || imageFallback}
      alt={alt || "Product"}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      draggable={false}
      className={className}
      onError={(e) => {
        e.currentTarget.src = imageFallback;
      }}
    />
  );
});

const ProductLabel = memo(function ProductLabel({
  name,
  price,
  currency,
  size = "sm",
}: {
  name: string;
  price: number;
  currency?: string | null;
  size?: "sm" | "lg";
}) {
  return (
    <div className="absolute bottom-2 left-1/2 z-20 flex max-w-[calc(100%-1rem)] -translate-x-1/2 items-center rounded-full border border-zinc-200 bg-white/95 p-1 pl-3 shadow-sm md:left-2 md:max-w-[calc(100%-1rem)] md:translate-x-0 dark:border-zinc-800 dark:bg-zinc-950/95">
      <span
        className={[
          "mr-2 min-w-0 truncate font-bold leading-none text-zinc-900 dark:text-zinc-100",
          size === "lg"
            ? "max-w-[100px] text-[11px] md:max-w-[180px]"
            : "max-w-[70px] text-[9px] md:max-w-[130px]",
        ].join(" ")}
        title={name}
      >
        {name}
      </span>

      <span className="max-w-[95px] shrink-0 truncate rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-black leading-none text-white sm:max-w-[120px]">
        {formatPrice(currency, price)}
      </span>
    </div>
  );
});

const ModernScrollRow = memo(function ModernScrollRow({
  children,
}: {
  children: ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    el.scrollBy({
      left: direction === "left" ? -el.clientWidth * 0.85 : el.clientWidth * 0.85,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="relative w-full overflow-hidden">
      <div
        ref={scrollRef}
        className="scrollbar-none flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-2 sm:gap-3"
        style={{
          WebkitOverflowScrolling: "touch",
          contain: "layout paint",
          contentVisibility: "auto",
        }}
      >
        {children}
      </div>

      <div className="mt-1 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => scroll("left")}
          className="rounded-lg border border-zinc-200 bg-zinc-100 p-2 text-zinc-500 active:bg-blue-600 active:text-white dark:border-zinc-800 dark:bg-zinc-900"
          aria-label="Scroll left"
        >
          <ChevronLeft size={17} />
        </button>

        <button
          type="button"
          onClick={() => scroll("right")}
          className="rounded-lg border border-zinc-200 bg-zinc-100 p-2 text-zinc-500 active:bg-blue-600 active:text-white dark:border-zinc-800 dark:bg-zinc-900"
          aria-label="Scroll right"
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
});

export const LayoutGrid = ({
  products = [],
  onAction,
  cols,
  isDark,
}: LayoutProps & { cols: number }) => {
  const sortedProducts = useMemo(
    () => sortProductsByDate(products),
    [products]
  );

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

  if (cols === 2) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-4 px-0 md:px-4">
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
                    ? "aspect-[16/10] md:col-span-4 md:row-span-2 md:aspect-auto"
                    : "aspect-[16/10] md:col-span-2 md:row-span-1 md:aspect-auto"
                } group relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 text-left active:scale-[0.99] dark:border-zinc-800 dark:bg-zinc-800`}
                style={{ contain: "layout paint" }}
              >
                <ProductImage
                  src={p.main_image}
                  alt={name}
                  priority={isMain}
                  width={isMain ? 1100 : 600}
                  height={isMain ? 700 : 400}
                  className="h-full w-full object-cover"
                />

                <ProductLabel
                  name={name}
                  price={p.price}
                  currency={p.currency}
                  size={isMain ? "lg" : "sm"}
                />
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
                  className="w-[280px] shrink-0 snap-start text-left md:w-[calc(30%-12px)]"
                  style={{ contain: "layout paint" }}
                >
                  <div className="relative aspect-[16/12] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-800 md:aspect-[16/9]">
                    <ProductImage
                      src={p.main_image}
                      alt={name}
                      width={600}
                      height={420}
                      className="h-full w-full object-cover"
                    />

                    <ProductLabel
                      name={name}
                      price={p.price}
                      currency={p.currency}
                    />
                  </div>
                </button>
              );
            })}
          </ModernScrollRow>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-0 md:px-4">
      <div className="columns-2 gap-2 space-y-4 md:columns-3 md:gap-3 md:space-y-4 lg:columns-4">
        {sortedProducts.map((p, index) => {
          const name = safeText(p.name);

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleAction(p.id)}
              className="group mb-4 flex w-full break-inside-avoid cursor-pointer flex-col text-left active:scale-[0.99]"
              style={{
                contain: "layout paint",
                contentVisibility: "auto",
                containIntrinsicSize: "260px",
              }}
            >
              <div
                className={`relative overflow-hidden rounded-xl border ${
                  isDark
                    ? "border-white/5 bg-zinc-900"
                    : "border-zinc-100 bg-zinc-50"
                }`}
              >
                <ProductImage
                  src={p.main_image}
                  alt={name}
                  priority={index < 2}
                  width={700}
                  height={500}
                  className="block h-auto w-full object-cover"
                />

                <div
                  className={`absolute bottom-2 right-2 max-w-[75%] truncate rounded-full border px-2 py-1 text-[9px] font-black leading-none ${
                    isDark
                      ? "border-white/10 bg-zinc-950/90 text-white"
                      : "border-zinc-200 bg-white/95 text-zinc-900 shadow-sm"
                  }`}
                >
                  {formatPrice(p.currency, p.price)}
                </div>
              </div>

              <h3
                className={`mt-2 min-w-0 px-1 text-[12px] font-semibold leading-tight line-clamp-2 ${
                  isDark
                    ? "text-zinc-400 group-hover:text-zinc-100"
                    : "text-zinc-600 group-hover:text-black"
                }`}
                title={name}
              >
                {name}
              </h3>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export function LayoutList({ products, onAction, isDark }: LayoutProps) {
  const sorted = useMemo(() => sortProductsByDate(products || []), [products]);

  const featured = sorted[0];
  const sideItems = sorted.slice(1, 5);
  const restItems = sorted.slice(5);

  const handleAction = useCallback(
    (id: string) => {
      if (id) onAction(id);
    },
    [onAction]
  );

  if (!sorted.length) return null;

  const cardBase = isDark
    ? "border-white/10 bg-zinc-950"
    : "border-zinc-200 bg-white shadow-sm";

  return (
    <div className="mx-auto w-full max-w-7xl px-0 md:px-4">
      <div className="grid gap-2 lg:grid-cols-[1.1fr_0.9fr] xl:grid-cols-[1.2fr_0.8fr]">
        {featured && (
          <button
            type="button"
            onClick={() => handleAction(featured.id)}
            className={[
              "group relative min-h-[280px] overflow-hidden rounded-[1.35rem] border text-left active:scale-[0.99]",
              "sm:min-h-[340px] lg:min-h-[500px]",
              cardBase,
            ].join(" ")}
            style={{ contain: "layout paint" }}
          >
            <ProductImage
              src={featured.main_image}
              alt={safeText(featured.name)}
              priority
              width={1100}
              height={800}
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

            <div className="absolute inset-x-3 bottom-3 z-10 min-w-0 sm:inset-x-5 sm:bottom-5">
              <div className="mb-2 flex min-w-0 flex-wrap items-center gap-2">
                {featured.category && (
                  <span className="max-w-full truncate rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white">
                    {safeText(featured.category)}
                  </span>
                )}

                <span className="shrink-0 rounded-full bg-blue-600 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white">
                  Featured
                </span>
              </div>

              <h3
                className="line-clamp-2 max-w-3xl text-xl font-black leading-[1.02] text-white sm:text-3xl lg:text-5xl"
                title={safeText(featured.name)}
              >
                {safeText(featured.name)}
              </h3>

              <div className="mt-3 flex min-w-0 items-center justify-between gap-3 sm:mt-4">
                <span className="min-w-0 max-w-[75%] truncate rounded-2xl bg-white px-3 py-2 text-xs font-black text-zinc-950 shadow-sm sm:text-base">
                  {formatPrice(featured.currency, featured.price)}
                </span>

                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-zinc-950 shadow-sm sm:h-10 sm:w-10">
                  <ArrowRight size={17} />
                </span>
              </div>
            </div>
          </button>
        )}

        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {sideItems.map((p, index) => {
            const name = safeText(p.name);

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleAction(p.id)}
                className={[
                  "group grid min-w-0 overflow-hidden rounded-[1.1rem] border text-left active:scale-[0.99]",
                  "lg:grid-cols-[0.9fr_1.1fr]",
                  cardBase,
                ].join(" ")}
                style={{ contain: "layout paint" }}
              >
                <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800 lg:aspect-auto lg:min-h-[118px]">
                  <ProductImage
                    src={p.main_image}
                    alt={name}
                    priority={index < 2}
                    width={420}
                    height={420}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex min-w-0 flex-col justify-between p-2.5">
                  <div className="min-w-0">
                    {p.category && (
                      <p className="mb-1 truncate text-[8px] font-black uppercase tracking-[0.1em] text-blue-500">
                        {safeText(p.category)}
                      </p>
                    )}

                    <h3
                      className={[
                        "line-clamp-2 min-w-0 text-[12px] font-extrabold leading-snug sm:text-sm",
                        isDark ? "text-zinc-100" : "text-zinc-950",
                      ].join(" ")}
                      title={name}
                    >
                      {name}
                    </h3>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span
                      className={`min-w-0 truncate rounded-full px-2 py-1 text-[10px] font-black ${
                        isDark
                          ? "bg-white/10 text-zinc-100"
                          : "bg-zinc-100 text-zinc-950"
                      }`}
                    >
                      {formatPrice(p.currency, p.price)}
                    </span>

                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {!!restItems.length && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {restItems.map((p, index) => {
            const name = safeText(p.name);

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleAction(p.id)}
                className={[
                  "group min-w-0 overflow-hidden rounded-[1.1rem] border text-left active:scale-[0.99]",
                  cardBase,
                ].join(" ")}
                style={{
                  contain: "layout paint",
                  contentVisibility: "auto",
                  containIntrinsicSize: "230px",
                }}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <ProductImage
                    src={p.main_image}
                    alt={name}
                    priority={index < 4}
                    width={380}
                    height={285}
                    className="h-full w-full object-cover"
                  />

                  <span className="absolute left-2 top-2 max-w-[82%] truncate rounded-full bg-white/95 px-2 py-1 text-[9px] font-black text-zinc-950 shadow-sm">
                    {formatPrice(p.currency, p.price)}
                  </span>
                </div>

                <div className="min-w-0 p-2.5">
                  {p.category && (
                    <p className="mb-1 truncate text-[8px] font-black uppercase tracking-[0.1em] text-blue-500">
                      {safeText(p.category)}
                    </p>
                  )}

                  <h3
                    className={[
                      "line-clamp-2 min-h-[32px] min-w-0 text-[12px] font-extrabold leading-snug",
                      isDark ? "text-zinc-100" : "text-zinc-950",
                    ].join(" ")}
                    title={name}
                  >
                    {name}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ProductShowcaseSkeleton({
  cols,
  isDark,
}: {
  cols: number;
  isDark: boolean;
}) {
  const base = isDark
    ? "bg-zinc-950 border-white/10"
    : "bg-white border-zinc-200";

  if (cols === 1) {
    return (
      <div className="mx-auto max-w-6xl px-0 md:px-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className={["flex items-center gap-3 rounded-2xl border p-2.5", base].join(" ")}
            >
              <div className="h-20 w-20 shrink-0 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />

              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-2.5 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3.5 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3.5 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-4 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (cols === 2) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-3 px-0 md:px-4">
        <div className="grid gap-2 md:h-[390px] md:grid-cols-6 md:grid-rows-2 md:gap-3">
          <div className="aspect-[16/10] animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800 md:col-span-4 md:row-span-2 md:aspect-auto" />
          <div className="aspect-[16/10] animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800 md:col-span-2 md:row-span-1 md:aspect-auto" />
          <div className="aspect-[16/10] animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800 md:col-span-2 md:row-span-1 md:aspect-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-3 px-0 md:grid-cols-4 md:px-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <div className="aspect-square animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}