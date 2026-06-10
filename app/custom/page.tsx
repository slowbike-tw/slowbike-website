import type { Metadata } from "next";
import { Bike } from "lucide-react";
import { ServicePage } from "@/components/service-page";

export const metadata: Metadata = { title: "客製化電動車" };

export default function CustomPage() {
  return (
    <ServicePage
      eyebrow="CUSTOM BUILD"
      title="把腦中的那台車，真正騎上街"
      description="從 SUPER73、黑武士風格到完整客製改裝，依照騎乘需求與個人風格打造。"
      sectionTitle="你的風格，不必套用標準答案"
      sectionDescription="從用途、預算、身高與喜歡的外型開始，陪你整理需求並規劃適合的客製方案。"
      items={["SUPER73 風格規劃", "黑武士風格車款", "車身配色與配件", "騎乘需求客製改裝"]}
      steps={[
        { number: "01", title: "分享想法", text: "提供喜歡的車款圖片、用途、身高與預算。" },
        { number: "02", title: "確認方案", text: "依需求討論規格、配件、價格與預估時程。" },
        { number: "03", title: "製作交車", text: "完成組裝測試後，安排門市或配送交車。" },
      ]}
      icon={Bike}
      action="Line 客製諮詢"
    />
  );
}
