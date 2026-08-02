import type { SectionProps } from "../sections/main";
import type { MediaData } from "../sections/mediarender";

export interface HeroContentData {
  title?: string;
  sub?: string;
  badge?: string;
  btnText?: string;
  phone?: string;
  hero_subtitle?: string;
  media?: MediaData & { isTemp?: boolean; size?: number; delete_token?: string };
}

export interface HeroProps extends Omit<SectionProps, 'content'> {
  content: HeroContentData;
}

export type StoreData = {
  id: string;
  name: string;
  logo_url: string | null;
  whatsapp_number: string | null;
};

export type MediaContent = {
  url: string;
  size: number;
  file?: File;
  type?: 'image' | 'video';
  isTemp?: boolean;
  delete_token?: string;
  id?: string;
};

export interface HeroStyleProps {
  theme?: 'light' | 'dark';
  fontSize?: string;
  align?: 'left' | 'center' | 'right';
  cols?: string;
  [key: string]: unknown;
}

export const LIMITS = { BADGE: 15, TITLE: 35, SUBTITLE: 75, SUBTITLE_EXTRA: 25, BUTTON: 12 };
export const FILE_LIMITS = { image: 1, video: 5 };