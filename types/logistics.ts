export type UserRole = "admin" | "logistics" | "assembly-store";

export type LogisticsSource =
  | "官網訂單"
  | "後台人工"
  | "客製車訂單"
  | "代購代運"
  | "同行訂購"
  | "歷史補建"
  | "其他";

export type BusinessType =
  | "標準車款 / 客製車款"
  | "代購代運電動車"
  | "一般商品及特殊商品代購";

export type ProductType =
  | "標準車款"
  | "客製車款"
  | "代購代運電動車"
  | "一般商品代購"
  | "特殊商品代購";

export type LogisticsStatus =
  | "待出貨"
  | "已出貨"
  | "已收貨"
  | "已拆包"
  | "已發往台灣"
  | "已到台灣"
  | "配送中"
  | "已簽收";

export type AssemblyStatus = "不需組裝" | "待組裝" | "組裝中" | "已完成";
export type AssemblyStore = "" | "恆春店" | "龜山店";
export type AssemblyMethod = "門市組裝" | "客戶自行組裝" | "不需組裝";
export type DeliveryStatus = "未交車" | "已交車";
export type DeliveryMethod =
  | "門市自取"
  | "宅配到府"
  | "三包直接寄送客戶"
  | "寄送客戶";
export type PackageItemType = "車輪" | "車架" | "電池" | "其他";
export type PackageHandler =
  | "SlowBike 營運管理端"
  | "四葉物流"
  | "康哥"
  | "三哥國際物流"
  | "貨拉拉"
  | "其他";

export type CustomerInfo = {
  name: string;
  phone: string;
  email?: string;
  lineId: string;
  address: string;
  note: string;
};

export type ProductInfo = {
  type: ProductType;
  name: string;
  specification: string;
  color: string;
  battery: string;
  note: string;
};

export type PackageTracking = {
  wheel: string;
  frame: string;
  battery: string;
  general: string;
  other: string;
};

export type LogisticsPackage = {
  id: string;
  name: string;
  itemType?: PackageItemType;
  customItemName?: string;
  handler: string;
  handlerUnit?: PackageHandler;
  customHandler?: string;
  shippingMethod: string;
  status: LogisticsStatus;
  trackingNumber: string;
  note: string;
};

export type ProgressEvent = {
  id: string;
  label: string;
  completed: boolean;
  completedAt?: string;
};

export type LogisticsOrder = {
  id: string;
  memberId?: string;
  orderId?: string;
  authUserId?: string;
  customerOrderId?: string;
  logisticsSource?: LogisticsSource;
  sourceOrderNo?: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  responsibleStore?: string;
  logisticsParty?: string;
  businessType: BusinessType;
  note: string;
  customer: CustomerInfo;
  product: ProductInfo;
  tracking: PackageTracking;
  packages: LogisticsPackage[];
  logisticsStatus: LogisticsStatus;
  assemblyMethod: AssemblyMethod;
  assemblyStatus: AssemblyStatus;
  assemblyStore: AssemblyStore;
  deliveryStatus: DeliveryStatus;
  deliveryMethod: DeliveryMethod;
  progress: ProgressEvent[];
  photos: string[];
};

export type LogisticsOrderInput = Omit<
  LogisticsOrder,
  "id" | "orderNumber" | "createdAt" | "updatedAt" | "progress"
>;
