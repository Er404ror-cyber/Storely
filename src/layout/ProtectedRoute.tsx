import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showLoader, setShowLoader] = useState(false);
  const location = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) setShowLoader(true);
    }, 150);

    const validateUser = async () => {
      try {
        // getUser valida o token diretamente com os servidores do Supabase
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          if (isMounted) {
            setIsAuthenticated(false);
            queryClient.clear(); // Limpa queries para evitar refetchs em loop
          }
          return;
        }

        if (isMounted) {
          setIsAuthenticated(true);
        }
      } catch {
        if (isMounted) {
          setIsAuthenticated(false);
          queryClient.clear();
        }
      }
    };

    validateUser();

    // Escuta mudanças de estado em tempo real (logout, token expirado, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;

        if (event === 'SIGNED_OUT' || !session) {
          setIsAuthenticated(false);
          queryClient.clear();
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setIsAuthenticated(true);
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [queryClient]);

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#09131b]">
        {showLoader ? <Loader2 className="animate-spin text-cyan-400" size={32} /> : null}
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redireciona para /auth preservando a rota que o usuário tentou acessar
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <Outlet />;
};