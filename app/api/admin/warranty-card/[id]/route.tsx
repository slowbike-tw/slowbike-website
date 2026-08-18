import { ImageResponse } from "next/og";
import { getMemberVehicles, getMembers } from "@/lib/repositories";

export const runtime = "edge";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const [members, vehicles] = await Promise.all([getMembers(), getMemberVehicles()]);
  const vehicle = vehicles.find((item) => item.id === id);
  if (!vehicle) return new Response("Not found", { status: 404 });
  const member = members.find((item) => item.phone === vehicle.memberPhone);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "760px",
          background: "#f4f0e7",
          color: "#111611",
          display: "flex",
          flexDirection: "column",
          padding: "72px",
          fontFamily: "Arial",
        }}
      >
        <div style={{ color: "#006b5d", fontSize: 28, fontWeight: 900, letterSpacing: 5 }}>
          SLOWBIKE WARRANTY CARD
        </div>
        <div style={{ marginTop: 28, fontSize: 74, fontWeight: 900 }}>電子保固卡</div>
        <div style={{ marginTop: 46, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26, fontSize: 32 }}>
          <Field label="姓名" value={member?.name ?? vehicle.ownerName ?? ""} />
          <Field label="手機" value={vehicle.memberPhone} />
          <Field label="車款" value={vehicle.model} />
          <Field label="顏色" value={vehicle.color} />
          <Field label="車架號碼" value={vehicle.frameNo} />
          <Field label="電機號碼" value={vehicle.motorNo} />
          <Field label="電池號碼" value={vehicle.batteryNo} />
          <Field label="購買日期" value={vehicle.purchaseDate} />
          <Field label="保固期間" value={`${vehicle.warrantyStart || "-"} ～ ${vehicle.warrantyEnd || "-"}`} />
        </div>
        <div style={{ marginTop: "auto", color: "#5f645d", fontSize: 24 }}>
          SlowBike 電動腳踏車專賣店｜support@slowbike.com.tw
        </div>
      </div>
    ),
    { width: 1200, height: 760 },
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ borderLeft: "6px solid #c69a4a", paddingLeft: 18 }}>
      <div style={{ color: "#5f645d", fontSize: 20 }}>{label}</div>
      <div style={{ marginTop: 6, fontWeight: 900 }}>{value || "-"}</div>
    </div>
  );
}
