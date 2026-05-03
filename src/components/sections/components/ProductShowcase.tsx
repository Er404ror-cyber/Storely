import {
  memo,
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  Search,
  Plus,
  Target,
  X,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useTranslate } from "../../../context/LanguageContext";
import {
  LayoutGrid,
  LayoutList,
  ProductShowcaseSkeleton,
} from "../../produtos/layouts";
import { useAdminStore } from "../../../hooks/useAdminStore";

const LIMITS = {
  category: 12,
  title: 25,
  description: 80,
};

const CACHE_TIME = 1000 * 60 * 20;
const CACHE_VERSION = "v10";
const PRODUCTS_LIMIT = 32;
const INITIAL_VISIBLE = 9;

export type SectionStyles = {
  theme?: "dark" | "light";
  align?: "center" | "left" | "justify";
  fontSize?: "small" | "base" | "medium" | "large";
  cols?: string | number;
};

interface ShowcaseProps {
  content: {
    title?: string;
    category?: string;
    description?: string;
  };
  style: SectionStyles;
  onUpdate?: (field: string, value: string) => void;
}

type PublicStore = {
  id: string;
  currency: string | null;
};

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  main_image: string;
  created_at?: string;
  currency: string;
};

type CachePayload<T> = {
  version: string;
  data: T;
  expiresAt: number;
};

function safeText(value: unknown, limit: number) {
  return String(value || "")
    .replace(/[\n\r]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

function cacheKey(...parts: Array<string | number | null | undefined>) {
  return parts.filter(Boolean).join("_");
}

function readCache<T>(key: string): T | null {
  try {
    if (typeof window === "undefined") return null;

    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CachePayload<T>;

    if (parsed.version !== CACHE_VERSION || Date.now() > parsed.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  } catch {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
    return null;
  }
}

function writeCache<T>(key: string, data: T) {
  try {
    if (typeof window === "undefined") return;

    localStorage.setItem(
      key,
      JSON.stringify({
        version: CACHE_VERSION,
        data,
        expiresAt: Date.now() + CACHE_TIME,
      } satisfies CachePayload<T>)
    );
  } catch {
    // ignore storage errors
  }
}

function normalizeProduct(product: any, currency: string): Product {
  return {
    id: String(product?.id || ""),
    name: safeText(product?.name, 70),
    price: Number(product?.price) || 0,
    category: safeText(product?.category, 40),
    main_image: String(product?.main_image || ""),
    created_at: product?.created_at || undefined,
    currency,
  };
}

const HeaderText = memo(function HeaderText({
  content,
  style,
  isReadOnly,
  isDark,
  t,
  onUpdate,
}: {
  content: ShowcaseProps["content"];
  style: SectionStyles;
  isReadOnly: boolean;
  isDark: boolean;
  t: ReturnType<typeof useTranslate>["t"];
  onUpdate?: (field: string, value: string) => void;
}) {
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

  return (
    <header
      className={`mb-5 md:mb-7 flex w-full flex-col ${
        alignCenter ? "items-center text-center" : "items-start text-left"
      }`}
    >
      <div
        className={`flex w-full max-w-3xl min-w-0 flex-col gap-1.5 ${
          alignCenter ? "mx-auto" : ""
        }`}
      >
        <input
          readOnly={isReadOnly}
          value={content?.category || ""}
          onKeyDown={preventEnter}
          onChange={(e) =>
            handleTextChange("category", e.target.value, LIMITS.category)
          }
          placeholder={t("showcase_defaultCategory")}
          className={`${isReadOnly ? readOnlyInput : editableInput} ${
            alignCenter ? "text-center" : ""
          } text-blue-500 dark:text-blue-400 font-black text-[11px] md:text-xs uppercase tracking-[0.16em] truncate max-w-full`}
        />

        <textarea
          readOnly={isReadOnly}
          value={content?.title || ""}
          onKeyDown={preventEnter}
          onChange={(e) =>
            handleTextChange("title", e.target.value, LIMITS.title)
          }
          placeholder={t("showcase_defaultTitle")}
          rows={1}
          style={{ fontSize: titleFontSize }}
          className={`${isReadOnly ? readOnlyInput : editableInput} ${
            alignCenter ? "text-center" : ""
          } font-extrabold tracking-tight leading-[1.05] uppercase resize-none max-w-full min-h-[2rem] line-clamp-2 break-words overflow-hidden`}
        />

        <textarea
          readOnly={isReadOnly}
          value={content?.description || ""}
          onKeyDown={preventEnter}
          onChange={(e) =>
            handleTextChange("description", e.target.value, LIMITS.description)
          }
          placeholder={t("showcase_defaultDescription")}
          rows={2}
          style={{ fontSize: descFontSize }}
          className={`${isReadOnly ? readOnlyInput : editableInput} ${
            alignCenter ? "text-center mx-auto" : ""
          } ${
            isDark ? "text-zinc-400" : "text-zinc-500"
          } font-medium leading-snug max-w-2xl resize-none min-h-[2.6rem] line-clamp-2 break-words overflow-hidden`}
        />
      </div>
    </header>
  );
});

export function ProductShowcase({ content, style, onUpdate }: ShowcaseProps) {
  const { t } = useTranslate();
  const location = useLocation();
  const navigate = useNavigate();
  const { storeSlug, pageSlug } = useParams();
  const { data: adminStore } = useAdminStore();

  const isEditor = location.pathname.includes("/editor/");
  const isReadOnly = !isEditor;
  const isDark = style?.theme === "dark";
  const allLabel = t("common_all");

  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm);

  const [selectedCategory, setSelectedCategory] = useState<string>(allLabel);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  const layoutCols = Math.min(Math.max(Number(style?.cols) || 4, 1), 4);

  const { data: publicStore, isLoading: isLoadingStore } = useQuery({
    queryKey: ["public-store-info", storeSlug],
    queryFn: async (): Promise<PublicStore | null> => {
      if (!storeSlug) return null;

      const key = cacheKey("storely_public_store", CACHE_VERSION, storeSlug);
      const cached = readCache<PublicStore>(key);
      if (cached) return cached;

      const { data, error } = await supabase
        .from("stores")
        .select("id,currency")
        .eq("slug", storeSlug)
        .maybeSingle();

      if (error || !data) return null;

      const safeStore: PublicStore = {
        id: String(data.id),
        currency: data.currency ? String(data.currency) : null,
      };

      writeCache(key, safeStore);
      return safeStore;
    },
    enabled: Boolean(storeSlug && isReadOnly),
    staleTime: CACHE_TIME,
    gcTime: CACHE_TIME * 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
  });

  const effectiveStoreId = publicStore?.id || adminStore?.id || null;
  const storeCurrency = publicStore?.currency || adminStore?.currency || "MZN";

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products-showcase", effectiveStoreId, storeCurrency],
    queryFn: async (): Promise<Product[]> => {
      if (!effectiveStoreId) return [];

      const key = cacheKey(
        "storely_products_showcase",
        CACHE_VERSION,
        effectiveStoreId,
        storeCurrency
      );

      const cached = readCache<Product[]>(key);
      if (cached) return cached;

      const { data, error } = await supabase
        .from("products")
        .select("id,name,price,category,main_image,created_at")
        .eq("store_id", effectiveStoreId)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(PRODUCTS_LIMIT);

      if (error) return [];

      const safeData = (data || []).map((product) =>
        normalizeProduct(product, storeCurrency)
      );

      writeCache(key, safeData);
      return safeData;
    },
    enabled: Boolean(effectiveStoreId),
    staleTime: CACHE_TIME,
    gcTime: CACHE_TIME * 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
  });

  const isLoading =
    (isLoadingStore || isLoadingProducts) && products.length === 0;

  const absoluteMaxPrice = useMemo(() => {
    if (!products.length) return 10000;
    return Math.max(1, ...products.map((p) => Number(p.price) || 0));
  }, [products]);

  const categories = useMemo<string[]>(() => {
    const set = new Set<string>();

    for (const product of products) {
      const cat = safeText(product.category, 40);
      if (cat) set.add(cat);
    }

    return [allLabel, ...Array.from(set)];
  }, [products, allLabel]);

  const filteredProducts = useMemo<Product[]>(() => {
    const term = deferredSearch.trim().toLowerCase();

    return products.filter((p) => {
      const name = p.name.toLowerCase();
      const category = p.category;
      const price = Number(p.price) || 0;

      if (term && !name.includes(term)) return false;
      if (selectedCategory !== allLabel && category !== selectedCategory) {
        return false;
      }
      if (maxPrice !== null && price > maxPrice) return false;

      return true;
    });
  }, [products, deferredSearch, selectedCategory, maxPrice, allLabel]);

  const displayProducts = useMemo(() => {
    if (showAll) return filteredProducts;
    return filteredProducts.slice(0, INITIAL_VISIBLE);
  }, [filteredProducts, showAll]);

  const hasActiveFilters =
    isReadOnly &&
    (selectedCategory !== allLabel ||
      maxPrice !== null ||
      deferredSearch.trim() !== "");

  const clearFilters = useCallback(() => {
    setSelectedCategory(allLabel);
    setMaxPrice(null);
    setSearchTerm("");
    setShowAll(false);
  }, [allLabel]);

  const handleProductClick = useCallback(
    (productId: string) => {
      if (!isReadOnly || !storeSlug) return;

      navigate(`/${storeSlug}/${pageSlug || "home"}/${productId}`, {
        state: { fromStore: true },
      });
    },
    [isReadOnly, navigate, storeSlug, pageSlug]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(safeText(e.target.value, 40));
      setShowAll(false);
    },
    []
  );

  const handleCategoryChange = useCallback((cat: string) => {
    setSelectedCategory(cat);
    setShowAll(false);
  }, []);

  const handleMaxPriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMaxPrice(Number(e.target.value));
      setShowAll(false);
    },
    []
  );

  const handleMaxPriceInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g, "").slice(0, 9);
      setMaxPrice(value === "" ? null : Number(value));
      setShowAll(false);
    },
    []
  );

  return (
    <section
      className={`px-3 py-6 md:px-6 md:py-9 overflow-hidden ${
        isDark ? "bg-[#0a0a0a] text-zinc-100" : "bg-white text-slate-900"
      }`}
      style={{
        contain: "layout paint",
        contentVisibility: "auto",
        containIntrinsicSize: "720px",
      }}
    >
      <div className="mx-auto w-full max-w-6xl min-w-0">
        <HeaderText
          content={content}
          style={style}
          isReadOnly={isReadOnly}
          isDark={isDark}
          t={t}
          onUpdate={onUpdate}
        />

        {isReadOnly && (
          <div className="mb-5 flex flex-col gap-3">
            <div className="flex gap-2">
              <div
                className={`flex min-w-0 flex-1 items-center gap-2 rounded-2xl border px-3 py-2.5 ${
                  isDark
                    ? "bg-zinc-900/50 border-zinc-800"
                    : "bg-slate-50 border-slate-100"
                }`}
              >
                <Search size={17} className="shrink-0 opacity-40" />

                <input
                  type="text"
                  value={searchTerm}
                  placeholder={t("showcase_searchPlaceholder")}
                  className="w-full min-w-0 bg-transparent border-none outline-none text-[16px] md:text-sm font-semibold truncate"
                  onChange={handleSearchChange}
                />

                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                    className="shrink-0 opacity-60 active:scale-95"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsFiltersVisible((v) => !v)}
                className={`shrink-0 flex items-center justify-center gap-2 rounded-2xl border px-3 md:px-4 py-2.5 font-bold text-xs active:scale-[0.98] ${
                  isFiltersVisible
                    ? "bg-blue-600 border-blue-600 text-white"
                    : isDark
                    ? "bg-zinc-900 border-zinc-800 text-zinc-400"
                    : "bg-white border-slate-200 text-slate-600"
                }`}
              >
                <SlidersHorizontal size={16} />
                <span className="hidden md:inline">
                  {isFiltersVisible ? t("common_close") : t("common_filters")}
                </span>
              </button>
            </div>

            {isFiltersVisible && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategoryChange(cat)}
                      className={`max-w-[150px] truncate rounded-xl border px-4 py-2 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap active:scale-[0.98] ${
                        selectedCategory === cat
                          ? "bg-blue-600 border-blue-600 text-white"
                          : isDark
                          ? "bg-zinc-900 border-zinc-800 text-zinc-400"
                          : "bg-white border-slate-200 text-slate-500"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div
                  className={`grid grid-cols-1 items-center gap-3 rounded-2xl border px-4 py-3 md:grid-cols-[auto_1fr_auto] ${
                    isDark
                      ? "bg-zinc-900/30 border-zinc-800"
                      : "bg-slate-50/50 border-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Target size={15} className="text-blue-600" />
                    <span className="text-[10px] font-bold uppercase opacity-60">
                      {t("showcase_maxPrice")}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={absoluteMaxPrice}
                    value={maxPrice ?? absoluteMaxPrice}
                    onChange={handleMaxPriceChange}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-blue-600 dark:bg-zinc-800"
                  />

                  <div
                    className={`flex min-w-[105px] items-center rounded-xl border px-3 py-2 ${
                      isDark
                        ? "bg-zinc-950/60 border-zinc-800"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <span className="mr-1 max-w-[42px] truncate text-[11px] opacity-40">
                      {storeCurrency}
                    </span>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={maxPrice === null ? "" : maxPrice}
                      placeholder={t("filter_unlimited")}
                      onChange={handleMaxPriceInput}
                      className="w-full bg-transparent text-center text-[16px] md:text-sm font-bold outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {hasActiveFilters && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[10px] font-black uppercase tracking-tight opacity-40">
              {t("showcase_filter_active")}
            </span>

            {selectedCategory !== allLabel && (
              <button
                type="button"
                onClick={() => handleCategoryChange(allLabel)}
                className="flex max-w-[170px] items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-[10px] font-bold text-blue-500"
              >
                <span className="truncate">{selectedCategory}</span>
                <X size={12} className="shrink-0" />
              </button>
            )}

            {maxPrice !== null && (
              <button
                type="button"
                onClick={() => setMaxPrice(null)}
                className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-[10px] font-bold text-blue-500"
              >
                <span className="truncate">
                  {t("showcase_price_up_to").replace(
                    "{{price}}",
                    String(maxPrice)
                  )}
                </span>
                <X size={12} className="shrink-0" />
              </button>
            )}

            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-bold opacity-60 active:scale-95"
            >
              <RotateCcw size={12} /> {t("showcase_clear_all")}
            </button>
          </div>
        )}

        <div className="min-h-[360px]">
          {isLoading ? (
            <ProductShowcaseSkeleton cols={layoutCols} isDark={isDark} />
          ) : (
            <>
              {layoutCols === 1 ? (
                <LayoutList
                  products={displayProducts}
                  onAction={handleProductClick}
                  isDark={isDark}
                  t={t}
                />
              ) : (
                <LayoutGrid
                  products={displayProducts}
                  onAction={handleProductClick}
                  cols={layoutCols}
                  isDark={isDark}
                  t={t}
                />
              )}

              {!showAll && filteredProducts.length > INITIAL_VISIBLE && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowAll(true)}
                    className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-[11px] font-bold uppercase tracking-widest active:scale-95 ${
                      isDark
                        ? "bg-white text-black"
                        : "bg-zinc-900 text-white"
                    }`}
                  >
                    <Plus size={16} /> {t("showcase_viewFull")}
                  </button>
                </div>
              )}
            </>
          )}

          {!isLoading && filteredProducts.length === 0 && (
            <div className="rounded-3xl border border-dashed border-zinc-200 py-16 text-center dark:border-zinc-800">
              <Package
                size={38}
                className="mx-auto mb-4 text-zinc-500 opacity-10"
              />
              <p className="text-xs font-bold uppercase tracking-widest opacity-40">
                {t("showcase_empty")}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}