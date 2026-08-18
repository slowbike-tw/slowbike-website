import { NextResponse } from "next/server";
import { normalizeNewebpayResult } from "@/lib/newebpay";
import { updateOrder } from "@/lib/repositories";

async function handle(request: Request) {
  const form = await request.formData();
  const body = Object.fromEntries(form.entries());
  const result = normalizeNewebpayResult(body);
  const trade = (result.Result ?? result) as Record<string, unknown>;
  const merchantOrderNo = String(trade.MerchantOrderNo ?? "");
  const status = String(result.Status ?? "") === "SUCCESS" ? "paid" : "failed";
  if (merchantOrderNo) {
    await updateOrder(merchantOrderNo, {
      status,
      newebpayTradeNo: String(trade.TradeNo ?? ""),
      respondCode: String(trade.RespondCode ?? result.Status ?? ""),
      paidAt: status === "paid" ? new Date().toISOString() : "",
      rawResponse: JSON.stringify(result),
    });
  }
  return new Response("1|OK");
}

export async function POST(request: Request) {
  try {
    return await handle(request);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "notify failed" }, { status: 400 });
  }
}
