import { memo, useMemo, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { User, Clock, Flame, Heart, Music, Phone, Wallet, Package, Layout as LayoutIcon, Play, Layout } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTranslate } from '../context/LanguageContext';

// Importando Tipos
import { type DashboardData, type Product, type Page, type StepItem, resolveCurrency } from '../types/dashboard';

// Importando Componentes Separados
import AiAssistant from '../components/dashboard/AiAssistant';
import { 
  StatCard, SetupStepCard, ProductRow, PageRow, 
  HeroBanner, SystemNodeDetails, ActionBanner 
} from '../components/dashboard/DashboardWidgets';

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, language } = useTranslate();

  const handleNavigate = useCallback((path: string) => navigate(path), [navigate]);

  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard-professional-v5'],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Not authenticated');

      const { data: store, error: storeError } = await supabase.from('stores').select('*').eq('owner_id', user.id).single();
      if (storeError || !store) throw new Error('Store not found');

      const [productsRes, pagesRes] = await Promise.all([
        supabase.from('products').select('*').eq('store_id', store.id).order('created_at', { ascending: false }),
        supabase.from('pages').select('*').eq('store_id', store.id).order('updated_at', { ascending: false }),
      ]);

      if (productsRes.error) throw productsRes.error;
      if (pagesRes.error) throw pagesRes.error;

      return {
        store,
        owner_email: user.email ?? '',
        createdAt: store.created_at,
        products: (productsRes.data ?? []) as Product[],
        pages: (pagesRes.data ?? []) as Page[],
      };
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
  });

  // Subsrições em Tempo Real (Realtime)
  useEffect(() => {
    const storeId = data?.store?.id;
    if (!storeId) return;

    const channel = supabase.channel(`dashboard-realtime-v5`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        const payloadNew = payload.new as Record<string, any>;
        const payloadOld = payload.old as Record<string, any>;
        if ((payloadNew?.store_id || payloadOld?.store_id) !== storeId) return; 
        
        queryClient.setQueryData<DashboardData>(['dashboard-professional-v5'], (old) => {
          if (!old) return old;
          let newProducts = [...old.products];
          if (payload.eventType === 'INSERT') { if (!newProducts.some(p => p.id === payloadNew.id)) newProducts.unshift(payloadNew as Product); }
          else if (payload.eventType === 'UPDATE') { newProducts = newProducts.map(p => p.id === payloadNew.id ? { ...p, ...(payloadNew as Product) } : p); }
          else if (payload.eventType === 'DELETE') { newProducts = newProducts.filter(p => p.id !== payloadOld.id); }
          return { ...old, products: newProducts };
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pages' }, (payload) => {
        const payloadNew = payload.new as Record<string, any>;
        const payloadOld = payload.old as Record<string, any>;
        if ((payloadNew?.store_id || payloadOld?.store_id) !== storeId) return;
        
        queryClient.setQueryData<DashboardData>(['dashboard-professional-v5'], (old) => {
          if (!old) return old;
          let newPages = [...old.pages];
          if (payload.eventType === 'INSERT') { if (!newPages.some(p => p.id === payloadNew.id)) newPages.unshift(payloadNew as Page); }
          else if (payload.eventType === 'UPDATE') { newPages = newPages.map(p => p.id === payloadNew.id ? { ...p, ...(payloadNew as Page) } : p); }
          else if (payload.eventType === 'DELETE') { newPages = newPages.filter(p => p.id !== payloadOld.id); }
          return { ...old, pages: newPages };
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [data?.store?.id, queryClient]);

  // Cálculos de Interface e Progresso
  const ui = useMemo(() => {
    const store = data?.store;
    const products = data?.products ?? [];
    const pages = data?.pages ?? [];

    const activeProducts = products.filter((p) => p.is_active);
    const hasPhone = Boolean(store?.whatsapp_number?.trim());
    const hasCurrency = Boolean(resolveCurrency(store)?.trim());
    const hasProducts = products.length > 0;
    const hasHomePage = pages.some((p) => p.is_home);

    const doneCount = [hasPhone, hasCurrency, hasProducts, hasHomePage].filter(Boolean).length;
    const progress = Math.round((doneCount / 4) * 100);
    
    return {
      activeProducts, pages, doneCount, progress,
      currency: resolveCurrency(store),
      productCount: products.length, pageCount: pages.length,
      activeCount: activeProducts.length, hasProducts, hasHomePage
    };
  }, [data]);

  const steps = useMemo<StepItem[]>(() => {
    if (!data) return [];
    return [
      { id: 'phone', title: t('dashboard_step_phone_title') || 'Adicionar Contacto', desc: t('dashboard_step_phone_desc') || 'Liga o teu WhatsApp à loja', done: Boolean(data.store?.whatsapp_number?.trim()), icon: Phone, actionLabel: t('btn_configure') || 'Configurar', route: '/admin/configuracoes' },
      { id: 'currency', title: t('dashboard_step_currency_title') || 'Definir Moeda', desc: t('dashboard_step_currency_desc') || 'Escolhe como os clientes pagam', done: Boolean(resolveCurrency(data.store)?.trim()), icon: Wallet, actionLabel: t('btn_configure') || 'Configurar', route: '/admin/produtos' },
      { id: 'product', title: t('dashboard_step_product_title') || 'O teu 1º Produto', desc: t('dashboard_step_product_desc') || 'Adiciona artigos ao catálogo', done: ui.productCount > 0, icon: Package, actionLabel: t('btn_new_product') || 'Adicionar', route: '/admin/produtos' },
      { id: 'page', title: t('dashboard_step_page_title') || 'Página Principal', desc: t('dashboard_step_page_desc') || 'Publica a tua loja online', done: ui.pageCount > 0, icon: LayoutIcon, actionLabel: t('btn_edit') || 'Editar', route: '/admin/paginas' },
    ];
  }, [data, t, ui.productCount, ui.pageCount]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#DED6EB]">
        <div className="h-12 w-12 animate-spin rounded-2xl bg-white border-4 border-[#A588F2] shadow-xl" />
      </div>
    );
  }

  if (error || !data) return null;

  return (
    <div className="min-h-screen flex items-center justify-center font-sans bg-[#DED6EB]  selection:bg-[#B9D5F6]">
      <div className="w-full max-w-[1100px] bg-[#ffffff] shadow-sm p-4 sm:p-8 md:p-10 flex flex-col gap-6 sm:gap-8 overflow-hidden" style={{ contain: 'layout' }}>
        
        {/* CABEÇALHO */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-50">
          <div className="flex items-center justify-between w-full sm:w-auto">
             <h1 className="text-2xl md:text-3xl font-black text-[#2D263B] tracking-tight">{t('dashboard_title') || 'Dashboard'}</h1>
             <button onClick={() => handleNavigate('/admin/configuracoes')} className="sm:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E5D9F4] text-[#9175E6] shadow-sm border border-white active:scale-95 transition-transform transform-gpu">
                <User size={18} fill="currentColor" />
             </button>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end relative">
            <div className="hidden sm:flex gap-2">
              <button onClick={() => handleNavigate('/admin/configuracoes')} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E5D9F4] text-[#9175E6] shadow-sm border border-white hover:scale-105 transition-transform transform-gpu">
                <User size={18} fill="currentColor" />
              </button>
            </div>
          </div>
        </header>

        {/* HERO BANNER */}
        <HeroBanner 
          storeName={data.store.name || ''} 
          storeSlug={data.store.slug || ''} 
          progress={ui.progress} 
          t={t} 
          onNavigate={handleNavigate} 
        />

        {/* STATS GRID */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <StatCard label={t('stat_total_products') || 'Total Artigos'} value={ui.productCount} icon={Music} bgColor="bg-[#F8F4FD]" iconBgColor="bg-[#D8C7F5]" iconColor="text-[#8862DF]" trendText={ui.hasProducts ? (t('stat_updated_recently') || "Sincronizado") : (t('stat_zero_records') || "Vazio")} trendColor="text-[#32A873]" />
          <StatCard label={t('stat_active_items') || 'Artigos Ativos'} value={ui.activeCount} icon={Heart} bgColor="bg-[#FFF4F4]" iconBgColor="bg-[#FDBBBB]" iconColor="text-[#E65C5C]" trendText={t('stat_public_view') || "Visíveis ao Público"} trendColor="text-[#32A873]" />
          <StatCard label={t('stat_total_pages') || 'Total Páginas'} value={ui.pageCount} icon={Clock} bgColor="bg-[#FFFAEF]" iconBgColor="bg-[#FEE5A6]" iconColor="text-[#DA9F23]" trendText={ui.hasHomePage ? (t('stat_online_status') || "Publicadas") : (t('stat_drafts') || "Rascunho")} trendColor="text-[#32A873]" />
          <StatCard label={t('stat_setup_progress') || 'Setup Completo'} value={`${ui.progress}%`} icon={Flame} bgColor="bg-[#F2F7FD]" iconBgColor="bg-[#B9D5F6]" iconColor="text-[#5194DF]" trendText={ui.progress === 100 ? (t('stat_fully_configured') || "Pronto") : (t('stat_in_progress') || "Pendente")} trendColor="text-[#867B9E]" />
        </section>

        {/* SETUP OVERVIEW */}
        <section className="rounded-[2rem] sm:rounded-[2.5rem] bg-white p-5 sm:p-6 md:p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <h3 className="text-[14px] sm:text-[15px] font-black text-[#2D263B]">{t('setup_overview_title') || 'Status da Loja'}</h3>
            <span className={`text-[9px] sm:text-[10px] font-black uppercase px-2 sm:px-3 py-1 rounded-full ${ui.progress < 100 ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {ui.progress < 100 ? (t('setup_action_needed') || 'Configuração') : (t('setup_all_ready') || 'Completo!')}
            </span>
          </div>
          
          {ui.progress < 100 ? (
            <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
              {steps.map((step) => !step.done && <SetupStepCard key={step.id} item={step} onNavigate={handleNavigate} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {steps.map((step) => (
                <button key={step.id} onClick={() => handleNavigate(step.route)} className="flex flex-col items-center justify-center p-4 sm:p-5 bg-[#F8F6FA] rounded-2xl sm:rounded-[1.8rem] border-2 border-transparent hover:border-[#E5D9F4] transition-colors active:scale-95 transform-gpu group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mb-2 sm:mb-3 bg-white rounded-xl sm:rounded-[1rem] flex items-center justify-center text-[#9175E6] group-hover:scale-110 transition-transform transform-gpu">
                    <step.icon size={20} className="sm:w-[22px] sm:h-[22px]" />
                  </div>
                  <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-wider text-[#5C5370] text-center">{step.actionLabel}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* LISTAS E CONSTRUTOR */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          <div className="rounded-[2rem] sm:rounded-[2.5rem] bg-[#FDFBFF] p-5 sm:p-6 border-2 border-white">
            <div className="flex items-center justify-between mb-4 px-1 sm:px-2">
              <h3 className="text-[14px] sm:text-[15px] font-black text-[#2D263B]">{t('section_catalog') || 'Artigos Recentes'}</h3>
              <button onClick={() => handleNavigate('/admin/produtos')} className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#9175E6] bg-[#F8F4FD] px-3 py-1.5 rounded-full hover:bg-[#EAE4FF] transition-colors">
                {t('manage_inventory') || 'Ver Todos'}
              </button>
            </div>
            <div className="space-y-1">
              {ui.activeProducts.length > 0 ? (
                ui.activeProducts.slice(0, 4).map((prod) => <ProductRow key={prod.id} product={prod} onNavigate={handleNavigate} fallbackCurrency={ui.currency} />)
              ) : (
                <div className="py-8 text-center text-[11px] font-bold text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  {t('empty_products_title') || 'Nenhum produto ativo encontrado.'}
                </div>
              )}
            </div>
          </div>

          <div className="relative rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-[#F5E6CC] to-[#E9D1A7] p-5 sm:p-6 overflow-hidden border-2 border-white flex flex-col justify-between min-h-[250px] sm:min-h-[280px]">
            <div className="relative z-10 flex items-center justify-between mb-4">
              <h3 className="text-[14px] sm:text-[15px] font-black text-[#604925]">{t('dashboard_pages_title') || 'Layouts e Design'}</h3>
              <button onClick={() => handleNavigate('/admin/paginas')} className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#A07A3E] bg-white/60 px-3 py-1.5 rounded-full hover:bg-white transition-colors">
                {t('btn_see_all') || 'Ver Todas'}
              </button>
            </div>
            
            <div className="relative z-10 flex-1 space-y-2 mb-5 sm:mb-6">
              {ui.pages.length > 0 ? (
                ui.pages.slice(0, 3).map((page) => <PageRow key={page.id} page={page} onNavigate={handleNavigate} homeLabel={t('page_home') || 'Principal'} subPageLabel={t('store_page_links_page') || 'Sub-página'} />)
              ) : (
                <div className="text-[11px] font-bold text-[#A07A3E]/70 text-center py-4 bg-white/30 rounded-2xl">
                  {t('dashboard_pages_empty') || 'Nenhuma página configurada.'}
                </div>
              )}
            </div>

            <div className="relative z-10 flex items-end justify-between mt-auto">
               <div>
                 <h4 className="text-lg sm:text-xl font-black text-[#3D2D14]">{t('pages_created') || 'Estrutura Web'}</h4>
                 <p className="text-xs sm:text-sm font-bold text-[#806030]">{ui.pageCount} {t('pages_active_online') || 'páginas ativas'}</p>
               </div>
               <button onClick={() => handleNavigate('/admin/paginas')} className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white text-[#A07A3E] hover:scale-105 active:scale-95 transition-transform transform-gpu shrink-0">
                 <Play size={16} fill="currentColor" className="ml-1" />
               </button>
            </div>
            <Layout size={180} className="absolute -right-8 -bottom-8 text-white/20 pointer-events-none" />
          </div>
        </section>

        {/* DETALHES DO SISTEMA */}
        <SystemNodeDetails 
          email={data.owner_email} 
          storeId={data.store.id} 
          createdAt={data.createdAt} 
          lang={language} 
          t={t} 
        />

        {/* CALL TO ACTION FINAL */}
        <ActionBanner onNavigate={handleNavigate} t={t} />

      </div>
    </div>
  );
}

export default memo(Dashboard);