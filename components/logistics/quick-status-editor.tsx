"use client";

import { Check, PencilLine } from "lucide-react";
import { useState } from "react";
import { assemblyStatuses, deliveryStatuses, logisticsStatuses } from "@/lib/logistics";
import type { LogisticsOrder, LogisticsOrderInput } from "@/types/logistics";
import { useLogistics } from "./logistics-provider";

export function QuickStatusEditor({ order }: { order: LogisticsOrder }) {
  const { updateOrder } = useLogistics();
  const [logisticsStatus, setLogisticsStatus] = useState(order.logisticsStatus);
  const [assemblyStatus, setAssemblyStatus] = useState(order.assemblyStatus);
  const [deliveryStatus, setDeliveryStatus] = useState(order.deliveryStatus);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const input: LogisticsOrderInput = {
      authUserId: order.authUserId,
      customerOrderId: order.customerOrderId,
      logisticsSource: order.logisticsSource,
      sourceOrderNo: order.sourceOrderNo,
      createdBy: order.createdBy,
      businessType: order.businessType,
      note: order.note,
      customer: order.customer,
      product: order.product,
      tracking: order.tracking,
      packages: order.packages,
      logisticsStatus,
      assemblyMethod: order.assemblyMethod,
      assemblyStatus,
      assemblyStore: order.assemblyStore,
      deliveryStatus,
      deliveryMethod: order.deliveryMethod,
      photos: order.photos,
    };
    try {
      await updateOrder(order.id, input);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } finally {
      setSaving(false);
    }
  }

  const selectClass =
    "logistics-status-select h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-base font-bold text-[#111111] outline-none focus:border-olive-600 focus:ring-2 focus:ring-olive-300";

  return (
    <section className="rounded-[1.5rem] bg-olive-800 p-5 text-white sm:p-6">
      <div className="flex items-center gap-3">
        <PencilLine size={19} className="text-olive-300" />
        <div>
          <h2 className="font-black">快速更新進度</h2>
          <p className="mt-1 text-xs text-white/50">適合手機現場快速操作</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3">
        <label>
          <span className="mb-2 block text-xs font-bold text-white/55">物流狀態</span>
          <select
            className={selectClass}
            value={logisticsStatus}
            onChange={(event) => setLogisticsStatus(event.target.value as typeof logisticsStatus)}
          >
            {logisticsStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-2 block text-xs font-bold text-white/55">組裝狀態</span>
          <select
            className={selectClass}
            value={assemblyStatus}
            disabled={order.assemblyMethod !== "門市組裝"}
            onChange={(event) => setAssemblyStatus(event.target.value as typeof assemblyStatus)}
          >
            {assemblyStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-2 block text-xs font-bold text-white/55">交車狀態</span>
          <select
            className={selectClass}
            value={deliveryStatus}
            onChange={(event) => setDeliveryStatus(event.target.value as typeof deliveryStatus)}
          >
            {deliveryStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="mt-1 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white font-black text-ink"
        >
          <Check size={18} />
          {saving ? "儲存中..." : saved ? "已儲存" : "儲存進度"}
        </button>
      </div>
    </section>
  );
}
