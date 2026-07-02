export type IntroPhase = "entering" | "visible" | "pressed" | "leaving" | "hidden";

export interface PublicBackgroundAudioProps {
  settings: {
    enabled?: boolean;
    url?: string | null;
    startAt?: number;
    endAt?: number;
  } | null;
  storeName?: string;
  storeId: string;
  storeDescription?: string;
  storeCurrency?: string;
}

export function isPlayableBackgroundAudioUrl(url: string): boolean {
  if (!url) return false;
  return /\.(mp3|m4a|aac|ogg|wav|webm|flac|mp4)/i.test(url) || url.includes("cloudinary.com");
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export const REAL_MAX_VOLUME = 0.05; // 5% fixo de ganho de hardware para evitar áudio estourado
export const DEFAULT_SEGMENT_SECONDS = 60;