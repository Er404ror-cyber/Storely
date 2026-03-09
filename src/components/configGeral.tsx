import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Loader2, Globe, Shield, Store, Mail, User, Smartphone, RefreshCw, Send } from 'lucide-react';
import { notify } from '../utils/toast';
import { useTranslate } from '../context/LanguageContext';
import { TabItem, SectionInfo, EditableRow } from './settings/AdminSettingsComponents';

export function AdminSettings() {
  const { t } = useTranslate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'store' | 'account' | 'security'>('store');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Timer para evitar spam de reenvio
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const { data: store, isLoading } = useQuery({
    queryKey: ["admin-full-settings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");
      
      const { data, error } = await supabase.from("stores").select("*").eq("owner_id", user.id).single();
      if (error) throw error;

      return { 
        ...data, 
        email: user.email,
        new_email_pending: user.new_email 
      };
    }
  });

  const updateField = useMutation({
    mutationFn: async ({ field, value }: { field: string; value: string }) => {
      const { error } = await supabase.from("stores").update({ [field]: value }).eq("id", store?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-full-settings"] });
      notify.success(t('save_success'));
    },
    onError: (err: Error) => notify.error(err.message)
  });

  // MUTAÇÃO PARA NOVA TROCA DE E-MAIL (Pede senha)
  const updateEmailMutation = useMutation({
    mutationFn: async () => {
      if (!newEmail) throw new Error("Digite o novo e-mail");
      if (!currentPassword) throw new Error("Senha atual necessária");

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: store?.email || '',
        password: currentPassword,
      });
      if (authError) throw new Error("Senha atual incorreta");

      const { error } = await supabase.auth.updateUser(
        { email: newEmail },
        { emailRedirectTo: `https://storelyy.vercel.app/auth/callback` }
      );

      if (error) throw error;
    },
    onSuccess: () => {
      notify.success("Link enviado! Verifique a caixa de entrada do novo e-mail.");
      setResendTimer(60);
      setNewEmail('');
      setCurrentPassword('');
      queryClient.invalidateQueries({ queryKey: ["admin-full-settings"] });
    },
    onError: (err: Error) => notify.error(err.message)
  });

  // MUTAÇÃO PARA REENVIO DE CONFIRMAÇÃO (Usa resend para evitar erro email_exists)
  const resendEmailMutation = useMutation({
    mutationFn: async () => {
      if (!store?.new_email_pending) throw new Error("Nenhuma troca pendente");

      const { error } = await supabase.auth.resend({
        type: 'email_change',
        email: store.new_email_pending,
        options: {
          emailRedirectTo: `https://storelyy.vercel.app/auth/callback`
        }
      });

      if (error) {
        if (error.status === 429) {
          setResendTimer(60);
          throw new Error("Muitas solicitações. Aguarde um pouco.");
        }
        throw error;
      }
    },
    onSuccess: () => {
      notify.success("Link reenviado com sucesso!");
      setResendTimer(60);
    },
    onError: (err: Error) => notify.error(err.message)
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async () => {
      if (newPassword !== confirmPassword) throw new Error("As senhas não coincidem");
      
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: store?.email || '',
        password: currentPassword,
      });
      if (authError) throw new Error("Senha atual incorreta");
      
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    },
    onSuccess: () => {
      notify.success(t('password_update_success'));
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    },
    onError: (err: Error) => notify.error(err.message)
  });

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-6 bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600" size={50} />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('loading_session')}</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-32 px-6 animate-in fade-in duration-700">
      <div className="mb-12 space-y-2 pt-10">
        <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic">
          {t('settings_title')} <span className="text-indigo-600">{t('settings_highlight')}</span>
        </h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">{t('settings_subtitle')}</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-16 p-2 bg-slate-100/50 rounded-[2.5rem] w-fit border border-slate-200/40 shadow-inner">
        <TabItem active={activeTab === 'store'} onClick={() => setActiveTab('store')} icon={<Store size={14}/>} label={t('tab_store')} />
        <TabItem active={activeTab === 'account'} onClick={() => setActiveTab('account')} icon={<User size={14}/>} label={t('tab_account')} />
        <TabItem active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<Shield size={14}/>} label={t('tab_security')} />
      </div>

      {activeTab === 'store' && (
        <div className="space-y-8 animate-in slide-in-from-left-4">
          <SectionInfo title={t('section_presence_title')} subtitle={t('section_presence_subtitle')} />
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden divide-y divide-slate-50">
            <EditableRow label={t('label_brand_name')} value={store?.name} onSave={(v) => updateField.mutate({ field: 'name', value: v })} />
            <EditableRow label={t('label_slug')} value={store?.slug} icon={<Globe size={16}/>} onSave={(v) => updateField.mutate({ field: 'slug', value: v.toLowerCase().trim() })} />
            <EditableRow label={t('label_description')} value={store?.description} isTextArea onSave={(v) => updateField.mutate({ field: 'description', value: v })} />
            <EditableRow label={t('label_whatsapp')} value={store?.whatsapp_number} icon={<Smartphone size={16}/>} onSave={(v) => updateField.mutate({ field: 'whatsapp_number', value: v })} />
          </div>
        </div>
      )}

      {activeTab === 'account' && (
        <div className="space-y-8 animate-in fade-in">
          <SectionInfo title={t('section_email_title')} subtitle={t('section_email_subtitle')} />
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-10 space-y-8">
            
            {store?.new_email_pending && (
              <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] flex flex-wrap items-center justify-between gap-4 border-dashed">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-full text-amber-500 shadow-sm">
                    {resendEmailMutation.isPending ? <Loader2 className="animate-spin" size={18}/> : <Send size={18}/>}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest italic">Troca em andamento</p>
                    <p className="text-sm font-bold text-amber-900 leading-tight">Confirmar link em: {store.new_email_pending}</p>
                  </div>
                </div>
                
                <button 
                  disabled={resendEmailMutation.isPending || resendTimer > 0}
                  onClick={() => resendEmailMutation.mutate()}
                  className="bg-amber-500 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-amber-600 transition-all disabled:opacity-50 shadow-lg"
                >
                  {resendTimer > 0 ? `Aguarde ${resendTimer}s` : "Reenviar Confirmação"}
                </button>
              </div>
            )}

            <div className="flex items-center gap-5 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
              <div className="p-4 bg-white rounded-2xl shadow-sm text-indigo-600"><Mail size={24}/></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">{t('label_current_email')}</p>
                <p className="font-bold text-slate-800">{store?.email}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4 italic">{t('label_new_email')}</label>
                <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="novo@email.com" className="w-full p-6 bg-slate-50 rounded-[1.8rem] border-2 border-transparent focus:border-indigo-600 outline-none font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4 italic">Senha atual</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••" className="w-full p-6 bg-slate-50 rounded-[1.8rem] border-2 border-transparent focus:border-indigo-600 outline-none font-bold" />
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button 
                disabled={!newEmail || !currentPassword || updateEmailMutation.isPending} 
                onClick={() => updateEmailMutation.mutate()} 
                className="bg-slate-900 text-white px-12 py-5 rounded-[1.5rem] text-[11px] font-black uppercase hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-20 active:scale-95"
              >
                {updateEmailMutation.isPending ? <Loader2 className="animate-spin" size={18}/> : t('btn_update_email')}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-8 animate-in slide-in-from-right-4">
          <SectionInfo title={t('section_crypto_title')} subtitle={t('section_crypto_subtitle')} />
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-12 space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-4 italic tracking-widest">{t('label_current_password')}</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full p-6 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-indigo-600 outline-none font-bold" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4 italic">{t('label_new_password')}</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-6 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-indigo-600 outline-none font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-4 italic">Repetir Senha</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-6 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-indigo-600 outline-none font-bold" />
              </div>
            </div>
            <div className="flex justify-between items-center pt-6">
              <button 
                onClick={async () => {
                  setIsResetting(true);
                  const { error } = await supabase.auth.resetPasswordForEmail(store?.email || '', {
                    redirectTo: 'https://storelyy.vercel.app/auth/callback',
                  });
                  setIsResetting(false);
                  if (error) notify.error(error.message);
                  else notify.success("E-mail de recuperação enviado!");
                }}
                className="text-[10px] font-black uppercase text-indigo-600 hover:underline flex items-center gap-2"
              >
                {isResetting ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                {t('btn_recovery_email')}
              </button>
              <button disabled={!currentPassword || !newPassword || updatePasswordMutation.isPending} onClick={() => updatePasswordMutation.mutate()} className="bg-slate-900 text-white px-14 py-6 rounded-[2rem] text-[11px] font-black uppercase hover:bg-indigo-600 transition-all shadow-2xl active:scale-95 disabled:opacity-20">
                 {updatePasswordMutation.isPending ? <Loader2 className="animate-spin" size={18}/> : "Atualizar Senha"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}