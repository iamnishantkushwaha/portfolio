import { Mail } from "lucide-react";
import { identity } from "@/content/portfolio";
import { SplitHeading } from "@/components/ui/split-words";
import { ResumeButton, resumeAvailable } from "@/components/ui/resume-button";
import { ContactForm } from "./contact-form";

export function ContactSection() {
  return (
    <section id="contact-form" aria-labelledby="contact-form-heading">
      <div className="sec cf">
        <div className="cf-intro">
          <SplitHeading id="contact-form-heading" parts={["Let's Work", { em: "Together" }]} />
          <p className="lead r">Have an opportunity, project, or idea in mind? I&apos;d love to hear from you.</p>
          <ul className="cf-links r">
            <li><a className="lk" href={`mailto:${identity.email}`}><Mail size={16} aria-hidden="true" /> {identity.email}</a></li>
          </ul>
          <div className="cf-resume r">
            <a className="pill2 ghost" href={identity.linkedin} target="_blank" rel="noopener noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" /></svg>
              <span>Connect on LinkedIn</span>
            </a>
            <ResumeButton />
            {!resumeAvailable && <p className="hint">Need my resume? Mention it in your message and I&apos;ll send it over.</p>}
          </div>
        </div>
        <div className="cf-form r"><ContactForm /></div>
      </div>
    </section>
  );
}
