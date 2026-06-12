import {
  ArrowDown,
  ArrowRight,
  Bike,
  CreditCard,
  MapPin,
  MessageCircle,
  Route,
  Sparkles,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ProductVisual } from "@/components/product-visual";
import { BikePlaceholder, CheckList, LinkButton, SectionHeading } from "@/components/ui";
import {
  bikes,
  deliveryItems,
  paymentItems,
  serviceCards,
  trustItems,
} from "@/lib/site-data";
import { homeCatalogCopy } from "@/lib/products";

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#e9e7dd]">
        <div className="mx-auto grid min-h-[calc(100svh-5rem)] max-w-7xl items-center gap-10 px-5 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-20">
          <div className="relative z-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white/40 px-4 py-2 text-[11px] font-black tracking-[0.2em] text-olive-700 backdrop-blur">
              <Sparkles size={14} />
              MOVE YOUR WAY
            </p>
            <h1 className="text-balance mt-7 text-5xl font-black leading-[1.03] tracking-[-0.06em] text-ink sm:text-6xl lg:text-7xl xl:text-[5.4rem]">
              找到適合你的
              <span className="block text-olive-600">電動腳踏車</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-ink/65 sm:text-lg">
              通勤、購物、外送、露營、慢生活，一台適合你的電動腳踏車。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/bikes">立即選車</LinkButton>
              <LinkButton href="/custom" variant="outline">客製化電動車</LinkButton>
            </div>
            <div className="mt-10 flex items-center gap-3 text-xs font-bold text-ink/45">
              <ArrowDown size={16} />
              往下探索 SlowBike
            </div>
          </div>

          <div className="relative min-h-[390px] lg:min-h-[600px]">
            <div className="absolute left-[8%] top-[10%] size-[82%] rounded-full bg-olive-600" />
            <div className="absolute left-[18%] top-[19%] size-[63%] rounded-full border border-white/35" />
            <div className="absolute inset-x-0 bottom-[9%] mx-auto h-[66%] w-[92%] -rotate-2 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#31372b] via-[#171b16] to-black shadow-soft sm:w-[84%] lg:bottom-[4%]">
              <BikePlaceholder name="FOLD" mark="FEATURED / 01" />
            </div>
            <div className="absolute bottom-[3%] left-0 rounded-2xl bg-white px-5 py-4 shadow-soft lg:bottom-[2%]">
              <p className="text-[10px] font-black tracking-[0.2em] text-olive-600">主力推薦</p>
              <p className="mt-1 text-sm font-black">通勤 × 休閒 × 收納</p>
            </div>
          </div>
        </div>
      </section>

      <section id="bikes" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
            <SectionHeading
              eyebrow="STANDARD SERIES"
              title={homeCatalogCopy?.title ?? "四種生活，一台剛剛好的車"}
              description={
                homeCatalogCopy?.description ??
                "從每日通勤到週末旅行，依照你的使用情境選擇最合適的車款。"
              }
            />
            <Link href="/bikes" className="inline-flex items-center gap-2 text-sm font-black text-olive-700">
              查看全部車款 <ArrowRight size={17} />
            </Link>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {bikes.map((bike) => (
              <Link
                key={bike.name}
                href={bike.href}
                className="group overflow-hidden rounded-[1.75rem] border border-black/10 bg-white transition hover:-translate-y-1 hover:shadow-soft"
                aria-label={`查看 ${bike.name} 商品詳情`}
              >
                <article>
                  <div className={`h-64 bg-gradient-to-br ${bike.tone}`}>
                    <ProductVisual
                      name={bike.name}
                      series={bike.seriesLabel}
                      image={bike.image}
                      tone={bike.visualTone}
                      compact
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-black tracking-[0.14em] text-olive-600">{bike.seriesLabel}</span>
                        <h3 className="mt-2 text-2xl font-black tracking-[-0.04em]">{bike.lifestyle}</h3>
                      </div>
                      <span className="grid size-10 place-items-center rounded-full bg-olive-50 text-olive-700 transition group-hover:bg-olive-700 group-hover:text-white">
                        <ArrowRight size={18} />
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-bold text-ink/65">{bike.slogan}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {bike.uses.map((use) => (
                        <span key={use} className="rounded-full bg-sand px-3 py-2 text-xs font-bold text-ink/65">
                          {use}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-olive-900 py-20 text-white lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="WHY SLOWBIKE"
            title="買車之後，我們仍然在"
            description="從付款、交車到售後支援，讓選車與用車都更簡單。"
            light
          />
          <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-white/10 md:grid-cols-3">
            {trustItems.map(({ title, icon: Icon }) => (
              <div key={title} className="bg-olive-900 p-6 sm:p-8">
                <Icon className="text-olive-300" size={25} />
                <p className="mt-5 text-sm font-black sm:text-base">{title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="MORE POSSIBILITIES"
            title="不只賣車，也把想法變成你的車"
            description="客製、代購、跨境運輸，一站處理電動產品的更多可能。"
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {serviceCards.map(({ eyebrow, title, description, items, href, action, icon: Icon }, index) => (
              <article
                key={title}
                className={`flex min-h-[460px] flex-col rounded-[2rem] p-7 sm:p-9 ${
                  index === 0 ? "bg-olive-600 text-white" : index === 1 ? "bg-sand text-ink" : "bg-ink text-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className={`text-[10px] font-black tracking-[0.24em] ${index === 1 ? "text-olive-600" : "text-white/45"}`}>
                    {eyebrow}
                  </p>
                  <Icon size={30} strokeWidth={1.5} />
                </div>
                <h3 className="mt-12 text-3xl font-black tracking-[-0.05em]">{title}</h3>
                <p className={`mt-4 text-sm leading-7 ${index === 1 ? "text-ink/60" : "text-white/60"}`}>{description}</p>
                <div className="mt-7">
                  <CheckList items={items} light={index !== 1} />
                </div>
                <Link
                  href={href}
                  className={`mt-auto flex items-center justify-between border-t pt-6 text-sm font-black ${
                    index === 1 ? "border-black/10" : "border-white/15"
                  }`}
                >
                  {action} <ArrowRight size={18} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-white py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-2 lg:px-8">
          <InfoList icon={<CreditCard />} eyebrow="PAYMENT" title="付款方式" items={paymentItems} />
          <InfoList icon={<Truck />} eyebrow="DELIVERY" title="交車方式" items={deliveryItems} />
        </div>
      </section>

      <section className="overflow-hidden py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-8">
          <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] bg-olive-700 p-8 text-white lg:min-h-[500px]">
            <div className="absolute -bottom-24 -right-20 size-80 rounded-full border border-white/15" />
            <div className="absolute bottom-10 right-10 size-48 rounded-full border border-white/15" />
            <Route size={42} strokeWidth={1.3} />
            <p className="absolute bottom-8 left-8 text-6xl font-black tracking-[-0.07em] opacity-15 sm:text-8xl">
              GO<br />SLOW
            </p>
          </div>
          <div>
            <SectionHeading eyebrow="ABOUT US" title="移動，也是一種生活方式" />
            <div className="mt-7 space-y-5 text-base leading-8 text-ink/65">
              <Logo size="brand" />
              <p>說走就走，及時行樂。</p>
              <p>我們相信，移動不只是從 A 點到 B 點，更是一種生活方式。</p>
              <p>
                無論是通勤、購物、外送、露營旅行，還是海邊吹風、街頭漫遊，每個人都值得擁有一台適合自己的電動腳踏車。
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-5 text-sm font-black text-olive-700">
              <span className="flex items-center gap-2"><MapPin size={17} /> 恆春門市</span>
              <span className="flex items-center gap-2"><MapPin size={17} /> 龜山門市</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-olive-500 px-5 py-16 text-white lg:py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <MessageCircle size={34} />
          <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] sm:text-5xl">不知道哪台適合你？</h2>
          <p className="mt-4 text-white/65">告訴我們你的用途、身高與預算，一起找到最合適的選擇。</p>
          <div className="mt-8">
            <LinkButton href="/contact" variant="light">LINE 免費選車諮詢</LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}

function InfoList({
  icon,
  eyebrow,
  title,
  items,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  items: string[];
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-5 sm:gap-7">
      <span className="grid size-12 place-items-center rounded-full bg-olive-100 text-olive-700">{icon}</span>
      <div>
        <p className="text-[10px] font-black tracking-[0.24em] text-olive-600">{eyebrow}</p>
        <h3 className="mt-2 text-3xl font-black tracking-[-0.04em]">{title}</h3>
        <div className="mt-6 grid gap-3">
          {items.map((item) => (
            <div key={item} className="flex items-center justify-between border-b border-black/10 pb-3 text-sm font-bold text-ink/70">
              {item}
              <span className="size-1.5 rounded-full bg-olive-500" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
