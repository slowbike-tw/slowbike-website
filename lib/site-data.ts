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

export const navItems = [
  { label: "首頁", href: "/" },
  { label: "商品系列", href: "/products" },
  { label: "客製化電動車", href: "/custom" },
  { label: "電動產品代購", href: "/procurement" },
  { label: "電動車運輸", href: "/shipping" },
  { label: "聯絡我們", href: "/contact" },
];

export const bikes = [
  {
    name: "FOLD",
    seriesLabel: "FOLD Travel Series",
    lifestyle: "通勤旅行",
    href: "/bikes/fold",
    mark: "01",
    slogan: "一台車搞定通勤、旅行與收納",
    uses: ["通勤", "露營", "後車廂收納"],
    tone: "from-[#4c5740] to-[#1c211a]",
  },
  {
    name: "S1",
    seriesLabel: "S1 Street Series",
    lifestyle: "個性街頭",
    href: "/bikes/s1",
    mark: "02",
    slogan: "街頭風格玩家首選",
    uses: ["個性騎乘", "外型優先", "改裝風格"],
    tone: "from-[#262b24] to-black",
  },
  {
    name: "NOMA",
    seriesLabel: "NOMA Lifestyle Series",
    lifestyle: "悠閒慢活",
    href: "/bikes/noma",
    mark: "03",
    slogan: "舒適騎乘，享受慢生活",
    uses: ["悠閒騎乘", "日常購物", "慢生活移動"],
    tone: "from-[#7b816d] to-[#30352b]",
  },
  {
    name: "MINI",
    seriesLabel: "MINI Light Series",
    lifestyle: "輕巧代步",
    href: "/bikes/mini",
    mark: "04",
    slogan: "輕巧好收納，日常代步首選",
    uses: ["短程代步", "初次入門", "有限收納空間"],
    tone: "from-[#62685b] to-[#20231f]",
  },
];

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
