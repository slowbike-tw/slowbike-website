import { NextResponse } from "next/server";
import { isAdminSignedIn } from "@/lib/admin-auth";
import { upsertMember } from "@/lib/repositories";

export async function POST(request: Request) {
  if (!(await isAdminSignedIn())) return NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
  const form = await request.formData();
  await upsertMember({
    id: String(form.get("id") || "") || undefined,
    name: String(form.get("name") || ""),
    phone: String(form.get("phone") || ""),
    idNumber: String(form.get("idNumber") || ""),
    lineName: String(form.get("lineName") || ""),
    email: String(form.get("email") || ""),
    address: String(form.get("address") || ""),
    note: String(form.get("note") || ""),
  });
  return NextResponse.redirect(new URL("/admin/members", request.url), { status: 303 });
}
