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
  ClipboardPaste,
  Pencil,
  Image as ImageIcon,
  Video as VideoIcon,
  Link2,
  PinIcon,
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
  | 'pinterest';

type EditorSocialLinkItem = {
  id: string;
  kind: EditorItemKind;
  provider?: ExtendedProvider;
  url: string;
  title?: string;
  subtitle?: string;
};

const MAX_MEDIA_ITEMS = 3;
const MAX_SOCIAL_ITEMS = 3;
const MAX_DESCRIPTION = 100;
const INPUT_FONT_SIZE = '16px';

const DIRECT_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];
const DIRECT_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];

const EMBED_MEDIA_PROVIDERS: ExtendedProvider[] = [
  'youtube',
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

  if (value.includes('youtube.com') || value.includes('youtu.be')) return 'youtube';
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
    }

    return null;
  } catch {
    return null;
  }
}

function getYouTubeThumb(url: string) {
  const id = getYouTubeVideoId(url);
  return id ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : null;
}

function getMediaEmbedUrl(url: string, provider: ExtendedProvider): string | null {
  try {
    const parsed = new URL(normalizeInputUrl(url));

    if (provider === 'youtube') {
      const id = getYouTubeVideoId(url);
      return id
        ? `https://www.youtube-nocookie.com/embed/${id}?enablejsapi=1&rel=0&modestbranding=1&playsinline=1`
        : null;
    }

    if (provider === 'spotify') {
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts[0] === 'embed') return `https://open.spotify.com/${parts.join('/')}`;
      const type = parts[0];
      const id = parts[1];
      return type && id ? `https://open.spotify.com/embed/${type}/${id}` : null;
    }

    if (provider === 'apple_music') {
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
      .map(([url]) => url)
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
    case 'website':
    default:
      return { icon: <Globe className="h-4 w-4" />, name: t('media_provider_website') };
  }
}

function getThemePalette(theme?: 'dark' | 'light') {
  const isDark = theme === 'dark';

  return {
    section: isDark ? 'bg-[#0b1118] text-[#eef4fb]' : 'bg-white text-slate-900',
    titleText: isDark ? 'text-white' : 'text-slate-950',
    softText: isDark ? 'text-[#c9d6e4]' : 'text-slate-700',
    mutedText: isDark ? 'text-[#8ea0b5]' : 'text-slate-600',

    panel: isDark ? 'bg-[#101823] border-[#1b2a3a]' : 'bg-slate-50 border-slate-200',
    card: isDark ? 'bg-[#121c28] border-[#213244]' : 'bg-white border-slate-200',
    chip: isDark ? 'bg-[#182434] border-[#2a3f57]' : 'bg-slate-100 border-slate-200',

    input: isDark
      ? 'bg-[#0c141d] border-[#23364a] text-white placeholder:text-[#70849d]'
      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400',

    buttonPrimary: isDark
      ? 'bg-[#4f9cff] text-white border-[#4f9cff] hover:bg-[#3d8df0]'
      : 'bg-sky-600 text-white border-sky-600 hover:bg-sky-700',

    buttonSoft: isDark
      ? 'bg-[#162334] text-white border-[#29405a] hover:bg-[#1b2b40]'
      : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-50',

    buttonEdit: isDark
      ? 'bg-[#1d3b2d] text-[#8ef0b1] border-[#2d5a45] hover:bg-[#234634]'
      : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100',

    valid: isDark ? 'border-emerald-500/25 bg-emerald-500/8' : 'border-emerald-300 bg-emerald-50',
    invalid: isDark ? 'border-amber-500/25 bg-amber-500/8' : 'border-amber-300 bg-amber-50',
    info: isDark ? 'border-sky-500/20 bg-sky-500/8' : 'border-sky-300 bg-sky-50',
    embed: isDark ? 'bg-[#0b1219] border-[#1b2a3a]' : 'bg-slate-100 border-slate-200',
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

function getPublicSocialGridClass(cols?: string) {
  if (cols === '1') return 'grid grid-cols-1 gap-3';
  if (cols === '2') return 'grid grid-cols-2 gap-2 md:grid-cols-3';
  if (cols === '4') return 'grid grid-cols-2 gap-2 md:grid-cols-4';
  return 'grid grid-cols-2 gap-2 md:grid-cols-3';
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

function getEditorSocialGridClass(cols?: string) {
  if (cols === '1') return 'grid grid-cols-1 gap-2';
  if (cols === '2') return 'grid grid-cols-1 gap-2 sm:grid-cols-2';
  if (cols === '4') return 'grid grid-cols-1 gap-2 md:grid-cols-2';
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
      <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium', palette.valid)}>
        <CheckCircle2 className="h-3.5 w-3.5" />
        {t('media_status_valid')}
      </span>
    );
  }

  if (state === 'invalid') {
    return (
      <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium', palette.invalid)}>
        <AlertCircle className="h-3.5 w-3.5" />
        {t('media_status_invalid')}
      </span>
    );
  }

  return null;
});

type PasteInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  theme?: 'dark' | 'light';
  pasteLabel: string;
};

const PasteInput = memo(function PasteInput({
  value,
  onChange,
  placeholder,
  theme,
  pasteLabel,
}: PasteInputProps) {
  const palette = getThemePalette(theme);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handlePaste = async () => {
    const input = inputRef.current;

    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const next = normalizeInputUrl(text);
        onChange(next);
        input?.focus();
        requestAnimationFrame(() => {
          input?.setSelectionRange(next.length, next.length);
        });
        return;
      }
    } catch {
      input?.focus();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
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
          palette.input
        )}
      />

      <button
        type="button"
        onClick={handlePaste}
        className={cn(
          'inline-flex. h-10 hidden shrink-0 items-center gap-1 rounded-xl border px-3 text-[11px] font-medium transition',
          palette.buttonPrimary
        )}
        title={pasteLabel}
      >
        <ClipboardPaste className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{pasteLabel}</span>
      </button>
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
        className={cn('rounded-full border px-2.5 py-1 text-[11px] transition disabled:opacity-40', palette.buttonSoft)}
      >
        ↑
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={disableDown}
        className={cn('rounded-full border px-2.5 py-1 text-[11px] transition disabled:opacity-40', palette.buttonSoft)}
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
    <div className={cn('flex min-h-[96px] flex-col items-center justify-center rounded-2xl border border-dashed p-4 text-center', palette.card)}>
      <p className="text-sm font-medium">{label}</p>
      <p className={cn('mt-1 text-[11px] leading-4', palette.mutedText)}>{hint}</p>
      <button
        type="button"
        onClick={onAdd}
        className={cn('mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium transition', palette.buttonPrimary)}
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
              palette.buttonPrimary
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

function getErrorText(
  error: ReturnType<typeof getItemError>,
  t: (key: string) => string
) {
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
          ? 'border-[#223346] bg-[#0f1722] hover:border-[#35506e] hover:bg-[#132031]'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      )}
    >
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-[2px]',
          theme === 'dark'
            ? 'bg-[#4f9cff]'
            : 'bg-sky-500'
        )}
      />

      <div className="p-3.5">
        <div
          className={cn(
            'flex gap-3',
            centered
              ? 'flex-col items-center text-center'
              : 'items-center justify-between'
          )}
        >
          <div
            className={cn(
              'flex min-w-0 items-center gap-3',
              centered ? 'flex-col justify-center' : 'flex-1'
            )}
          >
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
                theme === 'dark'
                  ? 'border-[#29405a] bg-[#162334] text-white'
                  : 'border-slate-200 bg-slate-100 text-slate-800'
              )}
            >
              {meta.icon}
            </div>

            <div className={cn('min-w-0', centered ? 'text-center' : 'text-left')}>
              <p
                className={cn(
                  'truncate text-sm font-semibold leading-tight',
                  palette.titleText
                )}
              >
                {meta.name}
              </p>

              <p
                className={cn(
                  'mt-0.5 truncate hidden md:block text-xs',
                  palette.mutedText
                )}
              >
                {host || cleanUrl}
              </p>
            </div>
          </div>

          {!centered ? (
            <div
              className={cn(
                'lg:inline-flex hidden shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium transition',
                theme === 'dark'
                  ? 'bg-white/5 text-[#9fb3c8] group-hover:bg-white/10 group-hover:text-white'
                  : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
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
            theme === 'dark'
              ? 'bg-[#111b27] text-[#8ea0b5]'
              : 'bg-slate-50 text-slate-500'
          )}
        >
          {cleanUrl}
        </div>
      </div>
    </a>
  );
});
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
  const embedUrl = resolvedProvider ? getMediaEmbedUrl(item.url, resolvedProvider) : null;
  const centered = align === 'center';
  const [activateEmbed, setActivateEmbed] = useState(false);

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
            <p className={cn('mt-1 truncate text-[11px]', palette.mutedText)}>{item.url}</p>
          </div>

          <button
            type="button"
            onClick={() => onToggleEdit(item.id)}
            className={cn('inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition', palette.buttonEdit)}
          >
            <Pencil className="h-3.5 w-3.5" />
            {t('media_edit_button')}
          </button>
        </div>
      </div>
    );
  }

  const commonAspect =
    cols === '1'
      ? 'aspect-[16/9.8] md:aspect-[16/9.4]'
      : cols === '2'
        ? 'aspect-[16/9.2] md:aspect-[16/9]'
        : 'aspect-[16/9]';

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
            {isEditable && state !== 'empty' ? <StatusBadge state={state} theme={theme} t={t} /> : null}
          </div>

          {isEditable ? (
            <p className={cn('mt-1 text-[11px] leading-4', state === 'invalid' ? palette.dangerText : palette.mutedText, centered ? 'text-center' : '')}>
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
          <PasteInput
            value={item.url}
            onChange={(nextUrl) => onChange?.(item.id, { url: nextUrl })}
            placeholder={t('media_placeholder_media_link')}
            theme={theme}
            pasteLabel={t('media_paste_button')}
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
          {resolvedProvider === 'youtube' && embedUrl ? (
            <button
              type="button"
              onClick={() => setActivateEmbed(true)}
              className={cn(
                'group block w-full overflow-hidden rounded-xl border text-left',
                palette.embed,
                cols === '1' ? 'mx-auto max-w-3xl' : 'mx-auto'
              )}
            >
              {!activateEmbed ? (
                <div className={cn('relative w-full bg-black', commonAspect)}>
                  {getYouTubeThumb(item.url) ? (
                    <img
                      src={getYouTubeThumb(item.url)!}
                      alt={meta?.name || 'YouTube preview'}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : null}

                  <div className="absolute inset-0 bg-black/20 transition group-hover:bg-black/25" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-black shadow-lg">
                      <Play className="ml-0.5 h-6 w-6" />
                    </span>
                  </div>
                </div>
              ) : (
                <div className={cn('relative w-full', commonAspect)}>
                  <iframe
                    src={embedUrl}
                    title={`${meta?.name || 'media'}-${index}`}
                    loading="lazy"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="h-full w-full border-0"
                  />
                </div>
              )}
            </button>
          ) : resolvedProvider === 'spotify' && embedUrl ? (
            <div
              className={cn(
                'overflow-hidden rounded-xl border',
                palette.embed,
                cols === '1' ? 'mx-auto max-w-3xl' : 'mx-auto'
              )}
            >
              <div className={cn('relative w-full', cols === '1' ? 'aspect-[16/4.9] md:aspect-[16/5.3]' : 'aspect-[16/4.6] md:aspect-[16/4.9]')}>
                <iframe
                  src={embedUrl}
                  title={`${meta?.name || 'media'}-${index}`}
                  loading="lazy"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="h-full w-full border-0"
                />
              </div>
            </div>
          ) : resolvedProvider === 'apple_music' && embedUrl ? (
            <div
              className={cn(
                'overflow-hidden rounded-xl border',
                palette.embed,
                cols === '1' ? 'mx-auto max-w-3xl' : 'mx-auto'
              )}
            >
              <div className={cn('relative w-full', cols === '1' ? 'min-h-[145px] md:min-h-[160px]' : 'min-h-[150px] sm:min-h-[165px]')}>
                <iframe
                  src={embedUrl}
                  title={`${meta?.name || 'media'}-${index}`}
                  loading="lazy"
                  allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
                  sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="h-full w-full rounded-[10px] border-0"
                />
              </div>
            </div>
          ) : resolvedProvider === 'direct_video' && embedUrl ? (
            <div className={cn('overflow-hidden rounded-xl border', palette.embed, cols === '1' ? 'mx-auto max-w-3xl' : 'mx-auto')}>
              <video
                src={embedUrl}
                controls
                preload="metadata"
                playsInline
                className={cn('h-auto w-full bg-black', commonAspect)}
              />
            </div>
          ) : resolvedProvider === 'direct_image' && embedUrl ? (
            <a
              href={normalizeInputUrl(item.url)}
              target="_blank"
              rel="noreferrer"
              className={cn('block overflow-hidden rounded-xl border', palette.embed, cols === '1' ? 'mx-auto max-w-3xl' : 'mx-auto')}
            >
              <img
                src={embedUrl}
                alt={meta?.name || 'media image'}
                loading="lazy"
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
            className={cn('inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition', palette.buttonEdit)}
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
        state === 'invalid' && isEditable && palette.invalid
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

              <p className={cn('mt-1 text-[11px] leading-4', state === 'invalid' ? palette.dangerText : palette.mutedText, centered ? 'text-center' : '')}>
                {state === 'empty'
                  ? t('media_hint_paste')
                  : state === 'invalid'
                    ? errorText
                    : ''}
              </p>
            </div>
          </div>

          <PasteInput
            value={item.url}
            onChange={(nextUrl) => onChange?.(item.id, { url: nextUrl })}
            placeholder={t('media_placeholder_social_link')}
            theme={theme}
            pasteLabel={t('media_paste_button')}
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
    [normalized]
  );

  const socialItems = useMemo(
    () => normalized.filter((item) => item.kind === 'social').slice(0, MAX_SOCIAL_ITEMS),
    [normalized]
  );

  const pendingMedia = useMemo(() => firstPendingItem(mediaItems, duplicateSet), [mediaItems, duplicateSet]);
  const pendingSocial = useMemo(() => firstPendingItem(socialItems, duplicateSet), [socialItems, duplicateSet]);

  const visibleMedia = useMemo(
    () => (isEditable ? mediaItems : mediaItems.filter((item) => isRenderableMedia(item))),
    [isEditable, mediaItems]
  );

  const visibleSocial = useMemo(
    () => (isEditable ? socialItems : socialItems.filter((item) => isRenderableSocial(item))),
    [isEditable, socialItems]
  );

  const validTotal = useMemo(
    () =>
      [...mediaItems, ...socialItems].filter((item) => getItemState(item, duplicateSet) === 'valid').length,
    [mediaItems, socialItems, duplicateSet]
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
    [onUpdate]
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
    [pendingMedia, pendingSocial, mediaItems, socialItems, mergeGroups, uniqueId, setCardEditing]
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
    [mediaItems, socialItems, mergeGroups]
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
    [mediaItems, socialItems, mergeGroups]
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
    [mediaItems, socialItems, mergeGroups]
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
    <section className={cn('px-2 py-5 md:px-4 md:py-8', palette.section)}>
      <div className="mx-auto max-w-6xl px-2 sm:px-4">
        {(hasText(String(content.category || '')) ||
          hasText(String(content.title || '')) ||
          hasText(String(content.description || ''))) && (
          <div className={cn('mx-auto mb-4 flex max-w-3xl flex-col gap-1.5', getAlignClass(style.align))}>
            {!!content.category && (
              <p className={cn('max-w-full break-words text-[10px] font-medium uppercase tracking-[0.2em]', palette.mutedText, getTextAlignClass(style.align))}>
                {String(content.category)}
              </p>
            )}

            {!!content.title && (
              <h2 className={cn('max-w-full break-words font-semibold tracking-tight', getTitleSize(style.fontSize), palette.titleText, getTextAlignClass(style.align))}>
                {String(content.title)}
              </h2>
            )}

            {!!content.description && (
              <p className={cn('max-w-2xl break-words leading-5', getDescSize(style.fontSize), palette.softText, getTextAlignClass(style.align))}>
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
                    className={cn('rounded-xl border px-3 py-2 text-[11px] leading-4', palette.invalid, palette.dangerText)}
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
              ) : (
                <div className={isEditable ? getEditorSocialGridClass(style.cols) : getPublicSocialGridClass(style.cols)}>
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