import { Rocket, Plus, LayoutTemplate } from 'lucide-react';
import { useTranslate } from '../../context/LanguageContext';

interface EmptyPagesProps {
  onCreateClick: () => void;
  isSearching: boolean;
}

export function EmptyPages({ onCreateClick, isSearching }: EmptyPagesProps) {
  const { t } = useTranslate();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in zoom-in-95 duration-700">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full scale-150" />
        <div className="relative bg-white p-8 rounded-[40px] shadow-2xl shadow-indigo-100 border border-slate-50">
          <Rocket size={48} className="text-indigo-600 animate-bounce-slow" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-2xl text-white shadow-lg">
          <Plus size={20} />
        </div>
      </div>

      <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 tracking-tight italic uppercase">
        {isSearching ? t('empty_search_title') : t('empty_state_title')}
      </h3>
      
      <p className="text-slate-500 max-w-md mx-auto font-medium leading-relaxed mb-10">
        {isSearching 
          ? t('empty_search_description')
          : t('empty_state_description')}
      </p>

      {!isSearching && (
        <button 
          onClick={onCreateClick}
          className="group flex items-center gap-4 bg-slate-900 text-white pl-8 pr-4 py-4 rounded-[28px] font-black text-sm transition-all hover:bg-indigo-600 active:scale-95 shadow-2xl shadow-slate-300"
        >
          {t('first_deploy_btn')}
          <div className="bg-white/10 p-2 rounded-2xl group-hover:bg-white/20 transition-colors">
            <LayoutTemplate size={20} />
          </div>
        </button>
      )}
    </div>
  );
}