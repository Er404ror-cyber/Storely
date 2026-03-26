export interface Store {
    id: string;
    name: string;
    slug: string;
    updated_at_name: string;
    user_id: string;
  }
  
  export interface AdminHeaderProps {
    store: Store | null | undefined;
    onOpenMenu: () => void;
  }




  export interface AdminStore {
    id: string;
    name: string;
    slug: string;
    owner_id: string;
    logo_url: string | null;
    updated_at_name: string | null;
    created_at: string;
  }
  
  export interface AdminPage {
    id: string;
    store_id: string;
    title: string;
    slug: string;
    type: string;
    is_home: boolean;
    created_at: string;
  }
  
  export interface CachePayload<T> {
    data: T;
    savedAt: number;
    expiresAt: number;
  }