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
      .catch(() => setError("確認連結無效、已過期或資料表尚未啟用。"))
      .finally(() => setLoading(false));
  }, [token]);

  if (!ready || loading) {
    return <div className="grid min-h-64 place-items-center"><LoaderCircle className="animate-spin text-olive-700" /></div>;
  }
  if (error) return <Message title="無法開啟訂單草稿" text={error} />;
  if (!draft) return <Message title="找不到訂單草稿" text="請向 SlowBike 工作人員索取新的確認連結。" />;

  if (!user || !session) {
    const returnUrl = `/order-confirm/${token}`;
    return (
      <Message
        icon={LockKeyhole}
        title="請先登入後確認訂單"
        text="登入 Email 或手機必須與 SlowBike 建立草稿時填寫的聯絡資料相同。"
      >
        <Link href={`/account?next=${encodeURIComponent(returnUrl)}`} className="mt-6 inline-flex min-h-12 items-center rounded-full bg-ink px-6 text-sm font-black text-white">前往 Email OTP 登入</Link>
      </Message>
    );
  }

  const alreadyClaimed = draft.auth_user_id === user.id;
  return (
    <div className="rounded-[2rem] border border-black/10 bg-white p-6 sm:p-9">
      <p className="text-xs font-black tracking-[0.18em] text-olive-600">{draft.draft_no}</p>
      <h1 className="mt-3 text-3xl font-black">確認你的 SlowBike 訂單</h1>
      <div className="mt-7 grid gap-3">
        {draft.items.map((item, index) => (
          <div key={`${item.productName}-${index}`} className="rounded-2xl bg-sand p-5">
            <strong>{item.productName}</strong>
            <p className="mt-2 text-sm text-ink/50">{item.specification} {item.color}・數量 {item.quantity}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-end justify-between border-t border-black/10 pt-6">
        <span className="text-sm text-ink/50">訂單總額</span>
        <strong className="text-2xl">NT${draft.total.toLocaleString("zh-TW")}</strong>
      </div>

      {alreadyClaimed ? (
        <div className="mt-7 rounded-2xl bg-olive-50 p-5 text-sm font-bold text-olive-800">
          <CheckCircle2 className="mb-2" />
          此訂單已綁定你的會員 ID，目前等待付款功能上線。
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
              setError(claimError instanceof Error ? claimError.message : "訂單認領失敗。");
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
      <p className="mt-5 text-xs leading-6 text-ink/40">本階段不建立付款請求。付款成功後建立正式訂單、物流單與保固卡的流程已在資料模型中預留。</p>
    </div>
  );
}

function Message({ icon: Icon = LockKeyhole, title, text, children }: { icon?: typeof LockKeyhole; title: string; text: string; children?: React.ReactNode }) {
  return <div className="rounded-[2rem] bg-white p-8 text-center sm:p-12"><Icon className="mx-auto text-olive-700" /><h1 className="mt-5 text-2xl font-black">{title}</h1><p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-ink/50">{text}</p>{children}</div>;
}
