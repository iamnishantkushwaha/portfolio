import type { CSSProperties } from "react";
import { projects } from "@/content/portfolio";
import { SplitHeading } from "@/components/ui/split-words";
import { visuals } from "./project-visuals";

export function Projects() {
  return (
    <section id="work" aria-labelledby="work-heading">
      <div className="sec">
        <SplitHeading id="work-heading" parts={["Projects that", { em: "show the work." }]} />
        <div>
          {projects.map((p, i) => {
            const Visual = visuals[p.id];
            return (
              <article id={p.id} className="pj" style={{ ["--i" as string]: i, scrollMarginTop: "110px" } as CSSProperties} key={p.id}>
                <div className="pi">
                  <small>{p.status}</small>
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  <ul className="tg" aria-label={`${p.name} technologies`}>{p.technologies.map((t) => <li key={t}>{t}</li>)}</ul>
                  {p.link && <a className={`btn ${"secondary" in p.link && p.link.secondary ? "b2" : "b1"}`} href={p.link.href}>{p.link.label}</a>}
                </div>
                <div className="pv"><Visual /><span className="note">Illustrative visual, not a screenshot</span></div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
