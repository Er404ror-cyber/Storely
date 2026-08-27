import React, { memo } from 'react';
import { 
  Sparkles, 
  Layers, 
  Home, 
  ExternalLink, 
  AlertCircle, 
  Plus, 
  ArrowUpRight, 
  Search 
} from 'lucide-react';
import { useTranslate } from '../../context/LanguageContext';
import { MAX_PAGES } from '../../utils/maxSections';

interface PagesHeroProps {
  originalTotal: number;
  isLimitReached: boolean;
  homePageSlug?: string | null;
  homePreviewUrl: string | null;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onOpenModal: () => void;
}

export const PagesHero = memo(function PagesHero({
  originalTotal,
  isLimitReached,
  homePageSlug,
  homePreviewUrl,
  searchQuery,
  onSearchChange,
  onOpenModal,
}: PagesHeroProps) {
  const { t } = useTranslate();

  const handlePreviewClick = () => {
    if (homePreviewUrl && typeof window !== 'undefined') {
      window.open(homePreviewUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <section 
      className="w-full rounded-b-[2rem] sm:rounded-[2.2rem] min-h-[270px] sm:min-h-[250px] p-5 sm:p-7 border- shadow-2xl relative overflow-hidden bg-[#0F0D16] flex flex-col justify-between"
      style={{ contain: 'paint' }}
    >
      {/* IFRAME COM ISOLAMENTO DE HARDWARE */}
      {homePreviewUrl && (
        <div 
          className="absolute inset-0 w-full sm:left-auto sm:right-0 sm:w-[54%] h-full pointer-events-none select-none z-0 overflow-hidden bg-[#0A0812]"
          style={{ contain: 'strict', transform: 'translateZ(0)' }}
        >
          <iframe
            key={homePreviewUrl}
            src={homePreviewUrl}
            title="Home Preview"
            loading="lazy"
            tabIndex={-1}
            aria-hidden="true"
            sandbox="allow-same-origin allow-scripts"
            className="w-[200%] h-[200%] border-0 origin-top-left pointer-events-none transform scale-50 opacity-75 sm:opacity-95 filter contrast-[1.04]"
          />
          
          <div className="hidden sm:block absolute inset-y-0 left-0 w-44 bg-gradient-to-r from-[#0F0D16] via-[#0F0D16]/75 to-transparent pointer-events-none" />
          <div className="sm:hidden absolute inset-0 bg-gradient-to-t from-[#0F0D16] via-[#0F0D16]/80 to-transparent pointer-events-none" />
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL */}
      <div className="relative z-10 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          
          {/* IDENTIDADE E STATUS */}
          <div className="min-w-0 max-w-full sm:max-w-[48%] space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8862DF]/20 text-[#D4C3FB] text-[10px] font-black uppercase tracking-wider shadow-xs border border-[#8862DF]/30">
              <Sparkles size={11} fill="currentColor" className="shrink-0 text-[#C4AFFB]" />
              <span className="truncate">{t('pages_builder_badge') || 'Gestor de Páginas'}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#D4C3FB] shadow-xs shrink-0 border border-white/15">
                <Layers size={17} />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white truncate tracking-tight drop-shadow-sm">
                {t('pages_title') || 'Páginas'}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className="inline-flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-xl text-[11px] font-bold text-white shadow-xs border border-white/15 shrink-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${isLimitReached ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                <span>{originalTotal} / {MAX_PAGES} {t('pages_count') || 'Páginas'}</span>
              </span>

              {homePageSlug && (
                <button
                  type="button"
                  onClick={handlePreviewClick}
                  className="inline-flex items-center gap-1.5 bg-black/60 hover:bg-black/80 text-[#D4C3FB] px-2.5 py-1 rounded-xl text-[11px] font-bold shadow-xs border border-white/15 transition-colors max-w-full truncate cursor-pointer"
                  title="Ver Página Inicial"
                >
                  <Home size={11} className="shrink-0" />
                  <span className="truncate max-w-[130px] sm:max-w-none">/{homePageSlug}</span>
                  <ExternalLink size={10} className="shrink-0" />
                </button>
              )}
            </div>
          </div>

          {/* BOTÃO CRIAR PÁGINA */}
          <div className="w-full sm:w-auto shrink-0">
            <button 
              type="button"
              disabled={isLimitReached}
              onClick={onOpenModal} 
              className={`w-full sm:w-auto group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl sm:rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 select-none ${
                isLimitReached 
                  ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5' 
                  : 'bg-[#8862DF] hover:bg-[#7850D6] text-white shadow-lg shadow-[#8862DF]/30 hover:shadow-[#8862DF]/45 border border-white/25 cursor-pointer'
              }`}
            >
              {isLimitReached ? (
                <AlertCircle size={15} className="shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center transition-transform group-hover:rotate-90 shrink-0">
                  <Plus size={11} strokeWidth={3} />
                </div>
              )}
              
              <span className="font-black truncate">
                {isLimitReached ? `${originalTotal}/${MAX_PAGES}` : (t('new_page') || 'Criar Página')}
              </span>

              {!isLimitReached && (
                <ArrowUpRight size={13} className="hidden sm:inline opacity-80 group-hover:opacity-100 transition-opacity shrink-0" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CAMPO DE BUSCA */}
      {originalTotal > 0 && (
        <div className="relative z-10 mt-5 w-full max-w-full sm:max-w-xs">
          <div className="relative w-full flex items-center">
            <Search className="absolute left-3.5 text-[#C4AFFB] pointer-events-none shrink-0" size={16} />
            <input 
              type="search"
              autoComplete="off"
              className="w-full pl-10 pr-3 py-2.5 sm:py-2 bg-[#1C1827]/90 focus:bg-[#252033] border border-white/20 focus:border-[#8862DF] rounded-xl shadow-md focus:ring-2 focus:ring-[#8862DF]/50 outline-none transition-all font-semibold text-base sm:text-xs text-white placeholder:text-white/60" 
              placeholder={t('search_pages_placeholder') || 'Pesquisar páginas...'} 
              value={searchQuery} 
              onChange={handleInputChange} 
            />
          </div>
        </div>
      )}
    </section>
  );
});

PagesHero.displayName = 'PagesHero';