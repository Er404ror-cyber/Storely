import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

export function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Validando suas credenciais...');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      
      // CASO 1: RECUPERAÇÃO DE SENHA
      if (event === 'PASSWORD_RECOVERY') {
        setStatus('success');
        setMessage('Identidade confirmada! Vamos definir sua nova senha.');
        setTimeout(() => navigate('/admin/configuracoes?tab=security&reset=true'), 2000);
        return;
      }

      // CASO 2: TROCA DE E-MAIL (USER_UPDATED) OU LOGIN (SIGNED_IN)
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        const isEmailChange = window.location.href.includes('type=email_change');
        
        if (isEmailChange) {
          setStatus('success');
          setMessage('E-mail atualizado com sucesso! Sua conta está segura.');
          // Aguarda 3 segundos para o usuário ler a confirmação e entra direto
          setTimeout(() => navigate('/admin/configuracoes'), 3000);
        } else {
          navigate('/admin/dashboard');
        }
        return;
      }

      // CASO 3: ERROS (Link expirado ou usado)
      const params = new URLSearchParams(window.location.search);
      if (params.get('error')) {
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
        
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="bg-green-100 p-4 rounded-full text-green-600 animate-bounce">
                <CheckCircle2 size={40} />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic">Sucesso!</h2>
              <p className="text-sm font-bold text-slate-500 leading-relaxed">{message}</p>
            </div>
            <div className="pt-4">
               <button 
                onClick={() => navigate('/admin/configuracoes')}
                className="flex items-center gap-2 mx-auto text-[10px] font-black uppercase text-indigo-600 border-b-2 border-indigo-600 pb-1"
               >
                 Entrar no painel <ArrowRight size={14} />
               </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <p className="text-sm font-bold text-red-500">{message}</p>
            <button onClick={() => navigate('/auth')} className="text-xs font-black uppercase text-slate-400 underline">Voltar para o Login</button>
          </div>
        )}
      </div>
    </div>
  );
}