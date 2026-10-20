# Nishant Kushwaha — migration foundation

Search and AI discovery setup: see [docs/seo.md](docs/seo.md) for production indexing, sitemap submission, structured data and AI-readable summaries. Copy `.env.example` to `.env.local` for local configuration; real secrets and generated test evidence are ignored by Git.

Local-only Next.js App Router foundation for the approved Direction A design. The original `../portfolio` checkout is untouched. Full visual sections and GSAP are deferred to Phases 4–5.

Use Node 24 and npm. On Windows use `npm.cmd` when PowerShell execution policy prevents `npm.ps1`.

```text
npm ci
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm start
npm run test:routes
npm run test:foundation
```

Default indexing is **blocked**. The optional `.env.example` documents the preview default; no environment file is needed to stay safe. Only `SITE_ENV=production` AND the exact canonical host can allow indexing. `VERCEL_ENV=preview` or `development` overrides that opt-in; `VERCEL=1` with missing environment also blocks it. Request-aware metadata, robots, sitemap and response headers enforce the same policy. Unknown/localhost/preview hosts remain blocked even for a reused production artifact. Forwarded host headers cannot change the canonical URL.

Route tests use a running production server at `http://127.0.0.1:3000`; set `TEST_BASE_URL` for a different port. `EXPECT_INDEXING=production` tests the allowed branch only against a server explicitly started with `SITE_ENV=production`; requests still go to loopback with a canonical Host header. This does not deploy or contact production. Repeat with `VERCEL_ENV=preview` to verify the veto. Rebuild when dependencies, source or build-time configuration change.

`npm run test:foundation` instead starts and stops its own three isolated servers on loopback ports 3100–3102. Run it after a successful build. Add `-- --browser` to include optional browser QA, which requires an existing Python Playwright/Chromium installation; no browser dependency is installed by the project. Do not have other applications using those ports during the check.

Metadata is request-aware to keep a build safe on preview hosts, so the homepage and metadata routes are server-rendered per request. Revisit caching only with the host/indexing safeguards preserved. Existing public profile names are retained; unverified role dates/current employment, numerical claims and certifications are omitted. Project evidence notes are internal data, not rendered content.

The old social image remains available at `/og-image.png` with identical bytes. `/index.html` permanently redirects to `/` (308). Unknown URLs remain real 404s. The current CSP retains inline script/style allowance required by this server-rendered Next foundation; font origins are reduced to self. A nonce/hash policy can be evaluated during Phase 6. No third-party runtime scripts, contact backend, GSAP, secrets, repository linkage or hosting integration are configured.

See `../docs/phase-3-checkpoint.md` for validation and remaining approval gates. Do not commit, push or deploy without the user's separate authorization.

## Contact form and resume

`POST /api/contact` (Node runtime) validates with Zod, rejects oversized or cross-origin requests, checks a honeypot, rate-limits (per IP, per sender address, and a daily cap), verifies Cloudflare Turnstile on the server, blocks identical resubmissions for 10 minutes, then sends one email through Brevo to `CONTACT_RECIPIENT_EMAIL`. The sender is always `BREVO_SENDER_EMAIL`; the visitor's address is only the Reply-To. Logs hold event names and hashed IDs only.

Setup (details in `.env.example`; copy it to `.env.local`, never commit real keys):

1. **Brevo**: create an API key; verify the sender address or domain (Senders, Domains & Dedicated IPs). Authenticate the domain (SPF, DKIM, DMARC) for best inbox placement.
2. **Turnstile**: create a widget for `nishantkushwaha.dev` (and `localhost` for development). Put the site key in `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and the secret in `TURNSTILE_SECRET_KEY`. Rebuild after changing the site key, because it is inlined at build time.
3. **Rate limiting**: create a free Upstash Redis database and set `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`. Without them the limits are per server instance only, which is weak on serverless hosts.
4. **Gmail**: create a label `Portfolio Inquiries` and a filter for `Subject: [Portfolio Inquiry]` to apply it. Reply straight from Gmail; Reply-To goes to the visitor.

Resume: put the PDF at `public/resume/Nishant_Kushwaha_Resume.pdf`. The Download Resume buttons appear only when `next.config.ts` finds a real PDF there at build/start (restart `npm run dev` after adding it); replacing the file later needs no code change. Until then the contact section shows a "ask me for it" note instead of a link.

Tests: `npm test` covers validation, escaping, Brevo payload, Turnstile, rate limits and the full handler with mocked network.
