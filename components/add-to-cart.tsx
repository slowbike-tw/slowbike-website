"use client";

import { Check, MessageCircle, Minus, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { useProductSelection } from "@/components/product-selection-provider";
import { formatPrice, getConfigurationPrice } from "@/lib/products";
import type { Product } from "@/types/product";

export function AddToCart({
  product,
  disabled = false,
}: {
  product: Product;
  disabled?: boolean;
}) {
  const { addItem } = useCart();
  const enabledVariants = product.variants.filter((variant) => variant.enabled);
  const enabledAccessories = product.accessories.filter((accessory) => accessory.enabled);
  const { color, setColor } = useProductSelection();
  const [variantId, setVariantId] = useState(enabledVariants[0]?.id ?? "");
  const [accessoryIds, setAccessoryIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const unitPrice = getConfigurationPrice(product, variantId, accessoryIds);
  const configurationTotal = unitPrice === null ? null : unitPrice * quantity;
  const selectedVariant = enabledVariants.find((variant) => variant.id === variantId);

  function handleAdd() {
    if (!variantId) return;
    addItem({ productId: product.id, variantId, color, accessoryIds, quantity });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  function toggleAccessory(accessoryId: string) {
    setAccessoryIds((current) =>
      current.includes(accessoryId)
        ? current.filter((id) => id !== accessoryId)
        : [...current, accessoryId],
    );
  }

  return (
    <div>
      <div>
        <p className="text-xs font-black tracking-[0.16em] text-ink/45">選擇版本</p>
        <div className="mt-3 grid gap-3">
          {enabledVariants.map((variant) => (
            <button
              key={variant.id}
              type="button"
              onClick={() => setVariantId(variant.id)}
              className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${
                variantId === variant.id
                  ? "border-ink bg-ink text-white"
                  : "border-black/15 bg-white text-ink"
              }`}
            >
              <span>
                <span className="block text-sm font-black">{variant.name}</span>
                {variant.description && (
                  <span className={`mt-1 block text-xs ${variantId === variant.id ? "text-white/50" : "text-ink/40"}`}>
                    {variant.description}
                  </span>
                )}
              </span>
              <span className="text-sm font-black">{formatPrice(variant.price)}</span>
            </button>
          ))}
        </div>
        {selectedVariant && (
          <div className="mt-3 rounded-2xl bg-white/60 p-4">
            <p className="text-sm font-black">{selectedVariant.name}</p>
            {selectedVariant.description && (
              <p className="mt-1 text-xs leading-5 text-ink/50">
                {selectedVariant.description}
              </p>
            )}
            {selectedVariant.specs && (
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                {selectedVariant.specs.slice(0, 4).map((spec) => (
                  <p key={spec.label}>
                    <span className="text-ink/40">{spec.label}</span>
                    <span className="ml-2 font-bold">{spec.value}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div>
        <p className="mt-6 text-xs font-black tracking-[0.16em] text-ink/45">選擇車色</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {product.colors.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => setColor(item.name)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold transition ${
                color === item.name ? "border-ink bg-ink text-white" : "border-black/15 bg-white text-ink"
              }`}
            >
              <span
                className="size-3.5 rounded-full border border-white/30 shadow-[0_0_0_1px_rgba(0,0,0,0.12)]"
                style={{ backgroundColor: item.value }}
              />
              {item.name}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <p className="text-xs font-black tracking-[0.16em] text-ink/45">加購配件</p>
        {enabledAccessories.length > 0 ? (
          <div className="mt-3 grid gap-3">
            {enabledAccessories.map((accessory) => {
              const selected = accessoryIds.includes(accessory.id);
              return (
                <button
                  key={accessory.id}
                  type="button"
                  onClick={() => toggleAccessory(accessory.id)}
                  className={`flex items-center justify-between rounded-2xl border p-4 text-left ${
                    selected ? "border-olive-700 bg-olive-50" : "border-black/10 bg-white"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`grid size-5 place-items-center rounded border ${selected ? "border-olive-700 bg-olive-700 text-white" : "border-black/20"}`}>
                      {selected && <Check size={13} />}
                    </span>
                    <span className="text-sm font-bold">{accessory.name}</span>
                  </span>
                  <span className="text-sm font-black">+ {formatPrice(accessory.price)}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-3 rounded-2xl border border-dashed border-black/15 bg-white/50 px-4 py-4 text-sm text-ink/40">
            加購配件尚未開放，後續可由後台新增品項與價格。
          </div>
        )}
      </div>
      <div className="mt-6">
        <p className="text-xs font-black tracking-[0.16em] text-ink/45">數量</p>
        <div className="mt-3 inline-flex items-center rounded-full border border-black/15 bg-white p-1">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            className="grid size-9 place-items-center rounded-full hover:bg-sand"
            aria-label="減少數量"
          >
            <Minus size={15} />
          </button>
          <span className="w-10 text-center text-sm font-black">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((value) => value + 1)}
            className="grid size-9 place-items-center rounded-full hover:bg-sand"
            aria-label="增加數量"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>
      <div className="mt-6 flex items-end justify-between border-y border-black/10 py-5">
        <span className="text-sm font-bold text-ink/50">目前選配金額</span>
        <span className="text-2xl font-black">{formatPrice(configurationTotal)}</span>
      </div>
      <button
        type="button"
        onClick={handleAdd}
        disabled={disabled || !variantId}
        className="mt-7 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-black text-white transition hover:bg-olive-700 disabled:cursor-not-allowed disabled:bg-ink/30"
      >
        {added ? <Check size={19} /> : <ShoppingBag size={19} />}
        {disabled ? "尚未開放加入" : added ? "已加入購物車" : "加入購物車"}
      </button>
      <Link
        href={`/contact?product=${product.slug}`}
        className="mt-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-full border border-olive-700 px-6 text-sm font-black text-olive-700 transition hover:bg-olive-50"
      >
        <MessageCircle size={19} />
        LINE 諮詢這台車
      </Link>
      <p className="mt-3 text-center text-xs leading-5 text-ink/40">
        商品價格可由後台資料調整；正式付款前仍會再次確認訂單內容。
      </p>
    </div>
  );
}
