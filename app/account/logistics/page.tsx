import type { Metadata } from "next";
import { MemberLogistics } from "@/components/member/member-logistics";
import { MemberPageShell } from "@/components/member/member-page-shell";

export const metadata: Metadata = { title: "我的物流" };

export default function MemberLogisticsPage() {
  return (
    <MemberPageShell
      eyebrow="MY LOGISTICS"
      title="我的物流"
      description="掌握每一筆訂單的出貨、運輸、組裝與交車進度。"
    >
      <MemberLogistics />
    </MemberPageShell>
  );
}
