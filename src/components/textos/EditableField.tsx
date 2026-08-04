import React, { memo } from 'react';
import { editableProps, clampText, handleEditableKeyDown, handleEditablePaste } from '../sections/helpers';
import type { EditableFieldProps } from '../../types/TextTypes';

const FieldCounter = memo(({ value, max, isDark }: { value: string; max: number; isDark: boolean }) => (
  <div className={`mt-1 text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
    {value.length}/{max}
  </div>
));
FieldCounter.displayName = 'FieldCounter';

export const EditableField = memo(({
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
    // 'contain: layout paint' previne reflow global da página poupando muita CPU
    <div className="w-full min-w-0 max-w-none" style={{ contain: 'layout paint' }}>
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
          'min-w-0 max-w-none break-words whitespace-pre-wrap overflow-hidden transition-colors',
          isEditable
            ? 'rounded-xl border border-dashed border-transparent px-2 py-1 focus:border-slate-300 dark:focus:border-slate-700 outline-none cursor-text max-sm:text-[16px]' // max-sm:text-[16px] IMPEDE ZOOM NO CELULAR
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
EditableField.displayName = 'EditableField';