"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ABOUT_BOOK_SPREADS } from "@/data/about";
import {
  FounderBookCover,
  FounderBookSpread,
  FounderBookTranscript,
} from "./founder-book-fallback";
import type { FounderBookScene } from "./founder-book-scene";

const SPREADS = ABOUT_BOOK_SPREADS.length;
const PAGES = SPREADS * 2;
const SINGLE_PAGE_BELOW = 700;
const DRAG_START = 8;

type Mode = "poster" | "webgl" | "fallback";

type Gesture = {
  id: number;
  x: number;
  y: number;
  width: number;
  left: number;
  leaf: number | null;
  /** Leaf progress at drag start (0 = on the right, 1 = turned). */
  base: number;
  progress: number;
  moved: boolean;
};

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function FounderBook() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<FounderBookScene | null>(null);
  const gestureRef = useRef<Gesture | null>(null);
  const openRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const focusAfter = useRef<"open" | "next" | null>(null);

  const [mode, setMode] = useState<Mode>("poster");
  const [opened, setOpened] = useState(false);
  const [page, setPage] = useState(0); // 0…5, left/right pages of the three spreads
  const [single, setSingle] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [hot, setHot] = useState(false);

  const spread = Math.floor(page / 2);
  const side = (page % 2) as 0 | 1;
  const atStart = single ? page === 0 : spread === 0;
  const atEnd = single ? page === PAGES - 1 : spread === SPREADS - 1;

  const openBook = useCallback(() => {
    focusAfter.current = "next";
    setPage(0);
    setOpened(true);
  }, []);

  const closeBook = useCallback(() => {
    focusAfter.current = "open";
    setOpened(false);
  }, []);

  const goNext = useCallback(() => {
    setPage((current) =>
      single
        ? Math.min(PAGES - 1, current + 1)
        : Math.min(SPREADS - 1, Math.floor(current / 2) + 1) * 2,
    );
  }, [single]);

  const goPrev = useCallback(() => {
    setPage((current) =>
      single ? Math.max(0, current - 1) : Math.max(0, Math.floor(current / 2) - 1) * 2,
    );
  }, [single]);

  // Keep keyboard focus on a sensible control when the control set swaps.
  useEffect(() => {
    if (focusAfter.current === "next") nextRef.current?.focus({ preventScroll: true });
    if (focusAfter.current === "open") openRef.current?.focus({ preventScroll: true });
    focusAfter.current = null;
  }, [opened]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Stage size → single-page mode + renderer size.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(() => {
      const { width, height } = stage.getBoundingClientRect();
      setSingle(width < SINGLE_PAGE_BELOW);
      sceneRef.current?.resize(width, height);
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  // Lazily build the WebGL book once the stage is near the viewport,
  // and stop rendering while it is off screen.
  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    let cancelled = false;
    let started = false;

    const start = async () => {
      if (!hasWebGL()) {
        setMode("fallback");
        return;
      }
      try {
        const { createFounderBookScene } = await import("./founder-book-scene");
        const scene = await createFounderBookScene(canvas, {
          reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          onContextLost: () => {
            sceneRef.current?.dispose();
            sceneRef.current = null;
            setMode("fallback");
          },
        });
        if (cancelled) {
          scene.dispose();
          return;
        }
        sceneRef.current = scene;
        setMode("webgl");
      } catch {
        if (!cancelled) setMode("fallback");
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          started = true;
          void start();
        }
        sceneRef.current?.setActive(entry.isIntersecting);
      },
      { rootMargin: "240px 0px" },
    );
    observer.observe(stage);

    return () => {
      cancelled = true;
      observer.disconnect();
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Push React state into the scene.
  useEffect(() => {
    const scene = sceneRef.current;
    const stage = stageRef.current;
    if (mode !== "webgl" || !scene || !stage) return;
    scene.setReducedMotion(reduced);
    scene.setView({ opened, spread, side, single });
    const { width, height } = stage.getBoundingClientRect();
    scene.resize(width, height);
  }, [mode, opened, spread, side, single, reduced]);

  /* ── Pointer: hover, click, page drag, swipe ── */

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const scene = sceneRef.current;
    const gesture = gestureRef.current;

    if (gesture && gesture.id === event.pointerId) {
      const dx = event.clientX - gesture.x;
      const dy = event.clientY - gesture.y;
      if (!gesture.moved && Math.abs(dx) > DRAG_START && Math.abs(dx) > Math.abs(dy)) {
        gesture.moved = true;
        if (scene && opened && !single) {
          const fromRight = gesture.x - gesture.left > gesture.width / 2;
          if (fromRight && dx < 0 && spread < SPREADS - 1) {
            gesture.leaf = spread + 1;
            gesture.base = 0;
          } else if (!fromRight && dx > 0 && spread > 0) {
            gesture.leaf = spread;
            gesture.base = 1;
          }
          if (gesture.leaf !== null) {
            try {
              event.currentTarget.setPointerCapture(event.pointerId);
            } catch {
              // Pointer already released; the drag still resolves on pointerup/cancel.
            }
          }
        }
      }
      if (scene && gesture.leaf !== null) {
        const travel = Math.abs(dx) / (gesture.width * 0.42);
        gesture.progress = gesture.base === 0 ? Math.min(1, travel) : Math.max(0, 1 - travel);
        scene.drag(gesture.leaf, gesture.progress);
      }
      return;
    }

    if (!scene || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    scene.setPointer(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      ((event.clientY - rect.top) / rect.height) * 2 - 1,
    );
    if (!opened) {
      const hit = scene.hitTest(event.clientX, event.clientY);
      setHot(hit);
      scene.setHover(hit);
    }
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    gestureRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      width: rect.width,
      left: rect.left,
      leaf: null,
      base: 0,
      progress: 0,
      moved: false,
    };
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    gestureRef.current = null;
    if (!gesture || gesture.id !== event.pointerId) return;
    const scene = sceneRef.current;
    const dx = event.clientX - gesture.x;

    if (gesture.leaf !== null && scene) {
      // Dragged leaf: commit past the midpoint, otherwise let it fall back.
      const committed = gesture.base === 0 ? gesture.progress > 0.4 : gesture.progress < 0.6;
      if (committed) {
        if (gesture.base === 0) goNext();
        else goPrev();
      } else {
        scene.endDrag(gesture.leaf);
      }
      return;
    }

    if (gesture.moved) {
      // Horizontal swipe (single-page mode and the DOM fallback).
      if (opened && Math.abs(dx) > 36) {
        if (dx < 0) goNext();
        else goPrev();
      }
      return;
    }

    if (!opened) {
      const onBook =
        mode !== "webgl" || !scene || scene.hitTest(event.clientX, event.clientY);
      if (onBook) openBook();
      return;
    }
    if (event.clientX - gesture.left > gesture.width * 0.5) goNext();
    else goPrev();
  };

  const onPointerCancel = () => {
    const gesture = gestureRef.current;
    gestureRef.current = null;
    if (gesture?.leaf != null) sceneRef.current?.endDrag(gesture.leaf);
  };

  const onPointerLeave = () => {
    setHot(false);
    sceneRef.current?.setHover(false);
    sceneRef.current?.setPointer(0, 0);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && opened) {
      event.preventDefault();
      closeBook();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      if (opened) goNext();
      else openBook();
    } else if (event.key === "ArrowLeft" && opened) {
      event.preventDefault();
      goPrev();
    }
  };

  const counter = single
    ? `Page ${page + 1} of ${PAGES}`
    : `Spread ${spread + 1} of ${SPREADS}`;
  const counterShort = single
    ? `${String(page + 1).padStart(2, "0")} / ${String(PAGES).padStart(2, "0")}`
    : `${String(spread + 1).padStart(2, "0")} / ${String(SPREADS).padStart(2, "0")}`;

  return (
    <div
      className="au-book"
      role="group"
      aria-roledescription="interactive notebook"
      aria-label="Field notes from the JazzHQ founders"
      onKeyDown={onKeyDown}
    >
      <div
        ref={stageRef}
        className={`au-book__stage au-book__stage--${mode}${opened ? " is-open" : ""}${
          hot || mode !== "webgl" || opened ? " is-hot" : ""
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onPointerLeave={onPointerLeave}
        aria-hidden
      >
        <canvas ref={canvasRef} className="au-book__canvas" />
        {mode !== "webgl" && (
          <div className="au-book__flat">
            {opened ? (
              <FounderBookSpread spread={spread} side={side} single={single} />
            ) : (
              <FounderBookCover />
            )}
          </div>
        )}
      </div>

      <FounderBookTranscript />

      <div className="au-book__controls">
        {opened ? (
          <>
            <button
              ref={prevRef}
              type="button"
              className="au-book__btn au-book__btn--icon"
              onClick={goPrev}
              disabled={atStart}
              aria-label="Previous page"
            >
              <span aria-hidden>←</span>
            </button>
            <span className="au-book__counter" aria-hidden>
              {counterShort}
            </span>
            <button
              ref={nextRef}
              type="button"
              className="au-book__btn au-book__btn--icon"
              onClick={goNext}
              disabled={atEnd}
              aria-label="Next page"
            >
              <span aria-hidden>→</span>
            </button>
            <button type="button" className="au-book__btn" onClick={closeBook}>
              Close
            </button>
          </>
        ) : (
          <button
            ref={openRef}
            type="button"
            className="au-book__btn au-book__btn--primary"
            onClick={openBook}
          >
            Read the note <span aria-hidden>→</span>
          </button>
        )}
      </div>

      <p className="au-sr-only" role="status" aria-live="polite">
        {opened ? `Notebook open. ${counter}.` : "Notebook closed."}
      </p>
    </div>
  );
}
