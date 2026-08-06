import { memo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Tag, Coins } from 'lucide-react';
import type { TranslateFn } from '../../../types/TextTypes';

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
  storeCurrency: string;
  onToggle: (product: Product) => void;
  onDelete: (product: Product) => void;
  togglePending: boolean;
  t: TranslateFn;
  onClick?: (product: Product) => void;
}

export const IOSToggle = ({ value, onChange, disabled }: { value: boolean; onChange: () => void; disabled: boolean }) => {
  const [localValue, setLocalValue] = useState(value);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!pending) {
      setLocalValue(value);
    }
  }, [value, pending]);

  useEffect(() => {
    if (pending && localValue === value) {
      setPending(false);
    }
  }, [value, pending, localValue]);

  const handleClick = async () => {
    if (pending || disabled) return;
    setPending(true);
    setLocalValue((prev) => !prev);
    onChange();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || pending}
      style={{
        width: 51,
        height: 31,
        borderRadius: 999,
        backgroundColor: localValue ? '#34C759' : '#E5E7EB',
        border: 'none',
        cursor: pending || disabled ? 'not-allowed' : 'pointer',
        padding: 2,
        display: 'flex',
        alignItems: 'center',
        transition: 'background-color 0.3s ease',
        opacity: pending ? 0.7 : 1,
        flexShrink: 0,
        position: 'relative',
      }}
    >
      <span
        style={{
          width: 27,
          height: 27,
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          transform: localValue ? 'translateX(20px)' : 'translateX(0px)',
          transition: 'transform 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {pending && (
          <svg
            style={{ animation: 'spin 0.8s linear infinite' }}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
          >
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            <circle cx="12" cy="12" r="10" stroke="#9CA3AF" strokeWidth="3" strokeDasharray="31" strokeDashoffset="10" strokeLinecap="round"/>
          </svg>
        )}
      </span>
    </button>
  );
};

export const ProductTable = memo(({
  products,
  storeCurrency,
  onToggle,
  onDelete,
  togglePending,
  t,
}: ProductTableProps) => {

  return (
    <div 
      style={{ contentVisibility: 'auto', containIntrinsicSize: '400px' }}
      className="w-full overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm"
    >
      <table className="w-full border-collapse text-left text-sm text-slate-500 whitespace-nowrap">
        <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4">{t('product')}</th>
            <th className="px-6 py-4">{t('category') || 'Category'}</th>
            <th className="px-6 py-4 max-w-[150px]">{t('price') || 'Price'}</th>
            <th className="px-6 py-4">{t('status') || 'Status'}</th>
            <th className="px-6 py-4 text-right">{t('actions') || 'Actions'}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {products.map((product) => {
            const discount = product.discount_percent || 0;
            const hasDiscount = discount > 0;
            const finalPrice = hasDiscount
              ? product.price - (product.price * (discount / 100))
              : product.price;

            return (
              <tr key={product.id} className="hover:bg-slate-50/70 transition-colors relative group">           
                <td className="px-6 py-3 font-medium text-slate-900 max-w-[200px] sm:max-w-[280px]">
                  <Link
                    to={`/admin/produtos/${product.id}`}
                    state={{ fromStore: true }}
                    className="absolute inset-0 z-0"
                    aria-label={product.name}
                  />
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={product.main_image}
                      alt={product.name}
                      className="h-10 w-10 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-50"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = 'https://antoniogaspar.pt/wp-content/uploads/2023/06/ag-blog-featured-img.svg';
                      }}
                    />
                    <span 
                      className="group-hover:text-blue-600 font-bold truncate transition-colors relative z-10"
                      title={product.name}
                    >
                      {product.name}
                    </span>
                  </div>
                </td>
                <td
                  className="px-6 py-3 text-right relative z-10 max-w-[150px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {product.category ? (
                    <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                      <Tag size={10} className="text-blue-500 shrink-0" />
                      <span className="truncate" title={product.category}>{product.category}</span>
                    </span>
                  ) : '—'}
                </td>
                <td className="px-6 py-3 relative z-10 max-w-[160px]">
                  {/* Célula de Preço Protegida Contra Overflow */}
                  {hasDiscount ? (
                    <div className="flex flex-col justify-center min-w-0">
                      <span className="flex items-center gap-1 font-black text-blue-600 min-w-0">
                        <Coins size={11} className="text-blue-500 shrink-0" />
                        <span className="truncate" title={`${storeCurrency} ${Number(finalPrice).toLocaleString()}`}>
                          {storeCurrency} {Number(finalPrice).toLocaleString()}
                        </span>
                        <span className="ml-1 shrink-0 rounded-md bg-rose-100 px-1.5 py-0.5 text-[9px] font-black text-rose-600">
                          -{discount}%
                        </span>
                      </span>
                      <span 
                        className="text-[10px] font-bold text-slate-400 line-through pl-[16px] truncate"
                        title={`${storeCurrency} ${Number(product.price).toLocaleString()}`}
                      >
                        {storeCurrency} {Number(product.price).toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <span className="flex items-center gap-1 font-semibold text-slate-800 min-w-0">
                      <Coins size={11} className="text-emerald-600 shrink-0" />
                      <span className="truncate" title={`${storeCurrency} ${Number(product.price).toLocaleString()}`}>
                        {storeCurrency} {Number(product.price || 0).toLocaleString()}
                      </span>
                    </span>
                  )}
                </td>
                <td className="px-6 py-3 relative z-10 w-32">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.08em] ${
                    product.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {product.is_active ? t('status_active') : t('status_paused')}
                  </span>
                </td>
                <td className="px-6 py-3 text-right relative z-10 min-w-[120px]">
                  <div className="flex items-center justify-end gap-2">
                    <IOSToggle
                      value={product.is_active}
                      onChange={() => onToggle(product)}
                      disabled={togglePending}
                    />
                    <Link
                      to={`/admin/produtos/${product.id}`}
                      state={{ fromStore: true }}
                      className="p-2 rounded-xl border border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shrink-0"
                    >
                      <Edit size={14} />
                    </Link>
                    <button
                      onClick={() => onDelete(product)}
                      className="p-2 rounded-xl border border-red-100 bg-white text-red-600 hover:bg-red-50 transition-all shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

ProductTable.displayName = 'ProductTable';