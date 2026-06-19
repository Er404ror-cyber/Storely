import { Outlet, useParams, useNavigate, useLocation } from "react-router-dom";
import { useId } from "react";
import { StoreHeader } from "../components/header";
import { StorePageLinksSection } from "../components/public/StorePageLinks";
import { PublicBackgroundAudio } from "../components/public/audio/PublicBackgroundAudio";
import { useStorePublic } from "../hooks/useStorePublic";
import { StoreFooter } from "../components/public/footer/StoreFooter";
import { useTranslate } from '../context/LanguageContext';

export function PublicLayout() {
  const { storeSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const layoutKey = useId();
  const { data: store, isLoading, isError, isFetching, source, forceRefresh } = useStorePublic(storeSlug);
  
  // Integração do sistema de tradução nativo da aplicação
  const { lang } = useTranslate();
  const isPt = lang.startsWith("pt");

  // 1. Tela de Loading Inicial - Ultra Fluida, Minimalista e Económica em Bateria
  if (isLoading && !store) {
    return (
      <div className="h-screen w-full bg-white dark:bg-black flex flex-col items-center justify-center gap-3 antialiased">
        <div className="h-6 w-6 border-2 border-slate-200 dark:border-slate-800 border-t-slate-900 dark:border-t-white rounded-full animate-spin" />
        <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.3em] text-[9px]">
          {isPt ? "Carregando..." : "Loading..."}
        </span>
      </div>
    );
  }

  // 2. Tela de Erro (404) Altamente Otimizada e Intuitiva
  if (isError || !store) {
    return (
      <div className="h-screen w-full bg-white dark:bg-black flex flex-col items-center justify-center px-6 text-center antialiased">
        <div className="space-y-2">
          <div className="text-4xl font-black tracking-widest text-slate-100 dark:text-slate-900 select-none">404</div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">
            {isPt ? "Loja indisponível" : "Store unavailable"}
          </h2>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs tracking-wide leading-relaxed">
            {isPt 
              ? "O link pode ter expirado ou a loja mudou de endereço." 
              : "The link may have expired or the store changed its address."}
          </p>
        </div>

        <div className="mt-8 flex gap-3 min-w-[220px]">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate("/");
              }
            }}
            className="flex-1 px-4 py-2 text-[10px] uppercase tracking-[0.15em] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
          >
            {isPt ? "Voltar" : "Go Back"}
          </button>
          
          <button
            type="button"
            onClick={() => forceRefresh()}
            className="flex-1 px-4 py-2 text-[10px] uppercase tracking-[0.15em] font-bold text-white bg-black dark:bg-white dark:text-black rounded-md hover:opacity-80 transition-opacity cursor-pointer shadow-sm"
          >
            {isPt ? "Repetir" : "Retry"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col antialiased">
      <StoreHeader storeId={store.id} />

      <main 
        key={`${layoutKey}-${location.pathname}`}
        className="flex-1 w-full min-h-[75vh] flex flex-col style-layer"
        style={{
          animation: 'quickFadeIn 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
          willChange: 'opacity'
        }}
      >
        <Outlet context={{ storeId: store.id, store }} />
      </main>

      <StorePageLinksSection storeId={store.id} />

      <PublicBackgroundAudio
        settings={store?.settings?.background_audio}
        storeName={store?.name}
        storeId={store?.id}
        storeDescription={store?.description}
        storeCurrency={store?.currency}
      />

      <StoreFooter
        store={store} 
        source={source} 
        isFetching={isFetching} 
        storeSlug={storeSlug} 
        forceRefresh={forceRefresh} 
      />

      {/* Estilo embutido de altíssima performance - Executado direto na GPU */}
      <style>{`
        @keyframes quickFadeIn {
          from { opacity: 0.4; }
          to { opacity: 1; }
        }
        .style-layer { backface-visibility: hidden; }
      `}</style>
    </div>
  );
}