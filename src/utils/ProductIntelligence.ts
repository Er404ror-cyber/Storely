import { useCallback } from "react";
import { useTranslate } from "../context/LanguageContext";

export interface MockCategory {
  nameKey: string;
  searchQuery: string;
  emoji: string;
  color: string;
  slug: string;
  keywords: string[];
}

// 1. MOCK DE CATEGORIAS GLOBAIS COMPLETO (17 CATEGORIAS)
export const MOCK_GLOBAL_CATEGORIES: MockCategory[] = [
  { nameKey: "cat_tech", searchQuery: "electronics", emoji: "💻", color: "from-blue-600 to-indigo-950 bg-gradient-to-br", slug: "electronics", keywords: ["celular", "computador", "fone", "carregador", "smartwatch", "iphone", "gadgets", "tech", "laptop", "phone", "computer", "headphones", "charger", "screen", "teclado", "keyboard", "mouse"] },
  { nameKey: "cat_fashion", searchQuery: "clothing", emoji: "👕", color: "from-pink-600 to-purple-950 bg-gradient-to-br", slug: "clothing", keywords: ["camisa", "camiseta", "calça", "vestido", "sapatilha", "casaco", "roupa", "tshirt", "t'shirt", "t’shirt", "polo", "jeans", "moda", "shirt", "pants", "dress", "shoes", "jacket", "coat", "hoodie", "skirt", "saia", "blusa", "scarpin", "scarpins", "salto", "saltos", "heels", "stiletto", "calções", "calcao", "shorts", "bermuda", "body", "bodysuit", "conjunto"] },
  { nameKey: "cat_grocery", searchQuery: "groceries", emoji: "🍔", color: "from-amber-500 to-red-900 bg-gradient-to-br", slug: "groceries", keywords: ["bebida", "snack", "chocolate", "sumo", "bolacha", "comida", "batata", "refrigerante", "lanche", "drink", "juice", "cookies", "food", "soda", "water", "água", "snack", "beer", "cerveja"] },
  { nameKey: "cat_home", searchQuery: "home", emoji: "🏠", color: "from-emerald-600 to-teal-950 bg-gradient-to-br", slug: "home", keywords: ["planta", "sofa", "almofada", "cama", "luminaria", "decoracao", "moveis", "tapete", "espelho", "plant", "couch", "pillow", "bed", "lamp", "decor", "furniture", "rug", "mirror", "mesa", "table"] },
  { nameKey: "cat_beauty", searchQuery: "beauty", emoji: "💄", color: "from-purple-500 to-rose-950 bg-gradient-to-br", slug: "beauty", keywords: ["perfume", "creme", "batom", "skincare", "champô", "maquilhagem", "sabonete", "cosmeticos", "beuty", "beauty", "beleza", "makeup", "lipstick", "shampoo", "soap", "skin", "oil", "óleo", "fragrance", "gel", "hidratante", "protetor solar"] },
  { nameKey: "cat_fitness", searchQuery: "sports", emoji: "👟", color: "from-orange-500 to-red-800 bg-gradient-to-br", slug: "sports", keywords: ["ténis", "mochila", "garrafa", "suplemento", "academia", "treino", "haltere", "sport", "sneakers", "backpack", "bottle", "gym", "workout", "fitness", "whey", "protein"] },
  { nameKey: "cat_books", searchQuery: "books", emoji: "📚", color: "from-cyan-600 to-blue-950 bg-gradient-to-br", slug: "books", keywords: ["livro", "agenda", "caneta", "caderno", "romance", "papelaria", "leitura", "hq", "manga livro", "book", "notebook", "pen", "pencil", "lápis", "novel", "comic", "read"] },
  { nameKey: "cat_accessories", searchQuery: "accessories", emoji: "🕶️", color: "from-zinc-700 to-slate-950 bg-gradient-to-br", slug: "accessories", keywords: ["oculos", "relogio", "anel", "carteira", "colar", "brinco", "boné", "cinto", "pulseira", "glasses", "watch", "ring", "wallet", "necklace", "earrings", "cap", "belt", "hat", "bag", "mala"] },
  { nameKey: "cat_baby", searchQuery: "baby", emoji: "👶", color: "from-sky-400 to-indigo-900 bg-gradient-to-br", slug: "baby", keywords: ["fralda", "biberao", "chupeta", "berço", "body bebe", "roupa bebe", "leite", "diaper", "bottle", "pacifier", "toy", "crib", "baby clothing", "milk", "carrinho", "stroller"] },
  { nameKey: "cat_pets", searchQuery: "pets", emoji: "🐾", color: "from-amber-600 to-stone-900 bg-gradient-to-br", slug: "pets", keywords: ["ração", "coleira", "brinquedo gato", "brinquedo cao", "petisco", "gato", "cão", "passaro", "food", "collar", "dog", "cat", "bird", "leash", "trela", "aquario", "aquarium", "shampoo pet", "caminha", "petshop", "veterinaria"] },
  { nameKey: "cat_tools", searchQuery: "tools", emoji: "🛠️", color: "from-yellow-600 to-zinc-900 bg-gradient-to-br", slug: "tools", keywords: ["martelo", "chave fenda", "parafuso", "prego", "furadeira", "alicate", "tinta", "construcao", "hammer", "screwdriver", "screw", "drill", "pliers", "paint", "construction", "diy", "bateria"] },
  { nameKey: "cat_toys", searchQuery: "toys", emoji: "🧩", color: "from-red-500 to-purple-950 bg-gradient-to-br", slug: "toys", keywords: ["boneca", "carro brinquedo", "puzzle", "lego", "tabuleiro", "ursinho", "jogos tabuleiro", "doll", "toy", "plush", "peluche"] },
  { nameKey: "cat_auto", searchQuery: "automotive", emoji: "🚘", color: "from-slate-600 to-zinc-950 bg-gradient-to-br", slug: "automotive", keywords: ["óleo motor", "pneu", "bateria carro", "filtro", "lampada", "limpeza", "acessorio carro", "car", "oil", "tire", "battery", "filter", "bulb", "cleaning", "moto", "motorcycle", "capacete", "helmet"] },
  { nameKey: "cat_design_editor", searchQuery: "design", emoji: "✨", color: "from-violet-600 to-fuchsia-950 bg-gradient-to-br", slug: "design", keywords: ["template", "ui", "ux", "componente", "mockup", "vetor", "vector", "canva", "pinterest", "font", "fonte", "icon", "icone", "textura", "texture", "layout", "preset", "graphics", "assets", "design", "wireframe"] },
  { nameKey: "cat_arts_crafts", searchQuery: "art", emoji: "🎨", color: "from-rose-500 to-amber-950 bg-gradient-to-br", slug: "art", keywords: ["quadro", "pintura", "tela", "arte", "desenho", "pincel", "acrilico", "art", "painting", "canvas", "frame", "drawing", "poster", "ilustracao", "illustration", "aguarela", "watercolor", "ink", "tinta", "galeria", "gallery"] },
  { nameKey: "cat_digital_3d", searchQuery: "3d", emoji: "🔮", color: "from-indigo-500 to-cyan-950 bg-gradient-to-br", slug: "3d", keywords: ["3d", "modelo 3d", "stl", "obj", "impressao 3d", "filamento", "resina", "render", "blender", "miniatura", "sculpture", "esculpido", "3d model", "3d print", "filament", "resin", "cad", "mesh", "malha"] },
  { nameKey: "cat_bakery", searchQuery: "bakery", emoji: "🍰", color: "from-pink-500 to-rose-900 bg-gradient-to-br", slug: "bakery", keywords: ["bolo", "doce", "sobremesa", "festa", "salgado", "torta", "cake", "sweet", "dessert", "party", "cupcake", "cupcakes", "brigadeiro", "casamento", "bombom", "marmita", "combo", "kit"] }
];

// 2. FALLBACK_PARENTS COM MAPEAMENTO EXATO DE TODOS OS 17 SLUGS
const FALLBACK_PARENTS: Record<string, string> = {
  electronics: "Tecnologia",
  clothing: "Vestuário",
  groceries: "Mercearia",
  home: "Casa e Utensílios",
  beauty: "Beleza",
  sports: "Desporto e Fitness",
  books: "Livraria e Papelaria",
  accessories: "Acessórios",
  baby: "Bebé e Criança",
  pets: "Pet Shop",
  tools: "Ferramentas",
  toys: "Brinquedos e Jogos",
  automotive: "Automóvel e Moto",
  design: "Design e Recurso Visual",
  art: "Arte e Galeria",
  "3d": "3D e Modelagem",
  bakery: "Pastelaria e Doces"
};

// MAPA DINÂMICO DE CATEGORIAS PAI E REGRAS DIRETAS DO MOCK
const PARENT_LABEL_MAP: Record<string, string> = {};
const DYNAMIC_PARENTS_RULES: Array<{ id: string, labelKey: string, isKidCategory: boolean, regex: RegExp }> = [];

MOCK_GLOBAL_CATEGORIES.forEach(cat => {
  const baseLabel = FALLBACK_PARENTS[cat.slug] || (cat.slug.charAt(0).toUpperCase() + cat.slug.slice(1));
  PARENT_LABEL_MAP[cat.slug] = baseLabel;

  DYNAMIC_PARENTS_RULES.push({
    id: cat.slug,
    labelKey: baseLabel,
    isKidCategory: ['baby', 'crianca', 'kids', 'infantil', 'bebe', 'toys'].includes(cat.slug.toLowerCase()),
    regex: new RegExp(`\\b(${cat.keywords.join('|')})\\b`, 'i')
  });
});

// 3. SUBCATEGORIAS COM PRIORIDADE E SEPARAÇÃO DE PÚBLICO
const SUB_CATEGORY_RULES = [
  // --- BEBÉ & CRIANÇA ---
  { parentSlug: "baby", labelKey: "Roupa de Bebé", regex: /\b(body bebe|body de bebe|body infantil|roupa bebe|roupa de bebe|recem nascido|recém[- ]nascido|manta bebe|macacao bebe|macacão bebê)\b/i, genderForceKey: "Criança" },
  { parentSlug: "baby", labelKey: "Acessórios de Bebé", regex: /\b(fralda|fraldas|biberao|biberão|chupeta|chupetas|berco|berço|carrinho de bebe|mordedor|mordedores|biberon|diaper|pacifier)\b/i, genderForceKey: "Criança" },
  { parentSlug: "toys", labelKey: "Brinquedos e Jogos", regex: /\b(brinquedo|brinquedos|boneca|bonecas|boneco|bonecos|carrinho brinquedo|lego|quebra[- ]cabeca|puzzle|pelucia|peluche|jogos de tabuleiro|boardgame|doll|toy|toys)\b/i, genderForceKey: "Criança" },

  // --- VESTUÁRIO ADULTO & CALÇADO ---
  { parentSlug: "clothing", labelKey: "Calçado", regex: /\b(calcado|calcados|sapato|sapatos|sapatilha|sapatilhas|tenis|sneaker|sneakers|shoes|sandalia|sandalias|bota|botas|boots|chinelo|chinelos|flip-?flops|salto|saltos|scarpin|scarpins|stiletto|stilettos|pumps?|high[- ]?heels?|rasteira|mule|oxford|coturno)\b/i },
  { parentSlug: "clothing", labelKey: "Camisas e Tops", regex: /\b(camisa|camisas|camiseta|camisetas|t-?shirt|t[’']?shirt|polo|polos|shirt|shirts|blusa|blusas|blouse|blouses|top|tops|cropped|tunica|social|body|bodies|bodysuit)\b/i },
  { parentSlug: "clothing", labelKey: "Calções", regex: /\b(bermuda|bermudas|calcao|calcoes|calção|calções|shorts|calcao desportivo|calcoes desportivo|calcoes desportivos|shorts desportivo|calcao de banho)\b/i },
  { parentSlug: "clothing", labelKey: "Calças", regex: /\b(calca|calcas|calça|calças|pants|trousers|legging|leggings)\b/i },
  { parentSlug: "clothing", labelKey: "Conjuntos", regex: /\b(conjunto|conjuntos|set|suit)\b/i },
  { parentSlug: "clothing", labelKey: "Vestidos e Macacões", regex: /\b(vestido|vestidos|dress|dresses|macacao|macacoes|macacão|macacões|jumpsuit|jumpsuits)\b/i },
  { parentSlug: "clothing", labelKey: "Saias", regex: /\b(saia|saias|skirt|skirts)\b/i, genderForceKey: "Mulher" },
  { parentSlug: "clothing", labelKey: "Moda Íntima", regex: /\b(collant|lingerie|cueca|sutia|sutiã|bra|underwear|calcinha|calcinhas|biquini|biquíni)\b/i, genderForceKey: "Mulher" },
  { parentSlug: "clothing", labelKey: "Casacos", regex: /\b(casaco|casacos|jaqueta|jaquetas|hoodie|hoodies|moletom|moletons|sweater|sweaters|pullover|coat|coats|camisola|camisolas|blazer|cardigan)\b/i },

  // --- BELEZA ---
  { parentSlug: "beauty", labelKey: "Maquilhagem", regex: /\b(maquiagem|maquilhagem|makeup|batom|batons|lipstick|lipsticks|rimel|mascara|base|foundation|blush|delineador|glos|gloss|corretivo)\b/i, genderForceKey: "Mulher" },
  { parentSlug: "beauty", labelKey: "Perfumaria e Cuidados", regex: /\b(perfume|perfumes|colonia|colónia|hidratante|skincare|serum|protetor solar|shampoo|champo|champô|condicionador|mascara capilar|sabonete|fragrance|beuty|beauty|beleza|estetica|cosmetico|cosmeticos)\b/i },

  // --- ELETRÓNICA & TECNOLOGIA ---
  { parentSlug: "electronics", labelKey: "Smartphones e Acessórios", regex: /\b(smartphone|iphone|celular|telemovel|telemóvel|capinha|capa celular|carregador|powerbank|pelicula|película|cabo usb|suporte celular)\b/i },
  { parentSlug: "electronics", labelKey: "Computadores", regex: /\b(computador|laptop|notebook|macbook|pc|teclado|mouse|rato|monitor|processador|ssd|hd|placa de video)\b/i },
  { parentSlug: "electronics", labelKey: "Áudio e Som", regex: /\b(fone|fones|headphone|earbud|airpod|caixa de som|speaker|coluna de som|audio|áudio|microfone|amplificador|soundbar)\b/i },
  { parentSlug: "electronics", labelKey: "Smartwatches", regex: /\b(smartwatch|apple watch|galaxy watch|gadget|rastreador|drone|pulso inteligente)\b/i },

  // --- PASTELARIA & DOCES ---
  { parentSlug: "bakery", labelKey: "Combos e Kits", regex: /\b(combo|kit festa|kit doce|combo de mini bolo)\b/i },
  { parentSlug: "bakery", labelKey: "Chiffon", regex: /\b(chiffon|chifon)\b/i },
  { parentSlug: "bakery", labelKey: "Mini Bolos", regex: /\b(mini[- ]?bolo|minibolo|cupcake|cupcakes|muffin|bento cake|bento|mini torta|marmita|bolo na marmita)\b/i },
  { parentSlug: "bakery", labelKey: "Doces e Sobremesas", regex: /\b(doce|doces|sobremesa|dessert|brigadeiro|pudim|macaron|brownie|cookie|bolacha|biscoito|donut|chocolates|bombom|bombons|trufa|trufas)\b/i },
  { parentSlug: "bakery", labelKey: "Bolos e Tortas", regex: /\b(bolo|bolos|cake|cakes|torta|tortas|pie|pies|cheesecake|pavlova)\b/i },
  { parentSlug: "groceries", labelKey: "Salgados", regex: /\b(salgado|coxinha|rissol|pastel|chamuca|empada|empadao|snack|chips|pao|pão|salgados)\b/i },
  { parentSlug: "groceries", labelKey: "Bebidas e Refrescos", regex: /\b(bebida|sumo|suco|juice|refrigerante|soda|agua|água|water|cerveja|beer|vinho|wine)\b/i },

  // --- ACESSÓRIOS ---
  { parentSlug: "accessories", labelKey: "Relógios e Joias", regex: /\b(relogio|relógio|watch|anel|ring|colar|necklace|brinco|earring|pulseira|bracelet)\b/i },
  { parentSlug: "accessories", labelKey: "Óculos e Chapéus", regex: /\b(oculos|óculos|glasses|sunglasses|bone|boné|cap|chapeu|chapéu|hat)\b/i },
  { parentSlug: "accessories", labelKey: "Malas e Carteiras", regex: /\b(carteira|wallet|bolsa|bag|mala|mochila|cinto|belt)\b/i },

  // --- DESIGN, ARTE & 3D ---
  { parentSlug: "design", labelKey: "Templates e UI/UX", regex: /\b(template|ui|ux|wireframe|componente|layout|mockup|preset|canva|pinterest)\b/i },
  { parentSlug: "design", labelKey: "Fontes e Vetores", regex: /\b(vetor|vector|font|fonte|icon|icone|ícone|textura|texture)\b/i },
  { parentSlug: "art", labelKey: "Quadros e Telas", regex: /\b(quadro|quadros|tela|telas|painting|canvas|moldura|poster|ilustracao|ilustração|print|arte de parede|galeria)\b/i },
  { parentSlug: "art", labelKey: "Pintura e Desenho", regex: /\b(pincel|desenho|drawing|acrilico|acrílico|aguarela|watercolor|ink|tinta)\b/i },
  { parentSlug: "3d", labelKey: "Modelos 3D e STL", regex: /\b(3d|modelo 3d|3d model|stl|obj|blender|sculpture|malha|mesh|cad)\b/i },
  { parentSlug: "3d", labelKey: "Impressão 3D e Insumos", regex: /\b(impressao 3d|impressão 3d|3d print|filamento|resina|filament|resin)\b/i },

  // --- CASA & UTENSÍLIOS ---
  { parentSlug: "home", labelKey: "Móveis e Sofás", regex: /\b(sofa|sofá|couch|mesa|table|moveis|móveis|furniture|estante|prateleira)\b/i },
  { parentSlug: "home", labelKey: "Decoração e Espelhos", regex: /\b(almofada|pillow|luminaria|luminária|candeeiro|lamp|decoracao|decoração|decor|vela|velas|espelho|mirror|tapete|rug)\b/i },
  { parentSlug: "home", labelKey: "Cozinha e Utensílios", regex: /\b(panela|frigideira|prato|copo|talher|caneca|airfryer|liquidificador|garrafa termica|garrafa térmica|pote|abridor)\b/i },

  // --- DESPORTO & FITNESS ---
  { parentSlug: "sports", labelKey: "Suplementos e Nutrição", regex: /\b(whey|creatina|proteina|proteína|pre treino|bcaa|termogenico|vitaminas|coqueteleira|shaker)\b/i },
  { parentSlug: "sports", labelKey: "Equipamento de Treino", regex: /\b(haltere|kettlebell|elastico|elástico|extensor|tapete yoga|mat|corda de saltar|luva treino|bola futebol|bola basquete)\b/i },
  { parentSlug: "sports", labelKey: "Moda Fitness", regex: /\b(top fitness|legging treino|camisa termica|regata treino)\b/i },

  // --- LIVRARIA & PAPELARIA ---
  { parentSlug: "books", labelKey: "Livros e HQs", regex: /\b(livro|livros|book|books|romance|ficcao|ficção|biografia|manga livro|mangas japoneses|hq|quadrinhos|bestseller|novel|comic)\b/i },
  { parentSlug: "books", labelKey: "Papelaria e Material", regex: /\b(caderno|agenda|planner|caneta|lapis|lápis|estojo|mochila escolar|bloco de notas|grampeador|papel a4)\b/i },

  // --- AUTOMÓVEL & MOTO ---
  { parentSlug: "automotive", labelKey: "Peças e Óleos", regex: /\b(oleo motor|óleo motor|pneu|bateria carro|filtro|lampada|lâmpada|tire|oil|battery|filter)\b/i },
  { parentSlug: "automotive", labelKey: "Acessórios de Moto e Carro", regex: /\b(capacete|helmet|limpeza|acessorio carro|acessório carro|suporte gps|rastreador veicular)\b/i },

  // --- PET SHOP ---
  { parentSlug: "pets", labelKey: "Ração e Alimentação", regex: /\b(racao|ração|petisco|food|dog food|cat food)\b/i },
  { parentSlug: "pets", labelKey: "Acessórios e Brinquedos Pet", regex: /\b(coleira|collar|guia|trela|arranhador|caixa de areia|caminha pet|brinquedo cao|brinquedo gato|aquario|aquário|shampoo pet)\b/i },

  // --- FERRAMENTAS ---
  { parentSlug: "tools", labelKey: "Ferramentas Elétricas e Manuais", regex: /\b(martelo|chave fenda|parafuso|prego|furadeira|alicate|hammer|screwdriver|screw|drill|pliers|bateria)\b/i },
  { parentSlug: "tools", labelKey: "Construção e Tintas", regex: /\b(tinta|construcao|construção|paint|construction|diy)\b/i }
];

// MATERIAIS SEGUROS (Validam no título ou em composição explícita)
const SAFE_MATERIAL_MAP = [
  { labelKey: "Couro", regex: /\b(couro|pele|leather)\b/i },
  { labelKey: "Jeans", regex: /\b(calca jeans|calça jeans|jaqueta jeans|short jeans|bermuda jeans|saia jeans|vestido jeans|em jeans|de jeans|100% jeans|denim|ganga)\b/i },
  { labelKey: "Algodão", regex: /\b(100% algodao|100% algodão|puro algodao|cotton|tecido algodao)\b/i }
];

// 4. DICIONÁRIO MULTILÍNGUE COMPLETO (PT / EN)
const TRANSLATION_MAP: Record<string, { pt: string; en: string }> = {
  // Públicos
  "Criança": { pt: "Criança", en: "Kids" },
  "Crianças": { pt: "Criança", en: "Kids" },
  "Kids": { pt: "Criança", en: "Kids" },
  "Infantil": { pt: "Criança", en: "Kids" },
  "Bebé": { pt: "Bebé", en: "Baby" },
  "Baby": { pt: "Bebé", en: "Baby" },
  "Mulher": { pt: "Mulher", en: "Women" },
  "Women": { pt: "Mulher", en: "Women" },
  "Homem": { pt: "Homem", en: "Men" },
  "Men": { pt: "Homem", en: "Men" },
  "Unissexo": { pt: "Unissexo", en: "Unisex" },
  "Unisex": { pt: "Unissexo", en: "Unisex" },
  
  // Categorias Principais
  "Tecnologia": { pt: "Tecnologia", en: "Technology" },
  "Vestuário": { pt: "Vestuário", en: "Clothing" },
  "Mercearia": { pt: "Mercearia", en: "Groceries" },
  "Casa e Utensílios": { pt: "Casa e Utensílios", en: "Home & Living" },
  "Beleza": { pt: "Beleza", en: "Beauty" },
  "Desporto e Fitness": { pt: "Desporto e Fitness", en: "Sports & Fitness" },
  "Livraria e Papelaria": { pt: "Livraria e Papelaria", en: "Books & Stationery" },
  "Acessórios": { pt: "Acessórios", en: "Accessories" },
  "Bebé e Criança": { pt: "Bebé e Criança", en: "Baby & Kids" },
  "Pet Shop": { pt: "Pet Shop", en: "Pet Supplies" },
  "Ferramentas": { pt: "Ferramentas", en: "Tools" },
  "Brinquedos e Jogos": { pt: "Brinquedos e Jogos", en: "Toys & Games" },
  "Automóvel e Moto": { pt: "Automóvel e Moto", en: "Auto & Moto" },
  "Design e Recurso Visual": { pt: "Design e Recurso Visual", en: "Design & Assets" },
  "Arte e Galeria": { pt: "Arte e Galeria", en: "Art & Gallery" },
  "3D e Modelagem": { pt: "3D e Modelagem", en: "3D & Modeling" },
  "Pastelaria e Doces": { pt: "Pastelaria e Doces", en: "Bakery & Sweets" },
  "Catálogo Geral": { pt: "Catálogo Geral", en: "General Catalog" },
  
  // Subcategorias
  "Combos e Kits": { pt: "Combos e Kits", en: "Combos & Kits" },
  "Combo": { pt: "Combo", en: "Combo" },
  "Kit": { pt: "Kit", en: "Kit" },
  "Bombom": { pt: "Bombom", en: "Bonbon" },
  "Marmita": { pt: "Marmita", en: "Lunchbox Cake" },
  "Cupcake": { pt: "Cupcake", en: "Cupcake" },
  "Cupcakes": { pt: "Cupcakes", en: "Cupcakes" },
  "Chiffon": { pt: "Chiffon", en: "Chiffon" },
  "Mini Bolos": { pt: "Mini Bolos", en: "Mini Cakes" },
  "Doces e Sobremesas": { pt: "Doces e Sobremesas", en: "Sweets & Desserts" },
  "Bolos e Tortas": { pt: "Bolos e Tortas", en: "Cakes & Pies" },
  "Salgados": { pt: "Salgados", en: "Savory Snacks" },
  "Bebidas e Refrescos": { pt: "Bebidas e Refrescos", en: "Beverages & Drinks" },
  "Smartphones e Acessórios": { pt: "Smartphones e Acessórios", en: "Smartphones & Accessories" },
  "Computadores": { pt: "Computadores", en: "Computers & Laptops" },
  "Áudio e Som": { pt: "Áudio e Som", en: "Audio & Sound" },
  "Smartwatches": { pt: "Smartwatches", en: "Smartwatches" },
  "Relógios e Joias": { pt: "Relógios e Joias", en: "Watches & Jewelry" },
  "Óculos e Chapéus": { pt: "Óculos e Chapéus", en: "Glasses & Hats" },
  "Malas e Carteiras": { pt: "Malas e Carteiras", en: "Bags & Wallets" },
  "Templates e UI/UX": { pt: "Templates e UI/UX", en: "Templates & UI/UX" },
  "Fontes e Vetores": { pt: "Fontes e Vetores", en: "Fonts & Vectors" },
  "Quadros e Telas": { pt: "Quadros e Telas", en: "Canvas & Frames" },
  "Pintura e Desenho": { pt: "Pintura e Desenho", en: "Painting & Drawing" },
  "Modelos 3D e STL": { pt: "Modelos 3D e STL", en: "3D Models & STL" },
  "Impressão 3D e Insumos": { pt: "Impressão 3D e Insumos", en: "3D Printing & Supplies" },
  "Móveis e Sofás": { pt: "Móveis e Sofás", en: "Furniture & Sofas" },
  "Decoração e Espelhos": { pt: "Decoração e Espelhos", en: "Decor & Mirrors" },
  "Cozinha e Utensílios": { pt: "Cozinha e Utensílios", en: "Kitchenware" },
  "Suplementos e Nutrição": { pt: "Suplementos e Nutrição", en: "Supplements & Nutrition" },
  "Equipamento de Treino": { pt: "Equipamento de Treino", en: "Workout Gear" },
  "Moda Fitness": { pt: "Moda Fitness", en: "Activewear" },
  "Livros e HQs": { pt: "Livros e HQs", en: "Books & Comics" },
  "Papelaria e Material": { pt: "Papelaria e Material", en: "Stationery & Supplies" },
  "Roupa de Bebé": { pt: "Roupa de Bebé", en: "Baby Clothing" },
  "Acessórios de Bebé": { pt: "Acessórios de Bebé", en: "Baby Accessories" },
  "Vestidos e Macacões": { pt: "Vestidos e Macacões", en: "Dresses & Jumpsuits" },
  "Saias": { pt: "Saias", en: "Skirts" },
  "Moda Íntima": { pt: "Moda Íntima", en: "Underwear & Lingerie" },
  "Camisas e Tops": { pt: "Camisas e Tops", en: "Shirts & Tops" },
  "Conjuntos": { pt: "Conjuntos", en: "Sets & Suits" },
  "Casacos": { pt: "Casacos", en: "Jackets & Coats" },
  "Calções": { pt: "Calções", en: "Shorts" },
  "Calças": { pt: "Calças", en: "Pants & Trousers" },
  "Calçado": { pt: "Calçado", en: "Footwear" },
  "Maquilhagem": { pt: "Maquilhagem", en: "Makeup" },
  "Perfumaria e Cuidados": { pt: "Perfumaria e Cuidados", en: "Perfumes & Skincare" },
  "Peças e Óleos": { pt: "Peças e Óleos", en: "Parts & Motor Oils" },
  "Acessórios de Moto e Carro": { pt: "Acessórios de Moto e Carro", en: "Auto & Moto Accessories" },
  "Ração e Alimentação": { pt: "Ração e Alimentação", en: "Pet Food" },
  "Acessórios e Brinquedos Pet": { pt: "Acessórios e Brinquedos Pet", en: "Pet Toys & Gear" },
  "Ferramentas Elétricas e Manuais": { pt: "Ferramentas Elétricas e Manuais", en: "Power & Hand Tools" },
  "Construção e Tintas": { pt: "Construção e Tintas", en: "Construction & Paints" },
  "Couro": { pt: "Couro", en: "Leather" },
  "Jeans": { pt: "Jeans", en: "Denim" },
  "Algodão": { pt: "Algodão", en: "Cotton" },
  "Tam: Único": { pt: "Tam: Único", en: "Size: One Size" }
};

function removeAccents(str: string): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2018\u2019\u0060\u00B4]/g, "'");
}

/**
 * Função Auxiliar Inteligente para gerir tags sem duplicados baseados em Maiúsculas/Minúsculas
 */
class UniqueTagManager {
  private tags = new Map<string, string>();

  add(tag: string) {
    if (!tag || tag.trim() === "") return;
    const lowerKey = tag.toLowerCase().trim();
    if (!this.tags.has(lowerKey)) {
      this.tags.set(lowerKey, tag.trim());
    }
  }

  values(): string[] {
    return Array.from(this.tags.values());
  }
}

/**
 * MOTOR PRINCIPAL DE INTELIGÊNCIA
 */
export function useProductIntelligence() {
  const { language } = useTranslate();

  const enrichProductsIntelligently = useCallback((products: any[]) => {
    if (!products || !Array.isArray(products)) return [];
    
    const targetLang = (language || "pt").toLowerCase().includes("en") ? "en" : "pt";

    const translateTag = (term: string) => {
      if (!term) return "";
      const foundKey = Object.keys(TRANSLATION_MAP).find(k => k.toLowerCase() === term.toLowerCase());
      return foundKey ? TRANSLATION_MAP[foundKey][targetLang] : term;
    };

    // Termos de criança explícitos
    const explicitKidRegex = /\b(crianca|criancas|infantil|infantis|kids?|bebe|bebes|baby|recem[- ]nascido|brinquedo|brinquedos|lego|body bebe|roupa bebe)\b/i;
    // Termos estritamente adultos
    const adultIndicatorsRegex = /\b(faculdade|universidade|trabalho|social|exercitar|academia|adulto|adultos|senhora|homem|mulher|women|men|boyfriend|y2k|saltos|sutia|lingerie|blazer|scarpin|scarpins|stiletto|heels?|modeladora|cintura alta|vintage|deposito|depósito)\b/i;

    return products.map(product => {
      const cleanProduct = { ...product };

      // Leitura da descrição com suporte ao campo full_description
      const rawDesc = cleanProduct.full_description || cleanProduct.description || cleanProduct.desc || cleanProduct.details || '';
      const titleText = removeAccents(cleanProduct.name || '').toLowerCase();
      const descText = removeAccents(rawDesc).toLowerCase();
      const categoryText = removeAccents(cleanProduct.category || '').toLowerCase();
      
      const contentOnlyText = `${titleText} ${descText}`;
      const fullText = `${titleText} ${descText} ${categoryText}`;

      let parentCategory = "";
      let subCategory = "";
      let gender = "";

      const isAdultStrict = adultIndicatorsRegex.test(fullText);
      const isKidExplicit = explicitKidRegex.test(titleText) || (explicitKidRegex.test(fullText) && !isAdultStrict);

      // ATRIBUIÇÃO BASE DE GÉNERO
      if (isKidExplicit) {
        gender = "Criança";
      } else if (/\b(mulher|feminino|feminina|women|woman|senhora|rapariga|silhueta|decote|blusa|saia|vestido|lingerie|scarpin|scarpins|stiletto|heels?|sutia|calcinha|modeladora|cintura alta)\b/i.test(fullText)) {
        gender = "Mulher";
      } else if (/\b(homem|masculino|men|man|rapaz|barba|gravata|polo|polos|cueca|boxer)\b/i.test(fullText)) {
        gender = "Homem";
      } else {
        const origGender = removeAccents(cleanProduct.gender || '').toLowerCase();
        if (origGender.includes("crianca") || origGender.includes("infantil") || origGender.includes("baby") || origGender.includes("kids")) {
          gender = isAdultStrict ? "" : "Criança";
        } else {
          gender = cleanProduct.gender || "";
        }
      }

      // SUBCATEGORIA BASE (Avaliando primeiro o TÍTULO para evitar falso positivo da descrição)
      for (const rule of SUB_CATEGORY_RULES) {
        if (rule.parentSlug === "baby" && gender !== "Criança") {
          continue;
        }

        if (rule.regex.test(titleText)) {
          subCategory = rule.labelKey; 
          
          if (rule.genderForceKey && !gender) {
            if (rule.genderForceKey === "Criança") {
              if (isKidExplicit) gender = "Criança";
            } else if (!isKidExplicit) {
              gender = rule.genderForceKey;
            }
          }
          
          if (rule.parentSlug) {
            const mappedLabel = PARENT_LABEL_MAP[rule.parentSlug] || FALLBACK_PARENTS[rule.parentSlug];
            if (mappedLabel) {
              parentCategory = mappedLabel;
            }
          }
          break; 
        }
      }

      // Se não achou no título, avalia no resto do texto
      if (!subCategory) {
        for (const rule of SUB_CATEGORY_RULES) {
          if (rule.parentSlug === "baby" && gender !== "Criança") {
            continue;
          }

          if (rule.regex.test(descText) || rule.regex.test(categoryText)) {
            subCategory = rule.labelKey; 
            
            if (rule.genderForceKey && !gender) {
              if (rule.genderForceKey === "Criança") {
                if (isKidExplicit) gender = "Criança";
              } else if (!isKidExplicit) {
                gender = rule.genderForceKey;
              }
            }
            
            if (rule.parentSlug) {
              const mappedLabel = PARENT_LABEL_MAP[rule.parentSlug] || FALLBACK_PARENTS[rule.parentSlug];
              if (mappedLabel) {
                parentCategory = mappedLabel;
              }
            }
            break; 
          }
        }
      }

      // CATEGORIA PAI BASE
      if (!parentCategory) {
        for (const parent of DYNAMIC_PARENTS_RULES) {
          if (parent.isKidCategory && gender !== "Criança") {
            continue;
          }

          if (parent.regex.test(contentOnlyText)) {
            parentCategory = FALLBACK_PARENTS[parent.id] || parent.labelKey;
            break; 
          }
        }
      }

      // FALLBACK CONTEXTUAL (Vestuário)
      if (!parentCategory && subCategory) {
        if (['Camisas e Tops', 'Conjuntos', 'Casacos', 'Calças', 'Calções', 'Vestidos e Macacões', 'Saias', 'Moda Íntima', 'Calçado'].includes(subCategory) || /\b(camisa|blusa|conjunto|camiseta|t-?shirt|t'shirt|polo|calca|casaco|sapato|scarpin|body|bermuda|calcao|calcoes)\b/i.test(titleText)) {
          parentCategory = gender === "Criança" ? "Bebé e Criança" : "Vestuário";
        }
      }

      if (!isKidExplicit && parentCategory === FALLBACK_PARENTS["baby"]) {
        parentCategory = "Vestuário";
      }

      const displayCategory = subCategory || parentCategory || cleanProduct.category || "Catálogo Geral";
      let finalGender = gender; 

      if (!isKidExplicit && finalGender === "Criança") {
        finalGender = isAdultStrict ? "Mulher" : "";
      }

      // TRADUÇÕES ESTRUTURAIS
      const translatedParentCategory = translateTag(parentCategory || "Catálogo Geral");
      const translatedSubCategory = translateTag(subCategory);
      const translatedDisplayCategory = translateTag(displayCategory);
      const translatedGender = translateTag(finalGender);

      // ATRIBUTOS ENRIQUECIDOS SEGUROS
      const attributesManager = new UniqueTagManager();
      SAFE_MATERIAL_MAP.forEach(attr => {
        if (attr.regex.test(titleText) || (attr.regex.test(descText) && !/\b(combina|usar|vestir|com)\s+/i.test(descText))) {
          attributesManager.add(translateTag(attr.labelKey));
        }
      });

      return { 
        ...cleanProduct, 
        category: translatedDisplayCategory, 
        gender: translatedGender, 
        metadata: {
          parentCategory: translatedParentCategory,
          subCategory: translatedSubCategory,
          gender: translatedGender, 
          sizes: [], // 🚀 Não julga tamanhos
          attributes: attributesManager.values()
        } 
      };
    });
  }, [language]);

  return { enrichProductsIntelligently };
}

/**
 * EXTRAÇÃO RÁPIDA DE TAGS (SHORT-CIRCUIT) - SEM JULGAR TAMANHOS E SEM FALHAS EM CRIANÇAS
 */
export function enrichProductsWithSubcategories(products: any[], lang: "pt" | "en" = "pt") {
  if (!products || !Array.isArray(products)) return [];
  
  return products.map(product => {
    // Leitura garantida da descrição com suporte a full_description
    const rawDesc = product.full_description || product.description || product.desc || product.details || '';
    const titleText = removeAccents(product.name || '').toLowerCase();
    const descText = removeAccents(rawDesc).toLowerCase();
    const fullText = `${titleText} ${descText}`;
    
    const tagsManager = new UniqueTagManager();
    
    // Identificação de Criança
    const isAdultStrict = /\b(faculdade|universidade|exercitar|academia|vintage|deposito|depósito|scarpin|scarpins|stiletto|modeladora|cintura alta|senhora)\b/i.test(fullText);
    const isKid = (/\b(crianca|criancas|infantil|infantis|kids?|bebe|bebes|baby|recem[- ]nascido|brinquedo|brinquedos|lego|body bebe|roupa bebe)\b/i.test(titleText) || /\b(crianca|criancas|infantil|infantis|kids?|bebe|bebes|baby)\b/i.test(fullText)) && !isAdultStrict;

    // Tratamento e tradução da tag que já vem no produto
    if (product.category) {
       const foundKey = Object.keys(TRANSLATION_MAP).find(k => k.toLowerCase() === product.category.toLowerCase());
       const mappedTranslation = foundKey ? TRANSLATION_MAP[foundKey][lang] : product.category;
       
       if (!isAdultStrict || (product.category.toLowerCase() !== 'baby' && product.category.toLowerCase() !== 'cat_baby')) {
         tagsManager.add(mappedTranslation);
       }
    }

    let foundMainCategory = false;

    const extractSingleCategory = (text: string) => {
      if (!text || foundMainCategory) return;
      
      // 1. Tenta por Subcategoria Específica
      for (const rule of SUB_CATEGORY_RULES) {
        if (rule.parentSlug === "baby" && !isKid) continue;

        if (rule.regex.test(text)) {
          const foundKey = Object.keys(TRANSLATION_MAP).find(k => k.toLowerCase() === rule.labelKey.toLowerCase());
          const translatedName = foundKey ? TRANSLATION_MAP[foundKey][lang] : rule.labelKey;
          tagsManager.add(translatedName);
          foundMainCategory = true;
          break;
        }
      }
      
      // 2. Fallback de Segurança - Se não for Subcategoria, puxa diretamente do Mock (Categoria Pai)
      if (!foundMainCategory) {
        for (const parent of DYNAMIC_PARENTS_RULES) {
          if (parent.isKidCategory && !isKid) continue;

          if (parent.regex.test(text)) {
            const foundKey = Object.keys(TRANSLATION_MAP).find(k => k.toLowerCase() === parent.labelKey.toLowerCase());
            const translatedName = foundKey ? TRANSLATION_MAP[foundKey][lang] : parent.labelKey;
            tagsManager.add(translatedName);
            foundMainCategory = true;
            break;
          }
        }
      }
    };

    // Prioriza o título sobre a descrição
    extractSingleCategory(titleText);
    extractSingleCategory(descText);

    if (isKid) {
      tagsManager.add(TRANSLATION_MAP["Criança"][lang]);
    }

    return { 
      ...product, 
      displayTags: tagsManager.values() // 🚀 Tags 100% limpas sem extração arbitrária de tamanhos
    };
  });
}