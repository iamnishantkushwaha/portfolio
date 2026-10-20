"use client";

import { useEffect, useRef } from "react";

const HOVER = "a,button,summary,label,[role=button],[data-nav],[data-cursor]";
const TEXT = "input,textarea,select,[contenteditable]";

type Pt = { x: number; y: number };
const mid = (a: Pt, b: Pt): Pt => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

/** What clicking the element will do: arrow direction and the small label beside the cursor. */
function intent(el: Element): { label: string; rot: number } {
  const custom = el.getAttribute("data-cursor-label");
  const href = el.closest("a")?.getAttribute("href") ?? "";
  let label = "", rot = 0;
  if (href.startsWith("#")) { label = "Jump"; rot = 90; }
  else if (href.startsWith("mailto:")) { label = "Email"; rot = -45; }
  else if (href) { label = "Open"; rot = -45; }
  return { label: custom ?? label, rot };
}

/** Mix-blend dot that grows into a labelled ring over interactive elements, with a comet trail that lengthens with speed. */
export function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const arrow = useRef<SVGSVGElement>(null);
  const label = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = root.current, cv = canvas.current, rg = ring.current, ar = arrow.current, lb = label.current;
    const ctx = cv?.getContext("2d");
    if (!wrap || !cv || !rg || !ar || !lb || !ctx) return;
    document.documentElement.classList.add("cur-on");

    let mx = innerWidth / 2, my = innerHeight / 2, x = mx, y = my, seen = false, raf = 0, len = 4;
    const pts: Pt[] = [];
    let hot = false, hidden = false;

    const size = () => {
      const d = Math.min(devicePixelRatio, 2);
      cv.width = Math.round(innerWidth * d); cv.height = Math.round(innerHeight * d);
      cv.style.width = `${innerWidth}px`; cv.style.height = `${innerHeight}px`;
      ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    size();

    const show = (v: boolean) => { wrap.style.opacity = v ? "1" : "0"; };
    const over = (e: MouseEvent) => {
      const t = e.target as Element | null;
      hidden = !!t?.closest(TEXT);
      const el = hidden ? null : t?.closest(HOVER) ?? null;
      hot = !!el;
      const it = el ? intent(el) : { label: "", rot: 0 };
      rg.classList.toggle("hot", hot);
      ar.style.rotate = `${it.rot}deg`;
      lb.textContent = it.label;
      lb.style.opacity = it.label ? "1" : "0";
      show(seen && !hidden);
    };
    const move = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      if (!seen) { seen = true; x = mx; y = my; }
      show(!hidden);
    };
    const dn = () => rg.classList.add("down");
    const up = () => rg.classList.remove("down");
    const leave = () => show(false);

    const draw = () => {
      const w = innerWidth, h = innerHeight;
      ctx.clearRect(0, 0, w, h);
      const n = pts.length;
      if (n < 3) return;
      const speed = Math.min(Math.hypot(mx - x, my - y) / 140, 1);
      const maxW = 1.6 + 1.4 * speed, maxA = 0.28 + 0.34 * speed;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      for (let i = 1; i < n; i++) {
        const p0 = pts[i - 1], p1 = pts[i], p2 = pts[i + 1];
        if (!p0 || !p1) continue;
        const k = i / (n - 1);
        ctx.lineWidth = 0.25 + maxW * k * k;
        ctx.strokeStyle = `rgba(255,255,255,${maxA * k * k})`;
        ctx.beginPath();
        const a = mid(p0, p1);
        ctx.moveTo(a.x, a.y);
        if (!p2) ctx.lineTo(p1.x, p1.y);
        else { const b = mid(p1, p2); ctx.quadraticCurveTo(p1.x, p1.y, b.x, b.y); }
        ctx.stroke();
      }
    };

    const loop = () => {
      const dx = mx - x, dy = my - y;
      x += dx * 0.34; y += dy * 0.34;
      const speed = Math.min(Math.hypot(dx, dy) / 140, 1);
      rg.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
      lb.style.transform = `translate3d(${x + 20}px,${y + 16}px,0)`;
      len += (4 + 18 * speed - len) * 0.12;
      const last = pts[pts.length - 1];
      if (!last || Math.hypot(x - last.x, y - last.y) > 0.6) pts.push({ x, y });
      while (pts.length > Math.max(3, Math.round(len))) pts.shift();
      if (speed <= 0.02 && pts.length) pts.shift(); // trail drains when the pointer rests
      draw();
      raf = requestAnimationFrame(loop);
    };
    loop();

    addEventListener("mousemove", move, { passive: true });
    addEventListener("mouseover", over, { passive: true });
    addEventListener("mousedown", dn);
    addEventListener("mouseup", up);
    addEventListener("resize", size);
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      document.documentElement.classList.remove("cur-on");
      cancelAnimationFrame(raf);
      removeEventListener("mousemove", move); removeEventListener("mouseover", over);
      removeEventListener("mousedown", dn); removeEventListener("mouseup", up); removeEventListener("resize", size);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <div id="cur" ref={root} aria-hidden="true">
      <canvas ref={canvas} />
      <div className="cur-ring" ref={ring}>
        <svg ref={arrow} viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
        </svg>
      </div>
      <div className="cur-label" ref={label} />
    </div>
  );
}
