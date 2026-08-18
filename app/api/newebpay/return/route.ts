import { NextResponse } from "next/server";
import { normalizeNewebpayResult } from "@/lib/newebpay";
import { updateOrder } from "@/lib/repositories";

export async function POST(request: Request) {
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
    return NextResponse.redirect(new URL(`/payment/result/${merchantOrderNo}`, request.url), { status: 303 });
  }
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
