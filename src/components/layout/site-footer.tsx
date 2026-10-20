import { identity } from "@/content/portfolio";

export function SiteFooter() {
  return (
    <footer>
      <span>© {new Date().getFullYear()} {identity.name}</span>
      <a href="#top">Back to top</a>
      <span>Jabalpur, India</span>
    </footer>
  );
}
