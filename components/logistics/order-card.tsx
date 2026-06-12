import { ArrowRight, MapPin, Package, Phone } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/logistics";
import type { LogisticsOrder } from "@/types/logistics";
import { StatusBadge } from "./status-badge";

export function OrderCard({ order }: { order: LogisticsOrder }) {
  return (
    <Link
      href={`/admin/logistics/orders/${order.id}`}
      className="group block rounded-[1.5rem] border border-black/10 bg-white p-5 transition hover:-translate-y-0.5 hover:border-olive-500 hover:shadow-soft sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black tracking-[0.08em] text-olive-600">{order.orderNumber}</p>
          <h3 className="mt-2 text-xl font-black">{order.customer.name}</h3>
        </div>
        <StatusBadge status={order.logisticsStatus} />
      </div>
      <div className="mt-5 grid gap-3 text-sm text-ink/60 sm:grid-cols-2">
        <p className="flex items-center gap-2">
          <Phone size={15} />
          {order.customer.phone}
        </p>
        <p className="flex items-center gap-2">
          <Package size={15} />
          {order.product.name} {order.product.color}
        </p>
        <p className="flex items-center gap-2">
          <MapPin size={15} />
          {order.assemblyStore || order.deliveryMethod}
        </p>
        <p>建立日期：{formatDate(order.createdAt)}</p>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-4">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={order.assemblyStatus} />
          <StatusBadge status={order.deliveryStatus} />
        </div>
        <ArrowRight size={18} className="transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

