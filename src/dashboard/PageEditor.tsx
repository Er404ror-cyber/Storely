import { useState, useEffect, useMemo } from 'react';
import { useParams, useBlocker } from 'react-router-dom';
import { Plus, Layout } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SectionLibrary, type SectionContent } from '../components/sections/main';
import { toast } from 'react-hot-toast';
import { useTranslate } from '../context/LanguageContext';

// Importações dos Tipos
import type { Section, SectionStyle, ModalType } from '../types/editor';
import { MAX_SECTIONS } from '../utils/maxSections';
import { DesktopSidebar } from '../components/editor/desktopSidebar';
import { EditorHeader } from '../components/editor/EditorHeader';
import { MobileElements } from '../components/editor/MobileElements';
import { EditorModals } from '../components/editor/SecurityModal';



export function Editor() {
  const [slugs, setSlugs] = useState<{ store: string; page: string } | null>(null);
  const { pageId } = useParams<{ pageId: string }>();
  const [sections, setSections] = useState<Section[]>([]);
  const [originalSections, setOriginalSections] = useState<Section[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const { t } = useTranslate();

  const hasChanges = useMemo(() => 
    JSON.stringify(sections) !== JSON.stringify(originalSections), 
  [sections, originalSections]);

  const hasPendingUploads = useMemo(() => {
    return sections.some(section => 
      (section.content?.images as any[])?.some(img => img.isTemp)
    );
  }, [sections]);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      (hasChanges || hasPendingUploads) && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges || hasPendingUploads) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges, hasPendingUploads]);

  useEffect(() => {
    if (blocker.state === "blocked") setActiveModal('NAVIGATION');
  }, [blocker.state]);

  useEffect(() => {
    const controller = new AbortController();
    const loadData = async () => {
      if (!pageId) return;

      try {
        setLoading(true);

        const { data: pageData, error: pageError } = await supabase
          .from('pages')
          .select('slug, store_id')
          .eq('id', pageId)
          .abortSignal(controller.signal)
          .single();

        if (pageError) throw pageError;

        if (pageData) {
          const { data: storeData, error: storeErr } = await supabase
            .from('stores')
            .select('slug')
            .eq('id', pageData.store_id)
            .abortSignal(controller.signal)
            .single();

          if (storeErr) throw storeErr;

          setSlugs({
            page: pageData.slug || pageId,
            store: storeData?.slug || pageData.store_id
          });
        }

        const { data: sectionsData, error: secErr } = await supabase
          .from('page_sections')
          .select('*')
          .eq('page_id', pageId)
          .order('order_index', { ascending: true })
          .abortSignal(controller.signal);

        if (secErr) throw secErr;

        if (sectionsData) {
          const formatted: Section[] = sectionsData.map(item => ({
            id: item.id,
            type: item.type as keyof typeof SectionLibrary,
            content: (item.content as SectionContent) || {},
            style: item.style || { cols: '1', theme: 'light', align: 'left', fontSize: 'base' }
          }));
          
          setSections(formatted);
          setOriginalSections(JSON.parse(JSON.stringify(formatted)));
          setLastSaved(new Date());
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.name === 'AbortError' || err.message.includes('aborted')) return;
          console.error("Erro real de carregamento:", err.message);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadData();
    return () => controller.abort();
  }, [pageId]);

  const handleManualSave = async () => {
    if (!pageId || isSaving) return;
  
    const problematicSections = sections.filter(s => {
      const content = s.content as any;
      const mediaItems = content.images || (content.media ? [content.media] : []);
      const hasTemp = mediaItems.some((img: any) => img.isTemp);
      const totalBytes = mediaItems.reduce((acc: number, curr: any) => acc + (curr.size || 0), 0);
      const isHeavy = totalBytes > 15 * 1024 * 1024;
      return hasTemp || isHeavy;
    });
  
    if (problematicSections.length > 0) {
      const firstErrorType = problematicSections[0].type.toUpperCase();
      return toast.error(
        `Ação Bloqueada: A seção ${firstErrorType} possui mídias pendentes ou muito grandes.`, 
        { id: "save-blocked", duration: 5000, icon: "🚫" }
      );
    }
  
    setIsSaving(true);
    const loadingToast = toast.loading("Salvando página...");
  
    try {
      await supabase.from('page_sections').delete().eq('page_id', pageId);
  
      const toInsert = sections.map((s, i) => ({
        page_id: pageId,
        type: s.type,
        content: s.content,
        style: s.style,
        order_index: i 
      }));
  
      const { error } = await supabase.from('page_sections').insert(toInsert);
      if (error) throw error;
  
      setOriginalSections(JSON.parse(JSON.stringify(sections)));
      setLastSaved(new Date());
  
      setActiveModal(null);
      toast.success("Publicado com sucesso!", { id: loadingToast });
  
      if (blocker.state === "blocked") {
        blocker.proceed();
      }
      
    } catch (err: unknown) {
      console.error(err);
      toast.error("Erro ao publicar.", { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setSections(JSON.parse(JSON.stringify(originalSections)));
    setActiveModal(null);
    if (blocker.state === "blocked") blocker.proceed();
  };

  const updateSectionStyle = (id: string, key: keyof SectionStyle, value: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, style: { ...s.style, [key]: value } } : s));
  };

  const handlePreview = () => {
    if (slugs?.store) {
      const pagePath = slugs.page === 'home' ? '' : `/${slugs.page}`;
      const url = `/${slugs.store}${pagePath}`;
      window.open(url, '_blank');
    } else {
      alert("Aguardando carregamento dos endereços...");
    }
  };

  const activeSectionInfo = sections.find(s => s.id === editingId);
  const activeSectionName = activeSectionInfo?.type.replace(/([A-Z])/g, ' $1').trim().toUpperCase() || 'BLOCO';

  const handleAddBlock = () => {
    if (sections.length >= MAX_SECTIONS) {
      toast.error(
        <div className="flex flex-col gap-0.5">
          <b className="text-[11px] uppercase tracking-wider leading-none font-black">
            {t('editor_limit_reached')}
          </b>
          <p className="text-[10px] opacity-90 leading-tight">
            {t('editor_limit_advice')}
          </p>
        </div>,
        { id: 'limit-reached', duration: 5000, icon: '🚀', style: { borderRadius: '20px', padding: '12px 16px' } }
      );
      return;
    }
    setShowAddModal(true);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white italic tracking-widest text-slate-400 uppercase text-xs">A carregar editor...</div>;

  return (
    <div className="h-screen w-full bg-[#F1F5F9] flex flex-col md:flex-row overflow-hidden font-sans">
      
      <DesktopSidebar
        sections={sections}
        hasChanges={hasChanges}
        lastSaved={lastSaved}
        editingId={editingId}
        isSaving={isSaving}
        setEditingId={setEditingId}
        updateSectionStyle={updateSectionStyle}
        setSections={setSections}
        setShowAddModal={setShowAddModal}
        setActiveModal={setActiveModal}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        <EditorHeader
          hasChanges={hasChanges}
          isSaving={isSaving}
          setEditingId={setEditingId}
          setShowMobileSidebar={setShowMobileSidebar}
          handlePreview={handlePreview}
          setActiveModal={setActiveModal}
        />

        <div className="flex-1 overflow-y-auto p-0 flex flex-col items-center bg-slate-100/50" onClick={() => { if(!showMobileSidebar) setEditingId(null); }}>
          
        {sections.length === 0 && (
  <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[400px] w-full animate-in fade-in duration-700">
    {/* Container Visual com Glassmorphism suave */}
    <div className="relative mb-8 cursor-pointer" onClick={() => setShowAddModal(true)}>
      <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
      <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-slate-100 rotate-3 hover:rotate-0 transition-transform duration-500">
        <Layout size={48} className="text-slate-400 md:size-64" />
        {/* Badge Flutuante de "+" para dar contexto visual */}
        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white">
          <Plus size={20} strokeWidth={3} />
        </div>
      </div>
    </div>

    {/* Textos com Hierarquia Clara */}
    <div className="max-w-md text-center space-y-3">
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">
        {t('empty_state_title')}
      </h2>
      
      <p className="text-sm md:text-base text-slate-500 leading-relaxed px-4">
        {t('empty_state_description')}
      </p>
      
      {/* Guia Visual/Instrução */}
      <div className="pt-4 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
        <span className="h-px w-8 bg-slate-200"></span>
        <span className="flex items-center gap-1.5">
          {t('empty_state_action')}
        </span>
        <span className="h-px w-8 bg-slate-200"></span>
      </div>
    </div>
  </div>
)}

          <div className="bg-white min-h-full w-full transition-all duration-500 shadow-2xl relative z-10">
            {sections.map((s) => {
              const Comp = SectionLibrary[s.type];
              const isActive = editingId === s.id;
              return Comp ? (
                <div 
                  key={s.id} 
                  onClick={(e) => { e.stopPropagation(); setEditingId(s.id); }}
                  className={`relative cursor-pointer transition-all border-none outline-none ${isActive ? 'ring-4 ring-blue-500 ring-inset z-20 shadow-2xl scale-[1.002]' : 'hover:bg-blue-50/5'}`}
                  style={{ textAlign: s.style.align, fontSize: s.style.fontSize === 'small' ? '0.85rem' : s.style.fontSize === 'large' ? '1.2rem' : '1rem' }}
                >
                  {isActive && !showMobileSidebar && <div className="md:hidden absolute inset-0 bg-blue-500/5 z-30 pointer-events-none" />}
                  <div className={`w-full overflow-hidden ${s.style.theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
                    <Comp 
                      content={s.content} 
                      style={s.style} 
                      onUpdate={(k: string, v: unknown) => {
                        setSections(prev => prev.map(sec => sec.id === s.id ? { ...sec, content: { ...sec.content, [k]: v } } : sec));
                      }} 
                    />
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </div>

        <MobileElements
          editingId={editingId}
          showMobileSidebar={showMobileSidebar}
          activeSectionName={activeSectionName}
          sections={sections}
          hasChanges={hasChanges}
          setShowMobileSidebar={setShowMobileSidebar}
          setEditingId={setEditingId}
          updateSectionStyle={updateSectionStyle}
          setSections={setSections}
          setShowAddModal={setShowAddModal}
          setActiveModal={setActiveModal}
        />

        <button 
          onClick={handleAddBlock}
          className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-90 transition-all ${
            sections.length >= MAX_SECTIONS ? 'bg-slate-200 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Plus size={36} className={sections.length >= MAX_SECTIONS ? 'text-slate-400' : 'text-white'} />
        </button>
      </main>

      <EditorModals
        sections={sections}
        activeModal={activeModal}
        showAddModal={showAddModal}
        isSaving={isSaving}
        hasPendingUploads={hasPendingUploads}
        setActiveModal={setActiveModal}
        setShowAddModal={setShowAddModal}
        handleManualSave={handleManualSave}
        handleDiscard={handleDiscard}
        resetBlocker={() => blocker.reset?.()}
        setSections={setSections}
        setEditingId={setEditingId}
        setShowMobileSidebar={setShowMobileSidebar}
      />
    </div>
  );
}