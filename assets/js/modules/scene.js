/**
 * scene.js — one mechanism behind every scroll-driven transition on the site.
 *
 * A scene is any element that wants to know how far the page has scrolled
 * *through* it, as a number from 0 to 1. This module measures that and writes
 * it to a `--progress` custom property. Nothing else. Every effect — the zoom
 * into an image, the panel that slides in from the side, the horizontal
 * process track, sticky captions — is then pure CSS reading that one number.
 *
 * Why this way: one measurement per scene per frame instead of one per
 * effect, all the choreography stays legible in the stylesheet, and adding a
 * new transition never means writing more JavaScript.
 *
 *   <div data-scene>                     progress 0 → 1 across the element
 *   <div data-scene="cover">             0 when the top edge reaches the
 *                                        bottom of the viewport, 1 when the
 *                                        bottom edge reaches the top
 *   <div data-scene data-scene-ease>     eased instead of linear
 *
 * The property is set on the scene element, so any descendant can read it.
 */

import { onScroll } from "./smooth-scroll.js";
import { motionAllowed } from "./motion-prefs.js";

let unsubscribe = null;
let scenes = [];

const clamp = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Smooth start and end so scrubbed motion never begins or stops abruptly. */
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

function progressFor(rect, mode, viewportH) {

  if (mode === "cover") {
    // The element travelling fully across the viewport, top to bottom.
    return clamp((viewportH - rect.top) / (viewportH + rect.height));
  }

  // Default: the element is taller than the viewport and pins something
  // inside itself. Progress runs from its top hitting the top of the screen
  // to its bottom hitting the bottom.
  const scrollable = rect.height - viewportH;
  if (scrollable <= 0) return clamp((viewportH - rect.top) / (viewportH + rect.height));
  return clamp(-rect.top / scrollable);
}

export function init(root = document) {
  scenes = Array.from(root.querySelectorAll("[data-scene]")).map((el) => ({
    el,
    mode: el.dataset.scene || "pin",
    eased: el.hasAttribute("data-scene-ease"),
    last: -1,
  }));

  if (!scenes.length) return () => {};

  // Reduced motion: settle every scene at its resting state and stop. The
  // CSS is authored so that progress 1 is the readable, undistorted view.
  if (!motionAllowed()) {
    scenes.forEach(({ el }) => el.style.setProperty("--progress", "1"));
    return destroy;
  }

  const update = () => {
    const viewportH = window.innerHeight;

    // Read every scene's box first, then write. Reading after a write forces
    // the browser to lay the whole page out again before it can answer, so
    // interleaving the two cost one full layout per scene per frame.
    const rects = scenes.map(({ el }) => el.getBoundingClientRect());

    scenes.forEach((scene, i) => {
      const rect = rects[i];

      // Skip anything comfortably off-screen.
      if (rect.bottom < -viewportH || rect.top > viewportH * 2) return;

      const raw = progressFor(rect, scene.mode, viewportH);
      const value = scene.eased ? easeInOut(raw) : raw;

      // Writing the same value again still invalidates style, so don't.
      if (Math.abs(value - scene.last) < 0.0005) return;
      scene.last = value;
      scene.el.style.setProperty("--progress", value.toFixed(4));
    });
  };

  update();
  unsubscribe = onScroll(update);
  window.addEventListener("resize", update, { passive: true });

  return destroy;
}

export function destroy() {
  unsubscribe?.();
  scenes.forEach(({ el }) => el.style.removeProperty("--progress"));
  scenes = [];
  unsubscribe = null;
}
