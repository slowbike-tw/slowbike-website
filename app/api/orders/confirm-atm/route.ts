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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "確認收款失敗" },
      { status: 400 },
    );
  }
}
