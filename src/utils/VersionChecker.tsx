import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslate } from '../context/LanguageContext';

interface VersionData {
  version: number;
  packageVersion: string;
}

const KEYS_TO_PRESERVE = [
  'storely_auth_token', 
  'country_code'
];

const BETA_WELCOME_KEY = 'storely_beta_welcome_pending';
const INSTALLED_VERSION_KEY = 'APP_INSTALLED_VERSION';

export default function VersionChecker() {
  const { t } = useTranslate();
  const [isOutdated, setIsOutdated] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [currentVersionData, setCurrentVersionData] = useState<VersionData | null>(null);
  const [newVersionData, setNewVersionData] = useState<VersionData | null>(null);
  const isUpdatingRef = useRef(false);

  const performDeepBrowserCleanup = async (newVersionNumber: number) => {
    try {
      // 1. Preserva apenas os dados essenciais
      const preservedData: Record<string, string> = {};
      KEYS_TO_PRESERVE.forEach((key) => {
        const val = localStorage.getItem(key);
        if (val !== null) preservedData[key] = val;
      });

      // 2. Limpa storages locais
      localStorage.clear();
      sessionStorage.clear();

      // 3. Limpa IndexedDB
      if ('indexedDB' in window) {
        try {
          if (indexedDB.databases) {
            const dbs = await indexedDB.databases();
            await Promise.all(
              dbs.map((db) => {
                if (db.name) {
                  return new Promise((resolve) => {
                    const req = indexedDB.deleteDatabase(db.name!);
                    req.onsuccess = () => resolve(true);
                    req.onerror = () => resolve(false);
                    req.onblocked = () => resolve(false);
                  });
                }
                return Promise.resolve();
              })
            );
          }
        } catch (idbErr) {
          console.warn('Falha ao limpar IndexedDB:', idbErr);
        }
      }

      // 4. Limpa Cookies
      try {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname};`;
        }
      } catch (cookieErr) {
        console.warn('Falha ao limpar cookies:', cookieErr);
      }

      // 5. Limpa Cache Storage
      if ('caches' in window) {
        try {
          const cacheKeys = await caches.keys();
          await Promise.all(cacheKeys.map((key) => caches.delete(key)));
        } catch (cacheErr) {
          console.warn('Falha ao limpar caches:', cacheErr);
        }
      }

      // 6. Desregistra Service Workers
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((reg) => reg.unregister()));
        } catch (swErr) {
          console.warn('Falha ao desregistrar Service Workers:', swErr);
        }
      }

      // 7. Restaura chaves preservadas e marca flags
      Object.entries(preservedData).forEach(([key, val]) => {
        localStorage.setItem(key, val);
      });
      localStorage.setItem(INSTALLED_VERSION_KEY, newVersionNumber.toString());
      localStorage.setItem(BETA_WELCOME_KEY, 'true');
    } catch (error) {
      console.error('Erro na limpeza:', error);
    }
  };

  const executeHardReload = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('v_sync', Date.now().toString());
    window.location.replace(url.toString());
  };

  const checkVersion = useCallback(async (isInitialLoad = false) => {
    if (import.meta.env.DEV || isUpdatingRef.current) return;

    try {
      const res = await fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-store',
      });
      
      if (!res.ok) return;
      
      const serverData: VersionData = await res.json();
      const serverVersionStr = serverData.version.toString();
      const localVersionStr = localStorage.getItem(INSTALLED_VERSION_KEY);

      if (isInitialLoad) {
        // Se a página já foi recarregada diretamente com nova versão (ex: F5)
        if (localVersionStr && localVersionStr !== serverVersionStr) {
          await performDeepBrowserCleanup(serverData.version);
          setShowWelcomeModal(true);
        } else if (!localVersionStr) {
          localStorage.setItem(INSTALLED_VERSION_KEY, serverVersionStr);
        }

        // Se veio de um reload pós-update ou nova versão detectada
        if (localStorage.getItem(BETA_WELCOME_KEY) === 'true') {
          setShowWelcomeModal(true);
        }

        setCurrentVersionData(serverData);
      } else {
        // Verificação periódica ou ao focar na janela: apenas avisa, sem reload automático
        if (currentVersionData && serverData.version !== currentVersionData.version) {
          setNewVersionData(serverData);
          setIsOutdated(true);
        }
      }
    } catch (error) {
      console.error('Falha ao verificar versão:', error);
    }
  }, [currentVersionData]);

  useEffect(() => {
    checkVersion(true);

    let intervalId: NodeJS.Timeout | undefined;
    const CHECK_INTERVAL = 5 * 60 * 1000;

    const startInterval = () => {
      if (!intervalId) {
        intervalId = setInterval(() => checkVersion(false), CHECK_INTERVAL);
      }
    };

    const stopInterval = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion(false);
        startInterval();
      } else {
        stopInterval();
      }
    };

    const handleWindowFocus = () => {
      checkVersion(false);
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
    if (newVersionData && !isUpdatingRef.current) {
      isUpdatingRef.current = true;
      await performDeepBrowserCleanup(newVersionData.version);
      executeHardReload();
    }
  };

  const handleDismissWelcome = () => {
    localStorage.removeItem(BETA_WELCOME_KEY);
    setShowWelcomeModal(false);
  };

  const currentFormattedDate = currentVersionData?.version
    ? new Intl.DateTimeFormat(undefined, { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }).format(new Date(currentVersionData.version))
    : '';

  const newFormattedDate = newVersionData?.version
    ? new Intl.DateTimeFormat(undefined, { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }).format(new Date(newVersionData.version))
    : '';

  // 1. Modal de Boas-Vindas ao Beta (Soft UI)
  if (showWelcomeModal) {
    return (
      <div 
        className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/55"
        style={{ contain: 'strict' }}
      >
        <div 
          className="w-full sm:max-w-md bg-[#f4f5f9] rounded-[24px] p-6 sm:p-7 border border-white/80 text-left shadow-[8px_8px_20px_#d1d5db,-8px_-8px_20px_#ffffff]"
          style={{ contain: 'layout paint' }}
        >
          {/* Header & Badges */}
          <div className="flex items-center justify-between mb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f4f5f9] shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] font-mono font-bold tracking-wider text-slate-700 uppercase">
                {t('beta_badge', { defaultValue: 'Storely Beta' })}
              </span>
            </div>

            {/* Versão atual em execução */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f4f5f9] shadow-[inset_1px_1px_3px_#d1d5db,inset_-1px_-1px_3px_#ffffff] text-[11px] font-mono font-medium text-slate-500">
              <span>v{currentVersionData?.packageVersion || '0.2.4'}</span>
            </div>
          </div>

          <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-2">
            {t('welcome_beta_title', { defaultValue: 'Bem-vindo ao Beta da Storely' })}
          </h3>
          
          <p className="text-sm text-slate-600 leading-relaxed mb-5">
            {t('welcome_beta_desc', { 
              defaultValue: 'Seu ambiente foi atualizado e totalmente otimizado com a versão mais recente. Aproveite as novas ferramentas!' 
            })}
          </p>

          {/* Card com detalhes da versão atual */}
          <div className="p-3.5 rounded-xl bg-[#f4f5f9] shadow-[inset_2px_2px_5px_#d1d5db,inset_-2px_-2px_5px_#ffffff] mb-6 space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-slate-500">
              <span>{t('current_version_label', { defaultValue: 'Versão em execução:' })}</span>
              <span className="font-semibold text-slate-700">v{currentVersionData?.packageVersion || '0.2.4'}</span>
            </div>
            {currentFormattedDate && (
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>{t('build_date_label', { defaultValue: 'Compilação:' })}</span>
                <span>{currentFormattedDate}</span>
              </div>
            )}
          </div>

          {/* Botão Ação */}
          <button
            onClick={handleDismissWelcome}
            className="w-full bg-[#f4f5f9] hover:bg-slate-100 active:shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff] shadow-[4px_4px_10px_#d1d5db,-4px_-4px_10px_#ffffff] text-slate-800 text-sm font-semibold py-3.5 px-5 rounded-xl border border-white/60 flex items-center justify-between cursor-pointer"
          >
            <span>{t('welcome_beta_button', { defaultValue: 'Começar a Explorar' })}</span>
            <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // 2. Modal de Nova Versão Detectada
  if (!isOutdated) return null;

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/55"
      style={{ contain: 'strict' }}
    >
      <div 
        className="w-full sm:max-w-md bg-[#f4f5f9] rounded-[24px] p-6 sm:p-7 border border-white/80 text-left shadow-[8px_8px_20px_#d1d5db,-8px_-8px_20px_#ffffff]"
        style={{ contain: 'layout paint' }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f4f5f9] shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-[11px] font-mono font-bold tracking-wider text-slate-700 uppercase">
              {t('version_update_badge', { defaultValue: 'Nova Versão Disponível' })}
            </span>
          </div>

          <span className="text-xs font-mono font-medium text-slate-500 px-2.5 py-1 rounded-lg bg-[#f4f5f9] shadow-[inset_1px_1px_3px_#d1d5db,inset_-1px_-1px_3px_#ffffff]">
            v{newVersionData?.packageVersion}
          </span>
        </div>

        <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-2">
          {t('version_update_title', { defaultValue: 'Atualização Pronta' })}
        </h3>
        
        <p className="text-sm text-slate-600 leading-relaxed mb-5">
          {t('version_update_desc', { 
            defaultValue: 'Novas melhorias e correções foram aplicadas. Atualize para continuar.' 
          })}
        </p>

        {/* Comparativo de versões */}
        <div className="p-3.5 rounded-xl bg-[#f4f5f9] shadow-[inset_2px_2px_5px_#d1d5db,inset_-2px_-2px_5px_#ffffff] mb-6 space-y-1.5 text-xs font-mono">
          <div className="flex justify-between text-slate-500">
            <span>{t('current_version_label', { defaultValue: 'Versão em execução:' })}</span>
            <span className="text-slate-600">v{currentVersionData?.packageVersion || '0.2.4'}</span>
          </div>
          <div className="flex justify-between text-slate-700 font-semibold">
            <span>{t('new_version_label', { defaultValue: 'Nova versão:' })}</span>
            <span className="text-emerald-600">v{newVersionData?.packageVersion}</span>
          </div>
          {newFormattedDate && (
            <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
              <span>{t('version_update_released', { defaultValue: 'Lançado em' })}</span>
              <span>{newFormattedDate}</span>
            </div>
          )}
        </div>

        {/* Botão de Ação Manual */}
        <button
          onClick={handleUpdateClick}
          className="w-full bg-[#1e293b] hover:bg-[#0f172a] active:scale-[0.99] text-white text-sm font-semibold py-3.5 px-5 rounded-xl shadow-[4px_4px_10px_#d1d5db] flex items-center justify-between cursor-pointer"
        >
          <span>{t('version_update_button', { defaultValue: 'Atualizar Agora' })}</span>
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}