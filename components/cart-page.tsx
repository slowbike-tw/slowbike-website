"use client";

import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { getCartLineKey, useCart } from "@/components/cart-provider";
import { ProductVisual } from "@/components/product-visual";
import {
  formatPrice,
  getAccessoryById,
  getConfigurationPrice,
  getProductById,
  getVariantById,
} from "@/lib/products";

export function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const resolvedItems = items.flatMap((item) => {
    const product = getProductById(item.productId);
    if (!product) return [];
    const variant = getVariantById(product, item.variantId);
    if (!variant) return [];
    const accessories = item.accessoryIds.flatMap((id) => {
      const accessory = getAccessoryById(product, id);
      return accessory ? [accessory] : [];
    });
    const unitPrice = getConfigurationPrice(product, item.variantId, item.accessoryIds);
    if (unitPrice === null) return [];
    return [{
      ...item,
      product,
      variant,
      accessories,
      unitPrice,
      lineKey: getCartLineKey(item),
    }];
  });
  const subtotal = resolvedItems.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  );

  if (resolvedItems.length === 0) {
    return (
      <section className="px-5 py-24 text-center lg:py-32">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-olive-100 text-olive-700">
          <ShoppingBag size={27} />
        </span>
        <h1 className="mt-7 text-4xl font-black tracking-[-0.05em]">購物車目前是空的</h1>
        <p className="mt-4 text-sm text-ink/50">先看看四款 SlowBike 系列，找到適合你的車。</p>
        <Link
          href="/products"
          className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-black text-white"
        >
          瀏覽商品 <ArrowRight size={17} />
        </Link>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black tracking-[0.24em] text-olive-600">YOUR SELECTION</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] sm:text-5xl">購物車</h1>
          </div>
          <button type="button" onClick={clearCart} className="text-xs font-bold text-ink/40 hover:text-ink">
            清空購物車
          </button>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
          <div className="grid gap-4">
            {resolvedItems.map(({ product, variant, accessories, color, quantity, unitPrice, lineKey }) => (
              <article
                key={lineKey}
                className="grid gap-5 rounded-3xl border border-black/10 bg-white p-4 sm:grid-cols-[180px_1fr] sm:p-5"
              >
                <Link href={`/products/${product.slug}`} className="h-44 overflow-hidden rounded-2xl sm:h-full">
                  <ProductVisual
                    name={product.name}
                    series={product.series}
                    image={product.media.mainImage}
                    tone={product.tone}
                    compact
                  />
                </Link>
                <div className="flex min-w-0 flex-col py-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black tracking-[0.2em] text-olive-600">{product.englishSeries}</p>
                      <h2 className="mt-1 text-2xl font-black">{product.name} <span className="text-sm text-ink/40">{product.series}</span></h2>
                      <div className="mt-2 grid gap-1 text-xs text-ink/45">
                        <p>版本：{variant.name}</p>
                        <p>車色：{color}</p>
                        <p>加購配件：{accessories.length > 0 ? accessories.map((item) => item.name).join("、") : "無"}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(lineKey)}
                      className="grid size-9 shrink-0 place-items-center rounded-full text-ink/35 hover:bg-sand hover:text-ink"
                      aria-label={`移除 ${product.name}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                  <div className="mt-auto flex items-end justify-between gap-4 pt-6">
                    <div className="inline-flex items-center rounded-full border border-black/10 p-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(lineKey, Math.max(1, quantity - 1))}
                        className="grid size-8 place-items-center rounded-full hover:bg-sand"
                        aria-label="減少數量"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-9 text-center text-sm font-black">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(lineKey, quantity + 1)}
                        className="grid size-8 place-items-center rounded-full hover:bg-sand"
                        aria-label="增加數量"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-black">{formatPrice(unitPrice * quantity)}</p>
                      {quantity > 1 && <p className="mt-1 text-[10px] text-ink/35">單價 {formatPrice(unitPrice)}</p>}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="rounded-[2rem] bg-ink p-7 text-white lg:sticky lg:top-28">
            <p className="text-xs font-black tracking-[0.22em] text-olive-300">ORDER SUMMARY</p>
            <h2 className="mt-3 text-2xl font-black">訂單摘要</h2>
            <div className="mt-7 grid gap-4 border-y border-white/10 py-6 text-sm">
              <div className="flex justify-between text-white/55">
                <span>商品數量</span>
                <span>{items.reduce((total, item) => total + item.quantity, 0)} 件</span>
              </div>
              <div className="flex justify-between text-white/55">
                <span>配送費用</span>
                <span>確認後計算</span>
              </div>
              <div className="flex items-end justify-between pt-2">
                <span className="font-bold">預估小計</span>
                <span className="text-xl font-black">{formatPrice(subtotal)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="mt-6 flex min-h-14 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-black text-ink hover:bg-sand"
            >
                前往安全結帳 <ArrowRight size={17} />
            </Link>
            <p className="mt-4 text-xs leading-6 text-white/35">
                登入會員後可選擇信用卡一次付清、3／6／12 期零利率或 ATM 轉帳。
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
