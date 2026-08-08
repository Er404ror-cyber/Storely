export interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  final_price?: number;
  has_discount?: boolean;
  discount_percent?: number;
  currency?: string | null;
  category?: string | null;
  main_image?: string | null;
  created_at?: string | Date | null;
}

export interface LayoutProps {
  products: Product[];
  onAction: (id: string) => void;
  isDark: boolean;
  t?: any;
}

export const safeText = (value?: string | null) => String(value || "").trim();

export const sortProductsByDate = (items: Product[]) => {
  return [...items].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });
};

export const formatPrice = (currency?: string | null, price?: number) => {
  return `${currency || ""} ${Number(price || 0).toLocaleString()}`.trim();
};

export const IMAGE_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='800' height='600' fill='%23e4e4e7'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' fill='%2371717a' font-family='Arial' font-size='28'%3ENo image%3C/text%3E%3C/svg%3E";