import { 
  Settings2, AlignLeft, AlignCenter, AlignJustify, 
  X, ChevronDown, Type, Sun, Moon, Trash2 
} from 'lucide-react';
import type { SidebarContentProps } from '../../types/editor';
import { toast } from 'react-hot-toast';
import { useTranslate } from '../../context/LanguageContext';
import { MAX_SECTIONS } from '../../utils/maxSections';


export function SidebarContent({ 
  sections, 
  activeSection, 
  editingId, 
  setEditingId, 
  updateStyle, 
  setSections, 
  setShowAddModal 
}: SidebarContentProps) {
  const { t } = useTranslate();

  const handleAddBlockWithLimit = () => {
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
        { id: 'limit-reached', icon: '🚀' }
      );
      return;
    }
    setShowAddModal(true);
  };

  if (editingId && activeSection) {
    return (
      <div className="space-y-8 animate-in slide-in-from-right-4">
        <button onClick={() => setEditingId(null)} className="text-blue-600 font-black text-[10px] uppercase flex items-center gap-2">
          <X size={14}/> {t('editor_back_to_layers')}
        </button>
        
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('editor_structure_cols')}</p>
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '4'].map(c => (
                <button 
                  key={c} 
                  onClick={() => updateStyle(editingId, 'cols', c)} 
                  className={`py-3 rounded-xl border-2 font-bold text-xs transition-all ${activeSection.style.cols === c ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}
                >
                  {c} {t('editor_col_unit')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Type size={12}/> {t('editor_font_size')}</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: t('editor_font_small'), value: 'small' },
                { label: t('editor_font_medium'), value: 'base' },
                { label: t('editor_font_large'), value: 'large' }
              ].map(sz => (
                <button 
                  key={sz.value} 
                  onClick={() => updateStyle(editingId, 'fontSize', sz.value)} 
                  className={`py-2 rounded-xl border-2 font-bold text-[9px] uppercase transition-all ${activeSection.style.fontSize === sz.value ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}
                >
                  {sz.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('editor_text_align')}</p>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
              <button onClick={() => updateStyle(editingId, 'align', 'left')} className={`p-2.5 flex justify-center rounded-lg transition-all ${activeSection.style.align === 'left' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}><AlignLeft size={20}/></button>
              <button onClick={() => updateStyle(editingId, 'align', 'center')} className={`p-2.5 flex justify-center rounded-lg transition-all ${activeSection.style.align === 'center' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}><AlignCenter size={20}/></button>
              <button onClick={() => updateStyle(editingId, 'align', 'justify')} className={`p-2.5 flex justify-center rounded-lg transition-all ${activeSection.style.align === 'justify' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}><AlignJustify size={20}/></button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => updateStyle(editingId, 'theme', 'light')} className={`p-4 rounded-xl border-2 font-black text-[10px] ${activeSection.style.theme === 'light' ? 'border-blue-600 bg-white shadow-sm' : 'border-slate-100 text-slate-400'}`}><Sun size={14} className="inline mr-2"/> {t('editor_theme_light')}</button>
            <button onClick={() => updateStyle(editingId, 'theme', 'dark')} className={`p-4 rounded-xl border-2 font-black text-[10px] ${activeSection.style.theme === 'dark' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-100 text-slate-400'}`}><Moon size={14} className="inline mr-2"/> {t('editor_theme_dark')}</button>
          </div>

          <button
  onClick={() => {
    const confirmDelete = window.confirm(t('editor_confirm_delete'));
    if (!confirmDelete) return;

    setSections(sections.filter(s => s.id !== editingId));
    setEditingId(null);
  }}
  className="w-full p-4 bg-red-500 text-red-50 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
>
  <Trash2 size={14}/> {t('editor_delete_block')}
</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('editor_layers_order')}</h2>
        <span className={`text-[10px] font-bold ${sections.length >= MAX_SECTIONS ? 'text-red-500' : 'text-slate-400'}`}>
          {sections.length}/{MAX_SECTIONS}
        </span>
      </div>
      <div className="space-y-3">
        {sections.map((s, i) => (
          <div key={s.id} className="p-4 bg-white rounded-2xl border border-slate-100 flex justify-between items-center hover:border-blue-300 transition-all shadow-sm group">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-300 italic">{i+1}</span>
              <span className="font-bold text-xs text-slate-700 capitalize">
                {s.type.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
            <div className="flex gap-1">
              <button 
                onClick={() => {
                  const newArr = [...sections];
                  if (i < sections.length - 1) { 
                    [newArr[i], newArr[i + 1]] = [newArr[i + 1], newArr[i]]; 
                    setSections(newArr); 
                  }
                }} 
                className="p-2 text-slate-300 hover:text-blue-600"
              >
                <ChevronDown size={18}/>
              </button>
              <button onClick={() => setEditingId(s.id)} className="p-2 text-slate-300 hover:text-blue-600">
                <Settings2 size={18}/>
              </button>
            </div>
          </div>
        ))}
      </div>
      <button 
        onClick={handleAddBlockWithLimit} 
        className={`w-full p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all ${
          sections.length >= MAX_SECTIONS 
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60' 
          : 'bg-slate-900 text-white active:scale-95'
        }`}
      >
        + {t('editor_add_block')}
      </button>
    </div>
  );
}