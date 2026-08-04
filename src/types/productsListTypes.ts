export interface Store {
    id: string;
    owner_id: string;
    name: string;
    slug: string;
    description: string | null;
    created_at: string;
    logo_url: string | null;
    settings: Record<string, unknown> | null;
    updated_at_name: string | null;
    owner_email: string | null;
    whatsapp_number: string | null;
    currency: string | null;
  }
  
  export interface Product {
    id: string;
    name: string;
    category?: string | null;
    price: number;
    currency?: string | null;
    is_active: boolean;
    main_image: string;
    store_id: string;
    created_at?: string;
  }
  
  export type CurrencyOption = {
    value: string;
    label: string;
    search: string;
    flag: string;
    country: string;
  };
  
  export type CachePayload<T> = {
    data: T;
    savedAt: number;
    expiresAt: number;
  };