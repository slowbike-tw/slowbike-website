"use client";

import { useEffect, useState } from "react";
import { useMemberAuth } from "@/components/member/auth-provider";

type Row = { id: string; order_no: string; customer_name: string; total_amount: number; payment_status: string; payment_method: string };

export function AdminPaymentOrders() {
  const { session, ready } = useMemberAuth();
  const [orders, setOrders] = useState<Row[]>([]);
  const [error, setError] = useState("");
  async function load() {
    if (!session) return;
    const response = await fetch("/api/admin/orders", { headers: { Authorization: `Bearer ${session.access_token}` } });
    const data = await response.json();
    if (!response.ok) return setError(data.error || "讀取失敗");
    setOrders(data);
  }
  useEffect(() => { void load(); }, [session]);
  if (!ready) return <p className="mt-8 font-bold">讀取中...</p>;
  if (!session) return <p className="mt-8 rounded-2xl bg-white p-6 font-bold">請先登入具後台權限的會員帳號。</p>;
  if (error) return <p className="mt-8 rounded-2xl bg-red-50 p-6 font-bold text-red-700">{error}</p>;
  return <div className="mt-8 grid gap-4">{orders.map((order) => <article key={order.id} className="rounded-3xl bg-white p-5 sm:flex sm:items-center sm:justify-between">
    <div><p className="text-xs font-black text-olive-600">{order.order_no}</p><h2 className="mt-2 text-xl font-black">{order.customer_name}</h2><p className="mt-1 text-sm text-ink/45">NT${order.total_amount.toLocaleString("zh-TW")}・{order.payment_status}</p></div>
    {order.payment_method === "atm" && order.payment_status === "awaiting_transfer" && <button onClick={async () => {
      if (!window.confirm(`確認已收到 ${order.order_no} 的 ATM 款項？`)) return;
      await fetch("/api/orders/confirm-atm", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ orderNo: order.order_no }) });
      await load();
    }} className="mt-4 min-h-11 rounded-full bg-olive-700 px-5 text-sm font-black text-white sm:mt-0">確認收款</button>}
  </article>)}</div>;
}
