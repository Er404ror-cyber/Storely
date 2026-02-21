import { X, Layout } from 'lucide-react';
import { SectionLibrary } from '../sections/main';

interface AddSectionModalProps {
  onClose: () => void;
  onAdd: (type: keyof typeof SectionLibrary) => void;
}

export function AddSectionModal({ onClose, onAdd }: AddSectionModalProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-black text-2xl uppercase tracking-tighter italic">Biblioteca de Blocos</h3>
          <button onClick={onClose} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
            <X size={20}/>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar">
          {(Object.keys(SectionLibrary) as Array<keyof typeof SectionLibrary>).map(type => (
            <button 
              key={type} 
              onClick={() => onAdd(type)} 
              className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-transparent hover:border-blue-600 hover:bg-white transition-all text-center group"
            >
              <Layout className="mx-auto mb-3 text-slate-300 group-hover:text-blue-600" size={32}/>
              <span className="text-[10px] font-black uppercase tracking-widest block text-slate-500">{type}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}