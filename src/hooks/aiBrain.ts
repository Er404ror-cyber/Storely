export type AiEffectType = 'NAVIGATE' | 'CHANGE_LANGUAGE';

export interface AiEffect {
  type: AiEffectType;
  payload: string;
}

export interface AiAction {
  label: string;
  route: string;
  isExternal?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  actions?: AiAction[];
  effects?: AiEffect[];
  expectsClarification?: boolean;
}

export interface AiResult {
  text: string;
  actions: AiAction[];
  effects: AiEffect[];
  expectsClarification?: boolean;
}

export const MOZ_SUPPORT_PHONE = "+258840000000";

const cleanText = (str: string): string => 
  str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/g, "");

const getRandom = (arr: string[]): string => arr[Math.floor(Math.random() * arr.length)];

// Dicionário de Inteligência Expandido
const KEYWORDS = {
  langEn: ['en', 'ingle', 'english', 'usa', 'uk'],
  langPt: ['pt', 'portugue', 'mocambique', 'mz', 'portugues'],
  whatsapp: ['whatsapp', 'whats', 'zap', 'numero', 'telefone', 'contacto', 'contato', 'telemovel', 'celular', 'ligar'],
  explore: ['explorar', 'blog', 'artigo', 'noticia', 'novidade', 'explore', 'post', 'publicacao'],
  domain: ['dominio', 'link', 'url', 'site', 'endereco', 'nome da loja', 'slug', 'mudar o nome', 'seo'],
  product: ['produt', 'artigo', 'item', 'catalog', 'preco', 'stock', 'inventario', 'moed', 'dinheir', 'pagament', 'meticais', 'cambio', 'currency', 'money', 'price', 'valor', 'custo'],
  page: ['pagin', 'site', 'layout', 'design', 'construt', 'builder', 'aparenci', 'tema', 'cor', 'banner', 'logo', 'visual', 'websit', 'appearanc', 'theme', 'color', 'imagem', 'foto'],
  setup: ['setup', 'inicializa', 'passo', 'inicia', 'wizard', 'start'],
  settings: ['configur', 'definicoe', 'definic', 'opcao', 'opcoe', 'perfil', 'setting', 'preferenc', 'profile', 'conta', 'senha', 'password'],
  music: ['music', 'audio', 'som', 'playlist', 'sound', 'tocar', 'play', 'musica'],
  orders: ['encomend', 'vend', 'pedid', 'faturacao', 'recibo', 'order', 'sale', 'purchas', 'billing', 'cliente', 'compr'],
  shipping: ['envi', 'porte', 'entreg', 'transport', 'taxa', 'shipping', 'delivery', 'freight', 'zona', 'correio'],
  discount: ['descont', 'cupao', 'cupoe', 'promoca', 'ofert', 'discount', 'coupon', 'promo', 'offer'],
  analytics: ['estatistic', 'visit', 'relatorio', 'grafic', 'metric', 'analytic', 'report', 'chart', 'traffic', 'visualizaco']
};

// Respostas Humanizadas (A IA escolhe uma aleatoriamente)
const RESPONSES = {
  pt: {
    langSwitched: ["🔄 Alterado! De agora em diante, falarei português contigo.", "✅ Feito! Vamos falar em português então."],
    clarify: ["Consegues dar-me mais um detalhe? Queres mexer nos Artigos, Cores, Encomendas ou nas Definições?", "Podes ser um pouquinho mais específico? Do que precisas exatamente?"],
    unknown: ["Hmm, confesso que me apanhaste! 🤖 Queres explorar as Definições ou falar com a nossa equipa humana?", "Essa pergunta baralhou-me um pouco os circuitos! Queres ajuda da nossa equipa no WhatsApp?"],
    action_whatsapp: ["📱 A abrir as Definições! É aqui que podes atualizar o teu número de WhatsApp e contactos.", "Vem comigo às Definições. Podes alterar o teu WhatsApp logo ali na secção de contactos."],
    action_domain: ["🔗 A redirecionar para as Definições! Lá podes alterar o nome da loja e o teu link.", "Vamos às Definições! É o local certo para mudares o teu endereço e o nome da tua marca."],
    action_explore: ["📰 A abrir o Explorar! Espreita as novidades e publicações da loja.", "Vou levar-te ao Blog. Podes ver todas as atualizações lá!"],
    action_product: ["💰 A caminho dos Produtos! Lembra-te: o preço e a moeda mudam-se ao editar cada artigo individualmente.", "Pronto! Vou abrir o Catálogo. Podes mudar os preços, moeda e stock diretamente nos teus artigos."],
    action_page: ["🎨 Vamos ao Construtor! Clica em 'Editar' numa página para alterares as cores, imagens e banners.", "A preparar o estúdio de design... É nas Páginas que mudas todo o aspeto visual do teu site!"],
    action_orders: ["📦 A carregar as Encomendas. Aqui consegues gerir os teus clientes e marcar vendas como enviadas.", "Vamos aos Pedidos! Tudo o que vendeste aparece aqui para organizares."],
    action_settings: ["⚙️ A abrir as Definições globais. Tudo o que é configuração de base da tua conta está aqui.", "Vamos às configurações. Podes ajustar as tuas opções de perfil e loja nesta página."],
    action_shipping: ["🚚 A preparar os Envios! Cria as tuas zonas de entrega e define as taxas de transporte por aqui.", "Vamos configurar as tuas entregas. É nesta página que defines os custos de envio."],
    action_analytics: ["📈 A preparar os teus relatórios! Os teus números e visitas estão no Painel Principal.", "Vamos ver como estão as vendas! A redirecionar para as Estatísticas."],
    action_discount: ["🎟️ A abrir a zona de Descontos! Podes criar e gerir os teus cupões de oferta aqui.", "Vamos aos Descontos. Cria promoções irresistíveis para os teus clientes!"]
  },
  en: {
    langSwitched: ["🔄 Done! I'll speak English from now on.", "✅ All set! Switching to English."],
    clarify: ["Could you give me a bit more detail? Are you looking for Items, Design, Orders, or Settings?", "Can you be a bit more specific? What exactly do you need?"],
    unknown: ["Hmm, you caught me off guard! 🤖 Want to check Settings or talk to our human team?", "That question scrambled my circuits! Do you want to chat with support?"],
    action_whatsapp: ["📱 Opening Settings! You can update your WhatsApp and contacts right there.", "Let's go to Settings. Your WhatsApp number can be changed in the contacts section."],
    action_domain: ["🔗 Redirecting to Settings! Change your store name and URL here.", "Let's check your Settings to change your domain and store name."],
    action_explore: ["📰 Opening Explore! Check out the latest news and posts.", "I'll take you to the Blog. You can manage publications there!"],
    action_product: ["💰 On our way to Products! Remember: prices and currency are changed by editing each item.", "Done! Opening Catalog. Edit any product to change its price and stock."],
    action_page: ["🎨 Let's go to the Builder! Click 'Edit' on any page to change colors, images, and banners.", "Preparing the design studio... Change your site's visual appearance here!"],
    action_orders: ["📦 Loading Orders. Manage your sales and mark items as shipped here.", "Let's see your Orders! Everything you sold is organized on this page."],
    action_settings: ["⚙️ Opening global Settings. All your base configurations are here.", "Let's go to Settings. Adjust your profile and store options on this page."],
    action_shipping: ["🚚 Preparing Shipping! Create delivery zones and rates here.", "Let's set up your deliveries. Define shipping costs on this page."],
    action_analytics: ["📈 Preparing your reports! Your numbers are on the Dashboard.", "Let's see how sales are doing! Redirecting to Analytics."],
    action_discount: ["🎟️ Opening Discounts! Create and manage your promo coupons here.", "Let's go to Discounts. Create irresistible promos for your customers!"]
  }
};

const ALL_FAQS = {
  pt: [
    "Onde mudo a minha moeda?", "Como altero o meu WhatsApp?", "Onde posso mudar as cores da loja?", 
    "Como configuro as taxas de entrega?", "Onde vejo as minhas vendas?", "Como alterar o nome do meu link?"
  ],
  en: [
    "Where do I change my currency?", "How do I update my WhatsApp?", "Where can I change store colors?",
    "How do I set up shipping rates?", "Where can I see my sales?", "How do I change my store URL?"
  ]
};

// Devolve 3 FAQs aleatórias e únicas
export const getRandomFAQs = (lang: 'pt' | 'en'): string[] => {
  const shuffled = [...ALL_FAQS[lang]].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
};
const checkIntent = (text: string, keywords: string[]): boolean => keywords.some(k => text.includes(k));


export const processAiQuery = (
  query: string, 
  systemLang: 'pt' | 'en',
  history: ChatMessage[] = []
): AiResult => {
  const text = cleanText(query);
  const effects: AiEffect[] = [];
  let responseLang = systemLang;

  const targetEn = checkIntent(text, KEYWORDS.langEn);
  const targetPt = checkIntent(text, KEYWORDS.langPt);

  if (targetEn || targetPt) {
    responseLang = targetEn ? 'en' : 'pt';
    effects.push({ type: 'CHANGE_LANGUAGE', payload: responseLang });
    return { text: getRandom(RESPONSES[responseLang].langSwitched), actions: [], effects };
  }

  const res = RESPONSES[responseLang];

  if (checkIntent(text, KEYWORDS.whatsapp)) {
    effects.push({ type: 'NAVIGATE', payload: '/admin/configuracoes' });
    return { text: getRandom(res.action_whatsapp), actions: [], effects };
  }
  if (checkIntent(text, KEYWORDS.explore)) {
    effects.push({ type: 'NAVIGATE', payload: '/admin/explore' });
    return { text: getRandom(res.action_explore), actions: [], effects };
  }
  if (checkIntent(text, KEYWORDS.domain)) {
    effects.push({ type: 'NAVIGATE', payload: '/admin/configuracoes' });
    return { text: getRandom(res.action_domain), actions: [], effects };
  }
  if (checkIntent(text, KEYWORDS.product)) {
    effects.push({ type: 'NAVIGATE', payload: '/admin/produtos' });
    return { text: getRandom(res.action_product), actions: [], effects };
  }
  if (checkIntent(text, KEYWORDS.page)) {
    effects.push({ type: 'NAVIGATE', payload: '/admin/paginas' });
    return { text: getRandom(res.action_page), actions: [], effects };
  }
  if (checkIntent(text, KEYWORDS.orders)) {
    effects.push({ type: 'NAVIGATE', payload: '/admin/encomendas' }); 
    return { text: getRandom(res.action_orders), actions: [], effects };
  }
  if (checkIntent(text, KEYWORDS.analytics)) {
    effects.push({ type: 'NAVIGATE', payload: '/admin/estatisticas' });
    return { text: getRandom(res.action_analytics), actions: [], effects };
  }
  if (checkIntent(text, KEYWORDS.settings) || checkIntent(text, KEYWORDS.setup) || checkIntent(text, KEYWORDS.music) || checkIntent(text, KEYWORDS.shipping)) {
    effects.push({ type: 'NAVIGATE', payload: '/admin/configuracoes' });
    if (checkIntent(text, KEYWORDS.shipping)) {
      return { text: getRandom(res.action_shipping), actions: [], effects };
    }
    return { text: getRandom(res.action_settings), actions: [], effects };
  }

  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= 2) {
    return { text: getRandom(res.clarify), actions: [], effects: [], expectsClarification: true };
  }

  const cleanPhone = MOZ_SUPPORT_PHONE.replace('+', '');
  return {
    text: getRandom(res.unknown),
    actions: [
      { label: responseLang === 'pt' ? "Falar no WhatsApp" : "WhatsApp Support", route: `https://wa.me/${cleanPhone}`, isExternal: true },
      { label: responseLang === 'pt' ? "Ir para Configurações" : "Store Settings", route: "/admin/configuracoes" }
    ],
    effects: []
  };
};