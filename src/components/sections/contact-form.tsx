"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Script from "next/script";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CircleAlert, CircleCheck, LoaderCircle, Send } from "lucide-react";
import { Select } from "@/components/ui/select";
import { contactRequestSchema, INQUIRY_TYPES, LIMITS, type ContactResponse } from "@/lib/contact/schema";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type FormInput = z.input<typeof contactRequestSchema>;
type FormOutput = z.output<typeof contactRequestSchema>;
type Status = "idle" | "submitting" | "success" | "error";

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
};
declare global { interface Window { turnstile?: TurnstileApi } }

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="fld">
      <label htmlFor={id}>{label}<span aria-hidden="true"> *</span></label>
      {children}
      {hint && !error && <p className="hint" id={`${id}-hint`}>{hint}</p>}
      {error && <p className="err" id={`${id}-err`} role="alert"><CircleAlert size={14} aria-hidden="true" />{error}</p>}
    </div>
  );
}

export function ContactForm() {
  const uid = useId();
  const idOf = (n: string) => `${uid}-${n}`;
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState("");
  const [scriptReady, setScriptReady] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const inFlight = useRef(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const honeypot = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, setError, reset, control, formState: { errors } } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(contactRequestSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", subject: "", message: "", turnstileToken: "" },
  });
  const messageLength = (useWatch({ control, name: "message" }) ?? "").length;

  // Render the Turnstile widget once its script is available; tokens are single use, so it is reset after each attempt.
  useEffect(() => {
    if (!SITE_KEY || !scriptReady || !widgetRef.current || !window.turnstile) return;
    widgetId.current = window.turnstile.render(widgetRef.current, {
      sitekey: SITE_KEY,
      theme: "dark",
      // The standard widget is 300px wide; use the compact one where the card is narrower than that.
      size: widgetRef.current.clientWidth < 300 ? "compact" : "normal",
      callback: (token: string) => setValue("turnstileToken", token, { shouldValidate: true }),
      "expired-callback": () => setValue("turnstileToken", "", { shouldValidate: false }),
      "error-callback": () => setValue("turnstileToken", "", { shouldValidate: false }),
    });
    return () => { if (widgetId.current) window.turnstile?.remove(widgetId.current); widgetId.current = undefined; };
  }, [scriptReady, setValue]);

  const resetCaptcha = useCallback(() => {
    setValue("turnstileToken", "");
    if (widgetId.current) window.turnstile?.reset(widgetId.current);
  }, [setValue]);

  const onSubmit = async (values: FormOutput) => {
    if (inFlight.current) return; // blocks double clicks and Enter-key repeats before state updates land
    inFlight.current = true;
    setStatus("submitting");
    setFormError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...values, website: honeypot.current?.value ?? "" }),
        signal: AbortSignal.timeout(20_000),
      });
      const data = (await res.json().catch(() => null)) as ContactResponse | null;
      if (data?.ok) {
        setStatus("success");
        reset();
      } else {
        const message = data && !data.ok ? data.message : "Something went wrong. Please try again, or email me directly.";
        if (data && !data.ok && data.fieldErrors) {
          for (const [field, text] of Object.entries(data.fieldErrors)) setError(field as keyof FormInput, { message: text });
        }
        setFormError(message);
        setStatus("error");
        requestAnimationFrame(() => errorRef.current?.focus());
      }
    } catch {
      setFormError("Couldn't reach the server. Check your connection and try again.");
      setStatus("error");
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      resetCaptcha();
      inFlight.current = false;
    }
  };

  const busy = status === "submitting";
  const describe = (n: string, has: boolean, hint = false) => [has ? `${idOf(n)}-err` : null, hint && !has ? `${idOf(n)}-hint` : null].filter(Boolean).join(" ") || undefined;

  if (status === "success") {
    return (
      <div className="cf-card cf-done" role="status">
        <CircleCheck size={40} aria-hidden="true" />
        <h3>Message sent</h3>
        <p>Thanks for reaching out. I&apos;ll read your message and reply to the email address you provided.</p>
        <button type="button" className="btn b2" onClick={() => setStatus("idle")}>Send another message</button>
      </div>
    );
  }

  return (
    // Refs are read only inside the submit handler, never during render.
    // eslint-disable-next-line react-hooks/refs
    <form className="cf-card" onSubmit={handleSubmit(onSubmit)} noValidate aria-busy={busy}>
      {SITE_KEY && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={() => setScriptReady(true)} />}

      <div className="cf-grid">
        <Field id={idOf("name")} label="Full Name" error={errors.name?.message}>
          <input id={idOf("name")} type="text" autoComplete="name" maxLength={LIMITS.name.max} aria-required="true" aria-invalid={!!errors.name} aria-describedby={describe("name", !!errors.name)} {...register("name")} />
        </Field>
        <Field id={idOf("email")} label="Email Address" error={errors.email?.message}>
          <input id={idOf("email")} type="email" inputMode="email" autoComplete="email" maxLength={LIMITS.email.max} aria-required="true" aria-invalid={!!errors.email} aria-describedby={describe("email", !!errors.email)} {...register("email")} />
        </Field>
      </div>

      <div className="cf-grid">
        <Field id={idOf("type")} label="Inquiry Type" error={errors.inquiryType?.message}>
          <Controller
            name="inquiryType"
            control={control}
            render={({ field }) => (
              <Select id={idOf("type")} value={field.value ?? ""} options={INQUIRY_TYPES} placeholder="Select a type" onChange={field.onChange} onBlur={field.onBlur} buttonRef={field.ref} invalid={!!errors.inquiryType} describedBy={describe("type", !!errors.inquiryType)} />
            )}
          />
        </Field>
        <Field id={idOf("subject")} label="Subject" error={errors.subject?.message}>
          <input id={idOf("subject")} type="text" maxLength={LIMITS.subject.max} aria-required="true" aria-invalid={!!errors.subject} aria-describedby={describe("subject", !!errors.subject)} {...register("subject")} />
        </Field>
      </div>

      <Field id={idOf("message")} label="Message" error={errors.message?.message} hint={`${messageLength}/${LIMITS.message.max}`}>
        <textarea id={idOf("message")} rows={6} maxLength={LIMITS.message.max} aria-required="true" aria-invalid={!!errors.message} aria-describedby={describe("message", !!errors.message, true)} {...register("message")} />
      </Field>

      {/* Honeypot: invisible to people and assistive tech; bots that fill every field reveal themselves. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor={idOf("website")}>Website</label>
        <input id={idOf("website")} ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="fld">
        {SITE_KEY ? (
          <>
            <div ref={widgetRef} className="ts" />
            {errors.turnstileToken && <p className="err" role="alert"><CircleAlert size={14} aria-hidden="true" />{errors.turnstileToken.message}</p>}
          </>
        ) : (
          <p className="err" role="alert"><CircleAlert size={14} aria-hidden="true" />The contact form isn&apos;t available right now. Please email me directly.</p>
        )}
      </div>

      {status === "error" && (
        <div className="cf-banner" role="alert" tabIndex={-1} ref={errorRef}>
          <CircleAlert size={18} aria-hidden="true" /><span>{formError}</span>
        </div>
      )}

      <button className="btn b1 cf-submit" type="submit" disabled={busy || !SITE_KEY}>
        {busy ? <LoaderCircle className="spin" size={18} aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
        <span>{busy ? "Sending…" : "Send Message"}</span>
      </button>
    </form>
  );
}
