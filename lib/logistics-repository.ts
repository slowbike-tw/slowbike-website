import { normalizeLogisticsOrder } from "@/lib/logistics";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { LogisticsOrder } from "@/types/logistics";

const TABLE = "logistics_orders";

type LogisticsOrderRow = {
  id: string;
  member_id: string | null;
  order_id: string | null;
  auth_user_id: string | null;
  customer_order_id: string | null;
  logistics_source: string;
  source_order_no: string;
  customer_phone: string;
  customer_email: string;
  order_no: string;
  business_type: string;
  customer: LogisticsOrder["customer"];
  product: LogisticsOrder["product"];
  tracking: LogisticsOrder["tracking"];
  packages: LogisticsOrder["packages"];
  logistics_status: string;
  assembly_method: string;
  assembly_status: string;
  assembly_store: string;
  delivery_status: string;
  delivery_method: string;
  created_by: string;
  responsible_store: string;
  logistics_party: string;
  notes: string;
  progress: LogisticsOrder["progress"];
  photos: string[];
  created_at: string;
  updated_at: string;
};

function toRow(order: LogisticsOrder): LogisticsOrderRow {
  return {
    id: order.id,
    member_id: order.memberId || null,
    order_id: order.orderId || null,
    auth_user_id: order.authUserId || null,
    customer_order_id: order.customerOrderId || null,
    logistics_source: order.logisticsSource ?? "後台人工",
    source_order_no: order.sourceOrderNo ?? "",
    customer_phone: order.customer.phone,
    customer_email: order.customer.email ?? "",
    order_no: order.orderNumber,
    business_type: order.businessType,
    customer: order.customer,
    product: order.product,
    tracking: order.tracking,
    packages: order.packages,
    logistics_status: order.logisticsStatus,
    assembly_method: order.assemblyMethod,
    assembly_status: order.assemblyStatus,
    assembly_store: order.assemblyStore,
    delivery_status: order.deliveryStatus,
    delivery_method: order.deliveryMethod,
    created_by: order.createdBy,
    responsible_store: order.responsibleStore ?? order.assemblyStore,
    logistics_party: order.logisticsParty ?? "",
    notes: order.note,
    progress: order.progress,
    photos: order.photos,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
  };
}

function fromRow(row: LogisticsOrderRow): LogisticsOrder {
  return normalizeLogisticsOrder({
    id: row.id,
    memberId: row.member_id ?? undefined,
    orderId: row.order_id ?? undefined,
    authUserId: row.auth_user_id ?? undefined,
    customerOrderId: row.customer_order_id ?? undefined,
    logisticsSource:
      (row.logistics_source as LogisticsOrder["logisticsSource"]) ?? "後台人工",
    sourceOrderNo: row.source_order_no ?? "",
    orderNumber: row.order_no,
    businessType: row.business_type as LogisticsOrder["businessType"],
    customer: row.customer,
    product: row.product,
    tracking: row.tracking ?? {
      wheel: "",
      frame: "",
      battery: "",
      general: "",
      other: "",
    },
    packages: row.packages ?? [],
    logisticsStatus: row.logistics_status as LogisticsOrder["logisticsStatus"],
    assemblyMethod: row.assembly_method as LogisticsOrder["assemblyMethod"],
    assemblyStatus: row.assembly_status as LogisticsOrder["assemblyStatus"],
    assemblyStore: row.assembly_store as LogisticsOrder["assemblyStore"],
    deliveryStatus: row.delivery_status as LogisticsOrder["deliveryStatus"],
    deliveryMethod: row.delivery_method as LogisticsOrder["deliveryMethod"],
    createdBy: row.created_by,
    responsibleStore: row.responsible_store ?? "",
    logisticsParty: row.logistics_party ?? "",
    note: row.notes ?? "",
    progress: row.progress ?? [],
    photos: row.photos ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export async function fetchLogisticsOrders() {
  const rows = await supabase.select<LogisticsOrderRow[]>(
    TABLE,
    "select=*&order=created_at.desc",
  );
  return rows.map(fromRow);
}

export async function fetchMemberLogisticsOrders(
  authUserId: string,
  accessToken: string,
) {
  const rows = await supabase.select<LogisticsOrderRow[]>(
    TABLE,
    `select=*&auth_user_id=eq.${encodeURIComponent(authUserId)}&order=created_at.desc`,
    accessToken,
  );
  return rows.map(fromRow);
}

export async function insertLogisticsOrder(order: LogisticsOrder) {
  const rows = await supabase.insert<LogisticsOrderRow[]>(TABLE, toRow(order));
  return fromRow(rows[0]);
}

export async function updateLogisticsOrder(order: LogisticsOrder) {
  const rows = await supabase.update<LogisticsOrderRow[]>(
    TABLE,
    `id=eq.${encodeURIComponent(order.id)}`,
    toRow(order),
  );
  return rows[0] ? fromRow(rows[0]) : order;
}

export async function deleteLogisticsOrder(id: string) {
  const rows = await supabase.delete<LogisticsOrderRow[]>(
    TABLE,
    `id=eq.${encodeURIComponent(id)}`,
  );
  if (rows.length === 0) {
    throw new Error("找不到要刪除的物流單，可能已被其他人刪除。");
  }
}

export { isSupabaseConfigured };
