export type ProductStatus = "active" | "hidden";

export type Product = {
  id?: string;
  slug: string;
  name: string;
  subtitle: string;
  price: number;
  imagePath: string;
  summary: string;
  specs: string;
  highlights: string;
  salesCopy: string;
  status: ProductStatus;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Member = {
  id?: string;
  phone: string;
  name: string;
  idNumber: string;
  lineName: string;
  email: string;
  address: string;
  note: string;
  createdAt?: string;
  updatedAt?: string;
};

export type MemberVehicle = {
  id?: string;
  memberPhone: string;
  ownerName: string;
  model: string;
  color: string;
  frameNo: string;
  motorNo: string;
  batteryNo: string;
  purchaseDate: string;
  warrantyStart: string;
  warrantyEnd: string;
  note: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PaymentMode = "once" | "installment3";

export type PaymentLink = {
  id?: string;
  token: string;
  title: string;
  model: string;
  color: string;
  amount: number;
  stockQuantity: number;
  paymentMode: PaymentMode;
  note: string;
  status: "active" | "paused";
  createdAt?: string;
  updatedAt?: string;
};

export type OrderStatus = "pending" | "paid" | "failed" | "expired";

export type Order = {
  id?: string;
  merchantOrderNo: string;
  paymentLinkToken: string;
  buyerName: string;
  buyerPhone: string;
  buyerLineName: string;
  buyerEmail: string;
  amount: number;
  paymentMode: PaymentMode;
  status: OrderStatus;
  newebpayTradeNo: string;
  respondCode: string;
  paidAt: string;
  rawResponse: string;
  createdAt?: string;
  updatedAt?: string;
};

export type LogisticsStatus =
  | "待入庫"
  | "已到大陸倉"
  | "已打包"
  | "已發往台灣"
  | "台灣配送中"
  | "已完成"
  | "異常";

export type LogisticsOrder = {
  id?: string;
  batchNo: string;
  memberPhone: string;
  customerName: string;
  itemName: string;
  chinaTrackingNos: string;
  taiwanTrackingNos: string;
  packageCount: number;
  weightKg: string;
  volume: string;
  rmbCost: number;
  twdCost: number;
  exchangeRate: string;
  status: LogisticsStatus;
  mergeSplitNote: string;
  note: string;
  createdAt?: string;
  updatedAt?: string;
};

export type LogisticsFile = {
  id?: string;
  logisticsOrderId: string;
  fileKey: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  publicUrl: string;
  note: string;
  createdAt?: string;
};
