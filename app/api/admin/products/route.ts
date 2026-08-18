import { NextResponse } from "next/server";
import { isAdminSignedIn } from "@/lib/admin-auth";
import { upsertProduct } from "@/lib/repositories";
import type { ProductStatus } from "@/lib/types";

export async function POST(request: Request) {
  if (!(await isAdminSignedIn())) {
    return NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
  }
  const form = await request.formData();
  await upsertProduct({
    id: String(form.get("id") || "") || undefined,
    name: String(form.get("name") || ""),
    slug: String(form.get("slug") || ""),
    subtitle: String(form.get("subtitle") || ""),
    price: Number(form.get("price") || 0),
    imagePath: String(form.get("imagePath") || ""),
    summary: String(form.get("summary") || ""),
    specs: String(form.get("specs") || ""),
    highlights: String(form.get("highlights") || ""),
    salesCopy: String(form.get("salesCopy") || ""),
    status: String(form.get("status") || "active") as ProductStatus,
    sortOrder: Number(form.get("sortOrder") || 1),
  });
  return NextResponse.redirect(new URL("/admin/products", request.url), { status: 303 });
}
