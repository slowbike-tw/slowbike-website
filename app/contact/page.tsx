import type { Metadata } from "next";
import { Clock3, Instagram, MapPin, MessageCircle, Phone } from "lucide-react";
import { LinkButton, PageHero, SectionHeading } from "@/components/ui";

export const metadata: Metadata = { title: "聯絡我們" };

const locations = [
  { name: "恆春門市", note: "屏東地區賞車、諮詢與交車服務" },
  { name: "龜山門市", note: "桃園地區賞車、諮詢與交車服務" },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="CONTACT US"
        title="一起找到適合你的下一台車"
        description="不確定車款、想討論客製，或有代購與運輸需求，歡迎透過 LINE 聯絡我們。"
      >
        <LinkButton href="#" variant="light">加入 LINE 官方帳號</LinkButton>
      </PageHero>
      <section className="py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <SectionHeading
              eyebrow="LET'S TALK"
              title="告訴我們你的需求"
              description="為了更快協助你，建議提供用途、身高、預算、喜歡的車型或商品連結。"
            />
            <div className="mt-8 grid gap-4">
              <ContactItem icon={MessageCircle} title="LINE 官方帳號" text="@slowbike（示意）" />
              <ContactItem icon={Phone} title="服務電話" text="電話資訊準備中" />
              <ContactItem icon={Instagram} title="Instagram" text="@slowbike.tw（示意）" />
              <ContactItem icon={Clock3} title="服務時間" text="請先透過 LINE 預約" />
            </div>
          </div>
          <div className="grid gap-5">
            {locations.map((location, index) => (
              <article key={location.name} className={`${index === 0 ? "bg-olive-700 text-white" : "bg-sand text-ink"} rounded-[2rem] p-8 sm:p-10`}>
                <div className="flex items-center justify-between">
                  <MapPin size={30} />
                  <span className={`text-[10px] font-black tracking-[0.22em] ${index === 0 ? "text-white/40" : "text-olive-600"}`}>
                    STORE 0{index + 1}
                  </span>
                </div>
                <h2 className="mt-14 text-3xl font-black tracking-[-0.05em]">{location.name}</h2>
                <p className={`mt-3 text-sm leading-7 ${index === 0 ? "text-white/60" : "text-ink/55"}`}>{location.note}</p>
                <p className={`mt-7 border-t pt-5 text-xs font-bold ${index === 0 ? "border-white/15 text-white/45" : "border-black/10 text-ink/40"}`}>
                  詳細地址與營業時間請透過 LINE 確認
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function ContactItem({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof MessageCircle;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-4 border-b border-black/10 pb-4">
      <span className="grid size-10 place-items-center rounded-full bg-olive-100 text-olive-700"><Icon size={18} /></span>
      <div>
        <p className="text-sm font-black">{title}</p>
        <p className="mt-1 text-xs text-ink/45">{text}</p>
      </div>
    </div>
  );
}
