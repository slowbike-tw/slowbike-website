"use client";

import { useEffect, useState } from "react";
import { useMemberAuth } from "@/components/member/auth-provider";
import { EmptyState, ErrorState, LoadingState } from "@/components/member/member-orders";
import { fetchMemberLogisticsOrders } from "@/lib/logistics-repository";
import type { LogisticsOrder } from "@/types/logistics";

export function MemberLogistics() {
  const { user, session } = useMemberAuth();
  const [orders, setOrders] = useState<LogisticsOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !session) return;
    let active = true;
    fetchMemberLogisticsOrders(user.id, session.access_token)
      .then((items) => active && setOrders(items))
      .catch(() => active && setError("物流資料讀取失敗，請稍後再試。"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [user, session]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (orders.length === 0) return <EmptyState title="目前沒有物流資料" text="付款完成並建立物流單後，進度會顯示在這裡。" />;

  return <div className="grid gap-4">{orders.map((order) => {
    const isProductProcurement = order.product.type === "一般商品代購" || order.product.type === "特殊商品代購";
    return <article key={order.id} className="rounded-3xl border border-black/10 bg-white p-5 sm:p-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div><p className="text-xs font-black tracking-[0.12em] text-olive-600">{order.orderNumber}</p><h2 className="mt-2 text-xl font-black">{order.product.name} {order.product.color}</h2><p className="mt-2 text-sm text-ink/45">{order.product.specification}</p></div>
        <span className="self-start rounded-full bg-olive-700 px-4 py-2 text-xs font-black text-white">{order.logisticsStatus}</span>
      </div>
      <div className={`mt-5 grid gap-3 border-t border-black/10 pt-5 text-sm ${isProductProcurement ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
        {!isProductProcurement && <Info label="組裝" value={`${order.assemblyMethod}・${order.assemblyStatus}`} />}
        {!isProductProcurement && <Info label="交車" value={`${order.deliveryMethod}・${order.deliveryStatus}`} />}
        {isProductProcurement && <Info label="配送狀態" value={order.logisticsStatus} />}
        <Info label="最後更新" value={new Date(order.updatedAt).toLocaleString("zh-TW")} />
      </div>
      {order.packages.length > 0 && <div className="mt-5 grid gap-2">{order.packages.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl bg-sand px-4 py-3 text-sm"><span className="font-black">{item.name}</span><span className="text-right text-ink/55">{item.status}{item.trackingNumber ? `・${item.trackingNumber}` : ""}</span></div>)}</div>}
    </article>;
  })}</div>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-sand px-4 py-3"><span className="block text-xs font-bold text-ink/35">{label}</span><strong className="mt-1 block">{value}</strong></div>;
}
