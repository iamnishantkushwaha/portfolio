import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Inter_Tight, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { MotionProvider, MotionToggle } from "@/components/motion/motion-provider";
import { PageMotion } from "@/components/motion/page-motion";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Spine } from "@/components/layout/spine";
import { siteMetadata } from "@/lib/seo";
import { canIndexHost } from "@/lib/site-policy";
import "./globals.css";

const interTight = Inter_Tight({ subsets: ["latin"], weight: ["400", "600", "800"], variable: "--font-inter-tight", display: "swap" });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument-serif", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains-mono", display: "swap" });

export const viewport: Viewport = { themeColor: "#030303", colorScheme: "dark", width: "device-width", initialScale: 1 };

export async function generateMetadata(): Promise<Metadata> {
  return siteMetadata(canIndexHost((await headers()).get("host")));
}

// Every load, refresh and back/forward restore starts at the top (and drops any #hash), like the first visit.
// Inline so the loader counts and lifts without waiting for hydration, like the mockup; reduced-motion is honoured at once.
const bootScript = `(function(){if("scrollRestoration"in history)history.scrollRestoration="manual";if(location.hash)history.replaceState(null,"",location.pathname+location.search);scrollTo(0,0);addEventListener("pageshow",function(e){if(e.persisted)scrollTo(0,0)});var r=document.documentElement,rm=matchMedia("(prefers-reduced-motion: reduce)").matches;r.classList.add("js");if(rm)r.classList.add("nm");function go(){scrollTo(0,0);var ld=document.getElementById("ld");if(!ld)return;if(rm){ld.style.display="none";r.classList.add("ready");return}var lc=document.getElementById("lc"),bar=ld.querySelector("i"),s=performance.now();(function f(n){var p=Math.min((n-s)/1100,1),e=1-Math.pow(1-p,3);bar.style.transform="scaleX("+e+")";lc.textContent=Math.round(e*100);if(p<1)requestAnimationFrame(f);else{ld.style.transition="transform .9s cubic-bezier(.7,0,.2,1)";ld.style.transform="translateY(-100%)";setTimeout(function(){r.classList.add("ready")},250);setTimeout(function(){ld.style.display="none"},1000)}})(s)}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",go);else go();setTimeout(function(){r.classList.add("ready")},3000)})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${interTight.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: bootScript }} /></head>
      <body suppressHydrationWarning>
        <MotionProvider>
          <div id="ld" aria-hidden="true" suppressHydrationWarning><span>NK</span><b id="lc" suppressHydrationWarning>0</b><i suppressHydrationWarning /></div>
          <div id="bar" aria-hidden="true" />
          <a className="skip-link" href="#main-content">Skip to content</a>
          <SiteHeader />
          {children}
          <Spine />
          <SiteFooter />
          <MotionToggle />
          <PageMotion />
        </MotionProvider>
      </body>
    </html>
  );
}
