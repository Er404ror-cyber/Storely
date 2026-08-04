import React, { memo } from 'react';
import { toast } from 'react-hot-toast';
import type { HeroContentData, HeroStyleProps } from './types';
import { LIMITS } from './types';
import { editableProps, getFontSize } from '../sections/helpers';

interface HeroTextFieldsProps {
  content: HeroContentData;
  isEditable: boolean;
  isDark?: boolean;
  isDarkBg?: boolean;
  style: HeroStyleProps;
  t: (key: any, variables?: any) => string;
  onUpdate?: (field: string, value: string) => void;
  isCenter?: boolean;
}

export const HeroTextFields = memo(({ content, isEditable, isDark, isDarkBg, style, t, onUpdate, isCenter }: HeroTextFieldsProps) => {
  const textColor = isDark || isDarkBg ? 'text-white' : 'text-slate-900';

  const handleBlurValidation = (e: React.FocusEvent<HTMLElement>, key: keyof HeroContentData, defaultValue: string, limit: number) => {
    const rawText = e.currentTarget.innerText;
    const cleanValue = rawText.replace(/&nbsp;/g, ' ').trim();
    const finalValue = cleanValue.length === 0 ? defaultValue : cleanValue.substring(0, limit);

    if (content[key] !== finalValue) {
      if (cleanValue.length === 0) e.currentTarget.innerText = defaultValue;
      onUpdate?.(key, finalValue);
    }
  };

  const handleKeyValidation = (e: React.KeyboardEvent<HTMLElement>, maxChars: number, maxLines: number) => {
    const text = e.currentTarget.innerText;
    const lineBreaks = (text.match(/\n/g) || []).length;

    if (e.key === 'Enter') {
      if (lineBreaks >= maxLines - 1) { e.preventDefault(); toast.error(t('limitLines'), { id: 'line-limit' }); }
      return;
    }
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) return;
    if (text.length >= maxChars) {
      e.preventDefault();
      toast.error(t('limits').replace('{max}', maxChars.toString()), { id: 'limit-reached' });
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLElement>, maxChars: number, maxLines: number) => {
    e.preventDefault();
    const rawPastedText = e.clipboardData.getData('text/plain');
    const lines = rawPastedText.split(/\r?\n/).filter((line) => line.length > 0).slice(0, maxLines);
    const filteredText = lines.join('\n').substring(0, maxChars);

    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    selection.deleteFromDocument();
    selection.getRangeAt(0).insertNode(document.createTextNode(filteredText));
    selection.collapseToEnd();
  };

  return (
    <div className={`w-full flex flex-col ${isCenter ? 'items-center text-center' : 'items-start text-left'}`}>
      <span
        {...editableProps(isEditable, () => {})}
        onBlur={(e) => handleBlurValidation(e, 'badge', t('defaultBadge'), LIMITS.BADGE)}
        onKeyDown={(e) => handleKeyValidation(e, LIMITS.BADGE, 1)}
        onPaste={(e) => handlePaste(e, LIMITS.BADGE, 1)}
        className={`inline-block px-2.5 py-1 mb-4 text-[9px] font-bold rounded-full uppercase tracking-widest w-fit outline-none max-h-[24px] overflow-hidden whitespace-nowrap touch-manipulation ${
          isDark || isDarkBg ? 'bg-white/10 text-white' : 'bg-blue-500/10 text-blue-500'
        }`}
        style={isEditable ? { WebkitUserModify: 'read-write-plaintext-only' as const } : undefined}
      >
        {content.badge || t('defaultBadge')}
      </span>

      <h1
        {...editableProps(isEditable, () => {})}
        onBlur={(e) => handleBlurValidation(e, 'title', t('defaultTitle'), LIMITS.TITLE)}
        onKeyDown={(e) => handleKeyValidation(e, LIMITS.TITLE, 3)}
        onPaste={(e) => handlePaste(e, LIMITS.TITLE, 3)}
        className={`${getFontSize(style.fontSize, 'h1')} mb-3 tracking-tighter leading-[1.05] ${textColor} outline-none max-w-[15ch] break-words whitespace-pre-wrap max-h-[3.3em] overflow-hidden italic font-serif font-black touch-manipulation`}
        style={isEditable ? { WebkitUserModify: 'read-write-plaintext-only' as const } : undefined}
      >
        {content.title || t('defaultTitle')}
      </h1>

      <div className={`max-w-xs xl:max-w-sm border-l-2 border-blue-600 pl-3 mb-8 ${isCenter ? 'border-none pl-0' : ''}`}>
        <p
          {...editableProps(isEditable, () => {})}
          onBlur={(e) => handleBlurValidation(e, 'sub', t('defaultSub'), LIMITS.SUBTITLE)}
          onKeyDown={(e) => handleKeyValidation(e, LIMITS.SUBTITLE, 3)}
          onPaste={(e) => handlePaste(e, LIMITS.SUBTITLE, 3)}
          className={`${getFontSize(style.fontSize, 'p')} ${textColor} opacity-80 font-medium leading-snug outline-none break-words w-full whitespace-pre-wrap max-h-[4.5em] overflow-hidden touch-manipulation`}
          style={isEditable ? { WebkitUserModify: 'read-write-plaintext-only' as const } : undefined}
        >
          {content.sub || t('defaultSub')}
        </p>

        <p
          {...editableProps(isEditable, () => {})}
          onBlur={(e) => handleBlurValidation(e, 'hero_subtitle', t('hero_subtitle'), LIMITS.SUBTITLE_EXTRA)}
          onKeyDown={(e) => handleKeyValidation(e, LIMITS.SUBTITLE_EXTRA, 1)}
          onPaste={(e) => handlePaste(e, LIMITS.SUBTITLE_EXTRA, 1)}
          className={`font-bold block mt-1 outline-none w-full break-words whitespace-nowrap overflow-hidden max-h-[1.5em] touch-manipulation ${
            isDark || isDarkBg ? 'text-zinc-100' : 'text-zinc-900'
          }`}
          style={isEditable ? { WebkitUserModify: 'read-write-plaintext-only' as const } : undefined}
        >
          {content.hero_subtitle || t('hero_subtitle')}
        </p>
      </div>
    </div>
  );
});

HeroTextFields.displayName = 'HeroTextFields';