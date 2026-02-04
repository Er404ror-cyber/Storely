// src/context/LanguageContext.tsx

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { translations, type Language, type TranslationKeys } from './translations';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>(() => {
    // 1. Prioridade: Preferência salva manualmente no localStorage
    const saved = localStorage.getItem('lang') as Language;
    if (saved === 'en' || saved === 'pt') return saved;

    const nav = window.navigator as Navigator & { userLanguage?: string };
    const browserLangFull = nav.language || nav.userLanguage || 'en';
    const baseLang = browserLangFull.split('-')[0].toLowerCase();

    // 3. Validação de Variantes: Identifica qualquer PT ou qualquer EN
    if (baseLang === 'pt') return 'pt';
    if (baseLang === 'en') return 'en';

    // 4. Fallback: Se for qualquer outra língua (es, fr, ru...), o padrão é Inglês
    return 'en';
  });

  useEffect(() => {
    // Salva a escolha e atualiza a tag <html lang="...">
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: TranslationKeys): string => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslate = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useTranslate must be used within LanguageProvider');
  return context;
};