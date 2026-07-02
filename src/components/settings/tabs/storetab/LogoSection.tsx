import React, { useRef } from 'react';
import { Loader2, Upload, ImageIcon, ExternalLink } from 'lucide-react';
import { CLOUDINARY_CONFIG, MAX_IMAGE_FILE_SIZE } from '../../../../types/storeTab';
import { notify } from '../../../../utils/toast';

interface LogoSectionProps {
  logoUrl: string | null;
  isUploading: boolean;
  imageTooLarge: boolean;
  setImageTooLarge: (val: boolean) => void;
  onUpload: (file: File) => Promise<void>;
  t: (key: string) => string;
}

export const LogoSection: React.FC<LogoSectionProps> = ({
  logoUrl,
  isUploading,
  imageTooLarge,
  setImageTooLarge,
  onUpload,
  t,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageTooLarge(false);
    if (file.size > MAX_IMAGE_FILE_SIZE) {
      setImageTooLarge(true);
      notify.error(t('file_too_large'));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    await onUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="group relative shrink-0">
        <div className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-[1.5rem] border-2 shadow-inner md:h-24 md:w-24 ${
          logoUrl ? 'border-dashed border-slate-200 bg-white' : 'border-dashed border-amber-300 bg-amber-50/50 animate-pulse'
        }`}>
          {isUploading ? (
            <Loader2 className="animate-spin text-indigo-600" size={24} />
          ) : logoUrl ? (
            <img
              src={logoUrl}
              className="h-full w-full object-contain"
              alt="Logo"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-1 text-center text-amber-600">
              <ImageIcon size={20} className="stroke-[2.5]" />
              <span className="text-[9px] font-black uppercase mt-0.5 tracking-tight leading-none">Sem Logo</span>
            </div>
          )}
        </div>
        {!isUploading && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center rounded-[1.5rem] bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
          >
            <Upload className="text-white" size={20} />
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="space-y-1">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all w-full sm:w-auto justify-center cursor-pointer ${
            logoUrl 
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white' 
              : 'bg-amber-600 text-white hover:bg-slate-900 shadow-md'
          }`}
        >
          {isUploading ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
          {logoUrl ? t('change_image') : 'Fazer Upload do Logo'}
        </button>

        {imageTooLarge && (
          <div className="block pt-1">
            <a
              href={CLOUDINARY_CONFIG.helpLinks.compressImages}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter text-indigo-600 hover:underline"
            >
              {t('compress_link')} <ExternalLink size={10} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};