import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found | Nishant Kushwaha",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main id="main-content" tabIndex={-1} style={{ minHeight: "100svh", display: "grid", alignContent: "center", padding: "0 var(--px)" }}>
      <p className="mono">404 / Page not found</p>
      <h1 style={{ font: "400 clamp(3rem, 9vw, 8rem)/0.95 var(--ser)", margin: "16px 0 20px" }}>This page isn&apos;t <em>here.</em></h1>
      <p className="lead">You can explore my work from the homepage.</p>
      <p style={{ marginTop: 24 }}><Link className="btn b1" href="/">Go to homepage</Link></p>
    </main>
  );
}
