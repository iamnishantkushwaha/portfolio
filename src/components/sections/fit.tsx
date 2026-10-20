"use client";

import { useState, type CSSProperties, type KeyboardEvent } from "react";
import { identity, needs, recruiterRows } from "@/content/portfolio";
import { SplitHeading } from "@/components/ui/split-words";

const TABS = ["I'm recruiting", "I need a project built"] as const;

export function Fit() {
  const [tab, setTab] = useState(0);
  const [need, setNeed] = useState(0);
  const current = needs[need] ?? needs[0];

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      const next = (tab + 1) % TABS.length;
      setTab(next);
      document.getElementById(`fit-tab-${next}`)?.focus();
    }
  };

  return (
    <section id="fit" aria-labelledby="fit-heading">
      <div className="sec">
        <SplitHeading id="fit-heading" parts={["Hiring or building?", { em: "Pick your path." }]} />
        <div className="tabs r" role="tablist" aria-label="Audience" onKeyDown={onKey}>
          {TABS.map((label, i) => (
            <button key={label} id={`fit-tab-${i}`} role="tab" aria-selected={tab === i} aria-controls="fit-panel" tabIndex={tab === i ? 0 : -1} onClick={() => setTab(i)}>{label}</button>
          ))}
        </div>
        <div id="fit-panel" role="tabpanel" aria-labelledby={`fit-tab-${tab}`}>
          {tab === 0 ? (
            <dl>
              {recruiterRows.map((r, i) => (
                <div key={r.label} style={{ display: "contents", ["--n" as string]: i } as CSSProperties}>
                  <dt>{r.label}</dt><dd>{r.value}</dd>
                </div>
              ))}
              <div style={{ display: "contents", ["--n" as string]: recruiterRows.length } as CSSProperties}>
                <dt>Proof</dt>
                <dd><a href="https://apiflowy.onrender.com/">APIFlowy live demo</a> and <a href={identity.github}>GitHub</a></dd>
              </div>
            </dl>
          ) : (
            <>
              <div className="needs">
                {needs.map((n, i) => <button key={n.title} aria-pressed={need === i} onClick={() => setNeed(i)}>{n.title}</button>)}
              </div>
              <div className="np" aria-live="polite" key={need}>
                <h3>{current.title}</h3>
                <p>{current.body}</p>
                <p>{current.related}</p>
                <a className="btn b1" href="#contact">Start the conversation</a>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
