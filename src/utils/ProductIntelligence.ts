// ProductIntelligence.ts

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
  art: "ArteDecoracao",
  bakery: "Pastelaria",
  groceries: "Mercearia"
};

// 2. REGRAS FINAS DE SUBCATEGORIA (Ordem de prioridade estrita!)
const SUB_CATEGORY_RULES = [
  // --- A. ALIMENTAÇÃO & PASTELARIA (Chiffons específicos no topo) ---
  { parentSlug: "bakery", labelKey: "ChiffonChocolate", regex: /\b(chiffon (de )?chocolate|chifon (de )?chocolate)\b/i },
  { parentSlug: "bakery", labelKey: "ChiffonMisto", regex: /\b(chiffon misto|chifon misto|bolo misto)\b/i },
  { parentSlug: "bakery", labelKey: "ChiffonSimples", regex: /\b(chiffon simples|chifon simples|chiffon tradicional)\b/i },
  
  { parentSlug: "bakery", labelKey: "MiniBolosCupcakes", regex: /\b(mini[- ]?bolo|minibolo|cupcake|muffin|bento cake|bento|mini torta)\b/i },
  { parentSlug: "bakery", labelKey: "DocesSobremesas", regex: /\b(doce|doces|sobremesa|dessert|brigadeiro|pudim|macaron|brownie|cookie|bolacha|biscoito|donut|chocolates)\b/i },
  { parentSlug: "bakery", labelKey: "BolosTortas", regex: /\b(bolo|bolos|cake|cakes|torta|tortas|pie|pies|cheesecake|pavlova|chiffon)\b/i },
  { parentSlug: "groceries", labelKey: "SalgadosSnacks", regex: /\b(salgado|coxinha|rissol|pastel|chamuca|empada|empadao|snack|chips|pao|salgados)\b/i },

  // --- B. TECNOLOGIA & ELETRÓNICA ---
  { parentSlug: "tech", labelKey: "SmartphonesAcessorios", regex: /\b(smartphone|iphone|celular|telemovel|capinha|capa|carregador|powerbank|pelicula|cabo usb)\b/i },
  { parentSlug: "tech", labelKey: "ComputadoresLaptops", regex: /\b(computador|laptop|notebook|macbook|pc|teclado|mouse|rato|monitor)\b/i },
  { parentSlug: "tech", labelKey: "AudioSom", regex: /\b(fone|fones|headphone|earbud|airpod|caixa de som|speaker|coluna de som|audio|microfone)\b/i },
  { parentSlug: "tech", labelKey: "SmartwatchesGadgets", regex: /\b(smartwatch|apple watch|gadget|rastreador|drone)\b/i },

  // --- C. ARTE & DECORAÇÃO ---
  { parentSlug: "art", labelKey: "QuadrosTelas", regex: /\b(quadro|quadros|tela|telas|painting|canvas|moldura|poster|ilustracao|print|arte de parede)\b/i },
  { parentSlug: "art", labelKey: "EsculturasArtesanato", regex: /\b(escultura|artesanato|craft|handmade|feito a mao|ceramica|vaso|estatua)\b/i },
  { parentSlug: "art", labelKey: "DecoracaoInteriores", regex: /\b(almofada|tapete|cortina|luminaria|candeeiro|decoracao|vela|velas)\b/i },

  // --- D. BEBÉ & CRIANÇA ---
  { parentSlug: "baby", labelKey: "RoupaDeBebe", regex: /\b(body bebe|body infantil|roupa bebe|recem nascido|body de bebe|manta bebe)\b/i, genderForceKey: "Criança" },
  { parentSlug: "baby", labelKey: "AcessoriosDeBebe", regex: /\b(fralda|biberao|chupeta|berco|carrinho de bebe)\b/i, genderForceKey: "Criança" },

  // --- E. VESTUÁRIO FEMININO ESPECÍFICO ---
  { parentSlug: "clothing", labelKey: "VestidosMacacoes", regex: /\b(vestido|vestidos|dress|dresses|macacao|macacoes|jumpsuit|jumpsuits)\b/i, genderForceKey: "Mulher" },
  { parentSlug: "clothing", labelKey: "Saias", regex: /\b(saia|saias|skirt|skirts)\b/i, genderForceKey: "Mulher" },
  { parentSlug: "clothing", labelKey: "BodiesIntima", regex: /\b(body|bodies|bodysuit|collant|lingerie|cueca|sutia|bra|underwear|calcinha|biquini)\b/i, genderForceKey: "Mulher" },
  
  // --- F. VESTUÁRIO GERAL ---
  { parentSlug: "clothing", labelKey: "CasacosFrio", regex: /\b(casaco|casacos|jaqueta|jaquetas|hoodie|hoodies|moletom|moletons|sweater|sweaters|pullover|coat|coats|camisola|camisolas)\b/i },
  { parentSlug: "clothing", labelKey: "Calcoes", regex: /\b(bermuda|bermudas|calcao|calcoes|shorts)\b/i },
  { parentSlug: "clothing", labelKey: "Calcas", regex: /\b(calca|calcas|pants|trousers|legging|leggings)\b/i },
  { parentSlug: "clothing", labelKey: "CamisasTops", regex: /\b(camisa|camisas|t-?shirt|t-?shirts|shirt|shirts|blusa|blusas|blouse|blouses|top|tops|cropped|tunica)\b/i },
  
  // --- G. CALÇADO ---
  { parentSlug: "clothing", labelKey: "Calcado", regex: /\b(calcado|calcados|sapato|sapatos|sapatilha|sapatilhas|tenis|sneaker|sneakers|shoes|sandalia|sandalias|bota|botas|boots|chinelo|chinelos|flip-?flops|salto)\b/i },
  
  // --- H. BELEZA ---
  { parentSlug: "beauty", labelKey: "Maquilhagem", regex: /\b(maquiagem|maquilhagem|makeup|batom|batons|lipstick|lipsticks|rimel|mascara|base|foundation|blush)\b/i, genderForceKey: "Mulher" }
];

// 3. DICIONÁRIOS INTELIGENTES DE ATRIBUTOS
const ATTRIBUTE_MAP = [
  // Cores Base
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
  
  // Sabores / Tipos de Mistura
  { labelKey: "Chocolate", regex: /\b(chocolate|cacau|choc|brigadeiro)\b/i },
  { labelKey: "Baunilha", regex: /\b(baunilha|vanilla|vanila)\b/i },
  { labelKey: "Morango", regex: /\b(morango|strawberry)\b/i },
  { labelKey: "Limão", regex: /\b(limao|limão|lemon)\b/i },
  { labelKey: "Cenoura", regex: /\b(cenoura|carrot)\b/i },
  { labelKey: "RedVelvet", regex: /\b(red velvet)\b/i },
  { labelKey: "DoceDeLeite", regex: /\b(doce de leite|caramelo|caramel)\b/i },
  { labelKey: "Misto", regex: /\b(misto|mesclado|dois amores)\b/i },
  { labelKey: "Simples", regex: /\b(simples|tradicional|natural|sem recheio)\b/i },

  // Materiais / Texturas
  { labelKey: "Couro", regex: /\b(couro|pele|leather)\b/i },
  { labelKey: "Jeans", regex: /\b(jeans|denim|ganga)\b/i },
  { labelKey: "Chiffon", regex: /\b(chiffon|chifon)\b/i }, 
  { labelKey: "Seda", regex: /\b(seda|silk)\b/i },
  { labelKey: "Linho", regex: /\b(linho|linen)\b/i },
  { labelKey: "Algodão", regex: /\b(algodao|algodão|cotton)\b/i },
  { labelKey: "Madeira", regex: /\b(madeira|wood|mdf)\b/i },
  { labelKey: "Vidro", regex: /\b(vidro|glass)\b/i },
  { labelKey: "Metal", regex: /\b(metal|aco|iron|ferro)\b/i },
  
  // Specs Tech
  { labelKey: "Wireless", regex: /\b(sem fio|wireless|bluetooth)\b/i }
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
    
    return products.map(product => {
      const titleText = removeAccents(`${product.name || ''} ${product.category || ''}`).toLowerCase();
      const descText = removeAccents(product.description || '').toLowerCase();
      const fullText = `${titleText} ${descText}`;

      let parentCategory = "";
      let subCategory = "";
      let gender = "";

      // 1. EXTRAIR GÉNERO (Usamos 'as any' para contornar a tipagem estrita do hook t)
      if (/\b(homem|masculino|boy|men|rapaz)\b/i.test(fullText)) gender = t("Homem" as any);
      else if (/\b(mulher|feminino|girl|women|senhora|rapariga)\b/i.test(fullText)) gender = t("Mulher" as any);
      else if (/\b(crianca|criancas|infantil|kids|bebe|menino|menina|baby)\b/i.test(fullText)) gender = t("Criança" as any);

      // 2. EXTRAIR SUBCATEGORIA
      for (const rule of SUB_CATEGORY_RULES) {
        if (rule.regex.test(titleText) || rule.regex.test(descText)) {
          subCategory = t(rule.labelKey as any); 
          if (rule.genderForceKey && !gender) gender = t(rule.genderForceKey as any);
          
          if (rule.parentSlug) {
            if (PARENT_LABEL_MAP[rule.parentSlug]) {
              parentCategory = t(PARENT_LABEL_MAP[rule.parentSlug] as any); 
            } else if (FALLBACK_PARENTS[rule.parentSlug]) {
              parentCategory = t(FALLBACK_PARENTS[rule.parentSlug] as any);
            }
          }
          break; 
        }
      }

      // 3. EXTRAIR CATEGORIA PAI
      if (!parentCategory) {
        for (const parent of DYNAMIC_PARENTS) {
          if (parent.regex.test(titleText) || parent.regex.test(descText)) {
            parentCategory = t(parent.labelKey as any);
            break; 
          }
        }
      }

      if (!parentCategory) parentCategory = t("Catálogo Geral" as any);

      // 4. EXTRAIR TAMANHOS / PORÇÕES
      const sizes = new Set<string>();
      const sizePrefix = t("Tam:" as any); 
      
      const sizeRegex = /\b(?:tamanho|tam|size)\s*[:=]?\s*(pp|p|m|g|gg|xg|xs|s|l|xl|xxl|xxxl|[3-5][0-9])\b/gi;
      let match;
      while ((match = sizeRegex.exec(fullText)) !== null) {
        sizes.add(`${sizePrefix} ${match[1].toUpperCase()}`);
      }
      
      if (/\b(mini)\b/i.test(titleText)) sizes.add(t("Mini" as any));
      if (/\b(pequeno|small)\b/i.test(fullText)) sizes.add(t("Pequeno" as any));
      if (/\b(medio|medium)\b/i.test(fullText)) sizes.add(t("Médio" as any));
      if (/\b(grande|large|big)\b/i.test(fullText)) sizes.add(t("Grande" as any));
      if (/\b(fatia|slice)\b/i.test(fullText)) sizes.add(t("Fatia" as any));
      if (/\b(inteiro|whole)\b/i.test(fullText)) sizes.add(t("Inteiro" as any));
      
      if (/\b(plus size|tamanho grande)\b/i.test(fullText)) sizes.add(t("Plus Size" as any));
      if (/\b(tamanho unico|one size)\b/i.test(fullText)) sizes.add(t("Tam: Único" as any));

      // 5. EXTRAIR ATRIBUTOS
      const attributes = new Set<string>();
      ATTRIBUTE_MAP.forEach(attr => {
        if (attr.regex.test(fullText)) {
          attributes.add(t(attr.labelKey as any));
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
  }, [t]);

  return { enrichProductsIntelligently };
}