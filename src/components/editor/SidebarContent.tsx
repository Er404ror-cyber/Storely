import { useState } from 'react';
import { 
  Settings2, AlignLeft, AlignCenter, AlignJustify, 
  X, ChevronDown, Type, Sun, Moon, Trash2, Lock
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleAddBlockWithLimit = () => {
    if (sections.length >= MAX_SECTIONS) {
      toast.error(
        <div className="flex flex-col gap-0.5">
          <b className="text-[11px] uppercase tracking-wider leading-none font-black">
            {t('editor_limit_reached') || 'Limite atingido'}
          </b>
          <p className="text-[10px] opacity-90 leading-tight">
            {t('editor_limit_advice') || 'Não podes adicionar mais secções.'}
          </p>
        </div>,
        { id: 'limit-reached', icon: '🚀' }
      );
      return;
    }
    setShowAddModal(true);
  };

  const confirmDelete = () => {
    setSections(sections.filter(s => s.id !== editingId));
    setEditingId(null);
    setIsDeleteModalOpen(false);
    toast.success(t('editor_delete_success') || 'Secção apagada!', {
      icon: '🗑️',
      style: { borderRadius: '1rem', fontSize: '14px' }
    });
  };

  if (editingId && activeSection) {
    const isCatalog = activeSection.type === 'products_catalog';
    // Formata o nome da secção atual para mostrar no modal (ex: hero_comercial -> Hero Comercial)
    const sectionName = activeSection.type.replace(/[_-]+/g, ' ');

    return (
      <div className="space-y-8 animate-in slide-in-from-right-4 duration-200">
        
        <button 
          onClick={() => setEditingId(null)} 
          className="text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full font-black text-[10px] uppercase flex items-center gap-2 transition-colors active:scale-95"
        >
          <X size={14} /> {t('editor_back_to_layers') || 'Voltar'}
        </button>
        
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('editor_structure_cols') || 'Colunas'}</p>
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '4'].map(c => (
                <button 
                  key={c} 
                  onClick={() => updateStyle(editingId, 'cols', c)} 
                  className={`py-3 rounded-xl border-2 font-bold text-xs transition-colors ${activeSection.style.cols === c ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}
                >
                  {c} {t('editor_col_unit') || 'Col'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Type size={12}/> {t('editor_font_size') || 'Tamanho do Texto'}</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: t('editor_font_small') || 'Pequeno', value: 'small' },
                { label: t('editor_font_medium') || 'Normal', value: 'base' },
                { label: t('editor_font_large') || 'Grande', value: 'large' }
              ].map(sz => (
                <button 
                  key={sz.value} 
                  onClick={() => updateStyle(editingId, 'fontSize', sz.value)} 
                  className={`py-2 rounded-xl border-2 font-bold text-[9px] uppercase transition-colors ${activeSection.style.fontSize === sz.value ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}
                >
                  {sz.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('editor_text_align') || 'Alinhamento'}</p>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
              <button onClick={() => updateStyle(editingId, 'align', 'left')} className={`p-2.5 flex justify-center rounded-lg transition-colors ${activeSection.style.align === 'left' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}><AlignLeft size={20}/></button>
              <button onClick={() => updateStyle(editingId, 'align', 'center')} className={`p-2.5 flex justify-center rounded-lg transition-colors ${activeSection.style.align === 'center' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}><AlignCenter size={20}/></button>
              <button onClick={() => updateStyle(editingId, 'align', 'justify')} className={`p-2.5 flex justify-center rounded-lg transition-colors ${activeSection.style.align === 'justify' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}><AlignJustify size={20}/></button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => updateStyle(editingId, 'theme', 'light')} className={`p-4 rounded-xl border-2 font-black text-[10px] transition-colors ${activeSection.style.theme === 'light' ? 'border-blue-600 bg-white shadow-sm text-blue-600' : 'border-slate-100 text-slate-400'}`}><Sun size={14} className="inline mr-2"/> {t('editor_theme_light') || 'Claro'}</button>
            <button onClick={() => updateStyle(editingId, 'theme', 'dark')} className={`p-4 rounded-xl border-2 font-black text-[10px] transition-colors ${activeSection.style.theme === 'dark' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-100 text-slate-400'}`}><Moon size={14} className="inline mr-2"/> {t('editor_theme_dark') || 'Escuro'}</button>
          </div>

          {/* Botão de Apagar */}
          <button
            onClick={() => {
              if (isCatalog) {
                toast(t('error_cant_delete_catalog') || 'Esta secção é fixa e não pode ser apagada.', { icon: '🔒' });
                return;
              }
              setIsDeleteModalOpen(true);
            }}
            className={`w-full p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-transform active:scale-95 flex items-center justify-center gap-2 ${
              isCatalog 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-red-50 text-red-500 hover:bg-red-100'
            }`}
          >
            {isCatalog ? <Lock size={14}/> : <Trash2 size={14}/>} 
            {isCatalog ? (t('editor_locked_block') || 'Secção Bloqueada') : (t('editor_delete_block') || 'Apagar Bloco')}
          </button>
        </div>

        {/* Modal Otimizado de Alta Performance (0 Lag, 60fps) */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-5 bg-slate-900/40 animate-in fade-in duration-200">
            {/* transform-gpu offloads para a placa gráfica, bg sólido branco, padding equilibrado */}
            <div className="w-full max-w-[300px] bg-white rounded-[2rem] p-6 flex flex-col items-center text-center shadow-xl border border-slate-100 transform-gpu animate-in zoom-in-95 duration-200">
              
              <div className="h-14 w-14 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4">
                <Trash2 size={24} strokeWidth={2.5} />
              </div>
              
              <h3 className="text-[17px] font-black text-slate-800 mb-2 leading-tight">
                Apagar <span className="text-red-500 capitalize">{sectionName}</span>?
              </h3>
              
              <p className="text-[12px] font-medium text-slate-500 mb-6 leading-relaxed px-1">
                {t('modal_delete_desc') || 'Tens a certeza? Esta ação não pode ser desfeita.'}
              </p>
              
              <div className="flex w-full gap-2.5">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  // active:scale-95 faz o botão "afundar" ao toque de forma muito leve
                  className="flex-1 py-3.5 rounded-2xl bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-transform active:scale-95 transform-gpu"
                >
                  {t('modal_cancel') || 'Cancelar'}
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-transform active:scale-95 transform-gpu"
                >
                  {t('modal_confirm_delete') || 'Apagar'}
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('editor_layers_order') || 'Ordem das Secções'}</h2>
        <span className={`text-[10px] font-bold ${sections.length >= MAX_SECTIONS ? 'text-red-500' : 'text-slate-400'}`}>
          {sections.length}/{MAX_SECTIONS}
        </span>
      </div>
      <div className="space-y-3">
        {sections.map((s, i) => (
          <div key={s.id} className="p-4 bg-white rounded-2xl border border-slate-100 flex justify-between items-center hover:border-blue-300 transition-colors shadow-sm group">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-300 italic">{i+1}</span>
              <span className="font-bold text-xs text-slate-700 capitalize truncate max-w-[140px]">
                {s.type.replace(/[_-]+/g, ' ')}
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
                className="p-2 text-slate-300 hover:text-blue-600 transition-colors active:scale-90 transform-gpu"
              >
                <ChevronDown size={18}/>
              </button>
              <button onClick={() => setEditingId(s.id)} className="p-2 text-slate-300 hover:text-blue-600 transition-colors active:scale-90 transform-gpu">
                <Settings2 size={18}/>
              </button>
            </div>
          </div>
        ))}
      </div>
      <button 
        onClick={handleAddBlockWithLimit} 
        className={`w-full p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-transform transform-gpu ${
          sections.length >= MAX_SECTIONS 
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60' 
          : 'bg-slate-900 text-white active:scale-95 hover:bg-slate-800'
        }`}
      >
        + {t('editor_add_block') || 'Adicionar Bloco'}
      </button>
    </div>
  );
}