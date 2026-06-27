export interface MockCategory {
  nameKey: string;     // Chave para a UI (Traduzida dinamicamente)
  searchQuery: string; // O termo real enviado para a busca (Sempre em Inglês)
  emoji: string;
  color: string;
  slug: string;
  keywords: string[];  // Sinónimos e termos bilingues (PT e EN) que o utilizador costuma digitar
}

export const MOCK_GLOBAL_CATEGORIES: MockCategory[] = [
  { 
    nameKey: "cat_tech", 
    searchQuery: "electronics", 
    emoji: "💻", 
    color: "from-blue-600 to-indigo-950 bg-gradient-to-br",
    slug: "electronics",
    keywords: ["celular", "computador", "fone", "carregador", "smartwatch", "iphone", "gadgets", "tech", "laptop", "phone", "computer", "headphones", "charger", "screen", "teclado", "keyboard", "mouse"]
  },
  { 
    nameKey: "cat_fashion", 
    searchQuery: "clothing", 
    emoji: "👕", 
    color: "from-pink-600 to-purple-950 bg-gradient-to-br",
    slug: "clothing",
    keywords: ["camisa", "calça", "vestido", "sapatilha", "casaco", "roupa", "tshirt", "jeans", "moda", "shirt", "pants", "dress", "shoes", "jacket", "coat", "hoodie", "skirt", "saia", "blusa"]
  },
  { 
    nameKey: "cat_grocery", 
    searchQuery: "groceries", 
    emoji: "🍔", 
    color: "from-amber-500 to-red-900 bg-gradient-to-br",
    slug: "groceries",
    keywords: ["bebida", "snack", "chocolate", "sumo", "bolacha", "comida", "batata", "refrigerante", "lanche", "drink", "juice", "cookies", "food", "soda", "water", "água", "snack", "beer", "cerveja"]
  },
  { 
    nameKey: "cat_home", 
    searchQuery: "home", 
    emoji: "🏠", 
    color: "from-emerald-600 to-teal-950 bg-gradient-to-br",
    slug: "home",
    keywords: ["planta", "sofa", "almofada", "cama", "luminaria", "decoracao", "moveis", "tapete", "espelho", "plant", "couch", "pillow", "bed", "lamp", "decor", "furniture", "rug", "mirror", "mesa", "table"]
  },
  { 
    nameKey: "cat_beauty", 
    searchQuery: "beauty", 
    emoji: "💄", 
    color: "from-purple-500 to-rose-950 bg-gradient-to-br",
    slug: "beauty",
    keywords: ["perfume", "creme", "batom", "skincare", "champô", "maquilhagem", "sabonete", "cosmeticos", "makeup", "lipstick", "shampoo", "soap", "skin", "oil", "óleo", "fragrance", "gel"]
  },
  { 
    nameKey: "cat_fitness", 
    searchQuery: "sports", 
    emoji: "👟", 
    color: "from-orange-500 to-red-800 bg-gradient-to-br",
    slug: "sports",
    keywords: ["ténis", "mochila", "garrafa", "suplemento", "calções", "academia", "treino", "haltere", "sport", "sneakers", "backpack", "bottle", "shorts", "gym", "workout", "fitness", "whey", "protein"]
  },
  { 
    nameKey: "cat_books", 
    searchQuery: "books", 
    emoji: "📚", 
    color: "from-cyan-600 to-blue-950 bg-gradient-to-br",
    slug: "books",
    keywords: ["livro", "agenda", "caneta", "caderno", "romance", "papelaria", "leitura", "hq", "manga", "book", "notebook", "pen", "pencil", "lápis", "novel", "comic", "read"]
  },
  { 
    nameKey: "cat_accessories", 
    searchQuery: "accessories", 
    emoji: "🕶️", 
    color: "from-zinc-700 to-slate-950 bg-gradient-to-br",
    slug: "accessories",
    keywords: ["oculos", "relogio", "anel", "carteira", "colar", "brinco", "boné", "cinto", "pulseira", "glasses", "watch", "ring", "wallet", "necklace", "earrings", "cap", "belt", "hat", "bag", "mala"]
  },
  {
    nameKey: "cat_baby",
    searchQuery: "baby",
    emoji: "👶",
    color: "from-sky-400 to-indigo-900 bg-gradient-to-br",
    slug: "baby",
    keywords: ["fralda", "biberao", "chupeta", "brinquedo", "berço", "body", "roupa bebe", "leite", "diaper", "bottle", "pacifier", "toy", "crib", "baby clothing", "milk", "carrinho", "stroller"]
  },
  {
    nameKey: "cat_pets",
    searchQuery: "pets",
    emoji: "🐾",
    color: "from-amber-600 to-stone-900 bg-gradient-to-br",
    slug: "pets",
    keywords: ["ração", "coleira", "brinquedo gato", "brinquedo cao", "petisco", "gato", "cão", "passaro", "food", "collar", "dog", "cat", "bird", "leash", "trela", "aquario", "aquarium", "shampoo pet", "caminha", "petshop", "veterinaria"]
  },
  {
    nameKey: "cat_tools",
    searchQuery: "tools",
    emoji: "🛠️",
    color: "from-yellow-600 to-zinc-900 bg-gradient-to-br",
    slug: "tools",
    keywords: ["martelo", "chave fenda", "parafuso", "prego", "furadeira", "alicate", "tinta", "construcao", "hammer", "screwdriver", "screw", "drill", "pliers", "paint", "construction", "diy", "bateria"]
  },
  {
    nameKey: "cat_toys",
    searchQuery: "toys",
    emoji: "🧩",
    color: "from-red-500 to-purple-950 bg-gradient-to-br",
    slug: "toys",
    keywords: ["boneca", "carro", "puzzle", "lego", "tabuleiro", "ursinho", "jogos", "doll", "car", "puzzle", "boardgame", "game", "plush", "peluche", "crianças", "kids"]
  },
  {
    nameKey: "cat_auto",
    searchQuery: "automotive",
    emoji: "🚘",
    color: "from-slate-600 to-zinc-950 bg-gradient-to-br",
    slug: "automotive",
    keywords: ["óleo motor", "pneu", "bateria carro", "filtro", "lampada", "limpeza", "acessorio carro", "car", "oil", "tire", "battery", "filter", "bulb", "cleaning", "moto", "motorcycle", "capacete", "helmet"]
  },
  {
    nameKey: "cat_design_editor",
    searchQuery: "design", // 👈 Limpo, direto e profissional na URL (/produtos/design)
    emoji: "✨",
    color: "from-violet-600 to-fuchsia-950 bg-gradient-to-br",
    slug: "design",
    keywords: ["template", "ui", "ux", "componente", "mockup", "vetor", "vector", "canva", "pinterest", "font", "fonte", "icon", "icone", "textura", "texture", "layout", "preset", "graphics", "assets", "design", "wireframe"]
  },
  {
    nameKey: "cat_arts_crafts",
    searchQuery: "art",
    emoji: "🎨",
    color: "from-rose-500 to-amber-950 bg-gradient-to-br",
    slug: "art",
    keywords: ["quadro", "pintura", "tela", "arte", "desenho", "pincel", "acrilico", "art", "painting", "canvas", "frame", "drawing", "poster", "ilustracao", "illustration", "aguarela", "watercolor", "ink", "tinta", "galeria", "gallery"]
  },
  {
    nameKey: "cat_digital_3d",
    searchQuery: "3d",
    emoji: "🔮",
    color: "from-indigo-500 to-cyan-950 bg-gradient-to-br",
    slug: "3d",
    keywords: ["3d", "modelo 3d", "stl", "obj", "impressao 3d", "filamento", "resina", "render", "blender", "miniature", "miniatura", "sculpture", "esculpido", "3d model", "3d print", "filament", "resin", "cad", "mesh", "malha"]
  }
];