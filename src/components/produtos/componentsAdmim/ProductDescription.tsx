import { memo, useMemo, useCallback, type ReactNode } from "react";
import { 
  Sparkles, 
  Ruler, 
  Layers, 
  Shirt, 
  Palette, 
  Tag, 
  Check, 
  Compass, 
  CheckCircle2
} from "lucide-react";
import { 
  translateTagItem, 
  getSpecGroupInfo, 
  getSmartTagEmoji 
} from "./productSpecUtils";

interface ProductDescriptionProps {
  fullDescription?: string | null;
  selectedOptions?: Record<string, string>;
  onSelectOption?: (groupLabel: string, value: string) => void;
  forceLightUI?: boolean;
  styles: {
    mutedText: string;
    strongText: string;
  };
  t: (key: string, options?: { defaultValue?: string }) => string;
}

const HIGHLIGHT_REGEX = new RegExp(
  "(" +
  "(?:\\b\\d+[.,]?\\d*(?:%|x|mt|mzn|kz|usd|eur|\\$|€)?\\b)|" +
  "\\b(?:dep[oó]sito|adiantado|adiantamento|sinal|entrada|pagamento\\s*adiantado|pago\\s*adiantado|" +
  "metade\\s*do\\s*valor|taxa\\s*de\\s*reserva|garantia|pagamento\\s*parcial|" +
  "a\\s*vista|[àa]\\s*prazo|transfer[eê]ncia|dinheiro|valor\\s*restante|saldo\\s*devedor)\\b|" +
  "\\b(?:in\\s*advance|deposit|down\\s*payment|advance\\s*payment|upfront|prepayment|pre-payment|" +
  "paid\\s*in\\s*advance|partial\\s*payment|booking\\s*fee|reservation\\s*fee|" +
  "remaining\\s*balance|wire\\s*transfer|cash|full\\s*payment)\\b" +
  ")",
  "gi"
);

function highlightContent(text: string, forceLight: boolean): ReactNode[] {
  if (!text) return [];
  const parts = text.split(HIGHLIGHT_REGEX);
  if (parts.length === 1) return [text];

  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return (
        <strong
          key={i}
          className={`font-black ${forceLight ? "text-slate-900" : "text-slate-900 dark:text-zinc-100"}`}
        >
          {part}
        </strong>
      );
    }
    return part;
  });
}

function getItemVisuals(
  item: string,
  groupType: "audience" | "size" | "color" | "material" | "style" | "generic",
  isSelected: boolean,
  isCrowded: boolean,
  forceLight: boolean,
  t: (key: string, options?: { defaultValue?: string }) => string
) {
  const raw = item.trim().toLowerCase();
  const translated = translateTagItem(item, t);
  const isColor = groupType === "color" || /preto|black|branco|white|azul|blue|vermelh|red|rosa|pink|dourad|gold|verde|green|cinza|gray|grey|amarel|yellow|laranja|orange|roxo|purple|bege|marrom/i.test(raw);

  // Evita duplicar a bolinha se já for categoria de cor
  const tagEmoji = isColor ? null : getSmartTagEmoji(item);

  const sizeClasses = isCrowded
    ? "px-2.5 py-1 text-[11px] gap-1.5 rounded-lg"
    : "px-3 py-1.5 text-xs gap-2 rounded-xl";

  if (isSelected) {
    return {
      text: translated,
      emoji: tagEmoji,
      chipClass: `bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs ${sizeClasses}`,
      dotClass: null,
    };
  }

  // Corrigido swatch visual único de cor
  let dotColor: string | null = null;
  if (isColor) {
    if (/branco|white/i.test(raw)) dotColor = "bg-white border border-slate-300 dark:border-zinc-500";
    else if (/preto|black/i.test(raw)) dotColor = "bg-slate-950 border border-slate-700 dark:bg-black dark:border-zinc-700";
    else if (/azul|blue/i.test(raw)) dotColor = "bg-blue-500";
    else if (/vermelh|red/i.test(raw)) dotColor = "bg-rose-500";
    else if (/rosa|pink/i.test(raw)) dotColor = "bg-pink-400";
    else if (/dourad|gold/i.test(raw)) dotColor = "bg-amber-400";
    else if (/verde|green/i.test(raw)) dotColor = "bg-emerald-500";
    else if (/amarel|yellow/i.test(raw)) dotColor = "bg-amber-300";
    else if (/laranja|orange/i.test(raw)) dotColor = "bg-orange-500";
    else if (/roxo|purple|lil[aá]s/i.test(raw)) dotColor = "bg-purple-500";
    else if (/marrom|brown|castanho/i.test(raw)) dotColor = "bg-amber-800";
    else if (/bege|beige|nude/i.test(raw)) dotColor = "bg-amber-200";
    else dotColor = "bg-slate-400";
  }

  // Cores de superfície: Branco no Light e Grafite Escuro no Dark
  const baseBg = forceLight
    ? "bg-white text-slate-800 border-slate-200/90 hover:border-slate-400 hover:bg-slate-50 shadow-2xs"
    : "bg-white text-slate-800 border-slate-200/90 hover:border-slate-400 hover:bg-slate-50 dark:bg-zinc-900/90 dark:text-zinc-200 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/80 shadow-2xs";

  return {
    text: translated,
    emoji: tagEmoji,
    chipClass: `${baseBg} font-medium ${sizeClasses}`,
    dotClass: dotColor,
  };
}

function renderGroupMeta(type: "size" | "audience" | "material" | "style" | "color" | "generic", forceLight: boolean) {
  switch (type) {
    case "size":
      return {
        icon: <Ruler size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />,
        accentBg: forceLight
          ? "bg-amber-50 text-amber-800 border border-amber-200/60"
          : "bg-amber-50 text-amber-800 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50",
      };
    case "material":
      return {
        icon: <Layers size={13} className="text-teal-600 dark:text-teal-400 shrink-0" />,
        accentBg: forceLight
          ? "bg-teal-50 text-teal-800 border border-teal-200/60"
          : "bg-teal-50 text-teal-800 border border-teal-200/60 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/50",
      };
    case "style":
      return {
        icon: <Shirt size={13} className="text-violet-600 dark:text-violet-400 shrink-0" />,
        accentBg: forceLight
          ? "bg-violet-50 text-violet-800 border border-violet-200/60"
          : "bg-violet-50 text-violet-800 border border-violet-200/60 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/50",
      };
    case "color":
      return {
        icon: <Palette size={13} className="text-rose-600 dark:text-rose-400 shrink-0" />,
        accentBg: forceLight
          ? "bg-rose-50 text-rose-800 border border-rose-200/60"
          : "bg-rose-50 text-rose-800 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50",
      };
    default:
      return {
        icon: <Tag size={13} className="text-slate-500 dark:text-zinc-400 shrink-0" />,
        accentBg: forceLight
          ? "bg-slate-100 text-slate-700 border border-slate-200"
          : "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
      };
  }
}

export const ProductDescription = memo(function ProductDescription({
  fullDescription,
  selectedOptions = {},
  onSelectOption,
  forceLightUI = false,
  styles,
  t,
}: ProductDescriptionProps) {
  const { parsedParagraphs, audienceGroup, interactiveGroups } = useMemo(() => {
    if (!fullDescription) return { parsedParagraphs: [], audienceGroup: null, interactiveGroups: [] };

    const lines = fullDescription.split("\n");
    const userParagraphs: ReactNode[][] = [];
    let audience: { label: string; items: string[] } | null = null;
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
          const info = getSpecGroupInfo(label, t);
          if (info.isAudience) {
            audience = { label, items };
          } else {
            groups.push({ label, items });
          }
        }
      } else {
        userParagraphs.push(highlightContent(trimmed, forceLightUI));
      }
    }

    return {
      parsedParagraphs: userParagraphs,
      audienceGroup: audience,
      interactiveGroups: groups,
    };
  }, [fullDescription, forceLightUI, t]);

  const handleTagClick = useCallback((groupLabel: string, item: string) => {
    if (onSelectOption) {
      onSelectOption(groupLabel, item);
    }
  }, [onSelectOption]);

  if (!fullDescription || (parsedParagraphs.length === 0 && interactiveGroups.length === 0 && !audienceGroup)) return null;

  return (
    <section
      style={{ contain: "layout style paint" }}
      className={`border-t pt-4 sm:pt-5 ${
        forceLightUI ? "border-slate-200/80" : "border-slate-200/80 dark:border-zinc-800/80"
      }`}
    >
      <div className="max-w-3xl flex flex-col gap-3">
        
        {/* Cabeçalho */}
        <div className={`flex items-center justify-between border-b pb-2 ${
          forceLightUI ? "border-slate-200/70" : "border-slate-200/70 dark:border-zinc-800/70"
        }`}>
          <div className="flex items-center gap-1.5">
            <span className={`flex h-5 w-5 items-center justify-center rounded-lg border shrink-0 ${
              forceLightUI 
                ? "bg-emerald-50 text-emerald-600 border-emerald-200/60" 
                : "bg-emerald-50 text-emerald-600 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40"
            }`}>
              <Sparkles size={11} className="stroke-[2.2]" />
            </span>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${styles.strongText}`}>
              {t("product_details_details", { defaultValue: "Sobre o Produto" })}
            </h3>
          </div>

          {interactiveGroups.length > 0 && (
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full select-none ${
              forceLightUI
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200/70"
                : "bg-emerald-50 text-emerald-800 border border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50"
            }`}>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>{t("tap_to_customize", { defaultValue: "Personalize abaixo" })}</span>
            </span>
          )}
        </div>

        {/* 1. Audiência - Minimalista, sem poluição */}
        {audienceGroup && (
          <div className={`flex items-center flex-wrap gap-2 px-3 py-2 rounded-xl border ${
            forceLightUI
              ? "bg-slate-50/80 border-slate-200/90 text-slate-800"
              : "bg-slate-50/80 border-slate-200/90 text-slate-800 dark:bg-zinc-900/60 dark:border-zinc-800 dark:text-zinc-200"
          }`}>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 shrink-0">
              <Compass size={13} className="text-slate-400 dark:text-zinc-500 shrink-0" />
              <span>{t("audience_target_title", { defaultValue: "Ideal para" })}:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {audienceGroup.items.map((item, idx) => {
                const translated = translateTagItem(item, t);
                const emoji = getSmartTagEmoji(item);

                return (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-semibold border ${
                      forceLightUI
                        ? "bg-white text-slate-800 border-slate-200/80 shadow-2xs"
                        : "bg-white text-slate-800 border-slate-200/80 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 shadow-2xs"
                    }`}
                  >
                    {emoji && <span className="text-xs leading-none shrink-0">{emoji}</span>}
                    <span>{translated}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Descrição Geral em Texto */}
        {parsedParagraphs.length > 0 && (
          <div className="space-y-1.5 pl-3 border-l-2 border-emerald-500/80">
            {parsedParagraphs.map((nodes, idx) => (
              <p
                key={idx}
                className={`text-xs sm:text-[13px] leading-relaxed font-normal [overflow-wrap:anywhere] ${styles.mutedText}`}
              >
                {nodes}
              </p>
            ))}
          </div>
        )}

        {/* 3. Grupos Interativos com Dark Mode real e sem estragar layout */}
        {interactiveGroups.length > 0 && (
          <div className="flex flex-col gap-2.5 w-full min-w-0">
            {interactiveGroups.map((group, idx) => {
              const info = getSpecGroupInfo(group.label, t);
              const currentSelected = selectedOptions[group.label];
              const meta = renderGroupMeta(info.type, forceLightUI);
              const isCrowded = group.items.length > 4;

              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-colors ${
                    isCrowded ? "p-2 sm:px-3 sm:py-2.5 gap-1.5" : "p-3 sm:px-3.5 sm:py-3 gap-2"
                  } flex flex-col w-full min-w-0 ${
                    forceLightUI
                      ? "bg-white border-slate-200/80 shadow-2xs"
                      : "bg-white border-slate-200/80 dark:bg-zinc-900/60 dark:border-zinc-800 shadow-2xs"
                  }`}
                >
                  {/* Cabeçalho do Bloco */}
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0 truncate">
                      <span className={`flex h-5 w-5 items-center justify-center rounded-md shrink-0 ${meta.accentBg}`}>
                        {meta.icon}
                      </span>
                      <span className={`text-[11px] font-bold uppercase tracking-wider truncate ${
                        forceLightUI ? "text-slate-800" : "text-slate-800 dark:text-zinc-200"
                      }`}>
                        {info.translatedLabel}
                      </span>
                    </div>

                    <div className="shrink-0">
                      {currentSelected ? (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          forceLightUI
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200/80 shadow-2xs"
                            : "bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50 shadow-2xs"
                        }`}>
                          <CheckCircle2 size={10} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <span className="truncate max-w-[120px]">{translateTagItem(currentSelected, t)}</span>
                        </span>
                      ) : (
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                          forceLightUI
                            ? "bg-slate-50 text-slate-500 border-slate-200/70"
                            : "bg-slate-50 text-slate-500 border-slate-200/70 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
                        }`}>
                          {t("status_select_one", { defaultValue: "Escolha uma opção" })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pílulas de Seleção (Bolinha única para cor, emoji para outros) */}
                  <div className={`flex flex-wrap items-center w-full min-w-0 ${isCrowded ? "gap-1 pt-0.5" : "gap-1.5 pt-0.5"}`}>
                    {group.items.map((item, itemIdx) => {
                      const isSelected = currentSelected === item;
                      const { text, emoji, chipClass, dotClass } = getItemVisuals(item, info.type, isSelected, isCrowded, forceLightUI, t);

                      return (
                        <button
                          key={itemIdx}
                          type="button"
                          onClick={() => handleTagClick(group.label, item)}
                          aria-pressed={isSelected}
                          aria-label={`${info.translatedLabel}: ${text}`}
                          className={`inline-flex items-center border transition-all active:scale-[0.98] select-none cursor-pointer max-w-full truncate ${chipClass}`}
                        >
                          {isSelected ? (
                            <Check size={11} strokeWidth={3} className="shrink-0 text-white" />
                          ) : (
                            <>
                              {dotClass && <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${dotClass}`} />}
                              {emoji && <span className="text-xs leading-none shrink-0">{emoji}</span>}
                            </>
                          )}
                          <span className="font-semibold truncate">{text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
});

ProductDescription.displayName = "ProductDescription";