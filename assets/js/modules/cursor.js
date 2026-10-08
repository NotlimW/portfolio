/**
 * cursor.js — move 06: the accent pointer, and magnetic primary actions.
 *
 * Strictly additive. The native cursor is never hidden, so nothing is lost
 * if this fails to load, and the whole module opts out on touch devices and
 * for anyone who prefers reduced motion.
 *
 * Position is interpolated in a rAF loop rather than written on every
 * pointermove, which is what keeps the dot feeling weighted instead of
 * nailed to the pointer. The gap between where the pointer is and where the
 * dot has got to is also the velocity signal — the dot stretches along it,
 * so speed deforms the shape instead of just moving it.
 *
 * The pointer also reports two things back to CSS that it is uniquely
 * placed to know: which ground it is currently floating over, and what kind
 * of thing is under it. Both are written as data attributes; every visual
 * decision that follows from them lives in components/motion.css.
 */

import { hasFinePointer, motionAllowed } from "./motion-prefs.js";

let root = null;
let dot = null;
let label = null;
let rafId = null;
let target = { x: 0, y: 0 };
let current = { x: 0, y: 0 };
let squash = 0;
const magnets = [];

const EASE = 0.18;
/** Pointer speed, in px per frame, at which the stretch is fully applied. */
const SPEED_CAP = 70;

/** The dot sits up and to the right of the real pointer, not on top of it —
    otherwise it just hides the thing it's meant to accent. */
const OFFSET_X = 10;
const OFFSET_Y = -10;

/**
 * What the thing under the pointer actually does. Derived rather than
 * authored, so no markup has to carry a label and nothing can go stale when
 * a link's destination changes. `data-cursor-label` overrides it where a
 * specific word is worth the attribute.
 */
function labelFor(node) {
  const explicit = node.closest("[data-cursor-label]");
  if (explicit) return explicit.dataset.cursorLabel;

  if (node.closest("[data-menu-toggle]")) return "Menu";

  const link = node.closest("a[href]");
  if (link) {
    const href = link.getAttribute("href") ?? "";
    if (href.startsWith("mailto:")) return "Write";
    if (link.target === "_blank" || /^https?:/i.test(href)) return "Visit";
    if (href.startsWith("#")) return "Go";
    if (href.includes("work/")) return "Case";
    return "Open";
  }

  return node.closest("button") ? "Press" : "";
}

function loop() {
  const dx = target.x - current.x;
  const dy = target.y - current.y;

  current.x += dx * EASE;
  current.y += dy * EASE;

  root.style.transform =
    `translate3d(${current.x.toFixed(2)}px, ${current.y.toFixed(2)}px, 0)`;

  // Stretch along the direction of travel and thin across it, so the dot
  // keeps roughly the same area however fast it is moving.
  const speed = Math.min(Math.hypot(dx, dy) / SPEED_CAP, 1);
  const amount = speed * squash;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  dot.style.transform =
    `translate(-50%, -50%) rotate(${angle.toFixed(1)}deg) ` +
    `scale(${(1 + amount).toFixed(3)}, ${(1 - amount * 0.6).toFixed(3)})`;

  // Sleep once the dot has caught the pointer; pointermove wakes it.
  rafId = Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05 ? requestAnimationFrame(loop) : 0;
}

function onPointerMove(event) {
  target.x = event.clientX + OFFSET_X;
  target.y = event.clientY + OFFSET_Y;
  // First sighting (page load, or the pointer coming back into the window):
  // land on the pointer instead of easing in from wherever the dot was
  // parked — at load that was the top-left corner.
  if (root.dataset.active !== "true") {
    current.x = target.x;
    current.y = target.y;
    root.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
  }
  if (!rafId) rafId = requestAnimationFrame(loop);
  root.dataset.active = "true";

  const node = event.target;
  if (!(node instanceof Element)) return;
  const text = labelFor(node);
  root.dataset.hover = String(Boolean(node.closest("a, button, [data-cursor-hover]")));
  root.dataset.labelled = String(Boolean(text));
  if (text && label.textContent !== text) label.textContent = text;

  // An open curtain is a dark surface that sits outside every [data-ground].
  const ground = document.documentElement.classList.contains("is-menu-open")
    ? "dark"
    : node.closest("[data-ground]")?.dataset.ground ?? "light";

  if (root.dataset.ground !== ground) root.dataset.ground = ground;
}

const onPointerLeave = () => { root.dataset.active = "false"; };

function bindMagnet(el) {
  const strength = Number(el.dataset.magnetic) || null;

  const onMove = (event) => {
    // Read per-move so the pull is live: the token drops to 0 under reduced
    // motion, and this module can be running when that preference changes.
    // `??` and `||` cannot be mixed without parentheses — that is a syntax
    // error, not a precedence quirk, and it takes the whole module graph down.
    const pull = strength ?? (parseFloat(
      getComputedStyle(el).getPropertyValue("--magnet")
    ) || 0);

    const rect = el.getBoundingClientRect();
    const x = (event.clientX - (rect.left + rect.width / 2)) * pull;
    const y = (event.clientY - (rect.top + rect.height / 2)) * pull;
    el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
  };

  const onLeave = () => { el.style.transform = ""; };

  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerleave", onLeave);
  magnets.push({ el, onMove, onLeave });
}

/** Build the three parts the CSS expects. */
function build(host) {
  host.replaceChildren();

  const ring = document.createElement("span");
  ring.className = "cursor__ring";

  dot = document.createElement("span");
  dot.className = "cursor__dot";

  label = document.createElement("span");
  label.className = "cursor__label";

  host.append(ring, dot, label);
}

export function init(scope = document) {
  if (!hasFinePointer() || !motionAllowed()) return () => {};

  root = scope.querySelector("[data-cursor]");
  if (!root) return () => {};

  build(root);
  squash = parseFloat(
    getComputedStyle(root).getPropertyValue("--cursor-squash")
  ) || 0;

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("pointerleave", onPointerLeave);

  scope.querySelectorAll("[data-magnetic]").forEach(bindMagnet);

  return destroy;
}

export function destroy() {
  if (rafId) cancelAnimationFrame(rafId);
  window.removeEventListener("pointermove", onPointerMove);
  document.removeEventListener("pointerleave", onPointerLeave);

  magnets.forEach(({ el, onMove, onLeave }) => {
    el.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerleave", onLeave);
    el.style.transform = "";
  });
  magnets.length = 0;

  root?.replaceChildren();
  rafId = null;
  root = dot = label = null;
}
