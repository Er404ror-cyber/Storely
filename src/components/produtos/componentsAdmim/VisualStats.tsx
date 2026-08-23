import { memo } from 'react';
import { BarChart3, Layers, CheckCircle2, PauseCircle } from 'lucide-react';

// ============================================================================
// 1. O STAT CARD (Cartão de Números Simples com Psicologia de Cores)
// ============================================================================

export type StatColorTheme = 'blue' | 'emerald' | 'amber' | 'slate' | 'purple';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  colorTheme?: StatColorTheme;
}

const themeMap: Record<StatColorTheme, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-50/80', text: 'text-blue-600' },
  emerald: { bg: 'bg-emerald-50/80', text: 'text-emerald-600' },
  amber: { bg: 'bg-amber-50/80', text: 'text-amber-600' },
  purple: { bg: 'bg-purple-50/80', text: 'text-purple-600' },
  slate: { bg: 'bg-slate-50/80', text: 'text-slate-600' },
};

export const StatCard = memo(({ label, value, icon, colorTheme = 'slate' }: StatCardProps) => {
  const theme = themeMap[colorTheme];

  return (
    <div className="flex flex-col justify-between gap-3 rounded-[24px] bg-white p-4 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.04)] border border-slate-50/50 transform-gpu transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_35px_-8px_rgba(0,0,0,0.06)] min-w-0">
      
      {icon && (
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${theme.bg} ${theme.text}`}>
          {icon}
        </div>
      )}

      <div className="flex flex-col min-w-0 mt-1">
        <p className="truncate text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
          {label}
        </p>
        <p className="truncate text-2xl sm:text-3xl font-black tracking-tight text-slate-800 mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

// ============================================================================
// 2. VISUAL STATS DASHBOARD (Dashboard Moderno com Barras de Progresso Proporcionais)
// ============================================================================

interface VisualStatsDashboardProps {
  total: number;
  active: number;
  paused: number;
  t: any; // Função de tradução
}

export const VisualStatsDashboard = memo(({ total, active, paused, t }: VisualStatsDashboardProps) => {
  const activePerc = total > 0 ? Math.round((active / total) * 100) : 0;
  const pausedPerc = total > 0 ? Math.round((paused / total) * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-white p-6 sm:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-100/80 transform-gpu w-full">
      
     
      <div className="relative z-10 flex flex-col gap-7 w-full">
        
        {/* Cabeçalho do Dashboard */}
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4 min-w-0">
             <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-[20px] bg-slate-900 text-white shadow-[0_8px_20px_rgba(15,23,42,0.15)] shrink-0">
                <BarChart3 size={24} strokeWidth={2.5} />
             </div>
             <div className="flex flex-col min-w-0">
               <h3 className="text-[13px] sm:text-[14px] font-black uppercase tracking-[0.2em] text-slate-800 truncate">
                 {t('section_estatisticas_larga', { defaultValue: 'Performance do Catálogo' })}
               </h3>
               <p className="text-[11px] font-bold text-slate-400 mt-0.5 truncate">
                 {t('stat_total', { defaultValue: 'Total de Itens' })}: <span className="text-slate-700 font-black">{total}</span>
               </p>
             </div>
           </div>

           {/* Badge minimalista com o total */}
           <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-slate-50 px-3.5 py-1.5 border border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-500">
             <Layers size={14} className="text-blue-600" />
             <span>{total} {t('products', { defaultValue: 'Produtos' })}</span>
           </div>
        </div>

        {/* ÁREA DOS GRÁFICOS DE BARRA PROPORCIONAIS */}
        <div className="flex flex-col gap-5 pt-1">
          
          {/* BARRA 1: PRODUTOS ATIVOS */}
          <div className="flex flex-col gap-2 rounded-2xl bg-slate-50/70 p-4 border border-slate-100/60">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span>{t('status_active', { defaultValue: 'Ativos' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-extrabold">{activePerc}%</span>
                <span className="text-slate-400 font-bold">({active})</span>
              </div>
            </div>
            
            {/* Linha de Progresso com Gradiente */}
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-200/60">
              <div 
                style={{ width: `${activePerc}%` }} 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-1000 ease-out shadow-sm shadow-emerald-500/20" 
              />
            </div>
          </div>

          {/* BARRA 2: PRODUTOS PAUSADOS */}
          <div className="flex flex-col gap-2 rounded-2xl bg-slate-50/70 p-4 border border-slate-100/60">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider">
              <div className="flex items-center gap-2 text-slate-700">
                <PauseCircle size={16} className="text-amber-500" />
                <span>{t('status_paused', { defaultValue: 'Pausados' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-600 font-extrabold">{pausedPerc}%</span>
                <span className="text-slate-400 font-bold">({paused})</span>
              </div>
            </div>
            
            {/* Linha de Progresso com Gradiente */}
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-200/60">
              <div 
                style={{ width: `${pausedPerc}%` }} 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-1000 ease-out shadow-sm shadow-amber-500/20" 
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
});

VisualStatsDashboard.displayName = 'VisualStatsDashboard';