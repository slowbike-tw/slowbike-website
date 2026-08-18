import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SlowBike 電動腳踏車專賣店",
  description: "選一台真正適合你的電動車。SlowBike 提供電動腳踏車、預約試乘、售後服務與線上刷卡付款。",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
