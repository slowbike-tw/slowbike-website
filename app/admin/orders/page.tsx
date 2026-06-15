import { AdminPaymentOrders } from "@/components/admin-payment-orders";

export default function AdminOrdersPage() {
  return <div><p className="text-xs font-black tracking-[0.2em] text-olive-600">CUSTOMER ORDERS</p><h1 className="mt-3 text-4xl font-black">正式訂單與收款</h1><AdminPaymentOrders /></div>;
}
