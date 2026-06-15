"use client";

import { LoaderCircle, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { useMemberAuth } from "@/components/member/auth-provider";
import { fetchMemberOrders } from "@/lib/member-repository";
import { fetchMemberOrderDrafts } from "@/lib/order-draft-repository";
import type { MemberOrderRow } from "@/types/member";
import type { OrderDraft } from "@/types/order-draft";

const orderStatusLabels: Record<string, string> = {
  inquiry: "訂單確認中",
  confirmed: "訂單已確認",
  "deposit-paid": "已付訂金",
  preparing: "備貨中",
  ready: "可交車",
  completed: "已完成",
  cancelled: "已取消",
};

export function MemberOrders() {
  const { user, session } = useMemberAuth();
  const [orders, setOrders] = useState<MemberOrderRow[]>([]);
  const [drafts, setDrafts] = useState<OrderDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !session) return;
    let active = true;
    setLoading(true);
    Promise.all([
      fetchMemberOrders(user.id, session.access_token),
      fetchMemberOrderDrafts(user.id, session.access_token),
    ])
      .then(([items, claimedDrafts]) => {
        if (active) {
          setOrders(items);
          setDrafts(claimedDrafts);
        }
      })
      .catch(() => {
        if (active) {
          setError("訂單資料表尚未啟用，請先執行第 4 階段會員系統 SQL。");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, session]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (orders.length === 0 && drafts.length === 0) {
    return (
      <EmptyState
        title="目前沒有會員訂單"
        text="未來從購物車完成結帳後，訂單會自動綁定你的會員 ID 並顯示在這裡。"
      />
    );
  }

  return (
    <div className="grid gap-4">
      {drafts.map((draft) => (
        <article
          key={draft.id}
          className="rounded-3xl border border-olive-200 bg-olive-50 p-5 sm:p-7"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            <div>
              <p className="text-xs font-black tracking-[0.12em] text-olive-700">
                {draft.draft_no}
              </p>
              <h2 className="mt-2 text-xl font-black">
                {draft.items.map((item) => item.productName).join("、")}
              </h2>
              <p className="mt-2 text-sm text-ink/45">
                已綁定會員，等待付款
              </p>
            </div>
            <span className="self-start rounded-full bg-olive-700 px-4 py-2 text-xs font-black text-white">
              待付款
            </span>
          </div>
          <div className="mt-5 flex justify-end border-t border-olive-200 pt-5">
            <strong className="text-lg">
              NT${draft.total.toLocaleString("zh-TW")}
            </strong>
          </div>
        </article>
      ))}
      {orders.map((order) => (
        <article
          key={order.id}
          className="rounded-3xl border border-black/10 bg-white p-5 sm:p-7"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            <div>
              <p className="text-xs font-black tracking-[0.12em] text-olive-600">
                {order.order_no}
              </p>
              <h2 className="mt-2 text-xl font-black">
                {order.items.map((item) => item.productName).filter(Boolean).join("、") ||
                  "SlowBike 訂單"}
              </h2>
              <p className="mt-2 text-sm text-ink/45">
                {new Date(order.created_at).toLocaleDateString("zh-TW")}
              </p>
            </div>
            <span className="self-start rounded-full bg-olive-100 px-4 py-2 text-xs font-black text-olive-800">
              {order.payment_status === "paid"
                ? "已付款"
                : order.payment_status === "awaiting_transfer"
                  ? "待確認匯款"
                  : orderStatusLabels[order.order_status] ?? order.order_status}
            </span>
          </div>
          <div className="mt-5 flex items-end justify-between border-t border-black/10 pt-5">
            <span className="text-sm text-ink/45">
              共 {order.items.reduce((sum, item) => sum + (item.quantity ?? 0), 0)} 件
            </span>
            <strong className="text-lg">
              NT${order.total.toLocaleString("zh-TW")}
            </strong>
          </div>
        </article>
      ))}
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="grid min-h-48 place-items-center rounded-3xl bg-white">
      <LoaderCircle className="animate-spin text-olive-700" />
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-amber-300 bg-amber-50 p-6 text-sm font-bold text-amber-900">
      {message}
    </div>
  );
}

export function EmptyState({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[2rem] border border-dashed border-black/15 bg-white p-9 text-center sm:p-12">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-olive-100 text-olive-700">
        <Package size={23} />
      </span>
      <h2 className="mt-6 text-xl font-black">{title}</h2>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-ink/50">{text}</p>
    </div>
  );
}
