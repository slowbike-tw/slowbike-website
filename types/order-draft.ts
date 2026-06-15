export type OrderBusinessType =
  | "標準車款"
  | "客製車款"
  | "大陸產品代購"
  | "大陸電動車運輸";

export type OrderDraftStatus =
  | "draft"
  | "claimed"
  | "awaiting_payment"
  | "paid"
  | "cancelled";

export type DraftItem = {
  productName: string;
  specification: string;
  color: string;
  quantity: number;
  unitPrice: number;
  accessories?: string[];
};

export type DraftLogisticsPackage = {
  name: string;
  handler: string;
  status: "待出貨";
};

export type DraftLogisticsTemplate = {
  packages: DraftLogisticsPackage[];
  assemblyStatus: "待組裝" | "不需組裝";
  deliveryStatus: "未交車";
};

export type OrderDraft = {
  id: string;
  confirmation_token: string;
  draft_no: string;
  order_source: string;
  business_type: OrderBusinessType;
  member_profile_id: string | null;
  auth_user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  line_id: string;
  product_summary: string;
  custom_details: Record<string, string | number | boolean | string[]>;
  logistics_template: DraftLogisticsTemplate;
  items: DraftItem[];
  total: number;
  deposit_amount: number;
  balance_amount: number;
  delivery_method: string;
  assembly_method: string;
  assembly_store: string;
  shipping_address: string;
  notes: string;
  payment_status: string;
  status: OrderDraftStatus;
  created_by: string;
  responsible_store: string;
  linked_logistics_order_id: string | null;
  claimed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderDraftInput = Pick<
  OrderDraft,
  | "order_source"
  | "business_type"
  | "customer_name"
  | "customer_email"
  | "customer_phone"
  | "line_id"
  | "product_summary"
  | "custom_details"
  | "logistics_template"
  | "items"
  | "total"
  | "deposit_amount"
  | "balance_amount"
  | "delivery_method"
  | "assembly_method"
  | "assembly_store"
  | "shipping_address"
  | "notes"
  | "created_by"
  | "responsible_store"
>;

export type MemberProfile = {
  id: string;
  auth_user_id: string | null;
  name: string;
  phone: string;
  email: string;
  line_id: string;
  created_at: string;
  updated_at: string;
};
