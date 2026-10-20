import type { ContactInput } from "./schema.ts";

const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "`": "&#96;" };

/** Escapes every user-supplied value before it is placed in HTML. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"'`]/g, (c) => HTML_ESCAPES[c] ?? c);
}

/** Headers and subjects must stay on one line. */
export function singleLine(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s{2,}/g, " ").trim();
}

export function formatTimestamp(date: Date): { iso: string; display: string } {
  const display = new Intl.DateTimeFormat("en-IN", { dateStyle: "full", timeStyle: "long", timeZone: "Asia/Kolkata" }).format(date);
  return { iso: date.toISOString(), display };
}

export type BuiltEmail = { subject: string; html: string; text: string };

export function buildEmail(input: ContactInput, when: Date): BuiltEmail {
  const { name, email, inquiryType, subject, message } = input;
  const ts = formatTimestamp(when);
  const emailSubject = singleLine(`[Portfolio Inquiry] ${inquiryType} — ${subject}`);

  const row = (label: string, value: string) =>
    `<tr><td style="padding:10px 0;width:120px;vertical-align:top;color:#6b7280;font-size:12px;letter-spacing:.08em;text-transform:uppercase">${label}</td><td style="padding:10px 0;color:#111827;font-size:15px">${value}</td></tr>`;

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(emailSubject)}</title></head>
<body style="margin:0;padding:24px;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb">
<tr><td style="background:#030303;padding:22px 28px"><div style="color:#2ee6c8;font-size:12px;letter-spacing:.14em;text-transform:uppercase">Portfolio inquiry</div><div style="color:#f3f0ea;font-size:22px;margin-top:6px">${escapeHtml(inquiryType)}</div></td></tr>
<tr><td style="padding:24px 28px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
${row("Name", escapeHtml(name))}
${row("Email", `<a href="mailto:${escapeHtml(email)}" style="color:#0f766e">${escapeHtml(email)}</a>`)}
${row("Type", escapeHtml(inquiryType))}
${row("Subject", escapeHtml(subject))}
${row("Received", `${escapeHtml(ts.display)}<br><span style="color:#9ca3af;font-size:12px">${escapeHtml(ts.iso)}</span>`)}
</table>
<div style="margin-top:18px;padding-top:18px;border-top:1px solid #e5e7eb">
<div style="color:#6b7280;font-size:12px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px">Message</div>
<div style="color:#111827;font-size:15px;line-height:1.6;white-space:pre-wrap;word-break:break-word">${escapeHtml(message)}</div>
</div>
</td></tr>
<tr><td style="padding:16px 28px;background:#f9fafb;color:#6b7280;font-size:12px">Reply to this email to answer ${escapeHtml(name)} directly. Sent from the contact form on nishantkushwaha.dev.</td></tr>
</table></body></html>`;

  const text = [
    "New portfolio inquiry",
    "",
    `Name: ${singleLine(name)}`,
    `Email: ${singleLine(email)}`,
    `Inquiry type: ${inquiryType}`,
    `Subject: ${singleLine(subject)}`,
    `Received: ${ts.display} (${ts.iso})`,
    "",
    "Message:",
    message,
    "",
    "Reply to this email to answer the sender directly.",
  ].join("\n");

  return { subject: emailSubject, html, text };
}

export type BrevoConfig = { apiKey: string; senderEmail: string; senderName: string; recipientEmail: string };
type Fetch = typeof fetch;

export const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

/**
 * Sends through Brevo's transactional API. The sender and recipient come only from server configuration;
 * the visitor's address is used solely as Reply-To.
 */
export async function sendWithBrevo(
  input: ContactInput,
  config: BrevoConfig,
  options: { fetchImpl?: Fetch; now?: Date; timeoutMs?: number } = {},
): Promise<{ ok: true } | { ok: false; status: number | "network" | "timeout" }> {
  const { fetchImpl = fetch, now = new Date(), timeoutMs = 10_000 } = options;
  const mail = buildEmail(input, now);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(BREVO_ENDPOINT, {
      method: "POST",
      headers: { "api-key": config.apiKey, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: { email: config.senderEmail, name: config.senderName },
        to: [{ email: config.recipientEmail }],
        replyTo: { email: input.email, name: singleLine(input.name) },
        subject: mail.subject,
        htmlContent: mail.html,
        textContent: mail.text,
        tags: ["portfolio-contact"],
      }),
      signal: controller.signal,
      cache: "no-store",
    });
    return res.ok ? { ok: true } : { ok: false, status: res.status };
  } catch (error) {
    return { ok: false, status: error instanceof DOMException && error.name === "AbortError" ? "timeout" : "network" };
  } finally {
    clearTimeout(timer);
  }
}
