import React, { useState, useEffect, useId, useRef, useMemo, useCallback } from 'react';
// Importação de tipos separada para cumprir o verbatimModuleSyntax
import type { ChangeEvent, MouseEvent } from 'react';
import { 
  Camera, X, Trash2, RefreshCcw, ShieldAlert, 
  FileWarning, Database, Layers, ChevronLeft, ChevronRight 
} from 'lucide-react';
import type { SectionProps, MediaItem } from '../../../types/library';
import { getTheme, editableProps, handleMultipleUploads, MediaRenderer, getFontSize } from '../helpers';
import { useTranslate } from '../../../context/LanguageContext';

// Constantes de Limite
const MAX_ITEMS = 10;
const PHOTO_LIMIT = 1 * 1024 * 1024;
const VIDEO_LIMIT = 10 * 1024 * 1024;
const TOTAL_SECTION_LIMIT = 15 * 1024 * 1024;

const COMPRESS_PHOTO = "https://tinypng.com/";
const COMPRESS_VIDEO = "https://videocandy.com/compress-video/";

export const GaleriaGrid: React.FC<SectionProps> = ({ content, style, onUpdate }) => {
  const { t } = useTranslate();
  const isEditable = !!onUpdate;
  const uniqueId = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  const items = useMemo<MediaItem[]>(() => {
    return (content.images || []).filter((i: MediaItem) => i?.url).slice(0, MAX_ITEMS);
  }, [content.images]);

  const isAtLimit = items.length >= MAX_ITEMS;

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

  const canSave = !isOverTotalLimit && !hasIndividualErrors;

  useEffect(() => {
    if (!isEditable) return;
    
    const fetchMissingSizes = async () => {
      const missing = items.filter(img => !img.size && img.url && !img.url.startsWith('data:'));
      if (missing.length === 0) return;
      
      setIsCalculating(true);
      const updatedImages = [...items];
      let hasChanged = false;

      await Promise.all(missing.map(async (img) => {
        try {
          const targetUrl = img.url;
          if (!targetUrl) return;
          
          const response = await fetch(targetUrl, { method: 'HEAD' });
          const size = response.headers.get('content-length');
          if (size) {
            const idx = updatedImages.findIndex(ui => ui.url === targetUrl);
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

  const getItemClass = (i: number): string => {
    const colsValue = style.cols || '4';
    if (colsValue === '1') return i === 0 ? 'col-span-4 md:row-span-3 md:col-span-5 aspect-[16/9]' : 'col-span-2 md:col-span-1 aspect-[4/3] md:aspect-[9/8]';
    if (colsValue === '2') return i === 0 ? 'col-span-3 row-span-3 aspect-[4/3]' : 'col-span-1 aspect-[4/3]';
    return 'break-inside-avoid mb-2';
  };

  const handleUpload = (e: ChangeEvent<HTMLInputElement>, index: number | null = null) => {
    if (e.target.files) {
      handleMultipleUploads(e.target.files, items, index, (imgs: MediaItem[]) => 
        onUpdate?.('images', imgs.slice(0, MAX_ITEMS))
      );
    }
  };

  return (
    <section className={`py-6 md:py-10 px-2 transition-colors duration-300 ${getTheme(style.theme)}`}>
      <div className="max-w-5xl mx-auto px-4" ref={containerRef}>
        
        {isEditable && (
          <div className="mb-6">
            <div className={`p-4 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-4 ${
              canSave 
                ? 'bg-zinc-100/80 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800' 
                : 'bg-red-50 border-red-200 dark:bg-red-500/30 dark:border-red-900/50'
            }`}>
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                    <Database size={10} /> {t('gallery_storage')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-black transition-colors ${
                      isOverTotalLimit ? 'text-red-600 dark:text-red-500' : 'text-zinc-900 dark:text-white' 
                    }`}>
                      {totalWeightMB.toFixed(1)} 
                      <span className="text-[10px] ml-1 text-zinc-400 dark:text-zinc-500">/ 15 MB</span>
                    </span>
                    {isCalculating && <RefreshCcw size={12} className="animate-spin text-blue-500" />}
                  </div>
                </div>

                <div className="flex flex-col border-l border-zinc-200 dark:border-zinc-800 pl-6">
                  <span className="text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                    <Layers size={10} /> {t('gallery_slots') || "Assets"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-black ${isAtLimit ? 'text-amber-500' : 'text-zinc-900 dark:text-white'}`}>
                      {items.length} 
                      <span className="text-[10px] ml-1 text-zinc-400 dark:text-zinc-500">/ {MAX_ITEMS}</span>
                    </span>
                  </div>
                </div>
                
                {!canSave && (
                  <div className="flex items-center gap-2 text-red-600 animate-pulse">
                    <ShieldAlert size={16} />
                    <span className="text-[10px] font-black uppercase tracking-tight">{t('gallery_limit_error')}</span>
                  </div>
                )}
              </div>

              <button
                disabled={isAtLimit}
                onClick={() => document.getElementById(`up-${uniqueId}`)?.click()}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-lg flex items-center gap-2
                  ${isAtLimit 
                    ? 'bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed' 
                    : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 active:scale-95'
                  }`}
              >
                {isAtLimit ? <X size={14} /> : '+'} {isAtLimit ? (t('gallery_limit_reached') || 'Limit Reached') : t('gallery_add')}
                {!isAtLimit && (
                  <input id={`up-${uniqueId}`} type="file" className="hidden" accept="image/*,video/*" multiple onChange={handleUpload} />
                )}
              </button>
            </div>
            
            <div className="mt-2 flex justify-between items-center px-1">
            <p className="text-[9px] font-bold opacity-40 dark:opacity-30 uppercase tracking-tighter italic whitespace-pre-line">
  {t('gallery_support')}
</p>

              {hasIndividualErrors && (
                <p className="text-[9px] hidden md:flex font-bold text-red-500 uppercase items-center gap-1">
                  <FileWarning size={10}/> {t('gallery_file_error')}
                </p>
              )}
            </div>
          </div>
        )}

        <header className={`mb-6 flex flex-col gap-0.5 ${style.align === 'center' ? 'items-center text-center' : 'items-start text-left'}`}>
          <h1 {...editableProps(isEditable, (v: string) => onUpdate?.('title', v))}
              className={`font-black uppercase tracking-tight leading-none dark:text-zinc-200 ${getFontSize(style.fontSize, 'h2')}`}>
            {content.title || t('gallery_default_title')}
          </h1>
          <p {...editableProps(isEditable, (v: string) => onUpdate?.('description', v))}
             className="opacity-40 dark:opacity-50 text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold dark:text-zinc-400">
            {content.description || t('gallery_default_desc')}
          </p>
        </header>

        <div className={style.cols === '4' ? 'columns-2 sm:columns-3 md:columns-4 gap-2' : 'grid grid-cols-4 md:grid-cols-6 gap-2'}>
          {items.map((item, i) => {
            const itemMB = (item.size || 0) / (1024 * 1024);
            const limit = item.type === 'video' ? VIDEO_LIMIT : PHOTO_LIMIT;
            const isTooLarge = (item.size || 0) > limit;

            // Type Guard / Casting para o MediaRenderer
            const mediaData = {
              url: item.url as string,
              type: (item.type || 'image') as 'image' | 'video'
            };

            return (
              <div
                key={item.url || i}
                draggable={isEditable}
                onDragStart={() => setDraggedIdx(i)}
                onDragOver={(e: React.DragEvent) => e.preventDefault()}
                onDrop={() => { if (draggedIdx !== null) { moveItem(draggedIdx, i); setDraggedIdx(null); } }}
                className={`relative rounded-xl overflow-hidden group transition-all transform-gpu dark:border dark:border-zinc-800/50 ${getItemClass(i)} 
                  ${isTooLarge && isEditable ? 'ring-2 ring-red-500 ring-offset-1 dark:ring-offset-zinc-950' : 'bg-zinc-100 dark:bg-zinc-900'}
                `}
              >
                <div className="w-full h-full cursor-pointer" onClick={() => setPreviewMedia(item)}>
                  <MediaRenderer media={mediaData} className="w-full h-full object-cover" />
                </div>

                {isEditable && (
                  <div className={`absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] font-black z-30 backdrop-blur-md border border-white/10
                    ${isTooLarge ? 'bg-red-600 text-white' : 'bg-black/50 text-white/90'}`}>
                    {item.size ? `${itemMB.toFixed(1)} MB` : t('gallery_scanning')}
                  </div>
                )}

                {isTooLarge && isEditable && (
                  <a href={item.type === 'video' ? COMPRESS_VIDEO : COMPRESS_PHOTO} target="_blank" rel="noopener noreferrer"
                    onClick={(ev: MouseEvent) => ev.stopPropagation()}
                    className="absolute inset-x-2 bottom-2 bg-red-600 text-white text-[8px] font-black text-center py-2 rounded-lg flex items-center justify-center gap-1 uppercase z-[40] hover:bg-red-700 shadow-xl"
                  >
                    <RefreshCcw size={10} /> {t('gallery_compress')}
                  </a>
                )}

                {isEditable && (
                  <div className="absolute inset-0 bg-black/10 dark:bg-black/30 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                    <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 pointer-events-auto">
                      <label className="p-1.5 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-500 shadow-md">
                        <Camera size={12} />
                        <input type="file" className="hidden" accept="image/*,video/*" onChange={(ev) => handleUpload(ev, i)} />
                      </label>
                      <button onClick={(ev: MouseEvent) => { ev.stopPropagation(); onUpdate?.('images', items.filter((_, idx) => idx !== i)); }}
                        className="p-1.5 bg-white dark:bg-zinc-800 text-red-500 dark:text-red-400 rounded-lg shadow-md hover:bg-red-50 dark:hover:bg-zinc-700 transition-colors">
                        <Trash2 size={12}/>
                      </button>
                    </div>

                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 pointer-events-auto">
                      <button 
                        onClick={(ev: MouseEvent) => { ev.stopPropagation(); moveItem(i, i - 1); }}
                        disabled={i === 0}
                        className={`p-1.5 rounded-lg shadow-lg backdrop-blur-md transition-all ${i === 0 ? 'bg-zinc-500/20 text-zinc-400' : 'bg-white/90 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:scale-110 active:scale-95'}`}
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <div className="bg-black/60 px-2 py-1 rounded-md">
                         <span className="text-[9px] text-white font-black">{i + 1}</span>
                      </div>
                      <button 
                        onClick={(ev: MouseEvent) => { ev.stopPropagation(); moveItem(i, i + 1); }}
                        disabled={i === items.length - 1}
                        className={`p-1.5 rounded-lg shadow-lg backdrop-blur-md transition-all ${i === items.length - 1 ? 'bg-zinc-500/20 text-zinc-400' : 'bg-white/90 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:scale-110 active:scale-95'}`}
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {previewMedia && previewMedia.url && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-zinc-950/95 backdrop-blur-sm" onClick={() => setPreviewMedia(null)}>
          <div className="relative max-w-xl w-full flex flex-col items-center" onClick={ev => ev.stopPropagation()}>
            <button className="absolute -top-12 right-0 text-white/50 hover:text-white" onClick={() => setPreviewMedia(null)}><X size={32} /></button>
            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl w-full max-h-[80vh] flex items-center justify-center border border-white/10">
              {previewMedia.type === 'video' ? 
                <video src={previewMedia.url} controls autoPlay className="max-h-[80vh] w-full" /> : 
                <img src={previewMedia.url} className="max-h-[80vh] object-contain" alt="Preview" />
              }
            </div>
            <div className="mt-4 flex flex-col items-center gap-1">
               <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.4em]">{t('gallery_preview_mode')}</p>
               {previewMedia.size && <span className="text-[9px] text-white/20 font-bold uppercase italic">{t('gallery_weight')}: {(previewMedia.size / (1024 * 1024)).toFixed(2)} MB</span>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};