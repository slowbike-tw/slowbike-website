import { NextResponse } from "next/server";
import {
  getAdminProductRecords,
  hideProductRecord,
  upsertProductRecord,
  type ProductCmsPayload,
} from "@/lib/product-cms";
import { requireStaffUser } from "@/lib/supabase-server";

function bearer(request: Request) {
  return request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
}

export async function GET(request: Request) {
  try {
    await requireStaffUser(bearer(request));
    return NextResponse.json(await getAdminProductRecords());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "無法讀取商品" },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireStaffUser(bearer(request));
    const payload = (await request.json()) as ProductCmsPayload;
    return NextResponse.json(await upsertProductRecord(payload));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "商品儲存失敗" },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await requireStaffUser(bearer(request));
    const payload = (await request.json()) as { id: string; action: "hide" };
    if (payload.action !== "hide") throw new Error("不支援的操作");
    return NextResponse.json(await hideProductRecord(payload.id));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "商品更新失敗" },
      { status: 400 },
    );
  }
}
