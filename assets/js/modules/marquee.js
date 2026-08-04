/**
 * marquee.js — the tools ribbon.
 *
 * CSS owns the loop; this module only duplicates the track so the loop is
 * seamless, and flips direction with the scroll. Duplicating in script
 * rather than markup keeps the source list authored once.
 */

import { onScroll } from "./smooth-scroll.js";
import { motionAllowed } from "./motion-prefs.js";

let unsubscribe = null;

export function init(root = document) {
  const marquees = root.querySelectorAll("[data-marquee]");
  if (!marquees.length) return () => {};

  marquees.forEach((marquee) => {
    const track = marquee.querySelector(".marquee__track");
    if (!track) return;

    // A second copy, hidden from assistive tech: it is the same words again.
    const clone = track.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    marquee.append(clone);
  });

  if (!motionAllowed()) return () => {};

  unsubscribe = onScroll(({ velocity }) => {
    if (Math.abs(velocity) < 0.1) return;
    const direction = velocity > 0 ? "normal" : "reverse";
    marquees.forEach((m) => m.style.setProperty("--marquee-direction", direction));
  });

  return destroy;
}

export function destroy() {
  unsubscribe?.();
  unsubscribe = null;
}
