"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Tooltip for footer marks. Shows on hover and keyboard focus (CSS), and
// toggles on tap so it also works on touch screens.
export function FooterTip({
  tip,
  align = "center",
  children,
}: {
  tip: ReactNode;
  align?: "start" | "center" | "end";
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span
      ref={ref}
      className={`site-tip site-tip--${align}${open ? " is-open" : ""}`}
      onPointerUp={(event) => { if (event.pointerType === "touch") setOpen((value) => !value); }}
    >
      {children}
      <span className="site-tip__panel" role="tooltip">{tip}</span>
    </span>
  );
}
