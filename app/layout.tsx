import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: {
    default: "SlowBike 即行｜找到適合你的電動腳踏車",
    template: "%s｜SlowBike 即行",
  },
  description: "通勤、購物、外送、露營、慢生活，一台適合你的電動腳踏車。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
