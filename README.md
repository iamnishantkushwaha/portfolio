# Nishant Kushwaha — Portfolio

Professional, SEO-optimized portfolio website. Single-file, zero dependencies, fast.

## Files

| File | Purpose |
|------|---------|
| `index.html` | The complete portfolio (HTML + CSS + JS, self-contained) |
| `og-image.png` | Social preview image (LinkedIn/WhatsApp link cards) |
| `vercel.json` | Security headers (CSP, clickjacking protection, HSTS) |
| `robots.txt` | Tells Google it can crawl everything |
| `sitemap.xml` | Helps Google discover the page |

## Deploy to Vercel

**Via GitHub (recommended — also gives you an SEO backlink):**
1. Create a repo named `portfolio` on github.com/iamnishantkushwaha and push these files.
2. Go to https://vercel.com/new, sign in with GitHub, import the repo.
   No build settings needed — it deploys as a static site.
3. In Project Settings → General, set the project name to `nishantkushwaha`
   so the URL becomes `https://nishantkushwaha.dev`.

**Via CLI (no GitHub needed):**
```
npm i -g vercel
cd portfolio
vercel --prod
```

## ⚠️ URL note

All SEO files point to `https://nishantkushwaha.dev/`. If your deployed
URL ends up different, find-and-replace it in `index.html`, `robots.txt`, and
`sitemap.xml` — a wrong canonical URL hurts ranking.

## How to actually rank #1 on Google for "Nishant Kushwaha"

The code is already optimized (meta tags, Open Graph, JSON-LD Person schema,
semantic HTML, mobile-friendly, fast, security headers). The rest is off-page:

1. **Google Search Console** (most important):
   - Go to https://search.google.com/search-console
   - Add your site URL and verify ownership (HTML tag method is easiest).
   - Submit `sitemap.xml` under Sitemaps.
   - Use "URL Inspection" → "Request Indexing" on your homepage.
   - Without this Google may take weeks to find you; with it, days.

2. **Backlinks — the biggest ranking factor:**
   - Add the portfolio URL to your **GitHub profile** (bio + pinned repos' READMEs).
   - Add it to your **LinkedIn** (Contact info + Featured section).
   - Add it to your Naukri, Internshala, and LetsUpgrade profiles.
   - Put it in your resume and email signature.

3. **A custom domain helps** (optional but powerful): `nishantkushwaha.dev` or
   `nishantkushwaha.in` (~₹700/yr). An exact-name domain strongly boosts
   name-search ranking. Vercel connects custom domains for free.

4. **Keep it alive**: Google favors sites that update. Add a project every few
   months and bump `lastmod` in `sitemap.xml`.

Since "Nishant Kushwaha" + "iamnishantkushwaha" is a fairly unique name/handle
combo, doing steps 1–2 alone will typically get you on page 1 within a few weeks.
