import type { Metadata } from "next";
import { MemberPageShell } from "@/components/member/member-page-shell";
import { MemberWarranties } from "@/components/member/member-warranties";

export const metadata: Metadata = { title: "我的保固" };

export default function MemberWarrantyPage() {
  return (
    <MemberPageShell
      eyebrow="MY WARRANTY"
      title="我的保固"
      description="電子保固卡頁面已預留，後續沿用相同會員 ID 自動歸戶。"
    >
      <MemberWarranties />
    </MemberPageShell>
  );
}
