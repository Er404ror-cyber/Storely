import { memo, useCallback, useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { type LayoutProps, sortProductsByDate, safeText, formatPrice } from "./layout.utils";
import { ProductImage } from "./LayoutShared";
import { useTranslate } from "../../context/LanguageContext";

function ListComponent({ products, onAction, isDark }: LayoutProps) {
  // Move the hook inside the functional component
  const { t } = useTranslate();

  const sorted = useMemo(() => sortProductsByDate(products || []), [products]);

  const featured = sorted[0];
  const sideItems = sorted.slice(1, 4);
  const restItems = sorted.slice(4);

  const handleAction = useCallback((id: string) => {
    if (id) onAction(id);
  }, [onAction]);

  if (!sorted.length) return null;

  const cardBase = isDark ? "border-white/10 bg-zinc-950" : "border-zinc-200 bg-white shadow-sm";

  return (
    <div className="mx-auto w-full max-w-7xl px-0 md:px-4" style={{ contain: "layout paint" }}>
      <div className="grid gap-2 lg:h-[480px] lg:grid-cols-[1.1fr_0.9fr] xl:grid-cols-[1.2fr_0.8fr]">
        
        {featured && (
          <button
            type="button" onClick={() => handleAction(featured.id)}
            className={["group relative w-full overflow-hidden rounded-[1.35rem] border text-left active:scale-[0.99]", "h-[320px] sm:h-[400px] lg:h-full", cardBase].join(" ")}
          >
            {/* object-center garante que o corte no telemóvel centraliza o produto */}
            <ProductImage 
              src={featured.main_image} alt={safeText(featured.name)} priority width={1100} height={800} discount={featured.discount_percent} 
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 " 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            <div className="absolute inset-x-3 bottom-3 z-10 min-w-0 sm:inset-x-5 sm:bottom-5">
              <div className="mb-2 flex min-w-0 flex-wrap items-center gap-2">
                {featured.category && (
                  <span className="max-w-full truncate rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white ">
                    {safeText(featured.category)}
                  </span>
                )}
                {featured.has_discount && (
                  <span className="shrink-0 rounded-full bg-rose-600 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white">
                    {/* Apply the translation hook here */}
                    {t("ofertaEspecial")} 
                  </span>
                )}
              </div>
              <h3 className="line-clamp-2 max-w-3xl text-xl font-black leading-[1.02] text-white sm:text-3xl lg:text-5xl" title={safeText(featured.name)}>{safeText(featured.name)}</h3>
              <div className="mt-3 flex min-w-0 items-center justify-between gap-3 sm:mt-4">
                <div className="flex flex-col min-w-0 max-w-[75%]">
                  {featured.has_discount && (
                    <span className="truncate pl-1 text-[11px] font-bold text-zinc-300 line-through sm:text-sm">
                      {formatPrice(featured.currency, featured.original_price)}
                    </span>
                  )}
                  <span className="min-w-0 truncate rounded-2xl bg-white px-3 py-2 text-xs font-black text-zinc-950 shadow-sm sm:text-base">
                    {formatPrice(featured.currency, featured.final_price || featured.price)}
                  </span>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-zinc-950 shadow-sm transition-colors group-hover:bg-blue-600 group-hover:text-white sm:h-10 sm:w-10">
                  <ArrowRight size={17} />
                </span>
              </div>
            </div>
          </button>
        )}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1 lg:grid-rows-3 lg:h-full">
          {sideItems.map((p, index) => {
            const name = safeText(p.name);
            const isThirdItem = index === 2;
            return (
              <button
                key={p.id} type="button" onClick={() => handleAction(p.id)}
                className={["group flex min-w-0 flex-col overflow-hidden rounded-[1.1rem] border text-left active:scale-[0.99] transition-all h-full lg:flex-row", isThirdItem ? "col-span-2 sm:col-span-1" : "col-span-1", cardBase].join(" ")}
              >
                <div className={["relative shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center w-full lg:h-full lg:w-[40%] xl:w-[45%]", isThirdItem ? "aspect-square lg:aspect-auto" : "aspect-square lg:aspect-auto"].join(" ")}>
                  <ProductImage 
                    src={p.main_image} alt={name} priority={index < 2} width={420} height={420} discount={p.discount_percent} 
                    className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 " 
                  />
                </div>
                <div className="flex flex-1 min-w-0 flex-col justify-between overflow-hidden p-2.5 lg:p-3">
                  <div className="min-w-0">
                    {p.category && <p className="mb-1 truncate text-[8px] font-black uppercase tracking-[0.1em] text-blue-500">{safeText(p.category)}</p>}
                    <h3 className={["line-clamp-2 min-w-0 text-[12px] font-extrabold leading-snug sm:text-sm", isDark ? "text-zinc-100" : "text-zinc-950"].join(" ")} title={name}>{name}</h3>
                  </div>
                  <div className="mt-2 flex items-end justify-between gap-2 pt-1">
                    <div className="flex flex-col min-w-0">
                      {p.has_discount && <span className="truncate pl-1 text-[9px] font-bold text-zinc-400 line-through">{formatPrice(p.currency, p.original_price)}</span>}
                      <span className={`min-w-0 truncate rounded-full px-2 py-1 text-[10px] font-black ${isDark ? "bg-white/10 text-zinc-100" : "bg-zinc-100 text-zinc-950"} ${p.has_discount ? "text-rose-600 dark:text-rose-400" : ""}`}>
                        {formatPrice(p.currency, p.final_price || p.price)}
                      </span>
                    </div>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-colors group-hover:bg-zinc-900 dark:group-hover:bg-white dark:group-hover:text-zinc-900">
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
                key={p.id} type="button" onClick={() => handleAction(p.id)}
                className={["group min-w-0 overflow-hidden rounded-[1.1rem] border text-left active:scale-[0.99]", cardBase].join(" ")}
              >
                <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <ProductImage 
                    src={p.main_image} alt={name} priority={index < 4} width={380} height={380} discount={p.discount_percent} 
                    className="h-full w-full object-cover object-center transition-transform duration-700 " 
                  />
                  <div className={`absolute left-2 top-2 flex max-w-[82%] items-center truncate rounded-full px-2 py-1 text-[9px] font-black shadow-sm ${isDark ? "bg-white/95 text-zinc-950" : "bg-white/95 text-zinc-950"}`}>
                    {formatPrice(p.currency, p.final_price || p.price)}
                  </div>
                </div>
                <div className="min-w-0 p-2.5">
                  {p.category && <p className="mb-1 truncate text-[8px] font-black uppercase tracking-[0.1em] text-blue-500">{safeText(p.category)}</p>}
                  <h3 className={["line-clamp-2 min-h-[32px] min-w-0 text-[12px] font-extrabold leading-snug", isDark ? "text-zinc-100" : "text-zinc-950"].join(" ")} title={name}>{name}</h3>
                  {p.has_discount && <p className="mt-1 truncate text-[10px] font-bold text-zinc-400 line-through">{formatPrice(p.currency, p.original_price)}</p>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const LayoutList = memo(ListComponent);