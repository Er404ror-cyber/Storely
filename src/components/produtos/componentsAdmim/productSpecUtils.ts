import { 
    ALL_TAGS, 
    GROUP_CONFIG, 
    type SmartTagDefinition 
  } from "../ProductForm/productTags";
  
  // Mapeamento automático O(1) de regex e chaves gerado direto de ALL_TAGS
  export function findSmartTag(rawItem: string): SmartTagDefinition | undefined {
    const trimmed = rawItem.trim();
    return ALL_TAGS.find((tag) => tag.regex.test(trimmed));
  }
  
  // Tradução dinâmica: se adicionar qualquer tag no array, traduz imediatamente
  export function translateTagItem(
    item: string,
    t: (key: string, options?: { defaultValue?: string }) => string
  ): string {
    const trimmed = item.trim();
    const match = findSmartTag(trimmed);
    if (match) {
      return t(match.valueKey, { defaultValue: match.defaultValue });
    }
    return trimmed;
  }
  
  // Extrai o emoji ou ícone padrão que definiu na tag
  export function getSmartTagEmoji(rawItem: string): string | null {
    const match = findSmartTag(rawItem);
    if (!match) return null;
    // Extrai o primeiro emoji/símbolo se existir no defaultLabel
    const emojiMatch = match.defaultLabel.match(/^(\p{Extended_Pictographic}|\p{Emoji})/u);
    return emojiMatch ? emojiMatch[0] : null;
  }
  
  // Identifica o grupo usando as chaves reais de GROUP_CONFIG
  export function getSpecGroupInfo(
    label: string,
    t: (key: string, options?: { defaultValue?: string }) => string
  ) {
    const l = label.toLowerCase();
  
    if (/público|publico|alvo|audience|género|genero|ocasi/i.test(l)) {
      return {
        isSize: false,
        isColor: false,
        isAudience: true,
        translatedLabel: t(GROUP_CONFIG.audience.headerKey, { defaultValue: GROUP_CONFIG.audience.defaultHeader }),
        type: "audience" as const,
      };
    }
  
    if (/tamanho|capacidade|porç|size|tam|peso|medida/i.test(l)) {
      return {
        isSize: true,
        isColor: false,
        isAudience: false,
        translatedLabel: t(GROUP_CONFIG.sizes.headerKey, { defaultValue: GROUP_CONFIG.sizes.defaultHeader }),
        type: "size" as const,
      };
    }
  
    if (/material|materiais|sabor|sabores|recheio|ingrediente/i.test(l)) {
      return {
        isSize: false,
        isColor: false,
        isAudience: false,
        translatedLabel: t(GROUP_CONFIG.materials.headerKey, { defaultValue: GROUP_CONFIG.materials.defaultHeader }),
        type: "material" as const,
      };
    }
  
    if (/estilo|condiç|condicao|preparaç|style|dieta/i.test(l)) {
      return {
        isSize: false,
        isColor: false,
        isAudience: false,
        translatedLabel: t(GROUP_CONFIG.styles.headerKey, { defaultValue: GROUP_CONFIG.styles.defaultHeader }),
        type: "style" as const,
      };
    }
  
    if (/cor|cores|color|tonalidade/i.test(l)) {
      return {
        isSize: false,
        isColor: true,
        isAudience: false,
        translatedLabel: t(GROUP_CONFIG.colors.headerKey, { defaultValue: GROUP_CONFIG.colors.defaultHeader }),
        type: "color" as const,
      };
    }
  
    return {
      isSize: false,
      isColor: false,
      isAudience: false,
      translatedLabel: label,
      type: "generic" as const,
    };
  }