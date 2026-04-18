import React, { useState, useRef, useEffect, useCallback, memo, useMemo } from 'react';
import { Camera, MessageCircle, CloudLightning, Settings } from 'lucide-react';
import {
  getTheme,
  getFontSize,
  editableProps,
  handleFileUpload,
  saveAllToCloudinary,
} from '../helpers';
import { MediaRenderer, type MediaData } from '../mediarender';
import type { SectionProps } from '../main';
import { toast } from 'react-hot-toast';
import { useTranslate } from '../../../context/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

interface HeroContentData {
  title?: string;
  sub?: string;
  badge?: string;
  btnText?: string;
  phone?: string;
  hero_subtitle?: string;
  media?: MediaData & { isTemp?: boolean; size?: number };
}

interface HeroProps extends Omit<SectionProps, 'content'> {
  content: HeroContentData;
}

type StoreData = {
  id: string;
  name: string;
  logo_url: string | null;
  whatsapp_number: string | null;
};

type MediaContent = {
  url: string;
  size: number;
  file?: File;
  type?: 'image' | 'video';
  isTemp?: boolean;
};

const LIMITS = { BADGE: 15, TITLE: 35, SUBTITLE: 75, SUBTITLE_EXTRA: 25, BUTTON: 12 };
const FILE_LIMITS = { image: 1, video: 5 };

interface WhatsAppButtonProps {
  isEditable: boolean;
  isLoadingNumber?: boolean;
  content: {
    phone?: string;
    btnText?: string;
  };
  t: (key: string) => string;
  onUpdate?: (field: string, value: string) => void;
  isCenter?: boolean;
}

const WhatsAppButton = memo(
  ({
    isEditable,
    isLoadingNumber = false,
    content,
    t,
    onUpdate,
    isCenter,
  }: WhatsAppButtonProps) => {
    const cleanPhone = (content.phone || '').replace(/\D/g, '');
    const isValid = cleanPhone.length > 0;

    const handleTextUpdate = useCallback(
      (val: string) => {
        const defaultText = t('defaultBtn');
        const trimmedValue = val.trim();
        const finalValue =
          trimmedValue.length > 0
            ? trimmedValue.substring(0, LIMITS.BUTTON)
            : defaultText;

        onUpdate?.('btnText', finalValue);
      },
      [onUpdate, t]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLElement>, max: number) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.currentTarget.blur();
          return;
        }

        if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) return;

        if (e.currentTarget.innerText.length >= max) {
          e.preventDefault();
          toast.error(t('limits').replace('{max}', max.toString()), { id: 'limit' });
        }
      },
      [t]
    );

    const handlePaste = useCallback((e: React.ClipboardEvent<HTMLElement>, max: number) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text').substring(0, max);
      document.execCommand('insertText', false, text);
    }, []);

    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        if (isEditable || !isValid) e.preventDefault();
      },
      [isEditable, isValid]
    );

    if (!isEditable) {
      if (isLoadingNumber) return null;
      if (!isValid) return null;
    }

    return (
      <div className={`mt-5 flex flex-col gap-2 ${isCenter ? 'items-center' : 'items-start'}`}>
        <a
          href={!isEditable && isValid ? `https://wa.me/${cleanPhone}` : undefined}
          onClick={handleClick}
          target="_blank"
          rel="noreferrer"
          className={`h-[44px] w-[190px] flex items-center justify-center gap-2 rounded-lg font-bold shadow-sm no-underline shrink-0 z-10 transition-colors transition-transform ${
            isValid
              ? 'bg-[#25D366] text-white hover:brightness-110 active:scale-95'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60 grayscale'
          }`}
          aria-disabled={!isValid}
        >
          <MessageCircle size={18} />
          <span
            {...editableProps(isEditable, handleTextUpdate)}
            onKeyDown={(e) => handleKeyDown(e, LIMITS.BUTTON)}
            onPaste={(e) => handlePaste(e, LIMITS.BUTTON)}
            suppressContentEditableWarning={true}
            className="truncate text-sm outline-none font-bold min-w-[20px] text-center"
          >
            {content.btnText && content.btnText.trim().length > 0
              ? content.btnText
              : t('defaultBtn')}
          </span>
        </a>
      </div>
    );
  }
);

WhatsAppButton.displayName = 'WhatsAppButton';

interface AdminControlsProps {
  isEditable: boolean;
  isMounted: boolean;
  content: {
    phone?: string;
    media?: { size?: number };
  };
  isCenter?: boolean;
  isDark?: boolean;
  t: (key: string) => string;
  onUpdate?: (field: string, value: string | number | null | MediaContent) => void;
  handleSync: () => void;
  isSyncing: boolean;
  mediaSizeMB: number;
  currentLimit: number;
  isOverLimit: boolean;
  isTemp: boolean;
  mediaType: 'image' | 'video';
}

const AdminControls = memo(
  ({
    isEditable,
    isMounted,
    content,
    isCenter,
    isDark,
    t,
    onUpdate,
    handleSync,
    isSyncing,
    mediaSizeMB,
    currentLimit,
    isOverLimit,
    isTemp,
    mediaType,
  }: AdminControlsProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePickFile = useCallback(() => {
      fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        handleFileUpload(file, (newMedia) => {
          const normalizedMedia: MediaContent = {
            ...newMedia,
            size: newMedia.size ?? 0,
          };

          onUpdate?.('media', normalizedMedia);
        });

        e.target.value = '';
      },
      [onUpdate]
    );

    const hasPhone = !!(content.phone && content.phone.replace(/\D/g, '').length > 0);

    if (!isEditable || !isMounted) return null;

    return (
      <div
        className={`mt-5 w-full max-w-[270px] rounded-xl border p-3 flex flex-col gap-3 ${
          isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'
        } ${isCenter ? 'mx-auto' : 'mr-auto'}`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-black uppercase tracking-wide text-slate-400">
            {t('mediaSettings')}
          </span>

          <span
            className={`text-[9px] font-black px-2 py-1 rounded-full ${
              hasPhone
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-amber-50 text-amber-600'
            }`}
          >
            {hasPhone ? t('whatsappActive') : t('numberMissing')}
          </span>
        </div>

        {!hasPhone && (
          <div className="rounded-lg border-amber-200 bg-amber-50 px-3 py-2">
            <div className="flex items-center gap-2 mb-1">
              <Settings size={14} className="text-amber-600 shrink-0" />
              <span className="text-[10px] font-black text-amber-700">
              {t('addNumberHint')}
                            </span>
            </div>
            
          </div>
        )}

        <button
          type="button"
          onClick={handlePickFile}
          className={`h-11 rounded-lg font-black text-[10px] uppercase transition-colors flex items-center justify-center gap-2 ${
            isOverLimit
              ? 'bg-red-50 text-red-600 border border-red-200'
              : 'bg-blue-600 text-white'
          }`}
        >
          <Camera size={14} />
          {isOverLimit ? t('tryAnother') : t('changeMedia')}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,video/*"
          onChange={handleFileChange}
        />

        {!!content.media?.size && (
          <div className="rounded-lg border border-slate-200 px-3 py-2 flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold text-slate-500">
              {t('weight')}
            </span>
            <span
              className={`text-[10px] font-black ${
                isOverLimit ? 'text-red-600' : 'text-emerald-600'
              }`}
            >
              {mediaSizeMB.toFixed(2)} MB / {currentLimit} MB
            </span>
          </div>
        )}

        {isOverLimit && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 flex flex-col gap-2">
            <p className="text-[10px] font-bold text-red-600 leading-tight">
              {t('limitExceeded')}
            </p>

            <a
              href={
                mediaType === 'video'
                  ? 'https://www.freeconvert.com/video-compressor'
                  : 'https://tinypng.com/'
              }
              target="_blank"
              rel="noreferrer"
              className="h-9 rounded-lg bg-white border border-red-200 text-red-600 text-[10px] font-black flex items-center justify-center no-underline"
            >
              {t('compressNow')}
            </a>
          </div>
        )}

        {isTemp && !isOverLimit && (
          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            className="h-11 rounded-lg bg-emerald-500 text-white font-black text-[10px] uppercase flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSyncing ? (
              t('syncing')
            ) : (
              <>
                <CloudLightning size={14} />
                {t('syncNow')}
              </>
            )}
          </button>
        )}
      </div>
    );
  }
);

AdminControls.displayName = 'AdminControls';

const HeroTextFields = memo(
  ({ content, isEditable, isDark, isDarkBg, style, t, onUpdate, isCenter }: any) => {
    const textColor = isDark || isDarkBg ? 'text-white' : 'text-slate-900';

    const handleBlurValidation = (
      e: React.FocusEvent<HTMLElement>,
      key: string,
      defaultValue: string,
      limit: number
    ) => {
      const rawText = e.currentTarget.innerText;
      const cleanValue = rawText.replace(/&nbsp;/g, ' ').trim();

      if (cleanValue.length === 0) {
        e.currentTarget.innerText = defaultValue;
        onUpdate?.(key, defaultValue);
      } else {
        onUpdate?.(key, cleanValue.substring(0, limit));
      }
    };

    const handleKeyValidation = (
      e: React.KeyboardEvent<HTMLElement>,
      maxChars: number,
      maxLines: number
    ) => {
      const text = e.currentTarget.innerText;
      const lineBreaks = (text.match(/\n/g) || []).length;

      if (e.key === 'Enter') {
        if (lineBreaks >= maxLines - 1) {
          e.preventDefault();
          toast.error(t('limitLines') || `Máximo de ${maxLines} linhas permitido`, {
            id: 'line-limit',
          });
          return;
        }
        return;
      }

      if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) return;

      if (text.length >= maxChars) {
        e.preventDefault();
        toast.error(t('limits').replace('{max}', maxChars.toString()), {
          id: 'limit-reached',
        });
      }
    };

    const handlePaste = (
      e: React.ClipboardEvent<HTMLElement>,
      maxChars: number,
      maxLines: number
    ) => {
      e.preventDefault();
      const rawPastedText = e.clipboardData.getData('text/plain');
      const lines = rawPastedText
        .split(/\r?\n/)
        .filter((line) => line.length > 0)
        .slice(0, maxLines);
      const filteredText = lines.join('\n').substring(0, maxChars);

      const selection = window.getSelection();
      if (!selection?.rangeCount) return;

      selection.deleteFromDocument();
      selection.getRangeAt(0).insertNode(document.createTextNode(filteredText));
      selection.collapseToEnd();
    };

    return (
      <div
        className={`w-full flex flex-col ${isCenter ? 'items-center text-center' : 'items-start text-left'}`}
      >
        <span
          {...editableProps(isEditable, () => {})}
          onBlur={(e) => handleBlurValidation(e, 'badge', t('defaultBadge'), LIMITS.BADGE)}
          onKeyDown={(e) => handleKeyValidation(e, LIMITS.BADGE, 1)}
          onPaste={(e) => handlePaste(e, LIMITS.BADGE, 1)}
          className={`inline-block px-2.5 py-1 mb-4 text-[9px] font-bold rounded-full uppercase tracking-widest w-fit outline-none max-h-[24px] overflow-hidden whitespace-nowrap ${
            isDark || isDarkBg ? 'bg-white/10 text-white' : 'bg-blue-500/10 text-blue-500'
          }`}
        >
          {content.badge || t('defaultBadge')}
        </span>

        <h1
          {...editableProps(isEditable, () => {})}
          onBlur={(e) => handleBlurValidation(e, 'title', t('defaultTitle'), LIMITS.TITLE)}
          onKeyDown={(e) => handleKeyValidation(e, LIMITS.TITLE, 3)}
          onPaste={(e) => handlePaste(e, LIMITS.TITLE, 3)}
          className={`${getFontSize(style.fontSize, 'h1')} mb-3 tracking-tighter leading-[1.05] ${textColor} outline-none max-w-[15ch] break-words whitespace-pre-wrap max-h-[3.3em] overflow-hidden italic font-serif font-black`}
        >
          {content.title || t('defaultTitle')}
        </h1>

        <div
          className={`max-w-xs xl:max-w-sm border-l-2 border-blue-600 pl-3 mb-8 ${isCenter ? 'border-none pl-0' : ''}`}
        >
          <p
            {...editableProps(isEditable, () => {})}
            onBlur={(e) => handleBlurValidation(e, 'sub', t('defaultSub'), LIMITS.SUBTITLE)}
            onKeyDown={(e) => handleKeyValidation(e, LIMITS.SUBTITLE, 3)}
            onPaste={(e) => handlePaste(e, LIMITS.SUBTITLE, 3)}
            className={`${getFontSize(style.fontSize, 'p')} ${textColor} opacity-80 font-medium leading-snug outline-none break-words w-full whitespace-pre-wrap max-h-[4.5em] overflow-hidden`}
          >
            {content.sub || t('defaultSub')}
          </p>

          <p
            {...editableProps(isEditable, () => {})}
            onBlur={(e) =>
              handleBlurValidation(
                e,
                'hero_subtitle',
                t('hero_subtitle'),
                LIMITS.SUBTITLE_EXTRA
              )
            }
            onKeyDown={(e) => handleKeyValidation(e, LIMITS.SUBTITLE_EXTRA, 1)}
            onPaste={(e) => handlePaste(e, LIMITS.SUBTITLE_EXTRA, 1)}
            className={`font-bold block mt-1 outline-none w-full break-words whitespace-nowrap overflow-hidden max-h-[1.5em] ${
              isDark || isDarkBg ? 'text-zinc-100' : 'text-zinc-900'
            }`}
          >
            {content.hero_subtitle || t('hero_subtitle')}
          </p>
        </div>
      </div>
    );
  }
);

HeroTextFields.displayName = 'HeroTextFields';

const ContentArea = memo(({ commonProps, btnProps, adminProps, isDarkBg = false }: any) => (
  <>
    <HeroTextFields {...commonProps} isDarkBg={isDarkBg} />
    <WhatsAppButton {...btnProps} />
    <AdminControls {...adminProps} />
  </>
));

ContentArea.displayName = 'ContentArea';

const LayoutYoutube = memo(({ isDark, isCenter, content, children }: any) => {
  const bgColorClass = isDark ? 'bg-slate-900' : 'bg-[#c1e8e5]';

  return (
    <div className={`relative w-full ${bgColorClass} flex flex-col sm:flex-row items-stretch overflow-hidden`}>
      <div
        className={`relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 flex ${isCenter ? 'justify-center text-center' : 'justify-start'} items-center`}
      >
        <div className="w-full max-w-xl pt-10 pb-0 mt-16 sm:mt-0 sm:py-20">
          {children}
        </div>
      </div>

      <div className="relative sm:absolute sm:right-0 sm:top-0 w-full sm:w-[55%] h-[400px] sm:h-full z-0 -mt-56 sm:mt-0">
        <div
          className={`absolute inset-0 sm:inset-y-0 sm:left-0 z-10 h-48 sm:h-full sm:w-64 ${
            isDark
              ? 'bg-gradient-to-b sm:bg-gradient-to-r from-slate-900 via-slate-900/70 to-transparent'
              : 'bg-gradient-to-b sm:bg-gradient-to-r from-[#c1e8e5] via-[#c1e8e5]/70 to-transparent'
          }`}
        />

        <MediaRenderer
          media={content.media as MediaData}
          className="w-full h-full object-cover object-top"
        />

        {!isDark && (
          <div className="absolute bottom-0 left-0 z-20 w-12 h-6 bg-white rounded-t-[60px] sm:w-16 sm:h-8" />
        )}
      </div>
    </div>
  );
});

LayoutYoutube.displayName = 'LayoutYoutube';

const LayoutBackground = memo(({ isDark, isCenter, content, children }: any) => (
  <div className="relative w-full min-h-[380px] flex items-center justify-center py-12 px-6">
    <div className="absolute inset-0 z-0">
      <MediaRenderer media={content.media as MediaData} className="w-full h-full object-cover" />
      <div className={`absolute inset-0 ${isDark ? 'bg-black/65' : 'bg-black/35'}`} />
    </div>
    <div
      className={`relative z-10 w-full max-w-4xl flex flex-col ${isCenter ? 'items-center text-center' : 'items-start text-left text-white'}`}
    >
      {children}
    </div>
  </div>
));

LayoutBackground.displayName = 'LayoutBackground';

const LayoutStorely = memo(({ isDark, isCenter, content, children }: any) => {
  return (
    <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-12 py-10">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        <div
          className={`w-full lg:w-[43%] shrink-0 z-10 ${isCenter ? 'text-center items-center flex flex-col' : 'text-left items-start flex flex-col'}`}
        >
          {children}
        </div>

        <div className="w-full lg:w-[55%] relative flex justify-center lg:justify-end z-0 mt-12 lg:mt-0">
          <div
            className={`relative rounded-[2.5rem] overflow-hidden shadow-xl border ${
              isDark ? 'border-white/10' : 'border-gray-100'
            } w-full max-h-[400px] aspect-video lg:aspect-square flex items-center justify-center bg-black/5`}
          >
            <MediaRenderer
              media={content.media as MediaData}
              className="max-w-full max-h-full w-auto h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
});

LayoutStorely.displayName = 'LayoutStorely';

const HeroComercialComponent: React.FC<HeroProps> = ({ content, style, onUpdate }) => {
  const isEditable = !!onUpdate;
  const isDark = style.theme === 'dark';
  const layout = style.cols ?? '1';
  const [isSyncing, setIsSyncing] = useState(false);
  const isCenter = style.align === 'center';
  const [isMounted, setIsMounted] = useState(false);

  const { t } = useTranslate();
  const { storeSlug } = useParams();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: adminStoreData } = useQuery<StoreData | null>({
    queryKey: ['admin-store-whatsapp'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('User not found');

      const { data, error } = await supabase
        .from('stores')
        .select('id, name, logo_url, whatsapp_number')
        .eq('owner_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: isEditable,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const { data: publicStoreData, isLoading: publicStoreLoading } = useQuery<StoreData | null>({
    queryKey: ['public-store-whatsapp', storeSlug],
    queryFn: async () => {
      if (!storeSlug) return null;

      const { data, error } = await supabase
        .from('stores')
        .select('id, name, logo_url, whatsapp_number')
        .eq('slug', storeSlug)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !isEditable && !!storeSlug,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const activeStoreData = isEditable ? adminStoreData : publicStoreData;

  const isLoadingNumber = !isEditable && publicStoreLoading;

  const apiWhatsappNumber = useMemo(() => {
    return activeStoreData?.whatsapp_number?.trim() || '';
  }, [activeStoreData?.whatsapp_number]);

  const resolvedContent = useMemo(
    () => ({
      ...content,
      phone: apiWhatsappNumber,
    }),
    [content, apiWhatsappNumber]
  );

  const mediaType = resolvedContent.media?.type === 'video' ? 'video' : 'image';
  const currentLimit = FILE_LIMITS[mediaType];
  const mediaSizeMB = (resolvedContent.media?.size || 0) / (1024 * 1024);
  const isOverLimit = mediaSizeMB > currentLimit;
  const isTemp = !!resolvedContent.media?.isTemp;

  const handleSync = useCallback(async () => {
    if (!resolvedContent.media || !isTemp || isOverLimit) return;

    setIsSyncing(true);
    const toastId = toast.loading(t('uploading'));

    try {
      const uploaded = await saveAllToCloudinary([resolvedContent.media]);
      if (uploaded[0] && !uploaded[0].isTemp) {
        onUpdate?.('media', uploaded[0]);
        toast.success(t('mediaSaved'), { id: toastId });
      }
    } catch {
      toast.error(t('saveError'), { id: toastId });
    } finally {
      setIsSyncing(false);
    }
  }, [resolvedContent.media, isTemp, isOverLimit, onUpdate, t]);

  const commonProps = useMemo(
    () => ({
      content: resolvedContent,
      isEditable,
      isDark,
      isCenter,
      style,
      t,
      onUpdate,
    }),
    [resolvedContent, isEditable, isDark, isCenter, style, t, onUpdate]
  );

  const adminProps = useMemo(
    () => ({
      ...commonProps,
      isMounted,
      handleSync,
      isSyncing,
      mediaSizeMB,
      currentLimit,
      isOverLimit,
      isTemp,
      mediaType,
    }),
    [
      commonProps,
      isMounted,
      handleSync,
      isSyncing,
      mediaSizeMB,
      currentLimit,
      isOverLimit,
      isTemp,
      mediaType,
    ]
  );

  const btnProps = useMemo(
    () => ({
      ...commonProps,
      isLoadingNumber,
    }),
    [commonProps, isLoadingNumber]
  );

  const contentAreaProps = useMemo(
    () => ({
      commonProps,
      btnProps,
      adminProps,
    }),
    [commonProps, btnProps, adminProps]
  );

  return (
    <section
      className={`relative min-h-[380px] flex items-center overflow-hidden ${getTheme(style.theme)}`}
    >
      {layout === '1' && (
        <LayoutYoutube {...commonProps}>
          <ContentArea {...contentAreaProps} />
        </LayoutYoutube>
      )}

      {layout === '2' && (
        <LayoutBackground {...commonProps}>
          <ContentArea {...contentAreaProps} isDarkBg={true} />
        </LayoutBackground>
      )}

      {layout === '4' && (
        <LayoutStorely {...commonProps}>
          <ContentArea {...contentAreaProps} />
        </LayoutStorely>
      )}

      {layout !== '1' && layout !== '2' && layout !== '4' && (
        <LayoutYoutube {...commonProps}>
          <ContentArea {...contentAreaProps} />
        </LayoutYoutube>
      )}
    </section>
  );
};

export const HeroComercial = memo(HeroComercialComponent, (prevProps, nextProps) => {
  return (
    prevProps.style.theme === nextProps.style.theme &&
    prevProps.style.align === nextProps.style.align &&
    prevProps.style.cols === nextProps.style.cols &&
    prevProps.style.fontSize === nextProps.style.fontSize &&
    prevProps.content.title === nextProps.content.title &&
    prevProps.content.sub === nextProps.content.sub &&
    prevProps.content.badge === nextProps.content.badge &&
    prevProps.content.btnText === nextProps.content.btnText &&
    prevProps.content.hero_subtitle === nextProps.content.hero_subtitle &&
    prevProps.content.phone === nextProps.content.phone &&
    prevProps.content.media?.url === nextProps.content.media?.url &&
    prevProps.content.media?.type === nextProps.content.media?.type &&
    prevProps.content.media?.size === nextProps.content.media?.size &&
    prevProps.content.media?.isTemp === nextProps.content.media?.isTemp &&
    prevProps.onUpdate === nextProps.onUpdate
  );
});

HeroComercial.displayName = 'HeroComercial';