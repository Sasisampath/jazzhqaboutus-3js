import {
  ABOUT_BOOK_COVER,
  type BookBlock,
  type BookPage,
  type BookRun,
} from "@/data/about";

/* Canvas painters for the founder field-notes book (cover + pages).
   Textures only — no DOM. Colours follow the About Us brand tokens. */

export const PAGE_PX_W = 1024;
export const PAGE_PX_H = 1400;

const INK = "#242424";
const BODY = "#3b3d40";
const MUTED = "#6A7077";
const PURPLE = "#564EF0";
const RED = "#E5484D";
const GREEN = "#14AE5D";
const MARKER = "rgba(247, 207, 102, 0.8)";
const PAPER = "#FBF8F1";
const ENDPAPER = "#E9E1CF";
const COVER = "#1B1A19";
const COVER_INK = "#EFE9DC";

export type BookFonts = { display: string; body: string; mono: string };
export type PageSide = "left" | "right";

type Ctx = CanvasRenderingContext2D;

function cssFont(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value ? `${value}, ${fallback}` : fallback;
}

/** Resolve the site's next/font families and make sure they are ready for canvas. */
export async function resolveBookFonts(): Promise<BookFonts> {
  const fonts: BookFonts = {
    display: cssFont("--font-plus-jakarta", "system-ui, sans-serif"),
    body: cssFont("--font-inter", "system-ui, sans-serif"),
    mono: cssFont("--font-geist-mono", "ui-monospace, monospace"),
  };

  if (document.fonts?.load) {
    const wanted = [
      `700 48px ${fonts.display}`,
      `500 48px ${fonts.display}`,
      `400 48px ${fonts.body}`,
      `500 48px ${fonts.body}`,
      `500 24px ${fonts.mono}`,
    ];
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, 1500));
    await Promise.race([
      Promise.all(wanted.map((font) => document.fonts.load(font))).then(
        () => undefined,
        () => undefined,
      ),
      timeout,
    ]);
  }

  return fonts;
}

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function setSpacing(ctx: Ctx, px: number) {
  // Not available in every browser; type simply renders without tracking there.
  (ctx as Ctx & { letterSpacing?: string }).letterSpacing = `${px}px`;
}

function grain(ctx: Ctx, w: number, h: number, seed: number, light: boolean) {
  const rand = rng(seed);
  for (let i = 0; i < 5200; i += 1) {
    const alpha = 0.012 + rand() * 0.03;
    ctx.fillStyle = light
      ? `rgba(255,255,255,${alpha})`
      : `rgba(70,52,30,${alpha})`;
    ctx.fillRect(rand() * w, rand() * h, 1 + rand() * 1.6, 1 + rand() * 1.6);
  }
}

function paintPaper(ctx: Ctx, side: PageSide, seed: number, color = PAPER) {
  const w = PAGE_PX_W;
  const h = PAGE_PX_H;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  grain(ctx, w, h, seed, false);

  // Gutter shade toward the spine, faint darkening at the outer edge.
  const gutter = ctx.createLinearGradient(
    side === "left" ? w : 0,
    0,
    side === "left" ? w - 120 : 120,
    0,
  );
  gutter.addColorStop(0, "rgba(64, 46, 24, 0.2)");
  gutter.addColorStop(0.45, "rgba(64, 46, 24, 0.05)");
  gutter.addColorStop(1, "rgba(64, 46, 24, 0)");
  ctx.fillStyle = gutter;
  ctx.fillRect(0, 0, w, h);

  const edge = ctx.createLinearGradient(
    side === "left" ? 0 : w,
    0,
    side === "left" ? 26 : w - 26,
    0,
  );
  edge.addColorStop(0, "rgba(64, 46, 24, 0.07)");
  edge.addColorStop(1, "rgba(64, 46, 24, 0)");
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, w, h);
}

/* ── Rich text ─────────────────────────────────────────────── */

type Token = { word: string; mark?: BookRun["mark"]; glue: boolean; width: number };

function tokenize(ctx: Ctx, runs: BookRun[]): Token[] {
  const tokens: Token[] = [];
  runs.forEach((run, runIndex) => {
    const startsWithSpace = /^\s/.test(run.text);
    run.text
      .split(/\s+/)
      .filter(Boolean)
      .forEach((word, wordIndex) => {
        tokens.push({
          word,
          mark: run.mark,
          glue: wordIndex === 0 && runIndex > 0 && !startsWithSpace && tokens.length > 0 &&
            !/\s$/.test(runs[runIndex - 1].text),
          width: ctx.measureText(word).width,
        });
      });
  });
  return tokens;
}

function breakLines(tokens: Token[], space: number, maxWidth: number) {
  const lines: Token[][] = [];
  let line: Token[] = [];
  let width = 0;
  tokens.forEach((token) => {
    const gap = line.length === 0 || token.glue ? 0 : space;
    if (line.length > 0 && !token.glue && width + gap + token.width > maxWidth) {
      lines.push(line);
      line = [token];
      width = token.width;
      return;
    }
    line.push(token);
    width += gap + token.width;
  });
  if (line.length > 0) lines.push(line);
  return lines;
}

function drawMarker(ctx: Ctx, x1: number, x2: number, baseline: number, size: number, rand: () => number) {
  const j = () => (rand() - 0.5) * size * 0.14;
  ctx.fillStyle = MARKER;
  ctx.beginPath();
  ctx.moveTo(x1 - 10 + j(), baseline - size * 0.82 + j());
  ctx.lineTo(x2 + 12 + j(), baseline - size * 0.86 + j());
  ctx.lineTo(x2 + 8 + j(), baseline + size * 0.26 + j());
  ctx.lineTo(x1 - 12 + j(), baseline + size * 0.22 + j());
  ctx.closePath();
  ctx.fill();
}

function drawUnderline(ctx: Ctx, x1: number, x2: number, baseline: number, size: number, rand: () => number) {
  const y = baseline + size * 0.26;
  const wobble = () => (rand() - 0.5) * size * 0.16;
  ctx.strokeStyle = PURPLE;
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(4, size * 0.11);
  ctx.beginPath();
  ctx.moveTo(x1 - 6, y + wobble());
  ctx.bezierCurveTo(
    x1 + (x2 - x1) * 0.3, y + wobble() - 4,
    x1 + (x2 - x1) * 0.7, y + wobble() + 5,
    x2 + 8, y + wobble(),
  );
  ctx.stroke();
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = Math.max(3, size * 0.07);
  ctx.beginPath();
  ctx.moveTo(x1 + 18, y + size * 0.2 + wobble());
  ctx.quadraticCurveTo((x1 + x2) / 2, y + size * 0.24 + wobble(), x2 - 26, y + size * 0.17 + wobble());
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function richText(
  ctx: Ctx,
  runs: BookRun[],
  x: number,
  y: number,
  maxWidth: number,
  font: string,
  size: number,
  lineHeight: number,
  color: string,
  draw: boolean,
  rand: () => number,
) {
  ctx.font = font;
  setSpacing(ctx, 0);
  const space = ctx.measureText(" ").width;
  const lines = breakLines(tokenize(ctx, runs), space, maxWidth);
  if (!draw) return lines.length * lineHeight;

  lines.forEach((line, index) => {
    const baseline = y + index * lineHeight + lineHeight * 0.72;
    const xs: number[] = [];
    let cursor = x;
    line.forEach((token, i) => {
      if (i > 0 && !token.glue) cursor += space;
      xs.push(cursor);
      cursor += token.width;
    });

    // Marks first, so the ink sits on top of the highlighter.
    let i = 0;
    while (i < line.length) {
      const mark = line[i].mark;
      if (!mark) {
        i += 1;
        continue;
      }
      let end = i;
      while (end + 1 < line.length && line[end + 1].mark === mark) end += 1;
      const x1 = xs[i];
      const x2 = xs[end] + line[end].width;
      if (mark === "marker") drawMarker(ctx, x1, x2, baseline, size, rand);
      else drawUnderline(ctx, x1, x2, baseline, size, rand);
      i = end + 1;
    }

    ctx.fillStyle = color;
    ctx.font = font;
    line.forEach((token, k) => ctx.fillText(token.word, xs[k], baseline));
  });

  return lines.length * lineHeight;
}

/* ── Page flow ─────────────────────────────────────────────── */

const GUTTER_MARGIN = 122;
const OUTER_MARGIN = 92;
const CONTENT_TOP = 176;
const CONTENT_BOTTOM = PAGE_PX_H - 168;

function flow(
  ctx: Ctx,
  blocks: BookBlock[],
  fonts: BookFonts,
  x: number,
  width: number,
  startY: number,
  draw: boolean,
  seed: number,
) {
  const rand = rng(seed);
  let y = startY;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";

  blocks.forEach((block, index) => {
    const next = blocks[index + 1];
    switch (block.kind) {
      case "eyebrow": {
        const size = 23;
        if (draw) {
          ctx.font = `500 ${size}px ${fonts.mono}`;
          setSpacing(ctx, 4.5);
          ctx.fillStyle = block.tone === "accent" ? PURPLE : MUTED;
          ctx.fillText(block.text.toUpperCase(), x, y + size);
          setSpacing(ctx, 0);
        }
        y += size + (next?.kind === "eyebrow" ? 18 : 46);
        break;
      }
      case "display": {
        const max = block.size === "xl" ? 150 : block.size === "lg" ? 132 : 108;
        ctx.font = `700 100px ${fonts.display}`;
        setSpacing(ctx, -3);
        const widest = Math.max(...block.lines.map((line) => ctx.measureText(line).width));
        const size = Math.min(max, (100 * width) / widest);
        const lineHeight = size * 1.0;
        if (draw) {
          ctx.font = `700 ${size}px ${fonts.display}`;
          setSpacing(ctx, -size * 0.03);
          ctx.fillStyle = INK;
          block.lines.forEach((line, i) => {
            ctx.fillText(line, x - size * 0.03, y + i * lineHeight + size * 0.82);
          });
          setSpacing(ctx, 0);
        }
        y += block.lines.length * lineHeight + 52;
        break;
      }
      case "lead": {
        const size = 56;
        y += richText(ctx, block.runs, x, y, width, `500 ${size}px ${fonts.display}`, size, 80, INK, draw, rand);
        y += 44;
        break;
      }
      case "body": {
        const size = 40;
        y += richText(ctx, block.runs, x, y, width, `400 ${size}px ${fonts.body}`, size, 63, BODY, draw, rand);
        y += 34;
        break;
      }
      case "note": {
        const size = 33;
        if (draw) {
          ctx.font = `italic 500 ${size}px ${fonts.body}`;
          ctx.fillStyle = PURPLE;
          ctx.fillText(block.text, x, y + size);
          const end = x + ctx.measureText(block.text).width + 22;
          const cy = y + size * 0.68;
          ctx.strokeStyle = PURPLE;
          ctx.lineWidth = 4;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          ctx.moveTo(end, cy + 3);
          ctx.quadraticCurveTo(end + 50, cy - 12, end + 104, cy);
          ctx.moveTo(end + 82, cy - 17);
          ctx.lineTo(end + 106, cy);
          ctx.lineTo(end + 80, cy + 16);
          ctx.stroke();
        }
        y += size + 40;
        break;
      }
      case "rule": {
        if (draw) {
          ctx.fillStyle = INK;
          ctx.fillRect(x, y + 4, 96, 4);
        }
        y += 52;
        break;
      }
    }
  });

  return y - startY;
}

export function paintPage(
  canvas: HTMLCanvasElement,
  page: BookPage,
  side: PageSide,
  folio: number,
  fonts: BookFonts,
) {
  canvas.width = PAGE_PX_W;
  canvas.height = PAGE_PX_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  paintPaper(ctx, side, 100 + folio);

  const x = side === "left" ? OUTER_MARGIN : GUTTER_MARGIN;
  const width = PAGE_PX_W - OUTER_MARGIN - GUTTER_MARGIN;
  const outerX = side === "left" ? OUTER_MARGIN : PAGE_PX_W - OUTER_MARGIN;

  // Running head + folio on the outer edge.
  ctx.textAlign = side === "left" ? "left" : "right";
  ctx.textBaseline = "alphabetic";
  ctx.font = `500 18px ${fonts.mono}`;
  setSpacing(ctx, 3.5);
  ctx.fillStyle = "#9a9a94";
  ctx.fillText("JAZZHQ · FIELD NOTES · VOL. 01", outerX, 98);
  ctx.font = `500 22px ${fonts.mono}`;
  ctx.fillText(String(folio).padStart(2, "0"), outerX, PAGE_PX_H - 84);
  setSpacing(ctx, 0);

  const height = flow(ctx, page.blocks, fonts, x, width, 0, false, 7 + folio);
  const room = CONTENT_BOTTOM - CONTENT_TOP;
  const top =
    page.valign === "center"
      ? CONTENT_TOP + Math.max(0, (room - height) / 2)
      : CONTENT_TOP;
  flow(ctx, page.blocks, fonts, x, width, top, true, 7 + folio);
}

export function paintEndpaper(canvas: HTMLCanvasElement, side: PageSide, fonts: BookFonts) {
  canvas.width = PAGE_PX_W;
  canvas.height = PAGE_PX_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  paintPaper(ctx, side, 41, ENDPAPER);
  ctx.textAlign = "center";
  ctx.font = `500 20px ${fonts.mono}`;
  setSpacing(ctx, 5);
  ctx.fillStyle = "rgba(36,36,36,0.42)";
  ctx.fillText("JAZZHQ · FIELD NOTES", PAGE_PX_W / 2, PAGE_PX_H - 120);
  setSpacing(ctx, 0);
}

export function paintCover(canvas: HTMLCanvasElement, fonts: BookFonts) {
  const w = PAGE_PX_W;
  const h = PAGE_PX_H;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = COVER;
  ctx.fillRect(0, 0, w, h);
  grain(ctx, w, h, 9, true);

  // Hinge crease beside the spine and a blind-stamped frame.
  const crease = ctx.createLinearGradient(40, 0, 96, 0);
  crease.addColorStop(0, "rgba(0,0,0,0)");
  crease.addColorStop(0.5, "rgba(0,0,0,0.42)");
  crease.addColorStop(1, "rgba(255,255,255,0.03)");
  ctx.fillStyle = crease;
  ctx.fillRect(40, 0, 56, h);
  ctx.strokeStyle = "rgba(239,233,220,0.1)";
  ctx.lineWidth = 2;
  ctx.strokeRect(128, 64, w - 192, h - 128);

  const left = 178;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = COVER_INK;

  ctx.font = `500 28px ${fonts.mono}`;
  setSpacing(ctx, 9);
  ctx.fillText(ABOUT_BOOK_COVER.brand, left, 182);

  ctx.font = `700 176px ${fonts.display}`;
  setSpacing(ctx, -5);
  ABOUT_BOOK_COVER.title.forEach((line, i) => {
    ctx.fillText(line, left - 8, 470 + i * 172);
  });

  ctx.font = `500 26px ${fonts.mono}`;
  setSpacing(ctx, 7);
  ctx.fillStyle = "rgba(239,233,220,0.62)";
  ctx.fillText(ABOUT_BOOK_COVER.volume, left, 742);

  ctx.fillStyle = COVER_INK;
  ctx.fillRect(left, h - 344, 72, 4);
  ctx.font = `500 44px ${fonts.display}`;
  setSpacing(ctx, 3);
  ABOUT_BOOK_COVER.subtitle.forEach((line, i) => {
    ctx.fillText(line, left, h - 258 + i * 58);
  });
  setSpacing(ctx, 0);

  // The only colour on the cover: three small brand dots.
  [RED, PURPLE, GREEN].forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(w - 196 + i * 34, h - 172, 10, 0, Math.PI * 2);
    ctx.fill();
  });
}
