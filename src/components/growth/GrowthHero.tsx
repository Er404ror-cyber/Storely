import { memo, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  Sparkles, 
  ExternalLink, 
  ShoppingBag, 
  Store, 
  Share2, 
  Check, 
  Loader2,
  MessageCircle, 
  FileText, 
  ChevronRight,
  QrCode,
  Printer
} from 'lucide-react';

interface Props {
  storeName: string;
  logoUrl?: string;
  activeUrl: string;
  selectedLinkType: 'products' | 'store';
  onSelectLinkType: (type: 'products' | 'store') => void;
  copiedLink: boolean;
  onCopyLink: () => void;
  onOpenLetterModal: () => void;
  t: (k: string) => string;
}

export const GrowthHero = memo(function GrowthHero({
  storeName,
  logoUrl,
  activeUrl,
  selectedLinkType = 'products',
  onSelectLinkType,
  copiedLink,
  onCopyLink,
  onOpenLetterModal,
  t,
}: Props) {
  const [isSharing, setIsSharing] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoFileCacheRef = useRef<{ url: string; file: File } | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const displayName = useMemo(() => {
    return storeName || t('store_default_name') || 'Storely';
  }, [storeName, t]);

  const naturalShareMessage = useMemo(() => {
    const intro = selectedLinkType === 'products'
      ? (t('guide_share_text_intro') || 'Olá! Veja o nosso catálogo oficial da')
      : (t('share_msg_store_intro') || 'Olá! Conheça a página oficial da');

    const body = t('guide_share_text_body') || 'Temos novidades com fotos e preços atualizados. Acesse:';
    
    return `🛍️ *${displayName}*\n\n${intro} *${displayName}*! ✨\n${body}\n👉 ${activeUrl}`;
  }, [selectedLinkType, displayName, activeUrl, t]);

  const throttleAction = useCallback((action: () => void) => {
    if (isBusy) return;
    setIsBusy(true);
    action();

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setIsBusy(false);
    }, 600);
  }, [isBusy]);

  const fetchLogoFile = useCallback(async (url: string): Promise<File | null> => {
    if (!url) return null;
    if (logoFileCacheRef.current?.url === url) {
      return logoFileCacheRef.current.file;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    try {
      const response = await fetch(url, { 
        mode: 'cors', 
        cache: 'force-cache',
        signal: controller.signal 
      });
      clearTimeout(timeoutId);

      if (!response.ok) return null;

      const blob = await response.blob();
      if (!blob || blob.size === 0) return null;

      const ext = blob.type.split('/')[1] || 'png';
      const file = new File([blob], `logo.${ext}`, { type: blob.type || 'image/png' });
      
      logoFileCacheRef.current = { url, file };
      return file;
    } catch {
      clearTimeout(timeoutId);
      return null;
    }
  }, []);

  const handleCopyMessage = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(naturalShareMessage);
      } catch {
        // Fallback silencioso
      }
    }
    onCopyLink();
  }, [naturalShareMessage, onCopyLink]);

  const executeShare = useCallback(async () => {
    if (typeof navigator === 'undefined') return;

    if (!navigator.share) {
      await handleCopyMessage();
      return;
    }

    setIsSharing(true);
    try {
      let filesToSend: File[] = [];

      if (logoUrl && navigator.canShare) {
        const logoFile = await fetchLogoFile(logoUrl);
        if (logoFile && navigator.canShare({ files: [logoFile] })) {
          filesToSend = [logoFile];
        }
      }

      const shareData: ShareData = {
        title: displayName,
        text: naturalShareMessage,
        url: activeUrl,
        ...(filesToSend.length > 0 ? { files: filesToSend } : {})
      };

      await navigator.share(shareData);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        await handleCopyMessage();
      }
    } finally {
      setIsSharing(false);
    }
  }, [displayName, naturalShareMessage, activeUrl, logoUrl, fetchLogoFile, handleCopyMessage]);

  const handleNativeShare = useCallback(() => {
    throttleAction(executeShare);
  }, [executeShare, throttleAction]);

  const handleShareWhatsApp = useCallback(() => {
    throttleAction(async () => {
      // 1. Tenta partilha nativa enviando o ficheiro do logótipo anexo
      if (typeof navigator !== 'undefined' && navigator.share && logoUrl) {
        try {
          const logoFile = await fetchLogoFile(logoUrl);
          if (logoFile && navigator.canShare && navigator.canShare({ files: [logoFile] })) {
            await navigator.share({
              title: displayName,
              text: naturalShareMessage,
              url: activeUrl,
              files: [logoFile]
            });
            return;
          }
        } catch (err: any) {
          if (err?.name === 'AbortError') return;
        }
      }

      // 2. Fallback direto caso o dispositivo não suporte envio de ficheiros
      const encoded = encodeURIComponent(naturalShareMessage);
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const url = isMobile 
        ? `whatsapp://send?text=${encoded}` 
        : `https://api.whatsapp.com/send?text=${encoded}`;
      
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }, [displayName, naturalShareMessage, activeUrl, logoUrl, fetchLogoFile, throttleAction]);

  const handleShareInstagram = useCallback(() => {
    throttleAction(async () => {
      if (typeof navigator !== 'undefined' && 'share' in navigator) {
        await executeShare();
        return;
      }

      await handleCopyMessage();
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
    });
  }, [executeShare, handleCopyMessage, throttleAction]);

  return (
    <section 
      className="w-full rounded-3xl p-4 sm:p-6 bg-white border border-zinc-200 space-y-4"
      style={{ contain: 'content' }}
    >
      {/* 1. TOPO: Perfil & Ver Loja */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="" 
              loading="lazy"
              decoding="async"
              className="w-12 h-12 rounded-2xl object-cover border border-zinc-200 shrink-0 bg-zinc-50" 
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-black text-lg shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold uppercase tracking-wider text-emerald-800 border border-emerald-100">
              <Sparkles size={11} className="shrink-0 text-emerald-600" />
              <span>{t('guide_badge') || 'Divulgação'}</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-zinc-900 truncate mt-0.5">
              {displayName}
            </h1>
          </div>
        </div>

        <a
          href={activeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold shrink-0 transition-colors"
        >
          <span>{t('guide_preview_btn') || 'Ver Loja'}</span>
          <ExternalLink size={12} className="text-zinc-500" />
        </a>
      </div>

      {/* 2. ESCOLHA DE DESTINO */}
      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-zinc-100">
        <button
          type="button"
          onClick={() => onSelectLinkType('products')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold truncate cursor-pointer transition-all ${
            selectedLinkType === 'products'
              ? 'bg-white text-emerald-800 border border-emerald-200/50 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <ShoppingBag size={15} className={selectedLinkType === 'products' ? 'text-emerald-600' : 'text-zinc-400'} />
          <span className="truncate">{t('guide_tab_products') || 'Catálogo de Produtos'}</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectLinkType('store')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold truncate cursor-pointer transition-all ${
            selectedLinkType === 'store'
              ? 'bg-white text-zinc-900 border border-zinc-200/80 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <Store size={15} className={selectedLinkType === 'store' ? 'text-zinc-900' : 'text-zinc-400'} />
          <span className="truncate">{t('guide_tab_store') || 'Página Inicial'}</span>
        </button>
      </div>

      {/* 3. BOTÃO PRINCIPAL (Web Share com Imagem e Texto) */}
      <button
        type="button"
        disabled={isBusy || isSharing}
        onClick={handleNativeShare}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-bold disabled:opacity-60 cursor-pointer transition-all active:scale-[0.99]"
      >
        {isSharing ? (
          <Loader2 size={16} className="animate-spin" />
        ) : copiedLink ? (
          <Check size={16} className="text-emerald-400" />
        ) : (
          <Share2 size={16} />
        )}
        <span>
          {copiedLink 
            ? (t('guide_copied_msg') || 'Mensagem e link copiados!') 
            : (t('guide_native_share_btn') || 'Partilhar Catálogo Completo')}
        </span>
      </button>

      {/* 4. DISPARO RÁPIDO: WHATSAPP & INSTAGRAM */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={isBusy}
          onClick={handleShareWhatsApp}
          className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-[#25D366] text-white text-xs font-bold hover:opacity-95 disabled:opacity-50 cursor-pointer shadow-xs active:scale-[0.99] transition-all"
        >
          <MessageCircle size={16} className="shrink-0" />
          <span>WhatsApp</span>
        </button>

        <button
          type="button"
          disabled={isBusy}
          onClick={handleShareInstagram}
          className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white text-xs font-bold hover:opacity-95 disabled:opacity-50 cursor-pointer shadow-xs active:scale-[0.99] transition-all"
        >
          <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          <span>Instagram</span>
        </button>
      </div>

      {/* 5. CARTA DE APRESENTAÇÃO & QR CODE */}
      <div className="pt-2 border-t border-zinc-100">
        <button
          type="button"
          onClick={onOpenLetterModal}
          className="w-full p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-purple-50/60 to-indigo-50/40 hover:from-indigo-100/90 hover:to-purple-100/60 border-2 border-indigo-200/90 flex items-start sm:items-center justify-between gap-3 text-left cursor-pointer transition-all active:scale-[0.99] group"
        >
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/20 group-hover:bg-indigo-700 transition-colors mt-0.5 sm:mt-0">
              <FileText size={18} className="sm:w-5 sm:h-5" />
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-xs sm:text-sm font-black text-indigo-950 tracking-tight leading-snug">
                  {t('guide_letter_modal_title') || 'Carta de Apresentação Comercial'}
                </p>
                <span className="px-1.5 py-0.5 rounded-full bg-indigo-600 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider shrink-0">
                  PDF A4
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-indigo-900/80 font-medium flex-wrap">
                <span className="inline-flex items-center gap-1 shrink-0">
                  <QrCode size={12} className="text-indigo-600 shrink-0" />
                  <span>{t('guide_letter_tag_qr') || 'Com QR Code'}</span>
                </span>
                <span className="text-indigo-300 hidden xs:inline">•</span>
                <span className="inline-flex items-center gap-1 shrink-0">
                  <Printer size={12} className="text-indigo-600 shrink-0" />
                  <span>{t('guide_letter_tag_print') || 'Pronto a Imprimir'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-indigo-600 font-bold text-xs shrink-0 group-hover:translate-x-0.5 transition-transform self-center">
            <span className="hidden sm:inline">{t('guide_letter_open_btn') || 'Gerar'}</span>
            <ChevronRight size={18} className="shrink-0" />
          </div>
        </button>
      </div>
    </section>
  );
});

GrowthHero.displayName = 'GrowthHero';