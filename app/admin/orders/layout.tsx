import { AdminShell } from "@/components/logistics/admin-shell";

export default function AdminOrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
