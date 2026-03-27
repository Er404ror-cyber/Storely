import { useCallback } from 'react';
import { notify } from '../utils/toast';

export const useClipboard = (text: string, successMsg: string, errorMsg: string) => {
  return useCallback(async () => {
    const runFallback = (content: string) => {
      const textArea = document.createElement("textarea");
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        notify.success(successMsg);
      } catch {
        notify.error(errorMsg);
      }
      document.body.removeChild(textArea);
    };

    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        notify.success(successMsg);
      } else {
        runFallback(text);
      }
    } catch {
      runFallback(text);
    }
  }, [text, successMsg, errorMsg]);
};