"use client";

import { useState } from "react";
import { identity, navigation } from "@/content/portfolio";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header" onKeyDown={(e) => e.key === "Escape" && setOpen(false)}>
      <a className="name-mark" href="#top">{identity.name}</a>
      <nav className="site-navigation" aria-label="Main">
        <button type="button" className="pill menu-toggle" aria-expanded={open} aria-controls="main-menu" onClick={() => setOpen((o) => !o)}>Menu</button>
        <ul id="main-menu" className={open ? "open" : undefined} onClick={(e) => (e.target as Element).closest("a") && setOpen(false)}>
          {navigation.map((l) => <li key={l.href}><a href={l.href.slice(1)} data-nav={l.href.slice(2)}>{l.label}</a></li>)}
          <li><a className="pill" href="#contact-form" data-nav="contact">Let&apos;s talk ↗</a></li>
        </ul>
      </nav>
    </header>
  );
}
