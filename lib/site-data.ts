import type { LogisticsStatus, Product } from "@/lib/types";

export const lineUrl = "https://lin.ee/YQKIi82p";

export const storeInfo = {
  name: "SlowBike 電動腳踏車專賣店",
  email: "support@slowbike.com.tw",
  phone: "08-8203591",
  address: "屏東縣恆春鎮環城北路242號",
  mapsUrl: "https://maps.app.goo.gl/iKb9PYx9mU6XTo8B9?g_st=ic",
};

export const defaultProducts: Product[] = [
  {
    slug: "noma",
    name: "NOMA",
    subtitle: "生活代步車",
    price: 29500,
    imagePath: "/images/products/noma-main.jpg",
    summary: "低跨點車架，前車籃加後座墊與腰靠，適合日常代步與生活使用。",
    specs: [
      "500W 電機",
      "時速約 40 公里",
      "15Ah 鋰電池",
      "續航約 35 公里",
      "升級油壓碟煞",
      "前車籃",
      "後座墊＋腰靠",
    ].join("\n"),
    highlights: ["低跨點，上下車更輕鬆", "前後置物與乘坐配置完整", "適合通勤、買菜、日常代步"].join("\n"),
    salesCopy:
      "NOMA 是 SlowBike 的生活代步車，重點不是追求速度，而是讓日常使用更輕鬆。低跨點車架、前車籃、後座墊與腰靠，適合想要舒適、實用、好上手的使用者。",
    status: "active",
    sortOrder: 1,
  },
  {
    slug: "fold",
    name: "FOLD",
    subtitle: "鋁合金折疊車",
    price: 36500,
    imagePath: "/images/products/fold-main.jpg",
    summary: "鋁合金折疊車架，20 吋一體輪，適合日常代步、露營旅行與車廂收納。",
    specs: [
      "500W 電機",
      "時速約 45 公里",
      "15Ah 內置鋰電池",
      "續航約 35 公里",
      "升級油壓碟煞",
      "20 吋一體輪",
      "鋁合金折疊車架",
    ].join("\n"),
    highlights: ["好收納、好攜帶", "適合露營旅行與休旅車廂收納", "奶油白車色，外型簡單俐落"].join("\n"),
    salesCopy:
      "FOLD 是 SlowBike 的鋁合金折疊車，適合想要兼顧質感、收納與日常代步的使用者。外型簡單俐落，折疊後更方便放入車廂或帶去旅行。",
    status: "active",
    sortOrder: 2,
  },
  {
    slug: "city",
    name: "CITY",
    subtitle: "高規通勤車",
    price: 38500,
    imagePath: "/images/products/city-main.jpg",
    summary: "1000W 高動力、20Ah 鋰電池，標配全鋁可調式液壓前叉，適合高規格通勤。",
    specs: [
      "1000W 電機",
      "20Ah 鋰電池",
      "時速約 55 公里",
      "續航約 45 公里",
      "升級油壓碟煞",
      "標配全鋁可調式液壓前叉",
      "中置籃",
      "高碳鋼車架",
      "一體輪",
      "防盜遙控＋一鍵啟動",
      "前後方向燈",
    ].join("\n"),
    highlights: ["1000W 高動力", "20Ah 大容量電池", "適合高規格通勤與日常騎乘"].join("\n"),
    salesCopy:
      "CITY 是 SlowBike 的高規通勤車，1000W 電機搭配 20Ah 鋰電池，重點是動力、續航與騎乘穩定性。適合想要一台規格到位、每天都想騎的電動車。",
    status: "active",
    sortOrder: 3,
  },
];

export const logisticsStatuses: LogisticsStatus[] = [
  "待入庫",
  "已到大陸倉",
  "已打包",
  "已發往台灣",
  "台灣配送中",
  "已完成",
  "異常",
];

export function formatPrice(value: number) {
  return `NT$${value.toLocaleString("zh-TW")}`;
}

export function lines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}
