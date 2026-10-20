import { ArrowUpRight, Mail } from "lucide-react";
import { identity } from "@/content/portfolio";
import { SplitHeading } from "@/components/ui/split-words";
import { ResumeButton, resumeAvailable } from "@/components/ui/resume-button";
import { ContactForm } from "./contact-form";

const LinkedInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" /></svg>
);
const GitHubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" /></svg>
);

const channels = [
  { label: "Email", value: identity.email, href: `mailto:${identity.email}`, icon: <Mail size={20} aria-hidden="true" />, external: false },
  { label: "LinkedIn", value: "Connect with me", href: identity.linkedin, icon: <LinkedInIcon />, external: true },
  { label: "GitHub", value: "See the code", href: identity.github, icon: <GitHubIcon />, external: true },
] as const;

/** One contact section: headline, direct channels and the form, over a slowly moving glow. */
export function ContactSection() {
  return (
    <section className="ct" id="contact" aria-labelledby="contact-heading">
      <div className="ct-glow" aria-hidden="true"><i /><i /></div>
      <div className="sec cf">
        <div className="cf-intro">
          <p className="ct-status r"><span className="dot" aria-hidden="true" />Open to full-time roles &amp; projects</p>
          <SplitHeading id="contact-heading" parts={["Let's build something", { em: "that ships." }]} />
          <p className="lead r">Recruiters and clients are both welcome. Tell me what you&apos;re working on, or reach out directly.</p>
          <ul className="ct-ch r">
            {channels.map((c, i) => (
              <li key={c.label} style={{ ["--n" as string]: i }}>
                <a href={c.href} {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                  <span className="ct-ic">{c.icon}</span>
                  <span className="ct-tx"><small>{c.label}</small><b>{c.value}</b></span>
                  <ArrowUpRight className="ct-ar" size={20} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <div className="cf-resume r">
            <ResumeButton />
            {!resumeAvailable && <p className="hint">Need my resume? Mention it in your message and I&apos;ll send it over.</p>}
          </div>
        </div>
        <div className="cf-form r" id="contact-form"><div className="ct-card"><ContactForm /></div></div>
      </div>
    </section>
  );
}
