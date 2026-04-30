import { useState, useMemo, useEffect, useRef, memo, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlignLeft,
  Loader2,
  ChevronDown,
  Search,
  Upload,
  Check,
  ExternalLink,
  Music4,
  Volume2,
  Play,
  PauseCircle,
  Scissors,
  Link as LinkIcon,
  Trash2,
  ImageIcon,
  Phone,
} from 'lucide-react';
import {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumber,
  type Country,
} from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import ptLabels from 'react-phone-number-input/locale/pt.json';
import enLabels from 'react-phone-number-input/locale/en.json';

import { useTranslate } from '../../../context/LanguageContext';
import { supabase } from '../../../lib/supabase';
import { notify } from '../../../utils/toast';
import { SectionInfo } from '../AdminSettingsComponents';
import { getUserCountry } from '../../../utils/mzn';

const CLOUDINARY_CONFIG = {
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

const DESC_LIMIT = 200;
const MAX_IMAGE_FILE_SIZE = 1024 * 1024;
const MAX_AUDIO_FILE_SIZE = 10 * 1024 * 1024;

const MAX_AUDIO_CLIP_SECONDS = 60;
const MIN_AUDIO_CLIP_SECONDS = 3;

const MIN_AUDIO_VOLUME = 0.01;
const MAX_AUDIO_VOLUME = 0.05;
const DEFAULT_AUDIO_VOLUME = 0.03;

const AUDIO_ACCEPT = '.mp3,.m4a,.aac,.ogg,.wav,.webm,.flac,audio/*';

type BackgroundAudioSettings = {
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

type PendingDeleteAsset = {
  deleteToken: string;
  secureUrl: string;
  expiresAt: number;
};

const CountryFlag = memo(({ country }: { country: Country }) => {
  const FlagComponent = flags[country];

  if (!FlagComponent) {
    return <div className="h-3.5 w-5 shrink-0 rounded-[2px] bg-slate-200" />;
  }

  return (
    <div className="h-3.5 w-5 shrink-0 overflow-hidden rounded-[2px] border border-black/5 shadow-sm">
      <FlagComponent title={country} />
    </div>
  );
});

CountryFlag.displayName = 'CountryFlag';

function clamp(num: number, min: number, max: number) {
  return Math.max(min, Math.min(num, max));
}

function isSupportedAudioFile(file?: File | null) {
  if (!file) return false;
  return file.type.startsWith('audio/') || /\.(mp3|m4a|aac|ogg|wav|webm|flac)$/i.test(file.name);
}

function formatSeconds(value: number) {
  if (!Number.isFinite(value) || value < 0) return '0:00';
  const mins = Math.floor(value / 60);
  const secs = Math.floor(value % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function getAudioSettings(settings: any): BackgroundAudioSettings {
  return settings?.background_audio || {};
}

function buildCloudinaryUrl(resourceType: 'image' | 'video') {
  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/${resourceType}/upload`;
}

async function uploadToCloudinary({
  file,
  resourceType,
  uploadPreset,
  folder,
}: {
  file: File;
  resourceType: 'image' | 'video';
  uploadPreset: string;
  folder: string;
}) {
  const formData = new FormData();

  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);
  formData.append('filename_override', file.name.replace(/\.[^.]+$/, ''));

  const response = await fetch(buildCloudinaryUrl(resourceType), {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok || !data?.secure_url) {
    throw new Error(data?.error?.message || 'Cloudinary upload failed');
  }

  return data as {
    secure_url: string;
    public_id: string;
    original_filename?: string;
    delete_token?: string;
    resource_type?: string;
    bytes?: number;
    duration?: number;
  };
}

async function deleteCloudinaryByToken(deleteToken: string) {
  const body = new URLSearchParams();

  body.append('token', deleteToken);

  const response = await fetch('https://api.cloudinary.com/v1_1/delete_by_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error?.message || 'Delete by token failed');
  }

  return data;
}

export function StoreTab({ store }: { store: any }) {
  const { t, language } = useTranslate();
  const queryClient = useQueryClient();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement>(null);
  const previewRafRef = useRef<number | null>(null);
  const pendingDeleteRef = useRef<PendingDeleteAsset | null>(null);
  const initialPhoneLoadRef = useRef(true);

  const countryLabels = useMemo(() => (language === 'pt' ? ptLabels : enLabels), [language]);
  const initialAudio = useMemo(() => getAudioSettings(store?.settings), [store?.settings]);

  const [isEditingMain, setIsEditingMain] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => getUserCountry() as Country);
  const [isCountrySelectorOpen, setIsCountrySelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [imageTooLarge, setImageTooLarge] = useState(false);

  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState(store?.description || '');

  const [isEditingAudio, setIsEditingAudio] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [audioTooLarge, setAudioTooLarge] = useState(false);
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [isDeletingPendingAudio, setIsDeletingPendingAudio] = useState(false);

  const [audioEnabled, setAudioEnabled] = useState(!!initialAudio?.enabled);
  const [audioVolume, setAudioVolume] = useState(
    typeof initialAudio?.volume === 'number'
      ? clamp(initialAudio.volume, MIN_AUDIO_VOLUME, MAX_AUDIO_VOLUME)
      : DEFAULT_AUDIO_VOLUME
  );

  const [audioUrl, setAudioUrl] = useState(initialAudio?.url || '');
  const [audioFileName, setAudioFileName] = useState(initialAudio?.originalFilename || '');
  const [audioDuration, setAudioDuration] = useState(MAX_AUDIO_CLIP_SECONDS);
  const [audioStartAt, setAudioStartAt] = useState(
    typeof initialAudio?.startAt === 'number' ? initialAudio.startAt : 0
  );
  const [audioEndAt, setAudioEndAt] = useState(
    typeof initialAudio?.endAt === 'number' ? initialAudio.endAt : MAX_AUDIO_CLIP_SECONDS
  );
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  const savedAudio = useMemo(() => getAudioSettings(store?.settings), [store?.settings]);
  const hasSavedAudio = !!savedAudio?.url;

  const displayedAudioDuration = useMemo(() => {
    const savedEnd = typeof savedAudio?.endAt === 'number' ? savedAudio.endAt : 0;
    return Math.max(audioDuration || 0, savedEnd, MAX_AUDIO_CLIP_SECONDS);
  }, [audioDuration, savedAudio?.endAt]);

  const rangeMax = useMemo(() => {
    return Math.max(0, displayedAudioDuration - MIN_AUDIO_CLIP_SECONDS);
  }, [displayedAudioDuration]);

  const clipLength = useMemo(() => {
    return Math.max(0, audioEndAt - audioStartAt);
  }, [audioStartAt, audioEndAt]);

  const hasAudioReady = useMemo(() => {
    return !!audioUrl && clipLength >= MIN_AUDIO_CLIP_SECONDS && clipLength <= MAX_AUDIO_CLIP_SECONDS;
  }, [audioUrl, clipLength]);

  const hasAudioSettingsChanges = useMemo(() => {
    if (!hasSavedAudio) return false;

    const savedVolume = clamp(
      typeof savedAudio?.volume === 'number' ? savedAudio.volume : DEFAULT_AUDIO_VOLUME,
      MIN_AUDIO_VOLUME,
      MAX_AUDIO_VOLUME
    );

    return (
      !!savedAudio?.enabled !== audioEnabled ||
      Math.abs(savedVolume - audioVolume) > 0.001 ||
      Number(savedAudio?.startAt || 0) !== Number(audioStartAt || 0) ||
      Number(savedAudio?.endAt || MAX_AUDIO_CLIP_SECONDS) !== Number(audioEndAt || MAX_AUDIO_CLIP_SECONDS)
    );
  }, [hasSavedAudio, savedAudio, audioEnabled, audioVolume, audioStartAt, audioEndAt]);

  const filteredCountries = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const all = getCountries();

    if (!query) return all;

    return all.filter((country) => {
      const label = String(countryLabels[country as keyof typeof countryLabels] || country).toLowerCase();
      const code = getCountryCallingCode(country);

      return label.includes(query) || code.includes(query) || country.toLowerCase().includes(query);
    });
  }, [searchQuery, countryLabels]);

  const isPhoneValid = useMemo(() => {
    if (!phoneNumber) return false;

    try {
      return isValidPhoneNumber(`+${getCountryCallingCode(selectedCountry)}${phoneNumber}`);
    } catch {
      return false;
    }
  }, [phoneNumber, selectedCountry]);

  useEffect(() => {
    setDescValue(store?.description || '');
  }, [store?.description]);

  useEffect(() => {
    const audio = getAudioSettings(store?.settings);

    const savedStart = typeof audio?.startAt === 'number' ? audio.startAt : 0;
    const savedEnd =
      typeof audio?.endAt === 'number'
        ? audio.endAt
        : savedStart + MAX_AUDIO_CLIP_SECONDS;

    setAudioEnabled(!!audio?.enabled);
    setAudioVolume(
      typeof audio?.volume === 'number'
        ? clamp(audio.volume, MIN_AUDIO_VOLUME, MAX_AUDIO_VOLUME)
        : DEFAULT_AUDIO_VOLUME
    );

    setAudioUrl(audio?.url || '');
    setAudioFileName(audio?.originalFilename || '');
    setAudioStartAt(savedStart);
    setAudioEndAt(Math.max(savedEnd, savedStart + MIN_AUDIO_CLIP_SECONDS));
    setAudioDuration(Math.max(savedEnd, MAX_AUDIO_CLIP_SECONDS));
  }, [store?.settings]);

  useEffect(() => {
    if (store?.whatsapp_number && initialPhoneLoadRef.current) {
      try {
        const parsed = parsePhoneNumber(`+${store.whatsapp_number}`);

        if (parsed?.country) {
          setSelectedCountry(parsed.country as Country);
          setPhoneNumber(parsed.nationalNumber);
        }
      } catch {
        const code = getCountryCallingCode(selectedCountry);
        const raw = String(store.whatsapp_number);

        setPhoneNumber(raw.startsWith(code) ? raw.slice(code.length) : raw);
      } finally {
        initialPhoneLoadRef.current = false;
      }
    }
  }, [store?.whatsapp_number, selectedCountry]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCountrySelectorOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside, { passive: true });

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
      if (previewRafRef.current !== null) cancelAnimationFrame(previewRafRef.current);
    };
  }, [localPreviewUrl]);

  useEffect(() => {
    const el = previewAudioRef.current;
    if (!el) return;

    const onPlay = () => setIsPreviewPlaying(true);
    const onPause = () => setIsPreviewPlaying(false);
    const onEnded = () => setIsPreviewPlaying(false);

    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('ended', onEnded);

    return () => {
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('ended', onEnded);
    };
  }, [audioUrl]);

  useEffect(() => {
    const el = previewAudioRef.current;

    if (!el || !isPreviewPlaying) return;

    let lastCheck = 0;

    const tick = (time: number) => {
      if (time - lastCheck > 120) {
        lastCheck = time;

        if (!el.paused && el.currentTime >= audioEndAt - 0.05) {
          el.currentTime = audioStartAt;
        }
      }

      previewRafRef.current = requestAnimationFrame(tick);
    };

    previewRafRef.current = requestAnimationFrame(tick);

    return () => {
      if (previewRafRef.current !== null) {
        cancelAnimationFrame(previewRafRef.current);
        previewRafRef.current = null;
      }
    };
  }, [isPreviewPlaying, audioStartAt, audioEndAt]);

  const updateField = useMutation({
    mutationFn: async ({ field, value }: { field: string; value: any }) => {
      const { error } = await supabase.from('stores').update({ [field]: value }).eq('id', store?.id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-full-settings'] });
      queryClient.invalidateQueries({ queryKey: ['store-public'] });

      notify.success(t('save_success'));

      if (variables.field === 'whatsapp_number') setIsEditingMain(false);
      if (variables.field === 'description') setIsEditingDesc(false);
    },
    onError: () => notify.error(t('save_error') || 'Erro ao salvar'),
  });

  const updateSettings = useMutation({
    mutationFn: async (nextSettings: any) => {
      const { error } = await supabase.from('stores').update({ settings: nextSettings }).eq('id', store?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-full-settings'] });
      queryClient.invalidateQueries({ queryKey: ['store-public'] });

      notify.success(t('save_success'));
      setIsEditingAudio(false);
    },
    onError: () => notify.error(t('save_error') || 'Erro ao salvar'),
  });

  const stopPreview = useCallback(() => {
    const el = previewAudioRef.current;

    if (el) el.pause();

    setIsPreviewPlaying(false);
  }, []);

  const resetPreviewAudio = useCallback(() => {
    const el = previewAudioRef.current;

    if (el) {
      el.pause();
      el.currentTime = 0;
      el.removeAttribute('src');
      el.load();
    }

    setIsPreviewPlaying(false);
  }, []);

  const prepareAudioElement = useCallback(
    (url: string) => {
      const el = previewAudioRef.current;
      if (!el) return;

      el.pause();
      el.src = url;
      el.preload = 'metadata';
      el.volume = clamp(audioVolume, MIN_AUDIO_VOLUME, MAX_AUDIO_VOLUME);
      el.load();

      setIsPreviewPlaying(false);
    },
    [audioVolume]
  );

  const restoreAudioFromStore = useCallback(() => {
    const audio = getAudioSettings(store?.settings);

    resetPreviewAudio();

    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }

    if (audioFileInputRef.current) audioFileInputRef.current.value = '';

    const savedStart = typeof audio?.startAt === 'number' ? audio.startAt : 0;
    const savedEnd =
      typeof audio?.endAt === 'number'
        ? audio.endAt
        : savedStart + MAX_AUDIO_CLIP_SECONDS;

    setSelectedAudioFile(null);
    setAudioTooLarge(false);
    setAudioEnabled(!!audio?.enabled);
    setAudioVolume(
      typeof audio?.volume === 'number'
        ? clamp(audio.volume, MIN_AUDIO_VOLUME, MAX_AUDIO_VOLUME)
        : DEFAULT_AUDIO_VOLUME
    );
    setAudioUrl(audio?.url || '');
    setAudioFileName(audio?.originalFilename || '');
    setAudioDuration(Math.max(savedEnd, MAX_AUDIO_CLIP_SECONDS));
    setAudioStartAt(savedStart);
    setAudioEndAt(Math.max(savedEnd, savedStart + MIN_AUDIO_CLIP_SECONDS));
  }, [store?.settings, localPreviewUrl, resetPreviewAudio]);

  const deletePendingUploadedAudio = useCallback(async () => {
    const pending = pendingDeleteRef.current;
    if (!pending) return false;

    if (Date.now() > pending.expiresAt) {
      pendingDeleteRef.current = null;
      return false;
    }

    setIsDeletingPendingAudio(true);

    try {
      await deleteCloudinaryByToken(pending.deleteToken);
      pendingDeleteRef.current = null;
      return true;
    } catch (error) {
      console.error('[Cloudinary] falha ao remover áudio temporário:', error);
      return false;
    } finally {
      setIsDeletingPendingAudio(false);
    }
  }, []);

  const handleLogoUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (!file || !store?.id) return;

      setImageTooLarge(false);

      if (file.size > MAX_IMAGE_FILE_SIZE) {
        setImageTooLarge(true);
        notify.error(t('file_too_large'));

        if (fileInputRef.current) fileInputRef.current.value = '';

        return;
      }

      try {
        setIsUploadingLogo(true);

        const data = await uploadToCloudinary({
          file,
          resourceType: 'image',
          uploadPreset: CLOUDINARY_CONFIG.imageUploadPreset,
          folder: CLOUDINARY_CONFIG.folders.logos,
        });

        const optimizedUrl = data.secure_url.replace('/upload/', '/upload/f_auto,q_auto:good,w_800,c_limit/');

        updateField.mutate({
          field: 'logo_url',
          value: `${optimizedUrl}?t=${Date.now()}`,
        });
      } catch (error) {
        console.error('[Cloudinary] logo upload error:', error);
        notify.error(t('upload_error') || 'Erro no upload');
      } finally {
        setIsUploadingLogo(false);

        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [store?.id, t, updateField]
  );

  const handleAudioFilePick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (!file) return;

      setAudioTooLarge(false);

      if (!isSupportedAudioFile(file)) {
        notify.error(t('store_music_invalid_file') || 'Formato de áudio não suportado');
        e.target.value = '';
        return;
      }

      if (file.size > MAX_AUDIO_FILE_SIZE) {
        setAudioTooLarge(true);
        notify.error(t('store_music_file_too_large') || 'Ficheiro muito grande');
        e.target.value = '';
        return;
      }

      resetPreviewAudio();

      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);

      const objectUrl = URL.createObjectURL(file);

      setLocalPreviewUrl(objectUrl);
      setAudioUrl(objectUrl);
      setAudioFileName(file.name);
      setSelectedAudioFile(file);
      setAudioDuration(MAX_AUDIO_CLIP_SECONDS);
      setAudioStartAt(0);
      setAudioEndAt(MAX_AUDIO_CLIP_SECONDS);
      setAudioEnabled(true);
      setAudioVolume(DEFAULT_AUDIO_VOLUME);

      window.setTimeout(() => prepareAudioElement(objectUrl), 0);
    },
    [localPreviewUrl, prepareAudioElement, resetPreviewAudio, t]
  );

  const handlePreviewLoadedMetadata = useCallback(() => {
    const el = previewAudioRef.current;
    if (!el) return;

    const duration = Number.isFinite(el.duration) && el.duration > 0 ? el.duration : MAX_AUDIO_CLIP_SECONDS;

    setAudioDuration(duration);

    setAudioStartAt((prevStart) => {
      const safeStart = clamp(prevStart, 0, Math.max(0, duration - MIN_AUDIO_CLIP_SECONDS));

      setAudioEndAt((prevEnd) => {
        const preferredEnd = prevEnd > safeStart ? prevEnd : safeStart + MAX_AUDIO_CLIP_SECONDS;

        return clamp(
          preferredEnd,
          safeStart + MIN_AUDIO_CLIP_SECONDS,
          Math.min(duration, safeStart + MAX_AUDIO_CLIP_SECONDS)
        );
      });

      return safeStart;
    });

    el.volume = clamp(audioVolume, MIN_AUDIO_VOLUME, MAX_AUDIO_VOLUME);
  }, [audioVolume]);

  const togglePreviewPlayback = useCallback(async () => {
    const el = previewAudioRef.current;

    if (!el || !audioUrl) return;

    try {
      if (!el.src || el.src !== audioUrl) {
        el.src = audioUrl;
        el.preload = 'metadata';
        el.load();
      }

      el.volume = clamp(audioVolume, MIN_AUDIO_VOLUME, MAX_AUDIO_VOLUME);

      if (el.paused) {
        if (el.currentTime < audioStartAt || el.currentTime >= audioEndAt) {
          el.currentTime = audioStartAt;
        }

        await el.play();
        setIsPreviewPlaying(true);
      } else {
        el.pause();
        setIsPreviewPlaying(false);
      }
    } catch (error) {
      console.error('[Audio Preview] playback error:', error);
      setIsPreviewPlaying(false);
      notify.error(t('store_music_play_error') || 'Não foi possível tocar o áudio.');
    }
  }, [audioUrl, audioVolume, audioStartAt, audioEndAt, t]);

  const handleChangeStartAt = useCallback(
    (value: number) => {
      const safeDuration = Math.max(displayedAudioDuration, MIN_AUDIO_CLIP_SECONDS);
      const maxStart = Math.max(0, safeDuration - MIN_AUDIO_CLIP_SECONDS);
      const nextStart = clamp(value, 0, maxStart);
      const nextEnd = Math.min(safeDuration, nextStart + MAX_AUDIO_CLIP_SECONDS);

      setAudioStartAt(nextStart);
      setAudioEndAt(nextEnd);

      const el = previewAudioRef.current;

      if (el && Number.isFinite(el.duration)) {
        el.currentTime = nextStart;
      }
    },
    [displayedAudioDuration]
  );

  const handleUploadAudio = useCallback(async () => {
    const file = selectedAudioFile;

    if (!file || !store?.id) return;

    const finalEndAt = Math.min(displayedAudioDuration, audioStartAt + MAX_AUDIO_CLIP_SECONDS);
    const finalClipLength = Math.max(0, finalEndAt - audioStartAt);

    if (finalClipLength < MIN_AUDIO_CLIP_SECONDS || finalClipLength > MAX_AUDIO_CLIP_SECONDS) {
      notify.error(t('store_music_clip_help') || 'Escolha um trecho de até 1 minuto.');
      return;
    }

    try {
      stopPreview();
      setIsUploadingAudio(true);

      await deletePendingUploadedAudio();

      const data = await uploadToCloudinary({
        file,
        resourceType: 'video',
        uploadPreset: CLOUDINARY_CONFIG.audioUploadPreset,
        folder: CLOUDINARY_CONFIG.folders.audio,
      });

      const deleteToken = data.delete_token || null;
      const deleteTokenExpiresAt = deleteToken ? Date.now() + 10 * 60 * 1000 : null;

      if (deleteToken && deleteTokenExpiresAt) {
        pendingDeleteRef.current = {
          deleteToken,
          secureUrl: data.secure_url,
          expiresAt: deleteTokenExpiresAt,
        };
      }

      const nextSettings = {
        ...(store?.settings || {}),
        background_audio: {
          enabled: true,
          type: 'audio',
          url: data.secure_url,
          volume: clamp(audioVolume, MIN_AUDIO_VOLUME, MAX_AUDIO_VOLUME),
          autoplay_on_scroll: true,
          startAt: clamp(audioStartAt, 0, Math.max(0, displayedAudioDuration - MIN_AUDIO_CLIP_SECONDS)),
          endAt: finalEndAt,
          deleteToken,
          deleteTokenExpiresAt,
          originalFilename: file.name,
          uploadedAt: new Date().toISOString(),
        },
      };

      updateSettings.mutate(nextSettings, {
        onSuccess: () => {
          pendingDeleteRef.current = null;
          setSelectedAudioFile(null);
          setAudioUrl(data.secure_url);
          setAudioFileName(file.name);
          setAudioEndAt(finalEndAt);
          setAudioEnabled(true);

          if (localPreviewUrl) {
            URL.revokeObjectURL(localPreviewUrl);
            setLocalPreviewUrl(null);
          }

          if (audioFileInputRef.current) audioFileInputRef.current.value = '';
        },
      });
    } catch (error) {
      console.error('[Cloudinary] audio upload error:', error);
      notify.error(t('store_music_upload_error') || 'Erro ao enviar áudio');
    } finally {
      setIsUploadingAudio(false);
    }
  }, [
    selectedAudioFile,
    store?.id,
    store?.settings,
    displayedAudioDuration,
    audioStartAt,
    audioVolume,
    deletePendingUploadedAudio,
    localPreviewUrl,
    t,
    updateSettings,
    stopPreview,
  ]);

  const handleSaveAudioSettingsOnly = useCallback(() => {
    if (!store?.id || !savedAudio?.url) return;

    stopPreview();

    const nextSettings = {
      ...(store?.settings || {}),
      background_audio: {
        ...savedAudio,
        enabled: audioEnabled,
        type: 'audio',
        volume: clamp(audioVolume, MIN_AUDIO_VOLUME, MAX_AUDIO_VOLUME),
        autoplay_on_scroll: true,
        startAt: audioStartAt,
        endAt: audioEndAt,
      },
    };

    updateSettings.mutate(nextSettings);
  }, [
    store?.id,
    store?.settings,
    savedAudio,
    audioEnabled,
    audioVolume,
    audioStartAt,
    audioEndAt,
    updateSettings,
    stopPreview,
  ]);

  const handleRemoveSavedAudio = useCallback(() => {
    resetPreviewAudio();

    const nextSettings = {
      ...(store?.settings || {}),
      background_audio: {
        enabled: false,
        type: 'audio',
        url: '',
        volume: DEFAULT_AUDIO_VOLUME,
        autoplay_on_scroll: true,
        startAt: 0,
        endAt: MAX_AUDIO_CLIP_SECONDS,
        deleteToken: null,
        deleteTokenExpiresAt: null,
        originalFilename: null,
        uploadedAt: null,
      },
    };

    setAudioUrl('');
    setAudioEnabled(false);
    setAudioVolume(DEFAULT_AUDIO_VOLUME);
    setAudioStartAt(0);
    setAudioEndAt(MAX_AUDIO_CLIP_SECONDS);
    setAudioDuration(MAX_AUDIO_CLIP_SECONDS);
    setAudioFileName('');
    setAudioTooLarge(false);
    setSelectedAudioFile(null);

    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }

    if (audioFileInputRef.current) audioFileInputRef.current.value = '';

    updateSettings.mutate(nextSettings);
  }, [store?.settings, updateSettings, localPreviewUrl, resetPreviewAudio]);

  const handleSaveMain = useCallback(() => {
    if (!isPhoneValid) return;

    updateField.mutate({
      field: 'whatsapp_number',
      value: `${getCountryCallingCode(selectedCountry)}${phoneNumber}`,
    });
  }, [isPhoneValid, phoneNumber, selectedCountry, updateField]);

  return (
    <div className="animate-in slide-in-from-left-4 space-y-6 pb-10 duration-500 md:space-y-8">
      <SectionInfo title={t('store_required_title')} subtitle={t('store_required_subtitle')} />

      <div className="rounded-[2rem] border border-slate-100 bg-white shadow-xl md:rounded-[3rem]">
        <div className="px-5 py-6 md:px-10 md:py-8">
          <div className="grid gap-5 lg:grid-cols-[auto_1fr] lg:items-center">
            <div className="flex items-center gap-4">
              <div className="group relative shrink-0">
                <div className="flex h-20 min-w-[76px] max-w-[180px] items-center justify-center overflow-hidden rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-white shadow-inner md:h-24 md:min-w-[96px]">
                  {isUploadingLogo ? (
                    <Loader2 className="animate-spin text-indigo-600" size={24} />
                  ) : (
                    <img
                      src={store?.logo_url || '/img/Mascote4.png'}
                      className="h-20 w-auto max-w-[150px] object-contain md:h-24"
                      alt="Logo"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/img/Mascote4.png';
                      }}
                    />
                  )}
                </div>

                {!isUploadingLogo ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center rounded-[1.5rem] bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Upload className="text-white" size={20} />
                  </button>
                ) : null}
              </div>

              <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingLogo}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white disabled:opacity-60"
              >
                {isUploadingLogo ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                {t('change_image')}
              </button>
            </div>

            <button
  type="button"
  onClick={() => setIsEditingMain(true)}
  className="group w-full rounded-3xl border border-slate-100 bg-slate-50/70 p-3 text-left shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50/60 active:scale-[0.99] cursor-pointer"
>
              <div className="mb-2 flex items-center gap-2">
                <Phone size={14} className="text-indigo-600" />

                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {t('store_phone_required_label')}
                </span>

                <span className="rounded-full bg-red-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-red-500">
                  {t('required')}
                </span>
              </div>

              {store?.whatsapp_number ? (
                <div className="flex min-w-0 items-center gap-3">
                  <CountryFlag country={selectedCountry} />

                  <p className="truncate text-xl font-black italic tracking-tighter text-slate-800">
                    +{store.whatsapp_number}
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-widest text-amber-700">
                    {t('store_phone_missing_title')}
                  </p>

                  <p className="mt-1 text-[12px] font-medium text-amber-700/80">
                    {t('store_phone_missing_help')}
                  </p>
                </div>
                
              )}
                  <ChevronDown
  size={16}
  className="mt-2 text-slate-400 transition-transform group-hover:text-indigo-600"
/>
            </button>
          </div>

          {imageTooLarge ? (
            <a
              href={CLOUDINARY_CONFIG.helpLinks.compressImages}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter text-indigo-600 hover:underline"
            >
              {t('compress_link')} <ExternalLink size={10} />
            </a>
          ) : null}

          {isEditingMain ? (
            <div className="mt-5 rounded-3xl border border-indigo-100 bg-indigo-50/40 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-auto" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsCountrySelectorOpen((prev) => !prev)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:w-auto"
                  >
                    <div className="flex items-center gap-2">
                      <CountryFlag country={selectedCountry} />
                      <span className="text-sm font-black">+{getCountryCallingCode(selectedCountry)}</span>
                    </div>

                    <ChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform ${isCountrySelectorOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isCountrySelectorOpen ? (
                    <div className="absolute left-0 top-full z-[9999] mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:w-72">
                      <div className="flex items-center gap-2 border-b border-slate-50 bg-slate-50 p-3">
                        <Search size={14} className="text-slate-400" />

                        <input
                          autoFocus
                          type="text"
                          placeholder={t('search_country')}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-transparent text-[11px] font-bold uppercase outline-none"
                        />
                      </div>

                      <div className="custom-scrollbar max-h-52 overflow-y-auto p-1">
                        {filteredCountries.map((country) => (
                          <button
                            key={country}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(country);
                              setIsCountrySelectorOpen(false);
                              setSearchQuery('');
                            }}
                            className={`flex w-full items-center justify-between rounded-xl p-3 transition-all ${
                              selectedCountry === country
                                ? 'bg-indigo-50 text-indigo-600'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <CountryFlag country={country} />

                              <span className="w-32 truncate text-[10px] font-black uppercase">
                                {countryLabels[country as keyof typeof countryLabels] || country}
                              </span>
                            </div>

                            <span className="text-[10px] font-bold opacity-40">+{getCountryCallingCode(country)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <input
                  autoFocus
                  type="text"
                  inputMode="numeric"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder={t('phone_number')}
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-lg font-black italic tracking-tighter outline-none transition-colors ${
                    !isPhoneValid && phoneNumber ? 'border-red-400' : 'border-slate-200 focus:border-indigo-500'
                  }`}
                />
              </div>

              <p className="mt-2 text-[11px] font-medium text-slate-500">{t('store_phone_required_hint')}</p>

              {!isPhoneValid && phoneNumber ? (
                <p className="mt-2 text-[10px] font-bold uppercase text-red-500">{t('invalid_phone')}</p>
              ) : null}

              <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditingMain(false)}
                  className="rounded-xl bg-white px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500"
                >
                  {t('cancel')}
                </button>

                <button
                  type="button"
                  disabled={!isPhoneValid || updateField.isPending}
                  onClick={handleSaveMain}
                  className="rounded-xl bg-indigo-600 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-50"
                >
                  {updateField.isPending ? <Loader2 size={12} className="mx-auto animate-spin" /> : t('save')}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <SectionInfo title={t('store_customization_title')} subtitle={t('store_customization_subtitle')} />

      <div className="divide-y divide-slate-50 rounded-[2rem] border border-slate-100 bg-white shadow-xl md:rounded-[3rem]">
        <div className="px-5 py-6 md:px-10 md:py-8">
          <div className="flex flex-col gap-6 md:flex-row">
            <div
              className={`hidden self-start rounded-2xl p-4 transition-all md:block ${
                isEditingDesc ? 'rotate-3 bg-indigo-600 text-white shadow-lg' : 'border border-slate-100 bg-white text-slate-400'
              }`}
            >
              <AlignLeft size={20} />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                  {t('short_description')}
                </p>

                {isEditingDesc ? (
                  <span className={`text-[10px] font-black ${descValue.length >= DESC_LIMIT ? 'text-red-500' : 'text-indigo-600'}`}>
                    {descValue.length}/{DESC_LIMIT}
                  </span>
                ) : null}
              </div>

              {isEditingDesc ? (
                <div className="space-y-4">
                  <textarea
                    autoFocus
                    value={descValue}
                    onChange={(e) => setDescValue(e.target.value.slice(0, DESC_LIMIT))}
                    rows={3}
                    className="w-full resize-none rounded-2xl border-2 border-indigo-100 bg-white p-4 text-sm font-bold text-slate-700 shadow-inner outline-none transition-all focus:border-indigo-600"
                    placeholder={t('description_textarea_placeholder')}
                  />

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingDesc(false);
                        setDescValue(store?.description || '');
                      }}
                      className="rounded-xl bg-slate-100 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500"
                    >
                      {t('cancel')}
                    </button>

                    <button
                      type="button"
                      onClick={() => updateField.mutate({ field: 'description', value: descValue })}
                      disabled={updateField.isPending}
                      className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-[10px] font-black uppercase text-white shadow-lg active:scale-95 disabled:opacity-60"
                    >
                      {updateField.isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={14} />}
                      {t('save')}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingDesc(true)}
                  className="group w-full cursor-pointer rounded-2xl border border-dashed border-slate-200 bg-white/50 p-4 text-left transition-all hover:border-indigo-300 hover:bg-white"
                >
                  <p className={`text-sm italic tracking-tight ${store?.description ? 'font-bold text-slate-600' : 'font-medium text-slate-300'}`}>
                    {store?.description || t('description_placeholder')}
                  </p>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-b-[2rem] bg-slate-50/30 px-5 py-6 md:rounded-b-[3rem] md:px-10 md:py-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <button
  type="button"
  onClick={() => setIsEditingAudio((prev) => !prev)}
  className="group flex w-full items-center gap-4 rounded-3xl border border-slate-100 bg-white p-4 text-left shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50/60 active:scale-[0.99] cursor-pointer"
>
  <div className="shrink-0 rounded-2xl bg-indigo-50 p-3 text-indigo-600 transition-all group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white">
    <Music4 size={20} />
  </div>

  <div className="min-w-0 flex-1">
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
      {t('store_music_title')}
    </p>

    <p className="mt-1 max-w-full truncate text-sm font-black text-slate-800">
      {audioFileName || t('store_music_empty')}
    </p>

    <div className="mt-2 flex max-w-full flex-wrap gap-2 overflow-hidden">
      <span
        className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${
          audioEnabled && audioUrl
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-slate-100 text-slate-500'
        }`}
      >
        {audioEnabled && audioUrl ? t('store_music_status_on') : t('store_music_status_off')}
      </span>

      {audioUrl ? (
        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-violet-600">
          {formatSeconds(audioStartAt)} - {formatSeconds(audioEndAt)}
        </span>
      ) : null}
    </div>
  </div>

  <div className="hidden shrink-0 rounded-full bg-slate-100 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500 transition-all group-hover:bg-indigo-600 group-hover:text-white sm:block">
    {t('edit')}
  </div>

  <ChevronDown
    size={16}
    className={`shrink-0 text-slate-400 transition-transform group-hover:text-indigo-600 ${
      isEditingAudio ? 'rotate-180' : ''
    }`}
  />
</button>
            </div>

            {isEditingAudio ? (
              <div className="space-y-4 rounded-3xl border border-indigo-100 bg-white p-4">
                <input
                  ref={audioFileInputRef}
                  type="file"
                  accept={AUDIO_ACCEPT}
                  onChange={handleAudioFilePick}
                  className="hidden"
                />

                <audio
                  ref={previewAudioRef}
                  src={audioUrl || undefined}
                  preload="metadata"
                  onLoadedMetadata={handlePreviewLoadedMetadata}
                  className="hidden"
                />

                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => audioFileInputRef.current?.click()}
                    className="rounded-xl bg-blue-700 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-indigo-600"
                  >
                    {audioUrl ? t('store_music_choose_file') : t('store_music_choose_file')}
                  </button>

                  <a
                    href={CLOUDINARY_CONFIG.helpLinks.musicDownloadWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700 hover:border-indigo-300"
                  >
                    <LinkIcon size={12} />
                    {t('store_music_external_link')}
                    <ExternalLink size={11} />
                  </a>
                </div>

                {audioTooLarge ? (
                  <a
                    href={CLOUDINARY_CONFIG.helpLinks.compressAudio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-600"
                  >
                    {t('store_music_compress_link')}
                    <ExternalLink size={11} />
                  </a>
                ) : null}

                {audioUrl ? (
                  <>
                    <button
                      type="button"
                      onClick={togglePreviewPlayback}
                      aria-pressed={isPreviewPlaying}
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all ${
                        isPreviewPlaying
                          ? 'bg-emerald-600 shadow-lg shadow-emerald-100 ring-2 ring-emerald-200'
                          : 'bg-slate-900 hover:bg-slate-800'
                      }`}
                    >
                      {isPreviewPlaying ? (
                        <>
                          <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                          <PauseCircle size={14} />
                          {t('store_music_now_playing')}
                        </>
                      ) : (
                        <>
                          <Play size={14} />
                          {t('store_music_play_preview')}
                        </>
                      )}
                    </button>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <label className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                          <Scissors size={12} />
                          {t('store_music_clip_range')}
                        </label>

                        <span className="rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-black text-white">
                          {formatSeconds(audioStartAt)} - {formatSeconds(audioEndAt)}
                        </span>
                      </div>

                      <input
                        type="range"
                        min={0}
                        max={rangeMax}
                        step={0.1}
                        value={clamp(audioStartAt, 0, rangeMax)}
                        onChange={(e) => handleChangeStartAt(Number(e.target.value))}
                        onInput={(e) => handleChangeStartAt(Number((e.target as HTMLInputElement).value))}
                        className="w-full cursor-pointer accent-indigo-600"
                      />

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500">
                          {t('store_music_total')}: {formatSeconds(displayedAudioDuration)}
                        </span>

                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-indigo-600">
                          {t('store_music_clip_length')}: {formatSeconds(clipLength)}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                          <Volume2 size={13} />
                          {t('store_music_volume')}
                        </label>

                        <span className="text-[10px] font-black text-indigo-600">{Math.round(audioVolume * 100)}%</span>
                      </div>

                      <input
                        type="range"
                        min={MIN_AUDIO_VOLUME}
                        max={MAX_AUDIO_VOLUME}
                        step={0.01}
                        value={audioVolume}
                        onChange={(e) => {
                          const next = clamp(Number(e.target.value), MIN_AUDIO_VOLUME, MAX_AUDIO_VOLUME);

                          setAudioVolume(next);

                          if (previewAudioRef.current) previewAudioRef.current.volume = next;
                        }}
                        className="mt-3 w-full cursor-pointer accent-indigo-600"
                      />
                    </div>

                    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <span>
                        <span className="block text-[11px] font-black uppercase tracking-widest text-slate-600">
                          {t('store_music_enabled')}
                        </span>

                        <span className="block text-[10px] font-medium text-slate-400">
                          {t('store_music_disable_hint')}
                        </span>
                      </span>

                      <input
                        type="checkbox"
                        checked={audioEnabled}
                        onChange={(e) => setAudioEnabled(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleRemoveSavedAudio}
                      disabled={updateSettings.isPending}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-100 disabled:opacity-60"
                    >
                      <Trash2 size={12} />
                      {t('store_music_clear')}
                    </button>
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
                    <Music4 className="mx-auto text-slate-300" size={28} />

                    <p className="mt-3 text-sm font-black text-slate-500">{t('store_music_empty')}</p>

                    <p className="mx-auto mt-1 max-w-sm text-[11px] font-medium text-slate-400">
                      {t('store_music_empty_help')}
                    </p>
                  </div>
                )}

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingAudio(false);
                      restoreAudioFromStore();
                    }}
                    className="rounded-xl bg-slate-100 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500"
                  >
                    {t('cancel')}
                  </button>

                  {pendingDeleteRef.current ? (
                    <button
                    type="button"
                    onClick={deletePendingUploadedAudio}
                    disabled={Boolean(isDeletingPendingAudio)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-amber-700 disabled:opacity-60"
                    >
                      {isDeletingPendingAudio ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      {t('store_music_delete_pending')}
                    </button>
                  ) : null}

<button
  type="button"
  onClick={selectedAudioFile ? handleUploadAudio : handleSaveAudioSettingsOnly}
  disabled={Boolean(
    isUploadingAudio ||
    updateSettings.isPending ||
    (!selectedAudioFile && !hasAudioSettingsChanges) ||
    (selectedAudioFile && !hasAudioReady)
  )}
                    className="rounded-xl bg-indigo-600 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-50"
                  >
                    {isUploadingAudio || updateSettings.isPending ? (
                      <Loader2 size={12} className="mx-auto animate-spin" />
                    ) : selectedAudioFile ? (
                      t('store_music_save_clip')
                    ) : (
                      t('save')
                    )}
                  </button>
                </div>
              </div>
            ) : null}

          </div>
        </div>
      </div>
    </div>
  );
}