import { memo } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface Props {
  navItems: NavItem[];
  activeSec: string;
  onNavigate: (id: string) => void;
}

export const GrowthNavigation = memo(function GrowthNavigation({
  navItems,
  activeSec,
  onNavigate,
}: Props) {
  return (
    <>
      {/* DOCK LATERAL DIREITO (DESKTOP >= LG) */}
      <aside
        aria-label="Navegação lateral"
        className="hidden lg:flex fixed lg:right-0 xl:right-2 top-1/2 -translate-y-1/2 z-40 group/dock select-none"
        style={{ contain: 'paint' }}
      >
        <div className="flex flex-col items-end gap-1.5 p-1 rounded-2xl bg-white border border-zinc-200 shadow-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSec === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-label={item.label}
                className={`flex items-center h-8 rounded-xl cursor-pointer overflow-hidden transition-colors ${
                  isActive
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  <Icon size={14} className={isActive ? 'text-white' : 'currentColor'} />
                </div>

                <span className="text-xs font-bold whitespace-nowrap overflow-hidden max-w-0 opacity-0 group-hover/dock:max-w-36 group-hover/dock:opacity-100 group-hover/dock:pr-3 transition-all duration-150">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* BARRA INFERIOR COLADA NO CHÃO (MOBILE < LG) */}
      <nav
        aria-label="Navegação rápida mobile"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-black/95 border-t border-zinc-800 px-2 pt-1 pb-[env(safe-area-inset-bottom,0px)]"
        style={{ contain: 'paint' }}
      >
        <div className="flex items-center justify-between gap-1 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSec === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-1 rounded-lg cursor-pointer transition-colors active:scale-95 ${
                  isActive
                    ? 'text-white font-bold bg-zinc-800/80'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon size={16} />
                <span className="text-[10px] leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
});

GrowthNavigation.displayName = 'GrowthNavigation';