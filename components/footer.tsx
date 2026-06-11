import Link from "next/link";
import { ArrowUpRight, Instagram, MessageCircle } from "lucide-react";
import { Logo } from "@/components/logo";
import { navItems } from "@/lib/site-data";

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
        <div className="grid gap-12 border-b border-white/15 pb-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <Logo light size="footer" />
            <p className="mt-7 max-w-sm text-2xl font-bold leading-snug">說走就走，及時行樂。</p>
            <p className="mt-3 max-w-sm text-sm leading-7 text-white/55">
              找到適合你的電動腳踏車，讓每一段移動都更自由。
            </p>
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.24em] text-white/40">EXPLORE</p>
            <div className="mt-5 grid gap-3">
              {navItems.slice(1).map((item) => (
                <Link key={item.href} href={item.href} className="text-sm text-white/70 hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.24em] text-white/40">CONNECT</p>
            <div className="mt-5 grid gap-3">
              <Link href="/contact" className="flex items-center gap-2 text-sm text-white/70 hover:text-white">
                <MessageCircle size={16} /> LINE 官方帳號
              </Link>
              <a href="#" className="flex items-center gap-2 text-sm text-white/70 hover:text-white">
                <Instagram size={16} /> Instagram
              </a>
              <Link href="/contact" className="flex items-center gap-2 text-sm text-white/70 hover:text-white">
                聯絡門市 <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-7 text-xs text-white/35 sm:flex-row sm:justify-between">
          <p>© 2026 SlowBike 即行. All rights reserved.</p>
          <p>台灣電動腳踏車選品・客製・運輸</p>
        </div>
      </div>
    </footer>
  );
}
