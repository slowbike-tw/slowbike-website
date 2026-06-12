import catalog from "@/data/product-catalog.json";
import type { Product } from "@/types/product";

const tones: Record<string, string> = {
  FOLD: "linear-gradient(135deg, #59644a 0%, #343b2e 48%, #171a16 100%)",
  S1: "linear-gradient(135deg, #343833 0%, #222520 48%, #050605 100%)",
  NOMA: "linear-gradient(135deg, #7b816d 0%, #59604e 48%, #30352b 100%)",
  MINI: "linear-gradient(135deg, #62685b 0%, #41463d 48%, #20231f 100%)",
};

const accents: Record<string, string> = {
  FOLD: "#adb59a",
  S1: "#858c79",
  NOMA: "#d2d6c6",
  MINI: "#c3c8b8",
};

function imagePath(file: string, status: string) {
  return file !== "未上傳" && status === "已上傳"
    ? `/images/products/${file}`
    : null;
}

export const products: Product[] = catalog.products
  .filter((item) => item.status === "上架")
  .sort((a, b) => a.sort - b.sort)
  .map((item) => {
    const variants = catalog.variants.filter((variant) => variant.productCode === item.code);
    const colors = catalog.colors.filter((color) => color.productCode === item.code);
    const accessories = catalog.accessories.filter(
      (accessory) => accessory.productCode === item.code,
    );
    const specs = catalog.specs
      .filter((spec) => spec.productCode === item.code)
      .sort((a, b) => a.sort - b.sort);
    const images = catalog.images.filter((image) => image.productCode === item.code);
    const mainImage = images.find((image) => image.usage === "主圖");
    const copy = catalog.copy.find(
      (entry) => entry.section === "首頁四卡" && entry.productCode === item.code,
    );
    const shipping = catalog.shipping.find((entry) => entry.productCode === item.code);

    return {
      id: `slowbike-${item.code.toLowerCase()}`,
      slug: item.code.toLowerCase(),
      name: item.name,
      series: item.series,
      englishSeries: item.englishSeries.toUpperCase(),
      tagline: item.headline,
      description: item.summary,
      longDescription: `${item.headline}。${item.summary}。${item.note}`,
      status: "available",
      statusLabel: item.salesMode,
      badge: item.category,
      priceNote: item.deliveryNote,
      media: {
        mainImage: mainImage ? imagePath(mainImage.file, mainImage.status) : null,
        gallery: images
          .filter(
            (image) =>
              image.usage !== "主圖" &&
              !image.usage.startsWith("車色主圖-"),
          )
          .map((image) => imagePath(image.file, image.status)),
        colorImages: Object.fromEntries(
          colors.map((color) => {
            const colorImage = images.find(
              (image) =>
                image.usage.includes(color.name) ||
                image.note.includes(color.name),
            );
            return [
              color.name,
              colorImage ? imagePath(colorImage.file, colorImage.status) : null,
            ];
          }),
        ),
        records: images.map((image) => ({
          usage: image.usage,
          file: imagePath(image.file, image.status),
          suggestedFile: image.suggestedFile,
          status: image.status,
          note: image.note,
        })),
      },
      tone: tones[item.code],
      accent: accents[item.code],
      features: specs.slice(0, 4).map((spec) => `${spec.label}：${spec.value}`),
      suitableFor: copy?.tags ?? [],
      colors: colors.map((color) => ({ name: color.name, value: color.hex })),
      variants: variants.map((variant, index) => ({
        id: `${item.code.toLowerCase()}-variant-${index + 1}`,
        name: variant.name,
        price: variant.price,
        enabled: variant.status === "上架",
        description: `${variant.motor}・${variant.battery}・續航${variant.range}`,
        specs: [
          { label: "馬達", value: variant.motor },
          { label: "電池", value: variant.battery },
          { label: "續航", value: variant.range },
          { label: "最高時速", value: variant.topSpeed },
          { label: "煞車", value: variant.brakes },
          { label: "車架", value: variant.frame },
          { label: "輪組", value: variant.wheels },
          { label: "其他配置", value: variant.configuration },
        ],
      })),
      accessories: accessories.map((accessory, index) => {
        const accessoryImage = catalog.images.find(
          (image) =>
            (image.productCode === item.code &&
              image.usage.includes(accessory.name)) ||
            (image.productCode === "ACCESSORY" && image.usage === accessory.name),
        );
        return {
          id: `${item.code.toLowerCase()}-accessory-${index + 1}`,
          name: accessory.name,
          price: accessory.price,
          enabled: accessory.status === "上架",
          image: accessoryImage
            ? imagePath(accessoryImage.file, accessoryImage.status)
            : null,
          suggestedImage: accessoryImage?.suggestedFile ?? null,
          description: accessory.note,
        };
      }),
      specs: specs.map((spec) => ({
        label: spec.label,
        value: spec.note ? `${spec.value}（${spec.note}）` : spec.value,
      })),
      warrantyEligible: true,
      warranties: catalog.warranties
        .filter((warranty) => warranty.productCode === item.code)
        .map((warranty) => ({
          item: warranty.item,
          period: warranty.period,
          description: warranty.description,
        })),
      salesMode: item.salesMode,
      deliveryNote: item.deliveryNote,
      homeDeliveryFee: shipping?.homeDeliveryFee ?? 800,
      homeCopy: {
        eyebrow: copy?.eyebrow ?? `${item.code} ${item.englishSeries}`,
        title: copy?.title ?? item.category,
        description: copy?.description ?? item.summary,
        tags: copy?.tags ?? [],
      },
    } satisfies Product;
  });

export const homeCatalogCopy = catalog.copy.find((entry) => entry.section === "首頁主標");

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
