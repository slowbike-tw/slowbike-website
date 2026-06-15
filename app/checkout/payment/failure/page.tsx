import Link from "next/link";

export default function PaymentFailurePage() {
  return <main className="mx-auto max-w-xl px-5 py-24 text-center"><h1 className="text-4xl font-black">付款未完成</h1><p className="mt-4 text-ink/55">訂單仍保留，可稍後重新付款或聯絡 SlowBike。</p><Link href="/account/orders" className="mt-8 inline-flex rounded-full bg-ink px-6 py-4 font-black text-white">查看我的訂單</Link></main>;
}
