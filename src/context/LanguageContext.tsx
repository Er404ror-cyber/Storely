// src/context/LanguageContext.tsx

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { translations, type Language, type TranslationKeys } from './translations';

interface LanguageContextType {
  lang: Language; // Mantido para compatibilidade
  language: Language; // Adicionado para resolver o erro no ProductsList
  setLang: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('lang') as Language;
    if (saved === 'en' || saved === 'pt') return saved;

    const nav = window.navigator as Navigator & { userLanguage?: string };
    const browserLangFull = nav.language || nav.userLanguage || 'en';
    const baseLang = browserLangFull.split('-')[0].toLowerCase();

    if (baseLang === 'pt') return 'pt';
    if (baseLang === 'en') return 'en';

    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: TranslationKeys): string => {
    return translations[lang][key] || key;
  };

  return (
    // Passamos lang para ambos os nomes para satisfazer o TypeScript
    <LanguageContext.Provider value={{ lang, language: lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslate = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useTranslate must be used within LanguageProvider');
  return context;
};