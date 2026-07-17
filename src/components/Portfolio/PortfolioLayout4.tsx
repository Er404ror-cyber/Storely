import { useMemo, type JSX, type FocusEvent, type KeyboardEvent } from 'react';
import { TITLE_SIZES, SUBTITLE_SIZES } from './PortfolioShared';
import type { LayoutProps } from '../../types/PortfolioTypes';

export function PortfolioLayout4({
  c,
  isEditor,
  fontSize,
  displayImage,
  editableClass,
  handleTextEdit,
  handleKeyDown,
  RenderStats,
  RenderSocialsAndFlag
}: LayoutProps): JSX.Element {
  
  // Altera para HTMLDivElement para casar com o que o pai espera
  const onBlurHandler = (field: keyof typeof c) => (e: FocusEvent<HTMLDivElement>) => {
    // Forçamos o cast apenas se necessário, mas aqui o tipo já deve ser compatível
    handleTextEdit(field as string)(e as unknown as React.FormEvent<HTMLDivElement>);
  };

  const onKeyDownHandler = (maxChars: number) => (e: KeyboardEvent<HTMLDivElement>) => {
    handleKeyDown(maxChars)(e);
  };

  // 💡 FORÇA DUAS LINHAS SEM CORTES: Removemos qualquer line-clamp ou truncate herdado
  const h1Class = useMemo(() => {
    return `${TITLE_SIZES[fontSize]} font-black uppercase tracking-tighter text-slate-900 dark:text-white ${editableClass}`;
  }, [fontSize, editableClass]);

  const pClass = useMemo(() => {
    return `${SUBTITLE_SIZES[fontSize]} font-semibold text-slate-600 dark:text-slate-300 mt-4 break-words ${editableClass}`;
  }, [fontSize, editableClass]);

  return (
    <div 
      className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full max-w-[1400px] mx-auto pt-24 md:pt-28 px-4 sm:px-6 pb-12 items-center"
      style={{ 
        contentVisibility: 'auto', 
        containIntrinsicSize: '600px',
        isolation: 'isolate'
      }}
    >
      
      {/* Bloco de Título e Perfil */}
      <div className="col-span-1 lg:col-span-4 flex flex-col justify-center z-40 order-2 lg:order-1 select-text">
        <div className="flex flex-col space-y-4 md:space-y-6 text-left drop-shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:drop-shadow-none">
          <div>
            {/* 💡 OVERRIDE ABSOLUTO NO STYLE: 
                - normal-case/break-words impede o estouro horizontal
                - lineClamp: 'none' e webkitLineClamp: 'none' destroem os três pontinhos (...)
                - maxLines: 'none' limpa restrições de leitura do Safari
            */}
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
              onKeyDown={onKeyDownHandler(60)} // Aumentei para 60 para poderes testar textos bem longos à vontade
              onBlur={onBlurHandler('alias')}
            >
              {c.alias || 'DEV'}
            </h1>
            
            <p 
              className={pClass}
              contentEditable={isEditor} 
              suppressContentEditableWarning 
              onKeyDown={onKeyDownHandler(40)} 
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

      {/* Caixa Hero da Imagem Destaque */}
      <div className="col-span-1 lg:col-span-5 relative h-[45vh] sm:h-[50vh] lg:h-[60vh] min-h-[320px] max-h-[650px] w-full z-10 order-1 lg:order-2 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-200/50 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 group transform-gpu transition-all duration-500 hover:scale-[1.01] will-change-[transform] aspect-[4/5] sm:aspect-[1/1] lg:aspect-auto">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent lg:hidden z-20 pointer-events-none" />
        
        <img 
          src={displayImage} 
          alt="Profile Showcase" 
          className="w-full h-full object-cover object-[50%_25%] transform-gpu transition-transform duration-700 ease-out group-hover:scale-103 will-change-[transform]"
          loading="eager"
          decoding="async"
        />
      </div>

      {/* Bloco Lateral de Métricas/Stats */}
      <div className="col-span-1 lg:col-span-3 flex flex-col justify-center z-30 order-3 lg:order-3 w-full">
         <div className="w-full bg-slate-50/60 dark:bg-slate-900/30 backdrop-blur-sm lg:bg-transparent lg:dark:bg-transparent p-5 lg:p-0 rounded-2xl border border-slate-100 dark:border-slate-800/40 lg:border-none">
            <RenderStats isVertical={true} />
         </div>
      </div>

    </div>
  );
}