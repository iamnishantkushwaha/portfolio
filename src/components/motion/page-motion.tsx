"use client";

import { useEffect, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useMotion } from "./motion-provider";
import { Cursor } from "./cursor";
import { sections } from "@/content/portfolio";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const $ = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string) => [...document.querySelectorAll<T>(s)];
const cl = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const subscribeNoop = () => () => {};
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const rnd = () => UPPER[Math.floor(Math.random() * UPPER.length)];

type ScrambleEl = HTMLElement & { _raf?: number };
type ScrambleOpts = { duration?: number; speed?: number; revealDelay?: number };

// Text nodes (a button label next to an icon) cannot carry data attributes, so their originals live here.
const textState = new WeakMap<Text, { t: string; raf: number }>();

/** Random characters refresh every (0.05 / speed) s while the real text reveals left to right on an eased progress. */
function scramble(target: ScrambleEl | Text | null, o: ScrambleOpts = {}) {
  if (!target) return;
  const { duration = 1.4, speed = 0.6, revealDelay = 0.25 } = o;
  const isText = target instanceof Text;
  if (isText && !textState.has(target)) textState.set(target, { t: target.textContent ?? "", raf: 0 });
  const st = isText ? textState.get(target)! : null;
  const text = isText ? st!.t : (target.dataset.t ??= target.textContent ?? "");
  const n = text.length;
  const step = (0.05 / speed) * 1000;
  cancelAnimationFrame((isText ? st!.raf : target._raf) ?? 0);
  let t0: number | null = null;
  let last = -1e9;
  let cur = text;
  const ease = (x: number) => 1 - (1 - x) * (1 - x);
  const f = (now: number) => {
    t0 = t0 ?? now;
    const t = (now - t0) / 1000;
    const x = t < revealDelay ? 0 : Math.min(1, (t - revealDelay) / (duration - revealDelay));
    const k = Math.floor(ease(x) * n);
    if (now - last > step || x >= 1) {
      last = now;
      cur = [...text].map((c, i) => (i < k || !/[A-Za-z0-9]/.test(c) ? c : rnd())).join("");
    }
    target.textContent = x >= 1 ? text : cur;
    if (x < 1) {
      const id = requestAnimationFrame(f);
      if (isText) st!.raf = id; else target._raf = id;
    }
  };
  f(performance.now());
}

/** The text a button or link shows: its own text node, or a plain label span beside an icon. */
function labelOf(el: HTMLElement): ScrambleEl | Text | null {
  const span = [...el.children].find((c): c is ScrambleEl => c instanceof HTMLElement && c.tagName === "SPAN" && c.children.length === 0 && !!c.textContent?.trim() && c.getAttribute("aria-hidden") !== "true");
  if (span) return span;
  return ([...el.childNodes].find((n): n is Text => n instanceof Text && !!n.textContent?.trim())) ?? null;
}
/** Reveals, scroll choreography, scramble text and pointer effects. Base HTML stays visible without it. */
export function PageMotion() {
  const { off } = useMotion();
  const pointerFine = useSyncExternalStore(subscribeNoop, () => matchMedia("(hover:hover)").matches, () => false);

  // Reveal-on-scroll for any `.r` element (CSS handles the visuals).
  useEffect(() => {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    $$(".r:not(.in)").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Progress bar, spine, current section: informational, so kept even with motion off.
  useGSAP(() => {
    const bar = $("#bar");
    const spine = $("#spine");
    const dots = $$<HTMLAnchorElement>("#spine a");
    const navLinks = $$<HTMLAnchorElement>(".site-navigation a[data-nav]");
    const els = sections.map((s) => document.getElementById(s.id));
    const sync = (self: ScrollTrigger) => {
        if (bar) bar.style.transform = `scaleX(${self.progress})`;
        // Use the same scroll stops for both the current dot and the line fill.
        // Clamp stops so short sections near the footer can still be reached.
        const maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
        const stops = els.map((el, i) => i === 0 ? 0 : cl(
          (el?.getBoundingClientRect().top ?? 0) + scrollY - innerHeight * 0.5,
          0,
          maxScroll,
        ));
        let cur = 0;
        stops.forEach((stop, i) => { if (scrollY >= stop) cur = i; });
        spine?.style.setProperty("--spine-progress", String(sections.length > 1 ? cur / (sections.length - 1) : 0));
        // Spine dots are in section order; header links are a different list, matched by section id.
        dots.forEach((d, i) => {
          if (i === cur) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current");
          d.toggleAttribute("data-passed", i < cur);
        });
        navLinks.forEach((l) => {
          if (l.dataset.nav === sections[cur]?.id) l.setAttribute("aria-current", "true"); else l.removeAttribute("aria-current");
        });
    };
    const progress = ScrollTrigger.create({ start: 0, end: "max", onUpdate: sync, onRefresh: sync });
    sync(progress);
  }, []);

  // Timeline line draw.
  useGSAP(() => {
    const tl = $("#tl");
    if (!tl) return;
    if (off) { tl.style.setProperty("--p", "1"); return; }
    ScrollTrigger.create({ trigger: tl, start: "top 70%", end: "bottom 70%", onUpdate: (s) => tl.style.setProperty("--p", String(s.progress)) });
  }, { dependencies: [off], revertOnUpdate: true });

  // Skills story: scroll progress drives chapter, path and traveller.
  useGSAP(() => {
    const story = $("#story");
    const pf = $<SVGPathElement>("#pf");
    const pk = $("#pk");
    if (off || !story || !pf || !pk) return;
    const chs = $$(".ch");
    const nds = $$("#pn circle");
    const lbs = $$("#pn text");
    const len = pf.getTotalLength();
    pf.style.strokeDasharray = String(len);
    pf.style.strokeDashoffset = String(len);
    let last = -1;
    ScrollTrigger.create({
      trigger: story, start: "top top", end: "bottom bottom",
      onUpdate: ({ progress: s }) => {
        pf.style.strokeDashoffset = String(len * (1 - s));
        const pt = pf.getPointAtLength(len * s);
        pk.setAttribute("cx", String(pt.x)); pk.setAttribute("cy", String(pt.y));
        const ix = Math.round(s * 4);
        if (ix !== last) {
          last = ix;
          chs.forEach((c, i) => { c.classList.toggle("on", i === ix); c.classList.toggle("past", i < ix); });
        }
        nds.forEach((n, i) => n.classList.toggle("a", s >= i / 4 - 0.02));
        lbs.forEach((t, i) => t.classList.toggle("a", s >= i / 4 - 0.02));
      },
    });
  }, { dependencies: [off], revertOnUpdate: true });

  // Everything below mirrors the approved mockup's timings frame for frame.
  useEffect(() => {
    if (off) return;
    const root = document.documentElement;
    const cleanups: Array<() => void> = [];
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => { timers.push(window.setTimeout(fn, ms)); };

    // Scroll-driven: hero parallax, stacked cards recede, marquee skew.
    const cards = $$(".pj");
    const h1 = $(".hero2 h1");
    const mq = $(".mq");
    let ly = scrollY;
    let mt = 0;
    const v = () => {
      const sm = innerWidth <= 860;
      const hs = cl(scrollY / innerHeight, 0, 1);
      if (h1) h1.style.transform = `translateY(${hs * 70}px)`;
      cards.forEach((c, i) => {
        const next = cards[i + 1];
        if (sm || !next) { c.style.transform = ""; c.style.filter = ""; return; }
        const k = cl(1 - (next.getBoundingClientRect().top - (80 + (i + 1) * 18)) / (innerHeight * 0.55), 0, 1);
        c.style.transform = `scale(${1 - 0.045 * k})`;
        c.style.filter = `brightness(${1 - 0.5 * k})`;
      });
      if (mq) {
        const d = scrollY - ly;
        ly = scrollY;
        mq.style.transform = `skewX(${cl(-d * 0.12, -9, 9)}deg)`;
        clearTimeout(mt);
        mt = window.setTimeout(() => { mq.style.transform = "skewX(0deg)"; }, 140);
      }
    };
    const onScroll = () => requestAnimationFrame(v);
    addEventListener("scroll", onScroll, { passive: true });
    v();
    cleanups.push(() => {
      removeEventListener("scroll", onScroll);
      clearTimeout(mt);
      if (h1) h1.style.transform = "";
      if (mq) mq.style.transform = "";
      cards.forEach((c) => { c.style.transform = ""; c.style.filter = ""; });
    });

    // Scramble text: hero words and meta lines, header links.
    const heroEls = $$<ScrambleEl>(".hero2 h1 .w>span").map((s) => s.querySelector<ScrambleEl>("em") ?? s);
    const meta = $$(".hero2 .tl1, .hero2 .tr1").map((e) => {
      const n = [...e.childNodes].find((c) => c.nodeType === 3 && c.textContent?.trim());
      if (!n) return null;
      const p = e as HTMLElement;
      p.dataset.t0 ??= n.textContent ?? "";
      return { n, t: p.dataset.t0 };
    }).filter((x): x is { n: ChildNode; t: string } => !!x);
    const navEls = $$<ScrambleEl>("header>a, .site-navigation ul a, .menu-toggle");
    heroEls.forEach((e) => { e.dataset.t ??= e.textContent ?? ""; e.textContent = [...e.dataset.t].map(rnd).join(""); });

    const intro = () => {
      heroEls.forEach((e, i) => later(() => scramble(e, { duration: 1.5 + i * 0.2, revealDelay: 0.2 }), i * 180));
      meta.forEach((l) => {
        const t0 = performance.now();
        const f = (now: number) => {
          const x = Math.min(1, (now - t0 - 500) / 900);
          l.n.textContent = x <= 0 ? l.t : [...l.t].map((c, i) => (i < x * l.t.length || c === " " || c === "·" ? c : rnd())).join("");
          if (x < 1) requestAnimationFrame(f); else l.n.textContent = l.t;
        };
        f(t0);
      });
      navEls.forEach((e, i) => later(() => scramble(e, { duration: 1, revealDelay: 0.1, speed: 0.7 }), 500 + i * 90));
    };
    if (root.classList.contains("ready")) intro();
    else {
      const w = window.setInterval(() => { if (root.classList.contains("ready")) { clearInterval(w); intro(); } }, 50);
      cleanups.push(() => clearInterval(w));
    }
    heroEls.forEach((e) => {
      const p = e.parentElement;
      const go = () => scramble(e, { duration: 0.9, revealDelay: 0, speed: 0.8 });
      p?.addEventListener("pointerenter", go);
      cleanups.push(() => p?.removeEventListener("pointerenter", go));
    });
    navEls.forEach((e) => {
      const go = () => scramble(e, { duration: 0.6, revealDelay: 0, speed: 0.8 });
      e.addEventListener("pointerenter", go);
      e.addEventListener("focus", go);
      cleanups.push(() => { e.removeEventListener("pointerenter", go); e.removeEventListener("focus", go); });
    });
    const toggle = $(".menu-toggle");
    const openMenu = () => $$<ScrambleEl>("#main-menu a").forEach((e, i) => later(() => scramble(e, { duration: 0.7, revealDelay: 0, speed: 0.8 }), i * 70));
    toggle?.addEventListener("click", openMenu);
    cleanups.push(() => toggle?.removeEventListener("click", openMenu));

    // Text effect on more places: hover on buttons/links and project cards, and once as titles scroll into view.
    const HOVER = ".pill2, .lk, .btn:not(.cf-submit), .pj";
    const over = (e: PointerEvent) => {
      const hit = (e.target as Element).closest<HTMLElement>(HOVER);
      if (!hit || (e.relatedTarget instanceof Node && hit.contains(e.relatedTarget))) return;
      if (hit.classList.contains("pj")) scramble(hit.querySelector<ScrambleEl>("h3"), { duration: 0.9, revealDelay: 0, speed: 0.8 });
      else scramble(labelOf(hit), { duration: 0.6, revealDelay: 0, speed: 0.8 });
    };
    document.addEventListener("pointerover", over);
    cleanups.push(() => document.removeEventListener("pointerover", over));
    const seen = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      seen.unobserve(en.target);
      scramble(en.target as ScrambleEl, { duration: en.target.tagName === "H3" ? 1 : 0.7, revealDelay: 0.05, speed: 0.8 });
    }), { threshold: 0.6 });
    $$(".pj h3, .pj small, .tl h3, .tl small, .skk").forEach((el) => seen.observe(el));
    cleanups.push(() => seen.disconnect());
    // Magnetic primary buttons and portrait tilt.
    if (matchMedia("(hover:hover)").matches) {
      $$(".b1").forEach((b) => {
        const mv = (e: PointerEvent) => {
          const r = b.getBoundingClientRect();
          b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px,${(e.clientY - r.top - r.height / 2) * 0.25}px)`;
        };
        const lv = () => { b.style.transform = ""; };
        b.addEventListener("pointermove", mv); b.addEventListener("pointerleave", lv);
        cleanups.push(() => { b.removeEventListener("pointermove", mv); b.removeEventListener("pointerleave", lv); b.style.transform = ""; });
      });
      const fig = $(".fig .tilt");
      const tm = (e: PointerEvent) => {
        const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
        fig?.style.setProperty("--tf", `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 4}deg)`);
      };
      addEventListener("pointermove", tm);
      cleanups.push(() => removeEventListener("pointermove", tm));
    }

    return () => { cleanups.forEach((c) => c()); timers.forEach(clearTimeout); };
  }, [off]);

  return pointerFine && !off ? <Cursor /> : null;
}
