/**
 * timeline.js — where each node sits on the timeline line.
 *
 * The sun line in .tl draws down with the scroll (--progress from scene.js,
 * see components/about.css). Each node fills in once the line reaches it,
 * so CSS needs to know how far down the line every node is: --at, 0 at the
 * top of the line and 1 at the bottom. Measured once, and again on resize.
 *
 * Without this module --at stays 0 and every node shows filled.
 */

let lists = [];

function measure() {
  // All reads first, then the writes (see scene.js).
  const sets = lists.map((tl) => {
    const top = parseFloat(getComputedStyle(tl, "::before").top) || 0;
    const length = Math.max(1, tl.offsetHeight - top);
    return Array.from(tl.children).map((item) => {
      const node = getComputedStyle(item, "::before");
      const y = item.offsetTop + (parseFloat(node.top) || 0) + (parseFloat(node.height) || 0) / 2;
      return [item, Math.min(1, Math.max(0, (y - top) / length))];
    });
  });
  sets.flat().forEach(([item, at]) => item.style.setProperty("--at", at.toFixed(4)));
}

export function init(root = document) {
  lists = Array.from(root.querySelectorAll(".tl"));
  if (!lists.length) return () => {};
  measure();
  window.addEventListener("resize", measure);
  document.fonts?.ready.then(measure);
  return destroy;
}

export function destroy() {
  window.removeEventListener("resize", measure);
  lists.forEach((tl) => Array.from(tl.children).forEach((item) => item.style.removeProperty("--at")));
  lists = [];
}
