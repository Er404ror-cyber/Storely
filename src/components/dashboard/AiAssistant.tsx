import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Loader2, Bot, X, MessageSquareText, Maximize2, Minimize2, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslate } from '../../context/LanguageContext';
import { processAiQuery, getRandomFAQs, type AiEffect, type ChatMessage } from '../../hooks/aiBrain';

const AiAssistant = memo(function AiAssistant() {
  const navigate = useNavigate();
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

  // Gera FAQs aleatórias sempre que o painel é aberto ou muda de língua
  useEffect(() => {
    if (showAiBox && chatHistory.length === 0) {
      setFaqs(getRandomFAQs(language));
    }
  }, [showAiBox, language, chatHistory.length]);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (showAiBox && isExpanded) scrollToBottom();
  }, [chatHistory, showAiBox, isExpanded, isAiLoading, scrollToBottom]);

  const executeAiEffects = useCallback((effects: AiEffect[]) => {
    effects.forEach(effect => {
      if (effect.type === 'CHANGE_LANGUAGE') {
        const targetLang = effect.payload as 'pt' | 'en';
        if (language !== targetLang && updateSystemLanguage) {
          updateSystemLanguage(targetLang);
          toast.success(targetLang === 'pt' ? 'Idioma: Português' : 'Language: English', {
            id: 'ai-lang',
            style: { borderRadius: '12px', background: '#7B61FF', color: '#fff', fontSize: '12px', fontWeight: 'bold' },
          });
        }
      } else if (effect.type === 'NAVIGATE') {
        setTimeout(() => navigate(effect.payload), 800);
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
      const result = processAiQuery(text, language, [...chatHistory, newUserMsg]);
      
      let finalActions = result.actions;
      if (finalActions.some(a => a.route.includes('wa.me'))) {
        finalActions = finalActions.map(a => a.route.includes('wa.me') 
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
    }, 600);
  }, [language, chatHistory, executeAiEffects]);

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Inicia no modo Cartão se for submetido a partir do topo
    if (!isExpanded) setIsExpanded(false); 
    handleSubmitQuery(aiQuery);
  };

  const handleActionClick = (route: string, isExternal?: boolean) => {
    if (isExternal) {
      window.open(route, '_blank', 'noopener,noreferrer');
    } else {
      navigate(route);
    }
  };

  const activeMessage = chatHistory[chatHistory.length - 1];

  return (
    <>
      <div className="relative flex items-center justify-end z-[50]">
        <form 
          onSubmit={onFormSubmit} 
          className="flex items-center bg-white hover:bg-slate-50 focus-within:bg-white rounded-full px-3 py-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-slate-200/60 focus-within:border-[#7B61FF]/40 focus-within:shadow-[0_4px_16px_rgba(123,97,255,0.08)] transition-all duration-300 w-[160px] sm:w-[220px] focus-within:w-[220px] sm:focus-within:w-[280px]"
        >
          {isAiLoading ? (
            <Loader2 size={14} className="text-[#7B61FF] mr-1.5 shrink-0 animate-spin" />
          ) : (
            <Sparkles size={14} className="text-[#7B61FF] mr-1.5 shrink-0" />
          )}
          <input 
            type="text" 
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            placeholder={t('ai_search_placeholder') || 'Pergunte à IA...'} 
            className="bg-transparent border-none outline-none text-[16px] sm:text-[13px] font-bold text-slate-700 w-full placeholder-slate-400 focus:ring-0 p-0" 
          />
          <button 
            type="submit" 
            disabled={!aiQuery.trim() || isAiLoading}
            className={`ml-1.5 p-1 rounded-full shrink-0 transition-all ${!aiQuery.trim() || isAiLoading ? 'bg-slate-100 text-slate-300' : 'bg-[#7B61FF] text-white hover:scale-105 active:scale-95 shadow-sm'}`}
          >
            <ArrowRight size={12} strokeWidth={2.5} />
          </button>
        </form>

        {chatHistory.length > 0 && !showAiBox && (
          <button 
            onClick={() => { setShowAiBox(true); setIsExpanded(true); }}
            className="ml-2 w-8 h-8 rounded-full bg-[#7B61FF]/10 text-[#7B61FF] flex items-center justify-center hover:bg-[#7B61FF] hover:text-white transition-colors animate-in fade-in shrink-0"
          >
            <MessageSquareText size={16} />
          </button>
        )}
      </div>

      {/* MODO 1: MINI CARTÃO (Guia Rápido) */}
      {showAiBox && !isExpanded && (
        <div className="fixed top-[76px] right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-[340px] bg-white rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.14)] border border-slate-200/80 z-[90] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between px-4 py-3 bg-[#F8F9FA] border-b border-slate-100">
            <div className="flex items-center gap-2 text-[#7B61FF]">
              <div className="w-7 h-7 rounded-full bg-[#7B61FF]/10 flex items-center justify-center shadow-inner">
                <Bot size={14} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider">
                {isAiLoading ? 'A Analisar...' : 'Guia da Loja'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setIsExpanded(true)} className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-slate-200/60 text-slate-400 hover:bg-[#7B61FF]/10 hover:border-transparent hover:text-[#7B61FF] transition-colors shadow-sm" title="Expandir Chat">
                <Maximize2 size={13} strokeWidth={2.5} />
              </button>
              <button onClick={() => setShowAiBox(false)} className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-slate-200/60 text-slate-400 hover:bg-red-50 hover:border-transparent hover:text-red-500 transition-colors shadow-sm">
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>
          <div className="p-4 sm:p-5 bg-white">
            {isAiLoading ? (
              <div className="flex gap-1.5 items-center justify-center py-2">
                <div className="w-1.5 h-1.5 bg-[#7B61FF]/60 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-[#7B61FF]/60 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <div className="w-1.5 h-1.5 bg-[#7B61FF]/60 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            ) : activeMessage?.sender === 'ai' ? (
              <div className="flex flex-col gap-3">
                <div className="text-[13px] font-semibold text-slate-700 leading-relaxed">
                  {activeMessage.text}
                </div>
                {activeMessage.actions && activeMessage.actions.length > 0 && (
                  <div className="flex flex-col gap-2 w-full mt-2">
                    {activeMessage.actions.map((action, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleActionClick(action.route, action.isExternal)}
                        className="group flex items-center justify-between bg-white border border-slate-200 text-[#7B61FF] px-4 py-2.5 rounded-[14px] hover:bg-slate-50 hover:border-[#7B61FF]/40 active:scale-[0.98] transition-all w-full shadow-sm"
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

      {/* MODO 2: PAINEL LATERAL (Full Screen no mobile, Drawer no PC com Input) */}
      {showAiBox && isExpanded && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[90] sm:hidden animate-in fade-in"
            onClick={() => setShowAiBox(false)}
          />

          <div className="fixed top-0 right-0 h-[100dvh] w-full sm:w-[400px] bg-white shadow-[-8px_0_40px_rgba(0,0,0,0.08)] z-[100] flex flex-col transform transition-transform duration-300 animate-in slide-in-from-right border-l border-slate-100">
            
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-[#F8F9FA] shrink-0 pt-safe">
              <div className="flex items-center gap-3 text-[#7B61FF]">
                <div className="w-8 h-8 rounded-full bg-[#7B61FF]/10 flex items-center justify-center shadow-inner">
                  <Bot size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-black uppercase tracking-wider leading-tight">
                    {t('ai_assistant') || 'Assistente Inteligente'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsExpanded(false)} 
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-slate-400 hover:bg-slate-100 hover:text-[#7B61FF] transition-colors shadow-sm border border-slate-200/50"
                  title="Modo Guia Compacto"
                >
                  <Minimize2 size={16} strokeWidth={2.5} />
                </button>
                <button 
                  onClick={() => setShowAiBox(false)} 
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm border border-slate-200/50"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
            
            <div 
              ref={chatContainerRef} 
              className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 bg-white pb-4" 
              style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              {chatHistory.length === 0 && !isAiLoading && (
                <div className="flex flex-col gap-4 mt-4">
                  <div className="text-center text-[13px] font-bold text-slate-400 mb-2">
                    {t('ai_initial_msg') || 'Aqui estão algumas perguntas frequentes:'}
                  </div>
                  {/* FAQs Aleatórias */}
                  {faqs.map((faq, index) => (
                    <button
                      key={index}
                      onClick={() => handleSubmitQuery(faq)}
                      className="text-left bg-slate-50 border border-slate-100 hover:border-[#7B61FF]/30 hover:bg-[#7B61FF]/5 text-slate-600 hover:text-[#7B61FF] px-4 py-3 rounded-2xl text-[13px] font-semibold transition-all active:scale-[0.98]"
                    >
                      {faq}
                    </button>
                  ))}
                </div>
              )}

              {chatHistory.map((msg) => (
                <div key={msg.id} className={`flex flex-col max-w-[90%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
                  <div className={`px-4 py-3 rounded-[18px] whitespace-pre-line text-[13px] font-semibold leading-relaxed shadow-sm ${
                    msg.sender === 'user' ? 'bg-[#7B61FF] text-white rounded-tr-sm' : 'bg-[#F8F9FA] text-slate-700 border border-slate-100 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>

                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2.5 w-full">
                      {msg.actions.map((action, idx) => (
                        <button 
                          key={idx}
                          onClick={() => handleActionClick(action.route, action.isExternal)}
                          className="group flex items-center justify-between bg-white border border-slate-200 text-[#7B61FF] px-4 py-2.5 rounded-[14px] hover:bg-slate-50 hover:border-[#7B61FF]/40 active:scale-[0.98] transition-all w-full shadow-sm"
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
              ))}
              
              {isAiLoading && (
                <div className="self-start bg-[#F8F9FA] border border-slate-100 rounded-[18px] rounded-tl-sm px-5 py-4 flex gap-1.5 w-fit shadow-sm">
                  <div className="w-1.5 h-1.5 bg-[#7B61FF]/60 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-[#7B61FF]/60 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <div className="w-1.5 h-1.5 bg-[#7B61FF]/60 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              )}
            </div>

            {/* Input Fixo na Base do Painel (Chat-like) */}
            <div className="p-4 bg-white border-t border-slate-100 pb-safe">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSubmitQuery(aiQuery); }}
                className="flex items-center gap-2 bg-[#F8F9FA] border border-slate-200/60 focus-within:border-[#7B61FF]/40 focus-within:bg-white rounded-full px-4 py-2 transition-colors shadow-sm"
              >
                <input 
                  type="text" 
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Digita a tua pergunta..."
                  className="bg-transparent border-none outline-none text-[16px] sm:text-[13px] font-semibold text-slate-700 w-full placeholder-slate-400 focus:ring-0 p-0" 
                />
                <button 
                  type="submit" 
                  disabled={!aiQuery.trim() || isAiLoading}
                  className={`p-2 rounded-full shrink-0 transition-transform ${!aiQuery.trim() || isAiLoading ? 'text-slate-300' : 'bg-[#7B61FF] text-white hover:scale-105 active:scale-95 shadow-md'}`}
                >
                  <Send size={14} strokeWidth={2.5} />
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