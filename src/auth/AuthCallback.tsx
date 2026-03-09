import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';
import { notify } from '../utils/toast';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Escuta a mudança de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        notify.success("Sessão validada com sucesso!");
        navigate('/admin/configuracoes'); // Redireciona de volta para as configurações
      }
      
      // Se houver erro na URL (como o que você recebeu)
      const queryParams = new URLSearchParams(window.location.hash.substring(1));
      if (queryParams.has('error')) {
        const errorMsg = queryParams.get('error_description') || "Erro ao validar link";
        notify.error(errorMsg);
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          Validando credenciais...
        </p>
      </div>
    </div>
  );
}