"use client";

import { LogOut, Package, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemberAuth } from "@/components/member/auth-provider";

const memberLinks = [
  { href: "/account", label: "會員中心", icon: UserRound },
  { href: "/account/orders", label: "我的訂單", icon: Package },
  { href: "/account/warranty", label: "我的保固", icon: ShieldCheck },
];

export function MemberNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useMemberAuth();

  return (
    <nav className="flex gap-2 overflow-x-auto pb-2">
      {memberLinks.map(({ href, label, icon: Icon }) => {
        const active =
          pathname === href ||
          (href !== "/account" && pathname.startsWith(`${href}/`));
        return (
          <Link
            key={href}
            href={href}
            className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-black ${
              active
                ? "bg-olive-700 text-white"
                : "border border-black/10 bg-white text-ink/65"
            }`}
          >
            <Icon size={16} />
            {label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={async () => {
          await signOut();
          router.push("/account");
        }}
        className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-black/10 bg-white px-4 text-sm font-black text-ink/65"
      >
        <LogOut size={16} />
        登出
      </button>
    </nav>
  );
}
