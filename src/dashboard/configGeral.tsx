import { useEffect, useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, Shield, Store, User } from 'lucide-react';
import { useTranslate } from '../context/LanguageContext';
import { TabItem } from '../components/settings/AdminSettingsComponents';
import { StoreTab } from '../components/settings/tabs/StoreTab';
import { AccountTab } from '../components/settings/tabs/AccountTab';
import { SecurityTab } from '../components/settings/tabs/SecurityTab';
import type { AdminStore } from '../types/admin';

export function AdminSettings() {
  const { t } = useTranslate();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Extração de Parâmetros com Memoização (Baixo uso de CPU)
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

  // 2. Limpeza de URL Inteligente
  useEffect(() => {
    if (urlParams.isRecovery || urlParams.isEmailConfirm) {
      queryClient.invalidateQueries({ queryKey: ["admin-full-settings"] });
      const timer = setTimeout(() => {
        navigate('/admin/configuracoes', { replace: true });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [urlParams.isRecovery, urlParams.isEmailConfirm, queryClient, navigate]);

  // 3. Query Super Otimizada (Protege o plano Free do Supabase)
  const { data: store, isLoading } = useQuery<AdminStore | null>({
    queryKey: ["admin-full-settings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(t("error_unauthorized"));
  
      const { data, error } = await supabase
        .from("stores")
        .select("id, name, slug, logo_url, settings, owner_id, updated_at_name, currency, description, whatsapp_number")
        .eq("owner_id", user.id)
        .single();
  
      if (error) throw error;
  
      return {
        ...data,
        email: user.email ?? null,
        new_email_pending: user.new_email ?? null,
      } as any;
    },
    staleTime: 1000 * 60 * 50, // 10 minutos sem refetch
    gcTime: 1000 * 60 * 30,
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false, 
  });

  // Handler Estável para evitar Re-renders em cadeia
  const handleTabChange = useCallback((tab: 'store' | 'account' | 'security') => {
    setActiveTab(tab);
  }, []);

  if (isLoading) return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-50/50">
      <Loader2 className="animate-spin text-indigo-600 mb-4" size={42} />
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
        {t('loading_session')}
      </span>
    </div>
  );

  return (
    // FIX MOBILE: overflow-x-hidden e max-w-[100vw] bloqueiam totalmente a margem preta lateral
    <div className="w-full  min-h-screen bg-transparent">
      <div className="max-w-5xl mx-auto pb-20 px-4 sm:px-8 antialiased w-full">
        <header className="mb-8 pt-8 sm:mb-10 sm:pt-10 space-y-1">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-slate-900 uppercase italic leading-tight">
            {t('settings_title')}{" "}
            <span className="text-indigo-600 block sm:inline-block transform-gpu">
              {t('settings_highlight')}
            </span>
          </h1>
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-[0.25em] italic mt-1">
            {t('settings_subtitle')}
          </p>
        </header>

        {/* FIX SCROLL: Removido -mx-4, adicionado padding inteligente para mobile */}
        <nav className="flex mb-10   w-full overflow-x-auto no-scrollbar pb-2">
          <div className="flex gap-2 p-1 sm:p-1.5 bg-slate-100/80 rounded-[2rem] border border-slate-200/40 shadow-sm min-w-max transform-gpu will-change-transform">
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

        {/* OTIMIZAÇÃO BATERIA/GPU: contentVisibility e will-change para trocas de tab sem engasgos */}
        <main 
          className="relative min-h-[500px]" 
          style={{ contentVisibility: 'auto', contain: 'layout paint' }}
        >
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both transform-gpu will-change-[opacity,transform]">
            {activeTab === 'store' && <StoreTab store={store as any} />}
            {activeTab === 'account' && <AccountTab store={store as any} isConfirmed={urlParams.isEmailConfirm} />}
            {activeTab === 'security' && <SecurityTab store={store as any} isRecoveryMode={urlParams.isRecovery} />}
          </div>
        </main>
      </div>
    </div>
  );
}