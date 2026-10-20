import { closeSync, openSync, readSync, statSync } from "node:fs";
import { join } from "node:path";
import type { NextConfig } from "next";

const RESUME_FILE = "Nishant_Kushwaha_Resume.pdf";

/** True only when public/resume holds a real, reasonably sized PDF (checked by its %PDF- header). */
function resumeIsPresent(): boolean {
  try {
    const path = join(process.cwd(), "public", "resume", RESUME_FILE);
    const stat = statSync(path);
    if (!stat.isFile() || stat.size < 1024 || stat.size > 10 * 1024 * 1024) return false;
    const fd = openSync(path, "r");
    try {
      const head = Buffer.alloc(5);
      readSync(fd, head, 0, 5, 0);
      return head.toString("latin1") === "%PDF-";
    } finally {
      closeSync(fd);
    }
  } catch {
    return false;
  }
}

const turnstile = "https://challenges.cloudflare.com";

const config: NextConfig = {
  poweredByHeader: false,
  // Decided at build/start so the Download Resume button never links to a missing file.
  env: { NEXT_PUBLIC_RESUME_AVAILABLE: resumeIsPresent() ? "1" : "0" },
  redirects: async () => [{ source: "/index.html", destination: "/", permanent: true }],
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        {
          key: "Content-Security-Policy",
          // React's dev tooling needs eval; production never gets it. Turnstile needs its script, frame and API origin.
          value: `default-src 'self'; script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} ${turnstile}; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self' ${turnstile}; frame-src ${turnstile}; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`,
        },
      ],
    },
    {
      // Always a download, always revalidated so replacing the PDF takes effect immediately.
      source: "/resume/:file*",
      headers: [
        { key: "Content-Type", value: "application/pdf" },
        { key: "Content-Disposition", value: `attachment; filename="${RESUME_FILE}"` },
        { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
      ],
    },
  ],
};

export default config;
