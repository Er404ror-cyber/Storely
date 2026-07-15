import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, ArrowRight, X, MessageSquareText, Maximize2, Minimize2, Send } from 'lucide-react';
import { useTranslate } from '../../context/LanguageContext';
import { processAiQuery, getRandomFAQs, type AiEffect, type ChatMessage } from '../../hooks/aiBrain';

// Renderizador seguro para converter **texto** em negrito
const renderMarkdownText = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-extrabold text-[#7B61FF]">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
};

const AiAssistant = memo(function AiAssistant() {
  const navigate = useNavigate();
  const location = useLocation();
  const context = useTranslate() as any;
  const t = context.t;
  const language = context.language || context.lang || 'pt';
  const updateSystemLanguage = context.changeLanguage || context.setLanguage || context.setLang;

  const [aiQuery, setAiQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiBox, setShowAiBox] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); 
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [faqs, setFaqs] = useState<string[]>([]);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showAiBox && chatHistory.length === 0) setFaqs(getRandomFAQs(language));
  }, [showAiBox, language, chatHistory.length]);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (showAiBox) scrollToBottom();
  }, [chatHistory, showAiBox, isExpanded, isAiLoading, scrollToBottom]);

  // EMISOR DE AUTOMAÇÕES (Comunica com o restante da app)
  const executeAiEffects = useCallback((effects: AiEffect[]) => {
    effects.forEach(effect => {
      if (effect.type === 'CHANGE_LANGUAGE') {
        const targetLang = effect.payload as 'pt' | 'en';
        if (language !== targetLang && updateSystemLanguage) updateSystemLanguage(targetLang);
      } 
      else if (effect.type === 'NAVIGATE' && effect.payload) {
        setTimeout(() => navigate(effect.payload!), 600);
      }
      else if (effect.type === 'EDIT_STORE_NAME') {
        window.dispatchEvent(new CustomEvent('ai:edit-name'));
      }
      else if (effect.type === 'LOGOUT') {
        window.dispatchEvent(new CustomEvent('ai:logout'));
      }
      else if (effect.type === 'OPEN_STORE') {
        window.dispatchEvent(new CustomEvent('ai:open-store'));
      }
    });
  }, [language, updateSystemLanguage, navigate]);

  const handleSubmitQuery = useCallback((queryText: string) => {
    const text = queryText.trim();
    if (!text) return;
    
    setShowAiBox(true);
    setIsAiLoading(true);

    const newUserMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text };
    setChatHistory(prev => [...prev, newUserMsg]);
    setAiQuery(''); 

    setTimeout(() => {
      const result = processAiQuery(text, language, [...chatHistory, newUserMsg], location.pathname);
      
      let finalActions = result.actions;
      if (finalActions.some(a => a.route?.includes('wa.me'))) {
        finalActions = finalActions.map(a => a.route?.includes('wa.me') 
          ? { ...a, route: `${a.route}?text=${encodeURIComponent(`Olá, preciso de ajuda com: "${text}"`)}` } 
          : a
        );
      }

      const newAiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: result.text,
        actions: finalActions,
        expectsClarification: result.expectsClarification
      };

      setChatHistory(prev => [...prev, newAiMsg]);
      setIsAiLoading(false);

      if (result.effects && result.effects.length > 0) {
        executeAiEffects(result.effects);
      }
    }, 900); // 900ms simula pensamento natural
  }, [language, chatHistory, executeAiEffects, location.pathname]);

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isExpanded) setIsExpanded(false); 
    handleSubmitQuery(aiQuery);
  };

  const handleActionClick = (route?: string, isExternal?: boolean) => {
    if (!route) return;
    if (isExternal) window.open(route, '_blank', 'noopener,noreferrer');
    else navigate(route);
  };

  const activeMessage = chatHistory[chatHistory.length - 1];

  return (
    <>
      {/* Estilo Global do Efeito iOS Siri */}
      <style>{`
        @keyframes ios-glow {
          0% { filter: hue-rotate(0deg) blur(10px); opacity: 0.8; }
          50% { filter: hue-rotate(120deg) blur(15px); opacity: 1; }
          100% { filter: hue-rotate(0deg) blur(10px); opacity: 0.8; }
        }
        .siri-orb {
          background: conic-gradient(from 180deg at 50% 50%, #7B61FF 0deg, #ff0844 120deg, #00f2fe 240deg, #7B61FF 360deg);
          border-radius: 50%;
          animation: ios-glow 3s linear infinite;
        }
      `}</style>

      {/* INPUT HEADER PRINCIPAL */}
      <div className="relative flex items-center justify-end z-[50]">
        <div className="relative rounded-full p-[1.5px] transition-all duration-500 w-[160px] sm:w-[220px] focus-within:w-[220px] sm:focus-within:w-[280px] transform-gpu overflow-hidden">
          
          {/* Fundo brilhante quando a carregar */}
          {isAiLoading && <div className="absolute inset-[-10px] siri-orb z-0" />}

          <form 
            onSubmit={onFormSubmit} 
            className="flex items-center bg-white/95  rounded-full px-3 py-1.5 shadow-sm border border-slate-200/50 w-full h-full relative z-10"
          >
            {isAiLoading ? (
              <div className="mr-1.5 w-3 h-3 rounded-full siri-orb shrink-0" />
            ) : (
              <Sparkles size={14} className="text-[#7B61FF] mr-1.5 shrink-0" />
            )}
            <input 
              type="text" 
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder={isAiLoading ? 'A processar...' : (t('ai_search_placeholder') || 'Pergunte à IA...')} 
              className="bg-transparent border-none outline-none text-[16px] sm:text-[13px] font-bold text-slate-700 w-full placeholder-slate-400 focus:ring-0 p-0" 
            />
          </form>
        </div>

        {chatHistory.length > 0 && !showAiBox && (
          <button 
            onClick={() => { setShowAiBox(true); setIsExpanded(true); }}
            className="ml-2 w-8 h-8 rounded-full bg-white/80  border border-slate-200/50 shadow-sm text-[#7B61FF] flex items-center justify-center hover:bg-[#7B61FF] hover:text-white transition-all shrink-0"
          >
            <MessageSquareText size={16} />
          </button>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODO 1: DYNAMIC ISLAND COMPACTO (Guia Contextual Flutuante) */}
      {/* ========================================================= */}
      {showAiBox && !isExpanded && (
        <div className="fixed top-[76px] right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-[320px] rounded-[24px] z-[90] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-4 transition-all duration-500 shadow-[0_20px_40px_rgba(0,0,0,0.12)] border border-white/60 bg-white/70  saturate-200">
          
          <div className="flex items-center justify-between px-5 py-3 border-b border-black/5 bg-white/30">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className={`${isAiLoading ? 'text-purple-500 animate-pulse' : 'text-[#7B61FF]'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                {isAiLoading ? 'A pensar...' : 'Guia Ativo'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setIsExpanded(true)} className="w-7 h-7 flex items-center justify-center rounded-full bg-white/50 text-slate-500 hover:text-[#7B61FF] transition-colors"><Maximize2 size={13} strokeWidth={2.5} /></button>
              <button onClick={() => setShowAiBox(false)} className="w-7 h-7 flex items-center justify-center rounded-full bg-white/50 text-slate-500 hover:text-red-500 transition-colors"><X size={14} strokeWidth={2.5} /></button>
            </div>
          </div>
          
          <div className="p-5">
            {isAiLoading ? (
              <div className="flex flex-col gap-2.5">
                <div className="h-2 w-[85%] bg-slate-300/50 rounded-full animate-pulse" />
                <div className="h-2 w-[60%] bg-slate-300/50 rounded-full animate-pulse" />
              </div>
            ) : activeMessage?.sender === 'ai' ? (
              <div className="flex flex-col gap-3">
                <div className="text-[14px] font-medium text-slate-800 leading-relaxed whitespace-pre-line">
                  {renderMarkdownText(activeMessage.text)}
                </div>
                {activeMessage.actions && activeMessage.actions.length > 0 && (
                  <div className="flex flex-col gap-2 w-full mt-1">
                    {activeMessage.actions.map((action, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleActionClick(action.route, action.isExternal)}
                        className="group flex items-center justify-between bg-white/90 border border-white/50 text-[#7B61FF] px-4 py-2.5 rounded-[16px] hover:bg-white hover:shadow-md active:scale-[0.98] transition-all w-full"
                      >
                        <span className="text-[11px] font-black uppercase tracking-wider">{action.label}</span>
                        <div className="w-6 h-6 rounded-full bg-[#7B61FF]/10 flex items-center justify-center group-hover:bg-[#7B61FF] group-hover:text-white transition-colors">
                          <ArrowRight size={12} strokeWidth={2.5} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODO 2: ECRÃ INTEIRO / DRAWER PRO (100dvh Perfeito) */}
      {/* ========================================================= */}
      {showAiBox && isExpanded && (
        <>
          <div className="fixed inset-0 bg-slate-900/ z-[90] sm:hidden animate-in fade-in" onClick={() => setShowAiBox(false)} />

          <div className="fixed top-0 right-0 h-[100dvh] w-full sm:w-[420px] bg-white/80  saturate-200 shadow-[-10px_0_40px_rgba(0,0,0,0.1)] z-[100] flex flex-col animate-in slide-in-from-right border-l border-white/50">
            
            {/* 1. Header (Fixo) */}
            <div className="flex-none flex items-center justify-between p-5 border-b border-black/5 bg-white/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden">
                   <div className="absolute inset-[-5px] siri-orb z-0" />
                   <Sparkles size={14} className="text-white z-10" />
                </div>
                <span className="text-[13px] font-black uppercase tracking-widest text-slate-800">
                  {t('ai_assistant') || 'Assistente de Loja'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsExpanded(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/80 border border-slate-200/50 text-slate-500 hover:text-[#7B61FF] hover:shadow-sm transition-all"><Minimize2 size={16} strokeWidth={2.5} /></button>
                <button onClick={() => setShowAiBox(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/80 border border-slate-200/50 text-slate-500 hover:text-red-500 hover:border-red-200 hover:shadow-sm transition-all"><X size={16} strokeWidth={2.5} /></button>
              </div>
            </div>
            
            {/* 2. Área do Chat (Scrollável) */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 pb-6" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
              
              {chatHistory.length === 0 && !isAiLoading && (
                <div className="flex flex-col gap-3 mt-2 animate-in fade-in slide-in-from-bottom-4">
                  <div className="text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-widest pl-2">Sugestões Rápidas</div>
                  {faqs.map((faq, index) => (
                    <button key={index} onClick={() => handleSubmitQuery(faq)} className="text-left bg-white/60 border border-white/60 hover:bg-white hover:shadow-md text-slate-700 px-5 py-4 rounded-[20px] text-[14px] font-semibold transition-all active:scale-[0.98]">
                      {faq}
                    </button>
                  ))}
                </div>
              )}

              {chatHistory.map((msg) => (
                <div key={msg.id} className={`flex flex-col max-w-[90%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
                  <div className={`px-5 py-3.5 rounded-[22px] whitespace-pre-line text-[14px] font-medium leading-relaxed shadow-sm ${
                    msg.sender === 'user' ? 'bg-[#7B61FF] text-white rounded-tr-sm' : 'bg-white/90 border border-white text-slate-800 rounded-tl-sm'
                  }`}>
                    {renderMarkdownText(msg.text)}
                  </div>

                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2 w-full">
                      {msg.actions.map((action, idx) => (
                        <button 
                          key={idx}
                          onClick={() => handleActionClick(action.route, action.isExternal)}
                          className="group flex items-center justify-between bg-white/90 border border-white text-[#7B61FF] px-4 py-3 rounded-[16px] hover:bg-white hover:shadow-md active:scale-[0.98] transition-all w-full"
                        >
                          <span className="text-[12px] font-black uppercase tracking-wider">{action.label}</span>
                          <div className="w-6 h-6 rounded-full bg-[#7B61FF]/10 flex items-center justify-center group-hover:bg-[#7B61FF] group-hover:text-white transition-colors">
                            <ArrowRight size={12} strokeWidth={2.5} />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {isAiLoading && (
                <div className="self-start bg-white/90 border border-white rounded-[22px] rounded-tl-sm px-6 py-5 flex gap-1.5 shadow-sm">
                  <div className="w-2 h-2 bg-[#7B61FF]/60 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-[#7B61FF]/60 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <div className="w-2 h-2 bg-[#7B61FF]/60 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              )}
            </div>

            {/* 3. Input Fixo na Base (Fixo) */}
            <div className="flex-none p-4 bg-white/50 border-t border-black/5 pb-safe ">
              <form onSubmit={(e) => { e.preventDefault(); handleSubmitQuery(aiQuery); }} className="flex items-center gap-2 bg-white/80 border border-white focus-within:border-[#7B61FF]/40 rounded-[24px] px-4 py-2 transition-all shadow-[0_2px_12px_rgba(0,0,0,0.04)] focus-within:shadow-md">
                <input type="text" value={aiQuery} onChange={(e) => setAiQuery(e.target.value)} placeholder="Fala com a IA..." className="bg-transparent border-none outline-none text-[16px] sm:text-[14px] font-semibold text-slate-800 w-full placeholder-slate-400 focus:ring-0 p-0 py-1.5" />
                <button type="submit" disabled={!aiQuery.trim() || isAiLoading} className={`p-2.5 rounded-full shrink-0 transition-all ${!aiQuery.trim() || isAiLoading ? 'text-slate-300 bg-transparent' : 'bg-[#7B61FF] text-white shadow-lg active:scale-95'}`}>
                  <Send size={16} strokeWidth={2.5} />
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
});

export default AiAssistant;