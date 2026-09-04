import { memo, useState, useEffect, useMemo, useCallback, type MouseEvent, type SyntheticEvent } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Tag, Coins, AlertTriangle, Wrench } from 'lucide-react';
import type { TranslateFn } from '../../../types/TextTypes';
import { FALLBACK_PRODUCT } from '../../../utils/constants';

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

interface ProductTableProps {
  products: Product[];
  store: any;
  storeCurrency: string;
  brokenProductIds?: Set<string>;
  onImageError?: (productId: string) => void;
  onToggle: (product: Product) => void;
  onDelete: (product: Product) => void;
  togglePending: boolean;
  t: TranslateFn;
  onClick?: (product: Product) => void;
}

const FALLBACK_IMAGE = FALLBACK_PRODUCT;

export const IOSToggle = memo(({ 
  value, 
  onChange, 
  disabled 
}: { 
  value: boolean; 
  onChange: () => void; 
  disabled: boolean; 
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!pending) setLocalValue(value);
  }, [value, pending]);

  useEffect(() => {
    if (pending && localValue === value) {
      setPending(false);
    }
  }, [value, pending, localValue]);

  const handleClick = useCallback((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (pending || disabled) return;
    setPending(true);
    setLocalValue((prev) => !prev);
    onChange();
  }, [disabled, onChange, pending]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={localValue}
      onClick={handleClick}
      disabled={disabled || pending}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-150 ${
        localValue ? 'bg-emerald-500' : 'bg-slate-300'
      } ${disabled || pending ? 'cursor-not-allowed opacity-60' : ''}`}
    >
      <span
        className={`pointer-events-none flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow-xs transition-transform duration-150 will-change-transform ${
          localValue ? 'translate-x-5' : 'translate-x-0'
        }`}
      >
        {pending && (
          <span className="h-2 w-2 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
        )}
      </span>
    </button>
  );
});

IOSToggle.displayName = 'IOSToggle';

interface ProductRowProps {
  product: Product;
  store: any;
  storeCurrency: string;
  isBroken: boolean;
  onImageError?: (productId: string) => void;
  onToggle: (product: Product) => void;
  onDelete: (product: Product) => void;
  togglePending: boolean;
  t: TranslateFn;
}

const ProductRow = memo(({
  product,
  store,
  storeCurrency,
  isBroken,
  onImageError,
  onToggle,
  onDelete,
  togglePending,
  t,
}: ProductRowProps) => {
  const { discount, hasDiscount, formattedFinalPrice, formattedOriginalPrice } = useMemo(() => {
    const rawPrice = Number(product.price) || 0;
    const disc = Number(product.discount_percent) || 0;
    const active = disc > 0;
    const final = active ? rawPrice - (rawPrice * (disc / 100)) : rawPrice;

    return {
      discount: disc,
      hasDiscount: active,
      formattedFinalPrice: final.toLocaleString(),
      formattedOriginalPrice: rawPrice.toLocaleString(),
    };
  }, [product.price, product.discount_percent]);

  const handleImageError = useCallback((e: SyntheticEvent<HTMLImageElement>) => {
    if (onImageError) {
      onImageError(product.id);
    }
    if (e.currentTarget.src !== FALLBACK_IMAGE) {
      e.currentTarget.src = FALLBACK_IMAGE;
    }
  }, [onImageError, product.id]);

  // Estado unificado e leve em memória para todas as rotas filhas
  const navigationState = useMemo(() => ({
    product,
    store,
    source: 'admin_list'
  }), [product, store]);

  return (
    <tr 
      style={{ contain: 'paint layout' }}
      className={`group relative border-b transition-colors ${
        isBroken 
          ? 'bg-amber-50/40 border-b-amber-200/80 border-l-4 border-l-amber-500 hover:bg-amber-50/70' 
          : 'border-b-slate-100 hover:bg-slate-50/80'
      }`}
    >
      {/* Coluna 1: Imagem + Nome + Link Principal */}
      <td className="px-6 py-3 font-medium text-slate-900 max-w-[240px] sm:max-w-[320px]">
        <Link
          to={`/admin/produtos/${product.id}`}
          state={navigationState}
          className="absolute inset-0 z-0"
          aria-label={product.name}
        />
        <div className="relative z-10 flex items-center gap-3 min-w-0 pointer-events-none">
          <div className="relative h-10 w-10 shrink-0">
            <img
              src={product.main_image || FALLBACK_IMAGE}
              alt={product.name}
              width={40}
              height={40}
              loading="lazy"
              decoding="async"
              onError={handleImageError}
              className={`h-10 w-10 shrink-0 rounded-xl border object-cover bg-slate-50 transition-colors ${
                isBroken ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-slate-200'
              }`}
            />
            {isBroken && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs">
                <AlertTriangle size={9} strokeWidth={3} />
              </span>
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <span 
              className={`truncate font-bold transition-colors ${
                isBroken ? 'text-amber-950 group-hover:text-amber-700' : 'text-slate-900 group-hover:text-blue-600'
              }`}
              title={product.name}
            >
              {product.name}
            </span>

            {isBroken && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 mt-0.5">
                <AlertTriangle size={10} className="shrink-0" />
                {t('broken_photo_warning', { defaultValue: 'Foto com erro' })}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Coluna 2: Categoria */}
      <td className="px-6 py-3 relative z-10 pointer-events-none max-w-[140px]">
        {product.category ? (
          <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
            <Tag size={10} className="text-blue-500 shrink-0" />
            <span className="truncate" title={product.category}>{product.category}</span>
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>

      {/* Coluna 3: Preço */}
      <td className="px-6 py-3 relative z-10 pointer-events-none max-w-[160px]">
        {hasDiscount ? (
          <div className="flex flex-col justify-center min-w-0">
            <span className="flex items-center gap-1 font-bold text-blue-600 min-w-0">
              <Coins size={11} className="text-blue-500 shrink-0" />
              <span className="truncate" title={`${storeCurrency} ${formattedFinalPrice}`}>
                {storeCurrency} {formattedFinalPrice}
              </span>
              <span className="ml-1 shrink-0 rounded bg-rose-100 px-1 py-0.2 text-[9px] font-bold text-rose-600">
                -{discount}%
              </span>
            </span>
            <span 
              className="pl-3.5 text-[10px] font-semibold text-slate-400 line-through truncate"
              title={`${storeCurrency} ${formattedOriginalPrice}`}
            >
              {storeCurrency} {formattedOriginalPrice}
            </span>
          </div>
        ) : (
          <span className="flex items-center gap-1 font-semibold text-slate-800 min-w-0">
            <Coins size={11} className="text-emerald-600 shrink-0" />
            <span className="truncate" title={`${storeCurrency} ${formattedOriginalPrice}`}>
              {storeCurrency} {formattedOriginalPrice}
            </span>
          </span>
        )}
      </td>

      {/* Coluna 4: Status */}
      <td className="px-6 py-3 relative z-10 pointer-events-none w-32">
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
          product.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
        }`}>
          {product.is_active 
            ? t('status_active', { defaultValue: 'Ativo' }) 
            : t('status_paused', { defaultValue: 'Pausado' })}
        </span>
      </td>

      {/* Coluna 5: Ações */}
      <td className="px-6 py-3 text-right relative z-10 min-w-[150px]">
        <div className="flex items-center justify-end gap-2 pointer-events-auto">
          {isBroken && (
            <Link
              to={`/admin/produtos/${product.id}`}
              state={navigationState}
              className="inline-flex items-center gap-1 rounded-lg bg-amber-500 hover:bg-amber-600 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-xs transition-colors shrink-0"
              title={t('fix_now', { defaultValue: 'Corrigir foto' })}
            >
              <Wrench size={11} />
              <span className="hidden xl:inline">{t('fix_now', { defaultValue: 'Corrigir' })}</span>
            </Link>
          )}

          <IOSToggle
            value={product.is_active}
            onChange={() => onToggle(product)}
            disabled={togglePending}
          />

          <Link
            to={`/admin/produtos/${product.id}`}
            state={navigationState}
            aria-label={t('edit', { defaultValue: 'Editar' })}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-colors shrink-0"
          >
            <Edit size={14} />
          </Link>

          <button
            type="button"
            aria-label={t('btn_delete', { defaultValue: 'Excluir' })}
            onClick={() => onDelete(product)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 transition-colors shrink-0"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}, (prev, next) => {
  return (
    prev.product.id === next.product.id &&
    prev.product.is_active === next.product.is_active &&
    prev.product.price === next.product.price &&
    prev.product.discount_percent === next.product.discount_percent &&
    prev.product.name === next.product.name &&
    prev.product.main_image === next.product.main_image &&
    prev.product.category === next.product.category &&
    prev.isBroken === next.isBroken &&
    prev.storeCurrency === next.storeCurrency &&
    prev.togglePending === next.togglePending &&
    prev.store === next.store &&
    prev.t === next.t
  );
});

ProductRow.displayName = 'ProductRow';

export const ProductTable = memo(({
  products,
  store,
  storeCurrency,
  brokenProductIds,
  onImageError,
  onToggle,
  onDelete,
  togglePending,
  t,
}: ProductTableProps) => {
  return (
    <div 
      style={{ contentVisibility: 'auto' }}
      className="w-full overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-xs"
    >
      <table className="w-full border-collapse text-left text-sm text-slate-500 whitespace-nowrap">
        <thead className="bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200/80">
          <tr>
            <th scope="col" className="px-6 py-3.5">{t('product', { defaultValue: 'Produto' })}</th>
            <th scope="col" className="px-6 py-3.5">{t('category', { defaultValue: 'Categoria' })}</th>
            <th scope="col" className="px-6 py-3.5 max-w-[150px]">{t('price', { defaultValue: 'Preço' })}</th>
            <th scope="col" className="px-6 py-3.5">{t('status', { defaultValue: 'Estado' })}</th>
            <th scope="col" className="px-6 py-3.5 text-right">{t('actions', { defaultValue: 'Ações' })}</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100/50">
          {products.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              store={store}
              storeCurrency={storeCurrency}
              isBroken={Boolean(brokenProductIds?.has(product.id))}
              onImageError={onImageError}
              onToggle={onToggle}
              onDelete={onDelete}
              togglePending={togglePending}
              t={t}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
});

ProductTable.displayName = 'ProductTable';