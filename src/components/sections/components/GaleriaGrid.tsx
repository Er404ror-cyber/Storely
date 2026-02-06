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

// IMPORTAÇÃO DOS SUBCOMPONENTES CRIADOS NO ARQUIVO 1
import { 
  StorageDashboard, 
  GalleryHeader, 
  EmptyState, 
  GridItem 
} from '../../galeria/galeria';

// Constantes de Limite (Usadas para lógica de cálculo no pai)
const MAX_ITEMS = 10;
const PHOTO_LIMIT = 1 * 1024 * 1024;
const VIDEO_LIMIT = 10 * 1024 * 1024;
const TOTAL_SECTION_LIMIT = 15 * 1024 * 1024;

export const GaleriaGrid: React.FC<SectionProps> = ({ content, style, onUpdate }) => {
  const { t } = useTranslate();
  const isEditable = !!onUpdate;
  const uniqueId = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Memoiza itens
  const items = useMemo<MediaItem[]>(() => {
    return (content.images || []).filter((i: MediaItem) => i?.url).slice(0, MAX_ITEMS);
  }, [content.images]);

  // Cálculos de peso e erros
  const { totalWeightMB, isOverTotalLimit, hasIndividualErrors } = useMemo(() => {
    const bytes = items.reduce((acc, curr) => acc + (curr.size || 0), 0);
    const individualErrors = items.some(item => {
      const limit = item.type === 'video' ? VIDEO_LIMIT : PHOTO_LIMIT;
      return (item.size || 0) > limit;
    });

    return {
      totalWeightMB: bytes / (1024 * 1024),
      isOverTotalLimit: bytes > TOTAL_SECTION_LIMIT,
      hasIndividualErrors: individualErrors
    };
  }, [items]);

  const isAtLimit = items.length >= MAX_ITEMS;
  const hasPendingUploads = items.some(i => i.isTemp);

  // Lógica de Sync
  const handleSyncToCloud = async () => {
    if (isOverTotalLimit || hasIndividualErrors) {
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

  // Remoção Otimista
  const handleRemove = async (index: number) => {
    const itemToRemove = items[index];
    const newItems = items.filter((_, idx) => idx !== index);
    onUpdate?.('images', newItems);

    try {
      if (itemToRemove.delete_token) {
        deleteFromCloudinary(itemToRemove).catch(console.error);
      }
      if (itemToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(itemToRemove.url);
      }
      toast.success("Item removido localmente.");
    } catch (error) {
      console.error("Erro ao processar remoção:", error);
    }
  };

  // Fetch tamanhos remotos
  useEffect(() => {
    if (!isEditable) return;
    
    const fetchMissingSizes = async () => {
      const missing = items.filter(img => !img.size && img.url && !img.url.startsWith('blob:') && !img.url.startsWith('data:'));
      if (missing.length === 0) return;
      
      setIsCalculating(true);
      const updatedImages = [...items];
      let hasChanged = false;

      await Promise.all(missing.map(async (img) => {
        try {
          const response = await fetch(img.url, { method: 'HEAD' });
          const size = response.headers.get('content-length');
          if (size) {
            const idx = updatedImages.findIndex(ui => ui.url === img.url);
            if (idx !== -1) {
              updatedImages[idx] = { ...updatedImages[idx], size: parseInt(size, 10) };
              hasChanged = true;
            }
          }
        } catch {
          console.warn("Não foi possível obter o tamanho da mídia remota.");
        }
      }));

      if (hasChanged) onUpdate?.('images', updatedImages);
      setIsCalculating(false);
    };

    fetchMissingSizes();
  }, [isEditable, items, onUpdate]);

  const moveItem = useCallback((from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    const newItems = [...items];
    const [movedItem] = newItems.splice(from, 1);
    newItems.splice(to, 0, movedItem);
    onUpdate?.('images', newItems);
  }, [items, onUpdate]);

  const handleUpload = (e: ChangeEvent<HTMLInputElement>, index: number | null = null) => {
    if (e.target.files) {
      handleMultipleUploads(e.target.files, items, index, (imgs: MediaItem[]) => 
        onUpdate?.('images', imgs.slice(0, MAX_ITEMS))
      );
    }
  };

  return (
    <section className={`py-6 md:py-10 px-2 transition-colors duration-300 ${getTheme(style.theme)}`}>
      <div className="max-w-4xl mx-auto px-4" ref={containerRef}>
        
        {/* Input Oculto Global para o botão principal */}
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
            stats={{ totalWeightMB, isOverTotalLimit, hasPendingUploads, isAtLimit }}
            isSyncing={isSyncing}
            onSync={handleSyncToCloud}
            onUploadTrigger={() => document.getElementById(`up-${uniqueId}`)?.click()}
            t={t}
          />
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
            t={t}
          />
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
                onDrop={() => { if (draggedIdx !== null) { moveItem(draggedIdx, i); setDraggedIdx(null); }}}
                t={t}
              />
            ))}
          </div>
        )}
      </div>

      {!isEditable && (
        <MediaModal 
          media={previewMedia} 
          onClose={() => setPreviewMedia(null)} 
          t={t} 
        />
      )}
    </section>
  );
};