import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountClient } from "@/components/member/account-client";
import { PageHero } from "@/components/ui";

export const metadata: Metadata = { title: "會員中心" };

export default function AccountPage() {
  return (
    <>
      <PageHero
        eyebrow="SLOWBIKE MEMBER"
        title="一個會員 ID，串起每一段旅程"
        description="使用 Email 一次性驗證登入，集中查看你的訂單、物流與電子保固。"
      />
      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <Suspense>
            <AccountClient />
          </Suspense>
        </div>
      </section>
    </>
  );
}
