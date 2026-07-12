import { memo } from 'react';
import { Menu, ExternalLink } from 'lucide-react';
import { useTranslate } from '../../context/LanguageContext';
import { type DataSource } from '../../utils/adminCache';
import type { AdminStore } from '../../types/admin';
import AiAssistant from '../dashboard/AiAssistant';
import { Link } from 'react-router-dom';

interface AdminTopBarProps {
  store: AdminStore | undefined;
  setIsOpen: (val: boolean) => void;
  storeUrl: string;
  storeCacheLeft: number;
  source: DataSource;
  storeFetching: boolean;
}

export const AdminTopBar = memo(function AdminTopBar({
  store,
  setIsOpen,
  storeUrl,
  storeCacheLeft,
  source,
  storeFetching,
}: AdminTopBarProps) {
  const { t } = useTranslate();

  // Rótulos curtos e eficientes para o desktop
  const statusLabel = storeFetching
    ? 'Nuvem' 
    : source === 'cache'
      ? 'Cache' 
      : 'Online';

  const statusLongText = storeFetching
    ? t('cacheStatusSyncing')
    : source === 'cache'
      ? t('cacheStatusLocal')
      : t('cacheStatusWaiting');

  // Conversão rápida de minutos sem recalcular segundos (Economia de CPU/Bateria)
  const minutesLeft = Math.max(Math.floor(storeCacheLeft / 60000), 0);
  const displayTime = minutesLeft > 0 ? `${minutesLeft}m` : '0m';

  return (
    <header className="h-[64px] flex items-center justify-between px-4 lg:px-6 bg-[#F8F9FA] sticky top-0 z-50 shrink-0 select-none">
      
      {/* LADO ESQUERDO: Menu Hambúrguer (Mobile) e Status Integrado (Apenas Desktop) */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hambúrguer sempre acessível no mobile */}
        <button 
          type="button"
          onClick={() => setIsOpen(true)} 
          className="p-2 -ml-2 text-slate-400 hover:text-[#7B61FF] hover:bg-slate-200/40 rounded-xl transition-all lg:hidden active:scale-95 shrink-0"
        >
          <Menu size={20} strokeWidth={2.5} />
        </button>
        
        {/* Pílula de Status Soft UI: Oculta por padrão no celular, visível apenas a partir de lg: */}
        <div className="hidden lg:flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.01)] border border-slate-200/40 min-w-0">
          {/* Ponto indicador nativo */}
          <div className="flex items-center justify-center h-2 w-2 shrink-0">
            <span className={`inline-flex rounded-full h-1.5 w-1.5 ${storeFetching ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 min-w-0">
            <span className={`text-[9px] tracking-wide px-1.5 py-0.2 rounded-[4px] shrink-0 font-black ${
              storeFetching 
                ? 'bg-amber-50 text-amber-600' 
                : 'bg-emerald-50 text-emerald-600'
            }`}>
              {statusLabel}
            </span>

            <span className="w-0.5 h-0.5 rounded-full bg-slate-300 shrink-0" />
            
            <span className="font-black text-slate-700 tracking-tight shrink-0">
              {displayTime}
            </span>
            
            <span className="w-0.5 h-0.5 rounded-full bg-slate-300 shrink-0" />
            <span className="font-medium text-slate-400 truncate max-w-[120px]">
              {statusLongText}
            </span>
            
            {/* Moeda regional da loja */}
            {store?.currency && (
              <>
                <span className="w-0.5 h-0.5 rounded-full bg-slate-300 shrink-0" />
                <span className="text-[10px] font-extrabold text-[#7B61FF] bg-[#7B61FF]/10 px-1.5 py-0.2 rounded-[5px] shrink-0 font-mono">
                  {store.currency}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* LADO DIREITO: AI sempre visível e Link Externo condicional para computadores */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Componente da Inteligência Artificial isolado */}
        <AiAssistant />
        
        {/* Link da Loja visível apenas em computadores/telas grandes, sumindo 100% no celular */}
        <Link
          to={storeUrl} 
          target="_blank" 
          rel="noreferrer" 
          className="hidden lg:flex items-center justify-center h-8.5 w-8.5 text-slate-400 hover:text-[#7B61FF] bg-white rounded-lg transition-all shadow-[0_2px_8px_rgba(0,0,0,0.01)] border border-slate-200/40 active:scale-95 group shrink-0"
        >
          <ExternalLink size={14} strokeWidth={2.5} className="group-hover:translate-x-[0.5px] group-hover:-translate-y-[0.5px] transition-transform duration-200" />
        </Link>
      </div>

    </header>
  );
});