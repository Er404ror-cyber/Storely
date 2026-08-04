import React, { useCallback, memo } from 'react';
import { MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { LIMITS } from './types';
import { editableProps } from '../sections/helpers';

interface WhatsAppButtonProps {
  isEditable: boolean;
  isLoadingNumber?: boolean;
  content: {
    phone?: string;
    btnText?: string;
  };
  t: (key: any, variables?: any) => string;
  onUpdate?: (field: string, value: string) => void;
  isCenter?: boolean;
}

export const WhatsAppButton = memo(({ isEditable, isLoadingNumber = false, content, t, onUpdate, isCenter }: WhatsAppButtonProps) => {
  const cleanPhone = (content.phone || '').replace(/\D/g, '');
  const isValid = cleanPhone.length > 0;

  const handleTextUpdate = useCallback((val: string) => {
    const defaultText = t('defaultBtn');
    const trimmedValue = val.trim();
    const finalValue = trimmedValue.length > 0 ? trimmedValue.substring(0, LIMITS.BUTTON) : defaultText;
    if (content.btnText !== finalValue) onUpdate?.('btnText', finalValue);
  }, [onUpdate, t, content.btnText]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLElement>, max: number) => {
    if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); return; }
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) return;
    if (e.currentTarget.innerText.length >= max) {
      e.preventDefault();
      toast.error(t('limits').replace('{max}', max.toString()), { id: 'limit' });
    }
  }, [t]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLElement>, max: number) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').substring(0, max);
    document.execCommand('insertText', false, text);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isEditable || !isValid) e.preventDefault();
  }, [isEditable, isValid]);

  if (!isEditable && (isLoadingNumber || !isValid)) return null;

  return (
    <div className={`mt-5 flex flex-col gap-2 ${isCenter ? 'items-center' : 'items-start'}`}>
      <a
        href={!isEditable && isValid ? `https://wa.me/${cleanPhone}` : undefined}
        onClick={handleClick}
        target="_blank"
        rel="noreferrer"
        className={`h-[44px] w-[190px] flex items-center justify-center gap-2 rounded-lg font-bold shadow-sm no-underline shrink-0 z-10 transition-colors transition-transform ${
          isValid ? 'bg-[#25D366] text-white hover:brightness-110 active:scale-95' : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60 grayscale'
        }`}
        aria-disabled={!isValid}
      >
        <MessageCircle size={18} />
        <span
          {...editableProps(isEditable, handleTextUpdate)}
          onKeyDown={(e) => handleKeyDown(e, LIMITS.BUTTON)}
          onPaste={(e) => handlePaste(e, LIMITS.BUTTON)}
          suppressContentEditableWarning={true}
          className="truncate text-sm outline-none font-bold min-w-[20px] text-center touch-manipulation"
        >
          {content.btnText && content.btnText.trim().length > 0 ? content.btnText : t('defaultBtn')}
        </span>
      </a>
    </div>
  );
});

WhatsAppButton.displayName = 'WhatsAppButton';