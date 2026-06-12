import { OrderForm } from "@/components/logistics/order-form";

export default function NewLogisticsOrderPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-xs font-black tracking-[0.2em] text-olive-600">CREATE ORDER</p>
      <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">新增物流訂單</h1>
      <p className="mb-7 mt-3 text-sm leading-6 text-ink/50">完成必要資料後，系統會自動建立訂單編號。</p>
      <OrderForm />
    </div>
  );
}

