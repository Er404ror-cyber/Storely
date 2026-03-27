import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ElementType,
} from 'react';
import { toast } from 'react-hot-toast';
import {
  getTheme,
  getFontSize,
  editableProps,
  MAX_TEXT_LIMITS,
  MAX_IMAGE_SIZE_MB,
  MAX_IMAGE_SIZE_BYTES,
  normalizeText,
  clampText,
  handleEditableKeyDown,
  handleEditablePaste,
  formatBytes,
  uploadImageToCloudinary,
  deleteFromCloudinary,
} from '../helpers';
import type { SectionProps } from '../main';
import { useTranslate } from '../../../context/LanguageContext';
import { Camera, Trash2, Upload } from 'lucide-react';

interface TextoImagemContent {
  badge?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  secondaryTitle?: string;
  secondaryDescription?: string;
  image?: string;
  imageAlt?: string;
  imageDeleteToken?: string;
  imageSize?: number;
  pendingImage?: {
    isTemp: boolean;
    size: number;
    name?: string;
    updatedAt: number;
  } | null;
}

interface TextoImagemShowcaseProps extends Omit<SectionProps, 'content'> {
  content: TextoImagemContent;
}

type TranslateFn = ReturnType<typeof useTranslate>['t'];

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop';

const COMPRESS_LINK = 'https://www.iloveimg.com/compress-image';

const alignMap = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  justify: 'items-start text-justify',
} as const;

const FieldCounter = memo(
  ({ value, max, isDark }: { value: string; max: number; isDark: boolean }) => (
    <div
      className={`mt-1 text-[10px] font-bold ${
        isDark ? 'text-slate-500' : 'text-slate-400'
      }`}
    >
      {value.length}/{max}
    </div>
  )
);

FieldCounter.displayName = 'FieldCounter';

interface EditableFieldProps {
  as?: ElementType;
  value: string;
  fallback: string;
  max: number;
  maxBreaks?: number;
  singleLine?: boolean;
  isEditable: boolean;
  isDark: boolean;
  className?: string;
  t: TranslateFn;
  onUpdate: (val: string) => void;
}

const EditableField = memo(
  ({
    as: Tag = 'p',
    value,
    fallback,
    max,
    maxBreaks = 1,
    singleLine = false,
    isEditable,
    isDark,
    className,
    t,
    onUpdate,
  }: EditableFieldProps) => {
    return (
      <div className="w-full min-w-0 max-w-none">
        <Tag
          {...editableProps(isEditable, onUpdate)}
          onBlur={(e: React.FocusEvent<HTMLElement>) => {
            const raw = e.currentTarget.innerText.replace(/\u00A0/g, ' ').trim();
            const next = raw.length ? clampText(raw, max, maxBreaks) : fallback;
            e.currentTarget.innerText = next;
            onUpdate(next);
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLElement>) =>
            handleEditableKeyDown(
              e,
              max,
              maxBreaks,
              singleLine,
              t as (key: string, vars?: Record<string, string | number>) => string
            )
          }
          onPaste={(e: React.ClipboardEvent<HTMLElement>) =>
            handleEditablePaste(e, max, maxBreaks)
          }
          data-placeholder={fallback}
          className={[
            className || '',
            'min-w-0 max-w-none break-words whitespace-pre-wrap overflow-hidden',
            isEditable
              ? 'rounded-xl border border-dashed border-transparent px-2 py-1 focus:border-slate-300 dark:focus:border-slate-700 outline-none cursor-text'
              : '',
            isDark ? 'empty:before:text-slate-500' : 'empty:before:text-slate-400',
            'empty:before:content-[attr(data-placeholder)]',
          ].join(' ')}
        >
          {value}
        </Tag>

        {isEditable && <FieldCounter value={value} max={max} isDark={isDark} />}
      </div>
    );
  }
);
EditableField.displayName = 'EditableField';

const TextoImagemShowcaseComponent: React.FC<TextoImagemShowcaseProps> = ({
  content,
  style,
  onUpdate,
}) => {
  const { t } = useTranslate();
  const isEditable = !!onUpdate;
  const isDark = style.theme === 'dark';
  const layout = style.cols ?? '1';
  const alignClass = alignMap[style.align || 'left'];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const update = useCallback(
    (field: string, max: number, maxBreaks: number = 1) => (value: string) => {
      onUpdate?.(field, clampText(value, max, maxBreaks));
    },
    [onUpdate]
  );

  const resolved = useMemo(
    () => ({
      badge: normalizeText(content.badge, t('aboutBadge'), MAX_TEXT_LIMITS.badge, 0),
      title: normalizeText(content.title, t('aboutTitle'), MAX_TEXT_LIMITS.title, 2),
      subtitle: normalizeText(
        content.subtitle,
        t('aboutSubtitle'),
        MAX_TEXT_LIMITS.subtitle,
        1
      ),
      description: normalizeText(
        content.description,
        t('aboutDescription'),
        MAX_TEXT_LIMITS.description,
        1
      ),
      secondaryTitle: normalizeText(
        content.secondaryTitle,
        t('aboutSecondaryTitle'),
        MAX_TEXT_LIMITS.secondaryTitle,
        0
      ),
      secondaryDescription: normalizeText(
        content.secondaryDescription,
        t('aboutSecondaryDescription'),
        MAX_TEXT_LIMITS.secondaryDescription,
        1
      ),
      imageAlt: normalizeText(
        content.imageAlt,
        t('defaultImageAlt'),
        MAX_TEXT_LIMITS.imageAlt,
        0
      ),
      image: content.image || '',
      imageDeleteToken: content.imageDeleteToken || '',
      imageSize: content.imageSize || 0,
      pendingImage: content.pendingImage || null,
    }),
    [content, t]
  );

  const sectionTone = isDark
    ? 'bg-slate-950 text-slate-100'
    : 'bg-white text-slate-900';

  const cardTone = isDark
    ? 'bg-slate-900 border-slate-800 shadow-[0_10px_40px_rgba(0,0,0,0.35)]'
    : 'bg-white border-slate-200 shadow-sm';

  const softCardTone = isDark
    ? 'bg-slate-900/70 border-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.25)]'
    : 'bg-slate-50 border-slate-200 shadow-sm';

  const mutedTone = isDark ? 'text-slate-300' : 'text-slate-700';

  const badgeTone = isDark
    ? 'bg-slate-800/90 border-slate-700 text-slate-100'
    : 'bg-slate-100 border-slate-300 text-slate-900';

  const hintTone = isDark
    ? 'border-slate-700 bg-slate-900/60 text-slate-300'
    : 'border-slate-300 bg-slate-50 text-slate-600';

  const buttonTone = isDark
    ? 'bg-white text-slate-900 hover:bg-slate-100'
    : 'bg-slate-900 text-white hover:bg-slate-800';

  const ghostButtonTone = isDark
    ? 'bg-slate-800 text-slate-100 hover:bg-slate-700'
    : 'bg-slate-100 text-slate-900 hover:bg-slate-200';

  const imageSrc = previewUrl || resolved.image || DEFAULT_IMAGE;

  const weightText = selectedFile
    ? formatBytes(selectedFile.size)
    : resolved.imageSize
      ? formatBytes(resolved.imageSize)
      : t('defaultImage');

  const overLimit = !!selectedFile && selectedFile.size > MAX_IMAGE_SIZE_BYTES;

  const setPendingToParent = useCallback(
    (file: File | null) => {
      onUpdate?.(
        'pendingImage',
        file
          ? {
              isTemp: true,
              size: file.size,
              name: file.name,
              updatedAt: Date.now(),
            }
          : null
      );
    },
    [onUpdate]
  );

  const clearPreview = useCallback(
    (clearPending: boolean = true) => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }

      setPreviewUrl(null);
      setSelectedFile(null);
      setLocalError('');

      if (clearPending) {
        setPendingToParent(null);
      }
    },
    [setPendingToParent]
  );

  const handleChooseFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setLocalError('');

      if (!file.type.startsWith('image/')) {
        const message = t('imageTypeError');
        setLocalError(message);
        toast.error(message);
        return;
      }

      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);

      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;

      setSelectedFile(file);
      setPreviewUrl(url);
      setPendingToParent(file);

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setLocalError(t('imageTooLargeMustCompress'));
      } else {
        toast.success(t('imageSelectedConfirmToSave'));
      }

      e.target.value = '';
    },
    [t, setPendingToParent]
  );

  const handleConfirmUpload = useCallback(async () => {
    if (!selectedFile) return;

    if (selectedFile.size > MAX_IMAGE_SIZE_BYTES) {
      const message = t('imageTooLargeMustCompress');
      setLocalError(message);
      toast.error(message);
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

      if (!content.imageAlt?.trim()) {
        onUpdate?.('imageAlt', t('defaultImageAlt'));
      }

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
        const deleted = await deleteFromCloudinary({
          delete_token: resolved.imageDeleteToken,
        });
  
        if (!deleted) {
          toast.error(t('imageRemoveError'));
          return;
        }
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

  const renderImageBlock = (heightClass = 'h-[240px] md:h-[320px]') => (
    <div className="overflow-hidden rounded-2xl">
      <img
        src={imageSrc}
        alt={resolved.imageAlt}
        className={`${heightClass} w-full object-cover`}
        loading="lazy"
        decoding="async"
      />
    </div>
  );

  const renderImageActions = () => (
    <>
      {isEditable && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleChooseFile}
          />
{  !overLimit &&
          <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300">
            {!selectedFile
              ? t('imageReadyConfirmHelp')
              : t('imageSectionSimpleHelp')}
          </div>}

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-3 text-base font-black transition ${buttonTone}`}
            >
              <Camera size={16} />
              {resolved.image || selectedFile ? t('changePhoto') : t('choosePhoto')}
            </button>

            {!!selectedFile && !overLimit && (
              <button
                type="button"
                onClick={handleConfirmUpload}
                disabled={isUploading}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-base font-black text-white transition hover:bg-emerald-500 disabled:opacity-60"
              >
                <Upload size={16} />
                {isUploading ? t('savingPhoto') : t('confirmPhoto')}
              </button>
            )}

{(resolved.image || selectedFile) && (
  <button
    type="button"
    onClick={selectedFile ? handleCancelPendingImage : handleRemoveImage}
    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-3 text-base font-black transition ${ghostButtonTone}`}
  >
    <Trash2 size={16} />
    {selectedFile ? t('cancel') : t('removePhoto')}
  </button>
)}
          </div>
          {overLimit && (
          <a
            href={COMPRESS_LINK}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block  underline-offset-2"
          >
            <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-700 dark:text-amber-300">
              <div>{t('imageTooLargeMustCompress')}</div>
                {t('compressPhotoLink')}
            </div>
              </a>
          )}

          <div
            className={`mt-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${
              isDark
                ? 'border-slate-800 bg-slate-900/80 text-slate-300'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            <div>
              {t('imageWeight')}: {weightText}
            </div>
            <div>{t('imageSizeLimit', { size: String(MAX_IMAGE_SIZE_MB) })}</div>
            {!!selectedFile && !overLimit && (
              <div className="mt-1 font-black text-emerald-600 dark:text-emerald-400">
                {t('confirmPhoto')}
              </div>
            )}
          </div>

          {!!localError && (
            <div className="mt-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400">
              {localError}
            </div>
          )}

         
        </>
      )}
    </>
  );

  const renderWhoAmIInner = () => (
    <div className={`flex flex-col gap-3 min-w-0 ${alignClass}`}>
      <EditableField
        as="h3"
        value={resolved.secondaryTitle}
        fallback={t('aboutSecondaryTitle')}
        max={MAX_TEXT_LIMITS.secondaryTitle}
        maxBreaks={0}
        singleLine
        isEditable={isEditable}
        isDark={isDark}
        t={t}
        onUpdate={update('secondaryTitle', MAX_TEXT_LIMITS.secondaryTitle, 0)}
        className={`${getFontSize(style.fontSize, 'h3')} font-bold`}
      />

      <EditableField
        as="p"
        value={resolved.secondaryDescription}
        fallback={t('aboutSecondaryDescription')}
        max={MAX_TEXT_LIMITS.secondaryDescription}
        maxBreaks={1}
        isEditable={isEditable}
        isDark={isDark}
        t={t}
        onUpdate={update(
          'secondaryDescription',
          MAX_TEXT_LIMITS.secondaryDescription,
          1
        )}
        className={`${getFontSize(style.fontSize, 'p')} leading-7 ${mutedTone}`}
      />
    </div>
  );

  const renderWhoAmICard = () => (
    <div className={`rounded-[24px] border p-5 shadow-sm h-full min-w-0 ${cardTone}`}>
      {renderWhoAmIInner()}
    </div>
  );

  const renderAboutCard = () => (
    <div className={`rounded-[24px] border p-5 shadow-sm h-full min-w-0 ${cardTone}`}>
      <div className={`flex flex-col gap-3 min-w-0 ${alignClass}`}>
        <span
          className={`inline-flex w-fit max-w-full rounded-full border px-3 py-1 text-xs font-black uppercase tracking-widest ${badgeTone}`}
        >
          <EditableField
            as="span"
            value={resolved.badge}
            fallback={t('aboutBadge')}
            max={MAX_TEXT_LIMITS.badge}
            maxBreaks={0}
            singleLine
            isEditable={isEditable}
            isDark={isDark}
            t={t}
            onUpdate={update('badge', MAX_TEXT_LIMITS.badge, 0)}
          />
        </span>

        <EditableField
          as="h2"
          value={resolved.title}
          fallback={t('aboutTitle')}
          max={MAX_TEXT_LIMITS.title}
          maxBreaks={2}
          isEditable={isEditable}
          isDark={isDark}
          t={t}
          onUpdate={update('title', MAX_TEXT_LIMITS.title, 2)}
          className={`${getFontSize(style.fontSize, 'h2')} font-black leading-tight`}
        />

        <EditableField
          as="h3"
          value={resolved.subtitle}
          fallback={t('aboutSubtitle')}
          max={MAX_TEXT_LIMITS.subtitle}
          maxBreaks={1}
          isEditable={isEditable}
          isDark={isDark}
          t={t}
          onUpdate={update('subtitle', MAX_TEXT_LIMITS.subtitle, 1)}
          className={`${getFontSize(style.fontSize, 'h3')} font-semibold ${mutedTone}`}
        />

        <EditableField
          as="p"
          value={resolved.description}
          fallback={t('aboutDescription')}
          max={MAX_TEXT_LIMITS.description}
          maxBreaks={1}
          isEditable={isEditable}
          isDark={isDark}
          t={t}
          onUpdate={update('description', MAX_TEXT_LIMITS.description, 1)}
          className={`${getFontSize(style.fontSize, 'p')} leading-7 ${mutedTone}`}
        />
      </div>
    </div>
  );

  const renderImageCardWithWhoAmI = (heightClass = 'h-[240px] md:h-[300px]') => (
    <div className={`rounded-[24px] border p-4 shadow-sm h-full min-w-0 ${softCardTone}`}>
      <div className="flex h-full min-w-0 flex-col gap-4">
        <div className="min-w-0">
          {renderImageBlock(heightClass)}
          {renderImageActions()}
        </div>

        <div className="min-w-0 rounded-[20px] border border-inherit bg-transparent p-4">
          {renderWhoAmIInner()}
        </div>
      </div>
    </div>
  );

  const renderSimpleImageCard = (heightClass = 'h-[240px] md:h-[320px]') => (
    <div className={`rounded-[24px] border p-4 shadow-sm h-full min-w-0 ${softCardTone}`}>
      {renderImageBlock(heightClass)}
      {renderImageActions()}
    </div>
  );

  return (
    <section
      className={`relative overflow-hidden py-10 md:py-14 transition-all duration-300 ${getTheme(
        style.theme
      )} ${sectionTone}`}
    >
      <div className="mx-auto max-w-6xl 2xl:max-w-7xl px-4 md:px-6">
        {isEditable && (
          <div
            className={`mb-4 rounded-2xl border border-dashed px-4 py-3 text-sm font-semibold ${hintTone}`}
          >
            {t('imageSectionSimpleHelp')}
          </div>
        )}

        {layout === '1' && (
          <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2">
            {renderSimpleImageCard('h-[260px] md:h-[360px]')}
            {renderAboutCard()}
            <div className="md:col-span-2">{renderWhoAmICard()}</div>
          </div>
        )}

        {layout === '2' && (
          <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            {renderImageCardWithWhoAmI('h-[240px] md:h-[300px]')}
            {renderAboutCard()}
          </div>
        )}

        {layout === '4' && (
          <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            <div className="h-full min-w-0 sm:col-span-2 xl:col-span-2">
              {renderAboutCard()}
            </div>

            <div className="h-full min-w-0">
              {renderSimpleImageCard('h-[220px] md:h-[280px]')}
            </div>

            <div className="h-full min-w-0">
              {renderWhoAmICard()}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export const TextoImagemShowcase = memo(
  TextoImagemShowcaseComponent,
  (prevProps, nextProps) =>
    prevProps.style === nextProps.style &&
    prevProps.content === nextProps.content
);

TextoImagemShowcase.displayName = 'TextoImagemShowcase';