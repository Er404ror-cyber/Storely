import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Coins, Power, Edit, Trash2 } from 'lucide-react';
import type { TranslateFn } from '../../../dashboard/Products';
import { IOSToggle } from './ProductTable';

interface Product {
  id: string;
  name: string;
  category?: string | null;
  price: number;
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
}

const ProductImage = memo(({ src, alt }: { src: string; alt: string }) => (
  <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
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
  return (
    <div
      style={{ contentVisibility: 'auto', containIntrinsicSize: '340px' }}
      className="min-w-0 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm"
    >
      <Link to={`/admin/produtos/${product.id}`} state={{ fromStore: true }}>
        <ProductImage src={product.main_image} alt={product.name} />
      </Link>
      <div className="mt-3 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="min-w-0 flex-1 truncate text-sm font-black text-slate-900">
            {product.name}
          </h3>

          <span
            className={`inline-flex shrink-0 items-center rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${
              product.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {product.is_active ? t('status_active') : t('status_paused')}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {product.category ? (
            <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              <Tag size={11} className="shrink-0 text-blue-500" />
              <span className="truncate">{product.category}</span>
            </span>
          ) : null}

          <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-800">
            <Coins size={11} className="shrink-0 text-emerald-600" />
            <span className="truncate">
              {storeCurrency} {Number(product.price || 0).toLocaleString()}
            </span>
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
         <IOSToggle
                            value={product.is_active}
                            onChange={() => onToggle(product)}
                            disabled={togglePending}
                          />

        <Link
          to={`/admin/produtos/${product.id}`}
          state={{ fromStore: true }}
          className="inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-xl bg-blue-50 px-3 text-[11px] font-black uppercase tracking-[0.08em] text-blue-700 transition hover:bg-blue-600 hover:text-white"
        >
          <Edit size={13} className="shrink-0" />
          <span className="truncate">{t('view_product')}</span>
        </Link>
      </div>

      <button
        onClick={onDelete}
        className="mt-2 inline-flex h-10 w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 text-[11px] font-black uppercase tracking-[0.08em] text-red-600 transition hover:bg-red-50"
      >
        <Trash2 size={13} className="shrink-0" />
        <span className="truncate">{t('btn_delete')}</span>
      </button>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';