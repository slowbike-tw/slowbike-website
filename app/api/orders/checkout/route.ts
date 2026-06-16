import { NextResponse } from "next/server";
import { resolveCartItems } from "@/lib/commerce";
import { getServerAuthUser, serviceRest } from "@/lib/supabase-server";
import type { CommerceOrder } from "@/types/commerce";
import type { MemberProfile, OrderDraft } from "@/types/order-draft";
import type { CartItem } from "@/types/product";

type AuthUser = Awaited<ReturnType<typeof getServerAuthUser>>;

type CheckoutBody = {
  cartItems?: CartItem[];
  draftToken?: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    lineId?: string;
    address?: string;
  };
  deliveryMethod: string;
  note?: string;
  paymentMethod: CommerceOrder["payment_method"];
};

function bearer(request: Request) {
  return request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
}

function orderNo() {
  const now = Date.now();
  return `SB${new Date().toISOString().slice(0, 10).replaceAll("-", "")}${String(now).slice(-6)}`;
}

function customerFromDraft(draft: OrderDraft, body: CheckoutBody) {
  return {
    name: body.customer?.name || draft.customer_name || "",
    phone: body.customer?.phone || draft.customer_phone || "",
    email: body.customer?.email || draft.customer_email || "",
    lineId: body.customer?.lineId || draft.line_id || "",
    address: body.customer?.address || draft.shipping_address || "",
  };
}

async function getOptionalUser(accessToken: string) {
  if (!accessToken) return null;
  try {
    return await getServerAuthUser(accessToken);
  } catch {
    return null;
  }
}

async function findProfileByEmail(email: string) {
  if (!email) return [];
  return serviceRest<MemberProfile[]>(
    `member_profiles?email=ilike.${encodeURIComponent(email)}&select=*&limit=1`,
  );
}

async function findProfileByPhone(phone: string) {
  if (!phone) return [];
  return serviceRest<MemberProfile[]>(
    `member_profiles?phone=eq.${encodeURIComponent(phone)}&select=*&limit=1`,
  );
}

async function ensureMemberProfile({
  user,
  draft,
  customer,
}: {
  user: AuthUser | null;
  draft: OrderDraft | null;
  customer: ReturnType<typeof customerFromDraft>;
}) {
  let profiles: MemberProfile[] = [];

  if (user) {
    profiles = await serviceRest<MemberProfile[]>(
      `member_profiles?auth_user_id=eq.${user.id}&select=*&limit=1`,
    );
  }

  if (!profiles[0] && draft?.member_profile_id) {
    profiles = await serviceRest<MemberProfile[]>(
      `member_profiles?id=eq.${draft.member_profile_id}&select=*&limit=1`,
    );
  }

  if (!profiles[0]) profiles = await findProfileByEmail(customer.email);
  if (!profiles[0]) profiles = await findProfileByPhone(customer.phone);

  if (profiles[0]) {
    const shouldBindAuth = user && !profiles[0].auth_user_id;
    if (shouldBindAuth) {
      const rows = await serviceRest<MemberProfile[]>(
        `member_profiles?id=eq.${profiles[0].id}`,
        {
          method: "PATCH",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({
            auth_user_id: user.id,
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            line_id: customer.lineId,
            updated_at: new Date().toISOString(),
          }),
        },
      );
      return rows[0];
    }
    return profiles[0];
  }

  const rows = await serviceRest<MemberProfile[]>("member_profiles", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      auth_user_id: user?.id ?? null,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      line_id: customer.lineId,
    }),
  });
  return rows[0] ?? null;
}

export async function POST(request: Request) {
  try {
    const accessToken = bearer(request);
    const user = await getOptionalUser(accessToken);
    const body = (await request.json()) as CheckoutBody;
    const draftToken = body.draftToken?.trim();

    let draft: OrderDraft | null = null;
    let items;
    let subtotal;
    let businessType: CommerceOrder["business_type"] = "標準車款";
    let sourceDraftId: string | null = null;
    let source = "官網訂單";
    let createdBy = "官網";
    let responsibleStore = "";
    let customer = {
      name: body.customer?.name ?? "",
      phone: body.customer?.phone ?? "",
      email: body.customer?.email ?? "",
      lineId: body.customer?.lineId ?? "",
      address: body.customer?.address ?? "",
    };

    if (draftToken) {
      const drafts = await serviceRest<OrderDraft[]>(
        `order_drafts?confirmation_token=eq.${encodeURIComponent(draftToken)}&select=*&limit=1`,
      );
      draft = drafts[0] ?? null;
      if (!draft || draft.status === "cancelled") {
        throw new Error("找不到可付款的訂單草稿。");
      }
      if (draft.status === "paid") {
        throw new Error("此訂單已完成付款。");
      }
      if (draft.auth_user_id && user && draft.auth_user_id !== user.id) {
        throw new Error("此訂單已綁定其他會員。");
      }

      customer = customerFromDraft(draft, body);
      items = draft.items;
      subtotal = draft.total;
      businessType = draft.business_type;
      sourceDraftId = draft.id;
      source = draft.order_source || "後台人工";
      createdBy = draft.created_by;
      responsibleStore = draft.responsible_store;
    } else {
      if (!user) throw new Error("請先登入會員再進行官網結帳。");
      const resolved = await resolveCartItems(body.cartItems ?? []);
      items = resolved.items;
      subtotal = resolved.subtotal;
    }

    const memberProfile = await ensureMemberProfile({ user, draft, customer });
    const deliveryFee = body.deliveryMethod === "宅配到府" ? 800 : 0;
    const total = subtotal + deliveryFee;
    const paymentStatus =
      body.paymentMethod === "atm" ? "awaiting_transfer" : "pending";
    const orderStatus =
      body.paymentMethod === "atm" ? "awaiting_transfer" : "pending_payment";

    const baseOrderData = {
      auth_user_id: user?.id ?? null,
      member_id: memberProfile?.id ?? null,
      member_profile_id: memberProfile?.id ?? null,
      source_draft_id: sourceDraftId,
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        lineId: customer.lineId,
        address: customer.address,
      },
      customer_name: customer.name,
      customer_phone: customer.phone,
      customer_email: customer.email,
      line_id: customer.lineId,
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
      address: customer.address,
      notes: body.note ?? "",
      note: body.note ?? "",
      payment_method: body.paymentMethod,
      payment_status: paymentStatus,
      order_status: orderStatus,
      checkout_token: crypto.randomUUID(),
      created_by: createdBy,
      responsible_store: responsibleStore,
      updated_at: new Date().toISOString(),
    };

    let rows: CommerceOrder[];
    if (sourceDraftId) {
      const existing = await serviceRest<CommerceOrder[]>(
        `customer_orders?source_draft_id=eq.${sourceDraftId}&select=*&limit=1`,
      );
      if (existing[0]?.payment_status === "paid") {
        throw new Error("此訂單已完成付款。");
      }

      const orderData = {
        ...baseOrderData,
        auth_user_id: user?.id ?? existing[0]?.auth_user_id ?? null,
        member_id: memberProfile?.id ?? existing[0]?.member_id ?? null,
        member_profile_id: memberProfile?.id ?? existing[0]?.member_id ?? null,
      };

      rows = existing[0]
        ? await serviceRest<CommerceOrder[]>(`customer_orders?id=eq.${existing[0].id}`, {
            method: "PATCH",
            headers: { Prefer: "return=representation" },
            body: JSON.stringify(orderData),
          })
        : await serviceRest<CommerceOrder[]>("customer_orders", {
            method: "POST",
            headers: { Prefer: "return=representation" },
            body: JSON.stringify({ ...orderData, order_no: orderNo() }),
          });
    } else {
      rows = await serviceRest<CommerceOrder[]>("customer_orders", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ ...baseOrderData, order_no: orderNo() }),
      });
    }

    if (sourceDraftId) {
      await serviceRest(`order_drafts?id=eq.${sourceDraftId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "awaiting_payment",
          payment_status: paymentStatus,
          auth_user_id: user?.id ?? draft?.auth_user_id ?? null,
          member_profile_id: memberProfile?.id ?? draft?.member_profile_id ?? null,
          updated_at: new Date().toISOString(),
        }),
      });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "建立訂單失敗，請稍後再試。",
      },
      { status: 400 },
    );
  }
}
