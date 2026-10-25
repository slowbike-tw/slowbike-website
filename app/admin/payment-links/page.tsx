import { redirect } from "next/navigation";
import { AdminHeader, AdminNav } from "@/app/admin/admin-nav";
import { isAdminSignedIn } from "@/lib/admin-auth";
import { getOrders, getPaymentLinks, getProducts } from "@/lib/repositories";
import { formatPrice } from "@/lib/site-data";

export default async function AdminPaymentLinksPage() {
  if (!(await isAdminSignedIn())) redirect("/admin");
  const [products, links, orders] = await Promise.all([getProducts(), getPaymentLinks(), getOrders()]);

  return (
    <main className="admin-shell">
      <AdminHeader
        title="付款連結"
        description="建立線上刷卡付款連結，傳給客戶後即可付款。付款完成後可在下方訂單列表查看。"
      />
      <AdminNav />
      <section className="admin-grid">
        <form className="admin-card admin-form payment-link-form" action="/api/admin/payment-links" method="post">
          <p className="eyebrow">Create Link</p>
          <h2>建立付款連結</h2>
          <label>
            車型
            <select name="model" required>
              {products.map((product) => (
                <option value={product.name} key={product.slug}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            顏色
            <input name="color" placeholder="例如：奶油白" />
          </label>
          <label>
            付款標題
            <input name="title" placeholder="例如：FOLD 奶油白" required />
          </label>
          <div className="form-row">
            <label>
              金額
              <input name="amount" inputMode="numeric" placeholder="36500" required />
            </label>
            <label>
              數量
              <input name="stockQuantity" inputMode="numeric" defaultValue="1" />
            </label>
          </div>
          <label>
            付款方式
            <select name="paymentMode" defaultValue="once">
              <option value="once">信用卡（一次付清／3／6／12 期，於藍新頁面選擇）</option>
            </select>
          </label>
          <label>
            備註
            <textarea name="note" rows={3} />
          </label>
          <button className="admin-primary" type="submit">
            建立連結
          </button>
        </form>

        <section className="admin-card">
          <p className="eyebrow">Links</p>
          <h2>付款連結列表</h2>
          <div className="admin-list">
            {links.map((link) => {
              const url = `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.slowbike.com.tw"}/pay/${link.token}`;
              return (
                <article className="admin-list-item" key={link.token}>
                  <strong>{link.title}</strong>
                  <span>{link.model}｜{link.color || "未填顏色"}｜{formatPrice(link.amount)}</span>
                  <input aria-label={`${link.title} 付款網址`} readOnly value={url} />
                  <a className="admin-link-button" href={`/pay/${link.token}`} target="_blank">
                    開啟付款頁
                  </a>
                </article>
              );
            })}
          </div>
        </section>
      </section>

      <section className="admin-card section">
        <p className="eyebrow">Orders</p>
        <h2>付款訂單</h2>
        <div className="admin-list">
          {orders.map((order) => (
            <article className="admin-list-item" key={order.merchantOrderNo}>
              <strong>{order.merchantOrderNo}</strong>
              <span>{order.buyerName}｜{order.buyerPhone}｜{formatPrice(order.amount)}</span>
              <span>狀態：{order.status}｜回應碼：{order.respondCode || "尚無"}</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
