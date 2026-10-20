"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const mq = matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

type MotionState = { off: boolean; toggle: () => void };
const MotionContext = createContext<MotionState>({ off: false, toggle: () => {} });

export const useMotion = () => useContext(MotionContext);

/** Motion is off when the visitor asked for reduced motion, unless they flip the toggle themselves. */
export function MotionProvider({ children }: { children: ReactNode }) {
  const reduced = useSyncExternalStore(subscribe, () => matchMedia(QUERY).matches, () => false);
  const [override, setOverride] = useState<boolean | null>(null);
  const off = override ?? reduced;

  useEffect(() => {
    const root = document.documentElement;
    if (off) root.classList.add("nm");
    else if (override === false || !reduced) root.classList.remove("nm");
  }, [off, override, reduced]);

  return <MotionContext.Provider value={{ off, toggle: () => setOverride(!off) }}>{children}</MotionContext.Provider>;
}

export function MotionToggle() {
  const { off, toggle } = useMotion();
  return (
    <button id="mo" type="button" aria-pressed={off} onClick={toggle}>
      {off ? "Motion off" : "Motion on"}
    </button>
  );
}
