import type { Metadata } from "next";
import { AdminShell } from "@/components/logistics/admin-shell";
import { LogisticsProvider } from "@/components/logistics/logistics-provider";

export const metadata: Metadata = {
  title: "物流管理系統｜SlowBike",
  description: "四葉國際 × SlowBike 內部物流訂單管理系統",
};

export default function LogisticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <LogisticsProvider>
      <AdminShell>{children}</AdminShell>
    </LogisticsProvider>
  );
}

