import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { safeText, cacheKey, CACHE_VERSION, readCache, writeCache } from "../utils/text";

export const SUPER_CACHE_CONFIG = {
  staleTime: Infinity,
  gcTime: 1000 * 60 * 60 * 24,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
};

export type StoreInfo = {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  currency: string;
};

export type Product = {
  id: string;
  store_id: string;
  name: string;
  slug?: string;
  price: number;
  discount_percent?: number; 
  has_discount?: boolean;    
  original_price?: number;   
  final_price?: number;      
  description?: string;
  image_url?: string;
  is_active?: boolean;
  created_at?: string;
  category: string;
  gallery?: string[];
  main_image?: string;
  full_description?: string;
  unit?: string;
  currency: string;
  metadata?: any;
};

export type StoreProductsResult = {
  products: Product[];
  store: StoreInfo | null;
};

export function useStoreProducts(
  effectiveStoreId?: string | null, 
  storeCurrency: string = "MZN", 
  activeStoreSlug?: string, 
  t?: any
) {
  const queryIdentifier = effectiveStoreId || activeStoreSlug || "unknown";
  const diskKey = cacheKey("store_catalog_full_bundle", CACHE_VERSION, queryIdentifier);

  return useQuery<StoreProductsResult>({
    queryKey: ["store-products-bundle", queryIdentifier, storeCurrency],
    
    // Leitura síncrona do cache local antes de qualquer requisição
    initialData: () => {
      if (!queryIdentifier || queryIdentifier === "unknown") return undefined;
      const cached = readCache<StoreProductsResult>(diskKey, activeStoreSlug);
      if (cached && (cached.products?.length > 0 || cached.store)) {
        return cached;
      }
      return undefined;
    },

    queryFn: async () => {
      // 1. Checagem de Cache no disco
      const cached = readCache<StoreProductsResult>(diskKey, activeStoreSlug);
      if (cached && (cached.products?.length > 0 || cached.store)) {
        return cached;
      }

      let storeIdToUse = effectiveStoreId;
      let storeInfo: StoreInfo | null = null;

      // 2. Se não tiver ID mas tiver Slug, descobre a Store primeiro
      if (!storeIdToUse && activeStoreSlug) {
        const { data: storeData } = await supabase
          .from("stores")
          .select("id, name, slug, logo_url, currency")
          .eq("slug", activeStoreSlug)
          .maybeSingle();

        if (storeData) {
          storeIdToUse = storeData.id;
          storeInfo = {
            id: String(storeData.id),
            name: storeData.name || "",
            slug: storeData.slug || "",
            logo_url: storeData.logo_url || undefined,
            currency: storeData.currency || storeCurrency,
          };
        }
      }

      if (!storeIdToUse) {
        return { products: [], store: null };
      }

      // 3. Busca os produtos e dados da loja
      const { data: productsData, error } = await supabase
        .from("products")
        .select(`
          id, store_id, name, slug, price, discount_percent, description, 
          image_url, is_active, created_at, category, gallery, main_image, 
          full_description, unit,
          stores:store_id ( id, name, slug, logo_url, currency )
        `)
        .eq("store_id", storeIdToUse)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error || !productsData) {
        return { products: [], store: storeInfo };
      }

      // Se não pegou a loja antes, extrai do join
      if (!storeInfo && productsData.length > 0 && productsData[0].stores) {
        const rawStore: any = productsData[0].stores;
        storeInfo = {
          id: String(rawStore.id),
          name: rawStore.name || "",
          slug: rawStore.slug || "",
          logo_url: rawStore.logo_url || undefined,
          currency: rawStore.currency || storeCurrency,
        };
      }

      const mappedProducts: Product[] = productsData.map((product: any) => {
        const basePrice = Number(product.price) || 0;
        const discPercent = Number(product.discount_percent) || 0;
        const hasDiscount = discPercent > 0;
        const originalPrice = hasDiscount ? basePrice : undefined;
        const finalPrice = hasDiscount ? basePrice - (basePrice * (discPercent / 100)) : basePrice;

        return {
          id: String(product.id),
          store_id: String(product.store_id),
          name: safeText(product.name, 70),
          slug: product.slug || undefined,
          price: basePrice,
          discount_percent: discPercent, 
          has_discount: hasDiscount,
          original_price: originalPrice,
          final_price: finalPrice,
          description: product.description || undefined,
          image_url: product.image_url || undefined,
          is_active: product.is_active ?? true,
          created_at: product.created_at || undefined,
          category: safeText(product.category, 40) || (t ? t("common_general") : "Geral"),
          gallery: product.gallery || [],
          main_image: product.main_image || "",
          full_description: product.full_description || undefined,
          unit: product.unit || undefined,
          currency: storeInfo?.currency || storeCurrency,
        };
      });

      const result: StoreProductsResult = {
        products: mappedProducts,
        store: storeInfo,
      };

      writeCache(diskKey, result, activeStoreSlug);
      return result;
    },
    enabled: Boolean(effectiveStoreId || activeStoreSlug),
    ...SUPER_CACHE_CONFIG,
  });
}