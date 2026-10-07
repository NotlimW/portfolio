/**
 * preview.js — a list that shows you a picture of what you are pointing at.
 *
 * Rows carry data-preview="path/to/image.jpg". Hovering one floats that
 * image beside the pointer: it follows on a spring, leans into the
 * direction of travel, and scales in and out as you enter and leave the
 * list. Crossfades between rows instead of cutting. Idea from the "Hover
 * Image List" component on 21st.dev, rebuilt without React.
 *
 * Decoration only: the image is aria-hidden and the rows stay plain text,
 * so nothing here is needed to read the list. Fine pointers only, and off
 * under reduced motion.
 */

import { motionAllowed, hasFinePointer } from "./motion-prefs.js";

const FOLLOW = 0.16;
const LEAN = 0.35;
const LEAN_MAX = 14;

let figure = null;
let imgs = new Map();
let lists = [];
let frame = 0;
const state = { x: 0, y: 0, tx: 0, ty: 0, vx: 0, active: false };

/** Run the follow loop only while the picture is still catching up. */
function wake() {
  if (!frame) frame = requestAnimationFrame(tick);
}

function tick() {
  frame = 0;
  const px = state.x;
  state.x += (state.tx - state.x) * FOLLOW;
  state.y += (state.ty - state.y) * FOLLOW;
  state.vx += ((state.x - px) - state.vx) * 0.3;
  const lean = Math.max(-LEAN_MAX, Math.min(LEAN_MAX, state.vx * LEAN));
  // The picture stands in for the cursor, hung off its right-hand side:
  // its left edge sits just past the pointer, centred on it vertically, so
  // it reads as the pointer and still leaves the row's title uncovered.
  figure.style.transform =
    `translate3d(${state.x.toFixed(1)}px, ${state.y.toFixed(1)}px, 0) translate(0.5rem, -50%) rotate(${lean.toFixed(2)}deg)`;
  if (Math.abs(state.tx - state.x) > 0.1 || Math.abs(state.ty - state.y) > 0.1 || Math.abs(state.vx) > 0.01) {
    frame = requestAnimationFrame(tick);
  }
}

/* Scrolling with a still pointer moves the list out from under it without
   a pointerleave, which would strand the picture on screen. */
function onScroll() {
  if (!figure?.classList.contains("is-on")) return;
  if (!lists.some((list) => list.matches(":hover"))) hide();
}

/* Where the pointer is, tracked page-wide so a row that scrolls in under
   a still pointer can place the picture without waiting for it to move. */
const pointer = { x: 0, y: 0, known: false };
const onWindowMove = (e) => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.known = true; };

function show(src, x, y) {
  imgs.forEach((img, key) => img.classList.toggle("is-current", key === src));
  // First frame of a hover: put the picture straight at the pointer rather
  // than letting it fly in from wherever it was last left (or from 0,0).
  if (!state.active) {
    state.x = state.tx = x;
    state.y = state.ty = y;
    state.vx = 0;
    state.active = true;
  }
  figure.classList.add("is-on");
  // The picture becomes the cursor: preview.css hides the dot while this
  // is set, so there is one thing following the pointer, not two.
  document.documentElement.dataset.preview = "on";
  wake();
}

function hide() {
  figure.classList.remove("is-on");
  state.active = false;
  delete document.documentElement.dataset.preview;
}

export function init(root = document) {
  if (!motionAllowed() || !hasFinePointer()) return () => {};

  const rows = Array.from(root.querySelectorAll("[data-preview]"));
  if (!rows.length) return () => {};

  figure = document.createElement("div");
  figure.className = "preview";
  figure.setAttribute("aria-hidden", "true");
  const frameEl = document.createElement("div");
  frameEl.className = "preview__frame";
  figure.append(frameEl);
  [...new Set(rows.map((r) => r.dataset.preview))].forEach((src) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    img.decoding = "async";
    img.loading = "lazy";
    frameEl.append(img);
    imgs.set(src, img);
  });
  document.body.append(figure);

  window.addEventListener("pointermove", onWindowMove, { passive: true });

  rows.forEach((row) => {
    row.addEventListener("pointerenter", (e) => {
      const x = e.clientX || pointer.x, y = e.clientY || pointer.y;
      show(row.dataset.preview, x, y);
    });
  });

  lists = [...new Set(rows.map((r) => r.parentElement))];
  lists.forEach((list) => {
    list.addEventListener("pointermove", (e) => {
      state.tx = e.clientX;
      state.ty = e.clientY;
      wake();
    });
    list.addEventListener("pointerleave", hide);
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  wake();
  return destroy;
}

export function destroy() {
  cancelAnimationFrame(frame);
  frame = 0;
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("pointermove", onWindowMove);
  delete document.documentElement.dataset.preview;
  figure?.remove();
  figure = null;
  imgs = new Map();
  lists = [];
}
