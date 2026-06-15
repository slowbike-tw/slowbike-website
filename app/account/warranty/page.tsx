import type { Metadata } from "next";
import { MemberPageShell } from "@/components/member/member-page-shell";
import { MemberWarranties } from "@/components/member/member-warranties";

export const metadata: Metadata = { title: "我的保固" };

export default function MemberWarrantyPage() {
  return (
    <MemberPageShell
      eyebrow="MY WARRANTY"
      title="我的保固"
      description="查看已完成登錄的 SlowBike 商品保固資訊。"
    >
      <MemberWarranties />
    </MemberPageShell>
  );
}
