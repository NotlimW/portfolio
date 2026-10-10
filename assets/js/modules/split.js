/**
 * split.js — splits a heading into the line spans the mask reveal needs:
 *
 *     <span class="line"><span>…</span></span>
 *
 * Breaks are measured, not guessed: every word is wrapped, words sharing a
 * top edge are grouped into a line, and each line is rebuilt in that shape,
 * so the reveal breaks exactly where text-wrap: balance did.
 *
 * Inline markup such as an <em> is cloned into each line it spans. The
 * heading keeps its original HTML as an aria-label, so screen readers get
 * one sentence, and restore() puts it back before a re-split on resize.
 * Headings that already contain .line markup are left alone.
 */

import { onPreferenceChange, prefersReducedMotion } from "./motion-prefs.js";
import { refresh } from "./reveal.js";

const SELECTOR = '[data-reveal="lines"]';
const WORD = "split__w";

/** Rendered tops within this many pixels count as the same line. */
const LINE_TOLERANCE = 4;

const originals = new Map();
let onResize = null;
let lastWidth = 0;

/** Wrap every word in its own span, in place, preserving inline elements. */
function wrapWords(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const texts = [];
  while (walker.nextNode()) texts.push(walker.currentNode);

  const words = [];

  texts.forEach((node) => {
    const parts = node.textContent.split(/(\s+)/).filter(Boolean);
    if (!parts.length) return;

    const frag = document.createDocumentFragment();
    parts.forEach((part) => {
      if (/^\s+$/.test(part)) { frag.append(part); return; }
      const span = document.createElement("span");
      span.className = WORD;
      span.textContent = part;
      frag.append(span);
      words.push(span);
    });

    node.replaceWith(frag);
  });

  return words;
}

/** The inline elements between a word and the heading, outermost first. */
function chainOf(word, root) {
  const chain = [];
  let node = word.parentElement;
  while (node && node !== root) { chain.unshift(node); node = node.parentElement; }
  return chain;
}

const sameChain = (a, b) => a.length === b.length && a.every((n, i) => n === b[i]);

/** Rebuild one measured line as .line > span, re-creating inline wrappers. */
function buildLine(words, root, index) {
  const line = document.createElement("span");
  line.className = "line";

  const inner = document.createElement("span");
  inner.style.setProperty("--i", String(index));
  line.append(inner);

  let chain = null;
  let target = inner;

  words.forEach((word, i) => {
    const wordChain = chainOf(word, root);

    if (chain === null || !sameChain(chain, wordChain)) {
      chain = wordChain;
      target = inner;
      // Clone the ancestors this word sits inside, so an <em> spanning part
      // of a line keeps its element on this line too.
      wordChain.forEach((ancestor) => {
        const clone = ancestor.cloneNode(false);
        target.append(clone);
        target = clone;
      });
    }

    if (i > 0) target.append(" ");
    target.append(word.textContent);
  });

  return line;
}

/** Phase 1 — write. */
function prepare(el) {
  if (!originals.has(el)) originals.set(el, el.innerHTML);

  // A heading whose breaks were authored by hand already has what it needs.
  if (el.querySelector(":scope > .line")) return null;

  const text = el.textContent.replace(/\s+/g, " ").trim();
  if (!text) return null;

  el.innerHTML = originals.get(el);
  const words = wrapWords(el);
  return words.length ? { el, words, text } : null;
}

/** Phase 3 — write. Group the measured words into lines and rebuild. */
function commit({ el, words, text }, tops) {
  const lines = [];
  let reference = null;

  words.forEach((word, i) => {
    if (reference === null || Math.abs(tops[i] - reference) > LINE_TOLERANCE) {
      lines.push([]);
      reference = tops[i];
    }
    lines[lines.length - 1].push(word);
  });

  const fragment = document.createDocumentFragment();
  lines.forEach((line, i) => fragment.append(buildLine(line, el, i)));

  el.setAttribute("aria-label", text);
  el.replaceChildren(fragment);
}

/** Split every heading in one batch. */
function splitAll(targets) {
  const jobs = targets.map(prepare).filter(Boolean);          // write
  const tops = jobs.map(({ words }) => words.map((w) => w.getBoundingClientRect().top));  // read
  jobs.forEach((job, i) => commit(job, tops[i]));             // write
}

function restore(el) {
  const html = originals.get(el);
  if (html === undefined) return;
  el.innerHTML = html;
  el.removeAttribute("aria-label");
}

export function init(root = document) {
  const targets = Array.from(root.querySelectorAll(SELECTOR));
  if (!targets.length) return () => {};

  /** `initial` is the first pass, before reveal.js has observed anything. */
  const run = (initial = false) => {
    if (prefersReducedMotion()) { targets.forEach(restore); return; }
    splitAll(targets);
    if (!initial) targets.forEach(refresh);
  };

  run(true);

  // Web fonts land after first paint and change every line break.
  document.fonts?.ready.then(() => run());

  // Height-only changes — a mobile browser's address bar collapsing — cannot
  // reflow a line, and re-splitting on them would be a lot of layout for
  // nothing.
  lastWidth = window.innerWidth;
  onResize = () => {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    run();
  };
  window.addEventListener("resize", onResize, { passive: true });

  onPreferenceChange(() => run());

  return destroy;
}

export function destroy() {
  if (onResize) window.removeEventListener("resize", onResize);
  originals.forEach((_, el) => restore(el));
  originals.clear();
  onResize = null;
}
