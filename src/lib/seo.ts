import type { Metadata } from "next";
import { faqs, identity, projects, recruiterRows, sections, services } from "../content/portfolio.ts";
import { canonicalUrl } from "./site-policy.ts";

const personId = `${canonicalUrl}#person`;
const siteId = `${canonicalUrl}#website`;
const pageId = `${canonicalUrl}#webpage`;
const serviceId = `${canonicalUrl}#service`;
const ogImage = `${canonicalUrl}og-image.png`;

export function siteMetadata(indexable: boolean): Metadata {
  return {
    // Fully absolute metadata preserves the existing trailing slash. Next's
    // metadataBase resolver otherwise normalizes the homepage to its origin.
    metadataBase: null,
    title: identity.title,
    description: identity.description,
    applicationName: "Nishant Kushwaha Portfolio",
    authors: [{ name: identity.name, url: canonicalUrl }],
    creator: identity.name,
    category: "technology",
    keywords: [
      "Nishant Kushwaha", "full stack developer for hire", "MERN stack developer", "React.js developer", "Node.js developer",
      "freelance web developer India", "web developer Jabalpur", "website developer", "web app developer", "REST API developer",
      "Shopify developer", "IoT developer", "ESP32-CAM", "AI integration developer", "WhatsApp API integration", "APIFlowy",
    ],
    alternates: { canonical: canonicalUrl, types: { "text/plain": [
      { url: `${canonicalUrl}llms.txt`, title: "Portfolio summary" },
      { url: `${canonicalUrl}llms-full.txt`, title: "Portfolio details" },
    ] } },
    robots: indexable
      ? { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } }
      : { index: false, follow: false, noarchive: true, googleBot: { index: false, follow: false } },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title: identity.socialTitle,
      description: identity.socialDescription,
      siteName: "Nishant Kushwaha Portfolio",
      locale: "en_IN",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "Nishant Kushwaha, Full Stack Developer" }],
    },
    twitter: {
      card: "summary_large_image",
      title: identity.socialTitle,
      description: identity.socialDescription,
      images: [{ url: ogImage, alt: "Nishant Kushwaha, Full Stack Developer" }],
    },
    other: { title: identity.title, "twitter:url": canonicalUrl },
  };
}

const skills = ["React.js", "JavaScript", "Node.js", "Express.js", "MongoDB", "PostgreSQL", "REST APIs", "Shopify", "Tailwind CSS", "ESP32-CAM", "IoT"];

// Every claim below is also visible on the page; no ratings, reviews, prices or unverified credentials.
export const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": personId,
      name: identity.name,
      url: canonicalUrl,
      image: `${canonicalUrl}images/portrait.webp`,
      email: `mailto:${identity.email}`,
      jobTitle: identity.role,
      description: identity.description,
      address: { "@type": "PostalAddress", addressLocality: "Jabalpur", addressRegion: "Madhya Pradesh", addressCountry: "IN" },
      affiliation: { "@type": "CollegeOrUniversity", name: "Shri Ram Institute of Science & Technology" },
      hasOccupation: { "@type": "Occupation", name: "Full Stack Developer", skills: skills.join(", ") },
      knowsAbout: skills,
      sameAs: [identity.github, identity.linkedin],
      mainEntityOfPage: { "@id": pageId },
    },
    {
      "@type": "WebSite",
      "@id": siteId,
      name: "Nishant Kushwaha Portfolio",
      url: canonicalUrl,
      inLanguage: "en",
      description: identity.description,
      publisher: { "@id": personId },
    },
    {
      "@type": "ProfilePage",
      "@id": pageId,
      url: canonicalUrl,
      name: identity.title,
      isPartOf: { "@id": siteId },
      about: { "@id": personId },
      mainEntity: { "@id": personId },
      inLanguage: "en",
      description: identity.description,
      primaryImageOfPage: { "@id": `${canonicalUrl}#portrait` },
      hasPart: sections.filter((s) => s.id !== "top").map((s) => ({
        "@type": "WebPageElement",
        "@id": `${canonicalUrl}#${s.id}`,
        name: s.label,
        url: `${canonicalUrl}#${s.id}`,
      })),
    },
    {
      "@type": "ImageObject",
      "@id": `${canonicalUrl}#portrait`,
      contentUrl: `${canonicalUrl}images/portrait.webp`,
      caption: `Portrait of ${identity.name}`,
      about: { "@id": personId },
    },
    {
      "@type": "ProfessionalService",
      "@id": serviceId,
      name: "Nishant Kushwaha, full stack development",
      url: canonicalUrl,
      provider: { "@id": personId },
      areaServed: [{ "@type": "Country", name: "India" }, { "@type": "Place", name: "Remote, worldwide" }],
      address: { "@type": "PostalAddress", addressLocality: "Jabalpur", addressRegion: "Madhya Pradesh", addressCountry: "IN" },
      email: identity.email,
      knowsAbout: skills,
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Development services",
        itemListElement: services.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.name, description: s.detail, provider: { "@id": personId } } })),
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "APIFlowy",
      url: "https://apiflowy.onrender.com/",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      description: "AI-powered backend automation platform for API generation, testing, analytics and documentation.",
      author: { "@id": personId },
    },
    {
      "@type": "SoftwareSourceCode",
      name: "ESP32-CAM Attendance (prototype)",
      codeRepository: "https://github.com/iamnishantkushwaha/attendencesystem",
      description: "IoT attendance prototype built around an ESP32-CAM.",
      author: { "@id": personId },
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ],
};

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

/** Plain-text summary for LLMs and answer engines, served at /llms.txt (llmstxt.org format). */
export function llmsText(): string {
  return `# ${identity.name}

> Full stack (MERN) developer in Jabalpur, India, open to full-time roles and client projects. Builds websites, web apps, REST APIs, Shopify stores, AI and WhatsApp integrations, and IoT prototypes. Works remotely.

This summary describes the public portfolio at ${canonicalUrl}. Project statuses and professional details match the website. Contact: ${identity.email}

## Services
${services.map((s) => `- ${s.name}: ${s.detail}`).join("\n")}

## Key facts
- Location: ${identity.location} (remote friendly)
${recruiterRows.map((r) => `- ${r.label}: ${r.value}`).join("\n")}
- Stack: ${skills.join(", ")}
- AI services (Gemini, Groq, OpenAI, WhatsApp) are integrations inside products, not a core specialty

## Work
${projects.map((p) => `- [${p.name}](${canonicalUrl}#${p.id}): ${p.description} Status: ${p.status}.${p.link ? ` [${p.link.label}](${p.link.href}).` : ""}`).join("\n")}

## Portfolio sections
${sections.map((s) => `- [${s.label}](${canonicalUrl}#${s.id})`).join("\n")}

## Links
- [Portfolio](${canonicalUrl})
- [GitHub](${identity.github})
- [LinkedIn](${identity.linkedin})
- [Full details for LLMs](${canonicalUrl}llms-full.txt)

## FAQ
${faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n")}
`;
}
