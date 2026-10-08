/**
 * fit.js — every giant at the width its section asks for.
 *
 * Each bleed word declares how much of the frame it should cover
 * (data-fit="0.7" = 70% of the viewport width) and which edge it runs off
 * (data-bleed="left|right", handled in CSS). A fixed vw size cannot hit a
 * width: "Now." and "Content" need wildly different sizes for the same
 * span, and the ratio shifts again when the web font swaps in. So it is
 * measured.
 *
 * Markup: a container with data-fit, holding one .t-bleed. The container
 * gets an inline font-size; the word inside is set at 1em.
 *
 * Without this module the stylesheet's own clamp() still renders a big,
 * cropped word — just not a measured one.
 */

let containers = [];
let frame = 0;

function fit() {
  const frameWidth = document.documentElement.clientWidth;

  // Measure every word first, then size them all. Measuring after a write
  // made the browser lay the page out again for each of the fifteen giants.
  const ratios = containers.map((box) => {
    const word = box.querySelector(".t-bleed");
    if (!word) return 0;
    // offsetWidth, not the bounding rect: the reveal leaves the word rotated
    // mid-entrance, and a rotated box is wider than the word.
    const size = parseFloat(getComputedStyle(word).fontSize);
    return word.offsetWidth / size;
  });

  containers.forEach((box, i) => {
    const ratio = ratios[i];
    if (!ratio) return;
    // data-fit-sm overrides on phones, where a word that is a third of a
    // desktop frame would be a caption.
    const small = frameWidth < 768 && box.dataset.fitSm;
    const share = parseFloat(small || box.dataset.fit) || 0.8;
    box.style.fontSize = `${((frameWidth * share) / ratio).toFixed(2)}px`;
  });
}

const schedule = () => {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(fit);
};

export function init(root = document) {
  containers = Array.from(root.querySelectorAll("[data-fit]"));
  if (!containers.length) return () => {};

  fit();
  // The display face arrives after first paint; its widths are not the
  // fallback's. Refit when it lands.
  document.fonts?.ready.then(schedule);
  document.fonts?.addEventListener?.("loadingdone", schedule);
  window.addEventListener("resize", schedule, { passive: true });

  return destroy;
}

export function destroy() {
  cancelAnimationFrame(frame);
  window.removeEventListener("resize", schedule);
  document.fonts?.removeEventListener?.("loadingdone", schedule);
  containers.forEach((box) => { box.style.fontSize = ""; });
  containers = [];
}
