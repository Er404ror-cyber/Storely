export interface CategoryStyle {
  id: string;
  emoji: string;
  color: string;
}

export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  tecnologia: { id: "tech", emoji: "💻", color: "from-blue-600 to-indigo-950" },
  moda: { id: "fashion", emoji: "👕", color: "from-pink-600 to-purple-950" },
  beleza: { id: "beauty", emoji: "💄", color: "from-purple-500 to-rose-950" },
  desporto: { id: "sports", emoji: "👟", color: "from-orange-500 to-red-800" },
  casa: { id: "home", emoji: "🪴", color: "from-emerald-600 to-teal-950" },
  comida: { id: "food", emoji: "🍔", color: "from-amber-500 to-red-900" },
  livros: { id: "books", emoji: "📚", color: "from-cyan-600 to-blue-950" },
  acessorios: { id: "accessories", emoji: "🕶️", color: "from-zinc-700 to-slate-950" },
  bebes: { id: "baby", emoji: "👶", color: "from-sky-400 to-indigo-900" },
  animais: { id: "pets", emoji: "🐾", color: "from-amber-600 to-stone-900" },
  ferramentas: { id: "tools", emoji: "🛠️", color: "from-yellow-600 to-zinc-900" },
  brinquedos: { id: "toys", emoji: "🧩", color: "from-red-500 to-purple-950" },
  automovel: { id: "auto", emoji: "🚘", color: "from-slate-600 to-zinc-950" },
  geral: { id: "general", emoji: "✨", color: "from-zinc-700 to-zinc-900" },
};

// Dicionário de IA (Multilingue e Erros Comuns expandido)
export const CATEGORY_SYNONYMS: Record<string, string[]> = {
  tecnologia: ["tech", "tecnologia", "eletron", "pc", "computador", "celular", "smartphone", "electronics", "phone", "iphone", "gadget", "informatica"],
  moda: ["moda", "fashion", "roupa", "clothes", "vestuario", "sapat", "shoes", "tshirt", "camisa", "calca", "vestido", "tenis"],
  beleza: ["beleza", "beauty", "perfume", "makeup", "maquilhagem", "maquiagem", "creme", "skincare", "cabelo", "hair", "cosmetico", "salao"],
  desporto: ["desporto", "esporte", "sports", "fitnes", "ginasio", "gym", "treino", "workout", "bola", "suplemento", "whey"],
  casa: ["casa", "lar", "home", "movei", "furniture", "decor", "cozinha", "quarto", "sala", "jardim", "planta"],
  comida: ["comida", "food", "snack", "restaurante", "refeicao", "bebida", "drink", "doce", "sweet", "lanche", "eat", "alimento", "mercearia", "supermercado", "bolo"],
  livros: ["livro", "papelaria", "escola", "estudo", "cultura", "leitura", "caderno", "book"],
  acessorios: ["acessorio", "joia", "relogio", "anel", "oculos", "pulseira"],
  bebes: ["bebe", "infantil", "crianca", "kids"],
  animais: ["pet", "animal", "cao", "gato", "racao", "veterinaria"],
  ferramentas: ["ferramenta", "construcao", "bricolage", "obra", "material"],
  brinquedos: ["brinquedo", "jogo", "peluche", "puzzle"],
  automovel: ["auto", "carro", "veiculo", "motor", "moto", "peca", "oficina"],
};

export function normalizeCategory(cat: string): string {
  if (!cat) return "";
  // Normaliza o texto: minúsculas e remove acentos
  let n = cat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  if (n.endsWith('s') && n.length > 3) n = n.slice(0, -1);
  return n;
}

// Retorna sinónimos baseados no termo de pesquisa
export function getSmartSynonyms(searchTerm: string): string[] {
  const norm = normalizeCategory(searchTerm);
  const matchedSynonyms = new Set<string>([norm]); // Inclui a própria palavra

  for (const [mainCat, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
    if (synonyms.some(s => s.includes(norm) || norm.includes(s))) {
      synonyms.forEach(s => matchedSynonyms.add(s));
      matchedSynonyms.add(mainCat);
    }
  }
  return Array.from(matchedSynonyms);
}

export function getCategoryStyle(categoryName: string): CategoryStyle {
  if (!categoryName) return CATEGORY_STYLES.geral;
  const normalized = normalizeCategory(categoryName);
  
  for (const [catKey, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
    if (synonyms.some(s => normalized.includes(s))) {
      return CATEGORY_STYLES[catKey as keyof typeof CATEGORY_STYLES];
    }
  }

  // Se não encontrar, atribui uma cor consistente baseada no nome, mas usa um emoji neutro elegante
  const colors = Object.values(CATEGORY_STYLES);
  const hash = normalized.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  return {
    id: `custom-${hash}`,
    emoji: "✨",
    color: colors[hash % colors.length].color
  };
}