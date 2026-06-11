export type MemberProfile = {
  id: string;
  email: string;
  displayName: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderStatus =
  | "inquiry"
  | "confirmed"
  | "deposit-paid"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export type Order = {
  id: string;
  memberId: string;
  status: OrderStatus;
  items: Array<{
    productId: string;
    productName: string;
    variantId: string;
    variantName: string;
    color: string;
    accessories: Array<{
      accessoryId: string;
      accessoryName: string;
      unitPrice: number;
    }>;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: "TWD";
  paymentProvider: "newebpay" | null;
  paymentStatus: "unpaid" | "pending" | "paid" | "failed" | "refunded";
  merchantOrderNo: string | null;
  deliveryMethod: "hengchun-store" | "guishan-store" | "home-delivery";
  note: string | null;
  createdAt: string;
  updatedAt: string;
};
