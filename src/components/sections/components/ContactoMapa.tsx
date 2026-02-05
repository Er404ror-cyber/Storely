import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, MessageCircle } from 'lucide-react';
import type { SectionProps } from '../../../types/library';
import { editableProps } from '../helpers';

export const ContactoMapa: React.FC<SectionProps> = ({ content, style, onUpdate }) => {
  const isEditable = !!onUpdate;
  const [showModal, setShowModal] = useState(false);
  
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
        <div className="bg-blue-600 p-12 rounded-[40px] text-white flex flex-col justify-between shadow-2xl shadow-blue-500/30 relative overflow-hidden">
          <div className="relative z-10">
            <h2 {...editableProps(isEditable, (v) => onUpdate?.('title', v))} className="text-4xl font-black mb-10 leading-tight">
              {content.title || 'Pronto para começar?'}
            </h2>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 ml-1">Telefone / WhatsApp</p>
                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10">
                  <Phone size={20} className="text-blue-200"/>
                  <span {...editableProps(isEditable, (v) => onUpdate?.('phone', v))} className="font-bold">
                    {content.phone || '+258 84 000 0000'}
                  </span>
                </div>
              </div>
              <div>
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
        <div className="flex flex-col gap-6 p-2">
          <h3 className="text-2xl font-black tracking-tight">Envie uma mensagem direta</h3>
          <input placeholder="Seu Nome" className={`w-full p-5 rounded-[24px] border-2 outline-none focus:border-blue-500 transition-all font-medium ${inputStyle}`} />
          <textarea placeholder="Como podemos ajudar?" rows={4} className={`w-full p-5 rounded-[24px] border-2 outline-none focus:border-blue-500 transition-all font-medium ${inputStyle}`} />
          <button onClick={() => !isEditable && setShowModal(true)} className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
            Enviar Agora <Send size={18}/>
          </button>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white p-8 rounded-[32px] max-w-sm w-full shadow-2xl text-slate-900">
            <h4 className="text-2xl font-black mb-6 text-center tracking-tight">Como prefere falar?</h4>
            <div className="grid gap-4">
              <button onClick={() => handleAction('wa')} className="flex items-center justify-center gap-3 bg-[#25D366] text-white p-5 rounded-2xl font-black hover:opacity-90 transition-all shadow-lg shadow-green-500/20"><MessageCircle size={24}/> WhatsApp</button>
              <button onClick={() => handleAction('mail')} className="flex items-center justify-center gap-3 bg-slate-900 text-white p-5 rounded-2xl font-black hover:opacity-90 transition-all"><Mail size={24}/> E-mail</button>
              <button onClick={() => setShowModal(false)} className="mt-2 text-xs font-bold uppercase tracking-widest opacity-40">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};