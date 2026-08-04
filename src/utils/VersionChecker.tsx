import { useState, useEffect, useCallback } from 'react';
import { useTranslate } from '../context/LanguageContext';

interface VersionData {
  version: number;
  packageVersion: string;
}

export default function VersionChecker() {
  const { t } = useTranslate();
  const [isOutdated, setIsOutdated] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<number | null>(null);
  
  // Estado para armazenar os dados visuais quando ocorrer um update
  const [newVersionData, setNewVersionData] = useState<VersionData | null>(null);

  const checkVersion = useCallback(async (isInitialLoad = false) => {
    // Evita loop no servidor de desenvolvimento
    if (import.meta.env.DEV) return;

    try {
      const res = await fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-store',
      });
      
      if (!res.ok) return;
      
      const data: VersionData = await res.json();

      if (isInitialLoad) {
        // Grava apenas o identificador lógico (Date.now() gerado no build)
        setCurrentVersion(data.version);
      } else if (currentVersion && data.version !== currentVersion) {
        // Atualizou! Guarda os dados completos para exibição na UI
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
        // Pausa checagem quando o usuário sai da aba/minimiza
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

  if (!isOutdated) return null;

  // Formata o timestamp (Date.now() do momento do build) para exibir apenas o Dia
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

        {/* Exibe o package.json versão e a data extraída do identificador */}
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
          onClick={() => window.location.reload()}
          className="bg-black text-white px-6 py-2.5 rounded-md font-medium hover:bg-gray-800 transition-colors w-full"
        >
          {t('version_update_button')}
        </button>
      </div>
    </div>
  );
}