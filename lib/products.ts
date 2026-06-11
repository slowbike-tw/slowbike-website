import productData from "@/data/products.json";
import type { Product } from "@/types/product";

// File-backed catalog for V1. Replace this source with a Supabase repository
// when the admin system is introduced; page and cart consumers stay unchanged.
export const products = productData as unknown as Product[];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductById(id: string) {
  return products.find((product) => product.id === id);
}

export function formatPrice(price: number | null) {
  if (price === null) return "價格洽詢";
  return `NT$${new Intl.NumberFormat("zh-TW", {
    maximumFractionDigits: 0,
  }).format(price)}`;
}

export function getStartingPrice(product: Product) {
  const prices = product.variants.filter((variant) => variant.enabled).map((variant) => variant.price);
  return prices.length > 0 ? Math.min(...prices) : null;
}

export function getVariantById(product: Product, variantId: string) {
  return product.variants.find((variant) => variant.id === variantId && variant.enabled);
}

export function getAccessoryById(product: Product, accessoryId: string) {
  return product.accessories.find((accessory) => accessory.id === accessoryId && accessory.enabled);
}

export function getConfigurationPrice(
  product: Product,
  variantId: string,
  accessoryIds: string[],
) {
  const variant = getVariantById(product, variantId);
  if (!variant) return null;
  const accessoryTotal = accessoryIds.reduce(
    (total, accessoryId) => total + (getAccessoryById(product, accessoryId)?.price ?? 0),
    0,
  );
  return variant.price + accessoryTotal;
}
