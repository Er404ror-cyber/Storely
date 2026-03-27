import { Sliders, X, Trash2 } from 'lucide-react';
import { SidebarContent } from './SidebarContent';
import type { Section, ModalType } from '../../types/editor';
import { useTranslate } from '../../context/LanguageContext';

interface MobileElementsProps {
  editingId: string | null;
  showMobileSidebar: boolean;
  activeSectionName: string;
  sections: Section[];
  hasChanges: boolean;
  setShowMobileSidebar: (show: boolean) => void;
  setEditingId: (id: string | null) => void;
  updateSectionStyle: (id: string, key: any, value: string) => void;
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  setShowAddModal: (show: boolean) => void;
  setActiveModal: (modal: ModalType) => void;
}

export function MobileElements({
  editingId, showMobileSidebar, activeSectionName, sections, hasChanges,
  setShowMobileSidebar, setEditingId, updateSectionStyle, setSections, setShowAddModal, setActiveModal
}: MobileElementsProps) {

  const { t } = useTranslate(); 

  return (
    <>
      {/* PEEK BAR MOBILE */}
      {editingId && !showMobileSidebar && (
        <div className="md:hidden fixed bottom-6 left-6 right-28 bg-slate-900 text-white p-2 rounded-[2rem] shadow-2xl flex items-center justify-between z-[45] transition-all animate-in slide-in-from-bottom-8">
          <div 
            className="flex items-center gap-3 flex-1 px-2 py-1 cursor-pointer active:scale-95 transition-transform"
            onClick={() => setShowMobileSidebar(true)}
          >
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-inner shrink-0">
              <Sliders size={18} className="text-white" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 truncate">
                {activeSectionName}
              </span>
              <span className="text-xs font-bold tracking-tight truncate">
                {t('mobile_peek_tap_config')}
              </span>
                          </div>
          </div>
          
          <button 
            onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full shrink-0 ml-1 transition-colors"
          >
            <X size={10} />
          </button>
        </div>
      )}

      {/* OVERLAY DA GAVETA */}
      {showMobileSidebar && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-[45] md:hidden transition-all animate-in fade-in" 
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* GAVETA / MENU MOBILE */}
      <div 
        className={`md:hidden fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-[2.5rem] shadow-[0_-20px_60px_rgba(0,0,0,0.5)] transition-transform duration-300 flex flex-col ${showMobileSidebar ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ maxHeight: '85vh' }}
      >
        <div onClick={() => setShowMobileSidebar(false)} className="h-14 flex flex-col items-center justify-center cursor-pointer shrink-0 border-b border-slate-100 bg-slate-50/50 rounded-t-[2.5rem]">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full mb-1.5" />
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            {t('mobile_drawer_close_hint')}
          </span>
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
          {hasChanges && (
            <div className="pt-4 mt-4 border-t border-slate-300">
              <button 
                onClick={() => setActiveModal('DISCARD')}
                className="w-full py-4 rounded-2xl bg-gray-500 text-red-50 flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest active:bg-red-500 active:text-white transition-all"
              >
<Trash2 size={14} /> {t('mobile_discard_changes')}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}