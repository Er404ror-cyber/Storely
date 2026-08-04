import { memo } from 'react';
import { Layers, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

export const PageStructurePreview = memo(({ sections, onRemoveSection, onMoveSection }: any) => {
  if (!sections || sections.length === 0) return null;

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center gap-2 px-1">
        <Layers size={14} className="text-blue-600" />
        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
          Estrutura Gerada ({sections.length} Blocos)
        </span>
      </div>

      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 [-webkit-overflow-scrolling:touch]">
        {sections.map((sec: any, index: number) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl transform-gpu"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-[10px] font-black">
                {index + 1}
              </span>
              <span className="text-xs font-bold text-slate-700 capitalize truncate">
                {sec.type.replace(/[_-]+/g, ' ')}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button 
                type="button"
                onClick={() => onMoveSection(index, 'up')}
                disabled={index === 0}
                className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
              >
                <ChevronUp size={16} />
              </button>
              <button 
                type="button"
                onClick={() => onMoveSection(index, 'down')}
                disabled={index === sections.length - 1}
                className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
              >
                <ChevronDown size={16} />
              </button>
              <button 
                type="button"
                onClick={() => onRemoveSection(index)}
                className="p-1.5 text-red-400 hover:text-red-600 ml-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

PageStructurePreview.displayName = 'PageStructurePreview';