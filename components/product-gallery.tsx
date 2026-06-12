"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ProductVisual } from "@/components/product-visual";
import { useProductSelection } from "@/components/product-selection-provider";
import type { Product } from "@/types/product";

export function ProductGallery({ product }: { product: Product }) {
  const { color } = useProductSelection();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const colorImage = product.media.colorImages[color] ?? null;
  const images = useMemo<Array<string | null>>(() => {
    const available = [
      product.media.mainImage,
      ...product.media.gallery,
      colorImage,
    ].filter((image): image is string => Boolean(image));
    const uniqueImages = [...new Set(available)];
    return uniqueImages.length > 0 ? uniqueImages : [null];
  }, [colorImage, product.media.gallery, product.media.mainImage]);

  function selectImage(index: number) {
    const viewport = viewportRef.current;
    if (!viewport) return;
    setActiveIndex(index);
    viewport.scrollTo({
      left: viewport.clientWidth * index,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    if (!colorImage) return;
    const index = images.indexOf(colorImage);
    const viewport = viewportRef.current;
    if (index < 0 || !viewport) return;
    setActiveIndex(index);
    viewport.scrollTo({
      left: viewport.clientWidth * index,
      behavior: "smooth",
    });
  }, [colorImage, images]);

  function handleScroll() {
    const viewport = viewportRef.current;
    if (!viewport || viewport.clientWidth === 0) return;
    setActiveIndex(Math.round(viewport.scrollLeft / viewport.clientWidth));
  }

  return (
    <div className="min-w-0">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-soft">
        <div
          ref={viewportRef}
          onScroll={handleScroll}
          className="product-gallery-scroll flex h-[440px] snap-x snap-mandatory overflow-x-auto scroll-smooth lg:h-[650px]"
          aria-label={`${product.name} 商品圖片`}
        >
          {images.map((image, index) => (
            <div
              key={image ?? "placeholder"}
              className="h-full min-w-full snap-center"
            >
              <ProductVisual
                name={product.name}
                series={product.series}
                image={image}
                tone={product.tone}
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <div className="product-gallery-scroll mt-4 flex gap-3 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image ?? "placeholder"}
              type="button"
              onClick={() => selectImage(index)}
              aria-label={`查看第 ${index + 1} 張商品圖片`}
              aria-current={activeIndex === index}
              className={`h-24 min-w-24 overflow-hidden rounded-2xl border bg-white transition sm:h-28 sm:min-w-28 ${
                activeIndex === index
                  ? "border-olive-700 ring-2 ring-olive-700/20"
                  : "border-black/10"
              }`}
            >
              <ProductVisual
                name={`${product.name} 商品圖片 ${index + 1}`}
                series={product.series}
                image={image}
                tone={product.tone}
                compact
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
