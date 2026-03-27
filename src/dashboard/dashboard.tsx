import  { memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Package, Phone, Home, Layout, ArrowUpRight, BarChart3, Globe,
  ArrowRight, Layers, PlusCircle, Mail, Calendar, Fingerprint,
  Plus, Sparkles, type LucideIcon 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useTranslate } from '../context/LanguageContext';

// --- Interfaces ---
interface Product {
  id: string;
  name: string;
  price: number;
  currency?: string;
  image_url?: string;
  main_image?: string;
  is_active: boolean;
}

interface Page {
  id: string;
  title: string;
  is_home: boolean;
}

interface ActionButtonProps {
  onClick: () => void;
  icon: LucideIcon;
  title: string;
  sub: string;
  colorClass?: string;
  iconBg?: string;
  isSecondary?: boolean;
}

// --- Componente de Botão Otimizado ---
const ActionButton = memo(({ onClick, icon: Icon, title, sub, colorClass, iconBg, isSecondary }: ActionButtonProps) => (
  <button
    onClick={onClick}
    className={`group flex items-center justify-between p-6 rounded-[2.2rem] transition-all active:scale-95 duration-200 ${
      isSecondary ? 'bg-white border border-gray-100 text-gray-900 shadow-sm hover:border-emerald-200' : `${colorClass} text-white shadow-xl shadow-blue-100`
    }`}
    style={{ contain: 'layout style' }} 
  >
    <div className="flex items-center gap-5 text-left">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isSecondary ? iconBg : 'bg-white/10'}`}>
        <Icon size={24} />
      </div>
      <div>
        <h3 className="font-black text-lg uppercase tracking-tight leading-none">{title}</h3>
        <p className={`${isSecondary ? 'text-gray-400' : 'text-blue-200'} text-[10px] mt-1 font-bold tracking-widest uppercase italic`}>{sub}</p>
      </div>
    </div>
    <PlusCircle size={28} className={`${isSecondary ? 'text-emerald-100' : 'opacity-40'} group-hover:opacity-100 transition-opacity`} />
  </button>
));

function Dashboard() {
  const navigate = useNavigate();
  const { t, language } = useTranslate();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['dashboard-pro-complete'],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
  
      if (userError || !user) throw new Error('Não autenticado');
  
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user.id)
        .single();
  
      if (storeError || !store) throw new Error('Loja não encontrada');
  
      const productsQuery = supabase
        .from('products')
        .select('*')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false });
  
      const pagesQuery = supabase
        .from('pages')
        .select('*')
        .eq('store_id', store.id)
        .order('updated_at', { ascending: false });
  
      const [productsRes, pagesRes] = await Promise.all([
        productsQuery,
        pagesQuery
      ]);
  
      if (productsRes.error) throw productsRes.error;
      if (pagesRes.error) throw pagesRes.error;
  
      const products: Product[] = productsRes.data ?? [];
      const pages: Page[] = pagesRes.data ?? [];
  
      return {
        store,
        owner_email: user.email,
        createdAt: store.created_at,
        activeProducts: products.filter(p => p.is_active),
        pausedProducts: products.filter(p => !p.is_active),
        homePage: pages.find(p => p.is_home),
        recentPages: pages.filter(p => !p.is_home).slice(0, 3),
        hasProducts: products.length > 0,
        hasPages: pages.length > 0
      };
    },
  
    staleTime: 5 * 60 * 1000,   // 5 minutos
    refetchOnMount: "always",   // sempre consulta ao voltar para a página
    refetchOnWindowFocus: false // não consulta só por trocar de aba
  });

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-[#fbfbfd]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        <span className="font-black text-gray-400 uppercase tracking-[0.3em] text-[10px]">{t('loading_engine')}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1a1a1a] p-4 md:p-10 antialiased selection:bg-blue-100">
      <div className="max-w-[1400px] mx-auto space-y-10">

        {/* Header */}
        <header className="flex flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 md:gap-5 min-w-0">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
              {data?.store?.logo_url ? (
                <img src={data.store.logo_url} className="w-full h-full object-cover" alt="Logo" />
              ) : (
                <BarChart3 className="text-blue-600" size={24} />
              )}
            </div>
            <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
  <h1 className="text-xl md:text-3xl font-black italic">
    {data?.store?.name || 'Storely.'}
  </h1>
  {isFetching && (
    <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded text-[8px] font-bold text-blue-600 uppercase animate-pulse">
      <Sparkles size={10} />
      {t('loading_engine')}

    </div>
  )}
</div>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[8px] md:text-[10px] font-bold uppercase border border-emerald-100/50">
                  <Phone size={10} />
                  {data?.store?.whatsapp_number || t('no_contact')}
                </span>
                <span className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-[8px] md:text-[10px] font-bold uppercase text-gray-400 truncate max-w-[150px] border border-gray-200/50">
                  <Globe size={10} />
                  {data?.store?.slug ? `${data.store.slug}.storely.app` : '---'}
                </span>
              </div>
            </div>
            
          </div>
          <button onClick={() => navigate('/admin/configuracoes')} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 md:hidden">
            <Fingerprint size={20} />
          </button>
        </header>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ActionButton 
            onClick={() => navigate('/admin/produtos')}
            icon={Package}
            title={t('action_new_product')}
            sub={t('action_new_product_sub')}
            colorClass="bg-blue-600"
          />
          <ActionButton 
            onClick={() => navigate('/admin/paginas')}
            icon={Layout}
            title={t('action_create_page')}
            sub={t('action_create_page_sub')}
            isSecondary
            iconBg="bg-emerald-50 text-emerald-600"
          />
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 space-y-8">
            {/* Catalog Section */}
            <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                <h2 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400">{t('section_catalog')}</h2>
                {data?.hasProducts && (
                  <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <span className="text-[9px] font-black text-emerald-700 uppercase">
                      {data?.activeProducts?.length || 0} {t('status_active')}
                    </span>
                  </div>
                )}
              </div>
              
              {data?.hasProducts ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-50">
                  {data.activeProducts.slice(0, 4).map(prod => (
                    <div key={prod.id} onClick={() => navigate(`/admin/produtos/${prod.id}`)} className="flex items-center gap-5 p-6 bg-white hover:bg-gray-50 transition-colors cursor-pointer group">
                      <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                        <img src={prod.image_url || prod.main_image} className="w-full h-full object-cover" alt={prod.name} loading="lazy" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-gray-900 text-sm truncate uppercase tracking-tight">{prod.name}</h4>
                        <p className="text-blue-600 font-black text-xs mt-1">{prod.price} <span className="text-[10px] uppercase">{prod.currency || 'MZN'}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* INCENTIVO: Sem Produtos */
                <div className="p-6 text-center flex flex-col items-center justify-center space-y-6">
                  <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600">
                    <Sparkles size={40} strokeWidth={1.5} />
                  </div>
                  <div className="max-w-sm">
                    <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">{t('empty_products_title')}</h2>
                    <p className="text-gray-400 text-xs font-medium mt-2 leading-relaxed">{t('empty_products_desc')}</p>
                  </div>
                  <button 
                    onClick={() => navigate('/admin/produtos')}
                    className="flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-colors"
                  >
                    <Plus size={14} /> {t('btn_start_catalog')}
                  </button>
                </div>
              )}
              {data?.hasProducts && (
                <button onClick={() => navigate('/admin/produtos')} className="w-full p-4 bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-widest hover:bg-gray-100 transition-colors italic">{t('manage_inventory')}</button>
              )}
            </section>

            {/* Seção Inativos */}
            {(data?.pausedProducts?.length ?? 0) > 0 && (
              <section className="space-y-4" style={{ contentVisibility: 'auto' }}>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-2">{t('section_paused')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {data?.pausedProducts?.map(prod => (
                    <div key={prod.id} onClick={() => navigate(`/admin/produtos/${prod.id}`)} className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-gray-100 cursor-pointer hover:border-orange-200 transition-all shadow-sm">
                      <div className="w-8 h-8 rounded-xl bg-gray-50 grayscale opacity-40 overflow-hidden shrink-0">
                        <img src={prod.image_url || prod.main_image} className="w-full h-full object-cover" alt={prod.name} />
                      </div>
                      <span className="text-[10px] font-black text-gray-500 uppercase truncate">{prod.name}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar / Páginas */}
          <div className="xl:col-span-4 space-y-6">
            <section className="bg-white p-6 rounded-[2.5rem] border border-gray-100  sticky top-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-black uppercase text-[10px] tracking-[0.2em] text-gray-400">{t('section_estatisticas_larga')}</h2>
                <Layers size={18} className="text-blue-600" />
              </div>

              <div className="space-y-3">
                {data?.hasPages ? (
                  <>
                                 {data.homePage && (
  <div 
  onClick={() => navigate(`/admin/editor/${data.homePage?.id}`)}
      className="p-4 bg-gray-900 rounded-[2.2rem] text-white group cursor-pointer hover:scale-[1.02] transition-all  shadow-gray-200 relative overflow-hidden"
  >
    <div className="relative z-10 flex items-center gap-2">
      <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20">
        <Home size={18} />
      </div>
      <div className="min-w-0">
        <h4 className="font-black text-xs uppercase tracking-tight italic">
          {t('page_home')}
        </h4>
        {/* Título dinâmico da Home formatado como slug */}
        <p className="text-[9px] text-gray-500 font-mono mt-1 tracking-widest uppercase truncate">
        {`/${data.homePage?.title.toLowerCase().replace(/\s+/g, '-')}`}
                </p>
      </div>
    </div>
    <ArrowUpRight 
      size={20} 
      className="absolute right-6 top-1/2 -translate-y-1/2 text-white/10 group-hover:text-blue-500 transition-all" 
    />
  </div>
)}
                    {data.recentPages?.map(page => (
                      <div key={page.id} onClick={() => navigate(`/admin/editor/${page.id}`)} className="flex items-center justify-between p-4 px-6 rounded-2xl bg-gray-50/50 hover:bg-white border border-transparent hover:border-blue-100 transition-all cursor-pointer group">
                        <span className="text-[11px] font-black text-gray-800 uppercase tracking-tight group-hover:text-blue-600 truncate">{page.title}</span>
                        <ArrowRight size={14} className="text-gray-200 group-hover:text-blue-500 shrink-0" />
                      </div>
                    ))}
                  </>
                ) : (
                  /* INCENTIVO: Sem Páginas */
                  <div className="text-center py-6 px-4 border-2 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                      <Layout size={24} />
                    </div>
                    <h3 className="text-xs font-black uppercase text-gray-900 tracking-tight">{t('empty_pages_title')}</h3>
                    <p className="text-[10px] text-gray-400 font-medium mt-1 mb-6 leading-relaxed px-4">{t('empty_pages_desc')}</p>
                    <button 
                      onClick={() => navigate('/admin/paginas')}
                      className="w-full py-3 bg-emerald-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-sm"
                    >
                      {t('modal_library_subtitle')}
                    </button>
                  </div>
                )}
              </div>

              {data?.hasPages && (
                <button onClick={() => navigate('/admin/paginas')} className="mt-8 w-full py-4 bg-gray-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors italic">
                  {t('launch_sitemap')}
                </button>
              )}
            </section>
          </div>
        </div>

        {/* Footer Técnico */}
        <footer className="pt-10 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60 hover:opacity-100 transition-opacity">
          {[
            { icon: Mail, label: t('footer_master_node'), val: data?.owner_email, decor: 'decoration-blue-500/30' },
            { icon: Calendar, label: t('footer_uptime'), val: data?.createdAt ? `${t('uptime_active')} ${formatDistanceToNow(new Date(data.createdAt), { locale: language === 'pt' ? pt : undefined })}` : '---', decor: 'decoration-emerald-500/30' },
            { icon: Fingerprint, label: t('footer_store_key'), val: `#${data?.store?.id?.split('-')[0]}`, decor: 'decoration-purple-500/30' }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 bg-white p-5 rounded-[2rem] border border-gray-50 shadow-sm">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><item.icon size={18} /></div>
              <div className="min-w-0">
                <p className={`text-[8px] font-black text-gray-400 uppercase italic underline ${item.decor}`}>{item.label}</p>
                <p className="text-[11px] font-bold text-gray-700 truncate">{item.val}</p>
              </div>
            </div>
          ))}
        </footer>
      </div>
    </div>
  );
}

export default memo(Dashboard);