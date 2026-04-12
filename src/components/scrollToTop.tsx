import { useEffect, useLayoutEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router-dom';

const STORAGE_KEY = 'app-scroll-positions-v6';

const INITIAL_DELAY_MS = 80;
const STABILITY_INTERVAL_MS = 40;
const MAX_RESTORE_TIME_MS = 500;
const REQUIRED_STABLE_PASSES = 3;

type ScrollPositions = Record<string, number>;
type ScrollTarget = Window | HTMLElement;

function isWindowTarget(target: ScrollTarget): target is Window {
  return target === window;
}

function readPositions(): ScrollPositions {
  if (typeof window === 'undefined') return {};

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as ScrollPositions;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writePositions(positions: ScrollPositions) {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {
    // ignore storage errors
  }
}

function getScrollTarget(pathname: string): ScrollTarget {
  if (typeof window === 'undefined') {
    // This branch will never really be used during rendering because
    // scroll helpers are only called in effects, but it keeps typing safe.
    return {} as Window;
  }

  if (pathname.startsWith('/admin')) {
    const adminScroller = document.querySelector<HTMLElement>(
      '[data-scroll-container="admin"]'
    );

    if (adminScroller) return adminScroller;
  }

  return window;
}

function getScrollTop(target: ScrollTarget): number {
  if (isWindowTarget(target)) {
    return window.scrollY || window.pageYOffset || 0;
  }

  return target.scrollTop;
}

function setScrollTop(target: ScrollTarget, top: number) {
  if (isWindowTarget(target)) {
    window.scrollTo(0, top);
    document.documentElement.scrollTop = top;
    document.body.scrollTop = top;
    return;
  }

  target.scrollTop = top;
}

function getScrollHeight(target: ScrollTarget): number {
  if (isWindowTarget(target)) {
    return Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      document.documentElement.offsetHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight
    );
  }

  return target.scrollHeight;
}

function getViewportHeight(target: ScrollTarget): number {
  if (isWindowTarget(target)) {
    return window.innerHeight || document.documentElement.clientHeight || 0;
  }

  return target.clientHeight;
}

function clampScrollTop(target: ScrollTarget, top: number): number {
  const max = Math.max(getScrollHeight(target) - getViewportHeight(target), 0);
  return Math.min(Math.max(top, 0), max);
}

function saveScroll(locationKey: string, pathname: string) {
  if (typeof window === 'undefined' || !locationKey) return;

  const positions = readPositions();
  const target = getScrollTarget(pathname);

  positions[locationKey] = getScrollTop(target);
  writePositions(positions);
}

function readScroll(locationKey: string): number {
  if (typeof window === 'undefined' || !locationKey) return 0;

  const positions = readPositions();
  const value = positions[locationKey];

  return Number.isFinite(value) ? value : 0;
}

export const ScrollToTop = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  const previousLocationRef = useRef({
    key: location.key,
    pathname: location.pathname,
  });

  const initialTimeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const hardStopTimeoutRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('scrollRestoration' in window.history)
    ) {
      return;
    }

    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const target = getScrollTarget(location.pathname);

    const onScroll = () => {
      saveScroll(location.key, location.pathname);
    };

    if (isWindowTarget(target)) {
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('pagehide', onScroll);

      return () => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('pagehide', onScroll);
        saveScroll(location.key, location.pathname);
      };
    }

    target.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', onScroll);

    return () => {
      target.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', onScroll);
      saveScroll(location.key, location.pathname);
    };
  }, [location.key, location.pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const previous = previousLocationRef.current;

    if (previous.key !== location.key) {
      saveScroll(previous.key, previous.pathname);

      previousLocationRef.current = {
        key: location.key,
        pathname: location.pathname,
      };
    }
  }, [location.key, location.pathname]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const shouldRestore = navigationType === 'POP';
    const savedY = readScroll(location.key);

    if (initialTimeoutRef.current !== null) {
      window.clearTimeout(initialTimeoutRef.current);
    }

    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
    }

    if (hardStopTimeoutRef.current !== null) {
      window.clearTimeout(hardStopTimeoutRef.current);
    }

    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
    }

    const stopAll = () => {
      if (initialTimeoutRef.current !== null) {
        window.clearTimeout(initialTimeoutRef.current);
        initialTimeoutRef.current = null;
      }

      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (hardStopTimeoutRef.current !== null) {
        window.clearTimeout(hardStopTimeoutRef.current);
        hardStopTimeoutRef.current = null;
      }

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const applyScroll = (target: ScrollTarget) => {
      const nextTop = shouldRestore ? clampScrollTop(target, savedY) : 0;
      setScrollTop(target, nextTop);
    };

    const startRestore = () => {
      let lastHeight = -1;
      let stablePasses = 0;

      const run = () => {
        const target = getScrollTarget(location.pathname);
        const currentHeight = getScrollHeight(target);

        applyScroll(target);

        const currentTop = getScrollTop(target);
        const expectedTop = shouldRestore ? clampScrollTop(target, savedY) : 0;
        const closeEnough = Math.abs(currentTop - expectedTop) <= 2;

        if (currentHeight === lastHeight && closeEnough) {
          stablePasses += 1;
        } else {
          stablePasses = 0;
          lastHeight = currentHeight;
        }

        if (stablePasses >= REQUIRED_STABLE_PASSES) {
          stopAll();
        }
      };

      rafRef.current = window.requestAnimationFrame(() => {
        run();

        intervalRef.current = window.setInterval(run, STABILITY_INTERVAL_MS);

        hardStopTimeoutRef.current = window.setTimeout(() => {
          const target = getScrollTarget(location.pathname);
          applyScroll(target);
          stopAll();
        }, MAX_RESTORE_TIME_MS);
      });
    };

    initialTimeoutRef.current = window.setTimeout(
      startRestore,
      INITIAL_DELAY_MS
    );

    return stopAll;
  }, [location.key, location.pathname, navigationType]);

  return <Outlet />;
};