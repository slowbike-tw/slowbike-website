import type { Metadata } from "next";
import { CircleHelp, ShieldCheck, Truck } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { PageHero } from "@/components/ui";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "商品系列",
  description: "探索 SlowBike FOLD、S1、NOMA、MINI 四款正式車系。",
};

export default function ProductsPage() {
  return (
    <>
      <PageHero
        eyebrow="SLOWBIKE COLLECTION"
        title="找到適合你的電動腳踏車"
        description="比較車款版本、售價、車色與配件，找到最適合你的選擇。"
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
          <ServiceNote icon={Truck} title="交車安排" text="下單後安排製作與交車，依實際排程通知。" />
          <ServiceNote icon={ShieldCheck} title="一年保固" text="車架、控制器與電池皆提供一年保固。" />
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
