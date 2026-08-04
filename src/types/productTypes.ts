export interface ProductFormData {
  name: string;
  category: string;
  price: string;
  unit: string;
  full_description: string;
  main_image: string;
  gallery: string[];
}

export interface ProductDetailsProps {
  isCreating?: boolean;
  onClose?: () => void;
}

export type PublicStoreData = {
  id?: string;
  slug: string;
  name?: string;
  whatsapp_number?: string | null;
  currency?: string | null;
  settings?: any;
  logo_url?: string | null;
  description?: string | null;
};

export type ProductRow = {
  id: string;
  name?: string | null;
  category?: string | null;
  price?: number | string | null;
  unit?: string | null;
  full_description?: string | null;
  main_image?: string | null;
  gallery?: string[] | null;
  store_id?: string | null;
};

export type ProductLocationState = {
  product?: ProductRow;
  store?: PublicStoreData;
  source?: string;
  searchMode?: string;
  fromStore?: boolean;
};