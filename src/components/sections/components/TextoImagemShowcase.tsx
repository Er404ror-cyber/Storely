import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { getTheme, MAX_TEXT_LIMITS, MAX_IMAGE_SIZE_BYTES, normalizeText, clampText, formatBytes, uploadImageToCloudinary, deleteFromCloudinary } from '../helpers';
import { useTranslate } from '../../../context/LanguageContext';
import type { TextoImagemShowcaseProps } from '../../../types/TextTypes';
import { ImageCard } from '../../textos/ImageCard';
import { AboutCard, WhoAmIInner } from '../../textos/TextCards';


const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop';

const alignMap = { left: 'items-start text-left', center: 'items-center text-center', justify: 'items-start text-justify' } as const;

const TextoImagemShowcaseComponent: React.FC<TextoImagemShowcaseProps> = ({ content, style, onUpdate }) => {
  const { t } = useTranslate();
  const isEditable = !!onUpdate;
  const isDark = style.theme === 'dark';
  const layout = style.cols ?? '1';
  const alignClass = alignMap[style.align || 'left'];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  // CHAVE NO PAI: Todo o estado local principal está mantido aqui.
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [localError, setLocalError] = useState('');

  // Limpeza de cache de Memória do browser (Imagens temporárias poupam memória RAM e GPU)
  useEffect(() => {
    return () => { if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current); };
  }, []);

  const update = useCallback((field: string, max: number, maxBreaks: number = 1) => (value: string) => {
      onUpdate?.(field, clampText(value, max, maxBreaks));
    }, [onUpdate]);

  const resolved = useMemo(() => ({
      badge: normalizeText(content.badge, t('aboutBadge'), MAX_TEXT_LIMITS.badge, 0),
      title: normalizeText(content.title, t('aboutTitle'), MAX_TEXT_LIMITS.title, 2),
      subtitle: normalizeText(content.subtitle, t('aboutSubtitle'), MAX_TEXT_LIMITS.subtitle, 1),
      description: normalizeText(content.description, t('aboutDescription'), MAX_TEXT_LIMITS.description, 1),
      secondaryTitle: normalizeText(content.secondaryTitle, t('aboutSecondaryTitle'), MAX_TEXT_LIMITS.secondaryTitle, 0),
      secondaryDescription: normalizeText(content.secondaryDescription, t('aboutSecondaryDescription'), MAX_TEXT_LIMITS.secondaryDescription, 1),
      imageAlt: normalizeText(content.imageAlt, t('defaultImageAlt'), MAX_TEXT_LIMITS.imageAlt, 0),
      image: content.image || '',
      imageDeleteToken: content.imageDeleteToken || '',
      imageSize: content.imageSize || 0,
      pendingImage: content.pendingImage || null,
  }), [content, t]);

  // Estilos globais cacheados
  const sectionTone = isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900';
  const cardTone = isDark ? 'bg-slate-900 border-slate-800 shadow-[0_10px_40px_rgba(0,0,0,0.35)]' : 'bg-white border-slate-200 shadow-sm';
  const softCardTone = isDark ? 'bg-slate-900/70 border-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.25)]' : 'bg-slate-50 border-slate-200 shadow-sm';
  const hintTone = isDark ? 'border-indigo-900/40 bg-indigo-950/40 text-indigo-200' : 'border-indigo-300 bg-indigo-100 text-indigo-900';

  const imageSrc = previewUrl || resolved.image || DEFAULT_IMAGE;
  const weightText = selectedFile ? formatBytes(selectedFile.size) : resolved.imageSize ? formatBytes(resolved.imageSize) : t('defaultImage');
  const overLimit = !!selectedFile && selectedFile.size > MAX_IMAGE_SIZE_BYTES;

  const setPendingToParent = useCallback((file: File | null) => {
    onUpdate?.('pendingImage', file ? { isTemp: true, size: file.size, name: file.name, updatedAt: Date.now() } : null);
  }, [onUpdate]);

  const clearPreview = useCallback((clearPending: boolean = true) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    setLocalError('');
    if (clearPending) setPendingToParent(null);
  }, [setPendingToParent]);

  const handleChooseFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalError('');
    if (!file.type.startsWith('image/')) {
      setLocalError(t('imageTypeError'));
      toast.error(t('imageTypeError'));
      return;
    }

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setSelectedFile(file);
    setPreviewUrl(url);
    setPendingToParent(file);

    file.size > MAX_IMAGE_SIZE_BYTES ? setLocalError(t('imageTooLargeMustCompress')) : toast.success(t('imageSelectedConfirmToSave'));
    e.target.value = '';
  }, [t, setPendingToParent]);

  const handleConfirmUpload = useCallback(async () => {
    if (!selectedFile) return;
    if (selectedFile.size > MAX_IMAGE_SIZE_BYTES) {
      setLocalError(t('imageTooLargeMustCompress'));
      toast.error(t('imageTooLargeMustCompress'));
      return;
    }

    try {
      setIsUploading(true);
      setLocalError('');
      const uploaded = await uploadImageToCloudinary(selectedFile);

      onUpdate?.('image', uploaded.url);
      onUpdate?.('imageDeleteToken', uploaded.delete_token || '');
      onUpdate?.('imageSize', uploaded.size || selectedFile.size);
      onUpdate?.('pendingImage', null);

      if (!content.imageAlt?.trim()) onUpdate?.('imageAlt', t('defaultImageAlt'));

      toast.success(t('imageSavedSuccess'));
      clearPreview(false);
    } catch (err: any) {
      const message = err?.message || t('imageUploadError');
      setLocalError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, onUpdate, content.imageAlt, t, clearPreview]);

  const handleCancelPendingImage = useCallback(() => {
    clearPreview(true);
    toast.success(t('imageSelectionCancelled'));
  }, [clearPreview, t]);
  
  const handleRemoveImage = useCallback(async () => {
    try {
      setLocalError('');
      if (resolved.imageDeleteToken) {
        const deleted = await deleteFromCloudinary({ delete_token: resolved.imageDeleteToken });
        if (!deleted) { toast.error(t('imageRemoveError')); return; }
      }

      onUpdate?.('image', '');
      onUpdate?.('imageDeleteToken', '');
      onUpdate?.('imageSize', 0);
      onUpdate?.('pendingImage', null);

      clearPreview(true);
      toast.success(t('imageRemoved'));
    } catch (err: any) {
      const message = err?.message || t('imageRemoveError');
      setLocalError(message);
      toast.error(message);
    }
  }, [resolved.imageDeleteToken, onUpdate, clearPreview, t]);

  // Props base injetadas para simplificar a passagem pros filhos memoizados
  const sharedProps = { resolved, update, isEditable, isDark, alignClass, style, t };

  return (
    // 'content-visibility' Otimiza muito a performance de Render caso a secção esteja fora do ecrã
    <section className={`relative overflow-hidden py-10 md:py-14 transition-colors duration-300 ${getTheme(style.theme)} ${sectionTone}`} style={{ contentVisibility: 'auto' }}>
      <div className="mx-auto max-w-6xl 2xl:max-w-7xl px-4 md:px-6">
        {isEditable && (
          <div className={`mb-4 rounded-2xl border px-4 py-3 text-[14px] font-bold ${hintTone}`}>
            {t('imageSectionSimpleHelp')}
          </div>
        )}

        {layout === '1' && (
          <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2">
            <div className={`rounded-[24px] border p-4 shadow-sm h-full min-w-0 ${softCardTone}`}>
              <ImageCard {...sharedProps} imageSrc={imageSrc} imageAlt={resolved.imageAlt} resolvedImage={resolved.image} selectedFile={selectedFile} isUploading={isUploading} localError={localError} overLimit={overLimit} weightText={weightText} heightClass="h-[260px] md:h-[360px]" fileInputRef={fileInputRef} handleChooseFile={handleChooseFile} handleConfirmUpload={handleConfirmUpload} handleCancelPendingImage={handleCancelPendingImage} handleRemoveImage={handleRemoveImage} />
            </div>
            <AboutCard {...sharedProps} cardTone={cardTone} />
            <div className="md:col-span-2">
              <div className={`rounded-[24px] border p-5 shadow-sm h-full min-w-0 ${cardTone}`}>
                <WhoAmIInner {...sharedProps} />
              </div>
            </div>
          </div>
        )}

        {layout === '2' && (
          <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className={`rounded-[24px] border p-4 shadow-sm h-full min-w-0 ${softCardTone}`}>
              <div className="flex h-full min-w-0 flex-col gap-4">
                <ImageCard {...sharedProps} imageSrc={imageSrc} imageAlt={resolved.imageAlt} resolvedImage={resolved.image} selectedFile={selectedFile} isUploading={isUploading} localError={localError} overLimit={overLimit} weightText={weightText} heightClass="h-[240px] md:h-[300px]" fileInputRef={fileInputRef} handleChooseFile={handleChooseFile} handleConfirmUpload={handleConfirmUpload} handleCancelPendingImage={handleCancelPendingImage} handleRemoveImage={handleRemoveImage} />
                <div className="min-w-0 rounded-[20px] border border-inherit bg-transparent p-4">
                  <WhoAmIInner {...sharedProps} />
                </div>
              </div>
            </div>
            <AboutCard {...sharedProps} cardTone={cardTone} />
          </div>
        )}

        {layout === '4' && (
          <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            <div className="h-full min-w-0 sm:col-span-2 xl:col-span-2">
              <AboutCard {...sharedProps} cardTone={cardTone} />
            </div>
            <div className="h-full min-w-0">
               <div className={`rounded-[24px] border p-4 shadow-sm h-full min-w-0 ${softCardTone}`}>
                 <ImageCard {...sharedProps} imageSrc={imageSrc} imageAlt={resolved.imageAlt} resolvedImage={resolved.image} selectedFile={selectedFile} isUploading={isUploading} localError={localError} overLimit={overLimit} weightText={weightText} heightClass="h-[220px] md:h-[280px]" fileInputRef={fileInputRef} handleChooseFile={handleChooseFile} handleConfirmUpload={handleConfirmUpload} handleCancelPendingImage={handleCancelPendingImage} handleRemoveImage={handleRemoveImage} />
               </div>
            </div>
            <div className="h-full min-w-0">
              <div className={`rounded-[24px] border p-5 shadow-sm h-full min-w-0 ${cardTone}`}>
                <WhoAmIInner {...sharedProps} />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export const TextoImagemShowcase = memo(
  TextoImagemShowcaseComponent,
  (prevProps, nextProps) => prevProps.style === nextProps.style && prevProps.content === nextProps.content
);
TextoImagemShowcase.displayName = 'TextoImagemShowcase';