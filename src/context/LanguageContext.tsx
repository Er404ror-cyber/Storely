import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { translations, type Language, type TranslationKeys } from './translations';

interface LanguageContextType {
  lang: Language;
  language: Language; // Alias para compatibilidade
  setLang: (lang: Language) => void;
  t: (key: TranslationKeys, variables?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>(() => {
    // 1. Tenta recuperar do LocalStorage (Preferência salva)
    const saved = localStorage.getItem('lang') as Language;
    if (saved === 'en' || saved === 'pt') return saved;

    // 2. Se não houver salvo, tenta a língua do Browser
    const browserLang = window.navigator.language.split('-')[0].toLowerCase();
    if (browserLang === 'pt') return 'pt';
    if (browserLang === 'en') return 'en';

    // 3. Fallback final: Inglês
    return 'en';
  });

  // Sempre que o idioma mudar, salva no localStorage e atualiza o atributo HTML
  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  /**
   * Função de tradução com suporte a variáveis
   * Exemplo de uso: t("showcase_price_up_to", { price: 500 })
   */
  const t = (key: TranslationKeys, variables?: Record<string, string | number>): string => {
    const currentDict = translations[lang] as Record<string, string>;
    let text = currentDict[key] || key;

    // Se houver variáveis (ex: {{price}}), substitui no texto
    if (variables) {
      Object.entries(variables).forEach(([varKey, varValue]) => {
        text = text.replace(`{{${varKey}}}`, String(varValue));
      });
    }

    return text;
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