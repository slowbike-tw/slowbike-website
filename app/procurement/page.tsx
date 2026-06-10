import type { Metadata } from "next";
import { Boxes } from "lucide-react";
import { ServicePage } from "@/components/service-page";

export const metadata: Metadata = { title: "大陸電動產品代購" };

export default function ProcurementPage() {
  return (
    <ServicePage
      eyebrow="GLOBAL SOURCING"
      title="看見喜歡的產品，我們幫你帶回來"
      description="支援淘寶、拼多多、閒魚與 1688 電動產品代購，降低跨境採購的不確定性。"
      sectionTitle="跨平台找貨與採購協助"
      sectionDescription="無論是整車、零件或電動產品，提供連結或圖片，我們協助確認商品與後續安排。"
      items={["淘寶商品代購", "拼多多商品代購", "閒魚商品代購", "1688 商品代購"]}
      steps={[
        { number: "01", title: "提供連結", text: "傳送商品連結、規格與希望購買的數量。" },
        { number: "02", title: "確認報價", text: "協助確認商品資訊並提供代購與相關費用。" },
        { number: "03", title: "採購安排", text: "確認後進行採購，並持續回報後續進度。" },
      ]}
      icon={Boxes}
      action="Line 諮詢代購"
    />
  );
}
