import React from 'react';
import type { SectionProps } from '../../../types/library';
import { getTheme, getFontSize, editableProps } from '../helpers';

export const PrecosModerno: React.FC<SectionProps> = ({ content, style, onUpdate }) => {
  const isEditable = !!onUpdate;
  const items = content.items || [
    { title: 'Plano Base', price: 'MT 5.000', desc: 'Suporte 24/7' },
    { title: 'Plano Expert', price: 'MT 15.000', desc: 'Design Premium' }
  ];
  
  return (
    <section className={`py-24 px-6 ${getTheme(style.theme)}`}>
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item, i) => (
          <div key={i} className={`p-10 rounded-[40px] border transition-all ${i === 1 ? 'border-blue-600 ring-4 ring-blue-600/10 scale-105' : 'border-slate-100'} text-center flex flex-col items-center`}>
            <h3 {...editableProps(isEditable, (v) => {
              const newItems = [...items]; newItems[i].title = v; onUpdate?.('items', newItems);
            })} className="font-black text-sm mb-4 uppercase tracking-[0.2em] opacity-40 block">{item.title}</h3>
            <div {...editableProps(isEditable, (v) => {
              const newItems = [...items]; newItems[i].price = v; onUpdate?.('items', newItems);
            })} className={`${getFontSize(style.fontSize, 'h2')} font-black mb-6 tracking-tighter block`}>{item.price}</div>
            <p {...editableProps(isEditable, (v) => {
              const newItems = [...items]; newItems[i].desc = v; onUpdate?.('items', newItems);
            })} className="text-xs font-bold opacity-60 mb-8 block">{item.desc}</p>
            <button className={`w-full py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all ${i === 1 ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30' : 'bg-slate-950 text-white'}`}>Selecionar</button>
          </div>
        ))}
      </div>
    </section>
  );
};