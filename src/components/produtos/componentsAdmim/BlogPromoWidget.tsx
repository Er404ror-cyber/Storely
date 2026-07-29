import { memo, useCallback } from 'react';
import { ArrowUpRight, Sparkles, Compass, Music, Bot, Radio } from 'lucide-react';
import { useTranslate } from '../../../context/LanguageContext';

interface BlogPromoWidgetProps {
  onNavigate: (path: string) => void;
}

export const BlogPromoWidget = memo(({ onNavigate }: BlogPromoWidgetProps) => {
  const { t, lang } = useTranslate();

  const handleLinkClick = useCallback(() => {
    onNavigate('/blog');
  }, [onNavigate]);

  const content = {
    pt: {
      edition: 'EDIÇÃO GLOBAL • PORTAL',
      badge: 'Novidades & Updates',
      title: 'Explora o ecossistema, templates e o futuro do design web.',
      desc: 'Um portal imersivo desenhado para criadores. Descobre as novas funcionalidades, como áudio imersivo e a nova IA local de assistência.',
      button: 'Entrar no Portal',
      card1Tag: 'Novo Update • Áudio',
      card1Time: 'Lançado Agora',
      card1Title: 'Música de fundo imersiva e bandas sonoras dinâmicas nas lojas',
      card2Tag: 'Beta • IA Local',
      card2Engine: 'Engine v5',
      card2Title: 'Nova Inteligência Artificial local para te ajudar a gerir o negócio',
      footerHub: 'Hub de Conteúdo',
      footerMore: '+ Artigos & Guias',
    },
    en: {
      edition: 'GLOBAL EDITION • PORTAL',
      badge: 'News & Updates',
      title: 'Explore the ecosystem, templates, and the future of web design.',
      desc: 'An immersive portal built for creators. Discover new features like background audio and our brand-new local AI assistant.',
      button: 'Enter Portal',
      card1Tag: 'New Update • Audio',
      card1Time: 'Just Released',
      card1Title: 'Immersive background music and dynamic soundscapes for your store',
      card2Tag: 'Beta • Local AI',
      card2Engine: 'Engine v5',
      card2Title: 'New local AI assistant to help you streamline your business workflow',
      footerHub: 'Content Hub',
      footerMore: '+ Articles & Guides',
    },
  };

  const currentLang = (lang === 'en' ? content.en : content.pt);

  return (
    <section 
      onClick={handleLinkClick}
      className="relative overflow-hidden rounded-[2.5rem] bg-[#120E1C] text-white cursor-pointer group
        border border-purple-900/30 shadow-xl p-6 sm:p-8 md:p-12 mt-6 
        transform-gpu will-change-transform contain-paint
        transition-all duration-300 hover:border-purple-500/50 hover:shadow-purple-950/20"
    >
      {/* Luzes de Fundo Estáticas otimizadas */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-600/5 rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 rounded-full pointer-events-none" />

      {/* Grid Principal do Portal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Lado Esquerdo: Headline & Identidade do Portal */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">
              <Radio size={12} className="text-purple-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                {currentLang.edition}
              </span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-zinc-400">
              <Sparkles size={12} className="text-amber-400" /> {currentLang.badge}
            </span>
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-[1.08] max-w-xl">
              {t('promo_title') || currentLang.title}
            </h3>
            <p className="text-sm sm:text-base font-medium text-zinc-400 max-w-lg leading-relaxed">
              {t('promo_desc') || currentLang.desc}
            </p>
          </div>

          <div className="pt-2">
            <div className="inline-flex h-12 items-center gap-3 rounded-2xl bg-white px-6 text-xs font-black uppercase tracking-[0.15em] text-[#120E1C] transition-transform duration-200 group-hover:scale-[1.02] transform-gpu shadow-md">
              <span>{t('portal_explore_btn') || currentLang.button}</span>
              <div className="w-7 h-7 rounded-xl bg-[#120E1C] text-white flex items-center justify-center transition-transform group-hover:translate-x-1">
                <ArrowUpRight size={14} strokeWidth={3} />
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito: Preview com as novas informações (Música & IA Beta) */}
        <div className="lg:col-span-5 w-full select-none pointer-events-none hidden sm:block">
          <div className="relative flex flex-col gap-3 transform lg:rotate-1 transition-transform duration-300">
            
            {/* Bloco 1: Música de Fundo */}
            <div className="bg-zinc-900/90 border border-purple-500/20 rounded-2xl p-4 shadow-md transition-colors group-hover:border-purple-500/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black tracking-widest uppercase text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Music size={10} /> {currentLang.card1Tag}
                </span>
                <span className="text-[10px] text-zinc-500 font-bold">{currentLang.card1Time}</span>
              </div>
              <p className="text-xs font-bold text-white leading-snug">
                {currentLang.card1Title}
              </p>
            </div>

            {/* Bloco 2: IA Local Beta */}
            <div className="bg-zinc-900/90 border border-blue-500/20 rounded-2xl p-4 shadow-md ml-4 transition-colors group-hover:border-blue-500/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black tracking-widest uppercase text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Bot size={10} /> {currentLang.card2Tag}
                </span>
                <span className="text-[10px] text-zinc-500 font-bold">{currentLang.card2Engine}</span>
              </div>
              <p className="text-xs font-bold text-white leading-snug">
                {currentLang.card2Title}
              </p>
            </div>

            {/* Rodapé do Preview */}
            <div className="flex items-center justify-between px-3 pt-1 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><Compass size={12} className="text-purple-400" /> {currentLang.footerHub}</span>
              <span className="text-purple-400 font-extrabold">{currentLang.footerMore}</span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
});

BlogPromoWidget.displayName = 'BlogPromoWidget';