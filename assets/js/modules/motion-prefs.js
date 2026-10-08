/**
 * motion-prefs.js — one source of truth for whether the site may move.
 *
 * Every other module asks here instead of writing its own media query, so
 * turning motion off can never be half-applied. The query is live: if the
 * visitor changes the OS setting mid-session, subscribers are told.
 */

const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

const subscribers = new Set();

/** True when the visitor has asked for less motion. */
export const prefersReducedMotion = () => reducedQuery.matches;

/** True for mouse/trackpad. Touch and pen get the simpler experience. */
export const hasFinePointer = () => pointerQuery.matches;

/** True on a touchscreen (phones, tablets). These get a lighter build: the
    effects that cost a style pass on every scroll frame are skipped, since a
    phone has a fraction of a laptop's headroom for them. */
export const isTouch = () => window.matchMedia("(pointer: coarse)").matches;

/** True when decorative, scroll-linked motion is allowed to run at all. */
export const motionAllowed = () => !reducedQuery.matches;

/** Subscribe to preference changes. Returns an unsubscribe function. */
export function onPreferenceChange(callback) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

const notify = () => subscribers.forEach((cb) => cb({
  reducedMotion: reducedQuery.matches,
  finePointer: pointerQuery.matches,
}));

reducedQuery.addEventListener("change", notify);
pointerQuery.addEventListener("change", notify);
