import  { memo } from 'react';
import { EditableField } from './EditableField';
import { getFontSize, MAX_TEXT_LIMITS } from '../sections/helpers';
import type { TranslateFn } from '../../types/TextTypes';


interface SharedCardProps {
  resolved: any;
  update: (field: string, max: number, maxBreaks?: number) => (val: string) => void;
  isEditable: boolean;
  isDark: boolean;
  alignClass: string;
  style: any;
  t: TranslateFn;
  cardTone?: string;
}

export const WhoAmIInner = memo(({ resolved, update, isEditable, isDark, alignClass, style, t }: SharedCardProps) => (
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
      onUpdate={update('secondaryDescription', MAX_TEXT_LIMITS.secondaryDescription, 1)}
      className={`${getFontSize(style.fontSize, 'p')} leading-7 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
    />
  </div>
));
WhoAmIInner.displayName = 'WhoAmIInner';

export const AboutCard = memo(({ resolved, update, isEditable, isDark, alignClass, style, t, cardTone }: SharedCardProps) => {
  const badgeTone = isDark ? 'bg-slate-800/90 border-slate-700 text-slate-100' : 'bg-slate-100 border-slate-300 text-slate-900';
  const mutedTone = isDark ? 'text-slate-300' : 'text-slate-700';

  return (
    <div className={`rounded-[24px] border p-5 shadow-sm h-full min-w-0 transition-colors ${cardTone}`}>
      <div className={`flex flex-col gap-3 min-w-0 ${alignClass}`}>
        <span className={`inline-flex w-fit max-w-full rounded-full border px-3 py-1 text-xs font-black uppercase tracking-widest ${badgeTone}`}>
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
});
AboutCard.displayName = 'AboutCard';