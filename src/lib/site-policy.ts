export const canonicalUrl = "https://nishantkushwaha.dev/";
export const noIndexHeader = "noindex, nofollow, noarchive";

export function isProductionEnvironment(
  env: Readonly<Record<string, string | undefined>> = process.env,
): boolean {
  return (
    env.SITE_ENV === "production" &&
    (!env.VERCEL_ENV || env.VERCEL_ENV === "production") &&
    (!env.VERCEL || env.VERCEL_ENV === "production")
  );
}

// Never derive canonical metadata from forwarded/request hostnames.
// Even a production build stays noindex when served at a preview hostname.
export function canIndexHost(
  host: string | null,
  env: Readonly<Record<string, string | undefined>> = process.env,
): boolean {
  if (!host || !isProductionEnvironment(env)) return false;
  const canonicalHost = new URL(canonicalUrl).host;
  return [canonicalHost, `${canonicalHost}:443`].includes(host.toLowerCase());
}
