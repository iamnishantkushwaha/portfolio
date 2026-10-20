# Search and AI discovery

The canonical website is https://nishantkushwaha.dev/. The page includes server-rendered content, canonical metadata, Open Graph and Twitter previews, and JSON-LD describing the person, profile, services, projects and visible FAQ. Project anchors link directly to the relevant work.

## Production setup

1. Configure `SITE_ENV=production` in the production hosting environment and deploy at the canonical domain. Restart or redeploy after changing environment settings. Preview environments must keep `SITE_ENV=preview`.
2. Check that the public homepage has `index, follow` metadata and no `X-Robots-Tag: noindex` response header. Localhost and preview domains intentionally remain blocked.
3. Check `/robots.txt` allows crawling and references `/sitemap.xml`. The production sitemap contains the canonical homepage; section fragments are not separate pages.
4. Verify domain ownership in Google Search Console and Bing Webmaster Tools, then submit `https://nishantkushwaha.dev/sitemap.xml`. Use their URL inspection tools after deployment.
5. Validate the public URL using Google's Rich Results Test and Schema.org Validator, and check the social preview image. Schema does not guarantee enhanced results.

## AI-readable content

`/llms.txt` provides a concise public summary and `/llms-full.txt` includes project, recruiter and timeline details. Both derive their facts from the same content used by the page. Keep `src/content/portfolio.ts` current, especially availability, employment and project statuses.

Production robots rules allow search and AI crawlers. Allowing crawlers does not guarantee indexing, citations or model recommendations. The text summaries are optional conveniences for compatible tools; Google does not require special AI files for AI search visibility. Crawlable, accurate page content remains the foundation.

References:
- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.google.com/search/docs/appearance/structured-data/profile-page

## Local verification

Run `npm run lint`, `npm run typecheck`, `npm run build`, then `npm run test:foundation`. The foundation check starts its own local servers and verifies production, preview and preview-veto indexing behavior. Generated route and browser evidence stays under the ignored `docs/evidence/` directory.
