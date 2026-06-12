import { OrderDraftForm } from "@/components/logistics/order-draft-form";

export default function NewOrderDraftPage() {
  return (
    <div>
      <p className="text-xs font-black tracking-[0.2em] text-olive-600">
        MEMBER-BOUND ORDER
      </p>
      <h1 className="mt-3 text-3xl font-black tracking-[-0.04em]">
        建立人工訂單草稿
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/50">
        草稿不會直接成為正式訂單或物流單。客戶登入並確認後才會綁定會員，付款功能仍保留至下一階段。
      </p>
      <div className="mt-8">
        <OrderDraftForm />
      </div>
    </div>
  );
}
