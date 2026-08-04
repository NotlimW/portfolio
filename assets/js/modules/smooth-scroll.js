/**
 * smooth-scroll.js — Lenis, plus the single scroll loop the whole site reads.
 *
 * Every scroll-linked effect on the page subscribes here rather than adding
 * its own listener. One rAF loop, one layout read per frame — which is the
 * difference between a site that feels smooth and a site that stutters as
 * soon as it has more than three effects on a page.
 *
 * Touch scrolling is deliberately left native. Smoothing it costs the
 * momentum people expect from their own device and gains nothing.
 */

import { Lenis } from "../vendor.js";
import { motionAllowed } from "./motion-prefs.js";

let lenis = null;
let rafId = null;
const subscribers = new Set();

/**
 * Subscribe to the scroll loop.
 * @param {(state: {y: number, progress: number, velocity: number}) => void} cb
 * @returns {() => void} unsubscribe
 */
export function onScroll(cb) {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}

/** Programmatic scroll that works whether or not Lenis is running. */
export function scrollTo(target, options = {}) {
  if (lenis) {
    lenis.scrollTo(target, { offset: -80, duration: 1.1, ...options });
    return;
  }
  const el = typeof target === "string" ? document.querySelector(target) : target;
  el?.scrollIntoView({ behavior: "auto", block: "start" });
}

/** Pause scrolling — used while the menu curtain is open. */
export const stop = () => lenis?.stop();
export const start = () => lenis?.start();

function broadcast(state) {
  subscribers.forEach((cb) => cb(state));
}

function nativeState() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return { y, progress: max > 0 ? y / max : 0, velocity: 0 };
}

export function init() {
  // Reduced motion: no smoothing, but effects that depend on scroll position
  // still need to know where the page is, so the loop keeps running.
  if (!motionAllowed()) {
    const onNativeScroll = () => broadcast(nativeState());
    window.addEventListener("scroll", onNativeScroll, { passive: true });
    broadcast(nativeState());
    return () => window.removeEventListener("scroll", onNativeScroll);
  }

  lenis = new Lenis({
    lerp: Number(
      getComputedStyle(document.documentElement).getPropertyValue("--lenis-lerp")
    ) || 0.09,
    wheelMultiplier: 1,
    smoothWheel: true,
    syncTouch: false,
    autoRaf: false,
  });

  lenis.on("scroll", ({ scroll, progress, velocity }) => {
    broadcast({ y: scroll, progress, velocity });
  });

  const raf = (time) => {
    lenis.raf(time);
    rafId = requestAnimationFrame(raf);
  };
  rafId = requestAnimationFrame(raf);

  broadcast(nativeState());
  return destroy;
}

export function destroy() {
  if (rafId) cancelAnimationFrame(rafId);
  lenis?.destroy();
  lenis = null;
  rafId = null;
  subscribers.clear();
}
