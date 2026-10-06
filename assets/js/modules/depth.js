/**
 * depth.js — the hero cover has thickness.
 *
 * Every layer inside the hero carries data-depth (negative = further back,
 * moves against the pointer; positive = closer, moves with it). This module
 * eases the pointer's position into --px / --py on the hero (-1…1 from the
 * centre of the viewport) and writes each layer's depth as --d. hero.css
 * turns the two into a translate, so the layers slide past each other and
 * the cover reads as a stack: word, sun, figure, word, glass.
 *
 * Fine pointers only, and nothing at all under reduced motion.
 */

import { motionAllowed, hasFinePointer } from "./motion-prefs.js";

const EASE = 0.06;

let host = null;
let frame = 0;
const pos = { x: 0, y: 0, tx: 0, ty: 0 };

function onPointer(e) {
  pos.tx = (e.clientX / window.innerWidth) * 2 - 1;
  pos.ty = (e.clientY / window.innerHeight) * 2 - 1;
}

function tick() {
  frame = requestAnimationFrame(tick);
  pos.x += (pos.tx - pos.x) * EASE;
  pos.y += (pos.ty - pos.y) * EASE;
  host.style.setProperty("--px", pos.x.toFixed(4));
  host.style.setProperty("--py", pos.y.toFixed(4));
}

export function init(root = document) {
  host = root.querySelector("[data-hero]");
  if (!host || !motionAllowed() || !hasFinePointer()) return () => {};

  host.querySelectorAll("[data-depth]").forEach((el) => {
    el.style.setProperty("--d", el.dataset.depth);
  });

  window.addEventListener("pointermove", onPointer, { passive: true });
  frame = requestAnimationFrame(tick);
  return destroy;
}

export function destroy() {
  cancelAnimationFrame(frame);
  window.removeEventListener("pointermove", onPointer);
  host?.style.removeProperty("--px");
  host?.style.removeProperty("--py");
  host = null;
}
