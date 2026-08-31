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
    accessTitle: 'Catálogo Digital & Encomendas em Tempo Real',
    accessSubtitle: 'Aponte a câmara do telemóvel ao Código QR ao lado para aceder ao catálogo oficial:',
    officialBadge: 'Canal Oficial Verificado',
    directUrlLabel: 'Endereço Web Oficial:',
    qrScanHint: 'Aceder ao Catálogo Oficial',
    contactsTitle: 'Canais Oficiais de Contacto',
    whatsapp: 'Telefone / WhatsApp',
    email: 'E-mail Institucional',
    website: 'Endereço Web',
    unavailable: 'Consulte no catálogo oficial',
    rights: 'Todos os direitos reservados.',
    generated: 'Gerado via infraestrutura Storely',
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
    qrScanHint: 'Open Official Catalog',
    contactsTitle: 'Official Contact Channels',
    whatsapp: 'Phone / WhatsApp',
    email: 'Official Email',
    website: 'Web Address',
    unavailable: 'Available on digital storefront',
    rights: 'All rights reserved.',
    generated: 'Generated via Storely platform',
    printBtn: 'Save PDF / Print',
    backBtn: 'Back',
    previewBadge: 'Commercial Dossier'
  }
};

const COMMERCIAL_INTROS = {
  pt: [
    'É com grande satisfação que apresentamos a nossa estrutura comercial e o portfólio oficial de artigos. Estruturamos os nossos canais digitais para proporcionar uma consulta transparente, dinâmica e segura a cada cliente e parceiro institucional.',
    'Apresentamos formalmente o perfil institucional e o inventário de artigos da nossa empresa. Aliamos a conveniência dos meios digitais ao compromisso rigoroso com a integridade das peças fornecidas e pontualidade no atendimento.',
    'Com foco em modernidade, rigor e transparência comercial, disponibilizamos este dossiê com os nossos canais oficiais de contacto e ligação direta à nossa montra de novidades e encomendas.'
  ],
  en: [
    'We are pleased to formally present our business profile and product catalog. Our digital channels are structured to provide clients and institutional partners with a transparent, swift, and reliable procurement experience.',
    'We present our corporate overview and official inventory. We combine modern digital accessibility with strict quality inspection standards and prompt, dedicated customer support.',
    'Focused on commercial reliability and service excellence, this dossier provides direct access to our verified contact channels and live inventory for immediate inquiries.'
  ]
};

const COMMERCIAL_CLOSINGS = {
  pt: [
    'Este documento constitui uma apresentação formal dos canais de distribuição verificados da marca. Todas as encomendas efetuadas através dos endereços listados contam com o nosso suporte operacional.',
    'Documento emitido para efeitos de verificação comercial e acesso ao inventário. Para encomendas corporativas ou esclarecimentos adicionais, contacte diretamente a nossa equipa através dos canais acima.',
    'Agradecemos a preferência e reiteramos o nosso compromisso em oferecer uma experiência de compra pautada pela confiança, clareza e atendimento de excelência.'
  ],
  en: [
    'This dossier serves as a formal verification of the brand\'s official distribution channels. All orders placed through the links above are fully backed by our customer care.',
    'Document issued for commercial verification and direct catalog access. For wholesale requests or personalized support, please reach out via our direct contact channels.',
    'We appreciate your interest and reaffirm our commitment to delivering verified quality, transparent pricing, and seamless customer service.'
  ]
};

const SVG_ICONS = {
  globe: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  message: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
  shield: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`,
  star: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  phone: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  mail: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  checkBadge: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  qrScanIcon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><rect x="7" y="7" width="10" height="10" rx="2"/></svg>`,
  arrowLeft: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`,
  printer: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>`,
  externalLink: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`
};

export function generateStorePresentationPDF({
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

  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=450x450&data=${encodeURIComponent(productsUrl)}&color=0f172a&bgcolor=ffffff&margin=0`;
  const fileName = langKey === 'pt' ? `Apresentacao - ${storeName}` : `Profile - ${storeName}`;

  const issueDate = new Date().toLocaleDateString(langKey === 'pt' ? 'pt-PT' : 'en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const activeSince = store.created_at
    ? new Date(store.created_at).toLocaleDateString(langKey === 'pt' ? 'pt-PT' : 'en-US', { month: 'short', year: 'numeric' })
    : null;

  const rawCurrency = (store.currency || store.settings?.currency || (langKey === 'pt' ? 'MZN' : 'USD')).toString().trim().toUpperCase();
  const currencyFormatted = rawCurrency === 'MZN' ? 'MZN (Metical)' 
    : rawCurrency === 'BRL' ? 'BRL (R$)' 
    : rawCurrency === 'EUR' ? 'EUR (€)' 
    : rawCurrency === 'USD' ? 'USD ($)' 
    : rawCurrency;

  const rawPhone = (store.whatsapp_number || store.settings?.phone || '').toString().trim();
  const phone = rawPhone ? (rawPhone.startsWith('+') ? rawPhone : `+${rawPhone}`) : '';
  const callLink = phone ? `tel:${phone}` : productsUrl;
  const email = (store.owner_email || store.settings?.email || '').toString().trim();
  const emailLink = email ? `mailto:${email}` : productsUrl;
  const refCode = (store.id ? store.id.substring(0, 8) : storeSlug).toUpperCase();

  const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const html = `
    <!DOCTYPE html>
    <html lang="${langKey}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>${fileName}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 0mm !important;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        html, body {
          width: 100%;
          min-height: 100%;
          background: #0b1120;
        }
        body {
          color: #0f172a;
          line-height: 1.46;
          font-size: 14px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 0 0 40px 0;
        }

        /* Topbar de Ações */
        .preview-topbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          width: 100%;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.14);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 24px;
          margin-bottom: 20px;
        }
        .topbar-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.14);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.28);
          padding: 7.5px 16px;
          border-radius: 9999px;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          touch-action: manipulation;
        }
        .btn-back:hover, .btn-back:active {
          background: rgba(255, 255, 255, 0.28);
        }
        .preview-badge {
          font-size: 13px;
          color: #94a3b8;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .preview-badge::before {
          content: "";
          display: inline-block;
          width: 7.5px;
          height: 7.5px;
          border-radius: 50%;
          background: #10b981;
        }
        .btn-print {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: #4f46e5;
          color: #ffffff;
          border: none;
          padding: 8.5px 20px;
          border-radius: 9999px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(79, 70, 229, 0.45);
          transition: all 0.2s ease;
          touch-action: manipulation;
        }
        .btn-print:hover, .btn-print:active {
          background: #4338ca;
        }

        /* Container Centralizado da Folha */
        .page-container {
          position: relative;
          width: 95%;
          max-width: 1000px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 18px;
          padding: 28px 36px 24px 36px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        /* Mobile */
        @media screen and (max-width: 768px) {
          body {
            font-size: 12.5px;
            padding: 0;
            background: #ffffff;
          }
          .preview-topbar {
            padding: 9px 12px;
            margin-bottom: 0;
          }
          .preview-badge {
            display: none;
          }
          .btn-back {
            padding: 6.5px 12px;
            font-size: 12px;
          }
          .btn-print {
            padding: 7px 14px;
            font-size: 12px;
          }
          .page-container {
            width: 100% !important;
            max-width: 100% !important;
            border-radius: 0 !important;
            border: none !important;
            box-shadow: none !important;
            padding: 12px 12px 20px 12px !important;
            gap: 9px !important;
          }
        }

        .content-main {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        @media screen and (max-width: 768px) {
          .content-main {
            gap: 8.5px;
          }
        }

        /* Topo */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background: linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.95) 50%, rgba(238, 242, 255, 0.95) 100%);
          border: 1px solid #e2e8f0;
          border-radius: 14px;
        }
        @media screen and (max-width: 768px) {
          .header {
            padding: 10px 12px;
            border-radius: 12px;
          }
        }
        .brand-box {
          display: flex;
          align-items: center;
          gap: 16px;
          text-decoration: none;
          color: inherit;
        }
        @media screen and (max-width: 768px) {
          .brand-box {
            gap: 10px;
          }
        }
        .brand-logo {
          width: 102px;
          height: 102px;
          border-radius: 16px;
          object-fit: cover;
          border: 2.5px solid #ffffff;
          background: #ffffff;
          box-shadow: 0 4px 16px rgba(79, 70, 229, 0.14);
          flex-shrink: 0;
        }
        .brand-placeholder {
          width: 102px;
          height: 102px;
          border-radius: 16px;
          background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 44px;
          font-weight: 900;
          box-shadow: 0 4px 16px rgba(79, 70, 229, 0.18);
          flex-shrink: 0;
        }
        @media screen and (max-width: 768px) {
          .brand-logo, .brand-placeholder {
            width: 72px;
            height: 72px;
            font-size: 30px;
            border-radius: 12px;
          }
        }
        .brand-title {
          font-size: 24px;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.3px;
          line-height: 1.15;
        }
        @media screen and (max-width: 768px) {
          .brand-title {
            font-size: 18px;
          }
        }
        .brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          color: #4338ca;
          background: rgba(224, 231, 255, 0.95);
          padding: 3px 9px;
          border-radius: 9999px;
          letter-spacing: 0.35px;
          margin-top: 3px;
          border: 1px solid #c7d2fe;
        }
        @media screen and (max-width: 768px) {
          .brand-badge {
            font-size: 8px;
            padding: 1.5px 6px;
          }
        }
        .meta-box {
          text-align: right;
          font-size: 11.8px;
          color: #64748b;
          line-height: 1.5;
        }
        @media screen and (max-width: 768px) {
          .meta-box {
            font-size: 9.5px;
            line-height: 1.38;
          }
        }
        .meta-box strong {
          color: #0f172a;
        }
        .currency-tag {
          color: #047857;
          background: #d1fae5;
          padding: 1.5px 7px;
          border-radius: 4px;
          font-weight: 800;
          display: inline-block;
          border: 1px solid #a7f3d0;
        }

        /* Banner de Título */
        .title-banner {
          background: linear-gradient(to right, #f8fafc, #ffffff);
          border-left: 4.5px solid #4f46e5;
          padding: 9px 15px;
          border-radius: 0 10px 10px 0;
          border-top: 1px solid #f1f5f9;
          border-bottom: 1px solid #f1f5f9;
          border-right: 1px solid #f1f5f9;
        }
        @media screen and (max-width: 768px) {
          .title-banner {
            padding: 6px 10px;
            border-left-width: 3.5px;
          }
        }
        .title-banner h1 {
          font-size: 15.5px;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.2px;
        }
        @media screen and (max-width: 768px) {
          .title-banner h1 {
            font-size: 13px;
          }
        }
        .title-banner p {
          font-size: 11.8px;
          color: #64748b;
          margin-top: 1.5px;
        }
        @media screen and (max-width: 768px) {
          .title-banner p {
            font-size: 10px;
          }
        }

        /* Seções */
        .section-block {
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .section-heading {
          font-size: 11.5px;
          font-weight: 900;
          text-transform: uppercase;
          color: #334155;
          letter-spacing: 0.5px;
          margin-bottom: 4.5px;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        @media screen and (max-width: 768px) {
          .section-heading {
            font-size: 10px;
            margin-bottom: 3px;
          }
        }
        .section-heading::after {
          content: "";
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, #e2e8f0, rgba(226, 232, 240, 0));
        }
        .about-text {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 11px 16px;
          color: #334155;
          line-height: 1.48;
          font-size: 13px;
        }
        @media screen and (max-width: 768px) {
          .about-text {
            padding: 7px 10px;
            font-size: 11px;
            line-height: 1.35;
          }
        }
        .about-text p {
          margin-bottom: 2.5px;
        }
        .about-text p:last-child {
          margin-bottom: 0;
        }

        /* 4 Pilares */
        .pillars-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8.5px;
        }
        @media screen and (max-width: 768px) {
          .pillars-grid {
            gap: 5.5px;
          }
        }
        .pillar-card {
          border-radius: 11px;
          padding: 9px 12px;
          border: 1px solid transparent;
        }
        @media screen and (max-width: 768px) {
          .pillar-card {
            padding: 6px 8px;
          }
        }
        .pillar-blue {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-color: #bae6fd;
        }
        .pillar-green {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border-color: #bbf7d0;
        }
        .pillar-purple {
          background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
          border-color: #e9d5ff;
        }
        .pillar-amber {
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
          border-color: #fde68a;
        }

        .pillar-head {
          font-size: 11.5px;
          font-weight: 900;
          color: #0f172a;
          text-transform: uppercase;
          margin-bottom: 1.5px;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        @media screen and (max-width: 768px) {
          .pillar-head {
            font-size: 10px;
          }
        }
        .pillar-icon-box {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 19px;
          height: 19px;
          border-radius: 5px;
          background: #ffffff;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
          flex-shrink: 0;
        }
        @media screen and (max-width: 768px) {
          .pillar-icon-box {
            width: 16px;
            height: 16px;
          }
        }
        .icon-blue { color: #0284c7; }
        .icon-green { color: #16a34a; }
        .icon-purple { color: #9333ea; }
        .icon-amber { color: #d97706; }

        .pillar-desc {
          font-size: 11.5px;
          color: #475569;
          line-height: 1.34;
          padding-left: 24px;
        }
        @media screen and (max-width: 768px) {
          .pillar-desc {
            font-size: 9.8px;
            padding-left: 19px;
            line-height: 1.25;
          }
        }

        /* Contactos */
        .contacts-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8.5px;
        }
        @media screen and (max-width: 768px) {
          .contacts-grid {
            gap: 5.5px;
          }
        }
        .contact-box {
          border-radius: 11px;
          padding: 9px 12px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          text-decoration: none !important;
          color: #0f172a !important;
          display: block;
        }
        .contact-box:hover {
          border-color: #a5b4fc;
          background: #f1f5f9;
        }
        @media screen and (max-width: 768px) {
          .contact-box {
            padding: 6.5px 8px;
          }
        }
        .contact-label-row {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 1.5px;
        }
        @media screen and (max-width: 768px) {
          .contact-label-row {
            font-size: 7.8px;
          }
        }
        .contact-val-link {
          font-size: 12.2px;
          font-weight: 800;
          color: #1d4ed8 !important;
          word-break: break-all;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        /* Painel Horizontal do QR Code */
        .hero-qr-section {
          background: linear-gradient(135deg, #eef2ff 0%, #f8fafc 50%, #f0fdf4 100%);
          border: 1.5px solid #a5b4fc;
          border-radius: 14px;
          padding: 14px 20px;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.06);
          break-inside: avoid;
          page-break-inside: avoid;
        }
        @media screen and (max-width: 768px) {
          .hero-qr-section {
            padding: 9px 11px;
            gap: 9px;
            border-radius: 12px;
          }
        }
        .hero-qr-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          gap: 6px;
        }
        @media screen and (max-width: 768px) {
          .hero-qr-left {
            gap: 3px;
          }
        }
        .hero-qr-header {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .hero-qr-title {
          font-size: 13.8px;
          font-weight: 900;
          color: #312e81;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        @media screen and (max-width: 768px) {
          .hero-qr-title {
            font-size: 11.2px;
          }
        }
        .hero-qr-badge {
          background: #4338ca;
          color: #ffffff;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 2px 7.5px;
          border-radius: 9999px;
          letter-spacing: 0.35px;
        }
        @media screen and (max-width: 768px) {
          .hero-qr-badge {
            font-size: 7.5px;
            padding: 1.5px 5.5px;
          }
        }
        .hero-qr-desc {
          font-size: 12px;
          color: #3730a3;
          line-height: 1.36;
        }
        @media screen and (max-width: 768px) {
          .hero-qr-desc {
            font-size: 10.2px;
            line-height: 1.25;
          }
        }

        /* Moldura do QR Code (Aumentada e com Link Azul Integrado) */
        .hero-qr-card {
          width: 168px;
          background: #ffffff;
          border: 1.5px solid #a5b4fc;
          border-radius: 14px;
          padding: 7px;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.1);
          flex-shrink: 0;
          text-decoration: none !important;
          color: inherit !important;
        }
        @media screen and (max-width: 768px) {
          .hero-qr-card {
            width: 124px;
            border-radius: 10px;
            padding: 4.5px;
          }
        }
        .hero-qr-image-wrapper {
          position: relative;
          width: 154px;
          height: 154px;
          border-radius: 10px;
          overflow: hidden;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @media screen and (max-width: 768px) {
          .hero-qr-image-wrapper {
            width: 114px;
            height: 114px;
          }
        }
        .hero-qr-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        .hero-qr-watermark {
          position: absolute;
          width: 30px;
          height: 30px;
          background: linear-gradient(135deg, #4f46e5 0%, #312e81 100%);
          border-radius: 7px;
          border: 2px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        }
        @media screen and (max-width: 768px) {
          .hero-qr-watermark {
            width: 23px;
            height: 23px;
            border-radius: 5px;
          }
        }
        .hero-qr-watermark span {
          color: #ffffff;
          font-size: 15px;
          font-weight: 900;
          line-height: 1;
        }
        @media screen and (max-width: 768px) {
          .hero-qr-watermark span {
            font-size: 12px;
          }
        }
        /* Botão / Link Azul do QR Code */
        .hero-qr-hint {
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          color: #1d4ed8 !important;
          text-decoration: underline;
          text-underline-offset: 2px;
          text-align: center;
          margin-top: 4px;
          letter-spacing: 0.25px;
        }
        @media screen and (max-width: 768px) {
          .hero-qr-hint {
            font-size: 7.5px;
            margin-top: 2px;
          }
        }

        /* Ligação Direta */
        .hero-url-badge {
          background: #ffffff;
          border: 1.5px solid #a5b4fc;
          border-radius: 10px;
          padding: 6px 12px;
          display: inline-flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1.5px;
          max-width: 100%;
          text-decoration: none !important;
          color: #1e1b4b !important;
        }
        @media screen and (max-width: 768px) {
          .hero-url-badge {
            padding: 3.5px 7px;
          }
        }
        .hero-url-label {
          font-size: 8.8px;
          font-weight: 800;
          text-transform: uppercase;
          color: #4f46e5;
          display: flex;
          align-items: center;
          gap: 3.5px;
        }
        .hero-url-text {
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
          font-size: 11.5px;
          font-weight: 800;
          color: #1d4ed8 !important;
          word-break: break-all;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        @media screen and (max-width: 768px) {
          .hero-url-text {
            font-size: 9.5px;
          }
        }

        /* Fechamento e Rodapé */
        .footer-block {
          margin-top: 3px;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .formal-note {
          font-size: 9.8px;
          color: #64748b;
          font-style: italic;
          line-height: 1.34;
          text-align: center;
          margin-bottom: 4px;
          padding: 0 8px;
        }
        @media screen and (max-width: 768px) {
          .formal-note {
            font-size: 8.4px;
            margin-bottom: 2px;
          }
        }
        .footer {
          border-top: 1px solid #e2e8f0;
          padding-top: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 9.5px;
          color: #94a3b8;
        }
        @media screen and (max-width: 768px) {
          .footer {
            font-size: 8px;
            padding-top: 2.5px;
          }
        }

        /* CALIBRAÇÃO EXATA: 90% NO DESKTOP E 85% NO CELULAR (SEM SEGUNDA PÁGINA) */
        @media print {
          html, body {
            background: #ffffff !important;
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .preview-topbar {
            display: none !important;
          }
          .page-container {
            box-sizing: border-box !important;
            border: 1.2px solid #cbd5e1 !important;
            border-radius: 8px !important;
            box-shadow: none !important;
            margin: auto !important;
            width: 202mm !important;
            max-width: 202mm !important;
            height: auto !important;
            max-height: ${isMobile ? '252mm' : '268mm'} !important;
            padding: ${isMobile ? '8mm 11mm 7mm 11mm' : '10mm 13mm 8mm 13mm'} !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            gap: ${isMobile ? '7px' : '9px'} !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            break-inside: avoid !important;
          }
          .content-main {
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            gap: ${isMobile ? '7px' : '9px'} !important;
          }
          .header {
            padding: ${isMobile ? '8px 12px' : '10px 15px'} !important;
            border-radius: 11px !important;
          }
          .brand-logo, .brand-placeholder {
            width: ${isMobile ? '72px' : '88px'} !important;
            height: ${isMobile ? '72px' : '88px'} !important;
            font-size: ${isMobile ? '32px' : '38px'} !important;
            border-radius: 12px !important;
          }
          .brand-title {
            font-size: ${isMobile ? '19.5px' : '22.5px'} !important;
          }
          .brand-badge {
            font-size: ${isMobile ? '8.2px' : '9px'} !important;
            padding: 2px 7px !important;
          }
          .meta-box {
            font-size: ${isMobile ? '9.5px' : '10.8px'} !important;
            line-height: 1.4 !important;
          }
          .currency-tag {
            font-size: ${isMobile ? '9.2px' : '10px'} !important;
            padding: 1px 5.5px !important;
          }
          .title-banner {
            padding: ${isMobile ? '5.5px 10px' : '7px 12px'} !important;
            border-left-width: 4px !important;
          }
          .title-banner h1 {
            font-size: ${isMobile ? '13.2px' : '14.8px'} !important;
          }
          .title-banner p {
            font-size: ${isMobile ? '10px' : '11px'} !important;
          }
          .section-heading {
            font-size: ${isMobile ? '10px' : '11px'} !important;
            margin-bottom: 3px !important;
          }
          .about-text {
            font-size: ${isMobile ? '11px' : '12.2px'} !important;
            padding: ${isMobile ? '7px 11px' : '9px 13px'} !important;
            line-height: 1.4 !important;
            border-radius: 10px !important;
          }
          .pillars-grid {
            gap: ${isMobile ? '5.5px' : '7px'} !important;
          }
          .pillar-card {
            padding: ${isMobile ? '6.5px 9px' : '8px 11px'} !important;
            border-radius: 8px !important;
          }
          .pillar-head {
            font-size: ${isMobile ? '10px' : '11px'} !important;
          }
          .pillar-icon-box {
            width: ${isMobile ? '16px' : '18px'} !important;
            height: ${isMobile ? '16px' : '18px'} !important;
          }
          .pillar-desc {
            font-size: ${isMobile ? '10px' : '11px'} !important;
            padding-left: ${isMobile ? '20px' : '23px'} !important;
            line-height: 1.28 !important;
          }
          .contacts-grid {
            gap: ${isMobile ? '5.5px' : '7px'} !important;
          }
          .contact-box {
            padding: ${isMobile ? '6.5px 9px' : '8px 11px'} !important;
            border-radius: 8px !important;
          }
          .contact-label-row {
            font-size: ${isMobile ? '7.6px' : '8.5px'} !important;
          }
          .contact-val-link {
            font-size: ${isMobile ? '10.5px' : '11.5px'} !important;
            color: #1d4ed8 !important;
          }
          .hero-qr-section {
            padding: ${isMobile ? '9px 13px' : '11px 16px'} !important;
            border-radius: 12px !important;
          }
          .hero-qr-title {
            font-size: ${isMobile ? '12px' : '13.2px'} !important;
          }
          .hero-qr-desc {
            font-size: ${isMobile ? '10.5px' : '11.5px'} !important;
            line-height: 1.3 !important;
          }
          .hero-qr-card {
            width: ${isMobile ? '128px' : '146px'} !important;
            padding: 5px !important;
            border-radius: 11px !important;
          }
          .hero-qr-image-wrapper {
            width: ${isMobile ? '116px' : '134px'} !important;
            height: ${isMobile ? '116px' : '134px'} !important;
          }
          .hero-qr-watermark {
            width: ${isMobile ? '22px' : '26px'} !important;
            height: ${isMobile ? '22px' : '26px'} !important;
          }
          .hero-qr-watermark span {
            font-size: ${isMobile ? '12px' : '14px'} !important;
          }
          .hero-qr-hint {
            font-size: ${isMobile ? '7.8px' : '8.8px'} !important;
            color: #1d4ed8 !important;
          }
          .hero-url-badge {
            padding: ${isMobile ? '3.5px 7px' : '4.5px 9px'} !important;
            border-width: 1px !important;
          }
          .hero-url-text {
            font-size: ${isMobile ? '9.5px' : '10.5px'} !important;
            color: #1d4ed8 !important;
          }
          .footer-block {
            margin-top: 4px !important;
            padding-top: 0 !important;
          }
          .formal-note {
            font-size: ${isMobile ? '8.5px' : '9.2px'} !important;
            margin-bottom: 2.5px !important;
            line-height: 1.26 !important;
          }
          .footer {
            font-size: ${isMobile ? '8px' : '8.8px'} !important;
            padding-top: 2.5px !important;
          }
          a {
            text-decoration: underline !important;
          }
        }
      </style>
    </head>
    <body>
      <nav class="preview-topbar">
        <div class="topbar-left">
          <button 
            class="btn-back" 
            onclick="if (window.opener) { window.close(); } else if (window.history.length > 1) { window.history.back(); } else { window.location.href = '${storeUrl}'; }"
          >
            ${SVG_ICONS.arrowLeft}
            <span>${t.backBtn}</span>
          </button>
          <span class="preview-badge">${t.previewBadge}</span>
        </div>

        <button class="btn-print" onclick="window.print()">
          ${SVG_ICONS.printer}
          <span>${t.printBtn}</span>
        </button>
      </nav>

      <div class="page-container">
        <div class="content-main">
          <!-- Header Clicável -->
          <header class="header">
            <a href="${storeUrl}" target="_blank" rel="noopener noreferrer" class="brand-box" title="${storeName}">
              ${store.logo_url 
                ? `<img src="${store.logo_url}" class="brand-logo" alt="${storeName}" crossorigin="anonymous" />`
                : `<div class="brand-placeholder">${storeName.charAt(0)}</div>`
              }
              <div>
                <div class="brand-title">${storeName}</div>
                <div class="brand-badge">${SVG_ICONS.checkBadge} ${t.docBadge}</div>
              </div>
            </a>

            <div class="meta-box">
              <div><strong>${t.ref}:</strong> #${refCode}</div>
              <div><strong>${t.date}:</strong> ${issueDate}</div>
              ${activeSince ? `<div><strong>${t.since}:</strong> ${activeSince}</div>` : ''}
              <div><strong>${t.currency}:</strong> <span class="currency-tag">${currencyFormatted}</span></div>
            </div>
          </header>

          <!-- Banner de Título -->
          <section class="title-banner">
            <h1>${t.docTitle}</h1>
            <p>${t.docSubtitle}</p>
          </section>

          <!-- Seção Sobre a Empresa -->
          <section class="section-block">
            <h2 class="section-heading">${t.aboutTitle}</h2>
            <div class="about-text">
              <p>${introSelected}</p>
              <p>${store.description || t.defaultDesc}</p>
            </div>
          </section>

          <!-- 4 Pilares -->
          <section class="section-block">
            <h2 class="section-heading">${t.pillarsTitle}</h2>
            <div class="pillars-grid">
              <div class="pillar-card pillar-blue">
                <div class="pillar-head">
                  <span class="pillar-icon-box icon-blue">${SVG_ICONS.globe}</span>
                  <span>${t.p1Title}</span>
                </div>
                <div class="pillar-desc">${t.p1Desc}</div>
              </div>

              <div class="pillar-card pillar-green">
                <div class="pillar-head">
                  <span class="pillar-icon-box icon-green">${SVG_ICONS.message}</span>
                  <span>${t.p2Title}</span>
                </div>
                <div class="pillar-desc">${t.p2Desc}</div>
              </div>

              <div class="pillar-card pillar-purple">
                <div class="pillar-head">
                  <span class="pillar-icon-box icon-purple">${SVG_ICONS.shield}</span>
                  <span>${t.p3Title}</span>
                </div>
                <div class="pillar-desc">${t.p3Desc}</div>
              </div>

              <div class="pillar-card pillar-amber">
                <div class="pillar-head">
                  <span class="pillar-icon-box icon-amber">${SVG_ICONS.star}</span>
                  <span>${t.p4Title}</span>
                </div>
                <div class="pillar-desc">${t.p4Desc}</div>
              </div>
            </div>
          </section>

          <!-- Contactos com Links Canônicos para Chamada & Navegação no PDF -->
          <section class="section-block">
            <h2 class="section-heading">${t.contactsTitle}</h2>
            <div class="contacts-grid">
              <a href="${callLink}" class="contact-box" title="Efetuar chamada para ${phone}">
                <div class="contact-label-row">
                  <span class="icon-green">${SVG_ICONS.phone}</span>
                  <span>${t.whatsapp}</span>
                </div>
                <div class="contact-val-link">${phone || t.unavailable}</div>
              </a>

              <a href="${emailLink}" class="contact-box" title="Enviar e-mail para ${email}">
                <div class="contact-label-row">
                  <span class="icon-blue">${SVG_ICONS.mail}</span>
                  <span>${t.email}</span>
                </div>
                <div class="contact-val-link">${email || t.unavailable}</div>
              </a>

              <a href="${storeUrl}" target="_blank" rel="noopener noreferrer" class="contact-box" title="Aceder ao endereço ${storeUrl}">
                <div class="contact-label-row">
                  <span class="icon-purple">${SVG_ICONS.globe}</span>
                  <span>${t.website}</span>
                </div>
                <div class="contact-val-link">${storeUrl}</div>
              </a>
            </div>
          </section>

          <!-- Bloco do QR Code Horizontal com URL Oficial Clicável -->
          <section class="hero-qr-section">
            <div class="hero-qr-left">
              <div class="hero-qr-header">
                ${SVG_ICONS.qrScanIcon}
                <div class="hero-qr-title">${t.accessTitle}</div>
                <span class="hero-qr-badge">${t.officialBadge}</span>
              </div>
              <p class="hero-qr-desc">${t.accessSubtitle}</p>

              <a href="${productsUrl}" target="_blank" rel="noopener noreferrer" class="hero-url-badge" title="${productsUrl}">
                <span class="hero-url-label">${t.directUrlLabel}</span>
                <span class="hero-url-text">${productsUrl}</span>
              </a>
            </div>

            <!-- Card do QR Code com Botão/Link Azul Integrado -->
            <a href="${productsUrl}" target="_blank" rel="noopener noreferrer" class="hero-qr-card" title="Aceder ao catálogo oficial">
              <div class="hero-qr-image-wrapper">
                <img src="${qrCodeApiUrl}" alt="QR Code - ${storeName}" class="hero-qr-img" crossorigin="anonymous" />
                <div class="hero-qr-watermark">
                  <span>S</span>
                </div>
              </div>
              <div class="hero-qr-hint">${t.qrScanHint}</div>
            </a>
          </section>
        </div>

        <!-- Rodapé Fixo -->
        <div class="footer-block">
          <div class="formal-note">
            ${closingSelected}
          </div>

          <footer class="footer">
            <div>${storeName} &copy; ${new Date().getFullYear()} · ${t.rights}</div>
            <div>${t.generated}</div>
          </footer>
        </div>
      </div>

      <script>
        window.addEventListener('load', function() {
          var images = Array.from(document.images || []);
          var promises = images.map(function(img) {
            if (img.complete) return Promise.resolve();
            return new Promise(function(resolve) {
              img.onload = resolve;
              img.onerror = resolve;
            });
          });

          Promise.all(promises).then(function() {
            setTimeout(function() {
              try {
                window.print();
              } catch(e) {
                console.warn('Impressão automática:', e);
              }
            }, 300);
          });
        });
      </script>
    </body>
    </html>
  `;

  try {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const newTab = window.open(blobUrl, '_blank');

    if (!newTab) {
      window.location.href = blobUrl;
    }
  } catch (err) {
    console.error('Falha ao abrir pré-visualização comercial:', err);
  }
}