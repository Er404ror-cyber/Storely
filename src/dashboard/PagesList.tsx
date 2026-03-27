import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2, Home, Layout, AlertCircle, Search, Globe } from 'lucide-react';

import { useAdminStore } from '../hooks/useAdminStore';
import { supabase } from '../lib/supabase';
import { useTemplates } from './templetes'; 
import { Section } from '../components/pageslist/Section';
import { PageRow } from '../components/pageslist/PageRow';
import { NewPageModal } from '../components/pageslist/NewPageModal';
import { EmptyPages } from '../components/pageslist/EmptyPages';
import { notify } from '../utils/toast';
import { useTranslate } from '../context/LanguageContext';
import { MAX_PAGES } from '../utils/maxSections';


export function PagesList() {
  const { t } = useTranslate();
  const queryClient = useQueryClient();
  
  // Estados de Controle
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newPage, setNewPage] = useState({ slug: '', type: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const TEMPLATES = useTemplates();
  const { data: store, isLoading: storeLoading } = useAdminStore();

  // Busca de Páginas
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

  // Lógica de Organização e Conflitos
  const organized = useMemo(() => {
    const initial = { homePage: null, grouped: {}, conflicts: [], total: 0, originalTotal: 0 };
    if (!pages) return initial;
    
    const filtered = pages.filter(p => p.slug.toLowerCase().includes(searchQuery.toLowerCase()));
    const slugs = pages.map(p => p.slug.toLowerCase());
    const duplicates = new Set(slugs.filter((s, i) => slugs.indexOf(s) !== i));

    const conflicts = filtered.filter(p => duplicates.has(p.slug.toLowerCase()));
    const conflictIds = new Set(conflicts.map(p => p.id));
    const safePages = filtered.filter(p => !conflictIds.has(p.id));

    return {
      total: filtered.length,
      originalTotal: pages.length || 0,
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

  const isLimitReached = (pages?.length || 0) >= MAX_PAGES;

  // Mutações
  const createPage = useMutation({
    mutationFn: async ({ slug, type }: { slug: string, type: string }) => {
      if (isLimitReached) throw new Error('LIMIT_EXCEEDED');

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
      notify.success(t('page_deployed') || 'Page Deployed!');
      setIsModalOpen(false);
      setNewPage({ slug: '', type: '' });
      queryClient.invalidateQueries({ queryKey: ['pages', store?.id] });
    },
    onError: (err: any) => {
      if (err.message === 'LIMIT_EXCEEDED') {
        notify.error(t('limit_error') || `Maximum of ${MAX_PAGES} pages reached.`);
      } else {
        notify.error(t('slug_error') || 'Path conflict!');
      }
    }
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
      const { error, count } = await supabase.from('pages').delete({ count: 'exact' }).eq('id', id);
      if (error) throw error;
      if (count === 0) throw new Error("DB error");
      return id;
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['pages'] });
      notify.success('Removed!');
    },
    onError: (err: any) => notify.error(err.message)
  });

  // Renderização de Loading
  if (storeLoading || pagesLoading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('loading_engine')}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <nav className="w-full bg-white border-b border-slate-200 px-6 md:px-12 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 p-2.5 rounded-[18px] text-white shadow-2xl shadow-slate-300">
            <Layout size={16} />
          </div>
          <div>
            <h2 className="font-black text-lg md:text-xl tracking-tighter uppercase italic">{store?.name}</h2>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[8px] font-black text-slate-400 tracking-widest uppercase">{t('updated_status')}</p>
            </div>
          </div>
        </div>
        
        <button 
          disabled={isLimitReached}
          onClick={() => !isLimitReached && setIsModalOpen(true)} 
          className={`px-4 py-3 rounded-2xl font-black text-xs md:text-sm transition-all flex items-center gap-2 shadow-lg ${
            isLimitReached 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-indigo-100'
          }`}
        >
          {isLimitReached ? <AlertCircle size={18} /> : <Plus size={20} />}
          <span>{isLimitReached ? `${pages?.length}/${MAX_PAGES}` : t('new_page')}</span>
        </button>
      </nav>

      <main className="max-w-6xl mx-auto px-4 pt-12 pb-20">
        {organized.originalTotal > 0 && (
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
            <div className="relative w-full md:w-[450px]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={22} />
              <input 
                className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-3xl shadow-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700" 
                placeholder={t('search_placeholder')} 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>
            
            <div className="px-8 py-4 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center gap-4">
              <div className="text-center border-r border-slate-100 pr-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('active_assets')}</p>
                <div className="flex items-baseline gap-1">
                  <p className={`text-xl font-black ${isLimitReached ? 'text-amber-500' : 'text-indigo-600'}`}>
                    {organized.originalTotal}
                  </p>
                  <span className="text-[10px] font-bold text-slate-300">/ {MAX_PAGES}</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('status_label')}</p>
                <p className="text-xs font-black text-emerald-500 uppercase">{t('operational')}</p>
              </div>
            </div>
          </div>
        )}

        {organized.total === 0 ? (
          <EmptyPages 
            onCreateClick={() => !isLimitReached && setIsModalOpen(true)} 
            isSearching={!!searchQuery} 
          />
        ) : (
          <div className="animate-in fade-in duration-700 space-y-10">
            {organized.conflicts.length > 0 && (
              <Section title={t('link_conflict')} icon={<AlertCircle className="text-red-500" size={18} />} count={organized.conflicts.length} variant="danger">
                {organized.conflicts.map((p: any) => (
                  <PageRow key={p.id} page={p} storeSlug={store?.slug} isConflict editingState={{editingId, setEditingId, editValue, setEditValue}} {...{setAsHome, updateSlug, deletePage}} />
                ))}
              </Section>
            )}

            {organized.homePage && (
              <Section title={t('primary_infrastructure')} icon={<Home className="text-indigo-600" size={18} />}>
                <PageRow page={organized.homePage} storeSlug={store?.slug} isConflict={false} editingState={{editingId, setEditingId, editValue, setEditValue}} {...{setAsHome, updateSlug, deletePage}} />
              </Section>
            )}

            {Object.entries(organized.grouped).map(([type, items]: any) => (
              <Section key={type} title={TEMPLATES[type as keyof typeof TEMPLATES]?.label || type} icon={<div className="text-slate-400">{TEMPLATES[type as keyof typeof TEMPLATES]?.icon || <Globe size={18}/>}</div>} count={items.length}>
                {items.map((p: any) => (
                  <PageRow key={p.id} page={p} storeSlug={store?.slug} isConflict={false} editingState={{editingId, setEditingId, editValue, setEditValue}} {...{setAsHome, updateSlug, deletePage}} />
                ))}
              </Section>
            ))}
          </div>
        )}
      </main>

      <NewPageModal
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        newPage={newPage}
        setNewPage={setNewPage}
        createPage={createPage}
        templates={TEMPLATES}
        storeSlug={store?.slug}
      />
    </div>
  );
}