import { redirect } from "next/navigation";
import { AdminHeader, AdminNav } from "@/app/admin/admin-nav";
import { isAdminSignedIn } from "@/lib/admin-auth";
import { getMemberVehicles, getMembers } from "@/lib/repositories";

export default async function AdminWarrantyPage() {
  if (!(await isAdminSignedIn())) redirect("/admin");
  const [members, vehicles] = await Promise.all([getMembers(), getMemberVehicles()]);
  const memberMap = new Map(members.map((member) => [member.phone, member]));

  return (
    <main className="admin-shell">
      <AdminHeader
        title="保固卡"
        description="從會員車輛資料匯出 PNG 保固卡，可寄給客戶留存。"
      />
      <AdminNav />
      <section className="admin-card">
        <p className="eyebrow">Warranty Cards</p>
        <h2>保固卡列表</h2>
        <div className="admin-list">
          {vehicles.map((vehicle) => {
            const member = memberMap.get(vehicle.memberPhone);
            return (
              <article className="admin-list-item" key={vehicle.id ?? `${vehicle.memberPhone}-${vehicle.frameNo}`}>
                <strong>{member?.name ?? vehicle.ownerName ?? "未填姓名"}｜{vehicle.model}</strong>
                <span>手機：{vehicle.memberPhone}</span>
                <span>車架：{vehicle.frameNo || "未填"}</span>
                <span>保固：{vehicle.warrantyStart || "未填"} ～ {vehicle.warrantyEnd || "未填"}</span>
                {vehicle.id ? (
                  <a className="admin-link-button" href={`/api/admin/warranty-card/${vehicle.id}`} target="_blank">
                    匯出 PNG
                  </a>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
