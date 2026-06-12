"use client";

import { Filter, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { OrderCard } from "@/components/logistics/order-card";
import { useLogistics } from "@/components/logistics/logistics-provider";
import { logisticsStatuses, matchesOrder } from "@/lib/logistics";

const shippingStatuses = ["已出貨", "已收貨", "已拆包", "已發往台灣", "已到台灣", "配送中"];

function LogisticsOrdersContent() {
  const { orders } = useLogistics();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlLogisticsStatus = searchParams.get("logisticsStatus");
  const urlAssemblyStatus = searchParams.get("assemblyStatus");
  const urlDeliveryStatus = searchParams.get("deliveryStatus");
  const isToday = searchParams.get("filter") === "today";
  const isShippingGroup = searchParams.get("group") === "shipping";
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(urlLogisticsStatus || "全部狀態");
  const [store, setStore] = useState("全部組裝店");

  const filtered = useMemo(
    () =>
      orders
        .filter((order) => matchesOrder(order, query))
        .filter(
          (order) =>
            !isToday || new Date(order.createdAt).toDateString() === new Date().toDateString(),
        )
        .filter((order) => !isShippingGroup || shippingStatuses.includes(order.logisticsStatus))
        .filter((order) => status === "全部狀態" || order.logisticsStatus === status)
        .filter((order) => !urlAssemblyStatus || order.assemblyStatus === urlAssemblyStatus)
        .filter((order) => !urlDeliveryStatus || order.deliveryStatus === urlDeliveryStatus)
        .filter((order) => store === "全部組裝店" || order.assemblyStore === store)
        .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)),
    [
      orders,
      query,
      status,
      store,
      isToday,
      isShippingGroup,
      urlAssemblyStatus,
      urlDeliveryStatus,
    ],
  );

  const activeUrlFilter =
    (isToday && "今日新增訂單") ||
    (isShippingGroup && "運送中") ||
    (urlAssemblyStatus && `組裝狀態：${urlAssemblyStatus}`) ||
    (urlDeliveryStatus && `交車狀態：${urlDeliveryStatus}`) ||
    (urlLogisticsStatus && `物流狀態：${urlLogisticsStatus}`);

  function clearFilters() {
    setQuery("");
    setStatus("全部狀態");
    setStore("全部組裝店");
    router.replace("/admin/logistics/orders");
  }

  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black tracking-[0.2em] text-olive-600">ORDER MANAGEMENT</p>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">物流訂單</h1>
          <p className="mt-3 text-sm text-ink/50">目前共 {orders.length} 筆訂單</p>
        </div>
        <Link
          href="/admin/logistics/orders/new"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-black text-white"
        >
          <Plus size={18} />
          新增訂單
        </Link>
      </div>

      <section className="mt-7 rounded-[1.5rem] border border-black/10 bg-white p-4 sm:p-5">
        {activeUrlFilter && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-olive-100 px-4 py-3">
            <p className="text-sm font-black text-olive-800">目前篩選：{activeUrlFilter}</p>
            <button
              type="button"
              onClick={clearFilters}
              className="shrink-0 text-xs font-black text-olive-700"
            >
              清除
            </button>
          </div>
        )}
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/35"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜尋姓名、電話、訂單編號"
            className="min-h-12 w-full rounded-xl border border-black/10 bg-[#f8f7f2] pl-11 pr-4 text-base outline-none focus:border-olive-600"
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="relative">
            <Filter
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"
            />
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="min-h-11 w-full appearance-none rounded-xl border border-black/10 bg-white pl-9 pr-2 text-sm font-bold outline-none"
            >
              <option>全部狀態</option>
              {logisticsStatuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <select
            value={store}
            onChange={(event) => setStore(event.target.value)}
            className="min-h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-bold outline-none"
          >
            <option>全部組裝店</option>
            <option>恆春店</option>
            <option>龜山店</option>
          </select>
        </div>
      </section>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm font-bold text-ink/45">顯示 {filtered.length} 筆</p>
        {(query ||
          status !== "全部狀態" ||
          store !== "全部組裝店" ||
          Boolean(activeUrlFilter)) && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-black text-olive-700"
          >
            清除篩選
          </button>
        )}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {filtered.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="mt-4 rounded-[1.5rem] border border-dashed border-black/15 bg-white p-10 text-center">
          <p className="font-black">沒有符合條件的訂單</p>
          <p className="mt-1 text-sm text-ink/45">調整搜尋文字或篩選條件後再試一次。</p>
        </div>
      )}
    </div>
  );
}

export default function LogisticsOrdersPage() {
  return (
    <Suspense fallback={<div className="rounded-[1.5rem] bg-white p-8 font-bold">載入訂單中...</div>}>
      <LogisticsOrdersContent />
    </Suspense>
  );
}
