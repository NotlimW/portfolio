/**
 * reveal.js — sets data-inview as elements arrive, and animates headlines.
 *
 *   data-reveal="fade" | "stagger" | "media"   CSS transitions keyed on
 *                                             data-inview
 *   data-reveal="lines"                        each line swings up on a
 *                                             spring (Motion); CSS can't
 *                                             express a spring
 *
 * The hidden start state is applied by script, so if this module never
 * runs the content simply shows. Elements reveal once and stay revealed.
 */

import { animate, inView, stagger } from "../vendor.js";
import { prefersReducedMotion } from "./motion-prefs.js";

const cleanups = [];

/** Spring, not a curve. Tuned to settle in ~0.7s without visible wobble. */
const SPRING = { type: "spring", stiffness: 82, damping: 17, mass: 1 };

/**
 * Writes a positional index onto children so CSS can compute its own stagger
 * delay. Beats an nth-child ladder: adding a card needs no CSS.
 */
function indexChildren(el) {
  Array.from(el.children).forEach((child, i) => {
    child.style.setProperty("--i", String(i));
  });
}

const linesOf = (el) => Array.from(el.querySelectorAll(":scope > .line > span"));

/* How far below its mask a line waits. */
const PARKED = "translateY(135%)";

/** Park the lines below their mask, tilted. Read from the token, not hardcoded. */
function prime(el) {
  const skew = getComputedStyle(el).getPropertyValue("--reveal-skew").trim() || "0deg";
  linesOf(el).forEach((line) => {
    line.style.transform = `${PARKED} rotate(${skew})`;
  });
}

function play(el) {
  const lines = linesOf(el);
  if (!lines.length) return;

  animate(
    lines,
    { transform: [`${PARKED} rotate(var(--reveal-skew))`, "translateY(0%) rotate(0deg)"] },
    { ...SPRING, delay: stagger(0.075) }
  );
}

export function init(root = document) {
  const reduced = prefersReducedMotion();
  const elements = root.querySelectorAll("[data-reveal]");

  elements.forEach((el) => {
    const mode = el.dataset.reveal;

    if (mode === "stagger") indexChildren(el);

    // Prime before observing, so a heading that is already on screen still
    // animates in rather than snapping to its end state.
    if (mode === "lines" && !reduced) prime(el);

    // One-way: the observer is dropped the first time the element is seen,
    // so scrolling back up past it never plays the entrance again.
    let stop = null;
    stop = inView(
      el,
      () => {
        if (el.dataset.inview === "true") return;
        el.dataset.inview = "true";
        if (mode === "lines" && !reduced) play(el);
        queueMicrotask(() => stop?.());
      },
      // Start near the edge, so content has settled by the time it reaches
      // the middle of the screen, which is where it gets read.
      { margin: "0px 0px -4% 0px" }
    );

    cleanups.push(stop);
  });

  return destroy;
}

/** Called by split.js after a re-split, since the line spans are new elements. */
export function refresh(el) {
  if (prefersReducedMotion()) return;
  if (el.dataset.inview === "true") {
    linesOf(el).forEach((line) => { line.style.transform = ""; });
  } else {
    prime(el);
  }
}

export function destroy() {
  cleanups.forEach((stop) => stop());
  cleanups.length = 0;
}
