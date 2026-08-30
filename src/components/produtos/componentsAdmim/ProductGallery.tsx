import { useState, useEffect, useMemo, memo, useCallback, useRef } from "react";
import { ImageOff, Maximize2, Loader2 } from "lucide-react";
import type { MediaItem } from "../../sections/main";
import { MediaModal } from "../../modal";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  fallbackImage: string;
  imageWrapClass?: string;
  t: (key: string, options?: { defaultValue?: string }) => string;
}

export const ProductGallery = memo(function ProductGallery({
  images,
  productName,
  fallbackImage,
  imageWrapClass = "",
  t,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [failedIndices, setFailedIndices] = useState<Record<number, boolean>>({});
  const [loadedIndices, setLoadedIndices] = useState<Record<number, boolean>>({});

  const userInteractedRef = useRef(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchDeltaXRef = useRef<number>(0);

  const previews = useMemo(() => {
    if (!images || images.length === 0) return [fallbackImage];
    return images.slice(0, 5);
  }, [images, fallbackImage]);

  useEffect(() => {
    setActiveIndex(0);
    setFailedIndices({});
    setLoadedIndices({});
    userInteractedRef.current = false;
  }, [images]);

  useEffect(() => {
    if (previews.length <= 1) return;

    const timer = setInterval(() => {
      if (userInteractedRef.current) {
        clearInterval(timer);
        return;
      }
      setActiveIndex((prev) => (prev + 1) % previews.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [previews.length]);

  const selectManualIndex = useCallback((index: number) => {
    userInteractedRef.current = true;
    setActiveIndex(index);
  }, []);

  const handleImgLoad = useCallback((index: number) => {
    setLoadedIndices((prev) => (prev[index] ? prev : { ...prev, [index]: true }));
  }, []);

  const handleImgError = useCallback((index: number) => {
    setFailedIndices((prev) => ({ ...prev, [index]: true }));
  }, []);

  // Callback ref para detectar na hora se o browser já tem a imagem em memória
  const imageRefCallback = useCallback(
    (index: number) => (node: HTMLImageElement | null) => {
      if (node && node.complete && node.naturalWidth > 0) {
        setLoadedIndices((prev) => (prev[index] ? prev : { ...prev, [index]: true }));
      }
    },
    []
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchDeltaXRef.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current !== null) {
      touchDeltaXRef.current = touchStartXRef.current - e.touches[0].clientX;
    }
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || previews.length <= 1) return;
    const diff = touchDeltaXRef.current;

    if (Math.abs(diff) > 35) {
      userInteractedRef.current = true;
      if (diff > 0) {
        setActiveIndex((prev) => (prev + 1) % previews.length);
      } else {
        setActiveIndex((prev) => (prev - 1 + previews.length) % previews.length);
      }
    }
    touchStartXRef.current = null;
    touchDeltaXRef.current = 0;
  };

  const openImagePreview = useCallback(() => {
    const isFailed = failedIndices[activeIndex];
    const url = isFailed ? fallbackImage : previews[activeIndex];
    if (!url || url === fallbackImage) return;
    setPreviewMedia({ url, type: "image", id: String(activeIndex) });
  }, [activeIndex, previews, fallbackImage, failedIndices]);

  const isCurrentFailed = Boolean(failedIndices[activeIndex]);
  const isCurrentFallback = previews[activeIndex] === fallbackImage || isCurrentFailed;
  const isCurrentLoaded = Boolean(loadedIndices[activeIndex]);
  const defaultProductName = t("product_default_name", { defaultValue: "Produto" });

  const gridLayoutClass = useMemo(() => {
    switch (previews.length) {
      case 2:
        return "grid-cols-2 max-w-[150px] sm:max-w-[170px]";
      case 3:
        return "grid-cols-3 max-w-[230px] sm:max-w-[260px]";
      case 4:
        return "grid-cols-4 max-w-[310px] sm:max-w-[350px]";
      case 5:
      default:
        return "grid-cols-5 max-w-[390px] sm:max-w-[440px]";
    }
  }, [previews.length]);

  return (
    <>
      {previewMedia && (
        <MediaModal media={previewMedia} onClose={() => setPreviewMedia(null)} t={t} />
      )}

      <div className="flex flex-col md:sticky md:top-24 h-max select-none w-full">
        {/* Palco Principal */}
        <div
          className={`relative overflow-hidden border-b md:border border-slate-200/90 bg-white md:rounded-3xl shadow-none md:shadow-xs dark:border-zinc-800 dark:bg-zinc-900 ${imageWrapClass}`}
        >
          <div
            className="relative w-full aspect-square md:aspect-square overflow-hidden bg-slate-50 dark:bg-zinc-950 flex items-center justify-center cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Spinner leve: renderizado apenas se a imagem atual realmente ainda não completou o carregamento */}
            {!isCurrentLoaded && !isCurrentFallback && (
              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400 dark:text-zinc-600" />
              </div>
            )}

            {/* Imagens mantidas estáveis no DOM: sem recriação de tags, sem piscar e cross-fade suave */}
            {previews.map((src, idx) => {
              const isActive = idx === activeIndex;
              const hasFailed = failedIndices[idx];
              const isLoaded = loadedIndices[idx];
              const finalSrc = hasFailed ? fallbackImage : src;

              return (
                <img
                  key={src}
                  ref={imageRefCallback(idx)}
                  src={finalSrc}
                  alt={`${productName || defaultProductName} ${idx + 1}`}
                  loading={idx === 0 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={idx === 0 ? "high" : "low"}
                  onLoad={() => handleImgLoad(idx)}
                  onError={() => handleImgError(idx)}
                  className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300 ease-out ${
                    isActive && isLoaded
                      ? "opacity-100 z-10"
                      : "opacity-0 z-0 pointer-events-none"
                  }`}
                />
              );
            })}

            {/* Sem Imagem */}
            {isCurrentFallback && (
              <div className="absolute left-3.5 bottom-3.5 z-20 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/95 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 shadow-2xs dark:border-zinc-700 dark:bg-zinc-850 dark:text-zinc-300">
                <ImageOff size={12} className="text-slate-400 dark:text-zinc-500" />
                {t("no_image", { defaultValue: "Sem Imagem" })}
              </div>
            )}

{/* Botão de Zoom */}
{!isCurrentFallback && isCurrentLoaded && (
              <button
                type="button"
                onClick={openImagePreview}
                aria-label={t("zoom_image", { defaultValue: "Ampliar imagem" })}
                className="absolute right-3.5 top-3.5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition active:scale-95 hover:bg-white dark:bg-zinc-900/80 dark:text-zinc-200 dark:border dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-white"
              >
                <Maximize2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Miniaturas */}
        {previews.length > 1 && (
          <div className="mt-3 flex justify-center w-full px-2">
            <div className={`grid w-full gap-2 sm:gap-2.5 ${gridLayoutClass}`}>
              {previews.map((img, index) => {
                const isSelected = index === activeIndex;
                const hasFailed = failedIndices[index];
                const thumbSrc = hasFailed ? fallbackImage : img;

                return (
                  <button
                    key={`${img}-${index}`}
                    type="button"
                    onClick={() => selectManualIndex(index)}
                    aria-label={`${t("view_image", { defaultValue: "Ver imagem" })} ${index + 1}`}
                    className={`group relative aspect-square w-full min-w-[56px] sm:min-w-[64px] overflow-hidden rounded-xl border bg-slate-50 transition-colors duration-150 dark:bg-zinc-950 ${
                      isSelected
                        ? "border-emerald-600 ring-2 ring-emerald-500/20 dark:border-emerald-400"
                        : "border-slate-200 opacity-60 hover:opacity-100 dark:border-zinc-800"
                    }`}
                  >
                    <img
                      src={thumbSrc}
                      alt={`${productName || defaultProductName} ${index + 1}`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
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