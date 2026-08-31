import { useState, useMemo, useCallback, memo, useEffect, useRef } from 'react';
import { 
  Instagram, 
  MessageCircle, 
  Video, 
  MapPin, 
  Share2, 
  MessageSquareQuote, 
  Smartphone, 
  HelpCircle 
} from 'lucide-react';

import { useAdminStore } from '../hooks/useAdminStore';
import { useTranslate } from '../context/LanguageContext';
import { useClipboard } from '../hooks/useClipboard';

import { GrowthHero } from '../components/growth/GrowthHero';
import { GrowthTemplates } from '../components/growth/GrowthTemplates';
import { GrowthPlatforms } from '../components/growth/GrowthPlatforms';
import { GrowthTroubleshoot } from '../components/growth/GrowthTroubleshoot';
import { PresentationLetterModal } from '../components/growth/PresentationLetterModal';
import { GrowthNavigation, type NavItem } from '../components/growth/GrowthNavigation';

const SECTIONS = ['sec-hero', 'sec-templates', 'sec-platforms', 'sec-troubleshoot'] as const;

export const GrowthGuide = memo(function GrowthGuide() {
  const { t } = useTranslate();
  const { data: store } = useAdminStore();
  
  const [selectedLinkType, setSelectedLinkType] = useState<'products' | 'store'>('products');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedTemplateIdx, setCopiedTemplateIdx] = useState<number | null>(null);
  const [activePlatform, setActivePlatform] = useState<number>(0);
  const [isLetterModalOpen, setIsLetterModalOpen] = useState<boolean>(false);
  
  const [activeSec, setActiveSec] = useState<string>('sec-hero');
  const [pulsingSec, setPulsingSec] = useState<string | null>(null);

  const isNavigatingRef = useRef<boolean>(false);
  const isSharingRef = useRef<boolean>(false);
  const isRedirectingRef = useRef<boolean>(false);

  const pulseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navLockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const templateCopyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Cache de arquivo do logo em memória para poupar dados e bateria
  const logoFileCacheRef = useRef<{ url: string; file: File } | null>(null);

  // Rastreio leve de visibilidade sem sobrecarregar a thread principal
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isNavigatingRef.current) return;

        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          if (entry.isIntersecting) {
            setActiveSec(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: 0,
      }
    );

    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
      if (navLockTimeoutRef.current) clearTimeout(navLockTimeoutRef.current);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      if (templateCopyTimeoutRef.current) clearTimeout(templateCopyTimeoutRef.current);
    };
  }, []);

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
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setCopiedLink(false), 2000);
  }, [copyUrl]);

  // Carrega e armazena a imagem com segurança (com timeout para não travar conexões lentas)
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

  // Redirecionamento blindado contra múltiplos cliques rápidos
  const handleAppRedirect = useCallback((deepLink: string, webUrl: string) => {
    if (typeof window === 'undefined' || isRedirectingRef.current) return;
    isRedirectingRef.current = true;

    // Copia o catálogo para a área de transferência silenciosamente
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(activeUrl).catch(() => {});
      setCopiedLink(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopiedLink(false), 2000);
    }

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (!isMobile) {
      window.open(webUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => {
        isRedirectingRef.current = false;
      }, 400);
      return;
    }

    window.location.href = deepLink;
    setTimeout(() => {
      isRedirectingRef.current = false;
    }, 800);
  }, [activeUrl]);

  // Web Share Nativo com Fallback em cascata e bloqueio de concorrência
  const handleNativeShare = useCallback(async (customText?: string) => {
    if (isSharingRef.current) return;
    isSharingRef.current = true;

    const storeName = store?.name || 'Storely';
    const textToSend = customText || `🛍️ *${storeName}*\n👉 ${activeUrl}`;

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        let filesToSend: File[] = [];

        if (store?.logo_url && navigator.canShare) {
          const logoFile = await fetchLogoFile(store.logo_url);
          if (logoFile && navigator.canShare({ files: [logoFile] })) {
            filesToSend = [logoFile];
          }
        }

        await navigator.share({
          title: storeName,
          text: textToSend,
          url: activeUrl,
          ...(filesToSend.length > 0 ? { files: filesToSend } : {})
        });
        return;
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
    } finally {
      setTimeout(() => {
        isSharingRef.current = false;
      }, 500);
    }

    // Fallback WhatsApp com suporte a Mobile Deep Link e Desktop Web
    const encoded = encodeURIComponent(textToSend);
    const waMobileLink = `whatsapp://send?text=${encoded}`;
    const waWebLink = `https://wa.me/?text=${encoded}`;

    handleAppRedirect(waMobileLink, waWebLink);
  }, [store?.name, store?.logo_url, activeUrl, fetchLogoFile, handleAppRedirect]);

  const handleShareWhatsApp = useCallback((customText?: string) => {
    handleNativeShare(customText);
  }, [handleNativeShare]);

  const messageTemplates = useMemo(() => {
    const storeName = store?.name || 'Storely';
    
    return [
      {
        titleKey: 'guide_template_status_title',
        badge: t('guide_badge_status') || 'WhatsApp Status & Stories',
        targetRoute: '/products',
        badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        text: (t('guide_template_status_text') || 'Confira nosso catálogo de produtos: {{products_url}}')
          .replace('{{products_url}}', productsCatalogUrl)
          .replace('{{store_url}}', mainStoreUrl)
      },
      {
        titleKey: 'guide_template_greeting_title',
        badge: t('guide_badge_greeting') || 'Saudação no WhatsApp',
        targetRoute: '/products',
        badgeStyle: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
        text: (t('guide_template_greeting_text') || 'Olá! Seja bem-vindo à {{store}}: {{products_url}}')
          .replace('{{store}}', storeName)
          .replace('{{products_url}}', productsCatalogUrl)
          .replace('{{store_url}}', mainStoreUrl)
      },
      {
        titleKey: 'guide_template_bio_title',
        badge: t('guide_badge_bio') || 'Bio do Instagram & TikTok',
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
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedTemplateIdx(index);
      if (templateCopyTimeoutRef.current) clearTimeout(templateCopyTimeoutRef.current);
      templateCopyTimeoutRef.current = setTimeout(() => setCopiedTemplateIdx(null), 2000);
    }
  }, []);

  const platformsList = useMemo(() => [
    {
      name: t('guide_platform_ig_name') || 'Instagram',
      icon: <Instagram size={18} className="text-pink-600 shrink-0" />,
      color: 'bg-pink-50 border-pink-200 text-pink-700',
      // Universal Link que abre diretamente o app na tela de edição ou o navegador autenticado
      deepLink: 'https://www.instagram.com/accounts/edit/',
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
      // Universal Link oficial: abre o app direto no perfil sem alerta de erro no Safari
      deepLink: 'https://www.tiktok.com/@me',
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

  const scrollToSection = useCallback((id: string) => {
    setActiveSec(id);
    setPulsingSec(id);
    isNavigatingRef.current = true;

    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
    pulseTimeoutRef.current = setTimeout(() => {
      setPulsingSec(null);
    }, 1000);

    if (navLockTimeoutRef.current) clearTimeout(navLockTimeoutRef.current);
    navLockTimeoutRef.current = setTimeout(() => {
      isNavigatingRef.current = false;
    }, 800);
  }, []);

  const navItems: NavItem[] = useMemo(() => [
    { id: 'sec-hero', label: t('guide_tab_share') || 'Partilhar', icon: Share2 },
    { id: 'sec-templates', label: t('guide_tab_texts') || 'Textos', icon: MessageSquareQuote },
    { id: 'sec-platforms', label: t('guide_tab_places') || 'Redes', icon: Smartphone },
    { id: 'sec-troubleshoot', label: t('guide_tab_tips') || 'Dicas', icon: HelpCircle },
  ], [t]);

  return (
    <div className="w-full min-h-screen bg-[#F9FAFB] pb-24 sm:pb-16 text-zinc-800 antialiased font-sans">
      <div className="max-w-4xl 2xl:max-w-5xl mx-auto px-3.5 sm:px-6 w-full pt-4 sm:pt-8 space-y-6 sm:space-y-8">
        
        {/* 1. Partilhar */}
        <section 
          id="sec-hero" 
          className={`scroll-mt-8 rounded-3xl transition-transform duration-200 transform-gpu ${
            pulsingSec === 'sec-hero' ? 'ring-2 ring-zinc-900 ring-offset-4 ring-offset-[#F9FAFB]' : ''
          }`}
          style={{ contain: 'content' }}
        >
          <GrowthHero
            storeName={store?.name || ''}
            logoUrl={store?.logo_url}
            activeUrl={activeUrl}
            selectedLinkType={selectedLinkType}
            onSelectLinkType={setSelectedLinkType}
            copiedLink={copiedLink}
            onCopyLink={handleCopyActiveLink}
            onOpenLetterModal={() => setIsLetterModalOpen(true)}
            t={t as (k: string) => string}
          />
        </section>

        {/* 2. Mensagens Prontas */}
        <section 
          id="sec-templates" 
          className={`scroll-mt-8 rounded-3xl transition-transform duration-200 transform-gpu ${
            pulsingSec === 'sec-templates' ? 'ring-2 ring-zinc-900 ring-offset-4 ring-offset-[#F9FAFB]' : ''
          }`}
          style={{ contain: 'content' }}
        >
          <GrowthTemplates
            templates={messageTemplates}
            copiedIdx={copiedTemplateIdx}
            onCopy={handleCopyTemplate}
            onShareWhatsApp={handleShareWhatsApp}
            t={t as (k: string) => string}
          />
        </section>

        {/* 3. Onde Configurar */}
        <section 
          id="sec-platforms" 
          className={`scroll-mt-8 rounded-3xl transition-transform duration-200 transform-gpu ${
            pulsingSec === 'sec-platforms' ? 'ring-2 ring-zinc-900 ring-offset-4 ring-offset-[#F9FAFB]' : ''
          }`}
          style={{ contain: 'content' }}
        >
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
        </section>

        {/* 4. Dicas */}
        <section 
          id="sec-troubleshoot" 
          className={`scroll-mt-8 rounded-3xl transition-transform duration-200 transform-gpu ${
            pulsingSec === 'sec-troubleshoot' ? 'ring-2 ring-zinc-900 ring-offset-4 ring-offset-[#F9FAFB]' : ''
          }`}
          style={{ contain: 'content' }}
        >
          <GrowthTroubleshoot t={t as (k: string) => string} />
        </section>

        {/* Modal de Carta / PDF */}
        <PresentationLetterModal
          isOpen={isLetterModalOpen}
          onClose={() => setIsLetterModalOpen(false)}
          store={store || {}}
        />

      </div>

      {/* Navegação Flutuante */}
      <GrowthNavigation
        navItems={navItems}
        activeSec={activeSec}
        onNavigate={scrollToSection}
      />
    </div>
  );
});

GrowthGuide.displayName = 'GrowthGuide';