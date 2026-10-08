/**
 * masonry.js — the focal plane behind the creative wall.
 *
 * The wall is thirty-odd frames that each drift at their own rate and pull
 * in and out of focus. That is two effects on every item, which is exactly
 * the shape of thing that quietly costs a page its frame rate — so this
 * module does the same job as parallax.js and scene.js but pays for it once:
 *
 *   one custom property   --pass, -1 → 0 → +1 across a crossing, 0 dead
 *                         centre. Drift, fade, scale and blur are all CSS
 *                         reading that number. See components/masonry.css.
 *
 *   one layout read       item offsets inside the grid are measured on init
 *                         and on resize, never per frame. A frame reads the
 *                         grid's own rect and does arithmetic from there, so
 *                         thirty items cost one getBoundingClientRect, not
 *                         thirty.
 *
 *   reads before writes   the two loops below are separate on purpose.
 *                         Interleaving them makes every write invalidate the
 *                         next read, and the frame turns into N forced
 *                         layouts instead of one.
 *
 * Off-screen items are skipped and their property removed, so the cost of
 * the section is proportional to what is actually on screen, not to how much
 * work Milton has made.
 *
 * Markup: <div data-masonry> around the grid, <figure data-plane> per item.
 * Speed is declarative and lives in CSS, as `style="--speed: .12"` — this
 * module never needs to know it.
 */

import { onScroll } from "./smooth-scroll.js";
import { motionAllowed, isTouch } from "./motion-prefs.js";

/** Below this, the change is smaller than a pixel of travel. Don't pay for it. */
const EPSILON = 0.004;

/**
 * Per-column drift rates, as a fraction of --masonry-col-drift.
 *
 * Deliberately not a ramp. A monotonic 1 / .75 / .5 / .25 reads as the whole
 * wall being sheared; an irregular order reads as separate strips at separate
 * depths, which is the thing worth having. Index 0 is the left-most column.
 */
const COLUMN_SPEEDS = [0.32, 1, 0.55, 0.82, 0.44, 0.9];

let unsubscribe = null;
let onResize = null;
let observer = null;
let grids = [];

/**
 * Item positions relative to their grid. Called on init and whenever the
 * grid's box changes — a breakpoint switching the column count, or images
 * settling after they load. Both move every item below them.
 */
function measure(grid) {
  const rect = grid.el.getBoundingClientRect();
  grid.height = rect.height;

  for (const item of grid.items) {
    const box = item.el.getBoundingClientRect();
    // Subtract the shift its column is currently carrying, so the resting
    // layout position is measured rather than the animated one. Without this
    // the effect feeds back into its own input and the wall creeps.
    item.top = box.top - rect.top - (item.column?.shift ?? 0);
    item.height = box.height;
  }
}

/** How many columns the stylesheet wants at the current breakpoint. */
function columnCount(el) {
  const value = parseInt(
    getComputedStyle(el).getPropertyValue("--masonry-cols"),
    10
  );
  return Number.isFinite(value) && value > 0 ? value : 1;
}

/**
 * Build the column elements and pack the items into them.
 *
 * Packing is shortest-column-first using each item's declared --ratio, so a
 * run of tall 9:16 creatives can't leave one strip hanging far below the
 * others. The ratio is authored in the markup already; nothing new is needed.
 */
function buildColumns(grid) {
  const count = columnCount(grid.el);
  if (count === grid.columnCount) return;

  grid.columnCount = count;
  grid.el.replaceChildren();

  // Read the amplitude from CSS so the effect stays tunable in the stylesheet
  // rather than here. Read once per build, not per frame.
  grid.drift = parseFloat(
    getComputedStyle(grid.el).getPropertyValue("--masonry-col-drift")
  ) || 0;

  grid.columns = Array.from({ length: count }, (_, i) => {
    const speed = COLUMN_SPEEDS[i % COLUMN_SPEEDS.length];
    const el = document.createElement("div");
    el.className = "creative-wall__col";
    el.style.setProperty("--col-speed", String(speed));
    grid.el.append(el);
    return { el, speed, weight: 0, shift: 0, last: NaN };
  });

  // Phones get a shorter wall: the items marked data-wall-extra are left
  // out of the columns entirely (the 3 → 4 column change at 48rem rebuilds,
  // so they come back on wider screens).
  const short = window.matchMedia("(max-width: 47.99rem)").matches;

  for (const item of grid.items) {
    if (short && item.el.hasAttribute("data-wall-extra")) continue;
    // --ratio is authored as "4 / 5"; height per unit width is its inverse.
    const [w, h] = (item.el.style.getPropertyValue("--ratio") || "1/1")
      .split("/")
      .map((n) => parseFloat(n) || 1);

    const shortest = grid.columns.reduce((a, b) => (a.weight <= b.weight ? a : b));
    shortest.weight += h / w;
    shortest.el.append(item.el);
    item.column = shortest;
  }
}

export function init(root = document) {
  grids = Array.from(root.querySelectorAll("[data-masonry]"))
    .map((el) => ({
      el,
      top: 0,
      height: 0,
      columns: [],
      columnCount: 0,
      items: Array.from(el.querySelectorAll("[data-plane]")).map((node) => ({
        el: node,
        column: null,
        top: 0,
        height: 0,
        last: NaN,
        live: false,
      })),
    }))
    .filter((grid) => grid.items.length);

  if (!grids.length) return () => {};

  grids.forEach((grid) => { buildColumns(grid); measure(grid); });

  // Reduced motion, and touch: pin every item to the middle of the plane —
  // level, sharp, fully opaque — and never subscribe to anything. On a phone
  // the per-image depth pass was a style write per image per scroll frame
  // across the busiest stretch of the page.
  if (!motionAllowed() || isTouch()) {
    grids.forEach((grid) => {
      grid.items.forEach((item) => item.el.style.setProperty("--pass", "0"));
    });
    return destroy;
  }

  const update = () => {
    const viewportH = window.innerHeight;

    // ---- Read pass. One measurement per grid, and nothing is written yet.
    for (const grid of grids) {
      grid.top = grid.el.getBoundingClientRect().top;
    }

    // ---- Write pass. Nothing above is read again this frame.
    for (const grid of grids) {
      if (grid.top > viewportH || grid.top + grid.height < 0) continue;

      // Columns first: each strip crosses the viewport as one thing, so this
      // is one property write per column rather than one per item.
      const gridPass =
        (grid.top + grid.height / 2 - viewportH / 2) /
        ((viewportH + grid.height) / 2);

      for (const column of grid.columns) {
        // Mirrors the CSS exactly: translate3d(0, pass * speed * drift * -1).
        column.shift = gridPass * column.speed * grid.drift * -1;
        if (Math.abs(gridPass - column.last) < EPSILON) continue;
        column.last = gridPass;
        column.el.style.setProperty("--col-pass", gridPass.toFixed(3));
      }

      for (const item of grid.items) {
        // The item's own crossing has to account for how far its column has
        // drifted, or the focal plane would sharpen at the wrong moment for
        // every strip except the stationary one.
        const top = grid.top + item.top + (item.column?.shift ?? 0);

        if (top > viewportH || top + item.height < 0) {
          // Hand the item back to its CSS resting state on the way out, so
          // nothing off-screen is holding a stale transform or a filter.
          if (item.live) {
            item.el.style.removeProperty("--pass");
            item.live = false;
            item.last = NaN;
          }
          continue;
        }

        // -1 the instant the item clears the top edge, +1 the instant before
        // it enters at the bottom, 0 when its centre meets the centre of the
        // screen. Dividing by (viewport + item) / 2 rather than the viewport
        // is what makes the ends land exactly on ±1 whatever the item's size
        // — otherwise tall creatives would never fully reach the soft end.
        const pass =
          (top + item.height / 2 - viewportH / 2) / ((viewportH + item.height) / 2);

        // Setting a property to the value it already has still invalidates
        // style for the subtree. Don't.
        if (Math.abs(pass - item.last) < EPSILON) continue;

        item.last = pass;
        item.live = true;
        item.el.style.setProperty("--pass", pass.toFixed(3));
      }
    }
  };

  const remeasure = () => {
    // Rebuild only when the breakpoint actually changed the column count —
    // buildColumns bails early otherwise, so a resize that doesn't cross a
    // breakpoint costs one computed-style read.
    grids.forEach((grid) => { buildColumns(grid); measure(grid); });
    update();
  };

  update();
  unsubscribe = onScroll(update);

  onResize = remeasure;
  window.addEventListener("resize", onResize, { passive: true });

  if ("ResizeObserver" in window) {
    observer = new ResizeObserver(remeasure);
    grids.forEach((grid) => observer.observe(grid.el));
  }

  return destroy;
}

export function destroy() {
  unsubscribe?.();
  if (onResize) window.removeEventListener("resize", onResize);
  observer?.disconnect();

  grids.forEach((grid) => {
    grid.items.forEach((item) => item.el.style.removeProperty("--pass"));
    // Hand the items back to the grid so the DOM is as it was authored.
    grid.el.replaceChildren(...grid.items.map((item) => item.el));
  });

  grids = [];
  unsubscribe = null;
  onResize = null;
  observer = null;
}
