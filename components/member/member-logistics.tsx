"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useMemberAuth } from "@/components/member/auth-provider";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/member/member-orders";
import { fetchMemberLogisticsOrders } from "@/lib/logistics-repository";
import type { LogisticsOrder } from "@/types/logistics";

const customerSteps = [
  "訂單成立",
  "製作中",
  "運輸中",
  "組裝測試中",
  "可交車",
  "已交車",
];

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
      .catch(
        () =>
          active &&
          setError("物流資料暫時無法讀取，請稍後再試或聯繫 SlowBike。"),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [user, session]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (orders.length === 0) {
    return (
      <EmptyState
        title="目前沒有物流資料"
        text="付款完成後，物流進度會顯示在這裡。"
      />
    );
  }

  return (
    <div className="grid gap-4">
      {orders.map((order) => {
        const progress = getCustomerProgress(order);
        return (
          <article
            key={order.id}
            className="rounded-3xl border border-black/10 bg-white p-5 sm:p-7"
          >
            <div className="flex flex-col justify-between gap-4 sm:flex-row">
              <div>
                <p className="text-xs font-black tracking-[0.12em] text-olive-600">
                  {order.sourceOrderNo || order.orderNumber}
                </p>
                <h2 className="mt-2 text-xl font-black">
                  {[order.product.name, order.product.color]
                    .filter(Boolean)
                    .join(" ")}
                </h2>
                <p className="mt-2 text-sm text-ink/45">
                  {order.product.specification || "SlowBike 訂單"}
                </p>
              </div>
              <span className="self-start rounded-full bg-olive-700 px-4 py-2 text-xs font-black text-white">
                {customerSteps[progress.currentIndex]}
              </span>
            </div>

            <div className="mt-6 border-t border-black/10 pt-6">
              <div className="grid gap-3">
                {customerSteps.map((step, index) => {
                  const completed = index < progress.currentIndex || progress.finished;
                  const current = index === progress.currentIndex && !progress.finished;
                  return (
                    <div
                      key={step}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
                        current
                          ? "bg-olive-700 text-white"
                          : completed
                            ? "bg-olive-50 text-olive-900"
                            : "bg-sand text-ink/35"
                      }`}
                    >
                      <span
                        className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-black ${
                          current
                            ? "bg-white text-olive-700"
                            : completed
                              ? "bg-olive-700 text-white"
                              : "bg-white text-ink/30"
                        }`}
                      >
                        {completed ? <Check size={15} strokeWidth={3} /> : index + 1}
                      </span>
                      <strong className="text-sm">{step}</strong>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-right text-xs text-ink/35">
                更新時間：{new Date(order.updatedAt).toLocaleString("zh-TW")}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function includesAny(value: string | undefined, keywords: string[]) {
  return keywords.some((keyword) => value?.includes(keyword));
}

function getCustomerProgress(order: LogisticsOrder) {
  let currentIndex = 1;

  if (includesAny(order.logisticsStatus, ["運輸", "已到", "配送", "已出貨", "已收貨"])) {
    currentIndex = 2;
  }

  if (includesAny(order.assemblyStatus, ["待組裝", "組裝中", "已完成"])) {
    currentIndex = 3;
  }

  if (
    includesAny(order.assemblyStatus, ["已完成"]) ||
    includesAny(order.deliveryStatus, ["未交車", "可交車"])
  ) {
    currentIndex = 4;
  }

  if (includesAny(order.deliveryStatus, ["已交車"])) {
    currentIndex = 5;
  }

  return {
    currentIndex,
    finished: currentIndex === 5,
  };
}
