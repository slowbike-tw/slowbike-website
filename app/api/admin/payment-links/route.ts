import crypto from "crypto";
import { NextResponse } from "next/server";
import { isAdminSignedIn } from "@/lib/admin-auth";
import { createPaymentLink } from "@/lib/repositories";

export async function POST(request: Request) {
  if (!(await isAdminSignedIn())) return NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
  const form = await request.formData();
  await createPaymentLink({
    token: crypto.randomBytes(10).toString("hex"),
    title: String(form.get("title") || ""),
    model: String(form.get("model") || ""),
    color: String(form.get("color") || ""),
    amount: Number(form.get("amount") || 0),
    stockQuantity: Number(form.get("stockQuantity") || 1),
    paymentMode: "once",
    note: String(form.get("note") || ""),
    status: "active",
  });
  return NextResponse.redirect(new URL("/admin/payment-links", request.url), { status: 303 });
}
