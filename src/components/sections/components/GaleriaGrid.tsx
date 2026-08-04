import React, { useState, useEffect, useId, useRef, useMemo, useCallback } from 'react';
import type { ChangeEvent, JSX } from 'react'; 
import { toast } from 'react-hot-toast';
import { useMutation, useQueries } from '@tanstack/react-query'; 
import { 
  getTheme, handleMultipleUploads, 
  saveAllToCloudinary, deleteFromCloudinary 
} from '../helpers';
import { useTranslate } from '../../../context/LanguageContext';
import { MediaModal } from '../../modal';
import type { SectionProps, MediaItem } from '../../../types/library';
import { 
  StorageDashboard, 
  GalleryHeader, 
  EmptyState, 
  GlobalEditToolbar 
} from '../../galeria/galeria';
import { GridItem } from '../../galeria/GridItem';
import { GallerySkeleton } from '../../galeria/GallerySkeleton';

const MAX_ITEMS: number = 10;
const PHOTO_LIMIT: number = 1 * 1024 * 1024;
const VIDEO_LIMIT: number = 10 * 1024 * 1024;
const TOTAL_SECTION_LIMIT: number = 15 * 1024 * 1024;

interface StorageStats {
  totalWeightMB: number;
  isOverTotalLimit: boolean;
  hasIndividualErrors: boolean;
  hasPendingUploads: boolean;
  isAtLimit: boolean;
}

export const GaleriaGrid: React.FC<SectionProps & { isLoading?: boolean }> = ({ 
  content, 
  style, 
  onUpdate, 
  isLoading = false 
}): JSX.Element | null => {
  const { t } = useTranslate();
  const isEditable: boolean = !!onUpdate;
  const uniqueId: string = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [activeEditIndex, setActiveEditIndex] = useState<number | null>(null);

  const draggedIdxRef = useRef<number | null>(null);

  const itemsRef = useRef<MediaItem[]>([]);
  const onUpdateRef = useRef(onUpdate);
  const activeEditIndexRef = useRef(activeEditIndex);

  onUpdateRef.current = onUpdate;
  activeEditIndexRef.current = activeEditIndex;

  const items = useMemo<MediaItem[]>(() => {
    const rawImages = (content.images as MediaItem[]) || [];
    const sliced = rawImages.filter((i) => i?.url).slice(0, MAX_ITEMS);
    itemsRef.current = sliced; 
    return sliced;
  }, [content.images]);

  const stats = useMemo<StorageStats>(() => {
    let bytes = 0;
    let individualErrors = false;
    let hasPendingUploads = false;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const size = item.size || 0;
      bytes += size;
      if (item.isTemp) hasPendingUploads = true;
      if (size > (item.type === 'video' ? VIDEO_LIMIT : PHOTO_LIMIT)) individualErrors = true;
    }

    return {
      totalWeightMB: bytes / (1024 * 1024),
      isOverTotalLimit: bytes > TOTAL_SECTION_LIMIT,
      hasIndividualErrors: individualErrors,
      hasPendingUploads,
      isAtLimit: items.length >= MAX_ITEMS
    };
  }, [items]);

  const syncMutation = useMutation({
    mutationFn: async () => await saveAllToCloudinary(itemsRef.current),
    onMutate: () => toast.loading(t('gallery_toast_uploading') || "Subindo para a nuvem...", { id: 'syncToast' }),
    onSuccess: (uploadedItems) => {
      onUpdateRef.current?.('images', uploadedItems);
      toast.success(t('gallery_toast_success') || "Tudo salvo na nuvem!", { id: 'syncToast' });
    },
    onError: (error) => {
      console.error(error);
      toast.error(t('gallery_toast_error') || "Erro na rede. Tente novamente.", { id: 'syncToast' });
    }
  });

  const removeMutation = useMutation({
    mutationFn: async (itemToRemove: MediaItem) => {
      if (itemToRemove.delete_token) await deleteFromCloudinary(itemToRemove);
      if (itemToRemove.url && itemToRemove.url.startsWith('blob:')) URL.revokeObjectURL(itemToRemove.url);
      return itemToRemove;
    },
    onSuccess: () => toast.success(t('gallery_toast_removed') || "Item removido localmente."),
    onError: (error) => console.error(t('gallery_console_remove_error') || "Erro ao remover:", error)
  });

  const handleSyncToCloud = useCallback(() => {
    if (stats.isOverTotalLimit || stats.hasIndividualErrors) {
      toast.error(t('gallery_toast_fix_limits') || "Corrija os limites de peso antes de sincronizar.");
      return;
    }
    syncMutation.mutate(); 
  }, [stats, syncMutation, t]);

  const handleRemove = useCallback((index: number) => {
    const currentItems = itemsRef.current;
    const itemToRemove = currentItems[index];
    if (!itemToRemove) return;
  
    setActiveEditIndex(prev => {
      if (prev === index) return null;
      if (prev !== null && index < prev) return prev - 1;
      return prev;
    });

    const newItems = currentItems.filter((_, idx) => idx !== index);
    onUpdateRef.current?.('images', newItems); 
    removeMutation.mutate(itemToRemove);
  }, [removeMutation]);

  const moveItem = useCallback((from: number, to: number): void => {
    const currentItems = itemsRef.current;
    if (to < 0 || to >= currentItems.length || from === to) return;
    
    const newItems = [...currentItems];
    const [movedItem] = newItems.splice(from, 1);
    newItems.splice(to, 0, movedItem);
    
    onUpdateRef.current?.('images', newItems); 
    
    setActiveEditIndex(prev => {
      if (prev === from) return to;
      if (prev === to) return from;
      return prev;
    });
  }, []);

  const handleDragStart = useCallback((index: number) => {
    draggedIdxRef.current = index;
  }, []);

  const handleDrop = useCallback((index: number) => {
    const from = draggedIdxRef.current;
    if (from !== null && from !== index) {
      moveItem(from, index);
    }
    draggedIdxRef.current = null;
  }, [moveItem]);

  const handleUpload = useCallback((e: ChangeEvent<HTMLInputElement>, index: number | null = null): void => {
    if (e.target.files) {
      handleMultipleUploads(e.target.files, itemsRef.current, index, (imgs: MediaItem[]) => {
        onUpdateRef.current?.('images', imgs.slice(0, MAX_ITEMS)); 
      });
    }
  }, []);

  const missingSizes = useMemo(() => items.filter((img) => {
    if (!img.url || img.size || img.url.startsWith('blob:') || img.url.startsWith('data:')) return false;
    const urlLower = img.url.toLowerCase();
    if (urlLower.includes('supabase.co') || urlLower.includes('cloudinary.com')) return false;
    return true;
  }), [items]);

  const sizeQueries = useQueries({
    queries: missingSizes.map((img) => ({
      queryKey: ['media-size', img.url],
      queryFn: async () => {
        const response = await fetch(img.url, { method: 'HEAD' });
        const size = response.headers.get('content-length');
        return { url: img.url, size: size ? parseInt(size, 10) : 0 };
      },
      staleTime: Infinity, 
      gcTime: Infinity,
      enabled: isEditable && missingSizes.length > 0
    }))
  });

  useEffect(() => {
    if (!isEditable) return;
    
    const resolvedQueries = sizeQueries.filter(q => q.isSuccess && q.data && q.data.size > 0);
    if (resolvedQueries.length === 0) return;

    let hasChanges = false;
    const currentItems = itemsRef.current;
    
    const newItems = currentItems.map((item) => {
      const match = resolvedQueries.find(q => q.data!.url === item.url);
      if (match && !item.size) {
        hasChanges = true;
        return { ...item, size: match.data!.size };
      }
      return item;
    });

    if (hasChanges) {
      onUpdateRef.current?.('images', newItems); 
    }
  }, [sizeQueries, isEditable]);

  // CORREÇÃO DOS PULOS: rootMargin de 800px impede que o React faça re-render enquanto passas os olhos pela secção
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { 
        if (!entries[0].isIntersecting && activeEditIndexRef.current !== null) {
          requestAnimationFrame(() => {
            setActiveEditIndex(null); 
          });
        }
      },
      { threshold: 0, rootMargin: '800px 0px' } 
    );
    if (containerRef.current) observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, []);

  const handleUploadTrigger = useCallback(() => document.getElementById(`up-${uniqueId}`)?.click(), [uniqueId]);

  const containerLayoutClass = useMemo(() => {
    if (style.cols === '1') return 'grid grid-cols-4 md:grid-cols-8 gap-2 w-full';
    if (style.cols === '2') return 'grid grid-cols-3 md:grid-cols-4 gap-2 w-full';
    return 'columns-2 sm:columns-3 lg:columns-4 xl:columns-4 gap-3 w-full block';
  }, [style.cols]);

  if (!isEditable && items.length === 0 && !isLoading) return null;

  return (
    <section className={`py-6 md:py-10 px-1 md:px-2 transition-colors duration-300 ${getTheme(style.theme)}`}>
      <div className="max-w-xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto px-2 relative" ref={containerRef}>
        
        <input 
          id={`up-${uniqueId}`} 
          type="file" 
          className="hidden" 
          accept="image/*,video/*" 
          multiple 
          onChange={handleUpload} 
        />

        {isEditable && (
          <StorageDashboard 
            stats={stats}
            isSyncing={syncMutation.isPending}
            onSync={handleSyncToCloud}
            onUploadTrigger={handleUploadTrigger}
            t={t as (key: string) => string}          
          />
        )}

        <GalleryHeader 
          content={content}
          style={style}
          isEditable={isEditable}
          onUpdate={onUpdate}
          t={t as (key: string) => string}          
        />

        {isEditable && (
          <GlobalEditToolbar
            items={items}
            selectedIndex={activeEditIndex}
            onClose={() => setActiveEditIndex(null)}
            onRemove={handleRemove}
            onUpload={handleUpload}
            onMove={moveItem}
            t={t as (key: string) => string}
          />
        )}

        {isLoading ? (
          <GallerySkeleton cols={style.cols || '4'} count={6} />
        ) : items.length === 0 ? (
          <EmptyState 
            isEditable={isEditable} 
            onUploadTrigger={handleUploadTrigger}
            t={t as (key: string) => string}          
          />
        ) : (
          <div className={containerLayoutClass}>
            {items.map((item, i) => {
              const stableKey = item.id || `${item.url}-${item.isTemp ? 'temp' : 'cloud'}`;
              
              return (
                <GridItem 
                  key={stableKey}
                  item={item}
                  index={i}
                  totalItems={items.length}
                  isEditable={isEditable}
                  cols={style.cols || '4'}
                  onPreview={setPreviewMedia}
                  onDragStart={handleDragStart}
                  onDrop={handleDrop}
                  t={t as (key: string) => string}              
                  activeEditIndex={activeEditIndex}
                  setActiveEditIndex={setActiveEditIndex}
                />
              );
            })}
          </div>
        )}
      </div>

      {!isEditable && (
        <MediaModal 
          media={previewMedia} 
          onClose={() => setPreviewMedia(null)} 
          t={t as (key: string) => string}        
        />
      )}
    </section>
  );
};