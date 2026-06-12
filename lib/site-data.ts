import {
  Bike,
  Boxes,
  CreditCard,
  Headphones,
  MapPin,
  PackageCheck,
  ReceiptText,
  Truck,
} from "lucide-react";
import { products } from "@/lib/products";

export const navItems = [
  { label: "首頁", href: "/" },
  { label: "商品系列", href: "/products" },
  { label: "客製化電動車", href: "/custom" },
  { label: "電動產品代購", href: "/procurement" },
  { label: "電動車運輸", href: "/shipping" },
  { label: "聯絡我們", href: "/contact" },
];

const homeTones: Record<string, string> = {
  FOLD: "from-[#4c5740] to-[#1c211a]",
  S1: "from-[#262b24] to-black",
  NOMA: "from-[#7b816d] to-[#30352b]",
  MINI: "from-[#62685b] to-[#20231f]",
};

export const bikes = products.map((product, index) => ({
  name: product.name,
  seriesLabel: product.homeCopy.eyebrow,
  lifestyle: product.homeCopy.title,
  href: `/bikes/${product.slug}`,
  mark: String(index + 1).padStart(2, "0"),
  slogan: product.homeCopy.description,
  uses: product.homeCopy.tags,
  tone: homeTones[product.name],
}));

export const trustItems = [
  { title: "可刷卡分期", icon: CreditCard },
  { title: "全台配送", icon: Truck },
  { title: "恆春門市交車", icon: MapPin },
  { title: "龜山門市交車", icon: Bike },
  { title: "售後服務支援", icon: Headphones },
  { title: "電子發票", icon: ReceiptText },
];

export const paymentItems = ["信用卡", "信用卡分期", "銀行轉帳", "中租無卡分期"];

export const deliveryItems = [
  "恆春門市交車",
  "龜山門市交車",
  "宅配到府（運費 800 元）",
];

export const serviceCards = [
  {
    eyebrow: "CUSTOM BUILD",
    title: "客製化電動車",
    description: "從車架、配色到騎乘風格，打造真正屬於你的電動車。",
    items: ["SUPER73", "黑武士", "客製改裝"],
    href: "/custom",
    action: "Line 客製諮詢",
    icon: Bike,
  },
  {
    eyebrow: "GLOBAL SOURCING",
    title: "大陸電動產品代購",
    description: "看見喜歡的電動產品，我們協助詢價、採購與後續安排。",
    items: ["淘寶", "拼多多", "閒魚", "1688"],
    href: "/procurement",
    action: "Line 諮詢代購",
    icon: Boxes,
  },
  {
    eyebrow: "PRO TRANSPORT",
    title: "大陸電動車運輸",
    description: "處理跨境運輸的繁瑣細節，讓愛車安心抵達台灣。",
    items: ["拆車", "分包", "台灣專業組裝"],
    href: "/shipping",
    action: "Line 諮詢運輸",
    icon: PackageCheck,
  },
];
