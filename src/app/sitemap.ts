import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { canIndexHost, canonicalUrl } from "@/lib/site-policy";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!canIndexHost((await headers()).get("host"))) return [];
  // Last-modified is intentionally omitted until the approved content release.
  return [{ url: canonicalUrl, changeFrequency: "monthly", priority: 1 }];
}
