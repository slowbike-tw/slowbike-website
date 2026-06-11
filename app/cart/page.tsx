import type { Metadata } from "next";
import { CartPage } from "@/components/cart-page";

export const metadata: Metadata = { title: "購物車" };

export default function CartRoute() {
  return <CartPage />;
}
