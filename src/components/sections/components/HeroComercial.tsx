import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { supabase } from '../../../lib/supabase';
import { getTheme, saveAllToCloudinary } from '../helpers';
import { useTranslate } from '../../../context/LanguageContext';

// Tipagens e Constantes
import { type HeroProps, type StoreData, type HeroStyleProps, FILE_LIMITS }  from '../../HeroComercial/types';


import { LayoutYoutube, LayoutBackground, LayoutStorely } from '../../HeroComercial/Layouts';
import { HeroTextFields } from '../../HeroComercial/HeroTextFields';
import { WhatsAppButton } from '../../HeroComercial/WhatsAppButton';
import { AdminControls } from '../../HeroComercial/AdminControls';

const HeroComercialComponent: React.FC<HeroProps> = ({ content, style, onUpdate }) => {
  const isEditable = !!onUpdate;
  const typedStyle = style as HeroStyleProps;
  const isDark = typedStyle.theme === 'dark';
  const layout = typedStyle.cols ?? '1';
  const isCenter = typedStyle.align === 'center';

  const [isSyncing, setIsSyncing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { t } = useTranslate();
  const { storeSlug } = useParams();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // API Otimizada: staleTime Infinity, não faz requisições inúteis
  const { data: adminStoreData } = useQuery<StoreData | null>({
    queryKey: ['admin-store-whatsapp'],
    queryFn: async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) throw new Error('User not found');
      const { data, error } = await supabase.from('stores').select('id, name, logo_url, whatsapp_number').eq('owner_id', session.user.id).single();
      if (error) throw error;
      return data;
    },
    enabled: isEditable,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const { data: publicStoreData, isLoading: publicStoreLoading } = useQuery<StoreData | null>({
    queryKey: ['public-store-whatsapp', storeSlug],
    queryFn: async () => {
      if (!storeSlug) return null;
      const { data, error } = await supabase.from('stores').select('id, name, logo_url, whatsapp_number').eq('slug', storeSlug).single();
      if (error) throw error;
      return data;
    },
    enabled: !isEditable && !!storeSlug,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const activeStoreData = isEditable ? adminStoreData : publicStoreData;
  const isLoadingNumber = !isEditable && publicStoreLoading;
  const apiWhatsappNumber = useMemo(() => activeStoreData?.whatsapp_number?.trim() || '', [activeStoreData?.whatsapp_number]);

  const resolvedContent = useMemo(() => ({ ...content, phone: apiWhatsappNumber }), [content, apiWhatsappNumber]);

  const mediaType = resolvedContent.media?.type === 'video' ? 'video' : 'image';
  const currentLimit = FILE_LIMITS[mediaType];
  const mediaSizeMB = (resolvedContent.media?.size || 0) / (1024 * 1024);
  const isOverLimit = mediaSizeMB > currentLimit;
  const isTemp = !!resolvedContent.media?.isTemp;

  const handleSync = useCallback(async () => {
    if (!resolvedContent.media || !isTemp || isOverLimit) return;
    setIsSyncing(true);
    const toastId = toast.loading(t('uploading'));

    try {
      const uploaded = await saveAllToCloudinary([resolvedContent.media as any]);
      if (uploaded[0] && !uploaded[0].isTemp) {
        onUpdate?.('media', uploaded[0]);
        toast.success(t('mediaSaved'), { id: toastId });
      }
    } catch {
      toast.error(t('saveError'), { id: toastId });
    } finally {
      setIsSyncing(false);
    }
  }, [resolvedContent.media, isTemp, isOverLimit, onUpdate, t]);

  const LayoutComponent = layout === '2' ? LayoutBackground : layout === '4' ? LayoutStorely : LayoutYoutube;

  return (
    <section className={`relative min-h-[380px] flex items-center overflow-hidden ${getTheme(typedStyle.theme)}`}>
      <LayoutComponent isDark={isDark} isCenter={isCenter} isEditable={isEditable} content={resolvedContent}>
        <HeroTextFields content={resolvedContent} isEditable={isEditable} isDark={isDark} isDarkBg={layout === '2'} style={typedStyle} t={t} onUpdate={onUpdate} isCenter={isCenter} />
        <WhatsAppButton isEditable={isEditable} isLoadingNumber={isLoadingNumber} content={resolvedContent} t={t} onUpdate={onUpdate} isCenter={isCenter} />
        <AdminControls isEditable={isEditable} isMounted={isMounted} content={resolvedContent} isCenter={isCenter} isDark={isDark} t={t} onUpdate={onUpdate} handleSync={handleSync} isSyncing={isSyncing} mediaSizeMB={mediaSizeMB} currentLimit={currentLimit} isOverLimit={isOverLimit} isTemp={isTemp} mediaType={mediaType} />
      </LayoutComponent>
    </section>
  );
};

export const HeroComercial = memo(HeroComercialComponent, (prevProps, nextProps) => {
  return (
    prevProps.style.theme === nextProps.style.theme &&
    prevProps.style.align === nextProps.style.align &&
    prevProps.style.cols === nextProps.style.cols &&
    prevProps.style.fontSize === nextProps.style.fontSize &&
    prevProps.content.title === nextProps.content.title &&
    prevProps.content.sub === nextProps.content.sub &&
    prevProps.content.badge === nextProps.content.badge &&
    prevProps.content.btnText === nextProps.content.btnText &&
    prevProps.content.hero_subtitle === nextProps.content.hero_subtitle &&
    prevProps.content.phone === nextProps.content.phone &&
    prevProps.content.media?.url === nextProps.content.media?.url &&
    prevProps.content.media?.type === nextProps.content.media?.type &&
    prevProps.content.media?.size === nextProps.content.media?.size &&
    prevProps.content.media?.isTemp === nextProps.content.media?.isTemp &&
    prevProps.onUpdate === nextProps.onUpdate
  );
});

HeroComercial.displayName = 'HeroComercial';