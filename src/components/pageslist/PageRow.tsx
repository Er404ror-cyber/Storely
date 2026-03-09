import { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle, Globe, Check, X, Copy, Edit3, Star, Trash2, ArrowRight } from 'lucide-react';
import { notify } from '../../utils/toast';
import { useTranslate } from '../../context/LanguageContext';

const BASE_DOMAIN = "https://storelyy.vercel.app";

export const PageRow = memo(({ page, storeSlug, isConflict, setAsHome, updateSlug, deletePage, editingState }: any) => {
  const { t } = useTranslate();
  const { editingId, setEditingId, editValue, setEditValue } = editingState;
  const isEditing = editingId === page.id;
  const storePath = storeSlug || 'store';
  const fullUrl = `${BASE_DOMAIN}/${storePath}/${page.slug}`;
  
  const handleCancel = useCallback(() => {
    setEditingId(null);
    setEditValue('');
  }, [setEditingId, setEditValue]);

  const fallbackCopy = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
  
    try {
      document.execCommand("copy");
      notify.success(t('link_copied'));
    } catch {
      notify.error(t('copy_error'));
    }
  
    document.body.removeChild(textArea);
  };
  
  const copyUrl = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(fullUrl);
        notify.success(t('link_copied'));
      } else {
        fallbackCopy(fullUrl);
      }
    } catch {
      fallbackCopy(fullUrl);
    }
  }, [fullUrl, t]);

  return (
    <div className={`group bg-white border rounded-[24px] p-5 flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 transition-all duration-300 ${
      isConflict ? 'border-red-200 bg-red-50/40 ring-2 ring-red-100' : 'border-slate-200 hover:border-indigo-400'
    }`}>
      
      {/* SEÇÃO SUPERIOR: Ícone e Info */}
      <div className="md:col-span-7 flex items-start gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
          page.is_home ? 'bg-indigo-600 text-white shadow-lg' : isConflict ? 'bg-red-100 text-red-600' : 'bg-slate-50 text-slate-400'
        }`}>
          {page.is_home ? <Home size={22} /> : isConflict ? <AlertCircle size={22} /> : <Globe size={22} />}
        </div>
        
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
              <input 
                autoFocus
                className="w-full bg-slate-100 px-4 py-3 rounded-xl text-base font-bold outline-none text-indigo-700 border-2 border-indigo-500"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
              />
              <div className="flex gap-2">
                <button onClick={() => updateSlug.mutate({ id: page.id, newSlug: editValue })} className="flex-1 sm:flex-none p-3 bg-indigo-600 text-white rounded-xl flex justify-center"><Check size={20} /></button>
                <button onClick={handleCancel} className="flex-1 sm:flex-none p-3 bg-slate-200 text-slate-600 rounded-xl flex justify-center"><X size={20} /></button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-black tracking-tight truncate ${isConflict ? 'text-red-700' : 'text-slate-900'}`}>/{page.slug}</span>
                {page.is_home && <span className="bg-indigo-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md">{t('primary_tag')}</span>}
              </div>
              <button 
                onClick={copyUrl} 
                className="flex items-center gap-2 mt-2 py-1 text-slate-400 hover:text-indigo-600 active:opacity-50 transition-all"
              >
                <span className="text-xs font-bold truncate opacity-60">storelyy/{storePath}/{page.slug}</span>
                <Copy size={14} className="shrink-0" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* SEÇÃO INFERIOR: Ações */}
      <div className="md:col-span-5 flex items-center justify-between md:justify-end gap-2 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
        <div className="flex items-center gap-1">
          {!isEditing && (
            <>
              <button onClick={() => { setEditingId(page.id); setEditValue(page.slug); }} className="p-4 text-slate-400 hover:text-indigo-600"><Edit3 size={20} /></button>
              {!page.is_home && <button onClick={() => setAsHome.mutate(page.id)} className="p-4 text-slate-300 hover:text-amber-500"><Star size={20} /></button>}
              {!page.is_home && (
                <button 
                  onClick={() => {
                    if (window.confirm(`${t('delete_confirm')} "/${page.slug}"?`)) {
                      deletePage.mutate(page.id);
                    }
                  }} 
                  className="p-4 text-slate-400 hover:text-red-500 active:bg-red-50 rounded-2xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </>
          )}
        </div>
        <Link 
          to={`/admin/editor/${page.id}`} 
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[13px] font-black hover:bg-indigo-600 transition-all flex items-center gap-2 active:scale-95 shadow-xl shadow-slate-200"
        >
          {t('design_btn')} <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
});