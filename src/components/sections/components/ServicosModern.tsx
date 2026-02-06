import React from 'react';
import type { SectionProps } from '../../../types/library';
import { getTheme, getFontSize, editableProps } from '../helpers';

export const ServicosModern: React.FC<SectionProps> = ({ content, style, onUpdate }) => {
  const isEditable = !!onUpdate;
  const items = content.items || [{ title: 'Serviço', desc: 'Descrição do serviço' }, { title: 'Serviço', desc: 'Descrição do serviço' }, { title: 'Serviço', desc: 'Descrição do serviço' }];
  const colsCount = style.cols || '3';
  const cols = colsCount === '4' ? 'lg:grid-cols-4' : colsCount === '2' ? 'md:grid-cols-2' : 'md:grid-cols-3';
  
  return (
    <section className={`py-24 px-6 ${getTheme(style.theme)}`}>
      <div className="max-w-7xl mx-auto">
        <h2 {...editableProps(isEditable, (v) => onUpdate?.('title', v))} className="text-center mb-16 font-black text-xs uppercase tracking-[0.3em] opacity-40 block">
          {content.title || 'Expertise & Soluções'}
        </h2>
        <div className={`grid grid-cols-1 ${cols} gap-8`}>
          {items.map((item, i) => (
            <div key={i} className={`p-8 rounded-[32px] border transition-all ${style.theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 font-bold italic shadow-lg shadow-blue-500/20">0{i+1}</div>
              <h3 {...editableProps(isEditable, (v) => {
                const newItems = [...items]; newItems[i].title = v; onUpdate?.('items', newItems);
              })} className={`${getFontSize(style.fontSize, 'card')} font-black mb-3 block`}>{item.title}</h3>
              <p {...editableProps(isEditable, (v) => {
                const newItems = [...items]; newItems[i].desc = v; onUpdate?.('items', newItems);
              })} className={`${getFontSize(style.fontSize, 'p')} opacity-60 leading-relaxed block`}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};