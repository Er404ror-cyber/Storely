import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Loader2, RefreshCw } from 'lucide-react';
import { useTranslate } from '../../../context/LanguageContext';
import { supabase } from '../../../lib/supabase';
import { notify } from '../../../utils/toast';
import { SectionInfo } from '../AdminSettingsComponents';


export function SecurityTab({ store, isRecoveryMode }: { store: any, isRecoveryMode: boolean }) {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const updatePasswordMutation = useMutation({
    mutationFn: async () => {
      if (!newPassword || newPassword.length < 6) throw new Error("A senha deve ter pelo menos 6 caracteres");
      if (newPassword !== confirmPassword) throw new Error("As senhas não coincidem");
      
      if (!isRecoveryMode) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: store?.email || '',
          password: currentPassword,
        });
        if (authError) throw new Error("Senha atual incorreta");
      }
      
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    },
    onSuccess: () => {
      notify.success(isRecoveryMode ? "Senha redefinida com sucesso!" : t('password_update_success'));
      if (isRecoveryMode) navigate('/admin/configuracoes', { replace: true });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    },
    onError: (err: Error) => notify.error(err.message)
  });

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4">
      <SectionInfo 
        title={isRecoveryMode ? "Redefinir Senha" : t('section_crypto_title')} 
        subtitle={isRecoveryMode ? "Crie uma nova senha segura para sua conta." : t('section_crypto_subtitle')} 
      />
      
      <div className="bg-white rounded-[3rem] border-2 border-indigo-100 shadow-2xl p-12 space-y-8 relative overflow-hidden">
        {isRecoveryMode && (
          <div className="absolute top-0 left-0 right-0 bg-indigo-600 p-2 text-center text-[9px] font-black text-white uppercase italic">
            Modo de Recuperação Ativo
          </div>
        )}

        {!isRecoveryMode && (
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Senha Atual" className="w-full p-6 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-indigo-600 outline-none font-bold" />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nova Senha" className="w-full p-6 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-indigo-600 outline-none font-bold" />
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repetir Senha" className="w-full p-6 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-indigo-600 outline-none font-bold" />
        </div>

        <div className="flex justify-between items-center pt-6">
          {!isRecoveryMode && (
            <button 
              onClick={async () => {
                setIsResetting(true);
                await supabase.auth.resetPasswordForEmail(store?.email, { redirectTo: `${window.location.origin}/auth/callback` });
                setIsResetting(false);
                notify.success("E-mail enviado!");
              }}
              className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-2"
            >
              {isResetting ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              Esqueci minha senha
            </button>
          )}
          
          <button 
            disabled={updatePasswordMutation.isPending}
            onClick={() => updatePasswordMutation.mutate()} 
            className="bg-indigo-600 text-white px-14 py-6 rounded-[2rem] text-[11px] font-black uppercase shadow-2xl active:scale-95"
          >
             {updatePasswordMutation.isPending ? <Loader2 className="animate-spin" size={18}/> : "Salvar Nova Senha"}
          </button>
        </div>
      </div>
    </div>
  );
}