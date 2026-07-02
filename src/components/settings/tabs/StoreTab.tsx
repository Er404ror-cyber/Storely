import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext as useReactRouterOutletContext } from 'react-router-dom';
import { useTranslate } from '../../../context/LanguageContext';
import { supabase } from '../../../lib/supabase';
import { notify } from '../../../utils/toast';
import { SectionInfo } from '../AdminSettingsComponents';
import { CLOUDINARY_CONFIG, AUDIO_ACCEPT } from '../../../types/storeTab';

import { LogoSection } from './storetab/LogoSection';
import { DescriptionSection } from './storetab/DescriptionSection';
import { AudioSection } from './storetab/AudioSection';
import { MainContactSection } from './storetab/MainContactSection';
import { useStoreAudio } from '../../../hooks/useStoreAudio';
import type { AdminStore } from '../../../types/admin';

interface StoreTabProps {
  store?: AdminStore | null;
}

interface AdminOutletContext {
  store: any;
  pages: any[];
  pagesLoading: boolean;
}

export function StoreTab({ store: propStore }: StoreTabProps) {
  const { t, language } = useTranslate();
  const queryClient = useQueryClient();
  
  const contextData = useReactRouterOutletContext<AdminOutletContext>();
  const store = contextData?.store || propStore;

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [imageTooLarge, setImageTooLarge] = useState(false);
  const [descValue, setDescValue] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isEditingAudio, setIsEditingAudio] = useState(false);

  useEffect(() => {
    if (store?.description !== undefined) {
      setDescValue(store?.description || '');
    }
  }, [store?.description, store]);

  const audio = useStoreAudio({ store, t });

  const updateField = useMutation({
    mutationFn: async ({ field, value }: { field: string; value: any }) => {
      const { error } = await supabase.from('stores').update({ [field]: value }).eq('id', store?.id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      const updatedValue = variables.value;
      const fieldName = variables.field;

      // 💡 1. Atualiza diretamente a cache do AdminLayout (sem disparar novo fetch)
      queryClient.setQueryData(['admin-store'], (oldData: any) => {
        if (!oldData) return oldData;
        return { ...oldData, [fieldName]: updatedValue };
      });

      // 💡 2. Atualiza diretamente a cache do AdminSettings
      queryClient.setQueryData(['admin-full-settings'], (oldData: any) => {
        if (!oldData) return oldData;
        return { ...oldData, [fieldName]: updatedValue };
      });

      // 💡 3. Sincroniza o LocalStorage local usado no AdminLayout para evitar inconsistência visual
      const cached = localStorage.getItem('storelyy_admin_store_cache');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.data) {
            parsed.data = { ...parsed.data, [fieldName]: updatedValue };
            parsed.savedAt = Date.now();
            localStorage.setItem('storelyy_admin_store_cache', JSON.stringify(parsed));
          }
        } catch (e) {
          console.error('Erro ao sincronizar LocalStorage:', e);
        }
      }

      notify.success(t('save_success') || 'Guardado com sucesso!');
      if (variables.field === 'description') setIsEditingDesc(false);
    },
    onError: () => notify.error(t('save_error') || 'Erro ao guardar no Supabase'),
  });

  // GESTÃO DE DELETETOKEN DO LOGO EM CACHE LOCAL (10 MINUTOS)
  const setPendingLogoDeleteToken = (token: string) => {
    const item = { token, expiresAt: Date.now() + 10 * 60 * 1000 };
    localStorage.setItem(`pending_delete_logo_${store?.id}`, JSON.stringify(item));
  };

  const deletePendingLogo = async () => {
    const cached = localStorage.getItem(`pending_delete_logo_${store?.id}`);
    if (!cached) return;
    try {
      const item = JSON.parse(cached);
      if (Date.now() < item.expiresAt) {
        const body = new URLSearchParams();
        body.append('token', item.token);
        await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/delete_by_token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
        });
      }
      localStorage.removeItem(`pending_delete_logo_${store?.id}`);
    } catch (e) {
      console.error('Erro ao remover logo pendente:', e);
    }
  };

  const handleLogoUploadAction = async (file: File) => {
    try {
      setIsUploadingLogo(true);
      await deletePendingLogo(); 

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_CONFIG.imageUploadPreset);
      formData.append('folder', CLOUDINARY_CONFIG.folders.logos);
      formData.append('filename_override', file.name.replace(/\.[^.]+$/, ''));

      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data?.secure_url) throw new Error('Cloudinary upload failed');

      if (data.delete_token) {
        setPendingLogoDeleteToken(data.delete_token);
      }

      const optimizedUrl = data.secure_url.replace('/upload/', '/upload/f_auto,q_auto:good,w_800,c_limit/');
      updateField.mutate({ field: 'logo_url', value: `${optimizedUrl}?t=${Date.now()}` });
    } catch (error) {
      console.error(error);
      notify.error(t('upload_error') || 'Erro no upload');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  if (!store) return <div className="p-10 text-center text-sm font-medium text-slate-400">A carregar dados do painel...</div>;

  return (
    <div className="animate-in slide-in-from-left-4 space-y-6 pb-10 duration-500 max-w-5xl mx-auto w-full px-2 sm:px-4">
      <SectionInfo title={t('store_required_title')} subtitle={t('store_required_subtitle')} />

      <div className="space-y-4 w-full">
        <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-md md:rounded-[2.5rem] md:p-6 w-full">
          <LogoSection
            logoUrl={store?.logo_url}
            isUploading={isUploadingLogo}
            imageTooLarge={imageTooLarge}
            setImageTooLarge={setImageTooLarge}
            onUpload={handleLogoUploadAction}
            t={t as any}
          />
        </div>

        <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-md md:rounded-[2.5rem] md:p-6 w-full">
          <MainContactSection
            store={store}
            t={t}
            language={language}
            updateFieldMutation={updateField}
          />
        </div>
      </div>

      <SectionInfo title={t('store_customization_title')} subtitle={t('store_customization_subtitle')} />

      <div className="divide-y divide-slate-50 rounded-[2rem] border border-slate-100 bg-white shadow-xl md:rounded-[2.5rem] overflow-hidden w-full">
        <DescriptionSection
          descValue={descValue}
          setDescValue={setDescValue}
          isEditingDesc={isEditingDesc}
          setIsEditingDesc={setIsEditingDesc}
          isPending={updateField.isPending && updateField.variables?.field === 'description'}
          onSave={() => updateField.mutate({ field: 'description', value: descValue })}
          onCancel={() => { setIsEditingDesc(false); setDescValue(store?.description || ''); }}
          t={t as any}
        />

        <audio
          ref={audio.previewAudioRef}
          src={audio.audioUrl || undefined}
          preload="metadata"
          onLoadedMetadata={audio.handlePreviewLoadedMetadata}
          className="hidden"
        />

        <AudioSection
          isEditing={isEditingAudio}
          setIsEditing={setIsEditingAudio}
          audioFileInputRef={audio.audioFileInputRef}
          audioUrl={audio.audioUrl}
          audioFileName={audio.audioFileName}
          audioEnabled={audio.audioEnabled}
          audioStartAt={audio.audioStartAt}
          audioEndAt={audio.audioEndAt}
          audioDuration={audio.audioDuration}
          isPreviewPlaying={audio.isPreviewPlaying}
          isUploadingAudio={audio.isUploadingAudio}
          isPendingDelete={!!audio.getPendingDeleteToken()}
          hasAudioSettingsChanges={audio.hasAudioSettingsChanges}
          hasAudioReady={audio.hasAudioReady}
          selectedAudioFile={audio.selectedAudioFile}
          audioTooLarge={audio.audioTooLarge}
          rangeMax={audio.rangeMax}
          clipLength={audio.clipLength}
          displayedAudioDuration={audio.displayedAudioDuration}
          onAudioFilePick={audio.handleAudioFilePick}
          togglePreviewPlayback={audio.togglePreviewPlayback}
          onChangeStartAt={audio.handleChangeStartAt}
          onRemoveSavedAudio={audio.handleRemoveSavedAudio}
          onCancel={() => {
            setIsEditingAudio(false);
            audio.restoreAudioFromStore();
          }}
          onDeletePending={audio.deletePendingUploadedAudio}
          onSave={audio.onSaveAudio}
          t={t}
          AUDIO_ACCEPT={AUDIO_ACCEPT}
          helpLinks={{
            compressAudio: CLOUDINARY_CONFIG.helpLinks.compressAudio,
            musicDownloadWebsite: CLOUDINARY_CONFIG.helpLinks.musicDownloadWebsite,
          }}
          onTogglePublicStatus={audio.handleTogglePublicStatus}
          audioVolume={0.05}
          setAudioVolume={() => {}}
          MIN_AUDIO_VOLUME={0.05}
          MAX_AUDIO_VOLUME={0.05}
        />
      </div>
    </div>
  );
}