import { NextResponse } from "next/server";
import { createNewebpayFields, newebpayGateway } from "@/lib/newebpay";
import { getServerAuthUser, serviceRest } from "@/lib/supabase-server";
import type { CommerceOrder } from "@/types/commerce";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
    const user = await getServerAuthUser(token);
    const { orderId } = (await request.json()) as { orderId: string };
    const rows = await serviceRest<CommerceOrder[]>(
      `customer_orders?id=eq.${encodeURIComponent(orderId)}&auth_user_id=eq.${user.id}&select=*`,
    );
    const order = rows[0];
    if (!order || order.payment_method === "atm") throw new Error("訂單或付款方式無效");
    if (order.payment_status === "paid") throw new Error("此訂單已付款");

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
    const installment = order.payment_method.replace("credit-", "");
    const params: Record<string, string | number> = {
      MerchantID: process.env.NEWEBPAY_MERCHANT_ID ?? "",
      RespondType: "JSON",
      TimeStamp: Math.floor(Date.now() / 1000),
      Version: "2.0",
      MerchantOrderNo: order.order_no,
      Amt: order.total_amount,
      ItemDesc: order.items.map((item) => item.productName).join("、").slice(0, 50),
      Email: order.customer_email,
      LoginType: 0,
      CREDIT: 1,
      ReturnURL: `${siteUrl}/api/payments/newebpay/return`,
      NotifyURL: `${siteUrl}/api/payments/newebpay/notify`,
      ClientBackURL: `${siteUrl}/checkout/payment/failure?order=${order.order_no}`,
    };
    if (installment !== "credit") params.InstFlag = installment;

    return NextResponse.json({
      action: newebpayGateway(),
      fields: createNewebpayFields(params),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "無法建立藍新付款請求" },
      { status: 400 },
    );
  }
}
