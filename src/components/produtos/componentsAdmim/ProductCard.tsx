import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Coins, Edit, Trash2 } from 'lucide-react';
import type { TranslateFn } from '../../../types/TextTypes';
import { IOSToggle } from './ProductTable';

interface Product {
  id: string;
  name: string;
  category?: string | null;
  price: number;
  discount_percent?: number;
  currency?: string | null;
  is_active: boolean;
  main_image: string;
  store_id: string;
  created_at?: string;
}

interface ProductCardProps {
  product: Product;
  storeCurrency: string;
  onToggle: () => void;
  onDelete: () => void;
  togglePending: boolean;
  t: TranslateFn;
  onClick?: () => void;
}

const ProductImage = memo(({ src, alt, discount }: { src: string; alt: string; discount?: number }) => (
  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-3xl bg-slate-100">
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover"
      loading="lazy"
      decoding="async"
      onError={(e) => {
        e.currentTarget.src =
          'https://antoniogaspar.pt/wp-content/uploads/2023/06/ag-blog-featured-img.svg';
      }}
    />
    {discount && discount > 0 ? (
      <div className="absolute top-3 right-3 rounded-lg bg-rose-500 px-2 py-1 text-[11px] font-black text-white shadow-sm shrink-0">
        -{discount}%
      </div>
    ) : null}
  </div>
));
ProductImage.displayName = 'ProductImage';

export const ProductCard = memo(({
  product,
  storeCurrency,
  onToggle,
  onDelete,
  togglePending,
  t,
}: ProductCardProps) => {
  const discount = product.discount_percent || 0;
  const hasDiscount = discount > 0;
  const finalPrice = hasDiscount
    ? product.price - (product.price * (discount / 100))
    : product.price;

  return (
    <div
      style={{ contentVisibility: 'auto', containIntrinsicSize: '340px' }}
      className="flex flex-col h-full min-w-0 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden"
    >
      <Link to={`/admin/produtos/${product.id}`} state={{ fromStore: true }} className="shrink-0">
        <ProductImage src={product.main_image} alt={product.name} discount={discount} />
      </Link>
      
      <div className="p-4 flex flex-col min-w-0 flex-1">
        
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 flex-1 truncate text-base font-black text-slate-900" title={product.name}>
            {product.name}
          </h3>

          <span
            className={`shrink-0 inline-flex items-center rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] ${
              product.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {product.is_active ? t('status_active') : t('status_paused')}
          </span>
        </div>

        {/* CORREÇÃO: min-h-[46px] e items-start no PAI garantem alinhamento de topo perfeito das tags */}
        <div className="mt-3 flex flex-wrap items-start gap-2 min-w-0 min-h-[46px]">
          {product.category && (
            <span className="inline-flex max-w-[140px] h-7 items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 text-[11px] font-semibold text-slate-600 shrink-0">
              <Tag size={11} className="shrink-0 text-blue-500" />
              <span className="truncate" title={product.category}>{product.category}</span>
            </span>
          )}

          {hasDiscount ? (
            // Removido o min-h e justify-center daqui para permitir o alinhamento natural
            <div className="flex flex-col min-w-0 shrink-0 gap-0.5">
              <span className="inline-flex h-7 items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 text-[11px] font-black text-blue-700">
                <Coins size={11} className="shrink-0 text-blue-600" />
                <span className="truncate" title={`${storeCurrency} ${Number(finalPrice).toLocaleString()}`}>
                  {storeCurrency} {Number(finalPrice).toLocaleString()}
                </span>
              </span>
              <span 
                className="px-2.5 text-[10px] leading-none font-bold text-slate-400 line-through truncate max-w-full" 
                title={`${storeCurrency} ${Number(product.price).toLocaleString()}`}
              >
                {storeCurrency} {Number(product.price).toLocaleString()}
              </span>
            </div>
          ) : (
            <span className="inline-flex h-7 max-w-[160px] items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 text-[11px] font-semibold text-slate-800 shrink-0">
              <Coins size={11} className="shrink-0 text-emerald-600" />
              <span className="truncate" title={`${storeCurrency} ${Number(product.price).toLocaleString()}`}>
                {storeCurrency} {Number(product.price).toLocaleString()}
              </span>
            </span>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-4 shrink-0">
          <div className="border-t border-slate-100 pt-4 flex items-center justify-between gap-3">
            <Link
              to={`/admin/produtos/${product.id}`}
              state={{ fromStore: true }}
              className="inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-50 px-3 text-[11px] font-black uppercase tracking-[0.08em] text-blue-700 transition hover:bg-blue-600 hover:text-white"
            >
              <Edit size={14} className="shrink-0" />
              <span className="truncate">{t('view_product')}</span>
            </Link>
            
            <div className="flex flex-col items-center justify-center shrink-0 pr-1">
              <span className="text-[8px] font-black uppercase text-slate-400 mb-1.5 tracking-widest">Visível</span>
              <IOSToggle
                value={product.is_active}
                onChange={() => onToggle()}
                disabled={togglePending}
              />
            </div>
          </div>

          <button
            onClick={onDelete}
            className="inline-flex h-10 w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 text-[11px] font-black uppercase tracking-[0.08em] text-red-600 transition hover:bg-red-50 shrink-0"
          >
            <Trash2 size={14} className="shrink-0" />
            <span className="truncate">{t('btn_delete')}</span>
          </button>
        </div>

      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';