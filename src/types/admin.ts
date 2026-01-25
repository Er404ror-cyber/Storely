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