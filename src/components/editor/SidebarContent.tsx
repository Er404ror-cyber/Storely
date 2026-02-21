import { 
    Settings2, AlignLeft, AlignCenter, AlignJustify, 
    X, ChevronDown, Type, Sun, Moon, Trash2 
  } from 'lucide-react';
import type { SidebarContentProps } from '../../types/editor';
  
  export function SidebarContent({ 
    sections, 
    activeSection, 
    editingId, 
    setEditingId, 
    updateStyle, 
    setSections, 
    setShowAddModal 
  }: SidebarContentProps) {
    
    if (editingId && activeSection) {
      return (
        <div className="space-y-8 animate-in slide-in-from-right-4">
          <button onClick={() => setEditingId(null)} className="text-blue-600 font-black text-[10px] uppercase flex items-center gap-2">
            <X size={14}/> Voltar às Camadas
          </button>
          
          <div className="space-y-8">
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estrutura (Colunas)</p>
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '4'].map(c => (
                  <button 
                    key={c} 
                    onClick={() => updateStyle(editingId, 'cols', c)} 
                    className={`py-3 rounded-xl border-2 font-bold text-xs transition-all ${activeSection.style.cols === c ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}
                  >
                    {c} Col
                  </button>
                ))}
              </div>
            </div>
  
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Type size={12}/> Tamanho do Texto</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Pequeno', value: 'small' },
                  { label: 'Médio', value: 'base' },
                  { label: 'Grande', value: 'large' }
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
  
            <button 
              onClick={() => { setSections(sections.filter(s => s.id !== editingId)); setEditingId(null); }} 
              className="w-full p-4 bg-red-50 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={14}/> Eliminar Bloco
            </button>
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
          onClick={() => setShowAddModal(true)} 
          className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg"
        >
          + Adicionar Bloco
        </button>
      </div>
    );
  }