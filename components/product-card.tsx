import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ProductVisual } from "@/components/product-visual";
import { formatPrice, getStartingPrice } from "@/lib/products";
import type { Product } from "@/types/product";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-black/10 bg-white">
      <Link href={`/products/${product.slug}`} className="block h-72 overflow-hidden sm:h-80">
        <div className="h-full transition duration-500 group-hover:scale-[1.025]">
          <ProductVisual
            name={product.name}
            series={product.series}
            image={product.media.mainImage}
            tone={product.tone}
            compact
          />
        </div>
      </Link>
      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black tracking-[0.22em] text-olive-600">{product.englishSeries}</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.05em]">
              {product.name}
              <span className="ml-2 text-base tracking-normal text-ink/45">{product.series}</span>
            </h2>
          </div>
          <span className="rounded-full bg-olive-100 px-3 py-2 text-[10px] font-black text-olive-700">
            {product.statusLabel}
          </span>
        </div>
        <p className="mt-4 text-sm leading-7 text-ink/55">{product.description}</p>
        <div className="mt-6 flex items-end justify-between gap-4 border-t border-black/10 pt-5">
          <div>
            <p className="text-[10px] font-bold text-ink/35">售價</p>
            <p className="mt-1 text-lg font-black">{formatPrice(getStartingPrice(product))} 起</p>
          </div>
          <Link
            href={`/products/${product.slug}`}
            className="grid size-11 place-items-center rounded-full bg-ink text-white transition group-hover:bg-olive-700"
            aria-label={`查看 ${product.name} 商品詳情`}
          >
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
    </article>
  );
}
