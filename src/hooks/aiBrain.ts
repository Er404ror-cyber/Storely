export type AiEffectType = 'NAVIGATE' | 'CHANGE_LANGUAGE' | 'EDIT_STORE_NAME' | 'LOGOUT' | 'OPEN_STORE';

export interface AiEffect {
  type: AiEffectType;
  payload?: string;
}

export interface AiAction {
  label: string;
  route?: string;
  actionType?: AiEffectType;
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

// --- FUNÇÕES AUXILIARES ---
const cleanText = (str: string): string => 
  str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/g, "");

const getRandom = (arr: string[]): string => arr[Math.floor(Math.random() * arr.length)];

// A FUNÇÃO QUE FALTAVA:
const checkIntent = (text: string, keywords: string[]): boolean => keywords.some(k => text.includes(k));

// --- DICIONÁRIO DE INTELIGÊNCIA ---
const KEYWORDS = {
  langToggle: ['lingua', 'idiom', 'languag', 'mudar a lingua', 'change language', 'traduzir', 'translate'],
  logout: ['sair', 'logout', 'deslogar', 'terminar sessao', 'sign out', 'log out'],
  openStore: ['ver loja', 'abrir loja', 'meu site', 'ir para o site', 'view store', 'open site'],
  editName: ['mudar nome', 'alterar nome', 'edit name', 'store name', 'nome da loja'],
  tips: ['dica', 'ajuda', 'vender mais', 'visibilidade', 'seo', 'melhorar', 'tip', 'improve', 'sell more', 'grow'],
  
  whatsapp: ['whatsapp', 'whats', 'zap', 'numero', 'telefone', 'contacto', 'contato', 'telemovel', 'celular', 'ligar'],
  explore: ['explorar', 'blog', 'artigo', 'noticia', 'novidade', 'explore', 'post', 'publicacao'],
  domain: ['dominio', 'link', 'url', 'site', 'endereco', 'slug', 'seo'],
  product: ['produt', 'artigo', 'item', 'catalog', 'preco', 'stock', 'inventario', 'moed', 'dinheir', 'pagament', 'meticais', 'cambio', 'currency', 'money', 'price', 'valor', 'custo', 'adicionar produto'],
  page: ['pagin', 'site', 'layout', 'design', 'construt', 'builder', 'aparenci', 'tema', 'cor', 'banner', 'logo', 'visual', 'websit', 'appearanc', 'theme', 'color', 'imagem', 'foto', 'criar pagina'],
  settings: ['configur', 'definicoe', 'definic', 'opcao', 'opcoe', 'perfil', 'setting', 'preferenc', 'profile', 'conta'],
  orders: ['encomend', 'vend', 'pedid', 'faturacao', 'recibo', 'order', 'sale', 'purchas', 'billing', 'cliente', 'compr'],
  shipping: ['envi', 'porte', 'entreg', 'transport', 'taxa', 'shipping', 'delivery', 'freight', 'zona'],
  analytics: ['estatistic', 'visit', 'relatorio', 'grafic', 'metric', 'analytic', 'report', 'chart', 'traffic']
};

const RESPONSES = {
  pt: {
    clarify: ["Podes dar-me mais um detalhe? Estás a tentar mudar Artigos, Cores, Encomendas ou Definições?", "Para eu ser mais exato, diz-me: procuras ajuda com produtos, design ou a tua conta?"],
    unknown: ["Essa apanhou-me desprevenido! 🤖 Queres explorar as Definições ou falar com a nossa equipa humana?", "Não tenho a certeza de como ajudar com isso. Queres falar com o Suporte no WhatsApp?"],
    already_here: "✨ Já estás no lugar certo! Basta olhares para o ecrã e fazeres a alteração aqui mesmo.",
    
    action_lang: "🌍 A mudar o idioma do sistema para ti agora mesmo!",
    action_logout: "👋 A terminar a tua sessão. Tem um excelente dia!",
    action_openStore: "🌐 A abrir a tua loja pública num novo separador para veres como está a ficar!",
    action_editName: "✏️ Ativei a edição do nome da tua loja no cabeçalho.\n\n⚠️ **Atenção:** Só podes alterar o nome da loja a cada 24 horas. Se vires o tempo a contar, terás de aguardar!",
    
    action_whatsapp: "📱 A abrir as Definições. Podes atualizar o teu número de WhatsApp logo ali na secção de contactos.",
    action_product: "💰 Vamos ao Catálogo! **Dica:** Os preços e stock mudam-se dentro de cada artigo, mas a **Moeda** da loja configura-se no topo da página de Produtos.",
    action_page: "🎨 A carregar o Construtor! Clica em 'Nova Página' para criar, ou 'Editar' para mudar cores e banners.",
    action_orders: "📦 Vamos aos Pedidos! Tudo o que vendeste aparece aqui para organizares e marcares como enviado.",
    action_settings: "⚙️ A abrir as Definições globais. Tudo o que é configuração de base está aqui.",
    action_shipping: "🚚 A preparar os Envios! Cria as tuas zonas de entrega e define as taxas de transporte por aqui.",
    action_analytics: "📈 Vamos ver os teus relatórios e visitas no Painel Principal.",
    
    tips: [
      "💡 **Dica de Visibilidade:** Partilha o link da tua loja nas tuas redes sociais e coloca-o na bio do Instagram e WhatsApp. Usa imagens de alta qualidade nos produtos!",
      "💡 **Dica de Vendas:** Cria descrições claras para os teus produtos e define taxas de envio justas (ou frete grátis) para evitar carrinhos abandonados.",
      "💡 **Dica de Design:** Menos é mais! Mantém o design da tua página inicial limpo, usando no máximo 2 a 3 cores principais que combinem com o teu logótipo."
    ]
  },
  en: {
    clarify: ["Could you give me a bit more detail? Are you looking for Items, Design, Orders, or Settings?", "Can you be more specific? Do you need help with products, pages, or settings?"],
    unknown: ["Hmm, you caught me off guard! 🤖 Want to check Settings or talk to our human team?", "I'm a bit lost on that one! Do you want to chat with our Support?"],
    already_here: "✨ You are already in the right place! Just look at your screen and make the changes right here.",
    
    action_lang: "🌍 Switching the system language for you right now!",
    action_logout: "👋 Signing you out. Have a great day!",
    action_openStore: "🌐 Opening your public store in a new tab so you can see how it looks!",
    action_editName: "✏️ I've enabled store name editing in the header.\n\n⚠️ **Note:** You can only change the store name every 24 hours. If there's a countdown, you'll need to wait!",
    
    action_whatsapp: "📱 Opening Settings. You can update your WhatsApp in the contacts section.",
    action_product: "💰 Let's go to Catalog! **Tip:** Prices are set inside each item, but the store **Currency** is configured at the top of the Products page.",
    action_page: "🎨 Loading Builder! Click 'New Page' to create one, or 'Edit' to change colors and banners.",
    action_orders: "📦 Let's see your Orders! Manage sales and mark them as shipped here.",
    action_settings: "⚙️ Opening Settings. All your base configurations are here.",
    action_shipping: "🚚 Preparing Shipping! Create delivery zones and rates here.",
    action_analytics: "📈 Let's check your numbers and visits on the Dashboard.",
    
    tips: [
      "💡 **Visibility Tip:** Share your store link on your social media and put it in your Instagram/WhatsApp bio. Always use high-quality product images!",
      "💡 **Sales Tip:** Write clear product descriptions and offer fair shipping rates (or free shipping) to reduce abandoned carts.",
      "💡 **Design Tip:** Less is more! Keep your homepage clean, using a maximum of 2 to 3 main colors that match your logo."
    ]
  }
};

const ALL_FAQS = {
  pt: ["Como mudar a moeda?", "Dicas para vender mais", "Onde mudo o WhatsApp?", "Como criar uma página?", "Ver a minha loja"],
  en: ["How to change currency?", "Tips to sell more", "Where to update WhatsApp?", "How to create a page?", "View my store"]
};

export const getRandomFAQs = (lang: 'pt' | 'en'): string[] => {
  return [...ALL_FAQS[lang]].sort(() => 0.5 - Math.random()).slice(0, 3);
};

export const processAiQuery = (
  query: string, 
  systemLang: 'pt' | 'en',
  history: ChatMessage[] = [],
  currentPath: string = ''
): AiResult => {
  const text = cleanText(query);
  const effects: AiEffect[] = [];
  const res = RESPONSES[systemLang];

  // --- MEMÓRIA DE CONTEXTO ---
  if (history.length > 0 && history[history.length - 1].expectsClarification && text.length < 15) {
    if (text.includes('cor') || text.includes('design')) return { text: res.action_page, actions: [], effects: [{ type: 'NAVIGATE', payload: '/admin/paginas' }] };
    if (text.includes('preco') || text.includes('moeda')) return { text: res.action_product, actions: [], effects: [{ type: 'NAVIGATE', payload: '/admin/produtos' }] };
  }

  // --- AUTOMAÇÕES DO SISTEMA ---
  if (checkIntent(text, KEYWORDS.langToggle)) {
    const targetLang = systemLang === 'pt' ? 'en' : 'pt';
    effects.push({ type: 'CHANGE_LANGUAGE', payload: targetLang });
    return { text: RESPONSES[targetLang].action_lang, actions: [], effects };
  }
  if (checkIntent(text, KEYWORDS.logout)) {
    effects.push({ type: 'LOGOUT' });
    return { text: res.action_logout, actions: [], effects };
  }
  if (checkIntent(text, KEYWORDS.openStore)) {
    effects.push({ type: 'OPEN_STORE' });
    return { text: res.action_openStore, actions: [], effects };
  }
  if (checkIntent(text, KEYWORDS.editName)) {
    effects.push({ type: 'EDIT_STORE_NAME' });
    return { text: res.action_editName, actions: [], effects };
  }

  // --- MODO ASSISTENTE / CONSULTOR ---
  if (checkIntent(text, KEYWORDS.tips)) {
    return { text: getRandom(res.tips), actions: [], effects: [] };
  }

  // --- NAVEGAÇÃO INTELIGENTE (Location Aware) ---
  const handleNav = (targetRoute: string, textResponse: string): AiResult => {
    if (currentPath.includes(targetRoute) && targetRoute !== '/admin') {
      return { text: res.already_here, actions: [], effects: [] };
    }
    effects.push({ type: 'NAVIGATE', payload: targetRoute });
    return { text: textResponse, actions: [], effects };
  };

  if (checkIntent(text, KEYWORDS.whatsapp) || checkIntent(text, KEYWORDS.domain)) return handleNav('/admin/configuracoes', res.action_whatsapp);
  if (checkIntent(text, KEYWORDS.product)) return handleNav('/admin/produtos', res.action_product);
  if (checkIntent(text, KEYWORDS.page)) return handleNav('/admin/paginas', res.action_page);
  if (checkIntent(text, KEYWORDS.orders)) return handleNav('/admin/encomendas', res.action_orders);
  if (checkIntent(text, KEYWORDS.analytics)) return handleNav('/admin/estatisticas', res.action_analytics);
  if (checkIntent(text, KEYWORDS.settings) || checkIntent(text, KEYWORDS.shipping)) return handleNav('/admin/configuracoes', checkIntent(text, KEYWORDS.shipping) ? res.action_shipping : res.action_settings);

  // --- CLARIFICAÇÃO ---
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= 2) {
    return { text: getRandom(res.clarify), actions: [], effects: [], expectsClarification: true };
  }

  // --- FALLBACK ---
  const cleanPhone = MOZ_SUPPORT_PHONE.replace('+', '');
  return {
    text: getRandom(res.unknown),
    actions: [
      { label: systemLang === 'pt' ? "Falar no WhatsApp" : "WhatsApp Support", route: `https://wa.me/${cleanPhone}`, isExternal: true },
      { label: systemLang === 'pt' ? "Abrir Definições" : "Open Settings", route: "/admin/configuracoes" }
    ],
    effects: []
  };
};