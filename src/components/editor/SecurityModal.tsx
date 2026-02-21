import { CloudUpload, AlertCircle, Loader2 } from 'lucide-react';
import type { Section, ModalType } from '../../types/editor'; // Importação segura
import { useTranslate } from '../../context/LanguageContext';

interface SecurityModalProps {
  type: ModalType;
  sections: Section[];
  isSaving: boolean;
  onSave: () => Promise<void>;
  onDiscard: () => void;
  onClose: () => void;
  hasPendingUploads: boolean;
}

export function SecurityModal({ 
  type, sections, isSaving, onSave, onDiscard, onClose, hasPendingUploads 
}: SecurityModalProps) {
  const { t } = useTranslate();

  const pendingSections = sections.filter(s => {
    const content = s.content as any;
    const mediaItems = content.images || (content.media ? [content.media] : []);
    return mediaItems.some((img: any) => img.isTemp);
  });

  const hasPending = pendingSections.length > 0;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl text-center border border-white/20">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
          hasPending ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-blue-50 text-blue-600'
        }`}>
          {hasPending ? <CloudUpload size={32} /> : <AlertCircle size={32} />}
        </div>

        <h3 className="text-xl font-black mb-2 uppercase tracking-tight italic">
          {hasPending ? "Sincronização Necessária" : type === 'SAVE' ? t('editor_modal_save_title') : t('editor_modal_pending_changes_title')}
        </h3>

        <div className="mb-6 px-2">
          <p className="text-slate-500 text-[11px] mb-4 leading-relaxed">
            {hasPending ? t('editor_modal_sync_warning') : type === 'SAVE' ? t('editor_modal_save_desc') : t('editor_modal_nav_changes_desc')}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {(type === 'SAVE' || type === 'NAVIGATION') && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                if (!isSaving && !hasPending) onSave();
              }} 
              disabled={hasPending || isSaving}
              className={`w-full p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                hasPending || isSaving 
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                : 'bg-blue-600 text-white shadow-lg shadow-blue-100'
              }`}
            >
              {isSaving && <Loader2 className="animate-spin" size={16}/>}
              {isSaving ? 'A SALVAR...' : t('editor_modal_btn_save')}
            </button>
          )}

          <button 
            onClick={onDiscard} 
            disabled={isSaving}
            className="w-full bg-red-50 text-red-500 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
          >
            {hasPendingUploads ? t('editor_modal_btn_discard_all') : t('editor_modal_btn_discard')}
          </button>

          <button 
            onClick={onClose} 
            disabled={isSaving}
            className="w-full bg-slate-100 text-slate-400 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest mt-2 disabled:opacity-50"
          >
            {t('editor_modal_btn_continue')}
          </button>
        </div>
      </div>
    </div>
  );
}