"use client";

import { useEffect, useRef } from "react";

const WORDMARK = "/assets/logo/jazzhq-wordmark-white.svg";

// Giant closing wordmark. A dark copy is always visible; the bright copy is
// revealed bottom → top by a soft mask as the wordmark scrolls into view.
// Nothing moves or scales — only the mask position (--reveal) changes.
export function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.classList.add("is-scroll-reveal");

    // Blend band of the soft mask (must match --band in footer.css).
    const BAND = 32;
    let frame = 0;
    let current = -1;
    let target = 0;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 as the wordmark starts entering; 1 only once it is ~fully visible (page bottom).
      const start = vh * 0.98;
      const end = vh - rect.height * 0.96;
      target = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
    };
    const paint = () => {
      frame = 0;
      // Light easing toward the scroll position; settles within a few frames.
      current = current < 0 ? target : current + (target - current) * 0.18;
      if (Math.abs(target - current) < 0.002) current = target;
      // Band starts fully below the logo (0) and has passed the top at 1.
      el.style.setProperty("--reveal", `${(current * (100 + BAND) - BAND).toFixed(2)}%`);
      if (current !== target) frame = requestAnimationFrame(paint);
    };
    const onScroll = () => { measure(); if (!frame) frame = requestAnimationFrame(paint); };

    onScroll();
    // Re-measure once the wordmark has its real height.
    const imgs = Array.from(el.querySelectorAll("img"));
    imgs.forEach((img) => img.addEventListener("load", onScroll));
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      imgs.forEach((img) => img.removeEventListener("load", onScroll));
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={ref} className="site-footer__wordmark-reveal" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="site-footer__wordmark site-footer__wordmark--base" src={WORDMARK} alt="" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="site-footer__wordmark site-footer__wordmark--reveal" src={WORDMARK} alt="" />
    </div>
  );
}
