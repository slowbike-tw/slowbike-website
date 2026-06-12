"use client";

import { Camera, Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  assemblyStatuses,
  businessTypes,
  createGeneralProductPackages,
  deliveryStatuses,
  createProxyBikePackages,
  createStandardBikePackages,
  logisticsStatuses,
  logisticsSources,
  packageHandlers,
  packageItemTypes,
  productTypes,
} from "@/lib/logistics";
import { products } from "@/lib/products";
import type {
  LogisticsOrder,
  LogisticsOrderInput,
  LogisticsPackage,
} from "@/types/logistics";
import { useLogistics } from "./logistics-provider";

const standardBikeNames = products.map((product) => `${product.name} ${product.series}`);
const defaultProduct = products[0];
const defaultVariants = defaultProduct.variants.map((variant) => variant.name);
const defaultColors = defaultProduct.colors.map((color) => color.name);
const defaultBatteries = defaultProduct.variants.flatMap(
  (variant) => variant.specs?.filter((spec) => spec.label === "電池").map((spec) => spec.value) ?? [],
);

const emptyInput: LogisticsOrderInput = {
  authUserId: "",
  customerOrderId: "",
  logisticsSource: "後台人工",
  sourceOrderNo: "",
  createdBy: "Ricky",
  businessType: "標準車款 / 客製車款",
  note: "",
  customer: { name: "", phone: "", email: "", lineId: "", address: "", note: "" },
  product: {
    type: "標準車款",
    name: standardBikeNames[0],
    specification: defaultVariants[0],
    color: defaultColors[0],
    battery: defaultBatteries[0],
    note: "",
  },
  tracking: { wheel: "", frame: "", battery: "", general: "", other: "" },
  packages: createStandardBikePackages(),
  logisticsStatus: "待出貨",
  assemblyMethod: "門市組裝",
  assemblyStatus: "待組裝",
  assemblyStore: "恆春店",
  deliveryStatus: "未交車",
  deliveryMethod: "門市自取",
  photos: [],
};

const inputClass =
  "min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-base text-ink outline-none transition placeholder:text-ink/30 focus:border-olive-600 focus:ring-2 focus:ring-olive-100";
const labelClass = "mb-2 block text-sm font-black text-ink/75";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function Section({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.5rem] border border-black/10 bg-white p-5 sm:p-7">
      <div className="mb-6 flex gap-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-olive-700 text-xs font-black text-white">
          {number}
        </span>
        <div>
          <h2 className="text-xl font-black">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-ink/50">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function OrderForm({ order }: { order?: LogisticsOrder }) {
  const router = useRouter();
  const { addOrder, updateOrder } = useLogistics();
  const [form, setForm] = useState<LogisticsOrderInput>(
    order
      ? {
          authUserId: order.authUserId ?? "",
          customerOrderId: order.customerOrderId ?? "",
          logisticsSource: order.logisticsSource ?? "後台人工",
          sourceOrderNo: order.sourceOrderNo ?? "",
          createdBy: order.createdBy,
          businessType: order.businessType,
          note: order.note,
          customer: order.customer,
          product: order.product,
          tracking: order.tracking,
          packages: order.packages,
          logisticsStatus: order.logisticsStatus,
          assemblyMethod: order.assemblyMethod,
          assemblyStatus: order.assemblyStatus,
          assemblyStore: order.assemblyStore,
          deliveryStatus: order.deliveryStatus,
          deliveryMethod: order.deliveryMethod,
          photos: order.photos,
        }
      : emptyInput,
  );
  const [saving, setSaving] = useState(false);
  const isStandardBike = form.product.type === "標準車款";
  const catalogProduct = products.find(
    (product) => `${product.name} ${product.series}` === form.product.name,
  );
  const standardBikeVariants = catalogProduct?.variants.map((variant) => variant.name) ?? [];
  const standardBikeColors = catalogProduct?.colors.map((color) => color.name) ?? [];
  const standardBikeBatteries = Array.from(
    new Set(
      catalogProduct?.variants.flatMap(
        (variant) =>
          variant.specs?.filter((spec) => spec.label === "電池").map((spec) => spec.value) ?? [],
      ) ?? [],
    ),
  );
  const isGeneralProduct =
    form.product.type === "一般商品代購" || form.product.type === "特殊商品代購";
  const usesPackageTracking = form.packages.length > 0;

  function setNested<T extends "customer" | "product" | "tracking">(
    group: T,
    key: keyof LogisticsOrderInput[T],
    value: string,
  ) {
    setForm((current) => ({ ...current, [group]: { ...current[group], [key]: value } }));
  }

  function handlePhotos(files: FileList | null) {
    if (!files) return;
    const names = Array.from(files).map((file) => file.name);
    setForm((current) => ({ ...current, photos: [...current.photos, ...names] }));
  }

  function handleProductTypeChange(value: LogisticsOrderInput["product"]["type"]) {
    const packages =
      value === "標準車款" || value === "客製車款"
        ? createStandardBikePackages()
        : value === "代購代運電動車"
          ? createProxyBikePackages()
          : createGeneralProductPackages();
    const noAssembly = value === "一般商品代購" || value === "特殊商品代購";
    setForm((current) => ({
      ...current,
      businessType:
        value === "標準車款" || value === "客製車款"
          ? "標準車款 / 客製車款"
          : value === "代購代運電動車"
            ? "代購代運電動車"
            : "一般商品及特殊商品代購",
      product: {
        ...current.product,
        type: value,
        name: value === "標準車款" ? standardBikeNames[0] : "",
        specification: value === "標準車款" ? defaultVariants[0] : "",
        color: value === "標準車款" ? defaultColors[0] : "",
        battery: value === "標準車款" ? defaultBatteries[0] : "",
      },
      packages,
      assemblyMethod: noAssembly ? "不需組裝" : "門市組裝",
      assemblyStatus: noAssembly ? "不需組裝" : "待組裝",
      assemblyStore: noAssembly ? "" : "恆春店",
      deliveryMethod: noAssembly ? "寄送客戶" : "門市自取",
    }));
  }

  function handleStandardProductChange(value: string) {
    const selected = products.find((product) => `${product.name} ${product.series}` === value);
    const batteries =
      selected?.variants.flatMap(
        (variant) =>
          variant.specs?.filter((spec) => spec.label === "電池").map((spec) => spec.value) ?? [],
      ) ?? [];
    setForm((current) => ({
      ...current,
      product: {
        ...current.product,
        name: value,
        specification: selected?.variants[0]?.name ?? "",
        color: selected?.colors[0]?.name ?? "",
        battery: batteries[0] ?? "",
      },
    }));
  }

  function updatePackage(id: string, key: keyof LogisticsPackage, value: string) {
    setForm((current) => ({
      ...current,
      packages: current.packages.map((item) =>
        item.id === id ? { ...item, [key]: value } : item,
      ),
    }));
  }

  function addPackage() {
    setForm((current) => ({
      ...current,
      packages: [
        ...current.packages,
        {
          id: crypto.randomUUID(),
          name: "其他",
          itemType: "其他",
          customItemName: "",
          handler: "SlowBike 營運管理端",
          handlerUnit: "SlowBike 營運管理端",
          customHandler: "",
          shippingMethod: "",
          status: "待出貨",
          trackingNumber: "",
          note: "",
        },
      ],
    }));
  }

  function removePackage(id: string) {
    setForm((current) => ({
      ...current,
      packages: current.packages.filter((item) => item.id !== id),
    }));
  }

  function handlePackageTypeChange(item: LogisticsPackage, value: LogisticsPackage["itemType"]) {
    setForm((current) => ({
      ...current,
      packages: current.packages.map((currentItem) =>
        currentItem.id === item.id
          ? {
              ...currentItem,
              itemType: value,
              name: value === "其他" ? currentItem.customItemName || "其他" : value || "其他",
              customItemName: value === "其他" ? currentItem.customItemName || "" : "",
            }
          : currentItem,
      ),
    }));
  }

  function handleHandlerChange(item: LogisticsPackage, value: LogisticsPackage["handlerUnit"]) {
    setForm((current) => ({
      ...current,
      packages: current.packages.map((currentItem) =>
        currentItem.id === item.id
          ? {
              ...currentItem,
              handlerUnit: value,
              handler: value === "其他" ? currentItem.customHandler || "其他" : value || "其他",
              customHandler: value === "其他" ? currentItem.customHandler || "" : "",
            }
          : currentItem,
      ),
    }));
  }

  function handleAssemblyMethodChange(value: LogisticsOrderInput["assemblyMethod"]) {
    setForm((current) => ({
      ...current,
      assemblyMethod: value,
      assemblyStatus: value === "門市組裝" ? "待組裝" : "不需組裝",
      assemblyStore: value === "門市組裝" ? current.assemblyStore || "恆春店" : "",
      deliveryMethod:
        value === "客戶自行組裝"
          ? "三包直接寄送客戶"
          : value === "不需組裝"
            ? "寄送客戶"
            : "門市自取",
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      if (order) {
        await updateOrder(order.id, form);
        router.push(`/admin/logistics/orders/${order.id}`);
      } else {
        const created = await addOrder(form);
        router.push(`/admin/logistics/orders/${created.id}`);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <Section number="01" title="訂單基本資料" description="設定業務分類與負責建立人。">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="物流單來源">
            <select
              className={inputClass}
              value={form.logisticsSource ?? "後台人工"}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  logisticsSource:
                    event.target.value as LogisticsOrderInput["logisticsSource"],
                }))
              }
            >
              {logisticsSources.map((source) => (
                <option key={source}>{source}</option>
              ))}
            </select>
          </Field>
          <Field label="來源訂單編號">
            <input
              className={inputClass}
              value={form.sourceOrderNo ?? ""}
              placeholder="官網訂單、線下訂單或舊單號"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  sourceOrderNo: event.target.value,
                }))
              }
            />
          </Field>
          <Field label="會員 ID（選填）">
            <input
              className={inputClass}
              value={form.authUserId ?? ""}
              placeholder="未綁定會員可留空"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  authUserId: event.target.value.trim(),
                }))
              }
            />
          </Field>
          <Field label="正式訂單 ID（選填）">
            <input
              className={inputClass}
              value={form.customerOrderId ?? ""}
              placeholder="官網付款完成後自動帶入"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  customerOrderId: event.target.value.trim(),
                }))
              }
            />
          </Field>
          <Field label="業務類型">
            <select
              className={inputClass}
              value={form.businessType}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  businessType: event.target.value as LogisticsOrderInput["businessType"],
                }))
              }
            >
              {businessTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </Field>
          <Field label="建立人">
            <select
              className={inputClass}
              value={form.createdBy}
              onChange={(event) => setForm((current) => ({ ...current, createdBy: event.target.value }))}
            >
              {["Ricky", "李兄", "李秘書", "王哥", "廖總", "恆春店", "龜山店"].map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </Field>
          <Field label="訂單備註" className="md:col-span-2">
            <textarea
              className={`${inputClass} min-h-24 py-3`}
              value={form.note}
              onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
            />
          </Field>
        </div>
      </Section>

      <Section number="02" title="客戶資料" description="姓名、電話與訂單編號都可用於快速查詢。">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="客戶姓名">
            <input
              required
              className={inputClass}
              value={form.customer.name}
              onChange={(event) => setNested("customer", "name", event.target.value)}
            />
          </Field>
          <Field label="電話">
            <input
              required
              inputMode="tel"
              className={inputClass}
              value={form.customer.phone}
              onChange={(event) => setNested("customer", "phone", event.target.value)}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className={inputClass}
              value={form.customer.email ?? ""}
              onChange={(event) => setNested("customer", "email", event.target.value)}
            />
          </Field>
          <Field label="LINE ID">
            <input
              className={inputClass}
              value={form.customer.lineId}
              onChange={(event) => setNested("customer", "lineId", event.target.value)}
            />
          </Field>
          <Field label="收件地址">
            <input
              className={inputClass}
              value={form.customer.address}
              onChange={(event) => setNested("customer", "address", event.target.value)}
            />
          </Field>
          <Field label="客戶備註" className="md:col-span-2">
            <textarea
              className={`${inputClass} min-h-20 py-3`}
              value={form.customer.note}
              onChange={(event) => setNested("customer", "note", event.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section number="03" title="商品資料" description="記錄車款、規格、顏色與電池資訊。">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="商品類型">
            <select
              className={inputClass}
              value={form.product.type}
              onChange={(event) =>
                handleProductTypeChange(event.target.value as LogisticsOrderInput["product"]["type"])
              }
            >
              {productTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </Field>
          <Field label="商品名稱">
            {isStandardBike ? (
              <select
                required
                className={inputClass}
                value={form.product.name}
                onChange={(event) => handleStandardProductChange(event.target.value)}
              >
                {!standardBikeNames.includes(form.product.name) && form.product.name && (
                  <option value={form.product.name}>{form.product.name}（原資料）</option>
                )}
                {standardBikeNames.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            ) : (
              <input
                required
                className={inputClass}
                value={form.product.name}
                onChange={(event) => setNested("product", "name", event.target.value)}
              />
            )}
          </Field>
          <Field label={isStandardBike ? "規格 / 版本" : "商品規格"}>
            {isStandardBike ? (
              <select
                className={inputClass}
                value={form.product.specification}
                onChange={(event) => {
                  const variant = catalogProduct?.variants.find(
                    (item) => item.name === event.target.value,
                  );
                  const battery = variant?.specs?.find((spec) => spec.label === "電池")?.value;
                  setForm((current) => ({
                    ...current,
                    product: {
                      ...current.product,
                      specification: event.target.value,
                      battery: battery ?? current.product.battery,
                    },
                  }));
                }}
              >
                {!standardBikeVariants.includes(form.product.specification) &&
                  form.product.specification && (
                    <option value={form.product.specification}>
                      {form.product.specification}（原資料）
                    </option>
                  )}
                {standardBikeVariants.map((variant) => (
                  <option key={variant}>{variant}</option>
                ))}
              </select>
            ) : (
              <input
                className={inputClass}
                value={form.product.specification}
                onChange={(event) => setNested("product", "specification", event.target.value)}
              />
            )}
          </Field>
          {!isGeneralProduct && (
            <>
              <Field label="顏色">
                {isStandardBike ? (
                  <select
                    className={inputClass}
                    value={form.product.color}
                    onChange={(event) => setNested("product", "color", event.target.value)}
                  >
                    {!standardBikeColors.includes(form.product.color) && form.product.color && (
                      <option value={form.product.color}>{form.product.color}（原資料）</option>
                    )}
                    {standardBikeColors.map((color) => (
                      <option key={color}>{color}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={inputClass}
                    value={form.product.color}
                    onChange={(event) => setNested("product", "color", event.target.value)}
                  />
                )}
              </Field>
              <Field label="電池規格">
                {isStandardBike ? (
                  <select
                    className={inputClass}
                    value={form.product.battery}
                    onChange={(event) => setNested("product", "battery", event.target.value)}
                  >
                    {!standardBikeBatteries.includes(form.product.battery) &&
                      form.product.battery && (
                        <option value={form.product.battery}>{form.product.battery}（原資料）</option>
                      )}
                    {standardBikeBatteries.map((battery) => (
                      <option key={battery}>{battery}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={inputClass}
                    value={form.product.battery}
                    onChange={(event) => setNested("product", "battery", event.target.value)}
                  />
                )}
              </Field>
            </>
          )}
          <Field label="商品備註">
            <input
              className={inputClass}
              value={form.product.note}
              onChange={(event) => setNested("product", "note", event.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section number="04" title="物流與包裹" description="可同時管理車輪、車架、電池與其他包裹單號。">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="物流狀態">
            <select
              className={inputClass}
              value={form.logisticsStatus}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  logisticsStatus: event.target.value as LogisticsOrderInput["logisticsStatus"],
                }))
              }
            >
              {logisticsStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </Field>
        </div>
        {usesPackageTracking && (
          <div className="mt-6 border-t border-black/10 pt-6">
            <div className="mb-5 rounded-2xl bg-olive-50 p-4 text-sm leading-6 text-olive-900">
              {form.product.type === "代購代運電動車" ? (
                <p>
                  四葉物流端填寫車輪、車架出貨資訊；電池交由三哥國際物流後，單號由
                  SlowBike 營運管理端填寫。
                </p>
              ) : form.product.type === "一般商品代購" ||
                form.product.type === "特殊商品代購" ? (
                <p>四葉物流端負責收貨、安排出貨並填寫相關物流單號。</p>
              ) : (
                <p>
                  康哥與三哥國際物流的出貨單號，皆由 SlowBike 營運管理端填寫。
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-black">包裹資料</h3>
                <p className="mt-1 text-xs leading-5 text-ink/45">
                  依業務類型自動帶入預設包裹，仍可依實際情況增減。
                </p>
              </div>
              <button
                type="button"
                onClick={addPackage}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-olive-600 px-4 text-sm font-black text-olive-700"
              >
                <Plus size={16} />
                新增包裹
              </button>
            </div>
            <div className="mt-4 grid gap-4">
              {form.packages.map((item, index) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-black/10 bg-[#f8f7f2] p-4 sm:p-5"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-sm font-black text-olive-700">包裹 {index + 1}</p>
                    <button
                      type="button"
                      onClick={() => removePackage(item.id)}
                      className="grid size-10 place-items-center rounded-full text-ink/40 transition hover:bg-white hover:text-red-700"
                      aria-label={`移除${item.name}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="包裹名稱">
                      <select
                        className={inputClass}
                        value={item.itemType || "其他"}
                        onChange={(event) =>
                          handlePackageTypeChange(
                            item,
                            event.target.value as LogisticsPackage["itemType"],
                          )
                        }
                      >
                        {packageItemTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="處理單位">
                      <select
                        className={inputClass}
                        value={item.handlerUnit || "其他"}
                        onChange={(event) =>
                          handleHandlerChange(
                            item,
                            event.target.value as LogisticsPackage["handlerUnit"],
                          )
                        }
                      >
                        {packageHandlers.map((handler) => (
                          <option key={handler} value={handler}>
                            {handler}
                          </option>
                        ))}
                      </select>
                    </Field>
                    {item.itemType === "其他" && (
                      <Field label="其他品項名稱" className="md:col-span-2">
                        <input
                          required
                          className={inputClass}
                          value={item.customItemName || ""}
                          onChange={(event) => {
                            updatePackage(item.id, "customItemName", event.target.value);
                            updatePackage(item.id, "name", event.target.value);
                          }}
                        />
                      </Field>
                    )}
                    {item.handlerUnit === "其他" && (
                      <Field label="其他處理單位" className="md:col-span-2">
                        <input
                          required
                          className={inputClass}
                          value={item.customHandler || ""}
                          onChange={(event) => {
                            updatePackage(item.id, "customHandler", event.target.value);
                            updatePackage(item.id, "handler", event.target.value);
                          }}
                        />
                      </Field>
                    )}
                    <Field label="物流狀態">
                      <select
                        className={inputClass}
                        value={item.status}
                        onChange={(event) => updatePackage(item.id, "status", event.target.value)}
                      >
                        {logisticsStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="物流單號">
                      <input
                        className={inputClass}
                        value={item.trackingNumber}
                        onChange={(event) =>
                          updatePackage(item.id, "trackingNumber", event.target.value)
                        }
                      />
                    </Field>
                    <Field label="備註" className="md:col-span-2">
                      <textarea
                        className={`${inputClass} min-h-20 py-3`}
                        value={item.note}
                        onChange={(event) => updatePackage(item.id, "note", event.target.value)}
                      />
                    </Field>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </Section>

      <Section number="05" title="組裝與交車" description="設定組裝店、目前進度與最後交車方式。">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="組裝方式">
            <select
              className={inputClass}
              value={form.assemblyMethod}
              onChange={(event) =>
                handleAssemblyMethodChange(
                  event.target.value as LogisticsOrderInput["assemblyMethod"],
                )
              }
            >
              <option>門市組裝</option>
              <option>客戶自行組裝</option>
              <option>不需組裝</option>
            </select>
          </Field>
          <Field label="組裝狀態">
            <select
              className={inputClass}
              value={form.assemblyStatus}
              disabled={form.assemblyMethod !== "門市組裝"}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  assemblyStatus: event.target.value as LogisticsOrderInput["assemblyStatus"],
                }))
              }
            >
              {assemblyStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </Field>
          {form.assemblyMethod === "門市組裝" && (
            <Field label="組裝店">
              <select
                className={inputClass}
                value={form.assemblyStore}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    assemblyStore: event.target.value as LogisticsOrderInput["assemblyStore"],
                  }))
                }
              >
                <option>恆春店</option>
                <option>龜山店</option>
              </select>
            </Field>
          )}
          <Field label="交車狀態">
            <select
              className={inputClass}
              value={form.deliveryStatus}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  deliveryStatus: event.target.value as LogisticsOrderInput["deliveryStatus"],
                }))
              }
            >
              {deliveryStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </Field>
          <Field label="交車方式">
            <select
              className={inputClass}
              value={form.deliveryMethod}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  deliveryMethod: event.target.value as LogisticsOrderInput["deliveryMethod"],
                }))
              }
            >
              <option>門市自取</option>
              <option value="宅配到府">宅配到府（配送費 NT$800）</option>
              <option>三包直接寄送客戶</option>
              <option>寄送客戶</option>
            </select>
          </Field>
        </div>
      </Section>

      <Section number="06" title="照片" description="V1 先保存檔名，未來接雲端儲存後可直接替換為照片網址。">
        <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-olive-500 bg-olive-50 p-5 text-center">
          <Camera className="text-olive-700" />
          <span className="mt-2 text-sm font-black">選擇組裝或交車照片</span>
          <span className="mt-1 text-xs text-ink/45">支援手機直接選取照片</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(event) => handlePhotos(event.target.files)}
          />
        </label>
        {form.photos.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {form.photos.map((photo, index) => (
              <span key={`${photo}-${index}`} className="rounded-full bg-sand px-3 py-2 text-xs font-bold">
                {photo}
              </span>
            ))}
          </div>
        )}
      </Section>

      <div className="sticky bottom-4 z-20 rounded-2xl border border-black/10 bg-white/95 p-3 shadow-soft backdrop-blur">
        <button
          type="submit"
          disabled={saving}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-olive-700 px-6 text-base font-black text-white transition hover:bg-olive-800 disabled:opacity-60"
        >
          <Save size={19} />
          {saving ? "儲存中..." : order ? "儲存訂單變更" : "建立物流訂單"}
        </button>
      </div>
    </form>
  );
}
