export type BackgroundAudioSettings = {
  enabled?: boolean;
  type?: 'audio' | null;
  url?: string | null;
  volume?: number;
  autoplay_on_scroll?: boolean;
  startAt?: number;
  endAt?: number;
  deleteToken?: string | null;
  deleteTokenExpiresAt?: number | null;
  originalFilename?: string | null;
  uploadedAt?: string | null;
};

export type PendingDeleteAsset = {
  deleteToken: string;
  secureUrl: string;
  expiresAt: number;
};

export interface AudioSectionProps {
  isEditing: boolean;
  setIsEditing: (open: boolean) => void;
  audioFileInputRef: React.RefObject<HTMLInputElement | null>;
  audioUrl: string;
  audioFileName: string;
  audioEnabled: boolean;
  audioVolume: number;
  setAudioVolume: (vol: number) => void;
  audioStartAt: number;
  audioEndAt: number;
  audioDuration: number;
  isPreviewPlaying: boolean;
  isUploadingAudio: boolean;
  isPendingDelete: boolean;
  hasAudioSettingsChanges: boolean;
  hasAudioReady: boolean;
  selectedAudioFile: File | null;
  audioTooLarge: boolean;
  rangeMax: number;
  clipLength: number;
  displayedAudioDuration: number;
  onAudioFilePick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  togglePreviewPlayback: () => void;
  onChangeStartAt: (val: number) => void;
  onRemoveSavedAudio: () => void;
  onCancel: () => void;
  onDeletePending: () => void;
  onSave: () => void;
  t: (key: any, variables?: Record<string, any>) => string; // Alinhado com useTranslate do Editor do Storely
  AUDIO_ACCEPT: string;
  MIN_AUDIO_VOLUME: number;
  MAX_AUDIO_VOLUME: number;
  helpLinks: {
    compressAudio: string;
    musicDownloadWebsite: string;
  };
}