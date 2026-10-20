import { createHash } from "node:crypto";
import { readConfig } from "./config.ts";
import { sendWithBrevo } from "./email.ts";
import { consume, getStore, type LimitStore } from "./rate-limit.ts";
import { contactRequestSchema, LIMITS, type ContactResponse } from "./schema.ts";
import { verifyTurnstile } from "./turnstile.ts";

type Env = Readonly<Record<string, string | undefined>>;
type Fetch = typeof fetch;

export type HandlerDeps = {
  env: Env;
  fetchImpl?: Fetch;
  store?: LimitStore;
  now?: () => Date;
  /** Receives event names and non-sensitive metadata only. */
  log?: (event: string, meta?: Record<string, unknown>) => void;
};

export const RATE = {
  perIp: { limit: 5, windowSec: 60 * 60 },
  perEmail: { limit: 3, windowSec: 60 * 60 },
  perDay: { limit: 100, windowSec: 24 * 60 * 60 },
  duplicateTtlSec: 10 * 60,
} as const;

const MESSAGES = {
  validation: "Please check the highlighted fields and try again.",
  captcha: "We couldn't verify you're human. Please try again.",
  rate_limited: "Too many messages. Please try again later.",
  duplicate: "This message was already received. Thank you.",
  too_large: "Your message is too large.",
  bad_request: "That request couldn't be processed.",
  forbidden: "That request isn't allowed.",
  server: "Something went wrong on our side. Please try again later, or email me directly.",
} as const;

const STATUS = { validation: 422, captcha: 400, rate_limited: 429, duplicate: 409, too_large: 413, bad_request: 400, forbidden: 403, server: 502 } as const;

function respond(body: ContactResponse, init: { status?: number; headers?: Record<string, string> } = {}) {
  const status = init.status ?? (body.ok ? 200 : STATUS[body.code]);
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...init.headers } });
}
const fail = (code: Exclude<ContactResponse, { ok: true }>["code"], extra: { fieldErrors?: Record<string, string>; status?: number; headers?: Record<string, string> } = {}) =>
  respond({ ok: false, code, message: MESSAGES[code], ...(extra.fieldErrors ? { fieldErrors: extra.fieldErrors } : {}) }, { status: extra.status, headers: extra.headers });

const sha = (value: string) => createHash("sha256").update(value).digest("hex");

function clientIp(req: Request): string {
  const h = req.headers;
  const raw = h.get("x-vercel-forwarded-for") ?? h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0] ?? "";
  const ip = raw.trim();
  return ip && ip.length <= 64 ? ip : "unknown";
}

/** Reads the body up to a byte cap, regardless of what Content-Length claims. */
async function readCapped(req: Request, max: number): Promise<string | null> {
  const declared = Number(req.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > max) return null;
  if (!req.body) return "";
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) { await reader.cancel().catch(() => {}); return null; }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

export async function handleContact(req: Request, deps: HandlerDeps): Promise<Response> {
  const { env, fetchImpl, now = () => new Date(), log = () => {} } = deps;

  // Same-origin only: a browser form on another site cannot post here.
  const origin = req.headers.get("origin");
  if (origin) {
    let host: string | null = null;
    try { host = new URL(origin).host; } catch { /* malformed origin */ }
    if (!host || host !== req.headers.get("host")) { log("contact_forbidden_origin"); return fail("forbidden"); }
  }

  if (!(req.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) return fail("bad_request", { status: 415 });

  const raw = await readCapped(req, LIMITS.bodyBytes);
  if (raw === null) { log("contact_too_large"); return fail("too_large"); }

  let json: unknown;
  try { json = JSON.parse(raw); } catch { return fail("bad_request"); }
  if (typeof json !== "object" || json === null || Array.isArray(json)) return fail("bad_request");
  const body = json as Record<string, unknown>;

  // Honeypot: real visitors never see this field. Bots get a normal-looking success and nothing is sent.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    log("contact_honeypot");
    return respond({ ok: true });
  }

  const parsed = contactRequestSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return fail("validation", { fieldErrors });
  }
  const { turnstileToken, ...input } = parsed.data;

  const cfg = readConfig(env);
  if (!cfg.ok) { log("contact_misconfigured", { problems: cfg.problems }); return fail("server", { status: 503 }); }

  const store = deps.store ?? getStore(env, (error) => log("contact_store_error", { error: String(error).slice(0, 120) }));
  const ip = clientIp(req);
  const ipId = sha(ip).slice(0, 16);
  const emailId = sha(input.email.toLowerCase()).slice(0, 16);
  const day = Math.floor(now().getTime() / 86_400_000);

  const checks = [
    await consume(store, `contact:ip:${ipId}`, RATE.perIp.limit, RATE.perIp.windowSec),
    await consume(store, `contact:email:${emailId}`, RATE.perEmail.limit, RATE.perEmail.windowSec),
    await consume(store, `contact:day:${day}`, RATE.perDay.limit, RATE.perDay.windowSec),
  ];
  const blocked = checks.find((c) => !c.allowed);
  if (blocked) {
    log("contact_rate_limited", { ip: ipId });
    return fail("rate_limited", { headers: { "Retry-After": String(blocked.retryAfterSec) } });
  }

  const human = await verifyTurnstile(turnstileToken, cfg.config.turnstileSecret, ip === "unknown" ? null : ip, { fetchImpl });
  if (!human.success) { log("contact_turnstile_failed", { reason: human.reason }); return fail("captcha"); }

  // The same message resubmitted within minutes (double click, retry, replay) is accepted once.
  const dupKey = `contact:dup:${sha(`${input.email.toLowerCase()}\n${input.subject}\n${input.message}`).slice(0, 32)}`;
  if (!(await store.setOnce(dupKey, RATE.duplicateTtlSec))) { log("contact_duplicate", { ip: ipId }); return fail("duplicate"); }

  const sent = await sendWithBrevo(input, cfg.config.brevo, { fetchImpl, now: now() });
  if (!sent.ok) {
    await store.del(dupKey).catch(() => {});
    log("contact_send_failed", { status: sent.status });
    return fail("server");
  }

  log("contact_sent", { ip: ipId, type: input.inquiryType });
  return respond({ ok: true });
}
