"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogisticsAdmin = pathname.startsWith("/admin/logistics");

  if (isLogisticsAdmin) return <main>{children}</main>;

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

