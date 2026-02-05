export type SectionStyles = {
  theme?: 'dark' | 'light';
  align?: 'center' | 'left' | 'justify';
  fontSize?: 'small' | 'medium' | 'large' | 'base';
  cols?: string;
};

export interface MediaItem {
  url?: string;
  type?: 'image' | 'video';
  thumbnail?: string;
}

export interface SectionContent {
  title?: string;
  sub?: string;
  description?: string;
  image?: string;
  phone?: string;
  location?: string;
  email?: string;
  items?: Array<{ title: string; desc: string; price?: string }>;
  images?: MediaItem[];
  [key: string]: unknown;
}

export interface SectionProps {
  content: SectionContent;
  style: SectionStyles;
  onUpdate?: (k: string, v: unknown) => void;
}
