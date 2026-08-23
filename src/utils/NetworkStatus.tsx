import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useIsFetching } from '@tanstack/react-query';
import { useTranslate } from '../context/LanguageContext';

type NetworkState = 'online' | 'offline' | 'slow' | 'restored';

const PING_TIMEOUT_MS = 2000;           
const SLOW_RTT_THRESHOLD_MS = 1500;     
const QUERY_SLOW_THRESHOLD_MS = 3000;   
const RESTORED_DISPLAY_MS = 3500;       
const ANIMATION_DURATION_MS = 400;

export const NetworkStatus: React.FC = () => {
  const { t } = useTranslate();
  const [status, setStatus] = useState<NetworkState>('online');
  const [visible, setVisible] = useState<boolean>(false);
  const [shouldRender, setShouldRender] = useState<boolean>(false);

  const isFetching = useIsFetching();

  const statusRef = useRef<NetworkState>('online');
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  const queryTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearDismissTimer = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);

  const clearQueryTimer = useCallback(() => {
    if (queryTimerRef.current) {
      clearTimeout(queryTimerRef.current);
      queryTimerRef.current = null;
    }
  }, []);

  const hideCard = useCallback(() => {
    clearDismissTimer();
    setVisible(false);

    dismissTimerRef.current = setTimeout(() => {
      setShouldRender(false);
      statusRef.current = 'online';
      setStatus('online');
    }, ANIMATION_DURATION_MS);
  }, [clearDismissTimer]);

  const triggerRestored = useCallback(() => {
    // PREVENÇÃO DE CONGELAMENTO: Se já estiver verde, ignora novos chamados e deixa o tempo correr
    if (statusRef.current === 'restored') return;

    clearDismissTimer();
    clearQueryTimer();
    
    statusRef.current = 'restored';
    setStatus('restored');
    setShouldRender(true);

    requestAnimationFrame(() => setVisible(true));

    dismissTimerRef.current = setTimeout(() => {
      hideCard();
    }, RESTORED_DISPLAY_MS);
  }, [clearDismissTimer, clearQueryTimer, hideCard]);

  const setOfflineState = useCallback(() => {
    clearDismissTimer();
    clearQueryTimer();
    statusRef.current = 'offline';
    setStatus('offline');
    setShouldRender(true);
    requestAnimationFrame(() => setVisible(true));
  }, [clearDismissTimer, clearQueryTimer]);

  const setSlowState = useCallback(() => {
    if (statusRef.current === 'offline' || statusRef.current === 'restored') return;
    
    clearDismissTimer();
    statusRef.current = 'slow';
    setStatus('slow');
    setShouldRender(true);
    requestAnimationFrame(() => setVisible(true));
  }, [clearDismissTimer]);

  const testNetworkLatency = useCallback(async (): Promise<boolean> => {
    if (!navigator.onLine) return true;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
    const startTime = performance.now();

    try {
      await fetch(`/favicon.ico?_t=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latency = performance.now() - startTime;
      
      return latency > SLOW_RTT_THRESHOLD_MS;
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof DOMException && err.name === 'AbortError') {
        return true;
      }
      return false; 
    }
  }, []);

  useEffect(() => {
    if (isFetching > 0) {
      if (statusRef.current === 'online') {
        clearQueryTimer();
        
        queryTimerRef.current = setTimeout(async () => {
          if (statusRef.current !== 'online') return;

          const isNetworkSlow = await testNetworkLatency();
          
          if (isNetworkSlow && navigator.onLine) {
            setSlowState();
          }
        }, QUERY_SLOW_THRESHOLD_MS);
      }
    } else {
      clearQueryTimer();
      if (statusRef.current === 'slow' && navigator.onLine) {
        triggerRestored();
      }
    }

    return () => clearQueryTimer();
  }, [isFetching, testNetworkLatency, setSlowState, triggerRestored, clearQueryTimer]);

  useEffect(() => {
    const handleOnline = () => {
      if (statusRef.current === 'offline' || statusRef.current === 'slow') {
        triggerRestored();
      }
    };

    const handleOffline = () => setOfflineState();

    const handleConnectionChange = () => {
      if (!navigator.onLine) return;
      const nav = navigator as any;
      const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
      
      if (conn && (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g' || (conn.rtt && conn.rtt > 2000))) {
        setSlowState();
      }
    };

    if (!navigator.onLine) {
      setOfflineState();
    } else {
      handleConnectionChange();
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const nav = navigator as any;
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
    if (conn) {
      conn.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (conn) {
        conn.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [setOfflineState, setSlowState, triggerRestored]);

  if (!shouldRender) return null;

  const config = {
    offline: {
      bg: 'bg-rose-500/95 border-rose-600/40 text-white',
      dot: 'bg-white animate-ping',
      title: t('network_offline_title' as any, { defaultValue: 'Sem conexão' }),
      desc: t('network_offline_desc' as any, { defaultValue: 'Verifique sua internet para continuar.' }),
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 4.243a9 9 0 01-12.728 0m2.829-2.829a5 5 0 017.072 0M3 3l18 18" />
        </svg>
      ),
    },
    slow: {
      bg: 'bg-amber-500/95 border-amber-600/40 text-white',
      dot: 'bg-amber-100 animate-pulse',
      title: t('network_slow_title' as any, { defaultValue: 'Conexão lenta' }),
      desc: t('network_slow_desc' as any, { defaultValue: 'Os dados podem demorar a carregar.' }),
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    restored: {
      bg: 'bg-emerald-600/95 border-emerald-500/40 text-white',
      dot: 'bg-emerald-200',
      title: t('network_restored_title' as any, { defaultValue: 'Conexão restabelecida' }),
      desc: t('network_restored_desc' as any, { defaultValue: 'Você está online novamente.' }),
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    online: {
      bg: 'bg-emerald-600/95 border-emerald-500/40 text-white',
      dot: 'bg-emerald-200',
      title: '',
      desc: '',
      icon: null,
    },
  }[status];

  return (
    <aside
      aria-live="polite"
      aria-atomic="true"
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] w-[92%] sm:w-auto sm:min-w-[360px] max-w-[480px] pointer-events-none transition-all duration-400 ease-out transform ${
        visible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-6 scale-95 pointer-events-none'
      }`}
    >
      <div 
        className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl shadow-2xl border ${config.bg} pointer-events-auto transition-all duration-300`}
      >
        <div className="relative flex items-center justify-center p-2 rounded-xl bg-black/15">
          {config.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${config.dot}`} />
            <h4 className="text-xs sm:text-sm font-semibold tracking-wide leading-tight truncate">
              {config.title}
            </h4>
          </div>
          <p className="text-[11px] sm:text-xs opacity-90 leading-tight mt-0.5 truncate">
            {config.desc}
          </p>
        </div>

        {/* Removi a restrição do 'restored'. O botão fica sempre disponível! */}
        <button
          type="button"
          onClick={hideCard}
          aria-label={t('network_close_aria' as any, { defaultValue: 'Fechar aviso' })}
          className="p-1.5 -mr-1 rounded-lg hover:bg-black/15 transition-colors opacity-80 hover:opacity-100 active:scale-95 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </aside>
  );
};

export default NetworkStatus;