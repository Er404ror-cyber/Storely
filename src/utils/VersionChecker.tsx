import { useState, useEffect, useCallback } from 'react';
import { useTranslate } from '../context/LanguageContext';

interface VersionData {
  version: number;
  packageVersion: string;
}

// Lista de chaves intocáveis durante a limpeza de memória
const KEYS_TO_PRESERVE = [
  'storely_auth_token', // O nome exato que configurou no supabase.ts
  'country_code'        // Mantém a preferência de país intacta após o reload
];

export default function VersionChecker() {
  const { t } = useTranslate();
  const [isOutdated, setIsOutdated] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<number | null>(null);
  const [newVersionData, setNewVersionData] = useState<VersionData | null>(null);

  // Função isolada que varre completamente o lixo da memória
  const performFullCleanup = async (newVersionNumber: number) => {
    try {
      // 1. Isolar dados vitais na memória temporária
      const preservedData: Record<string, string> = {};
      KEYS_TO_PRESERVE.forEach(key => {
        const val = localStorage.getItem(key);
        if (val) preservedData[key] = val;
      });

      // 2. Aniquilar LocalStorage e SessionStorage
      localStorage.clear();
      sessionStorage.clear();

      // 3. Restaurar dados vitais e gravar a nova versão limpa
      Object.entries(preservedData).forEach(([key, val]) => {
        localStorage.setItem(key, val);
      });
      localStorage.setItem('APP_INSTALLED_VERSION', newVersionNumber.toString());

      // 4. Limpar Cache Storage (liberta espaço físico no dispositivo do utilizador)
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(key => caches.delete(key)));
      }

      // 5. Matar Service Workers antigos em background
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
    } catch (error) {
      console.error('Erro ao realizar a limpeza profunda:', error);
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

        // INTERCEPTAÇÃO DO F5: 
        // Se já havia uma versão instalada e ela é diferente da do servidor, 
        // significa que houve um F5 ou o utilizador abriu nova aba pós-update.
        if (localVersionStr && localVersionStr !== serverVersionStr) {
          await performFullCleanup(data.version);
          // Força um reload para garantir que a UI arranca totalmente limpa
          window.location.reload(); 
          return; 
        }

        // Se for o primeiro acesso de sempre, ou se estiver tudo atualizado
        localStorage.setItem('APP_INSTALLED_VERSION', serverVersionStr);
        setCurrentVersion(data.version);
        
      } else if (currentVersion && data.version !== currentVersion) {
        // Detetou mudança durante o uso da app (Polling)
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

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
        intervalId = setInterval(() => checkVersion(), 5 * 60 * 1000);
      } else {
        clearInterval(intervalId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    if (document.visibilityState === 'visible') {
      intervalId = setInterval(() => checkVersion(), 5 * 60 * 1000);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [checkVersion]);

  const handleUpdateClick = async () => {
    if (newVersionData) {
      // Limpa tudo através do botão também e força o reload
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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-2xl text-center max-w-sm mx-4 transform transition-all">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {t('version_update_title')}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4">
          {t('version_update_desc')}
        </p>

        {newVersionData && (
          <div className="mb-5 inline-block bg-gray-50 border border-gray-100 rounded-md px-3 py-1.5">
            <p className="text-xs text-gray-500 font-mono">
              <span className="font-semibold text-gray-700">v{newVersionData.packageVersion}</span>
              {' • '}
              <span className="font-semibold text-gray-700">{formattedDate}</span>
            </p>
          </div>
        )}

        <button
          onClick={handleUpdateClick}
          className="bg-black text-white px-6 py-2.5 rounded-md font-medium hover:bg-gray-800 transition-colors w-full"
        >
          {t('version_update_button')}
        </button>
      </div>
    </div>
  );
}