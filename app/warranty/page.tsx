import type { Metadata } from "next";
import { CalendarCheck, FileCheck2, ScanLine, Wrench } from "lucide-react";
import { PageHero } from "@/components/ui";

export const metadata: Metadata = { title: "電子保固" };

const steps = [
  { icon: ScanLine, title: "登錄車身資料", text: "輸入車架序號、電池序號與購買資訊。" },
  { icon: FileCheck2, title: "啟用電子保固", text: "資料審核後建立專屬電子保固憑證。" },
  { icon: CalendarCheck, title: "查詢保固期限", text: "會員中心隨時查看保固狀態與期限。" },
  { icon: Wrench, title: "累積服務紀錄", text: "保養、檢查與維修資訊集中保存。" },
];

export default function WarrantyPage() {
  return (
    <>
      <PageHero
        eyebrow="E-WARRANTY"
        title="電子保固，陪車主騎得更安心"
        description="電子保固目前為資料與頁面預留階段，未來將與會員、訂單及門市服務紀錄串接。"
      />
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <article key={title} className="rounded-3xl border border-black/10 bg-white p-7">
                <div className="flex items-center justify-between">
                  <Icon size={24} className="text-olive-700" />
                  <span className="text-[10px] font-black tracking-[0.2em] text-ink/25">0{index + 1}</span>
                </div>
                <h2 className="mt-10 text-lg font-black">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-ink/50">{text}</p>
              </article>
            ))}
          </div>
          <div className="mt-10 rounded-[2rem] bg-sand p-7 sm:p-10">
            <p className="text-xs font-black tracking-[0.22em] text-olive-600">V1 RESERVED</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">系統預留內容</h2>
            <div className="mt-7 grid gap-3 text-sm font-bold text-ink/60 sm:grid-cols-2">
              {["車架與電池序號", "購買與啟用日期", "保固狀態與期限", "門市保養維修紀錄"].map((item) => (
                <div key={item} className="rounded-2xl bg-white px-5 py-4">{item}</div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
