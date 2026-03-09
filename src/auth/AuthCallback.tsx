import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';
import { notify } from '../utils/toast';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Escuta as mudanças de estado de autenticação (disparadas pelo link do e-mail)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      
      // 1. Caso de Recuperação de Senha
      if (event === 'PASSWORD_RECOVERY') {
        notify.success("Link de recuperação aceito. Defina sua nova senha.");
        // Redireciona para a aba de segurança com um parâmetro para abrir o formulário
        navigate('/admin/configuracoes?tab=security&reset=true');
        return;
      }

      // 2. Caso de Troca de E-mail ou Login via Link (Magic Link)
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        // Se for uma troca de e-mail, o USER_UPDATED é disparado
        const isEmailChange = window.location.href.includes('type=email_change');
        
        if (isEmailChange) {
          notify.success("E-mail atualizado com sucesso!");
        } else {
          notify.success("Sessão validada com sucesso!");
        }
        
        navigate('/admin/configuracoes');
        return;
      }

      // 3. Tratamento de Erros vindos na URL (Ex: Link expirado)
      // O Supabase às vezes envia erros via Hash ou Query Params
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      const error = params.get('error') || hashParams.get('error');
      const errorDescription = params.get('error_description') || hashParams.get('error_description');

      if (error) {
        console.error("Auth Error:", errorDescription);
        notify.error(errorDescription || "O link é inválido ou expirou.");
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
            Autenticação
          </p>
          <p className="text-sm font-bold text-slate-800">
            Processando requisição...
          </p>
        </div>
      </div>
    </div>
  );
}