import React, { useRef, useCallback, useState, memo } from 'react';
import { Loader2, Upload, ImageIcon, ExternalLink, AlertCircle, X, Check, Crop } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { CLOUDINARY_CONFIG, MAX_IMAGE_FILE_SIZE } from '../../../../types/storeTab';
import { notify } from '../../../../utils/toast';
import { useTranslate } from '../../../../context/LanguageContext';

// ----------------------------------------------------------------------
// FUNÇÕES AUXILIARES DE ALTA PERFORMANCE (Canvas Nativo)
// ----------------------------------------------------------------------
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

const getCroppedImg = async (imageSrc: string, pixelCrop: any, fileName: string): Promise<File> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Sem contexto 2D');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('O canvas está vazio'));
        return;
      }
      const file = new File([blob], fileName, { type: 'image/png' });
      resolve(file);
    }, 'image/png', 1);
  });
};

// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ----------------------------------------------------------------------
interface LogoSectionProps {
  logoUrl: string | null;
  isUploading: boolean;
  imageTooLarge: boolean;
  setImageTooLarge: (val: boolean) => void;
  onUpload: (file: File) => Promise<void>;
}

export const LogoSection = memo(function LogoSection({
  logoUrl,
  isUploading,
  imageTooLarge,
  setImageTooLarge,
  onUpload,
}: LogoSectionProps): React.JSX.Element {
  const { t } = useTranslate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxMB = MAX_IMAGE_FILE_SIZE / (1024 * 1024);

  // Estados para o Modal de Recorte Inteligente
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('logo.png');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessingCrop, setIsProcessingCrop] = useState(false);

  // 1. Verificação inteligente ao escolher ficheiro
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageTooLarge(false);
    if (file.size > MAX_IMAGE_FILE_SIZE) {
      setImageTooLarge(true);
      notify.error(t('file_too_large') || 'Ficheiro demasiado pesado!');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      
      try {
        // Valida dimensões em segundo plano sem gastar recursos visuais
        const img = await createImage(base64);
        const isSquare = img.width === img.height;

        if (isSquare) {
          // Se já for perfeitamente quadrada (1:1), envia diretamente sem abrir o modal!
          if (fileInputRef.current) fileInputRef.current.value = '';
          await onUpload(file);
        } else {
          // Se não for quadrada, abre o modal de crop automaticamente
          setImageSrc(base64);
        }
      } catch (err) {
        // Fallback seguro caso haja erro na leitura da imagem
        setImageSrc(base64);
      }
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [setImageTooLarge, onUpload, t]);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropAndUpload = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      setIsProcessingCrop(true);
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, fileName);
      setImageSrc(null);
      await onUpload(croppedFile);
    } catch (e) {
      console.error(e);
      notify.error(t('crop_error') || 'Erro ao recortar a imagem.');
    } finally {
      setIsProcessingCrop(false);
      setZoom(1);
    }
  }, [imageSrc, croppedAreaPixels, fileName, onUpload, t]);

  const triggerUpload = useCallback(() => {
    if (!isUploading) fileInputRef.current?.click();
  }, [isUploading]);

  const closeCropModal = useCallback(() => {
    setImageSrc(null);
    setZoom(1);
  }, []);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start w-full">
        
        {/* PREVIEW QUADRADA (1:1) */}
        <div 
          onClick={triggerUpload}
          className={`group relative shrink-0 w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center rounded-[1.5rem] border-2 transition-colors cursor-pointer overflow-hidden transform-gpu
            ${logoUrl 
              ? 'border-slate-200 bg-slate-50/50' 
              : 'border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-indigo-400'
            }
          `}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 relative z-10">
              <Loader2 className="animate-spin text-indigo-600" size={28} />
            </div>
          ) : logoUrl ? (
            <img
              src={logoUrl}
              className="w-full h-full object-contain p-2 relative z-10"
              alt="Logo"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors relative z-10">
              <ImageIcon size={32} strokeWidth={1.5} className="mb-2" />
              <span className="text-[10px] font-black uppercase tracking-widest text-center px-2">
                {t('logo_missing') || 'Adicionar Logo'}
              </span>
            </div>
          )}

          {!isUploading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full text-slate-800 shadow-sm">
                <Upload size={14} className="text-indigo-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {logoUrl ? (t('change') || 'Mudar') : 'Upload'}
                </span>
              </div>
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {/* INFO E BOTÕES */}
        <div className="flex flex-col flex-1 w-full justify-center text-center sm:text-left h-full">
          <div>
            <h3 className="text-[15px] font-black text-slate-800 tracking-tight">
              {t('logo_title') || 'Símbolo / Logotipo'}
            </h3>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest mt-1">
              {t('logo_subtitle') || 'Formato Quadrado (1:1)'} • Max: <strong className="text-slate-700">{maxMB.toFixed(0)}MB</strong>
            </p>
          </div>

          <div className="mt-4 sm:mt-5 w-full">
            <button
              type="button"
              onClick={triggerUpload}
              disabled={isUploading}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors w-full sm:w-auto justify-center ${
                logoUrl 
                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
              }`}
            >
              {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Crop size={14} />}
              {logoUrl ? (t('change_image') || 'Substituir Logo') : (t('upload_logo') || 'Escolher Ficheiro')}
            </button>
          </div>

          {imageTooLarge && (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-100 p-3 w-full text-left">
              <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={16} />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wide">
                  {t('file_too_large_title') || 'Ficheiro muito grande'}
                </span>
                <a
                  href={CLOUDINARY_CONFIG.helpLinks.compressImages}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-rose-600 hover:text-rose-800 hover:underline mt-1 w-max"
                >
                  {t('compress_link') || 'Comprimir Imagem'} <ExternalLink size={10} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE RECORTE (Só abre se a imagem enviada não for quadrada) */}
      {imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90">
          <div className="relative bg-black w-full max-w-md h-[70vh] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col transform-gpu">
            
            <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent">
              <button 
                onClick={closeCropModal}
                disabled={isProcessingCrop}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                aria-label={t('cancel') || 'Cancelar'}
              >
                <X size={20} />
              </button>
              <span className="text-xs font-bold text-white uppercase tracking-widest">
                {t('adjust_logo') || 'Ajustar Logo'}
              </span>
              <button 
                onClick={handleCropAndUpload}
                disabled={isProcessingCrop}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-colors shadow-lg"
                aria-label={t('save') || 'Guardar'}
              >
                {isProcessingCrop ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
              </button>
            </div>

            <div className="flex-1 relative">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                objectFit="contain"
              />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent flex flex-col items-center">
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-label={t('zoom') || 'Zoom'}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-3/4 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-3">
                {t('zoom_instruction') || 'Desliza para fazer Zoom'}
              </span>
            </div>

          </div>
        </div>
      )}
    </>
  );
});