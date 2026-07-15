import React, { useMemo } from 'react';
import { TITLE_SIZES, SUBTITLE_SIZES } from './PortfolioShared';
import type { LayoutProps } from '../../types/PortfolioTypes';

// Classes utilitárias isoladas estáticas
const TEXT_OVERRIDE_CLASSES = [
  '[&_span]:!text-white [&_span]:[text-shadow:0_2px_4px_rgba(0,0,0,0.9)]',
  '[&_p]:!text-white [&_p]:[text-shadow:0_2px_4px_rgba(0,0,0,0.9)]',
  '[&_h1]:!text-white [&_h1]:[text-shadow:0_2px_4px_rgba(0,0,0,0.9)]',
  '[&_h2]:!text-white [&_h2]:[text-shadow:0_2px_4px_rgba(0,0,0,0.9)]',
  '[&_h3]:!text-white [&_h3]:[text-shadow:0_2px_4px_rgba(0,0,0,0.9)]',
  '[&_h4]:!text-white [&_h4]:[text-shadow:0_2px_4px_rgba(0,0,0,0.9)]',
  '[&_b]:!text-white',
  '[&_strong]:!text-white'
].join(' ');

export const PortfolioLayout1: React.FC<LayoutProps> = ({
  c,
  isEditor,
  isDark,
  fontSize,
  displayImage,
  editableClass,
  handleTextEdit,
  handleKeyDown,
  RenderStats,
  RenderSocialsAndFlag
}) => {
  // Memoriza os callbacks para evitar re-criação de escopo e re-renders inúteis nos inputs editáveis
  const onKeyDownAlias = useMemo(() => handleKeyDown(15), [handleKeyDown]);
  const onBlurAlias = useMemo(() => handleTextEdit('alias'), [handleTextEdit]);
  const onKeyDownFullName = useMemo(() => handleKeyDown(35), [handleKeyDown]);
  const onBlurFullName = useMemo(() => handleTextEdit('fullName'), [handleTextEdit]);

  return (
    <div className="relative z-10 flex flex-col justify-between w-full max-w-7xl mx-auto px-0 lg:px-8 pb-0 pt-12 lg:pt-0 min-h-[500px] lg:min-h-[650px] flex-grow overflow-hidden will-change-contents">
      
      {/* TEXTO ESQUERDA - Otimizado para CPU/GPU */}
      <div className="relative px-6 lg:px-0 lg:absolute lg:left-8 lg:top-[40%] lg:-translate-y-1/2 z-30 flex flex-col items-center lg:items-start text-center lg:text-left w-full lg:w-[540px] mb-4 lg:mb-0 pointer-events-auto selection:bg-white/35">
        
        {/* SUBSTITUÍDO: O "blur-xl" foi removido. Usamos um gradiente radial simples e leve para contraste */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.25)_0%,transparent_70%)] pointer-events-none -z-10" />
        
        {/* Otimizado com text-shadow nativo em vez de drop-shadow de camada */}
        <h1 
          className={`${TITLE_SIZES[fontSize]} leading-[0.9] font-black uppercase tracking-wider ${editableClass} !text-white [text-shadow:0_4px_8px_rgba(0,0,0,0.9)] rounded-lg`} 
          contentEditable={isEditor} 
          suppressContentEditableWarning 
          onKeyDown={onKeyDownAlias} 
          onBlur={onBlurAlias} 
          style={{ fontFamily: '"Impact", sans-serif' }}
        >
          {c.alias || 'MAENG'}
        </h1>
        <p 
          className={`${SUBTITLE_SIZES[fontSize]} font-light !text-gray-100 mt-2 lg:mt-3 ${editableClass} [text-shadow:0_2px_6px_rgba(0,0,0,0.9)] rounded-lg`} 
          contentEditable={isEditor} 
          suppressContentEditableWarning 
          onKeyDown={onKeyDownFullName} 
          onBlur={onBlurFullName}
        >
          {c.fullName || 'Marsha lenathea Lapian'}
        </p>
        
        {/* Socials no Mobile */}
        <div className="lg:hidden w-full flex justify-center mt-4">
          <RenderSocialsAndFlag />
        </div>
      </div>

      {/* SOCIALS NA LATERAL DIREITA (Desktop) */}
      <div className="hidden lg:flex absolute right-8 top-[40%] -translate-y-1/2 z-40 flex-col items-center [&>div]:!flex-col [&>div]:!gap-6 [&>div]:!mt-0 [&>div]:items-center">
        <RenderSocialsAndFlag />
      </div>
      
      {/* IMAGEM CENTRAL - Ajustada para pular re-pintura pesada */}
      <div className="relative z-10 w-full flex-1 min-h-[400px] lg:min-h-[500px] lg:min-h-[600px] max-h-[700px] pointer-events-none flex justify-center overflow-hidden">
         <div className={`absolute inset-y-0 left-0 w-[15%] bg-gradient-to-r ${isDark ? 'from-[#0B0C10]' : 'from-[#F9FAFB]'} to-transparent z-10 hidden lg:block`} />
         <div className={`absolute inset-y-0 right-0 w-[15%] bg-gradient-to-l ${isDark ? 'from-[#0B0C10]' : 'from-[#F9FAFB]'} to-transparent z-10 hidden lg:block`} />
         <div className={`absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t ${isDark ? 'from-[#0B0C10]/90 via-[#0B0C10]/45' : 'from-[#F9FAFB]/90 via-[#F9FAFB]/45'} to-transparent z-10`} />
         
         <img 
            src={displayImage} 
            alt="Profile" 
            loading="eager"
            className="h-full w-auto max-w-full object-contain object-bottom [filter:drop-shadow(0px_15px_20px_rgba(0,0,0,0.3))]" 
         />
      </div>

      {/* BASE: Cartões de Estatísticas - Renderização ultra leve e transparente */}
      <div className={`absolute bottom-2 lg:bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-5xl px-4 lg:px-0
        [!bg-transparent]
        [&_*]:!bg-transparent 
        [&_div]:!bg-transparent 
        /* REMOVIDO: backdrop-blur-none (evita disparar processos de checagem do webkit) */
        [&_div]:rounded-2xl
        [&_div]:lg:p-10 
        [&_div]:lg:scale-105
        ${TEXT_OVERRIDE_CLASSES}
        ${isDark ? '[&_div]:border-white/10' : '[&_div]:border-black/10'} 
        transition-transform duration-200`}
      >
         <RenderStats />
      </div>
    </div>
  );
};