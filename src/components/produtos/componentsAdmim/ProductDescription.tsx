import { memo, useMemo } from "react";
import { 
  Sparkles, 
  Ruler, 
  UserCheck, 
  Layers, 
  Shirt, 
  Palette, 
  Tag 
} from "lucide-react";

interface ProductDescriptionProps {
  fullDescription?: string | null;
  styles: {
    mutedText: string;
    strongText: string;
  };
  t: any;
}

// 🎯 Regras de tradução dinâmica para valores de tags
const VALUE_TRANSLATION_RULES = [
  // Tamanhos
  { regex: /^(?:tam(?:anho)?\s*[:=]?\s*)?(p|s|small)$/i, key: "val_p" },
  { regex: /^(?:tam(?:anho)?\s*[:=]?\s*)?(m|m[eé]dio|medium)$/i, key: "val_m" },
  { regex: /^(?:tam(?:anho)?\s*[:=]?\s*)?(g|l|grande|large)$/i, key: "val_g" },
  { regex: /^(?:tam(?:anho)?\s*[:=]?\s*)?(gg|xl|extra\s*grande)$/i, key: "val_gg" },
  { regex: /\b(tamanho\s*único|tamanho\s*unico|one\s*size|único|unico)\b/i, key: "val_onesize" },
  { regex: /\b(plus\s*size|tamanho\s*grande)\b/i, key: "val_plussize" },
  
  // Cores
  { regex: /\b(preto|preta|black)\b/i, key: "val_black" },
  { regex: /\b(branco|branca|white)\b/i, key: "val_white" },
  { regex: /\b(azul|blue)\b/i, key: "val_blue" },
  { regex: /\b(vermelho|vermelha|red)\b/i, key: "val_red" },
  { regex: /\b(rosa|pink)\b/i, key: "val_pink" },
  { regex: /\b(dourado|dourada|gold)\b/i, key: "val_gold" },

  // Público
  { regex: /\b(infantil|criança|crianca|bebé|bebe|kids|baby)\b/i, key: "val_kids" },
  { regex: /\b(feminino|mulher|women|female)\b/i, key: "val_women" },
  { regex: /\b(masculino|homem|men|male)\b/i, key: "val_men" },
  { regex: /\b(unissexo|unisex)\b/i, key: "val_unisex" },
  { regex: /\b(adulto|adultos|adult|adults)\b/i, key: "val_adult" },

  // Estilos & Materiais
  { regex: /\b(casual|dia\s*a\s*dia|everyday)\b/i, key: "val_casual" },
  { regex: /\b(social|trabalho|formal|work)\b/i, key: "val_social" },
  { regex: /\b(treino|fitness|academia|workout)\b/i, key: "val_fitness" },
  { regex: /\b(festa|eventos?|party)\b/i, key: "val_party" },
  { regex: /\b(kit|combo)\b/i, key: "val_combo" },
  { regex: /\b(100%\s*algod[aã]o|algod[aã]o|cotton)\b/i, key: "val_cotton" },
  { regex: /\b(couro|pele|leather)\b/i, key: "val_leather" },
  { regex: /\b(jeans|denim|ganga)\b/i, key: "val_jeans" },
];

function translateTagItem(item: string, t: any): string {
  const trimmed = item.trim();
  const match = VALUE_TRANSLATION_RULES.find((rule) => rule.regex.test(trimmed));
  return match ? t(match.key as any, { defaultValue: trimmed }) : trimmed;
}

// 🎨 Cores reais e naturais por item
function getItemVisuals(item: string, isSizeCategory: boolean, isColorCategory: boolean, defaultClass: string, t: any) {
  const raw = item.trim().toLowerCase();
  const translated = translateTagItem(item, t);

  // 1. TAMANHOS: Mantém a cor Âmbar natural
  if (isSizeCategory) {
    return {
      text: translated,
      chipClass: "bg-amber-100/70 text-amber-950 border-amber-200/80 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-700/60 font-bold",
      dotClass: null,
    };
  }

  // 2. CORES: Cores fiéis (Branco permanece branco com alto contraste em ambos os temas)
  if (isColorCategory || /preto|black|branco|white|azul|blue|vermelh|red|rosa|pink|dourad|gold|verde|green|cinza|gray|grey/i.test(raw)) {
    // BRANCO: Fundo branco real com borda e texto escuro
    if (/branco|white/i.test(raw)) {
      return {
        text: translated,
        chipClass: "bg-white text-zinc-900 border-zinc-300 dark:bg-white dark:text-zinc-950 dark:border-zinc-300 font-bold shadow-2xs",
        dotClass: "bg-white border border-zinc-400",
      };
    }
    // PRETO: Fundo preto real em ambos os temas
    if (/preto|black/i.test(raw)) {
      return {
        text: translated,
        chipClass: "bg-zinc-950 text-white border-zinc-800 dark:bg-black dark:text-white dark:border-zinc-700 font-bold shadow-2xs",
        dotClass: "bg-black border border-zinc-600",
      };
    }
    if (/azul|blue/i.test(raw)) {
      return {
        text: translated,
        chipClass: "bg-blue-50/90 text-blue-900 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800/60 font-bold",
        dotClass: "bg-blue-500",
      };
    }
    if (/vermelh|red/i.test(raw)) {
      return {
        text: translated,
        chipClass: "bg-rose-50/90 text-rose-900 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800/60 font-bold",
        dotClass: "bg-rose-500",
      };
    }
    if (/rosa|pink/i.test(raw)) {
      return {
        text: translated,
        chipClass: "bg-pink-50/90 text-pink-900 border-pink-200/80 dark:bg-pink-950/40 dark:text-pink-200 dark:border-pink-800/60 font-bold",
        dotClass: "bg-pink-400",
      };
    }
    if (/dourad|gold/i.test(raw)) {
      return {
        text: translated,
        chipClass: "bg-amber-50/90 text-amber-950 border-amber-200/90 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800/60 font-bold",
        dotClass: "bg-amber-400",
      };
    }
    if (/verde|green/i.test(raw)) {
      return {
        text: translated,
        chipClass: "bg-emerald-50/90 text-emerald-950 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800/60 font-bold",
        dotClass: "bg-emerald-500",
      };
    }
    if (/cinza|gray|grey/i.test(raw)) {
      return {
        text: translated,
        chipClass: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 font-bold",
        dotClass: "bg-slate-400",
      };
    }
  }

  return {
    text: translated,
    chipClass: defaultClass,
    dotClass: null,
  };
}

// 🏷️ Configuração de cabeçalho e categoria
function getSpecGroupConfig(label: string, t: any) {
  const l = label.toLowerCase();
  const isSize = l.includes("tamanho") || l.includes("size") || l.includes("tam");
  const isColor = l.includes("cor") || l.includes("cores") || l.includes("color");

  // Tamanhos (Âmbar)
  if (isSize) {
    return {
      isSize: true,
      isColor: false,
      translatedLabel: t("group_header_sizes" as any, { defaultValue: label }),
      icon: <Ruler size={13.5} className="text-amber-600 dark:text-amber-400 shrink-0" />,
      defaultTagClass: "bg-amber-100/70 text-amber-950 border-amber-200/80 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-700/60 font-bold",
    };
  }

  // Público (Índigo)
  if (l.includes("público") || l.includes("publico") || l.includes("audience") || l.includes("genero") || l.includes("género")) {
    return {
      isSize: false,
      isColor: false,
      translatedLabel: t("group_header_audience" as any, { defaultValue: label }),
      icon: <UserCheck size={13.5} className="text-indigo-600 dark:text-indigo-400 shrink-0" />,
      defaultTagClass: "bg-slate-100 text-slate-800 border-slate-200/80 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 font-bold",
    };
  }

  // Material (Verde Esmeralda)
  if (l.includes("material") || l.includes("materiais")) {
    return {
      isSize: false,
      isColor: false,
      translatedLabel: t("group_header_materials" as any, { defaultValue: label }),
      icon: <Layers size={13.5} className="text-emerald-600 dark:text-emerald-400 shrink-0" />,
      defaultTagClass: "bg-slate-100 text-slate-800 border-slate-200/80 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 font-bold",
    };
  }

  // Estilo (Violeta)
  if (l.includes("estilo") || l.includes("style")) {
    return {
      isSize: false,
      isColor: false,
      translatedLabel: t("group_header_styles" as any, { defaultValue: label }),
      icon: <Shirt size={13.5} className="text-violet-600 dark:text-violet-400 shrink-0" />,
      defaultTagClass: "bg-slate-100 text-slate-800 border-slate-200/80 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 font-bold",
    };
  }

  // Cores (Rosa)
  if (isColor) {
    return {
      isSize: false,
      isColor: true,
      translatedLabel: t("group_header_colors" as any, { defaultValue: label }),
      icon: <Palette size={13.5} className="text-rose-600 dark:text-rose-400 shrink-0" />,
      defaultTagClass: "bg-slate-100 text-slate-800 border-slate-200/80 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 font-bold",
    };
  }

  return {
    isSize: false,
    isColor: false,
    translatedLabel: label,
    icon: <Tag size={13.5} className="text-slate-500 dark:text-zinc-400 shrink-0" />,
    defaultTagClass: "bg-slate-100 text-slate-800 border-slate-200/80 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 font-bold",
  };
}

export const ProductDescription = memo(function ProductDescription({
  fullDescription,
  styles,
  t,
}: ProductDescriptionProps) {
  // Parsing em passagem linear única: zero consumo de CPU/GPU em re-renders ou scroll
  const { mainText, specGroups } = useMemo(() => {
    if (!fullDescription) return { mainText: "", specGroups: [] };

    const lines = fullDescription.split("\n");
    const userLines: string[] = [];
    const groups: Array<{ label: string; items: string[] }> = [];

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (!trimmed) continue;

      const specMatch = trimmed.match(/^[•\-*]\s*([^:]+):\s*(.+)$/);
      if (specMatch) {
        const label = specMatch[1].trim();
        const items = specMatch[2]
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        if (items.length > 0) {
          groups.push({ label, items });
        }
      } else {
        userLines.push(trimmed);
      }
    }

    return {
      mainText: userLines.join("\n\n"),
      specGroups: groups,
    };
  }, [fullDescription]);

  if (!fullDescription || (!mainText && specGroups.length === 0)) return null;

  return (
    <section
      className="mt-10 md:mt-16 border-t border-slate-200/80 pt-7 md:pt-10 dark:border-zinc-800/80 px-4 md:px-0"
      style={{ contentVisibility: "auto", containIntrinsicSize: "0 180px" }}
    >
      <div className="max-w-3xl flex flex-col gap-5 sm:gap-6">
        
        {/* Cabeçalho Limpo */}
        <div className="flex items-center gap-2 border-b border-slate-200/60 pb-3 dark:border-zinc-800/60">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400 shrink-0">
            <Sparkles size={13} className="stroke-[2.5]" />
          </span>
          <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${styles.strongText}`}>
            {t("product_details_details" as any, { defaultValue: "Especificações & Detalhes" })}
          </h3>
        </div>

        {/* 1. Descrição do Usuário em Primeiro Lugar */}
        {mainText && (
          <div className="relative pl-4 sm:pl-4.5 border-l-[3px] border-slate-900 dark:border-blue-500 pt-0.5">
            <p
              className={`text-[15px] sm:text-[16px] leading-[1.75] font-normal whitespace-pre-wrap [overflow-wrap:anywhere] ${styles.mutedText}`}
            >
              {mainText}
            </p>
          </div>
        )}

        {/* 2. Lista Estruturada com Cores Naturais e Suporte Preciso a Branco e Preto */}
        {specGroups.length > 0 && (
          <div className="rounded-2xl border border-slate-200/80 bg-white dark:bg-zinc-900/60 dark:border-zinc-800/80 overflow-hidden shadow-2xs">
            <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {specGroups.map((group, idx) => {
                const { icon, isSize, isColor, defaultTagClass, translatedLabel } = getSpecGroupConfig(group.label, t);

                return (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 p-3 sm:px-4 sm:py-3 transition-colors duration-100 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30"
                  >
                    {/* Cabeçalho do Atributo */}
                    <div className="flex items-center gap-2 shrink-0">
                      {icon}
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        {translatedLabel}
                      </span>
                    </div>

                    {/* Chips com Tratamento de Cores e Tamanhos */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                      {group.items.map((item, itemIdx) => {
                        const { text, chipClass, dotClass } = getItemVisuals(item, isSize, isColor, defaultTagClass, t);

                        return (
                          <span
                            key={itemIdx}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs tracking-tight border shadow-2xs transition-transform duration-100 active:scale-95 ${chipClass}`}
                          >
                            {dotClass && <span className={`h-2 w-2 rounded-full shrink-0 ${dotClass}`} />}
                            {text}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  );
});