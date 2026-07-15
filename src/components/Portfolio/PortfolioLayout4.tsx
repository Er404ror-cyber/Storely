import React from 'react';
import { LayoutProps } from './PortfolioTypes';
import { TITLE_SIZES, SUBTITLE_SIZES } from './PortfolioShared';

export const PortfolioLayout4: React.FC<LayoutProps> = ({
  c, isEditor, isDark, fontSize, displayImage, editableClass, handleTextEdit, handleKeyDown, RenderStats, RenderSocialsAndFlag
}) => {
  return (
    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[60vh] md:min-h-[650px] w-full max-w-[1400px] mx-auto pt-28 px-6 pb-12 items-stretch">
      
      {/* Título: Avança sobre a imagem (lg:-mr-12), sem a div de fundo, usando drop-shadow natural */}
      <div className="lg:col-span-4 flex flex-col justify-end z-40 order-2 lg:order-1 relative lg:-mr-12">
        <div className="mt-auto drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]">
          <h1 className={`${TITLE_SIZES[fontSize]} leading-[0.9] font-black uppercase tracking-wider ${editableClass} text-white`} contentEditable={isEditor} suppressContentEditableWarning onKeyDown={handleKeyDown(20)} onBlur={handleTextEdit('alias')} style={{ fontFamily: '"Impact", sans-serif' }}>
            {c.alias || 'DEV'}
          </h1>
          <p className={`${SUBTITLE_SIZES[fontSize]} font-medium text-gray-200 mt-2 ${editableClass}`} contentEditable={isEditor} suppressContentEditableWarning onKeyDown={handleKeyDown(40)} onBlur={handleTextEdit('fullName')}>
            {c.fullName || 'Software Engineer'}
          </p>
          <RenderSocialsAndFlag />
        </div>
      </div>

      {/* Imagem: Muito mais nítida, preservando o formato na sua caixa */}
      <div className="lg:col-span-5 relative h-[40vh] lg:h-auto min-h-[350px] lg:my-4 w-full z-10 order-1 lg:order-2 rounded-3xl overflow-hidden shadow-xl border border-black/10 bg-black/5">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent lg:hidden z-20 pointer-events-none" />
        <img src={displayImage} alt="Profile" className="w-full h-full object-cover object-center" />
      </div>

      <div className="lg:col-span-3 flex flex-col justify-end z-30 order-3 lg:order-3">
         <div className="mt-2 lg:mt-auto">
            <RenderStats isVertical={true} />
         </div>
      </div>
    </div>
  );
};