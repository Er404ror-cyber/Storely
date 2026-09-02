import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslate } from '../context/LanguageContext';

const STORAGE_KEY = 'storely_scroll_positions';
const RELOAD_FLAG = 'storely_is_reloading';
const DOUBLE_F5_KEY = 'storely_double_f5_ts';
const MAX_HISTORY = 3;

interface ScrollRecord {
  y: number;
  isBottom: boolean;
}

const getStoredData = (): Record<string, ScrollRecord> => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

const getActiveScrollElement = (): HTMLElement | Window => {
  const adminContainer = document.querySelector('[data-scroll-container="admin"]') as HTMLElement | null;
  if (adminContainer) return adminContainer;

  const genericContainer = document.querySelector('[data-scroll-container]') as HTMLElement | null;
  if (genericContainer) return genericContainer;

  return window;
};

const getCurrentScrollY = (): number => {
  const target = getActiveScrollElement();
  if (target instanceof Window) {
    return window.scrollY || document.documentElement.scrollTop || 0;
  }
  return target.scrollTop || 0;
};

const applyScrollToTarget = (y: number): void => {
  const target = getActiveScrollElement();
  
  if (target instanceof Window) {
    const html = document.documentElement;
    const prevBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';

    window.scrollTo(0, y);
    html.scrollTop = y;
    document.body.scrollTop = y;

    html.style.scrollBehavior = prevBehavior;
  } else {
    const prevBehavior = target.style.scrollBehavior;
    target.style.scrollBehavior = 'auto';

    target.scrollTop = y;

    target.style.scrollBehavior = prevBehavior;
  }
};

const getScrollMetrics = (): { scrollHeight: number; maxScroll: number } => {
  const target = getActiveScrollElement();

  if (target instanceof Window) {
    const totalHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    );
    return {
      scrollHeight: totalHeight,
      maxScroll: Math.max(0, totalHeight - window.innerHeight),
    };
  }
  return {
    scrollHeight: target.scrollHeight,
    maxScroll: Math.max(0, target.scrollHeight - target.clientHeight),
  };
};

// Grava no máximo 3 rotas no sessionStorage para poupar memória
const persistPosition = (key: string, y: number): void => {
  try {
    const data = getStoredData();
    const { maxScroll } = getScrollMetrics();
    const isBottom = maxScroll > 0 && y >= maxScroll - 6;

    // Remove a chave atual se já existir para reposicioná-la como mais recente
    delete data[key];

    // Se atingir o teto de 3, remove a rota mais antiga
    const keys = Object.keys(data);
    if (keys.length >= MAX_HISTORY) {
      delete data[keys[0]];
    }

    data[key] = {
      y: y <= 2 ? 0 : y,
      isBottom,
    };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
};

export const useScrollRestoration = (): void => {
  const location = useLocation();
  const navType = useNavigationType();
  const { t, lang } = useTranslate();
  const { pathname, search } = location;
  const scrollKey = pathname + search;
  const isRestoringRef = useRef<boolean>(false);
  const userInterruptedRef = useRef<boolean>(false);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // 1. Gravação passiva com limite de 3 itens no histórico
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const record = (): void => {
      if (isRestoringRef.current) return;
      const y = getCurrentScrollY();
      persistPosition(scrollKey, y);
    };

    const handleScroll = (): void => {
      clearTimeout(timer);
      timer = setTimeout(record, 60);
    };

    const handleUnload = (): void => {
      record();
      sessionStorage.setItem(RELOAD_FLAG, 'true');
    };

    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll, { capture: true });
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [scrollKey]);

  // 2. Restauração Reativa de Alto Desempenho
  useEffect(() => {
    const isPt = lang.startsWith('pt');
    const isAdmin = pathname.startsWith('/admin');
    const startDelay = isAdmin ? 40 : 820;

    userInterruptedRef.current = false;
    isRestoringRef.current = true;

    const wasReload = sessionStorage.getItem(RELOAD_FLAG) === 'true';
    sessionStorage.removeItem(RELOAD_FLAG);

    if (wasReload) {
      const now = Date.now();
      const lastF5 = Number(sessionStorage.getItem(DOUBLE_F5_KEY) || 0);

      if (lastF5 > 0 && now - lastF5 < 1800) {
        sessionStorage.removeItem(DOUBLE_F5_KEY);
        persistPosition(scrollKey, 0);
        applyScrollToTarget(0);
        isRestoringRef.current = false;
        return;
      }

      sessionStorage.setItem(DOUBLE_F5_KEY, String(now));
      setTimeout(() => {
        sessionStorage.removeItem(DOUBLE_F5_KEY);
      }, 2000);
    } else {
      sessionStorage.removeItem(DOUBLE_F5_KEY);
    }

    if (navType === 'PUSH' && !wasReload) {
      applyScrollToTarget(0);
      isRestoringRef.current = false;
      return;
    }

    const storedData = getStoredData();
    const record = storedData[scrollKey];
    const targetY = record?.y ?? 0;
    const wasAtBottom = Boolean(record?.isBottom);

    if (targetY <= 2) {
      applyScrollToTarget(0);
      isRestoringRef.current = false;
      return;
    }

    let observer: ResizeObserver | null = null;
    let settleTimer: ReturnType<typeof setTimeout> | null = null;
    let safetyTimeout: ReturnType<typeof setTimeout> | null = null;
    let loadingWarningTimer: ReturnType<typeof setTimeout> | null = null;
    let rAFId: number | null = null;
    let warnedSlow = false;
    let finished = false;

    const cleanup = (): void => {
      finished = true;
      if (observer) observer.disconnect();
      if (rAFId) cancelAnimationFrame(rAFId);
      if (settleTimer) clearTimeout(settleTimer);
      if (loadingWarningTimer) clearTimeout(loadingWarningTimer);
      if (safetyTimeout) clearTimeout(safetyTimeout);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('wheel', onWheelInteraction);
      setTimeout(() => {
        isRestoringRef.current = false;
      }, 50);
    };

    const onTouchStart = (e: TouchEvent): void => {
      const touchX = e.touches[0]?.clientX ?? 60;
      const screenWidth = window.innerWidth;
      const isEdgeSwipe = touchX < 48 || touchX > screenWidth - 48;

      if (!isEdgeSwipe) {
        userInterruptedRef.current = true;
        if (warnedSlow) toast.dismiss('scroll-loading');
        cleanup();
      }
    };

    const onWheelInteraction = (e: WheelEvent): void => {
      if (Math.abs(e.deltaY) > 3) {
        userInterruptedRef.current = true;
        if (warnedSlow) toast.dismiss('scroll-loading');
        cleanup();
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('wheel', onWheelInteraction, { passive: true });

    const commitPosition = (y: number): void => {
      applyScrollToTarget(y);
      requestAnimationFrame(() => {
        applyScrollToTarget(y);
      });
    };

    const finishScroll = (finalY: number): void => {
      if (userInterruptedRef.current || finished) return;

      commitPosition(finalY);
      if (warnedSlow) toast.dismiss('scroll-loading');

      toast(
        t('scroll_restored') || (isPt ? 'Restaurado' : 'Restored'),
        {
          id: 'scroll-restored',
          duration: 1800,
          icon: (
            <svg
              className="w-4 h-4 text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21s-6-5.686-6-10A6 6 0 0118 11c0 4.314-6 10-6 10z"
              />
              <circle cx="12" cy="11" r="2" fill="currentColor" />
            </svg>
          ),
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '8px 16px',
            fontSize: '12px',
            borderRadius: '9999px',
            fontWeight: '600',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
          },
        }
      );

      cleanup();
    };

    const startTimeout = setTimeout(() => {
      if (userInterruptedRef.current) {
        cleanup();
        return;
      }

      const initialMetrics = getScrollMetrics();
      if (initialMetrics.maxScroll >= targetY - 1) {
        const destY = wasAtBottom ? initialMetrics.maxScroll : targetY;
        commitPosition(destY);
      }

      loadingWarningTimer = setTimeout(() => {
        if (userInterruptedRef.current || finished) return;
        const { maxScroll } = getScrollMetrics();

        if (maxScroll < targetY - 10) {
          warnedSlow = true;
          toast(
            t('loading_content') || (isPt ? 'Carregando...' : 'Loading...'),
            {
              id: 'scroll-loading',
              duration: 3500,
              icon: (
                <svg
                  className="w-3.5 h-3.5 text-indigo-400 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              ),
              style: {
                background: '#0f172a',
                color: '#94a3b8',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '6px 14px',
                fontSize: '11px',
                borderRadius: '9999px',
                fontWeight: '600',
              },
            }
          );
        }
      }, 1200);

      safetyTimeout = setTimeout(() => {
        if (!finished && !userInterruptedRef.current) {
          const { maxScroll } = getScrollMetrics();
          const safeY = wasAtBottom ? maxScroll : Math.min(targetY, maxScroll);
          if (safeY > 4) {
            finishScroll(safeY);
          } else {
            cleanup();
          }
        }
      }, 3200);

      const evaluateScroll = (): void => {
        if (userInterruptedRef.current || finished) {
          cleanup();
          return;
        }

        const { maxScroll } = getScrollMetrics();

        if (maxScroll >= targetY - 1) {
          const destY = wasAtBottom ? maxScroll : targetY;
          commitPosition(destY);

          if (settleTimer) clearTimeout(settleTimer);
          settleTimer = setTimeout(() => {
            finishScroll(destY);
          }, 60);
        }
      };

      observer = new ResizeObserver(() => {
        if (rAFId) cancelAnimationFrame(rAFId);
        rAFId = requestAnimationFrame(evaluateScroll);
      });

      const activeEl = getActiveScrollElement();
      if (activeEl instanceof HTMLElement) {
        observer.observe(activeEl);
        if (activeEl.firstElementChild) {
          observer.observe(activeEl.firstElementChild);
        }
      } else {
        observer.observe(document.documentElement);
        if (document.body) observer.observe(document.body);
      }

      evaluateScroll();
    }, startDelay);

    return () => {
      clearTimeout(startTimeout);
      cleanup();
    };
  }, [scrollKey, pathname, search, navType, t, lang]);
};