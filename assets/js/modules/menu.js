/**
 * menu.js — the full-screen curtain.
 *
 * The overlay expands from the trigger button using a clip-path circle, so
 * it reads as coming from the thing that was pressed. The origin is measured
 * at open time and handed to CSS.
 *
 * Accessibility is the majority of this file, and that is the right ratio.
 * A menu that traps a keyboard user is broken no matter how it animates.
 */

import { stop as stopScroll, start as startScroll } from "./smooth-scroll.js";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

let toggle = null;
let menu = null;
let lastFocused = null;
/** Whether the last thing the visitor did was a key press, not a pointer. */
let viaKeyboard = false;
const onAnyKey = () => { viaKeyboard = true; };
const onAnyPointer = () => { viaKeyboard = false; };

const isOpen = () => menu?.dataset.open === "true";

function setOrigin() {
  const rect = toggle.getBoundingClientRect();
  menu.style.setProperty("--origin-x", `${rect.left + rect.width / 2}px`);
  menu.style.setProperty("--origin-y", `${rect.top + rect.height / 2}px`);
}

function open() {
  lastFocused = document.activeElement;
  setOrigin();

  menu.dataset.open = "true";
  menu.removeAttribute("inert");
  toggle.setAttribute("aria-expanded", "true");
  document.documentElement.classList.add("is-menu-open");
  stopScroll();

  // Focus moves into the menu either way (keyboard users need it there), but
  // the ring only shows when the menu was opened from the keyboard.
  menu.querySelector(FOCUSABLE)?.focus({ focusVisible: viaKeyboard });
}

function close({ restoreFocus = true } = {}) {
  menu.dataset.open = "false";
  menu.setAttribute("inert", "");
  toggle.setAttribute("aria-expanded", "false");
  document.documentElement.classList.remove("is-menu-open");
  startScroll();

  if (restoreFocus) (lastFocused ?? toggle).focus({ focusVisible: viaKeyboard });
}

function onKeydown(event) {
  if (!isOpen()) return;

  if (event.key === "Escape") {
    event.preventDefault();
    close();
    return;
  }

  if (event.key !== "Tab") return;

  // Focus trap. `inert` already hides the page behind, but Safari has been
  // inconsistent about it for long enough to be worth the belt and braces.
  const items = Array.from(menu.querySelectorAll(FOCUSABLE));
  if (!items.length) return;

  const first = items[0];
  const last = items[items.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export function init(root = document) {
  toggle = root.querySelector("[data-menu-toggle]");
  menu = root.querySelector("[data-menu]");
  if (!toggle || !menu) return () => {};

  menu.setAttribute("inert", "");
  menu.dataset.open = "false";

  toggle.addEventListener("click", () => (isOpen() ? close() : open()));
  menu.querySelector("[data-menu-close]")?.addEventListener("click", () => close());
  document.addEventListener("keydown", onKeydown);
  document.addEventListener("keydown", onAnyKey, true);
  document.addEventListener("pointerdown", onAnyPointer, true);

  // Navigating within the page should close the curtain behind you.
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) close({ restoreFocus: false });
  });

  window.addEventListener("resize", () => { if (isOpen()) setOrigin(); });

  return destroy;
}

export function destroy() {
  document.removeEventListener("keydown", onKeydown);
  document.removeEventListener("keydown", onAnyKey, true);
  document.removeEventListener("pointerdown", onAnyPointer, true);
  if (isOpen()) close({ restoreFocus: false });

}
