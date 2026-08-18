import { notFound } from "next/navigation";
import { getPaymentLinkByToken } from "@/lib/repositories";
import { formatPrice } from "@/lib/site-data";

export default async function PayPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const link = await getPaymentLinkByToken(token).catch(() => null);
  if (!link) notFound();

  return (
    <main className="admin-shell admin-login-shell">
      <section className="admin-card admin-login-card">
        <p className="eyebrow">SlowBike Payment</p>
        <h1>{link.title}</h1>
        <p>{link.model} {link.color}</p>
        <div className="product-price">
          <span>付款金額</span>
          <strong>{formatPrice(link.amount)}</strong>
        </div>
        <form className="admin-form" action="/api/orders/create" method="post">
          <input type="hidden" name="token" value={link.token} />
          <label>
            姓名
            <input name="buyerName" required />
          </label>
          <label>
            手機
            <input name="buyerPhone" required />
          </label>
          <label>
            LINE 名稱
            <input name="buyerLineName" />
          </label>
          <label>
            Email
            <input name="buyerEmail" type="email" placeholder="support@slowbike.com.tw" />
          </label>
          <button className="admin-primary" type="submit">
            前往藍新付款
          </button>
        </form>
      </section>
    </main>
  );
}
