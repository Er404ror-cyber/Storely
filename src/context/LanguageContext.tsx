// src/context/LanguageContext.tsx

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
// Importamos o objeto de traduções e os tipos
import { translations, type Language, type TranslationKeys } from './translations';

interface LanguageContextType {
  lang: Language;
  language: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Inicialização mantendo sua preferência de país salva no localStorage
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('lang') as Language;
    if (saved === 'en' || saved === 'pt') return saved;

    const nav = window.navigator as any;
    const browserLangFull = nav.language || nav.userLanguage || 'en';
    const baseLang = browserLangFull.split('-')[0].toLowerCase();

    return (baseLang === 'pt') ? 'pt' : 'en';
  });

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  /**
   * SOLUÇÃO DO ERRO:
   * Forçamos o TypeScript a entender que translations[lang] 
   * é um dicionário que aceita qualquer uma das TranslationKeys.
   */
  const t = (key: TranslationKeys): string => {
    // 1. Pegamos o objeto do idioma atual
    const currentDict = translations[lang] as Record<string, string>;
    
    // 2. Acessamos a chave. Se não existir, retornamos a própria chave para evitar 'undefined'
    return currentDict[key] || key;
  };

  return (
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