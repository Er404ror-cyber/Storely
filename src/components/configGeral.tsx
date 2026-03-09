import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, Shield, Store, User } from 'lucide-react';
import { useTranslate } from '../context/LanguageContext';
import { TabItem } from './settings/AdminSettingsComponents';
import { StoreTab } from './settings/tabs/StoreTab';
import { AccountTab } from './settings/tabs/AccountTab';
import { SecurityTab } from './settings/tabs/SecurityTab';

// Import das abas separadas


export function AdminSettings() {
  const { t } = useTranslate();
  const queryClient = useQueryClient();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const isRecoveryMode = queryParams.get('reset') === 'true';
  const isEmailConfirm = window.location.href.includes('type=email_change') || queryParams.get('email_updated') === 'true';

  const [activeTab, setActiveTab] = useState<'store' | 'account' | 'security'>(
    isRecoveryMode ? 'security' : (isEmailConfirm ? 'account' : 'store')
  );

  // Invalida o cache se o usuário acabou de confirmar e-mail ou senha via link
  useEffect(() => {
    if (isRecoveryMode || isEmailConfirm) {
      queryClient.invalidateQueries({ queryKey: ["admin-full-settings"] });
    }
  }, [isRecoveryMode, isEmailConfirm, queryClient]);

  const { data: store, isLoading } = useQuery({
    queryKey: ["admin-full-settings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");
      const { data, error } = await supabase.from("stores").select("*").eq("owner_id", user.id).single();
      if (error) throw error;
      return { ...data, email: user.email, new_email_pending: user.new_email };
    }
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

      <div className="transition-all duration-300">
        {activeTab === 'store' && <StoreTab store={store} />}
        {activeTab === 'account' && <AccountTab store={store} isConfirmed={isEmailConfirm} />}
        {activeTab === 'security' && <SecurityTab store={store} isRecoveryMode={isRecoveryMode} />}
      </div>
    </div>
  );
}