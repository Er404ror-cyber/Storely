import { memo } from 'react';
import type { Section } from '../../types/editor';
import { SectionLibrary } from '../sections/main';


interface EditorSectionProps {
  section: Section;
  isActive: boolean;
  isInactive: boolean;
  onClick: (id: string) => void;
  onUpdateContent: (id: string, key: string, value: unknown) => void;
  t: (key: string) => string;
}

function EditorSectionComponent({
  section,
  isActive,
  isInactive,
  onClick,
  onUpdateContent,
  t,
}: EditorSectionProps) {
  const Comp = SectionLibrary[section.type];
  if (!Comp) return null;

  return (
    <section
      id={`section-${section.id}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick(section.id);
      }}
      className={`group relative cursor-pointer border-b border-slate-200/80 transition-opacity duration-200 ${
        isActive ? 'z-20 opacity-100 ring-2 ring-blue-500 ring-inset bg-blue-50/20' : ''
      } ${isInactive ? 'opacity-40' : ''}`}
      style={{
        textAlign: section.style.align,
        fontSize:
          section.style.fontSize === 'small'
            ? '0.85rem'
            : section.style.fontSize === 'large'
              ? '1.2rem'
              : '1rem',
      }}
    >
      {/* Etiqueta COMPACTA no canto superior direito para poupar tela */}
      {isActive && (
        <div className="absolute top-2 right-2 z-30 pointer-events-none">
          <span className="bg-blue-600/95 text-white px-2 py-1 rounded shadow-sm text-[9px] font-bold uppercase tracking-wider">
            {t('editingSection') || 'Editando'}
          </span>
        </div>
      )}

      {/* Borda lateral azul indicativa */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 z-20 pointer-events-none" />
      )}

      {/* Aviso sem efeitos pesados para celulares fracos */}
      {!isActive && isInactive && (
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
          <div className="bg-slate-900/95 text-white px-3 py-1.5 rounded-full shadow-md">
            <span className="text-[11px] font-medium tracking-wide">
              {t('tapToEdit') || 'Tocar para editar'}
            </span>
          </div>
        </div>
      )}

      {/* Container da Secção Otimizado */}
      <div
        className={`w-full overflow-hidden transition-opacity duration-200 ${
          section.style.theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
        } min-h-[260px] md:min-h-[320px]`}
      >
        <div
          className={`transition-opacity duration-200 ${
            isInactive ? 'pointer-events-none select-none' : ''
          }`}
        >
          <Comp
            content={section.content}
            style={section.style}
            onUpdate={(k: string, v: unknown) => onUpdateContent(section.id, k, v)}
          />
        </div>
      </div>
    </section>
  );
}

// O memo evita re-renderizações inúteis (salva muita CPU)
export const EditorSection = memo(EditorSectionComponent, (prev, next) => {
  return (
    prev.isActive === next.isActive &&
    prev.isInactive === next.isInactive &&
    JSON.stringify(prev.section) === JSON.stringify(next.section)
  );
});