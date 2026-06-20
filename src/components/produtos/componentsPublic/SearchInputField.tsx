import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputFieldProps {
  searchTerm: string;
  isDark: boolean;
  placeholder: string;
  onChangeTerm: (value: string) => void;
  onClear: () => void;
}

export const SearchInputField = React.memo(function SearchInputField({
  searchTerm,
  isDark,
  placeholder,
  onChangeTerm,
  onClear
}: SearchInputFieldProps) {
  return (
    <div className={`shrink-0 p-4 pb-safe border-t ${
      isDark ? "bg-zinc-950 border-zinc-900" : "bg-white border-slate-100"
    }`}>
      <div className={`mx-auto flex max-w-2xl items-center gap-2 rounded-full p-1.5 pr-4 shadow-xl border transition-all transform-gpu ${
        isDark ? "bg-zinc-900 border-zinc-800 focus-within:border-zinc-700" : "bg-slate-100 border-slate-200 focus-within:border-slate-300"
      }`}>
        <div className={`flex h-8 w-10 shrink-0 items-center justify-center rounded-full select-none pointer-events-none ${
          isDark ? "bg-zinc-800 text-zinc-400" : "bg-slate-200 text-slate-500"
          }`}>
          <Search size={15} />
        </div>
        <input
          autoFocus
          type="text"
          value={searchTerm}
          onChange={(e) => onChangeTerm(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-transparent text-sm font-semibold outline-none py-1.5 ${
            isDark ? "text-zinc-100 placeholder-zinc-500" : "text-slate-800 placeholder-slate-400"
          }`}
        />
        {searchTerm && (
          <button 
            onClick={onClear} 
            className={`shrink-0 p-1 rounded-full transition-transform transform-gpu cursor-pointer ${
              isDark ? "text-zinc-500 hover:text-zinc-300" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <X size={15} />
          </button>
        )}
      </div>
    </div>
  );
});