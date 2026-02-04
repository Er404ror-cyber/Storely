import { RouterProvider } from "react-router-dom";
import { route } from "./routes";
import { Toaster } from "react-hot-toast";
import { LanguageProvider } from "./context/LanguageContext";
import { Helmet, HelmetProvider } from "react-helmet-async"; 
import { useTranslate } from "./context/LanguageContext";

// Componente interno para acessar o contexto de tradução
const AppContent = () => {
  const { lang, t } = useTranslate();

  return (
    <>
      <Helmet 
  titleTemplate="%s | Storely" 
  defaultTitle="Storely — Sem código / Sem limites"
>
  <html lang={lang} />
  
  
  <meta name="description" content={t('hero_desc')} />

  <meta property="og:site_name" content="Storely" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://storelyy.vercel.app/" />
  
  <link rel="alternate" href="https://storelyy.vercel.app/" hrefLang="pt" />
  <link rel="alternate" href="https://storelyy.vercel.app/" hrefLang="en" />
  <link rel="alternate" href="https://storelyy.vercel.app/" hrefLang="x-default" />

  <meta 
    name="theme-color" 
    content={document.documentElement.classList.contains('dark') ? "#09090b" : "#ffffff"} 
  />
</Helmet>

      <Toaster 
        position="bottom-right" 
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '600',
            padding: '12px 24px',
          },
        }} 
      />
      <RouterProvider router={route} />
    </>
  );
};

const App = () => {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </HelmetProvider>
  );
};

export default App;