import type { Metadata } from "next";
import { CircleHelp, ShieldCheck, Truck } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { PageHero } from "@/components/ui";
import { getStoreProducts } from "@/lib/product-cms";

export const metadata: Metadata = {
  title: "商品系列",
  description: "瀏覽 SlowBike 電動腳踏車商品系列。",
};

export default async function ProductsPage() {
  const products = await getStoreProducts();
  return (
    <>
      <PageHero
        eyebrow="SLOWBIKE COLLECTION"
        title="找到適合你的電動腳踏車"
        description="通勤、旅行、購物與日常代步，選一台真正符合生活節奏的車。"
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
          <ServiceNote icon={CircleHelp} title="專人選車" text="依照身高、用途與預算協助挑選。" />
          <ServiceNote icon={Truck} title="配送交車" text="可選門市交車或宅配到府。" />
          <ServiceNote icon={ShieldCheck} title="售後支援" text="購買後可由 SlowBike 協助保養與維修安排。" />
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
