import type {
  AssemblyStatus,
  BusinessType,
  DeliveryStatus,
  LogisticsPackage,
  LogisticsOrder,
  LogisticsStatus,
  ProductType,
  PackageHandler,
  PackageItemType,
} from "@/types/logistics";

export const logisticsStatuses: LogisticsStatus[] = [
  "待出貨",
  "已出貨",
  "已收貨",
  "已拆包",
  "已發往台灣",
  "已到台灣",
  "配送中",
  "已簽收",
];

export const assemblyStatuses: AssemblyStatus[] = ["不需組裝", "待組裝", "組裝中", "已完成"];
export const deliveryStatuses: DeliveryStatus[] = ["未交車", "已交車"];
export const businessTypes: BusinessType[] = [
  "標準車款 / 客製車款",
  "代購代運電動車",
  "一般商品及特殊商品代購",
];
export const productTypes: ProductType[] = [
  "標準車款",
  "客製車款",
  "代購代運電動車",
  "一般商品代購",
  "特殊商品代購",
];
export const packageItemTypes: PackageItemType[] = ["車輪", "車架", "電池", "其他"];
export const packageHandlers: PackageHandler[] = [
  "SlowBike 營運管理端",
  "四葉物流",
  "康哥",
  "三哥國際物流",
  "貨拉拉",
  "其他",
];

export const STORE_KEY = "slowbike-logistics-orders-v1";

function createPackage(
  itemType: PackageItemType,
  handlerUnit: PackageHandler,
): LogisticsPackage {
  return {
    id: crypto.randomUUID(),
    name: itemType,
    itemType,
    customItemName: "",
    handler: handlerUnit,
    handlerUnit,
    customHandler: "",
    shippingMethod: "",
    status: "待出貨",
    trackingNumber: "",
    note: "",
  };
}

export function createStandardBikePackages(): LogisticsPackage[] {
  return [
    createPackage("車輪", "三哥國際物流"),
    createPackage("車架", "三哥國際物流"),
    createPackage("電池", "三哥國際物流"),
  ];
}

export function createProxyBikePackages(): LogisticsPackage[] {
  return [
    createPackage("車輪", "四葉物流"),
    createPackage("車架", "四葉物流"),
    createPackage("電池", "三哥國際物流"),
  ];
}

export function createGeneralProductPackages(): LogisticsPackage[] {
  return [createPackage("其他", "四葉物流")];
}

export function getPackageName(item: LogisticsPackage) {
  return item.itemType === "其他" ? item.customItemName || "其他" : item.itemType || item.name;
}

export function getPackageHandler(item: LogisticsPackage) {
  return item.handlerUnit === "其他"
    ? item.customHandler || "其他"
    : item.handlerUnit || item.handler;
}

export function normalizeLogisticsOrder(order: LogisticsOrder): LogisticsOrder {
  const assemblyMethod =
    order.assemblyMethod ||
    (order.assemblyStatus === "不需組裝"
      ? order.product.type === "代購代運電動車"
        ? "客戶自行組裝"
        : "不需組裝"
      : "門市組裝");

  if (Array.isArray(order.packages)) {
    return {
      ...order,
      assemblyMethod,
      packages: order.packages.map((item) => {
        const itemType = packageItemTypes.includes(item.name as PackageItemType)
          ? (item.name as PackageItemType)
          : "其他";
        const handlerUnit = packageHandlers.includes(item.handler as PackageHandler)
          ? (item.handler as PackageHandler)
          : "其他";
        return {
          ...item,
          itemType: item.itemType || itemType,
          customItemName: item.customItemName || (itemType === "其他" ? item.name : ""),
          handlerUnit: item.handlerUnit || handlerUnit,
          customHandler: item.customHandler || (handlerUnit === "其他" ? item.handler : ""),
        };
      }),
    };
  }

  if (order.product.type === "代購代運電動車") {
    const proxyPackages = createProxyBikePackages().map((item) => {
      const trackingNumber =
        item.name === "車輪"
          ? order.tracking.wheel
          : item.name === "車架"
            ? order.tracking.frame
            : order.tracking.battery;
      return {
        ...item,
        status: order.logisticsStatus,
        trackingNumber,
      };
    });
    return { ...order, assemblyMethod, packages: proxyPackages };
  }

  const legacyPackages: LogisticsPackage[] = [
    ["車輪", order.tracking.wheel],
    ["車架", order.tracking.frame],
    ["電池", order.tracking.battery],
    ["一般商品", order.tracking.general],
    ["其他包裹", order.tracking.other],
  ]
    .filter(([, trackingNumber]) => trackingNumber)
    .map(([name, trackingNumber]) => ({
      id: crypto.randomUUID(),
      name,
      itemType: packageItemTypes.includes(name as PackageItemType)
        ? (name as PackageItemType)
        : "其他",
      customItemName: packageItemTypes.includes(name as PackageItemType) ? "" : name,
      handler: "",
      handlerUnit: "SlowBike 營運管理端",
      customHandler: "",
      shippingMethod: "",
      status: order.logisticsStatus,
      trackingNumber,
      note: "",
    }));

  return {
    ...order,
    assemblyMethod,
    packages: legacyPackages,
  };
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function generateOrderNumber(orders: LogisticsOrder[]) {
  const date = new Date();
  const datePart = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
  const sameDayCount = orders.filter((order) => order.orderNumber.includes(datePart)).length + 1;
  return `SB-${datePart}-${String(sameDayCount).padStart(3, "0")}`;
}

export function getProgress(order: LogisticsOrder) {
  const logisticsIndex = logisticsStatuses.indexOf(order.logisticsStatus);
  return [
    { label: "建立訂單", done: true },
    { label: "已出貨", done: logisticsIndex >= 1 },
    { label: "物流收貨", done: logisticsIndex >= 2 },
    { label: "完成拆包", done: logisticsIndex >= 3 },
    { label: "發往台灣", done: logisticsIndex >= 4 },
    { label: "抵達台灣", done: logisticsIndex >= 5 },
    {
      label:
        order.assemblyStatus === "不需組裝"
          ? "不需組裝"
          : `${order.assemblyStore || "組裝店"} ${order.assemblyStatus}`,
      done: order.assemblyStatus === "不需組裝" || order.assemblyStatus === "已完成",
      active: order.assemblyStatus === "待組裝" || order.assemblyStatus === "組裝中",
    },
    { label: "已交車", done: order.deliveryStatus === "已交車" },
  ];
}

export function matchesOrder(order: LogisticsOrder, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return [order.orderNumber, order.customer.name, order.customer.phone]
    .join(" ")
    .toLowerCase()
    .includes(normalized);
}

export function statusTone(status: LogisticsStatus | AssemblyStatus | DeliveryStatus) {
  if (["已簽收", "已完成", "已交車"].includes(status)) {
    return "bg-emerald-100 text-emerald-800";
  }
  if (["配送中", "已到台灣", "組裝中"].includes(status)) {
    return "bg-amber-100 text-amber-800";
  }
  if (["待出貨", "待組裝", "未交車"].includes(status)) {
    return "bg-stone-200 text-stone-700";
  }
  return "bg-olive-100 text-olive-800";
}
