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
            <ResumeButton />
            {!resumeAvailable && <p className="hint">Need my resume? Mention it in your message and I&apos;ll send it over.</p>}
          </div>
        </div>
        <div className="cf-form r"><ContactForm /></div>
      </div>
    </section>
  );
}
