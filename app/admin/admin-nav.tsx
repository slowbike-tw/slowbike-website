"use client";

import { usePathname } from "next/navigation";

const adminLinks = [
  { href: "/admin", label: "儀表板" },
  { href: "/admin/products", label: "商品管理" },
  { href: "/admin/members", label: "會員管理" },
  { href: "/admin/warranty", label: "保固卡" },
  { href: "/admin/payment-links", label: "付款連結" },
  { href: "/admin/logistics", label: "物流管理" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="admin-nav" aria-label="後台導覽">
      {adminLinks.map((link) => (
        <a href={link.href} key={link.href} aria-current={pathname === link.href ? "page" : undefined}>
          {link.label}
        </a>
      ))}
    </nav>
  );
}

export function AdminHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="admin-header">
      <div>
        <p className="eyebrow">SlowBike Admin</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="admin-user">
        <form action="/api/admin/logout" method="post">
          <button className="admin-ghost" type="submit">
            登出
          </button>
        </form>
        <a className="admin-link-button" href="/">
          返回官網
        </a>
      </div>
    </header>
  );
}
