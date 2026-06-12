"use client";

import {
  Bike,
  CheckCircle2,
  Clock3,
  PackageCheck,
  Plus,
  Search,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { OrderCard } from "@/components/logistics/order-card";
import { useLogistics } from "@/components/logistics/logistics-provider";
import { matchesOrder } from "@/lib/logistics";

export default function LogisticsDashboardPage() {
  const { orders, ready } = useLogistics();
  const [query, setQuery] = useState("");
  const results = useMemo(
    () => (query.trim() ? orders.filter((order) => matchesOrder(order, query)) : []),
    [orders, query],
  );
  const today = new Date().toDateString();
  const metrics = [
    {
      label: "今日新增訂單",
      value: orders.filter((order) => new Date(order.createdAt).toDateString() === today).length,
      icon: Plus,
      tone: "bg-olive-700 text-white",
      href: "/admin/logistics/orders?filter=today",
    },
    {
      label: "待出貨",
      value: orders.filter((order) => order.logisticsStatus === "待出貨").length,
      icon: Clock3,
      tone: "bg-white text-ink",
      href: "/admin/logistics/orders?logisticsStatus=待出貨",
    },
    {
      label: "運送中",
      value: orders.filter((order) =>
        ["已出貨", "已收貨", "已拆包", "已發往台灣", "已到台灣", "配送中"].includes(
          order.logisticsStatus,
        ),
      ).length,
      icon: Truck,
      tone: "bg-white text-ink",
      href: "/admin/logistics/orders?group=shipping",
    },
    {
      label: "待組裝",
      value: orders.filter((order) => order.assemblyStatus === "待組裝").length,
      icon: Bike,
      tone: "bg-white text-ink",
      href: "/admin/logistics/orders?assemblyStatus=待組裝",
    },
    {
      label: "已交車",
      value: orders.filter((order) => order.deliveryStatus === "已交車").length,
      icon: CheckCircle2,
      tone: "bg-white text-ink",
      href: "/admin/logistics/orders?deliveryStatus=已交車",
    },
  ];

  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black tracking-[0.2em] text-olive-600">LOGISTICS OVERVIEW</p>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">物流工作台</h1>
          <p className="mt-3 text-sm leading-6 text-ink/55">快速找到訂單，掌握出貨、組裝與交車進度。</p>
        </div>
        <Link
          href="/admin/logistics/orders/new"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-black text-white"
        >
          <Plus size={18} />
          新增訂單
        </Link>
      </div>

      <section className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {metrics.map((metric, index) => (
          <Link
            key={metric.label}
            href={metric.href}
            className={`rounded-[1.4rem] border p-4 sm:p-5 ${
              index === 0 ? "border-olive-700" : "border-black/10"
            } ${metric.tone} group block transition hover:-translate-y-0.5 hover:border-olive-500 hover:shadow-soft`}
          >
            <metric.icon size={20} className={index === 0 ? "text-olive-300" : "text-olive-600"} />
            <p className="mt-5 text-3xl font-black">{ready ? metric.value : "—"}</p>
            <p className={`mt-1 text-xs font-bold ${index === 0 ? "text-white/65" : "text-ink/50"}`}>
              {metric.label}
            </p>
            <span className={`mt-3 block text-[10px] font-black ${
              index === 0 ? "text-white/45" : "text-olive-600"
            }`}>
              查看訂單 →
            </span>
          </Link>
        ))}
      </section>

      <section className="mt-7 rounded-[1.75rem] bg-ink p-5 text-white sm:p-8">
        <div className="max-w-2xl">
          <p className="text-xs font-black tracking-[0.18em] text-olive-300">快速查詢</p>
          <h2 className="mt-3 text-2xl font-black sm:text-3xl">輸入姓名、電話或訂單編號</h2>
          <div className="relative mt-5">
            <Search
              size={20}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/45"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="例如：王小明、0912、SB-2026..."
              className="min-h-14 w-full rounded-2xl border border-white/15 bg-white/10 pl-12 pr-4 text-base text-white outline-none placeholder:text-white/35 focus:border-olive-300"
            />
          </div>
        </div>
      </section>

      {query.trim() ? (
        <section className="mt-7">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-black">查詢結果</h2>
            <span className="text-sm font-bold text-ink/45">{results.length} 筆訂單</span>
          </div>
          {results.length > 0 ? (
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {results.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-[1.5rem] border border-dashed border-black/15 bg-white p-10 text-center">
              <PackageCheck className="mx-auto text-olive-600" />
              <p className="mt-3 font-black">找不到符合的訂單</p>
              <p className="mt-1 text-sm text-ink/45">請確認姓名、電話或訂單編號是否正確。</p>
            </div>
          )}
        </section>
      ) : (
        <section className="mt-7">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-black">最近更新</h2>
            <Link href="/admin/logistics/orders" className="text-sm font-black text-olive-700">
              查看全部
            </Link>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {[...orders]
              .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
              .slice(0, 4)
              .map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
