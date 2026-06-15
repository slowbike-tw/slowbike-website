"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLogistics } from "@/components/logistics/logistics-provider";

export function DeleteOrderButton({
  orderId,
  orderNumber,
  compact = false,
}: {
  orderId: string;
  orderNumber: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const { deleteOrder } = useLogistics();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      `確定要刪除物流單 ${orderNumber} 嗎？\n\n此操作只會刪除這筆物流單，且無法復原。`,
    );
    if (!confirmed) return;

    setDeleting(true);
    setError("");
    try {
      await deleteOrder(orderId);
      router.push("/admin/logistics/orders");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "物流單刪除失敗，請稍後再試。",
      );
      setDeleting(false);
    }
  }

  return (
    <div className={compact ? "" : "w-full"}>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-4 text-sm font-black text-red-700 transition hover:bg-red-50 disabled:opacity-50 ${
          compact ? "" : "w-full"
        }`}
      >
        {deleting ? (
          <LoaderCircle size={17} className="animate-spin" />
        ) : (
          <Trash2 size={17} />
        )}
        {deleting ? "刪除中..." : compact ? "刪除" : "刪除物流單"}
      </button>
      {error && (
        <p className="mt-2 max-w-xs text-xs font-bold text-red-700">{error}</p>
      )}
    </div>
  );
}
