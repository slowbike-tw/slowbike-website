import { NextResponse } from "next/server";
import { finalizePaidOrder } from "@/lib/commerce";
import { requireStaffUser } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    await requireStaffUser(request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "");
    const { orderNo } = (await request.json()) as { orderNo: string };
    await finalizePaidOrder(orderNo, { Status: "SUCCESS", PaymentType: "ATM_MANUAL" });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "確認收款失敗";
    return NextResponse.json(
      { error: message },
      { status: message.includes("登入") ? 401 : message.includes("權限") ? 403 : 400 },
    );
  }
}
