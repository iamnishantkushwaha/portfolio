type Fetch = typeof fetch;

export const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Verifies a Turnstile token server-side. Any failure, timeout or malformed answer counts as not verified. */
export async function verifyTurnstile(
  token: string,
  secret: string,
  remoteIp: string | null,
  options: { fetchImpl?: Fetch; timeoutMs?: number } = {},
): Promise<{ success: boolean; reason?: "rejected" | "unreachable" }> {
  const { fetchImpl = fetch, timeoutMs = 8_000 } = options;
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(TURNSTILE_VERIFY_URL, { method: "POST", body, signal: controller.signal, cache: "no-store" });
    if (!res.ok) return { success: false, reason: "unreachable" };
    const data: unknown = await res.json();
    const ok = typeof data === "object" && data !== null && (data as { success?: unknown }).success === true;
    return ok ? { success: true } : { success: false, reason: "rejected" };
  } catch {
    return { success: false, reason: "unreachable" };
  } finally {
    clearTimeout(timer);
  }
}
