import type { Metadata } from "next";
import { MemberOrders } from "@/components/member/member-orders";
import { MemberPageShell } from "@/components/member/member-page-shell";

export const metadata: Metadata = { title: "我的訂單" };

export default function MemberOrdersPage() {
  return (
    <MemberPageShell
      eyebrow="MY ORDERS"
      title="我的訂單"
      description="僅顯示綁定目前會員 ID 的 SlowBike 官網訂單。"
    >
      <MemberOrders />
    </MemberPageShell>
  );
}
