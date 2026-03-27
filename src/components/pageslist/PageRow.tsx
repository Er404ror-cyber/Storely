import { memo, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, AlertCircle, Globe, Check, X, 
  Copy, Edit3, Star, Trash2, ArrowRight 
} from 'lucide-react';
import { useTranslate } from '../../context/LanguageContext';
import { useClipboard } from '../../hooks/useClipboard';

// --- Interfaces ---
interface PageData {
  id: string;
  slug: string;
  is_home: boolean;
}

interface PageRowProps {
  page: PageData;
  storeSlug: string;
  isConflict: boolean;
  setAsHome: { mutate: (id: string) => void };
  updateSlug: { mutate: (data: { id: string; newSlug: string }) => void };
  deletePage: { mutate: (id: string) => void };
  editingState: {
    editingId: string | null;
    setEditingId: (id: string | null) => void;
    editValue: string;
    setEditValue: (val: string) => void;
  };
}

const BASE_DOMAIN = "https://storelyy.vercel.app";

// --- Sub-componentes Memoizados para evitar re-renderizações inúteis ---

const PageIcon = memo(({ isHome, isConflict }: { isHome: boolean, isConflict: boolean }) => (
  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
    isHome ? 'bg-indigo-600 text-white' 
    : isConflict ? 'bg-red-100 text-red-600' 
    : 'bg-slate-50 text-slate-400 border border-slate-100'
  }`}>
    {isHome ? <Home size={20} /> : isConflict ? <AlertCircle size={20} /> : <Globe size={20} />}
  </div>
));

const EditForm = memo(({ value, onChange, onSave, onCancel }: any) => (
  <div className="flex items-center gap-2">
    <div className="relative flex-1">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">/</span>
      <input 
        autoFocus
        className="w-full bg-slate-50 pl-6 pr-3 py-2.5 rounded-lg text-base font-bold outline-none text-indigo-600 border-2 border-indigo-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSave()}
      />
    </div>
    <div className="flex gap-1">
      <button onClick={onSave} className="p-2.5 bg-indigo-600 text-white rounded-lg"><Check size={18} strokeWidth={3} /></button>
      <button onClick={onCancel} className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-lg"><X size={18} strokeWidth={3} /></button>
    </div>
  </div>
));

const PageInfo = memo(({ slug, isHome, displayUrl, onCopy, isConflict, t }: any) => (
  <div className="flex flex-col min-w-0">
    <div className="flex items-center gap-2">
      <span className={`text-base font-bold truncate ${isConflict ? 'text-red-700' : 'text-slate-900'}`}>
        /{slug}
      </span>
      {isHome && (
        <span className="bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase px-2 py-0.5 rounded border border-indigo-100">
          {t('primary_tag')}
        </span>
      )}
    </div>
    <button onClick={onCopy} className="flex items-center gap-1.5 mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors w-fit">
      <span className="text-[10px] font-medium truncate max-w-[150px] md:max-w-full">{displayUrl}</span>
      <Copy size={10} className="shrink-0" />
    </button>
  </div>
));

const ActionButtons = memo(({ isHome, onEdit, onSetHome, onDelete }: any) => (
  <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-100">
    <button onClick={onEdit} className="p-2.5 text-slate-500 hover:text-indigo-600"><Edit3 size={18} /></button>
    {!isHome && (
      <>
        <button onClick={onSetHome} className="p-2.5 text-slate-500 hover:text-amber-500"><Star size={18} /></button>
        <button onClick={onDelete} className="p-2.5 text-slate-500 hover:text-red-500"><Trash2 size={18} /></button>
      </>
    )}
  </div>
));

// --- Componente Principal ---

export const PageRow = memo(({ 
  page, 
  storeSlug, 
  isConflict, 
  setAsHome, 
  updateSlug, 
  deletePage, 
  editingState 
}: PageRowProps) => {
  
  const { t } = useTranslate();
  const { editingId, setEditingId, editValue, setEditValue } = editingState;
  
  const isEditing = editingId === page.id;
  
  const fullUrl = useMemo(() => 
    `${BASE_DOMAIN}/${storeSlug || 'store'}/${page.slug}`, 
    [storeSlug, page.slug]
  );
  
  const copyUrl = useClipboard(fullUrl, t('link_copied'), t('copy_error'));

  // Handlers memorizados para não quebrar o React.memo dos sub-componentes
  const handleSave = useCallback(() => {
    updateSlug.mutate({ id: page.id, newSlug: editValue });
  }, [page.id, editValue, updateSlug]);

  const handleCancel = useCallback(() => {
    setEditingId(null);
    setEditValue('');
  }, [setEditingId, setEditValue]);

  const handleEditClick = useCallback(() => {
    setEditingId(page.id);
    setEditValue(page.slug);
  }, [page.id, page.slug, setEditingId, setEditValue]);

  const handleSetHome = useCallback(() => {
    setAsHome.mutate(page.id);
  }, [page.id, setAsHome]);

  const handleDelete = useCallback(() => {
    if (window.confirm(`${t('delete_confirm')} "/${page.slug}"?`)) {
      deletePage.mutate(page.id);
    }
  }, [page.id, page.slug, deletePage, t]);

  const containerClasses = useMemo(() => `
    bg-white border rounded-2xl p-4 md:p-5 
    flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 
    ${isConflict ? 'border-red-200 bg-red-50' : 'border-slate-100'}
  `, [isConflict]);

  return (
    <div className={containerClasses}>
      
      {/* Esquerda: Ícone e Info */}
      <div className="md:col-span-7 flex items-center gap-3">
        <PageIcon isHome={page.is_home} isConflict={isConflict} />
        
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <EditForm 
              value={editValue} 
              onChange={setEditValue} 
              onSave={handleSave} 
              onCancel={handleCancel} 
            />
          ) : (
            <PageInfo 
              slug={page.slug} 
              isHome={page.is_home} 
              displayUrl={fullUrl.replace('https://', '')}
              onCopy={copyUrl}
              isConflict={isConflict}
              t={t}
            />
          )}
        </div>
      </div>

      {/* Direita: Ações */}
      <div className="md:col-span-5 flex items-center justify-between md:justify-end gap-2">
        {!isEditing && (
          <ActionButtons 
            isHome={page.is_home}
            onEdit={handleEditClick}
            onSetHome={handleSetHome}
            onDelete={handleDelete}
          />
        )}

        <Link 
          to={`/admin/editor/${page.id}`} 
          className="flex-1 md:flex-none bg-slate-900 text-white px-5 py-3.5 rounded-xl text-xs font-black hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 active:scale-95 shadow-sm"
        >
          {t('design_btn')} 
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
});