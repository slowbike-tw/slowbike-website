import { products as fallbackProducts } from "@/lib/products";
import { serviceRest } from "@/lib/supabase-server";
import type { Product, ProductStatus } from "@/types/product";

export type ProductCmsPayload = {
  product: ProductRowInput;
  variants: VariantRowInput[];
  colors: ColorRowInput[];
  accessories: AccessoryRowInput[];
  images: ImageRowInput[];
};

export type ProductRowInput = {
  id?: string;
  code: string;
  slug: string;
  name: string;
  category: string;
  series: string;
  english_series: string;
  tagline: string;
  description: string;
  long_description: string;
  price: number;
  original_price?: number | null;
  status: "draft" | "published" | "hidden";
  is_published: boolean;
  show_on_home: boolean;
  main_image?: string | null;
  gallery?: string[];
  sort_order: number;
};

export type VariantRowInput = {
  id?: string;
  name: string;
  price: number;
  battery: string;
  motor: string;
  range: string;
  brakes: string;
  note: string;
  is_enabled: boolean;
  sort_order: number;
};

export type ColorRowInput = {
  id?: string;
  name: string;
  color_code: string;
  image_url?: string | null;
  is_enabled: boolean;
  sort_order: number;
};

export type AccessoryRowInput = {
  id?: string;
  name: string;
  price: number;
  description: string;
  image_url?: string | null;
  is_enabled: boolean;
  sort_order: number;
};

export type ImageRowInput = {
  id?: string;
  usage: string;
  image_url: string;
  alt: string;
  sort_order: number;
};

type ProductRow = ProductRowInput & {
  id: string;
  gallery: string[];
  created_at: string;
  updated_at: string;
};

type VariantRow = VariantRowInput & { id: string; product_id: string };
type ColorRow = ColorRowInput & { id: string; product_id: string };
type AccessoryRow = AccessoryRowInput & { id: string; product_id: string };
type ImageRow = ImageRowInput & { id: string; product_id: string };

export type ProductCmsRecord = {
  product: ProductRow;
  variants: VariantRow[];
  colors: ColorRow[];
  accessories: AccessoryRow[];
  images: ImageRow[];
};

const toneFallback = "linear-gradient(135deg, #59644a 0%, #343b2e 48%, #171a16 100%)";

function statusToProductStatus(status: ProductRow["status"]): ProductStatus {
  if (status === "published") return "available";
  if (status === "hidden") return "coming-soon";
  return "preorder";
}

export function cmsRecordToProduct(record: ProductCmsRecord): Product {
  const product = record.product;
  const gallery = [
    ...(Array.isArray(product.gallery) ? product.gallery : []),
    ...record.images
      .filter((image) => image.usage !== "main" && image.image_url)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((image) => image.image_url),
  ];
  const mainImage =
    product.main_image ||
    record.images.find((image) => image.usage === "main")?.image_url ||
    null;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    series: product.series,
    englishSeries: product.english_series,
    tagline: product.tagline,
    description: product.description,
    longDescription: product.long_description || product.description,
    status: statusToProductStatus(product.status),
    statusLabel: product.is_published ? "販售中" : "草稿",
    badge: product.category,
    priceNote: product.original_price ? `原價 NT$${product.original_price.toLocaleString("zh-TW")}` : "",
    media: {
      mainImage,
      gallery,
      colorImages: Object.fromEntries(
        record.colors.map((color) => [color.name, color.image_url || null]),
      ),
      records: record.images.map((image) => ({
        usage: image.usage,
        file: image.image_url || null,
        suggestedFile: image.image_url,
        status: image.image_url ? "available" : "missing",
        note: image.alt,
      })),
    },
    tone: toneFallback,
    accent: "#59644a",
    features: record.variants
      .filter((variant) => variant.is_enabled)
      .slice(0, 4)
      .map((variant) => `${variant.name}｜${variant.battery || variant.motor || "可洽詢"}`),
    suitableFor: [],
    colors: record.colors
      .filter((color) => color.is_enabled)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((color) => ({ name: color.name, value: color.color_code })),
    variants: record.variants
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((variant) => ({
        id: variant.id,
        name: variant.name,
        price: variant.price,
        enabled: variant.is_enabled,
        description: [variant.motor, variant.battery, variant.range]
          .filter(Boolean)
          .join(" / "),
        specs: [
          { label: "電池", value: variant.battery },
          { label: "馬達", value: variant.motor },
          { label: "續航", value: variant.range },
          { label: "煞車", value: variant.brakes },
          { label: "備註", value: variant.note },
        ].filter((spec) => spec.value),
      })),
    accessories: record.accessories
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((accessory) => ({
        id: accessory.id,
        name: accessory.name,
        price: accessory.price,
        enabled: accessory.is_enabled,
        image: accessory.image_url || null,
        description: accessory.description,
      })),
    specs: [
      { label: "系列", value: product.series },
      { label: "分類", value: product.category },
    ],
    warrantyEligible: true,
    warranties: [
      {
        item: "SlowBike 保固",
        period: "依商品頁公告",
        description: "詳細保固內容請洽 SlowBike。",
      },
    ],
    salesMode: product.is_published ? "販售中" : "草稿",
    deliveryNote: "",
    homeDeliveryFee: 800,
    homeCopy: {
      eyebrow: product.english_series || product.code,
      title: product.name,
      description: product.description,
      tags: [],
    },
  };
}

async function readCmsRecords(includeHidden = false) {
  const productQuery = includeHidden
    ? "select=*&order=sort_order.asc"
    : "select=*&is_published=eq.true&status=eq.published&order=sort_order.asc";
  const productRows = await serviceRest<ProductRow[]>(`products?${productQuery}`);
  if (productRows.length === 0) return [];
  const ids = productRows.map((product) => product.id).join(",");
  const [variants, colors, accessories, images] = await Promise.all([
    serviceRest<VariantRow[]>(
      `product_variants?product_id=in.(${ids})&select=*&order=sort_order.asc`,
    ),
    serviceRest<ColorRow[]>(
      `product_colors?product_id=in.(${ids})&select=*&order=sort_order.asc`,
    ),
    serviceRest<AccessoryRow[]>(
      `product_accessories?product_id=in.(${ids})&select=*&order=sort_order.asc`,
    ),
    serviceRest<ImageRow[]>(
      `product_images?product_id=in.(${ids})&select=*&order=sort_order.asc`,
    ),
  ]);

  return productRows.map((product) => ({
    product,
    variants: variants.filter((item) => item.product_id === product.id),
    colors: colors.filter((item) => item.product_id === product.id),
    accessories: accessories.filter((item) => item.product_id === product.id),
    images: images.filter((item) => item.product_id === product.id),
  }));
}

export async function getStoreProducts() {
  try {
    const records = await readCmsRecords(false);
    if (records.length > 0) return records.map(cmsRecordToProduct);
  } catch {
    // Fallback keeps checkout alive before the CMS tables are deployed.
  }
  return fallbackProducts;
}

export async function getStoreProductBySlug(slug: string) {
  const products = await getStoreProducts();
  return products.find((product) => product.slug === slug);
}

export async function getStoreProductById(id: string) {
  const products = await getStoreProducts();
  return products.find((product) => product.id === id);
}

export async function getAdminProductRecords() {
  return readCmsRecords(true);
}

export async function upsertProductRecord(payload: ProductCmsPayload) {
  const productPayload = {
    ...payload.product,
    gallery: payload.product.gallery ?? [],
    updated_at: new Date().toISOString(),
  };
  const rows = payload.product.id
    ? await serviceRest<ProductRow[]>(`products?id=eq.${payload.product.id}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(productPayload),
      })
    : await serviceRest<ProductRow[]>("products", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(productPayload),
      });
  const product = rows[0];
  if (!product) throw new Error("商品儲存失敗");

  await Promise.all([
    replaceChildren("product_variants", product.id, payload.variants),
    replaceChildren("product_colors", product.id, payload.colors),
    replaceChildren("product_accessories", product.id, payload.accessories),
    replaceChildren("product_images", product.id, payload.images),
  ]);

  return product;
}

async function replaceChildren(
  table: string,
  productId: string,
  rows: Array<Record<string, unknown>>,
) {
  await serviceRest(`${table}?product_id=eq.${productId}`, { method: "DELETE" });
  if (rows.length === 0) return;
  await serviceRest(table, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(
      rows.map(({ id: _id, ...row }) => ({
        ...row,
        product_id: productId,
        updated_at: new Date().toISOString(),
      })),
    ),
  });
}

export async function hideProductRecord(id: string) {
  return serviceRest<ProductRow[]>(`products?id=eq.${id}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      status: "hidden",
      is_published: false,
      updated_at: new Date().toISOString(),
    }),
  });
}
