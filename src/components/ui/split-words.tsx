import type { ElementType } from "react";

type Part = string | { em: string };

/** Renders heading text as masked word spans so CSS can slide each word up. Fully server-rendered. */
export function SplitHeading({ as: Tag = "h2", parts, className, id }: { as?: ElementType; parts: readonly Part[]; className?: string; id?: string }) {
  let k = 0;
  const label = parts.map((p) => (typeof p === "string" ? p : p.em)).join(" ");
  return (
    <Tag id={id} className={`r ${className ?? ""}`.trim()} aria-label={label}>
      {parts.map((part, i) => {
        const text = typeof part === "string" ? part : part.em;
        const words = text.split(/\s+/).filter(Boolean).map((w) => (
          <span className="hw" aria-hidden="true" key={`${i}-${w}-${k}`}>
            <span style={{ ["--k" as string]: k++ }}>{w}</span>
          </span>
        ));
        const joined = words.flatMap((w, j) => (j ? [" ", w] : [w]));
        return typeof part === "string" ? <span key={i}>{i ? " " : ""}{joined}</span> : <span key={i}>{" "}<em>{joined}</em></span>;
      })}
    </Tag>
  );
}
