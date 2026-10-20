import { identity } from "@/content/portfolio";
import { SplitHeading } from "@/components/ui/split-words";

export function Contact() {
  return (
    <section className="cta" id="contact" aria-labelledby="contact-heading">
      <SplitHeading id="contact-heading" parts={["Let's build something", { em: "that ships." }]} />
      <p className="lead r">Recruiters and clients are both welcome.</p>
      <a className="btn b1 r" href={identity.github}>Contact me on GitHub</a>
    </section>
  );
}
