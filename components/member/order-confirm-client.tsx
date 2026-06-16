"use client";

import { CheckCircle2, LoaderCircle, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchOrderDraftByToken } from "@/lib/order-draft-repository";
import type { OrderDraft } from "@/types/order-draft";

function formatPrice(value: number) {
  return `NT$${value.toLocaleString("zh-TW")}`;
}

export function OrderConfirmClient({ token }: { token: string }) {
  const [draft, setDraft] = useState<OrderDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrderDraftByToken(token)
      .then((rows) => setDraft(rows[0] ?? null))
      .catch(() =>
        setError("付款連結讀取失敗，請稍後再試或聯繫 SlowBike。"),
      )
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="grid min-h-64 place-items-center">
        <LoaderCircle className="animate-spin text-olive-700" />
      </div>
    );
  }

  if (error) return <Message title="無法讀取訂單" text={error} />;
  if (!draft) {
    return (
      <Message
        title="找不到這筆訂單"
        text="請確認付款連結是否正確，或聯繫 SlowBike 協助處理。"
      />
    );
  }

  return (
    <div className="rounded-[2rem] border border-black/10 bg-white p-6 sm:p-9">
      <p className="text-xs font-black tracking-[0.18em] text-olive-600">
        {draft.draft_no}
      </p>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">確認 SlowBike 訂單</h1>
          <p className="mt-2 text-sm font-bold text-ink/45">
            請確認車款與金額，下一步即可選擇付款方式。
          </p>
        </div>
        <span className="rounded-full bg-sand px-4 py-2 text-xs font-black">
          待付款
        </span>
      </div>

      <div className="mt-6 rounded-2xl bg-olive-50 p-5 text-sm font-bold leading-7 text-olive-900">
        <CheckCircle2 className="mb-2" />
        此連結可直接完成付款。付款成功後，系統會建立訂單與物流資料；日後使用相同 Email
        登入會員中心，即可查看訂單與物流進度。
      </div>

      <div className="mt-7 grid gap-3">
        {draft.items.map((item, index) => (
          <div
            key={`${item.productName}-${index}`}
            className="rounded-2xl bg-sand p-5"
          >
            <strong>{item.productName}</strong>
            <p className="mt-2 text-sm text-ink/50">
              {[item.specification, item.color].filter(Boolean).join(" / ")}
            </p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="font-bold text-ink/45">數量 {item.quantity}</span>
              <strong>{formatPrice(item.unitPrice * item.quantity)}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-end justify-between border-t border-black/10 pt-6">
        <span className="text-sm text-ink/50">付款金額</span>
        <strong className="text-2xl">{formatPrice(draft.total)}</strong>
      </div>

      <Link
        href={`/checkout?draft=${encodeURIComponent(token)}`}
        className="mt-7 flex min-h-14 w-full items-center justify-center rounded-full bg-olive-700 px-6 text-sm font-black text-white"
      >
        前往付款
      </Link>
    </div>
  );
}

function Message({
  icon: Icon = LockKeyhole,
  title,
  text,
  children,
}: {
  icon?: typeof LockKeyhole;
  title: string;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-[2rem] bg-white p-8 text-center sm:p-12">
      <Icon className="mx-auto text-olive-700" />
      <h1 className="mt-5 text-2xl font-black">{title}</h1>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-ink/50">
        {text}
      </p>
      {children}
    </div>
  );
}
