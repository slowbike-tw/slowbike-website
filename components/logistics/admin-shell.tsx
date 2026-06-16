"use client";

import {
  ClipboardList,
  FilePlus2,
  LayoutDashboard,
  Menu,
  Package,
  Plus,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const items = [
  { href: "/admin/orders/new", label: "建立訂單", icon: FilePlus2 },
  { href: "/admin/orders", label: "收款訂單", icon: ClipboardList },
  { href: "/admin/products", label: "商品管理", icon: Package },
  { href: "/admin/logistics", label: "物流後台", icon: LayoutDashboard },
  { href: "/admin/logistics/orders/new", label: "人工物流", icon: Plus },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f3f1e9]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f3f1e9]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6">
          <Link href="/admin/orders/new" className="min-w-0">
            <p className="truncate text-[10px] font-black tracking-[0.18em] text-olive-600">
              SLOWBIKE ADMIN
            </p>
            <p className="truncate text-sm font-black text-ink sm:text-base">
              V0 營運後台
            </p>
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            {items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-black transition ${
                    active
                      ? "bg-ink text-white"
                      : "text-ink/60 hover:bg-white hover:text-ink"
                  }`}
                >
                  <item.icon size={17} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="grid size-11 place-items-center rounded-full border border-black/10 bg-white md:hidden"
            aria-label={open ? "關閉後台選單" : "開啟後台選單"}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {open && (
          <nav className="grid border-t border-black/10 bg-[#f3f1e9] px-4 py-3 md:hidden">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center gap-3 border-b border-black/10 px-2 text-sm font-black last:border-0"
              >
                <item.icon size={18} className="text-olive-600" />
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {children}
      </div>
    </div>
  );
}
