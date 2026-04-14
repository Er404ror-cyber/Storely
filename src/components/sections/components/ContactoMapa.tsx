import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Search,
  Send,
  Settings2,
  Sparkles,
  Phone,
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

type ResolvedLocation = {
  raw: string;
  finalQuery: string;
  label: string;
  confidence: 'high' | 'medium' | 'low';
};

const TITLE_MAX = 30;
const SUBTITLE_MAX = 100;
const LOCATION_MAX = 160;
const NAME_MAX = 60;
const MESSAGE_MAX = 300;

const SMART_LOCATION_HELPERS: Array<{
  keys: string[];
  append?: string;
}> = [
  { keys: ['zimpeto', 'zimpto', 'zimpet', 'zimpedo'], append: 'Maputo, Mozambique' },
  { keys: ['maputo'], append: 'Mozambique' },
  { keys: ['matola'], append: 'Mozambique' },
  { keys: ['isctem'], append: 'Maputo, Mozambique' },
  { keys: ['uem'], append: 'Maputo, Mozambique' },
  { keys: ['ct university', 'ctu', 'ct univ'], append: 'Ludhiana, Punjab, India' },
  { keys: ['ludhiana'], append: 'Punjab, India' },
  { keys: ['tete'], append: 'Mozambique' },
  { keys: ['beira'], append: 'Mozambique' },
  { keys: ['cape town'], append: 'South Africa' },
  { keys: ['johannesburg'], append: 'South Africa' },
  { keys: ['durban'], append: 'South Africa' },
  { keys: ['nairobi'], append: 'Kenya' },
  { keys: ['lagos'], append: 'Nigeria' },
  { keys: ['dubai'], append: 'United Arab Emirates' },
  { keys: ['london'], append: 'United Kingdom' },
  { keys: ['paris'], append: 'France' },
  { keys: ['new york'], append: 'United States' },
];

const SMART_LOCATION_ALIASES: Array<{
  keys: string[];
  value: string;
}> = [
  { keys: ['ct university ludhiana', 'ctu ludhiana'], value: 'CT University, Ludhiana, Punjab, India' },
  { keys: ['zimpeto maputo'], value: 'Zimpeto, Maputo, Mozambique' },
  { keys: ['isctem maputo'], value: 'ISCTEM, Maputo, Mozambique' },
  { keys: ['uem maputo'], value: 'Universidade Eduardo Mondlane, Maputo, Mozambique' },
];

function clampText(value: string, max: number) {
  return value.length > max ? value.slice(0, max) : value;
}

function normalizePhone(value?: string | null) {
  return (value || '').replace(/\D/g, '');
}

function isValidEmail(value?: string | null) {
  if (!value) return false;
  return /\S+@\S+\.\S+/.test(value);
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

function normalizeLooseText(value?: string | null) {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function titleCasePreserveWords(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((word) => {
      if (word.toUpperCase() === word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function commaParts(value: string) {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function appendIfMissing(base: string, addition?: string) {
  if (!addition) return base;

  const normalizedBase = normalizeLooseText(base);
  const normalizedAddition = normalizeLooseText(addition);

  if (!normalizedAddition) return base;
  if (normalizedBase.includes(normalizedAddition)) return base;

  const baseParts = commaParts(base);
  const additionParts = commaParts(addition);
  const merged = [...baseParts];

  for (const part of additionParts) {
    const normalizedPart = normalizeLooseText(part);
    const alreadyExists = merged.some(
      (existing) => normalizeLooseText(existing) === normalizedPart
    );
    if (!alreadyExists) merged.push(part);
  }

  return merged.join(', ');
}

function findStrongAlias(raw: string) {
  const normalized = normalizeLooseText(raw);

  for (const item of SMART_LOCATION_ALIASES) {
    if (item.keys.some((key) => normalized.includes(normalizeLooseText(key)))) {
      return item.value;
    }
  }

  return null;
}

export function resolveLocationSmart(raw?: string | null): ResolvedLocation | null {
  if (!raw) return null;

  const original = raw.trim();
  if (!original) return null;

  const strongAlias = findStrongAlias(original);
  if (strongAlias) {
    return {
      raw: original,
      finalQuery: strongAlias,
      label: strongAlias,
      confidence: 'high',
    };
  }

  const normalized = normalizeLooseText(original);
  let finalText = titleCasePreserveWords(original);
  let confidence: 'high' | 'medium' | 'low' = 'low';

  for (const rule of SMART_LOCATION_HELPERS) {
    if (rule.keys.some((k) => normalized.includes(normalizeLooseText(k)))) {
      finalText = appendIfMissing(finalText, rule.append);
      confidence = 'medium';
      break;
    }
  }

  const localSuggestion = LOCATION_SUGGESTIONS.find((item) => {
    const normalizedItem = normalizeLooseText(item);
    return normalizedItem === normalized || normalizedItem.includes(normalized);
  });

  if (
    localSuggestion &&
    normalizeLooseText(localSuggestion).length > normalizeLooseText(finalText).length
  ) {
    finalText = appendIfMissing(titleCasePreserveWords(original), localSuggestion);
    confidence = 'high';
  }

  return {
    raw: original,
    finalQuery: finalText,
    label: finalText,
    confidence,
  };
}

function buildGoogleMapsUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function buildGoogleMapsEmbedUrl(query: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(
    query
  )}&t=k&z=15&ie=UTF8&iwloc=&output=embed`;
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

function SectionEditHelp({
  theme,
  t,
}: {
  theme: 'dark' | 'light';
  t: (key: string, vars?: Record<string, unknown>) => string;
}) {
  return (
    <div
      className={[
        'rounded-xl border p-3',
        theme === 'dark'
          ? 'border-white/10 bg-white/5'
          : 'border-slate-200 bg-slate-50',
      ].join(' ')}
    >
      <div className="flex items-start gap-2.5">
        <Sparkles
          size={15}
          className={theme === 'dark' ? 'text-blue-200 mt-0.5 shrink-0' : 'text-blue-600 mt-0.5 shrink-0'}
        />
        <div className="min-w-0">
          <p className={['text-sm font-bold', theme === 'dark' ? 'text-white' : 'text-slate-900'].join(' ')}>
            {t('contact_edit_section_title')}
          </p>
          <p className={['mt-1 text-[12px]', theme === 'dark' ? 'text-white/75' : 'text-slate-600'].join(' ')}>
            {t('contact_edit_section_desc')}
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
  accent = false,
}: {
  value: string;
  loading: boolean;
  theme: 'dark' | 'light';
  isAdminRoute: boolean;
  missingText: string;
  loadingText: string;
  accent?: boolean;
}) {
  const visibleValue = loading ? loadingText : value || missingText;

  const inner = (
    <EditableDisplayField
      icon={Phone}
      label="WhatsApp"
      value={visibleValue}
      placeholder={missingText}
      editable={false}
      theme={accent ? 'dark' : theme}
      footer={
        isAdminRoute ? (
          <CompactSettingsButton
            theme={accent ? 'dark' : theme}
            to="/admin/configuracoes"
            label="Edit WhatsApp"
          />
        ) : null
      }
    />
  );

  if (!accent) return inner;

  return (
    <div className="rounded-[22px] bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 text-white p-4">
      {inner}
    </div>
  );
}

function EmailField({
  value,
  loading,
  theme,
  isAdminRoute,
  missingText,
  loadingText,
  accent = false,
}: {
  value: string;
  loading: boolean;
  theme: 'dark' | 'light';
  isAdminRoute: boolean;
  missingText: string;
  loadingText: string;
  accent?: boolean;
}) {
  const visibleValue = loading ? loadingText : value || missingText;

  const inner = (
    <EditableDisplayField
      icon={Mail}
      label="Email"
      value={visibleValue}
      placeholder={missingText}
      editable={false}
      theme={accent ? 'dark' : theme}
      footer={
        isAdminRoute ? (
          <CompactSettingsButton
            theme={accent ? 'dark' : theme}
            to="/admin/configuracoes"
            label="Edit Email"
          />
        ) : null
      }
    />
  );

  if (!accent) return inner;

  return (
    <div className="rounded-[22px] bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 text-white p-4">
      {inner}
    </div>
  );
}

function AdminTextField({
  value,
  fallback,
  max,
  theme,
  multiline = false,
  align = 'left',
  title = false,
  onCommit,
}: {
  value: string;
  fallback: string;
  max: number;
  theme: 'dark' | 'light';
  multiline?: boolean;
  align?: 'center' | 'left' | 'justify';
  title?: boolean;
  onCommit?: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value || '');
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    setDraft(value || '');
  }, [value]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  const pushCommit = useCallback(
    (next: string) => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => {
        onCommit?.(next);
      }, 180);
    },
    [onCommit]
  );

  const baseClass = [
    'w-full min-w-0 rounded-xl border outline-none transition',
    theme === 'dark'
      ? 'border-white/15 bg-white/5 text-white placeholder:text-white/35'
      : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400',
    align === 'center' ? 'text-center' : 'text-left',
    title
      ? 'px-3 py-2 text-2xl md:text-3xl font-black tracking-tight'
      : 'px-3 py-2 text-sm leading-relaxed',
  ].join(' ');

  if (multiline) {
    return (
      <textarea
        value={draft}
        dir="ltr"
        autoComplete="off"
        spellCheck={false}
        rows={3}
        maxLength={max}
        placeholder={fallback}
        className={`${baseClass} resize-none`}
        style={{
          overflowWrap: 'anywhere',
          whiteSpace: 'pre-wrap',
          unicodeBidi: 'plaintext',
        }}
        onChange={(e) => {
          const next = clampText(e.target.value, max);
          setDraft(next);
          pushCommit(next);
        }}
        onBlur={(e) => {
          const finalValue = clampText(e.target.value, max).trim();
          setDraft(finalValue);
          onCommit?.(finalValue);
        }}
      />
    );
  }

  return (
    <input
      type="text"
      value={draft}
      dir="ltr"
      autoComplete="off"
      spellCheck={false}
      maxLength={max}
      placeholder={fallback}
      className={baseClass}
      style={{ unicodeBidi: 'plaintext' }}
      onChange={(e) => {
        const next = clampText(e.target.value, max);
        setDraft(next);
        pushCommit(next);
      }}
      onBlur={(e) => {
        const finalValue = clampText(e.target.value, max).trim();
        setDraft(finalValue);
        onCommit?.(finalValue);
      }}
    />
  );
}

function LocationAssistField({
  theme,
  value,
  onChange,
  onCommit,
  t,
}: {
  theme: 'dark' | 'light';
  value: string;
  onChange: (v: string) => void;
  onCommit: (v: string) => void;
  t: (key: string, vars?: Record<string, unknown>) => string;
}) {
  const [open, setOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const suggestions = useMemo(() => {
    const q = normalizeLooseText(value);
    const smart = resolveLocationSmart(value);

    const scored = LOCATION_SUGGESTIONS.map((item) => {
      const normalizedItem = normalizeLooseText(item);
      let score = 0;

      if (!q) {
        score = 1;
      } else {
        if (normalizedItem === q) score += 100;
        if (normalizedItem.startsWith(q)) score += 60;
        if (normalizedItem.includes(q)) score += 35;

        const qWords = q.split(/\s+/).filter(Boolean);
        const itemWords = normalizedItem.split(/\s+/).filter(Boolean);

        for (const word of qWords) {
          if (itemWords.some((w) => w.startsWith(word))) score += 12;
          else if (itemWords.some((w) => w.includes(word))) score += 6;
        }
      }

      return { item, score };
    })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.item);

    const merged = Array.from(
      new Set([...(smart?.label ? [smart.label] : []), ...scored])
    );

    return merged.slice(0, q ? 10 : 12);
  }, [value]);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) {
        setOpen(false);
        setIsFocused(false);
      }
    }

    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, []);

  const inputClass =
    theme === 'dark'
      ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400';

  const suggestionSurface =
    theme === 'dark'
      ? 'border-white/10 bg-slate-950'
      : 'border-slate-200 bg-white';

  const resolved = resolveLocationSmart(value);
  const shouldShowDropdown = open && isFocused && suggestions.length > 0;

  return (
    <div ref={boxRef} className="relative z-[80]" style={{ isolation: 'isolate' }}>
      <div
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
            {t('contact_location_area_label')}
          </p>
        </div>

        <div className="relative">
          <Search
            size={15}
            className={[
              'absolute left-3 top-1/2 -translate-y-1/2 z-[1]',
              theme === 'dark' ? 'text-white/35' : 'text-slate-400',
            ].join(' ')}
          />

          <input
            value={value}
            dir="ltr"
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => {
              const next = clampText(e.target.value, LOCATION_MAX);
              onChange(next);
              setOpen(true);
            }}
            onFocus={() => {
              setIsFocused(true);
              setOpen(true);
            }}
            onBlur={() => {
              setIsFocused(false);
              setOpen(false);
              onCommit(value);
            }}
            placeholder={t('contact_location_placeholder')}
            className={`w-full rounded-xl border pl-10 pr-3 py-3 text-base outline-none focus:border-blue-500 transition ${inputClass}`}
            style={{ fontSize: 16, unicodeBidi: 'plaintext' }}
          />
        </div>

        <p
          className={[
            'mt-2 text-[12px]',
            theme === 'dark' ? 'text-white/55' : 'text-slate-500',
          ].join(' ')}
        >
          {t('contact_location_help')}
        </p>

        <FieldHint theme={theme}>
          <span>{t('contact_location_max', { count: LOCATION_MAX })}</span>
          <span>
            {resolved
              ? t('contact_location_final', { value: resolved.label })
              : t('contact_location_smart_help')}
          </span>
        </FieldHint>

        {resolved ? (
          <div
            className={`mt-2 inline-flex items-center gap-2 text-[12px] ${
              theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600'
            }`}
          >
            <CheckCircle2 size={14} />
            {t('contact_location_final_search', { value: resolved.label })}
          </div>
        ) : null}
      </div>

      {shouldShowDropdown ? (
        <div
          className={`absolute left-0 right-0 top-full mt-2 z-[999] overflow-hidden rounded-xl border shadow-2xl ${suggestionSurface}`}
        >
          <div className="max-h-52 overflow-y-auto overscroll-contain">
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(item);
                  onCommit(item);
                  setOpen(false);
                  setIsFocused(false);
                }}
                className={[
                  'w-full text-left px-3 py-3 text-sm transition border-b last:border-b-0',
                  theme === 'dark'
                    ? 'text-white hover:bg-white/5 border-white/5'
                    : 'text-slate-700 hover:bg-slate-50 border-slate-100',
                ].join(' ')}
              >
                <div className="font-semibold break-words">{item}</div>
                <div
                  className={`text-[11px] ${
                    theme === 'dark' ? 'text-white/45' : 'text-slate-400'
                  }`}
                >
                  {t('contact_location_dropdown_hint')}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SimpleMap({
  finalQuery,
  label,
}: {
  finalQuery: string;
  label: string;
}) {
  return (
    <div className="rounded-[22px] overflow-hidden border border-slate-200 dark:border-white/10">
      <div className="h-[250px] md:h-[320px] xl:h-[520px]">
        <iframe
          title={label}
          src={buildGoogleMapsEmbedUrl(finalQuery)}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full border-0"
        />
      </div>

      <div className="flex items-center justify-between gap-3 px-3 py-3 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-white/10">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-white/50">
            Location
          </p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {label}
          </p>
        </div>

        <a
          href={buildGoogleMapsUrl(finalQuery)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-white hover:bg-blue-700 transition-colors"
        >
          Open
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}

function FormCard({
  formDisabled,
  hasAnyContact,
  storeLoading,
  inputClass,
  visitorName,
  setVisitorName,
  visitorMessage,
  setVisitorMessage,
  openModal,
  t,
  isAdminRoute,
}: {
  formDisabled: boolean;
  hasAnyContact: boolean;
  storeLoading: boolean;
  inputClass: string;
  visitorName: string;
  setVisitorName: React.Dispatch<React.SetStateAction<string>>;
  visitorMessage: string;
  setVisitorMessage: React.Dispatch<React.SetStateAction<string>>;
  openModal: () => void;
  t: (key: string, vars?: Record<string, unknown>) => string;
  isAdminRoute: boolean;
}) {
  return (
    <div className="rounded-[24px] bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 text-white p-4 md:p-5 overflow-hidden">
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
        {!hasAnyContact && !storeLoading ? (
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
              dir="ltr"
              autoComplete="off"
              spellCheck={false}
              onChange={(e) =>
                setVisitorName(clampText(e.target.value, NAME_MAX))
              }
              disabled={formDisabled}
              maxLength={NAME_MAX}
              placeholder={t('contact_form_name_placeholder')}
              className={`w-full min-w-0 rounded-xl border px-3 py-3 text-base outline-none focus:border-blue-400 transition ${inputClass} ${
                formDisabled ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              style={{ fontSize: 16, unicodeBidi: 'plaintext' }}
            />

            <textarea
              value={visitorMessage}
              dir="ltr"
              autoComplete="off"
              spellCheck={false}
              onChange={(e) =>
                setVisitorMessage(clampText(e.target.value, MESSAGE_MAX))
              }
              disabled={formDisabled}
              rows={4}
              maxLength={MESSAGE_MAX}
              placeholder={t('contact_form_message_placeholder')}
              className={`w-full min-w-0 rounded-xl border px-3 py-3 text-base outline-none focus:border-blue-400 transition resize-none ${inputClass} ${
                formDisabled ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              style={{ fontSize: 16, unicodeBidi: 'plaintext' }}
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
  const [adminLocationInput, setAdminLocationInput] = useState(
    content.location?.trim() || ''
  );

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

  const resolvedPhone = useMemo(
    () => store?.whatsapp_number?.trim() || '',
    [store?.whatsapp_number]
  );
  const resolvedEmail = useMemo(
    () => store?.owner_email?.trim() || '',
    [store?.owner_email]
  );

  const resolvedTitle = clampText(content.title || '', TITLE_MAX);
  const resolvedSubtitle = clampText(content.subtitle || '', SUBTITLE_MAX);

  const visibleTitle = resolvedTitle || t('contact_title');
  const visibleSubtitle = resolvedSubtitle || t('contact_subtitle');

  const effectiveLocationValue = isAdminRoute
    ? adminLocationInput
    : content.location?.trim() || '';

  const resolvedLocation = useMemo(
    () => resolveLocationSmart(effectiveLocationValue),
    [effectiveLocationValue]
  );

  const showPublicMap = !isAdminRoute && !!resolvedLocation;

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

  const inputClass =
    theme === 'dark'
      ? 'bg-white/5 border-white/10 text-white placeholder-white/35'
      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400';

  const formDisabled = isAdminRoute;

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
        const titleForMessage = resolvedTitle || t('contact_title');
        const text = [
          titleForMessage,
          '',
          visitorName ? `${t('contact_form_name')}: ${visitorName}` : '',
          visitorMessage ? `${t('contact_form_message')}: ${visitorMessage}` : '',
        ]
          .filter(Boolean)
          .join('\n');

        const whatsappUrl = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(
          text
        )}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      }

      if (type === 'mail' && hasEmail) {
        const titleForMessage = resolvedTitle || t('contact_title');
        const subject = encodeURIComponent(titleForMessage);
        const body = encodeURIComponent(
          [
            titleForMessage,
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
    [
      hasWhatsapp,
      hasEmail,
      phoneDigits,
      resolvedEmail,
      resolvedTitle,
      t,
      visitorMessage,
      visitorName,
    ]
  );

  const locationField = isAdminRoute ? (
    <LocationAssistField
      theme={theme}
      value={adminLocationInput}
      onChange={setAdminLocationInput}
      onCommit={commitLocation}
      t={t}
    />
  ) : resolvedLocation ? (
    <EditableDisplayField
      icon={MapPin}
      label={t('contact_label_location')}
      value={resolvedLocation.label}
      placeholder=""
      editable={false}
      theme={theme}
      helpText={t('contact_location_final_help')}
    />
  ) : null;

  const topHelp = isAdminRoute ? <SectionEditHelp theme={theme} t={t} /> : null;

  const publicMap =
    showPublicMap && resolvedLocation ? (
      <SimpleMap
        finalQuery={resolvedLocation.finalQuery}
        label={resolvedLocation.label}
      />
    ) : null;

  return (
    <section className={`py-8 md:py-10 px-4 sm:px-5 ${sectionClass}`}>
      <div className="max-w-6xl mx-auto space-y-4">
        {topHelp}

        <div className={`flex flex-col ${headerAlign}`}>
          <div
            className={`w-full ${
              style.align === 'center' ? 'max-w-2xl mx-auto' : 'max-w-3xl'
            } min-w-0`}
          >
            {isAdminRoute ? (
              <>
                <AdminTextField
                  value={resolvedTitle}
                  fallback={t('contact_title_placeholder')}
                  max={TITLE_MAX}
                  theme={theme}
                  align={style.align}
                  title
                  onCommit={(value) => onUpdate?.('title', value)}
                />

                <div className="mt-2">
                  <AdminTextField
                    value={resolvedSubtitle}
                    fallback={t('contact_subtitle_placeholder')}
                    max={SUBTITLE_MAX}
                    theme={theme}
                    align={style.align}
                    multiline
                    onCommit={(value) => onUpdate?.('subtitle', value)}
                  />
                </div>
              </>
            ) : (
              <>
                <h2
                  className={`${titleSize} font-black tracking-tight break-words max-w-full min-w-0`}
                  style={{ overflowWrap: 'anywhere' }}
                >
                  {visibleTitle}
                </h2>

                <p
                  className="mt-2 text-sm opacity-75 break-words max-w-full min-w-0"
                  style={{ overflowWrap: 'anywhere' }}
                >
                  {visibleSubtitle}
                </p>
              </>
            )}
          </div>
        </div>

        {gridMode === '2' && (
          <div className={showPublicMap ? 'grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-4 items-start' : 'space-y-4'}>
            <div className="min-w-0 space-y-4">
              <div className={`${surfaceClass} rounded-[24px] p-4 overflow-visible`}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <WhatsAppField
                    value={resolvedPhone}
                    loading={storeQuery.isLoading}
                    theme={theme}
                    isAdminRoute={isAdminRoute}
                    missingText={t('contact_missing_value')}
                    loadingText={t('contact_loading_contact')}
                  />

                  <EmailField
                    value={resolvedEmail}
                    loading={storeQuery.isLoading}
                    theme={theme}
                    isAdminRoute={isAdminRoute}
                    missingText={t('contact_missing_value')}
                    loadingText={t('contact_loading_contact')}
                  />
                </div>

                {locationField ? <div className="mt-3">{locationField}</div> : null}

                {!hasAnyContact && !storeQuery.isLoading ? (
                  <div className="mt-3">
                    <WarningCard
                      isAdminRoute={isAdminRoute}
                      dark={theme === 'dark'}
                      title={t('contact_missing_settings_title')}
                      desc={t('contact_missing_settings_desc')}
                      action={t('contact_go_settings')}
                    />
                  </div>
                ) : null}
              </div>

              <FormCard
                formDisabled={formDisabled}
                hasAnyContact={hasAnyContact}
                storeLoading={storeQuery.isLoading}
                inputClass={inputClass}
                visitorName={visitorName}
                setVisitorName={setVisitorName}
                visitorMessage={visitorMessage}
                setVisitorMessage={setVisitorMessage}
                openModal={openModal}
                t={t}
                isAdminRoute={isAdminRoute}
              />
            </div>

            {showPublicMap ? <div className="min-w-0">{publicMap}</div> : null}
          </div>
        )}

        {gridMode === '1' && (
          <div className={showPublicMap ? 'grid grid-cols-1 xl:grid-cols-[0.96fr_1.04fr] gap-4' : 'space-y-4'}>
            <div className={`${surfaceClass} rounded-[24px] p-4 overflow-visible`}>
              <div className="grid gap-3">
                <WhatsAppField
                  value={resolvedPhone}
                  loading={storeQuery.isLoading}
                  theme={theme}
                  isAdminRoute={isAdminRoute}
                  missingText={t('contact_missing_value')}
                  loadingText={t('contact_loading_contact')}
                />

                <EmailField
                  value={resolvedEmail}
                  loading={storeQuery.isLoading}
                  theme={theme}
                  isAdminRoute={isAdminRoute}
                  missingText={t('contact_missing_value')}
                  loadingText={t('contact_loading_contact')}
                />

                {locationField}
              </div>
            </div>

            {showPublicMap ? (
              <div className="space-y-4">
                {publicMap}
                <FormCard
                  formDisabled={formDisabled}
                  hasAnyContact={hasAnyContact}
                  storeLoading={storeQuery.isLoading}
                  inputClass={inputClass}
                  visitorName={visitorName}
                  setVisitorName={setVisitorName}
                  visitorMessage={visitorMessage}
                  setVisitorMessage={setVisitorMessage}
                  openModal={openModal}
                  t={t}
                  isAdminRoute={isAdminRoute}
                />
              </div>
            ) : (
              <FormCard
                formDisabled={formDisabled}
                hasAnyContact={hasAnyContact}
                storeLoading={storeQuery.isLoading}
                inputClass={inputClass}
                visitorName={visitorName}
                setVisitorName={setVisitorName}
                visitorMessage={visitorMessage}
                setVisitorMessage={setVisitorMessage}
                openModal={openModal}
                t={t}
                isAdminRoute={isAdminRoute}
              />
            )}
          </div>
        )}

        {gridMode === '4' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
            <EmailField
              value={resolvedEmail}
              loading={storeQuery.isLoading}
              theme={theme}
              isAdminRoute={isAdminRoute}
              missingText={t('contact_missing_value')}
              loadingText={t('contact_loading_contact')}
              accent
            />

            <div className={`${surfaceClass} rounded-[22px] p-4`}>
              <WhatsAppField
                value={resolvedPhone}
                loading={storeQuery.isLoading}
                theme={theme}
                isAdminRoute={isAdminRoute}
                missingText={t('contact_missing_value')}
                loadingText={t('contact_loading_contact')}
              />
            </div>

            <div className={`${surfaceClass} rounded-[22px] p-4 overflow-visible`}>
              {locationField || (
                <div className="text-sm text-slate-500 dark:text-white/55">
                  {isAdminRoute ? t('contact_add_location_here') : ''}
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
                    dir="ltr"
                    autoComplete="off"
                    spellCheck={false}
                    onChange={(e) =>
                      setVisitorName(clampText(e.target.value, NAME_MAX))
                    }
                    disabled={formDisabled}
                    maxLength={NAME_MAX}
                    placeholder={t('contact_form_name_placeholder')}
                    className={`w-full rounded-xl border px-3 py-3 text-base outline-none focus:border-blue-500 transition ${inputClass} ${
                      formDisabled ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                    style={{ fontSize: 16, unicodeBidi: 'plaintext' }}
                  />

                  <textarea
                    value={visitorMessage}
                    dir="ltr"
                    autoComplete="off"
                    spellCheck={false}
                    onChange={(e) =>
                      setVisitorMessage(clampText(e.target.value, MESSAGE_MAX))
                    }
                    disabled={formDisabled}
                    rows={3}
                    maxLength={MESSAGE_MAX}
                    placeholder={t('contact_form_message_placeholder')}
                    className={`w-full rounded-xl border px-3 py-3 text-base outline-none focus:border-blue-500 transition resize-none ${inputClass} ${
                      formDisabled ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                    style={{ fontSize: 16, unicodeBidi: 'plaintext' }}
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

            {showPublicMap ? (
              <div className="sm:col-span-2 xl:col-span-4">{publicMap}</div>
            ) : null}
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