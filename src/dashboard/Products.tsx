import { useCallback, memo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, Search, Package, X, Boxes, PauseCircle, LayoutGrid, Table, Inbox, Settings2 } from 'lucide-react';

import { useTranslate } from '../context/LanguageContext';
import { useProductsLogic } from '../components/produtos/componentsAdmim/useProductsLogic';
import { useCurrencyLogic } from '../components/produtos/componentsAdmim/useCurrencyLogic';
import type { Product } from '../types/productsListTypes';

import { CurrencySection } from '../components/produtos/componentsAdmim/CurrencySection';
import { ProgressGuide } from '../components/produtos/componentsAdmim/ProgressGuide';
import { SectionHeader } from '../components/produtos/componentsAdmim/SectionHeader';
import { ProductCard } from '../components/produtos/componentsAdmim/ProductCard';
import { ProductTable } from '../components/produtos/componentsAdmim/ProductTable';
import { ConfirmDeleteModal } from '../components/produtos/componentsAdmim/ConfirmDeleteModal';
import { ProductDetails } from './ProdutcsDetails';
import { VisualStatsDashboard } from '../components/produtos/componentsAdmim/VisualStats';

const LoadingState = memo(({ t }: { t: any }) => (
  <div className="flex flex-col items-center justify-center py-24 opacity-85">
    <div className="rounded-[20px] bg-white p-4 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.06)] mb-4">
      <Loader2 className="animate-spin text-blue-600" size={28} />
    </div>
    <p className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">
      {t('loading_engine', { defaultValue: 'A carregar catálogo...' })}
    </p>
  </div>
));
LoadingState.displayName = 'LoadingState';

const EmptyProducts = memo(({ onAdd, t }: { onAdd: () => void, t: any }) => (
  <div className="flex flex-col items-center justify-center rounded-[32px] bg-white py-14 px-6 text-center shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)]">
    <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-blue-50 text-blue-600 shadow-[inset_0_2px_8px_rgba(0,0,0,0.04)] mb-5">
      <Inbox size={36} strokeWidth={2} />
    </div>
    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
      {t('empty_products_title', { defaultValue: 'O seu inventário está vazio' })}
    </h3>
    <p className="text-[13px] text-slate-500 max-w-sm mb-8 leading-relaxed">
      {t('empty_products_desc', { defaultValue: 'Adicione o seu primeiro produto para começar a vender.' })}
    </p>
    <button 
      onClick={onAdd}
      className="inline-flex h-14 items-center justify-center gap-2 rounded-[18px] bg-blue-600 px-8 text-[12px] font-black uppercase tracking-[0.2em] text-white shadow-[0_8px_25px_-5px_rgba(37,99,235,0.4)] transition-transform hover:-translate-y-1 active:scale-95"
    >
      <Plus size={18} strokeWidth={3} />
      {t('btn_new_product', { defaultValue: 'Novo Produto' })}
    </button>
  </div>
));
EmptyProducts.displayName = 'EmptyProducts';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function ProductsList() {
  const { t, language } = useTranslate();
  const navigate = useNavigate();
  
  const { state, actions, status } = useProductsLogic(language, t);
  const { store, isLoadingStore, isAdding, searchTerm, layoutMode, isMobile, filteredProducts, deleteTarget, products } = state;
  const currency = useCurrencyLogic(store, language, t, products.length > 0);

  // Botão "Scroll to Management"
  const settingsSectionRef = useRef<HTMLDivElement>(null);
  const scrollToSettings = useCallback(() => {
    if (settingsSectionRef.current) {
      settingsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

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

  if (isLoadingStore || !store) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const hasProducts = products.length > 0;
  const isLoadingProducts = state.isLoadingProducts;
  const activeProducts = filteredProducts.filter(p => p.is_active);
  const pausedProducts = filteredProducts.filter(p => !p.is_active);

  // Condições separadas
  const hasCurrencySet = Boolean(currency.backendCurrency);
  const showCurrencyOnTop = !hasCurrencySet;
  const showGuideOnTop = !currency.hasCompletedGuide;

  return (
    <div className="min-h-[100dvh] bg-slate-50/80 text-slate-800 antialiased selection:bg-blue-200">
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:py-8 lg:px-8 flex flex-col gap-8">
        
        {/* ========================================================= */}
        {/* TOPO: DIRETO AO ASSUNTO                                   */}
        {/* ========================================================= */}
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 bg-transparent">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-slate-900 text-white shadow-[0_8px_20px_rgba(15,23,42,0.15)]">
              <Package size={22} strokeWidth={2} />
            </div>
            <div className="flex flex-col min-w-0 justify-center">
              <p className="truncate text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                {store.name}
              </p>
              <h1 className="truncate text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-none mt-1">
                {t('inventory_title', { defaultValue: 'Inventário' })}
              </h1>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {hasProducts && (hasCurrencySet || currency.hasCompletedGuide) && (
              <button 
                onClick={scrollToSettings}
                className="w-full sm:w-auto inline-flex h-14 items-center justify-center gap-2 rounded-[18px] bg-white border border-slate-100 px-6 text-[12px] font-black uppercase tracking-[0.1em] text-slate-600 shadow-[0_4px_15px_rgba(0,0,0,0.03)] transition-colors hover:bg-slate-50 active:scale-95 shrink-0"
              >
                <Settings2 size={16} strokeWidth={2.5} />
                {t('currency_label', { defaultValue: 'Gerir Loja' })}
              </button>
            )}

            <button 
              onClick={handleAddProductClick} 
              className="w-full sm:w-auto inline-flex h-14 items-center justify-center gap-2 rounded-[18px] bg-blue-600 px-8 text-[12px] font-black uppercase tracking-[0.15em] text-white shadow-[0_6px_20px_-5px_rgba(37,99,235,0.4)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_12px_25px_-5px_rgba(37,99,235,0.5)] active:scale-95 shrink-0"
            >
              <Plus size={18} strokeWidth={3} />
              {t('btn_new_product', { defaultValue: 'Novo Produto' })}
            </button>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SEÇÃO DA MOEDA NO TOPO (Apenas se NÃO definida)            */}
        {/* ========================================================= */}
        {showCurrencyOnTop && (
          <div className="flex flex-col gap-6 w-full bg-white p-6 rounded-[28px] border border-blue-100 shadow-[0_4px_25px_rgba(37,99,235,0.06)]">
            <CurrencySection {...currency.currencyProps} t={t} />
          </div>
        )}

        {/* ========================================================= */}
        {/* GUIA DE PROGRESSO NO TOPO (Apenas se NÃO concluído)         */}
        {/* ========================================================= */}
        {showGuideOnTop && (
          <div className="w-full">
            <ProgressGuide hasCurrency={!!currency.backendCurrency} hasProducts={hasProducts} t={t} />
          </div>
        )}

        {/* ========================================================= */}
        {/* BARRA DE PESQUISA & VISUALIZAÇÃO                            */}
        {/* ========================================================= */}
        {hasProducts && (
          <section className="flex flex-col sm:flex-row items-center gap-3 rounded-[24px] sm:rounded-[28px] bg-white p-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100/50">
            <div className="relative w-full flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder={t('placeholder_search', { defaultValue: 'Pesquisar produtos...' })} 
                value={searchTerm} 
                onChange={handleSearchChange}
                className="h-12 w-full rounded-[18px] bg-slate-50/50 pl-12 pr-4 text-[16px] sm:text-[14px] font-bold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:bg-slate-50 focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
              />
            </div>

            {!isMobile && (
              <div className="flex gap-1.5 rounded-[18px] bg-slate-50 p-1.5 shrink-0">
                <button 
                  onClick={handleSetTableMode} 
                  className={`flex items-center gap-2 h-10 px-4 rounded-[14px] text-[11px] font-black uppercase tracking-wider transition-all ${layoutMode === 'table' ? 'bg-white text-blue-600 shadow-[0_2px_10px_rgba(0,0,0,0.04)]' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100/50'}`}
                >
                  <Table size={16} strokeWidth={2.5} /> {t('view_table', { defaultValue: 'Tabela' })}
                </button>
                <button 
                  onClick={handleSetGridMode} 
                  className={`flex items-center gap-2 h-10 px-4 rounded-[14px] text-[11px] font-black uppercase tracking-wider transition-all ${layoutMode === 'grid' ? 'bg-white text-blue-600 shadow-[0_2px_10px_rgba(0,0,0,0.04)]' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100/50'}`}
                >
                  <LayoutGrid size={16} strokeWidth={2.5} /> {t('view_grid', { defaultValue: 'Grade' })}
                </button>
              </div>
            )}
          </section>
        )}

        {/* ========================================================= */}
        {/* O CATÁLOGO (Lazy Loaded Content)                          */}
        {/* ========================================================= */}
        {isLoadingProducts ? (
          <LoadingState t={t} />
        ) : !hasProducts ? (
          <EmptyProducts onAdd={handleAddProductClick} t={t} />
        ) : (
          <div className="flex flex-col gap-6">
            
            {searchTerm && filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 opacity-60">
                <Search size={40} className="text-slate-300 mb-4" />
                <p className="text-[14px] font-bold text-slate-500">
                  {t('no_search_results', { defaultValue: 'Nenhum resultado encontrado.' })}
                </p>
              </div>
            )}

            {activeProducts.length > 0 && (
              <div className="content-visibility-auto space-y-4">
                <SectionHeader icon={<Boxes size={18} />} title={t('active_products_title', { defaultValue: 'Produtos Ativos' })} count={activeProducts.length} />
                
                {layoutMode === 'table' ? (
                  <div className="rounded-[24px] bg-white shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100/50 overflow-hidden transform-gpu">
                    <ProductTable 
                      products={activeProducts} storeCurrency={currency.storeCurrency} togglePending={status.isToggling}
                      onClick={handleEditProduct} onToggle={actions.toggleProduct} onDelete={actions.setDeleteTarget} t={t} 
                    />
                  </div>
                ) : (
                  <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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

            {pausedProducts.length > 0 && (
              <div className="opacity-80 hover:opacity-100 transition-opacity content-visibility-auto space-y-4 mt-2">
                <SectionHeader icon={<PauseCircle size={18} />} title={t('paused_products_title', { defaultValue: 'Produtos Pausados' })} count={pausedProducts.length} />
                
                {layoutMode === 'table' ? (
                  <div className="rounded-[24px] bg-white p-2 shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100/50 overflow-hidden transform-gpu">
                    <ProductTable 
                      products={pausedProducts} storeCurrency={currency.storeCurrency} togglePending={status.isToggling}
                      onClick={handleEditProduct} onToggle={actions.toggleProduct} onDelete={actions.setDeleteTarget} t={t} 
                    />
                  </div>
                ) : (
                  <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
          </div>
        )}

        {/* ========================================================= */}
        {/* GESTÃO & ESTATÍSTICAS (Exibido embaixo caso itens já estejam configurados) */}
        {/* ========================================================= --> */}
        {(!showCurrencyOnTop || !showGuideOnTop) && (
          <div ref={settingsSectionRef} className="mt-12 pt-10 border-t border-slate-200/60 flex flex-col gap-6 pb-12 scroll-mt-6 content-visibility-auto">
            
            <div className="flex items-center gap-3 px-2 mb-2">
              <Settings2 size={20} className="text-slate-400" />
              <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-slate-500">
                {t('currency_label', { defaultValue: 'Gestão da Loja' })}
              </h2>
            </div>

            <div className="flex flex-col gap-8 w-full">
              <div className="flex flex-col gap-6 w-full">
                {/* Se a moeda já estiver definida em cima, exibe aqui na gestão */}
                {!showCurrencyOnTop && (
                  <CurrencySection {...currency.currencyProps} t={t} />
                )}
                
                {/* Se o guia já estiver concluído em cima, exibe aqui na gestão se necessário (ou oculta) */}
                {!showGuideOnTop && !currency.hasCompletedGuide && (
                  <ProgressGuide hasCurrency={!!currency.backendCurrency} hasProducts={hasProducts} t={t} />
                )}
              </div>

              <VisualStatsDashboard
                total={products.length} 
                active={activeProducts.length} 
                paused={pausedProducts.length} 
                t={t} 
              />
            </div>
          </div>
        )}

      </main>

      {/* MODAL NOVO PRODUTO (OVERLAY) */}
      {isAdding && (
        <div className="fixed inset-0 z-[150] bg-slate-50 overflow-y-auto transform-gpu will-change-transform contain-strict pb-safe">
          <div className="sticky top-0 bg-white/90 border-b border-slate-200/50 px-4 h-16 flex items-center justify-between z-20 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-blue-100 text-blue-600">
                <Plus size={18} strokeWidth={3} />
              </div>
              <span className="font-black uppercase text-[12px] tracking-widest text-slate-800">
                {t('new_product', { defaultValue: 'Novo Produto' })}
              </span>
            </div>
            <button 
              onClick={handleCloseAddProduct} 
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors active:scale-95"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
          <div className="p-4 sm:p-6 max-w-5xl mx-auto">
            <ProductDetails isCreating={true} onClose={handleCloseAddProduct} />
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR DELETE */}
      <ConfirmDeleteModal
        open={!!deleteTarget} loading={status.isDeleting} productName={deleteTarget?.name || ''}
        onClose={handleCloseDelete} onConfirm={handleConfirmDelete} t={t}
      />
    </div>
  );
}