import { NextResponse } from "next/server";
import { buildMpgPayload } from "@/lib/newebpay";
import { createOrder, getPaymentLinkByToken } from "@/lib/repositories";

export async function POST(request: Request) {
  const form = await request.formData();
  const token = String(form.get("token") || "");
  const link = await getPaymentLinkByToken(token);
  if (!link) return NextResponse.redirect(new URL(`/pay/${token}`, request.url), { status: 303 });

  const merchantOrderNo = `SB${Date.now().toString(36).toUpperCase()}${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;

  await createOrder({
    merchantOrderNo,
    paymentLinkToken: token,
    buyerName: String(form.get("buyerName") || ""),
    buyerPhone: String(form.get("buyerPhone") || ""),
    buyerLineName: String(form.get("buyerLineName") || ""),
    buyerEmail: String(form.get("buyerEmail") || ""),
    amount: link.amount,
    paymentMode: link.paymentMode,
    status: "pending",
    newebpayTradeNo: "",
    respondCode: "",
    paidAt: "",
    rawResponse: "",
  });

  const payload = buildMpgPayload({
    merchantOrderNo,
    amount: link.amount,
    itemDesc: link.title,
    email: String(form.get("buyerEmail") || "support@slowbike.com.tw"),
  });

  return new Response(
    `<!doctype html><html><body><form id="pay" method="post" action="${payload.endpoint}">
      <input type="hidden" name="MerchantID" value="${payload.MerchantID}" />
      <input type="hidden" name="TradeInfo" value="${payload.TradeInfo}" />
      <input type="hidden" name="TradeSha" value="${payload.TradeSha}" />
      <input type="hidden" name="Version" value="${payload.Version}" />
    </form><script>document.getElementById('pay').submit()</script></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}
