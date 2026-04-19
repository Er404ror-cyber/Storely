

export type SectionStyles = {
  theme?: 'dark' | 'light';
  align?: 'center' | 'left' | 'justify';
  fontSize?: 'small' | 'medium' | 'large' | 'base';
  cols?: string;
};

export interface MediaItem {
  id?: string;
  url: string;
  type: 'video' | 'image';
  thumbnail?: string;
  size?: number;
  file?: File;
  isTemp?: boolean;
  delete_token?: string;
}

export type SocialProvider =
  | 'youtube'
  | 'spotify'
  | 'apple_music'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'x'
  | 'linkedin'
  | 'website';

export interface SocialLinkItem {
  id?: string;
  provider: SocialProvider;
  url: string;
  title?: string;
  subtitle?: string;
}

export interface SectionContent {
  title?: string;
  category?: string;
  sub?: string;
  description?: string;
  image?: string;
  phone?: string;
  location?: string;
  email?: string;
  items?: Array<{ title: string; desc: string; price?: string }>;
  images?: MediaItem[];
  socialLinks?: SocialLinkItem[];
  [key: string]: unknown;
  
}

export interface SectionProps {
  content: SectionContent;
  style: SectionStyles;
  onUpdate?: (k: string, v: unknown) => void;
}
// src/types/library.ts

export interface GalleryHeaderProps<K extends string = string> { // <--- Adicione isto
  content: {
    category?: string;
    title?: string;
    description?: string;
    [key: string]: unknown;
  };
  style: {
    align?: 'center' | 'left' | 'justify';
        fontSize?: string;
    [key: string]: unknown;
  };
  isEditable: boolean;
  onUpdate?: (field: string, value: string) => void;
  t: (key: K) => string; // <--- Agora usamos o K aqui
}