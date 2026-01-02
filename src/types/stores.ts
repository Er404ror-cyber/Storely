export type Section = {
    id?: string;
    type: 'hero' | 'product_grid' | 'text' | 'contact_info' | 'map';
    content: any;
    order_index: number;
  };
  
  export type Page = {
    id: string;
    slug: string;
    store_id: string;
  };