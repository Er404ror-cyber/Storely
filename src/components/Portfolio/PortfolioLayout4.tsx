import { useMemo, type JSX, type FocusEvent, type KeyboardEvent } from 'react';
import { TITLE_SIZES, SUBTITLE_SIZES } from './PortfolioShared';
import type { LayoutProps } from '../../types/PortfolioTypes';

export function PortfolioLayout4({
  c,
  isEditor,
  isDark,
  fontSize = 'medium',
  displayImage,
  editableClass,
  handleTextEdit,
  handleKeyDown,
  RenderStats,
  RenderSocialsAndFlag,
  style
}: LayoutProps): JSX.Element {
  
  // Resolução correta do tema ativo (Dark vs Light)
  const currentTheme = style?.theme || (isDark ? 'dark' : 'light');
  const isThemeDark = currentTheme === 'dark';

  // Fallback seguro para o tamanho do texto
  const activeFontSize = (fontSize && TITLE_SIZES[fontSize]) ? fontSize : 'medium';

  const onBlurHandler = (field: keyof typeof c) => (e: FocusEvent<HTMLDivElement>) => {
    handleTextEdit(field as string)(e as unknown as React.FormEvent<HTMLDivElement>);
  };

  const onKeyDownHandler = (maxChars: number) => (e: KeyboardEvent<HTMLDivElement>) => {
    handleKeyDown(maxChars)(e);
  };

  // FIX: Previne auto-zoom no iOS/Android forçando um mínimo de 16px apenas no modo de edição no mobile.
  const mobileZoomFixClass = isEditor ? 'max-md:!text-[16px]' : '';

  // Cores dinâmicas injetadas com base no tema (Escuro no Light / Claro no Dark)
  const h1Class = useMemo(() => {
    const textThemeColor = isThemeDark ? 'text-white' : 'text-slate-900';
    return `${TITLE_SIZES[activeFontSize]} ${mobileZoomFixClass} font-black uppercase tracking-tighter ${textThemeColor} ${editableClass} transition-colors`;
  }, [activeFontSize, isThemeDark, editableClass, mobileZoomFixClass]);

  const pClass = useMemo(() => {
    const subThemeColor = isThemeDark ? 'text-slate-300' : 'text-slate-600';
    return `${SUBTITLE_SIZES[activeFontSize]} ${mobileZoomFixClass} font-semibold ${subThemeColor} mt-4 break-words ${editableClass} transition-colors`;
  }, [activeFontSize, isThemeDark, editableClass, mobileZoomFixClass]);

  return (
    <div 
      className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full max-w-[1400px] mx-auto pt-24 md:pt-28 px-4 sm:px-6 pb-12 items-center content-visibility-auto"
      style={{ 
        containIntrinsicSize: '600px',
        isolation: 'isolate'
      }}
    >
      
      {/* Bloco de Título e Perfil */}
      <div className="col-span-1 lg:col-span-4 flex flex-col justify-center z-40 order-2 lg:order-1 select-text">
        <div className="flex flex-col space-y-4 md:space-y-6 text-left drop-shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:drop-shadow-none">
          <div>
            <h1 
              className={h1Class}
              style={{
                display: 'block',
                overflow: 'visible',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                lineClamp: 'none',
                WebkitLineClamp: 'none',
                maxHeight: 'none',
                lineHeight: '1.05'
              }}
              contentEditable={isEditor} 
              suppressContentEditableWarning 
              onKeyDown={onKeyDownHandler(20)} 
              onBlur={onBlurHandler('alias')}
            >
              {c.alias || 'DEV'}
            </h1>
            
            <p 
              className={pClass}
              contentEditable={isEditor} 
              suppressContentEditableWarning 
              onKeyDown={onKeyDownHandler(35)} 
              onBlur={onBlurHandler('fullName')}
            >
              {c.fullName || 'Software Engineer'}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <RenderSocialsAndFlag />
          </div>
        </div>
      </div>

      {/* Caixa Hero da Imagem Destaque - Removido will-change e transform-gpu pesados */}
      <div className="col-span-1 lg:col-span-5 relative h-[45vh] sm:h-[50vh] lg:h-[60vh] min-h-[320px] max-h-[650px] w-full z-10 order-1 lg:order-2 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-200/50 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 group transition-transform duration-300 hover:scale-[1.01] aspect-[4/5] sm:aspect-[1/1] lg:aspect-auto">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent lg:hidden z-20 pointer-events-none" />
        
        <img 
          src={displayImage} 
          alt="Profile Showcase" 
          className="w-full h-full object-cover object-[50%_25%] transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          loading="eager"
          decoding="async"
        />
      </div>

      {/* Bloco Lateral de Métricas/Stats */}
      <div className="col-span-1 lg:col-span-3 flex flex-col justify-center z-30 order-3 lg:order-3 w-full">
         <div className="w-full bg-slate-50/60 dark:bg-slate-900/30  lg:bg-transparent lg:dark:bg-transparent p-5 lg:p-0 rounded-2xl border border-slate-100 dark:border-slate-800/40 lg:border-none transition-colors">
            <RenderStats isVertical={true} />
         </div>
      </div>

    </div>
  );
}