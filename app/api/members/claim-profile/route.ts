import { NextResponse } from "next/server";
import { getServerAuthUser, serviceRest } from "@/lib/supabase-server";
import type { MemberProfile } from "@/types/order-draft";

function bearer(request: Request) {
  return request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
}

async function findProfile(user: Awaited<ReturnType<typeof getServerAuthUser>>) {
  let rows = await serviceRest<MemberProfile[]>(
    `member_profiles?auth_user_id=eq.${user.id}&select=*&limit=1`,
  );
  if (rows[0]) return rows[0];

  if (user.email) {
    rows = await serviceRest<MemberProfile[]>(
      `member_profiles?email=ilike.${encodeURIComponent(user.email)}&select=*&limit=1`,
    );
    if (rows[0]) return rows[0];
  }

  const phone = user.phone || user.user_metadata?.phone || "";
  if (phone) {
    rows = await serviceRest<MemberProfile[]>(
      `member_profiles?phone=eq.${encodeURIComponent(phone)}&select=*&limit=1`,
    );
    if (rows[0]) return rows[0];
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const token = bearer(request);
    if (!token) throw new Error("尚未登入。");
    const user = await getServerAuthUser(token);
    const profile = await findProfile(user);
    if (!profile) return NextResponse.json({ claimed: false });

    const name = user.user_metadata?.display_name || profile.name || "";
    const phone = user.user_metadata?.phone || user.phone || profile.phone || "";
    const email = user.email || profile.email || "";

    await serviceRest(`member_profiles?id=eq.${profile.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        auth_user_id: user.id,
        name,
        phone,
        email,
        updated_at: new Date().toISOString(),
      }),
    });

    const patch = {
      auth_user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    await Promise.all([
      serviceRest(`customer_orders?member_id=eq.${profile.id}&auth_user_id=is.null`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      }),
      serviceRest(
        `customer_orders?member_profile_id=eq.${profile.id}&auth_user_id=is.null`,
        {
          method: "PATCH",
          body: JSON.stringify(patch),
        },
      ),
      serviceRest(`order_drafts?member_profile_id=eq.${profile.id}&auth_user_id=is.null`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      }),
      serviceRest(`logistics_orders?member_id=eq.${profile.id}&auth_user_id=is.null`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      }),
    ]);

    return NextResponse.json({ claimed: true, memberProfileId: profile.id });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "會員資料綁定失敗。",
      },
      { status: 400 },
    );
  }
}
