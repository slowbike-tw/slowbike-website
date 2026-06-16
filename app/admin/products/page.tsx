import { ProductAdmin } from "@/components/product-admin";

export default function AdminProductsPage() {
  return (
    <div>
      <p className="text-xs font-black tracking-[0.2em] text-olive-600">
        PRODUCT CMS
      </p>
      <h1 className="mt-3 text-4xl font-black">商品後台管理</h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/50">
        V0 可新增、編輯、下架商品，並管理版本、車色、圖片與加購配件。
      </p>
      <ProductAdmin />
    </div>
  );
}
