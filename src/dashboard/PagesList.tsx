import { useState, useMemo, useDeferredValue, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, AlertCircle, Home, FileCode2 } from 'lucide-react';

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
import { PagesHero } from '../components/pageslist/pagesHero';

interface PageItem {
  id: string;
  store_id: string;
  slug: string;
  type?: string;
  is_home?: boolean;
  title?: string;
  [key: string]: unknown;
}

interface OrganizedPages {
  total: number;
  originalTotal: number;
  conflicts: PageItem[];
  homePage: PageItem | null;
  grouped: Record<string, PageItem[]>;
}

export function PagesList() {
  const { t } = useTranslate();
  const queryClient = useQueryClient();
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const deferredSearch = useDeferredValue(searchQuery);

  const [newPage, setNewPage] = useState<{ slug: string; type: string }>({ slug: '', type: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  
  const TEMPLATES = useTemplates();
  const { data: store, isLoading: storeLoading } = useAdminStore();

  const { data: pages, isLoading: pagesLoading } = useQuery<PageItem[]>({
    queryKey: ['pages', store?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('store_id', store?.id)
        .order('is_home', { ascending: false });
      if (error) throw error;
      return (data as PageItem[]) || [];
    },
    enabled: !!store?.id,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  const organized = useMemo<OrganizedPages>(() => {
    const initial: OrganizedPages = { homePage: null, grouped: {}, conflicts: [], total: 0, originalTotal: 0 };
    if (!pages || pages.length === 0) return initial;
    
    const query = deferredSearch.toLowerCase().trim();
    const filtered = query ? pages.filter(p => p.slug?.toLowerCase().includes(query)) : pages;
    
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    for (let i = 0; i < pages.length; i++) {
      const s = pages[i].slug?.toLowerCase();
      if (s) {
        if (seen.has(s)) duplicates.add(s);
        else seen.add(s);
      }
    }

    const conflicts: PageItem[] = [];
    const safePages: PageItem[] = [];

    for (let i = 0; i < filtered.length; i++) {
      const p = filtered[i];
      if (p.slug && duplicates.has(p.slug.toLowerCase())) {
        conflicts.push(p);
      } else {
        safePages.push(p);
      }
    }

    const foundHome = safePages.find(p => p.is_home === true) || pages.find(p => p.is_home === true) || safePages[0];

    const grouped: Record<string, PageItem[]> = {};
    for (let i = 0; i < safePages.length; i++) {
      const p = safePages[i];
      if (p.id !== foundHome?.id) {
        const type = p.type || 'others';
        if (!grouped[type]) grouped[type] = [];
        grouped[type].push(p);
      }
    }

    return {
      total: filtered.length,
      originalTotal: pages.length,
      conflicts,
      homePage: foundHome || null,
      grouped
    };
  }, [pages, deferredSearch]);

  const isLimitReached = (pages?.length || 0) >= MAX_PAGES;

  const homePreviewUrl = useMemo<string | null>(() => {
    if (!store?.slug || !organized.homePage?.slug) return null;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://storelyy.vercel.app';
    return `${origin}/${store.slug}/${organized.homePage.slug}`;
  }, [store?.slug, organized.homePage?.slug]);

  const createPage = useMutation({
    mutationFn: async ({ slug, type }: { slug: string; type: string }) => {
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
        await supabase.from('page_sections').insert(sections.map((s: Record<string, unknown>) => ({ ...s, page_id: page.id })));
      }
      return page;
    },
    onSuccess: () => {
      notify.success(t('page_deployed') || 'Página criada com sucesso!');
      setIsModalOpen(false);
      setNewPage({ slug: '', type: '' });
      queryClient.invalidateQueries({ queryKey: ['pages', store?.id] });
    },
    onError: (err: Error) => {
      if (err.message === 'LIMIT_EXCEEDED') {
        notify.error(t('limit_error') || `Limite de ${MAX_PAGES} páginas atingido.`);
      } else {
        notify.error(t('slug_error') || 'Conflito de rota!');
      }
    }
  });

  const updateSlug = useMutation({
    mutationFn: async ({ id, newSlug }: { id: string; newSlug: string }) => {
      const formatted = newSlug.toLowerCase().trim().replace(/\s+/g, '-');
      const { error } = await supabase.from('pages').update({ slug: formatted }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      notify.success('Caminho atualizado!');
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ['pages', store?.id] });
    },
    onError: () => notify.error('O slug já está em uso.')
  });

  const setAsHome = useMutation({
    mutationFn: async (pageId: string) => {
      await supabase.from('pages').update({ is_home: false }).eq('store_id', store?.id);
      const { error } = await supabase.from('pages').update({ is_home: true }).eq('id', pageId);
      if (error) throw error;
    },
    onSuccess: () => {
      notify.success('Página principal alterada!');
      queryClient.invalidateQueries({ queryKey: ['pages', store?.id] });
    },
    onError: () => notify.error('Erro ao alterar a página principal')
  });

  const deletePage = useMutation({
    mutationFn: async (id: string) => {
      const { error, count } = await supabase.from('pages').delete({ count: 'exact' }).eq('id', id);
      if (error) throw error;
      if (count === 0) throw new Error('DB error');
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages', store?.id] });
      notify.success('Removido com sucesso!');
    },
    onError: (err: Error) => notify.error(err.message)
  });

  const editingState = useMemo(() => ({
    editingId,
    setEditingId,
    editValue,
    setEditValue
  }), [editingId, editValue]);

  const handleOpenModal = useCallback(() => {
    if (!isLimitReached) setIsModalOpen(true);
  }, [isLimitReached]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  if (storeLoading || pagesLoading) {
    return (
      <div className="min-h-[50vh] w-full flex flex-col items-center justify-center">
        <div className="w-13 h-13 rounded-2xl bg-[#EFEAF6] border-2 border-white shadow-xs flex items-center justify-center mb-3">
          <Loader2 className="animate-spin text-[#8862DF]" size={22} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-[#867B9E]">
          {t('loading_engine') || 'A carregar páginas...'}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-transparent pb-20">
      <div className="max-w-5xl mx-auto px-0 sm:px-6 w-full space-y-4 pt-0 sm:pt-6">
        
        {/* HERO CARD COMPONENTIZADO */}
        <PagesHero
          originalTotal={organized.originalTotal}
          isLimitReached={isLimitReached}
          homePageSlug={organized.homePage?.slug}
          homePreviewUrl={homePreviewUrl}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onOpenModal={handleOpenModal}
        />

        {/* LISTAGEM DE PÁGINAS */}
        <main 
          className="relative w-full px-3 sm:px-0 space-y-5"
          style={{ contentVisibility: 'auto', contain: 'layout paint' }}
        >
          {organized.total === 0 ? (
            <EmptyPages 
              onCreateClick={handleOpenModal} 
              isSearching={!!deferredSearch} 
            />
          ) : (
            <div className="space-y-5 animate-in fade-in duration-200">
              {organized.conflicts.length > 0 && (
                <Section 
                  title={t('link_conflict') || 'Conflito de Links'} 
                  icon={<AlertCircle className="text-rose-500" size={16} />} 
                  count={organized.conflicts.length} 
                  variant="danger"
                >
                  {organized.conflicts.map((p) => (
                    <PageRow 
                      key={p.id} 
                      page={p} 
                      storeSlug={store?.slug} 
                      isConflict 
                      editingState={editingState} 
                      setAsHome={setAsHome}
                      updateSlug={updateSlug}
                      deletePage={deletePage}
                    />
                  ))}
                </Section>
              )}

              {organized.homePage && (
                <Section 
                  title={t('primary_infrastructure') || 'Página Inicial (Home)'} 
                  icon={<Home className="text-[#8862DF]" size={16} />}
                >
                  <PageRow 
                    page={organized.homePage} 
                    storeSlug={store?.slug} 
                    isConflict={false} 
                    editingState={editingState} 
                    setAsHome={setAsHome}
                    updateSlug={updateSlug}
                    deletePage={deletePage}
                  />
                </Section>
              )}

              {Object.entries(organized.grouped).map(([type, items]) => (
                <Section 
                  key={type} 
                  title={TEMPLATES[type as keyof typeof TEMPLATES]?.label || type} 
                  icon={<div className="text-[#8862DF]">{TEMPLATES[type as keyof typeof TEMPLATES]?.icon || <FileCode2 size={16}/>}</div>} 
                  count={items.length}
                >
                  {items.map((p) => (
                    <PageRow 
                      key={p.id} 
                      page={p} 
                      storeSlug={store?.slug} 
                      isConflict={false} 
                      editingState={editingState} 
                      setAsHome={setAsHome}
                      updateSlug={updateSlug}
                      deletePage={deletePage}
                    />
                  ))}
                </Section>
              ))}
            </div>
          )}
        </main>
      </div>

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