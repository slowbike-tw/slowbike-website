const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function getServerAuthUser(accessToken: string) {
  if (!url || !anonKey) throw new Error("Supabase 尚未設定");
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("會員登入已失效");
  return response.json() as Promise<{
    id: string;
    email?: string;
    phone?: string;
    user_metadata?: { phone?: string; display_name?: string };
  }>;
}

export async function requireStaffUser(accessToken: string) {
  const user = await getServerAuthUser(accessToken);
  const allowed = (process.env.ADMIN_AUTH_USER_IDS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (!allowed.includes(user.id)) throw new Error("沒有後台付款管理權限");
  return user;
}

export async function serviceRest<T>(
  path: string,
  init: RequestInit = {},
) {
  if (!url || !serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY 尚未設定");
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Supabase server request failed: ${await response.text()}`);
  }
  if (response.status === 204) return null as T;
  return response.json() as Promise<T>;
}
