import { NextResponse } from "next/server";
import { resolveCartItems } from "@/lib/commerce";
import { getServerAuthUser, serviceRest } from "@/lib/supabase-server";
import type { CommerceOrder } from "@/types/commerce";
import type { OrderDraft } from "@/types/order-draft";
import type { CartItem } from "@/types/product";

function bearer(request: Request) {
  return request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
}

export async function POST(request: Request) {
  try {
    const accessToken = bearer(request);
    const user = await getServerAuthUser(accessToken);
    const body = (await request.json()) as {
      cartItems?: CartItem[];
      draftToken?: string;
      customer: { name: string; phone: string; email: string; lineId?: string; address?: string };
      deliveryMethod: string;
      deliveryFee: number;
      note?: string;
      paymentMethod: CommerceOrder["payment_method"];
    };

    let items;
    let subtotal;
    let businessType: CommerceOrder["business_type"] = "標準車款";
    let sourceDraftId: string | null = null;
    let source = "官網訂單";
    let createdBy = "官網";
    let responsibleStore = "";

    if (body.draftToken) {
      const drafts = await serviceRest<OrderDraft[]>(
        `order_drafts?confirmation_token=eq.${encodeURIComponent(body.draftToken)}&auth_user_id=eq.${user.id}&select=*`,
      );
      const draft = drafts[0];
      if (!draft) throw new Error("找不到已綁定會員的訂單草稿");
      items = draft.items;
      subtotal = draft.total;
      businessType = draft.business_type;
      sourceDraftId = draft.id;
      source = draft.order_source;
      createdBy = draft.created_by;
      responsibleStore = draft.responsible_store;
    } else {
      const resolved = resolveCartItems(body.cartItems ?? []);
      items = resolved.items;
      subtotal = resolved.subtotal;
    }

    const deliveryFee = body.deliveryMethod === "宅配到府" ? 800 : 0;
    const total = subtotal + deliveryFee;
    const now = Date.now();
    const orderNo = `SB${new Date().toISOString().slice(0, 10).replaceAll("-", "")}${String(now).slice(-6)}`;
    let memberRows = await serviceRest<Array<{ id: string; auth_user_id: string | null }>>(
      `member_profiles?auth_user_id=eq.${user.id}&select=id&limit=1`,
    );
    if (!memberRows[0] && user.email) {
      memberRows = await serviceRest<Array<{ id: string; auth_user_id: string | null }>>(
        `member_profiles?email=ilike.${encodeURIComponent(user.email)}&select=id,auth_user_id&limit=1`,
      );
    }
    if (memberRows[0] && !memberRows[0].auth_user_id) {
      memberRows = await serviceRest<Array<{ id: string; auth_user_id: string | null }>>(
        `member_profiles?id=eq.${memberRows[0].id}`,
        {
          method: "PATCH",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({
            auth_user_id: user.id,
            name: body.customer.name,
            phone: body.customer.phone,
            email: body.customer.email,
            line_id: body.customer.lineId ?? "",
            updated_at: new Date().toISOString(),
          }),
        },
      );
    }
    if (!memberRows[0]) {
      memberRows = await serviceRest<Array<{ id: string; auth_user_id: string | null }>>(
        "member_profiles",
        {
          method: "POST",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({
            auth_user_id: user.id,
            name: body.customer.name,
            phone: body.customer.phone,
            email: body.customer.email,
            line_id: body.customer.lineId ?? "",
          }),
        },
      );
    }
    const rows = await serviceRest<CommerceOrder[]>("customer_orders", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        auth_user_id: user.id,
        member_profile_id: memberRows[0]?.id ?? null,
        source_draft_id: sourceDraftId,
        order_no: orderNo,
        customer: {
          name: body.customer.name,
          phone: body.customer.phone,
          email: body.customer.email,
          lineId: body.customer.lineId ?? "",
          address: body.customer.address ?? "",
        },
        customer_name: body.customer.name,
        customer_phone: body.customer.phone,
        customer_email: body.customer.email,
        line_id: body.customer.lineId ?? "",
        order_source: source,
        business_type: businessType,
        items,
        subtotal,
        shipping_fee: deliveryFee,
        total,
        total_amount: total,
        currency: "TWD",
        delivery_method: body.deliveryMethod,
        delivery_fee: deliveryFee,
        address: body.customer.address ?? "",
        notes: body.note ?? "",
        note: body.note ?? "",
        payment_method: body.paymentMethod,
        payment_status: body.paymentMethod === "atm" ? "awaiting_transfer" : "pending",
        order_status: body.paymentMethod === "atm" ? "awaiting_transfer" : "pending_payment",
        checkout_token: crypto.randomUUID(),
        created_by: createdBy,
        responsible_store: responsibleStore,
      }),
    });

    if (sourceDraftId) {
      await serviceRest(`order_drafts?id=eq.${sourceDraftId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "awaiting_payment", payment_status: "pending" }),
      });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "建立訂單失敗" },
      { status: 400 },
    );
  }
}
