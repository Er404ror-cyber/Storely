import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { useTranslate } from '../../../context/LanguageContext';
import { supabase } from '../../../lib/supabase';
import { notify } from '../../../utils/toast';
import { SectionInfo } from '../AdminSettingsComponents';

export function AccountTab({ store, isConfirmed }: { store: any, isConfirmed: boolean }) {
  const { t } = useTranslate();
  const queryClient = useQueryClient();
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const updateEmailMutation = useMutation({
    mutationFn: async () => {
      if (!newEmail) throw new Error("Digite o novo e-mail");
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: store?.email || '',
        password: currentPassword,
      });
      if (authError) throw new Error("Senha atual incorreta");
      
      const { error } = await supabase.auth.updateUser(
        { email: newEmail }, 
        { emailRedirectTo: `${window.location.origin}/auth/callback` }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      notify.success("Link enviado! Verifique o novo e-mail.");
      setResendTimer(60); setNewEmail(''); setCurrentPassword('');
      queryClient.invalidateQueries({ queryKey: ["admin-full-settings"] });
    },
    onError: (err: Error) => notify.error(err.message)
  });

  return (
    <div className="space-y-8 animate-in fade-in">
      <SectionInfo title={t('section_email_title')} subtitle={t('section_email_subtitle')} />
      
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-10 space-y-8">
        
        {/* Alerta de Sucesso: Novo E-mail Atualizado */}
        {isConfirmed && !store?.new_email_pending && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-2xl flex items-center gap-3 text-green-700 animate-bounce">
            <CheckCircle2 size={20} />
            <p className="text-sm font-bold uppercase italic tracking-tighter">Novo e-mail atualizado com sucesso!</p>
          </div>
        )}

        {store?.new_email_pending && (
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] flex flex-wrap items-center justify-between gap-4 border-dashed">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-full text-amber-500 shadow-sm"><Send size={18}/></div>
              <div>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest italic">Troca em andamento</p>
                <p className="text-sm font-bold text-amber-900 leading-tight">{store.new_email_pending}</p>
              </div>
            </div>
            <button 
              disabled={resendTimer > 0} 
              onClick={() => {/* lógica resend */}} 
              className="bg-amber-500 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase"
            >
              {resendTimer > 0 ? `Aguarde ${resendTimer}s` : "Reenviar Link"}
            </button>
          </div>
        )}

        <div className="flex items-center gap-5 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
          <div className="p-4 bg-white rounded-2xl shadow-sm text-indigo-600"><Mail size={24}/></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase">{t('label_current_email')}</p><p className="font-bold text-slate-800">{store?.email}</p></div>
        </div>

        <div className="space-y-6">
          <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="novo@email.com" className="w-full p-6 bg-slate-50 rounded-[1.8rem] border-2 border-transparent focus:border-indigo-600 outline-none font-bold" />
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Confirme sua senha atual" className="w-full p-6 bg-slate-50 rounded-[1.8rem] border-2 border-transparent focus:border-indigo-600 outline-none font-bold" />
        </div>

        <div className="flex justify-end pt-4">
          <button 
            disabled={!newEmail || !currentPassword || updateEmailMutation.isPending} 
            onClick={() => updateEmailMutation.mutate()} 
            className="bg-slate-900 text-white px-12 py-5 rounded-[1.5rem] text-[11px] font-black uppercase hover:bg-indigo-600 shadow-xl disabled:opacity-20"
          >
            {updateEmailMutation.isPending ? <Loader2 className="animate-spin" size={18}/> : t('btn_update_email')}
          </button>
        </div>
      </div>
    </div>
  );
}