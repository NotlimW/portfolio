/**
 * particles.js — the halftone field behind the page.
 *
 * One dot lattice, evenly spaced, running the full height of the site. Dots
 * rest small and swell toward the cursor, so the pointer drags a soft bloom
 * around with it the way a halftone plate reads under a lens. The whole field
 * also drifts against scroll, which is where the page's sense of depth comes
 * from.
 *
 *   <canvas data-particles></canvas>            the field
 *   <canvas data-particles data-density="0.6">  wider spacing, fewer dots
 *   host.particleShiftX = 120                     slide this host's dots sideways
 *   host.particleHoldY = 300                      cancel 300px of scroll (a pinned host)
 *   <section data-particles-hold[="selector"]      the same, worked out for every canvas
 *            data-particles-slide="0.4">        inside a pinned scene; slide = how far the
 *                                                 dots travel sideways over the pin, as a
 *                                                 share of the viewport width;
 *                                                 data-particles-hold-media limits it
 *                                                 to when the scene is actually pinned
 *
 * Ink is read from CSS rather than hardcoded, so a canvas inside a dark
 * section draws itself light without knowing anything about the section.
 *
 * WHY THIS IS STILL ONE CANVAS PER SECTION, not one fixed canvas for the whole
 * page: every section paints its own opaque background — the light sections
 * are paper, the dark ones near-black — so a single canvas behind them all
 * would be covered by the first one it passed under. The field is made
 * continuous instead by anchoring the lattice to PAGE coordinates rather than
 * to each canvas: neighbouring sections solve the same lattice for their own
 * slice of the page, so the dots line up across every seam and the seams
 * disappear.
 */

import { onScroll } from "./smooth-scroll.js";
import { motionAllowed } from "./motion-prefs.js";

/** Lattice pitch in CSS px at density 1. */
const SPACING = 32;

/** How far the cursor's swell reaches. */
const REACH = 320;

/**
 * How far a dot is shoved away from the cursor at the peak of its influence.
 * The field parts around the pointer instead of only brightening under it,
 * which is what makes the grid read as a surface being pressed rather than a
 * lamp being shone on it.
 *
 * There is deliberately no per-dot velocity or spring here. The springiness
 * comes from the cursor itself being eased (see EASE): the whole field lags
 * and settles as one, which costs a couple of multiplies per dot instead of
 * ~1500 stateful bodies integrated every frame — and it never leaves a ticker
 * running once things have come to rest.
 */
const PUSH = 6;

/** How many alpha/tint steps the near field is quantised into. See drawField. */
const NEAR_STEPS = 6;

const TAU = Math.PI * 2;

/** Fraction of scroll the field travels — under 1, so it lags and reads deep. */
const PARALLAX = 0.12;

/**
 * How much of the gap to the cursor is closed per frame. Low enough that the
 * bloom trails the pointer rather than being welded to it, which is the whole
 * character of the effect.
 */
const EASE = 0.085;

/** Below this, the bloom has arrived and the animation loop can stop. */
const SETTLED = 0.4;

/**
 * A canvas is never taller than the viewport plus this much slack, however
 * tall its section is, and it slides to follow the viewport as the section
 * passes.
 *
 * Sizing a canvas to its section looks harmless and is not: one section here
 * is 4535px tall, which at 2× is a 41MB backing store that clearRect() and
 * the whole draw pass have to touch on every scroll frame. Across ten
 * sections that was 116MB of surface being cleared and repainted while
 * scrolling — the single largest cost on the page.
 *
 * The lattice is procedural and solved from a page offset, so drawing a
 * viewport-sized window onto the same field is identical to drawing all of it.
 */
const VIEW_PAD = 160;

/** Small filled circles are the one mark that does gain from a 2× buffer. */
const MAX_DPR = 2;

let unsubscribe = null;
let onResize = null;
let onPointerMove = null;
let onPointerLeave = null;
let instances = [];
let frame = null;

/**
 * Cursor state in viewport coordinates. `target` is where the pointer
 * actually is, `current` is where the bloom has got to so far.
 */
const cursor = { targetX: -9999, targetY: -9999, x: -9999, y: -9999, seen: false };

/**
 * The pinned scene a canvas belongs to. data-particles-hold on an ancestor
 * either IS the pinned element, or names it with a selector (for a canvas
 * that sits beside the pinned part rather than inside it).
 */
function findPin(canvas) {
  const owner = canvas.closest("[data-particles-hold]");
  if (!owner) return null;
  const selector = owner.dataset.particlesHold;
  const pin = (selector && owner.querySelector(selector)) || owner;
  pin.particlesSlide = parseFloat(owner.dataset.particlesSlide) || 0;
  // Only while the scene is actually pinned: some unpin below a width.
  pin.particlesMedia = owner.dataset.particlesHoldMedia || null;
  return pin;
}

function build(canvas) {
  const density = parseFloat(canvas.dataset.density) || 1;
  const host = canvas.parentElement;

  // The canvas overhangs its window by up to one lattice cell (see render()),
  // so it sits in a clip the size of the section. The clip, not the section:
  // overflow on the section itself would un-stick every sticky caption in it.
  const clip = document.createElement("div");
  clip.className = "particles-clip";
  clip.setAttribute("aria-hidden", "true");
  canvas.replaceWith(clip);
  clip.append(canvas);

  return {
    canvas,
    clip,
    host,
    // A pinned scene this canvas sits in, if it asks for its dots to hold
    // still vertically (and, optionally, to slide sideways) while pinned.
    pin: findPin(canvas),
    ctx: canvas.getContext("2d", { alpha: true }),
    // Denser means a tighter lattice, so density divides the pitch.
    spacing: SPACING / density,
    w: 0,
    h: 0,
    hostH: 0,
    left: 0,
    slide: -1,
    ox: 0,
    oy: 0,
    bloomed: false,
    live: false,
    farStyle: "rgba(11, 11, 12, 0.22)",
    nearStyle: [],
    rMin: 0.9,
    rMax: 2.4,
  };
}

/**
 * Reads ink and dot weight from CSS so the canvas matches whichever ground it
 * sits on — and so the field can be tuned in the stylesheet like everything
 * else, rather than by editing numbers in here.
 *
 * The near field's fill styles are baked into strings here, once per resize,
 * rather than composed per frame: they only depend on tokens, and building
 * six rgba() strings inside the draw loop would be six allocations per canvas
 * per frame for values that never change between resizes.
 */
function readColours(instance) {
  const styles = getComputedStyle(instance.canvas);
  const num = (name, fallback) => {
    const value = parseFloat(styles.getPropertyValue(name));
    return Number.isFinite(value) ? value : fallback;
  };
  const channels = (name, fallback) => {
    const parts = styles.getPropertyValue(name).split(",").map((n) => parseInt(n, 10));
    return parts.length === 3 && parts.every(Number.isFinite) ? parts : fallback;
  };

  const ink = channels("--particle-ink", [11, 11, 12]);
  const accent = channels("--particle-accent", [138, 93, 0]);

  const alphaFar = num("--particle-dot-alpha", 0.22);
  const alphaNear = num("--particle-dot-alpha-near", 0.9);
  const tint = num("--particle-tint", 0.5);

  instance.rMin = num("--particle-dot-min", 0.9);
  instance.rMax = num("--particle-dot-max", 2.4);
  instance.farStyle = `rgba(${ink[0]}, ${ink[1]}, ${ink[2]}, ${alphaFar})`;

  // One style per influence band, from the outer edge of the cursor's reach
  // (near-invisible ink) to directly under it (bright, and pulled toward the
  // accent so the bloom picks up a gold cast rather than just getting darker).
  instance.nearStyle = Array.from({ length: NEAR_STEPS }, (_, i) => {
    const t = (i + 0.5) / NEAR_STEPS;
    const mix = tint * t;
    const c = ink.map((channel, k) => Math.round(channel + (accent[k] - channel) * mix));
    return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alphaFar + (alphaNear - alphaFar) * t})`;
  });
}

/**
 * Hand a canvas's memory back.
 *
 * A viewport-sized buffer is ~24MB at this DPR, and there are more than a
 * dozen of them. Allocating them all up front is a third of a gigabyte of GPU
 * surface held for sections the visitor may never reach — and the cost is not
 * paid at load, it accumulates as each one is first rasterised, which is
 * exactly what "it gets laggy once you have scrolled a while" feels like.
 *
 * Setting either dimension to 0 frees the backing store immediately.
 */
function release(instance) {
  if (!instance.live) return;
  instance.bloomed = false;
  instance.canvas.width = 0;
  instance.canvas.height = 0;
  instance.live = false;
  instance.slide = -1;
}

function measure(instance, rect) {
  const { canvas, ctx } = instance;
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

  // The section's full height is what the field is anchored to; the drawing
  // surface is only ever a window onto it.
  instance.hostH = rect.height;
  instance.w = rect.width;
  instance.h = Math.min(rect.height, window.innerHeight + VIEW_PAD * 2);
  // One lattice cell of overhang each way: the field is periodic, so any
  // drift is a move of under one cell — done with a transform, not a redraw.
  const cw = instance.w + instance.spacing;
  const ch = instance.h + instance.spacing;
  instance.cw = cw;
  instance.ch = ch;

  canvas.style.width = `${cw}px`;
  canvas.style.height = `${ch}px`;
  canvas.width = Math.round(cw * dpr);
  canvas.height = Math.round(ch * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  instance.dpr = dpr;

  readColours(instance);

  // One lattice cell, drawn once in device pixels: the resting dot at its
  // centre. drawField() fills the canvas with it.
  const tile = document.createElement("canvas");
  const size = Math.max(1, Math.round(instance.spacing * dpr));
  tile.width = tile.height = size;
  const tctx = tile.getContext("2d");
  tctx.fillStyle = instance.farStyle;
  tctx.beginPath();
  tctx.arc(size / 2, size / 2, instance.rMin * dpr, 0, TAU);
  tctx.fill();
  instance.pattern = ctx.createPattern(tile, "repeat");
  instance.pattern.setTransform(new DOMMatrix([1 / dpr, 0, 0, 1 / dpr, -instance.spacing / 2, -instance.spacing / 2]));
  instance.dirty = true;
}

/**
 * Draws the slice of the page-wide lattice that this canvas covers.
 *
 * The resting field is one pattern fill. Inside the cursor's reach the dots
 * are drawn by hand as NEAR_STEPS paths, one per band of influence — a fill
 * can only carry one colour, and the banding is invisible because radius
 * still varies smoothly across the band boundaries.
 *
 * @param originY page-space y of this canvas's top edge, parallax applied
 */
/** Where the cursor sits in this canvas's own (overhung, shifted) space. */
function cursorLocal(instance) {
  return {
    cx: cursor.x - instance.rectLeft - instance.ox,
    cy: cursor.y - instance.rectTop - instance.slide - instance.oy,
  };
}

function bloomReaches(instance) {
  if (!cursor.seen) return false;
  const { cx, cy } = cursorLocal(instance);
  return cy > -REACH && cy < instance.ch + REACH && cx > -REACH && cx < instance.cw + REACH;
}

function drawField(instance) {
  const { ctx, cw: w, ch: h, spacing, rMin, rMax } = instance;
  // Dots sit on whole cells of the canvas's own space; render() moves the
  // canvas so those cells land on the page-wide lattice.
  const startX = 0;
  const startY = 0;

  // The resting field: one fill with a pre-drawn dot tile.
  ctx.fillStyle = instance.pattern;
  ctx.fillRect(0, 0, w, h);

  // The bloom is a viewport thing — it follows the pointer on screen, so it
  // is NOT offset by parallax.
  if (!bloomReaches(instance)) return;
  const { cx, cy } = cursorLocal(instance);

  // The bloom: clear the cursor's reach out of the resting field and draw
  // just those dots by hand — swollen, tinted and shoved away from it.
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, REACH - 2, 0, TAU);
  ctx.clip();
  ctx.clearRect(cx - REACH, cy - REACH, REACH * 2, REACH * 2);
  ctx.restore();

  const reach2 = REACH * REACH;
  const swell = rMax - rMin;
  const near = instance.nearStyle.map(() => new Path2D());
  const y0 = startY + Math.max(0, Math.ceil((cy - REACH - startY) / spacing)) * spacing;
  const x0 = startX + Math.max(0, Math.ceil((cx - REACH - startX) / spacing)) * spacing;

  for (let y = y0; y <= cy + REACH && y < h + spacing; y += spacing) {
    const dy = y - cy;
    const dy2 = dy * dy;
    for (let x = x0; x <= cx + REACH && x < w + spacing; x += spacing) {
      const dx = x - cx;
      const d2 = dx * dx + dy2;
      if (d2 >= reach2) continue;
      // 1 at the cursor, 0 at the edge of reach, squared so the bloom has a
      // soft shoulder instead of a visible circular rim.
      const t = 1 - d2 / reach2;
      const r = rMin + swell * t * t;
      // Shove the dot directly away from the cursor, so the lattice opens up
      // around the pointer rather than sliding sideways.
      const d = Math.sqrt(d2);
      const shove = d > 0.001 ? (PUSH * t * t) / d : 0;
      const px = x + dx * shove;
      const py = y + dy * shove;
      const band = near[Math.min(NEAR_STEPS - 1, (t * NEAR_STEPS) | 0)];
      band.moveTo(px + r, py);
      band.arc(px, py, r, 0, TAU);
    }
  }

  for (let i = 0; i < near.length; i++) {
    ctx.fillStyle = instance.nearStyle[i];
    ctx.fill(near[i]);
  }
}

/**
 * Reads `rect` rather than measuring it: with a dozen-plus canvases and
 * six to eight of them typically near the viewport at once on the taller
 * stretches of the page, calling getBoundingClientRect() from inside this
 * function — interleaved with the canvas.width and canvas.style.transform
 * writes below — was forcing a synchronous layout on every single one of
 * them. draw() now reads every host's rect in one batched pass before any
 * instance writes anything, which is the difference between one reflow per
 * frame and one per canvas per frame.
 */
function render(instance, rect) {
  const viewportH = window.innerHeight;

  // One viewport of headroom either side: enough that a canvas is always
  // allocated and drawn before it can be seen, without holding memory for
  // sections that are nowhere near.
  const near = rect.bottom > -viewportH && rect.top < viewportH * 2;

  if (!near) { release(instance); return; }
  if (!instance.live) { measure(instance, rect); instance.live = true; }

  const { ctx, canvas, h, hostH, spacing } = instance;

  // Slide the drawing window down the section so it stays over the viewport.
  const slide = Math.max(0, Math.min(-rect.top - VIEW_PAD, hostH - h));

  // Kept for the cursor's local-space conversion inside drawField().
  instance.rectLeft = rect.left;
  instance.rectTop = rect.top;
  // A host can slide its own slice of the field sideways (the projects
  // ribbon does, so the dots travel with the cards): host.particleShiftX,
  // in CSS px, moves the lattice phase left by that much.
  instance.left = rect.left + window.scrollX + (instance.host.particleShiftX || 0);

  // Page-space y of this canvas's top edge, minus the parallax lag. Because
  // every canvas subtracts the same lag from the same page axis, the field
  // stays continuous across section seams while it drifts.
  const pageTop = rect.top + window.scrollY + slide;
  // A pinned host can hold its dots still vertically while it is pinned:
  // host.particleHoldY is how far the page has scrolled through the pin, and
  // the field is moved back up by exactly the distance that scroll carried it.
  const originY = pageTop - window.scrollY * PARALLAX
    - (instance.host.particleHoldY || 0) * (1 - PARALLAX);

  // Lattice phase: where the first column/row inside this window falls,
  // solved from page coordinates so the section next door lands on the same
  // lines. The canvas is drawn once on whole cells and moved back by the
  // phase — scrolling, the parallax drift and the sideways slides are all a
  // composited transform. It used to clear and refill two to four
  // viewport-sized 2× canvases on every scroll frame, the largest single
  // cost on the page, and far worse on a phone.
  const startX = Math.ceil(instance.left / spacing) * spacing - instance.left;
  const startY = Math.ceil(originY / spacing) * spacing - originY;
  const ox = startX - spacing;
  const oy = startY - spacing;
  if (slide !== instance.slide || Math.abs(ox - instance.ox) > 0.05 || Math.abs(oy - instance.oy) > 0.05) {
    instance.slide = slide;
    instance.ox = ox;
    instance.oy = oy;
    canvas.style.transform = `translate3d(${ox.toFixed(2)}px, ${(slide + oy).toFixed(2)}px, 0)`;
  }

  // Repaint only when the bloom is on this canvas, or has just left it.
  const bloom = bloomReaches(instance);
  if (!instance.dirty && !bloom && !instance.bloomed) return;
  instance.dirty = false;
  instance.bloomed = bloom;
  ctx.clearRect(0, 0, instance.cw, instance.ch);
  drawField(instance);
}

const draw = () => {
  // Read phase: every host's box, before any instance below is allowed to
  // touch a style or a canvas attribute. See render()'s doc comment.
  const rects = instances.map((instance) => instance.host.getBoundingClientRect());
  const pins = instances.map((instance) => instance.pin?.getBoundingClientRect() || null);
  // Write phase.
  instances.forEach((instance, i) => {
    const pin = pins[i];
    const media = instance.pin?.particlesMedia;
    if (pin && (!media || window.matchMedia(media).matches)) {
      // How far the page has scrolled through the pin, and what share of it.
      const travel = Math.max(1, pin.height - window.innerHeight);
      const hold = Math.min(travel, Math.max(0, -pin.top));
      instance.host.particleHoldY = hold;
      const slide = instance.pin.particlesSlide;
      instance.host.particleShiftX = (hold / travel) * window.innerWidth * slide;
    }
    render(instance, rects[i]);
  });
};

/**
 * Walks the bloom toward the pointer one frame at a time and stops as soon as
 * it gets there. Nothing animates while the page and the pointer are both
 * still — the loop is not a permanent ticker.
 */
function chase() {
  const dx = cursor.targetX - cursor.x;
  const dy = cursor.targetY - cursor.y;

  cursor.x += dx * EASE;
  cursor.y += dy * EASE;

  draw();

  if (Math.abs(dx) < SETTLED && Math.abs(dy) < SETTLED) {
    cursor.x = cursor.targetX;
    cursor.y = cursor.targetY;
    frame = null;
    return;
  }

  frame = requestAnimationFrame(chase);
}

function startChase() {
  if (frame === null) frame = requestAnimationFrame(chase);
}

export function init(root = document) {
  const canvases = root.querySelectorAll("[data-particles]");
  if (!canvases.length) return () => {};

  // No measuring here. render() allocates a canvas the first time it comes
  // within a viewport of the screen and frees it again when it leaves, so
  // steady-state memory is whatever is actually on screen rather than the
  // whole page at once.
  instances = Array.from(canvases).map(build);
  draw();

  // The resting field is still worth drawing without motion — it is part of
  // the visual language, not an animation. Only the drift and the bloom stop.
  if (!motionAllowed()) return destroy;

  unsubscribe = onScroll(draw);

  // Coarse pointers get the field and the parallax but no bloom: there is no
  // hover on a touchscreen, and a bloom pinned to the last tap is just a
  // smudge the visitor cannot clear.
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    onPointerMove = (event) => {
      cursor.targetX = event.clientX;
      cursor.targetY = event.clientY;

      // First sighting: land the bloom rather than flying it in from the
      // corner it was parked in.
      if (!cursor.seen) {
        cursor.seen = true;
        cursor.x = event.clientX;
        cursor.y = event.clientY;
      }

      startChase();
    };

    onPointerLeave = () => {
      cursor.seen = false;
      draw();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);
  }

  onResize = () => {
    // Drop every buffer and let the next frame re-allocate only what is near.
    instances.forEach(release);
    draw();
  };
  window.addEventListener("resize", onResize, { passive: true });

  return destroy;
}

/** Redraw now — for a host that changed its particleShiftX between scrolls. */
export function refresh() {
  if (instances.length) draw();
}

export function destroy() {
  unsubscribe?.();
  if (frame !== null) cancelAnimationFrame(frame);
  if (onResize) window.removeEventListener("resize", onResize);
  if (onPointerMove) window.removeEventListener("pointermove", onPointerMove);
  if (onPointerLeave) document.removeEventListener("pointerleave", onPointerLeave);

  instances.forEach(release);
  instances.forEach(({ canvas, clip }) => { clip.replaceWith(canvas); canvas.style.width = ""; });
  instances = [];
  unsubscribe = null;
  onResize = null;
  onPointerMove = null;
  onPointerLeave = null;
  frame = null;
  cursor.seen = false;
}
