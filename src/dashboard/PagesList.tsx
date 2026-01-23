import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Plus, FileText, Loader2, Home, 
  LayoutTemplate, X, Mail, Layout, Star, ArrowRight,
} from 'lucide-react';
import { useAdminStore } from '../hooks/useAdminStore';
import { supabase } from '../lib/supabase';

const TEMPLATES = {
  home: { 
    label: 'Landing Page Comercial', 
    icon: <Home size={24} />,
    description: 'Focado em conversão e apresentação de serviços.',
    sections: [
      { 
        type: 'hero_comercial', 
        content: { title: 'Elevamos o seu Negócio', sub: 'Soluções profissionais sob medida para o mercado de Moçambique.' }, 
        style: { theme: 'dark', align: 'center', fontSize: 'medium' },
        order_index: 0 
      },
      { 
        type: 'estatisticas_larga', 
        content: {}, 
        style: { theme: 'dark', fontSize: 'small' },
        order_index: 1 
      },
      { 
        type: 'servicos_modern', 
        content: { items: [{}, {}, {}] }, 
        style: { theme: 'light', cols: '3', fontSize: 'medium' },
        order_index: 2 
      },
      { 
        type: 'testemunhos_focados', 
        content: {}, 
        style: { theme: 'light', fontSize: 'medium' },
        order_index: 3 
      },
      { 
        type: 'contacto_mapa', 
        content: {}, 
        style: { theme: 'light', fontSize: 'medium' },
        order_index: 4 
      }
    ] 
  },
  produtos: { 
    label: 'Portfólio & Galeria', 
    icon: <LayoutTemplate size={24} />,
    description: 'Ideal para fotógrafos, arquitetos ou catálogos.',
    sections: [
      { 
        type: 'hero_comercial', 
        content: { title: 'Nosso Portfólio', sub: 'Explore os nossos projetos mais recentes.' }, 
        style: { theme: 'light', align: 'left', fontSize: 'small' },
        order_index: 0 
      },
      { 
        type: 'galeria_grid', 
        content: { images: [{}, {}, {}, {}, {}, {}, {}, {}] }, 
        style: { theme: 'light', cols: '4' },
        order_index: 1 
      },
      { 
        type: 'precos_moderno', 
        content: {}, 
        style: { theme: 'light', fontSize: 'small' },
        order_index: 2 
      }
    ] 
  },
  contactos: { 
    label: 'Página de Suporte', 
    icon: <Mail size={24} />,
    description: 'Central de ajuda e contactos diretos.',
    sections: [
      { 
        type: 'hero_comercial', 
        content: { title: 'Como podemos ajudar?', sub: 'Estamos disponíveis para responder às suas questões.' }, 
        style: { theme: 'dark', align: 'center', fontSize: 'small' },
        order_index: 0 
      },
      { 
        type: 'faq_clean', 
        content: {}, 
        style: { theme: 'light', fontSize: 'medium' },
        order_index: 1 
      },
      { 
        type: 'contacto_mapa', 
        content: {}, 
        style: { theme: 'light', fontSize: 'medium' },
        order_index: 2 
      }
    ] 
  },
  blank: { 
    label: 'Página Limpa', 
    icon: <Plus size={24} />,
    description: 'Comece com uma estrutura vazia.',
    sections: [] 
  }
};
export function PagesList() {
    const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPage, setNewPage] = useState({ slug: '', type: 'home' });

  const { data: store, isLoading: storeLoading } = useAdminStore();

  const { data: pages, isLoading: pagesLoading } = useQuery({
    queryKey: ['pages', store?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('store_id', store?.id)
        .order('is_home', { ascending: false }); 
      if (error) throw error;
      return data || [];
    },
    enabled: !!store?.id,
  });

  // --- LÓGICA DE DEFINIR HOME ---
  // --- LÓGICA DE DEFINIR HOME ---
const setAsHome = useMutation({
  mutationFn: async (pageId: string) => {
    if (!store?.id) throw new Error("ID da loja não encontrado");

    // PASSO 1: Resetar todas as páginas da loja
    const { error: clearError } = await supabase
      .from('pages')
      .update({ is_home: false })
      .eq('store_id', store.id)
      .eq('is_home', true);

    if (clearError) throw clearError;

    // PASSO 2: Definir a nova página escolhida como home
    const { error: setError } = await supabase
      .from('pages')
      .update({ is_home: true })
      .eq('id', pageId);

    if (setError) throw setError;
    
    return pageId;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['pages', store?.id] });
  },
  // FIX: Using Error type instead of any
  onError: (error: Error) => {
    alert("Erro no banco: " + error.message);
  }
});

  const createPage = useMutation({
    mutationFn: async ({ slug, type }: { slug: string, type: string }) => {
      const isFirstPage = !pages || pages.length === 0;
      const { data: page, error: pError } = await supabase
        .from('pages')
        .insert([{ 
          store_id: store?.id, 
          slug: slug.toLowerCase().trim().replace(/\s+/g, '-'),
          type: type,
          is_home: isFirstPage,
          title: slug 
        }])
        .select().single();

      if (pError) throw pError;

      const templateSections = TEMPLATES[type as keyof typeof TEMPLATES]?.sections || [];
      if (templateSections.length > 0) {
        await supabase.from('page_sections').insert(
          templateSections.map(s => ({ ...s, page_id: page.id }))
        );
      }
      return page;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages', store?.id] });
      setIsModalOpen(false);
      setNewPage({ slug: '', type: 'home' });
    }
  });

  if (storeLoading || pagesLoading) return (
    <div className="h-96 flex flex-col items-center justify-center animate-pulse">
      <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Carregando Ecossistema...</span>
    </div>
  );

  return (
    <div className="p-4 md:p-12 max-w-6xl mx-auto min-h-screen">
      
      {/* HEADER MELHORADO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{store?.name} • Online</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 uppercase italic">
            Páginas <span className="text-blue-600 not-italic">.</span>
          </h1>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="group bg-slate-900 text-white pl-8 pr-6 py-5 rounded-[2.5rem] flex items-center gap-4 hover:bg-blue-600 transition-all shadow-2xl shadow-slate-200 active:scale-95"
        >
          <span className="font-black text-[11px] uppercase tracking-widest">Criar nova experiência</span>
          <div className="bg-white/10 p-2 rounded-full group-hover:rotate-90 transition-transform">
            <Plus size={20} />
          </div>
        </button>
      </div>

      {/* LISTAGEM COM LAYOUT DE CARTÕES PROFISSIONAIS */}
      <div className="grid grid-cols-1 gap-4">
        {pages?.length === 0 ? (
          <div className="border-4 border-dashed border-slate-100 rounded-[3rem] p-20 text-center">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Layout size={32} />
            </div>
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Nenhuma página encontrada</p>
          </div>
        ) : (
          pages?.map(page => (
            <div 
              key={page.id} 
              className={`relative group p-1 rounded-[2.5rem] transition-all duration-500 ${
                page.is_home 
                ? 'bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-xl shadow-blue-100' 
                : 'bg-slate-100 hover:bg-slate-200'
              }`}
            >
              <div className="bg-white px-8 py-7 rounded-[2.4rem] flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center transition-all duration-500 ${
                    page.is_home ? 'bg-blue-600 text-white rotate-6' : 'bg-slate-50 text-slate-400 group-hover:bg-white'
                  }`}>
                    {page.is_home ? <Home size={28} /> : <FileText size={28} />}
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">
                        /{page.slug}
                      </h3>
                      {page.is_home && (
                        <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
                          <Star size={10} fill="currentColor" />
                          <span className="text-[9px] font-black uppercase tracking-tighter">Principal</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <LayoutTemplate size={12} className="text-blue-500" />
                      Template: {page.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                 {!page.is_home && (
  <button 
    onClick={() => setAsHome.mutate(page.id)}
    disabled={setAsHome.isPending}
    className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
      ${setAsHome.isPending ? 'opacity-50 cursor-wait' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
  >
    {setAsHome.isPending && setAsHome.variables === page.id ? (
      <Loader2 size={14} className="animate-spin" />
    ) : (
      <Home size={14} /> 
    )}
    Tornar Home
  </button>
)}
                  
                  <div className="h-8 w-px bg-slate-100 mx-2 hidden md:block" />

                  <Link 
                    to={`/admin/editor/${page.id}`} 
                    className="flex items-center gap-3 bg-slate-900 text-white pl-6 pr-4 py-4 rounded-2xl hover:bg-blue-600 transition-all group/btn active:scale-95"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">Editar Conteúdo</span>
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL DE CRIAÇÃO (DESIGN REFINADO) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl relative border border-white/20">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-2 text-slate-300 hover:text-slate-900 transition-colors">
              <X size={24} />
            </button>

            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8">
              Nova <span className="text-blue-600">Página</span>
            </h2>

            <div className="space-y-8">
              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 group-focus-within:text-blue-600 transition-colors">Identificador na URL</label>
                <div className="flex items-center bg-slate-50 rounded-2xl px-6 focus-within:ring-2 ring-blue-500 transition-all">
                  <span className="text-slate-300 font-bold mr-2">/</span>
                  <input 
                    type="text" 
                    placeholder="ex: servicos-vip"
                    className="w-full py-5 bg-transparent border-none outline-none font-bold text-slate-800 placeholder:text-slate-200"
                    value={newPage.slug}
                    onChange={e => setNewPage({...newPage, slug: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">Estrutura Inicial</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(TEMPLATES).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => setNewPage({...newPage, type: key})}
                      className={`p-5 rounded-4xl border-2 text-left transition-all ${
                        newPage.type === key 
                        ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-50' 
                        : 'border-slate-50 hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${newPage.type === key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {value.icon}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest block mb-1">{value.label}</span>
                      <p className="text-[9px] font-bold text-slate-400 leading-tight uppercase opacity-60">{value.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                disabled={!newPage.slug || createPage.isPending}
                onClick={() => createPage.mutate(newPage)}
                className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl hover:bg-blue-600 disabled:opacity-20 transition-all flex items-center justify-center gap-3"
              >
                {createPage.isPending ? <Loader2 className="animate-spin" /> : 'Confirmar e Instanciar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}