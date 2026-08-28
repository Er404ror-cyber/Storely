import { useEffect, useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Loader2, 
  ShieldCheck, 
  Store, 
  UserCheck, 
  ExternalLink,
  Coins,
  CheckCircle2,
  Sparkles,
  Settings2
} from 'lucide-react';
import { useTranslate } from '../context/LanguageContext';
import { StoreTab } from '../components/settings/tabs/StoreTab';
import { AccountTab } from '../components/settings/tabs/AccountTab';
import { SecurityTab } from '../components/settings/tabs/SecurityTab';
import { FALLBACK_STORE } from '../utils/constants';
import type { AdminStore } from '../types/admin';

export function AdminSettings() {
  const { t } = useTranslate();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Extração Memoizada de Parâmetros
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

  // 3. Query Otimizada com Proteção de Rede
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
    staleTime: 1000 * 60 * 50,
    gcTime: 1000 * 60 * 30,
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false, 
  });

  const handleTabChange = useCallback((tab: 'store' | 'account' | 'security') => {
    setActiveTab(tab);
  }, []);

  const tabs = useMemo(() => [
    {
      id: 'store' as const,
      label: t('tab_store') || 'Loja',
      tag: t('tab_store_tag') || 'Visual & Marca',
      icon: Store,
      color: 'text-[#8862DF]',
      bgActive: 'bg-[#EFEAF6]',
    },
    {
      id: 'account' as const,
      label: t('tab_account') || 'Conta',
      tag: t('tab_account_tag') || 'Dados & Email',
      icon: UserCheck,
      color: 'text-[#3B82F6]',
      bgActive: 'bg-[#EBF3FF]',
    },
    {
      id: 'security' as const,
      label: t('tab_security') || 'Segurança',
      tag: t('tab_security_tag') || 'Acesso & Senha',
      icon: ShieldCheck,
      color: 'text-[#10B981]',
      bgActive: 'bg-[#ECFDF5]',
    },
  ], [t]);

  if (isLoading) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-[#EFEAF6] border-2 border-white shadow-sm flex items-center justify-center mb-3">
          <Loader2 className="animate-spin text-[#9175E6]" size={24} />
        </div>
        <span className="text-xs font-black uppercase tracking-wider text-[#867B9E]">
          {t('loading_session') || 'A carregar definições...'}
        </span>
      </div>
    );
  }

  const currentLogo = store?.logo_url || FALLBACK_STORE;
  const storeUrl = store?.slug ? `${window.location.origin}/${store.slug}` : '';

  return (
    <div className="w-full min-h-screen bg-transparent pb-20">
      <div className="max-w-5xl mx-auto px-0 sm:px-6 w-full space-y-4 pt-0 sm:pt-6">
        
        {/* HERO CARD SOFT UI */}
        <section 
          className="w-full rounded-b-[2.2rem] sm:rounded-[2.4rem] bg-gradient-to-r from-[#DFD5F5] to-[#EBE4F9] p-5 sm:p-7 border-b-2 sm:border-2 border-white shadow-sm relative overflow-hidden"
          style={{ contain: 'paint' }}
        >
          {/* LOGO DE FUNDO ESTILIZADO (SEM O QUADRADO) */}
          <div className="absolute right-[-15px] sm:right-6 -bottom-10 sm:-bottom-12 pointer-events-none select-none z-0 opacity-20 sm:opacity-25 overflow-hidden">
            <img
              src={currentLogo}
              alt=""
              aria-hidden="true"
              className="w-48 h-48 sm:w-60 sm:h-60 object-contain drop-shadow-md filter  rotate-[-6deg]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = FALLBACK_STORE;
              }}
            />
          </div>

          {/* CABEÇALHO LIMPO E DIRETO */}
          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/80  text-[#8862DF] text-[10px] font-black uppercase tracking-wider mb-1.5 shadow-xs">
                <Sparkles size={11} fill="currentColor" />
                <span>{t('settings_badge') || 'Controlo & Sistema'}</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/80  flex items-center justify-center text-[#8862DF] shadow-xs shrink-0">
                  <Settings2 size={18} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#2D263B] truncate tracking-tight">
                  {t('dashboard_quick_settings_title')}
                </h1>
              </div>
              
              {/* BADGES DE STATUS */}
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1.5 bg-white/80  px-2.5 py-1 rounded-lg text-[11px] font-black text-[#5C5370] shadow-xs">
                  <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                  <span className="truncate max-w-[170px] sm:max-w-none">{store?.slug ? `/${store.slug}` : 'Online'}</span>
                </span>

                {Boolean(store?.currency) && (
                  <span className="hidden sm:inline-flex items-center gap-1 bg-white/80  px-2.5 py-1 rounded-lg text-[11px] font-black text-[#5C5370] shadow-xs">
                    <Coins size={12} className="text-[#8862DF]" />
                    <span>{store?.currency}</span>
                  </span>
                )}
              </div>
            </div>

            {/* BOTÃO VER LOJA */}
            {storeUrl && (
              <button
                type="button"
                onClick={() => window.open(storeUrl, '_blank')}
                className="inline-flex items-center justify-center gap-2 p-3 sm:px-4 sm:py-2.5 rounded-2xl sm:rounded-full bg-white/90  text-[#8862DF] hover:bg-[#8862DF] hover:text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all duration-200 active:scale-95 shrink-0 border border-white"
                title={t('btn_view_store') || 'Ver Loja'}
              >
                <span className="hidden sm:inline">{t('btn_view_store') || 'Ver Loja'}</span>
                <ExternalLink size={16} strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* ABAS DE NAVEGAÇÃO */}
          <nav className="grid grid-cols-3 gap-2 sm:gap-3 p-1.5 bg-white/70  rounded-2xl sm:rounded-[1.4rem] border border-white mt-5 sm:mt-6 relative z-10 shadow-xs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1.5 sm:gap-3 py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl transition-all duration-200 select-none active:scale-[0.98] ${
                    isActive
                      ? 'bg-white shadow-sm border border-white scale-[1.01]'
                      : 'bg-transparent text-[#867B9E] hover:bg-white/40'
                  }`}
                >
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors ${
                    isActive ? `${tab.bgActive} ${tab.color}` : 'bg-white/90 text-[#867B9E]'
                  }`}>
                    <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                  </div>

                  <div className="w-full sm:w-auto text-center sm:text-left">
                    <span className={`text-[11px] sm:text-xs uppercase tracking-wider block whitespace-nowrap leading-tight ${
                      isActive ? 'font-black text-[#2D263B]' : 'font-bold text-[#867B9E]'
                    }`}>
                      {tab.label}
                    </span>
                    <span className="hidden sm:block text-[9px] font-bold text-[#A59BBF] truncate mt-0.5">
                      {tab.tag}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </section>

        {/* CONTEÚDO DAS ABAS */}
        <main 
          className="relative w-full px-3 sm:px-0"
          style={{ contentVisibility: 'auto', contain: 'layout paint' }}
        >
          <div className="animate-in fade-in duration-200 fill-mode-both">
            {activeTab === 'store' && <StoreTab store={store as any} />}
            {activeTab === 'account' && <AccountTab store={store as any} isConfirmed={urlParams.isEmailConfirm} />}
            {activeTab === 'security' && <SecurityTab store={store as any} isRecoveryMode={urlParams.isRecovery} />}
          </div>
        </main>

      </div>
    </div>
  );
}