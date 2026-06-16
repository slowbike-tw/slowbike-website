import type { DraftItem, OrderBusinessType } from "@/types/order-draft";

export type CheckoutPaymentMethod =
  | "credit"
  | "credit-3"
  | "credit-6"
  | "credit-12"
  | "atm";

export type CommerceOrder = {
  id: string;
  order_no: string;
  member_id: string | null;
  auth_user_id: string | null;
  source_draft_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  line_id: string;
  order_source: string;
  business_type: OrderBusinessType;
  items: DraftItem[];
  total_amount: number;
  delivery_method: string;
  delivery_fee: number;
  address: string;
  note: string;
  payment_method: CheckoutPaymentMethod;
  payment_status: "unpaid" | "pending" | "awaiting_transfer" | "paid" | "failed";
  order_status: "pending_payment" | "awaiting_transfer" | "paid" | "processing" | "completed" | "cancelled";
  newebpay_trade_no: string | null;
  newebpay_response: Record<string, unknown>;
  checkout_token: string;
  linked_logistics_order_id: string | null;
  created_by: string;
  responsible_store: string;
  created_at: string;
  updated_at: string;
};

export type PaymentSettings = {
  bank_name: string;
  bank_code: string;
  account_name: string;
  account_number: string;
};
