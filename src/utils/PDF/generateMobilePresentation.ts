export interface StoreDBData {
  id?: string;
  name?: string;
  slug?: string;
  description?: string;
  logo_url?: string;
  whatsapp_number?: string;
  owner_email?: string;
  created_at?: string;
  currency?: string;
  settings?: Record<string, any>;
}

export interface PresentationConfig {
  store: StoreDBData;
  baseUrl?: string;
  language?: 'pt' | 'en';
}

const DICTIONARY = {
  pt: {
    docBadge: 'Dossiê Comercial Oficial',
    ref: 'Ref. Registo',
    date: 'Data de Emissão',
    since: 'Atividade Desde',
    currency: 'Moeda Base',
    docTitle: 'Apresentação Comercial & Catálogo Oficial',
    docSubtitle: 'Dossiê institucional com diretrizes de atendimento e acesso direto à vitrine de artigos.',
    aboutTitle: 'Sobre a Empresa & Atuação',
    defaultDesc: 'Dedicamo-nos ao fornecimento de artigos criteriosamente selecionados, assegurando conformidade de produto, transparência de valores e agilidade em todo o ciclo de encomenda.',
    pillarsTitle: 'Compromissos & Padrões Operacionais',
    p1Title: 'Catálogo em Tempo Real',
    p1Desc: 'Inventário sincronizado com valores, disponibilidade e fotografias reais.',
    p2Title: 'Atendimento Direto',
    p2Desc: 'Suporte dedicado via chat para esclarecimento técnico, orçamentos e reservas.',
    p3Title: 'Segurança & Rastreabilidade',
    p3Desc: 'Processamento rigoroso de encomendas com acompanhamento até ao destino final.',
    p4Title: 'Garantia de Qualidade',
    p4Desc: 'Inspeção minuciosa para assegurar conformidade total com o pedido.',
    accessTitle: 'Catálogo Digital & Encomendas',
    accessSubtitle: 'Aponte a câmara do telemóvel ao Código QR ao lado para aceder ao catálogo:',
    officialBadge: 'Canal Oficial Verificado',
    directUrlLabel: 'Endereço Web Oficial:',
    qrScanHint: 'ACEDER AO CATÁLOGO ➔',
    contactsTitle: 'Canais Oficiais de Contacto',
    whatsapp: 'Telefone / WhatsApp',
    email: 'E-mail Institucional',
    website: 'Endereço Web',
    unavailable: 'Consulte no catálogo oficial',
    rights: 'Todos os direitos reservados.',
    printBtn: 'Guardar PDF / Imprimir',
    backBtn: 'Voltar',
    previewBadge: 'Dossiê Comercial'
  },
  en: {
    docBadge: 'Official Business Dossier',
    ref: 'Ref. Code',
    date: 'Issue Date',
    since: 'Active Since',
    currency: 'Base Currency',
    docTitle: 'Commercial Profile & Official Catalog',
    docSubtitle: 'Institutional dossier detailing verified sales channels and live catalog access.',
    aboutTitle: 'About the Business & Mission',
    defaultDesc: 'We specialize in supplying carefully selected products with proven provenance, transparent pricing, and fast fulfillment from inquiry to delivery.',
    pillarsTitle: 'Core Commitments & Quality Standards',
    p1Title: 'Real-Time Inventory',
    p1Desc: 'Live digital storefront featuring authentic photos, explicit specs, and live pricing.',
    p2Title: 'Direct Customer Care',
    p2Desc: 'Personalized messaging support for technical inquiries, quotations, and order booking.',
    p3Title: 'Safe Logistics',
    p3Desc: 'Secure and monitored order dispatch with dedicated support throughout transit.',
    p4Title: 'Quality Guarantee',
    p4Desc: 'Rigorous inspection standards ensuring each product matches specifications.',
    accessTitle: 'Live Digital Storefront & Orders',
    accessSubtitle: 'Point your mobile camera at the QR Code to open the official catalog:',
    officialBadge: 'Verified Official Channel',
    directUrlLabel: 'Official Web Address:',
    qrScanHint: 'OPEN CATALOG ➔',
    contactsTitle: 'Official Contact Channels',
    whatsapp: 'Phone / WhatsApp',
    email: 'Official Email',
    website: 'Web Address',
    unavailable: 'Available on digital storefront',
    rights: 'All rights reserved.',
    printBtn: 'Save PDF / Print',
    backBtn: 'Back',
    previewBadge: 'Commercial Dossier'
  }
};

const COMMERCIAL_INTROS = {
  pt: [
    'É com grande satisfação que apresentamos a nossa estrutura comercial e o portfólio oficial de artigos. Estruturamos os nossos canais digitais para proporcionar uma consulta transparente e dinâmica.',
    'Apresentamos formalmente o perfil institucional e o inventário de artigos da nossa empresa. Aliamos a conveniência dos meios digitais ao compromisso com a integridade das peças fornecidas.',
    'Com foco em modernidade, rigor e transparência comercial, disponibilizamos este dossiê com os nossos canais oficiais de contacto e ligação direta à nossa montra de novidades.'
  ],
  en: [
    'We are pleased to formally present our business profile and product catalog. Our digital channels are structured to provide clients and partners with a transparent, swift, and reliable experience.',
    'We present our corporate overview and official inventory. We combine modern digital accessibility with strict quality inspection standards and prompt, dedicated customer support.',
    'Focused on commercial reliability and service excellence, this dossier provides direct access to our verified contact channels and live inventory for immediate inquiries.'
  ]
};

const COMMERCIAL_CLOSINGS = {
  pt: [
    'Este documento constitui uma apresentação formal dos canais de distribuição verificados da marca. Todas as encomendas contam com o nosso suporte operacional.',
    'Documento emitido para efeitos de verificação comercial e acesso ao inventário. Para esclarecimentos adicionais, contacte diretamente a nossa equipa.',
    'Agradecemos a preferência e reiteramos o nosso compromisso em oferecer uma experiência de compra pautada pela confiança, clareza e atendimento de excelência.'
  ],
  en: [
    'This dossier serves as a formal verification of the brand\'s official channels. All orders placed through the links above are backed by our customer care.',
    'Document issued for commercial verification and direct catalog access. For personalized support, please reach out via our direct contact channels.',
    'We appreciate your interest and reaffirm our commitment to delivering verified quality, transparent pricing, and seamless customer service.'
  ]
};

const SVG_ICONS = {
  globe: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  message: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
  shield: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`,
  star: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  phone: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  mail: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  checkBadge: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  qrScanIcon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><rect x="7" y="7" width="10" height="10" rx="2"/></svg>`,
  arrowLeft: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`,
  printer: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>`
};

export function generateMobilePresentation({
  store,
  baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://storelyy.vercel.app',
  language = 'pt'
}: PresentationConfig) {
  const langKey: 'pt' | 'en' = language === 'en' ? 'en' : 'pt';
  const t = DICTIONARY[langKey];

  const introList = COMMERCIAL_INTROS[langKey];
  const introSelected = introList[Math.floor(Math.random() * introList.length)];
  const closingList = COMMERCIAL_CLOSINGS[langKey];
  const closingSelected = closingList[Math.floor(Math.random() * closingList.length)];

  const storeName = store.name || (langKey === 'pt' ? 'Loja Oficial' : 'Official Store');
  const storeSlug = store.slug || 'store';
  const rawBase = (baseUrl || '').replace(/\/+$/, '');
  const storeUrl = rawBase.startsWith('http') ? `${rawBase}/${storeSlug}` : `https://${rawBase || 'storelyy.vercel.app'}/${storeSlug}`;
  const productsUrl = `${storeUrl}/products`;
  const adminGuideUrl = `${rawBase}/admin/guide`;

  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=800x800&data=${encodeURIComponent(productsUrl)}&color=1e1b4b&bgcolor=ffffff&margin=0`;
  const fileName = langKey === 'pt' ? `Apresentacao - ${storeName}` : `Profile - ${storeName}`;

  const issueDate = new Date().toLocaleDateString(langKey === 'pt' ? 'pt-PT' : 'en-US', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
  const activeSince = store.created_at
    ? new Date(store.created_at).toLocaleDateString(langKey === 'pt' ? 'pt-PT' : 'en-US', { month: 'short', year: 'numeric' })
    : null;

  const rawCurrency = (store.currency || store.settings?.currency || (langKey === 'pt' ? 'MZN' : 'USD')).toString().trim().toUpperCase();
  const currencyFormatted = 
    rawCurrency === 'MZN' ? 'MZN (Metical)' :
    rawCurrency === 'BRL' ? 'BRL (R$)' :
    rawCurrency === 'EUR' ? 'EUR (€)' :
    rawCurrency === 'USD' ? 'USD ($)' :
    rawCurrency === 'INR' ? 'INR (₹ Rupee)' :
    rawCurrency === 'ZAR' ? 'ZAR (R Rand)' :
    rawCurrency === 'ZIG' ? 'ZiG (Zimbabwe Gold)' :
    rawCurrency === 'ZWL' ? 'ZWL (Zimbabwe Dollar)' :
    rawCurrency;

  const rawPhone = (store.whatsapp_number || store.settings?.phone || '').toString().trim();
  const phone = rawPhone ? (rawPhone.startsWith('+') ? rawPhone : `+${rawPhone}`) : '';
  const callLink = phone ? `tel:${phone}` : productsUrl;
  const email = (store.owner_email || store.settings?.email || '').toString().trim();
  const emailLink = email ? `mailto:${email}` : productsUrl;
  const refCode = (store.id ? store.id.substring(0, 8) : storeSlug).toUpperCase();

  const html = `<!DOCTYPE html>
<html lang="${langKey}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${fileName}</title>
  <style>
    @page { margin: 0 !important; size: A4 portrait; }
    
    * {
      box-sizing: border-box; margin: 0; padding: 0;
      -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    }

    img {
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
      max-width: 100%;
    }

    html, body {
      width: 100%; min-height: 100%;
      background: #0b1120; color: #0f172a;
      line-height: 1.5;
      font-size: 16px;
      overflow-x: hidden;
      -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
    }

    body { 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      padding: 62px 0 28px 0; 
    }

    /* Topbar Fixa (sempre visível ao rolar) */
    .preview-topbar {
      position: fixed; 
      top: 0; 
      left: 0;
      right: 0;
      z-index: 9999; 
      width: 100%;
      height: 52px;
      background: rgba(11, 17, 32, 0.80);
  
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      display: flex; 
      align-items: center; 
      justify-content: space-between;
      padding: 0 20px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
    }
    .topbar-left { display: flex; align-items: center; gap: 10px; }
    .btn-back { display: inline-flex; align-items: center; gap: 6px; background: rgba(255, 255, 255, 0.14); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.25); padding: 7px 15px; border-radius: 9999px; font-size: 13.5px; font-weight: 700; cursor: pointer; text-decoration: none; transition: background 0.15s; }
    .btn-back:hover { background: rgba(255, 255, 255, 0.22); }
    .preview-badge { font-size: 13.5px; color: #94a3b8; font-weight: 600; display: flex; align-items: center; gap: 6px; }
    .preview-badge::before { content: ""; display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #10b981; }
    .btn-print { display: inline-flex; align-items: center; gap: 6px; background: #4f46e5; color: #ffffff; border: none; padding: 8px 18px; border-radius: 9999px; font-size: 14px; font-weight: 800; cursor: pointer; transition: opacity 0.15s; }
    .btn-print:hover { opacity: 0.92; }

    /* Container Principal do Preview */
    .page-container {
      position: relative; width: 98%; max-width: 1280px; margin: 0 auto;
      background: #ffffff; border-radius: 18px; padding: 24px 28px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4); display: flex; flex-direction: column; gap: 16px;
      overflow-x: hidden;
    }
    .content-main { display: flex; flex-direction: column; gap: 14px; flex: 1; }

    .header {
      display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;
      padding: 16px 20px; background: linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.95) 100%);
      border: 1px solid #e2e8f0; border-radius: 14px;
    }
    .brand-box { display: flex; align-items: center; gap: 14px; text-decoration: none; color: inherit; min-width: 0; }
    .brand-logo { width: 96px; height: 96px; border-radius: 14px; object-fit: cover; border: 2px solid #ffffff; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.12); flex-shrink: 0; }
    .brand-placeholder { width: 96px; height: 96px; border-radius: 14px; background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 38px; font-weight: 900; flex-shrink: 0; }
    .brand-title { font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.3px; line-height: 1.15; word-break: break-word; }
    .brand-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 11.5px; font-weight: 800; text-transform: uppercase; color: #4338ca; background: #e0e7ff; padding: 4px 10px; border-radius: 9999px; margin-top: 5px; border: 1px solid #c7d2fe; }
    .meta-box { text-align: right; font-size: 13.5px; color: #64748b; line-height: 1.5; }
    .meta-box strong { color: #0f172a; }
    .currency-tag { color: #047857; background: #d1fae5; padding: 2px 8px; border-radius: 4px; font-weight: 800; border: 1px solid #a7f3d0; display: inline-block; }

    .title-banner { background: #f8fafc; border-left: 5px solid #4f46e5; padding: 12px 18px; border-radius: 0 10px 10px 0; border: 1px solid #f1f5f9; border-left-width: 5px; }
    .title-banner h1 { font-size: 18.5px; font-weight: 900; color: #0f172a; word-break: break-word; }
    .title-banner p { font-size: 13.5px; color: #64748b; margin-top: 2px; }

    .section-heading { font-size: 13.5px; font-weight: 900; text-transform: uppercase; color: #334155; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
    .section-heading::after { content: ""; flex: 1; height: 1px; background: linear-gradient(to right, #e2e8f0, transparent); }
    .about-text { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; color: #334155; font-size: 15px; line-height: 1.55; word-break: break-word; }
    .about-text p { margin-bottom: 6px; }
    .about-text p:last-child { margin-bottom: 0; }

    .pillars-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 11px; }
    .pillar-card { border-radius: 11px; padding: 12px 15px; border: 1px solid transparent; min-width: 0; }
    .pillar-blue { background: #f0f9ff; border-color: #bae6fd; }
    .pillar-green { background: #f0fdf4; border-color: #bbf7d0; }
    .pillar-purple { background: #faf5ff; border-color: #e9d5ff; }
    .pillar-amber { background: #fffbeb; border-color: #fde68a; }
    .pillar-head { font-size: 13.5px; font-weight: 900; color: #0f172a; text-transform: uppercase; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
    .pillar-icon-box { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 6px; background: #ffffff; box-shadow: 0 1px 2px rgba(0,0,0,0.05); flex-shrink: 0; }
    .pillar-desc { font-size: 13.5px; color: #475569; padding-left: 30px; word-break: break-word; }

    .contacts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 11px; }
    .contact-box { border-radius: 11px; padding: 12px 14px; border: 1px solid #e2e8f0; background: #f8fafc; text-decoration: none !important; color: #0f172a !important; display: block; min-width: 0; }
    .contact-label-row { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
    .contact-val-link { font-size: 14px; font-weight: 800; color: #1d4ed8 !important; word-break: break-all; overflow-wrap: anywhere; }

    .hero-qr-section { background: linear-gradient(135deg, #eef2ff 0%, #ffffff 50%, #f0fdf4 100%); border: 2px solid #a5b4fc; border-radius: 16px; padding: 16px 20px; display: flex; flex-direction: row; align-items: center; justify-content: space-between; gap: 16px; box-shadow: 0 8px 20px rgba(79, 70, 229, 0.08); }
    .hero-qr-left { flex: 1; display: flex; flex-direction: column; gap: 8px; min-width: 0; }
    .hero-qr-header { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .hero-qr-title { font-size: 16.5px; font-weight: 900; color: #1e1b4b; text-transform: uppercase; }
    .hero-qr-badge { background: #4f46e5; color: #ffffff; font-size: 10.5px; font-weight: 800; text-transform: uppercase; padding: 3px 9px; border-radius: 9999px; }
    .hero-qr-desc { font-size: 14px; color: #3730a3; font-weight: 500; }
    .hero-url-badge { background: #ffffff; border: 1.5px solid #a5b4fc; border-radius: 10px; padding: 7px 12px; display: inline-flex; flex-direction: column; align-items: flex-start; margin-top: 4px; text-decoration: none !important; max-width: 100%; }
    .hero-url-label { font-size: 10.5px; font-weight: 800; text-transform: uppercase; color: #4f46e5; }
    .hero-url-text { font-family: monospace; font-size: 13px; font-weight: 800; color: #1d4ed8 !important; text-decoration: underline; word-break: break-all; overflow-wrap: anywhere; }
    .hero-qr-card-wrapper { display: flex; flex-direction: column; align-items: center; gap: 8px; flex-shrink: 0; }
    
    .hero-qr-card { width: 155px; height: 155px; background: #ffffff; border: 3.5px solid #4f46e5; border-radius: 14px; padding: 6px; display: flex; align-items: center; justify-content: center; position: relative; }
    .hero-qr-img { width: 100%; height: 100%; object-fit: contain; }
    .hero-qr-watermark { position: absolute; width: 32px; height: 32px; background: #4f46e5; border-radius: 8px; border: 2.5px solid #ffffff; display: flex; align-items: center; justify-content: center; }
    .hero-qr-watermark span { color: #ffffff; font-size: 16px; font-weight: 900; line-height: 1; }
    .hero-qr-action-btn { background: #4f46e5; color: #ffffff !important; font-size: 11.5px; font-weight: 900; text-transform: uppercase; padding: 7px 16px; border-radius: 9999px; text-decoration: none !important; border: 1.5px solid #3730a3; }

    .footer-block { margin-top: auto; padding-top: 8px; }
    .formal-note { font-size: 12.5px; color: #64748b; font-style: italic; text-align: center; margin-bottom: 6px; }
    .footer { border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: center; font-size: 11.5px; color: #94a3b8; font-weight: 600; text-align: center; }

    /* =========================================================================
       CSS IMPRESSÃO: MANTIDO 100% INTACTO E IDÊNTICO
       ========================================================================= */
    @media print {
      html, body {
        width: 100% !important; height: 100% !important;
        margin: 0 !important; padding: 0 !important;
        background: #ffffff !important; overflow: hidden !important; 
      }
      
      .preview-topbar { display: none !important; }

      .page-container {
        position: absolute !important;
        top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
        width: 100% !important; height: 100% !important; max-height: 295mm !important; 
        margin: 0 !important; border-radius: 0 !important; border: none !important; box-shadow: none !important;
        padding: 10mm 10mm 10mm 10mm !important; 
        box-sizing: border-box !important;
        display: flex !important; flex-direction: column !important; justify-content: space-between !important;
        overflow: hidden !important; 
        page-break-after: avoid !important; page-break-before: avoid !important;
      }
      
      .content-main { gap: 6px !important; }
      .header { flex-direction: row !important; align-items: center !important; padding: 8px 12px !important; }
      
      .brand-title { font-size: 21px !important; color: #000000 !important; }
      .brand-logo { width: 85px !important; height: 85px !important; }
      .meta-box { font-size: 11.5px !important; color: #111827 !important; }
      
      .title-banner { padding: 6px 12px !important; }
      .title-banner h1 { font-size: 16px !important; color: #000000 !important; }
      .title-banner p { font-size: 12px !important; color: #374151 !important; font-weight: 500 !important; }
      
      .about-text { font-size: 12.5px !important; padding: 10px 14px !important; line-height: 1.4 !important; color: #111827 !important; font-weight: 500 !important; }
      
      .pillars-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 6px !important; }
      .pillar-card { padding: 6px 10px !important; }
      .pillar-head { font-size: 12px !important; margin-bottom: 2px !important; color: #000000 !important; }
      .pillar-desc { font-size: 11px !important; line-height: 1.3 !important; padding-left: 28px !important; color: #111827 !important; font-weight: 500 !important; }
      
      .contacts-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 6px !important; }
      .contact-box { padding: 6px 10px !important; }
      .contact-val-link { font-size: 12px !important; color: #000000 !important; }
      
      .hero-qr-section { flex-direction: row !important; align-items: center !important; text-align: left !important; padding: 10px 14px !important; gap: 10px !important; }
      .hero-qr-left { align-items: flex-start !important; }
      .hero-qr-header { justify-content: flex-start !important; }
      .hero-url-badge { align-items: flex-start !important; padding: 4px 8px !important; }
      .hero-url-text { font-size: 11px !important; color: #000000 !important; }
      .hero-qr-title { font-size: 16px !important; color: #000000 !important; }
      .hero-qr-desc { font-size: 13px !important; color: #111827 !important; font-weight: 500 !important; }
      
      .hero-qr-card-wrapper { gap: 4px !important; }
      .hero-qr-card { width: 130px !important; height: 130px !important; padding: 4px !important; border-width: 3px !important; }
      .hero-qr-watermark { width: 26px !important; height: 26px !important; }
      .hero-qr-watermark span { font-size: 14px !important; }
      .hero-qr-action-btn { font-size: 9.5px !important; padding: 4px 10px !important; border-width: 1px !important; }

      .footer-block { padding-top: 4px !important; margin-top: 0 !important; }
      .formal-note { font-size: 10.5px !important; margin-bottom: 4px !important; font-weight: 500 !important; color: #374151 !important; }
      .footer { padding-top: 4px !important; font-size: 9.5px !important; color: #4b5563 !important; font-weight: 700 !important; }
      
      a[href]:after { content: none !important; } 
    }

    /* =========================================================================
       RESPONSIVIDADE: LARGURA AMPLIADA E AJUSTE FLUIDO NO ECRÃ
       ========================================================================= */
    @media screen and (max-width: 768px) {
      body { 
        padding: 56px 0 20px 0; 
        background: #0b1120; 
      }
      .preview-topbar { 
        height: 48px;
        padding: 0 12px; 
      }
      .preview-badge { display: none; }
      
      .page-container { 
        width: calc(100% - 10px) !important;
        margin: 4px auto 14px auto !important; 
        border-radius: 12px !important; 
        padding: 16px 12px !important; 
        box-shadow: 0 8px 30px rgba(0,0,0,0.5) !important;
        gap: 12px !important;
      }
      
      .header { 
        flex-direction: column; 
        align-items: flex-start; 
        padding: 12px 10px;
        gap: 10px;
      }
      .brand-box { width: 100%; }
      .brand-logo, .brand-placeholder { width: 64px; height: 64px; font-size: 26px; }
      .brand-title { font-size: 19px; }
      
      .meta-box { 
        text-align: left; 
        font-size: 12px; 
        width: 100%;
        border-top: 1px solid #e2e8f0;
        padding-top: 8px;
      }
      
      .title-banner { padding: 8px 10px; }
      .title-banner h1 { font-size: 15.5px; }
      .title-banner p { font-size: 12px; }

      .about-text { font-size: 13px; padding: 10px 12px; }

      .pillars-grid { grid-template-columns: 1fr; gap: 8px; }
      .pillar-head { font-size: 12.5px; }
      .pillar-desc { font-size: 12px; padding-left: 26px; }

      .contacts-grid { grid-template-columns: 1fr; gap: 8px; }
      .contact-box { padding: 8px 10px; }
      .contact-val-link { font-size: 12.5px; }
      
      .hero-qr-section { 
        flex-direction: column; 
        text-align: center; 
        gap: 14px; 
        padding: 14px 10px; 
      }
      .hero-qr-left { align-items: center; }
      .hero-qr-header { justify-content: center; }
      .hero-url-badge { align-items: center; text-align: center; }
      
      .hero-qr-card { width: 135px; height: 135px; }
      .hero-qr-action-btn { font-size: 10.5px; padding: 6px 16px; }
    }
  </style>
</head>
<body>
  <nav class="preview-topbar">
    <div class="topbar-left">
      <a href="${adminGuideUrl}" class="btn-back">
        ${SVG_ICONS.arrowLeft} <span>${t.backBtn}</span>
      </a>
      <span class="preview-badge">${t.previewBadge}</span>
    </div>
    <button class="btn-print" onclick="window.print()">
      ${SVG_ICONS.printer} <span>${t.printBtn}</span>
    </button>
  </nav>

  <div class="page-container">
    <div class="content-main">
      <header class="header">
        <a href="${storeUrl}" target="_blank" rel="noopener noreferrer" class="brand-box">
          ${store.logo_url ? `<img src="${store.logo_url}" class="brand-logo" alt="${storeName}" crossorigin="anonymous" />` : `<div class="brand-placeholder">${storeName.charAt(0)}</div>`}
          <div><div class="brand-title">${storeName}</div><div class="brand-badge">${SVG_ICONS.checkBadge} ${t.docBadge}</div></div>
        </a>
        <div class="meta-box">
          <div><strong>${t.ref}:</strong> #${refCode}</div>
          <div><strong>${t.date}:</strong> ${issueDate}</div>
          ${activeSince ? `<div><strong>${t.since}:</strong> ${activeSince}</div>` : ''}
          <div><strong>${t.currency}:</strong> <span class="currency-tag">${currencyFormatted}</span></div>
        </div>
      </header>

      <section class="title-banner">
        <h1>${t.docTitle}</h1>
        <p>${t.docSubtitle}</p>
      </section>

      <section class="section-block">
        <h2 class="section-heading">${t.aboutTitle}</h2>
        <div class="about-text">
          <p>${introSelected}</p>
          <p>${store.description || t.defaultDesc}</p>
        </div>
      </section>

      <section class="section-block">
        <h2 class="section-heading">${t.pillarsTitle}</h2>
        <div class="pillars-grid">
          <div class="pillar-card pillar-blue"><div class="pillar-head"><span class="pillar-icon-box icon-blue">${SVG_ICONS.globe}</span><span>${t.p1Title}</span></div><div class="pillar-desc">${t.p1Desc}</div></div>
          <div class="pillar-card pillar-green"><div class="pillar-head"><span class="pillar-icon-box icon-green">${SVG_ICONS.message}</span><span>${t.p2Title}</span></div><div class="pillar-desc">${t.p2Desc}</div></div>
          <div class="pillar-card pillar-purple"><div class="pillar-head"><span class="pillar-icon-box icon-purple">${SVG_ICONS.shield}</span><span>${t.p3Title}</span></div><div class="pillar-desc">${t.p3Desc}</div></div>
          <div class="pillar-card pillar-amber"><div class="pillar-head"><span class="pillar-icon-box icon-amber">${SVG_ICONS.star}</span><span>${t.p4Title}</span></div><div class="pillar-desc">${t.p4Desc}</div></div>
        </div>
      </section>

      <section class="section-block">
        <h2 class="section-heading">${t.contactsTitle}</h2>
        <div class="contacts-grid">
          <a href="${callLink}" class="contact-box"><div class="contact-label-row"><span class="icon-green">${SVG_ICONS.phone}</span><span>${t.whatsapp}</span></div><div class="contact-val-link">${phone || t.unavailable}</div></a>
          <a href="${emailLink}" class="contact-box"><div class="contact-label-row"><span class="icon-blue">${SVG_ICONS.mail}</span><span>${t.email}</span></div><div class="contact-val-link">${email || t.unavailable}</div></a>
          <a href="${storeUrl}" target="_blank" class="contact-box"><div class="contact-label-row"><span class="icon-purple">${SVG_ICONS.globe}</span><span>${t.website}</span></div><div class="contact-val-link">${storeUrl}</div></a>
        </div>
      </section>

      <section class="hero-qr-section">
        <div class="hero-qr-left">
          <div class="hero-qr-header">
            ${SVG_ICONS.qrScanIcon}
            <div class="hero-qr-title">${t.accessTitle}</div>
            <span class="hero-qr-badge">${t.officialBadge}</span>
          </div>
          <p class="hero-qr-desc">${t.accessSubtitle}</p>
          <a href="${productsUrl}" target="_blank" class="hero-url-badge"><span class="hero-url-label">${t.directUrlLabel}</span><span class="hero-url-text">${productsUrl}</span></a>
        </div>
        <div class="hero-qr-card-wrapper">
          <div class="hero-qr-card">
            <img src="${qrCodeApiUrl}" alt="QR Code" class="hero-qr-img" crossorigin="anonymous" />
            <div class="hero-qr-watermark"><span>S</span></div>
          </div>
          <a href="${productsUrl}" target="_blank" class="hero-qr-action-btn">${t.qrScanHint}</a>
        </div>
      </section>
    </div>

    <div class="footer-block">
      <div class="formal-note">${closingSelected}</div>
      <footer class="footer"><div>${storeName} &copy; ${new Date().getFullYear()} · ${t.rights}</div></footer>
    </div>
  </div>

  <script>
    window.addEventListener('load', function() {
      var images = Array.from(document.images || []);
      var promises = images.map(function(img) {
        if (img.complete) return Promise.resolve();
        return new Promise(function(resolve) { img.onload = resolve; img.onerror = resolve; });
      });
      Promise.all(promises).then(function() {
        setTimeout(function() { try { window.print(); } catch(e) {} }, 300);
      });
    });
  </script>
</body>
</html>`;

  try {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);

    window.location.href = blobUrl;

    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  } catch (err) {
    console.error('Falha ao abrir pré-visualização:', err);
  }
}