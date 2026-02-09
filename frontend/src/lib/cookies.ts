/**
 * Cookie utilities for session persistence across page refreshes.
 */
import Cookies from "js-cookie";

const COOKIE_KEY = "nawgati_session";
const COOKIE_EXPIRY = 1; // 1 day

export interface SessionCookie {
  sessionId: string;
  query: string;
  status: string;
  startedAt: string;
  provider: string;
}

export function saveSessionCookie(data: SessionCookie) {
  Cookies.set(COOKIE_KEY, JSON.stringify(data), { expires: COOKIE_EXPIRY, sameSite: "lax" });
}

export function getSessionCookie(): SessionCookie | null {
  const raw = Cookies.get(COOKIE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function updateSessionCookieStatus(status: string) {
  const existing = getSessionCookie();
  if (existing) {
    saveSessionCookie({ ...existing, status });
  }
}

export function clearSessionCookie() {
  Cookies.remove(COOKIE_KEY);
}
