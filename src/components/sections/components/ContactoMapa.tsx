import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Search,
  Send,
  Settings2,
  Sparkles,
  Store,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import type { SectionProps } from '../../../types/library';
import { useTranslate } from '../../../context/LanguageContext';
import { LOCATION_SUGGESTIONS } from '../../../context/locationSuggestions';
export type SectionStyles = {
  theme?: 'dark' | 'light';
  align?: 'center' | 'left' | 'justify';
  fontSize?: 'small' | 'medium' | 'large' | 'base';
  cols?: string;
};

type ContactoMapaContent = {
  title?: string;
  subtitle?: string;
  location?: string;
};

type StoreContactData = {
  id?: string | null;
  owner_email?: string | null;
  whatsapp_number?: string | null;
};

type ContactoMapaProps = SectionProps & {
  content: ContactoMapaContent;
  style: SectionStyles;
};

const TITLE_MAX = 60;
const SUBTITLE_MAX = 160;
const LOCATION_MAX = 160;
const NAME_MAX = 60;
const MESSAGE_MAX = 300;

const LOCAL_LOCATION_SUGGESTIONS = LOCATION_SUGGESTIONS;

function normalizePhone(value?: string | null) {
  return (value || '').replace(/\D/g, '');
}

function isValidEmail(value?: string | null) {
  if (!value) return false;
  return /\S+@\S+\.\S+/.test(value);
}

function clampText(value: string, max: number) {
  return value.length > max ? value.slice(0, max) : value;
}

function getGridMode(cols?: string): '1' | '2' | '4' {
  if (cols === '1' || cols === '2' || cols === '4') return cols;
  return '2';
}

function getHeaderAlignClass(align?: SectionStyles['align']) {
  switch (align) {
    case 'center':
      return 'text-center items-center';
    case 'justify':
    case 'left':
    default:
      return 'text-left items-start';
  }
}

function getTitleSize(fontSize?: SectionStyles['fontSize']) {
  switch (fontSize) {
    case 'small':
      return 'text-xl md:text-2xl';
    case 'large':
      return 'text-3xl md:text-4xl';
    case 'base':
      return 'text-2xl md:text-3xl';
    case 'medium':
    default:
      return 'text-2xl md:text-3xl';
  }
}

function createEditableHandlers(
  field: keyof ContactoMapaContent,
  max: number,
  onUpdate?: ((field: string, value: string) => void) | undefined
) {
  return {
    contentEditable: true,
    suppressContentEditableWarning: true,
    onInput: (e: React.FormEvent<HTMLElement>) => {
      const el = e.currentTarget;
      const raw = el.textContent || '';
      const next = clampText(raw, max);

      if (raw !== next) el.textContent = next;
      onUpdate?.(field, next);
    },
    onPaste: (e: React.ClipboardEvent<HTMLElement>) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      const el = e.currentTarget;
      const current = el.textContent || '';
      const allowed = clampText(text, Math.max(0, max - current.length));

      document.execCommand('insertText', false, allowed);
      onUpdate?.(field, clampText(current + allowed, max));
    },
  };
}

function looksLikeUrl(value: string) {
  return /^(https?:\/\/|www\.)/i.test(value.trim());
}

function isValidHttpUrl(value: string) {
  try {
    const normalized =
      value.startsWith('http://') || value.startsWith('https://')
        ? value
        : `https://${value}`;
    const url = new URL(normalized);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function extractLocationFromMapsUrl(value: string): string {
  try {
    const normalized =
      value.startsWith('http://') || value.startsWith('https://')
        ? value
        : `https://${value}`;

    const url = new URL(normalized);
    const host = url.hostname.toLowerCase();

    if (!host.includes('google.') && !host.includes('maps.app.goo.gl')) {
      return '';
    }

    const q = url.searchParams.get('q');
    if (q?.trim()) return q.trim();

    const query = url.searchParams.get('query');
    if (query?.trim()) return query.trim();

    const path = decodeURIComponent(url.pathname);

    const matchAt = path.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (matchAt) return `${matchAt[1]}, ${matchAt[2]}`;

    const matchPlace = path.match(/\/place\/([^/]+)/);
    if (matchPlace?.[1]) return matchPlace[1].replace(/\+/g, ' ').trim();

    return '';
  } catch {
    return '';
  }
}

function normalizeLocationInput(raw?: string | null) {
  const value = (raw || '').trim();

  if (!value) {
    return {
      raw: '',
      text: '',
      isUrl: false,
      urlValid: false,
      isValidLocation: false,
      reason: 'empty',
    };
  }

  const isUrl = looksLikeUrl(value);

  if (isUrl) {
    const urlValid = isValidHttpUrl(value);

    if (!urlValid) {
      return {
        raw: value,
        text: '',
        isUrl: true,
        urlValid: false,
        isValidLocation: false,
        reason: 'invalid_url',
      };
    }

    const extracted = extractLocationFromMapsUrl(value);
    const finalText = extracted || '';
    const isValidLocation = finalText.trim().length >= 6;

    return {
      raw: value,
      text: finalText,
      isUrl: true,
      urlValid: true,
      isValidLocation,
      reason: isValidLocation ? 'ok' : 'weak',
    };
  }

  const compact = value.replace(/\s+/g, ' ').trim();
  const hasEnoughText = compact.length >= 6;
  const hasSomeStructure = compact.includes(',') || compact.split(' ').length >= 2;

  return {
    raw: value,
    text: compact,
    isUrl: false,
    urlValid: false,
    isValidLocation: hasEnoughText && hasSomeStructure,
    reason: hasEnoughText && hasSomeStructure ? 'ok' : 'weak',
  };
}

function buildSatelliteEmbedUrl(query: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=k&z=17&ie=UTF8&iwloc=&output=embed`;
}

function buildGoogleMapsUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function FieldHint({
  theme,
  children,
}: {
  theme: 'dark' | 'light';
  children: React.ReactNode;
}) {
  return (
    <div
      className={[
        'mt-2 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.14em]',
        theme === 'dark' ? 'text-white/45' : 'text-slate-400',
      ].join(' ')}
    >
      {children}
    </div>
  );
}

function EditableDisplayField({
  label,
  value,
  placeholder,
  icon: Icon,
  editable,
  theme,
  handlers,
  limitText,
  helpText,
  footer,
}: {
  label: string;
  value: string;
  placeholder: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  editable: boolean;
  theme: 'dark' | 'light';
  handlers?: Record<string, unknown>;
  limitText?: string;
  helpText?: string;
  footer?: React.ReactNode;
}) {
  return (
    <div
      className={[
        'rounded-xl border p-3 overflow-hidden min-w-0',
        theme === 'dark'
          ? 'border-white/10 bg-white/5'
          : 'border-slate-200 bg-white',
      ].join(' ')}
      style={{ contain: 'layout style paint' }}
    >
      <div className="flex items-center gap-2 mb-1.5 min-w-0">
        <Icon
          size={15}
          className={theme === 'dark' ? 'text-blue-100 shrink-0' : 'text-blue-600 shrink-0'}
        />
        <p
          className={[
            'text-[10px] font-black uppercase tracking-[0.18em]',
            theme === 'dark' ? 'text-white/60' : 'text-slate-500',
          ].join(' ')}
        >
          {label}
        </p>
      </div>

      <p
        {...(editable ? handlers : {})}
        suppressContentEditableWarning
        className={[
          'text-[13px] md:text-sm leading-snug max-w-full min-w-0 break-words outline-none',
          editable
            ? theme === 'dark'
              ? 'rounded-lg border border-dashed border-white/15 bg-white/5 px-3 py-3 text-white'
              : 'rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-slate-900'
            : theme === 'dark'
            ? 'text-white'
            : 'text-slate-900',
        ].join(' ')}
        style={{ overflowWrap: 'anywhere' }}
      >
        {value || placeholder}
      </p>

      {helpText ? (
        <p
          className={[
            'mt-2 text-[12px] leading-relaxed',
            theme === 'dark' ? 'text-white/55' : 'text-slate-500',
          ].join(' ')}
        >
          {helpText}
        </p>
      ) : null}

      {editable && limitText ? (
        <FieldHint theme={theme}>
          <span>{limitText}</span>
        </FieldHint>
      ) : null}

      {footer ? <div className="mt-2.5">{footer}</div> : null}
    </div>
  );
}

function WarningCard({
  isAdminRoute,
  dark,
  title,
  desc,
  action,
}: {
  isAdminRoute: boolean;
  dark?: boolean;
  title: string;
  desc: string;
  action: string;
}) {
  return (
    <div
      className={[
        'rounded-xl border p-3.5',
        dark ? 'border-white/15 bg-white/8' : 'border-slate-200 bg-slate-50',
      ].join(' ')}
    >
      <div className="flex items-start gap-2.5">
        <AlertCircle
          size={16}
          className={dark ? 'text-amber-200 mt-0.5 shrink-0' : 'text-amber-500 mt-0.5 shrink-0'}
        />
        <div className="min-w-0">
          <p className={['text-sm font-bold', dark ? 'text-white' : 'text-slate-900'].join(' ')}>
            {title}
          </p>
          <p className={['mt-1 text-[13px]', dark ? 'text-white/75' : 'text-slate-600'].join(' ')}>
            {desc}
          </p>

          {isAdminRoute ? (
            <Link
              to="/admin/configuracoes"
              className={[
                'mt-3 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition',
                dark
                  ? 'bg-white text-slate-900 hover:bg-slate-100'
                  : 'bg-slate-900 text-white hover:bg-blue-600',
              ].join(' ')}
            >
              {action}
              <Settings2 size={13} />
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CompactSettingsButton({
  theme,
  to,
  label,
}: {
  theme: 'dark' | 'light';
  to: string;
  label: string;
}) {
  return (
    <Link
      to={to}
      className={[
        'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition',
        theme === 'dark'
          ? 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
      ].join(' ')}
    >
      <Settings2 size={13} />
      {label}
    </Link>
  );
}

function OrientationCard({
  theme,
  t,
}: {
  theme: 'dark' | 'light';
  t: (key: string, vars?: Record<string, unknown>) => string;
}) {
  return (
    <div
      className={[
        'rounded-xl border p-3.5',
        theme === 'dark'
          ? 'border-white/10 bg-white/5'
          : 'border-slate-200 bg-slate-50',
      ].join(' ')}
    >
      <div className="flex items-start gap-2.5">
        <Sparkles
          size={16}
          className={theme === 'dark' ? 'text-blue-200 mt-0.5 shrink-0' : 'text-blue-600 mt-0.5 shrink-0'}
        />
        <div className="min-w-0">
          <p className={['text-sm font-bold', theme === 'dark' ? 'text-white' : 'text-slate-900'].join(' ')}>
            {t('contact_admin_help_title')}
          </p>
          <p className={['mt-1 text-[13px]', theme === 'dark' ? 'text-white/75' : 'text-slate-600'].join(' ')}>
            {t('contact_admin_help_desc')}
          </p>
        </div>
      </div>
    </div>
  );
}

function PreviewGuideCard({ theme }: { theme: 'dark' | 'light' }) {
  return (
    <div
      className={[
        'rounded-xl border p-3.5',
        theme === 'dark'
          ? 'border-white/10 bg-white/5'
          : 'border-slate-200 bg-slate-50',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <div
          className={[
            'shrink-0 rounded-xl border p-2',
            theme === 'dark'
              ? 'border-white/10 bg-slate-900'
              : 'border-slate-200 bg-white',
          ].join(' ')}
        >
          <div className="w-16 h-12 rounded-lg bg-gradient-to-br from-blue-500/80 to-slate-800 flex items-center justify-center">
            <Store size={16} className="text-white" />
          </div>
        </div>

        <div className="min-w-0">
          <p className={['text-sm font-bold', theme === 'dark' ? 'text-white' : 'text-slate-900'].join(' ')}>
            Public preview
          </p>
          <p className={['mt-1 text-[13px]', theme === 'dark' ? 'text-white/75' : 'text-slate-600'].join(' ')}>
            This location preview appears in the public store page when the address is valid.
          </p>
        </div>
      </div>
    </div>
  );
}

function WhatsAppField({
  value,
  loading,
  theme,
  isAdminRoute,
  missingText,
  loadingText,
}: {
  value: string;
  loading: boolean;
  theme: 'dark' | 'light';
  isAdminRoute: boolean;
  missingText: string;
  loadingText: string;
}) {
  const visibleValue = loading ? loadingText : value || missingText;

  return (
    <EditableDisplayField
      icon={Phone}
      label="WhatsApp"
      value={visibleValue}
      placeholder={missingText}
      editable={false}
      theme={theme}
      footer={
        isAdminRoute ? (
          <CompactSettingsButton
            theme={theme}
            to="/admin/configuracoes"
            label="Edit WhatsApp"
          />
        ) : null
      }
    />
  );
}

function LocationAssistField({
  theme,
  value,
  onChange,
  onCommit,
  status,
}: {
  theme: 'dark' | 'light';
  value: string;
  onChange: (v: string) => void;
  onCommit: (v: string) => void;
  status: {
    isValidLocation: boolean;
    isUrl: boolean;
    urlValid: boolean;
    reason: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return LOCAL_LOCATION_SUGGESTIONS.slice(0, 5);

    return LOCAL_LOCATION_SUGGESTIONS.filter((item) =>
      item.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [value]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const inputClass =
    theme === 'dark'
      ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400';

  const suggestionSurface =
    theme === 'dark'
      ? 'border-white/10 bg-slate-900'
      : 'border-slate-200 bg-white';

  return (
    <div
      ref={boxRef}
      className={[
        'rounded-xl border p-3',
        theme === 'dark'
          ? 'border-white/10 bg-white/5'
          : 'border-slate-200 bg-white',
      ].join(' ')}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <MapPin
          size={15}
          className={theme === 'dark' ? 'text-blue-100 shrink-0' : 'text-blue-600 shrink-0'}
        />
        <p
          className={[
            'text-[10px] font-black uppercase tracking-[0.18em]',
            theme === 'dark' ? 'text-white/60' : 'text-slate-500',
          ].join(' ')}
        >
          Location
        </p>
      </div>

      <div className="relative">
        <div className="relative">
          <Search
            size={15}
            className={[
              'absolute left-3 top-1/2 -translate-y-1/2',
              theme === 'dark' ? 'text-white/35' : 'text-slate-400',
            ].join(' ')}
          />

          <input
            value={value}
            onChange={(e) => {
              const next = clampText(e.target.value, LOCATION_MAX);
              onChange(next);
              setOpen(true);
            }}
            onBlur={() => onCommit(value)}
            onFocus={() => setOpen(true)}
            placeholder="Street, City, Country"
            className={`w-full rounded-xl border pl-10 pr-3 py-3 text-base outline-none focus:border-blue-500 transition ${inputClass}`}
          />
        </div>

        {open && suggestions.length > 0 ? (
          <div
            className={`absolute z-20 mt-2 w-full overflow-hidden rounded-xl border shadow-lg ${suggestionSurface}`}
          >
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(item);
                  onCommit(item);
                  setOpen(false);
                }}
                className={[
                  'w-full text-left px-3 py-2.5 text-sm transition',
                  theme === 'dark'
                    ? 'text-white hover:bg-white/5'
                    : 'text-slate-700 hover:bg-slate-50',
                ].join(' ')}
              >
                {item}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <p className={['mt-2 text-[12px]', theme === 'dark' ? 'text-white/55' : 'text-slate-500'].join(' ')}>
        Search or paste a Google Maps link.
      </p>

      <FieldHint theme={theme}>
        <span>Max {LOCATION_MAX}</span>
      </FieldHint>

      {value.trim().length > 0 && status.isValidLocation && (
        <div className={`mt-2 inline-flex items-center gap-2 text-[12px] ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600'}`}>
          <CheckCircle2 size={14} />
          Valid location
        </div>
      )}

      {value.trim().length > 0 && !status.isValidLocation && status.reason === 'invalid_url' && (
        <div className={`mt-2 text-[12px] ${theme === 'dark' ? 'text-red-300' : 'text-red-600'}`}>
          Invalid URL.
        </div>
      )}

      {value.trim().length > 0 && !status.isValidLocation && status.reason !== 'invalid_url' && (
        <div className={`mt-2 text-[12px] ${theme === 'dark' ? 'text-amber-200' : 'text-amber-600'}`}>
          Add a clearer location to show the map.
        </div>
      )}
    </div>
  );
}

function ContactoMapaComponent({
  content,
  style,
  onUpdate,
}: ContactoMapaProps) {
  const { t } = useTranslate() as {
    t: (key: string, vars?: Record<string, unknown>) => string;
  };

  const route = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorMessage, setVisitorMessage] = useState('');
  const [adminLocationInput, setAdminLocationInput] = useState(content.location?.trim() || '');

  useEffect(() => {
    setAdminLocationInput(content.location?.trim() || '');
  }, [content.location]);

  const isAdminRoute = useMemo(() => {
    const path = route.pathname.toLowerCase();
    return (
      path.includes('/admin') ||
      path.includes('/dashboard') ||
      path.includes('/editor') ||
      path.includes('/manage')
    );
  }, [route.pathname]);

  const theme = style.theme === 'dark' ? 'dark' : 'light';
  const gridMode = getGridMode(style.cols);
  const headerAlign = getHeaderAlignClass(style.align);
  const titleSize = getTitleSize(style.fontSize);

  const storeQuery = useQuery({
    queryKey: ['contact-section-store-by-user'],
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
    retry: 1,
    queryFn: async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) return null;

      const { data, error } = await supabase
        .from('stores')
        .select('id, owner_email, whatsapp_number')
        .eq('owner_id', user.id)
        .single();

      if (error) throw error;
      return data as StoreContactData;
    },
  });

  const store = storeQuery.data || null;

  const resolvedPhone = useMemo(() => store?.whatsapp_number?.trim() || '', [store?.whatsapp_number]);
  const resolvedEmail = useMemo(() => store?.owner_email?.trim() || '', [store?.owner_email]);

  const resolvedTitle = clampText(content.title || t('contact_title'), TITLE_MAX);
  const resolvedSubtitle = clampText(content.subtitle || t('contact_subtitle'), SUBTITLE_MAX);

  const effectiveLocationValue = isAdminRoute
    ? adminLocationInput
    : content.location?.trim() || '';

  const locationState = useMemo(
    () => normalizeLocationInput(effectiveLocationValue),
    [effectiveLocationValue]
  );

  const mapQuery = locationState.text;
  const hasLocation = locationState.isValidLocation;

  const phoneDigits = useMemo(() => normalizePhone(resolvedPhone), [resolvedPhone]);
  const hasWhatsapp = phoneDigits.length >= 8;
  const hasEmail = isValidEmail(resolvedEmail);
  const hasAnyContact = hasWhatsapp || hasEmail;

  const sectionClass =
    theme === 'dark'
      ? 'bg-slate-950 text-white'
      : 'bg-slate-50 text-slate-900';

  const surfaceClass =
    theme === 'dark'
      ? 'bg-white/[0.04] border border-white/10'
      : 'bg-white border border-slate-200 shadow-sm';

  const softSurfaceClass =
    theme === 'dark'
      ? 'bg-white/[0.03] border border-white/10'
      : 'bg-slate-50 border border-slate-200';

  const inputClass =
    theme === 'dark'
      ? 'bg-white/5 border-white/10 text-white placeholder-white/35'
      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400';

  const accentClass =
    'bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 text-white';

  const editableTitleProps = isAdminRoute
    ? createEditableHandlers('title', TITLE_MAX, onUpdate)
    : {};

  const editableSubtitleProps = isAdminRoute
    ? createEditableHandlers('subtitle', SUBTITLE_MAX, onUpdate)
    : {};

  const formDisabled = isAdminRoute;
  const showMap = !isAdminRoute && hasLocation;

  const commitLocation = useCallback(
    (value: string) => {
      const next = clampText(value, LOCATION_MAX);
      setAdminLocationInput(next);
      onUpdate?.('location', next);
    },
    [onUpdate]
  );

  const openModal = useCallback(() => {
    if (formDisabled || !hasAnyContact) return;
    setShowModal(true);
  }, [formDisabled, hasAnyContact]);

  const handleAction = useCallback(
    (type: 'wa' | 'mail') => {
      if (type === 'wa' && hasWhatsapp) {
        const text = [
          resolvedTitle,
          '',
          visitorName ? `${t('contact_form_name')}: ${visitorName}` : '',
          visitorMessage ? `${t('contact_form_message')}: ${visitorMessage}` : '',
        ]
          .filter(Boolean)
          .join('\n');

        const whatsappUrl = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      }

      if (type === 'mail' && hasEmail) {
        const subject = encodeURIComponent(resolvedTitle);
        const body = encodeURIComponent(
          [
            resolvedTitle,
            '',
            visitorName ? `${t('contact_form_name')}: ${visitorName}` : '',
            visitorMessage ? `${t('contact_form_message')}: ${visitorMessage}` : '',
          ]
            .filter(Boolean)
            .join('\n')
        );

        const mailUrl = `mailto:${resolvedEmail}?subject=${subject}&body=${body}`;
        window.open(mailUrl, '_blank', 'noopener,noreferrer');
      }

      setShowModal(false);
    },
    [hasWhatsapp, hasEmail, phoneDigits, resolvedEmail, resolvedTitle, t, visitorMessage, visitorName]
  );

  const compactHeaderClass = style.align === 'center' ? 'mx-auto' : '';

  const phoneField = (
    <WhatsAppField
      value={resolvedPhone}
      loading={storeQuery.isLoading}
      theme={theme}
      isAdminRoute={isAdminRoute}
      missingText={t('contact_missing_value')}
      loadingText={t('contact_loading_contact')}
    />
  );

  const emailField = (
    <EditableDisplayField
      icon={Mail}
      label={t('contact_label_email')}
      value={
        storeQuery.isLoading
          ? t('contact_loading_contact')
          : hasEmail
          ? resolvedEmail
          : t('contact_missing_value')
      }
      placeholder={t('contact_missing_value')}
      editable={false}
      theme={theme}
    />
  );

  const locationField = isAdminRoute ? (
    <LocationAssistField
      theme={theme}
      value={adminLocationInput}
      onChange={setAdminLocationInput}
      onCommit={commitLocation}
      status={locationState}
    />
  ) : (
    <EditableDisplayField
      icon={MapPin}
      label={t('contact_label_location')}
      value={content.location?.trim() || ''}
      placeholder=""
      editable={false}
      theme={theme}
    />
  );

  return (
    <section className={`py-10 md:py-14 px-4 sm:px-6 ${sectionClass}`}>
      <div className="max-w-6xl mx-auto">
        <div className={`mb-6 flex flex-col ${headerAlign}`}>
          <div className={`w-full ${style.align === 'center' ? 'max-w-2xl mx-auto' : 'max-w-3xl'} min-w-0`}>
            <h2
              {...editableTitleProps}
              suppressContentEditableWarning
              className={[
                `${titleSize} font-black tracking-tight outline-none break-words max-w-full min-w-0`,
                isAdminRoute
                  ? theme === 'dark'
                    ? 'rounded-xl border border-dashed border-white/15 bg-white/5 px-3 py-2'
                    : 'rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2'
                  : '',
              ].join(' ')}
              style={{ overflowWrap: 'anywhere' }}
            >
              {resolvedTitle || t('contact_title_placeholder')}
            </h2>

            <p
              {...editableSubtitleProps}
              suppressContentEditableWarning
              className={[
                'mt-2 text-sm opacity-75 outline-none break-words max-w-full min-w-0',
                compactHeaderClass,
                isAdminRoute
                  ? theme === 'dark'
                    ? 'rounded-xl border border-dashed border-white/15 bg-white/5 px-3 py-2'
                    : 'rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2'
                  : '',
              ].join(' ')}
              style={{ overflowWrap: 'anywhere' }}
            >
              {resolvedSubtitle || t('contact_subtitle_placeholder')}
            </p>
          </div>
        </div>

        {gridMode === '2' && (
          <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-4 items-start">
            <div className="min-w-0 space-y-4">
              <div className={`${surfaceClass} rounded-[24px] p-4 md:p-5 overflow-hidden`}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {phoneField}
                  {emailField}
                </div>

                <div className="mt-3">
                  {locationField}
                </div>

                {isAdminRoute && (
                  <div className="mt-3">
                    <PreviewGuideCard theme={theme} />
                  </div>
                )}

                {!hasAnyContact && !storeQuery.isLoading && (
                  <div className="mt-3">
                    <WarningCard
                      isAdminRoute={isAdminRoute}
                      dark={theme === 'dark'}
                      title={t('contact_missing_settings_title')}
                      desc={t('contact_missing_settings_desc')}
                      action={t('contact_go_settings')}
                    />
                  </div>
                )}

                {isAdminRoute && (
                  <div className="mt-3">
                    <OrientationCard theme={theme} t={t} />
                  </div>
                )}
              </div>

              <div className={`${accentClass} rounded-[24px] p-4 md:p-5 overflow-hidden`}>
                <div className="flex items-start justify-between gap-3 min-w-0">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.18em] font-black text-white/60 mb-1.5">
                      {t('contact_form_title')}
                    </p>
                    <h3 className="text-lg md:text-xl font-black tracking-tight break-words">
                      {t('contact_form_card_title')}
                    </h3>
                    <p className="mt-1.5 text-sm text-white/75 break-words">
                      {t('contact_form_card_desc')}
                    </p>
                  </div>

                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Send size={16} />
                  </div>
                </div>

                <div className="mt-4">
                  {!hasAnyContact && !storeQuery.isLoading ? (
                    <WarningCard
                      isAdminRoute={isAdminRoute}
                      dark
                      title={t('contact_unavailable_title')}
                      desc={t('contact_unavailable_desc')}
                      action={t('contact_go_settings')}
                    />
                  ) : (
                    <div className="grid gap-2.5">
                      <input
                        value={visitorName}
                        onChange={(e) => setVisitorName(clampText(e.target.value, NAME_MAX))}
                        disabled={formDisabled}
                        maxLength={NAME_MAX}
                        placeholder={t('contact_form_name_placeholder')}
                        className={`w-full min-w-0 rounded-xl border px-3 py-3 text-base outline-none focus:border-blue-400 transition ${inputClass} ${formDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                      />

                      <textarea
                        value={visitorMessage}
                        onChange={(e) => setVisitorMessage(clampText(e.target.value, MESSAGE_MAX))}
                        disabled={formDisabled}
                        rows={4}
                        maxLength={MESSAGE_MAX}
                        placeholder={t('contact_form_message_placeholder')}
                        className={`w-full min-w-0 rounded-xl border px-3 py-3 text-base outline-none focus:border-blue-400 transition resize-none ${inputClass} ${formDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                      />

                      <FieldHint theme="dark">
                        <span>{t('contact_form_name_limit', { count: NAME_MAX })}</span>
                        <span>{t('contact_form_message_limit', { count: MESSAGE_MAX })}</span>
                      </FieldHint>

                      <button
                        type="button"
                        onClick={openModal}
                        disabled={formDisabled || !hasAnyContact}
                        className="w-full rounded-xl bg-white text-slate-900 py-3 px-4 font-black uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t('contact_send_now')} <Send size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {!isAdminRoute && hasLocation && (
                  <div className="mt-3 grid sm:grid-cols-2 gap-2.5">
                    <a
                      href={buildGoogleMapsUrl(mapQuery)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 font-black uppercase tracking-[0.15em] text-[10px] hover:bg-white/15 transition-colors"
                    >
                      {t('contact_open_maps')} <ExternalLink size={14} />
                    </a>

                    <a
                      href={buildGoogleMapsUrl(mapQuery)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-slate-900 px-4 py-3 font-black uppercase tracking-[0.15em] text-[10px] hover:bg-slate-100 transition-colors"
                    >
                      {t('contact_route_now')} <Navigation size={14} />
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="min-w-0">
              {showMap ? (
                <div className={`${surfaceClass} rounded-[24px] overflow-hidden xl:sticky xl:top-6`}>
                  <div className="p-3 border-b border-slate-200 dark:border-white/10">
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin size={15} className={theme === 'dark' ? 'text-white/70 shrink-0' : 'text-slate-500 shrink-0'} />
                      <p
                        className={[
                          'text-[12px] font-semibold break-words',
                          theme === 'dark' ? 'text-white/85' : 'text-slate-700',
                        ].join(' ')}
                        style={{ overflowWrap: 'anywhere' }}
                      >
                        {mapQuery}
                      </p>
                    </div>
                  </div>

                  <iframe
                    title={resolvedTitle}
                    src={buildSatelliteEmbedUrl(mapQuery)}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-[240px] md:h-[300px] xl:h-[520px]"
                  />
                </div>
              ) : (
                <div
                  className={[
                    'rounded-[24px] border border-dashed p-4 text-sm text-center',
                    theme === 'dark'
                      ? 'border-white/10 text-white/65'
                      : 'border-slate-300 text-slate-500',
                  ].join(' ')}
                >
                  {isAdminRoute
                    ? 'The public map preview will appear here after a valid location is added.'
                    : 'Map will appear after a valid location is added.'}
                </div>
              )}
            </div>
          </div>
        )}

        {gridMode === '1' && (
          <div className="grid grid-cols-1 xl:grid-cols-[0.96fr_1.04fr] gap-4">
            <div className={`${accentClass} rounded-[24px] p-4 md:p-5`}>
              <div className="grid gap-2.5">
                <WhatsAppField
                  value={resolvedPhone}
                  loading={storeQuery.isLoading}
                  theme="dark"
                  isAdminRoute={isAdminRoute}
                  missingText={t('contact_missing_value')}
                  loadingText={t('contact_loading_contact')}
                />

                <EditableDisplayField
                  icon={Mail}
                  label={t('contact_label_email')}
                  value={
                    storeQuery.isLoading
                      ? t('contact_loading_contact')
                      : hasEmail
                      ? resolvedEmail
                      : t('contact_missing_value')
                  }
                  placeholder={t('contact_missing_value')}
                  editable={false}
                  theme="dark"
                />

                {isAdminRoute ? (
                  <LocationAssistField
                    theme="dark"
                    value={adminLocationInput}
                    onChange={setAdminLocationInput}
                    onCommit={commitLocation}
                    status={locationState}
                  />
                ) : (
                  <EditableDisplayField
                    icon={MapPin}
                    label={t('contact_label_location')}
                    value={content.location?.trim() || ''}
                    placeholder=""
                    editable={false}
                    theme="dark"
                  />
                )}

                {isAdminRoute && <PreviewGuideCard theme="dark" />}
                {isAdminRoute && <OrientationCard theme="dark" t={t} />}
              </div>
            </div>

            <div className={`${surfaceClass} rounded-[24px] p-3 md:p-4`}>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.02fr] gap-3">
                <div className={`${softSurfaceClass} rounded-[20px] p-4`}>
                  <h3 className="text-base md:text-lg font-black tracking-tight mb-3">
                    {t('contact_form_title')}
                  </h3>

                  {!hasAnyContact && !storeQuery.isLoading ? (
                    <WarningCard
                      isAdminRoute={isAdminRoute}
                      title={t('contact_unavailable_title')}
                      desc={t('contact_unavailable_desc')}
                      action={t('contact_go_settings')}
                    />
                  ) : (
                    <div className="grid gap-2.5">
                      <input
                        value={visitorName}
                        onChange={(e) => setVisitorName(clampText(e.target.value, NAME_MAX))}
                        disabled={formDisabled}
                        maxLength={NAME_MAX}
                        placeholder={t('contact_form_name_placeholder')}
                        className={`w-full rounded-xl border px-3 py-3 text-base outline-none focus:border-blue-500 transition ${inputClass} ${formDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                      />
                      <textarea
                        value={visitorMessage}
                        onChange={(e) => setVisitorMessage(clampText(e.target.value, MESSAGE_MAX))}
                        disabled={formDisabled}
                        rows={4}
                        maxLength={MESSAGE_MAX}
                        placeholder={t('contact_form_message_placeholder')}
                        className={`w-full rounded-xl border px-3 py-3 text-base outline-none focus:border-blue-500 transition resize-none ${inputClass} ${formDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={openModal}
                        disabled={formDisabled || !hasAnyContact}
                        className="w-full rounded-xl bg-blue-600 text-white py-3 px-4 font-black uppercase tracking-[0.16em] text-[10px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t('contact_send_now')} <Send size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {showMap ? (
                  <div className="rounded-[20px] overflow-hidden border border-white/10 min-h-[220px]">
                    <iframe
                      title={resolvedTitle}
                      src={buildSatelliteEmbedUrl(mapQuery)}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full h-[220px] md:h-[250px] lg:h-full"
                    />
                  </div>
                ) : (
                  <div className="rounded-[20px] border border-dashed border-slate-200 dark:border-white/10 p-4 flex items-center justify-center text-center text-sm opacity-70">
                    {isAdminRoute
                      ? 'The public map preview will appear here after a valid location is added.'
                      : 'Map will appear after a valid location is added.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {gridMode === '4' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
            <div className={`${accentClass} rounded-[22px] p-4`}>
              <WhatsAppField
                value={resolvedPhone}
                loading={storeQuery.isLoading}
                theme="dark"
                isAdminRoute={isAdminRoute}
                missingText={t('contact_missing_value')}
                loadingText={t('contact_loading_contact')}
              />
            </div>

            <div className={`${surfaceClass} rounded-[22px] p-4`}>
              <div className="grid gap-2.5">
                {emailField}
                {locationField}
              </div>
            </div>

            <div className={`${surfaceClass} rounded-[22px] overflow-hidden min-h-[200px]`}>
              {showMap ? (
                <iframe
                  title={resolvedTitle}
                  src={buildSatelliteEmbedUrl(mapQuery)}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-[200px]"
                />
              ) : (
                <div className="h-[200px] flex items-center justify-center text-center text-sm opacity-70 px-4">
                  {isAdminRoute ? (
                    <div className="px-3">
                      <PreviewGuideCard theme={theme} />
                    </div>
                  ) : (
                    'Map will appear after a valid location is added.'
                  )}
                </div>
              )}
            </div>

            <div className={`${surfaceClass} rounded-[22px] p-4`}>
              <h3 className="text-base font-black tracking-tight mb-3">
                {t('contact_form_title')}
              </h3>

              {!hasAnyContact && !storeQuery.isLoading ? (
                <WarningCard
                  isAdminRoute={isAdminRoute}
                  title={t('contact_unavailable_title')}
                  desc={t('contact_unavailable_desc')}
                  action={t('contact_go_settings')}
                />
              ) : (
                <div className="grid gap-2.5">
                  <input
                    value={visitorName}
                    onChange={(e) => setVisitorName(clampText(e.target.value, NAME_MAX))}
                    disabled={formDisabled}
                    maxLength={NAME_MAX}
                    placeholder={t('contact_form_name_placeholder')}
                    className={`w-full rounded-xl border px-3 py-3 text-base outline-none focus:border-blue-500 transition ${inputClass} ${formDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />

                  <textarea
                    value={visitorMessage}
                    onChange={(e) => setVisitorMessage(clampText(e.target.value, MESSAGE_MAX))}
                    disabled={formDisabled}
                    rows={3}
                    maxLength={MESSAGE_MAX}
                    placeholder={t('contact_form_message_placeholder')}
                    className={`w-full rounded-xl border px-3 py-3 text-base outline-none focus:border-blue-500 transition resize-none ${inputClass} ${formDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />

                  <button
                    type="button"
                    onClick={openModal}
                    disabled={formDisabled || !hasAnyContact}
                    className="w-full rounded-xl bg-blue-600 text-white py-3 px-4 font-black uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('contact_send_now')} <Send size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80">
          <div className="w-full max-w-sm rounded-[24px] bg-white text-slate-900 p-5 shadow-2xl">
            <h4 className="text-xl font-black text-center tracking-tight mb-4">
              {t('contact_modal_title')}
            </h4>

            <div className="grid gap-2.5">
              <button
                type="button"
                onClick={() => handleAction('wa')}
                disabled={!hasWhatsapp}
                className="flex items-center justify-center gap-3 rounded-xl bg-[#25D366] text-white p-3.5 font-black disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <MessageCircle size={20} />
                WhatsApp
              </button>

              <button
                type="button"
                onClick={() => handleAction('mail')}
                disabled={!hasEmail}
                className="flex items-center justify-center gap-3 rounded-xl bg-slate-900 text-white p-3.5 font-black disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Mail size={20} />
                E-mail
              </button>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="mt-1 text-[10px] uppercase tracking-[0.2em] font-bold opacity-50"
              >
                {t('contact_close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export const ContactoMapa = memo(ContactoMapaComponent);