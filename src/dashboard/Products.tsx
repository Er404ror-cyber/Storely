import { useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, Search, Package, X, Boxes, PauseCircle, LayoutGrid, Table, Inbox } from 'lucide-react';

import { useTranslate } from '../context/LanguageContext';
import { useProductsLogic } from '../components/produtos/componentsAdmim/useProductsLogic';
import { useCurrencyLogic } from '../components/produtos/componentsAdmim/useCurrencyLogic';
import type { Product } from '../types/productsListTypes';

// Componentes da Interface
import { CurrencySection } from '../components/produtos/componentsAdmim/CurrencySection';
import { ProgressGuide } from '../components/produtos/componentsAdmim/ProgressGuide';
import { SectionHeader } from '../components/produtos/componentsAdmim/SectionHeader';
import { ProductCard } from '../components/produtos/componentsAdmim/ProductCard';
import { ProductTable } from '../components/produtos/componentsAdmim/ProductTable';
import { StatCard } from '../components/produtos/componentsAdmim/StatCard';
import { ConfirmDeleteModal } from '../components/produtos/componentsAdmim/ConfirmDeleteModal';
import { ProductDetails } from './ProdutcsDetails';

// OTIMIZAÇÃO: Componente de Loading leve
const LoadingState = memo(({ t }: { t: any }) => (
  <div className="flex flex-col items-center justify-center py-20 opacity-70">
    <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
    <p className="text-sm font-semibold text-slate-500">{t('loading_products') || 'Carregando produtos...'}</p>
  </div>
));
LoadingState.displayName = 'LoadingState';

// OTIMIZAÇÃO: Componente de "Vazio" direto no ficheiro (ou podes usar o teu importado)
const EmptyProducts = memo(({ onAdd, t }: { onAdd: () => void, t: any }) => (
  <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 border-dashed bg-white py-16 px-6 text-center shadow-sm">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4">
      <Inbox size={28} />
    </div>
    <h3 className="text-lg font-black text-slate-900 mb-2">{t('empty_products_title') || 'Nenhum produto encontrado'}</h3>
    <p className="text-sm text-slate-500 max-w-md mb-6">
      {t('empty_products_desc') || 'Comece a construir o seu catálogo adicionando o seu primeiro produto à loja.'}
    </p>
    <button 
      onClick={onAdd}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-[12px] font-black uppercase tracking-[0.1em] text-white transition hover:bg-blue-700 shadow-md shadow-blue-500/20"
    >
      <Plus size={16} />{t('btn_new_product')}
    </button>
  </div>
));
EmptyProducts.displayName = 'EmptyProducts';

export function ProductsList() {
  const { t, language } = useTranslate();
  const navigate = useNavigate();
  
  // 1. Cérebro dos Produtos
  const { state, actions, status } = useProductsLogic(language, t);
  const { store, isLoadingStore, isAdding, searchTerm, layoutMode, isMobile, filteredProducts, deleteTarget, products } = state;

  // 2. Cérebro da Moeda
  const currency = useCurrencyLogic(store, language, t, products.length > 0);

  // =======================================================================
  // OTIMIZAÇÃO DE CPU: Callbacks fixos para evitar Garbage Collection
  // =======================================================================
  const handleAddProductClick = useCallback(() => actions.setIsAdding(true), [actions]);
  const handleCloseAddProduct = useCallback(() => actions.setIsAdding(false), [actions]);
  const handleSetTableMode = useCallback(() => actions.setLayoutMode('table'), [actions]);
  const handleSetGridMode = useCallback(() => actions.setLayoutMode('grid'), [actions]);
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => actions.setSearchTerm(e.target.value), [actions]);
  const handleCloseDelete = useCallback(() => actions.setDeleteTarget(null), [actions]);
  const handleConfirmDelete = useCallback(() => {
    if (deleteTarget?.id) actions.deleteProduct(deleteTarget.id);
  }, [deleteTarget, actions]);

  const handleEditProduct = useCallback((product: Product) => {
    if (!store?.slug) return;
    navigate(`/admin/${store.slug}/products/${product.id}`, {
      state: { product, store, source: 'admin_list' }
    });
  }, [navigate, store]);

  // Loading principal da loja
  if (isLoadingStore || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  // Cálculos de estado visual
  const hasProducts = products.length > 0;
  const isLoadingProducts = state.isLoadingProducts;
    const activeProducts = filteredProducts.filter(p => p.is_active);
  const pausedProducts = filteredProducts.filter(p => !p.is_active);

  // Botão reutilizável memoizado via variável
  const addButton = (
    <button 
      onClick={handleAddProductClick} 
      className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 text-[11px] font-black uppercase tracking-[0.1em] text-white transition hover:bg-blue-700 shadow-sm"
    >
      <Plus size={14} />{t('btn_new_product')}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-700 antialiased">
      <main className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-4 md:px-6 md:py-6 xl:px-8">
        <div className="space-y-3 md:space-y-4">
          
          {/* HEADER PRINCIPAL */}
          <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm md:p-4 contain-layout">
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
                {!isMobile && hasProducts && (
                  <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button onClick={handleSetTableMode} className={`p-2 rounded-lg transition-colors ${layoutMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} aria-label="Modo Tabela"><Table size={15} /></button>
                    <button onClick={handleSetGridMode} className={`p-2 rounded-lg transition-colors ${layoutMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} aria-label="Modo Grid"><LayoutGrid size={15} /></button>
                  </div>
                )}
                {hasProducts && addButton}
              </div>
            </div>
          </section>

          {/* SECÇÃO DE MOEDA */}
          <CurrencySection {...currency.currencyProps} t={t} />

          {!currency.hasCompletedGuide && (
            <ProgressGuide hasCurrency={!!currency.backendCurrency} hasProducts={hasProducts} t={t} />
          )}

          {/* OTIMIZAÇÃO: Só renderiza o resto se tivermos produtos ou se estiver carregando */}
          {isLoadingProducts ? (
            <LoadingState t={t} />
          ) : !hasProducts ? (
            <EmptyProducts onAdd={handleAddProductClick} t={t} />
          ) : (
            <>
              {/* BARRA DE PESQUISA */}
              <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm md:p-4 flex gap-3 flex-col sm:flex-row contain-layout">
                <div className="relative w-full sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={15} />
                  <input 
                    type="text" 
                    placeholder={t('placeholder_search')} 
                    value={searchTerm} 
                    onChange={handleSearchChange}
                    className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </section>

              {/* MENSAGEM PESQUISA VAZIA */}
              {searchTerm && filteredProducts.length === 0 && (
                <div className="py-10 text-center text-slate-500 text-sm font-semibold">
                  {t('no_search_results') || 'Nenhum produto encontrado para esta pesquisa.'}
                </div>
              )}

              {/* LISTA PRODUTOS ATIVOS */}
              {activeProducts.length > 0 && (
                <div className="content-visibility-auto"> {/* Alivia a GPU e CPU forçando lazy render do CSS */}
                  <SectionHeader icon={<Boxes size={17} />} title={t('active_products_title')} count={activeProducts.length} action={addButton} />
                  {layoutMode === 'table' ? (
                    <ProductTable 
                      products={activeProducts} storeCurrency={currency.storeCurrency} togglePending={status.isToggling}
                      onClick={handleEditProduct} onToggle={actions.toggleProduct} onDelete={actions.setDeleteTarget} t={t} 
                    />
                  ) : (
                    <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {activeProducts.map(p => (
                        <ProductCard 
                          key={p.id} product={p} storeCurrency={currency.storeCurrency} togglePending={status.isToggling}
                          onClick={() => handleEditProduct(p)} onToggle={() => actions.toggleProduct(p)} onDelete={() => actions.setDeleteTarget(p)} t={t} 
                        />
                      ))}
                    </section>
                  )}
                </div>
              )}

              {/* LISTA PRODUTOS PAUSADOS */}
              {pausedProducts.length > 0 && (
                <div className="opacity-80 content-visibility-auto mt-6">
                  <SectionHeader icon={<PauseCircle size={17} />} title={t('paused_products_title')} count={pausedProducts.length} action={addButton} />
                  {layoutMode === 'table' ? (
                    <ProductTable 
                      products={pausedProducts} storeCurrency={currency.storeCurrency} togglePending={status.isToggling}
                      onClick={handleEditProduct} onToggle={actions.toggleProduct} onDelete={actions.setDeleteTarget} t={t} 
                    />
                  ) : (
                    <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {pausedProducts.map(p => (
                        <ProductCard 
                          key={p.id} product={p} storeCurrency={currency.storeCurrency} togglePending={status.isToggling}
                          onClick={() => handleEditProduct(p)} onToggle={() => actions.toggleProduct(p)} onDelete={() => actions.setDeleteTarget(p)} t={t} 
                        />
                      ))}
                    </section>
                  )}
                </div>
              )}

              {/* ESTATÍSTICAS */}
              <section className="grid grid-cols-2 gap-2 md:gap-3 lg:grid-cols-4 mt-6 contain-layout">
                <StatCard label={t('stat_total')} value={products.length} />
                <StatCard label={t('status_active')} value={activeProducts.length} />
                <StatCard label={t('status_paused')} value={pausedProducts.length} />
                <StatCard label={t('currency')} value={currency.backendCurrency || '—'} />
              </section>
            </>
          )}

        </div>
      </main>

      {/* MODAL DE ADIÇÃO (CARREGAMENTO PREGUIÇOSO E GPU HARDWARE ACCEL) */}
      {isAdding && (
        <div className="fixed inset-0 bg-white z-[150] overflow-y-auto transform-gpu will-change-transform contain-strict">
          <div className="sticky top-0 bg-white border-b px-4 h-14 flex items-center justify-between z-10">
            <div className="flex items-center gap-2"><Plus size={15} className="text-blue-600" strokeWidth={3} /><span className="font-black uppercase text-[11px]">{t('new_product')}</span></div>
            <button onClick={handleCloseAddProduct} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={18} className="text-slate-400" /></button>
          </div>
          <ProductDetails isCreating={true} onClose={handleCloseAddProduct} />
        </div>
      )}

      <ConfirmDeleteModal
        open={!!deleteTarget} loading={status.isDeleting} productName={deleteTarget?.name || ''}
        onClose={handleCloseDelete} onConfirm={handleConfirmDelete} t={t}
      />
    </div>
  );
}