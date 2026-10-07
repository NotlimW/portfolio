/**
 * giants.js — the bleed words respond to the pointer and to the scroll.
 *
 * Two effects, both borrowed in spirit from the variable-font and
 * scroll-velocity components on 21st.dev and rebuilt here without React:
 *
 *   Proximity  Each giant is split into letters. Letters near the pointer
 *              swell along Bricolage's width axis (wdth 82 → 100), with a
 *              gaussian falloff, so the word bulges where you point at it
 *              and settles back when you leave. Width, not weight: the
 *              giants are already ExtraBold, and a wider ink-trap letter
 *              shows its traps better.
 *   Velocity   Scroll speed leans the giants (skewX) and lags them a little
 *              behind the page, then springs them upright. The page feels
 *              like it has mass instead of sliding under glass.
 *
 * Letters are written through font-variation-settings inline; the lean is
 * a CSS custom property on the container (--skew), applied in poster.css.
 * Both are skipped entirely under reduced motion.
 */

import { onScroll } from "./smooth-scroll.js";
import { motionAllowed, hasFinePointer } from "./motion-prefs.js";

const WDTH_REST = 82;
const WDTH_PEAK = 100;
const FALLOFF = 0.55;      // gaussian radius, in em of the giant
const EASE = 0.14;
const SKEW_PER_VELOCITY = 0.18;
const SKEW_MAX = 9;

let giants = [];
let pointer = { x: -1e4, y: -1e4 };
let skew = 0;
let skewTarget = 0;
let frame = 0;
let unsubscribe = null;

function split(word) {
  // Already split in the markup (the hero does this so its entrance can
  // stagger the letters): reuse those spans rather than rebuilding them.
  const existing = word.querySelectorAll(":scope > .g");
  if (existing.length) {
    return Array.from(existing).map((el) => ({ el, wdth: WDTH_REST, kept: true }));
  }
  const text = word.textContent;
  word.textContent = "";
  return Array.from(text).map((char) => {
    const span = document.createElement("span");
    span.className = "g";
    span.textContent = char;
    word.append(span);
    return { el: span, wdth: WDTH_REST };
  });
}

/*
 * The loop only runs while something is moving: the lean settling, or
 * letters easing toward the pointer. It reads layout (font size, letter
 * boxes) only when the pointer has moved or letters are still easing, and
 * writes --skew only when it changes. A loop that read and wrote layout on
 * every frame for every visible giant, forever, was a steady cost on the
 * whole page even with nothing happening.
 */
let pointerDirty = false;

function wake() {
  if (!frame) frame = requestAnimationFrame(tick);
}

function tick() {
  frame = 0;
  let busy = false;

  skew += (skewTarget - skew) * 0.12;
  skewTarget *= 0.9;
  if (Math.abs(skew) > 0.01 || Math.abs(skewTarget) > 0.01) busy = true;
  else { skew = 0; skewTarget = 0; }

  giants.forEach((giant) => {
    if (!giant.visible) return;

    const lean = skew.toFixed(2);
    if (giant.lean !== lean) {
      giant.lean = lean;
      giant.box.style.setProperty("--skew", `${lean}deg`);
    }

    if (!giant.letters.length || (!pointerDirty && !giant.easing)) return;

    const size = parseFloat(getComputedStyle(giant.word).fontSize);
    const radius = size * FALLOFF;
    const rect = giant.word.getBoundingClientRect();
    const inBand = pointer.y > rect.top - radius && pointer.y < rect.bottom + radius;

    giant.easing = false;
    giant.letters.forEach((letter) => {
      let target = WDTH_REST;
      if (inBand) {
        const r = letter.el.getBoundingClientRect();
        const dx = pointer.x - (r.left + r.width / 2);
        const dy = pointer.y - (r.top + r.height / 2);
        const w = Math.exp(-(dx * dx + dy * dy) / (2 * radius * radius));
        target = WDTH_REST + (WDTH_PEAK - WDTH_REST) * w;
      }
      if (Math.abs(target - letter.wdth) < 0.05) return;
      letter.wdth += (target - letter.wdth) * EASE;
      letter.el.style.fontVariationSettings = `"opsz" 12, "wdth" ${letter.wdth.toFixed(1)}`;
      giant.easing = true;
    });
    if (giant.easing) busy = true;
  });

  pointerDirty = false;
  if (busy) frame = requestAnimationFrame(tick);
}

const onPointer = (e) => { pointer.x = e.clientX; pointer.y = e.clientY; pointerDirty = true; wake(); };

export function init(root = document) {
  if (!motionAllowed()) return () => {};

  const boxes = Array.from(root.querySelectorAll("[data-fit]"));
  if (!boxes.length) return () => {};

  giants = boxes.map((box) => {
    const word = box.querySelector(".t-bleed");
    return { box, word, letters: hasFinePointer() ? split(word) : [], visible: false };
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const giant = giants.find((g) => g.box === entry.target);
      if (giant) giant.visible = entry.isIntersecting;
    });
    wake();
  });
  giants.forEach((g) => observer.observe(g.box));

  unsubscribe = onScroll(({ velocity }) => {
    const v = Math.max(-SKEW_MAX, Math.min(SKEW_MAX, (velocity || 0) * SKEW_PER_VELOCITY));
    if (Math.abs(v) > Math.abs(skewTarget)) skewTarget = v;
    wake();
  });

  if (hasFinePointer()) window.addEventListener("pointermove", onPointer, { passive: true });
  wake();

  return () => {
    observer.disconnect();
    destroy();
  };
}

export function destroy() {
  cancelAnimationFrame(frame);
  frame = 0;
  unsubscribe?.();
  unsubscribe = null;
  window.removeEventListener("pointermove", onPointer);
  giants.forEach(({ box, word, letters }) => {
    box.style.removeProperty("--skew");
    if (letters.length && !letters[0].kept) word.textContent = letters.map((l) => l.el.textContent).join("");
  });
  giants = [];
}
