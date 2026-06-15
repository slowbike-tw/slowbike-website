import Link from "next/link";

export default async function AtmPaymentPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  return <main className="mx-auto max-w-xl px-5 py-24 text-center"><h1 className="text-4xl font-black">ATM 訂單已建立</h1><p className="mt-4 leading-7 text-ink/55">訂單 {order || ""} 為「待確認匯款」。SlowBike 確認收款後會自動建立物流單。</p><Link href="/account/orders" className="mt-8 inline-flex rounded-full bg-ink px-6 py-4 font-black text-white">查看我的訂單</Link></main>;
}
