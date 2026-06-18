export const CLOUDINARY_CONFIG = {
    cloudName: 'dcffpnzxn',
    imageUploadPreset: 'logo_preset',
    audioUploadPreset: 'audio_preset',
    folders: {
      logos: 'storely/stores/logos',
      audio: 'storely/stores/audio',
    },
    helpLinks: {
      compressImages: 'https://tinypng.com',
      compressAudio: 'https://www.freeconvert.com/mp3-compressor',
      musicDownloadWebsite: 'https://yt5s.in',
    },
  } as const;
  
  export const DESC_LIMIT = 80;
  export const MAX_IMAGE_FILE_SIZE = 1024 * 1024;
  export const MAX_AUDIO_FILE_SIZE = 10 * 1024 * 1024;
  export const MAX_AUDIO_CLIP_SECONDS = 60;
  export const MIN_AUDIO_CLIP_SECONDS = 3;
  export const FIXED_AUDIO_VOLUME = 1;
  
  export const AUDIO_ACCEPT = '.mp3,.m4a,.aac,.ogg,.wav,.webm,.flac,audio/*';
  
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