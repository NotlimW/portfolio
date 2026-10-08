/**
 * parallax.js — move 04: media drifts slower than the page.
 *
 * Only transform is written, never top/height, so nothing here can trigger
 * layout. Elements off-screen are skipped entirely — on a long page that is
 * the difference between updating four elements a frame and forty.
 *
 * Markup: <img data-parallax="0.2"> where the number is how far the element
 * travels relative to the scroll distance. Keep it under ~0.3; past that the
 * foreground and background stop feeling like one scene.
 */

import { onScroll } from "./smooth-scroll.js";
import { motionAllowed, isTouch } from "./motion-prefs.js";

let unsubscribe = null;
let items = [];

export function init(root = document) {
  // Touch: images sit still. A transform per image per scroll frame is a
  // small cost on a laptop and a real one on a phone.
  if (!motionAllowed() || isTouch()) return () => {};

  items = Array.from(root.querySelectorAll("[data-parallax]")).map((el) => ({
    el,
    strength: parseFloat(el.dataset.parallax) || 0.15,
  }));

  if (!items.length) return () => {};

  unsubscribe = onScroll(() => {
    const viewportH = window.innerHeight;

    // All reads before any write — see scene.js. (The transform written here
    // does not move the element's layout box, so the reads stay valid.)
    const rects = items.map(({ el }) => el.getBoundingClientRect());

    items.forEach(({ el, strength }, i) => {
      const rect = rects[i];

      if (rect.bottom < 0 || rect.top > viewportH) return;

      // -1 when the element is entering at the bottom, +1 when it leaves the
      // top; 0 dead centre, so nothing is displaced at rest.
      const centred = (rect.top + rect.height / 2 - viewportH / 2) / viewportH;
      const shift = centred * strength * 100;

      el.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0)`;
    });
  });

  return destroy;
}

export function destroy() {
  unsubscribe?.();
  unsubscribe = null;
  items.forEach(({ el }) => { el.style.transform = ""; });
  items = [];
}
