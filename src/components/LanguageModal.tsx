import { X, Globe, Check } from 'lucide-react';
import { useTranslate } from '../context/LanguageContext';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LanguageModal({ isOpen, onClose }: LanguageModalProps) {
  const { lang, setLang } = useTranslate();

  const languages = [
    { code: 'pt', name: 'Português', flag: 'PT' },
    { code: 'en', name: 'English', flag: 'US' },
  ] as const;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-4 transform-gpu">
      {/* Backdrop Otimizado */}
      <div 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600">
                <Globe size={20} />
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
                Select Language
              </h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <div className="space-y-3">
            {languages.map((l) => {
              const isActive = lang === l.code;
              return (
                <button
                  key={l.code}
                  onClick={() => {
                    setLang(l.code);
                    setTimeout(onClose, 200); // Fecha após seleção
                  }}
                  className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 transform-gpu active:scale-[0.98] ${
                    isActive 
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/5' 
                      : 'border-slate-100 dark:border-slate-800/50 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-black opacity-40">{l.flag}</span>
                    <span className={`font-bold ${isActive ? 'text-indigo-600' : 'text-slate-600 dark:text-slate-400'}`}>
                      {l.name}
                    </span>
                  </div>
                  {isActive && <Check size={18} className="text-indigo-600" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}