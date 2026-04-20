import React, {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Plus,
  Trash2,
  Music2,
  Facebook,
  Instagram,
  Globe,
  Linkedin,
  Play,
  AtSign,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Image as ImageIcon,
  Video as VideoIcon,
  Link2,
  PinIcon,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslate } from '../../../context/LanguageContext';
import type { SectionProps, SocialProvider } from '../../../types/library';

type EditorItemKind = 'media' | 'social';
type ItemState = 'empty' | 'valid' | 'invalid';

type ExtendedProvider =
  | SocialProvider
  | 'direct_video'
  | 'direct_image'
  | 'pinterest'
  | 'youtube_music'
  | 'netflix';

type EditorSocialLinkItem = {
  id: string;
  kind: EditorItemKind;
  provider?: ExtendedProvider;
  url: string;
  title?: string;
  subtitle?: string;
};




declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string | HTMLElement,
        config: {
          events?: {
            onReady?: (event: unknown) => void;
            onStateChange?: (event: { data: number }) => void;
          };
        }
      ) => {
        playVideo: () => void;
        pauseVideo: () => void;
        destroy: () => void;
      };
      PlayerState?: {
        UNSTARTED: -1;
        ENDED: 0;
        PLAYING: 1;
        PAUSED: 2;
        BUFFERING: 3;
        CUED: 5;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
    __ytIframeApiPromise?: Promise<void>;
  }
}

function loadYouTubeIframeAPI() {
  if (typeof window === 'undefined') return Promise.resolve();

  if (window.YT?.Player) return Promise.resolve();
  if (window.__ytIframeApiPromise) return window.__ytIframeApiPromise;

  window.__ytIframeApiPromise = new Promise<void>((resolve) => {
    const existing = document.querySelector('script[data-youtube-iframe-api="true"]');
    if (existing) {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve();
      };
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.defer = true;
    script.setAttribute('data-youtube-iframe-api', 'true');

    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };

    document.head.appendChild(script);
  });

  return window.__ytIframeApiPromise;
}

const MAX_MEDIA_ITEMS = 3;
const MAX_SOCIAL_ITEMS = 6;
const MAX_DESCRIPTION = 100;
const INPUT_FONT_SIZE = '16px';

const DIRECT_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];
const DIRECT_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];

const EMBED_MEDIA_PROVIDERS: ExtendedProvider[] = [
  'youtube',
  'youtube_music',
  'spotify',
  'apple_music',
  'direct_video',
  'direct_image',
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function hasText(value?: string | null) {
  return !!value?.trim();
}

function clampText(value?: string, max = MAX_DESCRIPTION) {
  if (!value) return '';
  return value.slice(0, max);
}

function normalizeInputUrl(raw: string) {
  const value = raw.trim();
  if (!value) return '';

  if (/^https?:\/\//i.test(value)) return value;
  if (/^www\./i.test(value)) return `https://${value}`;
  return value;
}

function normalizeUrlForCompare(url: string) {
  return normalizeInputUrl(url).trim().toLowerCase();
}

function isValidUrl(url: string) {
  try {
    const parsed = new URL(normalizeInputUrl(url));
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function getPathLower(url: string) {
  try {
    return new URL(normalizeInputUrl(url)).pathname.toLowerCase();
  } catch {
    return '';
  }
}

function getHostname(url: string) {
  try {
    return new URL(normalizeInputUrl(url)).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function isDirectVideoUrl(url: string) {
  const path = getPathLower(url);
  return DIRECT_VIDEO_EXTENSIONS.some((ext) => path.endsWith(ext));
}

function isDirectImageUrl(url: string) {
  const path = getPathLower(url);
  return DIRECT_IMAGE_EXTENSIONS.some((ext) => path.endsWith(ext));
}

function detectProviderFromUrl(url: string): ExtendedProvider {
  const value = normalizeInputUrl(url).toLowerCase().trim();

  if (isDirectVideoUrl(value)) return 'direct_video';
  if (isDirectImageUrl(value)) return 'direct_image';

  if (
    value.includes('youtube.com') ||
    value.includes('youtu.be') ||
    value.includes('music.youtube.com')
  ) {
    if (value.includes('music.youtube.com')) return 'youtube_music';
    return 'youtube';
  }

  if (value.includes('spotify.com')) return 'spotify';

  if (value.includes('music.apple.com') || value.includes('embed.music.apple.com')) {
    return 'apple_music';
  }

  if (value.includes('facebook.com') || value.includes('fb.watch')) return 'facebook';
  if (value.includes('instagram.com')) return 'instagram';
  if (
    value.includes('tiktok.com') ||
    value.includes('vm.tiktok.com') ||
    value.includes('vt.tiktok.com')
  ) return 'tiktok';
  if (value.includes('x.com') || value.includes('twitter.com')) return 'x';
  if (value.includes('linkedin.com')) return 'linkedin';
  if (value.includes('pinterest.com') || value.includes('pin.it')) return 'pinterest';
  if (value.includes('netflix.com')) return 'netflix';

  return 'website';
}

function normalizeItems(raw: unknown): EditorSocialLinkItem[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter(Boolean)
    .map((item, index) => {
      const value = item as Partial<EditorSocialLinkItem> & { provider?: ExtendedProvider };
      const url = typeof value.url === 'string' ? normalizeInputUrl(value.url) : '';
      const inferredProvider = url ? detectProviderFromUrl(url) : value.provider;

      const kind: EditorItemKind =
        value.kind === 'media' || value.kind === 'social'
          ? value.kind
          : inferredProvider && EMBED_MEDIA_PROVIDERS.includes(inferredProvider)
            ? 'media'
            : 'social';

      return {
        id: value.id || `social-${index}`,
        kind,
        provider: inferredProvider,
        url,
        title: typeof value.title === 'string' ? value.title : '',
        subtitle: typeof value.subtitle === 'string' ? value.subtitle : '',
      };
    });
}

function getResolvedProvider(item: EditorSocialLinkItem): ExtendedProvider | null {
  if (!hasText(item.url)) return null;
  if (!isValidUrl(item.url)) return null;
  return detectProviderFromUrl(item.url);
}

function getYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(normalizeInputUrl(url));
    const host = parsed.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      return parsed.pathname.split('/').filter(Boolean)[0] || null;
    }

    if (host.includes('youtube.com')) {
      if (parsed.pathname.startsWith('/watch')) return parsed.searchParams.get('v');

      if (parsed.pathname.startsWith('/shorts/')) {
        return parsed.pathname.split('/shorts/')[1]?.split('/')[0] || null;
      }

      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/embed/')[1]?.split('/')[0] || null;
      }

      if (parsed.pathname.startsWith('/live/')) {
        return parsed.pathname.split('/live/')[1]?.split('/')[0] || null;
      }
    }

    return parsed.searchParams.get('v');
  } catch {
    return null;
  }
}

function getYouTubeThumb(url: string) {
  const id = getYouTubeVideoId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

function getMediaEmbedUrl(url: string, provider: ExtendedProvider, autoplay = false): string | null {
  try {
    const parsed = new URL(normalizeInputUrl(url));

    if (provider === 'youtube' || provider === 'youtube_music') {
      const id = getYouTubeVideoId(url);
      if (!id) return null;

      const params = new URLSearchParams({
        autoplay: autoplay ? '1' : '0',
        rel: '0',
        modestbranding: '1',
        playsinline: '1',
        enablejsapi: '1',
      });

      return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
    }

    if (provider === 'spotify') {
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts[0] === 'embed') return `https://open.spotify.com/${parts.join('/')}`;
      const type = parts[0];
      const id = parts[1];
      return type && id ? `https://open.spotify.com/embed/${type}/${id}` : null;
    }

    if (provider === 'apple_music') {
      if (parsed.hostname.includes('embed.music.apple.com')) {
        return normalizeInputUrl(url);
      }
      return `https://embed.music.apple.com${parsed.pathname}${parsed.search || ''}`;
    }

    if (provider === 'direct_video' || provider === 'direct_image') {
      return normalizeInputUrl(url);
    }

    return null;
  } catch {
    return null;
  }
}

function buildDuplicateSet(items: EditorSocialLinkItem[]) {
  const map = new Map<string, number>();

  for (const item of items) {
    const key = normalizeUrlForCompare(item.url);
    if (!key) continue;
    map.set(key, (map.get(key) || 0) + 1);
  }

  return new Set(
    Array.from(map.entries())
      .filter(([, count]) => count > 1)
      .map(([url]) => url),
  );
}

function getItemError(item: EditorSocialLinkItem, duplicateSet: Set<string>) {
  if (!hasText(item.url)) return null;
  if (!isValidUrl(item.url)) return 'invalid_url' as const;

  const normalized = normalizeUrlForCompare(item.url);
  if (duplicateSet.has(normalized)) return 'duplicate' as const;

  return null;
}

function getItemState(item: EditorSocialLinkItem, duplicateSet: Set<string>): ItemState {
  if (!hasText(item.url)) return 'empty';
  return getItemError(item, duplicateSet) ? 'invalid' : 'valid';
}

function firstPendingItem(items: EditorSocialLinkItem[], duplicateSet: Set<string>) {
  return items.find((item) => getItemState(item, duplicateSet) !== 'valid') || null;
}

function getAlignClass(align?: string) {
  if (align === 'left') return 'items-start text-left';
  if (align === 'justify') return 'items-start text-left';
  return 'items-center text-center';
}

function getTextAlignClass(align?: string) {
  if (align === 'left') return 'text-left';
  if (align === 'justify') return 'text-left md:text-justify';
  return 'text-center';
}

function getTitleSize(fontSize?: string) {
  switch (fontSize) {
    case 'small':
      return 'text-lg md:text-xl';
    case 'large':
      return 'text-2xl md:text-4xl';
    case 'base':
      return 'text-xl md:text-2xl';
    case 'medium':
    default:
      return 'text-xl md:text-3xl';
  }
}

function getDescSize(fontSize?: string) {
  switch (fontSize) {
    case 'small':
      return 'text-xs md:text-sm';
    case 'large':
      return 'text-sm md:text-lg';
    case 'base':
      return 'text-sm md:text-base';
    case 'medium':
    default:
      return 'text-sm md:text-base';
  }
}

function getProviderMeta(provider: ExtendedProvider, t: (key: string) => string) {
  switch (provider) {
    case 'youtube':
      return { icon: <Play className="h-4 w-4" />, name: t('media_provider_youtube') };
    case 'youtube_music':
      return { icon: <Music2 className="h-4 w-4" />, name: t('media_provider_youtube_music') };
    case 'spotify':
      return { icon: <Music2 className="h-4 w-4" />, name: t('media_provider_spotify') };
    case 'apple_music':
      return { icon: <Music2 className="h-4 w-4" />, name: t('media_provider_apple_music') };
    case 'facebook':
      return { icon: <Facebook className="h-4 w-4" />, name: t('media_provider_facebook') };
    case 'instagram':
      return { icon: <Instagram className="h-4 w-4" />, name: t('media_provider_instagram') };
    case 'tiktok':
      return { icon: <Play className="h-4 w-4" />, name: t('media_provider_tiktok') };
    case 'x':
      return { icon: <AtSign className="h-4 w-4" />, name: t('media_provider_x') };
    case 'linkedin':
      return { icon: <Linkedin className="h-4 w-4" />, name: t('media_provider_linkedin') };
    case 'pinterest':
      return { icon: <PinIcon className="h-4 w-4" />, name: 'Pinterest' };
    case 'direct_video':
      return { icon: <VideoIcon className="h-4 w-4" />, name: t('media_provider_video') };
    case 'direct_image':
      return { icon: <ImageIcon className="h-4 w-4" />, name: t('media_provider_image') };
    case 'netflix':
      return { icon: <Play className="h-4 w-4" />, name: 'Netflix' };
    case 'website':
    default:
      return { icon: <Globe className="h-4 w-4" />, name: t('media_provider_website') };
  }
}

function getThemePalette(theme?: 'dark' | 'light') {
  const isDark = theme === 'dark';

  return {
    section: isDark ? 'bg-[#0b0c0f] text-[#f2f3f5]' : 'bg-white text-slate-900',
    titleText: isDark ? 'text-[#fcfcfd]' : 'text-slate-950',
    softText: isDark ? 'text-[#cbcfd6]' : 'text-slate-700',
    mutedText: isDark ? 'text-[#949ba6]' : 'text-slate-600',

    panel: isDark ? 'bg-[#121418] border-[#252a31]' : 'bg-slate-50 border-slate-200',
    card: isDark ? 'bg-[#171b20] border-[#2d333c]' : 'bg-white border-slate-200',
    chip: isDark ? 'bg-[#1d2229] border-[#383f49]' : 'bg-slate-100 border-slate-200',

    input: isDark
      ? 'bg-[#101318] border-[#353d48] text-white placeholder:text-[#7d8592]'
      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400',

    buttonPrimary: isDark
      ? 'bg-[#4b5563] text-white border-[#4b5563] hover:bg-[#3f4752]'
      : 'bg-sky-600 text-white border-sky-600 hover:bg-sky-700',

    buttonSoft: isDark
      ? 'bg-[#1a1f26] text-[#eceef2] border-[#383f49] hover:bg-[#222831]'
      : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-50',

    buttonEdit: isDark
      ? 'bg-[#1c261e] text-[#9fd0aa] border-[#334138] hover:bg-[#223026]'
      : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100',

    valid: isDark ? 'border-emerald-500/20 bg-emerald-500/8' : 'border-emerald-300 bg-emerald-50',
    invalid: isDark ? 'border-amber-500/20 bg-amber-500/8' : 'border-amber-300 bg-amber-50',
    info: isDark ? 'border-white/10 bg-white/[0.03]' : 'border-sky-300 bg-sky-50',
    embed: isDark ? 'bg-[#0f1115] border-[#252a31]' : 'bg-slate-100 border-slate-200',
    dangerText: isDark ? 'text-amber-300' : 'text-amber-700',
  };
}

function getPublicMediaGridClass(cols?: string) {
  if (cols === '1') return 'grid grid-cols-1 gap-4';
  if (cols === '2') return 'grid grid-cols-1 gap-4 md:grid-cols-2';
  if (cols === '4') return 'grid grid-cols-1 gap-4 md:grid-cols-4';
  return 'grid grid-cols-1 gap-4 md:grid-cols-2';
}

function getPublicMediaItemSpanClass(cols?: string, count = 0, index = 0) {
  if (cols === '1') return 'col-span-1';

  if (cols === '2') {
    if (count === 1) return 'md:col-span-2';
    if (count === 3) return index === 0 ? 'md:col-span-2' : 'md:col-span-1';
    return 'col-span-1';
  }

  if (cols === '4') {
    if (count === 1) return 'md:col-span-2 md:col-start-2';
    if (count === 2) return 'md:col-span-2';
    if (count === 3) return index === 2 ? 'md:col-span-2 md:col-start-2' : 'md:col-span-2';
    return 'col-span-1';
  }

  return 'col-span-1';
}

function getEditorMediaGridClass(cols?: string) {
  if (cols === '1') return 'grid grid-cols-1 gap-3';
  if (cols === '2') return 'grid grid-cols-1 gap-3 md:grid-cols-2';
  if (cols === '4') return 'grid grid-cols-1 gap-3 md:grid-cols-4';
  return 'grid grid-cols-1 gap-3 md:grid-cols-2';
}

function getEditorMediaItemSpanClass(cols?: string, count = 0, index = 0) {
  if (cols === '1') return 'col-span-1';

  if (cols === '2') {
    if (count === 1) return 'md:col-span-2';
    if (count === 3) return index === 0 ? 'md:col-span-2' : 'md:col-span-1';
    return 'col-span-1';
  }

  if (cols === '4') {
    if (count === 1) return 'md:col-span-4';
    if (count === 2) return 'md:col-span-2';
    if (count === 3) return 'md:col-span-2';
    return 'col-span-1';
  }

  return 'col-span-1';
}

function getEditorSocialGridClass() {
  return 'grid grid-cols-1 gap-2 sm:grid-cols-2';
}

type StatusBadgeProps = {
  state: ItemState;
  theme?: 'dark' | 'light';
  t: (key: string) => string;
};

const StatusBadge = memo(function StatusBadge({ state, theme, t }: StatusBadgeProps) {
  const palette = getThemePalette(theme);

  if (state === 'valid') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium',
          palette.valid,
        )}
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        {t('media_status_valid')}
      </span>
    );
  }

  if (state === 'invalid') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium',
          palette.invalid,
        )}
      >
        <AlertCircle className="h-3.5 w-3.5" />
        {t('media_status_invalid')}
      </span>
    );
  }

  return null;
});

type UrlInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  theme?: 'dark' | 'light';
  clearLabel: string;
};

const UrlInput = memo(function UrlInput({
  value,
  onChange,
  placeholder,
  theme,
  clearLabel,
}: UrlInputProps) {
  const palette = getThemePalette(theme);

  return (
    <div className="flex items-center gap-2">
      <input
        value={value}
        onChange={(e) => onChange(normalizeInputUrl(e.target.value))}
        placeholder={placeholder}
        inputMode="url"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        style={{ fontSize: INPUT_FONT_SIZE }}
        className={cn(
          'min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm outline-none transition-colors',
          palette.input,
        )}
      />

      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={clearLabel}
          title={clearLabel}
          className={cn(
            'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition',
            palette.buttonSoft,
          )}
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
});

type CompactToolbarProps = {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove?: () => void;
  disableUp?: boolean;
  disableDown?: boolean;
  theme?: 'dark' | 'light';
};

const CompactToolbar = memo(function CompactToolbar({
  onMoveUp,
  onMoveDown,
  onRemove,
  disableUp,
  disableDown,
  theme,
}: CompactToolbarProps) {
  const palette = getThemePalette(theme);

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={onMoveUp}
        disabled={disableUp}
        className={cn(
          'rounded-full border px-2.5 py-1 text-[11px] transition disabled:opacity-40',
          palette.buttonSoft,
        )}
      >
        ↑
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={disableDown}
        className={cn(
          'rounded-full border px-2.5 py-1 text-[11px] transition disabled:opacity-40',
          palette.buttonSoft,
        )}
      >
        ↓
      </button>
      <button
        type="button"
        onClick={onRemove}
        className={cn('rounded-full border px-2.5 py-1 text-[11px] transition', palette.buttonSoft)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
});

type EmptyAddCardProps = {
  label: string;
  hint: string;
  button: string;
  onAdd: () => void;
  theme?: 'dark' | 'light';
};

const EmptyAddCard = memo(function EmptyAddCard({
  label,
  hint,
  button,
  onAdd,
  theme,
}: EmptyAddCardProps) {
  const palette = getThemePalette(theme);

  return (
    <div
      className={cn(
        'flex min-h-[96px] flex-col items-center justify-center rounded-2xl border border-dashed p-4 text-center',
        palette.card,
      )}
    >
      <p className="text-sm font-medium">{label}</p>
      <p className={cn('mt-1 text-[11px] leading-4', palette.mutedText)}>{hint}</p>
      <button
        type="button"
        onClick={onAdd}
        className={cn(
          'mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium transition',
          palette.buttonPrimary,
        )}
      >
        <Plus className="h-3.5 w-3.5" />
        {button}
      </button>
    </div>
  );
});

type GroupBlockProps = {
  title: string;
  guide: string;
  isEditable: boolean;
  canAddMore: boolean;
  pendingMessage?: string | null;
  onAdd: () => void;
  theme?: 'dark' | 'light';
  children: React.ReactNode;
};

const GroupBlock = memo(function GroupBlock({
  title,
  guide,
  isEditable,
  canAddMore,
  pendingMessage,
  onAdd,
  theme,
  children,
}: GroupBlockProps) {
  const palette = getThemePalette(theme);

  return (
    <div className={cn('rounded-2xl border p-3 md:p-4', palette.panel)}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">{title}</h3>
          {isEditable ? (
            <p className={cn('mt-1 text-[11px] leading-4', palette.mutedText)}>{guide}</p>
          ) : null}
        </div>

        {isEditable && canAddMore ? (
          <button
            type="button"
            onClick={onAdd}
            disabled={!!pendingMessage}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition disabled:opacity-45',
              palette.buttonPrimary,
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        ) : null}
      </div>

      {isEditable && pendingMessage ? (
        <div className={cn('mb-3 rounded-xl border px-3 py-2 text-[11px] leading-4', palette.info)}>
          {pendingMessage}
        </div>
      ) : null}

      {children}
    </div>
  );
});

function getErrorText(error: ReturnType<typeof getItemError>, t: (key: string) => string) {
  if (!error) return '';
  switch (error) {
    case 'duplicate':
      return t('media_error_duplicate');
    case 'invalid_url':
      return t('media_error_invalid_url');
    default:
      return t('media_error_invalid_url');
  }
}

function getSocialBrandClasses(provider: ExtendedProvider, theme?: 'dark' | 'light') {
  const isDark = theme === 'dark';

  switch (provider) {
    case 'instagram':
      return isDark
        ? 'border-pink-400/25 bg-gradient-to-br from-pink-500/10 via-fuchsia-500/8 to-amber-400/8 hover:from-pink-500/14 hover:via-fuchsia-500/12 hover:to-amber-400/12'
        : 'border-pink-200 bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50 hover:from-pink-100 hover:via-rose-100 hover:to-amber-100';
    case 'facebook':
      return isDark
        ? 'border-blue-400/25 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 hover:from-blue-500/14 hover:to-indigo-500/14'
        : 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100';
    case 'linkedin':
      return isDark
        ? 'border-cyan-400/25 bg-gradient-to-br from-cyan-500/10 to-sky-500/10 hover:from-cyan-500/14 hover:to-sky-500/14'
        : 'border-sky-200 bg-gradient-to-br from-cyan-50 to-sky-50 hover:from-cyan-100 hover:to-sky-100';
    case 'x':
      return isDark
        ? 'border-white/12 bg-gradient-to-br from-white/[0.05] to-slate-300/[0.05] hover:from-white/[0.08] hover:to-slate-300/[0.08]'
        : 'border-slate-300 bg-gradient-to-br from-slate-100 to-zinc-100 hover:from-slate-200 hover:to-zinc-200';
    case 'tiktok':
      return isDark
        ? 'border-fuchsia-400/25 bg-gradient-to-br from-fuchsia-500/10 via-pink-500/8 to-cyan-400/8 hover:from-fuchsia-500/14 hover:via-pink-500/12 hover:to-cyan-400/12'
        : 'border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 via-pink-50 to-cyan-50 hover:from-fuchsia-100 hover:via-pink-100 hover:to-cyan-100';
    case 'pinterest':
      return isDark
        ? 'border-rose-400/25 bg-gradient-to-br from-rose-500/10 to-red-500/10 hover:from-rose-500/14 hover:to-red-500/14'
        : 'border-red-200 bg-gradient-to-br from-rose-50 to-red-50 hover:from-rose-100 hover:to-red-100';
    default:
      return isDark
        ? 'border-[#2d333c] bg-[#171b20] hover:bg-[#1e232b]'
        : 'border-slate-200 bg-white hover:bg-slate-50';
  }
}

type SocialScrollerCardProps = {
  url: string;
  provider: ExtendedProvider;
  theme?: 'dark' | 'light';
  t: (key: string) => string;
};

const SocialScrollerCard = memo(function SocialScrollerCard({
  url,
  provider,
  theme,
  t,
}: SocialScrollerCardProps) {
  const palette = getThemePalette(theme);
  const meta = getProviderMeta(provider, t);
  const cleanUrl = normalizeInputUrl(url);
  const host = getHostname(url);

  return (
    <a
      href={cleanUrl}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'group flex min-w-[220px] max-w-[250px] snap-start items-center gap-3 rounded-2xl border p-3 transition',
        getSocialBrandClasses(provider, theme),
      )}
    >
      <div
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border backdrop-blur-[1px]',
          theme === 'dark'
            ? 'border-white/10 bg-white/10 text-white'
            : 'border-white/70 bg-white text-slate-800 shadow-sm',
        )}
      >
        {meta.icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-sm font-semibold', palette.titleText)}>{meta.name}</p>
        <p className={cn('mt-0.5 truncate text-[11px]', palette.mutedText)}>{host || cleanUrl}</p>
      </div>
    </a>
  );
});

type PublicLinkCardProps = {
  url: string;
  provider: ExtendedProvider;
  align?: 'center' | 'left' | 'justify';
  theme?: 'dark' | 'light';
  t: (key: string) => string;
};

const PublicLinkCard = memo(function PublicLinkCard({
  url,
  provider,
  align,
  theme,
  t,
}: PublicLinkCardProps) {
  const palette = getThemePalette(theme);
  const meta = getProviderMeta(provider, t);
  const cleanUrl = normalizeInputUrl(url);
  const host = getHostname(url);
  const centered = align === 'center';

  return (
    <a
      href={cleanUrl}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'group relative block w-full overflow-hidden rounded-xl border transition-all duration-200',
        theme === 'dark'
          ? 'border-[#2d333c] bg-[#171b20] hover:border-[#424955] hover:bg-[#1d222a]'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
      )}
    >
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-[2px]',
          theme === 'dark' ? 'bg-zinc-400' : 'bg-sky-500',
        )}
      />

      <div className="p-3.5">
        <div
          className={cn(
            'flex gap-3',
            centered ? 'flex-col items-center text-center' : 'items-center justify-between',
          )}
        >
          <div
            className={cn(
              'flex min-w-0 items-center gap-3',
              centered ? 'flex-col justify-center' : 'flex-1',
            )}
          >
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
                theme === 'dark'
                  ? 'border-[#383f49] bg-[#1d2229] text-white'
                  : 'border-slate-200 bg-slate-100 text-slate-800',
              )}
            >
              {meta.icon}
            </div>

            <div className={cn('min-w-0', centered ? 'text-center' : 'text-left')}>
              <p className={cn('truncate text-sm font-semibold leading-tight', palette.titleText)}>
                {meta.name}
              </p>

              <p className={cn('mt-0.5 hidden truncate text-xs md:block', palette.mutedText)}>
                {host || cleanUrl}
              </p>
            </div>
          </div>

          {!centered ? (
            <div
              className={cn(
                'hidden shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium transition lg:inline-flex',
                theme === 'dark'
                  ? 'bg-white/[0.04] text-[#a7afb9] group-hover:bg-white/[0.08] group-hover:text-white'
                  : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200',
              )}
            >
              <span>{t('media_open_link')}</span>
              <Link2 className="h-3.5 w-3.5" />
            </div>
          ) : null}
        </div>

        <div
          className={cn(
            'mt-3 truncate rounded-lg px-2.5 py-2 text-[10px]',
            centered ? 'text-center' : 'text-left',
            theme === 'dark' ? 'bg-[#101419] text-[#949daa]' : 'bg-slate-50 text-slate-500',
          )}
        >
          {cleanUrl}
        </div>
      </div>
    </a>
  );
});

function getMediaFrameWrapClass(cols?: string, count = 0, index = 0) {
  if (cols === '2' && count === 3 && index === 0) {
    return 'mx-auto w-full max-w-3xl';
  }

  if (cols === '1') return 'mx-auto w-full max-w-4xl';

  return 'mx-auto w-full';
}

function getMediaAspectClass(
  provider: ExtendedProvider,
  cols?: string,
  count = 0,
  index = 0,
  sourceUrl?: string
) {
  if (provider === 'spotify') {
    return cols === '1'
      ? 'aspect-[16/4.8] md:aspect-[16/5.1]'
      : 'aspect-[16/4.4] md:aspect-[16/4.8]';
  }

  if (provider === 'apple_music') {
    const isVideo = sourceUrl ? isAppleMusicVideoUrl(sourceUrl) : false;
  
    // 🎬 Apple Music Video
    if (isVideo) {
      if (cols === '1')
        return 'aspect-[16/9.2] md:aspect-[16/8.8]';
  
      if (cols === '2' && count === 3 && index === 0)
        return 'aspect-[16/8.8] md:aspect-[16/8.2]';
  
      return 'aspect-[16/9.1] md:aspect-[16/8.8]';
    }
  
    // 🎵 Apple Music áudio / álbum / playlist
    if (cols === '1') {
      return 'min-h-[210px] md:min-h-[230px]';
    }
  
    if (cols === '2') {
      return 'min-h-[200px] md:min-h-[220px]';
    }
  
    if (cols === '4') {
      return 'min-h-[190px] md:min-h-[210px]';
    }
  
    return 'min-h-[200px] md:min-h-[220px]';
  }
  
  if (cols === '2' && count === 3 && index === 0) {
    return 'aspect-[16/8.6] md:aspect-[16/7.7]';
  }
  
  if (cols === '1') {
    return 'aspect-[16/9.4] md:aspect-[16/8.9]';
  }
  
  if (cols === '2') {
    return 'aspect-[16/9.2] md:aspect-[16/9]';
  }
  
  return 'aspect-[16/9]';
}



function getAppleMusicIframeHeight(
  cols?: string,
  sourceUrl?: string
): number | null {
  const isVideo = sourceUrl ? isAppleMusicVideoUrl(sourceUrl) : false;

  if (isVideo) {
    return null;
  }

  if (cols === '1') return 260;
  if (cols === '2') return 240;
  if (cols === '4') return 220;

  return 240;
}
function isAppleMusicVideoUrl(url: string) {
  try {
    const parsed = new URL(normalizeInputUrl(url));
    return parsed.pathname.toLowerCase().includes('/music-video/');
  } catch {
    return false;
  }
}

function withAppleTheme(
  url: string | null,
  theme: 'dark' | 'light'
): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    parsed.searchParams.set('theme', theme);
    return parsed.toString();
  } catch {
    return url;
  }
}
type MediaCardProps = {
  item: EditorSocialLinkItem;
  index: number;
  totalItems: number;
  isEditable: boolean;
  theme?: 'dark' | 'light';
  isCollapsed: boolean;
  duplicateSet: Set<string>;
  cols?: string;
  align?: 'center' | 'left' | 'justify';
  onToggleEdit: (id: string) => void;
  onRemove?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onChange?: (id: string, patch: Partial<EditorSocialLinkItem>) => void;
  t: (key: string) => string;
};

const MediaCard = memo(function MediaCard({
  item,
  index,
  totalItems,
  isEditable,
  theme,
  isCollapsed,
  duplicateSet,
  cols,
  align,
  onToggleEdit,
  onRemove,
  onMoveUp,
  onMoveDown,
  onChange,
  t,
}: MediaCardProps) {
  const palette = getThemePalette(theme);
  const resolvedProvider = getResolvedProvider(item);
  const state = getItemState(item, duplicateSet);
  const error = getItemError(item, duplicateSet);
  const errorText = getErrorText(error, t);
  const meta = resolvedProvider ? getProviderMeta(resolvedProvider, t) : null;
  const centered = align === 'center';

  const [activated, setActivated] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const ytPlayerRef = useRef<{
    playVideo: () => void;
    pauseVideo: () => void;
    destroy: () => void;
  } | null>(null);

  const playerReadyRef = useRef(false);
  const isInViewportRef = useRef(true);
  const shouldResumeRef = useRef(false);
  const pauseByVisibilityRef = useRef(false);
  const userWantedPlayRef = useRef(false);

  useEffect(() => {
    setActivated(false);
    playerReadyRef.current = false;
    isInViewportRef.current = true;
    shouldResumeRef.current = false;
    pauseByVisibilityRef.current = false;
    userWantedPlayRef.current = false;

    if (ytPlayerRef.current) {
      ytPlayerRef.current.destroy();
      ytPlayerRef.current = null;
    }
  }, [item.url]);

  const wrapClass = resolvedProvider
    ? getMediaFrameWrapClass(cols, totalItems, index)
    : 'mx-auto w-full';

  const aspectClass = resolvedProvider
    ? getMediaAspectClass(resolvedProvider, cols, totalItems, index, item.url)
    : 'aspect-[16/9]';

  const youtubeEmbedUrl =
    resolvedProvider === 'youtube' || resolvedProvider === 'youtube_music'
      ? getMediaEmbedUrl(item.url, resolvedProvider, activated)
      : null;

  const spotifyEmbedUrl =
    resolvedProvider === 'spotify'
      ? getMediaEmbedUrl(item.url, resolvedProvider)
      : null;

  const appleEmbedUrl =
    resolvedProvider === 'apple_music'
      ? getMediaEmbedUrl(item.url, resolvedProvider)
      : null;

  const themedAppleEmbedUrl =
    resolvedProvider === 'apple_music'
      ? withAppleTheme(appleEmbedUrl, theme === 'dark' ? 'dark' : 'light')
      : null;

  const isAppleVideo =
    resolvedProvider === 'apple_music'
      ? isAppleMusicVideoUrl(item.url)
      : false;

  const appleIframeHeight =
    resolvedProvider === 'apple_music'
      ? getAppleMusicIframeHeight(cols, item.url)
      : null;

  const directEmbedUrl =
    resolvedProvider === 'direct_video' || resolvedProvider === 'direct_image'
      ? getMediaEmbedUrl(item.url, resolvedProvider)
      : null;

  useEffect(() => {
    if (!activated) return;
    if (!(resolvedProvider === 'youtube' || resolvedProvider === 'youtube_music')) return;
    if (!iframeRef.current) return;

    let cancelled = false;
    const iframe = iframeRef.current;

    loadYouTubeIframeAPI().then(() => {
      if (cancelled || !iframe || !window.YT?.Player) return;

      if (ytPlayerRef.current) {
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
      }

      ytPlayerRef.current = new window.YT.Player(iframe, {
        events: {
          onReady: () => {
            if (cancelled) return;
            playerReadyRef.current = true;
          },
          onStateChange: (event) => {
            const playingState = window.YT?.PlayerState?.PLAYING ?? 1;
            const pausedState = window.YT?.PlayerState?.PAUSED ?? 2;
            const endedState = window.YT?.PlayerState?.ENDED ?? 0;

            if (event.data === playingState) {
              userWantedPlayRef.current = true;
              shouldResumeRef.current = true;
              pauseByVisibilityRef.current = false;
            } else if (event.data === pausedState) {
              if (pauseByVisibilityRef.current) {
                shouldResumeRef.current = true;
              } else {
                userWantedPlayRef.current = false;
                shouldResumeRef.current = false;
              }
            } else if (event.data === endedState) {
              userWantedPlayRef.current = false;
              shouldResumeRef.current = false;
              pauseByVisibilityRef.current = false;
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      playerReadyRef.current = false;

      if (ytPlayerRef.current) {
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
      }
    };
  }, [activated, resolvedProvider, item.url]);

  useEffect(() => {
    if (!activated) return;
    if (!(resolvedProvider === 'youtube' || resolvedProvider === 'youtube_music')) return;
    if (!containerRef.current) return;

    const node = containerRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const player = ytPlayerRef.current;
        if (!player || !playerReadyRef.current) return;

        const nowVisible = entry.isIntersecting && entry.intersectionRatio >= 0.62;
        const wasVisible = isInViewportRef.current;

        if (nowVisible === wasVisible) return;
        isInViewportRef.current = nowVisible;

        if (!nowVisible) {
          if (userWantedPlayRef.current) {
            pauseByVisibilityRef.current = true;
            shouldResumeRef.current = true;
            try {
              player.pauseVideo();
            } catch {}
          }
          return;
        }

        if (shouldResumeRef.current) {
          pauseByVisibilityRef.current = false;
          try {
            player.playVideo();
          } catch {}
        }
      },
      {
        threshold: [0, 0.15, 0.35, 0.62, 0.82],
        rootMargin: '-8% 0px -12% 0px',
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [activated, resolvedProvider]);

  if (!isEditable && !resolvedProvider) return null;

  if (isEditable && state === 'valid' && isCollapsed) {
    return (
      <div className={cn('rounded-2xl border p-3', palette.card, palette.valid)}>
        <div className={cn('flex gap-2.5', centered ? 'items-center text-center' : 'items-center')}>
          <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border', palette.chip)}>
            {meta?.icon || <Music2 className="h-4 w-4" />}
          </div>

          <div className={cn('min-w-0 flex-1', centered ? 'text-center' : '')}>
            <p className={cn('truncate text-sm font-semibold', palette.titleText)}>
              {meta?.name || t('media_provider_not_detected')}
            </p>
            <p className={cn('mt-1 truncate text-[11px]', palette.mutedText)}>
              {item.url}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onToggleEdit(item.id)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition',
              palette.buttonEdit
            )}
          >
            <Pencil className="h-3.5 w-3.5" />
            {t('media_edit_button')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'h-full rounded-2xl border p-3 transition-colors',
        palette.card,
        state === 'valid' && isEditable && palette.valid,
        state === 'invalid' && isEditable && palette.invalid
      )}
    >
      <div className={cn('mb-2 flex gap-2.5', centered ? 'items-center text-center' : 'items-start')}>
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border', palette.chip)}>
          {meta?.icon || <Music2 className="h-4 w-4" />}
        </div>

        <div className={cn('min-w-0 flex-1', centered ? 'text-center' : '')}>
          <div className={cn('flex flex-wrap gap-2', centered ? 'justify-center' : 'items-center')}>
            <p className={cn('truncate text-sm font-semibold', palette.titleText)}>
              {meta?.name || t('media_provider_not_detected')}
            </p>
            {isEditable && state !== 'empty' ? (
              <StatusBadge state={state} theme={theme} t={t} />
            ) : null}
          </div>

          {isEditable ? (
            <p
              className={cn(
                'mt-1 text-[11px] leading-4',
                state === 'invalid' ? palette.dangerText : palette.mutedText,
                centered ? 'text-center' : ''
              )}
            >
              {state === 'empty'
                ? t('media_hint_paste')
                : state === 'invalid'
                  ? errorText
                  : ''}
            </p>
          ) : null}
        </div>
      </div>

      {isEditable ? (
        <div className="space-y-2">
          <UrlInput
            value={item.url}
            onChange={(nextUrl) => onChange?.(item.id, { url: nextUrl })}
            placeholder={t('media_placeholder_media_link')}
            theme={theme}
            clearLabel={t('media_clear_button')}
          />

          <div className="flex items-center justify-between gap-2">
            <div />

            <div className="flex items-center gap-1.5">
              {state === 'valid' ? (
                <button
                  type="button"
                  onClick={() => onToggleEdit(item.id)}
                  className={cn('rounded-full border px-2.5 py-1 text-[11px] transition', palette.buttonEdit)}
                >
                  {t('media_done_button')}
                </button>
              ) : null}

              <CompactToolbar
                onMoveUp={() => onMoveUp?.(item.id)}
                onMoveDown={() => onMoveDown?.(item.id)}
                onRemove={() => onRemove?.(item.id)}
                disableUp={index === 0}
                disableDown={index === totalItems - 1}
                theme={theme}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {(resolvedProvider === 'youtube' || resolvedProvider === 'youtube_music') && youtubeEmbedUrl ? (
            <div
              ref={containerRef}
              className={cn('overflow-hidden rounded-xl border', palette.embed, wrapClass)}
            >
              {!activated ? (
                <button
                  type="button"
                  onClick={() => setActivated(true)}
                  className={cn('group relative block w-full overflow-hidden bg-black text-left', aspectClass)}
                >
                  {getYouTubeThumb(item.url) ? (
                    <img
                      src={getYouTubeThumb(item.url)!}
                      alt={meta?.name || 'YouTube preview'}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  ) : null}

                  <div className="absolute inset-0 bg-black/35 transition group-hover:bg-black/40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-black shadow-lg">
                      <Play className="ml-0.5 h-6 w-6" />
                    </span>
                  </div>
                </button>
              ) : (
                <div className={cn('relative w-full bg-black', aspectClass)}>
                  <iframe
                    ref={iframeRef}
                    id={`yt-player-${item.id}`}
                    src={youtubeEmbedUrl}
                    title={`${meta?.name || 'media'}-${index}`}
                    loading="lazy"
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="h-full w-full border-0"
                  />
                </div>
              )}
            </div>
          ) : resolvedProvider === 'spotify' && spotifyEmbedUrl ? (
            <div className={cn('overflow-hidden rounded-xl border', palette.embed, wrapClass)}>
              <div className={cn('relative w-full', aspectClass)}>
                <iframe
                  src={spotifyEmbedUrl}
                  title={`${meta?.name || 'media'}-${index}`}
                  loading="lazy"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="h-full w-full border-0"
                />
              </div>
            </div>
          ) : resolvedProvider === 'apple_music' && themedAppleEmbedUrl ? (
            <div
              className={cn(
                'overflow-hidden rounded-xl border',
                palette.embed,
                wrapClass,
                isAppleVideo ? 'shadow-[0_10px_30px_rgba(0,0,0,0.18)]' : ''
              )}
            >
              <div
                className={cn(
                  'relative w-full overflow-hidden',
                  isAppleVideo ? `${aspectClass} bg-black` : ''
                )}
              >
                <iframe
                  src={themedAppleEmbedUrl}
                  title={`${meta?.name || 'media'}-${index}`}
                  loading="lazy"
                  allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
                  sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                  referrerPolicy="strict-origin-when-cross-origin"
                  style={
                    isAppleVideo
                      ? {
                          width: '100%',
                          height: '100%',
                          border: 0,
                        }
                      : {
                          width: '100%',
                          height: `${appleIframeHeight ?? 240}px`,
                          border: 0,
                        }
                  }
                  className={cn(
                    'w-full border-0',
                    isAppleVideo ? 'absolute inset-0 rounded-none bg-black' : 'rounded-[10px]'
                  )}
                />
              </div>
            </div>
          ) : resolvedProvider === 'direct_video' && directEmbedUrl ? (
            <div className={cn('overflow-hidden rounded-xl border', palette.embed, wrapClass)}>
              <video
                src={directEmbedUrl}
                controls
                preload="metadata"
                playsInline
                className={cn('h-auto w-full bg-black', aspectClass)}
              />
            </div>
          ) : resolvedProvider === 'direct_image' && directEmbedUrl ? (
            <a
              href={normalizeInputUrl(item.url)}
              target="_blank"
              rel="noreferrer"
              className={cn('block overflow-hidden rounded-xl border', palette.embed, wrapClass)}
            >
              <img
                src={directEmbedUrl}
                alt={meta?.name || 'media image'}
                loading="lazy"
                decoding="async"
                className="h-auto w-full object-cover"
              />
            </a>
          ) : resolvedProvider ? (
            <PublicLinkCard
              url={item.url}
              provider={resolvedProvider}
              align={align}
              theme={theme}
              t={t}
            />
          ) : null}
        </div>
      )}
    </div>
  );
});

type SocialChipProps = {
  item: EditorSocialLinkItem;
  index: number;
  totalItems: number;
  isEditable: boolean;
  theme?: 'dark' | 'light';
  isCollapsed: boolean;
  duplicateSet: Set<string>;
  align?: 'center' | 'left' | 'justify';
  onToggleEdit: (id: string) => void;
  onRemove?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onChange?: (id: string, patch: Partial<EditorSocialLinkItem>) => void;
  t: (key: string) => string;
};

const SocialChip = memo(function SocialChip({
  item,
  index,
  totalItems,
  isEditable,
  theme,
  isCollapsed,
  duplicateSet,
  align,
  onToggleEdit,
  onRemove,
  onMoveUp,
  onMoveDown,
  onChange,
  t,
}: SocialChipProps) {
  const palette = getThemePalette(theme);
  const resolvedProvider = getResolvedProvider(item);
  const state = getItemState(item, duplicateSet);
  const error = getItemError(item, duplicateSet);
  const errorText = getErrorText(error, t);
  const meta = resolvedProvider ? getProviderMeta(resolvedProvider, t) : null;
  const centered = align === 'center';

  if (!isEditable && state !== 'valid') return null;

  if (isEditable && state === 'valid' && isCollapsed) {
    return (
      <div className={cn('rounded-2xl border p-2.5', palette.card, palette.valid)}>
        <div className={cn('flex gap-2', centered ? 'items-center text-center' : 'items-center')}>
          <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full border', palette.chip)}>
            {meta?.icon || <Globe className="h-4 w-4" />}
          </div>

          <div className={cn('min-w-0 flex-1', centered ? 'text-center' : '')}>
            <p className={cn('truncate text-sm font-semibold', palette.titleText)}>
              {meta?.name || t('media_provider_not_detected')}
            </p>
            <p className={cn('mt-1 truncate text-[11px]', palette.mutedText)}>{item.url}</p>
          </div>

          <button
            type="button"
            onClick={() => onToggleEdit(item.id)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition',
              palette.buttonEdit,
            )}
          >
            <Pencil className="h-3.5 w-3.5" />
            {t('media_edit_button')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-2xl border p-2.5 transition-colors',
        palette.card,
        state === 'valid' && isEditable && palette.valid,
        state === 'invalid' && isEditable && palette.invalid,
      )}
    >
      {isEditable ? (
        <div className="space-y-2">
          <div className={cn('flex gap-2', centered ? 'items-center text-center' : 'items-start')}>
            <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full border', palette.chip)}>
              {meta?.icon || <Globe className="h-4 w-4" />}
            </div>

            <div className={cn('min-w-0 flex-1', centered ? 'text-center' : '')}>
              <div className={cn('flex flex-wrap gap-2', centered ? 'justify-center' : 'items-center')}>
                <p className={cn('truncate text-sm font-semibold', palette.titleText)}>
                  {meta?.name || t('media_provider_not_detected')}
                </p>
                {state !== 'empty' ? <StatusBadge state={state} theme={theme} t={t} /> : null}
              </div>

              <p
                className={cn(
                  'mt-1 text-[11px] leading-4',
                  state === 'invalid' ? palette.dangerText : palette.mutedText,
                  centered ? 'text-center' : '',
                )}
              >
                {state === 'empty'
                  ? t('media_hint_paste')
                  : state === 'invalid'
                    ? errorText
                    : ''}
              </p>
            </div>
          </div>

          <UrlInput
            value={item.url}
            onChange={(nextUrl) => onChange?.(item.id, { url: nextUrl })}
            placeholder={t('media_placeholder_social_link')}
            theme={theme}
            clearLabel={t('media_clear_button')}
          />

          <div className="flex items-center justify-between gap-2">
            <div />

            <div className="flex items-center gap-1.5">
              {state === 'valid' ? (
                <button
                  type="button"
                  onClick={() => onToggleEdit(item.id)}
                  className={cn('rounded-full border px-2.5 py-1 text-[11px] transition', palette.buttonEdit)}
                >
                  {t('media_done_button')}
                </button>
              ) : null}

              <CompactToolbar
                onMoveUp={() => onMoveUp?.(item.id)}
                onMoveDown={() => onMoveDown?.(item.id)}
                onRemove={() => onRemove?.(item.id)}
                disableUp={index === 0}
                disableDown={index === totalItems - 1}
                theme={theme}
              />
            </div>
          </div>
        </div>
      ) : resolvedProvider ? (
        <PublicLinkCard
          url={item.url}
          provider={resolvedProvider}
          align={align}
          theme={theme}
          t={t}
        />
      ) : null}
    </div>
  );
});

export const MediaLinksCompact: React.FC<SectionProps> = ({
  content,
  style,
  onUpdate,
}) => {
  const { t } = useTranslate();
  const isEditable = !!onUpdate;
  const theme = style?.theme === 'dark' ? 'dark' : 'light';
  const palette = getThemePalette(theme);

  const uniqueId = useId().replace(/:/g, '');
  const [editingMap, setEditingMap] = useState<Record<string, boolean>>({});
  const interactedRef = useRef<Record<string, boolean>>({});
  const mountedRef = useRef(false);
  const previouslyValidRef = useRef<Record<string, boolean>>({});

  const normalized = useMemo(() => normalizeItems(content.socialLinks), [content.socialLinks]);
  const duplicateSet = useMemo(() => buildDuplicateSet(normalized), [normalized]);

  const mediaItems = useMemo(
    () => normalized.filter((item) => item.kind === 'media').slice(0, MAX_MEDIA_ITEMS),
    [normalized],
  );

  const socialItems = useMemo(
    () => normalized.filter((item) => item.kind === 'social').slice(0, MAX_SOCIAL_ITEMS),
    [normalized],
  );

  const pendingMedia = useMemo(() => firstPendingItem(mediaItems, duplicateSet), [mediaItems, duplicateSet]);
  const pendingSocial = useMemo(() => firstPendingItem(socialItems, duplicateSet), [socialItems, duplicateSet]);

  const visibleMedia = useMemo(
    () => (isEditable ? mediaItems : mediaItems.filter((item) => isRenderableMedia(item))),
    [isEditable, mediaItems],
  );

  const visibleSocial = useMemo(
    () => (isEditable ? socialItems : socialItems.filter((item) => isRenderableSocial(item))),
    [isEditable, socialItems],
  );

  const validTotal = useMemo(
    () =>
      [...mediaItems, ...socialItems].filter((item) => getItemState(item, duplicateSet) === 'valid').length,
    [mediaItems, socialItems, duplicateSet],
  );

  const invalidMessages = useMemo(() => {
    const messageSet = new Set<string>();

    normalized.forEach((item) => {
      const state = getItemState(item, duplicateSet);
      if (state !== 'invalid') return;

      const text = getErrorText(getItemError(item, duplicateSet), t as (key: string) => string);
      if (text) messageSet.add(text);
    });

    return Array.from(messageSet);
  }, [normalized, duplicateSet, t]);

  const mergeGroups = useCallback(
    (nextMedia: EditorSocialLinkItem[], nextSocial: EditorSocialLinkItem[]) => {
      onUpdate?.('socialLinks', [
        ...nextMedia.slice(0, MAX_MEDIA_ITEMS),
        ...nextSocial.slice(0, MAX_SOCIAL_ITEMS),
      ]);
    },
    [onUpdate],
  );

  const setCardEditing = useCallback((id: string, value: boolean) => {
    setEditingMap((prev) => ({ ...prev, [id]: value }));
  }, []);

  const toggleEdit = useCallback((id: string) => {
    setEditingMap((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleAddToGroup = useCallback(
    (kind: EditorItemKind) => {
      const blocked = kind === 'media' ? !!pendingMedia : !!pendingSocial;
      const currentCount = kind === 'media' ? mediaItems.length : socialItems.length;
      const max = kind === 'media' ? MAX_MEDIA_ITEMS : MAX_SOCIAL_ITEMS;

      if (currentCount >= max || blocked) return;

      const newItem: EditorSocialLinkItem = {
        id: `${uniqueId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        kind,
        provider: undefined,
        url: '',
        title: '',
        subtitle: '',
      };

      interactedRef.current[newItem.id] = false;
      setCardEditing(newItem.id, true);

      if (kind === 'media') {
        mergeGroups([...mediaItems, newItem], socialItems);
      } else {
        mergeGroups(mediaItems, [...socialItems, newItem]);
      }
    },
    [pendingMedia, pendingSocial, mediaItems, socialItems, mergeGroups, uniqueId, setCardEditing],
  );

  const handleRemoveFromGroup = useCallback(
    (kind: EditorItemKind, id: string) => {
      setEditingMap((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      delete interactedRef.current[id];
      delete previouslyValidRef.current[id];

      if (kind === 'media') {
        mergeGroups(mediaItems.filter((item) => item.id !== id), socialItems);
      } else {
        mergeGroups(mediaItems, socialItems.filter((item) => item.id !== id));
      }
    },
    [mediaItems, socialItems, mergeGroups],
  );

  const handleChangeInGroup = useCallback(
    (kind: EditorItemKind, id: string, patch: Partial<EditorSocialLinkItem>) => {
      interactedRef.current[id] = true;

      const applyPatch = (item: EditorSocialLinkItem): EditorSocialLinkItem => {
        if (item.id !== id) return item;

        return {
          ...item,
          ...patch,
          url: typeof patch.url === 'string' ? normalizeInputUrl(patch.url) : item.url,
        };
      };

      if (kind === 'media') {
        mergeGroups(mediaItems.map(applyPatch), socialItems);
      } else {
        mergeGroups(mediaItems, socialItems.map(applyPatch));
      }
    },
    [mediaItems, socialItems, mergeGroups],
  );

  const handleMoveInGroup = useCallback(
    (kind: EditorItemKind, id: string, direction: 'up' | 'down') => {
      const source = kind === 'media' ? [...mediaItems] : [...socialItems];
      const currentIndex = source.findIndex((item) => item.id === id);
      if (currentIndex === -1) return;

      const target = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (target < 0 || target >= source.length) return;

      [source[currentIndex], source[target]] = [source[target], source[currentIndex]];

      if (kind === 'media') {
        mergeGroups(source, socialItems);
      } else {
        mergeGroups(mediaItems, source);
      }
    },
    [mediaItems, socialItems, mergeGroups],
  );

  useEffect(() => {
    const allItems = [...mediaItems, ...socialItems];

    if (!mountedRef.current) {
      mountedRef.current = true;
      allItems.forEach((item) => {
        previouslyValidRef.current[item.id] = getItemState(item, duplicateSet) === 'valid';
      });
      return;
    }

    allItems.forEach((item) => {
      const isValidNow = getItemState(item, duplicateSet) === 'valid';
      const wasValid = previouslyValidRef.current[item.id] === true;
      const wasInteracted = interactedRef.current[item.id] === true;

      if (wasInteracted && isValidNow && !wasValid) {
        toast.success(t('media_toast_item_valid'));
        interactedRef.current[item.id] = false;
      }

      previouslyValidRef.current[item.id] = isValidNow;
    });
  }, [mediaItems, socialItems, duplicateSet, t]);

  const publicHasContent = visibleMedia.length > 0 || visibleSocial.length > 0;

  if (!isEditable && !publicHasContent) return null;

  return (
    <section className={cn('px-2 pt-5 pb-10 md:px-4 md:pt-8 md:pb-16', palette.section)}>
      <div className="mx-auto max-w-6xl px-2 sm:px-4">
        {(hasText(String(content.category || '')) ||
          hasText(String(content.title || '')) ||
          hasText(String(content.description || ''))) && (
          <div
            className={cn(
              'mx-auto mb-5 flex max-w-3xl flex-col gap-1.5',
              getAlignClass(style.align),
            )}
          >
            {!!content.category && (
              <p
                className={cn(
                  'max-w-full break-words text-[10px] font-medium uppercase tracking-[0.2em]',
                  palette.mutedText,
                  getTextAlignClass(style.align),
                )}
              >
                {String(content.category)}
              </p>
            )}

            {!!content.title && (
              <h2
                className={cn(
                  'max-w-full break-words font-semibold tracking-tight',
                  getTitleSize(style.fontSize),
                  palette.titleText,
                  getTextAlignClass(style.align),
                )}
              >
                {String(content.title)}
              </h2>
            )}

            {!!content.description && (
              <p
                className={cn(
                  'max-w-2xl break-words leading-5',
                  getDescSize(style.fontSize),
                  palette.softText,
                  getTextAlignClass(style.align),
                )}
              >
                {clampText(String(content.description), MAX_DESCRIPTION)}
              </p>
            )}
          </div>
        )}

        {isEditable ? (
          <div className={cn('mb-4 rounded-2xl border p-3', palette.info)}>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{t('media_editor_title')}</p>
                <p className="mt-1 text-[11px] leading-4">{t('media_editor_compact_hint')}</p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <span className={cn('rounded-full border px-2.5 py-1 text-[10px]', palette.valid)}>
                  {validTotal} {t('media_summary_valid_total')}
                </span>
              </div>
            </div>

            {invalidMessages.length > 0 ? (
              <div className="mt-3 space-y-1">
                {invalidMessages.slice(0, 3).map((message, idx) => (
                  <div
                    key={`${message}-${idx}`}
                    className={cn(
                      'rounded-xl border px-3 py-2 text-[11px] leading-4',
                      palette.invalid,
                      palette.dangerText,
                    )}
                  >
                    {message}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-4">
          <GroupBlock
            title={t('media_section_media')}
            guide={t('media_group_guide_compact')}
            isEditable={isEditable}
            canAddMore={mediaItems.length < MAX_MEDIA_ITEMS}
            pendingMessage={pendingMedia ? t('media_finish_current_first') : null}
            onAdd={() => handleAddToGroup('media')}
            theme={theme}
          >
            {visibleMedia.length === 0 ? (
              isEditable ? (
                <EmptyAddCard
                  label={t('media_empty_media')}
                  hint={t('media_empty_media_hint')}
                  button={t('media_add_media')}
                  onAdd={() => handleAddToGroup('media')}
                  theme={theme}
                />
              ) : null
            ) : (
              <div className={isEditable ? getEditorMediaGridClass(style.cols) : getPublicMediaGridClass(style.cols)}>
                {visibleMedia.map((item, index) => (
                  <div
                    key={item.id}
                    className={
                      isEditable
                        ? getEditorMediaItemSpanClass(style.cols, visibleMedia.length, index)
                        : getPublicMediaItemSpanClass(style.cols, visibleMedia.length, index)
                    }
                  >
                    <MediaCard
                      item={item}
                      index={index}
                      totalItems={visibleMedia.length}
                      isEditable={isEditable}
                      theme={theme}
                      isCollapsed={!editingMap[item.id]}
                      duplicateSet={duplicateSet}
                      cols={style.cols}
                      align={style.align}
                      onToggleEdit={toggleEdit}
                      onRemove={(id) => handleRemoveFromGroup('media', id)}
                      onMoveUp={(id) => handleMoveInGroup('media', id, 'up')}
                      onMoveDown={(id) => handleMoveInGroup('media', id, 'down')}
                      onChange={(id, patch) => handleChangeInGroup('media', id, patch)}
                      t={t as (key: string) => string}
                    />
                  </div>
                ))}
              </div>
            )}
          </GroupBlock>

          {visibleSocial.length > 0 || isEditable ? (
            <GroupBlock
              title={t('media_section_social')}
              guide={t('social_group_guide_compact')}
              isEditable={isEditable}
              canAddMore={socialItems.length < MAX_SOCIAL_ITEMS}
              pendingMessage={pendingSocial ? t('media_finish_current_first') : null}
              onAdd={() => handleAddToGroup('social')}
              theme={theme}
            >
              {visibleSocial.length === 0 ? (
                isEditable ? (
                  <EmptyAddCard
                    label={t('media_empty_social')}
                    hint={t('media_empty_social_hint')}
                    button={t('media_add_social')}
                    onAdd={() => handleAddToGroup('social')}
                    theme={theme}
                  />
                ) : null
              ) : !isEditable ? (
                <>
                  <div className="-mx-1 overflow-x-auto pb-1 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div className="flex snap-x snap-mandatory gap-3 px-1">
                      {visibleSocial.map((item) => {
                        const provider = getResolvedProvider(item);
                        if (!provider) return null;

                        return (
                          <SocialScrollerCard
                            key={item.id}
                            url={item.url}
                            provider={provider}
                            theme={theme}
                            t={t as (key: string) => string}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="hidden gap-3 md:grid md:grid-cols-3 lg:grid-cols-4">
                    {visibleSocial.map((item) => {
                      const provider = getResolvedProvider(item);
                      if (!provider) return null;

                      return (
                        <SocialScrollerCard
                          key={item.id}
                          url={item.url}
                          provider={provider}
                          theme={theme}
                          t={t as (key: string) => string}
                        />
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className={getEditorSocialGridClass()}>
                  {visibleSocial.map((item, index) => (
                    <div key={item.id}>
                      <SocialChip
                        item={item}
                        index={index}
                        totalItems={visibleSocial.length}
                        isEditable={isEditable}
                        theme={theme}
                        isCollapsed={!editingMap[item.id]}
                        duplicateSet={duplicateSet}
                        align={style.align}
                        onToggleEdit={toggleEdit}
                        onRemove={(id) => handleRemoveFromGroup('social', id)}
                        onMoveUp={(id) => handleMoveInGroup('social', id, 'up')}
                        onMoveDown={(id) => handleMoveInGroup('social', id, 'down')}
                        onChange={(id, patch) => handleChangeInGroup('social', id, patch)}
                        t={t as (key: string) => string}
                      />
                    </div>
                  ))}
                </div>
              )}
            </GroupBlock>
          ) : null}
        </div>
      </div>
    </section>
  );
};

function isRenderableMedia(item: EditorSocialLinkItem) {
  return item.kind === 'media' && isValidUrl(item.url);
}

function isRenderableSocial(item: EditorSocialLinkItem) {
  return item.kind === 'social' && isValidUrl(item.url);
}