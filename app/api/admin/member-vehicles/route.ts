import { NextResponse } from "next/server";
import { isAdminSignedIn } from "@/lib/admin-auth";
import { upsertMemberVehicle } from "@/lib/repositories";

export async function POST(request: Request) {
  if (!(await isAdminSignedIn())) return NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
  const form = await request.formData();
  await upsertMemberVehicle({
    id: String(form.get("id") || "") || undefined,
    memberPhone: String(form.get("memberPhone") || ""),
    ownerName: String(form.get("ownerName") || ""),
    model: String(form.get("model") || ""),
    color: String(form.get("color") || ""),
    frameNo: String(form.get("frameNo") || ""),
    motorNo: String(form.get("motorNo") || ""),
    batteryNo: String(form.get("batteryNo") || ""),
    purchaseDate: String(form.get("purchaseDate") || ""),
    warrantyStart: String(form.get("warrantyStart") || ""),
    warrantyEnd: String(form.get("warrantyEnd") || ""),
    note: String(form.get("note") || ""),
  });
  return NextResponse.redirect(new URL("/admin/members", request.url), { status: 303 });
}
