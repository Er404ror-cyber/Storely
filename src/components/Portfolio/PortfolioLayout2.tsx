import React, { useMemo } from 'react';
import { TITLE_SIZES, SUBTITLE_SIZES } from './PortfolioShared';
import type { LayoutProps } from '../../types/PortfolioTypes';

// Constantes estáticas limpas para evitar alocação de memória a cada ciclo de render
const INNER_STATS_THEME_DARK = [
  '[&_div]:border-white/10',
  '[&_span]:text-white',
  '[&_p]:text-gray-300',
  'lg:[&>div]:flex-col',
  'lg:[&>div]:gap-4'
].join(' ');

const INNER_STATS_THEME_LIGHT = [
  '[&_div]:border-black/10',
  '[&_span]:text-gray-900',
  '[&_p]:text-gray-600',
  'lg:[&>div]:flex-col',
  'lg:[&>div]:gap-4'
].join(' ');

export const PortfolioLayout2: React.FC<LayoutProps> = ({
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
  // Memorização estrita dos handlers do editor para evitar processamento inútil de CPU na digitação
  const onKeyDownAlias = useMemo(() => handleKeyDown(20), [handleKeyDown]);
  const onBlurAlias = useMemo(() => handleTextEdit('alias'), [handleTextEdit]);
  const onKeyDownFullName = useMemo(() => handleKeyDown(35), [handleKeyDown]);
  const onBlurFullName = useMemo(() => handleTextEdit('fullName'), [handleTextEdit]);

  // FIX: Previne auto-zoom no iOS/Android forçando um mínimo de 16px apenas no modo de edição no mobile.
  const mobileZoomFixClass = isEditor ? 'max-md:!text-[16px]' : '';

  return (
    // Removido "will-change-transform" (sugava memória VRAM e bateria desnecessariamente)
    <div className="relative z-10 flex flex-col lg:flex-row h-full min-h-[75vh] lg:min-h-[700px] w-full overflow-hidden content-visibility-auto">
      
      {/* LADO DIREITO / TOPO (Imagem) - Renderização plana e leve para navegadores mobile */}
      <div className="absolute inset-x-0 top-0 h-[58vh] lg:h-full lg:w-[60%] lg:left-auto lg:right-0 z-0 pointer-events-none overflow-hidden">
        
        {/* PC: Gradiente de fusão lateral */}
        <div className={`absolute inset-y-0 left-0 w-[40%] bg-gradient-to-r ${isDark ? 'from-[#0B0C10] via-[#0B0C10]/60' : 'from-[#F9FAFB] via-[#F9FAFB]/60'} to-transparent hidden lg:block z-10`} />
        
        {/* CELULAR: Gradiente de fusão inferior plano */}
        <div className={`absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t ${isDark ? 'from-[#0B0C10] via-[#0B0C10]/70' : 'from-[#F9FAFB] via-[#F9FAFB]/70'} to-transparent lg:hidden z-10`} />
        
        <img 
          src={displayImage} 
          alt="Profile" 
          loading="eager"
          className="w-full h-full object-cover object-center lg:object-top" 
        />

        {/* TEXTO NA PARTE INFERIOR DA FOTO NO CELULAR - Removido sombras pesadas de texto para rodar liso */}
        <div className="absolute lg:hidden bottom-[4vh] inset-x-0 z-30 px-6 flex flex-col items-center text-center pointer-events-auto">
          <h1 
            className={`${TITLE_SIZES[fontSize || 'base']} ${mobileZoomFixClass} leading-[1] font-black uppercase tracking-wider ${editableClass} ${isDark ? 'text-white' : 'text-gray-900'} transition-colors`} 
            contentEditable={isEditor} 
            suppressContentEditableWarning 
            onKeyDown={onKeyDownAlias} 
            onBlur={onBlurAlias} 
            style={{ fontFamily: '"Impact", sans-serif' }}
          >
            {c.alias || 'DEV'}
          </h1>
          <p 
            className={`${SUBTITLE_SIZES[fontSize || 'base']} ${mobileZoomFixClass} font-light mt-2 mb-4 ${editableClass} ${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors`} 
            contentEditable={isEditor} 
            suppressContentEditableWarning 
            onKeyDown={onKeyDownFullName} 
            onBlur={onBlurFullName}
          >
            {c.fullName || 'Software Engineer'}
          </p>
          <div className="flex justify-center w-full">
            <RenderSocialsAndFlag />
          </div>
        </div>
      </div>

      {/* LADO ESQUERDO / BASE */}
      <div className="relative z-20 flex flex-col w-full lg:w-[40%] h-full mt-auto lg:mt-0 pt-[58vh] lg:pt-24 px-4 sm:px-6 md:px-12 lg:pl-16 pb-8 mr-auto max-w-[1600px]">
        
        {/* Bloco de Título e Nome para Desktop */}
        <div className="hidden lg:flex w-[150%] xl:w-[170%] z-35 relative pointer-events-auto flex-col items-start select-text">
          <h1 
            className={`${TITLE_SIZES[fontSize || 'base']} ${mobileZoomFixClass} leading-[0.95] font-black uppercase tracking-wider ${editableClass} ${isDark ? 'text-white' : 'text-gray-900'} whitespace-nowrap md:whitespace-normal transition-colors`} 
            contentEditable={isEditor} 
            suppressContentEditableWarning 
            onKeyDown={onKeyDownAlias} 
            onBlur={onBlurAlias} 
            style={{ fontFamily: '"Impact", sans-serif' }}
          >
            {c.alias || 'DEV'}
          </h1>
          
          <p 
            className={`${SUBTITLE_SIZES[fontSize || 'base']} ${mobileZoomFixClass} font-light mt-2 mb-4 ${editableClass} ${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors`} 
            contentEditable={isEditor} 
            suppressContentEditableWarning 
            onKeyDown={onKeyDownFullName} 
            onBlur={onBlurFullName}
          >
            {c.fullName || 'Software Engineer'}
          </p>
          
          <div className="flex w-full items-center justify-start">
            <RenderSocialsAndFlag />
          </div>
        </div>
        
        {/* SEÇÃO DE PROJETOS / ESTATÍSTICAS - Sem processos em lote redundantes */}
        <div className={`mt-6 lg:mt-8 w-full lg:w-[100%] z-35 px-0 text-left pointer-events-auto
          [!bg-transparent]
          [&_*]:!bg-transparent 
          [&_div]:!bg-transparent
          [&_div]:rounded-2xl
          ${isDark ? INNER_STATS_THEME_DARK : INNER_STATS_THEME_LIGHT}`}
        >
          <RenderStats isVertical={true} />
        </div>

      </div>
    </div>
  );
};