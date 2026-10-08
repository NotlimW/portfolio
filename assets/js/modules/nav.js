/**
 * nav.js — the dock, the menu button, the topbar, and knowing where you are.
 *
 * Five jobs:
 *
 *   Bring the dock and the menu button in once the visitor has committed to
 *   reading, and take them away again at the top — where the topbar is still
 *   on screen and doing the same job better.
 *
 *   Publish scroll progress as a custom property, once, on the root. The dock
 *   draws its own ring from it and anything else that wants the number can
 *   read it without measuring scroll again.
 *
 *   Mark the section you are currently in. A table of contents that doesn't
 *   say where you are is just a list. A link's territory isn't only the
 *   section carrying its id — a transition beat (a statement, a slide seam)
 *   can belong to the case it's introducing or closing, tagged in the markup
 *   with data-nav-section="<id>" rather than guessed from position.
 *
 *   Open the Work group — on hover, on focus, on tap, and also simply by
 *   being in one of its three sections — and widen the dock to show it
 *   inline rather than popping a second panel above the first.
 *
 *   Give every dock and topbar label the same roll-over the site used to
 *   have on its single pill: the resting word slides up and out, an accent
 *   twin slides up to replace it. Built here, not in CSS alone, because the
 *   incoming copy has to be aria-hidden — the accessible name stays one word.
 *
 * Section positions are measured once, then re-measured whenever the page's
 * own height changes — never per frame. A frame does arithmetic against
 * numbers it already has.
 */

import { onScroll } from "./smooth-scroll.js";

/** Where the dock and menu button appear, as a fraction of the viewport. */
const ARRIVE_AT = 0.7;

let unsubscribe = null;
let onResize = null;
let bodyObserver = null;
let group = null;
let onDocPointer = null;
let endObserver = null;

/**
 * The group is open if either is true: a pointer or keyboard focus is on it,
 * or the section you're currently reading is one of its own. Two independent
 * sources, one combined state — see syncGroup().
 */
let hoverOpen = false;
let sectionOpen = false;

const late = [];
const links = [];
const rolls = [];
let sections = [];

/**
 * Cache every region that counts as a link's territory: its own #id section,
 * plus any element elsewhere in the page tagged data-nav-section="<id>" — a
 * transition beat that visually belongs to that case even though the case
 * itself doesn't contain it. Each region is pushed separately rather than
 * merged into one range; as long as they sit back to back in the document
 * (which is how they're used) the dock reads as continuous across them.
 */
function measureSections() {
  const regions = [];

  links.forEach(({ link, id }) => {
    const primary = document.getElementById(id);
    if (primary) regions.push({ link, el: primary });

    document.querySelectorAll(`[data-nav-section="${id}"]`).forEach((el) => {
      regions.push({ link, el });
    });
  });

  sections = regions.map(({ link, el }) => {
    const rect = el.getBoundingClientRect();
    return { link, top: rect.top + window.scrollY, bottom: rect.bottom + window.scrollY };
  });
}

/**
 * The natural width of the Work group's sub-row, read while it is still
 * clipped to zero. An element with overflow: hidden reports its content's
 * full size via scrollWidth regardless of its own clipped width, as long as
 * that content doesn't wrap — which .dock__sublink guarantees with
 * white-space: nowrap. Same "measure once, animate the number" shape as
 * track.js's --track-distance.
 */
function measureSubWidth() {
  if (!group) return;
  const width = group.sub.scrollWidth;
  if (width) group.sub.style.setProperty("--dock-sub-w", `${width}px`);
}

/**
 * Wraps a link's label in two stacked copies so it can roll on hover — the
 * resting word slides up and out, an accent-coloured twin slides up to
 * replace it. Both move on one transform (see .roll in nav.css), which is
 * what makes the swap read as a mechanism rather than as two animations.
 *
 * Only the label's own text node is touched, not the link's full children —
 * "Work" carries a caret span alongside its text, and replacing everything
 * would delete it. The incoming copy is aria-hidden, so the accessible name
 * stays the plain word the link already had.
 */
function buildRoll(link) {
  if (link.querySelector(".roll")) return;

  const textNode = [...link.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
  if (!textNode) return;
  const label = textNode.textContent.trim();

  const roll = document.createElement("span");
  roll.className = "roll";

  const out = document.createElement("span");
  out.className = "roll__face";
  out.textContent = label;

  const into = document.createElement("span");
  into.className = "roll__face roll__face--in";
  into.setAttribute("aria-hidden", "true");
  into.textContent = label;

  roll.append(out, into);
  textNode.replaceWith(roll);
  rolls.push({ roll, label });
}

function clearRolls() {
  rolls.forEach(({ roll, label }) => roll.replaceWith(label));
  rolls.length = 0;
}

/** Writes data-current as a real "true"/"false" string, only when it changes. */
function setState(el, value) {
  const str = String(value);
  if (el.dataset.current !== str) el.dataset.current = str;
}

function setCurrent(y) {
  // The section under the middle of the screen is the one you are reading.
  const probe = y + window.innerHeight / 2;
  let active = null;

  for (const section of sections) {
    if (probe >= section.top && probe < section.bottom) { active = section.link; break; }
  }

  links.forEach(({ link }) => setState(link, link === active));

  if (group) {
    // The parent link shares no id of its own — it reads as current
    // whenever any of its three children does.
    sectionOpen = links.some(({ link, inGroup }) => inGroup && link.dataset.current === "true");
    setState(group.parent, sectionOpen);
    syncGroup();
  }
}

/** The one place hoverOpen and sectionOpen become the state CSS and ARIA read. */
/** Phones: the Work group never opens. "Work" is a plain link there. */
const narrow = () => window.matchMedia("(max-width: 48rem)").matches;

function syncGroup() {
  if (!group) return;
  const open = !narrow() && (hoverOpen || sectionOpen);
  const str = String(open);
  if (group.el.dataset.open === str) return;
  group.el.dataset.open = str;
  group.parent.setAttribute("aria-expanded", str);
  revealGroup(open);
}

/**
 * On a narrow screen the dock is a sideways-scrolling strip, and an opened
 * Work row can push past its edge. Slide the strip so the group sits in
 * view while open, and back to the start when it closes.
 */
function revealGroup(open) {
  const dock = group.el.parentElement;
  if (dock.scrollWidth <= dock.clientWidth && !open) {
    if (dock.scrollLeft) dock.scrollTo({ left: 0, behavior: "smooth" });
    return;
  }
  // Wait out the width transition, then measure the settled row.
  clearTimeout(group.revealTimer);
  group.revealTimer = setTimeout(() => {
    if (dock.scrollWidth <= dock.clientWidth) return;
    const left = open ? group.el.offsetLeft - 4 : 0;
    dock.scrollTo({ left, behavior: "smooth" });
  }, open ? 260 : 0);
}

function setHoverOpen(open) {
  hoverOpen = open;
  syncGroup();
}

export function init(root = document) {
  const dock = root.querySelector("[data-dock]");
  const hero = root.querySelector("[data-hero]");

  root.querySelectorAll("[data-late]").forEach((el) => late.push(el));

  // The topbar's roll is independent of the dock existing at all — it's
  // present from the first frame, before there's anything to scroll into.
  root.querySelectorAll(".topbar__link").forEach(buildRoll);

  if (dock) {
    // Every dock label rolls, "Work" included — buildRoll only touches its
    // own text node, so the caret sitting beside it is untouched.
    dock.querySelectorAll(".dock__link, .dock__sublink").forEach(buildRoll);

    // The parent link is excluded here on purpose: it shares its href (and
    // so its target id) with the "Content" sub-link, and tracking both would
    // make setCurrent() highlight whichever happened to come first. Its own
    // current-state is derived instead, from whether any child is current.
    dock.querySelectorAll(".dock__link:not(.dock__link--parent), .dock__sublink").forEach((link) => {
      const id = link.getAttribute("href")?.replace("#", "");
      if (id) links.push({ link, id, inGroup: link.classList.contains("dock__sublink") });
    });

    const groupEl = dock.querySelector(".dock__group");
    if (groupEl) {
      group = {
        el: groupEl,
        parent: groupEl.querySelector(".dock__link--parent"),
        sub: groupEl.querySelector(".dock__sub"),
      };

      // A touch also fires pointerenter and focus, both before its click —
      // left in, they would open the group just in time for the first tap
      // to follow the link. Touch is handled by the tap logic below instead.
      const isTouch = () => !window.matchMedia("(hover: hover)").matches;
      groupEl.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") setHoverOpen(true); });
      groupEl.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") setHoverOpen(false); });
      groupEl.addEventListener("focusin", (e) => { if (!isTouch() && e.target.matches(":focus-visible")) setHoverOpen(true); });
      groupEl.addEventListener("focusout", (event) => {
        if (!isTouch() && !groupEl.contains(event.relatedTarget)) setHoverOpen(false);
      });

      // Touch has no hover: a tap on a closed "Work" opens it, a tap on an
      // open one follows the link. Anything else on the page closes it.
      // Judged by the tap itself, not by (hover: hover) — a touch laptop
      // reports hover and would otherwise never get the first-tap-opens step.
      let openAtDown = true;
      group.parent.addEventListener("pointerdown", (event) => {
        openAtDown = event.pointerType === "mouse" || narrow() || groupEl.dataset.open === "true";
      });
      group.parent.addEventListener("click", (event) => {
        if (!openAtDown) { event.preventDefault(); setHoverOpen(true); }
        openAtDown = true;
      });

      onDocPointer = (event) => {
        if (!groupEl.contains(event.target)) setHoverOpen(false);
      };
      document.addEventListener("pointerdown", onDocPointer);

      measureSubWidth();
      document.fonts?.ready.then(measureSubWidth);
    }
  }

  measureSections();

  // The real bug this guards against: section positions were measured once,
  // synchronously, before masonry.js had built the creative wall's columns
  // and before any lazy image had loaded — both of which change the page's
  // height well after nav.js's own init(). Every section below that point
  // then carried a stale offset for the rest of the session, and the dock
  // would highlight the wrong — or no — link once you scrolled past it.
  //
  // A ResizeObserver on the body is the general fix: it re-measures on *any*
  // height change, whatever caused it, rather than chasing each cause
  // individually (fonts, images, a later module's own layout pass). Same
  // tool masonry.js already uses to keep its own measurements honest.
  if ("ResizeObserver" in window) {
    bodyObserver = new ResizeObserver(() => {
      measureSections();
      setCurrent(window.scrollY);
    });
    bodyObserver.observe(document.body);
  }

  let lastProgress = "";
  let atEnd = false;
  const bleed = root.querySelector(".footer__bleed");
  if (bleed && dock) {
    endObserver = new IntersectionObserver(([entry]) => {
      atEnd = entry.isIntersecting;
      const on = !atEnd && window.scrollY > window.innerHeight * ARRIVE_AT;
      dock.dataset.shown = String(on);
    // The word is set to sink below the page's last pixel, so its box can sit
    // just under the fold even at the very bottom: reach a little past it.
    }, { rootMargin: "0px 0px 25% 0px" });
    endObserver.observe(bleed);
  }
  unsubscribe = onScroll(({ y, progress }) => {
    // On the dock, its only reader — not on the root. A custom property set
    // on <html> is inherited by every element, so writing it there made the
    // browser restyle the whole page on every scroll frame: ~10ms a frame,
    // the largest single cost on the page.
    const p = progress.toFixed(3);
    if (dock && p !== lastProgress) {
      lastProgress = p;
      dock.style.setProperty("--scroll-progress", p);
    }

    // The scroll cue stops inviting once the invitation has been accepted.
    const scrolled = String(y > 40);
    if (hero && hero.dataset.scrolled !== scrolled) hero.dataset.scrolled = scrolled;

    const shown = y > window.innerHeight * ARRIVE_AT;
    late.forEach((el) => {
      // The dock also steps aside over the footer's closing word: the footer
      // carries its own links there, and the pill sat on top of the name.
      const on = shown && !(el === dock && atEnd);
      if ((el.dataset.shown === "true") !== on) el.dataset.shown = String(on);
    });
    if (!shown) setHoverOpen(false);

    setCurrent(y);
  });

  onResize = () => {
    measureSections();
    measureSubWidth();
    setCurrent(window.scrollY);
  };
  window.addEventListener("resize", onResize, { passive: true });

  return destroy;
}

export function destroy() {
  unsubscribe?.();
  if (onResize) window.removeEventListener("resize", onResize);
  if (onDocPointer) document.removeEventListener("pointerdown", onDocPointer);
  bodyObserver?.disconnect();
  endObserver?.disconnect();
  endObserver = null;

  late.forEach((el) => delete el.dataset.shown);
  links.forEach(({ link }) => delete link.dataset.current);
  clearRolls();
  if (group) {
    clearTimeout(group.revealTimer);
    delete group.el.dataset.open;
    delete group.parent.dataset.current;
    group.parent.removeAttribute("aria-expanded");
  }

  late.length = 0;
  links.length = 0;
  sections = [];
  hoverOpen = false;
  sectionOpen = false;
  unsubscribe = null;
  onResize = null;
  bodyObserver = null;
  group = null;
  onDocPointer = null;
}
