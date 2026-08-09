import { useCallback } from "react";
import { MOCK_GLOBAL_CATEGORIES } from "../components/produtos/componentsPublic/SearchMocks";
import { useTranslate } from "../context/LanguageContext";

// 1. MAPA DE PAIS E GERAÇÃO DINÂMICA
const PARENT_LABEL_MAP: Record<string, string> = {};
const DYNAMIC_PARENTS = MOCK_GLOBAL_CATEGORIES.map(cat => {
  const baseLabel = cat.slug.charAt(0).toUpperCase() + cat.slug.slice(1);
  PARENT_LABEL_MAP[cat.slug] = baseLabel;

  return {
    id: cat.slug,
    labelKey: baseLabel,
    regex: new RegExp(`\\b(${cat.keywords.join('|')})\\b`, 'i')
  };
});

const FALLBACK_PARENTS: Record<string, string> = {
  tech: "Tecnologia",
  art: "Arte e Decoração",
  bakery: "Pastelaria",
  groceries: "Mercearia",
  clothing: "Vestuário", 
  beauty: "Beleza",
  baby: "Bebé e Criança"
};

// 2. REGRAS FINAS DE SUBCATEGORIA
const SUB_CATEGORY_RULES = [
  { parentSlug: "bakery", labelKey: "Chiffon", regex: /\b(chiffon|chifon)\b/i },
  { parentSlug: "bakery", labelKey: "Mini Bolos", regex: /\b(mini[- ]?bolo|minibolo|cupcake|muffin|bento cake|bento|mini torta)\b/i },
  { parentSlug: "bakery", labelKey: "Doces e Sobremesas", regex: /\b(doce|doces|sobremesa|dessert|brigadeiro|pudim|macaron|brownie|cookie|bolacha|biscoito|donut|chocolates)\b/i },
  { parentSlug: "bakery", labelKey: "Bolos e Tortas", regex: /\b(bolo|bolos|cake|cakes|torta|tortas|pie|pies|cheesecake|pavlova)\b/i },
  { parentSlug: "groceries", labelKey: "Salgados", regex: /\b(salgado|coxinha|rissol|pastel|chamuca|empada|empadao|snack|chips|pao|salgados)\b/i },

  { parentSlug: "tech", labelKey: "Smartphones e Acessórios", regex: /\b(smartphone|iphone|celular|telemovel|capinha|capa|carregador|powerbank|pelicula|cabo usb)\b/i },
  { parentSlug: "tech", labelKey: "Computadores", regex: /\b(computador|laptop|notebook|macbook|pc|teclado|mouse|rato|monitor)\b/i },
  { parentSlug: "tech", labelKey: "Áudio e Som", regex: /\b(fone|fones|headphone|earbud|airpod|caixa de som|speaker|coluna de som|audio|microfone)\b/i },
  { parentSlug: "tech", labelKey: "Smartwatches", regex: /\b(smartwatch|apple watch|gadget|rastreador|drone)\b/i },

  { parentSlug: "art", labelKey: "Quadros e Telas", regex: /\b(quadro|quadros|tela|telas|painting|canvas|moldura|poster|ilustracao|print|arte de parede)\b/i },
  { parentSlug: "art", labelKey: "Artesanato", regex: /\b(escultura|artesanato|craft|handmade|feito a mao|ceramica|vaso|estatua)\b/i },
  { parentSlug: "art", labelKey: "Decoração", regex: /\b(almofada|tapete|cortina|luminaria|candeeiro|decoracao|vela|velas)\b/i },

  { parentSlug: "baby", labelKey: "Roupa de Bebé", regex: /\b(body bebe|body infantil|roupa bebe|recem nascido|body de bebe|manta bebe)\b/i, genderForceKey: "Criança" },
  { parentSlug: "baby", labelKey: "Acessórios de Bebé", regex: /\b(fralda|biberao|chupeta|berco|carrinho de bebe)\b/i, genderForceKey: "Criança" },

  { parentSlug: "clothing", labelKey: "Vestidos e Macacões", regex: /\b(vestido|vestidos|dress|dresses|macacao|macacoes|jumpsuit|jumpsuits)\b/i, genderForceKey: "Mulher" },
  { parentSlug: "clothing", labelKey: "Saias", regex: /\b(saia|saias|skirt|skirts)\b/i, genderForceKey: "Mulher" },
  { parentSlug: "clothing", labelKey: "Moda Íntima", regex: /\b(body|bodies|bodysuit|collant|lingerie|cueca|sutia|bra|underwear|calcinha|biquini)\b/i, genderForceKey: "Mulher" },
  
  { parentSlug: "clothing", labelKey: "Camisas e Tops", regex: /\b(camisa|camisas|camiseta|camisetas|t-?shirt|t-?shirts|shirt|shirts|blusa|blusas|blouse|blouses|top|tops|cropped|tunica|social)\b/i },
  { parentSlug: "clothing", labelKey: "Conjuntos", regex: /\b(conjunto|conjuntos|set|suit)\b/i },
  { parentSlug: "clothing", labelKey: "Casacos", regex: /\b(casaco|casacos|jaqueta|jaquetas|hoodie|hoodies|moletom|moletons|sweater|sweaters|pullover|coat|coats|camisola|camisolas)\b/i },
  { parentSlug: "clothing", labelKey: "Calções", regex: /\b(bermuda|bermudas|calcao|calcoes|shorts)\b/i },
  { parentSlug: "clothing", labelKey: "Calças", regex: /\b(calca|calcas|pants|trousers|legging|leggings)\b/i },
  
  { parentSlug: "clothing", labelKey: "Calçado", regex: /\b(calcado|calcados|sapato|sapatos|sapatilha|sapatilhas|tenis|sneaker|sneakers|shoes|sandalia|sandalias|bota|botas|boots|chinelo|chinelos|flip-?flops|salto)\b/i },
  
  { parentSlug: "beauty", labelKey: "Maquilhagem", regex: /\b(maquiagem|maquilhagem|makeup|batom|batons|lipstick|lipsticks|rimel|mascara|base|foundation|blush)\b/i, genderForceKey: "Mulher" }
];

const ATTRIBUTE_MAP = [
  { labelKey: "Preto", regex: /\b(preto|preta|pretos|pretas|black|escura)\b/i },
  { labelKey: "Branco", regex: /\b(branco|branca|brancos|brancas|white)\b/i },
  { labelKey: "Azul", regex: /\b(azul|azuis|blue|navy)\b/i },
  { labelKey: "Vermelho", regex: /\b(vermelho|vermelha|vermelhos|vermelhas|red|encarnado)\b/i },
  { labelKey: "Verde", regex: /\b(verde|verdes|green)\b/i },
  { labelKey: "Amarelo", regex: /\b(amarelo|amarela|amarelos|amarelas|yellow)\b/i },
  { labelKey: "Laranja", regex: /\b(laranja|orange)\b/i },
  { labelKey: "Rosa", regex: /\b(rosa|rosas|pink)\b/i },
  { labelKey: "Roxo", regex: /\b(roxo|roxa|purple|lilas|lilás)\b/i },
  { labelKey: "Castanho", regex: /\b(castanho|castanha|brown|marrom)\b/i },
  { labelKey: "Cinza", regex: /\b(cinza|cinzento|cinzenta|grey|gray|prata|silver)\b/i },
  { labelKey: "Dourado", regex: /\b(dourado|dourada|gold)\b/i },
  { labelKey: "Couro", regex: /\b(couro|pele|leather)\b/i },
  { labelKey: "Jeans", regex: /\b(jeans|denim|ganga)\b/i },
  { labelKey: "Algodão", regex: /\b(algodao|algodão|cotton)\b/i }
];

function removeAccents(str: string): string {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Motor Principal
 */
export function useProductIntelligence() {
  const { t } = useTranslate();

  const enrichProductsIntelligently = useCallback((products: any[]) => {
    if (!products || !Array.isArray(products)) return [];
    
    const nuclearKidRegex = /(crianca|infantil|kids|bebe|baby)/i;
    
    return products.map(product => {
      let cleanProduct = { ...product };

      const titleText = removeAccents(cleanProduct.name || '').toLowerCase();
      const descText = removeAccents(cleanProduct.description || cleanProduct.desc || cleanProduct.details || '').toLowerCase();
      const categoryText = removeAccents(cleanProduct.category || '').toLowerCase();
      
      const contentOnlyText = `${titleText} ${descText}`;
      const fullText = `${titleText} ${descText} ${categoryText}`;

      let parentCategory = "";
      let subCategory = "";
      let gender = "";

      const isAdultOrStudent = /\b(faculdade|universidade|trabalho|social|casual|streetwear|silhueta|decote|ajustado|ajustada|adulto|senhora|homem|mulher|boyfriend|y2k|dia[- ]?a[- ]?dia)\b/i.test(fullText);
      
      let isKidExplicit = nuclearKidRegex.test(contentOnlyText);

      // ANULAÇÃO ABSOLUTA: Se for adulto/estudante/decote, o produto é BLOQUEADO de ser criança, 
      // mesmo que venha escrito "criança" por engano na base de dados.
      if (isAdultOrStudent) {
          isKidExplicit = false;
      }

      // ATRIBUIÇÃO DE GÉNERO
      if (isKidExplicit) {
        gender = t("Criança" as any);
      } else if (/\b(mulher|feminino|feminina|women|senhora|rapariga|silhueta|decote)\b/i.test(fullText) || isAdultOrStudent) {
        gender = t("Mulher" as any); // Força Mulher se for adulto/silhueta/decote para cair no grupo certo
      } else if (/\b(homem|masculino|men|rapaz)\b/i.test(fullText)) {
        gender = t("Homem" as any);
      }

      // 2. EXTRAIR SUBCATEGORIA
      for (const rule of SUB_CATEGORY_RULES) {
        if (rule.regex.test(titleText) || rule.regex.test(descText) || rule.regex.test(categoryText)) {
          subCategory = t(rule.labelKey as any); 
          if (rule.genderForceKey && !gender) gender = t(rule.genderForceKey as any);
          
          if (rule.parentSlug) {
            const mappedLabel = PARENT_LABEL_MAP[rule.parentSlug] || FALLBACK_PARENTS[rule.parentSlug];
            if (mappedLabel) {
              parentCategory = t(mappedLabel as any);
            }
          }
          break; 
        }
      }

      // 3. EXTRAIR CATEGORIA PAI
      if (!parentCategory) {
        for (const parent of DYNAMIC_PARENTS) {
          if (parent.regex.test(contentOnlyText)) {
            parentCategory = t(parent.labelKey as any);
            break; 
          }
        }
      }

      if (!parentCategory && subCategory) {
         if (['Camisas e Tops', 'Conjuntos'].includes(subCategory) || /\b(camisa|blusa|conjunto|camiseta)\b/i.test(titleText)) {
             parentCategory = t("Vestuário" as any);
         }
      }

      // 4. SOBRESCREVER E LIMPAR HERANÇAS
      let displayCategory = subCategory || parentCategory || cleanProduct.category;
      let finalGender = gender || cleanProduct.gender || ""; 

      // DESTRUIÇÃO NUCLEAR DE HERANÇAS NA CATEGORIA E NO GÉNERO
      if (!isKidExplicit) {
          if (nuclearKidRegex.test(removeAccents(displayCategory || '').toLowerCase())) {
              displayCategory = subCategory || parentCategory || t("Vestuário" as any);
          }
          
          // Se o género tiver vestígios de criança mas o produto for adulto, removemos o género de criança imediatamente
          if (nuclearKidRegex.test(removeAccents(finalGender || '').toLowerCase())) {
              finalGender = isAdultOrStudent ? t("Mulher" as any) : "";
          }
      }

      // TRAVÃO DE SEGURANÇA FINAL: Se for claramente de adulto, o género NUNCA pode ser Criança
      if (isAdultOrStudent && finalGender === t("Criança" as any)) {
          finalGender = t("Mulher" as any);
      }

      if (!displayCategory || displayCategory.trim() === "") {
          displayCategory = t("Catálogo Geral" as any);
      }
      
      if (!finalGender || (typeof finalGender === 'string' && (finalGender.toLowerCase() === "null" || finalGender.toLowerCase() === "undefined"))) {
          finalGender = "";
      }

      const sizes = new Set<string>();
      const sizePrefix = t("Tam:" as any); 
      const sizeRegex = /\b(?:tamanho|tam|size)\s*[:=]?\s*(pp|p|m|g|gg|xg|xs|s|l|xl|xxl|xxxl|[3-5][0-9])\b/gi;
      let match;
      while ((match = sizeRegex.exec(fullText)) !== null) {
        sizes.add(`${sizePrefix} ${match[1].toUpperCase()}`);
      }
      
      if (/\b(tamanho unico|one size)\b/i.test(fullText)) sizes.add(t("Tam: Único" as any));

      const attributes = new Set<string>();
      ATTRIBUTE_MAP.forEach(attr => {
        if (attr.regex.test(fullText)) attributes.add(t(attr.labelKey as any));
      });

      return { 
        ...cleanProduct, 
        category: displayCategory, 
        gender: finalGender, 
        metadata: {
          parentCategory: parentCategory || t("Catálogo Geral" as any),
          subCategory,
          gender: finalGender, 
          sizes: Array.from(sizes),
          attributes: Array.from(attributes)
        } 
      };
    });
  }, [t]);

  return { enrichProductsIntelligently };
}