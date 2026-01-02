import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useBlocker } from 'react-router-dom';
import { 
  Settings2, Plus, Save, Monitor, Smartphone, 
  Palette, Layout, AlignLeft, AlignCenter, AlignJustify, Layers, X, 
  ChevronUp, ChevronDown, Loader2, Type, Sun, Moon, RotateCcw, Clock, Trash2, AlertCircle,
  ExternalLink
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SectionLibrary } from '../components/sections/SectionLibrary';

// --- Definições de Tipos ---
export interface SectionStyle {
  cols: string;
  theme: 'light' | 'dark';
  align: 'left' | 'center' | 'justify';
  fontSize: 'small' | 'base' | 'large';
}

export interface Section {
  id: string;
  type: keyof typeof SectionLibrary;
  content: Record<string, any>;
  style: SectionStyle;
}

type ModalType = 'SAVE' | 'DISCARD' | 'NAVIGATION' | null;

export function Editor() {
  // --- NOVOS ESTADOS PARA SLUGS ---
  const [slugs, setSlugs] = useState<{ store: string; page: string } | null>(null);
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const [sections, setSections] = useState<Section[]>([]);
  const [originalSections, setOriginalSections] = useState<Section[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [view, setView] = useState<'desktop' | 'mobile'>('desktop');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const hasChanges = useMemo(() => 
    JSON.stringify(sections) !== JSON.stringify(originalSections), 
  [sections, originalSections]);

  // --- Sistema de Bloqueio de Navegação ---
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasChanges && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker.state === "blocked") setActiveModal('NAVIGATION');
  }, [blocker.state]);

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      if (!pageId) return;

      try {
        // Busca os dados da página usando o pageId (o código UUID)
        const { data: pageData, error: pageError } = await supabase
          .from('pages')
          .select('slug, store_id') // Pega o ID da loja vinculado
          .eq('id', pageId)
          .single();

        if (pageError) throw pageError;

        if (pageData) {
          // Agora busca o slug da loja usando o store_id que acabamos de pegar
          const { data: storeData } = await supabase
            .from('stores')
            .select('slug')
            .eq('id', pageData.store_id)
            .single();

          setSlugs({
            page: pageData.slug || pageId, // Se não tiver slug, usa o ID
            store: storeData?.slug || pageData.store_id // Se não tiver slug, usa o ID da loja
          });
        }

        // Carrega as seções normalmente
       // Dentro do useEffect que carrega o Data
const { data: sectionsData, error: secErr } = await supabase
  .from('page_sections')
  .select('*')
  .eq('page_id', pageId)
  .order('order_index', { ascending: true }); // Crucial para manter o layout do template

if (secErr) throw secErr;

if (sectionsData) {
  const formatted: Section[] = sectionsData.map(item => ({
    id: item.id,
    type: item.type as keyof typeof SectionLibrary,
    content: item.content || {},
    style: item.style || { cols: '1', theme: 'light', align: 'left', fontSize: 'base' }
  }));
  
  setSections(formatted);
  setOriginalSections(JSON.parse(JSON.stringify(formatted)));
  setLastSaved(new Date());
}
      } catch (err) {
        console.error("Erro ao carregar via ID:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [pageId]);

  const handleManualSave = async () => {
    if (!pageId) return;
    setIsSaving(true);
    try {
      // 1. Remove as seções antigas para evitar duplicidade ou conflito de ordem
      await supabase.from('page_sections').delete().eq('page_id', pageId);
  
      // 2. Prepara a nova lista garantindo que o index do array seja o order_index
      const toInsert = sections.map((s, i) => ({
        page_id: pageId,
        type: s.type,
        content: s.content,
        style: s.style,
        order_index: i // O índice 'i' garante que a ordem visual seja salva no banco
      }));
  
      // 3. Insere em lote
      const { error: insertError } = await supabase.from('page_sections').insert(toInsert);
      
      if (insertError) throw insertError;
  
      setOriginalSections(JSON.parse(JSON.stringify(sections)));
      setLastSaved(new Date());
      setActiveModal(null);
      if (blocker.state === "blocked") blocker.proceed();
    } catch (error) {
      console.error("Erro ao salvar ordem:", error);
      alert("Erro ao publicar as alterações.");
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
      // Se a página for 'home', a URL é apenas /loja, senão /loja/pagina
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

      {/* ÁREA DE PREVIEW */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 bg-white/80 border-b flex items-center justify-between px-6 z-40">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setView('desktop')} className={`px-4 py-1.5 rounded-lg transition-all ${view === 'desktop' ? 'bg-white shadow-sm text-blue-600 font-bold' : 'text-slate-400'}`}><Monitor size={16}/></button>
            <button onClick={() => setView('mobile')} className={`px-4 py-1.5 rounded-lg transition-all ${view === 'mobile' ? 'bg-white shadow-sm text-blue-600 font-bold' : 'text-slate-400'}`}><Smartphone size={16}/></button>
          </div>
          <button onClick={() => setEditingId('_layers')} className="md:hidden p-2 text-slate-400 hover:text-blue-600"><Layers size={22}/></button>
          {/* Botão de Preview também no mobile para facilitar */}
          <button onClick={handlePreview} className=" p-2 text-slate-400"><ExternalLink size={20}/></button>
        </header>

        <div className="flex-1 overflow-y-auto p-0 md:p-0 flex flex-col items-center bg-slate-100/50">
          <div 
            style={{ width: view === 'mobile' ? '375px' : '100%' }}
            className={`bg-white min-h-full transition-all duration-500 shadow-2xl relative z-10 
              ${view === 'mobile' ? 'my-8 rounded-[3rem] border-[12px] border-slate-900 overflow-hidden' : ''}`}
          >
            {sections.map((s) => {
              const Comp = SectionLibrary[s.type];
              const isActive = editingId === s.id;
              return Comp ? (
                <div 
                  key={s.id} 
                  onClick={(e) => { e.stopPropagation(); setEditingId(s.id); }}
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
                      onUpdate={(k, v) => {
                        setSections(prev => prev.map(sec => sec.id === s.id ? { ...sec, content: { ...sec.content, [k]: v } } : sec));
                      }} 
                    />
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </div>

        {/* MOBILE DRAWER */}
        {editingId && editingId !== '_layers' && (
          <div className={`md:hidden fixed bottom-0 inset-x-0 z-[10] transition-transform duration-300 ${mobileDrawerOpen ? 'translate-y-0' : 'translate-y-[calc(100%-64px)]'}`}>
            <div className="bg-white rounded-t-[3rem] shadow-[0_-20px_60px_rgba(0,0,0,0.3)] border-t border-slate-100">
              <div onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)} className="h-16 flex flex-col items-center justify-center cursor-pointer">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-1" />
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{mobileDrawerOpen ? 'Fechar' : 'Configurações'}</span>
              </div>
              <div className="p-8 pt-0 max-h-[70vh] overflow-y-auto">
                <SidebarContent 
                  sections={sections} activeSection={sections.find(s=>s.id===editingId)} 
                  editingId={editingId} setEditingId={setEditingId} 
                  updateStyle={updateSectionStyle} setSections={setSections} setShowAddModal={setShowAddModal}
                />
              </div>
            </div>
          </div>
        )}

        <button onClick={() => setShowAddModal(true)} className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-110 active:scale-90 transition-all">
          <Plus size={36}/>
        </button>
      </main>

      {/* MODAL DE SEGURANÇA (UNIFICADO) */}
      {activeModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-black mb-2 uppercase tracking-tight italic">
              {activeModal === 'SAVE' ? 'Publicar Site?' : activeModal === 'DISCARD' ? 'Descartar tudo?' : 'Mudanças Pendentes'}
            </h3>
            <p className="text-slate-500 text-[11px] mb-8 px-4 leading-relaxed">
              {activeModal === 'SAVE' && 'Deseja tornar estas alterações públicas para todos os visitantes?'}
              {activeModal === 'DISCARD' && 'Tem certeza? Perderá todas as edições feitas nesta sessão.'}
              {activeModal === 'NAVIGATION' && 'Você tem alterações não salvas. O que deseja fazer antes de sair?'}
            </p>
            <div className="flex flex-col gap-2">
              {(activeModal === 'SAVE' || activeModal === 'NAVIGATION') && (
                <button onClick={handleManualSave} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100">Salvar e Publicar</button>
              )}
              {(activeModal === 'DISCARD' || activeModal === 'NAVIGATION') && (
                <button onClick={handleDiscard} className="w-full bg-red-50 text-red-500 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Descartar Mudanças</button>
              )}
              <button onClick={() => { setActiveModal(null); blocker.reset?.(); }} className="w-full bg-slate-100 text-slate-400 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest mt-2">Continuar Editando</button>
            </div>
          </div>
        </div>
      )}

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
                      type, 
                      content: {}, 
                      style: { cols: '1', theme: 'light', align: 'left', fontSize: 'base' } 
                    }]);
                    setShowAddModal(false);
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

function SidebarContent({ sections, activeSection, editingId, setEditingId, updateStyle, setSections, setShowAddModal }: SidebarContentProps) {
  if (editingId && activeSection) {
    return (
      <div className="space-y-8 animate-in slide-in-from-right-4">
        <button onClick={() => setEditingId(null)} className="text-blue-600 font-black text-[10px] uppercase hidden md:flex items-center gap-2"><X size={14}/> Voltar às Camadas</button>
        
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estrutura (Colunas)</p>
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '4'].map(c => (
                <button key={c} onClick={() => updateStyle(editingId, 'cols', c)} className={`py-3 rounded-xl border-2 font-bold text-xs transition-all ${activeSection.style.cols === c ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}>{c} Col</button>
              ))}
            </div>
          </div>

          {/* NOVO: TAMANHO DO TEXTO */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Type size={12}/> Tamanho do Texto</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Pequeno', value: 'small' },
                { label: 'Médio', value: 'base' },
                { label: 'Grande', value: 'large' }
              ].map(sz => (
                <button key={sz.value} onClick={() => updateStyle(editingId, 'fontSize', sz.value)} className={`py-2 rounded-xl border-2 font-bold text-[9px] uppercase transition-all ${activeSection.style.fontSize === sz.value ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}>{sz.label}</button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alinhamento de Texto</p>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
              <button onClick={() => updateStyle(editingId, 'align', 'left')} className={`p-2.5 flex justify-center rounded-lg transition-all ${activeSection.style.align === 'left' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}><AlignLeft size={20}/></button>
              <button onClick={() => updateStyle(editingId, 'align', 'center')} className={`p-2.5 flex justify-center rounded-lg transition-all ${activeSection.style.align === 'center' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}><AlignCenter size={20}/></button>
              <button onClick={() => updateStyle(editingId, 'align', 'justify')} className={`p-2.5 flex justify-center rounded-lg transition-all ${activeSection.style.align === 'justify' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}><AlignJustify size={20}/></button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => updateStyle(editingId, 'theme', 'light')} className={`p-4 rounded-xl border-2 font-black text-[10px] ${activeSection.style.theme === 'light' ? 'border-blue-600 bg-white shadow-sm' : 'border-slate-100 text-slate-400'}`}><Sun size={14} className="inline mr-2"/> CLARO</button>
            <button onClick={() => updateStyle(editingId, 'theme', 'dark')} className={`p-4 rounded-xl border-2 font-black text-[10px] ${activeSection.style.theme === 'dark' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-100 text-slate-400'}`}><Moon size={14} className="inline mr-2"/> ESCURO</button>
          </div>

          <button onClick={() => { setSections(sections.filter(s=>s.id!==editingId)); setEditingId(null); }} className="w-full p-4 bg-red-50 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"><Trash2 size={14}/> Eliminar Bloco</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ordem das Camadas</h2>
      <div className="space-y-3">
        {sections.map((s, i) => (
          <div key={s.id} className="p-4 bg-white rounded-2xl border border-slate-100 flex justify-between items-center hover:border-blue-300 transition-all shadow-sm group">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-300 italic">{i+1}</span>
              <span className="font-bold text-xs text-slate-700 capitalize">{s.type}</span>
            </div>
            <div className="flex gap-1">
             {/* Botão para Baixo */}
<button 
  onClick={() => {
    const newArr = [...sections];
    if (i < sections.length - 1) { 
      // Troca de posição (Swap)
      [newArr[i], newArr[i + 1]] = [newArr[i + 1], newArr[i]]; 
      setSections(newArr); 
    }
  }} 
  className="p-2 text-slate-300 hover:text-blue-600"
>
  <ChevronDown size={18}/>
</button>
              <button onClick={()=>setEditingId(s.id)} className="p-2 text-slate-300 hover:text-blue-600"><Settings2 size={18}/></button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={()=>setShowAddModal(true)} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg">+ Adicionar Bloco</button>
    </div>
  );
}