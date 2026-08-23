import { useState, useEffect, useMemo, memo, useCallback } from "react";
import { ImageOff, Maximize2 } from "lucide-react";
import type { MediaItem } from "../../sections/main";
import { MediaModal } from "../../modal";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  fallbackImage: string;
  imageWrapClass: string;
  t: any;
}

export const ProductGallery = memo(function ProductGallery({
  images,
  productName,
  fallbackImage,
  imageWrapClass,
  t,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [pauseCarousel, setPauseCarousel] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [failedIndices, setFailedIndices] = useState<Record<number, boolean>>({});

  const previews = useMemo(() => (images.length ? images : [fallbackImage]), [images, fallbackImage]);

  // Reseta índice e falhas quando a lista de imagens muda
  useEffect(() => {
    setActiveIndex(0);
    setFailedIndices({});
  }, [images]);

  // 🚀 Pré-carregamento inteligente de todas as imagens no cache do navegador
  useEffect(() => {
    if (!previews.length) return;

    previews.forEach((src) => {
      if (!src || src === fallbackImage) return;
      const img = new Image();
      img.src = src;
    });
  }, [previews, fallbackImage]);

  // Carrossel automático com intervalo
  useEffect(() => {
    if (previews.length <= 1 || pauseCarousel) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % previews.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [previews.length, pauseCarousel]);

  // Modal de preview da imagem ativa
  const openImagePreview = useCallback(() => {
    const isFailed = failedIndices[activeIndex];
    const url = isFailed ? fallbackImage : previews[activeIndex];
    if (!url || url === fallbackImage) return;
    setPreviewMedia({ url, type: "image", id: String(activeIndex) });
  }, [activeIndex, previews, fallbackImage, failedIndices]);

  // Tratamento de falha individual por índice
  const handleImgError = useCallback((index: number) => {
    setFailedIndices((prev) => ({ ...prev, [index]: true }));
  }, []);

  const isCurrentFailed = Boolean(failedIndices[activeIndex]);
  const isCurrentFallback = previews[activeIndex] === fallbackImage || isCurrentFailed;

  return (
    <>
      {previewMedia && <MediaModal media={previewMedia} onClose={() => setPreviewMedia(null)} t={t} />}

      <div className="flex flex-col md:sticky md:top-24 h-max">
        <div className={`overflow-hidden md:rounded-3xl shadow-sm ${imageWrapClass}`}>
          <div
            className="relative w-full aspect-square sm:aspect-[4/3] md:aspect-square bg-slate-100 dark:bg-zinc-900 overflow-hidden"
            onMouseEnter={() => setPauseCarousel(true)}
            onMouseLeave={() => setPauseCarousel(false)}
          >
            {/* 🚀 Skeleton de fundo: evita tela branca antes da 1ª imagem carregar */}
            <div className="absolute inset-0 bg-slate-200/60 dark:bg-zinc-800/60 animate-pulse pointer-events-none" />

            {/* 🚀 Camadas sobrepostas (Cross-fade) - impede que a tela fique branca ao trocar */}
            {previews.map((src, idx) => {
              const isActive = idx === activeIndex;
              const hasFailed = failedIndices[idx];
              const finalSrc = hasFailed ? fallbackImage : src;

              return (
                <img
                  key={`${src}-${idx}`}
                  src={finalSrc}
                  alt={productName || "Product"}
                  loading={idx === 0 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={idx === 0 ? "high" : "low"}
                  className={`absolute inset-0 h-full w-full object-cover object-center transform-gpu transition-opacity duration-500 ease-in-out will-change-[opacity] ${
                    isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  }`}
                  onError={() => handleImgError(idx)}
                />
              );
            })}

            {/* Aviso de erro ou fallback */}
            {isCurrentFallback && (
              <div className="absolute right-3 bottom-3 z-20 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] bg-white/90 dark:bg-zinc-900/90 text-slate-700 dark:text-slate-200 shadow-sm ">
                <ImageOff size={14} className="text-slate-500" />
                {t("noImage") || "Sem Imagem"}
              </div>
            )}

            {/* Botão de zoom */}
            {!isCurrentFallback && (
              <button
                type="button"
                onClick={openImagePreview}
                className="absolute right-4 top-4 z-20 rounded-full bg-black/40 p-2.5 text-white transition hover:bg-black/60 shadow-sm  active:scale-95"
                aria-label="Ampliar imagem"
              >
                <Maximize2 size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Miniaturas */}
        {previews.length > 1 && (
          <div className="px-4 py-4 md:px-0">
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {previews.map((img, index) => {
                const isSelected = index === activeIndex;
                const hasFailed = failedIndices[index];
                const finalThumbSrc = hasFailed ? fallbackImage : img;

                return (
                  <button
                    key={`${img}-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`group relative h-16 w-16 md:h-20 md:w-20 shrink-0 overflow-hidden rounded-2xl border transition-all transform-gpu bg-slate-100 dark:bg-zinc-800 ${
                      isSelected
                        ? "border-slate-900 ring-2 ring-slate-900/10 shadow-md dark:border-white"
                        : "border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100 dark:border-zinc-700"
                    }`}
                  >
                    <img 
                      src={finalThumbSrc} 
                      alt={`Miniatura ${index + 1}`} 
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105" 
                      onError={() => handleImgError(index)}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
});