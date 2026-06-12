"use client";

import {
  ArrowLeft,
  Check,
  Circle,
  Clock3,
  Edit3,
  MapPin,
  Package,
  Phone,
  Truck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { QuickStatusEditor } from "@/components/logistics/quick-status-editor";
import { StatusBadge } from "@/components/logistics/status-badge";
import { useLogistics } from "@/components/logistics/logistics-provider";
import {
  formatDateTime,
  getPackageHandler,
  getPackageName,
  getProgress,
} from "@/lib/logistics";

function InfoSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.5rem] border border-black/10 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-black">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-3 border-b border-black/10 py-3 first:pt-0 last:border-0 last:pb-0">
      <dt className="text-sm font-bold text-ink/40">{label}</dt>
      <dd className="min-w-0 break-words text-sm font-bold text-ink/80">{value || "—"}</dd>
    </div>
  );
}

export default function LogisticsOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { getOrder, ready } = useLogistics();
  const order = getOrder(params.id);

  if (!ready) {
    return <div className="rounded-[1.5rem] bg-white p-8 font-bold">載入訂單中...</div>;
  }
  if (!order) {
    return (
      <div className="rounded-[1.5rem] border border-black/10 bg-white p-10 text-center">
        <Package className="mx-auto text-olive-600" />
        <h1 className="mt-4 text-2xl font-black">找不到這筆訂單</h1>
        <Link href="/admin/logistics/orders" className="mt-5 inline-block font-black text-olive-700">
          返回訂單列表
        </Link>
      </div>
    );
  }

  const trackingEntries = [
    ["車輪單號", order.tracking.wheel],
    ["車架單號", order.tracking.frame],
    ["電池單號", order.tracking.battery],
    ["一般商品單號", order.tracking.general],
    ["其他單號", order.tracking.other],
  ].filter(([, value]) => value);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/logistics/orders"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-black text-ink/55"
        >
          <ArrowLeft size={18} />
          返回訂單列表
        </Link>
        <Link
          href={`/admin/logistics/orders/${order.id}/edit`}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-black text-white"
        >
          <Edit3 size={16} />
          編輯完整資料
        </Link>
      </div>

      <section className="mt-5 overflow-hidden rounded-[1.75rem] bg-ink text-white">
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black tracking-[0.12em] text-olive-300">{order.orderNumber}</p>
              <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                {order.customer.name}
              </h1>
              <p className="mt-2 text-sm text-white/50">
                最後更新：{formatDateTime(order.updatedAt)}
              </p>
            </div>
            <StatusBadge status={order.logisticsStatus} />
          </div>
          <div className="mt-7 grid gap-3 text-sm text-white/70 sm:grid-cols-3">
            <p className="flex items-center gap-2">
              <Phone size={17} className="text-olive-300" />
              {order.customer.phone}
            </p>
            <p className="flex items-center gap-2">
              <Package size={17} className="text-olive-300" />
              {order.product.name} {order.product.specification}
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={17} className="text-olive-300" />
              {order.assemblyStore || order.deliveryMethod}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_22rem]">
        <div className="grid gap-5">
          <InfoSection title="目前進度">
            <ol className="grid gap-1">
              {getProgress(order).map((step, index) => (
                <li key={`${step.label}-${index}`} className="relative flex min-h-12 gap-3">
                  {index < getProgress(order).length - 1 && (
                    <span
                      className={`absolute left-[0.7rem] top-7 h-8 w-px ${
                        step.done ? "bg-olive-500" : "bg-black/10"
                      }`}
                    />
                  )}
                  <span
                    className={`relative z-10 mt-1 grid size-6 shrink-0 place-items-center rounded-full ${
                      step.done
                        ? "bg-olive-700 text-white"
                        : step.active
                          ? "bg-amber-400 text-ink"
                          : "bg-stone-100 text-stone-400"
                    }`}
                  >
                    {step.done ? <Check size={14} strokeWidth={3} /> : step.active ? <Truck size={13} /> : <Circle size={9} />}
                  </span>
                  <span className={`pt-1 text-sm font-black ${step.done || step.active ? "text-ink" : "text-ink/35"}`}>
                    {step.label}
                  </span>
                </li>
              ))}
            </ol>
          </InfoSection>

          <div className="grid gap-5 md:grid-cols-2">
            <InfoSection title="客戶資料">
              <dl>
                <InfoRow label="姓名" value={order.customer.name} />
                <InfoRow label="電話" value={order.customer.phone} />
                <InfoRow label="LINE ID" value={order.customer.lineId} />
                <InfoRow label="地址" value={order.customer.address} />
                <InfoRow label="備註" value={order.customer.note} />
              </dl>
            </InfoSection>
            <InfoSection title="商品資料">
              <dl>
                <InfoRow label="類型" value={order.product.type} />
                <InfoRow label="商品" value={order.product.name} />
                <InfoRow label="規格" value={order.product.specification} />
                <InfoRow label="顏色" value={order.product.color} />
                <InfoRow label="電池" value={order.product.battery} />
                <InfoRow label="備註" value={order.product.note} />
              </dl>
            </InfoSection>
          </div>

          <InfoSection title={order.packages.length > 0 ? "包裹追蹤" : "物流單號"}>
            {order.packages.length > 0 ? (
              <div className="grid gap-4">
                {order.packages.map((item, index) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-black/10 bg-[#f8f7f2] p-4 sm:p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-olive-700 text-xs font-black text-white">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-ink/40">包裹名稱</p>
                          <h3 className="mt-1 text-lg font-black">{getPackageName(item)}</h3>
                        </div>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                    <dl className="mt-4 grid gap-x-8 sm:grid-cols-2">
                      <InfoRow label="處理單位" value={getPackageHandler(item)} />
                      <InfoRow label="物流單號" value={item.trackingNumber} />
                      <InfoRow label="備註" value={item.note} />
                    </dl>
                  </article>
                ))}
              </div>
            ) : trackingEntries.length > 0 ? (
              <dl className="grid gap-x-8 md:grid-cols-2">
                {trackingEntries.map(([label, value]) => (
                  <InfoRow key={label} label={label} value={value} />
                ))}
              </dl>
            ) : (
              <p className="text-sm text-ink/45">尚未輸入物流單號。</p>
            )}
          </InfoSection>

          <InfoSection title="訂單資訊">
            <dl className="grid gap-x-8 md:grid-cols-2">
              <InfoRow label="業務類型" value={order.businessType} />
              <InfoRow label="建立人" value={order.createdBy} />
              <InfoRow label="建立時間" value={formatDateTime(order.createdAt)} />
              <InfoRow label="訂單備註" value={order.note} />
            </dl>
          </InfoSection>
        </div>

        <aside className="grid content-start gap-5">
          <QuickStatusEditor order={order} />
          <InfoSection title="組裝與交車">
            <div className="grid gap-4">
              <div>
                <p className="text-xs font-bold text-ink/40">組裝方式</p>
                <p className="mt-2 text-sm font-black">{order.assemblyMethod}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-ink/40">組裝進度</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge status={order.assemblyStatus} />
                  {order.assemblyStore && <span className="text-sm font-black">{order.assemblyStore}</span>}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-ink/40">交車進度</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge status={order.deliveryStatus} />
                  <span className="text-sm font-black">{order.deliveryMethod}</span>
                </div>
              </div>
            </div>
          </InfoSection>
          <InfoSection title="照片紀錄">
            {order.photos.length > 0 ? (
              <div className="grid gap-2">
                {order.photos.map((photo, index) => (
                  <p key={`${photo}-${index}`} className="rounded-xl bg-sand px-3 py-2 text-xs font-bold">
                    {photo}
                  </p>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <Clock3 className="mx-auto text-ink/25" />
                <p className="mt-2 text-sm text-ink/45">尚未上傳照片</p>
              </div>
            )}
          </InfoSection>
          <div className="rounded-[1.5rem] border border-black/10 bg-white p-5">
            <p className="flex items-center gap-2 text-sm font-black">
              <UserRound size={17} className="text-olive-600" />
              V2 同步說明
            </p>
            <p className="mt-2 text-xs leading-6 text-ink/45">
              Supabase 設定完成後會同步雲端資料；連線異常時保留本機快取，避免工作中斷。
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
