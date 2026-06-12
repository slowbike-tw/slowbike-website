export type OrderDraftStatus =
  | "draft"
  | "claimed"
  | "awaiting_payment"
  | "paid"
  | "cancelled";

export type OrderDraft = {
  id: string;
  confirmation_token: string;
  draft_no: string;
  auth_user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: Array<{
    productName: string;
    specification: string;
    color: string;
    quantity: number;
    unitPrice: number;
  }>;
  total: number;
  notes: string;
  status: OrderDraftStatus;
  created_by: string;
  claimed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderDraftInput = Pick<
  OrderDraft,
  | "customer_name"
  | "customer_email"
  | "customer_phone"
  | "items"
  | "total"
  | "notes"
  | "created_by"
>;
