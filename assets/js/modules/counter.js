/**
 * counter.js — figures count up once, when they come into view.
 *
 * The final value lives in the HTML, not here, so the number is correct
 * before a single line of JavaScript runs — for search engines, for screen
 * readers, and for anyone who blocks scripts.
 */

import { animate, inView } from "../vendor.js";
import { motionAllowed } from "./motion-prefs.js";

const cleanups = [];

export function init(root = document) {
  const figures = root.querySelectorAll("[data-count]");
  if (!figures.length || !motionAllowed()) return () => {};

  figures.forEach((el) => {
    const target = Number(el.dataset.count);
    if (!Number.isFinite(target)) return;

    const stop = inView(el, () => {
      animate(0, target, {
        duration: 1.4,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (value) => { el.textContent = Math.round(value).toLocaleString("en-GB"); },
      });
      return () => {};
    }, { amount: 0.6 });

    cleanups.push(stop);
  });

  return destroy;
}

export function destroy() {
  cleanups.forEach((stop) => stop());
  cleanups.length = 0;
}
