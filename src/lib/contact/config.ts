import { z } from "zod";
import type { BrevoConfig } from "./email.ts";

type Env = Readonly<Record<string, string | undefined>>;

const emailSchema = z.email();

export type ContactConfig = { brevo: BrevoConfig; turnstileSecret: string };

/** Reads server-only configuration. Returns the names of anything missing or invalid, never the values. */
export function readConfig(env: Env): { ok: true; config: ContactConfig } | { ok: false; problems: string[] } {
  const problems: string[] = [];
  const need = (name: string) => {
    const v = env[name]?.trim();
    if (!v) problems.push(`${name} is not set`);
    return v ?? "";
  };
  const needEmail = (name: string) => {
    const v = need(name);
    if (v && !emailSchema.safeParse(v).success) problems.push(`${name} is not a valid email address`);
    return v;
  };

  const apiKey = need("BREVO_API_KEY");
  const senderEmail = needEmail("BREVO_SENDER_EMAIL");
  const recipientEmail = needEmail("CONTACT_RECIPIENT_EMAIL");
  const turnstileSecret = need("TURNSTILE_SECRET_KEY");
  const senderName = env.BREVO_SENDER_NAME?.trim() || "Nishant Kushwaha";

  if (problems.length) return { ok: false, problems };
  return { ok: true, config: { brevo: { apiKey, senderEmail, senderName, recipientEmail }, turnstileSecret } };
}
