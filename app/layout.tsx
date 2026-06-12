import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { MemberAuthProvider } from "@/components/member/auth-provider";
import { SiteShell } from "@/components/site-shell";

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
        <CartProvider>
          <MemberAuthProvider>
            <SiteShell>{children}</SiteShell>
          </MemberAuthProvider>
        </CartProvider>
      </body>
    </html>
  );
}
