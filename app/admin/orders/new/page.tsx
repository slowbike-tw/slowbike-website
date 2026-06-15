import { OrderDraftForm } from "@/components/logistics/order-draft-form";

export default function NewAdminOrderPage() {
  return (
    <div>
      <p className="text-xs font-black tracking-[0.2em] text-olive-600">
        UNIFIED ORDER BUILDER
      </p>
      <h1 className="mt-3 text-3xl font-black tracking-[-0.04em]">
        後台建立訂單
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/50">
        支援標準車款、客製車款、大陸產品代購與大陸電動車運輸。建立後會預建客戶 profile，並產生專屬確認網址。
      </p>
      <div className="mt-8">
        <OrderDraftForm />
      </div>
    </div>
  );
}
