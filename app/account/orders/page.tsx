import type { Metadata } from "next";
import { MemberOrders } from "@/components/member/member-orders";
import { MemberPageShell } from "@/components/member/member-page-shell";

export const metadata: Metadata = { title: "我的訂單" };

export default function MemberOrdersPage() {
  return (
    <MemberPageShell
      eyebrow="MY ORDERS"
      title="我的訂單"
      description="查看你的 SlowBike 訂單內容、金額與付款狀態。"
    >
      <MemberOrders />
    </MemberPageShell>
  );
}
