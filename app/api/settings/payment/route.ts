import { NextResponse } from "next/server";
import { requireStaffUser, serviceRest } from "@/lib/supabase-server";
import type { PaymentSettings } from "@/types/commerce";

export async function GET() {
  try {
    const rows = await serviceRest<Array<PaymentSettings & { id: string }>>(
      "payment_settings?select=*&limit=1",
    );
    return NextResponse.json(rows[0] ?? null);
  } catch {
    return NextResponse.json(null);
  }
}

export async function PUT(request: Request) {
  try {
    await requireStaffUser(request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "");
    const value = (await request.json()) as PaymentSettings;
    const rows = await serviceRest<Array<PaymentSettings & { id: string }>>(
      "payment_settings?select=id&limit=1",
    );
    const body = JSON.stringify({ ...value, updated_at: new Date().toISOString() });
    const saved = rows[0]
      ? await serviceRest(`payment_settings?id=eq.${rows[0].id}`, {
          method: "PATCH",
          headers: { Prefer: "return=representation" },
          body,
        })
      : await serviceRest("payment_settings", {
          method: "POST",
          headers: { Prefer: "return=representation" },
          body,
        });
    return NextResponse.json(saved);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "付款設定儲存失敗" },
      { status: 400 },
    );
  }
}
