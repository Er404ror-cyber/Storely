import React, { useMemo } from 'react';
import { TITLE_SIZES, SUBTITLE_SIZES } from './PortfolioShared';
import type { LayoutProps } from '../../types/PortfolioTypes';

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
  const onKeyDownAlias = useMemo(() => handleKeyDown(20), [handleKeyDown]);
  const onBlurAlias = useMemo(() => handleTextEdit('alias'), [handleTextEdit]);
  const onKeyDownFullName = useMemo(() => handleKeyDown(35), [handleKeyDown]);
  const onBlurFullName = useMemo(() => handleTextEdit('fullName'), [handleTextEdit]);

  const themeTextClass = isDark 
    ? '!text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.8)]' 
    : '!text-gray-900 [text-shadow:0_2px_8px_rgba(255,255,255,0.9)]';

  const themeSubtitleClass = isDark
    ? '!text-gray-200 [text-shadow:0_2px_6px_rgba(0,0,0,0.7)]'
    : '!text-gray-700 [text-shadow:0_2px_6px_rgba(255,255,255,0.8)]';

  const statsOverrideClasses = useMemo(() => {
    return [
      isDark ? '[&_span]:!text-white [&_span]:[text-shadow:0_1px_4px_rgba(0,0,0,0.6)]' : '[&_span]:!text-gray-900 [&_span]:[text-shadow:0_1px_4px_rgba(255,255,255,0.7)]',
      isDark ? '[&_p]:!text-white [&_p]:[text-shadow:0_1px_4px_rgba(0,0,0,0.6)]' : '[&_p]:!text-gray-900 [&_p]:[text-shadow:0_1px_4px_rgba(255,255,255,0.7)]',
      isDark ? '[&_h1]:!text-white' : '[&_h1]:!text-gray-900',
      isDark ? '[&_h2]:!text-white' : '[&_h2]:!text-gray-900',
      isDark ? '[&_h3]:!text-white' : '[&_h3]:[text-shadow:0_1px_4px_rgba(255,255,255,0.7)]',
      isDark ? '[&_h4]:!text-white' : '[&_h4]:!text-gray-900',
      isDark ? '[&_b]:!text-white' : '[&_b]:!text-gray-900',
      isDark ? '[&_strong]:!text-white' : '[&_strong]:!text-gray-900',
      '[&_*]:!bg-transparent [&_div]:!bg-transparent',
      isDark ? '[&_div]:border-white/10' : '[&_div]:border-black/10'
    ].join(' ');
  }, [isDark]);

  const mobileZoomFixClass = isEditor ? 'max-md:!text-[16px]' : '';

  return (
    // Isolamento apenas na raiz principal. Removido transform-gpu desnecessário.
    <div className="relative z-10 flex flex-col justify-between w-full max-w-7xl mx-auto px-0 lg:px-8 pb-0 pt-12 max-md:pt-6 max-md:pb-6 md:pt-0 min-h-[500px] lg:min-h-[650px] flex-grow overflow-hidden content-visibility-auto selection:bg-white/35">
      
      {/* TEXTO SUPERIOR (Mobile) / ABSOLUTO ESQUERDA (Desktop) */}
      {/* Removido: transform-gpu [backface-visibility:hidden] (Textos estáticos não precisam de aceleração 3D) */}
      <div className="max-md:relative md:absolute md:left-8 md:top-[40%] md:-translate-y-1/2 z-30 flex flex-col items-center md:items-start text-center md:text-left w-full md:w-[540px] px-6 md:px-0 mb-4 md:mb-0 pointer-events-auto">
        
        <div className={`absolute inset-x-0 -top-6 h-32 bg-gradient-to-b ${isDark ? 'from-black/20' : 'from-white/30'} to-transparent pointer-events-none -z-10 md:hidden`} />
        
        {/* Substituído transition-all por transition-colors (evita reflow de CPU) */}
        <h1 
          className={`${TITLE_SIZES[fontSize || 'base']} ${themeTextClass} ${mobileZoomFixClass} leading-[0.9] font-black uppercase tracking-wider ${editableClass} rounded-r-lg [contain:layout_spacing_size] transition-colors`} 
          contentEditable={isEditor} 
          suppressContentEditableWarning 
          onKeyDown={onKeyDownAlias} 
          onBlur={onBlurAlias} 
          style={{ fontFamily: '"Impact", sans-serif' }}
        >
          {c.alias || 'MAENG'}
        </h1>
        
        {/* Substituído transition-all por transition-colors */}
        <p 
          className={`${SUBTITLE_SIZES[fontSize || 'base']} ${themeSubtitleClass} ${mobileZoomFixClass} font-light mt-2 lg:mt-3 ${editableClass} rounded-lg [contain:layout_spacing_size] transition-colors`} 
          contentEditable={isEditor} 
          suppressContentEditableWarning 
          onKeyDown={onKeyDownFullName} 
          onBlur={onBlurFullName}
        >
          {c.fullName || 'Marsha lenathea Lapian'}
        </p>
        
        <div className="md:hidden w-full flex justify-center mt-4 scale-95 origin-center">
          <RenderSocialsAndFlag />
        </div>
      </div>

      {/* SOCIALS NA LATERAL DIREITA (Desktop) */}
      {/* Removido overhead de GPU */}
      <div className="hidden md:flex absolute right-8 top-[40%] -translate-y-1/2 z-40 flex-col items-center [&>div]:!flex-col [&>div]:!gap-6 [&>div]:!mt-0 [&>div]:items-center">
        <RenderSocialsAndFlag />
      </div>
      
      {/* IMAGEM CENTRAL */}
      <div className="relative z-10 w-full flex-1 min-h-[400px] max-md:min-h-[260px] max-md:max-h-[35vh] lg:min-h-[600px] max-h-[700px] pointer-events-none flex justify-center overflow-hidden max-md:my-4">
         <div className={`absolute inset-y-0 left-0 w-[15%] bg-gradient-to-r ${isDark ? 'from-[#0B0C10]' : 'from-[#F9FAFB]'} to-transparent z-10 hidden lg:block`} />
         <div className={`absolute inset-y-0 right-0 w-[15%] bg-gradient-to-l ${isDark ? 'from-[#0B0C10]' : 'from-[#F9FAFB]'} to-transparent z-10 hidden lg:block`} />
         
         <div className={`absolute inset-x-0 bottom-0 h-[45%] max-md:h-[40%] bg-gradient-to-t ${isDark ? 'from-[#0B0C10]/90 via-[#0B0C10]/45' : 'from-[#F9FAFB]/90 via-[#F9FAFB]/45'} max-md:${isDark ? 'from-[#0B0C10] via-[#0B0C10]/60' : 'from-[#F9FAFB] via-[#F9FAFB]/60'} to-transparent z-10`} />
         
         {/* Substituído o filtro pesado por drop-shadow-2xl nativo do Tailwind (visual idêntico, performance vastly superior) */}
         <img 
            src={displayImage} 
            alt="Profile" 
            loading="eager"
            className="h-full w-auto max-w-full max-md:max-w-[85%] object-contain object-bottom drop-shadow-2xl rounded-2xl md:rounded-none" 
         />
      </div>

      {/* BASE: Cartões de Estatísticas */}
      <div className={`max-md:relative md:absolute bottom-2 lg:bottom-6 max-md:left-0 md:left-1/2 max-md:translate-x-0 md:-translate-x-1/2 z-30 w-full lg:max-w-5xl px-4 lg:px-0 max-md:mt-2
        [&_div]:rounded-2xl
        [&_div]:lg:p-10 
        [&_div]:lg:hover:border-white/25
        [&_div]:transition-colors
        [&_div]:duration-150
        [&>div]:max-md:!flex [&>div]:max-md:!flex-wrap [&>div]:max-md:!justify-center [&>div]:max-md:!gap-3
        ${statsOverrideClasses}`}
      >
         <RenderStats />
      </div>
    </div>
  );
};