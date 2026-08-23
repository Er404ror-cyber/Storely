import { useState, useEffect, useCallback } from 'react';
import { useTranslate } from '../context/LanguageContext';

interface VersionData {
  version: number;
  packageVersion: string;
}

const KEYS_TO_PRESERVE = [
  'storely_auth_token', 
  'country_code'        
];

export default function VersionChecker() {
  const { t } = useTranslate();
  const [isOutdated, setIsOutdated] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<number | null>(null);
  const [newVersionData, setNewVersionData] = useState<VersionData | null>(null);

  const performFullCleanup = async (newVersionNumber: number) => {
    try {
      const preservedData: Record<string, string> = {};
      KEYS_TO_PRESERVE.forEach(key => {
        const val = localStorage.getItem(key);
        if (val) preservedData[key] = val;
      });

      // Limpeza completa de dados locais, sessão, cache e assets antigos
      localStorage.clear();
      sessionStorage.clear();

      // Restaura apenas o login e configurações críticas
      Object.entries(preservedData).forEach(([key, val]) => {
        localStorage.setItem(key, val);
      });
      localStorage.setItem('APP_INSTALLED_VERSION', newVersionNumber.toString());

      // Remove todos os caches armazenados (imagens, assets, dados offline)
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(key => caches.delete(key)));
      }

      // Remove service workers antigos para garantir que a nova versão assuma o controle
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
    } catch (error) {
      console.error('Erro na limpeza de versão:', error);
    }
  };

  const checkVersion = useCallback(async (isInitialLoad = false) => {
    if (import.meta.env.DEV) return;

    try {
      const res = await fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-store',
      });
      
      if (!res.ok) return;
      
      const data: VersionData = await res.json();
      const serverVersionStr = data.version.toString();

      if (isInitialLoad) {
        const localVersionStr = localStorage.getItem('APP_INSTALLED_VERSION');

        // Se detetar que a versão do servidor é mais recente que a local, executa a limpeza e atualiza
        if (localVersionStr && localVersionStr !== serverVersionStr) {
          await performFullCleanup(data.version);
          window.location.reload(); 
          return; 
        }

        // Se for a primeira vez ou já estiver atualizado, guarda a versão atual
        localStorage.setItem('APP_INSTALLED_VERSION', serverVersionStr);
        setCurrentVersion(data.version);
        
      } else if (currentVersion && data.version !== currentVersion) {
        setNewVersionData(data);
        setIsOutdated(true);
      }
    } catch (error) {
      console.error('Falha ao verificar versão:', error);
    }
  }, [currentVersion]);

  useEffect(() => {
    checkVersion(true);

    let intervalId: NodeJS.Timeout;
    const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos

    const startInterval = () => {
      if (!intervalId) {
        intervalId = setInterval(() => checkVersion(), CHECK_INTERVAL);
      }
    };

    const stopInterval = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = undefined as unknown as NodeJS.Timeout;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
        startInterval();
      } else {
        stopInterval();
      }
    };

    const handleWindowFocus = () => {
      checkVersion();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    if (document.visibilityState === 'visible') {
      startInterval();
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      stopInterval();
    };
  }, [checkVersion]);

  const handleUpdateClick = async () => {
    if (newVersionData) {
      await performFullCleanup(newVersionData.version);
      window.location.reload();
    }
  };

  if (!isOutdated) return null;

  const formattedDate = newVersionData?.version
    ? new Intl.DateTimeFormat(undefined, { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }).format(new Date(newVersionData.version))
    : '';

  return (
    <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/10 backdrop-blur-[2px]">
      
      <div className="w-full sm:max-w-md bg-white/90 sm:bg-white/95 rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-white/40 text-left relative overflow-hidden transition-all duration-300">
        
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-indigo-500/20 via-fuchsia-500/20 to-transparent rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center justify-between mb-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/[0.03] border border-black/[0.05]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
            </span>
            <span className="text-[11px] font-mono font-semibold tracking-wider text-gray-800 uppercase">
              {t('version_update_badge') || 'Nova Versão Disponível'}
            </span>
          </div>

          {newVersionData && (
            <span className="text-xs font-mono font-medium text-gray-400 bg-gray-100/80 px-2.5 py-1 rounded-lg">
              v{newVersionData.packageVersion}
            </span>
          )}
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mb-2">
          {t('version_update_title', { defaultValue: 'Atualização Pronta' })}
        </h3>
        
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          {t('version_update_desc', { defaultValue: 'Novas melhorias e correções foram aplicadas. Atualize para continuar.' })}
        </p>

        <div className="space-y-4">
          {formattedDate && (
            <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
              <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{t('version_update_released') || 'Lançado em'} {formattedDate}</span>
            </div>
          )}

          <button
            onClick={handleUpdateClick}
            className="w-full relative group overflow-hidden bg-gray-900 hover:bg-black active:scale-[0.98] text-white text-sm font-semibold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-between shadow-[0_10px_20px_rgba(0,0,0,0.1)]"
          >
            <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[400%] transition-transform duration-1000"></div>

            <span className="relative z-10 tracking-wide">{t('version_update_button', { defaultValue: 'Atualizar Agora' })}</span>
            
            <div className="relative z-10 w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}