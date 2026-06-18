import React, { memo, useState } from "react";
import { ChevronLeft, ChevronRight as ChevronRightIcon, ChevronRight, Store as StoreIcon, ImageOff, Verified, ArrowRight, Sparkles } from "lucide-react";
import type { ProductItem, StoreItem } from "../../types/Marketplace";
import { formatProductPrice } from "../../utils/marketplaceutils";
import { FALLBACK_PRODUCT, FALLBACK_STORE } from "./constants";
import { useTranslate } from "../../context/LanguageContext";

// Função única para tratar links quebrados (Cloudinary 404, etc)
const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>, fallback: string, setErr: (v: boolean) => void) => {
  const t = e.currentTarget;
  if (t.src !== fallback) { t.src = fallback; setErr(true); }
};

export const RailControls = memo(({ onLeft, onRight, ariaLabel }: { onLeft: () => void; onRight: () => void; ariaLabel: string }) => (
  <div className="sm:flex hidden items-center gap-1">
    <button type="button" aria-label={`${ariaLabel} left`} onClick={onLeft} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 will-change-transform"><ChevronLeft size={14} /></button>
    <button type="button" aria-label={`${ariaLabel} right`} onClick={onRight} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 will-change-transform"><ChevronRightIcon size={14} /></button>
  </div>
));

export const SectionHeader = memo(({ icon, title, subtle, controls }: { icon: React.ReactNode; title: string; subtle?: string; controls?: React.ReactNode }) => (
  <div className="mb-3 flex items-center justify-between gap-3">
    <div className="flex min-w-0 items-center gap-2">
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">{icon}</div>
      <h3 className="truncate text-sm font-black uppercase tracking-[0.14em] text-zinc-900 dark:text-zinc-100">{title}</h3>
    </div>
    <div className="flex shrink-0 items-center gap-2">
      {subtle && <span className="text-[10px] font-black uppercase tracking-[0.12em] text-zinc-400">{subtle}</span>}
      {controls}
    </div>
  </div>
));

export const ProductCard = memo(({ item, onClick, compact = false, locale = "en-US" }: { item: ProductItem; onClick: (item: ProductItem) => void; compact?: boolean; locale?: string }) => {
  const [noImg, setNoImg] = useState(false);
  const { t } = useTranslate();
  
  // Memoriza o preço formatado para evitar recalcular e piscar a UI
  const price = React.useMemo(() => formatProductPrice(item.price, item.currency, locale), [item.price, item.currency, locale]);

  return (
    <article onClick={() => onClick(item)} className={`group/card cursor-pointer overflow-hidden rounded-[1.35rem] border border-zinc-200 bg-white shadow-sm transition-transform duration-150 motion-safe:hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-zinc-900 ${compact ? "w-[190px] min-w-[190px]" : "w-full"}`} style={{ contentVisibility: "auto", containIntrinsicSize: "auto 320px" }}>
      <div className={`relative overflow-hidden bg-zinc-100 dark:bg-zinc-900 ${compact ? "aspect-[4/4.8]" : "aspect-[4/4.8] md:aspect-[4/3.5]"}`}>
        <img src={item.image || FALLBACK_PRODUCT} alt={item.name} loading="lazy" decoding="async" fetchPriority="low" draggable={false} width={380} height={456} sizes={compact ? "190px" : "(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"} className="h-full w-full object-cover pointer-events-none" onError={(e) => handleImgError(e, FALLBACK_PRODUCT, setNoImg)} />
        {noImg && (
          <div className="absolute right-2.5 bottom-2.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em] border border-zinc-700/30 backface-hidden">
            <ImageOff size={10} className="text-zinc-400" />
            {t("noImage") || "Sem Imagem"}
          </div>
        )}
        <div className="absolute left-2.5 top-2.5 max-w-[55%] rounded-full bg-zinc-50/92 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-zinc-900 backface-hidden"><span className="block truncate">{item.storeName}</span></div>
      </div>
      
      {/* Informações do Produto com Foco Psicológico no Preço */}
      <div className="space-y-2.5 p-3 overflow-hidden">
        <div className="w-full overflow-hidden whitespace-nowrap group/text">
          <h4 className="text-[13px] font-black leading-tight tracking-tight text-zinc-950 dark:text-zinc-50 inline-block w-max pr-4 group-hover/text:translate-x-[-40%] group-hover/text:transition-transform group-hover/text:duration-[4000ms] group-hover/text:linear group-hover/text:will-change-transform backface-hidden">{item.name}</h4>
        </div>

        {/* Linha de Metadados Limpa */}
        <div className="flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400">
          <span className="truncate font-black uppercase tracking-wide text-blue-600 dark:text-blue-400">{item.category}</span>
          <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700 shrink-0" />
          <span className="truncate">{item.timeAgoShort}</span>
        </div>

        {/* AJUSTE AQUI: "Cubo" do Preço Otimizado e Altamente Escaneável */}
        {price && (
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Preço</span>
            <span className="text-[14px] font-black tracking-tight text-zinc-950 dark:text-emerald-400 bg-zinc-50 dark:bg-zinc-900 px-2.5 py-0.5 rounded-lg border border-zinc-100 dark:border-zinc-800/40 tabular-nums shadow-inner">
              {price}
            </span>
          </div>
        )}
      </div>
    </article>
  );
});

export const StoreCard = memo(({ item, onClick, viewStore }: { item: StoreItem; onClick: (slug: string) => void; viewStore: string }) => {
  const [noCover, setNoCover] = useState(false);
  const [noLogo, setNoLogo] = useState(false);
  const { t } = useTranslate();

  return (
    <button 
      type="button" 
      onClick={() => onClick(item.slug)} 
      className="w-[240px] min-w-[240px] group/card relative h-[320px] overflow-hidden rounded-[1.8rem] border border-zinc-200/60 text-left shadow-sm transition-all duration-150 hover:shadow-lg hover:border-blue-400 dark:border-zinc-800 dark:bg-zinc-950" 
      style={{ contentVisibility: "auto", containIntrinsicSize: "auto 320px" }}
    >
      {/* 1. A FOTO DE CAPA AGORA É O FUNDO TOTAL DO CARD */}
      <div className="absolute inset-0 z-0 bg-zinc-100 dark:bg-zinc-900">
        <img 
          src={item.heroImage || FALLBACK_STORE} 
          alt="" 
          loading="lazy" 
          decoding="async" 
          fetchPriority="low" 
          className="h-full w-full object-cover pointer-events-none transition-transform duration-500 group-hover/card:scale-105" 
          onError={(e) => handleImgError(e, FALLBACK_STORE, setNoCover)} 
        />
        {/* Overlay degradê escuro no fundo para garantir legibilidade mesmo se a foto for muito clara */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-zinc-950/20" />
      </div>

      {/* Badge Oficial flutuando no topo */}
      <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-lg bg-blue-600/90  px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-white shadow-sm backface-hidden">
        <StoreIcon size={11} />
        {t("marketplace_store_fallback") || "Store"}
      </div>

      {noCover && (
        <div className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-zinc-900/80  px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-zinc-200 border border-zinc-700/50">
          <ImageOff size={10} className="text-zinc-400" />
          {t("noCover") || "Sem Capa"}
        </div>
      )}
      
      {/* 2. CONTEÚDO FLUTUANTE EM PRIMEIRO PLANO (Z-10) */}
      <div className="absolute bottom-0 inset-x-0 z-10 p-3.5 space-y-2.5 flex flex-col justify-end">
        
        {/* Painel Interno com efeito fosco transparente (Gera foco e elimina ruído visual) */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950/75  p-3 space-y-2.5 shadow-xl">
          
          {/* Identidade da Loja (Logo + Nome) */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative shrink-0">
              <img 
                src={item.logoUrl || item.heroImage || FALLBACK_STORE} 
                alt={item.name} 
                loading="lazy" 
                decoding="async" 
                fetchPriority="low" 
                width={32} 
                height={32} 
                className="h-8 w-8 rounded-full border border-white/20 object-cover bg-zinc-900 pointer-events-none" 
                onError={(e) => handleImgError(e, FALLBACK_STORE, setNoLogo)} 
              />
              {noLogo && <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2 rounded-full bg-zinc-400 border border-zinc-950" />}
            </div>
            
            <div className="min-w-0 w-full">
              <h4 className="text-[13px] font-black tracking-tight text-white truncate flex items-center gap-1">
                {item.name}
                <Verified size={12} className="text-blue-400 fill-blue-500 shrink-0" />
              </h4>
              <p className="text-[10px] font-bold text-blue-400 truncate">
                {item.total} {t("products") || "produtos"}
              </p>
            </div>
          </div>
          
          {/* Descrição curta e limpa com contraste perfeito sobre o fundo escuro do mini-painel */}
          <p className="text-[11px] leading-relaxed text-zinc-300 line-clamp-2 h-8 font-medium">
            {item.description}
          </p>
          
          {/* Categorias (Tags Compactas) */}
          <div className="flex flex-wrap gap-1">
            {item.categories.slice(0, 2).map((cat, idx) => (
              <span 
                key={`${item.slug}-${cat}-${idx}`} 
                className="rounded-md bg-white/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.12em] text-zinc-200  truncate max-w-[85px]"
              >
                {cat}
              </span>
            ))}
          </div>
          
          {/* Linha de Ação / Clique */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.14em] text-blue-400 group-hover/card:text-blue-300 transition-colors">
            <span>{viewStore}</span>
            <ChevronRight size={12} className="transition-transform duration-150 group-hover/card:translate-x-0.5" />
          </div>

        </div>

      </div>
    </button>
  );
});



interface SellerCTAProps {
  title: string;
  subtitle: string;
  cta: string;
  onClick: () => void;
}

export const SellerCTA = memo(({ title, subtitle, cta, onClick }: SellerCTAProps) => (

  <section 
    className="relative overflow-hidden rounded-[2.5rem] border-2 border-blue-500/30 bg-gradient-to-br from-zinc-950 via-blue-950/80 to-zinc-950 px-6 py-10 text-white shadow-xl dark:border-blue-500/20 contain-paint transform-gpu"
    style={{ 
      contentVisibility: "auto",
      containIntrinsicSize: "0 220px" 
    }}
  >
    
    {/* 2. GLOW NEON RADIAL: Removido transform-gpu daqui. Como são estáticos, não precisam de camadas de GPU individuais exclusivas */}
    <div className="absolute -top-20 -right-20 w-80 h-80 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.22),transparent_70%)] pointer-events-none" />
    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.16),transparent_70%)] pointer-events-none" />

    <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between max-w-6xl mx-auto">
      
      <div className="max-w-3xl min-w-0 space-y-3.5">
        {/* Badge Oportunidade: Removido transform-gpu/backface-hidden desnecessários para elementos estáticos */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/40 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-400 dark:text-fuchsia-300 shadow-sm">
          <Sparkles size={11} className="shrink-0 text-fuchsia-400" />
          Oportunidade Exclusiva
        </div>
        
        {/* Título com Gradiente de Alto Contraste */}
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-black leading-[1.1] tracking-tight text-white drop-shadow-sm">
          {title}{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-fuchsia-400 bg-clip-text text-transparent block sm:inline">
            Hoje Mesmo.
          </span>
        </h3>
        
        <p className="text-xs sm:text-sm md:text-[15px] text-zinc-200 font-medium leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      </div>

      {/* 3. BOTÃO DE AÇÃO ULTRA-OTIMIZADO */}
      {/* Usando opacidade de pseudo-elementos para o efeito hover do gradiente. Transição suave que gasta 0% de CPU. */}
      <div className="shrink-0 pt-2 lg:pt-0">
        <button 
          type="button" 
          onClick={onClick} 
          className="group/btn relative inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-8 text-xs font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-blue-600/20 transition-opacity duration-150 active:opacity-90 transform-gpu backface-hidden w-full lg:w-auto overflow-hidden isolation-isolate"
        >
          {/* Camada do Gradiente Hover (Invisível por padrão, ganha opacidade no hover) */}
          <span className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 transition-opacity duration-150 group-hover/btn:opacity-100" />
          
          <span className="relative z-10">{cta}</span>
          <ArrowRight 
            size={14} 
            className="relative z-10 transition-transform duration-150 group-hover/btn:translate-x-0.5 will-change-transform" 
          />
        </button>
      </div>

    </div>
  </section>
));

SellerCTA.displayName = "SellerCTA";



export function EmptyState({ title, subtitle, suggestionTitle, suggestionItems, onSuggestionClick }: { title: string; subtitle: string; suggestionTitle: string; suggestionItems: string[]; onSuggestionClick: (value: string) => void }) {
  return (
    <section className="rounded-[1.5rem] border border-dashed border-zinc-300 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="max-w-2xl">
        <h3 className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        {suggestionItems.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.12em] text-zinc-400">{suggestionTitle}</p>
            <div className="flex flex-wrap gap-2">
              {suggestionItems.map((item) => (
                <button key={item} type="button" onClick={() => onSuggestionClick(item)} className="rounded-full bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-zinc-700 shadow-sm dark:bg-zinc-950 dark:text-zinc-300">{item}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}