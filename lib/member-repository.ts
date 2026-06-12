import { supabase } from "@/lib/supabase";
import type { MemberOrderRow, MemberWarrantyRow } from "@/types/member";

export function fetchMemberOrders(authUserId: string, accessToken: string) {
  return supabase.select<MemberOrderRow[]>(
    "customer_orders",
    `select=*&auth_user_id=eq.${encodeURIComponent(authUserId)}&order=created_at.desc`,
    accessToken,
  );
}

export function fetchMemberWarranties(
  authUserId: string,
  accessToken: string,
) {
  return supabase.select<MemberWarrantyRow[]>(
    "member_warranties",
    `select=*&auth_user_id=eq.${encodeURIComponent(authUserId)}&order=created_at.desc`,
    accessToken,
  );
}
