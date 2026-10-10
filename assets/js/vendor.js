/**
 * vendor.js — the third-party libraries every page uses, pinned to exact
 * versions so the site cannot change under us.
 *
 * three.js is the one exception: projects.js loads it on demand, only on
 * the page with the WebGL carousel, from its own pinned URL.
 */

export { animate, inView, stagger } from "https://cdn.jsdelivr.net/npm/motion@12.43.0/+esm";
export { default as Lenis } from "https://cdn.jsdelivr.net/npm/lenis@1.3.26/+esm";
