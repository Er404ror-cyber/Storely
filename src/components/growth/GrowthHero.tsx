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
  Send, 
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
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  const displayName = useMemo(() => {
    return storeName || t('store_default_name') || 'Storely';
  }, [storeName, t]);

  const naturalShareMessage = useMemo(() => {
    const intro = selectedLinkType === 'products'
      ? (t('guide_share_text_intro') || 'Olá! Veja o nosso catálogo oficial da')
      : (t('share_msg_store_intro') || 'Olá! Conheça a página oficial da');

    const body = t('guide_share_text_body') || 'Temos novidades incríveis com fotos e preços atualizados. Acesse agora:';
    
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
    try {
      const response = await fetch(url, { mode: 'cors', cache: 'force-cache' });
      const blob = await response.blob();
      const ext = blob.type.split('/')[1] || 'png';
      return new File([blob], `loja-logo.${ext}`, { type: blob.type || 'image/png' });
    } catch {
      return null;
    }
  }, []);

  const handleCopyMessage = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(naturalShareMessage);
      } catch {
        // Fallback
      }
    }
    onCopyLink();
  }, [naturalShareMessage, onCopyLink]);

  const handleNativeShare = useCallback(() => {
    throttleAction(async () => {
      if (typeof navigator === 'undefined' || !navigator.share) {
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

        await navigator.share({
          title: displayName,
          text: naturalShareMessage,
          url: activeUrl,
          ...(filesToSend.length > 0 ? { files: filesToSend } : {})
        });
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          await handleCopyMessage();
        }
      } finally {
        setIsSharing(false);
      }
    });
  }, [displayName, naturalShareMessage, activeUrl, logoUrl, fetchLogoFile, handleCopyMessage, throttleAction]);

  const handleAppRedirect = useCallback((deepLink: string, webFallback: string) => {
    throttleAction(() => {
      if (typeof window === 'undefined') return;

      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(naturalShareMessage).catch(() => {});
        onCopyLink();
      }

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        const start = Date.now();
        window.location.href = deepLink;

        if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = setTimeout(() => {
          if (Date.now() - start < 1500) {
            window.open(webFallback, '_blank', 'noopener,noreferrer');
          }
        }, 700);
      } else {
        window.open(webFallback, '_blank', 'noopener,noreferrer');
      }
    });
  }, [naturalShareMessage, onCopyLink, throttleAction]);

  const handleShareWhatsApp = useCallback(() => {
    const encoded = encodeURIComponent(naturalShareMessage);
    handleAppRedirect(`whatsapp://send?text=${encoded}`, `https://api.whatsapp.com/send?text=${encoded}`);
  }, [naturalShareMessage, handleAppRedirect]);

  const handleShareInstagram = useCallback(() => {
    throttleAction(() => {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(naturalShareMessage).catch(() => {});
        onCopyLink();
      }
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
    });
  }, [naturalShareMessage, onCopyLink, throttleAction]);

  const handleShareTelegram = useCallback(() => {
    const encodedMsg = encodeURIComponent(naturalShareMessage);
    const encodedUrl = encodeURIComponent(activeUrl);
    handleAppRedirect(`tg://msg_url?url=${encodedUrl}&text=${encodedMsg}`, `https://t.me/share/url?url=${encodedUrl}&text=${encodedMsg}`);
  }, [naturalShareMessage, activeUrl, handleAppRedirect]);

  const handleShareFacebook = useCallback(() => {
    const encodedUrl = encodeURIComponent(activeUrl);
    handleAppRedirect(`fb://facewebmodal/f?href=https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`);
  }, [activeUrl, handleAppRedirect]);

  const handleShareTwitter = useCallback(() => {
    const text = encodeURIComponent(naturalShareMessage);
    handleAppRedirect(`twitter://post?message=${text}`, `https://twitter.com/intent/tweet?text=${text}`);
  }, [naturalShareMessage, handleAppRedirect]);

  return (
    <section 
      className="w-full rounded-3xl p-4 sm:p-6 bg-white border border-zinc-200 space-y-4 sm:space-y-5"
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
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold shrink-0"
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
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold truncate cursor-pointer ${
            selectedLinkType === 'products'
              ? 'bg-white text-emerald-800 border border-emerald-200/50'
              : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <ShoppingBag size={15} className={selectedLinkType === 'products' ? 'text-emerald-600' : 'text-zinc-400'} />
          <span className="truncate">{t('guide_tab_products') || 'Catálogo de Produtos'}</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectLinkType('store')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold truncate cursor-pointer ${
            selectedLinkType === 'store'
              ? 'bg-white text-zinc-900 border border-zinc-200/80'
              : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <Store size={15} className={selectedLinkType === 'store' ? 'text-zinc-900' : 'text-zinc-400'} />
          <span className="truncate">{t('guide_tab_store') || 'Página Inicial'}</span>
        </button>
      </div>

      {/* 3. PARTILHA PRINCIPAL */}
      <div>
        <button
          type="button"
          disabled={isBusy || isSharing}
          onClick={handleNativeShare}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-bold disabled:opacity-60 cursor-pointer"
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
              : (t('guide_native_share_btn') || 'Partilhar com Foto & Mensagem')}
          </span>
        </button>
      </div>

      {/* 4. DISPARO RÁPIDO */}
      <div className="space-y-2 pt-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          {t('guide_social_broadcast') || 'Enviar direto para:'}
        </p>

        {/* WhatsApp & Instagram */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={isBusy}
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-[#25D366] text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            <MessageCircle size={17} className="shrink-0" />
            <span>{t('guide_share_whatsapp') || 'WhatsApp'}</span>
          </button>

          <button
            type="button"
            disabled={isBusy}
            onClick={handleShareInstagram}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-[#E1306C] text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span>{t('guide_share_instagram') || 'Instagram'}</span>
          </button>
        </div>

        {/* Telegram, Facebook, X */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            disabled={isBusy}
            onClick={handleShareTelegram}
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#229ED9] text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            <Send size={13} className="shrink-0" />
            <span className="truncate">{t('guide_share_telegram') || 'Telegram'}</span>
          </button>

          <button
            type="button"
            disabled={isBusy}
            onClick={handleShareFacebook}
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#1877F2] text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 shrink-0 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="truncate">{t('guide_share_facebook') || 'Facebook'}</span>
          </button>

          <button
            type="button"
            disabled={isBusy}
            onClick={handleShareTwitter}
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-black text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 shrink-0 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span className="truncate">{t('guide_share_x') || 'X'}</span>
          </button>
        </div>
      </div>

      {/* 5. CARTA DE APRESENTAÇÃO & QR CODE (DESTAQUE VIP / PROFISSIONAL) */}
      <div className="pt-2 border-t border-zinc-100">
        <button
          type="button"
          onClick={onOpenLetterModal}
          className="w-full p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-purple-50/60 to-indigo-50/40 hover:from-indigo-100/90 hover:to-purple-100/60 border-2 border-indigo-200/90 flex items-center justify-between gap-3 text-left cursor-pointer transition-all active:scale-[0.99] group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Ícone com badge brilhante */}
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/20 group-hover:bg-indigo-700 transition-colors">
              <FileText size={20} />
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs sm:text-sm font-black text-indigo-950 tracking-tight leading-none">
                  {t('guide_letter_modal_title') || 'Carta de Apresentação Comercial'}
                </p>
                <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-black uppercase tracking-wider shadow-2xs">
                  PDF A4
                </span>
              </div>
              
              {/* Tags de utilidade prática */}
              <div className="flex items-center gap-2.5 text-[11px] text-indigo-900/80 font-medium">
                <span className="inline-flex items-center gap-1">
                  <QrCode size={12} className="text-indigo-600 shrink-0" />
                  <span>{t('guide_letter_tag_qr') || 'Com QR Code'}</span>
                </span>
                <span className="text-indigo-300">•</span>
                <span className="inline-flex items-center gap-1">
                  <Printer size={12} className="text-indigo-600 shrink-0" />
                  <span>{t('guide_letter_tag_print') || 'Pronto a Imprimir'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-indigo-600 font-bold text-xs shrink-0 group-hover:translate-x-0.5 transition-transform">
            <span className="hidden sm:inline">{t('guide_letter_open_btn') || 'Gerar'}</span>
            <ChevronRight size={18} className="shrink-0" />
          </div>
        </button>
      </div>
    </section>
  );
});

GrowthHero.displayName = 'GrowthHero';