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

export const GaleriaGrid: React.FC<SectionProps> = ({ content, style, onUpdate }): JSX.Element | null => {
  const { t } = useTranslate();
  const isEditable: boolean = !!onUpdate;
  const uniqueId: string = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [activeEditIndex, setActiveEditIndex] = useState<number | null>(null);

  // 1. ITENS DIRETOS DA PROP (O estado global do teu construtor é a única fonte de verdade)
  const items = useMemo<MediaItem[]>(() => {
    const rawImages = (content.images as MediaItem[]) || [];
    return rawImages.filter((i) => i?.url).slice(0, MAX_ITEMS);
  }, [content.images]);

  // Estatísticas leves para a CPU
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

  // 2. REACT QUERY: Sync com Cloudinary e Remoção
  const syncMutation = useMutation({
    mutationFn: async (itemsToSync: MediaItem[]) => await saveAllToCloudinary(itemsToSync),
    onMutate: () => toast.loading(t('gallery_toast_uploading') || "Subindo para a nuvem...", { id: 'syncToast' }),
    onSuccess: (uploadedItems) => {
      onUpdate?.('images', uploadedItems); // Atualiza estado global do builder localmente
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

  // 3. AÇÕES LOCAIS (Rápidas, atualizam apenas a RAM do Builder via onUpdate)
  const handleSyncToCloud = useCallback(() => {
    if (stats.isOverTotalLimit || stats.hasIndividualErrors) {
      toast.error(t('gallery_toast_fix_limits') || "Corrija os limites de peso antes de sincronizar.");
      return;
    }
    syncMutation.mutate(items);
  }, [items, stats, syncMutation, t]);

  const handleRemove = useCallback((index: number) => {
    const itemToRemove = items[index];
    if (!itemToRemove) return;
  
    setActiveEditIndex(prev => {
      if (prev === index) return null;
      if (prev !== null && index < prev) return prev - 1;
      return prev;
    });

    const newItems = items.filter((_, idx) => idx !== index);
    onUpdate?.('images', newItems); // Local state update imediato
    removeMutation.mutate(itemToRemove);
  }, [items, onUpdate, removeMutation]);

  const moveItem = useCallback((from: number, to: number): void => {
    if (to < 0 || to >= items.length || from === to) return;
    const newItems = [...items];
    const [movedItem] = newItems.splice(from, 1);
    newItems.splice(to, 0, movedItem);
    
    onUpdate?.('images', newItems); // Local state update imediato
    
    setActiveEditIndex(prev => {
      if (prev === from) return to;
      if (prev === to) return from;
      return prev;
    });
  }, [items, onUpdate]);

  const handleUpload = useCallback((e: ChangeEvent<HTMLInputElement>, index: number | null = null): void => {
    if (e.target.files) {
      handleMultipleUploads(e.target.files, items, index, (imgs: MediaItem[]) => {
        onUpdate?.('images', imgs.slice(0, MAX_ITEMS)); // Local state update imediato
      });
    }
  }, [items, onUpdate]);

  // 4. REACT QUERY: Fetch do tamanho (em Cache, gasta pouquíssima rede/bateria)
  const missingSizes = useMemo(() => items.filter((img) => 
    img.url && !img.size && !img.url.startsWith('blob:') && !img.url.startsWith('data:')
  ), [items]);

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
      enabled: isEditable 
    }))
  });

  useEffect(() => {
    if (!isEditable) return;
    
    const resolvedQueries = sizeQueries.filter(q => q.isSuccess && q.data && q.data.size > 0);
    if (resolvedQueries.length === 0) return;

    let hasChanges = false;
    const newItems = items.map((item) => {
      const match = resolvedQueries.find(q => q.data!.url === item.url);
      if (match && !item.size) {
        hasChanges = true;
        return { ...item, size: match.data!.size };
      }
      return item;
    });

    if (hasChanges) {
      onUpdate?.('images', newItems); // Atualiza os tamanhos em RAM
    }
  }, [sizeQueries, items, isEditable, onUpdate]);

  // Observer da Toolbar: Fecha ao perder o foco (poupa muita CPU)
  useEffect(() => {
    if (activeEditIndex === null) return;
    const observer = new IntersectionObserver(
      (entries) => { if (!entries[0].isIntersecting) setActiveEditIndex(null); },
      { threshold: 0 } 
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [activeEditIndex]);

  const handleUploadTrigger = useCallback(() => document.getElementById(`up-${uniqueId}`)?.click(), [uniqueId]);

  if (!isEditable && items.length === 0) return null;

  const isPinterestLayout = style.cols !== '1' && style.cols !== '2';
  const containerLayoutClass = isPinterestLayout
    ? 'columns-2 sm:columns-3 md:columns-4 xl:columns-5 gap-3 w-full block'
    : 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 w-full';

  return (
    <section className={`py-6 md:py-10 px-2 transition-colors duration-300 ${getTheme(style.theme)} ${activeEditIndex !== null ? 'pb-32 sm:pb-24' : ''}`}>
      <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto px-4 relative" ref={containerRef}>
        
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

        {items.length === 0 ? (
          <EmptyState 
            isEditable={isEditable} 
            onUploadTrigger={handleUploadTrigger}
            t={t as (key: string) => string}          
          />
        ) : (
          <div className={containerLayoutClass}>
            {items.map((item, i) => (
              <GridItem 
                key={item.id || item.url || i}
                item={item}
                index={i}
                totalItems={items.length}
                isEditable={isEditable}
                cols={style.cols || '4'}
                onPreview={setPreviewMedia}
                onDragStart={setDraggedIdx}
                onDrop={() => { 
                  if (draggedIdx !== null) { moveItem(draggedIdx, i); setDraggedIdx(null); }
                }}
                t={t as (key: string) => string}              
                activeEditIndex={activeEditIndex}
                setActiveEditIndex={setActiveEditIndex}
              />
            ))}
          </div>
        )}

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