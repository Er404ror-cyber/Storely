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
    accessSubtitle: 'Aponte a câmara do telemóvel ao Código QR ao lado para aceder instantaneamente ao catálogo oficial:',
    officialBadge: 'Canal Oficial Verificado',
    directUrlLabel: 'Ligação Web Oficial:',
    qrScanHint: 'Aponte a câmara para abrir o catálogo',
    contactsTitle: 'Canais Oficiais de Contacto',
    whatsapp: 'WhatsApp Comercial',
    email: 'E-mail Institucional',
    website: 'Endereço Web',
    unavailable: 'Consulte no catálogo oficial',
    rights: 'Todos os direitos reservados.',
    generated: 'Gerado via infraestrutura Storely',
    printBtn: 'Imprimir / Guardar PDF',
    popupBlocked: 'Por favor, permita pop-ups para gerar o documento PDF.'
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
    accessSubtitle: 'Point your mobile camera at the QR Code to instantly open our official verified catalog:',
    officialBadge: 'Verified Official Channel',
    directUrlLabel: 'Official Web Address:',
    qrScanHint: 'Point your camera to scan & open catalog',
    contactsTitle: 'Verified Contact Channels',
    whatsapp: 'Business WhatsApp',
    email: 'Official Email',
    website: 'Web Address',
    unavailable: 'Available on digital storefront',
    rights: 'All rights reserved.',
    generated: 'Generated via Storely platform',
    printBtn: 'Print / Save as PDF',
    popupBlocked: 'Please allow pop-ups to generate the PDF document.'
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
  globe: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  message: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
  shield: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`,
  star: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  phone: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  mail: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  checkBadge: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  qrScanIcon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><rect x="7" y="7" width="10" height="10" rx="2"/></svg>`
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
  const storeUrl = `${baseUrl}/${storeSlug}`;
  const productsUrl = `${baseUrl}/${storeSlug}/products`;

  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(productsUrl)}&color=0f172a&bgcolor=ffffff&margin=0`;
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
  const email = store.owner_email || store.settings?.email || '';
  const refCode = (store.id ? store.id.substring(0, 8) : storeSlug).toUpperCase();

  const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const html = `
    <!DOCTYPE html>
    <html lang="${langKey}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${fileName}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 0 !important;
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
          background: #e2e8f0;
        }
        body {
          color: #0f172a;
          line-height: 1.34;
          font-size: 11px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px;
        }

        /* Botão Flutuante exclusivo para Mobile (invisível na impressão) */
        .mobile-print-bar {
          display: ${isMobile ? 'flex' : 'none'};
          position: sticky;
          top: 10px;
          z-index: 999;
          margin-bottom: 12px;
          background: #4f46e5;
          color: #ffffff;
          font-weight: 800;
          font-size: 14px;
          padding: 10px 20px;
          border-radius: 30px;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
          cursor: pointer;
          align-items: center;
          gap: 8px;
          border: none;
        }

        /* Trava A4 Milimétrica */
        .page-container {
          position: relative;
          width: 210mm;
          height: 296mm;
          max-height: 296mm;
          margin: 0 auto;
          background: #ffffff;
          padding: 8mm 12mm 6mm 12mm;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          page-break-after: avoid !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }

        .ambient-glow-top {
          position: absolute;
          top: -60px;
          right: -60px;
          width: 260px;
          height: 260px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, rgba(255, 255, 255, 0) 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .ambient-glow-bottom {
          position: absolute;
          bottom: -60px;
          left: -60px;
          width: 260px;
          height: 260px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, rgba(255, 255, 255, 0) 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .content-main {
          display: flex;
          flex-direction: column;
          gap: 7.5px;
        }

        /* Topo */
        .header {
          position: relative;
          z-index: 10;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 9px 14px;
          background: linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.95) 50%, rgba(238, 242, 255, 0.95) 100%);
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }
        .brand-box {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .brand-logo {
          width: 68px;
          height: 68px;
          border-radius: 12px;
          object-fit: cover;
          border: 2px solid #ffffff;
          background: #ffffff;
          box-shadow: 0 3px 10px rgba(79, 70, 229, 0.12);
          flex-shrink: 0;
        }
        .brand-placeholder {
          width: 68px;
          height: 68px;
          border-radius: 12px;
          background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          font-weight: 900;
          box-shadow: 0 3px 10px rgba(79, 70, 229, 0.16);
          flex-shrink: 0;
        }
        .brand-title {
          font-size: 19px;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.3px;
          line-height: 1.15;
        }
        .brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 8.5px;
          font-weight: 800;
          text-transform: uppercase;
          color: #4338ca;
          background: rgba(224, 231, 255, 0.9);
          padding: 2.5px 7px;
          border-radius: 9999px;
          letter-spacing: 0.35px;
          margin-top: 2.5px;
          border: 1px solid #c7d2fe;
        }
        .meta-box {
          text-align: right;
          font-size: 9.5px;
          color: #64748b;
          line-height: 1.4;
        }
        .meta-box strong {
          color: #0f172a;
        }
        .currency-tag {
          color: #047857;
          background: #d1fae5;
          padding: 1px 5.5px;
          border-radius: 4px;
          font-weight: 800;
          display: inline-block;
          border: 1px solid #a7f3d0;
        }

        /* Banner de Título */
        .title-banner {
          position: relative;
          z-index: 10;
          background: linear-gradient(to right, #f8fafc, #ffffff);
          border-left: 3.5px solid #4f46e5;
          padding: 6px 11px;
          border-radius: 0 8px 8px 0;
          border-top: 1px solid #f1f5f9;
          border-bottom: 1px solid #f1f5f9;
          border-right: 1px solid #f1f5f9;
        }
        .title-banner h1 {
          font-size: 12.5px;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.2px;
        }
        .title-banner p {
          font-size: 9.8px;
          color: #64748b;
          margin-top: 1px;
        }

        /* Seções */
        .section-block {
          position: relative;
          z-index: 10;
        }
        .section-heading {
          font-size: 9.8px;
          font-weight: 900;
          text-transform: uppercase;
          color: #334155;
          letter-spacing: 0.45px;
          margin-bottom: 3.5px;
          display: flex;
          align-items: center;
          gap: 5px;
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
          border-radius: 10px;
          padding: 7.5px 11px;
          color: #334155;
          line-height: 1.4;
          font-size: 10.5px;
        }
        .about-text p {
          margin-bottom: 2px;
        }
        .about-text p:last-child {
          margin-bottom: 0;
        }

        /* 4 Pilares */
        .pillars-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 5.5px;
        }
        .pillar-card {
          border-radius: 9px;
          padding: 6px 9px;
          border: 1px solid transparent;
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
          font-size: 9.8px;
          font-weight: 900;
          color: #0f172a;
          text-transform: uppercase;
          margin-bottom: 1.5px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .pillar-icon-box {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 17px;
          height: 17px;
          border-radius: 4px;
          background: #ffffff;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
          flex-shrink: 0;
        }
        .icon-blue { color: #0284c7; }
        .icon-green { color: #16a34a; }
        .icon-purple { color: #9333ea; }
        .icon-amber { color: #d97706; }

        .pillar-desc {
          font-size: 9.8px;
          color: #475569;
          line-height: 1.3;
          padding-left: 21px;
        }

        /* Contactos */
        .contacts-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 5.5px;
        }
        .contact-box {
          border-radius: 9px;
          padding: 6px 9px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
        }
        .contact-label-row {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 7.8px;
          font-weight: 800;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 1.5px;
        }
        .contact-val {
          font-size: 10px;
          font-weight: 800;
          color: #0f172a;
          word-break: break-all;
        }

        /* Bloco do QR Code Horizontal */
        .hero-qr-section {
          position: relative;
          z-index: 10;
          background: linear-gradient(135deg, #eef2ff 0%, #f8fafc 50%, #f0fdf4 100%);
          border: 1.2px solid #a5b4fc;
          border-radius: 11px;
          padding: 7px 12px;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .hero-qr-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          gap: 4px;
        }
        .hero-qr-header {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-wrap: wrap;
        }
        .hero-qr-title {
          font-size: 11px;
          font-weight: 900;
          color: #312e81;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .hero-qr-badge {
          background: #4338ca;
          color: #ffffff;
          font-size: 7.5px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 1.5px 6px;
          border-radius: 9999px;
          letter-spacing: 0.3px;
        }
        .hero-qr-desc {
          font-size: 9.8px;
          color: #3730a3;
          line-height: 1.3;
        }

        /* Moldura do QR Code */
        .hero-qr-card {
          width: 122px;
          background: #ffffff;
          border: 1.2px solid #a5b4fc;
          border-radius: 10px;
          padding: 5px;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 3px 10px rgba(79, 70, 229, 0.1);
          flex-shrink: 0;
        }
        .hero-qr-image-wrapper {
          position: relative;
          width: 110px;
          height: 110px;
          border-radius: 7px;
          overflow: hidden;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hero-qr-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        .hero-qr-watermark {
          position: absolute;
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #4f46e5 0%, #312e81 100%);
          border-radius: 6px;
          border: 1.5px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 5px rgba(0,0,0,0.22);
        }
        .hero-qr-watermark span {
          color: #ffffff;
          font-size: 13px;
          font-weight: 900;
          line-height: 1;
        }
        .hero-qr-hint {
          font-size: 7.2px;
          font-weight: 800;
          text-transform: uppercase;
          color: #4338ca;
          text-align: center;
          margin-top: 2.5px;
          letter-spacing: 0.2px;
        }

        /* Ligação Direta em Texto */
        .hero-url-badge {
          background: #ffffff;
          border: 1px solid #c7d2fe;
          border-radius: 7px;
          padding: 3px 8px;
          display: inline-flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1px;
          max-width: 100%;
        }
        .hero-url-label {
          font-size: 7.5px;
          font-weight: 800;
          text-transform: uppercase;
          color: #6366f1;
        }
        .hero-url-text {
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
          font-size: 9px;
          font-weight: 800;
          color: #1e1b4b;
          word-break: break-all;
        }

        /* Fechamento e Rodapé */
        .footer-block {
          margin-top: auto;
          padding-top: 4px;
        }
        .formal-note {
          font-size: 8.2px;
          color: #64748b;
          font-style: italic;
          line-height: 1.25;
          text-align: center;
          margin-bottom: 2.5px;
          padding: 0 6px;
        }
        .footer {
          border-top: 1px solid #e2e8f0;
          padding-top: 2.5px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 7.8px;
          color: #94a3b8;
        }

        @media print {
          html, body {
            background: #ffffff !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
          .mobile-print-bar {
            display: none !important;
          }
          .page-container {
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            width: 210mm !important;
            height: 296mm !important;
            max-height: 296mm !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      </style>
    </head>
    <body>
      <button class="mobile-print-bar" onclick="window.print()">${t.printBtn}</button>

      <div class="page-container">
        
        <div class="ambient-glow-top"></div>
        <div class="ambient-glow-bottom"></div>

        <div class="content-main">
          <!-- Header -->
          <header class="header">
            <div class="brand-box">
              ${store.logo_url 
                ? `<img src="${store.logo_url}" class="brand-logo" alt="${storeName}" crossorigin="anonymous" />`
                : `<div class="brand-placeholder">${storeName.charAt(0)}</div>`
              }
              <div>
                <div class="brand-title">${storeName}</div>
                <div class="brand-badge">${SVG_ICONS.checkBadge} ${t.docBadge}</div>
              </div>
            </div>

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

          <!-- Contactos -->
          <section class="section-block">
            <h2 class="section-heading">${t.contactsTitle}</h2>
            <div class="contacts-grid">
              <div class="contact-box">
                <div class="contact-label-row">
                  <span class="icon-green">${SVG_ICONS.phone}</span>
                  <span>${t.whatsapp}</span>
                </div>
                <div class="contact-val">${phone || t.unavailable}</div>
              </div>

              <div class="contact-box">
                <div class="contact-label-row">
                  <span class="icon-blue">${SVG_ICONS.mail}</span>
                  <span>${t.email}</span>
                </div>
                <div class="contact-val">${email || t.unavailable}</div>
              </div>

              <div class="contact-box">
                <div class="contact-label-row">
                  <span class="icon-purple">${SVG_ICONS.globe}</span>
                  <span>${t.website}</span>
                </div>
                <div class="contact-val">${storeUrl.replace(/^https?:\/\//, '')}</div>
              </div>
            </div>
          </section>

          <!-- Bloco do QR Code Horizontal -->
          <section class="hero-qr-section">
            <div class="hero-qr-left">
              <div class="hero-qr-header">
                ${SVG_ICONS.qrScanIcon}
                <div class="hero-qr-title">${t.accessTitle}</div>
                <span class="hero-qr-badge">${t.officialBadge}</span>
              </div>
              <p class="hero-qr-desc">${t.accessSubtitle}</p>
              
              <div class="hero-url-badge">
                <span class="hero-url-label">${t.directUrlLabel}</span>
                <span class="hero-url-text">${productsUrl}</span>
              </div>
            </div>

            <div class="hero-qr-card">
              <div class="hero-qr-image-wrapper">
                <img src="${qrCodeApiUrl}" alt="QR Code - ${storeName}" class="hero-qr-img" crossorigin="anonymous" />
                <div class="hero-qr-watermark">
                  <span>S</span>
                </div>
              </div>
              <div class="hero-qr-hint">${t.qrScanHint}</div>
            </div>
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

      ${isMobile ? `
        <script>
          window.addEventListener('load', () => {
            setTimeout(() => {
              try {
                window.print();
              } catch(e) {}
            }, 350);
          });
        </script>
      ` : ''}
    </body>
    </html>
  `;

  // Em Celulares (Chrome Android / Mobile Safari / WebView)
  if (isMobile) {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const newTab = window.open(blobUrl, '_blank');

    if (!newTab) {
      // Fallback se o navegador bloquear o popup
      window.location.href = blobUrl;
    }
    return;
  }

  // Em Computadores Desktop (Chrome, Safari, Edge, Firefox)
  const existingFrame = document.getElementById('presentation-pdf-iframe');
  if (existingFrame) {
    existingFrame.remove();
  }

  const printFrame = document.createElement('iframe');
  printFrame.id = 'presentation-pdf-iframe';
  printFrame.setAttribute('style', 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;');
  document.body.appendChild(printFrame);

  const frameWindow = printFrame.contentWindow;
  const frameDoc = frameWindow?.document;
  if (!frameDoc || !frameWindow) return;

  frameDoc.open();
  frameDoc.write(html);
  frameDoc.close();

  const performPrint = () => {
    try {
      frameWindow.focus();
      frameWindow.print();
    } catch (e) {
      console.error('Erro na impressão Desktop:', e);
    }
  };

  const images = Array.from(frameDoc.images || []);
  if (images.length > 0) {
    const imagePromises = images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    });

    Promise.all(imagePromises).then(() => {
      setTimeout(performPrint, 100);
    });
  } else {
    setTimeout(performPrint, 150);
  }
}