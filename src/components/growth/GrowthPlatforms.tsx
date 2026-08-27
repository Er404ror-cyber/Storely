import { memo } from 'react';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
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
    <section className="p-4.5 sm:p-7 rounded-3xl bg-white border border-zinc-200/80 shadow-sm space-y-5">
      <div>
        <h2 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight flex items-center gap-2">
          <TrendingUp size={18} className="text-indigo-600 shrink-0" />
          <span>{t('guide_platforms_title') || 'Onde configurar o seu link'}</span>
        </h2>
        <p className="text-xs text-zinc-500">{t('guide_platforms_sub') || 'Siga os passos abaixo para colocar o seu link no lugar certo de cada aplicativo:'}</p>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {platforms.map((platform, idx) => {
          const isActive = activeIdx === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelect(idx)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive ? 'bg-zinc-900 text-white shadow-xs' : 'bg-zinc-100 hover:bg-zinc-200/70 text-zinc-600 border border-zinc-200/60'
              }`}
            >
              {platform.icon}
              <span>{platform.name}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        <div className="md:col-span-7 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-zinc-900">{current.name}</span>
            <button
              type="button"
              onClick={() => onOpenApp(current.deepLink, current.webUrl)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <span>{t('guide_platform_open') || 'Abrir Configuração no App'}</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="space-y-2.5">
            {current.steps.map((step, sIdx) => (
              <div key={sIdx} className="flex items-start gap-3 text-xs text-zinc-700 bg-zinc-50 p-3 rounded-2xl border border-zinc-100">
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  {sIdx + 1}
                </div>
                <span className="leading-relaxed font-medium break-words">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-5 flex justify-center w-full min-w-0">
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