"use client";

import { Check, Copy, Link2, Save } from "lucide-react";
import { useState } from "react";
import { createOrderDraft } from "@/lib/order-draft-repository";
import type { OrderDraft } from "@/types/order-draft";

const inputClass =
  "min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-base text-ink outline-none focus:border-olive-600 focus:ring-2 focus:ring-olive-100";

export function OrderDraftForm() {
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    productName: "",
    specification: "",
    color: "",
    quantity: 1,
    unitPrice: 0,
    notes: "",
    createdBy: "Ricky",
  });
  const [draft, setDraft] = useState<OrderDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const confirmationUrl = draft
    ? `${window.location.origin}/order-confirm/${draft.confirmation_token}`
    : "";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const saved = await createOrderDraft({
        customer_name: form.customerName.trim(),
        customer_email: form.customerEmail.trim().toLowerCase(),
        customer_phone: form.customerPhone.trim(),
        items: [
          {
            productName: form.productName.trim(),
            specification: form.specification.trim(),
            color: form.color.trim(),
            quantity: form.quantity,
            unitPrice: form.unitPrice,
          },
        ],
        total: form.quantity * form.unitPrice,
        notes: form.notes.trim(),
        created_by: form.createdBy,
      });
      setDraft(saved);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "草稿建立失敗，請稍後再試。",
      );
    } finally {
      setSaving(false);
    }
  }

  if (draft) {
    return (
      <div className="rounded-[1.5rem] border border-olive-300 bg-white p-6 sm:p-8">
        <span className="grid size-12 place-items-center rounded-full bg-olive-100 text-olive-700">
          <Link2 />
        </span>
        <p className="mt-6 text-xs font-black tracking-[0.18em] text-olive-600">
          {draft.draft_no}
        </p>
        <h1 className="mt-2 text-2xl font-black">客戶確認連結已建立</h1>
        <p className="mt-3 text-sm leading-7 text-ink/50">
          客戶必須使用草稿中的 Email 或手機完成 OTP 登入，才可認領並確認這筆訂單。
        </p>
        <div className="mt-6 break-all rounded-2xl bg-sand p-4 text-sm font-bold">
          {confirmationUrl}
        </div>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(confirmationUrl);
            setCopied(true);
          }}
          className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-black text-white"
        >
          {copied ? <Check size={17} /> : <Copy size={17} />}
          {copied ? "已複製" : "複製確認連結"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-6">
      <section className="rounded-[1.5rem] border border-black/10 bg-white p-5 sm:p-7">
        <h2 className="text-xl font-black">客戶聯絡資料</h2>
        <p className="mt-2 text-sm text-ink/50">
          Email 或手機至少填一項，客戶登入資料必須與此處相同。
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="客戶姓名">
            <input required className={inputClass} value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })} />
          </Field>
          <Field label="Email">
            <input type="email" className={inputClass} value={form.customerEmail} onChange={(event) => setForm({ ...form, customerEmail: event.target.value })} />
          </Field>
          <Field label="手機">
            <input type="tel" className={inputClass} value={form.customerPhone} onChange={(event) => setForm({ ...form, customerPhone: event.target.value })} />
          </Field>
          <Field label="建立人">
            <input required className={inputClass} value={form.createdBy} onChange={(event) => setForm({ ...form, createdBy: event.target.value })} />
          </Field>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-black/10 bg-white p-5 sm:p-7">
        <h2 className="text-xl font-black">人工訂單內容</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="商品名稱"><input required className={inputClass} value={form.productName} onChange={(event) => setForm({ ...form, productName: event.target.value })} /></Field>
          <Field label="規格"><input className={inputClass} value={form.specification} onChange={(event) => setForm({ ...form, specification: event.target.value })} /></Field>
          <Field label="顏色"><input className={inputClass} value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} /></Field>
          <Field label="單價"><input required min={0} type="number" className={inputClass} value={form.unitPrice} onChange={(event) => setForm({ ...form, unitPrice: Number(event.target.value) })} /></Field>
          <Field label="數量"><input required min={1} type="number" className={inputClass} value={form.quantity} onChange={(event) => setForm({ ...form, quantity: Number(event.target.value) })} /></Field>
          <Field label="備註" className="md:col-span-2"><textarea className={`${inputClass} min-h-24 py-3`} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></Field>
        </div>
      </section>

      {error && <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}
      <button disabled={saving || (!form.customerEmail && !form.customerPhone)} className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-olive-700 px-6 text-sm font-black text-white disabled:opacity-40">
        <Save size={18} />
        {saving ? "建立中..." : "建立草稿與確認連結"}
      </button>
    </form>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={className}><span className="mb-2 block text-sm font-black text-ink/70">{label}</span>{children}</label>;
}
