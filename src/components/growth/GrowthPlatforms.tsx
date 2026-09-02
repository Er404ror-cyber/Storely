import { memo } from 'react';
import { TrendingUp, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { GrowthMockupPhone } from './GrowthMockupPhone';

interface PlatformItem {
  name: string;
  icon: React.ReactNode;
  color: string;
  deepLink: string;
  webUrl: string;
  mockupType: 'whatsapp' | 'tiktok' | 'google' | 'instagram';
  steps: string[];
}

interface Props {
  platforms: PlatformItem[];
  activeIdx: number;
  onSelect: (idx: number) => void;
  onOpenApp: (deepLink: string, webUrl: string) => void;
  storeName: string;
  logoUrl?: string;
  activeUrl: string;
  t: (k: string) => string;
}

export const GrowthPlatforms = memo(function GrowthPlatforms({
  platforms,
  activeIdx,
  onSelect,
  onOpenApp,
  storeName,
  logoUrl,
  activeUrl,
  t
}: Props) {
  const current = platforms[activeIdx] || platforms[0];

  return (
    <section 
      className="p-4 sm:p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-xs space-y-4"
      style={{ contain: 'content' }}
    >
      {/* Título simples e direto */}
      <div className="space-y-0.5">
        <h2 className="text-base sm:text-lg font-extrabold text-zinc-900 flex items-center gap-2">
          <TrendingUp size={18} className="text-emerald-600 shrink-0" />
          <span>{t('guide_platforms_title') || 'Onde colocar o seu link'}</span>
        </h2>
        <p className="text-xs text-zinc-500 font-normal">
          {t('guide_platforms_sub') || 'Escolha a rede e siga o passo a passo:'}
        </p>
      </div>

      {/* Seletor rápido de apps */}
      <div 
        className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar touch-pan-x"
        style={{ scrollbarWidth: 'none' }}
      >
        {platforms.map((platform, idx) => {
          const isActive = activeIdx === idx;
          return (
            <button
              key={platform.name || idx}
              type="button"
              onClick={() => onSelect(idx)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-all active:scale-95 ${
                isActive 
                  ? 'bg-zinc-900 text-white shadow-xs' 
                  : 'bg-zinc-100 hover:bg-zinc-200/70 text-zinc-600'
              }`}
            >
              <span className="shrink-0">{platform.icon}</span>
              <span>{platform.name}</span>
            </button>
          );
        })}
      </div>

      {/* Instruções + Visualizador do telemóvel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-center pt-1">
        <div className="md:col-span-7 space-y-3">
          
          {/* Cabeçalho do App Ativo com Botão Direto */}
          <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
            <div className="flex items-center gap-2">
              <span className="shrink-0">{current.icon}</span>
              <span className="text-xs sm:text-sm font-bold text-zinc-900">{current.name}</span>
            </div>

            <button
              type="button"
              onClick={() => onOpenApp(current.deepLink, current.webUrl)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] sm:text-xs font-bold cursor-pointer active:scale-95 transition-transform shrink-0 shadow-xs"
            >
              <span>{t('guide_platform_open') || 'Configurar agora'}</span>
              <ArrowUpRight size={13} className="shrink-0" />
            </button>
          </div>

          {/* Passos claros e numerados */}
          <div className="space-y-2">
            {current.steps.map((step, sIdx) => (
              <div 
                key={sIdx} 
                className="flex items-start gap-2.5 p-3 rounded-2xl bg-white border border-zinc-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)]"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {sIdx + 1}
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed font-normal">
                  {step}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 px-1">
            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
            <span>{t('guide_platforms_footer_hint') || 'Depois de salvar, qualquer cliente poderá acessar o catálogo com 1 clique.'}</span>
          </div>
        </div>

        {/* Mockup simplificado */}
        <div className="md:col-span-5 flex justify-center w-full min-w-0 pt-2 md:pt-0">
          <GrowthMockupPhone
            mockupType={current.mockupType}
            storeName={storeName}
            logoUrl={logoUrl}
            activeUrl={activeUrl}
            onOpenApp={() => onOpenApp(current.deepLink, current.webUrl)}
            t={t}
          />
        </div>
      </div>
    </section>
  );
});

GrowthPlatforms.displayName = 'GrowthPlatforms';