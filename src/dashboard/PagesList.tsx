import { useState, useMemo, memo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Plus, Loader2, Home, X, Layout, ArrowRight,
  Trash2, Edit3, AlertCircle, Search, 
  Check, Globe, Copy, Star
} from 'lucide-react';
import toast from 'react-hot-toast'; 
import { useAdminStore } from '../hooks/useAdminStore';
import { supabase } from '../lib/supabase';
import { TEMPLATES } from './templetes';

const BASE_DOMAIN = "http://storelyy.vercel.app";

// --- CUSTOM TOAST STYLES ---
const notify = {
  success: (msg: string) => toast.success(msg, {
    style: {
      border: '1px solid #6366f1',
      padding: '16px',
      color: '#fff',
      background: 'rgba(15, 23, 42, 0.9)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      fontWeight: 'bold',
      fontSize: '14px'
    },
    iconTheme: { primary: '#6366f1', secondary: '#fff' },
  }),
  error: (msg: string) => toast.error(msg, {
    style: {
      border: '1px solid #ef4444',
      padding: '16px',
      color: '#fff',
      background: 'rgba(15, 23, 42, 0.9)',
      borderRadius: '20px',
      fontWeight: 'bold',
      fontSize: '14px'
    },
  })
};

// --- SUPPORTING COMPONENTS ---

const Section = memo(({ title, icon, count, children, variant = 'default' }: any) => (
  <section className="mb-10 animate-in fade-in slide-in-from-bottom-2 duration-500 will-change-transform">
    <div className="flex items-center gap-2 mb-4 px-2">
      <span className="shrink-0">{icon}</span>
      <h3 className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 ${variant === 'danger' ? 'text-red-600' : 'text-slate-400'}`}>
        {title} {count !== undefined && <span className="opacity-50">({count})</span>}
      </h3>
      <div className="h-[1px] flex-1 bg-slate-200 ml-2 opacity-50"></div>
    </div>
    <div className="space-y-3">{children}</div>
  </section>
));

const PageRow = memo(({ page, storeSlug, isConflict, setAsHome, updateSlug, deletePage, editingState }: any) => {
  const { editingId, setEditingId, editValue, setEditValue } = editingState;
  const isEditing = editingId === page.id;
  const storePath = storeSlug || 'store';
  const fullUrl = `${BASE_DOMAIN}/${storePath}/${page.slug}`;
  
  const handleCancel = useCallback(() => {
    setEditingId(null);
    setEditValue('');
  }, [setEditingId, setEditValue]);

  // Melhora na função de cópia para garantir compatibilidade
  const fallbackCopy = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
  
    textArea.focus();
    textArea.select();
  
    try {
      document.execCommand("copy");
      notify.success("Link copiado!");
    } catch {
      notify.error("Erro ao copiar link");
    }
  
    document.body.removeChild(textArea);
  };
  
  const copyUrl = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(fullUrl);
        notify.success("Link copiado!");
      } else {
        fallbackCopy(fullUrl);
      }
    } catch {
      fallbackCopy(fullUrl);
    }
  }, [fullUrl]);
  

  return (
    <div className={`group bg-white border rounded-[24px] p-5 flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 transition-all duration-300 ${
      isConflict ? 'border-red-200 bg-red-50/40 ring-2 ring-red-100' : 'border-slate-200 hover:border-indigo-400'
    }`}>
      
      {/* SEÇÃO SUPERIOR: Ícone e Info */}
      <div className="md:col-span-7 flex items-start gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
          page.is_home ? 'bg-indigo-600 text-white shadow-lg' : isConflict ? 'bg-red-100 text-red-600' : 'bg-slate-50 text-slate-400'
        }`}>
          {page.is_home ? <Home size={22} /> : isConflict ? <AlertCircle size={22} /> : <Globe size={22} />}
        </div>
        
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
              <input 
                autoFocus
                className="w-full bg-slate-100 px-4 py-3 rounded-xl text-base font-bold outline-none text-indigo-700 border-2 border-indigo-500"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
              />
              <div className="flex gap-2">
                <button onClick={() => updateSlug.mutate({ id: page.id, newSlug: editValue })} className="flex-1 sm:flex-none p-3 bg-indigo-600 text-white rounded-xl flex justify-center"><Check size={20} /></button>
                <button onClick={handleCancel} className="flex-1 sm:flex-none p-3 bg-slate-200 text-slate-600 rounded-xl flex justify-center"><X size={20} /></button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-black tracking-tight truncate ${isConflict ? 'text-red-700' : 'text-slate-900'}`}>/{page.slug}</span>
                {page.is_home && <span className="bg-indigo-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md">Primary</span>}
              </div>
              {/* Botão de cópia com área de clique maior no mobile */}
              <button 
                onClick={copyUrl} 
                className="flex items-center gap-2 mt-2 py-1 text-slate-400 hover:text-indigo-600 active:opacity-50 transition-all"
              >
                <span className="text-xs font-bold truncate opacity-60">storelyy/{storePath}/{page.slug}</span>
                <Copy size={14} className="shrink-0" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* SEÇÃO INFERIOR: Ações */}
      <div className="md:col-span-5 flex items-center justify-between md:justify-end gap-2 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
        
        {/* Lado Esquerdo (Mobile): Opções de Perigo/Edição */}
        <div className="flex items-center gap-1">
          {!isEditing && (
            <>
              <button onClick={() => { setEditingId(page.id); setEditValue(page.slug); }} className="p-4 text-slate-400 hover:text-indigo-600"><Edit3 size={20} /></button>
              {!page.is_home && <button onClick={() => setAsHome.mutate(page.id)} className="p-4 text-slate-300 hover:text-amber-500"><Star size={20} /></button>}
              {/* Lixo afastado do botão de Design no mobile */}
              {!page.is_home && !isEditing && (
  <button 
    onClick={() => {
      // Confirmação antes de disparar a mutação
      const confirmou = window.confirm("Excluir esta página permanentemente?");
      if (confirmou) {
        deletePage.mutate(page.id);
      }
    }} 
    className="p-4 text-slate-400 hover:text-red-500 active:bg-red-50 rounded-2xl transition-all"
    title="Apagar página"
  >
    <Trash2 size={20} />
  </button>
)}
            </>
          )}
        </div>

        {/* Lado Direito: Ação Principal */}
        <Link 
          to={`/admin/editor/${page.id}`} 
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[13px] font-black hover:bg-indigo-600 transition-all flex items-center gap-2 active:scale-95 shadow-xl shadow-slate-200"
        >
          DESIGN <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
});

// --- MAIN PAGE ---

export function PagesList() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newPage, setNewPage] = useState({ slug: '', type: 'agency' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const { data: store, isLoading: storeLoading } = useAdminStore();

  const { data: pages, isLoading: pagesLoading } = useQuery({
    queryKey: ['pages', store?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('pages').select('*').eq('store_id', store?.id).order('is_home', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!store?.id,
  });

  const createPage = useMutation({
    mutationFn: async ({ slug, type }: { slug: string, type: string }) => {
      const formattedSlug = slug.toLowerCase().trim().replace(/\s+/g, '-');
      const { data: page, error: pError } = await supabase.from('pages').insert([{ 
        store_id: store?.id, 
        slug: formattedSlug, 
        type, 
        is_home: !pages?.length, 
        title: slug 
      }]).select().single();
      
      if (pError) throw pError;
      
      const sections = TEMPLATES[type as keyof typeof TEMPLATES]?.sections || [];
      if (sections.length > 0) {
        await supabase.from('page_sections').insert(sections.map(s => ({ ...s, page_id: page.id })));
      }
      return page;
    },
    onSuccess: () => {
      notify.success('Page Deployed!');
      setIsModalOpen(false);
      setNewPage({ slug: '', type: 'agency' });
      queryClient.invalidateQueries({ queryKey: ['pages', store?.id] });
    },
    onError: () => notify.error('Path conflict! Try another.')
  });

  const updateSlug = useMutation({
    mutationFn: async ({ id, newSlug }: { id: string, newSlug: string }) => {
      const formatted = newSlug.toLowerCase().trim().replace(/\s+/g, '-');
      const { error } = await supabase.from('pages').update({ slug: formatted }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      notify.success('Path Updated!');
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ['pages', store?.id] });
    },
    onError: () => notify.error('Slug already exists.')
  });

  const setAsHome = useMutation({
    mutationFn: async (pageId: string) => {
      await supabase.from('pages').update({ is_home: false }).eq('store_id', store?.id);
      await supabase.from('pages').update({ is_home: true }).eq('id', pageId);
    },
    onSuccess: () => {
      notify.success('Primary Changed!');
      queryClient.invalidateQueries({ queryKey: ['pages', store?.id] });
    }
  });

  const deletePage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pages').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      notify.success('Página removida!');
      queryClient.invalidateQueries({ queryKey: ['pages', store?.id] });
    },
    onError: (err) => {
      notify.error('Erro ao deletar no banco de dados');
      console.error(err);
    }
  });

  const organized = useMemo(() => {
    if (!pages) return { homePage: null, grouped: {}, conflicts: [], total: 0 };
    
    const filtered = pages.filter(p => p.slug.toLowerCase().includes(searchQuery.toLowerCase()));
    const slugs = pages.map(p => p.slug.toLowerCase());
    const duplicates = new Set(slugs.filter((s, i) => slugs.indexOf(s) !== i));

    const conflicts = filtered.filter(p => duplicates.has(p.slug.toLowerCase()));
    const conflictIds = new Set(conflicts.map(p => p.id));
    const safePages = filtered.filter(p => !conflictIds.has(p.id));

    return {
      total: filtered.length,
      conflicts,
      homePage: safePages.find(p => p.is_home),
      grouped: safePages.reduce((acc, p) => {
        if (p.is_home) return acc;
        const type = p.type || 'others';
        if (!acc[type]) acc[type] = [];
        acc[type].push(p);
        return acc;
      }, {} as Record<string, any[]>)
    };
  }, [pages, searchQuery]);

  if (storeLoading || pagesLoading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900  md:py-0">
      
      <nav className="w-full bg-white border-b border-slate-200 px-6 md:px-12 py-3 flex items-center justify-between">
  <div className="flex items-center gap-4">
    <div className="bg-slate-900 p-2.5 rounded-[18px] text-white shadow-2xl shadow-slate-300">
      <Layout size={16} />
    </div>
    <div>
      <h2 className="font-black text-lg md:text-xl tracking-tighter uppercase italic">{store?.name}</h2>
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <p className="text-[8px] font-black text-slate-400 tracking-widest uppercase">Updated</p>
      </div>
    </div>
  </div>
  
  <button 
    onClick={() => setIsModalOpen(true)} 
    className="bg-indigo-600 text-white px-3 py-3 rounded-2xl font-black text-xs md:text-sm hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-200 flex items-center gap-2"
  >
    <Plus size={20} /> <span>NEW PAGE</span>
  </button>
</nav>

      <main className="max-w-6xl mx-auto px-4 pt-12">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
          <div className="relative w-full md:w-[450px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={22} />
            <input 
              className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-3xl shadow-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700" 
              placeholder="Search Pages..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
          <div className="px-8 py-4 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="text-center border-r border-slate-100 pr-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Assets</p>
              <p className="text-xl font-black text-indigo-600">{organized.total}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
              <p className="text-xs font-black text-emerald-500 uppercase">Operational</p>
            </div>
          </div>
        </div>

        {organized.conflicts.length > 0 && (
          <Section title="Link duplicated. Please rename" icon={<AlertCircle className="text-red-500" size={18} />} count={organized.conflicts.length} variant="danger">
            {organized.conflicts.map((p: any) => <PageRow key={p.id} page={p} storeSlug={store?.slug} isConflict editingState={{editingId, setEditingId, editValue, setEditValue}} {...{setAsHome, updateSlug, deletePage}} />)}
          </Section>
        )}

        {organized.homePage && (
          <Section title="Primary Infrastructure (Home)" icon={<Home className="text-indigo-600" size={18} />}>
            <PageRow page={organized.homePage} storeSlug={store?.slug} editingState={{editingId, setEditingId, editValue, setEditValue}} {...{setAsHome, updateSlug, deletePage}} />
          </Section>
        )}

        {Object.entries(organized.grouped).map(([type, items]: any) => (
          <Section key={type} title={TEMPLATES[type as keyof typeof TEMPLATES]?.label || type} icon={<div className="text-slate-400">{TEMPLATES[type as keyof typeof TEMPLATES]?.icon || <Globe size={18}/>}</div>} count={items.length}>
            {items.map((p: any) => <PageRow key={p.id} page={p} storeSlug={store?.slug} editingState={{editingId, setEditingId, editValue, setEditValue}} {...{setAsHome, updateSlug, deletePage}} />)}
          </Section>
        ))}
      </main>

      {/* NEW ASSET MODAL - SIDEBAR (PC) / DRAWER (MOBILE) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-stretch md:justify-end bg-slate-900/40  animate-in fade-in duration-500">
          
          {/* Lógica de Fechamento ao clicar fora (Overlay) */}
          <div className="absolute inset-0 -z-10" onClick={() => setIsModalOpen(false)} />

          <div className="bg-white w-full md:w-[500px] h-[90vh] md:h-screen rounded-t-[2.5rem] md:rounded-l-[3rem] md:rounded-tr-none shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-full md:slide-in-from-right-full duration-500 ease-out will-change-transform">
            
            {/* HANDLE DE ARRASTE (Mobile) / FECHAR (Desktop) */}
            <div className="flex justify-center py-4 md:hidden shrink-0 cursor-grab active:cursor-grabbing" onClick={() => setIsModalOpen(false)}>
              <div className="w-16 h-1.5 bg-slate-200 rounded-full hover:bg-slate-300 transition-colors" />
            </div>

            {/* HEADER OTIMIZADO */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <div className="min-w-0">
                <h2 className="text-xl font-black tracking-tight italic">New Deployment</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Configuring Page</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  disabled={!newPage.slug || createPage.isPending} 
                  onClick={() => createPage.mutate(newPage)} 
                  className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.1em] disabled:opacity-20 hover:bg-indigo-600 active:scale-95 transition-all shadow-xl shadow-slate-200 flex items-center gap-2"
                >
                  {createPage.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Deploy now'}
                </button>
                {/* Botão fechar discreto para PC */}
                <button onClick={() => setIsModalOpen(false)} className="hidden md:flex p-3 bg-slate-50 text-slate-400 hover:text-red-500 rounded-2xl transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* BODY COM INDICADOR DE SCROLL */}
            <div className="relative flex-1 flex flex-col min-h-0">
              <div className="p-8 space-y-10 overflow-y-auto overscroll-contain flex-1 custom-scrollbar scroll-smooth">
                
                {/* URL PATH */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end px-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Destination Path</label>
                    <span className="text-[9px] font-bold text-indigo-400">Required</span>
                  </div>
                  <div className="flex items-center bg-slate-50 border-2 border-slate-100 rounded-[24px] focus-within:ring-8 focus-within:ring-indigo-500/5 focus-within:bg-white focus-within:border-indigo-500 transition-all overflow-hidden group">
                    <div className="flex items-center text-slate-400 font-bold text-xs pl-6 pr-2 shrink-0 border-r border-slate-100 bg-slate-100/30">
                      <span className="text-slate-900 truncate max-w-[50px]">{store?.slug}</span>
                      <span className="opacity-30">/</span>
                    </div>
                    <input 
                      className="w-full bg-transparent px-5 py-5 text-slate-900 font-black text-lg outline-none placeholder:font-normal placeholder:opacity-20" 
                      placeholder="offer-name" 
                      value={newPage.slug} 
                      onChange={(e) => setNewPage({...newPage, slug: e.target.value})} 
                    />
                  </div>
                </div>

                {/* ARCHITECTURE SELECT */}
                <div className="space-y-5 ">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Blueprint Architecture</label>
                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(TEMPLATES).map(([key, val]) => (
                      <button 
                        key={key} 
                        onClick={() => setNewPage({...newPage, type: key})} 
                        className={`flex items-center gap-6 p-6 rounded-[28px] border-2 transition-all text-left active:scale-[0.97] will-change-transform ${
                          newPage.type === key 
                          ? 'border-indigo-600 bg-indigo-50/40 shadow-inner' 
                          : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                          newPage.type === key ? 'bg-indigo-600 text-white rotate-6 shadow-lg shadow-indigo-200' : 'bg-white text-slate-400 border border-slate-100'
                        }`}>
                          {val.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`text-sm font-black uppercase tracking-tight transition-colors ${newPage.type === key ? 'text-indigo-900' : 'text-slate-700'}`}>{val.label}</div>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1 line-clamp-2">{val.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* GRADIENTE DE SCROLL (Visual que indica que tem mais conteúdo) */}
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none opacity-100" />
            </div>

            {/* FOOTER - CANCELAR */}
            <div className="px-8 py-2 md:py-8 bg-white border-t border-slate-100 shrink-0 pb-2 md:pb-8">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-full py-5 rounded-[22px] border-2 border-slate-100 bg-red-50 text-[11px] font-black text-red-500 uppercase tracking-[0.2em] hover:text-slate-100 hover:border-red-100 hover:bg-red-700 transition-all active:scale-95"
              >
                Cancel 
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}