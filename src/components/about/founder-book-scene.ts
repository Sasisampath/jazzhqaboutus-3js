import * as THREE from "three";
import { ABOUT_BOOK_SPREADS } from "@/data/about";
import {
  paintCover,
  paintEndpaper,
  paintPage,
  resolveBookFonts,
} from "./founder-book-pages";

/* One hardback field-notes book for the About Us founder note.
   Transparent canvas, no post-processing, renders only while something moves. */

export type FounderBookView = {
  opened: boolean;
  /** 0-based spread currently shown. */
  spread: number;
  /** Which page of the spread is centred in single-page (mobile) mode. */
  side: 0 | 1;
  single: boolean;
};

export type FounderBookScene = {
  setView(view: FounderBookView): void;
  setReducedMotion(reduced: boolean): void;
  setHover(hover: boolean): void;
  setPointer(x: number, y: number): void;
  hitTest(clientX: number, clientY: number): boolean;
  drag(leaf: number, progress: number): void;
  endDrag(leaf: number): void;
  resize(width: number, height: number): void;
  setActive(active: boolean): void;
  dispose(): void;
};

// Book proportions (world units).
const W = 1.5;
const H = 2.05;
const T = 0.2;
const COVER_T = 0.035;
const OVERHANG = 0.045;
const SPINE_T = 0.04;
const PAGE_W = W - 0.03;
const PAGE_H = H - 0.03;
const SHEET = 0.004;
const TURNING = ABOUT_BOOK_SPREADS.length; // leaves that turn
const BLOCK_TOP = T / 2 - (TURNING + 1.5) * SHEET;
const SEGMENTS = 22;
const FOV = 28;
const OPEN_ANGLE = Math.PI * 0.994;
const HOVER_ANGLE = THREE.MathUtils.degToRad(7);

type Channel = { value: number; from: number; to: number; start: number; dur: number };

const channel = (value: number): Channel => ({ value, from: value, to: value, start: 0, dur: 0 });
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = THREE.MathUtils.lerp;

type Leaf = {
  geometry: THREE.PlaneGeometry;
  group: THREE.Group;
  zRight: number;
  zLeft: number;
  lastP: number;
  lastDir: number;
};

function canvasTexture(canvas: HTMLCanvasElement, anisotropy: number, mirrored = false) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;
  if (mirrored) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.x = -1;
    texture.offset.x = 1;
  }
  return texture;
}

function pageEdgeTexture(rotated: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#EFE9DB";
    ctx.fillRect(0, 0, 64, 64);
    for (let x = 0; x < 64; x += 2) {
      ctx.fillStyle = `rgba(88, 70, 44, ${0.08 + ((x * 37) % 11) / 90})`;
      ctx.fillRect(x, 0, 1, 64);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  if (rotated) {
    texture.center.set(0.5, 0.5);
    texture.rotation = Math.PI / 2;
  }
  return texture;
}

function shadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    // Blurred rounded rect via an off-canvas shape's shadow (works without ctx.filter).
    ctx.shadowColor = "rgba(40, 30, 16, 0.55)";
    ctx.shadowBlur = 34;
    ctx.shadowOffsetX = 512;
    ctx.fillStyle = "#000";
    ctx.fillRect(-512 + 52, 52, 152, 152);
  }
  return new THREE.CanvasTexture(canvas);
}

export async function createFounderBookScene(
  canvas: HTMLCanvasElement,
  options: { reducedMotion: boolean; onContextLost: () => void },
): Promise<FounderBookScene> {
  const fonts = await resolveBookFonts();

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 50);

  scene.add(new THREE.AmbientLight(0xffffff, 2.25));
  const key = new THREE.DirectionalLight(0xfff6e8, 1.35);
  key.position.set(-2.2, 3.4, 5);
  scene.add(key);

  const disposables: Array<{ dispose(): void }> = [];
  const track = <D extends { dispose(): void }>(item: D) => {
    disposables.push(item);
    return item;
  };

  const rig = new THREE.Group();
  const book = new THREE.Group();
  rig.add(book);
  scene.add(rig);

  /* ── Textures ── */
  const paint = (painter: (c: HTMLCanvasElement) => void, mirrored = false) => {
    const c = document.createElement("canvas");
    painter(c);
    return track(canvasTexture(c, anisotropy, mirrored));
  };

  const coverTex = paint((c) => paintCover(c, fonts));
  const endLeftTex = paint((c) => paintEndpaper(c, "left", fonts));
  const endRightTex = paint((c) => paintEndpaper(c, "right", fonts));
  const edgeA = track(pageEdgeTexture(false));
  const edgeB = track(pageEdgeTexture(true));

  const lambert = (params: THREE.MeshLambertMaterialParameters) =>
    track(new THREE.MeshLambertMaterial(params));

  const board = lambert({ color: 0x1b1a19 });
  const boardEdge = lambert({ color: 0x141312 });

  /* ── Back cover, spine, page block ── */
  const coverGeo = track(new THREE.BoxGeometry(W + OVERHANG, H + OVERHANG * 2, COVER_T));
  coverGeo.translate((W + OVERHANG) / 2, 0, COVER_T / 2);

  const back = new THREE.Mesh(coverGeo, board);
  back.position.z = -T / 2 - COVER_T;
  book.add(back);

  const spineGeo = track(new THREE.BoxGeometry(SPINE_T, H + OVERHANG * 2, T + COVER_T));
  const spine = new THREE.Mesh(spineGeo, boardEdge);
  spine.position.set(-SPINE_T / 2, 0, -COVER_T / 2);
  book.add(spine);

  const blockDepth = BLOCK_TOP + T / 2;
  const blockGeo = track(new THREE.BoxGeometry(W - 0.012, H, blockDepth));
  const paperSide = lambert({ map: edgeA });
  const paperTopBottom = lambert({ map: edgeB });
  const paperFace = lambert({ color: 0xf6f1e6 });
  const block = new THREE.Mesh(blockGeo, [
    paperSide,
    paperSide,
    paperTopBottom,
    paperTopBottom,
    paperFace,
    paperFace,
  ]);
  block.position.set((W - 0.012) / 2 + 0.006, 0, -T / 2 + blockDepth / 2);
  book.add(block);

  // Ribbon marker — the small JazzHQ accent on the object itself.
  const ribbonGeo = track(new THREE.PlaneGeometry(0.075, 0.34));
  const ribbon = new THREE.Mesh(ribbonGeo, lambert({ color: 0x564ef0, side: THREE.DoubleSide }));
  ribbon.position.set(W * 0.7, -H / 2 - 0.1, 0);
  ribbon.rotation.z = 0.05;
  book.add(ribbon);

  /* ── Front cover, hinged at the spine ── */
  const coverPivot = new THREE.Group();
  coverPivot.position.set(0, 0, T / 2);
  const front = new THREE.Mesh(coverGeo, [
    boardEdge,
    boardEdge,
    boardEdge,
    boardEdge,
    lambert({ map: coverTex }),
    lambert({ map: endLeftTex }),
  ]);
  coverPivot.add(front);
  book.add(coverPivot);

  /* ── Leaves ── */
  const leaves: Leaf[] = [];
  const pageCount = TURNING + 1; // last leaf stays on the block
  for (let i = 0; i < pageCount; i += 1) {
    const geometry = track(new THREE.PlaneGeometry(PAGE_W, PAGE_H, SEGMENTS, 1));
    const group = new THREE.Group();

    const frontTex =
      i === 0
        ? endRightTex
        : paint((c) => paintPage(c, ABOUT_BOOK_SPREADS[i - 1].right, "right", i * 2, fonts));
    group.add(new THREE.Mesh(geometry, lambert({ map: frontTex, side: THREE.FrontSide })));

    if (i < TURNING) {
      const backTex = paint(
        (c) => paintPage(c, ABOUT_BOOK_SPREADS[i].left, "left", i * 2 + 1, fonts),
        true,
      );
      group.add(new THREE.Mesh(geometry, lambert({ map: backTex, side: THREE.BackSide })));
    }

    book.add(group);
    leaves.push({
      geometry,
      group,
      zRight: BLOCK_TOP + (pageCount - i) * SHEET,
      zLeft: T / 2 + (i + 1) * SHEET,
      lastP: -1,
      lastDir: 0,
    });
  }

  const shapeLeaf = (leaf: Leaf, p: number, dir: number) => {
    if (leaf.lastP === p && leaf.lastDir === dir) return;
    leaf.lastP = p;
    leaf.lastDir = dir;

    const theta = p * OPEN_ANGLE;
    const curl = dir * Math.sin(Math.PI * p) * 0.85;
    const positions = leaf.geometry.attributes.position as THREE.BufferAttribute;
    const step = PAGE_W / SEGMENTS;
    let x = 0;
    let z = 0;
    for (let j = 0; j <= SEGMENTS; j += 1) {
      if (j > 0) {
        const u = (j - 0.5) / SEGMENTS;
        const phi = THREE.MathUtils.clamp(theta - curl * u * u, 0, Math.PI);
        x += Math.cos(phi) * step;
        z += Math.sin(phi) * step;
      }
      positions.setXYZ(j, x, PAGE_H / 2, z);
      positions.setXYZ(j + SEGMENTS + 1, x, -PAGE_H / 2, z);
    }
    positions.needsUpdate = true;
    leaf.geometry.computeVertexNormals();
    leaf.geometry.computeBoundingSphere();
    leaf.group.position.z = lerp(leaf.zRight, leaf.zLeft, p);
  };

  /* ── Contact shadow on the page beneath ── */
  const shadowTex = track(shadowTexture());
  const shadowGeo = track(new THREE.PlaneGeometry(1, 1));
  const shadowMaterial = track(
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.5,
    }),
  );
  const shadow = new THREE.Mesh(shadowGeo, shadowMaterial);
  shadow.position.z = -T / 2 - COVER_T - 0.03;
  shadow.renderOrder = -1;
  rig.add(shadow);

  /* ── Animation state ── */
  const open = channel(0);
  const cover = channel(0);
  const hover = channel(0);
  const pan = channel(0);
  const leafCh = leaves.slice(0, TURNING).map(() => channel(0));
  const leafDir = leafCh.map(() => 1);
  const channels = [open, cover, hover, pan, ...leafCh];

  let reduced = options.reducedMotion;
  let view: FounderBookView = { opened: false, spread: 0, side: 0, single: false };
  let closedZ = -1;
  let pointerX = 0;
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;
  let active = true;
  let disposed = false;
  let raf = 0;
  let last = 0;

  const go = (ch: Channel, to: number, dur: number, delay = 0) => {
    if (ch.to === to) return;
    if (reduced) {
      ch.value = ch.from = ch.to = to;
      ch.dur = 0;
      return;
    }
    ch.from = ch.value;
    ch.to = to;
    ch.start = performance.now() + delay;
    ch.dur = dur;
  };

  const leafTarget = (i: number) => (view.opened && i <= view.spread ? 1 : 0);

  const update = (now: number) => {
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
    last = now;
    let moving = false;

    channels.forEach((ch) => {
      if (ch.value === ch.to) return;
      if (ch.dur <= 0) {
        ch.value = ch.to;
        return;
      }
      const t = THREE.MathUtils.clamp((now - ch.start) / ch.dur, 0, 1);
      ch.value = t >= 1 ? ch.to : ch.from + (ch.to - ch.from) * ease(t);
      if (t < 1) moving = true;
    });

    const k = reduced ? 1 : Math.min(1, dt * 6);
    pointerX += (targetX - pointerX) * k;
    pointerY += (targetY - pointerY) * k;
    if (Math.abs(targetX - pointerX) + Math.abs(targetY - pointerY) > 0.002) moving = true;

    const o = open.value;
    const parallax = 1 - o * 0.6;
    rig.position.z = lerp(closedZ, 0, o);
    rig.rotation.set(
      lerp(-0.4, -0.08, o) + pointerY * 0.05 * parallax,
      lerp(-0.5, 0, o) + pointerX * 0.07 * parallax,
      lerp(0.07, 0, o),
    );
    book.position.x = lerp(-W / 2, view.single ? pan.value : 0, o);

    coverPivot.rotation.y = -lerp(hover.value * HOVER_ANGLE, OPEN_ANGLE, cover.value);
    leaves.forEach((leaf, i) => {
      shapeLeaf(leaf, i < TURNING ? leafCh[i].value : 0, i < TURNING ? leafDir[i] : 0);
    });

    // The texture's solid core is ~60% of the plane, so scale past the book.
    shadow.scale.set(lerp(W * 1.74, W * 3.44, cover.value), H * 1.74, 1);
    shadow.position.x = lerp(0.06, view.single ? pan.value : 0, o);
    shadow.position.y = -0.09;
    // A single page fills the canvas, so the shadow would only show as a clipped box.
    shadowMaterial.opacity = view.single ? 0.5 * (1 - o) : 0.5;

    return moving;
  };

  const frame = (now: number) => {
    raf = 0;
    if (disposed) return;
    const moving = update(now);
    renderer.render(scene, camera);
    if (moving && active) raf = requestAnimationFrame(frame);
    else last = 0;
  };

  const invalidate = () => {
    if (!raf && active && !disposed) raf = requestAnimationFrame(frame);
  };

  const onLost = (event: Event) => {
    event.preventDefault();
    options.onContextLost();
  };
  canvas.addEventListener("webglcontextlost", onLost);

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  return {
    setView(next) {
      const wasOpened = view.opened;
      view = next;
      if (next.opened) {
        go(hover, 0, 200);
        go(open, 1, 900);
        go(cover, 1, 1000, wasOpened ? 0 : 60);
        leafCh.forEach((ch, i) => {
          const to = leafTarget(i);
          if (ch.to !== to) leafDir[i] = to > ch.value ? 1 : -1;
          go(ch, to, 850, wasOpened ? 0 : 200 + i * 90);
        });
        go(pan, next.side === 0 ? PAGE_W / 2 : -PAGE_W / 2, 650);
      } else {
        leafCh.forEach((ch, i) => {
          if (ch.to !== 0) leafDir[i] = -1;
          go(ch, 0, 520, (TURNING - 1 - i) * 50);
        });
        go(cover, 0, 820, 160);
        go(open, 0, 900, 160);
      }
      invalidate();
    },
    setReducedMotion(value) {
      reduced = value;
      if (reduced) {
        targetX = 0;
        targetY = 0;
        channels.forEach((ch) => {
          ch.value = ch.from = ch.to;
          ch.dur = 0;
        });
        invalidate();
      }
    },
    setHover(value) {
      if (view.opened || reduced) return;
      go(hover, value ? 1 : 0, 320);
      invalidate();
    },
    setPointer(x, y) {
      if (reduced) return;
      targetX = x;
      targetY = y;
      invalidate();
    },
    hitTest(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return false;
      ndc.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(ndc, camera);
      return raycaster.intersectObjects([front, back, block], false).length > 0;
    },
    drag(i, progress) {
      const ch = leafCh[i];
      if (!ch) return;
      const p = THREE.MathUtils.clamp(progress, 0, 1);
      if (p !== ch.value) leafDir[i] = p > ch.value ? 1 : -1;
      ch.value = ch.from = ch.to = p;
      ch.dur = 0;
      invalidate();
    },
    endDrag(i) {
      const ch = leafCh[i];
      if (!ch) return;
      const to = leafTarget(i);
      // Force a tween even when the leaf sits exactly on a previous target.
      ch.to = Number.NaN;
      leafDir[i] = to > ch.value ? 1 : -1;
      go(ch, to, reduced ? 0 : 420);
      invalidate();
    },
    resize(width, height) {
      if (width <= 0 || height <= 0) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
      const fit = (halfW: number, halfH: number) =>
        Math.max(halfH / tan, halfW / (tan * camera.aspect));
      const openDistance = view.single
        ? fit(PAGE_W / 2 + 0.07, H / 2 + OVERHANG + 0.1)
        : fit(W + OVERHANG + 0.14, H / 2 + OVERHANG + 0.16);
      const closedDistance = fit(W * 0.74, H * 0.64) * 1.2;
      camera.position.set(0, 0, openDistance);
      camera.updateProjectionMatrix();
      closedZ = Math.min(openDistance - closedDistance, -0.3);
      invalidate();
    },
    setActive(value) {
      active = value;
      if (active) invalidate();
      else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
        last = 0;
      }
    },
    dispose() {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      canvas.removeEventListener("webglcontextlost", onLost);
      disposables.forEach((item) => item.dispose());
      renderer.dispose();
    },
  };
}
