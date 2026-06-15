"use client";

import { CheckCircle2, LoaderCircle, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useMemberAuth } from "@/components/member/auth-provider";
import {
  claimOrderDraft,
  fetchOrderDraftByToken,
} from "@/lib/order-draft-repository";
import type { OrderDraft } from "@/types/order-draft";

export function OrderConfirmClient({ token }: { token: string }) {
  const { user, session, ready } = useMemberAuth();
  const [draft, setDraft] = useState<OrderDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrderDraftByToken(token)
      .then((rows) => setDraft(rows[0] ?? null))
      .catch(() => setError("確認網址無效、已過期或資料表尚未完成設定。"))
      .finally(() => setLoading(false));
  }, [token]);

  if (!ready || loading) {
    return (
      <div className="grid min-h-64 place-items-center">
        <LoaderCircle className="animate-spin text-olive-700" />
      </div>
    );
  }
  if (error) return <Message title="無法開啟訂單草稿" text={error} />;
  if (!draft) {
    return (
      <Message
        title="找不到訂單草稿"
        text="請向 SlowBike 工作人員索取新的客戶確認網址。"
      />
    );
  }

  if (!user || !session) {
    const returnUrl = `/checkout/draft/${token}`;
    return (
      <Message
        icon={LockKeyhole}
        title="請先登入或註冊會員"
        text="登入 Email 或手機必須與 SlowBike 建立草稿時填寫的聯絡資料相同，才能自動綁定這筆訂單。"
      >
        <Link
          href={`/account?next=${encodeURIComponent(returnUrl)}`}
          className="mt-6 inline-flex min-h-12 items-center rounded-full bg-ink px-6 text-sm font-black text-white"
        >
          前往 Email OTP 登入
        </Link>
      </Message>
    );
  }

  const alreadyClaimed = draft.auth_user_id === user.id;
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
          <h1 className="text-3xl font-black">確認你的 SlowBike 訂單</h1>
          <p className="mt-2 text-sm font-bold text-ink/45">
            {draft.business_type}・{draft.product_summary}
          </p>
        </div>
        <span className="rounded-full bg-sand px-4 py-2 text-xs font-black">
          {alreadyClaimed ? "待付款" : "待客戶確認"}
        </span>
      </div>

      <div className="mt-7 grid gap-3">
        {draft.items.map((item, index) => (
          <div
            key={`${item.productName}-${index}`}
            className="rounded-2xl bg-sand p-5"
          >
            <strong>{item.productName}</strong>
            <p className="mt-2 text-sm text-ink/50">
              {[item.specification, item.color].filter(Boolean).join("・")}
              {`・數量 ${item.quantity}`}
            </p>
            {item.accessories && item.accessories.length > 0 && (
              <p className="mt-2 text-xs text-ink/45">
                配件：{item.accessories.join("、")}
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
          label="組裝"
          value={[draft.assembly_method, draft.assembly_store]
            .filter(Boolean)
            .join("・")}
        />
        <Info label="收件地址" value={draft.shipping_address} />
        <Info label="備註" value={draft.notes} />
      </div>

      <div className="mt-6 flex items-end justify-between border-t border-black/10 pt-6">
        <span className="text-sm text-ink/50">訂單總額</span>
        <strong className="text-2xl">
          NT${draft.total.toLocaleString("zh-TW")}
        </strong>
      </div>

      {alreadyClaimed ? (
        <div className="mt-7 rounded-2xl bg-olive-50 p-5 text-sm font-bold text-olive-800">
          <CheckCircle2 className="mb-2" />
          此訂單已綁定你的會員 ID，狀態為待付款。
        </div>
      ) : (
        <button
          type="button"
          disabled={claiming}
          onClick={async () => {
            setClaiming(true);
            setError("");
            try {
              const rows = await claimOrderDraft(token, session.access_token);
              setDraft(rows[0] ?? draft);
            } catch (claimError) {
              setError(
                claimError instanceof Error
                  ? claimError.message
                  : "訂單確認失敗。",
              );
            } finally {
              setClaiming(false);
            }
          }}
          className="mt-7 min-h-14 w-full rounded-full bg-olive-700 px-6 text-sm font-black text-white disabled:opacity-50"
        >
          {claiming ? "確認中..." : "確認訂單並綁定會員"}
        </button>
      )}
      {error && <p className="mt-4 text-sm font-bold text-red-700">{error}</p>}
      <p className="mt-5 rounded-2xl bg-sand p-4 text-center text-sm font-black text-ink/55">
        付款功能下一階段開放
      </p>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <span className="block text-xs font-bold text-ink/35">{label}</span>
      <strong className="mt-1 block">{value || "未填"}</strong>
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
