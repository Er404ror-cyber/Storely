import { Loader2, X, AlertCircle, CheckCircle2 } from 'lucide-react'; 
import { useTranslate } from '../../context/LanguageContext';

export function NewPageModal({ 
  isOpen, 
  onClose, 
  newPage, 
  setNewPage, 
  createPage, 
  templates, 
  storeSlug 
}: any) {
  const { t } = useTranslate();

  if (!isOpen) return null;

  // VALIDAÇÃO RIGOROSA: Slug deve ter texto e type não pode ser vazio
  const isSlugValid = newPage.slug.trim().length > 0;
  const isTypeValid = newPage.type && newPage.type !== '';
  const isFormValid = isSlugValid && isTypeValid;

  return (
    <div className="fixed inset-0 z-[200] flex items-end md:items-stretch md:justify-end bg-slate-900/40 animate-in fade-in duration-500">
      <div className="absolute inset-0 -z-10" onClick={onClose} />
      <div className="bg-white w-full md:w-[500px] h-[90vh] md:h-screen rounded-t-[2.5rem] md:rounded-l-[3rem] md:rounded-tr-none shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-full md:slide-in-from-right-full duration-500 ease-out will-change-transform">
        
        <div className="flex justify-center py-4 md:hidden shrink-0" onClick={onClose}>
          <div className="w-16 h-1.5 bg-slate-200 rounded-full" />
        </div>

        {/* HEADER */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <div className="min-w-0">
            <h2 className="text-xl font-black tracking-tight italic">{t('new_deployment')}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${isFormValid ? 'bg-emerald-500' : 'bg-indigo-500 animate-pulse'}`} />
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t('configuring_page')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              disabled={!isFormValid || createPage.isPending} 
              onClick={() => createPage.mutate(newPage)} 
              className={`px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.1em] transition-all flex items-center gap-2 
                ${isFormValid 
                  ? 'bg-slate-900 text-white hover:bg-indigo-600 active:scale-95 shadow-xl shadow-indigo-100' 
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed opacity-100 grayscale'
                }`}
            >
              {createPage.isPending ? <Loader2 size={16} className="animate-spin" /> : t('deploy_now')}
            </button>
            <button onClick={onClose} className="hidden md:flex p-3 bg-slate-50 text-slate-400 hover:text-red-500 rounded-2xl transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* BODY */}
        <div className="relative flex-1 flex flex-col min-h-0">
          <div className="p-8 space-y-10 overflow-y-auto flex-1 custom-scrollbar">
            
            {/* DESTINATION PATH */}
            <div className="space-y-4">
              <div className="flex justify-between items-end px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('destination_path')}</label>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isSlugValid ? 'text-emerald-500' : 'bg-amber-100 text-amber-600'}`}>
                  {isSlugValid ? '✓' : t('required')}
                </span>
              </div>
              <div className="flex items-center bg-slate-50 border-2 border-slate-100 rounded-[24px] focus-within:ring-8 focus-within:ring-indigo-500/5 focus-within:bg-white focus-within:border-indigo-500 transition-all overflow-hidden">
                <div className="flex items-center text-slate-400 font-bold text-xs pl-6 pr-2 shrink-0 border-r border-slate-100 bg-slate-100/30">
                  <span className="text-slate-900 truncate max-w-[50px]">{storeSlug}</span>
                  <span className="opacity-30">/</span>
                </div>
                <input 
                  className="w-full bg-transparent px-5 py-5 text-slate-900 font-black text-lg outline-none placeholder:opacity-20" 
                  placeholder="offer-name" 
                  value={newPage.slug} 
                  onChange={(e) => setNewPage({...newPage, slug: e.target.value})} 
                />
              </div>
            </div>

            {/* BLUEPRINT ARCHITECTURE */}
            <div className="space-y-5">
              <div className="flex justify-between items-end px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('blueprint_arch')}</label>
                <div className="flex items-center gap-1.5">
                    {!isTypeValid && <AlertCircle size={10} className="text-amber-500 animate-pulse" />}
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isTypeValid ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                        {isTypeValid ? '✓ SELECTED' : t('required')}
                    </span>
                </div>
              </div>
              
              <div className={`grid grid-cols-1 gap-3 pb-8 transition-all duration-500 ${!isTypeValid && isSlugValid ? 'scale-[1.01]' : ''}`}>
                {Object.entries(templates).map(([key, val]: any) => (
                  <button 
                    key={key} 
                    onClick={() => setNewPage({...newPage, type: key})} 
                    className={`flex items-center gap-6 p-6 rounded-[28px] border-2 transition-all text-left relative overflow-hidden group ${
                      newPage.type === key 
                        ? 'border-indigo-600 bg-indigo-50/30 shadow-inner' 
                        : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 ${
                      newPage.type === key 
                        ? 'bg-indigo-600 text-white rotate-6 shadow-lg shadow-indigo-200' 
                        : 'bg-white text-slate-400 border border-slate-100 group-hover:border-indigo-200'
                    }`}>
                      {val.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm font-black uppercase tracking-tight transition-colors ${newPage.type === key ? 'text-indigo-900' : 'text-slate-700'}`}>{val.label}</div>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1 line-clamp-2">{val.description}</p>
                    </div>
                    
                    {/* Checkmark animado */}
                    {newPage.type === key && (
                        <div className="absolute top-4 right-4 text-indigo-600 animate-in zoom-in duration-300">
                            <CheckCircle2 size={20} fill="currentColor" className="text-white fill-indigo-600" />
                        </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        </div>

        {/* FOOTER */}
        <div className="px-8 py-2 md:py-8 bg-white border-t border-slate-100 shrink-0">
          <button 
            onClick={onClose} 
            className="w-full py-5 rounded-[22px] border-2 border-slate-100 bg-red-50 text-[11px] font-black text-red-500 uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white hover:border-red-600 transition-all active:scale-95"
          >
            {t('cancel')} 
          </button>
        </div>
      </div>
    </div>
  );
}