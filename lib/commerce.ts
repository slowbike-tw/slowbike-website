import { getStoreProducts } from "@/lib/product-cms";
import { serviceRest } from "@/lib/supabase-server";
import type { CartItem } from "@/types/product";
import type { DraftItem, OrderBusinessType } from "@/types/order-draft";

export async function resolveCartItems(items: CartItem[]): Promise<{
  items: DraftItem[];
  subtotal: number;
}> {
  const products = await getStoreProducts();
  const resolved = items.map((item) => {
    const product = products.find((entry) => entry.id === item.productId);
    const variant = product?.variants.find((entry) => entry.id === item.variantId && entry.enabled);
    if (!product || !variant || item.quantity < 1) throw new Error("購物車商品資料無效");
    const accessories = item.accessoryIds.map((id) => {
      const accessory = product.accessories.find((entry) => entry.id === id && entry.enabled);
      if (!accessory) throw new Error("購物車配件資料無效");
      return accessory;
    });
    const unitPrice = variant.price + accessories.reduce((sum, item) => sum + item.price, 0);
    return {
      productName: `${product.name} ${product.series}`,
      specification: variant.name,
      color: item.color,
      quantity: item.quantity,
      unitPrice,
      accessories: accessories.map((entry) => entry.name),
    };
  });
  return {
    items: resolved,
    subtotal: resolved.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
  };
}

export function commerceLogisticsTemplate(businessType: OrderBusinessType, assemblyMethod = "門市組裝") {
  if (businessType === "大陸產品代購") {
    return {
      logisticsStatus: "待採購",
      assemblyMethod: "不適用",
      assemblyStatus: "不適用",
      deliveryStatus: "不適用",
      packages: [{ name: "商品", handler: "四葉物流", status: "待採購" }],
    };
  }
  if (businessType === "大陸電動車運輸") {
    const selfAssembly = assemblyMethod === "客戶自行組裝";
    return {
      logisticsStatus: "待收貨",
      assemblyMethod,
      assemblyStatus: selfAssembly ? "不需組裝" : "待組裝",
      deliveryStatus: selfAssembly ? "待寄送" : "未交車",
      packages: [
        { name: "車輪", handler: "四葉物流", status: "待收貨" },
        { name: "車架", handler: "四葉物流", status: "待收貨" },
        { name: "電池", handler: "三哥國際物流", status: "待收貨" },
      ],
    };
  }
  return {
    logisticsStatus: businessType === "客製車款" ? "待製作" : "待出貨",
    assemblyMethod,
    assemblyStatus: "待組裝",
    deliveryStatus: "未交車",
    packages: ["車輪", "車架", "電池"].map((name) => ({
      name,
      handler: "SlowBike 營運管理端",
      status: businessType === "客製車款" ? "待製作" : "待出貨",
    })),
  };
}

export async function finalizePaidOrder(orderNo: string, response: Record<string, unknown> = {}) {
  return serviceRest<unknown[]>("rpc/finalize_paid_order", {
    method: "POST",
    body: JSON.stringify({ target_order_no: orderNo, payment_response: response }),
  });
}
