import { NextResponse } from "next/server";
import { isAdminSignedIn } from "@/lib/admin-auth";
import { addLogisticsFile, upsertLogisticsOrder } from "@/lib/repositories";
import { uploadLogisticsFile } from "@/lib/supabase-rest";
import type { LogisticsStatus } from "@/lib/types";

export async function POST(request: Request) {
  if (!(await isAdminSignedIn())) return NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
  const form = await request.formData();
  const order = await upsertLogisticsOrder({
    id: String(form.get("id") || "") || undefined,
    batchNo: String(form.get("batchNo") || ""),
    memberPhone: String(form.get("memberPhone") || ""),
    customerName: String(form.get("customerName") || ""),
    itemName: String(form.get("itemName") || ""),
    chinaTrackingNos: String(form.get("chinaTrackingNos") || ""),
    taiwanTrackingNos: String(form.get("taiwanTrackingNos") || ""),
    packageCount: Number(form.get("packageCount") || 1),
    weightKg: String(form.get("weightKg") || ""),
    volume: String(form.get("volume") || ""),
    rmbCost: Number(form.get("rmbCost") || 0),
    twdCost: Number(form.get("twdCost") || 0),
    exchangeRate: String(form.get("exchangeRate") || ""),
    status: String(form.get("status") || "待入庫") as LogisticsStatus,
    mergeSplitNote: String(form.get("mergeSplitNote") || ""),
    note: String(form.get("note") || ""),
  });

  const files = form.getAll("packagePhotos").filter((value): value is File => value instanceof File && value.size > 0);
  if (order.id) {
    for (const file of files) {
      const safeName = file.name.replace(/[^\w.\-]+/g, "-");
      const key = `${order.id}/${Date.now()}-${safeName}`;
      const publicUrl = await uploadLogisticsFile(key, file);
      await addLogisticsFile({
        logisticsOrderId: order.id,
        fileKey: key,
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        fileSize: file.size,
        publicUrl,
        note: "",
      });
    }
  }

  return NextResponse.redirect(new URL("/admin/logistics", request.url), { status: 303 });
}
