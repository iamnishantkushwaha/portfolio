import { sections } from "@/content/portfolio";

export function Spine() {
  return (
    <aside id="spine" aria-label="Page progress">
      {sections.map((s) => <a key={s.id} href={`#${s.id}`} data-nav={s.id}><span>{s.label}</span></a>)}
    </aside>
  );
}
