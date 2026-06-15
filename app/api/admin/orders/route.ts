import { NextResponse } from "next/server";
import { requireStaffUser, serviceRest } from "@/lib/supabase-server";

export async function GET(request: Request) {
  try {
    await requireStaffUser(request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "");
    const rows = await serviceRest("customer_orders?select=*&order=created_at.desc");
    return NextResponse.json(rows);
  } catch (error) {
    const message = error instanceof Error ? error.message : "讀取失敗";
    return NextResponse.json(
      { error: message },
      { status: message.includes("登入") ? 401 : message.includes("權限") ? 403 : 500 },
    );
  }
}
