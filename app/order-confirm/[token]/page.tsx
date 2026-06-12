import { OrderConfirmClient } from "@/components/member/order-confirm-client";

export default async function OrderConfirmPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <section className="bg-sand py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-5">
        <OrderConfirmClient token={token} />
      </div>
    </section>
  );
}
