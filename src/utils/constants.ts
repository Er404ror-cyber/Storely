import type { ProductItem, StoreItem } from "../types/Marketplace";

// Fallback para Produtos (SVG Leve com ícone de Caixa/Produto)
// Fallback Premium Otimizado para Produtos (Caixa isométrica de luxo com linhas finas)
export const FALLBACK_PRODUCT = `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" fill="none">
      <defs>
        <linearGradient id="shimmer" x1="-100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="transparent" />
          <stop offset="50%" stop-color="rgba(255, 255, 255, 0.3)" />
          <stop offset="100%" stop-color="transparent" />
        </linearGradient>
        <linearGradient id="shimmer-dark" x1="-100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="transparent" />
          <stop offset="50%" stop-color="rgba(255, 255, 255, 0.04)" />
          <stop offset="100%" stop-color="transparent" />
        </linearGradient>
      </defs>
      <style>
        .bg { fill: transparent; }
        .box-top { fill: rgba(161, 161, 170, 0.08); stroke: #a1a1aa; stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; }
        .box-sides { stroke: #a1a1aa; stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; }
        .shine { fill: url(#shimmer); }
        @keyframes travel {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .shine { animation: travel 2s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        @media (prefers-color-scheme: dark) {
          .box-top { fill: rgba(82, 82, 91, 0.15); stroke: #52525b; }
          .box-sides { stroke: #52525b; }
          .shine { fill: url(#shimmer-dark); }
        }
      </style>
      <rect width="400" height="500" class="bg"/>
      
      <g>
        <polygon points="200,160 265,195 200,230 135,195" class="box-top"/>
        <path d="M135 195V275L200 310V230" class="box-sides"/>
        <path d="M265 195V275L200 310" class="box-sides"/>
      </g>
  
      <rect width="400" height="500" class="shine"/>
    </svg>
  `)}`;
  export const FALLBACK_STORE = `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
      <style>
        .bg-card { fill: #f4f4f5; }
        .store-roof { fill: #3b82f6; }
        .store-body { fill: #0f172a; }
        .store-window { fill: #ffffff; opacity: 0.4; }
    
        @media (prefers-color-scheme: dark) {
          .bg-card { fill: #09090b; }
          .store-roof { fill: #38bdf8; }
          .store-body { fill: #f8fafc; }
          .store-window { fill: #09090b; opacity: 0.3; }
        }
      </style>
      
      <!-- Fundo Sólido Premium com Cantos Arredondados -->
      <rect width="100" height="100" rx="28" class="bg-card"/>
      
      <!-- O Toldo Dinâmico (Design Geométrico Limpo) -->
      <path d="M20 44 L26 32 L74 32 L80 44 Z" class="store-roof"/>
      
      <!-- Fachada Principal / Paredes da Loja -->
      <path d="M24 44 H76 V72 C76 75, 73 78, 70 78 H30 C27 78, 24 75, 24 72 Z" class="store-body"/>
      
      <!-- Vitrines / Janelas em Contraste Puro (Sem linhas a estragar) -->
      <rect x="32" y="52" width="16" height="18" rx="3" class="store-window"/>
      <rect x="52" y="52" width="16" height="18" rx="3" class="store-window"/>
    </svg>
    `.trim())}`;
  

export const LS_PREFS = "storely-prefs-v12";
export const LS_HISTORY = "storely-history-v12";
export const LS_AUTH_HINT = "storely-auth-user";

export const STORELY_CACHE_KEY = "storely-public-cache-v9";
export const STORELY_CACHE_VERSION = 9;
export const STORELY_CACHE_TTL = 1000 * 60 * 60 * 2;
export const STORELY_STATE_KEY = "storely-showcase-ui-v4";

export const MAX_PRODUCTS_FETCH = 72;
export const MAX_RECENT_SEARCHES = 3;
export const MAX_SEARCH_SUGGESTIONS = 4;
export const MAX_FALLBACK_PRODUCTS = 8;
export const GRID_PAGE_SIZE = 8;
export const STRIP_SIZE = 10;
export const STORES_STRIP_SIZE = 10;
export const CATEGORY_SCROLL_STEP = 260;
export const STRIP_SCROLL_STEP = 320;
export const FALLBACK_CURRENCY = "USD";

export const EMPTY_PRODUCTS: ProductItem[] = [];
export const EMPTY_STORES: StoreItem[] = [];
export const EMPTY_CATEGORIES: string[] = [];