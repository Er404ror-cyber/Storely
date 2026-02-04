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
          duration: 4000, // O toast some sozinho após 4 segundos
          style: {
            background: '#1e293b', // Fundo escuro elegante (Slate-800)
            color: '#fff',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '600',
            padding: '12px 24px',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#6366f1', // Ícone Indigo
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444', // Ícone Vermelho para erros (ex: nome duplicado)
              secondary: '#fff',
            },
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