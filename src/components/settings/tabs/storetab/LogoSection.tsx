import React, { useRef, useCallback, useState, memo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Upload, ImageIcon, ExternalLink, AlertCircle, X, Check, Crop, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import Cropper, { type Area } from 'react-easy-crop';
import { CLOUDINARY_CONFIG, MAX_IMAGE_FILE_SIZE } from '../../../../types/storeTab';
import { notify } from '../../../../utils/toast';
import { useTranslate } from '../../../../context/LanguageContext';
import { FALLBACK_STORE } from '../../../../utils/constants';

// ----------------------------------------------------------------------
// FUNÇÕES AUXILIARES DE ALTA PERFORMANCE (Canvas Nativo)
// ----------------------------------------------------------------------
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

const getCroppedImg = async (imageSrc: string, pixelCrop: Area, fileName: string): Promise<File> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: false, alpha: false });
  if (!ctx) throw new Error('Sem contexto 2D disponível');

  // Mantém limite para economia de memória e compressão rápida
  const MAX_TARGET_SIZE = 800;
  let targetWidth = Math.floor(pixelCrop.width);
  let targetHeight = Math.floor(pixelCrop.height);

  if (targetWidth > MAX_TARGET_SIZE || targetHeight > MAX_TARGET_SIZE) {
    const scale = Math.min(MAX_TARGET_SIZE / targetWidth, MAX_TARGET_SIZE / targetHeight);
    targetWidth = Math.round(targetWidth * scale);
    targetHeight = Math.round(targetHeight * scale);
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'medium';

  ctx.drawImage(
    image,
    Math.floor(pixelCrop.x),
    Math.floor(pixelCrop.y),
    Math.floor(pixelCrop.width),
    Math.floor(pixelCrop.height),
    0,
    0,
    targetWidth,
    targetHeight
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Falha ao processar canvas'));
          return;
        }
        const file = new File([blob], fileName.replace(/\.[^/.]+$/, '') + '.webp', {
          type: 'image/webp',
        });
        resolve(file);
      },
      'image/webp',
      0.88
    );
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

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('logo.webp');
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessingCrop, setIsProcessingCrop] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Bloqueia rolagem de fundo no telemóvel ao abrir o modal
  useEffect(() => {
    if (imageSrc) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [imageSrc]);

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
        const img = await createImage(base64);
        const isSquare = Math.abs(img.width - img.height) <= 2;

        if (isSquare) {
          if (fileInputRef.current) fileInputRef.current.value = '';
          await onUpload(file);
        } else {
          setImageSrc(base64);
        }
      } catch {
        setImageSrc(base64);
      }
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [setImageTooLarge, onUpload, t]);

  const onCropComplete = useCallback((_croppedArea: Area, currentCroppedAreaPixels: Area) => {
    setCroppedAreaPixels(currentCroppedAreaPixels);
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
      setCrop({ x: 0, y: 0 });
    }
  }, [imageSrc, croppedAreaPixels, fileName, onUpload, t]);

  const triggerUpload = useCallback(() => {
    if (!isUploading) fileInputRef.current?.click();
  }, [isUploading]);

  const closeCropModal = useCallback(() => {
    setImageSrc(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  }, []);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-5 sm:gap-7 items-center sm:items-start w-full">
        {/* PREVIEW QUADRADA - SOFT UI */}
        <div 
          onClick={triggerUpload}
          style={{ contain: 'paint' }}
          className={`group relative shrink-0 w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center rounded-[2rem] border transition-colors cursor-pointer overflow-hidden
            ${logoUrl 
              ? 'border-[#EBE4F9] bg-[#FAF8FC] shadow-xs' 
              : 'border-dashed border-[#D9CDEC] bg-[#FAF8FC] hover:bg-[#F3EEFA] hover:border-[#9A81E9]'
            }
          `}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 relative z-10">
              <Loader2 className="animate-spin text-[#9A81E9]" size={26} />
            </div>
          ) : logoUrl ? (
            <img
              src={logoUrl || FALLBACK_STORE}
              className="w-full h-full object-contain p-2.5 rounded-[1.8rem] relative z-10"
              alt="Logo"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = FALLBACK_STORE;
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-[#9D91B5] group-hover:text-[#8862DF] transition-colors relative z-10">
              <ImageIcon size={28} strokeWidth={1.8} className="mb-1.5" />
              <span className="text-[10px] font-black uppercase tracking-wider text-center px-2">
                {t('logo_missing') || 'Adicionar Logo'}
              </span>
            </div>
          )}

          {!isUploading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#2D263B]/30 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full text-[#2D263B] shadow-sm">
                <Upload size={13} className="text-[#8862DF]" />
                <span className="text-[10px] font-black uppercase tracking-wider">
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
            <h3 className="text-[15px] font-black text-[#2D263B] tracking-tight">
              {t('logo_title') || 'Símbolo / Logotipo'}
            </h3>
            <p className="text-[11px] font-bold text-[#796C92] uppercase tracking-wider mt-0.5">
              {t('logo_subtitle') || 'Formato Quadrado (1:1)'} • Max: <strong className="text-[#2D263B]">{maxMB.toFixed(0)}MB</strong>
            </p>
          </div>

          <div className="mt-4 w-full">
            <button
              type="button"
              onClick={triggerUpload}
              disabled={isUploading}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[11px] font-black uppercase tracking-wider transition-colors w-full sm:w-auto justify-center ${
                logoUrl 
                  ? 'bg-[#EFEAF6] text-[#6B5A8E] hover:bg-[#E5DCF2]' 
                  : 'bg-[#9A81E9] text-white hover:bg-[#8862DF] shadow-xs active:scale-95'
              }`}
            >
              {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Crop size={14} />}
              {logoUrl ? (t('change_image') || 'Substituir Logo') : (t('upload_logo') || 'Escolher Ficheiro')}
            </button>
          </div>

          {imageTooLarge && (
            <div className="mt-3 flex items-start gap-2.5 rounded-2xl bg-[#FFF2F2] border border-[#FFE1E1] p-3 w-full text-left">
              <AlertCircle className="text-[#E53E3E] shrink-0 mt-0.5" size={15} />
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-[#C53030] uppercase tracking-wide">
                  {t('file_too_large_title') || 'Ficheiro muito pesado'}
                </span>
                <a
                  href={CLOUDINARY_CONFIG.helpLinks.compressImages}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#E53E3E] hover:underline mt-0.5 w-max"
                >
                  {t('compress_link') || 'Comprimir Imagem'} <ExternalLink size={10} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL / BOTTOM SHEET MOBILE-FRIENDLY (PORTAL z-[99999]) */}
      {mounted && imageSrc && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 "
          style={{ contain: 'strict' }}
        >
          <div className="relative bg-[#1A1624] border border-[#2D263B] w-full sm:max-w-md h-[90dvh] sm:h-[600px] rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col justify-between select-none">
            
            {/* CABEÇALHO TÁTIL */}
            <div className="relative z-20 flex items-center justify-between px-4 sm:px-5 py-3.5 bg-[#1A1624] border-b border-[#282138]">
              <button 
                type="button"
                onClick={closeCropModal}
                disabled={isProcessingCrop}
                className="flex items-center justify-center min-w-[40px] min-h-[40px] bg-[#2A233A] active:bg-[#382E4E] text-[#BDB2D6] rounded-full transition-colors"
                aria-label={t('cancel') || 'Cancelar'}
              >
                <X size={18} />
              </button>

              <div className="flex flex-col items-center">
                <span className="text-[12px] font-black text-white uppercase tracking-wider">
                  {t('adjust_logo') || 'Enquadrar Imagem'}
                </span>
                <span className="text-[9px] font-bold text-[#867B9E] uppercase tracking-widest">
                  1:1 Quadrado
                </span>
              </div>

              <button 
                type="button"
                onClick={handleCropAndUpload}
                disabled={isProcessingCrop}
                className="flex items-center gap-1.5 px-4 min-h-[40px] bg-[#9A81E9] active:bg-[#8862DF] text-white text-[11px] font-black uppercase tracking-wider rounded-full shadow-sm active:scale-95 transition-transform"
                aria-label={t('save') || 'Guardar'}
              >
                {isProcessingCrop ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Check size={16} strokeWidth={3} />
                    <span>{t('save') || 'Concluir'}</span>
                  </>
                )}
              </button>
            </div>

            {/* ÁREA DE VISUALIZAÇÃO E RECORTE */}
            <div className="relative flex-1 w-full bg-[#110E18] overflow-hidden touch-none" style={{ contain: 'content' }}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                objectFit="contain"
                showGrid={false}
                classes={{
                  containerClassName: 'relative w-full h-full',
                  cropAreaClassName: '!border-2 !border-[#9A81E9] !rounded-2xl !shadow-[0_0_0_9999px_rgba(17,14,24,0.88)]',
                }}
              />
            </div>

            {/* BARRA DE CONTROLE ERGONÔMICA INFERIOR (FÁCIL ALCANCE) */}
            <div className="relative z-20 px-4 sm:px-6 py-4 bg-[#1A1624] border-t border-[#282138] flex flex-col gap-2.5 pb-7 sm:pb-4">
              
              {/* SLIDER E BOTÕES RÁPIDOS */}
              <div className="flex items-center gap-2 w-full justify-between max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.max(1, +(prev - 0.2).toFixed(2)))}
                  className="flex items-center justify-center min-w-[42px] min-h-[42px] bg-[#2A233A] active:bg-[#3B3252] text-white rounded-full transition-colors"
                  aria-label="Diminuir Zoom"
                >
                  <ZoomOut size={16} />
                </button>

                <div className="flex-1 px-2 flex items-center">
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.05}
                    aria-label={t('zoom') || 'Zoom'}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-2 bg-[#2A233A] rounded-lg appearance-none cursor-pointer accent-[#9A81E9]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.min(3, +(prev + 0.2).toFixed(2)))}
                  className="flex items-center justify-center min-w-[42px] min-h-[42px] bg-[#2A233A] active:bg-[#3B3252] text-white rounded-full transition-colors"
                  aria-label="Aumentar Zoom"
                >
                  <ZoomIn size={16} />
                </button>

                <button
                  type="button"
                  onClick={handleResetZoom}
                  title={t('reset') || 'Centrar'}
                  className="flex items-center justify-center min-w-[42px] min-h-[42px] bg-[#2A233A] active:bg-[#3B3252] text-[#9D91B5] active:text-white rounded-full transition-colors ml-1"
                  aria-label="Resetar Enquadramento"
                >
                  <RotateCcw size={15} />
                </button>
              </div>

              {/* DICA DE APOIO */}
              <p className="text-[10px] font-bold text-[#867B9E] uppercase tracking-wider text-center">
                {t('zoom_instruction') || 'Arraste para mover ou toque nos botões para dar zoom'}
              </p>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
});