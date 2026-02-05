import React, { useState, useEffect, useId, useRef, useMemo } from 'react';
import { Camera, X, Trash2, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import type { SectionProps, MediaItem } from '../types';
import { getTheme, editableProps, handleMultipleUploads, MediaRenderer, getFontSize } from '../helpers';

const MIN_ITEMS = 4;
const MAX_ITEMS = 10;

// Gerador de imagens aleatórias para fallback
const getRandomImages = (): MediaItem[] => {
  return Array.from({ length: 0 }).map((_, i) => ({
    id: `rand-${i}-${Math.random()}`,
    url: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?auto=format&fit=crop&w=800&q=60`,
    type: 'image'
  }));
};

export const GaleriaGrid: React.FC<SectionProps> = ({ content, style, onUpdate }) => {
  const isEditable = !!onUpdate;
  const uniqueId = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement>(null);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const videoQueueRef = useRef<number>(0);
  const visibleVideosRef = useRef<Set<number>>(new Set());
  const videosRef = useRef<HTMLVideoElement[]>([]);

  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Lógica: Se não houver imagens no conteúdo, usa as random
  const items = useMemo(() => {
    const existing = (content.images || []).filter(i => i?.url);
    return existing.length >= 1 ? existing.slice(0, MAX_ITEMS) : getRandomImages();
  }, [content.images]);

  const colsValue = style.cols || '4';

  // ================== Advanced Video Engine (Original) ==================
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const vids = Array.from(container.querySelectorAll('video')) as HTMLVideoElement[];
    videosRef.current = vids;
    vids.forEach(v => { v.preload = 'metadata'; v.playsInline = true; v.muted = true; v.loop = false; });
    if (!vids.length) return;

    observerRef.current?.disconnect();
    const play = (idx: number) => {
      if (!vids.length) return;
      videoQueueRef.current = idx;
      vids.forEach(v => { v.pause(); v.onended = null; });
      const current = vids[idx];
      if (!current) return;
      current.currentTime = 0;
      current.play().catch(() => {});
      current.onended = () => {
        const visible = [...visibleVideosRef.current];
        if (!visible.length) return;
        const currentIdx = visible.indexOf(videoQueueRef.current);
        const next = visible[(currentIdx + 1) % visible.length];
        play(next);
      };
    };

    observerRef.current = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const video = entry.target as HTMLVideoElement;
        const idx = vids.indexOf(video);
        if (entry.isIntersecting) visibleVideosRef.current.add(idx);
        else { visibleVideosRef.current.delete(idx); video.pause(); }
      });
      if (!visibleVideosRef.current.has(videoQueueRef.current)) {
        const next = [...visibleVideosRef.current][0];
        if (typeof next === 'number') play(next);
      }
    }, { threshold: 0.6 });

    vids.forEach(v => observerRef.current!.observe(v));
    play(0);
    return () => { vids.forEach(v => { v.pause(); v.onended = null; }); observerRef.current?.disconnect(); };
  }, [items, colsValue]);

  // ================== Layout Engine (Original Restaurado) ==================
 
  const getItemClass = (i: number) => {
    if (colsValue === '1') return i === 0 ? 'col-span-4 md:row-span-3 md:col-span-5 aspect-[16/9]' : 'col-span-2 md:col-span-1 aspect-[4/3] md:aspect-[9/8]';
    if (colsValue === '2') return i === 0 ? 'col-span-3 row-span-3 aspect-[4/3]' : 'col-span-1 aspect-[4/3]';
    return 'break-inside-avoid mb-2';
  };

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    const newItems = [...items];
    const [movedItem] = newItems.splice(from, 1);
    newItems.splice(to, 0, movedItem);
    onUpdate?.('images', newItems);
  };

  return (
    <section className={`py-4 md:py-6 px-2 ${getTheme(style.theme)}`}>
      {/* Container mais compacto no computador (max-w-3xl) */}
      <div className="max-w-3xl mx-auto px-4" ref={containerRef}>

        <header className={`mb-3 flex flex-col gap-0.5 ${style.align === 'center' ? 'items-center text-center' : 'items-start text-left'}`}>
          <h1 {...editableProps(isEditable, (v) => onUpdate?.('title', v))}
              className={`font-black uppercase tracking-tight leading-none ${getFontSize(style.fontSize, 'h2')}`}>
            {content.title || 'Galeria'}
          </h1>
          <p {...editableProps(isEditable, (v) => onUpdate?.('description', v))}
             className="opacity-40 text-[9px] md:text-[10px] uppercase tracking-[0.15em]">
            {content.description || 'Curadoria Digital'}
          </p>

          {isEditable && (
            <button
              onClick={() => document.getElementById(`up-${uniqueId}`)?.click()}
              className="mt-1 text-[9px] font-bold text-blue-500 uppercase border-b border-blue-500/20"
            >
              + Adicionar
              <input id={`up-${uniqueId}`} type="file" className="hidden" accept="image/*,video/*" multiple
                onChange={(e) => e.target.files && handleMultipleUploads(e.target.files, items, null, (imgs) => onUpdate?.('images', imgs.slice(0, MAX_ITEMS)))}
              />
            </button>
          )}
        </header>

        <div className={
          colsValue === '4'
            ? 'columns-2 sm:columns-3 md:columns-4 gap-2'
            : 'grid grid-cols-4 md:grid-cols-6 gap-2'
        }>
          {items.map((item, i) => (
            <div
              key={item.id || `${uniqueId}-${i}`}
              draggable={isEditable}
              onDragStart={() => setDraggedIdx(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (draggedIdx !== null) { moveItem(draggedIdx, i); setDraggedIdx(null); } }}
              className={`relative rounded-xl overflow-hidden group bg-zinc-100 dark:bg-zinc-900 transition-all ${getItemClass(i)} ${draggedIdx === i ? 'opacity-20 scale-95' : 'opacity-100'}`}
            >
              <div className="w-full h-full cursor-pointer" onClick={() => setPreviewMedia(item)}>
                <MediaRenderer media={item} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>

              {isEditable && (
                <div className="absolute inset-0 bg-black/20 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 z-20 scale-75 origin-top-right">
                    <label className="p-1.5 bg-blue-600 text-white rounded-lg cursor-pointer"><Camera size={12} />
                      <input type="file" className="hidden" accept="image/*,video/*"
                        onChange={(e) => e.target.files?.[0] && handleMultipleUploads(e.target.files, items, i, (imgs) => onUpdate?.('images', imgs))}
                      />
                    </label>
                    <button onClick={(e) => { e.stopPropagation(); onUpdate?.('images', items.filter((_, idx) => idx !== i)); }}
                      className="p-1.5 bg-white text-red-500 rounded-lg shadow-lg"><Trash2 size={12}/></button>
                  </div>
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 flex justify-between items-center pointer-events-none">
                    <div className="flex gap-1 pointer-events-auto md:hidden">
                      <button onClick={() => moveItem(i, i - 1)} className="p-1.5 bg-black/60 text-white rounded-md"><ChevronLeft size={12}/></button>
                      <button onClick={() => moveItem(i, i + 1)} className="p-1.5 bg-black/60 text-white rounded-md"><ChevronRight size={12}/></button>
                    </div>
                    <div className="hidden md:block p-1.5 bg-black/40 backdrop-blur-md text-white rounded-lg pointer-events-auto cursor-grab active:cursor-grabbing"><GripVertical size={12}/></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Preview */}
      {previewMedia && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm" onClick={() => setPreviewMedia(null)}>
          <div className="relative max-w-xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button className="absolute -top-8 right-0 text-white/50" onClick={() => setPreviewMedia(null)}><X size={22} /></button>
            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl w-full max-h-[70vh] flex items-center justify-center border border-white/5">
              {previewMedia.type === 'video' ? <video src={previewMedia.url} controls autoPlay className="max-h-[70vh] w-full" /> : <img src={previewMedia.url} className="max-h-[70vh] object-contain" />}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}; 