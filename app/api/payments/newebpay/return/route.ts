import { NextResponse } from "next/server";
import { finalizePaidOrder } from "@/lib/commerce";
import { decryptTradeInfo, verifyTradeSha } from "@/lib/newebpay";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const tradeInfo = String(form.get("TradeInfo") ?? "");
    if (!verifyTradeSha(tradeInfo, String(form.get("TradeSha") ?? ""))) {
      throw new Error("Invalid TradeSha");
    }
    const payload = decryptTradeInfo(tradeInfo);
    const orderNo = payload.Result?.MerchantOrderNo ?? "";
    if (payload.Status === "SUCCESS" && orderNo) {
      await finalizePaidOrder(orderNo, payload as unknown as Record<string, unknown>);
      return NextResponse.redirect(
        new URL(`/checkout/payment/success?order=${encodeURIComponent(orderNo)}`, request.url),
        303,
      );
    }
    return NextResponse.redirect(
      new URL(`/checkout/payment/failure?order=${encodeURIComponent(orderNo)}`, request.url),
      303,
    );
  } catch {
    return NextResponse.redirect(new URL("/checkout/payment/failure", request.url), 303);
  }
}
