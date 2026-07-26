import { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, Search, Package, X, Boxes, LayoutGrid, Table, PauseCircle } from 'lucide-react';

import { useTranslate } from '../context/LanguageContext';
import { useProductsLogic } from '../components/produtos/componentsAdmim/useProductsLogic';
import type { CurrencyOption, Product } from '../types/productsListTypes';

import { SectionHeader } from '../components/produtos/componentsAdmim/SectionHeader';
import { ProductCard } from '../components/produtos/componentsAdmim/ProductCard';
import { ProductTable } from '../components/produtos/componentsAdmim/ProductTable';
import { StatCard } from '../components/produtos/componentsAdmim/StatCard';
import { ConfirmDeleteModal } from '../components/produtos/componentsAdmim/ConfirmDeleteModal';
import { ProductDetails } from './ProdutcsDetails';

// Otimização do Seletor de Moedas
const CurrencyOptionLabel = memo(({ option }: { option: CurrencyOption }) => (
  <div className="flex items-center gap-2 min-w-0">
    <span className="text-sm leading-none shrink-0">{option.flag}</span>
    <span className="truncate font-semibold text-[12px] text-slate-900">{option.label}</span>
  </div>
));
CurrencyOptionLabel.displayName = 'CurrencyOptionLabel';

export function ProductsList() {
  const { t, language } = useTranslate();
  const navigate = useNavigate();
  
  // Consumir a lógica separada (O cérebro do componente)
  const { state, actions, status } = useProductsLogic(language, t);
  const { store, isLoadingStore, isAdding, searchTerm, selectedCurrency, layoutMode, isMobile, filteredProducts, deleteTarget } = state;

  // 💡 A MÁGICA DA PERFORMANCE: Navegação passando o estado completo da API
  const handleEditProduct = useCallback((product: Product) => {
    if (!store?.slug) return;
    
    // Passamos o 'product' inteiro com todos os campos da API para a memória
    navigate(`/admin/${store.slug}/products/${product.id}`, {
      state: { 
        product, 
        store, 
        source: 'admin_list' 
      }
    });
  }, [navigate, store]);

  if (isLoadingStore || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const backendCurrency = store.currency?.trim()?.toUpperCase() || '';
  const storeCurrency = store.currency || selectedCurrency || 'USD';
  
  const activeProducts = filteredProducts.filter(p => p.is_active);
  const pausedProducts = filteredProducts.filter(p => !p.is_active);

  const addButton = (
    <button 
      onClick={() => actions.setIsAdding(true)} 
      className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 text-[11px] font-black uppercase tracking-[0.1em] text-white transition hover:bg-blue-700"
    >
      <Plus size={14} />{t('btn_new_product')}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-700 antialiased">
      <main className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-4 md:px-6 md:py-6 xl:px-8">
        <div className="space-y-3 md:space-y-4">
          
          <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm md:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <Package size={17} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-blue-600">{store.name}</p>
                  <h1 className="text-base font-black text-slate-900">{t('inventory_title')}</h1>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {!isMobile && (
                  <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button onClick={() => actions.setLayoutMode('table')} className={`p-2 rounded-lg ${layoutMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><Table size={15} /></button>
                    <button onClick={() => actions.setLayoutMode('grid')} className={`p-2 rounded-lg ${layoutMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={15} /></button>
                  </div>
                )}
                {addButton}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm md:p-4 flex gap-3 flex-col sm:flex-row">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={15} />
              <input 
                type="text" 
                placeholder={t('placeholder_search')} 
                value={searchTerm} 
                onChange={(e) => actions.setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </div>
          </section>

          {activeProducts.length > 0 && (
            <>
              <SectionHeader icon={<Boxes size={17} />} title={t('active_products_title')} count={activeProducts.length} action={addButton} />
              
              {layoutMode === 'table' ? (
                <ProductTable 
                  products={activeProducts} storeCurrency={storeCurrency} togglePending={status.isToggling}
                  onClick={handleEditProduct}
                  onToggle={actions.toggleProduct} onDelete={actions.setDeleteTarget} t={t} 
                />
              ) : (
                <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {activeProducts.map(p => (
                    <ProductCard 
                      key={p.id} product={p} storeCurrency={storeCurrency} togglePending={status.isToggling}
                      onClick={() => handleEditProduct(p)}
                      onToggle={() => actions.toggleProduct(p)} onDelete={() => actions.setDeleteTarget(p)} t={t} 
                    />
                  ))}
                </section>
              )}
            </>
          )}

          {pausedProducts.length > 0 && (
            <div className="opacity-80">
              <SectionHeader icon={<PauseCircle size={17} />} title={t('paused_products_title')} count={pausedProducts.length} action={addButton} />
              
              {layoutMode === 'table' ? (
                <ProductTable 
                  products={pausedProducts} storeCurrency={storeCurrency} togglePending={status.isToggling}
                  onClick={handleEditProduct}
                  onToggle={actions.toggleProduct} onDelete={actions.setDeleteTarget} t={t} 
                />
              ) : (
                <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {pausedProducts.map(p => (
                    <ProductCard 
                      key={p.id} product={p} storeCurrency={storeCurrency} togglePending={status.isToggling}
                      onClick={() => handleEditProduct(p)}
                      onToggle={() => actions.toggleProduct(p)} onDelete={() => actions.setDeleteTarget(p)} t={t} 
                    />
                  ))}
                </section>
              )}
            </div>
          )}

          <section className="grid grid-cols-2 gap-2 md:gap-3 lg:grid-cols-4 mt-6">
            <StatCard label={t('stat_total')} value={state.products.length} />
            <StatCard label={t('status_active')} value={activeProducts.length} />
            <StatCard label={t('status_paused')} value={pausedProducts.length} />
            <StatCard label={t('currency')} value={backendCurrency || '—'} />
          </section>

        </div>
      </main>

      {isAdding && (
        <div className="fixed inset-0 bg-white z-[150] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-4 h-14 flex items-center justify-between z-10">
            <div className="flex items-center gap-2"><Plus size={15} className="text-blue-600" strokeWidth={3} /><span className="font-black uppercase text-[11px]">{t('new_product')}</span></div>
            <button onClick={() => actions.setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all"><X size={18} className="text-slate-400" /></button>
          </div>
          <ProductDetails isCreating={true} onClose={() => actions.setIsAdding(false)} />
        </div>
      )}

      <ConfirmDeleteModal
        open={!!deleteTarget} loading={status.isDeleting} productName={deleteTarget?.name || ''}
        onClose={() => actions.setDeleteTarget(null)} onConfirm={() => deleteTarget?.id && actions.deleteProduct(deleteTarget.id)} t={t}
      />
    </div>
  );
}