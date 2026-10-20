import { timeline } from "@/content/portfolio";
import { SplitHeading } from "@/components/ui/split-words";

export function Journey() {
  return (
    <section id="journey" aria-labelledby="journey-heading">
      <div className="sec two">
        <div>
          <SplitHeading id="journey-heading" parts={["Learning", { em: "by building." }]} />
          <p className="lead r">I&apos;m based in Jabalpur, Madhya Pradesh, and work remotely with teams and clients. AI services are integrations inside the products I build.</p>
        </div>
        <div className="tl" id="tl">
          {timeline.map((t) => (
            <div className="r" key={t.title}>
              <small>{t.when}</small>
              <h3>{t.title}</h3>
              {"detail" in t && <p>{t.detail}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
