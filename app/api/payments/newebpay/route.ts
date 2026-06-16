import { NextResponse } from "next/server";
import { createNewebpayFields, newebpayGateway } from "@/lib/newebpay";
import { getServerAuthUser, serviceRest } from "@/lib/supabase-server";
import type { CommerceOrder } from "@/types/commerce";

type PaymentRequestBody = {
  orderId: string;
  checkoutToken?: string;
};

function bearer(request: Request) {
  return request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
}

async function getOrderForPayment(request: Request, body: PaymentRequestBody) {
  const token = bearer(request);
  if (token) {
    const user = await getServerAuthUser(token);
    const rows = await serviceRest<CommerceOrder[]>(
      `customer_orders?id=eq.${encodeURIComponent(body.orderId)}&auth_user_id=eq.${user.id}&select=*`,
    );
    return rows[0] ?? null;
  }

  if (!body.checkoutToken) {
    throw new Error("付款連結已失效，請重新開啟付款連結。");
  }

  const rows = await serviceRest<CommerceOrder[]>(
    `customer_orders?id=eq.${encodeURIComponent(body.orderId)}&checkout_token=eq.${encodeURIComponent(body.checkoutToken)}&select=*`,
  );
  return rows[0] ?? null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PaymentRequestBody;
    const order = await getOrderForPayment(request, body);
    if (!order || order.payment_method === "atm") {
      throw new Error("找不到可付款的信用卡訂單。");
    }
    if (order.payment_status === "paid") {
      throw new Error("此訂單已完成付款。");
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
    const installment = order.payment_method.replace("credit-", "");
    const params: Record<string, string | number> = {
      MerchantID: process.env.NEWEBPAY_MERCHANT_ID ?? "",
      RespondType: "JSON",
      TimeStamp: Math.floor(Date.now() / 1000),
      Version: "2.0",
      MerchantOrderNo: order.order_no,
      Amt: order.total_amount,
      ItemDesc: order.items
        .map((item) => item.productName)
        .join("、")
        .slice(0, 50),
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
      {
        error:
          error instanceof Error
            ? error.message
            : "建立信用卡付款請求失敗。",
      },
      { status: 400 },
    );
  }
}
