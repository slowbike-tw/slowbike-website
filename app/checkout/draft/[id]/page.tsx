import { OrderConfirmClient } from "@/components/member/order-confirm-client";

export default async function CheckoutDraftPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <section className="bg-sand py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-5">
        <OrderConfirmClient token={id} />
      </div>
    </section>
  );
}
