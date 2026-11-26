import crypto from "crypto";
import { cookies } from "next/headers";

const SESSION_SECRET = process.env.SESSION_SECRET || "samora-luxury-secret-key-2026-pk-streetwear";
const COOKIE_NAME = "samora_admin_session";

export interface SessionData {
  adminId: string;
  email: string;
  exp: number;
}

export function createSessionToken(adminId: string, email: string): string {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
  const payload = JSON.stringify({ adminId, email, exp });
  const hmac = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return Buffer.from(payload).toString("base64url") + "." + hmac;
}

export function verifySessionToken(token: string): SessionData | null {
  try {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return null;

    const payload = Buffer.from(payloadB64, "base64url").toString("utf-8");
    const expectedSig = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");

    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      const data: SessionData = JSON.parse(payload);
      if (data.exp && data.exp > Date.now()) {
        return data;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function getAdminSession(): SessionData | null {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function setAdminCookie(token: string) {
  const cookieStore = cookies();
  // Only enforce Secure cookie if explicitly using HTTPS, never break on http://localhost:3000 even in production mode
  const isHttps = process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://") || process.env.VERCEL === "1";
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAdminCookie() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}
