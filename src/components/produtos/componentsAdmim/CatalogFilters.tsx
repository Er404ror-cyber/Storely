import { useMemo, useCallback } from "react";
import { Filter, X, Sparkles, Check } from "lucide-react";
import { useTranslate } from "../../../context/LanguageContext";

interface FilterProps {
  products: any[];
  activeParent: string;
  setActiveParent: (v: string) => void;
  activeChild: string;
  setActiveChild: (v: string) => void;
  activeAttribute: string;
  setActiveAttribute: (v: string) => void;
  isDark?: boolean;
}

export function CatalogFilters({
  products,
  activeParent,
  setActiveParent,
  activeChild,
  setActiveChild,
  activeAttribute,
  setActiveAttribute,
  isDark
}: FilterProps) {
  const { t } = useTranslate();

  // TRADUÇÕES BASE MEMOIZADAS
  const labelAll = t("filter_all" as any) || t("Todos" as any) || "Todos";
  const labelSubcategories = t("filter_subcategories" as any) || "Subcategorias:";
  const labelAllSub = t("filter_all_sub" as any) || "Todas";
  const labelClear = t("filter_clear" as any) || "Limpar";
  const labelKid = useMemo(() => (t("gender_kid" as any) || t("Criança" as any) || "Criança").toLowerCase(), [t]);

  // Helper leve para formatação sem peso na CPU
  const formatTagLabel = useCallback((label: string) => {
    if (!label) return "";
    const translated = t(label as any);
    return (translated && translated !== label) ? translated : label;
  }, [t]);

  // 1. ESTRUTURA HIERÁRQUICA (Processada em 1 ciclo único)
  const hierarchy = useMemo(() => {
    if (!products || !products.length) return [];
    
    const map = new Map<string, Set<string>>();
    
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const parent = p.metadata?.parentCategory;
      const child = p.metadata?.subCategory;
      if (parent) {
        let set = map.get(parent);
        if (!set) {
          set = new Set();
          map.set(parent, set);
        }
        if (child) set.add(child);
      }
    }

    return Array.from(map.entries())
      .map(([parent, childrenSet]) => ({
        parent,
        children: Array.from(childrenSet).sort()
      }))
      .sort((a, b) => a.parent.localeCompare(b.parent));
  }, [products]);

  // Lista de subcategorias da categoria Pai ativa
  const activeParentChildren = useMemo(() => {
    if (activeParent === "Todos" || activeParent === labelAll) return [];
    const group = hierarchy.find(g => g.parent === activeParent);
    return group ? group.children : [];
  }, [hierarchy, activeParent, labelAll]);

  // 2. ATRIBUTOS DISPONÍVEIS (Iteração otimizada)
  const availableAttributes = useMemo(() => {
    if ((activeParent === "Todos" || activeParent === labelAll) && !activeChild) return [];
    
    const isParentAll = activeParent === "Todos" || activeParent === labelAll;
    const activeParentLower = activeParent.toLowerCase();
    const activeChildLower = activeChild.toLowerCase();

    const genders = new Set<string>();
    const sizes = new Set<string>();
    const others = new Set<string>();

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const meta = p.metadata;

      if (!isParentAll && meta?.parentCategory !== activeParent) continue;
      if (activeChild && meta?.subCategory !== activeChild) continue;

      const productGender = meta?.gender || p.gender || "";
      const isKidProduct = productGender.toLowerCase() === labelKid;

      // Trava de segurança para Criança
      if (activeParentLower === labelKid || activeChildLower === labelKid) {
        if (!isKidProduct) continue;
      }

      if (productGender) genders.add(productGender);
      if (meta?.sizes) {
        for (let j = 0; j < meta.sizes.length; j++) sizes.add(meta.sizes[j]);
      }
      if (meta?.attributes) {
        for (let k = 0; k < meta.attributes.length; k++) others.add(meta.attributes[k]);
      }
    }

    return [
      ...Array.from(genders).sort(),
      ...Array.from(sizes).sort(),
      ...Array.from(others).sort()
    ];
  }, [products, activeParent, activeChild, labelAll, labelKid]);

  // HANDLERS MEMOIZADOS (Evita alocação de memória a cada render)
  const handleTodosClick = useCallback(() => {
    setActiveParent("Todos");
    setActiveChild("");
    setActiveAttribute("");
  }, [setActiveParent, setActiveChild, setActiveAttribute]);

  const handleParentClick = useCallback((parent: string) => {
    if (activeParent === parent) {
      handleTodosClick();
    } else {
      setActiveParent(parent);
      setActiveChild("");
      setActiveAttribute("");
    }
  }, [activeParent, handleTodosClick, setActiveParent, setActiveChild, setActiveAttribute]);

  const handleChildClick = useCallback((child: string) => {
    if (activeChild === child) {
      setActiveChild("");
      setActiveAttribute("");
    } else {
      setActiveChild(child);
      setActiveAttribute("");
    }
  }, [activeChild, setActiveChild, setActiveAttribute]);

  const activeFiltersCount = (activeParent !== "Todos" && activeParent !== labelAll ? 1 : 0) + (activeChild ? 1 : 0) + (activeAttribute ? 1 : 0);
  const hasActiveFilters = activeFiltersCount > 0;

  if (hierarchy.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5 mb-6 select-none w-full contain-paint">
      
      {/* NÍVEL 1: CATEGORIAS PRINCIPAIS (ACELERADO POR GPU) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-0.5 transform-gpu will-change-transform">
        
        {/* BOTÃO TODOS */}
        <button
          onClick={handleTodosClick}
          className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border ${
            activeParent === "Todos" || activeParent === labelAll
              ? (isDark 
                  ? "bg-white text-zinc-950 border-white" 
                  : "bg-zinc-950 text-white border-zinc-950 shadow-xs")
              : (isDark 
                  ? "bg-zinc-900/90 text-zinc-300 border-zinc-800" 
                  : "bg-white text-zinc-700 border-zinc-200 shadow-xs")
          }`}
        >
          <Sparkles size={13} className={(activeParent === "Todos" || activeParent === labelAll) ? (isDark ? "text-amber-500" : "text-amber-400") : "text-zinc-400"} />
          <span>{labelAll}</span>
        </button>

        {/* LISTA DE CATEGORIAS PAIS */}
        {hierarchy.map((group) => {
          const isActive = activeParent === group.parent;

          return (
            <button
              key={group.parent}
              onClick={() => handleParentClick(group.parent)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border ${
                isActive
                  ? (isDark 
                      ? "bg-white text-zinc-950 border-white" 
                      : "bg-zinc-950 text-white border-zinc-950 shadow-xs")
                  : (isDark 
                      ? "bg-zinc-900/90 text-zinc-300 border-zinc-800" 
                      : "bg-white text-zinc-700 border-zinc-200 shadow-xs")
              }`}
            >
              {formatTagLabel(group.parent)}
            </button>
          );
        })}
      </div>

      {/* NÍVEL 2: SUBCATEGORIAS (LEVE, SEM BACKDROP-BLUR) */}
      {activeParentChildren.length > 0 && (
        <div className={`flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-3 rounded-xl border transform-gpu ${
          isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-100 border-zinc-200"
        }`}>
          <span className={`text-[10px] uppercase tracking-wider font-extrabold mr-1 shrink-0 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
            {labelSubcategories}
          </span>

          <button
            onClick={() => { setActiveChild(""); setActiveAttribute(""); }}
            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition-colors border ${
              activeChild === ""
                ? (isDark ? "bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold" : "bg-amber-500 text-white border-amber-500 font-bold")
                : (isDark ? "bg-transparent text-zinc-400 border-transparent" : "bg-transparent text-zinc-600 border-transparent")
            }`}
          >
            {labelAllSub}
          </button>

          {activeParentChildren.map(child => {
            const isChildActive = activeChild === child;

            return (
              <button
                key={child}
                onClick={() => handleChildClick(child)}
                className={`shrink-0 flex items-center gap-1 rounded-full px-3.5 py-1 text-[11px] font-semibold transition-colors border ${
                  isChildActive
                    ? (isDark ? "bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold" : "bg-amber-500 text-white border-amber-500 font-bold")
                    : (isDark ? "bg-zinc-800 text-zinc-300 border-zinc-700" : "bg-white text-zinc-700 border-zinc-200")
                }`}
              >
                {isChildActive && <Check size={11} className="stroke-[3]" />}
                <span>{formatTagLabel(child)}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* NÍVEL 3: FILTROS DE ATRIBUTO & LIMPEZA */}
      {(availableAttributes.length > 0 || hasActiveFilters) && (
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pt-0.5 transform-gpu">
          
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <Filter size={12} className={`shrink-0 mr-1 ${isDark ? "text-zinc-500" : "text-zinc-400"}`} />
            
            {availableAttributes.map(attr => {
              const isAttrActive = activeAttribute === attr;

              return (
                <button
                  key={attr}
                  onClick={() => setActiveAttribute(isAttrActive ? "" : attr)}
                  className={`shrink-0 flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider transition-colors border ${
                    isAttrActive
                      ? (isDark ? "border-emerald-500/60 text-emerald-400 bg-emerald-500/20" : "border-emerald-600 text-emerald-800 bg-emerald-50")
                      : (isDark ? "border-zinc-800 text-zinc-400 bg-zinc-900" : "border-zinc-200 text-zinc-600 bg-white")
                  }`}
                >
                  {isAttrActive && <Check size={10} className="stroke-[3]" />}
                  <span>{formatTagLabel(attr)}</span>
                </button>
              );
            })}
          </div>

          {/* BOTÃO LIMPAR FILTROS */}
          {hasActiveFilters && (
            <button
              onClick={handleTodosClick}
              className={`shrink-0 flex items-center gap-1 ml-auto px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                isDark 
                  ? "border-rose-900/50 text-rose-400 bg-rose-950/40" 
                  : "border-rose-200 text-rose-700 bg-rose-50"
              }`}
            >
              <X size={11} />
              <span>{labelClear}</span>
              <span className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
                isDark ? "bg-rose-900 text-rose-200" : "bg-rose-200 text-rose-800"
              }`}>
                {activeFiltersCount}
              </span>
            </button>
          )}

        </div>
      )}

    </div>
  );
}