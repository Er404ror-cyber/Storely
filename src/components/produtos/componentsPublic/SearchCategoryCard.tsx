import React from "react";

interface CategoryCardProps {
  name: string;
  emoji?: string;
  color?: string;
  index: number;
  onClick: () => void;
}

export const SearchCategoryCard = React.memo(function SearchCategoryCard({
  name,
  emoji = "📦",
  color,
  onClick
}: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      /* Adicionamos shadow-lg para dar profundidade e garantimos que o gradiente 
         venha da prop 'color' ou use um fallback elegante */
      className={`group relative w-full aspect-[16/9] overflow-hidden rounded-xl p-4 text-left shadow-lg transition-all duration-300 active:scale-[0.97] transform-gpu will-change-transform cursor-pointer bg-gradient-to-br ${
        color || "from-zinc-700 to-zinc-900"
      }`}
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: "110px",
      }}
    >
      {/* Arte Digital/Emoji de Fundo - Otimizado */}
      <div className="absolute inset-0 flex items-center justify-end p-2 select-none pointer-events-none opacity-40 transition-transform duration-500 group-hover:scale-110">
        <span className="text-6xl filter drop-shadow-md transform translate-x-2 translate-y-2">{emoji}</span>
      </div>

      {/* Camada de Gradiente Escuro para legibilidade do texto */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

      {/* Texto no canto inferior esquerdo */}
      <div className="absolute bottom-3 left-3 right-3 z-10">
        <span className="text-sm font-bold text-white tracking-tight leading-tight line-clamp-2 drop-shadow-md">
          {name}
        </span>
      </div>
    </button>
  );
});