import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Power, Trash2, Tag, Coins } from 'lucide-react';
import type { TranslateFn } from '../../../dashboard/Products';

interface Product {
  id: string;
  name: string;
  category?: string | null;
  price: number;
  is_active: boolean;
  main_image: string;
}

interface ProductTableProps {
  products: Product[];
  storeCurrency: string;
  onToggle: (product: Product) => void;
  onDelete: (product: Product) => void;
  togglePending: boolean;
  t: TranslateFn;
}

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
            <th className="px-6 py-4">{t('price') || 'Price'}</th>
            <th className="px-6 py-4">{t('status') || 'Status'}</th>
            <th className="px-6 py-4 text-right">{t('actions') || 'Actions'}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
              <td className="px-6 py-3 font-medium text-slate-900 max-w-[280px]">
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
                  <Link 
                    to={`/admin/produtos/${product.id}`} 
                    state={{ fromStore: true }} 
                    className="hover:text-blue-600 font-bold truncate transition-colors"
                  >
                    {product.name}
                  </Link>
                </div>
              </td>
              <td className="px-6 py-3">
                {product.category ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    <Tag size={10} className="text-blue-500 shrink-0" />
                    {product.category}
                  </span>
                ) : '—'}
              </td>
              <td className="px-6 py-3 font-semibold text-slate-800">
                <span className="inline-flex items-center gap-1">
                  <Coins size={11} className="text-emerald-600 shrink-0" />
                  {storeCurrency} {Number(product.price || 0).toLocaleString()}
                </span>
              </td>
              <td className="px-6 py-3">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.08em] ${
                  product.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {product.is_active ? t('status_active') : t('status_paused')}
                </span>
              </td>
              <td className="px-6 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onToggle(product)}
                    disabled={togglePending}
                    className={`p-2 rounded-xl border transition-all disabled:opacity-50 ${
                      product.is_active 
                        ? 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100' 
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <Power size={14} />
                  </button>
                  <Link
                    to={`/admin/produtos/${product.id}`}
                    state={{ fromStore: true }}
                    className="p-2 rounded-xl border border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                  >
                    <Edit size={14} />
                  </Link>
                  <button
                    onClick={() => onDelete(product)}
                    className="p-2 rounded-xl border border-red-100 bg-white text-red-600 hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

ProductTable.displayName = 'ProductTable';