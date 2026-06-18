import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { decreaseFileInternalVolume } from '../utils/audioProcessor';
import {
  CLOUDINARY_CONFIG,
  MAX_AUDIO_FILE_SIZE,
  MAX_AUDIO_CLIP_SECONDS,
  MIN_AUDIO_CLIP_SECONDS,
  FIXED_AUDIO_VOLUME,
} from '../types/storeTab';
import type { BackgroundAudioSettings } from '../types/storeTabAudio';
import { notify } from '../utils/toast';
import { supabase } from '../lib/supabase';

function isSupportedAudioFile(file?: File | null) {
  if (!file) return false;
  return file.type.startsWith('audio/') || /\.(mp3|m4a|aac|ogg|wav|webm|flac)$/i.test(file.name);
}

function getAudioSettings(settings: any): BackgroundAudioSettings {
  return settings?.background_audio || {};
}

function buildCloudinaryUrl(resourceType: 'image' | 'video') {
  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/${resourceType}/upload`;
}

async function uploadToCloudinary({ file, resourceType, uploadPreset, folder }: any) {
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
  return data;
}

async function deleteCloudinaryByToken(deleteToken: string) {
  const body = new URLSearchParams();
  body.append('token', deleteToken);

  // ENDPOINT OFICIAL DE DESTRUIÇÃO CLIENT-SIDE COM SUPORTE TOTAL A CORS
  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/delete_by_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString(),
  });


  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.warn('[Cloudinary] Token inválido ou já expirado no servidor:', errorData);
    // Retornamos true para deixar a aplicação continuar e limpar o state local, 
    // já que o arquivo ou não existe mais ou o token perdeu a validade.
    return { result: 'ok' };
  }

  return response.json();
}

export function useStoreAudio({ store, t }: { store: any; t: any }) {
  const queryClient = useQueryClient();
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement>(null);
  const previewRafRef = useRef<number | null>(null);

  const savedAudio = useMemo(() => getAudioSettings(store?.settings), [store?.settings]);

  const [audioEnabled, setAudioEnabled] = useState(() => !!savedAudio?.enabled);
  const [audioUrl, setAudioUrl] = useState(() => savedAudio?.url || '');
  const [audioFileName, setAudioFileName] = useState(() => savedAudio?.originalFilename || '');
  const [audioStartAt, setAudioStartAt] = useState(() => typeof savedAudio?.startAt === 'number' ? savedAudio.startAt : 0);
  const [audioEndAt, setAudioEndAt] = useState(() => typeof savedAudio?.endAt === 'number' ? savedAudio.endAt : MAX_AUDIO_CLIP_SECONDS);
  const [audioDuration, setAudioDuration] = useState(() => typeof savedAudio?.endAt === 'number' ? savedAudio.endAt : MAX_AUDIO_CLIP_SECONDS);

  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [audioTooLarge, setAudioTooLarge] = useState(false);
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);

  // Guardamos uma referência mutável do token atual para evitar race conditions ao trocar de arquivo rapidamente
  const activeDeleteTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (store?.settings) {
      const audio = getAudioSettings(store.settings);
      setAudioEnabled(!!audio?.enabled);
      setAudioUrl(audio?.url || '');
      setAudioFileName(audio?.originalFilename || '');
      setAudioStartAt(typeof audio?.startAt === 'number' ? audio.startAt : 0);
      setAudioEndAt(typeof audio?.endAt === 'number' ? audio.endAt : MAX_AUDIO_CLIP_SECONDS);
      setAudioDuration(typeof audio?.endAt === 'number' ? audio.endAt : MAX_AUDIO_CLIP_SECONDS);
      activeDeleteTokenRef.current = audio?.deleteToken || null;
    }
  }, [store?.settings]);

  const displayedAudioDuration = useMemo(() => Math.max(audioDuration || 0, audioEndAt, MAX_AUDIO_CLIP_SECONDS), [audioDuration, audioEndAt]);
  const rangeMax = useMemo(() => Math.max(0, displayedAudioDuration - MIN_AUDIO_CLIP_SECONDS), [displayedAudioDuration]);
  const clipLength = useMemo(() => Math.max(0, audioEndAt - audioStartAt), [audioStartAt, audioEndAt]);
  const hasAudioReady = useMemo(() => !!audioUrl && clipLength >= MIN_AUDIO_CLIP_SECONDS, [audioUrl, clipLength]);

  const hasAudioSettingsChanges = useMemo(() => {
    return (
      !!savedAudio?.enabled !== audioEnabled ||
      Number(savedAudio?.startAt || 0) !== Number(audioStartAt || 0) ||
      Number(savedAudio?.endAt || MAX_AUDIO_CLIP_SECONDS) !== Number(audioEndAt || MAX_AUDIO_CLIP_SECONDS) ||
      selectedAudioFile !== null
    );
  }, [savedAudio, audioEnabled, audioStartAt, audioEndAt, selectedAudioFile]);

  const getPendingDeleteToken = useCallback((): string | null => {
    const itemStr = localStorage.getItem(`pending_delete_audio_${store?.id}`);
    if (!itemStr) return null;
    try {
      const item = JSON.parse(itemStr);
      if (Date.now() > item.expiresAt) {
        localStorage.removeItem(`pending_delete_audio_${store?.id}`);
        return null;
      }
      return item.deleteToken;
    } catch {
      return null;
    }
  }, [store?.id]);

  const setPendingDeleteToken = useCallback((deleteToken: string) => {
    const item = { deleteToken, expiresAt: Date.now() + 10 * 60 * 1000 };
    localStorage.setItem(`pending_delete_audio_${store?.id}`, JSON.stringify(item));
  }, [store?.id]);

  const deletePendingUploadedAudio = useCallback(async () => {
    const token = getPendingDeleteToken();
    if (!token) return false;
    try {
      await deleteCloudinaryByToken(token);
      localStorage.removeItem(`pending_delete_audio_${store?.id}`);
      return true;
    } catch (error) {
      console.error('[Cloudinary] Falha ao limpar ficheiro temporário órfão:', error);
      return false;
    }
  }, [getPendingDeleteToken, store?.id]);

  useEffect(() => {
    const el = previewAudioRef.current;
    if (!el) return;
    el.volume = FIXED_AUDIO_VOLUME;
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

  const updateSettings = useMutation({
    mutationFn: async (nextSettings: any) => {
      const { error } = await supabase.from('stores').update({ settings: nextSettings }).eq('id', store?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-store'] });
      queryClient.invalidateQueries({ queryKey: ['admin-full-settings'] });
      queryClient.invalidateQueries({ queryKey: ['store-public'] });
      localStorage.removeItem(`pending_delete_audio_${store?.id}`);
      notify.success(t('save_success') || 'Definições salvas com sucesso');
      setSelectedAudioFile(null);
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
      el.muted = true;
      el.currentTime = 0;
      el.removeAttribute('src');
      el.load();
    }
    setIsPreviewPlaying(false);
  }, []);

  const prepareAudioElement = useCallback((url: string) => {
    const el = previewAudioRef.current;
    if (!el) return;
    el.pause();
    el.src = url;
    el.preload = 'metadata';
    el.volume = FIXED_AUDIO_VOLUME;
    el.load();
    setIsPreviewPlaying(false);
  }, []);

  const restoreAudioFromStore = useCallback(() => {
    const audio = getAudioSettings(store?.settings);
    resetPreviewAudio();
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }
    if (audioFileInputRef.current) audioFileInputRef.current.value = '';

    setSelectedAudioFile(null);
    setAudioTooLarge(false);
    setAudioEnabled(!!audio?.enabled);
    setAudioUrl(audio?.url || '');
    setAudioFileName(audio?.originalFilename || '');
    
    const savedStart = typeof audio?.startAt === 'number' ? audio.startAt : 0;
    const savedEnd = typeof audio?.endAt === 'number' ? audio.endAt : MAX_AUDIO_CLIP_SECONDS;
    setAudioStartAt(savedStart);
    setAudioEndAt(savedEnd);
    setAudioDuration(savedEnd);
  }, [store?.settings, localPreviewUrl, resetPreviewAudio]);

  const handleAudioFilePick = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    try {
      resetPreviewAudio();
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);

      setIsUploadingAudio(true);
      notify.success(t('store_music_processing') || "A processar e otimizar áudio...");

      const lowVolumeBlob = await decreaseFileInternalVolume(file, 0.05);
      const processedFile = new File([lowVolumeBlob], file.name.replace(/\.[^.]+$/, '.wav'), { type: 'audio/wav' });
      const objectUrl = URL.createObjectURL(processedFile);
      
      setLocalPreviewUrl(objectUrl);
      setAudioUrl(objectUrl);
      setAudioFileName(processedFile.name);
      setSelectedAudioFile(processedFile);
      setAudioEnabled(true);
      setAudioStartAt(0);

      window.setTimeout(() => prepareAudioElement(objectUrl), 0);
    } catch (err) {
      console.error("[Audio Processor] Falha na compressão nativa:", err);
      notify.error(t('store_music_process_error') || "Não foi possível processar o volume interno.");
    } finally {
      setIsUploadingAudio(false);
    }
  }, [localPreviewUrl, prepareAudioElement, resetPreviewAudio, t]);

  const handlePreviewLoadedMetadata = useCallback(() => {
    const el = previewAudioRef.current;
    if (!el) return;
    const duration = Number.isFinite(el.duration) && el.duration > 0 ? el.duration : MAX_AUDIO_CLIP_SECONDS;
    setAudioDuration(duration);
    
    if (!selectedAudioFile && savedAudio?.endAt) {
      setAudioEndAt(savedAudio.endAt);
    } else {
      setAudioStartAt(0);
      setAudioEndAt(duration);
    }
    el.volume = FIXED_AUDIO_VOLUME;
  }, [selectedAudioFile, savedAudio]);

  const togglePreviewPlayback = useCallback(async () => {
    const el = previewAudioRef.current;
    if (!el || !audioUrl) return;
    try {
      if (!el.src || el.src !== audioUrl) {
        el.muted = true;
        el.src = audioUrl;
        el.preload = 'metadata';
        el.load();
      }
      el.volume = FIXED_AUDIO_VOLUME;
      if (el.paused) {
        if (el.currentTime < audioStartAt || el.currentTime >= audioEndAt) el.currentTime = audioStartAt;
        el.muted = false;
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
  }, [audioUrl, audioStartAt, audioEndAt, t]);

  const handleChangeStartAt = useCallback((value: number) => {
    const safeDuration = Math.max(displayedAudioDuration, MIN_AUDIO_CLIP_SECONDS);
    const maxStart = Math.max(0, safeDuration - MIN_AUDIO_CLIP_SECONDS);
    const nextStart = Math.max(0, Math.min(value, maxStart));
    const nextEnd = Math.min(safeDuration, Math.max(nextStart + MIN_AUDIO_CLIP_SECONDS, audioEndAt));

    setAudioStartAt(nextStart);
    setAudioEndAt(nextEnd);

    const el = previewAudioRef.current;
    if (el && Number.isFinite(el.duration)) el.currentTime = nextStart;
  }, [displayedAudioDuration, audioEndAt]);

  const handleTogglePublicStatus = async (status: boolean) => {
    setAudioEnabled(status);
    const nextSettings = {
      ...(store?.settings || {}),
      background_audio: { ...savedAudio, enabled: status },
    };
    await updateSettings.mutateAsync(nextSettings);
  };

  const handleUploadAudio = useCallback(async () => {
    const file = selectedAudioFile;
    if (!file || !store?.id) return;
    try {
      stopPreview();
      setIsUploadingAudio(true);
      
      // Ao trocar de arquivo, limpamos o Cloudinary antigo imediatamente usando o token armazenado em ref
      if (activeDeleteTokenRef.current) {
        try {
          await deleteCloudinaryByToken(activeDeleteTokenRef.current);
          activeDeleteTokenRef.current = null;
        } catch (e) {
          console.error('[Cloudinary] Falha ao remover áudio substituído:', e);
        }
      }

      await deletePendingUploadedAudio();

      const data = await uploadToCloudinary({
        file,
        resourceType: 'video',
        uploadPreset: CLOUDINARY_CONFIG.audioUploadPreset,
        folder: CLOUDINARY_CONFIG.folders.audio,
      });

      const volumeOptimizedUrl = data.secure_url.replace(/\.[^.]+$/, '.mp3');
      const deleteToken = data.delete_token || null;

      if (deleteToken) {
        setPendingDeleteToken(deleteToken);
        activeDeleteTokenRef.current = deleteToken;
      }

      const nextSettings = {
        ...(store?.settings || {}),
        background_audio: {
          enabled: audioEnabled,
          type: 'audio',
          url: volumeOptimizedUrl,
          volume: FIXED_AUDIO_VOLUME,
          autoplay_on_scroll: true,
          startAt: audioStartAt,
          endAt: audioEndAt,
          deleteToken,
          originalFilename: file.name,
          uploadedAt: new Date().toISOString(),
        },
      };

      await updateSettings.mutateAsync(nextSettings);
      if (localPreviewUrl) { URL.revokeObjectURL(localPreviewUrl); setLocalPreviewUrl(null); }
      setAudioUrl(volumeOptimizedUrl);
      setAudioFileName(file.name);
      setSelectedAudioFile(null);

      window.setTimeout(() => prepareAudioElement(volumeOptimizedUrl), 50);
    } catch (error) {
      console.error('[Cloudinary] audio upload error:', error);
      notify.error(t('store_music_upload_error') || 'Erro ao enviar áudio');
    } finally {
      setIsUploadingAudio(false);
    }
  }, [selectedAudioFile, store?.id, store?.settings, audioEnabled, audioStartAt, audioEndAt, deletePendingUploadedAudio, setPendingDeleteToken, localPreviewUrl, t, updateSettings, stopPreview, prepareAudioElement]);

  const handleSaveAudioSettingsOnly = useCallback(() => {
    if (!store?.id || !savedAudio?.url) return;
    stopPreview();
    const nextSettings = {
      ...(store?.settings || {}),
      background_audio: {
        ...savedAudio,
        enabled: audioEnabled,
        type: 'audio',
        volume: FIXED_AUDIO_VOLUME,
        autoplay_on_scroll: true,
        startAt: audioStartAt,
        endAt: audioEndAt,
      },
    };
    updateSettings.mutate(nextSettings);
  }, [store?.id, store?.settings, savedAudio, audioEnabled, audioStartAt, audioEndAt, updateSettings, stopPreview]);

  const handleRemoveSavedAudio = useCallback(async () => {
    stopPreview();
    
    if (activeDeleteTokenRef.current) {
      try {
        await deleteCloudinaryByToken(activeDeleteTokenRef.current);
        activeDeleteTokenRef.current = null;
      } catch (e) {
        console.error('[Cloudinary] Falha ao deletar arquivo via token ativo:', e);
      }
    }

    const nextSettings = {
      ...(store?.settings || {}),
      background_audio: {
        enabled: false,
        type: 'audio',
        url: '',
        volume: FIXED_AUDIO_VOLUME,
        autoplay_on_scroll: true,
        startAt: 0,
        endAt: MAX_AUDIO_CLIP_SECONDS,
        deleteToken: null,
        originalFilename: null,
        uploadedAt: null,
      },
    };

    setAudioUrl('');
    setAudioEnabled(false);
    setAudioStartAt(0);
    setAudioEndAt(MAX_AUDIO_CLIP_SECONDS);
    setAudioDuration(MAX_AUDIO_CLIP_SECONDS);
    setAudioFileName('');
    setSelectedAudioFile(null);
    
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }
    
    localStorage.removeItem(`pending_delete_audio_${store?.id}`);
    updateSettings.mutate(nextSettings);
  }, [store?.settings, updateSettings, localPreviewUrl, store?.id, stopPreview]);

  return {
    audioFileInputRef,
    previewAudioRef,
    audioUrl,
    audioFileName,
    audioEnabled,
    audioStartAt,
    audioEndAt,
    audioDuration,
    isPreviewPlaying,
    isUploadingAudio,
    getPendingDeleteToken,
    hasAudioSettingsChanges,
    hasAudioReady,
    selectedAudioFile,
    audioTooLarge,
    rangeMax,
    clipLength,
    displayedAudioDuration,
    handleAudioFilePick,
    handlePreviewLoadedMetadata,
    togglePreviewPlayback,
    handleChangeStartAt,
    handleTogglePublicStatus,
    handleRemoveSavedAudio,
    restoreAudioFromStore,
    deletePendingUploadedAudio,
    onSaveAudio: selectedAudioFile ? handleUploadAudio : handleSaveAudioSettingsOnly,
  };
}