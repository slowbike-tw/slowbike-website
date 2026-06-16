import Link from "next/link";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  return (
    <main className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="text-4xl font-black">付款成功</h1>
      <p className="mt-4 text-ink/55">
        訂單 {order || ""} 已完成付款。你可以登入會員中心查看訂單狀態。
      </p>
      <Link
        href="/account/orders"
        className="mt-8 inline-flex rounded-full bg-ink px-6 py-4 font-black text-white"
      >
        查看我的訂單
      </Link>
    </main>
  );
}
