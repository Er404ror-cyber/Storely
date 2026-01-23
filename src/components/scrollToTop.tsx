// src/components/ScrollToTop.tsx
import { useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll instantâneo para o topo
    window.scrollTo(0, 0);
  }, [pathname]);

  // Retorna o Outlet para que as rotas filhas continuem renderizando
  return <Outlet />;
};