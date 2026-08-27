import { useState, useMemo, useCallback, memo } from 'react';
import { Instagram, MessageCircle, Video, MapPin } from 'lucide-react';

import { useAdminStore } from '../hooks/useAdminStore';
import { useTranslate } from '../context/LanguageContext';
import { useClipboard } from '../hooks/useClipboard';

import { GrowthHero } from '../components/growth/GrowthHero';
import { GrowthTemplates } from '../components/growth/GrowthTemplates';
import { GrowthPlatforms } from '../components/growth/GrowthPlatforms';
import { GrowthTroubleshoot } from '../components/growth/GrowthTroubleshoot';
import { PresentationLetterModal } from '../components/growth/PresentationLetterModal';

export const GrowthGuide = memo(function GrowthGuide() {
  const { t, language } = useTranslate();
  const { data: store } = useAdminStore();
  
  const [selectedLinkType, setSelectedLinkType] = useState<'products' | 'store'>('products');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedTemplateIdx, setCopiedTemplateIdx] = useState<number | null>(null);
  const [activePlatform, setActivePlatform] = useState<number>(0);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [isLetterModalOpen, setIsLetterModalOpen] = useState<boolean>(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://storelyy.vercel.app';
  
  const mainStoreUrl = useMemo(() => {
    return store?.slug ? `${baseUrl}/${store.slug}` : `${baseUrl}/store`;
  }, [store?.slug, baseUrl]);

  const productsCatalogUrl = useMemo(() => {
    return store?.slug ? `${baseUrl}/${store.slug}/products` : `${baseUrl}/store/products`;
  }, [store?.slug, baseUrl]);

  const activeUrl = selectedLinkType === 'products' ? productsCatalogUrl : mainStoreUrl;

  const copyUrl = useClipboard(activeUrl, t('guide_copied') || 'Copiado!', '');

  const handleCopyActiveLink = useCallback(() => {
    copyUrl();
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }, [copyUrl]);

  const naturalShareMessage = useMemo(() => {
    const storeName = store?.name || 'Storely';
    const intro = t('guide_share_text_intro') || 'Olá! Veja o nosso catálogo oficial da';
    const body = t('guide_share_text_body') || 'Temos novidades incríveis com fotos e preços atualizados. Acesse agora:';
    
    return `🛍️ *${storeName}*\n\n${intro} *${storeName}*! ✨\n${body}\n👉 ${activeUrl}`;
  }, [store?.name, activeUrl, t]);

  const fetchLogoFile = useCallback(async (logoUrl: string): Promise<File | null> => {
    try {
      const response = await fetch(logoUrl, { mode: 'cors' });
      const blob = await response.blob();
      const ext = blob.type.split('/')[1] || 'png';
      return new File([blob], `loja-logo.${ext}`, { type: blob.type });
    } catch {
      return null;
    }
  }, []);

  const handleNativeShare = useCallback(async (customText?: string) => {
    const textToShare = customText || naturalShareMessage;
    const storeName = store?.name || 'Storely';

    if (typeof navigator === 'undefined' || !navigator.share) {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(textToShare);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
      return;
    }

    setIsSharing(true);

    try {
      let filesToSend: File[] = [];

      if (store?.logo_url) {
        const logoFile = await fetchLogoFile(store.logo_url);
        if (logoFile && navigator.canShare && navigator.canShare({ files: [logoFile] })) {
          filesToSend = [logoFile];
        }
      }

      await navigator.share({
        title: storeName,
        text: textToShare,
        url: activeUrl,
        ...(filesToSend.length > 0 ? { files: filesToSend } : {})
      });
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        handleCopyActiveLink();
      }
    } finally {
      setIsSharing(false);
    }
  }, [store?.name, store?.logo_url, naturalShareMessage, activeUrl, fetchLogoFile, handleCopyActiveLink]);

  const handleAppRedirect = useCallback((deepLink: string, webFallback: string) => {
    if (typeof window === 'undefined') return;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(activeUrl).catch(() => {});
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      const start = Date.now();
      window.location.href = deepLink;

      setTimeout(() => {
        if (Date.now() - start < 1500) {
          window.open(webFallback, '_blank', 'noopener,noreferrer');
        }
      }, 700);
    } else {
      window.open(webFallback, '_blank', 'noopener,noreferrer');
    }
  }, [activeUrl]);

  const handleShareWhatsApp = useCallback((customText?: string) => {
    const textToSend = customText || naturalShareMessage;
    const encoded = encodeURIComponent(textToSend);
    handleAppRedirect(`whatsapp://send?text=${encoded}`, `https://api.whatsapp.com/send?text=${encoded}`);
  }, [naturalShareMessage, handleAppRedirect]);

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
    const text = encodeURIComponent(`${t('guide_share_text_intro') || 'Olá! Veja a loja'} ${store?.name || ''}! ${activeUrl}`);
    handleAppRedirect(`twitter://post?message=${text}`, `https://twitter.com/intent/tweet?text=${text}`);
  }, [t, store?.name, activeUrl, handleAppRedirect]);

  const messageTemplates = useMemo(() => {
    const storeName = store?.name || 'Storely';
    
    return [
      {
        titleKey: 'guide_template_status_title',
        badge: 'WhatsApp Status & Stories',
        targetRoute: '/products',
        badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        text: (t('guide_template_status_text') || 'Confira nosso catálogo de produtos: {{products_url}}')
          .replace('{{products_url}}', productsCatalogUrl)
          .replace('{{store_url}}', mainStoreUrl)
      },
      {
        titleKey: 'guide_template_greeting_title',
        badge: 'Saudação no WhatsApp',
        targetRoute: '/products',
        badgeStyle: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
        text: (t('guide_template_greeting_text') || 'Olá! Seja bem-vindo à {{store}}: {{products_url}}')
          .replace('{{store}}', storeName)
          .replace('{{products_url}}', productsCatalogUrl)
          .replace('{{store_url}}', mainStoreUrl)
      },
      {
        titleKey: 'guide_template_bio_title',
        badge: 'Bio do Instagram & TikTok',
        targetRoute: 'Link Oficial',
        badgeStyle: 'bg-amber-50 text-amber-800 border-amber-200/80',
        text: (t('guide_template_bio_text') || '🛍️ {{store}}\n👇 Veja todos os produtos:\n{{store_url}}')
          .replace('{{store}}', storeName)
          .replace('{{products_url}}', productsCatalogUrl)
          .replace('{{store_url}}', mainStoreUrl)
      }
    ];
  }, [productsCatalogUrl, mainStoreUrl, store?.name, t]);

  const handleCopyTemplate = useCallback((text: string, index: number) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedTemplateIdx(index);
      setTimeout(() => setCopiedTemplateIdx(null), 2000);
    }
  }, []);

  const platformsList = useMemo(() => [
    {
      name: t('guide_platform_ig_name') || 'Instagram',
      icon: <Instagram size={18} className="text-pink-600 shrink-0" />,
      color: 'bg-pink-50 border-pink-200 text-pink-700',
      deepLink: 'instagram://editprofile',
      webUrl: 'https://www.instagram.com/accounts/edit/',
      mockupType: 'instagram' as const,
      steps: [
        t('guide_platform_ig_step1') || 'Abra o Instagram, vá ao seu perfil e clique em "Editar Perfil".',
        t('guide_platform_ig_step2') || 'Toque em "Links" > "Adicionar link externo" e cole o seu link.',
        t('guide_platform_ig_step3') || 'Nos Stories de produtos, use a figurinha de "Link" direcionando para a vitrine.'
      ]
    },
    {
      name: t('guide_platform_wa_name') || 'WhatsApp Business',
      icon: <MessageCircle size={18} className="text-emerald-600 shrink-0" />,
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      deepLink: 'whatsapp://settings',
      webUrl: 'https://web.whatsapp.com',
      mockupType: 'whatsapp' as const,
      steps: [
        t('guide_platform_wa_step1') || 'Abra o WhatsApp, vá em "Configurações" > "Ferramentas Comerciais" > "Perfil Comercial".',
        t('guide_platform_wa_step2') || 'No campo "Site / Website", cole o link do seu catálogo /products.',
        t('guide_platform_wa_step3') || 'Ative a "Mensagem de Saudação" automática com o link para quem lhe chamar.'
      ]
    },
    {
      name: t('guide_platform_tt_name') || 'TikTok',
      icon: <Video size={18} className="text-sky-600 shrink-0" />,
      color: 'bg-sky-50 border-sky-200 text-sky-700',
      deepLink: 'snssdk1233://user/profile',
      webUrl: 'https://www.tiktok.com',
      mockupType: 'tiktok' as const,
      steps: [
        t('guide_platform_tt_step1') || 'No seu perfil, toque no menu do topo > "Configurações e Privacidade" > "Conta" > "Trocar para Conta Corporativa".',
        t('guide_platform_tt_step2') || 'Clique em "Editar Perfil" e adicione o seu link no campo "Site".',
        t('guide_platform_tt_step3') || 'Grave vídeos rápidos mostrando os produtos e diga: "Link do catálogo no perfil!".'
      ]
    },
    {
      name: t('guide_platform_gmb_name') || 'Google Maps',
      icon: <MapPin size={18} className="text-amber-600 shrink-0" />,
      color: 'bg-amber-50 border-amber-200 text-amber-700',
      deepLink: 'https://business.google.com',
      webUrl: 'https://business.google.com',
      mockupType: 'google' as const,
      steps: [
        t('guide_platform_gmb_step1') || 'Aceda à ficha da sua empresa no Google Meu Negócio ou Maps.',
        t('guide_platform_gmb_step2') || 'No campo "Website", adicione a ligação da sua loja.',
        t('guide_platform_gmb_step3') || 'Quem pesquisar pela sua loja no Google terá um botão direto para fazer pedidos.'
      ]
    }
  ], [t]);

  return (
    <div className="w-full min-h-screen bg-[#F9FAFB] pb-28 text-zinc-800 antialiased font-sans">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 w-full space-y-6 pt-4 sm:pt-7">
        
        {/* Cockpit de Ação & Disparo */}
        <GrowthHero
          storeName={store?.name || ''}
          logoUrl={store?.logo_url}
          activeUrl={activeUrl}
          selectedLinkType={selectedLinkType}
          onSelectLinkType={setSelectedLinkType}
          copiedLink={copiedLink}
          onCopyLink={handleCopyActiveLink}
          isSharing={isSharing}
          onNativeShare={() => handleNativeShare()}
          onShareWhatsApp={() => handleShareWhatsApp()}
          onShareTelegram={handleShareTelegram}
          onShareFacebook={handleShareFacebook}
          onShareTwitter={handleShareTwitter}
          onOpenLetterModal={() => setIsLetterModalOpen(true)}
          t={t as (k: string) => string}
                  />

        {/* Mensagens Prontas */}
        <GrowthTemplates
          templates={messageTemplates}
          copiedIdx={copiedTemplateIdx}
          onCopy={handleCopyTemplate}
          onShareWhatsApp={handleShareWhatsApp}
          t={t as (k: string) => string}
                  />

        {/* Onde Configurar & Mockups */}
        <GrowthPlatforms
          platforms={platformsList}
          activeIdx={activePlatform}
          onSelect={setActivePlatform}
          onOpenApp={handleAppRedirect}
          storeName={store?.name || ''}
          logoUrl={store?.logo_url}
          activeUrl={activeUrl}
          t={t as (k: string) => string}
                  />

        {/* Dicas de Apoio */}
        <GrowthTroubleshoot t={t as (k: string) => string} />

        {/* Modal de Carta de Apresentação / PDF com dados reais da tabela */}
        <PresentationLetterModal
  isOpen={isLetterModalOpen}
  onClose={() => setIsLetterModalOpen(false)}
  store={store || {}}
/>

      </div>
    </div>
  );
});

GrowthGuide.displayName = 'GrowthGuide';