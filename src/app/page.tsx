import { ContactSection } from "@/components/sections/contact-section";
import { Fit } from "@/components/sections/fit";
import { Hero } from "@/components/sections/hero";
import { Journey } from "@/components/sections/journey";
import { Projects } from "@/components/sections/projects";
import { Faq, Services } from "@/components/sections/services-faq";
import { Story } from "@/components/sections/story";
import { serializeJsonLd, structuredData } from "@/lib/seo";

export default function HomePage() {
  return (
    <main id="top">
      <span id="main-content" tabIndex={-1} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} />
      <Hero />
      <Story />
      <Projects />
      <Fit />
      <Journey />
      <ContactSection />
      <Services />
      <Faq />
    </main>
  );
}
