/**
 * thread.js — the process thread is drawn as you follow it.
 *
 * Every step of the process carries a wireframe scene with a stretch of
 * one yellow line through it ([data-thread]). This writes --d (0…1) on each
 * scene: how far its stretch of the line has been drawn. On the pinned
 * horizontal track (desktop) that is how far the scene has travelled past
 * a point a little right of centre, so the line is always being drawn just
 * ahead of where you are looking; stacked (below 64rem) it is the same idea
 * vertically. The value eases toward its target so the line flows rather
 * than ticks. Under reduced motion this does not run and the CSS default
 * (--d: 1) shows every scene complete.
 */

import { onScroll } from "./smooth-scroll.js";
import { motionAllowed } from "./motion-prefs.js";

const EASE = 0.12;

let items = [];
let frame = 0;
let unsubscribe = null;

const clamp01 = (n) => Math.min(1, Math.max(0, n));
const horizontal = () => window.matchMedia("(min-width: 64rem)").matches;

function target(el) {
  const r = el.getBoundingClientRect();
  // The drawing point sits a little right of centre, and slides on toward
  // the far edge over the last stretch of the pinned track, so the last
  // scene finishes drawing before the track lets go.
  const p = parseFloat(el.closest("[data-scene]")?.style.getPropertyValue("--progress")) || 0;
  return horizontal()
    ? clamp01((window.innerWidth * (0.6 + 0.6 * p * p * p) - r.left) / r.width)
    : clamp01((window.innerHeight * 0.8 - r.top) / r.height);
}

function tick() {
  frame = 0;
  let moving = false;
  // All reads before any write (see scene.js).
  const targets = items.map((item) => target(item.el));
  items.forEach((item, i) => {
    const t = targets[i];
    const d = t - item.d;
    if (Math.abs(d) < 0.001) {
      if (item.d === t) return;
      item.d = t;
    } else {
      item.d += d * EASE;
      moving = true;
    }
    item.el.style.setProperty("--d", item.d.toFixed(4));
  });
  if (moving) frame = requestAnimationFrame(tick);
}

const kick = () => { if (!frame) frame = requestAnimationFrame(tick); };

export function init(root = document) {
  if (!motionAllowed()) return () => {};
  items = Array.from(root.querySelectorAll("[data-thread]")).map((el) => ({ el, d: 0 }));
  if (!items.length) return () => {};

  items.forEach((item) => {
    item.d = target(item.el);
    item.el.style.setProperty("--d", item.d.toFixed(4));
  });

  unsubscribe = onScroll(kick);
  window.addEventListener("resize", kick);
  return destroy;
}

export function destroy() {
  unsubscribe?.();
  unsubscribe = null;
  window.removeEventListener("resize", kick);
  cancelAnimationFrame(frame);
  frame = 0;
  items.forEach(({ el }) => el.style.removeProperty("--d"));
  items = [];
}
