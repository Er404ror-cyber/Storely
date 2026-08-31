import { useState, useEffect, useCallback } from 'react';
import { useTranslate } from '../context/LanguageContext';

interface VersionData {
  version: number;
  packageVersion: string;
}

// Chaves essenciais que NUNCA devem ser apagadas numa atualização rotineira
const KEYS_TO_PRESERVE = [
  'storely_auth_token', 
  'country_code'
];

const INSTALLED_VERSION_KEY = 'APP_INSTALLED_VERSION';
const BETA_WELCOME_KEY = 'storely_beta_welcome_pending';

export default function VersionChecker() {
  const { t } = useTranslate();

  const [isOutdated, setIsOutdated] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [currentVersionData, setCurrentVersionData] = useState<VersionData | null>(null);
  const [newVersionData, setNewVersionData] = useState<VersionData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Executa uma limpeza segura mantendo os dados críticos do usuário
  const performSafeCleanup = async (newVersionNumber: number) => {
    try {
      const preservedData: Record<string, string> = {};
      KEYS_TO_PRESERVE.forEach((key) => {
        const val = localStorage.getItem(key);
        if (val !== null) preservedData[key] = val;
      });

      // Limpeza controlada do armazenamento local
      localStorage.clear();
      sessionStorage.clear();

      // Restaura dados preservados
      Object.entries(preservedData).forEach(([key, val]) => {
        localStorage.setItem(key, val);
      });

      localStorage.setItem(INSTALLED_VERSION_KEY, newVersionNumber.toString());
      localStorage.setItem(BETA_WELCOME_KEY, 'true');

      // Limpeza segura de cache se disponível
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      }
    } catch (error) {
      console.error('Erro durante a limpeza segura de versão:', error);
    }
  };

  const checkVersion = useCallback(async () => {
    if (import.meta.env.DEV) return;

    try {
      const res = await fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-store',
      });
      
      if (!res.ok) return;
      
      const serverData: VersionData = await res.json();
      const serverVersionStr = serverData.version.toString();
      const localVersionStr = localStorage.getItem(INSTALLED_VERSION_KEY);

      // Primeira execução ou app recém-instalado no navegador
      if (!localVersionStr) {
        localStorage.setItem(INSTALLED_VERSION_KEY, serverVersionStr);
        setCurrentVersionData(serverData);
        return;
      }

      // Se a versão do servidor for diferente da armazenada localmente
      if (localVersionStr !== serverVersionStr) {
        // Verifica se já passou pelo fluxo de boas-vindas pendente
        if (localStorage.getItem(BETA_WELCOME_KEY) === 'true') {
          setShowWelcomeModal(true);
        } else {
          // Dispara atualização controlada
          await performSafeCleanup(serverData.version);
          setNewVersionData(serverData);
          setIsOutdated(true);
        }
      } else {
        setCurrentVersionData(serverData);
        if (localStorage.getItem(BETA_WELCOME_KEY) === 'true') {
          setShowWelcomeModal(true);
        }
      }
    } catch (error) {
      console.warn('Não foi possível verificar a versão atual:', error);
    }
  }, []);

  useEffect(() => {
    checkVersion();

    // Intervalo de verificação em segundo plano (a cada 10 minutos)
    const CHECK_INTERVAL = 10 * 60 * 1000;
    const intervalId = setInterval(checkVersion, CHECK_INTERVAL);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkVersion]);

  // Recarga limpa da página com suporte a cache busting
  const handleUpdateClick = () => {
    setIsUpdating(true);
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  const handleDismissWelcome = () => {
    localStorage.removeItem(BETA_WELCOME_KEY);
    setShowWelcomeModal(false);
  };

  const formattedDate = (versionNum?: number) => {
    if (!versionNum) return '';
    try {
      return new Intl.DateTimeFormat(undefined, { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }).format(new Date(versionNum));
    } catch {
      return '';
    }
  };

  // 1. Modal de Boas-Vindas Pós-Atualização
  if (showWelcomeModal) {
    return (
      <div 
        className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-4 sm:p-6 bg-slate-950/60 animate-in fade-in duration-200"
        onClick={handleDismissWelcome}
      >
        <div 
          className="relative w-full sm:max-w-md bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 text-left shadow-2xl shadow-slate-900/20 overflow-hidden animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-emerald-500/10 rounded-full pointer-events-none" />

          <div className="flex items-center justify-between mb-5 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-800 uppercase">
                {t('beta_badge', { defaultValue: 'Atualizado' })}
              </span>
            </div>

            <button
              onClick={handleDismissWelcome}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              title="Fechar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2 relative z-10">
            {t('welcome_beta_title', { defaultValue: 'Aplicativo Atualizado!' })}
          </h3>
          
          <p className="text-sm text-slate-600 leading-relaxed mb-5 relative z-10">
            {t('welcome_beta_desc', { 
              defaultValue: 'O seu sistema foi atualizado com sucesso para a versão mais recente.' 
            })}
          </p>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 mb-6 space-y-2 relative z-10">
            <div className="flex justify-between items-center text-xs font-mono text-slate-600">
              <span>{t('current_version_label', { defaultValue: 'Versão em execução:' })}</span>
              <span className="font-bold text-slate-800 px-2 py-0.5 rounded-md bg-white border border-slate-200/60 shadow-xs">
                v{currentVersionData?.packageVersion || '0.2.4'}
              </span>
            </div>
            {currentVersionData?.version && (
              <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 pt-1.5 border-t border-slate-200/50">
                <span>{t('build_date_label', { defaultValue: 'Compilação:' })}</span>
                <span className="font-medium text-slate-500">{formattedDate(currentVersionData.version)}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleDismissWelcome}
            className="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-sm font-semibold py-3.5 px-5 rounded-2xl shadow-lg shadow-slate-900/15 flex items-center justify-between transition-all cursor-pointer relative z-10"
          >
            <span>{t('welcome_beta_button', { defaultValue: 'Continuar' })}</span>
            <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // 2. Modal Bloqueante de Nova Versão Detectada
  if (!isOutdated) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-4 sm:p-6 bg-slate-950/70 animate-in fade-in duration-200">
      <div className="relative w-full sm:max-w-md bg-white rounded-3xl p-6 sm:p-7 border border-amber-100 text-left shadow-2xl shadow-slate-950/40 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 bg-amber-500/15 rounded-full pointer-events-none" />

        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-amber-800 uppercase">
              {t('version_update_badge', { defaultValue: 'Nova Versão' })}
            </span>
          </div>

          <span className="text-xs font-mono font-bold text-amber-700 px-2.5 py-1 rounded-lg bg-amber-50/80 border border-amber-200/60">
            v{newVersionData?.packageVersion}
          </span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2 relative z-10">
          {t('version_update_title', { defaultValue: 'Atualização Disponível' })}
        </h3>
        
        <p className="text-sm text-slate-600 leading-relaxed mb-5 relative z-10">
          {t('version_update_desc', { 
            defaultValue: 'Uma nova versão do aplicativo está pronta. Clique abaixo para aplicar as melhorias.' 
          })}
        </p>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-6 space-y-2.5 text-xs font-mono relative z-10">
          <div className="flex justify-between items-center text-slate-500">
            <span>{t('current_version_label', { defaultValue: 'Versão em execução:' })}</span>
            <span className="text-slate-700 font-semibold">v{currentVersionData?.packageVersion || '0.2.4'}</span>
          </div>
          <div className="flex justify-between items-center text-slate-700">
            <span className="font-semibold">{t('new_version_label', { defaultValue: 'Nova versão:' })}</span>
            <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              v{newVersionData?.packageVersion}
            </span>
          </div>
          {newVersionData?.version && (
            <div className="flex justify-between items-center text-[11px] text-slate-400 pt-2 border-t border-slate-200/60">
              <span>{t('version_update_released', { defaultValue: 'Lançado em' })}</span>
              <span className="text-slate-500 font-medium">{formattedDate(newVersionData.version)}</span>
            </div>
          )}
        </div>

        <button
          onClick={handleUpdateClick}
          disabled={isUpdating}
          className="w-full bg-amber-600 hover:bg-amber-500 active:scale-[0.99] disabled:opacity-75 text-white text-sm font-semibold py-3.5 px-5 rounded-2xl shadow-lg shadow-amber-600/25 flex items-center justify-between transition-all cursor-pointer relative z-10"
        >
          <span>
            {isUpdating 
              ? (t('version_updating_loading', { defaultValue: 'A atualizar...' }))
              : (t('version_update_button', { defaultValue: 'Atualizar Agora' }))}
          </span>
          {isUpdating ? (
            <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-amber-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}