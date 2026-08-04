/**
 * track.js — measurement for every horizontal track on the page.
 *
 * Two sections now travel sideways: the process steps and the node-pipeline
 * act. Both are pinned by CSS `position: sticky` and timed by --progress from
 * scene.js. The one thing neither CSS nor scene.js can know is how far the
 * track actually has to move for its far edge to reach the viewport's far
 * edge — that needs a measurement, and it is the only reason this file exists.
 *
 *   <div data-track>   →   --track-distance: <px>
 *
 * Below 64rem the tracks lay out vertically and the measurement is cleared,
 * because a horizontal hijack on a small screen costs more than it gives.
 */

import { motionAllowed } from "./motion-prefs.js";

let onResize = null;
let tracks = [];

const isDesktop = () => window.matchMedia("(min-width: 48rem)").matches;

function measure(el) {
  if (!isDesktop()) {
    el.style.removeProperty("--track-distance");
    return;
  }
  const distance = Math.max(el.scrollWidth - window.innerWidth, 0);
  el.style.setProperty("--track-distance", `${distance}px`);
}

export function init(root = document) {
  tracks = Array.from(root.querySelectorAll("[data-track]"));
  if (!tracks.length || !motionAllowed()) return () => {};

  const measureAll = () => tracks.forEach(measure);

  measureAll();

  // Fonts and images landing after first paint both change track width.
  document.fonts?.ready.then(measureAll);

  onResize = measureAll;
  window.addEventListener("resize", onResize, { passive: true });

  return destroy;
}

export function destroy() {
  if (onResize) window.removeEventListener("resize", onResize);
  tracks.forEach((el) => el.style.removeProperty("--track-distance"));
  tracks = [];
  onResize = null;
}
