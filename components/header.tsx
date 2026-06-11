"use client";

import { Menu, ShoppingBag, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { Logo } from "@/components/logo";
import { navItems } from "@/lib/site-data";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f8f7f2]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-bold transition-colors hover:text-olive-600 ${
                pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`))
                  ? "text-olive-600"
                  : "text-ink/70"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/account"
            className="hidden size-11 place-items-center rounded-full border border-black/10 text-ink transition hover:border-olive-600 hover:text-olive-700 sm:grid"
            aria-label="會員中心"
          >
            <UserRound size={19} />
          </Link>
          <Link
            href="/cart"
            className="relative grid size-11 place-items-center rounded-full border border-black/10 text-ink transition hover:border-olive-600 hover:text-olive-700"
            aria-label={`購物車，共 ${itemCount} 件商品`}
          >
            <ShoppingBag size={19} />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-olive-600 px-1 text-[10px] font-black leading-5 text-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="grid size-11 place-items-center rounded-full border border-black/10 lg:hidden"
            aria-label={open ? "關閉選單" : "開啟選單"}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-black/10 bg-[#f8f7f2] px-5 py-4 lg:hidden">
          <div className="mx-auto grid max-w-7xl">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`border-b border-black/10 py-4 text-base font-bold ${
                  pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`))
                    ? "text-olive-600"
                    : "text-ink"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/account" onClick={() => setOpen(false)} className="border-b border-black/10 py-4 text-base font-bold sm:hidden">
              會員中心
            </Link>
            <Link href="/warranty" onClick={() => setOpen(false)} className="py-4 text-base font-bold">
              電子保固
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
