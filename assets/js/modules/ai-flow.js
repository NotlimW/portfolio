/**
 * ai-flow.js — the AI drawings follow the scroll instead of playing once.
 *
 * Each [data-ai-flow] stage gets, every frame while it is on screen:
 *   --p     0 when it enters at the bottom, 1 when it has left at the top,
 *           eased toward the scroll so the drawings trail the page slightly.
 *   --v     scroll velocity, smoothed, -1…1 — for lean and stretch.
 *   --run   an ever-growing drive: a slow idle tick plus every pixel
 *           scrolled. Currents, dials and the reel move by it, so they
 *           idle on their own and race when you scroll.
 *   --loop, --loop2   --run folded to 0…100 at two speeds, for the reel.
 * --p is set on the stage (most of the drawing reads it); the others are
 * set only on the few elements that read them, and nothing is written
 * unless it has changed — each write re-resolves styles for the whole
 * subtree under it, which on these SVGs was most of the frame.
 * Everything else is CSS reading these; see components/ai.css.
 *
 * Without this module (or under reduced motion) --p stays at its CSS
 * default of 1, the rest at 0: the drawings are complete and still.
 */

import { motionAllowed, isTouch } from "./motion-prefs.js";

const EASE = 0.07;       // how fast --p catches up with the scroll
const IDLE = 0.06;       // drive per millisecond when nothing scrolls
const PUSH = 1.4;        // drive per pixel scrolled

let items = [];
let observer = null;
let frame = 0;
let last = 0;
let lastY = 0;
let v = 0;

const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

function progress(el) {
  const vh = window.innerHeight;
  const r = el.getBoundingClientRect();
  return clamp((vh - r.top) / (vh + r.height), 0, 1);
}

/** Set a custom property only when it has changed by more than `min`. */
function write(el, memo, name, value, digits, min) {
  const key = "_" + name;
  if (memo[key] !== undefined && Math.abs(value - memo[key]) < min) return;
  memo[key] = value;
  el.style.setProperty(name, value.toFixed(digits));
}

function tick(now) {
  frame = 0;
  const dt = Math.min(64, now - (last || now));
  last = now;

  const y = window.scrollY;
  const dy = y - lastY;
  lastY = y;
  v += (clamp(dy / 30, -1, 1) - v) * 0.08;

  let any = false;
  // All reads before any write (see scene.js).
  const targets = items.map((item) => (item.visible ? progress(item.el) : 0));
  items.forEach((item, i) => {
    if (!item.visible) return;
    any = true;
    item.p += (targets[i] - item.p) * EASE;
    // Scroll drives --run; the idle tick only drives the reel's loop, which
    // is plain HTML and moves on the compositor. An idle tick on the SVG
    // marks repainted a full-width drawing every frame with nobody scrolling.
    item.run += Math.abs(dy) * PUSH;
    item.idle = (item.idle || 0) + dt * IDLE;

    // Every write to a custom property re-resolves styles for everything
    // under the element it is set on — on these stages, a couple of hundred
    // SVG nodes. So: --p (which most of the drawing reads) only when it has
    // actually moved, and the rest only on the few elements that use them.
    write(item.el, item, "--p", item.p, 4, 0.0008);
    item.vEls.forEach((el) => write(el, el, "--v", v, 3, 0.002));
    item.runEls.forEach((el) => write(el, el, "--run", item.run, 1, 0.5));
    item.loopEls.forEach((el) => {
      const loop = item.run + item.idle;
      write(el, el, "--loop", (loop * 0.024) % 100, 3, 0.01);
      write(el, el, "--loop2", (loop * 0.018) % 100, 3, 0.01);
    });
  });

  if (any) frame = requestAnimationFrame(tick);
}

function wake() {
  if (!frame) {
    last = 0;
    lastY = window.scrollY;
    frame = requestAnimationFrame(tick);
  }
}

export function init(root = document) {
  // Touch: the drawings show complete and still. Every value written here
  // re-resolves styles for a few hundred SVG nodes, and on a phone that was
  // the heaviest thing in the AI section.
  if (!motionAllowed() || isTouch()) return () => {};

  items = Array.from(root.querySelectorAll("[data-ai-flow]")).map((el) => ({
    el,
    p: progress(el),   // start where the page already is
    run: 0,
    visible: false,
    // The only elements that read --v, --run and --loop (components/ai.css).
    vEls: Array.from(el.querySelectorAll(":scope > .ai-fig, .ai-reel__tilt")),
    runEls: Array.from(el.querySelectorAll(".ai-dialface, .ai-flowdash")),
    loopEls: Array.from(el.querySelectorAll(".ai-reel__row")),
  }));
  if (!items.length) return () => {};

  items.forEach((item) => item.el.style.setProperty("--p", item.p.toFixed(4)));

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const item = items.find((i) => i.el === entry.target);
      if (item) item.visible = entry.isIntersecting;
    });
    wake();
  }, { rootMargin: "20% 0px" });
  items.forEach((item) => observer.observe(item.el));

  return destroy;
}

export function destroy() {
  observer?.disconnect();
  observer = null;
  cancelAnimationFrame(frame);
  frame = 0;
  items.forEach((item) => {
    item.el.style.removeProperty("--p");
    [...item.vEls, ...item.runEls, ...item.loopEls].forEach((el) =>
      ["--v", "--run", "--loop", "--loop2"].forEach((k) => el.style.removeProperty(k)));
  });
  items = [];
}
