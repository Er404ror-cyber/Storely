import { memo } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";

export const DesktopNavItem = memo(function DesktopNavItem({ to, label, fullLabel, isActive, Icon }: { to: string; label: string; fullLabel: string; isActive: boolean; Icon: LucideIcon; }) {
  return (
    <Link to={to} title={fullLabel} className={`group relative shrink-0 rounded-xl px-4 py-2.5 max-w-[180px] overflow-hidden text-[12px] font-bold uppercase tracking-[0.12em] transition-colors duration-200 ${isActive ? "text-slate-950 dark:text-white" : "text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"}`}>
      <span className="flex items-center gap-2 truncate">
        <Icon size={16} className="shrink-0" />
        <span className="truncate leading-none">{label}</span>
      </span>
      <span className={`absolute bottom-1 left-4 right-4 h-[2px] rounded-full transition-opacity duration-200 ${isActive ? "bg-slate-950 opacity-100 dark:bg-white" : "bg-slate-400 opacity-0 group-hover:opacity-50 dark:bg-slate-600"}`} />
    </Link>
  );
});

export const MobileNavItem = memo(function MobileNavItem({ to, label, fullLabel, isActive, Icon }: { to: string; label: string; fullLabel: string; isActive: boolean; Icon: LucideIcon; }) {
  return (
    <Link to={to} title={fullLabel} className={`group flex min-h-[52px] items-center justify-between rounded-2xl px-4 py-3 font-bold transition-colors duration-200 ${isActive ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950" : "bg-slate-50 text-slate-700 active:bg-slate-100 dark:bg-slate-900 dark:text-slate-200 dark:active:bg-slate-800"}`}>
      <div className="flex min-w-0 items-center gap-3">
        <Icon size={18} className="shrink-0" />
        <span className="block truncate text-[15px] font-semibold leading-none">{label}</span>
      </div>
      <ChevronRight size={16} className={`shrink-0 transition-transform duration-200 ${isActive ? "text-white dark:text-slate-950" : "text-slate-300 group-hover:translate-x-1 dark:text-slate-500"}`} />
    </Link>
  );
});

export const HeaderAssistButton = memo(function HeaderAssistButton({ 
  to, 
  label, 
  icon, 
  variant = 'secondary' 
}: { 
  to: string; 
  label: string; 
  icon: React.ReactNode; 
  variant?: 'primary' | 'secondary'; 
}) {
  // Whitespace-nowrap e leading-none evitam saltos de layout e quebras de texto
  const baseStyle = "inline-flex min-h-[40px] md:min-h-[44px] items-center gap-2 rounded-full px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap leading-none focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1";
  
  // Design CTA Primário
  const primaryStyle = "bg-slate-900 text-white shadow-sm hover:bg-slate-800 hover:shadow-md hover:-translate-y-0.5 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200";
  
  // Design Secundário Discreto
  const secondaryStyle = "bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800";

  return (
    <Link to={to} className={`${baseStyle} ${variant === 'primary' ? primaryStyle : secondaryStyle}`}>
      <span className="shrink-0">{icon}</span>
      <span>{label}</span>
    </Link>
  );
});