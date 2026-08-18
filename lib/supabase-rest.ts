const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type RestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  prefer?: string;
  headers?: Record<string, string>;
};

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && serviceKey);
}

export async function serviceRest<T>(path: string, options: RestOptions = {}) {
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Supabase 尚未設定，請先設定環境變數。");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    method: options.method ?? "GET",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      ...(options.prefer ? { Prefer: options.prefer } : {}),
      ...(options.headers ?? {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
  if (response.status === 204) return null as T;
  return response.json() as Promise<T>;
}

export async function uploadLogisticsFile(key: string, file: File) {
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Supabase Storage 尚未設定。");
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/slowbike-logistics/${encodeURIComponent(key)}`,
    {
      method: "PUT",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "true",
      },
      body: bytes,
    },
  );
  if (!response.ok) throw new Error(await response.text());
  return `${supabaseUrl}/storage/v1/object/public/slowbike-logistics/${encodeURIComponent(key)}`;
}

export function publicSupabaseReady() {
  return Boolean(supabaseUrl && anonKey);
}
