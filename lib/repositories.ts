import { defaultProducts } from "@/lib/site-data";
import { serviceRest } from "@/lib/supabase-rest";
import type {
  LogisticsFile,
  LogisticsOrder,
  Member,
  MemberVehicle,
  Order,
  PaymentLink,
  Product,
} from "@/lib/types";

function now() {
  return new Date().toISOString();
}

function encode(value: string) {
  return encodeURIComponent(value);
}

export async function getProducts(options: { storefrontOnly?: boolean } = {}) {
  try {
    const filter = options.storefrontOnly ? "&status=eq.active" : "";
    const rows = await serviceRest<Product[]>(
      `sb_products?select=*&order=sortOrder.asc,createdAt.asc${filter}`,
    );
    return rows.length
      ? rows
      : defaultProducts.filter((product) => !options.storefrontOnly || product.status === "active");
  } catch {
    return defaultProducts.filter((product) => !options.storefrontOnly || product.status === "active");
  }
}

export async function getProductBySlug(slug: string) {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function upsertProduct(product: Product) {
  const payload = { ...product, updatedAt: now() };
  if (product.id) {
    const rows = await serviceRest<Product[]>(`sb_products?id=eq.${encode(product.id)}`, {
      method: "PATCH",
      body: payload,
      prefer: "return=representation",
    });
    return rows[0];
  }
  const rows = await serviceRest<Product[]>("sb_products", {
    method: "POST",
    body: { ...payload, createdAt: now() },
    prefer: "return=representation",
  });
  return rows[0];
}

export async function getMembers() {
  try {
    return await serviceRest<Member[]>("sb_members?select=*&order=createdAt.desc");
  } catch {
    return [];
  }
}

export async function upsertMember(member: Member) {
  const payload = { ...member, updatedAt: now() };
  if (member.id) {
    const rows = await serviceRest<Member[]>(`sb_members?id=eq.${encode(member.id)}`, {
      method: "PATCH",
      body: payload,
      prefer: "return=representation",
    });
    return rows[0];
  }
  const rows = await serviceRest<Member[]>("sb_members", {
    method: "POST",
    body: { ...payload, createdAt: now() },
    prefer: "return=representation",
  });
  return rows[0];
}

export async function getMemberVehicles() {
  try {
    return await serviceRest<MemberVehicle[]>("sb_member_vehicles?select=*&order=createdAt.desc");
  } catch {
    return [];
  }
}

export async function upsertMemberVehicle(vehicle: MemberVehicle) {
  const payload = { ...vehicle, updatedAt: now() };
  if (vehicle.id) {
    const rows = await serviceRest<MemberVehicle[]>(`sb_member_vehicles?id=eq.${encode(vehicle.id)}`, {
      method: "PATCH",
      body: payload,
      prefer: "return=representation",
    });
    return rows[0];
  }
  const rows = await serviceRest<MemberVehicle[]>("sb_member_vehicles", {
    method: "POST",
    body: { ...payload, createdAt: now() },
    prefer: "return=representation",
  });
  return rows[0];
}

export async function getPaymentLinks() {
  try {
    return await serviceRest<PaymentLink[]>("sb_payment_links?select=*&order=createdAt.desc");
  } catch {
    return [];
  }
}

export async function getPaymentLinkByToken(token: string) {
  const rows = await serviceRest<PaymentLink[]>(
    `sb_payment_links?token=eq.${encode(token)}&status=eq.active&select=*&limit=1`,
  );
  return rows[0] ?? null;
}

export async function createPaymentLink(link: PaymentLink) {
  const rows = await serviceRest<PaymentLink[]>("sb_payment_links", {
    method: "POST",
    body: { ...link, createdAt: now(), updatedAt: now() },
    prefer: "return=representation",
  });
  return rows[0];
}

export async function getOrders() {
  try {
    return await serviceRest<Order[]>("sb_orders?select=*&order=createdAt.desc");
  } catch {
    return [];
  }
}

export async function getOrderByMerchantNo(merchantOrderNo: string) {
  const rows = await serviceRest<Order[]>(
    `sb_orders?merchantOrderNo=eq.${encode(merchantOrderNo)}&select=*&limit=1`,
  );
  return rows[0] ?? null;
}

export async function createOrder(order: Order) {
  const rows = await serviceRest<Order[]>("sb_orders", {
    method: "POST",
    body: { ...order, createdAt: now(), updatedAt: now() },
    prefer: "return=representation",
  });
  return rows[0];
}

export async function updateOrder(merchantOrderNo: string, patch: Partial<Order>) {
  const rows = await serviceRest<Order[]>(`sb_orders?merchantOrderNo=eq.${encode(merchantOrderNo)}`, {
    method: "PATCH",
    body: { ...patch, updatedAt: now() },
    prefer: "return=representation",
  });
  return rows[0] ?? null;
}

export async function getLogisticsOrders(query = "") {
  try {
    const rows = await serviceRest<LogisticsOrder[]>("sb_logistics_orders?select=*&order=createdAt.desc");
    const keyword = query.trim().toLowerCase();
    if (!keyword) return rows;
    return rows.filter((row) =>
      [
        row.batchNo,
        row.memberPhone,
        row.customerName,
        row.itemName,
        row.chinaTrackingNos,
        row.taiwanTrackingNos,
        row.status,
        row.note,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  } catch {
    return [];
  }
}

export async function getLogisticsFiles(orderId: string) {
  try {
    return await serviceRest<LogisticsFile[]>(
      `sb_logistics_files?logisticsOrderId=eq.${encode(orderId)}&select=*&order=createdAt.desc`,
    );
  } catch {
    return [];
  }
}

export async function upsertLogisticsOrder(order: LogisticsOrder) {
  const payload = { ...order, updatedAt: now() };
  if (order.id) {
    const rows = await serviceRest<LogisticsOrder[]>(`sb_logistics_orders?id=eq.${encode(order.id)}`, {
      method: "PATCH",
      body: payload,
      prefer: "return=representation",
    });
    return rows[0];
  }
  const rows = await serviceRest<LogisticsOrder[]>("sb_logistics_orders", {
    method: "POST",
    body: { ...payload, createdAt: now() },
    prefer: "return=representation",
  });
  return rows[0];
}

export async function addLogisticsFile(file: LogisticsFile) {
  const rows = await serviceRest<LogisticsFile[]>("sb_logistics_files", {
    method: "POST",
    body: { ...file, createdAt: now() },
    prefer: "return=representation",
  });
  return rows[0];
}
