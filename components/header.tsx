"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { navItems } from "@/lib/site-data";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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
                pathname === item.href ? "text-olive-600" : "text-ink/70"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/contact"
          className="hidden rounded-full bg-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-olive-700 lg:inline-flex"
        >
          預約諮詢
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
      {open && (
        <nav className="border-t border-black/10 bg-[#f8f7f2] px-5 py-4 lg:hidden">
          <div className="mx-auto grid max-w-7xl">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`border-b border-black/10 py-4 text-base font-bold ${
                  pathname === item.href ? "text-olive-600" : "text-ink"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
