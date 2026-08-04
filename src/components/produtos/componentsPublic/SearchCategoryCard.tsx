import React from "react";

interface CategoryCardProps {
  name: string;
  emoji?: string;
  color?: string;
  image?: string | null;
  index: number;
  onClick: () => void;
}

export const SearchCategoryCard = React.memo(function SearchCategoryCard({
  name,
  emoji = "📦",
  color,
  image,
  onClick
}: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      /* O fundo do cartão continua a ser 100% o teu gradiente de cor vibrante */
      className={`group relative w-full aspect-[16/9] overflow-hidden rounded-xl p-4 text-left shadow-lg transition-all duration-300 active:scale-[0.97] transform-gpu will-change-transform cursor-pointer bg-gradient-to-br ${
        color || "from-zinc-700 to-zinc-900"
      }`}
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: "110px",
      }}
    >
      
      {/* 
        METADE DIREITA (IMAGEM): 
        Ocupa 65% da largura. A máscara cria um gradiente longo e esfumado 
        (de 0% a 70%) para garantir que a transição no meio seja ultra suave ao olho.
      */}
      {image ? (
        <div 
          className="absolute inset-y-0 right-0 w-[65%] overflow-hidden pointer-events-none opacity-90"
          style={{
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 70%)",
            maskImage: "linear-gradient(to right, transparent 0%, black 70%)"
          }}
        >
          <img 
            src={image} 
            alt={name} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        </div>
      ) : (
        /* Caso não haja imagem, mantém o emoji na direita */
        <div className="absolute inset-0 flex items-center justify-end p-2 select-none pointer-events-none opacity-40 transition-transform duration-500 group-hover:scale-110">
          <span className="text-6xl filter drop-shadow-md transform translate-x-2 translate-y-2">{emoji}</span>
        </div>
      )}

      {/* Camada de Gradiente Escuro na base (apenas o suficiente para destacar o texto) */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

      {/* Texto no canto inferior esquerdo */}
      <div className="absolute bottom-3 left-3 right-3 z-10">
        <span className="text-[13px] sm:text-sm font-bold text-white tracking-tight leading-tight line-clamp-2 drop-shadow-md w-3/4">
          {name}
        </span>
      </div>
    </button>
  );
});