import { useEffect, useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, Shield, Store, User } from 'lucide-react';
import { useTranslate } from '../context/LanguageContext';
import { TabItem } from './settings/AdminSettingsComponents';
import { StoreTab } from './settings/tabs/StoreTab';
import { AccountTab } from './settings/tabs/AccountTab';
import { SecurityTab } from './settings/tabs/SecurityTab';
import type { AdminStore } from '../types/admin';

export function AdminSettings() {
  const { t } = useTranslate();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Extração de Parâmetros com Memoização (Evita processamento de string em cada render)
  const urlParams = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      isRecovery: params.get('reset') === 'true',
      isEmailConfirm: params.get('email_updated') === 'true',
      tabParam: params.get('tab') as 'store' | 'account' | 'security' | null,
    };
  }, [location.search]);

  const [activeTab, setActiveTab] = useState<'store' | 'account' | 'security'>(
    urlParams.tabParam || (urlParams.isRecovery ? 'security' : (urlParams.isEmailConfirm ? 'account' : 'store'))
  );

  // 2. Limpeza de URL Inteligente (Replace não gera nova entrada no histórico)
  useEffect(() => {
    if (urlParams.isRecovery || urlParams.isEmailConfirm) {
      queryClient.invalidateQueries({ queryKey: ["admin-full-settings"] });
      const timer = setTimeout(() => {
        navigate('/admin/configuracoes', { replace: true });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [urlParams.isRecovery, urlParams.isEmailConfirm, queryClient, navigate]);

 

  const { data: store, isLoading } = useQuery<AdminStore | null>({
    queryKey: ["admin-full-settings"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
  
      if (!user) throw new Error(t("error_unauthorized"));
  
      const { data, error } = await supabase
        .from("stores")
        .select("id, name, slug, logo_url, settings, owner_id, updated_at_name, currency")
        .eq("owner_id", user.id)
        .single();
  
      if (error) throw error;
  
      return {
        ...data,
        email: user.email ?? null,
        new_email_pending: user.new_email ?? null,
      };
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    retry: 1,
  });
  // Handler de troca de aba otimizado
  const handleTabChange = useCallback((tab: 'store' | 'account' | 'security') => {
    setActiveTab(tab);
  }, []);

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50">
      <Loader2 className="animate-spin text-indigo-600 mb-4" size={42} />
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
        {t('loading_session')}
      </span>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4 sm:px-8 antialiased">
      {/* Header com tipografia otimizada para legibilidade */}
      <header className="mb-10 pt-10 space-y-1">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-slate-900 uppercase italic">
          {t('settings_title')}{" "}
          <span className="text-indigo-600 block sm:inline-block transform-gpu">
            {t('settings_highlight')}
          </span>
        </h1>
        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-[0.25em] italic">
          {t('settings_subtitle')}
        </p>
      </header>

      <nav className="flex mb-12 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 p-1.5 bg-slate-100/80  rounded-4xl border border-slate-200/40 shadow-sm min-w-max">
          <TabItem 
            active={activeTab === 'store'} 
            onClick={() => handleTabChange('store')} 
            icon={<Store size={15}/>} 
            label={t('tab_store')} 
          />
          <TabItem 
            active={activeTab === 'account'} 
            onClick={() => handleTabChange('account')} 
            icon={<User size={15}/>} 
            label={t('tab_account')} 
          />
          <TabItem 
            active={activeTab === 'security'} 
            onClick={() => handleTabChange('security')} 
            icon={<Shield size={15}/>} 
            label={t('tab_security')} 
          />
        </div>
      </nav>


      {/* Container de Conteúdo com Hardware Acceleration */}
      <main className="relative min-h-[400px]">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both ">
          {activeTab === 'store' && <StoreTab store={store ?? null} />}
          {activeTab === 'account' && <AccountTab store={store ?? null} isConfirmed={urlParams.isEmailConfirm} />}
          {activeTab === 'security' && <SecurityTab store={store ?? null} isRecoveryMode={urlParams.isRecovery} />}
        </div>
      </main>
    </div>
  );
}