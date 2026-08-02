
export interface SlotState {
  preview: string;
  file: File | null;
  size: number;
  deleteToken: string | null;
  error: string;
  isProcessing: boolean;
}

export const DEFAULT_SLOT: SlotState = {
  preview: '',
  file: null,
  size: 0,
  deleteToken: null,
  error: '',
  isProcessing: false,
};

export type PersistedSlotToken = {
  slot: number;
  token: string;
  savedAt: number;
};

export const TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutos
export const IMAGE_COMPRESS_URL = 'https://imagecompressor.com/';