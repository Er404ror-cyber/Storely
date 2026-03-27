import { memo, type ReactNode } from 'react'; // Corrigido para type import

interface SectionProps {
  title: string;
  icon: ReactNode;
  count?: number;
  children: ReactNode;
  variant?: 'default' | 'danger';
}

export const Section = memo(({ title, icon, count, children, variant = 'default' }: SectionProps) => (
  <section className="mb-10 animate-in fade-in slide-in-from-bottom-2 duration-500 will-change-transform">
    <div className="flex items-center gap-2 mb-4 px-2">
      <span className="shrink-0">{icon}</span>
      <h3 className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 ${
        variant === 'danger' ? 'text-red-600' : 'text-slate-400'
      }`}>
        {title} {count !== undefined && <span className="opacity-50">({count})</span>}
      </h3>
      <div className="h-[1px] flex-1 bg-slate-200 ml-2 opacity-50"></div>
    </div>
    <div className="space-y-3">{children}</div>
  </section>
));