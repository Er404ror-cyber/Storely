import { useCallback, memo, useRef, useMemo, useState, useDeferredValue, useEffect, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Loader2, Search, X, Boxes, PauseCircle, 
  LayoutGrid, Table, Inbox, Settings2, Coins, Tag, AlertTriangle, 
  ImageOff, ChevronRight, CheckCircle2 
} from 'lucide-react';

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

const STORAGE_VIEW_KEY = 'store_products_layout_mode';

const getInitialLayoutMode = (): 'grid' | 'table' => {
  if (typeof window !== 'undefined' && window.innerWidth < 640) {
    return 'grid';
  }
  try {
    const saved = sessionStorage.getItem(STORAGE_VIEW_KEY);
    if (saved === 'grid' || saved === 'table') return saved;
  } catch {}
  return 'grid';
};

const LoadingState = memo(({ t }: { t: any }) => (
  <div className="flex flex-col items-center justify-center py-20 min-h-[300px]">
    <div className="rounded-2xl bg-white p-4 shadow-sm mb-3">
      <Loader2 className="animate-spin text-blue-600" size={26} />
    </div>
    <p className="text-[12px] font-bold uppercase tracking-wider text-slate-400">
      {t('loading_engine', { defaultValue: 'A carregar catálogo...' })}
    </p>
  </div>
));
LoadingState.displayName = 'LoadingState';

const EmptyProducts = memo(({ onAdd, t }: { onAdd: () => void; t: any }) => (
  <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-14 px-6 text-center shadow-sm border border-slate-100">
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
      <Inbox size={32} strokeWidth={2} />
    </div>
    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
      {t('empty_products_title', { defaultValue: 'O seu inventário está vazio' })}
    </h3>
    <p className="text-[13px] text-slate-500 max-w-sm mb-6 leading-relaxed">
      {t('empty_products_desc', { defaultValue: 'Adicione o seu primeiro produto para começar a vender.' })}
    </p>
    <button 
      type="button"
      onClick={onAdd}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-[12px] font-black uppercase tracking-wider text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-transform"
    >
      <Plus size={18} strokeWidth={3} />
      {t('btn_new_product', { defaultValue: 'Novo Produto' })}
    </button>
  </div>
));
EmptyProducts.displayName = 'EmptyProducts';

const GridCardItem = memo(({ 
  product, 
  store,
  storeCurrency, 
  togglePending, 
  isBroken,
  onImageError,
  onToggle, 
  onDelete, 
  t 
}: { 
  product: Product; 
  store: any;
  storeCurrency: string; 
  togglePending: boolean; 
  isBroken: boolean;
  onImageError: (productId: string) => void;
  onToggle: (p: Product) => void; 
  onDelete: (p: Product) => void; 
  t: any; 
}) => {
  const handleToggle = useCallback(() => onToggle(product), [onToggle, product]);
  const handleDelete = useCallback(() => onDelete(product), [onDelete, product]);

  return (
    <ProductCard 
      product={product} 
      store={store}
      storeCurrency={storeCurrency} 
      togglePending={togglePending}
      isBroken={isBroken}
      onImageError={onImageError}
      onToggle={handleToggle} 
      onDelete={handleDelete} 
      t={t} 
    />
  );
});
GridCardItem.displayName = 'GridCardItem';

interface CatalogViewProps {
  products: Product[];
  store: any;
  layoutMode: 'table' | 'grid';
  isMobile: boolean;
  storeCurrency: string;
  togglePending: boolean;
  brokenProductIds: Set<string>;
  onImageError: (productId: string) => void;
  onToggle: (product: Product) => void;
  onDelete: (product: Product) => void;
  t: any;
  isPaused?: boolean;
}

const CatalogView = memo(({
  products,
  store,
  layoutMode,
  isMobile,
  storeCurrency,
  togglePending,
  brokenProductIds,
  onImageError,
  onToggle,
  onDelete,
  t,
  isPaused,
}: CatalogViewProps) => {
  const shouldRenderTable = !isMobile && layoutMode === 'table';

  if (shouldRenderTable) {
    return (
      <div className={`rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden ${isPaused ? 'p-2' : ''}`}>
        <ProductTable 
          products={products} 
          store={store}
          storeCurrency={storeCurrency} 
          togglePending={togglePending}
          brokenProductIds={brokenProductIds}
          onImageError={onImageError}
          onToggle={onToggle} 
          onDelete={onDelete} 
          t={t} 
        />
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {products.map(p => (
        <GridCardItem 
          key={p.id} 
          product={p} 
          store={store}
          storeCurrency={storeCurrency} 
          togglePending={togglePending}
          isBroken={brokenProductIds.has(p.id)}
          onImageError={onImageError}
          onToggle={onToggle} 
          onDelete={onDelete} 
          t={t} 
        />
      ))}
    </section>
  );
});
CatalogView.displayName = 'CatalogView';

export function ProductsList() {
  const { t, language } = useTranslate();
  const navigate = useNavigate();
  
  const { state, actions, status } = useProductsLogic(language, t);
  const { store, isLoadingStore, isAdding, searchTerm, isMobile, filteredProducts, deleteTarget, products } = state;
  const currency = useCurrencyLogic(store, language, t, products.length > 0);

  const [activeLayoutMode, setActiveLayoutMode] = useState<'grid' | 'table'>(() => {
    if (isMobile) return 'grid';
    return getInitialLayoutMode();
  });

  const [failedProductIds, setFailedProductIds] = useState<Set<string>>(() => new Set());

  const handleImageNetworkError = useCallback((productId: string) => {
    if (!productId) return;
    setFailedProductIds(prev => {
      if (prev.has(productId)) return prev;
      const next = new Set(prev);
      next.add(productId);
      return next;
    });
  }, []);

  const brokenProductIds = useMemo(() => {
    const ids = new Set(failedProductIds);
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const img = p.main_image;
      if (!img || typeof img !== 'string' || img.trim() === '' || (!img.startsWith('http://') && !img.startsWith('https://') && !img.startsWith('/'))) {
        ids.add(p.id);
      }
    }
    return ids;
  }, [products, failedProductIds]);

  const brokenProducts = useMemo(() => {
    return products.filter(p => brokenProductIds.has(p.id));
  }, [products, brokenProductIds]);

  // Exclui do hero qualquer produto com imagem danificada, vazia ou que falhou em rede
  const safeShowcaseProducts = useMemo(() => {
    const list: Product[] = [];
    for (let i = 0; i < products.length && list.length < 3; i++) {
      const p = products[i];
      const img = p.main_image;
      if (
        !brokenProductIds.has(p.id) &&
        typeof img === 'string' &&
        img.trim() !== '' &&
        (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/'))
      ) {
        list.push(p);
      }
    }
    return list;
  }, [products, brokenProductIds]);

  useEffect(() => {
    if (isMobile && activeLayoutMode !== 'grid') {
      setActiveLayoutMode('grid');
    }
  }, [isMobile, activeLayoutMode]);

  const handleSetLayoutMode = useCallback((mode: 'grid' | 'table') => {
    if (isMobile) return;
    setActiveLayoutMode(mode);
    actions.setLayoutMode(mode);
    try {
      sessionStorage.setItem(STORAGE_VIEW_KEY, mode);
    } catch {}
  }, [actions, isMobile]);

  const handleSetTableMode = useCallback(() => handleSetLayoutMode('table'), [handleSetLayoutMode]);
  const handleSetGridMode = useCallback(() => handleSetLayoutMode('grid'), [handleSetLayoutMode]);

  const deferredSearch = useDeferredValue(searchTerm);

  const activeProducts = useMemo(() => filteredProducts.filter(p => p.is_active), [filteredProducts]);
  const pausedProducts = useMemo(() => filteredProducts.filter(p => !p.is_active), [filteredProducts]);

  const settingsSectionRef = useRef<HTMLDivElement>(null);
  const scrollToSettings = useCallback(() => {
    if (settingsSectionRef.current) {
      settingsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleAddProductClick = useCallback(() => actions.setIsAdding(true), [actions]);
  const handleCloseAddProduct = useCallback(() => actions.setIsAdding(false), [actions]);
  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => actions.setSearchTerm(e.target.value), [actions]);
  const handleCloseDelete = useCallback(() => actions.setDeleteTarget(null), [actions]);
  
  const handleConfirmDelete = useCallback(() => {
    if (deleteTarget?.id) actions.deleteProduct(deleteTarget.id);
  }, [deleteTarget, actions]);

  // Rota corrigida com envio de state estruturado
  const handleEditProduct = useCallback((product: Product) => {
    navigate(`/admin/produtos/${product.id}`, {
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

  const hasCurrencySet = Boolean(currency.backendCurrency);
  const showCurrencyOnTop = !hasCurrencySet;
  const showGuideOnTop = !currency.hasCompletedGuide;

  const effectiveLayoutMode = isMobile ? 'grid' : activeLayoutMode;

  return (
    <div className="min-h-[100dvh] bg-slate-50/70 text-slate-800 antialiased selection:bg-blue-200 relative">
      <main className="mx-auto w-full max-w-7xl px-2 sm:px-6 md:py-8 lg:px-8 flex flex-col gap-6">
        
        {/* HERO EMBUTIDO - APENAS IMAGENS ÍNTEGRAS */}
        <section className="-mx-4 sm:mx-0 w-[calc(100%+2rem)] sm:w-full relative overflow-hidden rounded-none sm:rounded-3xl bg-[#0f172a] p-5 sm:p-8 md:p-9 border-b sm:border border-slate-800 shadow-sm">
          {safeShowcaseProducts.length > 0 && (
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-full md:w-2/3 xl:w-5/12 overflow-hidden select-none opacity-40 sm:opacity-90">
              <div className="grid grid-cols-2 gap-2 h-full transform translate-x-2">
                <div className="flex flex-col gap-2">
                  {safeShowcaseProducts[0] && (
                    <div className="w-full h-40 sm:h-48 rounded-xl overflow-hidden bg-slate-800">
                      <img 
                        src={safeShowcaseProducts[0].main_image} 
                        alt="" 
                        loading="lazy"
                        decoding="async" 
                        onError={() => handleImageNetworkError(safeShowcaseProducts[0].id)}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                  {safeShowcaseProducts[2] && (
                    <div className="w-full h-28 sm:h-32 rounded-xl overflow-hidden bg-slate-800">
                      <img 
                        src={safeShowcaseProducts[2].main_image} 
                        alt="" 
                        loading="lazy"
                        decoding="async" 
                        onError={() => handleImageNetworkError(safeShowcaseProducts[2].id)}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 pt-4">
                  {safeShowcaseProducts[1] && (
                    <div className="w-full h-32 sm:h-36 rounded-xl overflow-hidden bg-slate-800">
                      <img 
                        src={safeShowcaseProducts[1].main_image} 
                        alt="" 
                        loading="lazy"
                        decoding="async" 
                        onError={() => handleImageNetworkError(safeShowcaseProducts[1].id)}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                  {safeShowcaseProducts[0] && (
                    <div className="w-full h-36 sm:h-44 rounded-xl overflow-hidden bg-slate-800">
                      <img 
                        src={safeShowcaseProducts[0].main_image} 
                        alt="" 
                        loading="lazy"
                        decoding="async" 
                        onError={() => handleImageNetworkError(safeShowcaseProducts[0].id)}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Degradê fundido com a nova cor de base */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/85 to-transparent" />
            </div>
          )}

          <div className="relative z-10 flex flex-col gap-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800/80 px-3 py-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-300 border border-slate-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span className="truncate max-w-[140px]">{store.name}</span>
              </span>

              <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-slate-300">
                {products.length} {products.length === 1 ? t('item_singular', { defaultValue: 'artigo' }) : t('item_plural', { defaultValue: 'artigos' })}
              </span>

              {hasProducts && brokenProducts.length === 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                  <CheckCircle2 size={12} className="text-emerald-400" />
                  {t('photos_all_ok', { defaultValue: 'Fotos 100% OK' })}
                </span>
              )}
            </div>

            <div className="flex items-start gap-4 min-w-0 max-w-xl">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 mt-0.5">
                <Tag size={22} strokeWidth={2.2} />
              </div>

              <div className="flex flex-col min-w-0">
                <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  {t('inventory_title', { defaultValue: 'Gestão de Produtos' })}
                </h1>
                
                <p className="mt-1 text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                  {t('inventory_subtitle', { defaultValue: 'Adicione fotos, altere preços e ative itens na sua loja online em tempo real.' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto pt-1">
              {hasProducts && (hasCurrencySet || currency.hasCompletedGuide) && (
                <button 
                  type="button"
                  onClick={scrollToSettings}
                  className="flex-1 sm:flex-none inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 text-xs font-bold text-slate-200 shadow-xs hover:bg-slate-700/80 active:scale-95 transition-transform"
                >
                  <Coins size={16} strokeWidth={2.2} className="text-amber-400 shrink-0" />
                  <span className="truncate">
                    {currency.storeCurrency 
                      ? `${t('currency', { defaultValue: 'Moeda' })}: ${currency.storeCurrency}` 
                      : t('currency_label', { defaultValue: 'Configurar Moeda' })}
                  </span>
                </button>
              )}

              <button 
                type="button"
                onClick={handleAddProductClick} 
                className="flex-1 sm:flex-none inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-black uppercase tracking-wider text-white shadow-xs hover:bg-blue-500 active:scale-95 transition-transform"
              >
                <Plus size={16} strokeWidth={3} className="shrink-0" />
                <span className="truncate">{t('btn_new_product', { defaultValue: 'Adicionar Produto' })}</span>
              </button>
            </div>
          </div>
        </section>

        {/* ALERTA DE FOTOS COM ERRO / QUEBRADAS */}
        {hasProducts && brokenProducts.length > 0 && (
          <section className="w-full rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 shadow-xs">
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <AlertTriangle size={17} className="text-amber-600 shrink-0" />
                <p className="text-xs font-bold text-amber-900">
                  {brokenProducts.length} {brokenProducts.length === 1 
                    ? t('broken_products_singular', { defaultValue: 'produto precisa de imagem:' }) 
                    : t('broken_products_plural', { defaultValue: 'produtos precisam de imagem:' })}
                </p>
              </div>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                {t('click_to_fix', { defaultValue: 'Clique no item para corrigir' })}
              </span>
            </div>

            <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1">
              {brokenProducts.map(bp => (
                <button
                  key={bp.id}
                  type="button"
                  onClick={() => handleEditProduct(bp)}
                  className="group flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-left shadow-xs hover:border-amber-500 active:scale-95 transition-transform shrink-0 max-w-[220px]"
                >
                  <ImageOff size={14} className="text-amber-500 shrink-0" />
                  <span className="truncate text-xs font-bold text-slate-800 group-hover:text-blue-600">
                    {bp.name}
                  </span>
                  <ChevronRight size={13} className="text-slate-300 shrink-0" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* MOEDA NO TOPO */}
        {showCurrencyOnTop && (
          <div className="flex flex-col gap-6 w-full bg-white p-6 rounded-2xl border border-blue-100 shadow-xs">
            <CurrencySection {...currency.currencyProps} t={t} />
          </div>
        )}

        {/* GUIA DE PROGRESSO NO TOPO */}
        {showGuideOnTop && (
          <div className="w-full">
            <ProgressGuide hasCurrency={!!currency.backendCurrency} hasProducts={hasProducts} t={t} />
          </div>
        )}

        {/* BARRA DE PESQUISA & LAYOUT */}
        {hasProducts && (
          <section className="flex flex-col sm:flex-row items-center gap-3 rounded-2xl bg-white p-2.5 shadow-xs border border-slate-100">
            <div className="relative w-full flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder={t('placeholder_search', { defaultValue: 'Pesquisar produtos...' })} 
                value={searchTerm} 
                onChange={handleSearchChange}
                className="h-11 w-full rounded-xl bg-slate-50 pl-11 pr-4 text-[15px] sm:text-[14px] font-medium text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {!isMobile && (
              <div className="flex gap-1 rounded-xl bg-slate-50 p-1 shrink-0">
                <button 
                  type="button"
                  onClick={handleSetTableMode} 
                  className={`flex items-center gap-2 h-9 px-3.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-colors ${effectiveLayoutMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  <Table size={15} strokeWidth={2.5} /> {t('view_table', { defaultValue: 'Tabela' })}
                </button>
                <button 
                  type="button"
                  onClick={handleSetGridMode} 
                  className={`flex items-center gap-2 h-9 px-3.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-colors ${effectiveLayoutMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  <LayoutGrid size={15} strokeWidth={2.5} /> {t('view_grid', { defaultValue: 'Grade' })}
                </button>
              </div>
            )}
          </section>
        )}

        {/* LISTAGEM */}
        {isLoadingProducts ? (
          <LoadingState t={t} />
        ) : !hasProducts ? (
          <EmptyProducts onAdd={handleAddProductClick} t={t} />
        ) : (
          <div className="flex flex-col gap-6">
            {deferredSearch && filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-14 opacity-70">
                <Search size={36} className="text-slate-300 mb-3" />
                <p className="text-[14px] font-bold text-slate-500">
                  {t('no_search_results', { defaultValue: 'Nenhum resultado encontrado.' })}
                </p>
              </div>
            )}

            {activeProducts.length > 0 && (
              <div className="space-y-4">
                <SectionHeader 
                  icon={<Boxes size={18} />} 
                  title={t('active_products_title', { defaultValue: 'Produtos Ativos' })} 
                  count={activeProducts.length} 
                />
                
                <CatalogView
                  products={activeProducts}
                  store={store}
                  layoutMode={effectiveLayoutMode}
                  isMobile={isMobile}
                  storeCurrency={currency.storeCurrency}
                  togglePending={status.isToggling}
                  brokenProductIds={brokenProductIds}
                  onImageError={handleImageNetworkError}
                  onToggle={actions.toggleProduct}
                  onDelete={actions.setDeleteTarget}
                  t={t}
                />
              </div>
            )}

            {pausedProducts.length > 0 && (
              <div className="opacity-80 hover:opacity-100 transition-opacity space-y-4 mt-2">
                <SectionHeader 
                  icon={<PauseCircle size={18} />} 
                  title={t('paused_products_title', { defaultValue: 'Produtos Pausados' })} 
                  count={pausedProducts.length} 
                />
                
                <CatalogView
                  products={pausedProducts}
                  store={store}
                  layoutMode={effectiveLayoutMode}
                  isMobile={isMobile}
                  storeCurrency={currency.storeCurrency}
                  togglePending={status.isToggling}
                  brokenProductIds={brokenProductIds}
                  onImageError={handleImageNetworkError}
                  onToggle={actions.toggleProduct}
                  onDelete={actions.setDeleteTarget}
                  t={t}
                  isPaused={true}
                />
              </div>
            )}
          </div>
        )}

        {/* DEFINIÇÕES & ESTATÍSTICAS */}
        {(!showCurrencyOnTop || !showGuideOnTop) && (
          <div ref={settingsSectionRef} className="mt-8 pt-8 border-t border-slate-200 flex flex-col gap-6 pb-12">
            <div className="flex items-center gap-2.5 px-1">
              <Settings2 size={18} className="text-slate-400" />
              <h2 className="text-[13px] font-black uppercase tracking-wider text-slate-500">
                {t('store_management_title', { defaultValue: 'Gestão da Loja' })}
              </h2>
            </div>

            <div className="flex flex-col gap-6 w-full">
              {!showCurrencyOnTop && (
                <CurrencySection {...currency.currencyProps} t={t} />
              )}
              
              {!showGuideOnTop && !currency.hasCompletedGuide && (
                <ProgressGuide hasCurrency={!!currency.backendCurrency} hasProducts={hasProducts} t={t} />
              )}

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

      {/* MODAL CRIAR PRODUTO */}
      {isAdding && (
        <div className="fixed inset-0 z-[150] bg-slate-50 overflow-y-auto">
          <div className="sticky top-0 bg-white/95 border-b border-slate-200 px-4 h-14 flex items-center justify-between z-20 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Plus size={16} strokeWidth={3} />
              </div>
              <span className="font-black uppercase text-[12px] tracking-wider text-slate-800">
                {t('new_product', { defaultValue: 'Novo Produto' })}
              </span>
            </div>
            <button 
              type="button"
              onClick={handleCloseAddProduct} 
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 active:scale-95 transition-transform"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
          <div className="p-4 sm:p-6 max-w-5xl mx-auto">
            <ProductDetails isCreating={true} onClose={handleCloseAddProduct} />
          </div>
        </div>
      )}

      {/* CONFIRMAÇÃO DE DELETE */}
      <ConfirmDeleteModal
        open={!!deleteTarget} 
        loading={status.isDeleting} 
        productName={deleteTarget?.name || ''}
        onClose={handleCloseDelete} 
        onConfirm={handleConfirmDelete} 
        t={t}
      />
    </div>
  );
}