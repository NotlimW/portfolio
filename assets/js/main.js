/**
 * main.js — orchestration, and nothing else.
 *
 * Every module owns one behaviour and exposes init()/destroy(). Order
 * matters in exactly one place: smooth-scroll runs first, because it owns
 * the scroll loop everything else subscribes to.
 *
 * A module that throws must not take the page down with it. The site has to
 * stay readable and navigable even if a CDN is slow or an effect breaks.
 */

import * as smoothScroll from "./modules/smooth-scroll.js";
import * as typeset from "./modules/typeset.js";
import * as scene from "./modules/scene.js";
import * as particles from "./modules/particles.js";
import * as fit from "./modules/fit.js";
import * as split from "./modules/split.js";
import * as reveal from "./modules/reveal.js";
import * as statement from "./modules/statement.js";
import * as parallax from "./modules/parallax.js";
import * as aiFlow from "./modules/ai-flow.js";
import * as thread from "./modules/thread.js";
import * as giants from "./modules/giants.js";
import * as preview from "./modules/preview.js";
import * as depth from "./modules/depth.js";
import * as logos from "./modules/logos.js";
import * as projects from "./modules/projects.js";
import * as masonry from "./modules/masonry.js";
import * as nav from "./modules/nav.js";
import * as menu from "./modules/menu.js";
import * as cursor from "./modules/cursor.js";
import * as copy from "./modules/copy.js";
import * as timeline from "./modules/timeline.js";
import * as brand from "./modules/brand.js";
import * as counter from "./modules/counter.js";
import * as track from "./modules/track.js";
import { scrollTo } from "./modules/smooth-scroll.js";

/** smooth-scroll first — it is the dependency, not a peer. */
const modules = [
  smoothScroll,
  typeset,          // before split / statement: they build lines from the layout
  scene,
  particles,
  fit,
  nav,
  menu,
  split,
  reveal,
  statement,
  parallax,
  aiFlow,
  thread,
  giants,
  preview,
  depth,
  logos,
  projects,
  masonry,
  track,
  counter,
  cursor,
  copy,
  timeline,
  brand,
];

const teardown = [];

function boot() {
  modules.forEach((module) => {
    try {
      teardown.push(module.init() ?? module.destroy);
    } catch (error) {
      console.error("[main] module failed to start:", error);
    }
  });

  // Anchor links go through Lenis so in-page jumps match the page's feel.
  document.addEventListener("click", (event) => {
    // A link that has already handled its own click (the dock's first tap on
    // "Work" only opens the group) is left alone.
    if (event.defaultPrevented) return;
    const link = event.target.closest('a[href^="#"]');
    const id = link?.getAttribute("href");
    if (!id || id === "#") return;

    const destination = document.querySelector(id);
    if (!destination) return;

    event.preventDefault();
    scrollTo(destination);
    history.pushState(null, "", id);
    destination.setAttribute("tabindex", "-1");
    destination.focus({ preventScroll: true });
  });

  document.documentElement.dataset.ready = "true";
}

/** Local time in Stockholm, for the footer and the menu. */
function clock() {
  const targets = document.querySelectorAll("[data-clock]");
  if (!targets.length) return;

  const format = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Stockholm",
  });

  const tick = () => targets.forEach((el) => { el.textContent = format.format(new Date()); });
  tick();
  setInterval(tick, 30_000);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => { boot(); clock(); });
} else {
  boot();
  clock();
}

window.addEventListener("pagehide", () => {
  teardown.forEach((fn) => { try { fn?.(); } catch { /* nothing left to save */ } });
});
