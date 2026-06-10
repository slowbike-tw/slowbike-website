import type { Metadata } from "next";
import { PackageCheck } from "lucide-react";
import { ServicePage } from "@/components/service-page";

export const metadata: Metadata = { title: "大陸電動車運輸" };

export default function ShippingPage() {
  return (
    <ServicePage
      eyebrow="PRO TRANSPORT"
      title="跨境運輸的細節，交給專業處理"
      description="提供拆車、分包與台灣專業組裝服務，協助大陸電動車安全抵達台灣。"
      sectionTitle="從出貨到組裝，一路有人處理"
      sectionDescription="依車型評估合適的拆分與包裝方式，到台後由專業人員完成組裝與基本確認。"
      items={["車輛拆解安排", "零件分類分包", "跨境運輸規劃", "台灣專業組裝"]}
      steps={[
        { number: "01", title: "車型評估", text: "提供車款、尺寸、重量與所在地等資料。" },
        { number: "02", title: "拆車分包", text: "依運輸條件安排拆解、保護與分類包裝。" },
        { number: "03", title: "到台組裝", text: "貨物抵台後安排專業組裝與後續交車。" },
      ]}
      icon={PackageCheck}
      action="Line 諮詢運輸"
    />
  );
}
