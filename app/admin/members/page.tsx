import { redirect } from "next/navigation";
import { AdminHeader, AdminNav } from "@/app/admin/admin-nav";
import { isAdminSignedIn } from "@/lib/admin-auth";
import { getMemberVehicles, getMembers } from "@/lib/repositories";

export default async function AdminMembersPage() {
  if (!(await isAdminSignedIn())) redirect("/admin");
  const [members, vehicles] = await Promise.all([getMembers(), getMemberVehicles()]);

  return (
    <main className="admin-shell">
      <AdminHeader
        title="會員管理"
        description="會員必填姓名與手機號碼；一位會員可以建立多台車輛資料。"
      />
      <AdminNav />

      <section className="admin-grid">
        <form className="admin-card admin-form" action="/api/admin/members" method="post">
          <p className="eyebrow">Create Member</p>
          <h2>新增會員</h2>
          <div className="form-row">
            <label>
              姓名
              <input name="name" required />
            </label>
            <label>
              手機號碼
              <input name="phone" required />
            </label>
          </div>
          <div className="form-row">
            <label>
              身份證字號（選填）
              <input name="idNumber" />
            </label>
            <label>
              LINE 名稱
              <input name="lineName" />
            </label>
          </div>
          <label>
            Email
            <input name="email" type="email" />
          </label>
          <label>
            地址
            <input name="address" />
          </label>
          <label>
            備註
            <textarea name="note" rows={3} />
          </label>
          <button className="admin-primary" type="submit">
            新增會員
          </button>
        </form>

        <form className="admin-card admin-form" action="/api/admin/member-vehicles" method="post">
          <p className="eyebrow">Create Vehicle</p>
          <h2>新增會員車輛</h2>
          <label>
            選擇會員
            <select name="memberPhone" required>
              <option value="">請選擇會員</option>
              {members.map((member) => (
                <option value={member.phone} key={member.phone}>
                  {member.name}｜{member.phone}
                </option>
              ))}
            </select>
          </label>
          <div className="form-row">
            <label>
              車款
              <input name="model" placeholder="FOLD" required />
            </label>
            <label>
              顏色
              <input name="color" placeholder="奶油白" />
            </label>
          </div>
          <div className="form-row">
            <label>
              車架號碼
              <input name="frameNo" />
            </label>
            <label>
              電機號碼
              <input name="motorNo" />
            </label>
          </div>
          <label>
            電池號碼
            <input name="batteryNo" />
          </label>
          <div className="form-row">
            <label>
              購買日期
              <input name="purchaseDate" type="date" />
            </label>
            <label>
              保固開始
              <input name="warrantyStart" type="date" />
            </label>
            <label>
              保固結束
              <input name="warrantyEnd" type="date" />
            </label>
          </div>
          <label>
            備註
            <textarea name="note" rows={3} />
          </label>
          <button className="admin-primary" type="submit">
            新增車輛
          </button>
        </form>
      </section>

      <section className="admin-grid section">
        <div className="admin-card">
          <p className="eyebrow">Members</p>
          <h2>會員列表</h2>
          <div className="admin-list">
            {members.map((member) => (
              <article className="admin-list-item" key={member.phone}>
                <strong>{member.name}</strong>
                <span>{member.phone}</span>
                <span>{member.email || "未填 Email"}</span>
                <span>{member.address}</span>
              </article>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <p className="eyebrow">Vehicles</p>
          <h2>車輛列表</h2>
          <div className="admin-list">
            {vehicles.map((vehicle) => (
              <article className="admin-list-item" key={vehicle.id ?? `${vehicle.memberPhone}-${vehicle.frameNo}`}>
                <strong>
                  {vehicle.model} {vehicle.color}
                </strong>
                <span>會員手機：{vehicle.memberPhone}</span>
                <span>車架：{vehicle.frameNo || "未填"}</span>
                <span>保固：{vehicle.warrantyStart || "未填"} ～ {vehicle.warrantyEnd || "未填"}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
