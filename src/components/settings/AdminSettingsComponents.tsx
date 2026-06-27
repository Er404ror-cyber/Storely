import React, { useState } from 'react';
import { Fingerprint, Check, X } from 'lucide-react';
import { useTranslate } from '../../context/LanguageContext';

interface TabItemProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

export const TabItem: React.FC<TabItemProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick} 
    className={`px-10 py-4 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${
      active ? 'bg-white text-indigo-600 shadow-sm scale-105 border border-slate-100' : 'text-slate-400 hover:text-slate-600'
    }`}
  >
    {icon} {label}
  </button>
);

export const SectionInfo: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="ml-10 space-y-1">
    <h3 className="text-[16px] font-black text-slate-900 uppercase tracking-tighter italic">{title}</h3>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subtitle}</p>
  </div>
);

interface EditableRowProps {
  label: string;
  value: string | null | undefined;
  onSave: (val: string) => void;
  icon?: React.ReactNode;
  isTextArea?: boolean;
}

export const EditableRow: React.FC<EditableRowProps> = ({ label, value, onSave, icon, isTextArea }) => {
  const { t } = useTranslate();
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(value || '');

  const handleSave = () => {
    onSave(val);
    setIsEditing(false);
  };

  return (
    <div className="group p-10 md:px-14 flex items-center justify-between hover:bg-slate-50/50 transition-all">
      <div className="flex items-center gap-10 flex-1">
        <div className="text-slate-200 group-hover:text-indigo-600 transition-all">
          {icon || <Fingerprint size={20}/>}
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1.5 italic">{label}</p>
          {isEditing ? (
            isTextArea ? (
              <textarea autoFocus className="w-full p-6 border-2 border-indigo-600 rounded-[1.5rem] outline-none font-bold text-sm" value={val} onChange={(e) => setVal(e.target.value)} />
            ) : (
              <input autoFocus className="w-full p-5 border-2 border-indigo-600 rounded-2xl outline-none font-bold text-sm" value={val} onChange={(e) => setVal(e.target.value)} />
            )
          ) : (
            <p className="text-sm font-bold text-slate-700 truncate max-w-sm">{value || "---"}</p>
          )}
        </div>
      </div>
      <div className="ml-10">
        {isEditing ? (
          <div className="flex gap-3">
            <button onClick={() => setIsEditing(false)} className="p-3 text-slate-400"><X size={18}/></button>
            <button onClick={handleSave} className="p-3 text-white bg-indigo-600 rounded-xl shadow-lg"><Check size={18}/></button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 px-8 py-3 bg-slate-900 text-[10px] font-black uppercase text-white rounded-xl transition-all">
            {t('edit_label')}
          </button>
        )}
      </div>
    </div>
  );
};