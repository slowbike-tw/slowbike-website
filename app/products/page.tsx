import type { Metadata } from "next";
import { CircleHelp, ShieldCheck, Truck } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { PageHero } from "@/components/ui";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "商品系列",
  description: "探索 SlowBike FOLD、S1、NOMA、MINI 四大電動腳踏車系列。",
};

export default function ProductsPage() {
  return (
    <>
      <PageHero
        eyebrow="SLOWBIKE COLLECTION"
        title="選一台，適合你生活的車"
        description="從旅行、街頭、樂活到輕行，四種系列對應不同生活節奏。正式規格與售價將依實車到貨資訊更新。"
      />
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-5 md:grid-cols-2">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
      <section className="border-y border-black/10 bg-white py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 md:grid-cols-3 lg:px-8">
          <ServiceNote icon={CircleHelp} title="專人選車" text="依用途、身高與預算協助評估。" />
          <ServiceNote icon={Truck} title="交車安排" text="支援門市交車與全台配送。" />
          <ServiceNote icon={ShieldCheck} title="售後保固" text="商品交車後可登錄電子保固。" />
        </div>
      </section>
    </>
  );
}

function ServiceNote({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof CircleHelp;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-olive-100 text-olive-700">
        <Icon size={20} />
      </span>
      <div>
        <h2 className="text-sm font-black">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-ink/50">{text}</p>
      </div>
    </div>
  );
}
