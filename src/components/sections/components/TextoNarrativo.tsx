import React, { memo, useCallback, useMemo } from 'react';
import {
  getTheme,
  getFontSize,
  editableProps,
  MAX_TEXT_LIMITS,
  normalizeText,
  clampText,
  handleEditableKeyDown,
  handleEditablePaste,
} from '../helpers';
import type { SectionProps } from '../main';
import { useTranslate } from '../../../context/LanguageContext';

interface TextoNarrativoContent {
  badge?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  secondaryTitle?: string;
  secondaryDescription?: string;
}

interface TextoNarrativoProps extends Omit<SectionProps, 'content'> {
  content: TextoNarrativoContent;
}

type TranslateFn = ReturnType<typeof useTranslate>['t'];

const alignMap = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  justify: 'items-start text-justify',
} as const;

const FieldCounter = memo(
  ({ value, max, isDark }: { value: string; max: number; isDark: boolean }) => (
    <div className={`mt-1 text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
      {value.length}/{max}
    </div>
  )
);

const EditableField = memo(({
  as,
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
}: {
  as?: React.ElementType;
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
}) => {
  const Tag: React.ElementType = as || 'p';

  return (
    <div className="w-full min-w-0">
      <Tag
        {...editableProps(isEditable, onUpdate)}
        onBlur={(e: React.FocusEvent<HTMLElement>) => {
          const raw = e.currentTarget.innerText.replace(/\u00A0/g, ' ').trim();
          const next = raw.length ? clampText(raw, max, maxBreaks) : fallback;
          e.currentTarget.innerText = next;
          onUpdate(next);
        }}
        onKeyDown={(e: React.KeyboardEvent<HTMLElement>) =>
          handleEditableKeyDown(e, max, maxBreaks, singleLine, t as any)
        }
        onPaste={(e: React.ClipboardEvent<HTMLElement>) =>
          handleEditablePaste(e, max, maxBreaks)
        }
        data-placeholder={fallback}
        className={[
          className || '',
          'break-words whitespace-pre-wrap min-w-0 text-[16px]',
          isEditable
            ? 'rounded-xl border border-dashed border-transparent px-2 py-1 outline-none cursor-text focus:border-slate-300 dark:focus:border-slate-700'
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
});

const TextoNarrativoComponent: React.FC<TextoNarrativoProps> = ({ content, style, onUpdate }) => {
  const { t } = useTranslate();
  const isEditable = !!onUpdate;
  const isDark = style.theme === 'dark';
  const layout = style.cols ?? '1';
  const alignClass = alignMap[style.align || 'left'];

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
      subtitle: normalizeText(content.subtitle, t('aboutSubtitle'), MAX_TEXT_LIMITS.subtitle, 1),
      description: normalizeText(content.description, t('aboutDescription'), MAX_TEXT_LIMITS.description, 1),
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
    }),
    [content, t]
  );

  const sectionTone = isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900';
  const cardTone = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const softCardTone = isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200';
  const mutedTone = isDark ? 'text-slate-300' : 'text-slate-700';
  const badgeTone = isDark
    ? 'bg-slate-800 border-slate-700 text-white'
    : 'bg-slate-100 border-slate-300 text-slate-900';
  const hintTone = isDark
    ? 'border-slate-700 bg-slate-900/60 text-slate-300'
    : 'border-slate-300 bg-slate-50 text-slate-600';

  return (
    <section
      className={`relative overflow-hidden py-10 md:py-14 transition-all duration-300 ${getTheme(
        style.theme
      )} ${sectionTone}`}
    >
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        {isEditable && (
          <div className={`mb-4 rounded-2xl border border-dashed px-4 py-3 text-sm font-semibold ${hintTone}`}>
            {t('textSectionSimpleHelp')}
          </div>
        )}

        {layout === '1' && (
          <div className={`rounded-[24px] border shadow-sm ${cardTone}`}>
            <div className="grid grid-cols-1 gap-4 p-5 md:p-6">
              <div className={`flex flex-col gap-3 ${alignClass}`}>
                <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-black uppercase tracking-widest ${badgeTone}`}>
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
                  className={`${getFontSize(style.fontSize, 'h2')} font-black leading-tight tracking-tight`}
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

              <div className={`rounded-[20px] border p-4 ${softCardTone}`}>
                <div className={`flex flex-col gap-3 ${alignClass}`}>
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
                    onUpdate={update('secondaryDescription', MAX_TEXT_LIMITS.secondaryDescription, 1)}
                    className={`${getFontSize(style.fontSize, 'p')} leading-7 ${mutedTone}`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {layout === '2' && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className={`rounded-[24px] border p-5 shadow-sm ${cardTone}`}>
              <div className={`flex h-full flex-col gap-3 ${alignClass}`}>
                <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-black uppercase tracking-widest ${badgeTone}`}>
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
              </div>
            </div>

            <div className={`rounded-[24px] border p-5 shadow-sm ${softCardTone}`}>
              <div className={`flex h-full flex-col gap-3 ${alignClass}`}>
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
                  onUpdate={update('secondaryDescription', MAX_TEXT_LIMITS.secondaryDescription, 1)}
                  className={`${getFontSize(style.fontSize, 'p')} leading-7 ${mutedTone}`}
                />
              </div>
            </div>
          </div>
        )}

        {layout === '4' && (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
            <div className={`rounded-[24px] border p-5 shadow-sm xl:col-span-2 ${cardTone}`}>
              <div className={`flex h-full flex-col gap-3 ${alignClass}`}>
                <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-black uppercase tracking-widest ${badgeTone}`}>
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

            <div className={`rounded-[24px] border p-5 shadow-sm xl:col-span-2 ${softCardTone}`}>
              <div className={`flex h-full flex-col gap-3 ${alignClass}`}>
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
                  className={`${getFontSize(style.fontSize, 'h3')} font-bold`}
                />
              </div>
            </div>

            <div className={`rounded-[24px] border p-5 shadow-sm xl:col-span-4 ${cardTone}`}>
              <div className={`flex h-full flex-col gap-3 ${alignClass}`}>
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
                  onUpdate={update('secondaryDescription', MAX_TEXT_LIMITS.secondaryDescription, 1)}
                  className={`${getFontSize(style.fontSize, 'p')} leading-7 ${mutedTone}`}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export const TextoNarrativo = memo(TextoNarrativoComponent, (prevProps, nextProps) => {
  return prevProps.style === nextProps.style && prevProps.content === nextProps.content;
});

TextoNarrativo.displayName = 'TextoNarrativo';