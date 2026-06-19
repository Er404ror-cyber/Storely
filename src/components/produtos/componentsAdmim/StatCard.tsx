import { memo } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
}

export const StatCard = memo(({ label, value }: StatCardProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate text-lg font-black text-slate-900">{value}</p>
    </div>
  );
});

StatCard.displayName = 'StatCard';