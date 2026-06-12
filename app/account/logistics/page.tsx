import type { Metadata } from "next";
import { MemberLogistics } from "@/components/member/member-logistics";
import { MemberPageShell } from "@/components/member/member-page-shell";

export const metadata: Metadata = { title: "我的物流" };

export default function MemberLogisticsPage() {
  return (
    <MemberPageShell
      eyebrow="MY LOGISTICS"
      title="我的物流"
      description="以會員 ID 安全查詢物流、組裝與交車進度，不使用電話比對。"
    >
      <MemberLogistics />
    </MemberPageShell>
  );
}
