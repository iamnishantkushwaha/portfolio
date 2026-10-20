import assert from "node:assert/strict";
import http from "node:http";
import { createHash } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const base = new URL(process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000");
const mode = process.env.EXPECT_INDEXING ?? "preview";
const scenario = process.env.TEST_SCENARIO ?? mode;
assert.match(scenario, /^[a-z-]+$/);
assert.ok(["preview", "production"].includes(mode));
const canonicalHost = "nishantkushwaha.dev";
const report = [];

function request(path, host = canonicalHost) {
  return new Promise((resolve, reject) => {
    const req = http.get({ hostname: base.hostname, port: base.port, path, headers: { Host: host, "User-Agent": "Twitterbot/1.0" } }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
    });
    req.setTimeout(20000, () => req.destroy(new Error("Route check timed out")));
    req.on("error", reject);
  });
}

function record(name) { report.push({ test: name, passed: true }); }
function html(response) { return response.body.toString("utf8"); }

const page = await request("/");
assert.equal(page.status, 200);
assert.match(html(page), /<link[^>]+rel="canonical"[^>]+href="https:\/\/nishantkushwaha.dev\/"/);
assert.match(html(page), /<meta[^>]+property="og:image"[^>]+content="https:\/\/nishantkushwaha.dev\/og-image.png"/);
assert.match(html(page), /<meta[^>]+name="twitter:card"[^>]+content="summary_large_image"/);
assert.equal((html(page).match(/<h1(?:\s|>)/g) ?? []).length, 1);
for (const id of ["top", "story", "work", "services", "fit", "journey", "faq", "contact"]) assert.match(html(page), new RegExp(`id="${id}"`));
for (const project of ["APIFlowy", "ESP32-CAM Attendance", "Invoice App"]) assert.ok(html(page).includes(project));
assert.doesNotMatch(html(page), /ishipgreen|veerox|workassignai/i);
const jsonLd = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html(page));
assert.ok(jsonLd);
const graph = JSON.parse(jsonLd[1])["@graph"];
const types = graph.map((e) => e["@type"]);
for (const t of ["Person", "ProfilePage", "ImageObject", "WebSite", "ProfessionalService", "FAQPage"]) assert.ok(types.includes(t), `missing ${t}`);
assert.equal(graph.find((e) => e["@type"] === "ProfilePage").mainEntity["@id"], graph.find((e) => e["@type"] === "Person")["@id"]);
assert.equal(graph.find((e) => e["@type"] === "Person").image, "https://nishantkushwaha.dev/images/portrait.webp");
const llms = await request("/llms.txt");
assert.equal(llms.status, 200);
assert.match(html(llms), /Full stack \(MERN\) developer/);
const full = await request("/llms-full.txt");
assert.equal(full.status, 200);
for (const summary of [llms, full]) {
  assert.match(summary.headers["content-type"], /text\/plain/);
  for (const id of ["apiflowy", "invoice", "attendance", "vistaar"]) {
    assert.ok(html(summary).includes(`https://nishantkushwaha.dev/#${id}`));
    assert.ok(html(page).includes(`id="${id}"`), `missing project anchor ${id}`);
  }
}
record("homepage: SSR content, canonical, social metadata, anchors, restricted content and JSON-LD");

const indexable = mode === "production";
const robotsMeta = /<meta name="robots" content="([^"]+)"/.exec(html(page));
assert.ok(robotsMeta);
assert.equal(robotsMeta[1].includes("noindex"), !indexable);
assert.equal(Boolean(page.headers["x-robots-tag"]?.includes("noindex")), !indexable);
record(`${mode}: canonical host metadata and X-Robots-Tag`);

for (const host of ["localhost:3000", "portfolio-preview.vercel.app"]) {
  const preview = await request("/", host);
  assert.equal(preview.status, 200);
  assert.match(preview.headers["x-robots-tag"], /noindex/);
  assert.match(html(preview), /name="robots" content="noindex/);
  const previewRobots = await request("/robots.txt", host);
  assert.match(html(previewRobots), /Disallow: \//);
  const previewSitemap = await request("/sitemap.xml", host);
  assert.doesNotMatch(html(previewSitemap), /<loc>/);
}
record("preview hostnames remain noindex even when production mode is enabled");

const robots = await request("/robots.txt");
const sitemap = await request("/sitemap.xml");
assert.equal(robots.status, 200);
assert.equal(sitemap.status, 200);
if (indexable) {
  assert.match(html(robots), /Allow: \//);
  assert.match(html(robots), /Sitemap: https:\/\/nishantkushwaha.dev\/sitemap.xml/);
  assert.equal((html(sitemap).match(/<loc>/g) ?? []).length, 1);
  assert.match(html(sitemap), /<loc>https:\/\/nishantkushwaha.dev\/<\/loc>/);
} else {
  assert.match(html(robots), /Disallow: \//);
  assert.doesNotMatch(html(robots), /Sitemap:/);
  assert.doesNotMatch(html(sitemap), /<loc>/);
}
record(`${mode}: robots and sitemap`);

const legacy = await request("/index.html?ref=legacy");
assert.equal(legacy.status, 308);
assert.equal(legacy.headers.location, "/?ref=legacy");
const missing = await request("/not-a-real-portfolio-page");
assert.equal(missing.status, 404);
assert.match(html(missing), /noindex/);
record("legacy permanent redirect preserves query; missing route returns HTTP 404 and noindex");

const image = await request("/og-image.png");
assert.equal(image.status, 200);
assert.match(image.headers["content-type"], /image\/png/);
// The original checkout may no longer exist beside this app; fall back to the copy served from /public.
const original = await readFile(new URL("../../portfolio/og-image.png", import.meta.url)).catch(() => readFile(new URL("../public/og-image.png", import.meta.url)));
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
assert.equal(digest(image.body), digest(original));
record("social image path and bytes preserved");

assert.equal(page.headers["x-frame-options"], "DENY");
assert.equal(page.headers["x-content-type-options"], "nosniff");
assert.match(page.headers["content-security-policy"], /font-src 'self'/);
assert.doesNotMatch(html(page), /fonts\.googleapis\.com|fonts\.gstatic\.com/);
record("security headers and self-hosted fonts");

const output = new URL("../docs/evidence/phase-3/", import.meta.url);
await mkdir(output, { recursive: true });
await writeFile(new URL(`${scenario}-routes.json`, output), JSON.stringify({ mode, scenario, report }, null, 2));
await writeFile(new URL(`${scenario}-html.html`, output), page.body);
console.log(`PASS ${report.length} ${mode} route/SEO checks. Evidence: ${fileURLToPath(output)}`);
