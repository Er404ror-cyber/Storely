import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const navigate = useNavigate();
  const location = useLocation();

  const [isOutdated, setIsOutdated] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [currentVersionData, setCurrentVersionData] = useState<VersionData | null>(null);
  const [newVersionData, setNewVersionData] = useState<VersionData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const isUpdatingRef = useRef(false);

  const performDeepBrowserCleanup = async (newVersionNumber: number) => {
    try {
      // 1. Preserva dados essenciais
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

      // 7. Restaura chaves preservadas e atualiza flag de versão
      Object.entries(preservedData).forEach(([key, val]) => {
        localStorage.setItem(key, val);
      });
      localStorage.setItem(INSTALLED_VERSION_KEY, newVersionNumber.toString());
      localStorage.setItem(BETA_WELCOME_KEY, 'true');
    } catch (error) {
      console.error('Erro na limpeza:', error);
    }
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
        // DETETA QUE JÁ ENTROU NA NOVA VERSÃO
        if (localVersionStr && localVersionStr !== serverVersionStr) {
          isUpdatingRef.current = true;
          
          // Executa a limpeza profunda agora que os novos assets carregaram
          await performDeepBrowserCleanup(serverData.version);

          // Navega via React Router DOM para '/' caso esteja noutra rota
          if (location.pathname !== '/') {
            navigate('/', { replace: true });
          }
          
          setShowWelcomeModal(true);
        } else if (!localVersionStr) {
          localStorage.setItem(INSTALLED_VERSION_KEY, serverVersionStr);
        }

        if (localStorage.getItem(BETA_WELCOME_KEY) === 'true') {
          setShowWelcomeModal(true);
        }

        setCurrentVersionData(serverData);
      } else {
        // NA VERSÃO ANTIGA: Mostra apenas o aviso
        const currentVersionNumber = currentVersionData?.version || (localVersionStr ? Number(localVersionStr) : null);
        
        if (currentVersionNumber && serverData.version !== currentVersionNumber) {
          setNewVersionData(serverData);
          setIsOutdated(true);
        }
      }
    } catch (error) {
      console.error('Falha ao verificar versão:', error);
    }
  }, [currentVersionData, location.pathname, navigate]);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showWelcomeModal) {
        handleDismissWelcome();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showWelcomeModal]);

  // Apenas dá reload simples na página para carregar o bundle da nova versão
  const handleUpdateClick = () => {
    if (!isUpdatingRef.current) {
      isUpdatingRef.current = true;
      setIsUpdating(true);
      window.location.reload();
    }
  };

  const handleDismissWelcome = () => {
    localStorage.removeItem(BETA_WELCOME_KEY);
    setShowWelcomeModal(false);
  };

  const currentFormattedDate = currentVersionData?.version
    ? new Intl.DateTimeFormat(undefined, { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }).format(new Date(currentVersionData.version))
    : '';

  const newFormattedDate = newVersionData?.version
    ? new Intl.DateTimeFormat(undefined, { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }).format(new Date(newVersionData.version))
    : '';

  // 1. Modal de Boas-Vindas (Renderiza após a limpeza e navegação)
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
                {t('beta_badge', { defaultValue: 'Storely Beta' })}
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
            {t('welcome_beta_title', { defaultValue: 'Bem-vindo ao Beta da Storely' })}
          </h3>
          
          <p className="text-sm text-slate-600 leading-relaxed mb-5 relative z-10">
            {t('welcome_beta_desc', { 
              defaultValue: 'Seu ambiente foi atualizado e totalmente otimizado com a versão mais recente. Aproveite as novidades!' 
            })}
          </p>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 mb-6 space-y-2 relative z-10">
            <div className="flex justify-between items-center text-xs font-mono text-slate-600">
              <span>{t('current_version_label', { defaultValue: 'Versão em execução:' })}</span>
              <span className="font-bold text-slate-800 px-2 py-0.5 rounded-md bg-white border border-slate-200/60 shadow-xs">
                v{currentVersionData?.packageVersion || '0.2.4'}
              </span>
            </div>
            {currentFormattedDate && (
              <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 pt-1.5 border-t border-slate-200/50">
                <span>{t('build_date_label', { defaultValue: 'Compilação:' })}</span>
                <span className="font-medium text-slate-500">{currentFormattedDate}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleDismissWelcome}
            className="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-sm font-semibold py-3.5 px-5 rounded-2xl shadow-lg shadow-slate-900/15 flex items-center justify-between transition-all cursor-pointer relative z-10"
          >
            <span>{t('welcome_beta_button', { defaultValue: 'Começar a Explorar' })}</span>
            <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // 2. Modal Bloqueante de Atualização (Versão antiga)
  if (!isOutdated) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-4 sm:p-6 bg-slate-950/70 animate-in fade-in duration-200">
      <div className="relative w-full sm:max-w-md bg-white rounded-3xl p-6 sm:p-7 border border-amber-100 text-left shadow-2xl shadow-slate-950/40 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 bg-amber-500/15 rounded-full pointer-events-none" />

        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-amber-800 uppercase">
              {t('version_update_badge', { defaultValue: 'Nova Versão Disponível' })}
            </span>
          </div>

          <span className="text-xs font-mono font-bold text-amber-700 px-2.5 py-1 rounded-lg bg-amber-50/80 border border-amber-200/60">
            v{newVersionData?.packageVersion}
          </span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2 relative z-10">
          {t('version_update_title', { defaultValue: 'Atualização Pronta' })}
        </h3>
        
        <p className="text-sm text-slate-600 leading-relaxed mb-5 relative z-10">
          {t('version_update_desc', { 
            defaultValue: 'Uma versão mais recente do aplicativo está pronta com melhorias e correções importantes. Atualize agora para continuar.' 
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
          {newFormattedDate && (
            <div className="flex justify-between items-center text-[11px] text-slate-400 pt-2 border-t border-slate-200/60">
              <span>{t('version_update_released', { defaultValue: 'Lançado em' })}</span>
              <span className="text-slate-500 font-medium">{newFormattedDate}</span>
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
              ? (t('version_updating_loading', { defaultValue: 'A carregar...' }))
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