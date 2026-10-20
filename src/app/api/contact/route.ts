import { handleContact } from "@/lib/contact/handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Log only event names and non-sensitive metadata: never message text, email addresses or keys.
const log = (event: string, meta?: Record<string, unknown>) => console.warn(JSON.stringify({ scope: "contact", event, ...meta }));

export function POST(request: Request) {
  return handleContact(request, { env: process.env, log });
}
