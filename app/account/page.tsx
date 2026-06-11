import type { Metadata } from "next";
import { ArrowRight, LockKeyhole, Package, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { PageHero } from "@/components/ui";

export const metadata: Metadata = { title: "會員中心" };

export default function AccountPage() {
  return (
    <>
      <PageHero
        eyebrow="SLOWBIKE MEMBER"
        title="你的車，與每一段紀錄"
        description="會員系統 V1 頁面框架已建立，未來將串接 Supabase Auth、訂單與電子保固資料。"
      />
      <section className="py-20 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div className="rounded-[2rem] border border-black/10 bg-white p-7 sm:p-9">
            <span className="grid size-12 place-items-center rounded-full bg-olive-100 text-olive-700">
              <UserRound size={22} />
            </span>
            <h1 className="mt-7 text-3xl font-black tracking-[-0.04em]">會員登入</h1>
            <p className="mt-3 text-sm leading-7 text-ink/50">登入功能將於 Supabase 串接階段開放。</p>
            <div className="mt-7 grid gap-4">
              <label className="grid gap-2 text-xs font-black text-ink/55">
                電子郵件
                <input
                  type="email"
                  disabled
                  placeholder="name@example.com"
                  className="h-14 rounded-2xl border border-black/10 bg-sand px-4 text-sm outline-none"
                />
              </label>
              <label className="grid gap-2 text-xs font-black text-ink/55">
                密碼
                <input
                  type="password"
                  disabled
                  placeholder="••••••••"
                  className="h-14 rounded-2xl border border-black/10 bg-sand px-4 text-sm outline-none"
                />
              </label>
              <button type="button" disabled className="mt-2 min-h-14 rounded-full bg-ink/30 text-sm font-black text-white">
                會員功能準備中
              </button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <MemberFeature icon={Package} title="訂單紀錄" text="查看購車需求、付款與交車進度。" />
            <MemberFeature icon={ShieldCheck} title="電子保固" text="管理車架序號、保固期限與維修紀錄。" />
            <MemberFeature icon={UserRound} title="會員資料" text="保存聯絡方式與常用交車資訊。" />
            <MemberFeature icon={LockKeyhole} title="安全登入" text="預計採 Supabase Auth 管理會員驗證。" />
            <Link
              href="/warranty"
              className="flex items-center justify-between rounded-3xl bg-olive-700 p-7 text-white sm:col-span-2"
            >
              <div>
                <p className="text-xs font-black tracking-[0.18em] text-white/45">WARRANTY</p>
                <p className="mt-2 text-xl font-black">查看電子保固系統規劃</p>
              </div>
              <ArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function MemberFeature({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Package;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-3xl bg-sand p-7">
      <Icon size={23} className="text-olive-700" />
      <h2 className="mt-8 text-lg font-black">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-ink/50">{text}</p>
    </article>
  );
}
