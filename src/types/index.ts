export interface Store {
    id: string;
    name: string;
    slug: string;
  }
  
  export interface Header {
    store_id: string;
    logo_url: string;
    background_color: string;
    text_color: string;
  }
  
  export interface Footer {
    store_id: string;
    text: string;
    whatsapp: string;
    instagram: string;
    facebook: string;
    address: string;
  }
  
  export interface PageSection {
    id: string;
    page_type: string;
    section_type: string;
    section_order: number;
    content: any;
  }
  
  export interface Product {
    id: string;
    store_id: string;
    name: string;
    slug: string;
    price: number;
    description: string;
    image_url: string;
    is_active: boolean;
  }
  