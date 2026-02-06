import React from 'react';
import { Camera } from 'lucide-react';
import type { SectionProps } from '../types';
import { getTheme, getFontSize, editableProps, handleFileUpload } from '../helpers';
import { MediaRenderer } from '../mediarender';

export const HeroComercial: React.FC<SectionProps> = ({ content, style, onUpdate }) => {
  const isEditable = !!onUpdate;
  const alignClass = style.align === 'center' ? 'text-center' : 'text-left';

  return (
    <section className={`relative py-28 px-6 min-h-[70vh] flex items-center overflow-hidden ${getTheme(style.theme)}`}>
      <div className="absolute inset-0 z-0">
        <MediaRenderer media={content.media} className="w-full h-full object-cover opacity-30" />
      </div>
      
      <div className={`max-w-6xl mx-auto w-full relative z-10 ${alignClass}`}>
        <h1 {...editableProps(isEditable, (v) => onUpdate?.('title', v))} className={`${getFontSize(style.fontSize, 'h1')} font-black mb-6 tracking-tighter`}>
          {content.title || 'Título'}
        </h1>
        {/* ... restante do Hero ... */}
        {isEditable && (
          <label className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black cursor-pointer uppercase tracking-widest text-xs">
            <Camera size={18} /> Mudar Mídia (Foto/Vídeo)
            <input type="file" className="hidden" accept="image/*,video/*" onChange={(e) => {
              if (e.target.files?.[0]) handleFileUpload(e.target.files[0], (m) => onUpdate?.('media', m));
            }} />
          </label>
        )}
      </div>
    </section>
  );
};