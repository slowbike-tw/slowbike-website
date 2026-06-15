const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const AUTH_STORAGE_KEY = "slowbike-member-session-v1";

export type AuthUser = {
  id: string;
  email?: string;
  phone?: string;
  user_metadata?: {
    display_name?: string;
    phone?: string;
  };
  created_at?: string;
};

export type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: AuthUser;
};

type AuthError = {
  msg?: string;
  message?: string;
  error_description?: string;
};

function authHeaders(accessToken?: string) {
  if (!supabaseAnonKey) throw new Error("Supabase 尚未完成設定。");

  return {
    apikey: supabaseAnonKey,
    ...(accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : supabaseAnonKey.startsWith("eyJ")
        ? { Authorization: `Bearer ${supabaseAnonKey}` }
        : {}),
    "Content-Type": "application/json",
  };
}

async function authRequest<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT";
    body?: unknown;
    accessToken?: string;
  } = {},
) {
  if (!supabaseUrl) throw new Error("Supabase 尚未完成設定。");

  const response = await fetch(`${supabaseUrl}/auth/v1/${path}`, {
    method: options.method ?? "POST",
    headers: authHeaders(options.accessToken),
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    const detail = (await response.json().catch(() => ({}))) as AuthError;
    throw new Error(
      detail.msg ??
        detail.message ??
        detail.error_description ??
        "登入服務暫時無法使用，請稍後再試。",
    );
  }

  if (response.status === 204) return null as T;
  return (await response.json()) as T;
}

export async function requestEmailOtp(
  email: string,
  profile: { displayName: string; phone: string },
) {
  const redirectTo =
    typeof window === "undefined"
      ? ""
      : `?redirect_to=${encodeURIComponent(
          `${window.location.origin}${window.location.pathname}${window.location.search}`,
        )}`;

  return authRequest<Record<string, never>>(`otp${redirectTo}`, {
    body: {
      email,
      create_user: true,
      data: {
        display_name: profile.displayName,
        phone: profile.phone,
      },
    },
  });
}

export async function verifyEmailOtp(email: string, token: string) {
  return authRequest<AuthSession>("verify", {
    body: { email, token, type: "email" },
  });
}

export async function getAuthUser(accessToken: string) {
  return authRequest<AuthUser>("user", {
    method: "GET",
    accessToken,
  });
}

export async function updateAuthUser(
  accessToken: string,
  data: { display_name?: string; phone?: string },
) {
  return authRequest<AuthUser>("user", {
    method: "PUT",
    accessToken,
    body: { data },
  });
}

export async function refreshAuthSession(refreshToken: string) {
  return authRequest<AuthSession>("token?grant_type=refresh_token", {
    body: { refresh_token: refreshToken },
  });
}

export async function signOutAuth(accessToken: string) {
  return authRequest<null>("logout", { accessToken });
}

export function sessionFromUrlHash(hash: string) {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const expiresIn = Number(params.get("expires_in") ?? 3600);

  if (!accessToken || !refreshToken) return null;

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: expiresIn,
    expires_at: Math.floor(Date.now() / 1000) + expiresIn,
    token_type: params.get("token_type") ?? "bearer",
  };
}

export function sessionFromUrlParams(search: string) {
  return sessionFromUrlHash(search.replace(/^\?/, "#"));
}

export type PhoneOtpReservation = {
  channel: "sms";
  phone: string;
  enabled: false;
};

export const phoneOtpReservation: PhoneOtpReservation = {
  channel: "sms",
  phone: "",
  enabled: false,
};
