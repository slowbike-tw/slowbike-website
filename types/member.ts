export type MemberProfile = {
  id: string;
  authUserId: string;
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
  authUserId: string;
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

export type MemberOrderRow = {
  id: string;
  auth_user_id: string;
  source_draft_id: string | null;
  order_no: string;
  customer: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  items: Array<{
    productName?: string;
    variantName?: string;
    color?: string;
    quantity?: number;
  }>;
  subtotal: number;
  shipping_fee: number;
  total: number;
  currency: "TWD";
  order_status: string;
  payment_status: string;
  delivery_method: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type MemberWarrantyRow = {
  id: string;
  auth_user_id: string;
  customer_order_id: string | null;
  product_name: string;
  serial_number: string | null;
  warranty_data: Record<string, unknown>;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};
