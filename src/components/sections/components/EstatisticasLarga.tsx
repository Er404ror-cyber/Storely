import React from 'react';
import type { SectionProps } from '../../../types/library';
import { getFontSize, editableProps } from '../helpers';

export const EstatisticasLarga: React.FC<SectionProps> = ({ content, style, onUpdate }) => {
  const isEditable = !!onUpdate;
  const items = content.items || [
    { title: 'PROJETOS', desc: '100+' },
    { title: 'CLIENTES', desc: '50+' },
    { title: 'ESPECIALISTAS', desc: '15' },
    { title: 'SUPORTE', desc: '24h' }
  ];

  return (
    <section className={`py-16 ${style.theme === 'dark' ? 'bg-blue-600' : 'bg-slate-950'} text-white`}>
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {items.map((item, i) => (
          <div key={i}>
            <div 
              {...editableProps(isEditable, (v) => {
                const newItems = [...items]; newItems[i].desc = v; onUpdate?.('items', newItems);
              })}
              className={`${getFontSize(style.fontSize, 'h2')} font-black mb-1 tracking-tighter block`}
            >
              {item.desc}
            </div>
            <div 
              {...editableProps(isEditable, (v) => {
                const newItems = [...items]; newItems[i].title = v; onUpdate?.('items', newItems);
              })}
              className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 block"
            >
              {item.title}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};