import { RouterProvider } from "react-router-dom";
import { route } from "./routes";
import { Toaster } from "react-hot-toast";
import { LanguageProvider, useTranslate } from "./context/LanguageContext";
import { Helmet } from "react-helmet-async"; 
import VersionChecker from "./utils/VersionChecker";
import NetworkStatus from "./utils/NetworkStatus";

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
          content={typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? "#09090b" : "#ffffff"} 
        />
      </Helmet>

      <Toaster 
        position="bottom-right" 
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '600',
            padding: '12px 24px',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#6366f1',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }} 
      />

      {/* Monitor de Rede Não-Intrusivo */}
      <NetworkStatus />
      
      <RouterProvider router={route} />
    </>
  );
};

const App = () => {
  return (
    <LanguageProvider>
      <VersionChecker />
      <AppContent />
    </LanguageProvider>
  );
};

export default App;