"use client";

import { Check } from "lucide-react";
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
    const progress = getCustomerProgress(order);
    return <article key={order.id} className="rounded-3xl border border-black/10 bg-white p-5 sm:p-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div><p className="text-xs font-black tracking-[0.12em] text-olive-600">{order.orderNumber}</p><h2 className="mt-2 text-xl font-black">{order.product.name} {order.product.color}</h2><p className="mt-2 text-sm text-ink/45">{order.product.specification}</p></div>
        <span className="self-start rounded-full bg-olive-700 px-4 py-2 text-xs font-black text-white">{progress.currentLabel}</span>
      </div>
      <div className="mt-6 border-t border-black/10 pt-6">
        <div className="grid gap-3">
          {progress.steps.map((step, index) => {
            const completed = index < progress.currentIndex || progress.finished;
            const current = index === progress.currentIndex && !progress.finished;
            return (
              <div
                key={step}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
                  current ? "bg-olive-700 text-white" : completed ? "bg-olive-50 text-olive-900" : "bg-sand text-ink/35"
                }`}
              >
                <span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-black ${
                  current ? "bg-white text-olive-700" : completed ? "bg-olive-700 text-white" : "bg-white text-ink/30"
                }`}>
                  {completed ? <Check size={15} strokeWidth={3} /> : index + 1}
                </span>
                <strong className="text-sm">{step}</strong>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-right text-xs text-ink/35">
          最後更新：{new Date(order.updatedAt).toLocaleString("zh-TW")}
        </p>
      </div>
    </article>;
  })}</div>;
}

function getCustomerProgress(order: LogisticsOrder) {
  const isProductProcurement =
    order.product.type === "一般商品代購" ||
    order.product.type === "特殊商品代購";

  if (isProductProcurement) {
    const steps = ["訂單成立", "已付款", "採購中", "運輸中", "配送中", "已送達"];
    const currentIndex =
      order.logisticsStatus === "已簽收"
        ? 5
        : order.logisticsStatus === "配送中"
          ? 4
          : order.logisticsStatus === "待出貨"
            ? 2
            : 3;
    return {
      steps,
      currentIndex,
      currentLabel: steps[currentIndex],
      finished: order.logisticsStatus === "已簽收",
    };
  }

  const preparationLabel =
    order.product.type === "客製車款" ? "製作中" : "準備出貨";
  const steps = ["訂單成立", "已付款", preparationLabel, "運輸中", "組裝測試中", "待交車", "已交車"];
  let currentIndex = 2;

  if (order.deliveryStatus === "已交車") {
    currentIndex = 6;
  } else if (order.assemblyStatus === "已完成") {
    currentIndex = 5;
  } else if (
    order.assemblyStatus === "組裝中" ||
    (order.assemblyStatus === "待組裝" && order.logisticsStatus === "已到台灣")
  ) {
    currentIndex = 4;
  } else if (order.logisticsStatus !== "待出貨") {
    currentIndex = 3;
  }

  return {
    steps,
    currentIndex,
    currentLabel: steps[currentIndex],
    finished: order.deliveryStatus === "已交車",
  };
}
