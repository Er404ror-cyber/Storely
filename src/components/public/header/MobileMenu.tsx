import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Compass, LogIn, ChevronRight } from "lucide-react";
import { MobileNavItem } from "./NavItems";

type MobileMenuProps = {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  navItems: any[];
  hasSession: boolean;
  t: (key: any, variables?: any) => string;
  explorePath: string;
  authPath: string;
};

export const MobileMenu = memo(function MobileMenu({ isOpen, setIsOpen, navItems, hasSession, t, explorePath, authPath }: MobileMenuProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* 1. OVERLAY DE FUNDO: Ajuda na conversão fechando distrações e capturando cliques perdidos */}
      <div 
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 top-16 z-40 bg-slate-900/60  transition-opacity duration-300 md:hidden ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        aria-hidden="true"
      />

      {/* 2. MENU PRINCIPAL: Otimizado com transform-gpu para celulares fracos */}
      <div className={`absolute left-0 right-0 top-full z-50 md:hidden origin-top transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu will-change-transform ${isOpen ? "scale-y-100 opacity-100" : "scale-y-95 opacity-0 pointer-events-none"}`}>
        <div className="rounded-b-2xl border-b border-slate-200/70 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
          <div className="space-y-6 p-5">
            
            {/* Secção de Páginas */}
            <div>
              <div className="mb-3 px-1 text-[10.5px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{t("store_header_navigation")}</div>
              <div className="max-h-[50vh] overflow-y-auto space-y-2 no-scrollbar pb-2">
                {navItems.map((item) => (
                  <MobileNavItem key={item.key} to={item.to} label={item.fullLabel} fullLabel={item.fullLabel} isActive={item.isActive} Icon={item.Icon} />
                ))}
              </div>
            </div>

            {/* Secção de Ação (CTA) */}
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
              {hasSession ? (
                <>
                  <p className="mb-3 text-[10.5px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{t("store_header_account_area")}</p>
                  <button onClick={() => { setIsOpen(false); navigate(explorePath); }} className="group flex w-full min-h-[52px] items-center justify-between rounded-2xl bg-slate-900 px-4 text-left text-white transition-all active:scale-[0.98] dark:bg-white dark:text-slate-950">
                    <div className="flex min-w-0 items-center gap-3"><LayoutDashboard size={18} className="shrink-0" /><span className="truncate text-[15px] font-bold leading-none">{t("store_header_back_admin")}</span></div>
                    <ChevronRight size={16} className="shrink-0 opacity-80 group-active:translate-x-1" />
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-[10.5px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{t("store_header_discover_more")}</p>
                  
                  {/* Botão Secundário */}
                  <button onClick={() => { setIsOpen(false); navigate(explorePath); }} className="group flex w-full min-h-[52px] items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-left text-slate-700 transition-all active:scale-[0.98] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                    <div className="flex min-w-0 items-center gap-3"><Compass size={18} className="shrink-0" /><span className="truncate text-[15px] font-bold leading-none">{t("nav_home")}</span></div>
                    <ChevronRight size={16} className="shrink-0 text-slate-400 group-active:translate-x-1" />
                  </button>
                  
                  {/* Botão Primário (Alta Conversão) */}
                  <button onClick={() => { setIsOpen(false); navigate(authPath); }} className="group flex w-full min-h-[52px] items-center justify-between rounded-2xl bg-slate-900 px-4 text-left text-white shadow-md transition-all active:scale-[0.98] dark:bg-white dark:text-slate-950">
                    <div className="flex min-w-0 items-center gap-3"><LogIn size={18} className="shrink-0" /><span className="truncate text-[15px] font-bold leading-none">{t("store_header_create_account")}</span></div>
                    <ChevronRight size={16} className="shrink-0 opacity-80 group-active:translate-x-1" />
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
});