export type HelperTab = 'audience' | 'sizes' | 'styles' | 'materials' | 'colors';

export interface SmartTagDefinition {
  id: string;
  labelKey: string;
  defaultLabel: string;
  valueKey: string;
  defaultValue: string;
  regex: RegExp;
  categories?: string[]; // 🌟 NOVA PROPRIEDADE: Define em que categorias a tag aparece
}

export const TAB_ORDER: HelperTab[] = ['audience', 'sizes', 'styles', 'materials', 'colors'];

// Abas de seleção múltipla vs Seleção única
export const MULTI_SELECT_TABS = new Set<HelperTab>(['sizes', 'colors', 'materials', 'styles']);

export const GROUP_CONFIG: Record<HelperTab, { headerKey: string; defaultHeader: string }> = {
  audience: { headerKey: 'group_header_audience', defaultHeader: 'Público / Alvo' },
  sizes: { headerKey: 'group_header_sizes', defaultHeader: 'Tamanhos / Capacidade' },
  styles: { headerKey: 'group_header_styles', defaultHeader: 'Estilo / Condição' },
  materials: { headerKey: 'group_header_materials', defaultHeader: 'Material / Sabor' },
  colors: { headerKey: 'group_header_colors', defaultHeader: 'Cores' },
};

// CATEGORIAS COMUNS PARA REUTILIZAÇÃO RÁPIDA
const CAT_APPAREL = ['clothing', 'sports', 'baby', 'accessories'];
const CAT_FOOD = ['bakery', 'groceries'];
const CAT_TECH = ['electronics', 'automotive', 'accessories'];
const CAT_HOME_ART = ['home', 'art', '3d', 'tools'];
const CAT_BEAUTY = ['beauty'];
const CAT_PETS = ['pets'];

// 🚀 DADOS EXPANDIDOS COM MAPEAMENTO DINÂMICO
export const STATIC_TAG_GROUPS: Record<HelperTab, SmartTagDefinition[]> = {
  audience: [
    // Moda & Geral
    { id: 'baby', labelKey: 'quick_tag_baby', defaultLabel: '🍼 Bebé', valueKey: 'val_baby', defaultValue: 'Bebé / Recém-nascido', regex: /\b(bebé|bebe|recém-nascido|baby|newborn)\b/i, categories: [...CAT_APPAREL, 'toys', 'home'] },
    { id: 'kids', labelKey: 'quick_tag_kids', defaultLabel: '👶 Criança', valueKey: 'val_kids', defaultValue: 'Infantil (Criança)', regex: /\b(criança|crianca|infantil|infantis|kids)\b/i, categories: [...CAT_APPAREL, 'toys', 'books', 'home'] },
    { id: 'teen', labelKey: 'quick_tag_teen', defaultLabel: '🛹 Jovem', valueKey: 'val_teen', defaultValue: 'Jovem / Adolescente', regex: /\b(jovem|adolescente|teen|teenager)\b/i, categories: [...CAT_APPAREL, 'electronics', 'books', 'sports'] },
    { id: 'women', labelKey: 'quick_tag_women', defaultLabel: '👩 Mulher', valueKey: 'val_women', defaultValue: 'Feminino (Mulher)', regex: /\b(mulher|feminino|feminina|senhora|women)\b/i, categories: [...CAT_APPAREL, 'beauty'] },
    { id: 'men', labelKey: 'quick_tag_men', defaultLabel: '👨 Homem', valueKey: 'val_men', defaultValue: 'Masculino (Homem)', regex: /\b(homem|masculino|rapaz|men)\b/i, categories: [...CAT_APPAREL, 'tools'] },
    { id: 'unisex', labelKey: 'quick_tag_unisex', defaultLabel: '✨ Unissexo', valueKey: 'val_unisex', defaultValue: 'Unissexo', regex: /\b(unissexo|unisex|geral)\b/i, categories: [...CAT_APPAREL, 'beauty'] },
    { id: 'adult', labelKey: 'quick_tag_adult', defaultLabel: '🧑 Adulto', valueKey: 'val_adult', defaultValue: 'Adulto', regex: /\b(adulto|adultos)\b/i, categories: [...CAT_APPAREL, 'home', 'art', 'electronics'] },
    { id: 'maternity', labelKey: 'quick_tag_maternity', defaultLabel: '🤰 Grávida', valueKey: 'val_maternity', defaultValue: 'Maternidade / Grávida', regex: /\b(grávida|gravida|maternidade|gestante|maternity)\b/i, categories: ['clothing', 'baby', 'beauty'] },
    // Novas Audiências (Tech, Pets, Festas)
    { id: 'gamers', labelKey: 'quick_tag_gamers', defaultLabel: '🎮 Gamers', valueKey: 'val_gamers', defaultValue: 'Gamers', regex: /\b(gamer|gamers|gaming|jogos)\b/i, categories: ['electronics', '3d', 'toys', 'home', 'design'] },
    { id: 'professionals', labelKey: 'quick_tag_professionals', defaultLabel: '💼 Profissionais', valueKey: 'val_professionals', defaultValue: 'Uso Profissional', regex: /\b(profissional|profissionais|escritorio|office)\b/i, categories: ['electronics', 'tools', 'design', 'automotive', 'books', 'home'] },
    { id: 'dogs', labelKey: 'quick_tag_dogs', defaultLabel: '🐶 Cães', valueKey: 'val_dogs', defaultValue: 'Para Cães', regex: /\b(cão|cao|cães|caes|dog|dogs|cachorro)\b/i, categories: CAT_PETS },
    { id: 'cats', labelKey: 'quick_tag_cats', defaultLabel: '🐱 Gatos', valueKey: 'val_cats', defaultValue: 'Para Gatos', regex: /\b(gato|gatos|cat|cats)\b/i, categories: CAT_PETS },
    { id: 'birthday', labelKey: 'quick_tag_birthday', defaultLabel: '🎂 Aniversário', valueKey: 'val_birthday', defaultValue: 'Aniversário / Festa', regex: /\b(aniversário|aniversario|birthday)\b/i, categories: [...CAT_FOOD, 'art', 'home', 'toys', 'accessories'] },
    { id: 'wedding', labelKey: 'quick_tag_wedding', defaultLabel: '💍 Casamento', valueKey: 'val_wedding', defaultValue: 'Casamento / Noivado', regex: /\b(casamento|noivado|wedding)\b/i, categories: [...CAT_FOOD, 'art', 'home', 'accessories', 'beauty'] },
    { id: 'gift', labelKey: 'quick_tag_gift', defaultLabel: '🎁 Presente', valueKey: 'val_gift', defaultValue: 'Ideal para Presente', regex: /\b(presente|oferta|gift)\b/i, categories: [...CAT_FOOD, ...CAT_HOME_ART, 'beauty', 'accessories', 'toys', 'books'] },
  ],
  sizes: [
    // Moda & Geral
    { id: 'size_xs', labelKey: 'quick_tag_xs', defaultLabel: '📏 PP / XS', valueKey: 'val_xs', defaultValue: 'Tam: PP (XS)', regex: /\b(?:tamanho|tam|size)\s*[:=]?\s*(pp|xs)\b/i, categories: CAT_APPAREL },
    { id: 'size_s', labelKey: 'quick_tag_s', defaultLabel: '📏 P / S', valueKey: 'val_s', defaultValue: 'Tam: P (S)', regex: /\b(?:tamanho|tam|size)\s*[:=]?\s*(p|s)\b/i, categories: CAT_APPAREL },
    { id: 'size_m', labelKey: 'quick_tag_m', defaultLabel: '📏 M', valueKey: 'val_m', defaultValue: 'Tam: M', regex: /\b(?:tamanho|tam|size)\s*[:=]?\s*m\b/i, categories: CAT_APPAREL },
    { id: 'size_l', labelKey: 'quick_tag_l', defaultLabel: '📏 G / L', valueKey: 'val_l', defaultValue: 'Tam: G (L)', regex: /\b(?:tamanho|tam|size)\s*[:=]?\s*(g|l)\b/i, categories: CAT_APPAREL },
    { id: 'size_xl', labelKey: 'quick_tag_xl', defaultLabel: '📏 GG / XL', valueKey: 'val_xl', defaultValue: 'Tam: GG (XL)', regex: /\b(?:tamanho|tam|size)\s*[:=]?\s*(gg|xl)\b/i, categories: CAT_APPAREL },
    { id: 'size_xxl', labelKey: 'quick_tag_xxl', defaultLabel: '📏 XG / XXL', valueKey: 'val_xxl', defaultValue: 'Tam: XG (XXL)', regex: /\b(?:tamanho|tam|size)\s*[:=]?\s*(xg|xxl|2xl)\b/i, categories: CAT_APPAREL },
    { id: 'size_3xl', labelKey: 'quick_tag_3xl', defaultLabel: '📏 XXG / 3XL', valueKey: 'val_3xl', defaultValue: 'Tam: XXG (3XL)', regex: /\b(?:tamanho|tam|size)\s*[:=]?\s*(xxg|3xl)\b/i, categories: CAT_APPAREL },
    { id: 'size_onesize', labelKey: 'quick_tag_onesize', defaultLabel: '📏 Único', valueKey: 'val_onesize', defaultValue: 'Tamanho Único', regex: /\b(tamanho único|tamanho unico|one size)\b/i, categories: [...CAT_APPAREL, 'home'] },
    { id: 'size_plussize', labelKey: 'quick_tag_plussize', defaultLabel: '➕ Plus Size', valueKey: 'val_plussize', defaultValue: 'Plus Size', regex: /\b(plus size|tamanho grande)\b/i, categories: ['clothing'] },
    // Comida / Porções
    { id: 'size_mini', labelKey: 'quick_tag_mini', defaultLabel: '🧁 Mini / Bento', valueKey: 'val_mini', defaultValue: 'Mini / Bento Cake', regex: /\b(mini|bento cake|bento)\b/i, categories: CAT_FOOD },
    { id: 'size_slice', labelKey: 'quick_tag_slice', defaultLabel: '🍰 Fatia', valueKey: 'val_slice', defaultValue: 'Fatia / Pedaço', regex: /\b(fatia|pedaço|slice)\b/i, categories: CAT_FOOD },
    { id: 'size_500g', labelKey: 'quick_tag_500g', defaultLabel: '⚖️ 500g', valueKey: 'val_500g', defaultValue: 'Aprox. 500g', regex: /\b(500\s*g|500g|meio quilo)\b/i, categories: [...CAT_FOOD, 'pets'] },
    { id: 'size_1kg', labelKey: 'quick_tag_1kg', defaultLabel: '⚖️ 1 Kg', valueKey: 'val_1kg', defaultValue: 'Aprox. 1 Kg', regex: /\b(1\s*kg|1kg|um quilo)\b/i, categories: [...CAT_FOOD, 'pets', '3d'] },
    { id: 'size_2kg', labelKey: 'quick_tag_2kg', defaultLabel: '⚖️ 2 Kg', valueKey: 'val_2kg', defaultValue: 'Aprox. 2 Kg', regex: /\b(2\s*kg|2kg|dois quilos)\b/i, categories: [...CAT_FOOD, 'pets'] },
    { id: 'size_10p', labelKey: 'quick_tag_10p', defaultLabel: '👥 10 Pessoas', valueKey: 'val_10p', defaultValue: 'Serve ~10 Pessoas', regex: /\b(10 pessoas|10 fatias)\b/i, categories: CAT_FOOD },
    // Capacidade (Líquidos / Cosméticos)
    { id: 'size_30ml', labelKey: 'quick_tag_30ml', defaultLabel: '💧 30ml', valueKey: 'val_30ml', defaultValue: '30ml', regex: /\b(30\s*ml)\b/i, categories: CAT_BEAUTY },
    { id: 'size_50ml', labelKey: 'quick_tag_50ml', defaultLabel: '💧 50ml', valueKey: 'val_50ml', defaultValue: '50ml', regex: /\b(50\s*ml)\b/i, categories: CAT_BEAUTY },
    { id: 'size_100ml', labelKey: 'quick_tag_100ml', defaultLabel: '💧 100ml', valueKey: 'val_100ml', defaultValue: '100ml', regex: /\b(100\s*ml)\b/i, categories: CAT_BEAUTY },
    { id: 'size_500ml', labelKey: 'quick_tag_500ml', defaultLabel: '💧 500ml', valueKey: 'val_500ml', defaultValue: '500ml', regex: /\b(500\s*ml|meio litro)\b/i, categories: [...CAT_BEAUTY, 'groceries', 'automotive'] },
    // Tech (Armazenamento)
    { id: 'size_64gb', labelKey: 'quick_tag_64gb', defaultLabel: '💾 64GB', valueKey: 'val_64gb', defaultValue: '64GB', regex: /\b(64\s*gb)\b/i, categories: ['electronics'] },
    { id: 'size_128gb', labelKey: 'quick_tag_128gb', defaultLabel: '💾 128GB', valueKey: 'val_128gb', defaultValue: '128GB', regex: /\b(128\s*gb)\b/i, categories: ['electronics'] },
    { id: 'size_256gb', labelKey: 'quick_tag_256gb', defaultLabel: '💾 256GB', valueKey: 'val_256gb', defaultValue: '256GB', regex: /\b(256\s*gb)\b/i, categories: ['electronics'] },
    { id: 'size_512gb', labelKey: 'quick_tag_512gb', defaultLabel: '💾 512GB', valueKey: 'val_512gb', defaultValue: '512GB', regex: /\b(512\s*gb)\b/i, categories: ['electronics'] },
    { id: 'size_1tb', labelKey: 'quick_tag_1tb', defaultLabel: '💾 1TB', valueKey: 'val_1tb', defaultValue: '1TB', regex: /\b(1\s*tb|1tb)\b/i, categories: ['electronics'] },
    // Papelaria / Arte
    { id: 'size_a4', labelKey: 'quick_tag_a4', defaultLabel: '📄 A4', valueKey: 'val_a4', defaultValue: 'Formato A4', regex: /\b(a4)\b/i, categories: ['art', 'books', 'design'] },
    { id: 'size_a3', labelKey: 'quick_tag_a3', defaultLabel: '📄 A3', valueKey: 'val_a3', defaultValue: 'Formato A3', regex: /\b(a3)\b/i, categories: ['art', 'books', 'design'] },
  ],
  styles: [
    // Moda & Geral
    { id: 'casual', labelKey: 'quick_tag_casual', defaultLabel: '👟 Casual', valueKey: 'val_casual', defaultValue: 'Casual / Dia a dia', regex: /\b(casual|streetwear|dia a dia)\b/i, categories: [...CAT_APPAREL, 'home'] },
    { id: 'social', labelKey: 'quick_tag_social', defaultLabel: '👔 Social', valueKey: 'val_social', defaultValue: 'Social / Trabalho', regex: /\b(social|trabalho|blazer|alfaiataria)\b/i, categories: CAT_APPAREL },
    { id: 'fitness', labelKey: 'quick_tag_fitness', defaultLabel: '⚡ Fitness', valueKey: 'val_fitness', defaultValue: 'Treino / Fitness', regex: /\b(treino|academia|fitness|desporto|sport)\b/i, categories: ['clothing', 'sports', 'accessories'] },
    { id: 'party', labelKey: 'quick_tag_party', defaultLabel: '🎉 Festa', valueKey: 'val_party', defaultValue: 'Festa / Noite', regex: /\b(festa|evento|casamento|noite|party)\b/i, categories: [...CAT_APPAREL, 'beauty'] },
    { id: 'minimalist', labelKey: 'quick_tag_minimalist', defaultLabel: '⚪ Minimalista', valueKey: 'val_minimalist', defaultValue: 'Minimalista', regex: /\b(minimalista|minimalist|básico|basico)\b/i, categories: [...CAT_APPAREL, ...CAT_HOME_ART] },
    { id: 'vintage', labelKey: 'quick_tag_vintage', defaultLabel: '📻 Vintage', valueKey: 'val_vintage', defaultValue: 'Vintage / Retrô', regex: /\b(vintage|retro|retrô)\b/i, categories: [...CAT_APPAREL, ...CAT_HOME_ART] },
    { id: 'elegant', labelKey: 'quick_tag_elegant', defaultLabel: '💎 Elegante', valueKey: 'val_elegant', defaultValue: 'Elegante / Chic', regex: /\b(elegante|chic|luxo|premium)\b/i, categories: [...CAT_APPAREL, 'home', 'beauty'] },
    { id: 'combo', labelKey: 'quick_tag_combo', defaultLabel: '📦 Kit / Combo', valueKey: 'val_combo', defaultValue: 'Kit / Combo', regex: /\b(kit|combo|conjunto)\b/i }, // Universal
    // Comida / Dietas
    { id: 'homemade', labelKey: 'quick_tag_homemade', defaultLabel: '🏠 Caseiro', valueKey: 'val_homemade', defaultValue: 'Caseiro / Artesanal', regex: /\b(caseiro|artesanal|homemade)\b/i, categories: CAT_FOOD },
    { id: 'gourmet', labelKey: 'quick_tag_gourmet', defaultLabel: '✨ Gourmet', valueKey: 'val_gourmet', defaultValue: 'Gourmet', regex: /\b(gourmet)\b/i, categories: CAT_FOOD },
    { id: 'vegan', labelKey: 'quick_tag_vegan', defaultLabel: '🌱 Vegano', valueKey: 'val_vegan', defaultValue: 'Vegano / Plant-based', regex: /\b(vegano|vegan|plant-based)\b/i, categories: [...CAT_FOOD, 'beauty'] },
    { id: 'gluten_free', labelKey: 'quick_tag_gluten_free', defaultLabel: '🌾 Sem Glúten', valueKey: 'val_gluten_free', defaultValue: 'Sem Glúten', regex: /\b(sem glúten|sem gluten|gluten free)\b/i, categories: CAT_FOOD },
    { id: 'sugar_free', labelKey: 'quick_tag_sugar_free', defaultLabel: '🚫 Zero Açúcar', valueKey: 'val_sugar_free', defaultValue: 'Diet / Zero Açúcar', regex: /\b(zero açúcar|zero açucar|diet|sugar free|sem açúcar)\b/i, categories: CAT_FOOD },
    { id: 'organic', labelKey: 'quick_tag_organic', defaultLabel: '🌿 Orgânico', valueKey: 'val_organic', defaultValue: 'Orgânico / Natural', regex: /\b(organico|orgânico|organic|natural)\b/i, categories: [...CAT_FOOD, 'beauty', 'home'] },
    // Condição (Tech, Ferramentas, Livros)
    { id: 'new', labelKey: 'quick_tag_new', defaultLabel: '🆕 Novo', valueKey: 'val_new', defaultValue: 'Novo / Lacrado', regex: /\b(novo|nova|lacrado|new)\b/i, categories: [...CAT_TECH, ...CAT_HOME_ART, 'books', 'toys'] },
    { id: 'used', labelKey: 'quick_tag_used', defaultLabel: '♻️ Usado', valueKey: 'val_used', defaultValue: 'Usado / Semi-novo', regex: /\b(usado|usada|semi-novo|seminovo|used)\b/i, categories: [...CAT_TECH, ...CAT_HOME_ART, 'books', 'toys'] },
    { id: 'refurbished', labelKey: 'quick_tag_refurbished', defaultLabel: '🔧 Recondicionado', valueKey: 'val_refurbished', defaultValue: 'Recondicionado', regex: /\b(recondicionado|refurbished)\b/i, categories: CAT_TECH },
  ],
  materials: [
    // Moda & Casa
    { id: 'cotton', labelKey: 'quick_tag_cotton', defaultLabel: '🌿 Algodão', valueKey: 'val_cotton', defaultValue: '100% Algodão', regex: /\b(algodao|algodão|cotton)\b/i, categories: [...CAT_APPAREL, 'home'] },
    { id: 'polyester', labelKey: 'quick_tag_polyester', defaultLabel: '🧵 Poliéster', valueKey: 'val_polyester', defaultValue: 'Poliéster', regex: /\b(poliester|poliéster|polyester)\b/i, categories: [...CAT_APPAREL, 'home'] },
    { id: 'linen', labelKey: 'quick_tag_linen', defaultLabel: '🌾 Linho', valueKey: 'val_linen', defaultValue: 'Linho', regex: /\b(linho|linen)\b/i, categories: [...CAT_APPAREL, 'home'] },
    { id: 'silk', labelKey: 'quick_tag_silk', defaultLabel: '🦋 Seda', valueKey: 'val_silk', defaultValue: 'Seda', regex: /\b(seda|silk)\b/i, categories: [...CAT_APPAREL, 'home'] },
    { id: 'wool', labelKey: 'quick_tag_wool', defaultLabel: '🐑 Lã', valueKey: 'val_wool', defaultValue: 'Lã / Tricô', regex: /\b(lã|la|tricô|trico|wool|knit)\b/i, categories: [...CAT_APPAREL, 'home'] },
    { id: 'leather', labelKey: 'quick_tag_leather', defaultLabel: '🧥 Couro', valueKey: 'val_leather', defaultValue: 'Couro / Pele', regex: /\b(couro|pele|leather)\b/i, categories: [...CAT_APPAREL, 'automotive'] },
    { id: 'jeans', labelKey: 'quick_tag_jeans', defaultLabel: '👖 Jeans', valueKey: 'val_jeans', defaultValue: 'Jeans / Denim', regex: /\b(jeans|denim|ganga)\b/i, categories: CAT_APPAREL },
    { id: 'viscose', labelKey: 'quick_tag_viscose', defaultLabel: '🌬️ Viscose', valueKey: 'val_viscose', defaultValue: 'Viscose', regex: /\b(viscose|rayon)\b/i, categories: CAT_APPAREL },
    { id: 'elastane', labelKey: 'quick_tag_elastane', defaultLabel: '🤸 Elastano', valueKey: 'val_elastane', defaultValue: 'Elastano / Lycra', regex: /\b(elastano|lycra|spandex)\b/i, categories: CAT_APPAREL },
    { id: 'velvet', labelKey: 'quick_tag_velvet', defaultLabel: '🍷 Veludo', valueKey: 'val_velvet', defaultValue: 'Veludo', regex: /\b(veludo|velvet)\b/i, categories: [...CAT_APPAREL, 'home'] },
    // Comida / Sabores
    { id: 'chocolate', labelKey: 'quick_tag_chocolate', defaultLabel: '🍫 Chocolate', valueKey: 'val_chocolate', defaultValue: 'Chocolate / Cacau', regex: /\b(chocolate|cacau|brigadeiro)\b/i, categories: CAT_FOOD },
    { id: 'vanilla', labelKey: 'quick_tag_vanilla', defaultLabel: '🍦 Baunilha', valueKey: 'val_vanilla', defaultValue: 'Baunilha', regex: /\b(baunilha|vanilla)\b/i, categories: CAT_FOOD },
    { id: 'strawberry', labelKey: 'quick_tag_strawberry', defaultLabel: '🍓 Morango', valueKey: 'val_strawberry', defaultValue: 'Morango', regex: /\b(morango|strawberry)\b/i, categories: CAT_FOOD },
    { id: 'red_velvet', labelKey: 'quick_tag_red_velvet', defaultLabel: '🍰 Red Velvet', valueKey: 'val_red_velvet', defaultValue: 'Red Velvet', regex: /\b(red velvet)\b/i, categories: ['bakery'] },
    { id: 'fruits', labelKey: 'quick_tag_fruits', defaultLabel: '🍒 Frutas', valueKey: 'val_fruits', defaultValue: 'Frutas / Tropical', regex: /\b(frutas|fruta|frutos|tropical|limão|maracujá)\b/i, categories: CAT_FOOD },
    { id: 'caramel', labelKey: 'quick_tag_caramel', defaultLabel: '🍯 Doce de Leite', valueKey: 'val_caramel', defaultValue: 'Doce de Leite / Caramelo', regex: /\b(doce de leite|caramelo|caramel)\b/i, categories: CAT_FOOD },
    { id: 'nuts', labelKey: 'quick_tag_nuts', defaultLabel: '🥜 Nozes/Amendoim', valueKey: 'val_nuts', defaultValue: 'Nozes / Amendoim / Crocante', regex: /\b(nozes|amendoim|castanha|crocante|nuts)\b/i, categories: CAT_FOOD },
    { id: 'savory', labelKey: 'quick_tag_savory', defaultLabel: '🧀 Salgado', valueKey: 'val_savory', defaultValue: 'Salgado / Queijo', regex: /\b(salgado|queijo|fiambre|carne|savory)\b/i, categories: CAT_FOOD },
    // Tech & Casa (Duros)
    { id: 'plastic', labelKey: 'quick_tag_plastic', defaultLabel: '🛢️ Plástico', valueKey: 'val_plastic', defaultValue: 'Plástico ABS', regex: /\b(plastico|plástico|plastic|abs)\b/i, categories: [...CAT_TECH, ...CAT_HOME_ART, 'toys'] },
    { id: 'metal', labelKey: 'quick_tag_metal', defaultLabel: '🔩 Metal', valueKey: 'val_metal', defaultValue: 'Metal / Aço', regex: /\b(metal|aço|aco|steel)\b/i, categories: [...CAT_TECH, ...CAT_HOME_ART, 'toys'] },
    { id: 'aluminum', labelKey: 'quick_tag_aluminum', defaultLabel: '⚙️ Alumínio', valueKey: 'val_aluminum', defaultValue: 'Alumínio', regex: /\b(aluminio|alumínio|aluminum)\b/i, categories: [...CAT_TECH, ...CAT_HOME_ART] },
    { id: 'glass', labelKey: 'quick_tag_glass', defaultLabel: '🪟 Vidro', valueKey: 'val_glass', defaultValue: 'Vidro / Cristal', regex: /\b(vidro|cristal|glass)\b/i, categories: ['home', 'electronics', 'automotive'] },
    { id: 'wood', labelKey: 'quick_tag_wood', defaultLabel: '🪵 Madeira', valueKey: 'val_wood', defaultValue: 'Madeira Maciça', regex: /\b(madeira|wood|madeira maciça)\b/i, categories: ['home', 'art', 'toys', 'tools'] },
    { id: 'resin', labelKey: 'quick_tag_resin', defaultLabel: '💧 Resina', valueKey: 'val_resin', defaultValue: 'Resina', regex: /\b(resina|resin)\b/i, categories: ['3d', 'art', 'home'] },
    { id: 'silicone', labelKey: 'quick_tag_silicone', defaultLabel: '🧪 Silicone', valueKey: 'val_silicone', defaultValue: 'Silicone', regex: /\b(silicone)\b/i, categories: ['home', 'accessories', 'baby', 'electronics'] },
    // Joalharia
    { id: 'gold_mat', labelKey: 'quick_tag_gold_mat', defaultLabel: '✨ Ouro', valueKey: 'val_gold_mat', defaultValue: 'Ouro 18k', regex: /\b(ouro|gold 18k|gold 24k)\b/i, categories: ['accessories'] },
    { id: 'silver_mat', labelKey: 'quick_tag_silver_mat', defaultLabel: '💍 Prata', valueKey: 'val_silver_mat', defaultValue: 'Prata 925', regex: /\b(prata|silver 925)\b/i, categories: ['accessories'] },
    { id: 'stainless', labelKey: 'quick_tag_stainless', defaultLabel: '🛡️ Aço Inox', valueKey: 'val_stainless', defaultValue: 'Aço Inoxidável', regex: /\b(inoxidável|inoxidavel|inox|stainless)\b/i, categories: ['accessories', 'home'] },
  ],
  colors: [
    // UNIVERSAIS (Sem a propriedade categories, ou seja, aparecem SEMPRE em qualquer loja)
    { id: 'black', labelKey: 'quick_tag_black', defaultLabel: '⚫ Preto', valueKey: 'val_black', defaultValue: 'Preto', regex: /\b(preto|preta|black)\b/i },
    { id: 'white', labelKey: 'quick_tag_white', defaultLabel: '⚪ Branco', valueKey: 'val_white', defaultValue: 'Branco', regex: /\b(branco|branca|white)\b/i },
    { id: 'grey', labelKey: 'quick_tag_grey', defaultLabel: '🔘 Cinza', valueKey: 'val_grey', defaultValue: 'Cinza / Prata', regex: /\b(cinza|cinzento|grey|prata|silver)\b/i },
    { id: 'beige', labelKey: 'quick_tag_beige', defaultLabel: '🟤 Bege', valueKey: 'val_beige', defaultValue: 'Bege / Nude', regex: /\b(bege|nude|beige)\b/i },
    { id: 'brown', labelKey: 'quick_tag_brown', defaultLabel: '🟫 Marrom', valueKey: 'val_brown', defaultValue: 'Marrom / Castanho', regex: /\b(marrom|castanho|brown)\b/i },
    { id: 'blue', labelKey: 'quick_tag_blue', defaultLabel: '🔵 Azul', valueKey: 'val_blue', defaultValue: 'Azul', regex: /\b(azul|blue)\b/i },
    { id: 'red', labelKey: 'quick_tag_red', defaultLabel: '🔴 Vermelho', valueKey: 'val_red', defaultValue: 'Vermelho', regex: /\b(vermelho|vermelha|red)\b/i },
    { id: 'pink', labelKey: 'quick_tag_pink', defaultLabel: '🌸 Rosa', valueKey: 'val_pink', defaultValue: 'Rosa', regex: /\b(rosa|pink)\b/i },
    { id: 'green', labelKey: 'quick_tag_green', defaultLabel: '🟢 Verde', valueKey: 'val_green', defaultValue: 'Verde', regex: /\b(verde|green)\b/i },
    { id: 'yellow', labelKey: 'quick_tag_yellow', defaultLabel: '🟡 Amarelo', valueKey: 'val_yellow', defaultValue: 'Amarelo', regex: /\b(amarelo|amarela|yellow)\b/i },
    { id: 'orange', labelKey: 'quick_tag_orange', defaultLabel: '🟠 Laranja', valueKey: 'val_orange', defaultValue: 'Laranja', regex: /\b(laranja|orange)\b/i },
    { id: 'purple', labelKey: 'quick_tag_purple', defaultLabel: '🟣 Roxo', valueKey: 'val_purple', defaultValue: 'Roxo / Lilás', regex: /\b(roxo|roxa|lilás|lilas|purple)\b/i },
    { id: 'gold', labelKey: 'quick_tag_gold', defaultLabel: '✨ Dourado', valueKey: 'val_gold', defaultValue: 'Dourado', regex: /\b(dourado|dourada|gold)\b/i },
    { id: 'transparent', labelKey: 'quick_tag_transparent', defaultLabel: '🫥 Transparente', valueKey: 'val_transparent', defaultValue: 'Transparente / Claro', regex: /\b(transparente|claro|incolor|clear|transparent)\b/i },
    { id: 'multicolor', labelKey: 'quick_tag_multicolor', defaultLabel: '🌈 Estampado', valueKey: 'val_multicolor', defaultValue: 'Multicolorido / Estampado', regex: /\b(multicolor|multicolorido|estampado|estampa|pattern)\b/i },
  ],
};

export const ALL_TAGS = Object.values(STATIC_TAG_GROUPS).flat();

// Expressão regular expandida para capturar também "Sabores", "Ocasiões" e "Condição" no texto livre
export const SYSTEM_TAG_LINE_REGEX = /^•\s*(Público|Ocasiões?|Ocasião|Alvo|Tamanhos?|Porções?|Capacidade|Estilos?|Condição|Preparações?|Materiais?|Material|Sabores?|Sabor|Cores?|Dietas?|Audience|Occasions?|Sizes?|Portions?|Capacity|Styles?|Condition|Materials?|Flavors?|Colors?|Diets?):\s*(.*)$/i;