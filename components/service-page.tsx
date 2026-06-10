import type { LucideIcon } from "lucide-react";
import { MessageCircle } from "lucide-react";
import { CheckList, LinkButton, PageHero, SectionHeading } from "@/components/ui";

export function ServicePage({
  eyebrow,
  title,
  description,
  sectionTitle,
  sectionDescription,
  items,
  steps,
  icon: Icon,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  sectionTitle: string;
  sectionDescription: string;
  items: string[];
  steps: { number: string; title: string; text: string }[];
  icon: LucideIcon;
  action: string;
}) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} description={description}>
        <LinkButton href="/contact" variant="light">{action}</LinkButton>
      </PageHero>
      <section className="py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <SectionHeading eyebrow="WHAT WE DO" title={sectionTitle} description={sectionDescription} />
            <div className="mt-8">
              <CheckList items={items} />
            </div>
          </div>
          <div className="relative min-h-[380px] overflow-hidden rounded-[2rem] bg-olive-700 p-8 text-white">
            <div className="absolute -bottom-28 -right-24 size-80 rounded-full border border-white/15" />
            <div className="absolute bottom-14 right-10 size-48 rounded-full border border-white/15" />
            <Icon size={48} strokeWidth={1.3} />
            <p className="absolute bottom-8 left-8 max-w-xs text-4xl font-black leading-tight tracking-[-0.05em]">
              專業處理，<br />放心交給 SlowBike
            </p>
          </div>
        </div>
      </section>
      <section className="bg-sand py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading eyebrow="PROCESS" title="簡單三步，開始進行" />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map((step) => (
              <article key={step.number} className="rounded-3xl bg-white p-7">
                <span className="text-xs font-black tracking-[0.2em] text-olive-500">{step.number}</span>
                <h3 className="mt-8 text-xl font-black">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-ink/55">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-olive-500 px-5 py-16 text-center text-white">
        <MessageCircle className="mx-auto" size={32} />
        <h2 className="mt-5 text-3xl font-black tracking-[-0.04em]">{action}</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/65">加入 LINE，提供需求與參考資料，我們會協助你評估。</p>
        <div className="mt-7"><LinkButton href="/contact" variant="light">開始 LINE 諮詢</LinkButton></div>
      </section>
    </>
  );
}
