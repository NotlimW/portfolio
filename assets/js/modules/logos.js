/**
 * logos.js — the client rows roll, and the scroll throws them.
 *
 * Used by every [data-clients] block on the page: the client marks near
 * the top, and the tools ribbon in "Now". Each block runs on its own; they
 * share the scroll's push.
 *
 * Both rows travel the same way, right to left, so scrolling down reads as
 * moving right along the page. They roll on their own all the time; scroll
 * speed adds to that in either direction (scrolling up surges them on too,
 * never back) and they ease back to their own pace. Nothing stops them, a
 * pointer resting on a mark included.
 *
 * The second row starts offset and answers the scroll with more lag, so a
 * fast scroll pulls the rows apart and they settle back into step. Each
 * row leans into its own speed (skew) the way the giant headlines do, so
 * the lagging row leans a beat after the first and the lean runs down
 * through the block like a wave.
 *
 * The track is cloned once so the loop is seamless; the clone is hidden
 * from assistive tech. Transform only; widths are read once per resize.
 * Under reduced motion none of this runs and the rows stay still and
 * scrollable by hand.
 */

import { onScroll } from "./smooth-scroll.js";
import { motionAllowed } from "./motion-prefs.js";

const AUTO = 40;               // px per second, always, leftward
// A finger flick reports far higher scroll velocities than a wheel, and on a
// phone the rows are also narrower on screen: with the desktop numbers they
// shot past at up to 2400px/s. Touch gets a gentle push and a low cap.
const TOUCH = window.matchMedia("(pointer: coarse)").matches;
const PUSH = TOUCH ? 10 : 55;  // px per second added per unit of scroll velocity
const MAX = TOUCH ? 420 : 2400; // cap on the surge, px per second
const FOLLOW = [0.1, 0.05];    // per row: how quickly it answers the scroll — low = lags
const STAGGER = 0.14;          // second row's head start, as a share of a track width
const LEAN_PER_SPEED = 0.006;  // degrees of skew per px/s
const LEAN_MAX = TOUCH ? 0 : 10;

let groups = [];
let frame = 0;
let unsubscribe = null;
let observer = null;
let velocity = 0;
let last = 0;

function tick(now) {
  // Sleep while no row is on screen; the observer wakes the loop again.
  if (!groups.some((g) => g.visible)) { frame = 0; last = 0; return; }
  frame = requestAnimationFrame(tick);
  const dt = Math.min(0.05, (now - (last || now)) / 1000);
  last = now;

  // The scroll's push fades on its own between scroll events.
  velocity *= 0.9;

  groups.forEach(({ visible, rows }) => { if (visible) rows.forEach((row) => {
    // Scroll speed in either direction pushes the same way: forward.
    const target = Math.min(MAX, AUTO + Math.abs(velocity) * PUSH);
    row.speed += (target - row.speed) * row.follow;
    row.x -= row.speed * dt;

    // Leaning left as it runs left: the tops lead, like the giants.
    const lean = Math.max(-LEAN_MAX, Math.min(LEAN_MAX, row.speed * LEAN_PER_SPEED));
    row.lean += (lean - row.lean) * 0.1;

    // Wrap into one track width so the clone always covers the seam.
    let x = (row.x - row.stagger * row.width) % row.width;
    if (x > 0) x -= row.width;

    const tx = `translate3d(${x.toFixed(1)}px, 0, 0)`;
    if (row.tx !== tx) {
      row.tx = tx;
      row.tracks.forEach((track) => { track.style.transform = tx; });
    }
    // Only when it changes: a style write per row per frame adds up on a
    // phone. Touch sets no lean at all (LEAN_MAX 0), so it is written once.
    const skew = `skewX(${row.lean.toFixed(2)}deg)`;
    if (row.skew !== skew) { row.skew = skew; row.el.style.transform = skew; }
  }); });
}

export function init(root = document) {
  const sections = Array.from(root.querySelectorAll("[data-clients]"));
  if (!sections.length || !motionAllowed()) return () => {};

  groups = sections.map((section) => ({ section, visible: false, rows: Array.from(section.querySelectorAll(".clients__row")).map((el, i) => {
    const track = el.querySelector(".clients__track");
    const clone = track.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    el.append(clone);
    const row = {
      el, tracks: [track, clone],
      follow: FOLLOW[i] ?? FOLLOW[FOLLOW.length - 1],
      stagger: i * STAGGER,
      x: 0, speed: AUTO, width: 1, lean: 0,
    };
    return row;
  }) }));

  const measure = () => groups.forEach(({ rows }) => rows.forEach((row) => { row.width = row.tracks[0].offsetWidth || 1; }));
  measure();
  document.fonts?.ready.then(measure);
  window.addEventListener("resize", measure, { passive: true });

  groups.forEach(({ section }) => { section.dataset.flow = "on"; });

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const group = groups.find((g) => g.section === entry.target);
      if (group) group.visible = entry.isIntersecting;
    });
    if (!frame && groups.some((g) => g.visible)) frame = requestAnimationFrame(tick);
  });
  groups.forEach(({ section }) => observer.observe(section));

  // Lenis reports velocity in px per frame; keep the strongest recent push.
  unsubscribe = onScroll(({ velocity: v }) => {
    if (Math.abs(v || 0) > Math.abs(velocity)) velocity = v;
  });

  frame = requestAnimationFrame(tick);

  return () => {
    window.removeEventListener("resize", measure);
    destroy();
  };
}

export function destroy() {
  cancelAnimationFrame(frame);
  unsubscribe?.();
  observer?.disconnect();
  groups.forEach(({ rows }) => rows.forEach(({ tracks }) => tracks[1]?.remove()));
  groups = [];
}
