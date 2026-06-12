export type ProductStatus = "available" | "preorder" | "coming-soon";

export type ProductColor = {
  name: string;
  value: string;
};

export type ProductSpec = {
  label: string;
  value: string;
};

export type ProductVariant = {
  id: string;
  name: string;
  price: number;
  enabled: boolean;
  description?: string;
  specs?: ProductSpec[];
};

export type ProductAccessory = {
  id: string;
  name: string;
  price: number;
  enabled: boolean;
  image: string | null;
  description?: string;
  suggestedImage?: string | null;
};

export type ProductMedia = {
  mainImage: string | null;
  gallery: Array<string | null>;
  colorImages: Record<string, string | null>;
  records: ProductImageRecord[];
};

export type ProductImageRecord = {
  usage: string;
  file: string | null;
  suggestedFile: string;
  status: string;
  note: string;
};

export type ProductWarranty = {
  item: string;
  period: string;
  description: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  series: string;
  englishSeries: string;
  tagline: string;
  description: string;
  longDescription: string;
  status: ProductStatus;
  statusLabel: string;
  badge: string;
  priceNote: string;
  media: ProductMedia;
  tone: string;
  accent: string;
  features: string[];
  suitableFor: string[];
  colors: ProductColor[];
  variants: ProductVariant[];
  accessories: ProductAccessory[];
  specs: ProductSpec[];
  warrantyEligible: boolean;
  warranties: ProductWarranty[];
  salesMode: string;
  deliveryNote: string;
  homeDeliveryFee: number;
  homeCopy: {
    eyebrow: string;
    title: string;
    description: string;
    tags: string[];
  };
};

export type CartItem = {
  productId: string;
  variantId: string;
  quantity: number;
  color: string;
  accessoryIds: string[];
};
