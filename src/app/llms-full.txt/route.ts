import { llmsText } from "@/lib/seo";
import { canonicalUrl } from "@/lib/site-policy";
import { projects, recruiterRows, needs, timeline } from "@/content/portfolio";

export const dynamic = "force-static";

export function GET() {
  const body = `${llmsText()}
## Recruiter summary
${recruiterRows.map((r) => `- ${r.label}: ${r.value}`).join("\n")}

## Projects in detail
${projects.map((p) => `### ${p.name} (${p.status})\n${p.description}\nTechnologies: ${p.technologies.join(", ")}\nPortfolio: ${canonicalUrl}#${p.id}${p.link ? `\n${p.link.label}: ${p.link.href}` : ""}`).join("\n\n")}

## What a client can ask for
${needs.map((n) => `- ${n.title}: ${n.body} ${n.related}`).join("\n")}

## Timeline
${timeline.map((t) => `- ${t.when}: ${t.title}${"detail" in t ? `, ${t.detail}` : ""}`).join("\n")}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
