/**
 * statement.js — move 02: words light up against scroll position.
 *
 * Splitting is done here rather than in the HTML so the source stays a
 * readable paragraph: better for screen readers, search engines, and anyone
 * editing the copy later. The wrapper keeps the original sentence as its
 * accessible name, so assistive tech reads it as one sentence, not 40 words.
 */

import { onScroll } from "./smooth-scroll.js";
import { prefersReducedMotion } from "./motion-prefs.js";

let unsubscribe = null;

function split(el) {
  const text = el.textContent.trim();
  el.setAttribute("aria-label", text);

  const fragment = document.createDocumentFragment();

  text.split(/\s+/).forEach((word, i, all) => {
    const span = document.createElement("span");
    span.className = "word";
    span.setAttribute("aria-hidden", "true");
    span.textContent = i < all.length - 1 ? `${word} ` : word;
    fragment.append(span);
  });

  el.replaceChildren(fragment);
  return Array.from(el.querySelectorAll(".word"));
}

export function init(root = document) {
  const el = root.querySelector("[data-statement]");
  if (!el) return () => {};

  const words = split(el);

  if (prefersReducedMotion()) {
    words.forEach((w) => { w.dataset.lit = "true"; });
    return destroy;
  }

  unsubscribe = onScroll(() => {
    const rect = el.getBoundingClientRect();

    // Progress runs from the paragraph entering the lower third of the
    // viewport to it clearing the upper third — so the last word lights up
    // while the sentence is still comfortably readable.
    const start = window.innerHeight * 0.8;
    const end = window.innerHeight * 0.3;
    const progress = (start - rect.top) / (start - end + rect.height);
    const lit = Math.round(Math.min(Math.max(progress, 0), 1) * words.length);

    words.forEach((word, i) => {
      const on = i < lit;
      if ((word.dataset.lit === "true") !== on) word.dataset.lit = String(on);
    });
  });

  return destroy;
}

export function destroy() {
  unsubscribe?.();
  unsubscribe = null;
}
