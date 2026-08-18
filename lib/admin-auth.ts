import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "slowbike_admin_session";

export function getAdminSessionSecret() {
  return (
    process.env.SLOWBIKE_ADMIN_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    localDevValue("slowbike-local-session")
  );
}

function getAdminPassword() {
  return (
    process.env.SLOWBIKE_ADMIN_PASSWORD ||
    process.env.ADMIN_PASSWORD ||
    localDevValue("SlowBike@2026!")
  );
}

function localDevValue(value: string) {
  return process.env.NODE_ENV === "production" ? "" : value;
}

export function isAdminPasswordConfigured() {
  return Boolean(getAdminPassword() && getAdminSessionSecret());
}

export function validateAdminPassword(password: string) {
  const adminPassword = getAdminPassword();
  return Boolean(adminPassword && password === adminPassword);
}

export async function isAdminSignedIn() {
  const secret = getAdminSessionSecret();
  if (!secret) return false;
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value === secret;
}
