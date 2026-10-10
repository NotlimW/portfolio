/**
 * logos.js — the client and tools ribbons.
 *
 * Every [data-clients] block has two rows rolling right to left. Scroll
 * speed in either direction pushes them forward, then they ease back to
 * their own pace. The second row lags a little, and each row leans into
 * its speed.
 *
 * Each track is cloned once for a seamless loop; the clone is hidden from
 * assistive tech. Under reduced motion the rows stay still and scroll by
 * hand.
 */

import { onScroll } from "./smooth-scroll.js";
import { motionAllowed } from "./motion-prefs.js";

const AUTO = 40;               // px per second, always, leftward
// A finger flick reports far higher scroll velocities than a wheel, and on a
// phone the rows are also narrower on screen.
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
