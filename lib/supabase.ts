const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

type SupabaseRequestOptions = {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  prefer?: string;
  accessToken?: string;
};

async function request<T>(path: string, options: SupabaseRequestOptions = {}) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    method: options.method ?? "GET",
    headers: {
      apikey: supabaseAnonKey,
      ...(options.accessToken
        ? { Authorization: `Bearer ${options.accessToken}` }
        : supabaseAnonKey.startsWith("eyJ")
          ? { Authorization: `Bearer ${supabaseAnonKey}` }
          : {}),
      "Content-Type": "application/json",
      ...(options.prefer ? { Prefer: options.prefer } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${detail}`);
  }

  if (response.status === 204) return null as T;
  return (await response.json()) as T;
}

export const supabase = {
  select<T>(table: string, query: string, accessToken?: string) {
    return request<T>(`${table}?${query}`, { accessToken });
  },
  insert<T>(table: string, value: unknown) {
    return request<T>(table, {
      method: "POST",
      body: value,
      prefer: "return=representation",
    });
  },
  update<T>(table: string, query: string, value: unknown) {
    return request<T>(`${table}?${query}`, {
      method: "PATCH",
      body: value,
      prefer: "return=representation",
    });
  },
  rpc<T>(
    functionName: string,
    value: unknown,
    accessToken?: string,
  ) {
    return request<T>(`rpc/${functionName}`, {
      method: "POST",
      body: value,
      accessToken,
    });
  },
};
