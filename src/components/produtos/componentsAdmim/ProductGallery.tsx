import { useState, useEffect, useMemo, memo } from "react";
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
  const [noImg, setNoImg] = useState(false);

  const previews = useMemo(() => (images.length ? images : [fallbackImage]), [images, fallbackImage]);

  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  useEffect(() => {
    if (previews.length <= 1 || pauseCarousel) return;
    const timer = window.setInterval(() => setActiveIndex((prev) => (prev + 1) % previews.length), 4200);
    return () => window.clearInterval(timer);
  }, [previews.length, pauseCarousel]);

  const openImagePreview = () => {
    const url = previews[activeIndex];
    if (!url || url === fallbackImage) return;
    setPreviewMedia({ url, type: "image", id: String(activeIndex) });
  };

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (e.currentTarget.src !== fallbackImage) {
      e.currentTarget.src = fallbackImage;
      setNoImg(true);
    }
  };

  return (
    <>
      {previewMedia && <MediaModal media={previewMedia} onClose={() => setPreviewMedia(null)} t={t} />}

      <div className="flex flex-col md:sticky md:top-24 h-max">
        <div className={`overflow-hidden md:rounded-3xl shadow-sm ${imageWrapClass}`}>
          <div
            className="relative aspect-square w-full sm:aspect-[4/3] md:aspect-square"
            onMouseEnter={() => setPauseCarousel(true)}
            onMouseLeave={() => setPauseCarousel(false)}
          >
            <img
              key={activeIndex}
              src={previews[activeIndex]}
              alt={productName || "Product"}
              loading={activeIndex === 0 ? "eager" : "lazy"}
              fetchPriority={activeIndex === 0 ? "high" : "low"}
              className="h-full w-full object-cover object-center transform-gpu transition-opacity duration-300"
              onError={handleImgError}
            />
            {noImg && (
              <div className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] bg-white/90 shadow-sm">
                <ImageOff size={14} className="text-slate-500" />
                {t("noImage") || "Sem Imagem"}
              </div>
            )}
            {previews[activeIndex] !== fallbackImage && (
              <button
                type="button"
                onClick={openImagePreview}
                className="absolute right-4 top-4 z-20 rounded-full bg-black/40 p-2.5 text-white transition hover:bg-black/60 backdrop-blur-md shadow-sm"
              >
                <Maximize2 size={20} />
              </button>
            )}
          </div>
        </div>

        {previews.length > 1 && (
          <div className="px-4 py-4 md:px-0">
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {previews.map((img, index) => (
                <button
                  key={`${img}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`group relative h-16 w-16 md:h-20 md:w-20 shrink-0 overflow-hidden rounded-2xl border transition-all transform-gpu ${
                    index === activeIndex
                      ? "border-slate-900 ring-2 ring-slate-900/10 shadow-md dark:border-white"
                      : "border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100 dark:border-zinc-700"
                  }`}
                >
                  <img src={img} alt="Thumb" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
});