import { redirect } from "next/navigation";
import { AdminHeader, AdminNav } from "@/app/admin/admin-nav";
import { isAdminSignedIn } from "@/lib/admin-auth";
import { getLogisticsFiles, getLogisticsOrders, getMembers } from "@/lib/repositories";
import { logisticsStatuses } from "@/lib/site-data";
import type { LogisticsOrder, Member } from "@/lib/types";

export default async function AdminLogisticsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  if (!(await isAdminSignedIn())) redirect("/admin");
  const { q = "" } = await searchParams;
  const [orders, members] = await Promise.all([getLogisticsOrders(q), getMembers()]);

  return (
    <main className="admin-shell">
      <AdminHeader
        title="物流管理"
        description="管理大陸單號、打包照片、台灣單號與物流進度。"
      />
      <AdminNav />
      <section className="admin-grid">
        <LogisticsForm members={members} />
        <section className="admin-card">
          <p className="eyebrow">Search</p>
          <h2>搜尋物流訂單</h2>
          <form className="search-form" action="/admin/logistics">
            <input name="q" defaultValue={q} placeholder="搜尋會員、單號、商品、狀態" />
            <button className="admin-primary" type="submit">搜尋</button>
            <a className="admin-link-button" href="/admin/logistics">清除</a>
          </form>
        </section>
      </section>

      <section className="admin-card section">
        <p className="eyebrow">Orders</p>
        <h2>物流訂單</h2>
        <div className="admin-list">
          {orders.map((order) => (
            <LogisticsItem order={order} members={members} key={order.id ?? order.batchNo} />
          ))}
        </div>
      </section>
    </main>
  );
}

async function LogisticsItem({ order, members }: { order: LogisticsOrder; members: Member[] }) {
  const files = order.id ? await getLogisticsFiles(order.id) : [];
  return (
    <article className="admin-list-item">
      <strong>{order.batchNo}</strong>
      <span>{order.customerName || order.memberPhone || "未指定會員"}｜{order.itemName}</span>
      <span>大陸單號：{order.chinaTrackingNos || "未填"}</span>
      <span>台灣單號：{order.taiwanTrackingNos || "未填"}</span>
      <span>狀態：{order.status}</span>
      {files.length ? (
        <div className="photo-grid">
          {files.map((file) => (
            <a href={file.publicUrl} target="_blank" rel="noreferrer" key={file.id ?? file.fileKey}>
              <img src={file.publicUrl} alt={file.fileName} />
            </a>
          ))}
        </div>
      ) : null}
      <details>
        <summary>更新物流進度</summary>
        <LogisticsForm members={members} order={order} compact />
      </details>
    </article>
  );
}

function LogisticsForm({
  members,
  order,
  compact = false,
}: {
  members: Member[];
  order?: LogisticsOrder;
  compact?: boolean;
}) {
  return (
    <form
      className={`admin-card admin-form ${compact ? "nested-admin-form" : ""}`}
      action="/api/admin/logistics"
      method="post"
      encType="multipart/form-data"
    >
      <p className="eyebrow">{order ? "Update Logistics" : "Create Logistics"}</p>
      <h2>{order ? "更新物流訂單" : "新增物流訂單"}</h2>
      {order?.id ? <input type="hidden" name="id" value={order.id} /> : null}
      <div className="form-row">
        <label>
          批次/物流編號
          <input name="batchNo" defaultValue={order?.batchNo ?? `SB-LG-${Date.now()}`} required />
        </label>
        <label>
          狀態
          <select name="status" defaultValue={order?.status ?? "待入庫"}>
            {logisticsStatuses.map((status) => (
              <option value={status} key={status}>{status}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        選擇會員（可不選）
        <select name="memberPhone" defaultValue={order?.memberPhone ?? ""}>
          <option value="">一般商品 / 未指定會員</option>
          {members.map((member) => (
            <option value={member.phone} key={member.phone}>
              {member.name}｜{member.phone}
            </option>
          ))}
        </select>
      </label>
      <div className="form-row">
        <label>
          客戶名稱
          <input name="customerName" defaultValue={order?.customerName ?? ""} />
        </label>
        <label>
          商品名稱
          <input name="itemName" defaultValue={order?.itemName ?? ""} required />
        </label>
      </div>
      <label>
        大陸物流單號
        <textarea name="chinaTrackingNos" rows={3} defaultValue={order?.chinaTrackingNos ?? ""} />
      </label>
      <label>
        打包照片上傳
        <input name="packagePhotos" type="file" accept="image/*" multiple />
      </label>
      <label>
        台灣物流單號
        <textarea name="taiwanTrackingNos" rows={3} defaultValue={order?.taiwanTrackingNos ?? ""} />
      </label>
      <div className="form-row">
        <label>
          包裹數
          <input name="packageCount" inputMode="numeric" defaultValue={order?.packageCount ?? 1} />
        </label>
        <label>
          重量
          <input name="weightKg" defaultValue={order?.weightKg ?? ""} />
        </label>
        <label>
          材積
          <input name="volume" defaultValue={order?.volume ?? ""} />
        </label>
      </div>
      <div className="form-row">
        <label>
          人民幣費用
          <input name="rmbCost" inputMode="numeric" defaultValue={order?.rmbCost ?? ""} />
        </label>
        <label>
          台幣費用
          <input name="twdCost" inputMode="numeric" defaultValue={order?.twdCost ?? ""} />
        </label>
        <label>
          匯率
          <input name="exchangeRate" defaultValue={order?.exchangeRate ?? ""} />
        </label>
      </div>
      <label>
        合併/拆分備註
        <textarea name="mergeSplitNote" rows={3} defaultValue={order?.mergeSplitNote ?? ""} />
      </label>
      <label>
        備註
        <textarea name="note" rows={3} defaultValue={order?.note ?? ""} />
      </label>
      <div className="hero-actions">
        <button className="admin-primary" type="submit">
          {order ? "儲存更新" : "新增物流訂單"}
        </button>
        {order ? <a className="admin-link-button" href="/admin/logistics">取消</a> : null}
      </div>
    </form>
  );
}
