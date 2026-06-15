import { NextResponse } from "next/server";
import { requireStaffUser, serviceRest } from "@/lib/supabase-server";

export async function GET(request: Request) {
  try {
    await requireStaffUser(request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "");
    const rows = await serviceRest("customer_orders?select=*&order=created_at.desc");
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "讀取失敗" }, { status: 500 });
  }
}
