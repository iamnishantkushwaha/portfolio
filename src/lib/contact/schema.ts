import { z } from "zod";

export const INQUIRY_TYPES = ["Job Opportunity", "Freelance Project", "Collaboration", "General Inquiry"] as const;

export const LIMITS = {
  name: { min: 2, max: 80 },
  email: { max: 254 },
  subject: { min: 3, max: 120 },
  message: { min: 10, max: 2000 },
  token: { max: 2048 },
  /** Hard cap on the raw request body, in bytes. Fields at maximum length stay well under this. */
  bodyBytes: 8 * 1024,
} as const;

// Names and subjects are single-line: no control characters, so nothing can break headers or layout.
const singleLine = (label: string) => z.string().regex(/^[^\u0000-\u001f\u007f]*$/, `${label} contains invalid characters.`);

export const contactSchema = z.object({
  name: singleLine("Name").trim().min(LIMITS.name.min, "Please enter your full name.").max(LIMITS.name.max, `Name must be ${LIMITS.name.max} characters or fewer.`),
  email: z.string().trim().max(LIMITS.email.max, "Email address is too long.").pipe(z.email("Please enter a valid email address.")),
  inquiryType: z.enum(INQUIRY_TYPES, { error: "Please choose an inquiry type." }),
  subject: singleLine("Subject").trim().min(LIMITS.subject.min, "Please add a short subject.").max(LIMITS.subject.max, `Subject must be ${LIMITS.subject.max} characters or fewer.`),
  message: z
    .string()
    // Normalise line endings; keep tabs/newlines but drop other control characters.
    .transform((v) => v.replace(/\r\n?/g, "\n"))
    .pipe(z.string().regex(/^[^\u0000-\u0008\u000b-\u001f\u007f]*$/, "Message contains invalid characters.").trim().min(LIMITS.message.min, "Please write at least a few words.").max(LIMITS.message.max, `Message must be ${LIMITS.message.max} characters or fewer.`)),
});

export type ContactInput = z.infer<typeof contactSchema>;
/** Shape the form edits: the same fields before parsing, plus the honeypot. */
export type ContactFormValues = { name: string; email: string; inquiryType: ContactInput["inquiryType"] | ""; subject: string; message: string; website: string };

/** Server request: validated fields plus anti-abuse fields that never reach the email. */
export const contactRequestSchema = contactSchema.extend({
  turnstileToken: z.string().min(1, "Please complete the verification.").max(LIMITS.token.max),
});
export type ContactRequest = z.infer<typeof contactRequestSchema>;

export type ContactResponse =
  | { ok: true }
  | { ok: false; code: "validation" | "captcha" | "rate_limited" | "duplicate" | "too_large" | "bad_request" | "forbidden" | "server"; message: string; fieldErrors?: Partial<Record<keyof ContactInput | "turnstileToken", string>> };
