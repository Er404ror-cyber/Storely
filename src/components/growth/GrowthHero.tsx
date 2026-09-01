import { memo, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  Sparkles, 
  ExternalLink, 
  Globe2, 
  Check, 
  Loader2,
  MessageCircle, 
  Copy,
  ChevronRight,
  QrCode
} from 'lucide-react';

interface Props {
  storeName?: string;
  logoUrl?: string;
  activeUrl?: string;
  storeUrl?: string;
  catalogUrl?: string;
  copiedLink: boolean;
  onCopyLink: () => void;
  onOpenLetterModal: () => void;
  t: (k: string) => string;
}

export const GrowthHero = memo(function GrowthHero({
  storeName,
  logoUrl,
  activeUrl = '',
  storeUrl,
  catalogUrl,
  copiedLink,
  onCopyLink,
  onOpenLetterModal,
  t,
}: Props) {
  const [isSharing, setIsSharing] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoBlobCacheRef = useRef<{ url: string; blob: Blob; file: File } | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const displayName = useMemo(() => {
    return storeName || t('store_default_name') || 'Storely';
  }, [storeName, t]);

  // 1. URL da Página Inicial: Apenas a raiz/slug sem /produtos
  const finalStoreUrl = useMemo(() => {
    if (storeUrl) {
      return storeUrl.replace(/\/produtos\/?$|\/products\/?$/i, '').replace(/\/+$/, '');
    }

    const base = activeUrl ? activeUrl.split('?')[0].split('#')[0] : '';
    if (base) {
      return base.replace(/\/produtos\/?$|\/products\/?$/i, '').replace(/\/+$/, '');
    }

    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname.replace(/\/produtos\/?$|\/products\/?$/i, '').replace(/\/+$/, '');
      return `${window.location.origin}${currentPath}`;
    }

    return '';
  }, [storeUrl, activeUrl]);

  // 2. URL do Catálogo: Garante a terminação /produtos
  const finalCatalogUrl = useMemo(() => {
    if (catalogUrl) return catalogUrl;
    if (activeUrl && (activeUrl.includes('/produtos') || activeUrl.includes('/products'))) {
      return activeUrl;
    }
    return `${finalStoreUrl}/produtos`;
  }, [catalogUrl, activeUrl, finalStoreUrl]);

  // Mensagem unificada com ambos os links
  const naturalShareMessage = useMemo(() => {
    const greeting = t('share_msg_greeting') || 'Olá! Conheça os produtos e a página oficial da';
    const catalogLabel = t('share_msg_catalog_label') || '🛍️ Catálogo de Produtos:';
    const storeLabel = t('share_msg_store_label') || '🌐 Página Inicial:';
    const closing = t('share_msg_closing') || 'Acesse para conferir preços e fazer o seu pedido online!';

    return `✨ *${displayName}*\n\n${greeting} *${displayName}*!\n\n${catalogLabel}\n👉 ${finalCatalogUrl}\n\n${storeLabel}\n👉 ${finalStoreUrl}\n\n${closing}`;
  }, [displayName, finalCatalogUrl, finalStoreUrl, t]);

  const throttleAction = useCallback((action: () => void) => {
    if (isBusy) return;
    setIsBusy(true);
    action();

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setIsBusy(false);
    }, 450);
  }, [isBusy]);

  // Carrega a imagem e devolve tanto o Blob como o File (com Fallback via Canvas)
  const fetchLogoData = useCallback(async (url: string): Promise<{ blob: Blob; file: File } | null> => {
    if (!url) return null;
    if (logoBlobCacheRef.current?.url === url) {
      return { blob: logoBlobCacheRef.current.blob, file: logoBlobCacheRef.current.file };
    }

    // 1. Tentativa por Fetch direto
    try {
      const response = await fetch(url, { cache: 'force-cache' });
      if (response.ok) {
        const blob = await response.blob();
        if (blob && blob.size > 0) {
          const type = blob.type || 'image/png';
          const ext = type.split('/')[1]?.replace('+xml', '') || 'png';
          const file = new File([blob], `logo.${ext}`, { type });
          logoBlobCacheRef.current = { url, blob, file };
          return { blob, file };
        }
      }
    } catch {
      // Avança para o Canvas
    }

    // 2. Fallback via Canvas (ignora bloqueios de CORS e converte para PNG)
    try {
      const result = await new Promise<{ blob: Blob; file: File } | null>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width || 300;
            canvas.height = img.naturalHeight || img.height || 300;
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve(null);
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
              if (!blob) return resolve(null);
              const file = new File([blob], 'logo.png', { type: 'image/png' });
              resolve({ blob, file });
            }, 'image/png');
          } catch {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = url;
      });

      if (result) {
        logoBlobCacheRef.current = { url, blob: result.blob, file: result.file };
        return result;
      }
    } catch {
      // Falha total
    }

    return null;
  }, []);

  // Copia o texto e também tenta copiar a imagem para a área de transferência
  const handleCopyMessage = useCallback(async () => {
    if (typeof navigator === 'undefined') return;

    try {
      if (logoUrl && navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
        const logoData = await fetchLogoData(logoUrl);
        if (logoData?.blob) {
          const textBlob = new Blob([naturalShareMessage], { type: 'text/plain' });
          const pngBlob = logoData.blob.type === 'image/png' 
            ? logoData.blob 
            : new Blob([logoData.blob], { type: 'image/png' });

          await navigator.clipboard.write([
            new ClipboardItem({
              'text/plain': textBlob,
              'image/png': pngBlob,
            })
          ]);
          onCopyLink();
          return;
        }
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(naturalShareMessage);
      }
    } catch {
      // Fallback para texto puro
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(naturalShareMessage);
        } catch {
          // Silencioso
        }
      }
    }
    onCopyLink();
  }, [naturalShareMessage, logoUrl, fetchLogoData, onCopyLink]);

  // Partilha Universal: Sempre anexa a imagem do logo se disponível
  const executeUniversalShare = useCallback(async () => {
    if (typeof navigator === 'undefined') return;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile && navigator.share) {
      setIsSharing(true);
      try {
        let filesToSend: File[] = [];

        if (logoUrl) {
          const logoData = await fetchLogoData(logoUrl);
          if (logoData?.file && navigator.canShare && navigator.canShare({ files: [logoData.file] })) {
            filesToSend = [logoData.file];
          }
        }

        const shareData: ShareData = filesToSend.length > 0
          ? {
              title: displayName,
              text: naturalShareMessage,
              files: filesToSend,
            }
          : {
              title: displayName,
              text: naturalShareMessage,
              url: finalCatalogUrl,
            };

        await navigator.share(shareData);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          await handleCopyMessage();
        }
      } finally {
        setIsSharing(false);
      }
      return;
    }

    // Fallback Desktop
    await handleCopyMessage();
    const encoded = encodeURIComponent(naturalShareMessage);
    window.open(`https://web.whatsapp.com/send?text=${encoded}`, '_blank', 'noopener,noreferrer');
  }, [displayName, naturalShareMessage, finalCatalogUrl, logoUrl, fetchLogoData, handleCopyMessage]);

  // Botão WhatsApp: Garante o anexo da imagem no telemóvel ou copia a imagem no desktop
  const handleShareWhatsApp = useCallback(() => {
    throttleAction(async () => {
      if (typeof navigator !== 'undefined' && navigator.share && logoUrl) {
        try {
          const logoData = await fetchLogoData(logoUrl);
          if (logoData?.file && navigator.canShare && navigator.canShare({ files: [logoData.file] })) {
            await navigator.share({
              title: displayName,
              text: naturalShareMessage,
              files: [logoData.file]
            });
            return;
          }
        } catch (err: any) {
          if (err?.name === 'AbortError') return;
        }
      }

      await handleCopyMessage();
      const encoded = encodeURIComponent(naturalShareMessage);
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const url = isMobile 
        ? `whatsapp://send?text=${encoded}` 
        : `https://web.whatsapp.com/send?text=${encoded}`;
      
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }, [displayName, naturalShareMessage, logoUrl, fetchLogoData, handleCopyMessage, throttleAction]);

  return (
    <section 
      aria-label={displayName}
      className="w-full rounded-3xl p-4 sm:p-5.5 bg-white border border-zinc-200/80 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.03)] space-y-3.5 text-zinc-900"
      style={{ contain: 'content' }}
    >
      {/* 1. PERFIL & VER LOJA */}
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={`${displayName} logo`}
                loading="lazy"
                decoding="async"
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl object-cover border border-zinc-200/70 bg-zinc-50 shadow-2xs" 
              />
            ) : (
              <div 
                aria-hidden="true"
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-bold text-base shadow-2xs select-none"
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span 
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" 
              title="Online" 
              aria-hidden="true" 
            />
          </div>

          <div className="min-w-0 space-y-0.5">
            <h1 className="text-sm sm:text-base font-bold text-zinc-950 tracking-tight truncate">
              {displayName}
            </h1>
            <p className="text-[11px] text-zinc-500 font-medium truncate flex items-center gap-1">
              <Sparkles size={11} className="text-emerald-600 shrink-0" aria-hidden="true" />
              <span>{t('guide_hero_status') || 'Pronto para divulgar'}</span>
            </p>
          </div>
        </div>

        <a
          href={finalStoreUrl || finalCatalogUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${t('guide_preview_btn') || 'Ver Loja'} - ${displayName}`}
          className="inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800 text-xs font-semibold shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
        >
          <span>{t('guide_preview_btn') || 'Ver Loja'}</span>
          <ExternalLink size={12} className="text-zinc-500" aria-hidden="true" />
        </a>
      </header>

      {/* 2. CARD EXPLICATIVO */}
      <div className="px-3.5 py-2.5 rounded-2xl bg-zinc-50/80 border border-zinc-100 flex items-center justify-between gap-2">
        <p className="text-xs text-zinc-600 leading-relaxed truncate">
          {t('guide_hero_subtitle') || 'Partilhe a foto da loja com o catálogo e link numa única mensagem.'}
        </p>
      </div>

      {/* 3. AÇÕES DIRETAS (Todos enviam com Imagem) */}
      <div className="space-y-2">
        <button
          type="button"
          disabled={isBusy || isSharing}
          onClick={() => throttleAction(executeUniversalShare)}
          aria-label={t('guide_universal_share_btn') || 'Divulgar com Foto e Links'}
          className="w-full min-h-[46px] flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-850 text-white text-xs sm:text-sm font-semibold disabled:opacity-50 cursor-pointer shadow-2xs active:opacity-85 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
        >
          {isSharing ? (
            <Loader2 size={16} className="animate-spin shrink-0" aria-hidden="true" />
          ) : (
            <Globe2 size={16} className="shrink-0 text-emerald-400" aria-hidden="true" />
          )}
          <span className="truncate">
            {t('guide_universal_share_btn') || 'Divulgar com Foto e Links'}
          </span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={isBusy}
            onClick={handleShareWhatsApp}
            aria-label="Enviar Foto e Links no WhatsApp"
            className="min-h-[42px] flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#128C7E] text-xs font-bold cursor-pointer active:opacity-85 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
          >
            <MessageCircle size={15} className="shrink-0 text-[#25D366]" aria-hidden="true" />
            <span className="truncate">WhatsApp</span>
          </button>

          <button
            type="button"
            disabled={isBusy}
            onClick={() => throttleAction(handleCopyMessage)}
            aria-label={copiedLink ? (t('guide_copied_btn') || 'Copiado!') : (t('guide_copy_btn') || 'Copiar Foto e Texto')}
            className={`min-h-[42px] flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold cursor-pointer active:opacity-85 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
              copiedLink 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-800'
            }`}
          >
            {copiedLink ? (
              <>
                <Check size={14} className="text-emerald-700 shrink-0" aria-hidden="true" />
                <span className="truncate">{t('guide_copied_btn') || 'Copiado!'}</span>
              </>
            ) : (
              <>
                <Copy size={14} className="text-zinc-600 shrink-0" aria-hidden="true" />
                <span className="truncate">{t('guide_copy_btn') || 'Copiar Tudo'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4. CARTAZ/FOLHA IMPRESSA COM QR CODE */}
      <button
        type="button"
        onClick={onOpenLetterModal}
        aria-label={`${t('guide_letter_modal_title') || 'Carta de Apresentação Comercial'} - ${t('guide_letter_open_btn') || 'Gerar'}`}
        className="w-full min-h-[54px] p-3 rounded-2xl bg-blue-50/50 hover:bg-blue-50/90 border border-blue-200/80 flex items-center justify-between gap-3 text-left cursor-pointer active:opacity-85 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div 
            aria-hidden="true" 
            className="w-9 h-12 rounded-lg bg-white border border-blue-200 shadow-xs flex flex-col items-center justify-between p-1 shrink-0 select-none"
          >
            <div className="w-full space-y-0.5">
              <div className="w-2/3 h-0.5 rounded-full bg-blue-200" />
              <div className="w-full h-0.5 rounded-full bg-blue-100" />
            </div>

            <div className="p-0.5 rounded bg-blue-600 text-white shadow-2xs">
              <QrCode size={12} className="stroke-[2.5]" />
            </div>

            <div className="w-3/4 h-0.5 rounded-full bg-blue-100" />
          </div>

          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-xs sm:text-sm font-bold text-blue-950 truncate">
                {t('guide_letter_modal_title') || 'Carta de Apresentação Comercial'}
              </p>
              <span className="px-1.5 py-0.2 rounded bg-blue-200/80 text-blue-900 text-[8px] sm:text-[9px] font-black uppercase tracking-wider shrink-0">
                PDF A4
              </span>
            </div>

            <p className="text-[10px] sm:text-[11px] text-blue-900/80 font-medium truncate flex items-center gap-1.5">
              <span>{t('guide_letter_tag_qr') || 'Com QR Code'}</span>
              <span aria-hidden="true" className="text-blue-300">•</span>
              <span>{t('guide_letter_tag_print') || 'Pronto a Imprimir'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-blue-700 font-bold text-xs shrink-0 pr-1" aria-hidden="true">
          <span className="hidden sm:inline">{t('guide_letter_open_btn') || 'Gerar'}</span>
          <ChevronRight size={16} className="text-blue-600" />
        </div>
      </button>
    </section>
  );
});

GrowthHero.displayName = 'GrowthHero';