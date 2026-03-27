import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, CheckCircle2 } from 'lucide-react';

export function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Validando suas credenciais...');

  useEffect(() => {
    // Escuta as mudanças de autenticação do Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      const params = new URLSearchParams(window.location.search);
      
      // Identifica se o link clicado foi de troca de e-mail
      const isEmailChange = window.location.href.includes('type=email_change') || params.get('type') === 'email_change';
      // Identifica se é recuperação de senha
      const isPasswordRecovery = event === 'PASSWORD_RECOVERY';

      // --- CASO 1: SUCESSO (SENHA OU E-MAIL) ---
      if (isPasswordRecovery || (isEmailChange && (event === 'SIGNED_IN' || event === 'USER_UPDATED'))) {
        setStatus('success');
        
        if (isPasswordRecovery) {
          setMessage('Identidade confirmada! Vamos definir sua nova senha.');
          setTimeout(() => navigate('/admin/configuracoes?tab=security&reset=true'), 2000);
        } else {
          setMessage('E-mail verificado com sucesso! Sua conta foi atualizada.');
          setTimeout(() => navigate('/admin/configuracoes?tab=account&email_updated=true'), 2000);
        }
        return;
      }

      // --- CASO 2: LOGIN PADRÃO ---
      if (event === 'SIGNED_IN') {
        navigate('/admin/dashboard');
        return;
      }

      // --- CASO 3: TRATAMENTO DE ERROS ---
      const errorCode = params.get('error');
      if (errorCode) {
        setStatus('error');
        setMessage(params.get('error_description') || 'Este link expirou ou já foi utilizado.');
        setTimeout(() => navigate('/auth'), 4000);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white p-6">
      <div className="max-w-sm w-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
        
        {/* ESTADO: CARREGANDO */}
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
              {message}
            </p>
          </div>
        )}

        {/* ESTADO: SUCESSO (BANNER VERDE) */}
        {status === 'success' && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="bg-green-100 p-5 rounded-full text-green-600 animate-bounce shadow-sm">
                <CheckCircle2 size={44} />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic">
                Verificado!
              </h2>
              <p className="text-sm font-bold text-slate-500 leading-relaxed italic">
                {message}
              </p>
            </div>
            <div className="pt-4 animate-pulse">
               <p className="text-[9px] font-black uppercase text-slate-300 tracking-widest">
                 Redirecionando para o painel...
               </p>
            </div>
          </div>
        )}

        {/* ESTADO: ERRO */}
        {status === 'error' && (
          <div className="space-y-4">
            <div className="bg-red-50 text-red-500 p-6 rounded-[2rem] border border-red-100 font-bold text-sm italic">
              {message}
            </div>
            <button 
              onClick={() => navigate('/auth')} 
              className="text-[10px] font-black uppercase text-slate-400 underline decoration-2 underline-offset-4 hover:text-indigo-600 transition-colors"
            >
              Voltar para o Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}