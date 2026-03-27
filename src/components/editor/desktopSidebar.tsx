import { Save, Loader2, Clock } from 'lucide-react';
import { SidebarContent } from './SidebarContent';
import type { Section, ModalType } from '../../types/editor';
import { useTranslate } from '../../context/LanguageContext';

interface DesktopSidebarProps {
  sections: Section[];
  hasChanges: boolean;
  lastSaved: Date | null;
  editingId: string | null;
  isSaving: boolean;
  setEditingId: (id: string | null) => void;
  updateSectionStyle: (id: string, key: any, value: string) => void;
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  setShowAddModal: (show: boolean) => void;
  setActiveModal: (modal: ModalType) => void;
}

export function DesktopSidebar({
  sections, hasChanges, lastSaved, editingId, isSaving,
  setEditingId, updateSectionStyle, setSections, setShowAddModal, setActiveModal
}: DesktopSidebarProps) {
  const { t } = useTranslate(); // Inicializar tradução
  return (
    <aside className="hidden md:flex w-80 bg-white border-r border-slate-200 flex-col shrink-0 z-50">
      <div className="p-6 border-b bg-slate-50/50 flex justify-center items-center">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('sidebar_title')}</span>
          <span className={`text-[9px] font-bold ${hasChanges ? 'text-amber-500 animate-pulse' : 'text-green-500'}`}>
            {hasChanges ? t('sidebar_status_changed') : t('sidebar_status_synced')}
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
          {isSaving ? <Loader2 className="animate-spin" size={16}/> : 
          <Save size={16}/>} 
          {t('sidebar_button_publish')}
        </button>
        {hasChanges && (
          <button onClick={() => setActiveModal('DISCARD')} className="w-full text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors">
{t('sidebar_button_discard')}
          </button>
        )}
      </div>
    </aside>
  );
}