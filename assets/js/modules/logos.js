/**
 * logos.js — the client rows roll, and the scroll throws them.
 *
 * Used by every [data-clients] block on the page: the client marks near
 * the top, and the tools ribbon in "Now". Each block runs on its own; they
 * share the scroll's push.
 *
 * Both rows travel the same way, right to left, so scrolling down reads as
 * moving right along the page. They roll on their own all the time; scroll
 * speed adds to that — scroll down and they surge left, scroll up and they
 * are pushed back — then they ease back to their own pace. The page never
 * stops for them.
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
const PUSH = 55;               // px per second added per unit of scroll velocity
const MAX = 2400;              // cap on the surge, px per second
const FOLLOW = [0.1, 0.05];    // per row: how quickly it answers the scroll — low = lags
const STAGGER = 0.14;          // second row's head start, as a share of a track width
const LEAN_PER_SPEED = 0.006;  // degrees of skew per px/s
const LEAN_MAX = 10;

let groups = [];
let frame = 0;
let unsubscribe = null;
let observer = null;
let velocity = 0;
let last = 0;

function tick(now) {
  frame = requestAnimationFrame(tick);
  const dt = Math.min(0.05, (now - (last || now)) / 1000);
  last = now;

  // The scroll's push fades on its own between scroll events.
  velocity *= 0.9;

  groups.forEach(({ visible, rows }) => { if (visible) rows.forEach((row) => {
    row.ease += ((row.hover ? 0.15 : 1) - row.ease) * 0.06;
    const target = Math.max(-MAX, Math.min(MAX, AUTO + velocity * PUSH)) * row.ease;
    row.speed += (target - row.speed) * row.follow;
    row.x -= row.speed * dt;

    // Leaning left as it runs left: the tops lead, like the giants.
    const lean = Math.max(-LEAN_MAX, Math.min(LEAN_MAX, row.speed * LEAN_PER_SPEED));
    row.lean += (lean - row.lean) * 0.1;

    // Wrap into one track width so the clone always covers the seam.
    let x = (row.x - row.stagger * row.width) % row.width;
    if (x > 0) x -= row.width;

    row.tracks.forEach((track) => {
      track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
    });
    row.el.style.transform = `skewX(${row.lean.toFixed(2)}deg)`;
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
      x: 0, speed: AUTO, width: 1, lean: 0, ease: 1, hover: false,
    };
    el.addEventListener("pointerenter", () => { row.hover = true; });
    el.addEventListener("pointerleave", () => { row.hover = false; });
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
