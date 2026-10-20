"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type Ref } from "react";
import { Check, ChevronDown } from "lucide-react";

type SelectProps = {
  id: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  invalid?: boolean;
  describedBy?: string;
  /** Lets react-hook-form focus the control when validation fails. */
  buttonRef?: Ref<HTMLButtonElement>;
};

/** Styled, keyboard-accessible listbox that replaces the browser's default dropdown (ARIA select-only combobox pattern). */
export function Select({ id, value, options, onChange, onBlur, placeholder = "Select", invalid, describedBy, buttonRef }: SelectProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: "", timer: 0 });

  const selected = options.indexOf(value);
  const optId = (i: number) => `${listId}-o${i}`;

  const openList = () => { setActive(selected >= 0 ? selected : 0); setOpen(true); };
  const choose = (i: number) => { const v = options[i]; if (v !== undefined) onChange(v); setOpen(false); };

  // Close on outside pointer press.
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) { setOpen(false); onBlur?.(); } };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open, onBlur]);

  // Keep the highlighted option in view.
  useEffect(() => {
    if (open) list.current?.querySelector<HTMLElement>(`#${CSS.escape(optId(active))}`)?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, active]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const last = options.length - 1;
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); if (!open) openList(); else setActive((a) => Math.min(a + 1, last)); break;
      case "ArrowUp": e.preventDefault(); if (!open) openList(); else setActive((a) => Math.max(a - 1, 0)); break;
      case "Home": if (open) { e.preventDefault(); setActive(0); } break;
      case "End": if (open) { e.preventDefault(); setActive(last); } break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (open) choose(active); else openList();
        break;
      case "Escape": if (open) { e.preventDefault(); setOpen(false); } break;
      case "Tab": if (open) { choose(active); } break;
      default:
        // Typeahead: jump to the option starting with the typed letters.
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          clearTimeout(typed.current.timer);
          typed.current.text += e.key.toLowerCase();
          typed.current.timer = window.setTimeout(() => { typed.current.text = ""; }, 600);
          const hit = options.findIndex((o) => o.toLowerCase().startsWith(typed.current.text));
          if (hit >= 0) { if (!open) setOpen(true); setActive(hit); }
        }
    }
  };

  return (
    <div className="dd" ref={root}>
      <button
        id={id}
        ref={buttonRef}
        type="button"
        role="combobox"
        className="dd-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? optId(active) : undefined}
        aria-required="true"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        data-empty={selected < 0 || undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onBlur={() => { if (!open) onBlur?.(); }}
        onKeyDown={onKeyDown}
      >
        <span>{selected >= 0 ? value : placeholder}</span>
        <ChevronDown size={18} aria-hidden="true" />
      </button>
      {open && (
        <ul className="dd-list" id={listId} role="listbox" aria-labelledby={id} ref={list} tabIndex={-1}>
          {options.map((o, i) => (
            <li
              key={o}
              id={optId(i)}
              role="option"
              aria-selected={i === selected}
              data-active={i === active || undefined}
              onPointerEnter={() => setActive(i)}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => choose(i)}
            >
              <span>{o}</span>
              {i === selected && <Check size={16} aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
