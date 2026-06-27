import { memo, useCallback, useMemo } from "react";
import { safeText, LIMITS } from "../../utils/text";
import type { SectionStyles } from "../sections/components/ProductShowcase";

interface HeaderTextProps {
  content: { title?: string; category?: string; description?: string };
  style: SectionStyles;
  isReadOnly: boolean;
  isDark: boolean;
  // Modificado aqui: aceita a assinatura flexível com parâmetros opcionais idêntica ao seu hook
  t: (key: any, variables?: Record<string, any>) => string;
  onUpdate?: (field: string, value: string) => void;
}

export const HeaderText = memo(function HeaderText({
  content,
  style,
  isReadOnly,
  isDark,
  t,
  onUpdate,
}: HeaderTextProps) {
  const alignCenter = style?.align === "center";

  const titleFontSize = useMemo(() => {
    const size = style?.fontSize || "medium";
    const map: Record<NonNullable<SectionStyles["fontSize"]>, string> = {
      small: "clamp(1.1rem, 5vw, 1.45rem)",
      base: "clamp(1.25rem, 5.5vw, 1.8rem)",
      medium: "clamp(1.4rem, 6vw, 2.15rem)",
      large: "clamp(1.55rem, 6.5vw, 2.55rem)",
    };
    return map[size];
  }, [style?.fontSize]);

  const descFontSize = useMemo(() => {
    const size = style?.fontSize || "medium";
    const map: Record<NonNullable<SectionStyles["fontSize"]>, string> = {
      small: "clamp(0.82rem, 3vw, 0.92rem)",
      base: "clamp(0.86rem, 3.2vw, 0.98rem)",
      medium: "clamp(0.9rem, 3.4vw, 1.02rem)",
      large: "clamp(0.92rem, 3.5vw, 1.05rem)",
    };
    return map[size];
  }, [style?.fontSize]);

  const preventEnter = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") e.preventDefault();
  }, []);

  const handleTextChange = useCallback(
    (field: string, value: string, limit: number) => {
      onUpdate?.(field, safeText(value, limit));
    },
    [onUpdate]
  );

  const readOnlyInput =
    "bg-transparent border-none p-0 m-0 resize-none focus:ring-0 cursor-default overflow-hidden block pointer-events-none";
  const editableInput =
    "w-full text-[16px] transition-colors duration-150 border-b border-transparent hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50/50 dark:hover:bg-white/5 focus:bg-transparent focus:border-blue-500 focus:ring-0 outline-none px-1 py-0.5 cursor-edit";

  const mobileSafeFont = (size: string) => `max(16px, ${size})`;

  return (
    <header className={`mb-5 md:mb-7 flex w-full flex-col ${alignCenter ? "items-center text-center" : "items-start text-left"}`}>
      <div className={`flex w-full max-w-3xl min-w-0 flex-col gap-1.5 ${alignCenter ? "mx-auto" : ""}`}>
        <input
          readOnly={isReadOnly}
          value={content?.category || ""}
          onKeyDown={preventEnter}
          onChange={(e) => handleTextChange("category", e.target.value, LIMITS.category)}
          placeholder={t("showcase_defaultCategory")}
          style={{ fontSize: isReadOnly ? undefined : "16px", WebkitTextSizeAdjust: "100%" }}
          className={`${isReadOnly ? readOnlyInput : editableInput} ${alignCenter ? "text-center" : ""} text-blue-500 dark:text-blue-400 font-black ${isReadOnly ? "text-[11px] md:text-xs" : "text-[16px]"} uppercase tracking-[0.16em] truncate max-w-full`}
        />

        <textarea
          readOnly={isReadOnly}
          value={content?.title || ""}
          onKeyDown={preventEnter}
          onChange={(e) => handleTextChange("title", e.target.value, LIMITS.title)}
          placeholder={t("showcase_defaultTitle")}
          rows={1}
          style={{ fontSize: isReadOnly ? titleFontSize : mobileSafeFont(titleFontSize), WebkitTextSizeAdjust: "100%" }}
          className={`${isReadOnly ? readOnlyInput : editableInput} ${alignCenter ? "text-center" : ""} font-extrabold tracking-tight leading-[1.05] uppercase resize-none max-w-full min-h-[2rem] line-clamp-2 break-words overflow-hidden`}
        />

        <textarea
          readOnly={isReadOnly}
          value={content?.description || ""}
          onKeyDown={preventEnter}
          onChange={(e) => handleTextChange("description", e.target.value, LIMITS.description)}
          placeholder={t("showcase_defaultDescription")}
          rows={2}
          style={{ fontSize: isReadOnly ? descFontSize : mobileSafeFont(descFontSize), WebkitTextSizeAdjust: "100%" }}
          className={`${isReadOnly ? readOnlyInput : editableInput} ${alignCenter ? "text-center mx-auto" : ""} ${isDark ? "text-zinc-400" : "text-zinc-500"} font-medium leading-snug max-w-2xl resize-none min-h-[2.6rem] line-clamp-2 break-words overflow-hidden`}
        />
      </div>
    </header>
  );
});