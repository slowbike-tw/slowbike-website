import { getOrderByMerchantNo } from "@/lib/repositories";
import { formatPrice } from "@/lib/site-data";

export default async function PaymentResultPage({
  params,
}: {
  params: Promise<{ merchantOrderNo: string }>;
}) {
  const { merchantOrderNo } = await params;
  const order = await getOrderByMerchantNo(merchantOrderNo).catch(() => null);
  const paid = order?.status === "paid";

  return (
    <main className="admin-shell admin-login-shell">
      <section className="admin-card admin-login-card">
        <p className="eyebrow">Payment Result</p>
        <h1>{paid ? "付款成功" : "付款狀態確認中"}</h1>
        {order ? (
          <div className="product-price">
            <span>訂單編號：{order.merchantOrderNo}</span>
            <strong>{formatPrice(order.amount)}</strong>
          </div>
        ) : (
          <p>目前尚未查到此訂單，若已完成付款，請稍候或與 SlowBike 確認。</p>
        )}
        <a className="admin-link-button" href="/">
          回到官網
        </a>
      </section>
    </main>
  );
}
