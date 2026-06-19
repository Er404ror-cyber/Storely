export interface CategoryStyle {
    id: string;
    emoji: string;
    color: string;
  }
  
  export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
    tecnologia: { id: "tech", emoji: "💻", color: "from-blue-600 to-cyan-500" },
    moda: { id: "fashion", emoji: "👗", color: "from-pink-500 to-rose-500" },
    beleza: { id: "beauty", emoji: "✨", color: "from-fuchsia-500 to-purple-600" },
    desporto: { id: "sports", emoji: "🏃", color: "from-orange-500 to-red-600" },
    casa: { id: "home", emoji: "🛋️", color: "from-emerald-500 to-teal-600" },
    comida: { id: "food", emoji: "🍔", color: "from-amber-400 to-orange-500" },
    geral: { id: "general", emoji: "📦", color: "from-slate-600 to-zinc-800" },
  };
  
  // Dicionário de IA (Multilingue e Erros Comuns)
 export const CATEGORY_SYNONYMS: Record<string, string[]> = {
    tecnologia: ["tech", "tecnologia", "eletron", "pc", "computador", "celular", "smartphone", "electronics", "phone"],
    moda: ["moda", "fashion", "roupa", "clothes", "vestuario", "sapat", "shoes", "tshirt", "camisa"],
    beleza: ["beleza", "beauty", "perfume", "makeup", "maquilhagem", "creme", "skincare", "cabelo", "hair"],
    desporto: ["desporto", "sports", "fitnes", "ginasio", "gym", "treino", "workout", "bola"],
    casa: ["casa", "home", "movei", "furniture", "decor", "cozinha", "quarto", "sala", "jardim"],
    comida: ["comida", "food", "snack", "restaurante", "refeicao", "bebida", "drink", "doce", "sweet", "lanche", "eat"],
  };
  
  export function normalizeCategory(cat: string): string {
    if (!cat) return "";
    let n = cat.toLowerCase().trim();
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
  
    const colors = Object.values(CATEGORY_STYLES);
    const hash = normalized.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }