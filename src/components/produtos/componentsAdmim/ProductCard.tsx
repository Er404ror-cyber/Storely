import { memo, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Edit, Trash2, AlertTriangle, Wrench } from 'lucide-react';
import type { TranslateFn } from '../../../types/TextTypes';
import { IOSToggle } from './ProductTable';
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

interface ProductCardProps {
  product: Product;
  store: any;
  storeCurrency: string;
  onToggle: () => void;
  onDelete: () => void;
  togglePending: boolean;
  isBroken?: boolean;
  onImageError?: (productId: string) => void;
  t: TranslateFn;
}

const FALLBACK_IMAGE = FALLBACK_PRODUCT;


export const ProductCard = memo(({
  product,
  store,
  storeCurrency,
  onToggle,
  onDelete,
  togglePending,
  isBroken = false,
  onImageError,
  t,
}: ProductCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  const { hasDiscount, discount, formattedOriginalPrice, formattedFinalPrice } = useMemo(() => {
    const rawPrice = Number(product.price) || 0;
    const disc = Number(product.discount_percent) || 0;
    const activeDiscount = disc > 0;
    const finalPrice = activeDiscount ? rawPrice - (rawPrice * (disc / 100)) : rawPrice;

    return {
      hasDiscount: activeDiscount,
      discount: disc,
      formattedOriginalPrice: rawPrice.toLocaleString(),
      formattedFinalPrice: finalPrice.toLocaleString(),
    };
  }, [product.price, product.discount_percent]);

  const handleImgLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImgError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageLoaded(true);
    setHasFailed(true);
    if (onImageError) {
      onImageError(product.id);
    }
    if (e.currentTarget.src !== FALLBACK_IMAGE) {
      e.currentTarget.src = FALLBACK_IMAGE;
    }
  }, [onImageError, product.id]);

  const isImageInaccessible = isBroken || hasFailed;
  const linkPath = `/admin/produtos/${product.id}`;
  const navigationState = useMemo(() => ({ product, store, source: 'admin_list' }), [product, store]);

  return (
    <div 
      style={{ 
        contentVisibility: 'auto', 
        containIntrinsicSize: '300px 420px',
        contain: 'layout style paint',
      }}
      className={`group flex flex-col h-full w-full min-w-0 rounded-2xl border bg-white shadow-xs transition-colors duration-150 overflow-hidden ${
        isImageInaccessible 
          ? 'border-amber-300 ring-1 ring-amber-400/60' 
          : 'border-slate-200/80 hover:border-slate-300'
      }`}
    >
      {/* 1. Foto do Produto */}
      <Link 
        to={linkPath} 
        state={navigationState} 
        className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-slate-100 border-b border-slate-100 focus:outline-none"
      >
        <img
          src={product.main_image || FALLBACK_IMAGE}
          alt={product.name}
          width={320}
          height={240}
          loading="lazy"
          decoding="async"
          onLoad={handleImgLoad}
          onError={handleImgError}
          className={`h-full w-full object-cover transition-opacity duration-150 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {isImageInaccessible && (
          <span className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-md bg-amber-500/95 backdrop-blur-xs px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs select-none pointer-events-none">
            <AlertTriangle size={11} strokeWidth={2.5} />
            {t('image_error', { defaultValue: 'Erro Imagem' })}
          </span>
        )}

        {hasDiscount && (
          <span className="absolute top-2.5 left-2.5 rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs select-none pointer-events-none">
            -{discount}%
          </span>
        )}
      </Link>

      {/* 2. Informações */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 min-h-[20px]">
          {product.category ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 truncate">
              <Tag size={11} className="text-slate-400 shrink-0" />
              <span className="truncate">{product.category}</span>
            </span>
          ) : (
            <span className="text-[11px] font-medium text-slate-300">—</span>
          )}

          <span
            className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
              product.is_active 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' 
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {product.is_active 
              ? t('status_active', { defaultValue: 'Ativo' }) 
              : t('status_paused', { defaultValue: 'Pausado' })}
          </span>
        </div>

        <h3 
          className="mt-1 font-bold text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors duration-150"
          title={product.name}
        >
          {product.name}
        </h3>

        <div className="mt-2 min-h-[38px] flex flex-col justify-center">
          {hasDiscount ? (
            <div className="flex flex-col">
              <span 
                className="text-[11px] font-medium text-slate-400 line-through leading-none"
                title={`${storeCurrency} ${formattedOriginalPrice}`}
              >
                {storeCurrency} {formattedOriginalPrice}
              </span>
              <span className="text-base font-black text-slate-900 tracking-tight truncate mt-0.5">
                {storeCurrency} {formattedFinalPrice}
              </span>
            </div>
          ) : (
            <span className="text-base font-black text-slate-900 tracking-tight truncate">
              {storeCurrency} {formattedOriginalPrice}
            </span>
          )}
        </div>

        {/* 3. Rodapé de Ações */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <Link
              to={linkPath}
              state={navigationState}
              className={`inline-flex h-8 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl px-3 text-[11px] font-bold uppercase tracking-wider text-white active:scale-[0.98] transition-all duration-100 shadow-xs ${
                isImageInaccessible 
                  ? 'bg-amber-500 hover:bg-amber-600' 
                  : 'bg-slate-900 hover:bg-blue-600'
              }`}
            >
              {isImageInaccessible ? (
                <>
                  <Wrench size={12} className="shrink-0" />
                  <span className="truncate">{t('fix_photo', { defaultValue: 'Corrigir Foto' })}</span>
                </>
              ) : (
                <>
                  <Edit size={12} className="shrink-0" />
                  <span className="truncate">{t('view_product', { defaultValue: t('edit', { defaultValue: 'Editar' }) })}</span>
                </>
              )}
            </Link>
            
            <div className="flex items-center gap-1.5 shrink-0 pl-1">
              <span className="text-[9px] font-black uppercase text-slate-400 hidden sm:inline tracking-wider">
                {product.is_active 
                  ? t('status_active', { defaultValue: 'Ativo' }) 
                  : t('status_paused', { defaultValue: 'Pausado' })}
              </span>
              <IOSToggle
                value={product.is_active}
                onChange={onToggle}
                disabled={togglePending}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 active:scale-[0.98] transition-all duration-100"
          >
            <Trash2 size={12} className="shrink-0" />
            <span className="truncate">
              {t('btn_delete', { defaultValue: t('delete', { defaultValue: 'Eliminar' }) })}
            </span>
          </button>
        </div>

      </div>
    </div>
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
    prev.store === next.store &&
    prev.storeCurrency === next.storeCurrency &&
    prev.togglePending === next.togglePending &&
    prev.isBroken === next.isBroken &&
    prev.t === next.t
  );
});

ProductCard.displayName = 'ProductCard';