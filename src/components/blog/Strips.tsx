import { useRef, useCallback } from "react";
import { ShoppingBag, Store as StoreIcon } from "lucide-react";

import { SectionHeader, RailControls, ProductCard, StoreCard } from "./UIHelpers";
import type { ProductItem, StoreItem } from "../../types/Marketplace";
import { smoothScrollBy } from "../../utils/marketplaceutils";
import { STRIP_SCROLL_STEP } from "../../utils/constants";

export function HorizontalProductsStrip({
  title,
  items,
  onProductClick,
  locale,
}: {
  title: string;
  items: ProductItem[];
  onProductClick: (item: ProductItem) => void;
  locale: string;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);

  const handleLeft = useCallback(() => {
    smoothScrollBy(railRef.current, -STRIP_SCROLL_STEP);
  }, []);

  const handleRight = useCallback(() => {
    smoothScrollBy(railRef.current, STRIP_SCROLL_STEP);
  }, []);

  return (
    <section
      className="px-2 md:px-4"
      style={{ contentVisibility: "auto", containIntrinsicSize: "520px" }}
    >
      <SectionHeader
        icon={<ShoppingBag size={15} />}
        title={title}
        subtle={`${items.length}`}
        controls={<RailControls onLeft={handleLeft} onRight={handleRight} ariaLabel={title} />}
      />
      <div
        ref={railRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 scrollbar-hide"
      >
        {items.map((item) => (
          <div key={item.id} className="snap-start">
            <ProductCard item={item} onClick={onProductClick} compact locale={locale} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function HorizontalStoresStrip({
  title,
  items,
  onStoreClick,
  viewStore,
}: {
  title: string;
  items: StoreItem[];
  onStoreClick: (slug: string) => void;
  viewStore: string;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);

  const handleLeft = useCallback(() => {
    smoothScrollBy(railRef.current, -STRIP_SCROLL_STEP);
  }, []);

  const handleRight = useCallback(() => {
    smoothScrollBy(railRef.current, STRIP_SCROLL_STEP);
  }, []);

  return (
    <section style={{ contentVisibility: "auto", containIntrinsicSize: "400px" }}>
      <SectionHeader
        icon={<StoreIcon size={15} />}
        title={title}
        subtle={`${items.length}`}
        controls={<RailControls onLeft={handleLeft} onRight={handleRight} ariaLabel={title} />}
      />
      <div
        ref={railRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 scrollbar-hide"
      >
        {items.map((item) => (
          <div key={item.slug} className="snap-start">
            <StoreCard item={item} onClick={onStoreClick} viewStore={viewStore} />
          </div>
        ))}
      </div>
    </section>
  );
}