import { memo, type ReactNode } from 'react';


interface SectionHeaderProps {
  icon: ReactNode;
  title: string;
  count: number;
  action?: ReactNode;
}

export const SectionHeader = memo(({ icon, title, count, action }: SectionHeaderProps) => {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between md:p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
          {icon}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-black text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">{count}</p>
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
});

SectionHeader.displayName = 'SectionHeader';