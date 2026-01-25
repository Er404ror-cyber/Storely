import React, { useState } from 'react';
import { Camera,  Mail, MapPin, Phone, Send, MessageCircle } from 'lucide-react';

// --- Interfaces de Tipagem ---

export type SectionStyles = {
  theme?: 'dark' | 'light';
  align?: 'center' | 'left' | 'justify';
  fontSize?: 'small' | 'medium' | 'large' | 'base';
  cols?: string;
};

interface GalleryImage {
  url?: string;
}

interface SectionContent {
  title?: string;
  sub?: string;
  description?: string;
  image?: string;
  phone?: string;
  location?: string; // <--- Adicione isto
  email?: string;
  items?: Array<{ title: string; desc: string; price?: string }>;
  images?: GalleryImage[];
  [key: string]: unknown;
}

interface SectionProps {
  content: SectionContent;
  style: SectionStyles;
  onUpdate?: (k: string, v: unknown) => void;
}

// --- Helpers de Estilização ---

const getFontSize = (size: string | undefined, type: 'h1' | 'h2' | 'p' | 'card') => {
  const sizes = {
    h1: { small: 'text-3xl md:text-5xl', medium: 'text-5xl md:text-7xl', large: 'text-6xl md:text-8xl' },
    h2: { small: 'text-2xl', medium: 'text-3xl', large: 'text-4xl' },
    p: { small: 'text-xs', medium: 'text-base', large: 'text-lg' },
    card: { small: 'text-sm', medium: 'text-lg', large: 'text-xl' }
  };
  const safeSize = (size && size in sizes.h1) ? (size as keyof typeof sizes.h1) : 'medium';
  return sizes[type][safeSize];
};

const getTheme = (theme: string | undefined) => 
  theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900';

const editableProps = (isEditable: boolean, onBlur: (val: string) => void) => ({
  contentEditable: isEditable,
  suppressContentEditableWarning: true,
  onBlur: (e: React.FocusEvent<HTMLElement>) => onBlur(e.currentTarget.innerText),
  className: `outline-none focus:ring-2 focus:ring-blue-500/40 rounded px-1 transition-all`
});

// --- Biblioteca de Componentes ---

export const SectionLibrary: Record<string, React.FC<SectionProps>> = {
  
  hero_comercial: ({ content, style, onUpdate }) => {
    const isEditable = !!onUpdate;
    const alignClass = style.align === 'center' ? 'text-center' : 'text-left';

    return (
      <section className={`relative py-28 px-6 min-h-[70vh] flex items-center overflow-hidden ${getTheme(style.theme)}`}>
        {content.image && <img src={content.image as string} className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" alt="" />}
        <div className={`max-w-6xl mx-auto w-full relative z-10 ${alignClass}`}>
          <h1 
            {...editableProps(isEditable, (v) => onUpdate?.('title', v))}
            className={`${getFontSize(style.fontSize, 'h1')} font-black mb-6 tracking-tighter leading-[1.1] block`}
          >
            {content.title || 'Título de Impacto'}
          </h1>
          <p 
            {...editableProps(isEditable, (v) => onUpdate?.('sub', v))}
            className={`${getFontSize(style.fontSize, 'p')} opacity-70 mb-10 max-w-2xl block ${style.align === 'center' ? 'mx-auto' : ''}`}
          >
            {content.sub || 'Subtítulo atraente para o seu serviço em Moçambique.'}
          </p>
          {isEditable && (
            <label className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black cursor-pointer hover:shadow-xl hover:shadow-blue-500/20 transition-all active:scale-95 text-xs uppercase tracking-widest">
              <Camera size={18} /> Mudar Imagem de Fundo
              <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0]; 
                if (file) { 
                  const r = new FileReader(); 
                  r.onload = () => onUpdate?.('image', r.result); 
                  r.readAsDataURL(file); 
                }
              }} />
            </label>
          )}
        </div>
      </section>
    );
  },

  estatisticas_larga: ({ content, style, onUpdate }) => {
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
  },

  servicos_modern: ({ content, style, onUpdate }) => {
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
  },

  galeria_grid: ({ content, style, onUpdate }) => {
    const isEditable = !!onUpdate;
    const images = content.images || [{}, {}, {}, {}];
    const colsValue = style.cols || '4';
    const cols = colsValue === '1' ? 'grid-cols-1' : colsValue === '2' ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4';

    return (
      <section className={`py-24 px-6 ${getTheme(style.theme)}`}>
        <div className="max-w-7xl mx-auto">
          <h2 {...editableProps(isEditable, (v) => onUpdate?.('title', v))} className="text-center mb-12 font-black text-2xl block uppercase tracking-tighter">
            {content.title || 'Galeria de Projetos'}
          </h2>
          <div className={`grid ${cols} gap-4`}>
            {images.map((img, i) => (
              <div key={i} className="group relative aspect-square rounded-[32px] overflow-hidden bg-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
                <img src={img.url || `https://picsum.photos/600/600?sig=${i}`} className="w-full h-full object-cover font-black" alt="" />
                {isEditable && (
                  <label className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all">
                    <Camera className="text-white" size={24} />
                    <input type="file" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0]; 
                      if (file) {
                        const r = new FileReader(); 
                        r.onload = () => {
                          const newImages = [...images];
                          newImages[i] = { url: r.result as string }; 
                          onUpdate?.('images', newImages);
                        }; 
                        r.readAsDataURL(file);
                      }
                    }} />
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  },

  precos_moderno: ({ content, style, onUpdate }) => {
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
  },

  contacto_mapa: ({ content, style, onUpdate }) => {
    const isEditable = !!onUpdate;
    const [showModal, setShowModal] = useState(false);
    
    // Temas para os Inputs
    const inputStyle = style.theme === 'dark' 
      ? 'bg-white/5 border-white/10 text-white placeholder-white/30' 
      : 'bg-white border-slate-200 text-slate-900 shadow-sm';
    const themeClass = style.theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900';

    const handleAction = (type: 'wa' | 'mail') => {
      const dest = type === 'wa' ? `https://wa.me/${(content.phone || '').replace(/\D/g, '')}` : `mailto:${content.email}`;
      window.open(dest, '_blank');
      setShowModal(false);
    };

    return (
      <section className={`py-24 px-6 ${themeClass}`}>
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
          {/* Cartão de Contacto */}
          <div className="bg-blue-600 p-12 rounded-[40px] text-white flex flex-col justify-between shadow-2xl shadow-blue-500/30 relative overflow-hidden">
            <div className="relative z-10">
              <h2 {...editableProps(isEditable, (v) => onUpdate?.('title', v))} className="text-4xl font-black mb-10 leading-tight">
                {content.title || 'Pronto para começar?'}
              </h2>
              <div className="space-y-6">
                <div className="group">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 ml-1">Telefone / WhatsApp</p>
                  <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10">
                    <Phone size={20} className="text-blue-200"/>
                    <span {...editableProps(isEditable, (v) => onUpdate?.('phone', v))} className="font-bold">
                      {content.phone || '+258 84 000 0000'}
                    </span>
                  </div>
                </div>
                <div className="group">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 ml-1">E-mail</p>
                  <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10">
                    <Mail size={20} className="text-blue-200"/>
                    <span {...editableProps(isEditable, (v) => onUpdate?.('email', v))} className="font-bold">
                      {content.email || 'ola@empresa.co.mz'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12 flex items-center gap-3">
              <MapPin size={20} className="text-blue-200"/>
              <span {...editableProps(isEditable, (v) => onUpdate?.('location', v))} className="font-bold uppercase tracking-widest text-xs">
                {content.location || 'Maputo, Moçambique'}
              </span>
            </div>
          </div>

          {/* Formulário */}
          <div className="flex flex-col gap-6 p-2">
            <h3 className="text-2xl font-black tracking-tight">Envie uma mensagem direta</h3>
            <input placeholder="Seu Nome" className={`w-full p-5 rounded-[24px] border-2 outline-none focus:border-blue-500 transition-all font-medium ${inputStyle}`} />
            <textarea placeholder="Como podemos ajudar?" rows={4} className={`w-full p-5 rounded-[24px] border-2 outline-none focus:border-blue-500 transition-all font-medium ${inputStyle}`} />
            <button 
              onClick={() => !isEditable && setShowModal(true)}
              className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              Enviar Agora <Send size={18}/>
            </button>
          </div>
        </div>

        {/* Modal de Escolha */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-white p-8 rounded-[32px] max-w-sm w-full shadow-2xl text-slate-900 scale-in-center">
              <h4 className="text-2xl font-black mb-6 text-center tracking-tight">Como prefere falar?</h4>
              <div className="grid gap-4">
                <button onClick={() => handleAction('wa')} className="flex items-center justify-center gap-3 bg-[#25D366] text-white p-5 rounded-2xl font-black hover:opacity-90 transition-all shadow-lg shadow-green-500/20">
                  <MessageCircle size={24}/> WhatsApp
                </button>
                <button onClick={() => handleAction('mail')} className="flex items-center justify-center gap-3 bg-slate-900 text-white p-5 rounded-2xl font-black hover:opacity-90 transition-all">
                  <Mail size={24}/> E-mail
                </button>
                <button onClick={() => setShowModal(false)} className="mt-2 text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100">Fechar</button>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }
};