// ProductIntelligence.ts

import { MOCK_GLOBAL_CATEGORIES } from "../components/produtos/componentsPublic/SearchMocks";

// 1. MAPA DE PAIS E GERAÇÃO DINÂMICA
const PARENT_LABEL_MAP: Record<string, { pt: string, en: string }> = {};
const DYNAMIC_PARENTS = MOCK_GLOBAL_CATEGORIES.map(cat => {
  const labelPt = cat.slug.charAt(0).toUpperCase() + cat.slug.slice(1);
  const labelEn = cat.searchQuery.charAt(0).toUpperCase() + cat.searchQuery.slice(1);
  
  PARENT_LABEL_MAP[cat.slug] = { pt: labelPt, en: labelEn };

  return {
    id: cat.slug,
    label: { pt: labelPt, en: labelEn },
    regex: new RegExp(`\\b(${cat.keywords.join('|')})\\b`, 'i')
  };
});

// 2. REGRAS FINAS DE SUBCATEGORIA (Ordem de prioridade é vital!)
const SUB_CATEGORY_RULES = [
  // A. BEBÉ & CRIANÇA (Intercepta "body", "roupa", etc., no contexto infantil primeiro)
  { parentSlug: "baby", label: { pt: "Roupa de Bebé", en: "Baby Clothing" }, regex: /\b(body bebe|body infantil|roupa bebe|recem nascido|body de bebe|manta bebe)\b/i, genderForce: { pt: "Criança", en: "Kids" } },
  { parentSlug: "baby", label: { pt: "Acessórios de Bebé", en: "Baby Accessories" }, regex: /\b(fralda|biberao|chupeta|berco|carrinho de bebe)\b/i, genderForce: { pt: "Criança", en: "Kids" } },

  // B. VESTUÁRIO FEMININO ESPECÍFICO
  { parentSlug: "clothing", label: { pt: "Vestidos & Macacões", en: "Dresses & Jumpsuits" }, regex: /\b(vestido|vestidos|dress|dresses|macacao|macacoes|jumpsuit|jumpsuits)\b/i, genderForce: { pt: "Mulher", en: "Women" } },
  { parentSlug: "clothing", label: { pt: "Saias", en: "Skirts" }, regex: /\b(saia|saias|skirt|skirts)\b/i, genderForce: { pt: "Mulher", en: "Women" } },
  { parentSlug: "clothing", label: { pt: "Bodies & Íntima", en: "Bodysuits & Intimates" }, regex: /\b(body|bodies|bodysuit|collant|lingerie|cueca|sutia|bra|underwear|calcinha)\b/i, genderForce: { pt: "Mulher", en: "Women" } },
  
  // C. VESTUÁRIO GERAL
  { parentSlug: "clothing", label: { pt: "Casacos & Frio", en: "Jackets & Outerwear" }, regex: /\b(casaco|casacos|jaqueta|jaquetas|hoodie|hoodies|moletom|moletons|sweater|sweaters|pullover|coat|coats|camisola|camisolas)\b/i },
  { parentSlug: "clothing", label: { pt: "Calções", en: "Shorts" }, regex: /\b(bermuda|bermudas|calcao|calcoes|shorts)\b/i },
  { parentSlug: "clothing", label: { pt: "Calças", en: "Pants & Trousers" }, regex: /\b(calca|calcas|pants|trousers|legging|leggings)\b/i },
  { parentSlug: "clothing", label: { pt: "Camisas & Tops", en: "Shirts & Tops" }, regex: /\b(camisa|camisas|t-?shirt|t-?shirts|shirt|shirts|blusa|blusas|blouse|blouses|top|tops|cropped|tunica)\b/i },
  
  // D. CALÇADO
  { parentSlug: "clothing", label: { pt: "Calçado", en: "Footwear" }, regex: /\b(calcado|calcados|sapato|sapatos|sapatilha|sapatilhas|tenis|sneaker|sneakers|shoes|sandalia|sandalias|bota|botas|boots|chinelo|chinelos|flip-?flops)\b/i },
  
  // E. ALIMENTAÇÃO & PASTELARIA
  { parentSlug: "bakery", label: { pt: "Bolos & Tortas", en: "Cakes & Pies" }, regex: /\b(bolo|bolos|cake|cakes|torta|tortas|pie|pies|cheesecake)\b/i },
  { parentSlug: "groceries", label: { pt: "Salgados & Snacks", en: "Snacks & Savory" }, regex: /\b(salgado|coxinha|rissol|pastel|chamuca|empada|snack|chips)\b/i },
  
  // F. BELEZA
  { parentSlug: "beauty", label: { pt: "Maquilhagem", en: "Makeup" }, regex: /\b(maquiagem|maquilhagem|makeup|batom|batons|lipstick|lipsticks|rimel|mascara|base|foundation)\b/i, genderForce: { pt: "Mulher", en: "Women" } }
];

// 3. DICIONÁRIOS INTELIGENTES DE ATRIBUTOS (Agora usa Regex para ignorar pontuações como ";" e "/")
const ATTRIBUTE_MAP = [
  // Cores
  { label: { pt: "Preto", en: "Black" }, regex: /\b(preto|preta|pretos|pretas|black|escura)\b/i },
  { label: { pt: "Branco", en: "White" }, regex: /\b(branco|branca|brancos|brancas|white)\b/i },
  { label: { pt: "Azul", en: "Blue" }, regex: /\b(azul|azuis|blue|navy)\b/i },
  { label: { pt: "Vermelho", en: "Red" }, regex: /\b(vermelho|vermelha|vermelhos|vermelhas|red|encarnado)\b/i },
  { label: { pt: "Verde", en: "Green" }, regex: /\b(verde|verdes|green)\b/i },
  { label: { pt: "Amarelo", en: "Yellow" }, regex: /\b(amarelo|amarela|amarelos|amarelas|yellow)\b/i },
  { label: { pt: "Lima", en: "Lime" }, regex: /\b(lima|lime)\b/i },
  { label: { pt: "Laranja", en: "Orange" }, regex: /\b(laranja|orange)\b/i },
  { label: { pt: "Rosa", en: "Pink" }, regex: /\b(rosa|rosas|pink)\b/i },
  { label: { pt: "Roxo", en: "Purple" }, regex: /\b(roxo|roxa|purple|lilas|lilás)\b/i },
  { label: { pt: "Castanho", en: "Brown" }, regex: /\b(castanho|castanha|brown|marrom)\b/i },
  { label: { pt: "Cinza", en: "Grey" }, regex: /\b(cinza|cinzento|cinzenta|grey|gray)\b/i },
  
  // Sabores / Ingredientes
  { label: { pt: "Chocolate", en: "Chocolate" }, regex: /\b(chocolate|cacau|choc)\b/i },
  { label: { pt: "Baunilha", en: "Vanilla" }, regex: /\b(baunilha|vanilla|vanila)\b/i },
  { label: { pt: "Morango", en: "Strawberry" }, regex: /\b(morango|strawberry)\b/i },
  { label: { pt: "Massa Folhada", en: "Puff Pastry" }, regex: /\b(folhada|massa folhada|puff pastry)\b/i },

  // Materiais / Tecidos
  { label: { pt: "Couro", en: "Leather" }, regex: /\b(couro|pele|leather)\b/i },
  { label: { pt: "Jeans", en: "Denim" }, regex: /\b(jeans|denim|ganga)\b/i },
  { label: { pt: "Chiffon", en: "Chiffon" }, regex: /\b(chiffon|chifon)\b/i },
  { label: { pt: "Seda", en: "Silk" }, regex: /\b(seda|silk)\b/i },
  { label: { pt: "Linho", en: "Linen" }, regex: /\b(linho|linen)\b/i },
  { label: { pt: "Algodão", en: "Cotton" }, regex: /\b(algodao|algodão|cotton)\b/i }
];

function removeAccents(str: string): string {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Motor Principal
 */
export function enrichProductsIntelligently(products: any[], lang: "pt" | "en" = "pt") {
  if (!products || !Array.isArray(products)) return [];
  
  return products.map(product => {
    const titleText = removeAccents(`${product.name || ''} ${product.category || ''}`).toLowerCase();
    const descText = removeAccents(product.description || '').toLowerCase();
    const fullText = `${titleText} ${descText}`;

    let parentCategory = "";
    let subCategory = "";
    let gender = "";

    // 1. EXTRAIR GÉNERO
    if (/\b(homem|masculino|boy|men|rapaz)\b/i.test(fullText)) gender = lang === "pt" ? "Homem" : "Men";
    else if (/\b(mulher|feminino|girl|women|senhora|rapariga)\b/i.test(fullText)) gender = lang === "pt" ? "Mulher" : "Women";
    else if (/\b(crianca|criancas|infantil|kids|bebe|menino|menina|baby)\b/i.test(fullText)) gender = lang === "pt" ? "Criança" : "Kids";

    // 2. EXTRAIR SUBCATEGORIA (E forçar Categoria Pai se necessário)
    for (const rule of SUB_CATEGORY_RULES) {
      if (rule.regex.test(titleText) || rule.regex.test(descText)) {
        subCategory = rule.label[lang] || rule.label.pt;
        if (rule.genderForce && !gender) gender = rule.genderForce[lang];
        // Se encontramos a subcategoria, sabemos exatamente qual é o PAI de origem!
        if (rule.parentSlug && PARENT_LABEL_MAP[rule.parentSlug]) {
          parentCategory = PARENT_LABEL_MAP[rule.parentSlug][lang];
        }
        break; 
      }
    }

    // 3. EXTRAIR CATEGORIA PAI (Apenas se a subcategoria não resolveu o Pai)
    if (!parentCategory) {
      for (const parent of DYNAMIC_PARENTS) {
        if (parent.regex.test(titleText) || parent.regex.test(descText)) {
          parentCategory = parent.label[lang] || parent.label.pt;
          break; 
        }
      }
    }

    // FALLBACK DE SEGURANÇA (Se mesmo assim não achar nada)
    if (!parentCategory) {
      parentCategory = lang === "pt" ? "Catálogo Geral" : "General Catalog";
    }

    // 4. EXTRAIR TAMANHOS (Sem repetições ou Undefineds)
    const sizes = new Set<string>();
    const sizePrefix = lang === "en" ? "Size:" : "Tam:";
    const sizeRegex = /\b(?:tamanho|tam|size)\s*[:=]?\s*(pp|p|m|g|gg|xg|xs|s|l|xl|xxl|xxxl|[3-5][0-9])\b/gi;
    let match;
    while ((match = sizeRegex.exec(fullText)) !== null) {
      sizes.add(`${sizePrefix} ${match[1].toUpperCase()}`);
    }
    if (/\b(plus size|tamanho grande)\b/i.test(fullText)) sizes.add("Plus Size");
    if (/\b(tamanho unico|one size)\b/i.test(fullText)) sizes.add(lang === "en" ? "One Size" : "Tam: Único");

    // 5. EXTRAIR CORES E MATERIAIS (Usa Regex para ignorar ";" ou "/")
    const attributes = new Set<string>();
    ATTRIBUTE_MAP.forEach(attr => {
      // Se o regex da cor/material der match no texto, adiciona!
      if (attr.regex.test(fullText)) {
        attributes.add(attr.label[lang] || attr.label.pt);
      }
    });

    return { 
      ...product, 
      metadata: {
        parentCategory,
        subCategory,
        gender,
        sizes: Array.from(sizes),
        attributes: Array.from(attributes)
      } 
    };
  });
}