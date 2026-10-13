"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ABOUT_BOOK_SPREADS } from "@/data/about";
import {
  FounderBookCover,
  FounderBookSpread,
  FounderBookTranscript,
} from "./founder-book-fallback";
import type { FounderBookScene } from "./founder-book-scene";

/* Scroll-driven founder note. The tall wrapper is the scroll track; the heading
   and book stay sticky inside it, and the scroll position alone decides the
   book's pose. Reduced motion / no WebGL get the note as flat, stacked spreads. */

const SINGLE_PAGE_BELOW = 700;
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void) {
  const query = window.matchMedia(REDUCED_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function FounderBook({ heading }: { heading: React.ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<FounderBookScene | null>(null);

  const reduced = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false,
  );
  const [webgl, setWebgl] = useState<"pending" | "ready" | "failed">("pending");
  const [single, setSingle] = useState(false);

  const mode = reduced || webgl === "failed" ? "static" : webgl === "ready" ? "webgl" : "poster";

  // Narrow layouts show one page at a time.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(() => {
      setSingle(track.getBoundingClientRect().width < SINGLE_PAGE_BELOW);
    });
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  // Build the WebGL book lazily, then let scroll position drive it.
  useEffect(() => {
    if (reduced) return;
    const track = trackRef.current;
    const sticky = stickyRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!track || !sticky || !stage || !canvas) return;

    let cancelled = false;
    let started = false;
    let raf = 0;

    // Normalised progress of the sticky block through its track (0…1).
    const sync = () => {
      raf = 0;
      const range = track.offsetHeight - sticky.offsetHeight;
      const top = parseFloat(getComputedStyle(sticky).top) || 0;
      const progress =
        range > 0
          ? Math.min(1, Math.max(0, (top - track.getBoundingClientRect().top) / range))
          : 0;
      sceneRef.current?.setProgress(progress);
      if (hintRef.current) {
        hintRef.current.style.opacity = String(Math.max(0, 1 - progress / 0.04));
      }
      // The loading poster is a closed cover, so only show it while the book is closed.
      if (posterRef.current) {
        posterRef.current.style.opacity = progress < 0.1 ? "1" : "0";
      }
    };
    const requestSync = () => {
      if (!raf) raf = requestAnimationFrame(sync);
    };

    const fit = () => {
      const { width, height } = stage.getBoundingClientRect();
      const scene = sceneRef.current;
      if (!scene) return;
      scene.setSingle(track.getBoundingClientRect().width < SINGLE_PAGE_BELOW);
      scene.resize(width, height);
      requestSync();
    };

    const start = async () => {
      if (!hasWebGL()) {
        setWebgl("failed");
        return;
      }
      try {
        const { createFounderBookScene } = await import("./founder-book-scene");
        const scene = await createFounderBookScene(canvas, {
          onContextLost: () => {
            sceneRef.current?.dispose();
            sceneRef.current = null;
            setWebgl("failed");
          },
        });
        if (cancelled) {
          scene.dispose();
          return;
        }
        sceneRef.current = scene;
        // Pose for wherever the page already is (e.g. a refresh mid-way) before showing it.
        fit();
        sync();
        setWebgl("ready");
      } catch {
        if (!cancelled) setWebgl("failed");
      }
    };

    const visibility = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          started = true;
          void start();
        }
        sceneRef.current?.setActive(entry.isIntersecting);
        if (entry.isIntersecting) requestSync();
      },
      { rootMargin: "240px 0px" },
    );
    visibility.observe(track);

    const resize = new ResizeObserver(fit);
    resize.observe(stage);

    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      visibility.disconnect();
      resize.disconnect();
      window.removeEventListener("scroll", requestSync);
      window.removeEventListener("resize", requestSync);
      sceneRef.current?.dispose();
      sceneRef.current = null;
      setWebgl("pending");
    };
  }, [reduced]);

  return (
    <div ref={trackRef} className={`au-book au-book--${mode}`}>
      <div ref={stickyRef} className="au-book__sticky">
        {heading}

        {mode === "static" ? (
          <div className="au-book__static" aria-hidden>
            {ABOUT_BOOK_SPREADS.map((_, index) => (
              <FounderBookSpread key={index} spread={index} stack={single} />
            ))}
          </div>
        ) : (
          <>
            <div ref={stageRef} className="au-book__stage" aria-hidden>
              <canvas ref={canvasRef} className="au-book__canvas" />
              {mode === "poster" && (
                <div ref={posterRef} className="au-book__flat">
                  <FounderBookCover />
                </div>
              )}
            </div>
            <p ref={hintRef} className="au-book__hint" aria-hidden>
              Scroll to read <span>↓</span>
            </p>
          </>
        )}
      </div>

      <FounderBookTranscript />
    </div>
  );
}
