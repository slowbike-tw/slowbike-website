import type { Metadata } from "next";
import { ArrowLeft, Check, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { ProductGallery } from "@/components/product-gallery";
import { ProductCard } from "@/components/product-card";
import { ProductSelectionProvider } from "@/components/product-selection-provider";
import { formatPrice, getProductBySlug, getStartingPrice, products } from "@/lib/products";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} ${product.series}`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = products.filter((item) => item.id !== product.id).slice(0, 2);
  return (
    <>
      <section className="border-b border-black/10 bg-[#eeece3]">
        <div className="mx-auto max-w-7xl px-5 py-5 lg:px-8">
          <Link href="/products" className="inline-flex items-center gap-2 text-xs font-black text-ink/50 hover:text-olive-700">
            <ArrowLeft size={15} /> 返回商品系列
          </Link>
        </div>
      </section>

      <section className="bg-[#eeece3] pb-16 lg:pb-24">
        <ProductSelectionProvider product={product}>
          <div className="mx-auto grid max-w-7xl gap-9 px-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:px-8">
            <ProductGallery product={product} />
            <div className="lg:sticky lg:top-28 lg:pt-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-black tracking-[0.24em] text-olive-600">{product.englishSeries}</p>
              <span className="rounded-full bg-white/70 px-3 py-2 text-[10px] font-black text-olive-700">
                {product.statusLabel}
              </span>
            </div>
            <h1 className="mt-5 text-5xl font-black tracking-[-0.06em] sm:text-6xl">
              {product.name}
              <span className="mt-2 block text-xl tracking-normal text-ink/45">{product.series}</span>
            </h1>
            <p className="mt-6 text-xl font-black leading-snug">{product.tagline}</p>
            <p className="mt-4 text-sm leading-7 text-ink/55">{product.description}</p>

            <div className="my-7 border-y border-black/10 py-6">
              <p className="text-xs font-bold text-ink/35">商品售價</p>
              <p className="mt-2 text-3xl font-black tracking-[-0.03em]">
                {formatPrice(getStartingPrice(product))} 起
              </p>
              <p className="mt-2 text-xs text-ink/40">{product.priceNote}</p>
            </div>

            <AddToCart product={product} disabled={product.status === "coming-soon"} />

            <div className="mt-7 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/55 p-4">
                <Truck size={18} className="text-olive-700" />
                <p className="mt-3 text-xs font-black">
                  宅配運費 {formatPrice(product.homeDeliveryFee)}
                </p>
              </div>
              <div className="rounded-2xl bg-white/55 p-4">
                <ShieldCheck size={18} className="text-olive-700" />
                <p className="mt-3 text-xs font-black">SlowBike 全車系保固</p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-6 text-ink/45">{product.deliveryNote}</p>
            </div>
          </div>
        </ProductSelectionProvider>
      </section>

      <section className="py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-xs font-black tracking-[0.24em] text-olive-600">DESIGNED FOR LIFE</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] sm:text-4xl">為你的日常而設計</h2>
            <p className="mt-6 leading-8 text-ink/60">{product.longDescription}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {product.features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 rounded-2xl bg-sand p-4 text-sm font-bold">
                  <span className="grid size-6 place-items-center rounded-full bg-olive-600 text-white">
                    <Check size={13} strokeWidth={3} />
                  </span>
                  {feature}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] bg-ink p-7 text-white sm:p-10">
            <p className="text-xs font-black tracking-[0.24em] text-olive-300">SPECIFICATIONS</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em]">商品規格</h2>
            <div className="mt-8">
              {product.specs.map((spec) => (
                <div key={spec.label} className="grid grid-cols-[0.8fr_1.2fr] gap-4 border-b border-white/10 py-5 text-sm">
                  <span className="text-white/40">{spec.label}</span>
                  <span className="font-bold">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="text-xs font-black tracking-[0.24em] text-olive-600">WARRANTY</p>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.04em]">保固內容</h2>
              <p className="mt-4 text-sm leading-7 text-ink/55">
                {product.salesMode}商品，完成交車後依各項保固內容提供售後支援。
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {product.warranties.map((warranty) => (
                <article key={warranty.item} className="rounded-2xl bg-sand p-5">
                  <ShieldCheck size={19} className="text-olive-700" />
                  <h3 className="mt-4 font-black">{warranty.item}</h3>
                  <p className="mt-2 text-xl font-black text-olive-700">{warranty.period}</p>
                  <p className="mt-2 text-xs leading-5 text-ink/45">{warranty.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-sand py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <p className="text-xs font-black tracking-[0.24em] text-olive-600">KEEP EXPLORING</p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em]">也許你也適合</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {related.map((item) => <ProductCard key={item.id} product={item} />)}
          </div>
        </div>
      </section>
    </>
  );
}
