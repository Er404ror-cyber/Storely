import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useIsFetching } from '@tanstack/react-query';
import { useTranslate } from '../context/LanguageContext';

type NetworkState = 'online' | 'offline' | 'slow' | 'restored';

const SLOW_RTT_THRESHOLD_MS = 2200;    // Latência acima de 2.2s = lenta
const QUERY_SLOW_THRESHOLD_MS = 2500;   // Query demorando mais de 2.5s = lenta
const PING_INTERVAL_MS = 30000;         // Checagem a cada 30s
const PING_TIMEOUT_MS = 4000;           // Timeout de 4s
const RESTORED_DISPLAY_MS = 3500;       // Duração da mensagem de restabelecido
const ANIMATION_DURATION_MS = 400;      // Duração da animação de saída

export const NetworkStatus: React.FC = () => {
  const { t } = useTranslate();
  const [status, setStatus] = useState<NetworkState>('online');
  const [visible, setVisible] = useState<boolean>(false);
  const [shouldRender, setShouldRender] = useState<boolean>(false);

  const isFetching = useIsFetching();

  const statusRef = useRef<NetworkState>('online');
  const hadIssueRef = useRef<boolean>(false);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  const querySlowTimerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingRef = useRef<boolean>(false);

  // 1. Limpeza Segura de Todos os Timers de Fechamento
  const clearDismissTimers = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);

  const clearQuerySlowTimer = useCallback(() => {
    if (querySlowTimerRef.current) {
      clearTimeout(querySlowTimerRef.current);
      querySlowTimerRef.current = null;
    }
  }, []);

  // 2. Fechamento Garantido com Animação (Sem ficar preso)
  const hideCard = useCallback(() => {
    clearDismissTimers();
    setVisible(false);

    dismissTimerRef.current = setTimeout(() => {
      setShouldRender(false);
      statusRef.current = 'online';
      setStatus('online');
      hadIssueRef.current = false;
    }, ANIMATION_DURATION_MS);
  }, [clearDismissTimers]);

  // 3. Exibição do Card Restabelecido com Auto-Dismiss Obrigatório
  const triggerRestored = useCallback(() => {
    clearDismissTimers();
    clearQuerySlowTimer();

    statusRef.current = 'restored';
    setStatus('restored');
    setShouldRender(true);

    // Próximo frame para garantir a animação de entrada
    requestAnimationFrame(() => {
      setVisible(true);
    });

    // Auto-dismiss seguro: fecha após o tempo definido
    dismissTimerRef.current = setTimeout(() => {
      hideCard();
    }, RESTORED_DISPLAY_MS);
  }, [clearDismissTimers, clearQuerySlowTimer, hideCard]);

  // 4. Medição de Latência Real Leve
  const measureActualLatency = useCallback(async (): Promise<{ isOnline: boolean; isSlow: boolean }> => {
    if (!navigator.onLine) {
      return { isOnline: false, isSlow: false };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
    const startTime = performance.now();

    try {
      // Usa micro requisição com cache-bust
      await fetch(`/favicon.ico?_t=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latency = performance.now() - startTime;

      return {
        isOnline: true,
        isSlow: latency >= SLOW_RTT_THRESHOLD_MS,
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      // Abort = timeout de rede (conexão muito lenta)
      if (err instanceof DOMException && err.name === 'AbortError') {
        return { isOnline: true, isSlow: true };
      }

      // Se o navigator ainda diz que está online, não assume offline por falha de 404/CORS
      return { isOnline: navigator.onLine, isSlow: false };
    }
  }, []);

  // 5. Avaliação do Estado da Rede
  const evaluateNetwork = useCallback(async () => {
    if (isCheckingRef.current) return;
    // Não interrompe a animação de saída do estado "restored"
    if (statusRef.current === 'restored') return;

    isCheckingRef.current = true;

    // Offline Total
    if (!navigator.onLine) {
      hadIssueRef.current = true;
      clearDismissTimers();
      clearQuerySlowTimer();
      statusRef.current = 'offline';
      setStatus('offline');
      setShouldRender(true);
      requestAnimationFrame(() => setVisible(true));
      isCheckingRef.current = false;
      return;
    }

    // Leitura das APIs de conexão do navegador
    const nav = navigator as any;
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
    let hardwareIndicatesSlow = false;

    if (conn) {
      hardwareIndicatesSlow =
        conn.effectiveType === 'slow-2g' ||
        conn.effectiveType === '2g' ||
        (conn.rtt && conn.rtt > 2000);
    }

    const { isOnline, isSlow } = await measureActualLatency();

    if (!isOnline) {
      hadIssueRef.current = true;
      clearDismissTimers();
      statusRef.current = 'offline';
      setStatus('offline');
      setShouldRender(true);
      requestAnimationFrame(() => setVisible(true));
    } else if (isSlow || hardwareIndicatesSlow) {
      hadIssueRef.current = true;
      clearDismissTimers();
      statusRef.current = 'slow';
      setStatus('slow');
      setShouldRender(true);
      requestAnimationFrame(() => setVisible(true));
    } else {
      // Se estava com problema e agora normalizou
      if (hadIssueRef.current && isFetching === 0) {
        triggerRestored();
      } else if (!hadIssueRef.current && statusRef.current !== 'online') {
        hideCard();
      }
    }

    isCheckingRef.current = false;
  }, [measureActualLatency, triggerRestored, isFetching, clearDismissTimers, clearQuerySlowTimer, hideCard]);

  // 6. Monitoramento de Queries TanStack Longas
  useEffect(() => {
    if (isFetching > 0) {
      if (statusRef.current === 'online' && !hadIssueRef.current) {
        clearQuerySlowTimer();
        querySlowTimerRef.current = setTimeout(() => {
          if (navigator.onLine && statusRef.current !== 'restored') {
            hadIssueRef.current = true;
            clearDismissTimers();
            statusRef.current = 'slow';
            setStatus('slow');
            setShouldRender(true);
            requestAnimationFrame(() => setVisible(true));
          }
        }, QUERY_SLOW_THRESHOLD_MS);
      }
    } else {
      clearQuerySlowTimer();
      if (hadIssueRef.current && statusRef.current === 'slow' && navigator.onLine) {
        triggerRestored();
      }
    }

    return () => clearQuerySlowTimer();
  }, [isFetching, triggerRestored, clearDismissTimers, clearQuerySlowTimer]);

  // 7. Eventos Globais de Rede e Visibilidade da Aba
  useEffect(() => {
    evaluateNetwork();

    const handleOnline = () => evaluateNetwork();
    const handleOffline = () => {
      hadIssueRef.current = true;
      clearDismissTimers();
      clearQuerySlowTimer();
      statusRef.current = 'offline';
      setStatus('offline');
      setShouldRender(true);
      requestAnimationFrame(() => setVisible(true));
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        evaluateNetwork();
        if (!intervalTimerRef.current) {
          intervalTimerRef.current = setInterval(evaluateNetwork, PING_INTERVAL_MS);
        }
      } else if (intervalTimerRef.current) {
        clearInterval(intervalTimerRef.current);
        intervalTimerRef.current = null;
      }
    };

    window.addEventListener('online', handleOnline, { passive: true });
    window.addEventListener('offline', handleOffline, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const nav = navigator as any;
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
    if (conn) {
      conn.addEventListener('change', evaluateNetwork);
    }

    if (document.visibilityState === 'visible') {
      intervalTimerRef.current = setInterval(evaluateNetwork, PING_INTERVAL_MS);
    }

    return () => {
      clearDismissTimers();
      clearQuerySlowTimer();
      if (intervalTimerRef.current) {
        clearInterval(intervalTimerRef.current);
        intervalTimerRef.current = null;
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (conn) {
        conn.removeEventListener('change', evaluateNetwork);
      }
    };
  }, [evaluateNetwork, clearDismissTimers, clearQuerySlowTimer]);

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
        className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl shadow-2xl  border ${config.bg} pointer-events-auto transition-all duration-300`}
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

        {status !== 'restored' && (
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
        )}
      </div>
    </aside>
  );
};

export default NetworkStatus;