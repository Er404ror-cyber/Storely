export interface GeneratedPageConfig {
    slug: string;
    type: string;
    title: string;
    description: string;
    sections: any[];
    aiSuggestion: string;
  }
  
  // Lista oficial estrita baseada exclusivamente na SectionLibrary fornecida
  const ALLOWED_SECTION_TYPES = [
    'hero_comercial',
    'galeria_grid',
    'contacto_mapa',
    'vitrine_produtos',
    'texto_narrativo',
    'texto_imagem_showcase',
    'media_embeds',
    'products_catalog',
    'esports_profile'
  ];
  
  export const generateSmartPageFromPrompt = (
    userTitle: string, 
    userDescription: string, 
    storeSlug: string
  ): GeneratedPageConfig => {
    const cleanTitle = userTitle.trim() || 'Nova Página de Alta Conversão';
    const cleanDesc = userDescription.trim() || 'Página otimizada para captar clientes e gerar vendas automáticas.';
    
    // Normalização segura do Slug
    const slug = cleanTitle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  
    const textLower = (userTitle + ' ' + userDescription).toLowerCase();
  
    // Intenções inteligentes baseadas em palavras-chave (PT/EN)
    const isEatsOrProduct = /produto|loja|vender|comprar|shop|store|product|price|preço|menu|comida|catalogo/i.test(textLower);
    const isPortfolio = /foto|fotografia|portfolio|design|arte|creative|art|galeria|gallery/i.test(textLower);
  
    let rawSections: any[] = [];
    let aiSuggestion = "";
    let templateType = "custom_ai";
  
    if (isEatsOrProduct) {
      templateType = "ecommerce_booster";
      aiSuggestion = `💡 Dica de Conversão: O link final será gerado em ${storeSlug}/${slug}. Adicionámos catálogo e produtos em destaque para maximizar conversões.`;
      rawSections = [
        {
          type: 'hero_comercial',
          content: {
            title: cleanTitle,
            sub: cleanDesc,
            media: { url: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80", isTemp: false, size: 0 }
          },
          style: { theme: 'light', align: 'left', fontSize: 'medium' }
        },
        {
          type: 'vitrine_produtos',
          content: {
            title: 'Produtos em Destaque',
            items: [
              { id: 1, name: 'Item Principal Premium', price: 'MZN 1.500', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600', tag: 'Mais Vendido' },
              { id: 2, name: 'Edição Especial', price: 'MZN 2.800', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600', tag: 'Exclusivo' }
            ]
          },
          style: { theme: 'light', cols: '2', align: 'left' }
        },
        {
          type: 'products_catalog',
          content: { title: 'Catálogo Geral' },
          style: { theme: 'light', cols: '2', align: 'left' }
        },
        {
          type: 'contacto_mapa',
          content: { title: 'Fale Connosco & Encomende' },
          style: { theme: 'dark', align: 'center' }
        }
      ];
    } else if (isPortfolio) {
      templateType = "creative_showcase";
      aiSuggestion = `💡 Dica de Conversão: O link final será gerado em ${storeSlug}/${slug}. Perfil visual combinado com galeria de alta densidade.`;
      rawSections = [
        {
          type: 'esports_profile',
          content: {
            title: cleanTitle,
            sub: cleanDesc,
            media: { url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80", isTemp: false, size: 0 }
          },
          style: { theme: 'dark', align: 'left', fontSize: 'small' }
        },
        {
          type: 'galeria_grid',
          content: {
            title: 'Portefólio Visual',
            sub: 'Trabalhos recentes selecionados',
            images: [
              { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9', title: 'Projeto Alpha' },
              { url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1', title: 'Sessão Exclusiva' },
              { url: 'https://images.unsplash.com/photo-1519741497674-611481863552', title: 'Editorial Lifestyle' }
            ]
          },
          style: { theme: 'light', cols: '3', align: 'center' }
        },
        {
          type: 'texto_imagem_showcase',
          content: { title: 'Processo Criativo', text: cleanDesc },
          style: { theme: 'light', align: 'left', fontSize: 'base' }
        },
        {
          type: 'contacto_mapa',
          content: { title: 'Agende o seu Projeto' },
          style: { theme: 'dark', align: 'center' }
        }
      ];
    } else {
      templateType = "authority_brand";
      aiSuggestion = `💡 Dica de Conversão: O link final será gerado em ${storeSlug}/${slug}. Estrutura com identidade, narrativa de valor e contato.`;
      rawSections = [
        {
          type: 'hero_comercial',
          content: {
            title: cleanTitle,
            sub: cleanDesc,
            media: { url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80", isTemp: false, size: 0 }
          },
          style: { theme: 'dark', align: 'left', fontSize: 'medium' }
        },
        {
          type: 'texto_narrativo',
          content: { title: 'Sobre o Projeto', text: cleanDesc },
          style: { theme: 'light', align: 'left', fontSize: 'base' }
        },
        {
          type: 'media_embeds',
          content: { title: 'Redes & Links Úteis' },
          style: { theme: 'light', align: 'center' }
        },
        {
          type: 'contacto_mapa',
          content: { title: 'Entre em Contato' },
          style: { theme: 'light', align: 'center' }
        }
      ];
    }
  
    // Validação estrita e mapeamento com os IDs das secções permitidas
    const sections = rawSections
      .filter((sec) => ALLOWED_SECTION_TYPES.includes(sec.type))
      .map((sec, index) => ({
        ...sec,
        id: `ai_sec_${Date.now()}_${index}`,
        order_index: index
      }));
  
    return {
      slug,
      type: templateType,
      title: cleanTitle,
      description: cleanDesc,
      sections,
      aiSuggestion
    };
  };