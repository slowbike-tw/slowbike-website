import { redirect } from "next/navigation";

export default function LegacyDraftPage() {
  redirect("/admin/orders/new");
}
