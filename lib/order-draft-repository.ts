import { supabase } from "@/lib/supabase";
import type { OrderDraft, OrderDraftInput } from "@/types/order-draft";

export async function createOrderDraft(input: OrderDraftInput) {
  const token = crypto.randomUUID();
  const date = new Date();
  const draftNo = `DRAFT-${date
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "")}-${String(date.getTime()).slice(-5)}`;

  const rows = await supabase.insert<OrderDraft[]>("order_drafts", {
    confirmation_token: token,
    draft_no: draftNo,
    auth_user_id: null,
    ...input,
    status: "draft",
  });
  return rows[0];
}

export function fetchOrderDraftByToken(token: string) {
  return supabase.rpc<OrderDraft[]>("get_order_draft_by_token", {
    draft_token: token,
  });
}

export function claimOrderDraft(token: string, accessToken: string) {
  return supabase.rpc<OrderDraft[]>(
    "claim_order_draft",
    { draft_token: token },
    accessToken,
  );
}

export function fetchMemberOrderDrafts(
  authUserId: string,
  accessToken: string,
) {
  return supabase.select<OrderDraft[]>(
    "order_drafts",
    `select=*&auth_user_id=eq.${encodeURIComponent(authUserId)}&order=created_at.desc`,
    accessToken,
  );
}
