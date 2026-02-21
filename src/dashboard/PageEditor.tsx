import { useState, useEffect, useMemo } from 'react';
import { useParams, useBlocker } from 'react-router-dom';
import { 
  Plus, Save, Layout, Layers, X, Loader2, Clock, 
  AlertCircle, ExternalLink, CloudUpload
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SectionLibrary, type SectionContent } from '../components/sections/main';
import { toast } from 'react-hot-toast';
import { useTranslate } from '../context/LanguageContext';

// Importações dos arquivos divididos
import type { Section, SectionStyle, ModalType } from '../types/editor';
import { SidebarContent } from '../components/editor/SidebarContent';

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
    // 1. Prevenção de duplo clique e validação de ID
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
      // 2. Operação no Banco de Dados
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
  
      // 3. SUCESSO: Atualiza estados locais
      setOriginalSections(JSON.parse(JSON.stringify(sections)));
      setLastSaved(new Date());
  
      // 4. FECHAR MODAL E NOTIFICAR
      setActiveModal(null); // Fecha o modal de segurança
      toast.success("Publicado com sucesso!", { id: loadingToast });
  
      // 5. Se houver navegação bloqueada, prosseguir
      if (blocker.state === "blocked") {
        blocker.proceed();
      }
      
    } catch (err: unknown) {
      console.error(err);
      toast.error("Erro ao publicar.", { id: loadingToast });
      // Note que não fechamos o modal aqui para o usuário tentar novamente se desejar
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

  if (loading) return <div className="h-screen flex items-center justify-center bg-white italic tracking-widest text-slate-400 uppercase text-xs">A carregar editor...</div>;

  return (
    <div className="h-screen w-full bg-[#F1F5F9] flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex w-80 bg-white border-r border-slate-200 flex-col shrink-0 z-50">
        <div className="p-6 border-b bg-slate-50/50 flex justify-center items-center">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Painel de Edição</span>
            <span className={`text-[9px] font-bold ${hasChanges ? 'text-amber-500 animate-pulse' : 'text-green-500'}`}>
              {hasChanges ? 'MODIFICAÇÕES ATIVAS' : 'SITE SINCRONIZADO'}
            </span>
          </div>
          {lastSaved && <Clock size={16} className="text-slate-300" />}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <SidebarContent 
            sections={sections} 
            activeSection={sections.find(s => s.id === editingId)} 
            editingId={editingId} 
            setEditingId={setEditingId} 
            updateStyle={updateSectionStyle}
            setSections={setSections}
            setShowAddModal={setShowAddModal}
          />
        </div>

        <div className="p-6 border-t bg-white space-y-3">
          <button 
            onClick={() => setActiveModal('SAVE')} 
            disabled={!hasChanges || isSaving}
            className={`w-full p-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all ${hasChanges ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 hover:-translate-y-0.5' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
          >
            {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} PUBLICAR AGORA
          </button>
          {hasChanges && (
            <button onClick={() => setActiveModal('DISCARD')} className="w-full text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors">
              Descartar Mudanças
            </button>
          )}
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 bg-white/80 border-b flex items-center justify-between px-6 gap-4 z-40">
          
          <div className="flex-1"></div> {/* Espaçador */}
          
          <button 
            onClick={() => { setEditingId(null); setShowMobileSidebar(true); }} 
            className="md:hidden p-2 text-slate-400 hover:text-blue-600"
          >
            <Layers size={22}/>
          </button>
          <button onClick={handlePreview} className="p-2 text-slate-400 hover:text-blue-600">
            <ExternalLink size={20}/>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-0 flex flex-col items-center bg-slate-100/50">
          <div className="bg-white min-h-full w-full transition-all duration-500 shadow-2xl relative z-10">
            {sections.map((s) => {
              const Comp = SectionLibrary[s.type];
              const isActive = editingId === s.id;
              return Comp ? (
                <div 
                  key={s.id} 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setEditingId(s.id); 
                    setShowMobileSidebar(true); 
                  }}
                  className={`relative cursor-pointer transition-all border-none outline-none
                    ${isActive ? 'ring-4 ring-blue-500 ring-inset z-20 shadow-2xl scale-[1.002]' : 'hover:bg-blue-50/5'}
                  `}
                  style={{ 
                    textAlign: s.style.align, 
                    fontSize: s.style.fontSize === 'small' ? '0.85rem' : s.style.fontSize === 'large' ? '1.2rem' : '1rem' 
                  }}
                >
                  <div className={`w-full overflow-hidden ${s.style.theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
                    <Comp 
                      content={s.content} 
                      style={s.style} 
                      onUpdate={(k: string, v: unknown) => {
                        setSections(prev => prev.map(sec => 
                          sec.id === s.id ? { ...sec, content: { ...sec.content, [k]: v } } : sec
                        ));
                      }} 
                    />
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </div>

        {/* Backdrop para fechar o menu mobile ao clicar fora */}
        {showMobileSidebar && (
          <div 
            className="fixed inset-0 bg-slate-900/30  z-[45] md:hidden" 
            onClick={() => setShowMobileSidebar(false)}
          />
        )}

        {/* GAVETA / MENU MOBILE */}
        <div 
          className={`md:hidden fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-[3rem] shadow-[0_-20px_60px_rgba(0,0,0,0.5)] transition-transform duration-300 flex flex-col ${showMobileSidebar ? 'translate-y-0' : 'translate-y-full'}`}
          style={{ maxHeight: '85vh' }}
        >
          <div onClick={() => setShowMobileSidebar(false)} className="h-16 flex flex-col items-center justify-center cursor-pointer shrink-0 border-b border-slate-50">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-1" />
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Fechar Menu</span>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            <SidebarContent 
              sections={sections} 
              activeSection={sections.find(s=>s.id===editingId)} 
              editingId={editingId} 
              setEditingId={setEditingId} 
              updateStyle={updateSectionStyle} 
              setSections={setSections} 
              setShowAddModal={setShowAddModal}
            />
            
            {/* Botões de Ação para Celular */}
            <div className="mt-8 pt-6 border-t border-slate-100 space-y-3 pb-4">
              <button 
                onClick={() => setActiveModal('SAVE')} 
                disabled={!hasChanges || isSaving}
                className={`w-full p-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all ${hasChanges ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
              >
                {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} PUBLICAR AGORA
              </button>
              {hasChanges && (
                <button onClick={() => setActiveModal('DISCARD')} className="w-full text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors">
                  Descartar Mudanças
                </button>
              )}
            </div>
          </div>
        </div>

        <button onClick={() => setShowAddModal(true)} className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center z-40 hover:scale-110 active:scale-90 transition-all">
          <Plus size={36}/>
        </button>
      </main>

      {/* MODAL DE SEGURANÇA */}
      {activeModal && (() => {
        const pendingSections = sections.filter(s => {
          const content = s.content as any;
          const mediaItems = content.images || (content.media ? [content.media] : []);
          return mediaItems.some((img: any) => img.isTemp);
        });
        const hasPending = pendingSections.length > 0;

        return (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl text-center border border-white/20">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
                hasPending ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-blue-50 text-blue-600'
              }`}>
                {hasPending ? <CloudUpload size={32} /> : <AlertCircle size={32} />}
              </div>

              <h3 className="text-xl font-black mb-2 uppercase tracking-tight italic">
                {hasPending ? "Sincronização Necessária" : activeModal === 'SAVE' ? t('editor_modal_save_title') : t('editor_modal_pending_changes_title')}
              </h3>

              {hasPending ? (
                <div className="mb-6 px-2">
                  <p className="text-slate-500 text-[11px] mb-4 leading-relaxed">
                  {t('editor_modal_sync_warning')}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {pendingSections.map((s, idx) => (
                      <span key={idx} className="px-3 py-1 bg-amber-50 text-amber-700 text-[9px] font-black rounded-full border border-amber-100 uppercase italic">
                        {s.type.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-[11px] mb-8 px-4 leading-relaxed">
                  {activeModal === 'SAVE' ? t('editor_modal_save_desc') : t('editor_modal_nav_changes_desc')}
                </p>
              )}

<div className="flex flex-col gap-2">
  {(activeModal === 'SAVE' || activeModal === 'NAVIGATION') && (
    <button 
      onClick={handleManualSave} 
      // Desativa se houver pendências OU se já estiver salvando
      disabled={hasPending || isSaving}
      className={`w-full p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
        (hasPending || isSaving)
        ? 'bg-slate-100 text-slate-300 cursor-not-allowed opacity-80' 
        : 'bg-blue-600 text-white shadow-lg shadow-blue-100 hover:scale-[1.02] active:scale-95'
      }`}
    >
      {/* Ícone de loader animado aparece apenas durante o save */}
      {isSaving && <Loader2 className="animate-spin" size={14} />}
      
      {isSaving 
        ? 'A Processar...' 
        : (hasPending ? t('editor_modal_btn_save') : t('editor_modal_btn_save'))
      }
    </button>
  )}

  {(activeModal === 'DISCARD' || activeModal === 'NAVIGATION') && (
    <button 
      onClick={handleDiscard} 
      // Também desativamos o descarte enquanto salva para evitar conflitos de estado
      disabled={isSaving}
      className={`w-full p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
        isSaving
        ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
        : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'
      }`}
    >
      {hasPendingUploads ? t('editor_modal_btn_discard_all') : t('editor_modal_btn_discard')}
    </button>
  )}

  <button 
    onClick={() => { setActiveModal(null); blocker.reset?.(); }} 
    disabled={isSaving}
    className={`w-full p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest mt-2 transition-all ${
      isSaving 
      ? 'text-slate-200 cursor-not-allowed' 
      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
    }`}
  >
    {t('editor_modal_btn_continue')}
  </button>
</div>
            </div>
          </div>
        );
      })()}

      {/* MODAL ADICIONAR */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-2xl uppercase tracking-tighter italic">Biblioteca de Blocos</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 bg-slate-50 rounded-full"><X/></button>
            </div>
            <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar">
              {(Object.keys(SectionLibrary) as Array<keyof typeof SectionLibrary>).map(type => (
                <button 
                  key={type} 
                  onClick={() => {
                    setSections([...sections, { 
                      id: crypto.randomUUID(), 
                      type: type as keyof typeof SectionLibrary, 
                      content: {}, 
                      style: { cols: '1', theme: 'light', align: 'left', fontSize: 'base' } 
                    }]);
                    setShowAddModal(false);
                    setShowMobileSidebar(true);
                  }} 
                  className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-transparent hover:border-blue-600 hover:bg-white transition-all text-center group"
                >
                  <Layout className="mx-auto mb-3 text-slate-300 group-hover:text-blue-600" size={32}/>
                  <span className="text-[10px] font-black uppercase tracking-widest block text-slate-500">{type}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}