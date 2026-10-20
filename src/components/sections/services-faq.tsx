import { faqs, services } from "@/content/portfolio";
import { SplitHeading } from "@/components/ui/split-words";

export function Services() {
  return (
    <section id="services" aria-labelledby="services-heading">
      <div className="sec">
        <SplitHeading id="services-heading" parts={["What I can", { em: "build for you." }]} />
        <ul className="svc">
          {services.map((s) => (
            <li className="r" key={s.name}><h3>{s.name}</h3><p>{s.detail}</p></li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-heading">
      <div className="sec">
        <SplitHeading id="faq-heading" parts={["Questions,", { em: "answered." }]} />
        <div className="faq">
          {faqs.map((f) => (
            <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
          ))}
        </div>
      </div>
    </section>
  );
}
