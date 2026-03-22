import { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router-dom';

const SCROLL_KEY_PREFIX = 'route-scroll';

function getScrollKey(pathname: string, search: string) {
  return `${SCROLL_KEY_PREFIX}:${pathname}${search}`;
}

function saveScrollPosition(pathname: string, search: string) {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.setItem(
      getScrollKey(pathname, search),
      String(window.scrollY || window.pageYOffset || 0)
    );
  } catch {}
}

function readScrollPosition(pathname: string, search: string) {
  if (typeof window === 'undefined') return 0;

  try {
    const raw = sessionStorage.getItem(getScrollKey(pathname, search));
    if (!raw) return 0;

    const value = Number(raw);
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

export const ScrollToTop = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  const previousRouteRef = useRef({
    pathname: location.pathname,
    search: location.search,
  });

  // Guarda o scroll continuamente
  useEffect(() => {
    const onScroll = () => {
      saveScrollPosition(location.pathname, location.search);
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      saveScrollPosition(location.pathname, location.search);
    };
  }, [location.pathname, location.search]);

  // Guarda o scroll da rota anterior quando muda de rota
  useEffect(() => {
    const previousRoute = previousRouteRef.current;

    if (
      previousRoute.pathname !== location.pathname ||
      previousRoute.search !== location.search
    ) {
      saveScrollPosition(previousRoute.pathname, previousRoute.search);

      previousRouteRef.current = {
        pathname: location.pathname,
        search: location.search,
      };
    }
  }, [location.pathname, location.search]);

  // Se for voltar/avançar: restaura
  // Se for navegação normal: sobe ao topo
  useEffect(() => {
    const savedY = readScrollPosition(location.pathname, location.search);
    const shouldRestore = navigationType === 'POP';

    const timeoutId = window.setTimeout(() => {
      window.scrollTo({
        top: shouldRestore ? savedY : 0,
        behavior: 'auto',
      });
    }, 40);

    return () => window.clearTimeout(timeoutId);
  }, [location.pathname, location.search, navigationType]);

  return <Outlet />;
};