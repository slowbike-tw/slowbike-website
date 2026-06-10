import type { Metadata } from "next";
import { BikePlaceholder, PageHero } from "@/components/ui";
import { bikes } from "@/lib/site-data";

export const metadata: Metadata = { title: "標準車系" };

export default function BikesPage() {
  return (
    <>
      <PageHero
        eyebrow="STANDARD SERIES"
        title="找到符合你生活節奏的車"
        description="六種使用情境，從折疊收納、舒適巡航到專業外送，先從你每天怎麼移動開始選。"
      />
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            {bikes.map((bike) => (
              <article key={bike.name} className="overflow-hidden rounded-[2rem] border border-black/10 bg-white">
                <div className={`h-72 bg-gradient-to-br sm:h-80 ${bike.tone}`}>
                  <BikePlaceholder name={bike.name} mark={bike.mark} />
                </div>
                <div className="p-7 sm:p-9">
                  <p className="text-[10px] font-black tracking-[0.2em] text-olive-600">{bike.tag}</p>
                  <h2 className="mt-2 text-3xl font-black tracking-[-0.05em]">{bike.name}</h2>
                  <p className="mt-3 font-bold text-ink/60">{bike.slogan}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {bike.uses.map((use) => (
                      <span key={use} className="rounded-full bg-sand px-4 py-2 text-xs font-bold text-ink/65">{use}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
