"use client";

import { CheckCircle2, LoaderCircle, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchOrderDraftByToken } from "@/lib/order-draft-repository";
import type { OrderDraft } from "@/types/order-draft";

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

  const visibleDetails = Object.entries(draft.custom_details ?? {}).filter(
    ([, value]) =>
      value !== "" &&
      value !== false &&
      (!Array.isArray(value) || value.length > 0),
  );

  return (
    <div className="rounded-[2rem] border border-black/10 bg-white p-6 sm:p-9">
      <p className="text-xs font-black tracking-[0.18em] text-olive-600">
        {draft.draft_no}
      </p>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">確認 SlowBike 訂單</h1>
          <p className="mt-2 text-sm font-bold text-ink/45">
            {draft.business_type}｜{draft.product_summary}
          </p>
        </div>
        <span className="rounded-full bg-sand px-4 py-2 text-xs font-black">
          待付款
        </span>
      </div>

      <div className="mt-6 rounded-2xl bg-olive-50 p-5 text-sm font-bold leading-7 text-olive-900">
        <CheckCircle2 className="mb-2" />
        此連結可直接確認訂單並付款，不需要先登入會員。付款成功後，系統會建立訂單與物流資料；之後使用同一組 Email
        登入會員中心，就能查看我的訂單與物流。
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
              {`｜數量 ${item.quantity}`}
            </p>
            {item.accessories && item.accessories.length > 0 && (
              <p className="mt-2 text-xs text-ink/45">
                加購：{item.accessories.join("、")}
              </p>
            )}
          </div>
        ))}
      </div>

      {visibleDetails.length > 0 && (
        <dl className="mt-5 grid gap-3 rounded-2xl border border-black/10 p-5 sm:grid-cols-2">
          {visibleDetails.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-bold text-ink/35">{label}</dt>
              <dd className="mt-1 break-words text-sm font-black">
                {Array.isArray(value)
                  ? value.join("、")
                  : typeof value === "boolean"
                    ? "是"
                    : String(value)}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-6 grid gap-3 rounded-2xl bg-[#f8f7f2] p-5 text-sm sm:grid-cols-2">
        <Info label="交車方式" value={draft.delivery_method} />
        <Info
          label="組裝安排"
          value={[draft.assembly_method, draft.assembly_store]
            .filter(Boolean)
            .join(" / ")}
        />
        <Info label="收件地址" value={draft.shipping_address} />
        <Info label="備註" value={draft.notes} />
      </div>

      <div className="mt-6 flex items-end justify-between border-t border-black/10 pt-6">
        <span className="text-sm text-ink/50">訂單金額</span>
        <strong className="text-2xl">
          NT${draft.total.toLocaleString("zh-TW")}
        </strong>
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

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <span className="block text-xs font-bold text-ink/35">{label}</span>
      <strong className="mt-1 block">{value || "未填寫"}</strong>
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
