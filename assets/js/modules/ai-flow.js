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
 * Everything else is CSS reading these; see components/ai.css.
 *
 * Without this module (or under reduced motion) --p stays at its CSS
 * default of 1, the rest at 0: the drawings are complete and still.
 */

import { motionAllowed } from "./motion-prefs.js";

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

function tick(now) {
  frame = 0;
  const dt = Math.min(64, now - (last || now));
  last = now;

  const y = window.scrollY;
  const dy = y - lastY;
  lastY = y;
  v += (clamp(dy / 30, -1, 1) - v) * 0.08;

  let any = false;
  items.forEach((item) => {
    if (!item.visible) return;
    any = true;
    item.p += (progress(item.el) - item.p) * EASE;
    item.run += dt * IDLE + Math.abs(dy) * PUSH;
    const st = item.el.style;
    st.setProperty("--p", item.p.toFixed(4));
    st.setProperty("--v", v.toFixed(3));
    st.setProperty("--run", item.run.toFixed(1));
    st.setProperty("--loop", ((item.run * 0.024) % 100).toFixed(3));
    st.setProperty("--loop2", ((item.run * 0.018) % 100).toFixed(3));
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
  if (!motionAllowed()) return () => {};

  items = Array.from(root.querySelectorAll("[data-ai-flow]")).map((el) => ({
    el,
    p: progress(el),   // start where the page already is
    run: 0,
    visible: false,
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
  items.forEach(({ el }) => ["--p", "--v", "--run", "--loop", "--loop2"].forEach((k) => el.style.removeProperty(k)));
  items = [];
}
