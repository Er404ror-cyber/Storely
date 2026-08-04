// CatalogFilters.tsx
import { useMemo } from "react";
import { Filter } from "lucide-react";
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
  products, activeParent, setActiveParent, activeChild, setActiveChild, activeAttribute, setActiveAttribute, isDark
}: FilterProps) {
  const { t } = useTranslate();

  // 1. AGRUPAMENTO INTELIGENTE (Pai + Filhos na mesma estrutura)
  const hierarchy = useMemo(() => {
    const map = new Map<string, Set<string>>();
    
    products.forEach(p => {
      const parent = p.metadata?.parentCategory;
      const child = p.metadata?.subCategory;
      if (parent) {
        if (!map.has(parent)) map.set(parent, new Set());
        if (child) map.get(parent)!.add(child);
      }
    });

    // Converte o Mapa num Array ordenado para renderização
    return Array.from(map.entries())
      .map(([parent, childrenSet]) => ({
        parent,
        children: Array.from(childrenSet).sort()
      }))
      .sort((a, b) => a.parent.localeCompare(b.parent));
  }, [products]);

  // 2. ATRIBUTOS ÚTEIS (Cores, Tamanhos, Género - Mostra sempre que não estiver no "Todos")
  const availableAttributes = useMemo(() => {
    if (activeParent === "Todos" && !activeChild) return [];
    
    // Pega apenas nos produtos que estão atualmente visíveis
    let filteredProducts = products;
    if (activeParent !== "Todos") {
      filteredProducts = filteredProducts.filter(p => p.metadata?.parentCategory === activeParent);
    }
    if (activeChild) {
      filteredProducts = filteredProducts.filter(p => p.metadata?.subCategory === activeChild);
    }

    const genders = new Set<string>();
    const sizes = new Set<string>();
    const others = new Set<string>();

    filteredProducts.forEach(p => {
      if (p.metadata?.gender) genders.add(p.metadata.gender);
      (p.metadata?.sizes || []).forEach((s: string) => sizes.add(s));
      (p.metadata?.attributes || []).forEach((a: string) => others.add(a));
    });

    // Ordem de utilidade: 1º Género, 2º Tamanho, 3º Outros (Cores, Material)
    return [
      ...Array.from(genders).sort(),
      ...Array.from(sizes).sort(),
      ...Array.from(others).sort()
    ];
  }, [products, activeParent, activeChild]);

  // HANDLERS DE CLIQUE
  const handleTodosClick = () => {
    setActiveParent("Todos");
    setActiveChild("");
    setActiveAttribute("");
  };

  const handleParentClick = (parent: string) => {
    setActiveParent(parent);
    setActiveChild(""); // Reseta o filho se clicar apenas no pai
    setActiveAttribute("");
  };

  const handleChildClick = (parent: string, child: string) => {
    if (activeChild === child) {
      // Se clicar no filho que já está ativo, desativa-o, mas mantém o Pai ativo
      setActiveChild("");
      setActiveAttribute("");
    } else {
      // Ativa o Filho e garante que o Pai correspondente também fica ativo
      setActiveParent(parent);
      setActiveChild(child);
      setActiveAttribute("");
    }
  };

  if (hierarchy.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 mb-6 select-none" style={{ transform: "translateZ(0)" }}>
      
      {/* LINHA 1: HIERARQUIA UNIFICADA (Pais e Filhos lado a lado) */}
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2 pt-1 px-1 -mx-1">
        
        {/* BOTÃO MASTER: TODOS */}
        <button
          onClick={handleTodosClick}
          className={`shrink-0 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all border ${
            activeParent === "Todos" && activeChild === ""
              ? (isDark ? "bg-white border-white text-black" : "bg-zinc-950 border-zinc-950 text-white shadow-xs")
              : (isDark ? "bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:bg-zinc-800/80" : "bg-white border-zinc-200 text-slate-600 hover:bg-zinc-50")
          }`}
        >
          {t("filter_all" as any)}
        </button>

        {/* AGRUPAMENTOS DE PAIS E FILHOS */}
        {hierarchy.map((group) => (
          <div key={group.parent} className={`flex items-center gap-2 shrink-0 pl-3 border-l-2 ${isDark ? "border-zinc-800" : "border-zinc-200"}`}>
            
            {/* O PAI (Visual mais quadrado e fonte pesada) */}
            <button
              onClick={() => handleParentClick(group.parent)}
              className={`shrink-0 rounded-lg px-3.5 py-2 text-xs font-bold uppercase tracking-wide transition-all border ${
                activeParent === group.parent && activeChild === ""
                  ? (isDark ? "bg-white border-white text-black" : "bg-zinc-950 border-zinc-950 text-white shadow-xs")
                  : (isDark ? "bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:bg-zinc-800/80" : "bg-white border-zinc-200 text-slate-600 hover:bg-zinc-50")
              }`}
            >
              {group.parent}
            </button>

            {/* OS FILHOS (Visual em pílula, arredondado e fonte mais suave) */}
            {group.children.map(child => (
              <button
                key={child}
                onClick={() => handleChildClick(group.parent, child)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition-all border ${
                  activeChild === child
                    ? (isDark ? "bg-amber-500/10 text-amber-400 border-amber-500/50" : "bg-amber-50 text-amber-700 border-amber-300 shadow-sm")
                    : (isDark ? "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600" : "bg-transparent text-zinc-500 border-zinc-200 hover:border-zinc-300")
                }`}
              >
                {child}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* LINHA 2: ATRIBUTOS / FILTROS (Tamanhos, Cores, etc.) */}
      {availableAttributes.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pl-2 animate-in fade-in slide-in-from-left-4 duration-300">
          <Filter size={13} className={isDark ? "text-zinc-600" : "text-zinc-400"} />
          {availableAttributes.map(attr => (
            <button
              key={attr}
              onClick={() => setActiveAttribute(activeAttribute === attr ? "" : attr)}
              className={`shrink-0 rounded-md px-2.5 py-1 text-[10px] uppercase font-bold transition-all border border-dashed ${
                activeAttribute === attr
                  ? (isDark ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" : "border-emerald-400 text-emerald-700 bg-emerald-50")
                  : (isDark ? "border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500" : "border-zinc-300 text-zinc-500 hover:text-zinc-700 hover:border-zinc-400")
              }`}
            >
              {attr}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}