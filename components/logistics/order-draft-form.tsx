"use client";

import { Check, Copy, Link2, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { createOrderDraft } from "@/lib/order-draft-repository";
import { createDraftLogisticsTemplate } from "@/lib/order-logistics-defaults";
import { products } from "@/lib/products";
import type {
  OrderBusinessType,
  OrderDraft,
  OrderDraftInput,
} from "@/types/order-draft";

const businessTypes: OrderBusinessType[] = [
  "標準車款",
  "客製車款",
  "大陸產品代購",
  "大陸電動車運輸",
];

const inputClass =
  "min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-base text-ink outline-none focus:border-olive-600 focus:ring-2 focus:ring-olive-100";

type FormState = {
  businessType: OrderBusinessType;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  lineId: string;
  shippingAddress: string;
  productName: string;
  version: string;
  color: string;
  battery: string;
  accessories: string[];
  customContent: string;
  motor: string;
  controller: string;
  modifications: string;
  productUrl: string;
  quantity: number;
  productPrice: number;
  serviceFee: number;
  internationalShipping: number;
  mainlandReceiving: string;
  disassemblyMethod: string;
  storePurchase: boolean;
  customerPurchase: boolean;
  batteryViaSange: boolean;
  frameViaFourLeaf: boolean;
  deliveryMethod: string;
  assemblyMethod: string;
  assemblyStore: string;
  total: number;
  deposit: number;
  notes: string;
  createdBy: string;
  responsibleStore: string;
};

const initialForm: FormState = {
  businessType: "標準車款",
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  lineId: "",
  shippingAddress: "",
  productName: products[0]?.name ?? "FOLD",
  version: products[0]?.variants[0]?.name ?? "",
  color: products[0]?.colors[0]?.name ?? "",
  battery: "",
  accessories: [],
  customContent: "",
  motor: "",
  controller: "",
  modifications: "",
  productUrl: "",
  quantity: 1,
  productPrice: 0,
  serviceFee: 0,
  internationalShipping: 0,
  mainlandReceiving: "",
  disassemblyMethod: "車輪、車架、電池三包",
  storePurchase: false,
  customerPurchase: true,
  batteryViaSange: true,
  frameViaFourLeaf: true,
  deliveryMethod: "門市自取",
  assemblyMethod: "門市組裝",
  assemblyStore: "恆春店",
  total: 0,
  deposit: 0,
  notes: "",
  createdBy: "Ricky",
  responsibleStore: "恆春店",
};

export function OrderDraftForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [draft, setDraft] = useState<OrderDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const catalogProduct = products.find((product) => product.name === form.productName);
  const computedProcurementTotal =
    form.productPrice * form.quantity +
    form.serviceFee +
    form.internationalShipping;
  const effectiveTotal =
    form.businessType === "大陸產品代購"
      ? computedProcurementTotal
      : form.total;
  const confirmationUrl = draft
    ? `${window.location.origin}/checkout/draft/${draft.confirmation_token}`
    : "";

  const productSummary = useMemo(() => {
    if (form.businessType === "標準車款") {
      return `${form.productName} ${form.version} ${form.color}`.trim();
    }
    return form.productName.trim();
  }, [form.businessType, form.productName, form.version, form.color]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleAccessory(name: string) {
    update(
      "accessories",
      form.accessories.includes(name)
        ? form.accessories.filter((item) => item !== name)
        : [...form.accessories, name],
    );
  }

  function buildInput(): OrderDraftInput {
    const details: OrderDraftInput["custom_details"] = {
      版本: form.version,
      顏色: form.color,
      電池: form.battery,
      配件: form.accessories,
      客製內容: form.customContent,
      馬達規格: form.motor,
      控制器: form.controller,
      改裝項目: form.modifications,
      商品連結: form.productUrl,
      商品價格: form.productPrice,
      代購服務費: form.serviceFee,
      國際運費: form.internationalShipping,
      是否本店代購: form.storePurchase,
      是否客戶自行購買: form.customerPurchase,
      大陸收貨資料: form.mainlandReceiving,
      拆包方式: form.disassemblyMethod,
      車輪: form.businessType === "大陸電動車運輸",
      車架: form.businessType === "大陸電動車運輸",
      電池包裹: form.businessType === "大陸電動車運輸",
      電池走三哥物流: form.batteryViaSange,
      車輪車架走四葉物流: form.frameViaFourLeaf,
    };

    return {
      order_source: "後台人工",
      business_type: form.businessType,
      customer_name: form.customerName.trim(),
      customer_email: form.customerEmail.trim().toLowerCase(),
      customer_phone: form.customerPhone.trim(),
      line_id: form.lineId.trim(),
      product_summary: productSummary,
      custom_details: details,
      logistics_template: createDraftLogisticsTemplate(
        form.businessType,
        form.assemblyMethod,
      ),
      items: [
        {
          productName: form.productName.trim(),
          specification: form.version || form.customContent,
          color: form.color,
          quantity: form.quantity,
          unitPrice:
            form.businessType === "大陸產品代購"
              ? form.productPrice
              : effectiveTotal,
          accessories: form.accessories,
        },
      ],
      total: effectiveTotal,
      deposit_amount: form.deposit,
      balance_amount: Math.max(0, effectiveTotal - form.deposit),
      delivery_method: form.deliveryMethod,
      assembly_method: form.assemblyMethod,
      assembly_store:
        form.assemblyMethod === "門市組裝" ? form.assemblyStore : "",
      shipping_address: form.shippingAddress.trim(),
      notes: form.notes.trim(),
      created_by: form.createdBy,
      responsible_store: form.responsibleStore,
    };
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const saved = await createOrderDraft(buildInput());
      setDraft(saved);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "訂單草稿建立失敗，請稍後再試。",
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
        <h1 className="mt-2 text-2xl font-black">客戶確認網址已建立</h1>
        <p className="mt-3 text-sm leading-7 text-ink/50">
          已預建客戶資料。客戶必須使用相同 Email 或手機完成 OTP 登入，才可綁定會員並將訂單改為待付款。
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
          {copied ? "已複製" : "複製客戶確認網址"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-6">
      <Section title="業務類型">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {businessTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => update("businessType", type)}
              className={`min-h-14 rounded-2xl border px-4 text-sm font-black ${
                form.businessType === type
                  ? "border-olive-700 bg-olive-700 text-white"
                  : "border-black/10 bg-white"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </Section>

      <Section title="客戶與會員預建資料">
        <p className="mb-5 text-sm leading-7 text-ink/50">
          Email 或手機至少填一項。若資料已存在會沿用既有 profile；客戶第一次 OTP 登入時再綁定正式 Auth User ID。
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="客戶姓名"><input required className={inputClass} value={form.customerName} onChange={(e) => update("customerName", e.target.value)} /></Field>
          <Field label="手機"><input type="tel" className={inputClass} value={form.customerPhone} onChange={(e) => update("customerPhone", e.target.value)} /></Field>
          <Field label="Email"><input type="email" className={inputClass} value={form.customerEmail} onChange={(e) => update("customerEmail", e.target.value)} /></Field>
          <Field label="LINE ID"><input className={inputClass} value={form.lineId} onChange={(e) => update("lineId", e.target.value)} /></Field>
          <Field label="收件地址" className="md:col-span-2"><input className={inputClass} value={form.shippingAddress} onChange={(e) => update("shippingAddress", e.target.value)} /></Field>
        </div>
      </Section>

      <Section title={`${form.businessType}內容`}>
        {form.businessType === "標準車款" && (
          <StandardBikeFields form={form} update={update} toggleAccessory={toggleAccessory} catalogProduct={catalogProduct} />
        )}
        {form.businessType === "客製車款" && (
          <CustomBikeFields form={form} update={update} toggleAccessory={toggleAccessory} />
        )}
        {form.businessType === "大陸產品代購" && (
          <ProcurementFields form={form} update={update} computedTotal={computedProcurementTotal} />
        )}
        {form.businessType === "大陸電動車運輸" && (
          <ShippingFields form={form} update={update} />
        )}
      </Section>

      <Section title="交車、金額與內部資料">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="交車方式"><Select value={form.deliveryMethod} options={["門市自取", "宅配到府", "寄送客戶", "三包直接寄送客戶"]} onChange={(value) => update("deliveryMethod", value)} /></Field>
          <Field label="組裝方式"><Select value={form.assemblyMethod} options={["門市組裝", "客戶自行組裝", "不需組裝"]} onChange={(value) => update("assemblyMethod", value)} /></Field>
          {form.assemblyMethod === "門市組裝" && <Field label="組裝店"><Select value={form.assemblyStore} options={["恆春店", "龜山店"]} onChange={(value) => update("assemblyStore", value)} /></Field>}
          {form.businessType !== "大陸產品代購" && <Field label="總金額"><NumberInput value={form.total} onChange={(value) => update("total", value)} /></Field>}
          <Field label="訂金"><NumberInput value={form.deposit} onChange={(value) => update("deposit", value)} /></Field>
          <Field label="尾款"><input readOnly className={`${inputClass} bg-sand`} value={Math.max(0, effectiveTotal - form.deposit).toLocaleString("zh-TW")} /></Field>
          <Field label="建立人"><Select value={form.createdBy} options={["Ricky", "李兄", "李秘書", "王哥", "廖總", "恆春店", "龜山店"]} onChange={(value) => update("createdBy", value)} /></Field>
          <Field label="負責店別"><Select value={form.responsibleStore} options={["恆春店", "龜山店", "SlowBike 營運管理端", "四葉物流"]} onChange={(value) => update("responsibleStore", value)} /></Field>
          <Field label="備註" className="md:col-span-2"><textarea className={`${inputClass} min-h-24 py-3`} value={form.notes} onChange={(e) => update("notes", e.target.value)} /></Field>
        </div>
      </Section>

      {error && <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}
      <button disabled={saving || (!form.customerEmail && !form.customerPhone)} className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-olive-700 px-6 text-sm font-black text-white disabled:opacity-40">
        <Save size={18} />
        {saving ? "建立中..." : "建立訂單草稿與客戶確認網址"}
      </button>
    </form>
  );
}

function StandardBikeFields({ form, update, toggleAccessory, catalogProduct }: {
  form: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  toggleAccessory: (name: string) => void;
  catalogProduct: (typeof products)[number] | undefined;
}) {
  return <div className="grid gap-4 md:grid-cols-2">
    <Field label="車款"><Select value={form.productName} options={products.map((item) => item.name)} onChange={(value) => { const product = products.find((item) => item.name === value); update("productName", value); update("version", product?.variants[0]?.name ?? ""); update("color", product?.colors[0]?.name ?? ""); update("accessories", []); }} /></Field>
    <Field label="版本"><Select value={form.version} options={catalogProduct?.variants.map((item) => item.name) ?? []} onChange={(value) => update("version", value)} /></Field>
    <Field label="顏色"><Select value={form.color} options={catalogProduct?.colors.map((item) => item.name) ?? []} onChange={(value) => update("color", value)} /></Field>
    <Field label="電池"><input className={inputClass} value={form.battery} onChange={(e) => update("battery", e.target.value)} /></Field>
    <AccessoryFields options={catalogProduct?.accessories.map((item) => item.name) ?? []} selected={form.accessories} toggle={toggleAccessory} />
  </div>;
}

function CustomBikeFields({ form, update, toggleAccessory }: { form: FormState; update: <K extends keyof FormState>(key: K, value: FormState[K]) => void; toggleAccessory: (name: string) => void }) {
  return <div className="grid gap-4 md:grid-cols-2">
    <Field label="車款名稱"><input required className={inputClass} value={form.productName} onChange={(e) => update("productName", e.target.value)} placeholder="Super73、黑武士或特殊規格車" /></Field>
    <Field label="馬達規格"><input className={inputClass} value={form.motor} onChange={(e) => update("motor", e.target.value)} /></Field>
    <Field label="電池規格"><input className={inputClass} value={form.battery} onChange={(e) => update("battery", e.target.value)} /></Field>
    <Field label="控制器"><input className={inputClass} value={form.controller} onChange={(e) => update("controller", e.target.value)} /></Field>
    <Field label="顏色"><input className={inputClass} value={form.color} onChange={(e) => update("color", e.target.value)} /></Field>
    <Field label="客製內容"><textarea className={`${inputClass} min-h-24 py-3`} value={form.customContent} onChange={(e) => update("customContent", e.target.value)} /></Field>
    <Field label="改裝項目" className="md:col-span-2"><textarea className={`${inputClass} min-h-24 py-3`} value={form.modifications} onChange={(e) => update("modifications", e.target.value)} /></Field>
    <AccessoryFields options={["前車籃", "前後方向燈", "後照鏡", "後貨架", "其他"]} selected={form.accessories} toggle={toggleAccessory} />
  </div>;
}

function ProcurementFields({ form, update, computedTotal }: { form: FormState; update: <K extends keyof FormState>(key: K, value: FormState[K]) => void; computedTotal: number }) {
  return <div className="grid gap-4 md:grid-cols-2">
    <Field label="商品名稱"><input required className={inputClass} value={form.productName} onChange={(e) => update("productName", e.target.value)} /></Field>
    <Field label="商品連結"><input type="url" className={inputClass} value={form.productUrl} onChange={(e) => update("productUrl", e.target.value)} /></Field>
    <Field label="商品規格"><input className={inputClass} value={form.version} onChange={(e) => update("version", e.target.value)} /></Field>
    <Field label="數量"><NumberInput value={form.quantity} min={1} onChange={(value) => update("quantity", value)} /></Field>
    <Field label="商品價格"><NumberInput value={form.productPrice} onChange={(value) => update("productPrice", value)} /></Field>
    <Field label="代購服務費"><NumberInput value={form.serviceFee} onChange={(value) => update("serviceFee", value)} /></Field>
    <Field label="國際運費"><NumberInput value={form.internationalShipping} onChange={(value) => update("internationalShipping", value)} /></Field>
    <Field label="總金額"><input readOnly className={`${inputClass} bg-sand`} value={computedTotal.toLocaleString("zh-TW")} /></Field>
  </div>;
}

function ShippingFields({ form, update }: { form: FormState; update: <K extends keyof FormState>(key: K, value: FormState[K]) => void }) {
  return <div className="grid gap-4 md:grid-cols-2">
    <Field label="車款名稱"><input required className={inputClass} value={form.productName} onChange={(e) => update("productName", e.target.value)} /></Field>
    <Field label="大陸收貨資料"><textarea className={`${inputClass} min-h-24 py-3`} value={form.mainlandReceiving} onChange={(e) => update("mainlandReceiving", e.target.value)} /></Field>
    <Field label="拆包方式"><input className={inputClass} value={form.disassemblyMethod} onChange={(e) => update("disassemblyMethod", e.target.value)} /></Field>
    <Field label="電池規格"><input className={inputClass} value={form.battery} onChange={(e) => update("battery", e.target.value)} /></Field>
    <CheckField label="本店代購" checked={form.storePurchase} onChange={(value) => update("storePurchase", value)} />
    <CheckField label="客戶自行購買" checked={form.customerPurchase} onChange={(value) => update("customerPurchase", value)} />
    <CheckField label="電池走三哥國際物流" checked={form.batteryViaSange} onChange={(value) => update("batteryViaSange", value)} />
    <CheckField label="車輪／車架走四葉物流" checked={form.frameViaFourLeaf} onChange={(value) => update("frameViaFourLeaf", value)} />
  </div>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-[1.5rem] border border-black/10 bg-white p-5 sm:p-7"><h2 className="mb-6 text-xl font-black">{title}</h2>{children}</section>;
}
function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={className}><span className="mb-2 block text-sm font-black text-ink/70">{label}</span>{children}</label>;
}
function Select({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) {
  return <select className={inputClass} value={value} onChange={(e) => onChange(e.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select>;
}
function NumberInput({ value, onChange, min = 0 }: { value: number; onChange: (value: number) => void; min?: number }) {
  return <input type="number" min={min} className={inputClass} value={value} onChange={(e) => onChange(Number(e.target.value))} />;
}
function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex min-h-12 items-center gap-3 rounded-xl border border-black/10 bg-white px-4 text-sm font-black"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-5 accent-[#53653f]" />{label}</label>;
}
function AccessoryFields({ options, selected, toggle }: { options: string[]; selected: string[]; toggle: (name: string) => void }) {
  return <div className="md:col-span-2"><p className="mb-2 text-sm font-black text-ink/70">配件</p><div className="flex flex-wrap gap-2">{options.map((name) => <button type="button" key={name} onClick={() => toggle(name)} className={`rounded-full border px-4 py-2 text-sm font-bold ${selected.includes(name) ? "border-olive-700 bg-olive-700 text-white" : "border-black/10 bg-white"}`}>{name}</button>)}</div></div>;
}
