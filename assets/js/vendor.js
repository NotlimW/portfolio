/**
 * vendor.js — every third-party dependency enters the project here.
 *
 * One file to audit, one file to pin, one file to swap if a CDN ever goes
 * down. Nothing else in the codebase imports from a URL.
 *
 * Before deploy: replace the major-version ranges with exact versions, or
 * vendor the files into assets/js/vendor/ so the site has no runtime
 * dependency on a third party at all.
 */

export { animate, inView, stagger } from "https://cdn.jsdelivr.net/npm/motion@12/+esm";
export { default as Lenis } from "https://cdn.jsdelivr.net/npm/lenis@1/+esm";
