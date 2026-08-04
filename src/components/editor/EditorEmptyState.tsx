import { Plus, Layout } from 'lucide-react';
import { memo } from 'react';

interface EditorEmptyStateProps {
  onAdd: () => void;
  t: (key: string) => string;
}

export const EditorEmptyState = memo(function EditorEmptyState({ onAdd, t }: EditorEmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[400px] w-full animate-in fade-in duration-300">
      <div className="relative mb-8 cursor-pointer" onClick={onAdd}>
        <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-slate-200">
          <Layout size={48} className="text-slate-400 md:size-64" />
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-md border-4 border-white">
            <Plus size={20} strokeWidth={3} />
          </div>
        </div>
      </div>

      <div className="max-w-md text-center space-y-3">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">
          {t('empty_state_title')}
        </h2>
        <p className="text-sm md:text-base text-slate-500 leading-relaxed px-4">
          {t('empty_state_description')}
        </p>
        <div className="pt-4 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
          <span className="h-px w-8 bg-slate-200" />
          <span className="flex items-center gap-1.5">{t('empty_state_action')}</span>
          <span className="h-px w-8 bg-slate-200" />
        </div>
      </div>
    </div>
  );
});