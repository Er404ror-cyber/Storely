import { type LucideIcon } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  price: number;
  currency?: string | null;
  image_url?: string | null;
  main_image?: string | null;
  is_active: boolean;
  created_at?: string;
  store_id?: string;
}

export interface Page {
  id: string;
  title: string;
  is_home: boolean;
  updated_at?: string;
  store_id?: string;
}

export interface StoreRow {
  id: string;
  name?: string | null;
  slug?: string | null;
  logo_url?: string | null;
  whatsapp_number?: string | null;
  currency?: string | null;
  created_at?: string | null;
  settings?: {
    currency?: string | null;
  } | null;
}

export interface StepItem {
  id: string;
  title: string;
  desc: string;
  done: boolean;
  icon: LucideIcon;
  actionLabel: string;
  route: string;
}

export interface DashboardData {
  store: StoreRow;
  owner_email: string;
  createdAt?: string | null;
  products: Product[];
  pages: Page[];
}

export const resolveCurrency = (store?: StoreRow | null): string => {
  return store?.currency || store?.settings?.currency || '';
};