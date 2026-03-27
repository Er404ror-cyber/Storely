import { Layers, ExternalLink, Save, Loader2 } from 'lucide-react';

interface EditorHeaderProps {
  hasChanges: boolean;
  isSaving: boolean;
  setEditingId: (id: string | null) => void;
  setShowMobileSidebar: (show: boolean) => void;
  handlePreview: () => void;
  setActiveModal: (modal: any) => void;
}

export function EditorHeader({
  hasChanges,
  isSaving,
  setEditingId,
  setShowMobileSidebar,
  handlePreview,
  setActiveModal
}: EditorHeaderProps) {
  return (
    <header className="h-16 bg-white/80 border-b flex items-center justify-end px-4 md:px-6 z-40">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => { setEditingId(null); setShowMobileSidebar(true); }} 
          className="p-2.5 text-slate-500 hover:text-blue-600 bg-slate-50 rounded-full active:scale-90 transition-all"
          title="Ver Camadas"
        >
          <Layers size={20}/>
        </button>

        <button 
          onClick={handlePreview} 
          className="p-2.5 text-slate-500 hover:text-blue-600 bg-slate-50 rounded-full active:scale-90 transition-all"
          title="Visualizar Site"
        >
          <ExternalLink size={20}/>
        </button>

        <button 
          onClick={() => setActiveModal('SAVE')} 
          disabled={!hasChanges || isSaving}
          className={`md:hidden px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 ${
            hasChanges ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400 opacity-60'
          }`}
        >
          {isSaving ? <Loader2 className="animate-spin" size={14}/> : <Save size={14}/>} 
          {hasChanges ? 'Salvar' : 'Ok'}
        </button>
      </div>
    </header>
  );
}