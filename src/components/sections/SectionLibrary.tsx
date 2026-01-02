import React from 'react';
import { Camera, Check, Star, Mail, MapPin, Phone, ChevronDown, Send } from 'lucide-react';

type SectionStyles = {
  theme: 'dark' | 'light';
  align: 'center' | 'left';
  fontSize: 'small' | 'medium' | 'large';
  cols?: string;
};

// Sistema Dinâmico de Tipografia para respeitar a escolha do usuário
const getFontSize = (size: string, type: 'h1' | 'h2' | 'p' | 'card') => {
  const sizes = {
    h1: { small: 'text-3xl md:text-5xl', medium: 'text-5xl md:text-7xl', large: 'text-6xl md:text-8xl' },
    h2: { small: 'text-2xl', medium: 'text-3xl', large: 'text-4xl' },
    p: { small: 'text-xs', medium: 'text-base', large: 'text-xl' },
    card: { small: 'text-sm', medium: 'text-lg', large: 'text-2xl' }
  };
  return sizes[type][size as keyof typeof sizes['h1']] || sizes[type].medium;
};

const getTheme = (theme: string) => theme === 'dark' ? 'bg-[#0f172a] text-slate-100' : 'bg-white text-slate-900';

export const SectionLibrary: Record<string, React.FC<any>> = {
  
  // 1. HERO COMERCIAL
  hero_comercial: ({ content, style, onUpdate }) => {
    const isEditable = !!onUpdate;
    return (
      <section className={`relative py-20 px-6 min-h-[60vh] flex items-center overflow-hidden ${style.theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
        {content.image && <img src={content.image} className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" />}
        <div className={`max-w-6xl mx-auto w-full relative z-10 ${style.align === 'center' ? 'text-center' : 'text-left'}`}>
          <h1 
            contentEditable={isEditable} 
            suppressContentEditableWarning 
            onBlur={(e) => onUpdate?.('title', e.currentTarget.innerText)} 
            className={`${getFontSize(style.fontSize, 'h1')} font-black mb-6 outline-none tracking-tighter leading-[1.1]`}
          >
            {content.title || 'Título de Impacto'}
          </h1>
          <p 
            contentEditable={isEditable} 
            onBlur={(e) => onUpdate?.('sub', e.currentTarget.innerText)} 
            className={`${getFontSize(style.fontSize, 'p')} opacity-70 mb-10 max-w-2xl outline-none leading-relaxed ${style.align === 'center' ? 'mx-auto' : ''}`}
          >
            {content.sub || 'Subtítulo atraente para o seu serviço em Moçambique.'}
          </p>
          {isEditable && (
            <label className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black cursor-pointer hover:shadow-xl hover:shadow-blue-500/20 transition-all active:scale-95 text-xs uppercase tracking-widest">
              <Camera size={18} /> Mudar Imagem 
              <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0]; if (file) { const r = new FileReader(); r.onload = () => onUpdate('image', r.result); r.readAsDataURL(file); }
              }} />
            </label>
          )}
        </div>
      </section>
    );
  },

  // 2. SERVIÇOS GRID
  servicos_modern: ({ content, style, onUpdate }) => {
    const isEditable = !!onUpdate;
    const cols = style.cols === '4' ? 'grid-cols-2 lg:grid-cols-4' : style.cols === '2' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3';
    return (
      <section className={`py-20 px-6 ${getTheme(style.theme)}`}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center mb-16 font-black text-xs uppercase tracking-[0.3em] opacity-40">Expertise & Soluções</h2>
          <div className={`grid ${cols} gap-6`}>
            {(content.items || [1,2,3]).map((_, i) => (
              <div key={i} className={`p-8 rounded-[2rem] border transition-all ${style.theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-50 border-slate-100 hover:shadow-2xl hover:bg-white hover:border-blue-500/20'}`}>
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/20 font-bold tracking-tighter italic">0{i+1}</div>
                <h3 contentEditable={isEditable} className={`${getFontSize(style.fontSize, 'card')} font-black mb-3 outline-none tracking-tight`}>Serviço</h3>
                <p contentEditable={isEditable} className={`${getFontSize(style.fontSize, 'p')} opacity-60 leading-relaxed outline-none`}>Descrição detalhada focada em resultados e qualidade profissional.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  },

  // 3. ESTATÍSTICAS
  estatisticas_larga: ({ style }) => (
    <section className={`py-12 ${style.theme === 'dark' ? 'bg-blue-600' : 'bg-slate-950'} text-white`}>
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {[ {v:'100+', l:'Projetos'}, {v:'50+', l:'Clientes'}, {v:'15', l:'Especialistas'}, {v:'24h', l:'Suporte'} ].map((item, i) => (
          <div key={i}>
            <div className={`${getFontSize(style.fontSize, 'h2')} font-black mb-1 tracking-tighter`}>{item.v}</div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 whitespace-nowrap">{item.l}</div>
          </div>
        ))}
      </div>
    </section>
  ),

  // 4. GALERIA (Grid Profissional Compacto)
  galeria_grid: ({ content, onUpdate, style }) => {
    const isEditable = !!onUpdate;
    const cols = style.cols === '1' ? 'grid-cols-1' : style.cols === '2' ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4';
    return (
      <section className={`py-20 px-6 ${style.theme === 'dark' ? 'bg-[#0a0f1a]' : 'bg-white'}`}>
        <div className={`grid ${cols} gap-3 md:gap-4 max-w-7xl mx-auto`}>
          {(content.images || [1,2,3,4]).map((img: any, i: number) => (
            <div key={i} className="aspect-square relative group rounded-2xl overflow-hidden bg-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
              <img src={img.url || `https://picsum.photos/500/500?sig=${i}`} className="w-full h-full object-cover" />
              {isEditable && (
                <label className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all">
                  <Camera className="text-white" />
                  <input type="file" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0]; if (file) {
                      const r = new FileReader(); r.onload = () => {
                        const imgs = [...(content.images || Array(4).fill({}))];
                        imgs[i] = { url: r.result }; onUpdate?.('images', imgs);
                      }; r.readAsDataURL(file);
                    }
                  }} />
                </label>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  },

  // 5. PREÇOS
  precos_moderno: ({ style }) => (
    <section className={`py-20 px-6 ${getTheme(style.theme)}`}>
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
        {[1,2,3].map((_, i) => (
          <div key={i} className={`p-10 rounded-[2.5rem] border transition-all ${i === 1 ? 'border-blue-600 ring-2 ring-blue-600 scale-105 shadow-2xl' : 'border-black/5'} text-center`}>
            <h3 className="font-black text-sm mb-4 uppercase tracking-[0.2em] opacity-50">Plano {i === 1 ? 'Expert' : 'Base'}</h3>
            <div className={`${getFontSize(style.fontSize, 'h2')} font-black mb-6 tracking-tighter italic`}>MT 5.000<span className="text-xs opacity-50 font-normal">/mês</span></div>
            <ul className="text-[11px] space-y-4 mb-8 opacity-70 font-bold uppercase text-left border-t border-black/5 pt-6">
              <li className="flex items-center gap-2"><Check size={14} className="text-blue-600"/> Suporte 24/7</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-blue-600"/> Design Premium</li>
            </ul>
            <button className={`w-full py-4 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all ${i === 1 ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-950 text-white'}`}>Selecionar</button>
          </div>
        ))}
      </div>
    </section>
  ),

  // 6. TESTEMUNHOS
  testemunhos_focados: ({ style }) => (
    <section className={`py-20 px-6 text-center ${style.theme === 'dark' ? 'bg-[#0a0f1a] text-white' : 'bg-blue-50/50 text-slate-900'}`}>
      <div className="max-w-3xl mx-auto">
        <Star className="mx-auto mb-8 text-yellow-500 fill-yellow-500" size={24} />
        <p className={`${getFontSize(style.fontSize, 'card')} font-medium italic leading-relaxed mb-8 opacity-80`}>"Este sistema de edição mudou completamente a forma como trabalhamos com os nossos clientes em Maputo."</p>
        <div className="font-black text-[10px] uppercase tracking-[0.4em] text-blue-600">Empresa de Logística, Moçambique</div>
      </div>
    </section>
  ),

  // 7. FAQ
  faq_clean: ({ style }) => (
    <section className={`py-20 px-6 ${getTheme(style.theme)}`}>
      <div className="max-w-3xl mx-auto">
        <h2 className={`${getFontSize(style.fontSize, 'h2')} font-black mb-12 text-center tracking-tighter`}>Dúvidas Frequentes</h2>
        {[1,2,3,4].map((_, i) => (
          <div key={i} className="mb-4 border-b border-black/5 pb-5 group cursor-pointer">
            <h4 className={`${getFontSize(style.fontSize, 'p')} font-bold flex justify-between items-center group-hover:text-blue-600 transition-colors uppercase tracking-tight`}>Como funciona o suporte técnico? <ChevronDown size={14} className="opacity-30"/></h4>
          </div>
        ))}
      </div>
    </section>
  ),

  // 8. CONTACTO (Otimizado e Moderno)
  contacto_mapa: ({ style }) => (
    <section className={`py-20 px-6 ${getTheme(style.theme)}`}>
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
        <div className="bg-blue-600 p-12 rounded-[3rem] text-white flex flex-col justify-between overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div>
            <h2 className={`${getFontSize(style.fontSize, 'h2')} font-black mb-8 leading-none tracking-tighter italic`}>Conecte-se Connosco.</h2>
            <div className="space-y-6 font-bold text-sm tracking-tight">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"><Phone size={18}/> +258 84 000 0000</div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"><Mail size={18}/> ola@negocio.co.mz</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-white/5 p-12 rounded-[3rem] border border-black/5 flex flex-col justify-center gap-4">
           <input placeholder="Seu Nome" className="w-full p-5 rounded-2xl border-none outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-blue-600 text-sm font-bold bg-white transition-all shadow-sm" />
           <textarea placeholder="Sua Mensagem" rows={3} className="w-full p-5 rounded-2xl border-none outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-blue-600 text-sm font-bold bg-white transition-all shadow-sm" />
           <button className="bg-slate-950 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2">Enviar Mensagem <Send size={14}/></button>
        </div>
      </div>
    </section>
  )
};