"use client";

import { Eye, Plus, Save } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMemberAuth } from "@/components/member/auth-provider";
import type {
  AccessoryRowInput,
  ColorRowInput,
  ImageRowInput,
  ProductCmsPayload,
  ProductCmsRecord,
  ProductRowInput,
  VariantRowInput,
} from "@/lib/product-cms";

const inputClass =
  "min-h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-olive-600";

function emptyProduct(): ProductCmsPayload {
  const code = `ITEM${Date.now().toString().slice(-4)}`;
  return {
    product: {
      code,
      slug: code.toLowerCase(),
      name: "",
      category: "電動腳踏車",
      series: "",
      english_series: "",
      tagline: "",
      description: "",
      long_description: "",
      price: 0,
      original_price: null,
      status: "draft",
      is_published: false,
      show_on_home: false,
      main_image: "",
      gallery: [],
      sort_order: 100,
    },
    variants: [
      {
        name: "標準版",
        price: 0,
        battery: "",
        motor: "",
        range: "",
        brakes: "",
        note: "",
        is_enabled: true,
        sort_order: 1,
      },
    ],
    colors: [
      {
        name: "夜幕黑",
        color_code: "#111111",
        image_url: "",
        is_enabled: true,
        sort_order: 1,
      },
    ],
    accessories: [],
    images: [],
  };
}

function recordToPayload(record: ProductCmsRecord): ProductCmsPayload {
  return {
    product: record.product,
    variants: record.variants,
    colors: record.colors,
    accessories: record.accessories,
    images: record.images,
  };
}

export function ProductAdmin() {
  const { session, ready } = useMemberAuth();
  const [records, setRecords] = useState<ProductCmsRecord[]>([]);
  const [draft, setDraft] = useState<ProductCmsPayload>(emptyProduct());
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const headers = useMemo<Record<string, string>>(
    () => {
      const value: Record<string, string> = { "Content-Type": "application/json" };
      if (session) value.Authorization = `Bearer ${session.access_token}`;
      return value;
    },
    [session],
  );

  useEffect(() => {
    if (!session) return;
    fetch("/api/admin/products", { headers })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) setRecords(data);
      })
      .finally(() => setLoading(false));
  }, [headers, session]);

  function selectRecord(record: ProductCmsRecord) {
    setSelectedId(record.product.id);
    setDraft(recordToPayload(record));
    setMessage("");
  }

  function updateProduct<K extends keyof ProductRowInput>(
    key: K,
    value: ProductRowInput[K],
  ) {
    setDraft((current) => ({
      ...current,
      product: { ...current.product, [key]: value },
    }));
  }

  function updateList<T>(
    key: "variants" | "colors" | "accessories" | "images",
    index: number,
    value: Partial<T>,
  ) {
    setDraft((current) => ({
      ...current,
      [key]: current[key].map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...value } : item,
      ),
    }));
  }

  function addVariant() {
    setDraft((current) => ({
      ...current,
      variants: [
        ...current.variants,
        {
          name: "新版本",
          price: current.product.price,
          battery: "",
          motor: "",
          range: "",
          brakes: "",
          note: "",
          is_enabled: true,
          sort_order: current.variants.length + 1,
        },
      ],
    }));
  }

  function addColor() {
    setDraft((current) => ({
      ...current,
      colors: [
        ...current.colors,
        {
          name: "新車色",
          color_code: "#59644a",
          image_url: "",
          is_enabled: true,
          sort_order: current.colors.length + 1,
        },
      ],
    }));
  }

  function addAccessory() {
    setDraft((current) => ({
      ...current,
      accessories: [
        ...current.accessories,
        {
          name: "新配件",
          price: 0,
          description: "",
          image_url: "",
          is_enabled: true,
          sort_order: current.accessories.length + 1,
        },
      ],
    }));
  }

  function addImage() {
    setDraft((current) => ({
      ...current,
      images: [
        ...current.images,
        {
          usage: "gallery",
          image_url: "",
          alt: current.product.name,
          sort_order: current.images.length + 1,
        },
      ],
    }));
  }

  async function save() {
    if (!session) return;
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers,
      body: JSON.stringify(draft),
    });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) {
      setMessage(data.error ?? "商品儲存失敗");
      return;
    }
    setMessage("商品已儲存。前台會讀取最新資料。");
  }

  async function hide() {
    if (!session || !draft.product.id) return;
    setSaving(true);
    const response = await fetch("/api/admin/products", {
      method: "PATCH",
      headers,
      body: JSON.stringify({ id: draft.product.id, action: "hide" }),
    });
    setSaving(false);
    setMessage(response.ok ? "商品已下架。" : "下架失敗。");
    updateProduct("status", "hidden");
    updateProduct("is_published", false);
  }

  if (!ready) return <p className="mt-8 font-bold">讀取會員狀態...</p>;
  if (!session) {
    return (
      <div className="mt-8 rounded-3xl bg-white p-6 font-bold">
        請先登入管理員帳號。
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-3xl border border-black/10 bg-white p-5">
        <button
          type="button"
          onClick={() => {
            setDraft(emptyProduct());
            setSelectedId("");
            setMessage("");
          }}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-4 text-sm font-black text-white"
        >
          <Plus size={17} /> 新增商品
        </button>
        <div className="mt-5 grid gap-2">
          {loading && <p className="text-sm text-ink/45">讀取商品中...</p>}
          {records.map((record) => (
            <button
              key={record.product.id}
              type="button"
              onClick={() => selectRecord(record)}
              className={`rounded-2xl px-4 py-3 text-left text-sm font-bold ${
                selectedId === record.product.id
                  ? "bg-olive-700 text-white"
                  : "bg-sand text-ink"
              }`}
            >
              <span className="block">{record.product.name || record.product.code}</span>
              <span className="mt-1 block text-xs opacity-60">
                {record.product.status}｜{record.product.slug}
              </span>
            </button>
          ))}
        </div>
      </aside>

      <main className="grid gap-6">
        <Section title="商品基本資料">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="商品名稱" value={draft.product.name} onChange={(value) => updateProduct("name", value)} />
            <Field label="商品代號" value={draft.product.code} onChange={(value) => updateProduct("code", value)} />
            <Field label="商品 Slug" value={draft.product.slug} onChange={(value) => updateProduct("slug", value)} />
            <Field label="商品分類" value={draft.product.category} onChange={(value) => updateProduct("category", value)} />
            <Field label="系列" value={draft.product.series} onChange={(value) => updateProduct("series", value)} />
            <Field label="英文系列" value={draft.product.english_series} onChange={(value) => updateProduct("english_series", value)} />
            <NumberField label="售價" value={draft.product.price} onChange={(value) => updateProduct("price", value)} />
            <NumberField label="原價" value={draft.product.original_price ?? 0} onChange={(value) => updateProduct("original_price", value)} />
            <NumberField label="排序" value={draft.product.sort_order} onChange={(value) => updateProduct("sort_order", value)} />
            <Field label="主圖 URL" value={draft.product.main_image ?? ""} onChange={(value) => updateProduct("main_image", value)} />
          </div>
          <Field label="簡短介紹" value={draft.product.tagline} onChange={(value) => updateProduct("tagline", value)} />
          <TextArea label="詳細介紹" value={draft.product.description} onChange={(value) => updateProduct("description", value)} />
          <TextArea label="長文案" value={draft.product.long_description} onChange={(value) => updateProduct("long_description", value)} />
          <div className="flex flex-wrap gap-3">
            <Toggle label="發布上架" checked={draft.product.is_published} onChange={(value) => {
              updateProduct("is_published", value);
              updateProduct("status", value ? "published" : "draft");
            }} />
            <Toggle label="首頁顯示" checked={draft.product.show_on_home} onChange={(value) => updateProduct("show_on_home", value)} />
          </div>
        </Section>

        <EditableList title="版本規格" onAdd={addVariant}>
          {draft.variants.map((variant, index) => (
            <div key={index} className="grid gap-3 rounded-2xl bg-sand p-4 sm:grid-cols-2">
              <Field label="版本名稱" value={variant.name} onChange={(value) => updateList<VariantRowInput>("variants", index, { name: value })} />
              <NumberField label="售價" value={variant.price} onChange={(value) => updateList<VariantRowInput>("variants", index, { price: value })} />
              <Field label="電池容量" value={variant.battery} onChange={(value) => updateList<VariantRowInput>("variants", index, { battery: value })} />
              <Field label="馬達功率" value={variant.motor} onChange={(value) => updateList<VariantRowInput>("variants", index, { motor: value })} />
              <Field label="續航" value={variant.range} onChange={(value) => updateList<VariantRowInput>("variants", index, { range: value })} />
              <Field label="煞車" value={variant.brakes} onChange={(value) => updateList<VariantRowInput>("variants", index, { brakes: value })} />
              <Field label="備註" value={variant.note} onChange={(value) => updateList<VariantRowInput>("variants", index, { note: value })} />
              <Toggle label="啟用" checked={variant.is_enabled} onChange={(value) => updateList<VariantRowInput>("variants", index, { is_enabled: value })} />
            </div>
          ))}
        </EditableList>

        <EditableList title="車色管理" onAdd={addColor}>
          {draft.colors.map((color, index) => (
            <div key={index} className="grid gap-3 rounded-2xl bg-sand p-4 sm:grid-cols-2">
              <Field label="顏色名稱" value={color.name} onChange={(value) => updateList<ColorRowInput>("colors", index, { name: value })} />
              <Field label="顏色代碼" value={color.color_code} onChange={(value) => updateList<ColorRowInput>("colors", index, { color_code: value })} />
              <Field label="顏色圖片 URL" value={color.image_url ?? ""} onChange={(value) => updateList<ColorRowInput>("colors", index, { image_url: value })} />
              <Toggle label="啟用" checked={color.is_enabled} onChange={(value) => updateList<ColorRowInput>("colors", index, { is_enabled: value })} />
            </div>
          ))}
        </EditableList>

        <EditableList title="加購配件" onAdd={addAccessory}>
          {draft.accessories.map((accessory, index) => (
            <div key={index} className="grid gap-3 rounded-2xl bg-sand p-4 sm:grid-cols-2">
              <Field label="配件名稱" value={accessory.name} onChange={(value) => updateList<AccessoryRowInput>("accessories", index, { name: value })} />
              <NumberField label="配件價格" value={accessory.price} onChange={(value) => updateList<AccessoryRowInput>("accessories", index, { price: value })} />
              <Field label="配件圖片 URL" value={accessory.image_url ?? ""} onChange={(value) => updateList<AccessoryRowInput>("accessories", index, { image_url: value })} />
              <Field label="配件說明" value={accessory.description} onChange={(value) => updateList<AccessoryRowInput>("accessories", index, { description: value })} />
              <Toggle label="啟用" checked={accessory.is_enabled} onChange={(value) => updateList<AccessoryRowInput>("accessories", index, { is_enabled: value })} />
            </div>
          ))}
        </EditableList>

        <EditableList title="商品圖片集" onAdd={addImage}>
          {draft.images.map((image, index) => (
            <div key={index} className="grid gap-3 rounded-2xl bg-sand p-4 sm:grid-cols-2">
              <Field label="用途" value={image.usage} onChange={(value) => updateList<ImageRowInput>("images", index, { usage: value })} />
              <Field label="圖片 URL" value={image.image_url} onChange={(value) => updateList<ImageRowInput>("images", index, { image_url: value })} />
              <Field label="圖片說明" value={image.alt} onChange={(value) => updateList<ImageRowInput>("images", index, { alt: value })} />
            </div>
          ))}
        </EditableList>

        <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-3xl border border-black/10 bg-white/95 p-4 shadow-soft backdrop-blur">
          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-olive-700 px-6 text-sm font-black text-white disabled:opacity-50"
          >
            <Save size={17} /> {saving ? "儲存中..." : "儲存商品"}
          </button>
          {draft.product.id && (
            <>
              <button
                type="button"
                onClick={hide}
                className="min-h-12 rounded-full border border-black/10 px-6 text-sm font-black"
              >
                下架商品
              </button>
              <Link
                href={`/products/${draft.product.slug}`}
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-olive-700 px-6 text-sm font-black text-olive-700"
              >
                <Eye size={17} /> 預覽商品頁
              </Link>
            </>
          )}
          {message && <p className="text-sm font-bold text-olive-700">{message}</p>}
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 rounded-3xl border border-black/10 bg-white p-5 sm:p-7">
      <h2 className="text-xl font-black">{title}</h2>
      {children}
    </section>
  );
}

function EditableList({
  title,
  onAdd,
  children,
}: {
  title: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <Section title={title}>
      <div className="grid gap-3">{children}</div>
      <button
        type="button"
        onClick={onAdd}
        className="min-h-11 rounded-full border border-black/10 px-4 text-sm font-black"
      >
        新增一筆
      </button>
    </Section>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-black">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-black">
      {label}
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={inputClass}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-black">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} min-h-28 py-3`}
      />
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 items-center gap-3 rounded-xl border border-black/10 bg-white px-3 text-sm font-black">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}
