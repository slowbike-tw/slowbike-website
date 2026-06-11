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
};

export type ProductAccessory = {
  id: string;
  name: string;
  price: number;
  enabled: boolean;
  image: string | null;
  description?: string;
};

export type ProductMedia = {
  mainImage: string | null;
  gallery: Array<string | null>;
  colorImages: Record<string, string | null>;
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
};

export type CartItem = {
  productId: string;
  variantId: string;
  quantity: number;
  color: string;
  accessoryIds: string[];
};
