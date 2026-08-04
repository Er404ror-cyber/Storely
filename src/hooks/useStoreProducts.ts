import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { safeText, cacheKey, CACHE_VERSION, readCache, writeCache } from "../utils/text";


export const SUPER_CACHE_CONFIG = {
    staleTime: 1000 * 60 * 60,      
    gcTime: 1000 * 60 * 60 * 2,     
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  };

// Tipagem unificada com TODOS os detalhes do produto
export type Product = {
  id: string;
  store_id: string;
  name: string;
  slug?: string;
  price: number;
  description?: string;
  image_url?: string;
  is_active?: boolean;
  created_at?: string;
  category: string;
  gallery?: string[];
  main_image: string;
  full_description?: string;
  unit?: string;
  currency: string;
};

export function useStoreProducts(effectiveStoreId: string | null, storeCurrency: string, activeStoreSlug?: string, t?: any) {
  return useQuery({
    queryKey: ["store-products-full", effectiveStoreId, storeCurrency],
    queryFn: async () => {
      if (!effectiveStoreId) return [];
      
      const key = cacheKey("store_catalog_full", CACHE_VERSION, effectiveStoreId);
      
      // 1. TENTA O DISCO PRIMEIRO (Sobrevive a Refresh/F5)
      const cached = readCache<Product[]>(key, activeStoreSlug);
      if (cached && cached.length > 0) {
        return cached;
      }

      // 2. SE O CACHE EXPIROU, VAI AO SUPABASE (Trazendo tudo)
      const { data, error } = await supabase
        .from("products")
        .select("id, store_id, name, slug, price, description, image_url, is_active, created_at, category, gallery, main_image, full_description, unit")
        .eq("store_id", effectiveStoreId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) return [];

      const mapped = (data || []).map((product) => ({
        id: String(product.id),
        store_id: String(product.store_id),
        name: safeText(product.name, 70),
        slug: product.slug || undefined,
        price: Number(product.price) || 0,
        description: product.description || undefined,
        image_url: product.image_url || undefined,
        is_active: product.is_active ?? true,
        created_at: product.created_at || undefined,
        category: safeText(product.category, 40) || (t ? t("common_general") : "Geral"),
        gallery: product.gallery || [],
        main_image: product.main_image || "",
        full_description: product.full_description || undefined,
        unit: product.unit || undefined,
        currency: storeCurrency,
      })) as Product[];

      // 3. GUARDA NO DISCO PARA O PRÓXIMO F5
      writeCache(key, mapped, activeStoreSlug);
      
      return mapped;
    },
    enabled: Boolean(effectiveStoreId),
    ...SUPER_CACHE_CONFIG,
  });
}