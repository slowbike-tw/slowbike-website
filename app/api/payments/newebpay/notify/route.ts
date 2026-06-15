import { NextResponse } from "next/server";
import { finalizePaidOrder } from "@/lib/commerce";
import { decryptTradeInfo, verifyTradeSha } from "@/lib/newebpay";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const tradeInfo = String(form.get("TradeInfo") ?? "");
    if (!verifyTradeSha(tradeInfo, String(form.get("TradeSha") ?? ""))) {
      return new NextResponse("0|INVALID_SHA");
    }
    const payload = decryptTradeInfo(tradeInfo);
    if (payload.Status !== "SUCCESS" || !payload.Result?.MerchantOrderNo) {
      return new NextResponse("0|FAIL");
    }
    await finalizePaidOrder(payload.Result.MerchantOrderNo, payload as unknown as Record<string, unknown>);
    return new NextResponse("1|OK");
  } catch {
    return new NextResponse("0|FAIL");
  }
}
