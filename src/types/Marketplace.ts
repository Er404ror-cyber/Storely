export type ProductStore = {
    id?: string;
    slug?: string;
    name?: string | null;
    description?: string | null;
    logo_url?: string | null;
    whatsapp_number?: string | null;
    settings?: Record<string, unknown> | null;
    currency?: string | null;
  };
  
  export type ProductRow = {
    id: string;
    name: string | null;
    category: string | null;
    main_image: string | null;
    gallery?: string[] | null;
    full_description?: string | null;
    unit?: string | null;
    created_at: string;
    price: number | string | null;
    currency?: string | null;
    stores?: ProductStore | ProductStore[] | null;
  };
  
  export type ProductItem = {
    id: string;
    name: string;
    category: string;
    image: string;
    gallery: string[];
    description: string;
    unit: string;
    createdAt: string;
    createdAtValue: number;
    timeAgoShort: string;
    storeSlug: string;
    storeName: string;
    storeDescription: string;
    storeLogo: string;
    storeWhatsApp?: string | null;
    price: number | null;
    currency: string;
    searchName: string;
    searchCategory: string;
    searchStore: string;
    searchDescription: string;
    searchFull: string;
  };
  
  export type StoreItem = {
    id: string;
    slug: string;
    name: string;
    description: string;
    logoUrl: string;
    heroImage?: string;
    whatsapp_number?: string | null;
    settings?: Record<string, unknown> | null;
    total: number;
    categories: string[];
    searchName: string;
    searchDescription: string;
    searchCategories: string;
  };
  
  export type PreferenceState = {
    categories: Record<string, number>;
    stores: Record<string, number>;
    products: Record<string, number>;
    searches: Record<string, number>;
  };
  
  export type SearchHistoryItem = {
    value: string;
    ts: number;
  };
  
  export type StorelyCachePayload = {
    version: number;
    data: ProductRow[];
    savedAt: number;
    expiresAt: number;
  };
  
  export type ShowcaseViewState = {
    query: string;
    selectedCategory: string;
    selectedStore: string;
    showFilters: boolean;
    scrollY: number;
    savedAt: number;
    pathname: string;
  };
  
  export type FeedSection =
    | { id: string; type: "products-grid"; items: ProductItem[]; title?: string }
    | { id: string; type: "products-strip"; title: string; items: ProductItem[] }
    | { id: string; type: "stores-strip"; title: string; items: StoreItem[] }
    | { id: string; type: "cta" }
    | { id: string; type: "empty-state" };
  
  export type SearchMode =
    | "default"
    | "exact"
    | "approximate"
    | "related"
    | "fallback"
    | "none";