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
 *   <div data-scene data-scene-ease="soft">   linear through the middle, with
 *                                        a gentle run-up and run-out at the
 *                                        ends (for long sideways tracks)
 *   <div data-scene data-scene-catch>    a pinned scene that lands softly:
 *                                        --catch (px) eases its sticky child
 *                                        into the pin instead of letting the
 *                                        vertical motion stop dead, and eases
 *                                        it out again on release
 *   <div data-scene data-scene-smooth>   glides after the scroll instead of
 *                                        being welded to it, and coasts to a
 *                                        stop; a "scene:frame" event fires on
 *                                        window each frame it moves, for the
 *                                        modules that follow it (particles,
 *                                        thread)
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

/** Even pace through the middle, accelerating over the first EDGE and
    slowing over the last: the track never starts or stops dead, and the
    middle does not race the way a full ease-in-out does over a long run. */
const EDGE = 0.15;
const softEnds = (t) => {
  const v = 1 / (1 - EDGE);
  if (t < EDGE) return (v * t * t) / (2 * EDGE);
  if (t > 1 - EDGE) return 1 - (v * (1 - t) ** 2) / (2 * EDGE);
  return v * (t - EDGE / 2);
};

/*
 * The soft catch. Unsmoothed, a sticky child moves up at full scroll speed
 * and then stops within a single frame as it pins — the hardest moment on
 * the page. Instead, across a zone of 2·D centred on the pin, its speed
 * falls in a straight line from the page's own speed to zero: it is still
 * gliding the last stretch into place for a moment after the pin catches.
 * Speed only ever falls, so there is no surge before the brake. The release
 * mirrors it: the child sets off from rest a moment before the pin lets go
 * and reaches the page's speed just after.
 *
 * With s = rect.top (entry), the child's visual offset from the top is
 * (s + D)² / 4D across s ∈ [−D, D]; its natural (sticky) position is
 * max(s, 0), and --catch is the difference. A function of position only:
 * nothing lags, nothing keeps running after the scroll stops.
 */
const CATCH = 0.3;

function catchFor(rect, viewportH) {
  const d = viewportH * CATCH;
  const s = rect.top;
  if (s > -d && s < d) return (s + d) ** 2 / (4 * d) - Math.max(s, 0);
  const q = rect.bottom - viewportH;            // < 0 once the pin has let go
  if (q > -d && q < d) return -((d - q) ** 2) / (4 * d) - Math.min(q, 0);
  return 0;
}

/** How much of the gap a smoothed scene closes per frame. */
const SMOOTH = 0.11;

let frame = 0;

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
    curve: el.dataset.sceneEase === "soft" ? softEnds
      : el.hasAttribute("data-scene-ease") ? easeInOut : null,
    smooth: el.hasAttribute("data-scene-smooth"),
    catches: el.hasAttribute("data-scene-catch"),
    lastCatch: 0,
    target: -1,
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

      if (scene.catches) {
        const c = Math.round(catchFor(rect, viewportH) * 10) / 10;
        if (c !== scene.lastCatch) {
          scene.lastCatch = c;
          scene.el.style.setProperty("--catch", `${c}px`);
        }
      }

      const raw = progressFor(rect, scene.mode, viewportH);
      const value = scene.curve ? scene.curve(raw) : raw;

      if (scene.smooth) {
        // First sighting lands in place; after that the glide loop chases it.
        if (scene.last < 0) write(scene, value);
        scene.target = value;
        glide();
        return;
      }
      write(scene, value);
    });
  };

  update();
  unsubscribe = onScroll(update);
  window.addEventListener("resize", update, { passive: true });

  return destroy;
}

/** Writing the same value again still invalidates style, so don't. */
function write(scene, value) {
  if (Math.abs(value - scene.last) < 0.0005) return false;
  scene.last = value;
  scene.el.style.setProperty("--progress", value.toFixed(4));
  return true;
}

/** Eases every smoothed scene toward its target; sleeps once they arrive. */
function step() {
  frame = 0;
  let moving = false;
  let moved = false;
  scenes.forEach((scene) => {
    if (!scene.smooth || scene.target < 0) return;
    const gap = scene.target - scene.last;
    if (Math.abs(gap) < 0.0004) { moved = write(scene, scene.target) || moved; return; }
    moved = write(scene, scene.last + gap * SMOOTH) || moved;
    moving = true;
  });
  if (moved) window.dispatchEvent(new Event("scene:frame"));
  if (moving) frame = requestAnimationFrame(step);
}

function glide() {
  if (!frame) frame = requestAnimationFrame(step);
}

export function destroy() {
  cancelAnimationFrame(frame);
  frame = 0;
  unsubscribe?.();
  scenes.forEach(({ el }) => { el.style.removeProperty("--progress"); el.style.removeProperty("--catch"); });
  scenes = [];
  unsubscribe = null;
}
