import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { canIndexHost, canonicalUrl } from "@/lib/site-policy";

export const dynamic = "force-dynamic";

// Search and AI answer/training crawlers that are explicitly welcome on the production host.
const aiCrawlers = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "Claude-SearchBot", "anthropic-ai",
  "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "CCBot", "Bytespider", "Amazonbot", "cohere-ai", "Meta-ExternalAgent", "DuckAssistBot",
];

export default async function robots(): Promise<MetadataRoute.Robots> {
  if (!canIndexHost((await headers()).get("host"))) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: [{ userAgent: "*", allow: "/" }, { userAgent: aiCrawlers, allow: "/" }],
    sitemap: `${canonicalUrl}sitemap.xml`,
    host: canonicalUrl,
  };
}
