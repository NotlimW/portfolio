/**
 * reveal.js — when things arrive, and how the headlines do it.
 *
 * Two mechanisms, split on purpose:
 *
 *   fade / stagger  stay in CSS. They are cheap, there are a lot of them, and
 *                   a transition token is the right place to tune them from.
 *                   This module only sets data-inview and gets out of the way.
 *
 *   lines           are animated here, with Motion, on a spring. This is the
 *                   site's signature entrance and it is the one place where a
 *                   spring earns its cost: a cubic-bezier arrives at its end
 *                   value and stops dead, where a spring settles. On a line of
 *                   display type that difference is the whole effect — the
 *                   type reads as having weight rather than as having been
 *                   moved. CSS has no spring, so this cannot be a token.
 *
 * The hidden starting state is applied by JavaScript rather than by CSS, and
 * that is deliberate: if this module never runs — a slow CDN, a blocked
 * script — the headings simply render as headings. Nothing is ever hidden by
 * a stylesheet waiting for a script that may not arrive.
 *
 * Elements reveal once and stay revealed. Replaying on every scroll-past
 * looks clever for ten seconds and irritating for the rest of the visit.
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

/* How far below its mask a line waits. Not 110%: the masks are padded so
   ascenders and descenders survive, and at 110% the tops of the letters
   showed in that padding before the line had moved. motion.css parks the
   lines at the same offset before this script runs. */
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
      // Was -12%, which held everything back until it was well inside the
      // viewport — so on a fast scroll the page was always a beat behind you.
      // Starting nearer the edge means content is settled by the time it is
      // in the middle of the screen, which is where it gets read.
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
