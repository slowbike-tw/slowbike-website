import { Suspense } from "react";
import { CheckoutPage } from "@/components/checkout-page";

export default function CheckoutRoute() {
  return <Suspense><CheckoutPage /></Suspense>;
}
