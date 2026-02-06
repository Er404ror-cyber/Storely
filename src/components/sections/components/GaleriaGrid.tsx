import React, { useState, useEffect, useId, useRef, useMemo, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { toast } from 'react-hot-toast';
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
  GridItem 
} from '../../galeria/galeria';

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

export const GaleriaGrid: React.FC<SectionProps> = ({ content, style, onUpdate }) => {
  const { t } = useTranslate();
  const isEditable: boolean = !!onUpdate;
  const uniqueId: string = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Memoiza itens com fallback seguro
  const items = useMemo<MediaItem[]>(() => {
    const rawImages = (content.images as MediaItem[]) || [];
    return rawImages.filter((i) => i?.url).slice(0, MAX_ITEMS);
  }, [content.images]);

  // Cálculos de peso
  const stats = useMemo<StorageStats>(() => {
    const bytes = items.reduce((acc, curr) => acc + (curr.size || 0), 0);
    const individualErrors = items.some(item => {
      const limit = item.type === 'video' ? VIDEO_LIMIT : PHOTO_LIMIT;
      return (item.size || 0) > limit;
    });

    return {
      totalWeightMB: bytes / (1024 * 1024),
      isOverTotalLimit: bytes > TOTAL_SECTION_LIMIT,
      hasIndividualErrors: individualErrors,
      hasPendingUploads: items.some(i => i.isTemp),
      isAtLimit: items.length >= MAX_ITEMS
    };
  }, [items]);

  const handleSyncToCloud = async (): Promise<void> => {
    if (stats.isOverTotalLimit || stats.hasIndividualErrors) {
      toast.error("Corrija os limites de peso antes de sincronizar.");
      return;
    }

    setIsSyncing(true);
    const syncToast = toast.loading("Subindo para o Cloudinary...");
    
    try {
      const uploadedItems = await saveAllToCloudinary(items);
      onUpdate?.('images', uploadedItems);
      toast.success("Tudo salvo na nuvem!", { id: syncToast });
    } catch (error) {
      console.error(error);
      toast.error("Erro na rede. Tente novamente.", { id: syncToast });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRemove = async (index: number): Promise<void> => {
    const itemToRemove = items[index];
    if (!itemToRemove) return;
  
    const newItems = items.filter((_, idx) => idx !== index);
    onUpdate?.('images', newItems);
  
    try {
      // Agora o TS reconhece delete_token por causa da interface atualizada
      if (itemToRemove.delete_token) {
        await deleteFromCloudinary(itemToRemove);
      }
  
      // Verificamos itemToRemove.url para evitar o erro "possibly undefined"
      if (itemToRemove.url && itemToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(itemToRemove.url);
      }
      toast.success("Item removido localmente.");
    } catch (error) {
      console.error("Erro ao remover:", error);
    }
  };
  useEffect(() => {
    if (!isEditable) return;
    
    const fetchMissingSizes = async (): Promise<void> => {
      // 1. Filtramos garantindo que a URL existe (Type Guard)
      const missing = items.filter((img): img is MediaItem & { url: string } => 
        !!img.url && !img.size && !img.url.startsWith('blob:') && !img.url.startsWith('data:')
      );
  
      if (missing.length === 0) return;
      
      // 2. DECLARAÇÃO: Criamos a cópia aqui para poder alterar
      const updatedImages = [...items]; 
      let hasChanged = false;
  
      await Promise.all(missing.map(async (img) => {
        try {
          const response = await fetch(img.url, { method: 'HEAD' });
          const size = response.headers.get('content-length');
          
          if (size) {
            const idx = updatedImages.findIndex(ui => ui.url === img.url);
            if (idx !== -1) {
              // Atualizamos a referência no array temporário
              updatedImages[idx] = { 
                ...updatedImages[idx], 
                size: parseInt(size, 10) 
              };
              hasChanged = true;
            }
          }
        } catch (e) {
          console.warn("Não foi possível obter o tamanho da mídia remota.", e);
        }
      }));
  
      // 3. Só dispara o update se realmente algo mudou
      if (hasChanged) {
        onUpdate?.('images', updatedImages);
      }
    };
  
    fetchMissingSizes();
  }, [isEditable, items, onUpdate]);

  const moveItem = useCallback((from: number, to: number): void => {
    if (to < 0 || to >= items.length || from === to) return;
    const newItems = [...items];
    const [movedItem] = newItems.splice(from, 1);
    newItems.splice(to, 0, movedItem);
    onUpdate?.('images', newItems);
  }, [items, onUpdate]);

  const handleUpload = (e: ChangeEvent<HTMLInputElement>, index: number | null = null): void => {
    if (e.target.files) {
      handleMultipleUploads(e.target.files, items, index, (imgs: MediaItem[]) => 
        onUpdate?.('images', imgs.slice(0, MAX_ITEMS))
      );
    }
  };

  return (
    <section className={`py-6 md:py-10 px-2 transition-colors duration-300 ${getTheme(style.theme)}`}>
      <div className="max-w-4xl mx-auto px-4" ref={containerRef}>
        
        <input 
          id={`up-${uniqueId}`} 
          type="file" 
          className="hidden" 
          accept="image/*,video/*" 
          multiple 
          onChange={(e) => handleUpload(e)} 
        />

        {isEditable && (
          <StorageDashboard 
            stats={stats}
            isSyncing={isSyncing}
            onSync={handleSyncToCloud}
            onUploadTrigger={() => document.getElementById(`up-${uniqueId}`)?.click()}
            t={t as (key: string) => string}          />
        )}

        <GalleryHeader 
          content={content}
          style={style}
          isEditable={isEditable}
          onUpdate={onUpdate}
          t={t}
        />

        {items.length === 0 ? (
          <EmptyState 
            isEditable={isEditable} 
            onUploadTrigger={() => document.getElementById(`up-${uniqueId}`)?.click()}
            t={t as (key: string) => string}          />
        ) : (
          <div className={style.cols === '4' ? 'columns-2 sm:columns-3 md:columns-4 gap-2' : 'grid grid-cols-4 md:grid-cols-6 gap-2'}>
            {items.map((item, i) => (
              <GridItem 
                key={item.id || item.url || i}
                item={item}
                index={i}
                totalItems={items.length}
                isEditable={isEditable}
                cols={style.cols || '4'}
                onPreview={setPreviewMedia}
                onRemove={handleRemove}
                onUpload={handleUpload}
                onMove={moveItem}
                onDragStart={setDraggedIdx}
                onDrop={() => { 
                  if (draggedIdx !== null) { 
                    moveItem(draggedIdx, i); 
                    setDraggedIdx(null); 
                  }
                }}
                t={t as (key: string) => string}              />
            ))}
          </div>
        )}
      </div>

      {!isEditable && (
        <MediaModal 
          media={previewMedia} 
          onClose={() => setPreviewMedia(null)} 
          t={t as (key: string) => string}        />
      )}
    </section>
  );
};