import { AdminHeader, AdminNav } from "@/app/admin/admin-nav";
import { isAdminPasswordConfigured, isAdminSignedIn } from "@/lib/admin-auth";
import {
  getLogisticsOrders,
  getMemberVehicles,
  getMembers,
  getOrders,
  getPaymentLinks,
  getProducts,
} from "@/lib/repositories";

export default async function AdminPage() {
  const signedIn = await isAdminSignedIn();
  if (!signedIn) return <AdminLogin />;

  const [products, members, vehicles, logistics, orders, links] = await Promise.all([
    getProducts(),
    getMembers(),
    getMemberVehicles(),
    getLogisticsOrders(),
    getOrders(),
    getPaymentLinks(),
  ]);

  return (
    <main className="admin-shell">
      <AdminHeader
        title="後台總覽"
        description="管理商品、會員車輛、付款連結、保固卡與物流訂單。"
      />
      <AdminNav />
      <section className="admin-dashboard-grid">
        <DashboardCard title="商品管理" value={`${products.length} 筆`} href="/admin/products" />
        <DashboardCard title="會員管理" value={`${members.length} 位`} href="/admin/members" />
        <DashboardCard title="會員車輛" value={`${vehicles.length} 台`} href="/admin/members" />
        <DashboardCard title="付款連結" value={`${links.length} 筆`} href="/admin/payment-links" />
        <DashboardCard title="付款訂單" value={`${orders.length} 筆`} href="/admin/payment-links" />
        <DashboardCard title="物流管理" value={`${logistics.length} 筆`} href="/admin/logistics" />
        <DashboardCard title="保固卡" value="PNG 匯出" href="/admin/warranty" />
      </section>
    </main>
  );
}

function DashboardCard({ title, value, href }: { title: string; value: string; href: string }) {
  return (
    <a className="admin-card dashboard-card" href={href}>
      <p className="eyebrow">{title}</p>
      <strong>{value}</strong>
      <span>進入管理</span>
    </a>
  );
}

function AdminLogin() {
  const configured = isAdminPasswordConfigured();

  return (
    <main className="admin-shell admin-login-shell">
      <section className="admin-card admin-login-card">
        <p className="eyebrow">SlowBike Admin</p>
        <h1>後台登入</h1>
        <p>請輸入 SlowBike 後台密碼。</p>
        {!configured ? (
          <section className="admin-alert">
            後台密碼尚未設定，請先在 Vercel 設定 ADMIN_PASSWORD 或 SLOWBIKE_ADMIN_PASSWORD。
          </section>
        ) : null}
        <form className="admin-form" action="/api/admin/login" method="post">
          <label>
            後台密碼
            <input name="password" type="password" required autoComplete="current-password" />
          </label>
          <button className="admin-primary" type="submit" disabled={!configured}>
            登入後台
          </button>
        </form>
      </section>
    </main>
  );
}
