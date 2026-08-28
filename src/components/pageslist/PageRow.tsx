import React, { memo, useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  AlertCircle, 
  Globe, 
  Check, 
  X, 
  Copy, 
  Edit3, 
  Star, 
  Trash2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useTranslate } from '../../context/LanguageContext';
import { useClipboard } from '../../hooks/useClipboard';

export interface PageData {
  id: string;
  slug: string;
  is_home?: boolean;
  type?: string;
  title?: string;
  [key: string]: unknown;
}

interface PageRowProps {
  page: PageData;
  storeSlug?: string;
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

// 1. ÍCONE COM HIERARQUIA MODERNA
const PageIcon = memo(({ isHome, isConflict }: { isHome: boolean; isConflict: boolean }) => (
  <div 
    className={`relative w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-200 shadow-xs border ${
      isConflict 
        ? 'bg-rose-50 text-rose-600 border-rose-200/80 shadow-rose-500/10' 
        : isHome 
          ? 'bg-gradient-to-br from-[#8862DF] to-[#6E42D3] text-white border-white/20 shadow-[#8862DF]/20 shadow-md' 
          : 'bg-[#F6F3FB] text-[#7A6E94] border-[#E9E2F5] hover:bg-[#EFEAF7]'
    }`}
  >
    {isConflict ? (
      <AlertCircle size={19} className="shrink-0 animate-pulse" />
    ) : isHome ? (
      <Home size={19} className="shrink-0" />
    ) : (
      <Globe size={19} className="shrink-0" />
    )}
  </div>
));

PageIcon.displayName = 'PageIcon';

// 2. FORMULÁRIO DE EDIÇÃO INLINE
interface EditFormProps {
  value: string;
  onChange: (val: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const EditForm = memo(({ value, onChange, onSave, onCancel }: EditFormProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="flex items-center gap-2 w-full animate-in fade-in zoom-in-95 duration-150">
      <div className="relative flex-1 min-w-0">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8862DF] font-black text-sm pointer-events-none">/</span>
        <input 
          autoFocus
          className="w-full bg-[#FAF8FE] pl-7 pr-3 py-2 rounded-xl text-base sm:text-xs font-bold outline-none text-[#231A38] border-2 border-[#8862DF] focus:ring-4 focus:ring-[#8862DF]/15 transition-all shadow-inner"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button 
          type="button" 
          onClick={onSave} 
          className="p-2 bg-[#8862DF] hover:bg-[#774ED8] text-white rounded-xl active:scale-90 shadow-md shadow-[#8862DF]/25 transition-all cursor-pointer"
          title="Guardar"
        >
          <Check size={15} strokeWidth={3} />
        </button>
        <button 
          type="button" 
          onClick={onCancel} 
          className="p-2 bg-white border border-[#EBE3F8] text-[#867B9E] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-xl active:scale-90 transition-all cursor-pointer"
          title="Cancelar"
        >
          <X size={15} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
});

EditForm.displayName = 'EditForm';

// 3. INFORMAÇÕES E URL COM FEEDBACK VISUAL
interface PageInfoProps {
  slug: string;
  isHome: boolean;
  displayUrl: string;
  onCopy: () => void;
  isConflict: boolean;
  t: (key: any, variables?: Record<string, any>) => string;
}

const PageInfo = memo(({ slug, isHome, displayUrl, onCopy, isConflict, t }: PageInfoProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyClick = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="flex flex-col min-w-0 justify-center">
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-sm sm:text-[15px] font-black tracking-tight truncate ${
          isConflict ? 'text-rose-600' : 'text-[#231A38]'
        }`}>
          /{slug}
        </span>
        
        {isHome && (
          <span className="inline-flex items-center gap-1 bg-[#8862DF]/10 text-[#7343DF] border border-[#8862DF]/20 text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-2xs">
            <Sparkles size={10} fill="currentColor" />
            <span>{t('primary_tag') || 'Principal'}</span>
          </span>
        )}

        {isConflict && (
          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 border border-rose-200 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
            {t('conflict_badge') || 'Duplicado'}
          </span>
        )}
      </div>

      <button 
        type="button" 
        onClick={handleCopyClick} 
        className="group inline-flex items-center gap-1.5 mt-1 text-[#8C82A3] hover:text-[#8862DF] transition-colors w-fit text-left cursor-pointer"
        title="Copiar link da página"
      >
        <span className="text-[11px] font-semibold text-slate-500 group-hover:text-[#8862DF] transition-colors truncate max-w-[170px] sm:max-w-xs">
          {displayUrl}
        </span>
        
        <div className="w-4 h-4 rounded-md flex items-center justify-center transition-all group-hover:bg-[#8862DF]/10">
          {copied ? (
            <Check size={11} className="text-emerald-500 shrink-0" strokeWidth={3} />
          ) : (
            <Copy size={11} className="opacity-50 group-hover:opacity-100 shrink-0 transition-opacity" />
          )}
        </div>
      </button>
    </div>
  );
});

PageInfo.displayName = 'PageInfo';

// 4. AÇÕES COM MICROINTERAÇÕES
interface ActionButtonsProps {
  isHome: boolean;
  onEdit: () => void;
  onSetHome: () => void;
  onDelete: () => void;
}

const ActionButtons = memo(({ isHome, onEdit, onSetHome, onDelete }: ActionButtonsProps) => (
  <div className="flex items-center bg-[#F7F4FB] p-1 rounded-2xl border border-[#ECE5F6] gap-0.5 shadow-2xs">
    <button 
      type="button" 
      onClick={onEdit} 
      className="p-2 text-[#7C7196] hover:text-[#8862DF] hover:bg-white rounded-xl active:scale-90 transition-all cursor-pointer"
      title="Editar Caminho"
    >
      <Edit3 size={15} />
    </button>

    {!isHome && (
      <>
        <button 
          type="button" 
          onClick={onSetHome} 
          className="p-2 text-[#7C7196] hover:text-amber-500 hover:bg-white rounded-xl active:scale-90 transition-all cursor-pointer"
          title="Tornar Página Principal"
        >
          <Star size={15} />
        </button>

        <button 
          type="button" 
          onClick={onDelete} 
          className="p-2 text-[#7C7196] hover:text-rose-600 hover:bg-rose-50 rounded-xl active:scale-90 transition-all cursor-pointer"
          title="Eliminar Página"
        >
          <Trash2 size={15} />
        </button>
      </>
    )}
  </div>
));

ActionButtons.displayName = 'ActionButtons';

// 5. COMPONENTE PRINCIPAL
export const PageRow = memo(function PageRow({ 
  page, 
  storeSlug, 
  isConflict, 
  setAsHome, 
  updateSlug, 
  deletePage, 
  editingState 
}: PageRowProps) {
  
  const { t } = useTranslate();
  const { editingId, setEditingId, editValue, setEditValue } = editingState;
  
  const isEditing = editingId === page.id;
  const isHome = Boolean(page.is_home);
  
  const fullUrl = useMemo(() => 
    `${BASE_DOMAIN}/${storeSlug || 'store'}/${page.slug}`, 
    [storeSlug, page.slug]
  );
  
  const copyUrl = useClipboard(fullUrl, t('link_copied'), t('copy_error'));

  const handleSave = useCallback(() => {
    if (!editValue.trim()) return;
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
    if (typeof window !== 'undefined' && window.confirm(`${t('delete_confirm') || 'Eliminar'} "/${page.slug}"?`)) {
      deletePage.mutate(page.id);
    }
  }, [page.id, page.slug, deletePage, t]);

  return (
    <div 
      className={`group relative bg-white border rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all duration-200 hover:shadow-md ${
        isConflict 
          ? 'border-rose-200/90 bg-rose-50/25 shadow-xs' 
          : isHome
            ? 'border-[#8862DF]/30 shadow-xs shadow-[#8862DF]/5'
            : 'border-[#EDE8F5] shadow-xs hover:border-[#DDD4EB]'
      }`}
      style={{ contain: 'content' }}
    >
      {/* Marcador lateral visual para a página Home */}
      {isHome && (
        <div className="hidden sm:block absolute left-0 top-3 bottom-3 w-1 bg-gradient-to-b from-[#8862DF] to-[#6E42D3] rounded-r-full" />
      )}

      {/* Lado Esquerdo: Ícone e Detalhes */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <PageIcon isHome={isHome} isConflict={isConflict} />
        
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
              isHome={isHome} 
              displayUrl={fullUrl.replace('https://', '')}
              onCopy={copyUrl}
              isConflict={isConflict}
              t={t}
            />
          )}
        </div>
      </div>

      {/* Lado Direito: Ações e Botão Editor */}
      <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F5F1FB]">
        {!isEditing && (
          <ActionButtons 
            isHome={isHome}
            onEdit={handleEditClick}
            onSetHome={handleSetHome}
            onDelete={handleDelete}
          />
        )}

        <Link 
          to={`/admin/editor/${page.id}`} 
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8862DF] to-[#764AD8] hover:from-[#7B52D9] hover:to-[#6A3BCF] text-white text-xs font-black uppercase tracking-wider active:scale-95 transition-all shadow-md shadow-[#8862DF]/25 hover:shadow-lg hover:shadow-[#8862DF]/35 cursor-pointer"
        >
          <span>{t('design_btn') || 'Editor'}</span>
          <ArrowRight size={13} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
});

PageRow.displayName = 'PageRow';