import { memo, useMemo, type ReactNode } from "react";
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
  t: (key: string, options?: { defaultValue?: string }) => string;
}

// 🎯 Regex unificado para números, quantias, porcentagens e termos financeiros (PT & EN)
const HIGHLIGHT_REGEX = new RegExp(
  "(" +
  // 1. Números, valores monetários, parcelas e porcentagens (ex: 50%, 1.500, R$ 50, 500 MT, $20, 2x)
  "(?:\\b\\d+[.,]?\\d*(?:%|x|mt|mzn|kz|usd|eur|\\$|€)?\\b)|" +
  // 2. Termos de Pagamento Antecipado / Sinal / Depósito (PT)
  "\\b(?:dep[oó]sito|adiantado|adiantamento|sinal|entrada|pagamento\\s*adiantado|pago\\s*adiantado|" +
  "metade\\s*do\\s*valor|taxa\\s*de\\s*reserva|garantia|pagamento\\s*parcial|" +
  "a\\s*vista|[àa]\\s*prazo|transfer[eê]ncia|dinheiro|valor\\s*restante|saldo\\s*devedor)\\b|" +
  // 3. Payment terms / In advance / Deposits (EN)
  "\\b(?:in\\s*advance|deposit|down\\s*payment|advance\\s*payment|upfront|prepayment|pre-payment|" +
  "paid\\s*in\\s*advance|partial\\s*payment|booking\\s*fee|reservation\\s*fee|" +
  "remaining\\s*balance|wire\\s*transfer|cash|full\\s*payment)\\b" +
  ")",
  "gi"
);

function highlightContent(text: string): ReactNode[] {
  if (!text) return [];
  const parts = text.split(HIGHLIGHT_REGEX);
  if (parts.length === 1) return [text];

  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return (
        <strong
          key={i}
          className="font-bold text-slate-900 dark:text-zinc-100"
        >
          {part}
        </strong>
      );
    }
    return part;
  });
}

const VALUE_TRANSLATION_RULES = [
  { regex: /^(?:tam(?:anho)?\s*[:=]?\s*)?(p|s|small)$/i, key: "val_p" },
  { regex: /^(?:tam(?:anho)?\s*[:=]?\s*)?(m|m[eé]dio|medium)$/i, key: "val_m" },
  { regex: /^(?:tam(?:anho)?\s*[:=]?\s*)?(g|l|grande|large)$/i, key: "val_g" },
  { regex: /^(?:tam(?:anho)?\s*[:=]?\s*)?(gg|xl|extra\s*grande)$/i, key: "val_gg" },
  { regex: /\b(tamanho\s*único|tamanho\s*unico|one\s*size|único|unico)\b/i, key: "val_onesize" },
  { regex: /\b(plus\s*size|tamanho\s*grande)\b/i, key: "val_plussize" },
  { regex: /\b(preto|preta|black)\b/i, key: "val_black" },
  { regex: /\b(branco|branca|white)\b/i, key: "val_white" },
  { regex: /\b(azul|blue)\b/i, key: "val_blue" },
  { regex: /\b(vermelho|vermelha|red)\b/i, key: "val_red" },
  { regex: /\b(rosa|pink)\b/i, key: "val_pink" },
  { regex: /\b(dourado|dourada|gold)\b/i, key: "val_gold" },
  { regex: /\b(verde|green)\b/i, key: "val_green" },
  { regex: /\b(cinza|gray|grey)\b/i, key: "val_gray" },
  { regex: /\b(infantil|criança|crianca|bebé|bebe|kids|baby)\b/i, key: "val_kids" },
  { regex: /\b(feminino|mulher|women|female)\b/i, key: "val_women" },
  { regex: /\b(masculino|homem|men|male)\b/i, key: "val_men" },
  { regex: /\b(unissexo|unisex)\b/i, key: "val_unisex" },
  { regex: /\b(adulto|adultos|adult|adults)\b/i, key: "val_adult" },
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
  return match ? t(match.key, { defaultValue: trimmed }) : trimmed;
}

function getItemVisuals(item: string, isSizeCategory: boolean, isColorCategory: boolean, t: any) {
  const raw = item.trim().toLowerCase();
  const translated = translateTagItem(item, t);

  if (isSizeCategory) {
    return {
      text: translated,
      chipClass: "bg-amber-50 text-amber-900 border-amber-200/80 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-800/50 font-semibold",
      dotClass: null,
    };
  }

  if (isColorCategory || /preto|black|branco|white|azul|blue|vermelh|red|rosa|pink|dourad|gold|verde|green|cinza|gray|grey/i.test(raw)) {
    if (/branco|white/i.test(raw)) {
      return {
        text: translated,
        chipClass: "bg-white text-zinc-900 border-zinc-300 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700 font-semibold",
        dotClass: "bg-white border border-zinc-400",
      };
    }
    if (/preto|black/i.test(raw)) {
      return {
        text: translated,
        chipClass: "bg-zinc-900 text-white border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:border-zinc-700 font-semibold",
        dotClass: "bg-zinc-950 border border-zinc-600",
      };
    }
    if (/azul|blue/i.test(raw)) {
      return {
        text: translated,
        chipClass: "bg-blue-50/80 text-blue-900 border-blue-200/80 dark:bg-blue-950/30 dark:text-blue-200 dark:border-blue-800/50 font-medium",
        dotClass: "bg-blue-500",
      };
    }
    if (/vermelh|red/i.test(raw)) {
      return {
        text: translated,
        chipClass: "bg-rose-50/80 text-rose-900 border-rose-200/80 dark:bg-rose-950/30 dark:text-rose-200 dark:border-rose-800/50 font-medium",
        dotClass: "bg-rose-500",
      };
    }
    if (/rosa|pink/i.test(raw)) {
      return {
        text: translated,
        chipClass: "bg-pink-50/80 text-pink-900 border-pink-200/80 dark:bg-pink-950/30 dark:text-pink-200 dark:border-pink-800/50 font-medium",
        dotClass: "bg-pink-400",
      };
    }
    if (/dourad|gold/i.test(raw)) {
      return {
        text: translated,
        chipClass: "bg-amber-50/80 text-amber-950 border-amber-200/80 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-800/50 font-medium",
        dotClass: "bg-amber-400",
      };
    }
    if (/verde|green/i.test(raw)) {
      return {
        text: translated,
        chipClass: "bg-emerald-50/80 text-emerald-950 border-emerald-200/80 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-800/50 font-medium",
        dotClass: "bg-emerald-500",
      };
    }
    if (/cinza|gray|grey/i.test(raw)) {
      return {
        text: translated,
        chipClass: "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800/70 dark:text-zinc-200 dark:border-zinc-700 font-medium",
        dotClass: "bg-zinc-400",
      };
    }
  }

  return {
    text: translated,
    chipClass: "bg-slate-100/90 text-slate-800 border-slate-200/90 dark:bg-zinc-800/70 dark:text-zinc-200 dark:border-zinc-700/80 font-medium",
    dotClass: null,
  };
}

function getSpecGroupConfig(label: string, t: any) {
  const l = label.toLowerCase();
  
  if (l.includes("tamanho") || l.includes("size") || l.includes("tam")) {
    return {
      isSize: true,
      isColor: false,
      translatedLabel: t("group_header_sizes", { defaultValue: label }),
      icon: <Ruler size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />,
    };
  }

  if (l.includes("público") || l.includes("publico") || l.includes("audience") || l.includes("genero") || l.includes("género")) {
    return {
      isSize: false,
      isColor: false,
      translatedLabel: t("group_header_audience", { defaultValue: label }),
      icon: <UserCheck size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />,
    };
  }

  if (l.includes("material") || l.includes("materiais")) {
    return {
      isSize: false,
      isColor: false,
      translatedLabel: t("group_header_materials", { defaultValue: label }),
      icon: <Layers size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />,
    };
  }

  if (l.includes("estilo") || l.includes("style")) {
    return {
      isSize: false,
      isColor: false,
      translatedLabel: t("group_header_styles", { defaultValue: label }),
      icon: <Shirt size={14} className="text-violet-600 dark:text-violet-400 shrink-0" />,
    };
  }

  if (l.includes("cor") || l.includes("cores") || l.includes("color")) {
    return {
      isSize: false,
      isColor: true,
      translatedLabel: t("group_header_colors", { defaultValue: label }),
      icon: <Palette size={14} className="text-rose-600 dark:text-rose-400 shrink-0" />,
    };
  }

  return {
    isSize: false,
    isColor: false,
    translatedLabel: label,
    icon: <Tag size={14} className="text-slate-500 dark:text-zinc-400 shrink-0" />,
  };
}

export const ProductDescription = memo(function ProductDescription({
  fullDescription,
  styles,
  t,
}: ProductDescriptionProps) {
  const { parsedParagraphs, specGroups } = useMemo(() => {
    if (!fullDescription) return { parsedParagraphs: [], specGroups: [] };

    const lines = fullDescription.split("\n");
    const userParagraphs: ReactNode[][] = [];
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
        userParagraphs.push(highlightContent(trimmed));
      }
    }

    return {
      parsedParagraphs: userParagraphs,
      specGroups: groups,
    };
  }, [fullDescription]);

  if (!fullDescription || (parsedParagraphs.length === 0 && specGroups.length === 0)) return null;

  return (
    <section
      className="border-t border-slate-200/80 pt-6 sm:pt-8 dark:border-zinc-800/80"
      style={{ contentVisibility: "auto", containIntrinsicSize: "0 180px" }}
    >
      <div className="max-w-3xl flex flex-col gap-4">
        
        {/* Cabeçalho Limpo */}
        <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2.5 dark:border-zinc-800/60">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 shrink-0">
            <Sparkles size={13} className="stroke-[2.2]" />
          </span>
          <h3 className={`text-xs font-bold uppercase tracking-wider ${styles.strongText}`}>
            {t("product_details_details", { defaultValue: "Sobre o Produto" })}
          </h3>
        </div>

        {/* 1. Descrição com Destaques de Termos e Números */}
        {parsedParagraphs.length > 0 && (
          <div className="relative space-y-2 pl-3.5 border-l-2 border-emerald-600/70 dark:border-emerald-500/70">
            {parsedParagraphs.map((nodes, idx) => (
              <p
                key={idx}
                className={`text-sm sm:text-[15px] leading-relaxed font-normal [overflow-wrap:anywhere] ${styles.mutedText}`}
              >
                {nodes}
              </p>
            ))}
          </div>
        )}

        {/* 2. Grid de Atributos */}
        {specGroups.length > 0 && (
          <div className="rounded-xl border border-slate-200/80 bg-white/90 dark:bg-zinc-900/50 dark:border-zinc-800/80 overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {specGroups.map((group, idx) => {
                const { icon, isSize, isColor, translatedLabel } = getSpecGroupConfig(group.label, t);

                return (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:px-4 sm:py-2.5 hover:bg-slate-50/60 dark:hover:bg-zinc-800/30"
                  >
                    <div className="flex items-center gap-2 shrink-0">
                      {icon}
                      <span className="text-xs font-semibold text-slate-600 dark:text-zinc-300">
                        {translatedLabel}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                      {group.items.map((item, itemIdx) => {
                        const { text, chipClass, dotClass } = getItemVisuals(item, isSize, isColor, t);

                        return (
                          <span
                            key={itemIdx}
                            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs border shadow-2xs ${chipClass}`}
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