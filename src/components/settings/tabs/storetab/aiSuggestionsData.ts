import { getUserCountry } from "../../../../utils/mzn";

interface SloganContext {
  currentInput: string;
  savedText: string;
  prompt: string;
  isPt: boolean;
}

const TYPO_CORRECTOR: Record<string, { term: string; gender: 'f' | 'm' }> = {
  'tshit': { term: 'T-shirt', gender: 'f' },
  'tshir': { term: 'T-shirt', gender: 'f' },
  'tshirts': { term: 'T-shirts', gender: 'f' },
  'shos': { term: 'Shoes', gender: 'm' },
  'shoes': { term: 'Shoes', gender: 'm' },
  'cloting': { term: 'Clothing', gender: 'f' },
  'clothing': { term: 'Clothing', gender: 'f' },
  'fashon': { term: 'Fashion', gender: 'f' },
  'roupas': { term: 'Roupas', gender: 'f' },
  'bolsa': { term: 'Bolsa', gender: 'f' },
  'bolss': { term: 'Bolsa', gender: 'f' },
  'vestidos': { term: 'Vestidos', gender: 'm' },
  'hamburguer': { term: 'Hambúrguer', gender: 'm' },
  'burger': { term: 'Hambúrguer', gender: 'm' },
  'burgers': { term: 'Hambúrgueres', gender: 'm' },
  'piza': { term: 'Pizza', gender: 'f' },
  'pizzas': { term: 'Pizzas', gender: 'f' },
  'bolos': { term: 'Bolos', gender: 'm' },
  'bollo': { term: 'Bolo', gender: 'm' },
  'doce': { term: 'Doces', gender: 'm' },
  'doces': { term: 'Doces', gender: 'm' },
  'restaurante': { term: 'Restaurante', gender: 'm' },
  'cafe': { term: 'Café', gender: 'm' },
  'gourmet': { term: 'Gourmet', gender: 'm' },
  'tech': { term: 'Tecnologia', gender: 'f' },
  'tecnologia': { term: 'Tecnologia', gender: 'f' },
  'celular': { term: 'Celular', gender: 'm' },
  'celulares': { term: 'Celulares', gender: 'm' },
  'fone': { term: 'Fones', gender: 'm' },
  'fones': { term: 'Fones', gender: 'm' },
  'airpod': { term: 'AirPods', gender: 'm' },
  'airpods': { term: 'AirPods', gender: 'm' },
  'iphone': { term: 'iPhone', gender: 'm' },
  'iphones': { term: 'iPhones', gender: 'm' },
  'gadget': { term: 'Gadget', gender: 'm' },
  'gadgets': { term: 'Gadgets', gender: 'm' },
  'mocambique': { term: 'Moçambique', gender: 'm' },
  'maputo': { term: 'Maputo', gender: 'm' },
  'matola': { term: 'Matola', gender: 'f' },
  'luanda': { term: 'Luanda', gender: 'f' },
  'lisboa': { term: 'Lisboa', gender: 'f' },
  'promocao': { term: 'Promoção', gender: 'f' },
  'promocoes': { term: 'Promoções', gender: 'f' }
};

function normalizeTextForMatching(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,\/#!$%\^&;:{}=\-_`~()?"'’]/g, " ")
    .trim();
}

// MATRIZ FRAGMENTADA DE ALTA DENSIDADE (Vocabulário expandido em 400%)
const LINGUISTIC_GRAINS = {
  pt: {
    prefixes: [
      'Sente o poder de', 'Explora o universo de', 'A revolução de', 'Estilo autêntico em', 
      'A arte de reinventar', 'O segredo de', 'Coleção premium de', 'Tudo o que procuras em',
      'Redefine o teu conceito de', 'A tua dose diária de', 'Inspiração e paixão por', 'A melhor curadoria de'
    ],
    adjectives: {
      f: ['exclusiva', 'premium', 'sofisticada', 'luxuosa', 'imbatível', 'singular', 'revolucionária', 'irresistível', 'sofisticada', 'elegante', 'moderna', 'perfeita', 'autêntica', 'fresca', 'artesanal', 'limitada'],
      m: ['exclusivo', 'premium', 'sofisticado', 'luxuoso', 'imbatível', 'singular', 'revolucionário', 'irresistível', 'sofisticado', 'elegante', 'moderno', 'perfeito', 'autêntico', 'fresco', 'artesanal', 'limitado']
    },
    suffixes: [
      (g: string) => `agora disponível em ${g}.`,
      (g: string) => `que conquista ${g}.`,
      (g: string) => `desenhado especialmente para ${g}.`,
      (_: string) => `feito para quem exige o melhor.`,
      (_: string) => `em cada pequeno detalhe.`,
      (_: string) => `com entrega rápida e segura.`,
      (g: string) => `— a tua referência em ${g}.`,
      (_: string) => `que transforma a tua rotina.`
    ],
    nicheHooks: [
      { keys: ['roupa', 'moda', 'fashion', 'boutique', 'sapatos', 'looks', 'vestuario', 'tshirt', 'tshit', 'estilo'], tag: 'fashion', gender: 'f' as const, phrases: ['Veste a tua essência.', 'Tendências que definem o teu caminhar.', 'O teu estilo, a tua identidade.'] },
      { keys: ['bolos', 'doces', 'confeitaria', 'pastelaria', 'hamburguer', 'burger', 'pizza', 'restaurante', 'cafe', 'comida', 'sabor'], tag: 'food', gender: 'm' as const, phrases: ['Sabores que contam histórias.', 'O verdadeiro sabor artesanal e fresco.', 'Uma explosão irresistível de sabor.'] },
      { keys: ['iphones', 'celulares', 'tech', 'tecnologia', 'smartphones', 'gadgets', 'computadores'], tag: 'tech', gender: 'f' as const, phrases: ['O futuro conectado nas tuas mãos.', 'Inovação que simplifica o teu dia.', 'Alta performance digital sem limites.'] },
      { keys: ['beleza', 'salao', 'estetica', 'cosmeticos', 'maquilhagem', 'cabelo'], tag: 'beauty', gender: 'f' as const, phrases: ['Realça a tua beleza única.', 'O cuidado que a tua pele merece.', 'Brilha com luz própria todos os dias.'] }
    ]
  },
  en: {
    prefixes: [
      'Experience the magic of', 'Discover elite', 'The ultimate spot for', 'Redefine your lifestyle with',
      'The true essence of', 'Unveiling premium', 'Your daily dose of', 'Where quality meets',
      'Elevate your passion for', 'Next-level items for', 'The absolute finest in', 'Unmatched quality for'
    ],
    adjectives: {
      f: ['exclusive', 'premium', 'sophisticated', 'luxury', 'unbeatable', 'singular', 'revolutionary', 'irresistible', 'elegant', 'modern', 'perfect', 'authentic', 'fresh', 'artisanal', 'limited', 'elite'],
      m: ['exclusive', 'premium', 'sophisticated', 'luxury', 'unbeatable', 'singular', 'revolutionary', 'irresistible', 'elegant', 'modern', 'perfect', 'authentic', 'fresh', 'artisanal', 'limited', 'elite']
    },
    suffixes: [
      (g: string) => `now arriving in ${g}.`,
      (g: string) => `crafted specifically for ${g}.`,
      (_: string) => `built for those who demand excellence.`,
      (_: string) => `in every single beautiful detail.`,
      (_: string) => `with secure and fast shipping worldwide.`,
      (g: string) => `— your absolute favorite spot in ${g}.`,
      (_: string) => `that gracefully updates your daily routine.`
    ],
    nicheHooks: [
      { keys: ['clothing', 'fashion', 'apparel', 'boutique', 'shoes', 'looks', 'tshirt', 'style'], tag: 'fashion', gender: 'f' as const, phrases: ['Wear your unique identity proudly.', 'Trends that echo your confidence.', 'Your personal style statement.'] },
      { keys: ['cakes', 'sweets', 'bakery', 'burger', 'pizza', 'restaurant', 'cafe', 'food', 'taste'], tag: 'food', gender: 'm' as const, phrases: ['Flavors that craft unique memories.', 'The true authentic taste of fresh gourmet.', 'An unexpected explosion of pure joy.'] },
      { keys: ['iphones', 'phones', 'tech', 'technology', 'smartphones', 'gadgets', 'computers'], tag: 'tech', gender: 'f' as const, phrases: ['The future seamlessly connected in your hands.', 'Innovation simplifying your routine.', 'High-end performance without boundaries.'] }
    ]
  }
};

const COUNTRY_NAME_MAP: Record<string, { pt: string; en: string }> = {
  MZ: { pt: 'Moçambique', en: 'Mozambique' },
  AO: { pt: 'Angola', en: 'Angola' },
  PT: { pt: 'Portugal', en: 'Portugal' },
  BR: { pt: 'Brasil', en: 'Brazil' },
  ZA: { pt: 'África do Sul', en: 'South Africa' },
  ZW: { pt: 'Zimbabwe', en: 'Zimbabwe' },
  IN: { pt: 'Índia', en: 'India' },
  US: { pt: 'EUA', en: 'USA' },
  GB: { pt: 'Reino Unido', en: 'UK' },
  CA: { pt: 'Canadá', en: 'Canada' },
  MX: { pt: 'México', en: 'Mexico' },
  AU: { pt: 'Austrália', en: 'Australia' }
};

const STOP_WORDS_SET = new Set([
  'para', 'com', 'uma', 'loja', 'shop', 'store', 'sobre', 'como', 'mais', 'quero', 'algo', 'faz', 'criar', 'um', 'o', 'a', 'os', 'as',
  'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas', 'por', 'fazer', 'gerar', 'slogan', 'frase', 'texto', 'foca', 'focar',
  'with', 'make', 'about', 'create', 'brand', 'marca', 'the', 'a', 'an', 'and', 'but', 'or', 'at', 'by', 'for', 'from', 'in', 'on', 'to'
]);

export async function generateRaciocinatedSlogan({ currentInput, savedText, prompt, isPt }: SloganContext): Promise<string> {
  const limit = 60;
  const lang = isPt ? 'pt' : 'en';
  const grains = LINGUISTIC_GRAINS[lang];

  try {
    const countryCode = getUserCountry()?.toUpperCase() || 'MZ';
    const detectedCountry = COUNTRY_NAME_MAP[countryCode] ? COUNTRY_NAME_MAP[countryCode][lang] : countryCode;

    const cleanPrompt = prompt.trim();
    const fullContextText = `${cleanPrompt} ${currentInput.trim()} ${savedText.trim()}`;
    const contextLowerNormalized = normalizeTextForMatching(fullContextText);
    const tokens = contextLowerNormalized.split(/\s+/).filter(w => w.length > 1);

    // 1. Deteção Cruzada de Nicho
    let detectedGender: 'f' | 'm' = 'm';
    let nichePhrases: string[] = [];

    for (const niche of grains.nicheHooks) {
      if (niche.keys.some(k => contextLowerNormalized.includes(k))) {
        detectedGender = niche.gender;
        nichePhrases = niche.phrases;
        break;
      }
    }

    // 2. Extração e Autocorreção Ortográfica do Sujeito Central
    let subject = '';
    const validTokens = tokens.filter(w => !STOP_WORDS_SET.has(w));
    
    if (validTokens.length > 0) {
      const cleanPromptTokens = normalizeTextForMatching(cleanPrompt).split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS_SET.has(w));
      const rawSubject = cleanPromptTokens.length > 0 ? cleanPromptTokens[0] : validTokens[0];
      
      if (TYPO_CORRECTOR[rawSubject]) {
        subject = TYPO_CORRECTOR[rawSubject].term;
        detectedGender = TYPO_CORRECTOR[rawSubject].gender;
      } else {
        subject = rawSubject;
      }
    } else {
      subject = isPt ? 'o teu negócio' : 'your business';
    }

    if (!['T-shirt', 'T-shirts', 'AirPods', 'iPhone', 'iPhones'].includes(subject)) {
      subject = subject.charAt(0).toUpperCase() + subject.slice(1);
    }

    // 3. SELEÇÃO COMBINATÓRIA MULTIDIMENSIONAL (Garante 100% de aleatoriedade)
    const adjs = detectedGender === 'f' ? grains.adjectives.f : grains.adjectives.m;
    
    // Filtros de intenção falada do utilizador
    const isPremiumIntent = ['luxo', 'luxury', 'elegante', 'chic', 'premium', 'sofisticado', 'fino', 'exclusive', 'exclusivo'].some(w => contextLowerNormalized.includes(w));
    const isSalesIntent = ['venda', 'promocao', 'desconto', 'urgente', 'agressivo', 'sale', 'cheap', 'comprar', 'offers', 'liquidacao'].some(w => contextLowerNormalized.includes(w));

    let selectedAdj = adjs[Math.floor(Math.random() * adjs.length)];
    if (isPremiumIntent && isPt) selectedAdj = detectedGender === 'f' ? 'sofisticada' : 'sofisticado';
    if (isSalesIntent && isPt) selectedAdj = detectedGender === 'f' ? 'imbatível' : 'imbatível';

    const randomPrefix = grains.prefixes[Math.floor(Math.random() * grains.prefixes.length)];
    const randomSuffix = grains.suffixes[Math.floor(Math.random() * grains.suffixes.length)](detectedCountry);

    // Constrói um lote de estruturas sintáticas completamente variadas
    const creativePool: string[] = [
      `${subject} ${selectedAdj} — ${randomSuffix}`,
      `${randomPrefix} ${subject} ${selectedAdj}.`,
      `${subject} de qualidade ${selectedAdj} em ${detectedCountry}.`,
      `O teu destino definitivo para encontrar ${subject} ${selectedAdj}.`,
      `Inovação, paixão e estilo com ${subject} ${selectedAdj}.`
    ];

    // Se o nicho tiver frases poéticas específicas, injeta-as no sorteio
    if (nichePhrases.length > 0) {
      creativePool.push(nichePhrases[Math.floor(Math.random() * nichePhrases.length)]);
    }

    // Permite aceitar o próprio prompt se ele já for uma frase final curta e limpa
    if (cleanPrompt.length > 12 && cleanPrompt.length <= limit && !['fazer', 'criar', 'gerar', 'slogan', 'texto'].some(w => contextLowerNormalized.includes(w))) {
      creativePool.unshift(cleanPrompt);
    }

    // 4. FILTRAGEM CIRÚRGICA DE CARACTERES
    const safeOptions = creativePool
      .map(str => str.replace(/\s\s+/g, ' ').trim())
      .filter(str => str.length > 10 && str.length <= limit);

    if (safeOptions.length > 0) {
      // Baralha o array final de opções válidas para quebrar qualquer padrão
      safeOptions.sort(() => Math.random() - 0.5);
      return safeOptions[0];
    }

    return isPt 
      ? `${subject} ${selectedAdj} em ${detectedCountry} feito para ti.`.slice(0, limit)
      : `Premium ${subject} now available in ${detectedCountry}.`.slice(0, limit);

  } catch {
    return isPt ? 'Qualidade premium em cada detalhe.' : 'Premium quality in every single detail.';
  }
}