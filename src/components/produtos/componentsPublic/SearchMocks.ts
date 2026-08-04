export interface MockCategory {
  nameKey: string;
  searchQuery: string;
  emoji: string;
  color: string;
  slug: string;
  keywords: string[];
}

export const MOCK_GLOBAL_CATEGORIES: MockCategory[] = [
  { nameKey: "cat_tech", searchQuery: "electronics", emoji: "💻", color: "from-blue-600 to-indigo-950 bg-gradient-to-br", slug: "electronics", keywords: ["celular", "computador", "fone", "carregador", "smartwatch", "iphone", "gadgets", "tech", "laptop", "phone", "computer", "headphones", "charger", "screen", "teclado", "keyboard", "mouse"] },
  { nameKey: "cat_fashion", searchQuery: "clothing", emoji: "👕", color: "from-pink-600 to-purple-950 bg-gradient-to-br", slug: "clothing", keywords: ["camisa", "calça", "vestido", "sapatilha", "casaco", "roupa", "tshirt", "jeans", "moda", "shirt", "pants", "dress", "shoes", "jacket", "coat", "hoodie", "skirt", "saia", "blusa"] },
  { nameKey: "cat_grocery", searchQuery: "groceries", emoji: "🍔", color: "from-amber-500 to-red-900 bg-gradient-to-br", slug: "groceries", keywords: ["bebida", "snack", "chocolate", "sumo", "bolacha", "comida", "batata", "refrigerante", "lanche", "drink", "juice", "cookies", "food", "soda", "water", "água", "snack", "beer", "cerveja"] },
  { nameKey: "cat_home", searchQuery: "home", emoji: "🏠", color: "from-emerald-600 to-teal-950 bg-gradient-to-br", slug: "home", keywords: ["planta", "sofa", "almofada", "cama", "luminaria", "decoracao", "moveis", "tapete", "espelho", "plant", "couch", "pillow", "bed", "lamp", "decor", "furniture", "rug", "mirror", "mesa", "table"] },
  { nameKey: "cat_beauty", searchQuery: "beauty", emoji: "💄", color: "from-purple-500 to-rose-950 bg-gradient-to-br", slug: "beauty", keywords: ["perfume", "creme", "batom", "skincare", "champô", "maquilhagem", "sabonete", "cosmeticos", "makeup", "lipstick", "shampoo", "soap", "skin", "oil", "óleo", "fragrance", "gel"] },
  { nameKey: "cat_fitness", searchQuery: "sports", emoji: "👟", color: "from-orange-500 to-red-800 bg-gradient-to-br", slug: "sports", keywords: ["ténis", "mochila", "garrafa", "suplemento", "calções", "academia", "treino", "haltere", "sport", "sneakers", "backpack", "bottle", "shorts", "gym", "workout", "fitness", "whey", "protein"] },
  { nameKey: "cat_books", searchQuery: "books", emoji: "📚", color: "from-cyan-600 to-blue-950 bg-gradient-to-br", slug: "books", keywords: ["livro", "agenda", "caneta", "caderno", "romance", "papelaria", "leitura", "hq", "manga", "book", "notebook", "pen", "pencil", "lápis", "novel", "comic", "read"] },
  { nameKey: "cat_accessories", searchQuery: "accessories", emoji: "🕶️", color: "from-zinc-700 to-slate-950 bg-gradient-to-br", slug: "accessories", keywords: ["oculos", "relogio", "anel", "carteira", "colar", "brinco", "boné", "cinto", "pulseira", "glasses", "watch", "ring", "wallet", "necklace", "earrings", "cap", "belt", "hat", "bag", "mala"] },
  { nameKey: "cat_baby", searchQuery: "baby", emoji: "👶", color: "from-sky-400 to-indigo-900 bg-gradient-to-br", slug: "baby", keywords: ["fralda", "biberao", "chupeta", "brinquedo", "berço", "body", "roupa bebe", "leite", "diaper", "bottle", "pacifier", "toy", "crib", "baby clothing", "milk", "carrinho", "stroller"] },
  { nameKey: "cat_pets", searchQuery: "pets", emoji: "🐾", color: "from-amber-600 to-stone-900 bg-gradient-to-br", slug: "pets", keywords: ["ração", "coleira", "brinquedo gato", "brinquedo cao", "petisco", "gato", "cão", "passaro", "food", "collar", "dog", "cat", "bird", "leash", "trela", "aquario", "aquarium", "shampoo pet", "caminha", "petshop", "veterinaria"] },
  { nameKey: "cat_tools", searchQuery: "tools", emoji: "🛠️", color: "from-yellow-600 to-zinc-900 bg-gradient-to-br", slug: "tools", keywords: ["martelo", "chave fenda", "parafuso", "prego", "furadeira", "alicate", "tinta", "construcao", "hammer", "screwdriver", "screw", "drill", "pliers", "paint", "construction", "diy", "bateria"] },
  { nameKey: "cat_toys", searchQuery: "toys", emoji: "🧩", color: "from-red-500 to-purple-950 bg-gradient-to-br", slug: "toys", keywords: ["boneca", "carro", "puzzle", "lego", "tabuleiro", "ursinho", "jogos", "doll", "car", "puzzle", "boardgame", "game", "plush", "peluche", "crianças", "kids"] },
  { nameKey: "cat_auto", searchQuery: "automotive", emoji: "🚘", color: "from-slate-600 to-zinc-950 bg-gradient-to-br", slug: "automotive", keywords: ["óleo motor", "pneu", "bateria carro", "filtro", "lampada", "limpeza", "acessorio carro", "car", "oil", "tire", "battery", "filter", "bulb", "cleaning", "moto", "motorcycle", "capacete", "helmet"] },
  { nameKey: "cat_design_editor", searchQuery: "design", emoji: "✨", color: "from-violet-600 to-fuchsia-950 bg-gradient-to-br", slug: "design", keywords: ["template", "ui", "ux", "componente", "mockup", "vetor", "vector", "canva", "pinterest", "font", "fonte", "icon", "icone", "textura", "texture", "layout", "preset", "graphics", "assets", "design", "wireframe"] },
  { nameKey: "cat_arts_crafts", searchQuery: "art", emoji: "🎨", color: "from-rose-500 to-amber-950 bg-gradient-to-br", slug: "art", keywords: ["quadro", "pintura", "tela", "arte", "desenho", "pincel", "acrilico", "art", "painting", "canvas", "frame", "drawing", "poster", "ilustracao", "illustration", "aguarela", "watercolor", "ink", "tinta", "galeria", "gallery"] },
  { nameKey: "cat_digital_3d", searchQuery: "3d", emoji: "🔮", color: "from-indigo-500 to-cyan-950 bg-gradient-to-br", slug: "3d", keywords: ["3d", "modelo 3d", "stl", "obj", "impressao 3d", "filamento", "resina", "render", "blender", "miniatura", "sculpture", "esculpido", "3d model", "3d print", "filament", "resin", "cad", "mesh", "malha"] },
  { nameKey: "cat_bakery", searchQuery: "bakery", emoji: "🍰", color: "from-pink-500 to-rose-900 bg-gradient-to-br", slug: "bakery", keywords: ["bolo", "doce", "sobremesa", "festa", "salgado", "torta", "cake", "sweet", "dessert", "party", "cupcake", "brigadeiro", "casamento"] }
];

/**
 * 2. HIERARQUIA DE REGRAS (Short-Circuit)
 * A ordem aqui é vital! Assim que o código encontra a primeira correspondência, ELE PARA.
 * Isso garante que "Saia Jeans" se torne apenas "Saias", ignorando o "Jeans".
 */
const REGEX_RULES = [
  // --- 1. VESTUÁRIO (Prioridade Máxima para peças exatas) ---
  { label: { pt: "Vestidos & Macacões", en: "Dresses & Jumpsuits" }, regex: /\b(vestido|vestidos|dress|dresses|macacao|macacoes|jumpsuit|jumpsuits)\b/i },
  { label: { pt: "Casacos & Frio", en: "Jackets & Outerwear" }, regex: /\b(casaco|casacos|jaqueta|jaquetas|hoodie|hoodies|moletom|moletons|sweater|sweaters|pullover|coat|coats|camisola|camisolas)\b/i },
  { label: { pt: "Bodies & Íntima", en: "Bodysuits & Intimates" }, regex: /\b(body|bodies|bodysuit|collant|lingerie|cueca|sutia|bra|underwear)\b/i },
  { label: { pt: "Saias", en: "Skirts" }, regex: /\b(saia|saias|skirt|skirts)\b/i },
  { label: { pt: "Calções", en: "Shorts" }, regex: /\b(bermuda|bermudas|calcao|calcoes|shorts)\b/i },
  { label: { pt: "Calças", en: "Pants & Trousers" }, regex: /\b(calca|calcas|pants|trousers|legging|leggings)\b/i },
  { label: { pt: "Camisas & Tops", en: "Shirts & Tops" }, regex: /\b(camisa|camisas|t-?shirt|t-?shirts|shirt|shirts|blusa|blusas|blouse|blouses|top|tops|cropped|tunica)\b/i },
  
  // --- 2. CALÇADO ---
  { label: { pt: "Calçado", en: "Footwear" }, regex: /\b(calcado|calcados|sapato|sapatos|sapatilha|sapatilhas|tenis|sneaker|sneakers|shoes|sandalia|sandalias|bota|botas|boots|chinelo|chinelos|flip-?flops)\b/i },
  
  // --- 3. ALIMENTAÇÃO (Do mais preciso para o mais geral) ---
  { label: { pt: "Bolos & Tortas", en: "Cakes & Pies" }, regex: /\b(bolo|bolos|cake|cakes|torta|tortas|pie|pies|cheesecake)\b/i },
  { label: { pt: "Salgados & Snacks", en: "Snacks & Savory" }, regex: /\b(salgado|salgados|coxinha|coxinhas|rissol|rissois|pastel|pasteis|chamuca|chamucas|empada|empadas|snack|snacks|chips|salgadinho|salgadinhos|pizza|burger|hamburguer|sanduiche|sandwich)\b/i },
  { label: { pt: "Bebidas", en: "Beverages" }, regex: /\b(bebida|bebidas|drink|drinks|sumo|sumos|suco|sucos|juice|juices|refrigerante|refrigerantes|soda|sodas|agua|water|cerveja|beer|beers|vinho|wine)\b/i },
  { label: { pt: "Frescos & Mercearia", en: "Fresh & Groceries" }, regex: /\b(comida|food|carne|meat|fruta|frutas|fruit|fruits|legume|legumes|vegetable|vegetables|arroz|rice|massa|pasta)\b/i },
  { label: { pt: "Doces & Sobremesas", en: "Sweets & Desserts" }, regex: /\b(doce|doces|sobremesa|sobremesas|sweet|sweets|dessert|desserts|brigadeiro|brigadeiros|cupcake|cupcakes|bolacha|bolachas|cookie|cookies|biscoito|biscoitos|brownie|brownies|chocolate|chocolates|candy|muffin|muffins)\b/i },
  
  // --- 4. TECNOLOGIA & BELEZA ---
  { label: { pt: "Smartphones & PCs", en: "Smartphones & PCs" }, regex: /\b(celular|celulares|smartphone|smartphones|phone|phones|telemovel|telemoveis|computador|computadores|pc|computer|computers|laptop|laptops|notebook|notebooks|macbook)\b/i },
  { label: { pt: "Acessórios Tech", en: "Tech Accessories" }, regex: /\b(fone|fones|headphone|headphones|earbud|earbuds|carregador|carregadores|charger|chargers|smartwatch|teclado|keyboard|rato|mouse)\b/i },
  { label: { pt: "Maquilhagem", en: "Makeup" }, regex: /\b(maquiagem|maquilhagem|makeup|batom|batons|lipstick|lipsticks|rimel|mascara|base|foundation)\b/i },
  { label: { pt: "Perfumes & Cuidados", en: "Perfumes & Skincare" }, regex: /\b(perfume|perfumes|fragrancia|fragrance|fragrances|skincare|creme|cremes|cream|creams|locao|lotion|shampoo|champo|sabonete|soap|oleo|oil)\b/i },

  // --- 5. CATEGORIAS DE DIVERSOS ---
  { label: { pt: "Casamento & Festas", en: "Weddings & Parties" }, regex: /\b(festa|festas|aniversario|aniversarios|casamento|casamentos|wedding|weddings|party|parties|batizado|evento|eventos|events|bridal|noiva|noivo)\b/i },
  { label: { pt: "Desporto & Ginásio", en: "Gym & Sports" }, regex: /\b(treino|workout|academia|gym|fitness|esporte|esportes|desporto|desportos|sport|sports|haltere|dumbbell|suplemento|supplement|whey|proteina|protein)\b/i },
  { label: { pt: "Livros & Papelaria", en: "Books & Stationery" }, regex: /\b(livro|livros|book|books|romance|novel|manga|hq|comic|comics|agenda|agendas|caderno|notebook|caneta|pen|lapis|pencil|papelaria|stationery)\b/i },
  { label: { pt: "Acessórios", en: "Accessories" }, regex: /\b(oculos|glasses|sunglasses|relogio|watch|watches|anel|anel|ring|rings|colar|necklace|brinco|earring|earrings|pulseira|bracelet|carteira|wallet|bolsa|bag|mala|cinto|belt|bone|cap|hat)\b/i },
  { label: { pt: "Bebé", en: "Baby Care" }, regex: /\b(fralda|fraldas|diaper|diapers|biberao|mamadeira|bottle|chupeta|pacifier|berco|crib|carrinho|stroller)\b/i },
  { label: { pt: "Animais de Estimação", en: "Pets" }, regex: /\b(racao|pet food|coleira|collar|trela|leash|gato|gatos|cat|cats|cao|caes|cachorro|dog|dogs|passaro|bird|aquario|aquarium)\b/i },
  { label: { pt: "Ferramentas", en: "Tools" }, regex: /\b(ferramenta|ferramentas|tool|tools|martelo|hammer|chave|wrench|parafuso|screw|furadeira|berbequim|drill|alicate|pliers|tinta|paint|construcao|construction)\b/i },
  { label: { pt: "Automóvel & Moto", en: "Auto & Moto" }, regex: /\b(carro|car|moto|motorcycle|pneu|pneus|tire|tires|oleo motor|motor oil|bateria|battery|capacete|helmet)\b/i },
  { label: { pt: "Design & Artes", en: "Design & Arts" }, regex: /\b(template|templates|ui|ux|mockup|mockups|vetor|vector|fonte|font|icone|icon|textura|texture|layout|wireframe|pintura|painting|tela|canvas|arte|art|desenho|drawing|pincel|brush)\b/i },
  { label: { pt: "Modelos & Impressão 3D", en: "3D Models & Printing" }, regex: /\b(3d|stl|obj|impressao 3d|3d print|3d printing|filamento|filament|resina|resin|render|blender|miniatura|miniature|malha|mesh|cad)\b/i },

  // --- 6. FALLBACKS (Atributos Gerais) ---
  // Estes só vão ser chamados se NENHUMA das regras acima for ativada (ex: um produto chamado apenas "Conjunto Masculino")
  { label: { pt: "Crianças", en: "Kids" }, regex: /\b(crianca|criancas|infantil|kids|menino|meninos|menina|meninas|bebe|bebes|baby|babies|toddler|toddlers)\b/i },
  { label: { pt: "Homem", en: "Men" }, regex: /\b(homem|homens|masculino|men|mens|male|rapaz|rapazes|boy|boys)\b/i },
  { label: { pt: "Mulher", en: "Women" }, regex: /\b(mulher|mulheres|feminino|women|womens|female|senhora|senhoras|rapariga|raparigas|girl|girls)\b/i },
  { label: { pt: "Jeans & Denim", en: "Jeans & Denim" }, regex: /\b(jeans|denim|ganga)\b/i },
  { label: { pt: "Vintage & Retro", en: "Vintage & Retro" }, regex: /\b(vintage|retro|classico|classic|antigo|anos 80|anos 90)\b/i }
];

/**
 * Remove acentos para garantir match perfeito.
 */
function removeAccents(str: string): string {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Motor de Inteligência Absoluta com Extração Única ("Se já pertence a uma, termina aí")
 */
export function enrichProductsWithSubcategories(products: any[], lang: "pt" | "en" = "pt") {
  if (!products || !Array.isArray(products)) return [];
  
  return products.map(product => {
    // 1. Prepara os textos separados
    const titleText = removeAccents(`${product.name || ''} ${product.category || ''}`).toLowerCase();
    const descText = removeAccents(product.description || '').toLowerCase();
    
    const tags = new Set<string>();
    
    // Se o produto já traz categoria raiz da Base de Dados, guardamos.
    if (product.category) {
      tags.add(product.category);
    }

    // 2. SISTEMA SHORT-CIRCUIT: Encontra 1 única Categoria Primária AI
    let foundMainCategory = false;

    // Função que avalia e PARA imediatamente na primeira correspondência
    const extractSingleCategory = (text: string) => {
      if (!text || foundMainCategory) return;
      for (const rule of REGEX_RULES) {
        if (rule.regex.test(text)) {
          tags.add(lang === "en" ? rule.label.en : rule.label.pt);
          foundMainCategory = true;
          break; // O SEGREDO: Interrompe o loop! Saias vencem Jeans instantaneamente.
        }
      }
    };

    // Damos prioridade MÁXIMA ao Título. Se achou lá, ignora a Descrição para não poluir tags.
    extractSingleCategory(titleText);
    
    // Se o Título for muito vago (ex: "Especial de Natal"), tenta ler a Descrição
    extractSingleCategory(descText);

    // 3. EXTRAÇÃO DE TAMANHOS (Corre sempre, pois tamanhos são filtros extra, não conflitam)
    const fullText = `${titleText} ${descText}`;
    const sizeRegex = /\b(?:tamanho|tam|size)\s*[:=]?\s*(pp|p|m|g|gg|xg|xs|s|l|xl|xxl|xxxl|[3-5][0-9])\b/gi;
    let match;
    while ((match = sizeRegex.exec(fullText)) !== null) {
      const extractedSize = match[1].toUpperCase();
      tags.add(lang === "en" ? `Size: ${extractedSize}` : `Tam: ${extractedSize}`);
    }

    if (/\b(plus size|tamanho grande)\b/i.test(fullText)) {
      tags.add(lang === "en" ? "Plus Size" : "Tamanhos Grandes");
    }
    if (/\b(tamanho unico|one size)\b/i.test(fullText)) {
      tags.add(lang === "en" ? "One Size" : "Tamanho Único");
    }

    return { 
      ...product, 
      displayTags: Array.from(tags) 
    };
  });
}