"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { OrderForm } from "@/components/logistics/order-form";
import { useLogistics } from "@/components/logistics/logistics-provider";

export default function EditLogisticsOrderPage() {
  const params = useParams<{ id: string }>();
  const { getOrder, ready } = useLogistics();
  const order = getOrder(params.id);

  if (!ready) return <div className="rounded-[1.5rem] bg-white p-8 font-bold">載入訂單中...</div>;
  if (!order) {
    return (
      <div className="rounded-[1.5rem] bg-white p-8 text-center">
        <h1 className="text-2xl font-black">找不到這筆訂單</h1>
        <Link href="/admin/logistics/orders" className="mt-4 inline-block font-black text-olive-700">
          返回訂單列表
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href={`/admin/logistics/orders/${order.id}`}
        className="inline-flex min-h-11 items-center gap-2 text-sm font-black text-ink/55"
      >
        <ArrowLeft size={18} />
        返回訂單詳細
      </Link>
      <p className="mt-5 text-xs font-black tracking-[0.2em] text-olive-600">{order.orderNumber}</p>
      <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">編輯物流訂單</h1>
      <p className="mb-7 mt-3 text-sm text-ink/50">更新客戶、商品、物流、組裝或交車資料。</p>
      <OrderForm order={order} />
    </div>
  );
}

