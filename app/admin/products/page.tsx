import { redirect } from "next/navigation";
import { AdminHeader, AdminNav } from "@/app/admin/admin-nav";
import { isAdminSignedIn } from "@/lib/admin-auth";
import { getProducts } from "@/lib/repositories";
import { formatPrice } from "@/lib/site-data";
import type { Product } from "@/lib/types";

export default async function AdminProductsPage() {
  if (!(await isAdminSignedIn())) redirect("/admin");
  const products = await getProducts();

  return (
    <main className="admin-shell">
      <AdminHeader
        title="商品管理"
        description="新增、隱藏或編輯商品，前台首頁與商品頁會依商品狀態顯示。"
      />
      <AdminNav />
      <section className="admin-grid">
        <ProductForm />
        <section className="admin-card">
          <p className="eyebrow">Products</p>
          <h2>商品列表</h2>
          <div className="admin-list">
            {products.map((product) => (
              <article className="admin-list-item" key={product.slug}>
                <div>
                  <strong>{product.name}</strong>
                  <span>
                    {product.subtitle}｜{product.price ? formatPrice(product.price) : "請洽 LINE"}｜
                    {product.status === "active" ? "前台顯示" : "已隱藏"}
                  </span>
                  <span>商品頁：/products/{product.slug}</span>
                </div>
                <details>
                  <summary>編輯商品</summary>
                  <ProductForm product={product} compact />
                </details>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function ProductForm({ product, compact = false }: { product?: Product; compact?: boolean }) {
  return (
    <form
      className={`admin-card admin-form ${compact ? "nested-admin-form" : ""}`}
      action="/api/admin/products"
      method="post"
    >
      <div>
        <p className="eyebrow">{product ? "Edit Product" : "Create Product"}</p>
        <h2>{product ? product.name : "新增商品"}</h2>
      </div>
      {product?.id ? <input type="hidden" name="id" value={product.id} /> : null}

      <div className="form-row">
        <label>
          商品名稱
          <input name="name" defaultValue={product?.name ?? ""} required />
        </label>
        <label>
          商品網址代號
          <input name="slug" defaultValue={product?.slug ?? ""} placeholder="fold" required />
        </label>
      </div>

      <label>
        副標
        <input name="subtitle" defaultValue={product?.subtitle ?? ""} placeholder="鋁合金折疊車" />
      </label>

      <div className="form-row">
        <label>
          售價
          <input name="price" inputMode="numeric" defaultValue={product?.price ?? ""} placeholder="36500" />
        </label>
        <label>
          排序
          <input name="sortOrder" inputMode="numeric" defaultValue={product?.sortOrder ?? 1} />
        </label>
      </div>

      <label>
        主圖路徑
        <input name="imagePath" defaultValue={product?.imagePath ?? "/images/products/fold-main.jpg"} />
      </label>

      <label>
        商品摘要
        <textarea name="summary" rows={3} defaultValue={product?.summary ?? ""} />
      </label>

      <label>
        規格，一行一項
        <textarea name="specs" rows={6} defaultValue={product?.specs ?? ""} />
      </label>

      <label>
        特色，一行一項
        <textarea name="highlights" rows={4} defaultValue={product?.highlights ?? ""} />
      </label>

      <label>
        銷售頁文案
        <textarea name="salesCopy" rows={5} defaultValue={product?.salesCopy ?? ""} />
      </label>

      <label>
        狀態
        <select name="status" defaultValue={product?.status ?? "active"}>
          <option value="active">前台顯示</option>
          <option value="hidden">隱藏</option>
        </select>
      </label>

      <button className="admin-primary" type="submit">
        {product ? "儲存商品" : "新增商品"}
      </button>
    </form>
  );
}
