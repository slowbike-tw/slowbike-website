import type {
  DraftLogisticsTemplate,
  OrderBusinessType,
} from "@/types/order-draft";

export function createDraftLogisticsTemplate(
  businessType: OrderBusinessType,
  assemblyMethod: string,
): DraftLogisticsTemplate {
  const assemblyStatus =
    assemblyMethod === "門市組裝" ? "待組裝" : "不需組裝";

  if (businessType === "大陸產品代購") {
    return {
      packages: [
        {
          name: "商品",
          handler: "四葉物流",
          status: "待出貨",
        },
      ],
      assemblyStatus: "不需組裝",
      deliveryStatus: "未交車",
    };
  }

  if (businessType === "大陸電動車運輸") {
    return {
      packages: [
        { name: "車輪", handler: "四葉物流", status: "待出貨" },
        { name: "車架", handler: "四葉物流", status: "待出貨" },
        { name: "電池", handler: "三哥國際物流", status: "待出貨" },
      ],
      assemblyStatus,
      deliveryStatus: "未交車",
    };
  }

  return {
    packages: [
      {
        name: "車輪",
        handler: "SlowBike 營運管理端",
        status: "待出貨",
      },
      {
        name: "車架",
        handler: "SlowBike 營運管理端",
        status: "待出貨",
      },
      {
        name: "電池",
        handler: "SlowBike 營運管理端",
        status: "待出貨",
      },
    ],
    assemblyStatus,
    deliveryStatus: "未交車",
  };
}
