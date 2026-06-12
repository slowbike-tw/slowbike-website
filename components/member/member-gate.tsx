"use client";

import { LoaderCircle, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useMemberAuth } from "@/components/member/auth-provider";

export function MemberGate({ children }: { children: React.ReactNode }) {
  const { user, ready } = useMemberAuth();

  if (!ready) {
    return (
      <div className="grid min-h-64 place-items-center">
        <LoaderCircle className="animate-spin text-olive-700" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-[2rem] border border-black/10 bg-white p-8 text-center sm:p-12">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-olive-100 text-olive-700">
          <LockKeyhole size={23} />
        </span>
        <h1 className="mt-6 text-2xl font-black">請先登入 SlowBike 會員</h1>
        <p className="mt-3 text-sm leading-7 text-ink/50">
          使用 Email 一次性驗證登入後，即可查看你的訂單與物流進度。
        </p>
        <Link
          href="/account"
          className="mt-7 inline-flex min-h-12 items-center rounded-full bg-ink px-6 text-sm font-black text-white"
        >
          前往登入
        </Link>
      </div>
    );
  }

  return children;
}
