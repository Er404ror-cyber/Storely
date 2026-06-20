import React from 'react';
import { Search, X, Zap } from 'lucide-react';

interface SearchInputFieldProps {
  searchTerm: string;
  isDark: boolean;
  placeholder: string;
  suggestions: string[];
  onChangeTerm: (value: string) => void;
  onSelectSuggestion: (value: string) => void;
  onClear: () => void;
  t: any; // Prop de tradução adicionada aqui
}

export const SearchInputField = React.memo(function SearchInputField({
  searchTerm,
  isDark,
  placeholder,
  suggestions,
  onChangeTerm,
  onSelectSuggestion,
  onClear,
  t // Extraído das props
}: SearchInputFieldProps) {
  return (
    // RESOLVIDO: O container agora é bg-transparent/vidro real, deixando ver tudo o que rola por trás
    <div className={`shrink-0 flex flex-col justify-center pb-safe border-t bg-transparent ${
      isDark ? " border-white/5" : " border-black/5"
    }`}>
      
      {/* Sugestões de Auto-complete */}
      {suggestions.length > 0 && (
        <div className={`flex w-full gap-2 overflow-x-auto px-4 py-2 no-scrollbar overscroll-contain border-b ${
          isDark ? "border-white/5" : "border-black/5"
        }`}>
          <div className="flex items-center gap-1.5 text-[8px] md:text-[10px] font-black text-amber-500/90 pr-1 uppercase tracking-widest shrink-0">
            {/* Texto traduzido usando a função t */}
            <Zap size={10} className="fill-amber-500/20" /> {t('search_suggestions')}
          </div>
          {suggestions.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => onSelectSuggestion(sug)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[10px] md:text-[12px] font-semibold transition-all active:scale-95 border cursor-pointer ${
                isDark 
                  ? "bg-white/10 border-white/10 text-white hover:bg-white/20" 
                  : "bg-black/40 border-black/10 text-white hover:bg-black/60"
              }`}
            >
              {sug}
            </button>
          ))}
        </div>
      )}

      {/* Caixa de Input (Vidro Puro Intercalado) */}
      <div className={`px-2 ${suggestions.length > 0 ? 'pb-2 pt-2' : 'py-1 lg:py-3'}`}>
        <div className={`mx-auto flex max-w-2xl items-center gap-2 rounded-full p-1 pr-4 border transition-all duration-200 ${
          // Dark: Vidro Esbranquiçado Leve | Light: Vidro Fumado Vazado
          isDark 
            ? "bg-white/15 border-white/15 focus-within:bg-white/20 focus-within:border-white/20" 
            : "bg-black/50 border-black/10 focus-within:bg-black/60 focus-within:border-black/20"
        }`}>
          <div className={`flex h-10 w-12 shrink-0 items-center justify-center rounded-full select-none pointer-events-none ${
            isDark ? "text-white/70" : "text-zinc-300"
          }`}>
            <Search size={18} strokeWidth={2.5} />
          </div>
          <input
            autoFocus
            type="text"
            value={searchTerm}
            onChange={(e) => onChangeTerm(e.target.value)}
            // O placeholder continuará vindo das props, então você pode passar a tradução lá no componente pai: placeholder={t('placeholder_key')}
            placeholder={placeholder}
            className={`w-full bg-transparent text-base md:text-sm font-semibold outline-none py-2 ${
              isDark ? "text-white placeholder-white/50" : "text-zinc-100 placeholder-zinc-300"
            }`}
          />
          {searchTerm && (
            <button 
              onClick={onClear} 
              className={`shrink-0 p-1.5 rounded-full transition-colors cursor-pointer ${
                isDark 
                  ? "text-white/60 hover:text-white bg-white/10 hover:bg-white/20" 
                  : "text-zinc-300 hover:text-white bg-white/5 hover:bg-white/15"
              }`}
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});