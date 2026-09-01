import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    let isMounted = true;

    // 1. Lê a sessão direta do cliente Supabase (usa o storage local oficial, não gasta requisições à API)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (session?.user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        queryClient.clear();
      }
    });

    // 2. Ouve alterações de autenticação em tempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;

        if (event === 'SIGNED_OUT' || !session?.user) {
          setIsAuthenticated(false);
          queryClient.clear();
        } else if (
          event === 'SIGNED_IN' ||
          event === 'TOKEN_REFRESHED' ||
          event === 'INITIAL_SESSION'
        ) {
          setIsAuthenticated(true);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient]);

  // Enquanto o Supabase lê a sessão local (dura menos de 10ms), segura a tela sem piscar e sem expulsar
  if (isAuthenticated === null) {
    return <div className="min-h-screen w-full bg-[#09131b]" />;
  }

  // Apenas redireciona se tiver a certeza absoluta de que NÃO há sessão
  if (isAuthenticated === false) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;