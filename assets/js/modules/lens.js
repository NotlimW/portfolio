/**
 * lens.js — the glass drops are liquid, and the pointer can push them.
 *
 * Each drop is an outline of POINTS rather than a fixed shape. Every point
 * sits on a slowly drifting base radius (a few low harmonics, different per
 * drop, so no two drops share a silhouette and none of them is ever round),
 * and carries a spring: an offset, a velocity, a stiffness and a damping.
 *
 * The pointer acts on the springs:
 *   - near the outside of a drop, the nearest stretch of rim reaches out
 *     toward it, like surface tension catching on a fingertip;
 *   - inside, the rim near the pointer is pushed in after it, so dragging
 *     through a drop dents and drags the membrane;
 *   - pointer speed is fed in as an impulse along each point's normal, so a
 *     fast swipe sends a wave around the rim instead of a polite bulge.
 *
 * Rendering: the outline becomes one closed Catmull-Rom curve, written to
 *   - .lens__glass  as clip-path: path() — the frosted backdrop is cut to it
 *   - .lens__rim    as an SVG path — highlight hairline, shade, glint
 *   - .lens__shadow as an SVG path — the warm cast shadow, blurred in CSS
 * clip-path rather than a mask because it can be rewritten every frame
 * cheaply. The static CSS mask in lens.css stays as the no-JS fallback.
 *
 * Under reduced motion the drop is drawn once, at rest, and left alone.
 */

import { onScroll } from "./smooth-scroll.js";
import { motionAllowed, hasFinePointer } from "./motion-prefs.js";

const POINTS = 14;
const PAD = 0.38;          // extra room around the drop for it to bulge into
const ASPECT = 1.16;       // drops are taller than they are wide
/* Tuned to flow, not bounce: a soft spring with heavy damping sits just
   under critical, so the rim glides to where the pointer puts it and
   eases back with at most a faint overshoot — like something viscous,
   not something elastic. */
const STIFF = 0.032;       // spring back toward the resting outline
const DAMP = 0.78;         // per-frame velocity retention — lower = thicker
const REACH = 0.85;        // how far outside the rim (× radius) the pointer acts
const SPREAD = 0.5;        // angular width of the pointer's influence (rad)
const DRIFT_EASE = 0.03;   // how quickly the whole drop leans toward the pointer
const SCROLL_LIFT = 0.12;

/* Per-outline harmonics: [order, amplitude, phase, drift speed]. These are
   what make the drops read as spilled glass rather than as bubbles. */
const SHAPES = {
  a: [[2, 0.16, 0.4, 0.11], [3, 0.11, 2.1, -0.07], [5, 0.035, 1.0, 0.13]],
  b: [[2, 0.22, 1.6, -0.09], [3, 0.07, 0.3, 0.12], [4, 0.06, 2.6, 0.05]],
  c: [[2, 0.12, 2.9, 0.08], [3, 0.15, 1.2, 0.1], [4, 0.05, 0.2, -0.12]],
};

const SVG = "http://www.w3.org/2000/svg";
let lenses = [];
let frame = 0;
let unsubscribe = null;
let pointer = { x: -1e4, y: -1e4, vx: 0, vy: 0, t: 0 };
let animate = false;

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG, tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

let gradientId = 0;

/** Builds the live layers inside a .lens and returns its state. */
function build(el) {
  const id = ++gradientId;
  const variant = ["a", "b", "c"].find((v) => el.classList.contains(`lens--${v}`)) || "a";

  const shadow = svgEl("svg", { class: "lens__shadow", "aria-hidden": "true" });
  const shadowPath = svgEl("path");
  shadow.append(shadowPath);

  const glass = document.createElement("span");
  glass.className = "lens__glass";

  const rim = svgEl("svg", { class: "lens__rim", "aria-hidden": "true" });
  const defs = svgEl("defs");
  defs.innerHTML =
    `<linearGradient id="lr${id}" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="#fff" stop-opacity=".95"/>` +
    `<stop offset=".45" stop-color="#fff" stop-opacity=".22"/>` +
    `<stop offset=".8" stop-color="#fff" stop-opacity="0"/></linearGradient>` +
    `<linearGradient id="ls${id}" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset=".45" stop-color="#170f08" stop-opacity="0"/>` +
    `<stop offset="1" stop-color="#170f08" stop-opacity=".5"/></linearGradient>` +
    `<filter id="lb${id}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>` +
    `<filter id="lg${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2"/></filter>`;
  const shade = svgEl("path", { fill: "none", stroke: `url(#ls${id})`, "stroke-width": "22", filter: `url(#lb${id})` });
  const line = svgEl("path", { fill: "none", stroke: `url(#lr${id})`, "stroke-width": "2" });
  const glint = svgEl("ellipse", { fill: "#fff", "fill-opacity": ".85", filter: `url(#lg${id})` });
  const glint2 = svgEl("ellipse", { fill: "#fff", "fill-opacity": ".35", filter: `url(#lg${id})` });
  rim.append(defs, shade, line, glint, glint2);

  el.append(shadow, glass, rim);
  el.classList.add("lens--live");

  return {
    el, glass, shadow, shadowPath, rim, shade, line, glint, glint2,
    harmonics: SHAPES[variant].map((h) => h.slice()),
    host: el.closest("section, footer") ?? el.parentElement,
    anchor: el.parentElement,
    baseTilt: parseFloat(getComputedStyle(el).getPropertyValue("--lr")) || 0,
    offset: new Float32Array(POINTS),
    velocity: new Float32Array(POINTS),
    dx: 0, dy: 0, lift: 0,
    size: 0, visible: true, time: Math.random() * 100,
  };
}

function measure(lens) {
  lens.size = lens.el.offsetWidth;
  const box = lens.size * (1 + PAD * 2);
  [lens.shadow, lens.rim].forEach((svg) => svg.setAttribute("viewBox", `0 0 ${box} ${box}`));
}

/** Resting radius of point i at the drop's current time. */
function baseRadius(lens, angle) {
  let r = 1;
  lens.harmonics.forEach(([n, amp, phase, speed]) => {
    r += amp * Math.cos(n * angle + phase + lens.time * speed);
  });
  return r;
}

/** Closed Catmull-Rom spline through the points, as an SVG path string. */
function curve(pts) {
  const n = pts.length;
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return `${d}Z`;
}

function step(lens, dt) {
  if (!lens.size) measure(lens);
  const R = lens.size / 2;
  const box = lens.size * (1 + PAD * 2);
  const c = box / 2;

  // Pointer in the drop's own frame: relative to its centre, un-rotated.
  const rect = lens.el.getBoundingClientRect();
  const tilt = ((lens.baseTilt + (lens.lean || 0)) * Math.PI) / 180;
  const px = pointer.x - (rect.left + rect.width / 2);
  const py = pointer.y - (rect.top + rect.height / 2);
  const lx = px * Math.cos(-tilt) - py * Math.sin(-tilt);
  const ly = (px * Math.sin(-tilt) + py * Math.cos(-tilt)) / ASPECT;
  const pr = Math.hypot(lx, ly);
  const pa = Math.atan2(ly, lx);
  const near = pr < R * (1 + REACH + 0.5);

  if (animate) lens.time += dt;

  const pts = [];
  for (let i = 0; i < POINTS; i++) {
    const a = (i / POINTS) * Math.PI * 2;
    const rest = baseRadius(lens, a) * R;

    if (animate) {
      let target = 0;
      if (near) {
        let da = a - pa;
        da = Math.atan2(Math.sin(da), Math.cos(da));
        const w = Math.exp(-(da * da) / (2 * SPREAD * SPREAD));
        const gap = pr - rest;
        if (gap < R * REACH && pr > rest * 0.25) {
          // Outside: reach toward the pointer. Inside: dent after it.
          target = Math.max(-0.6 * R, Math.min(0.42 * R, gap * (gap > 0 ? 0.6 : 0.85))) * w;
          // A fast pass kicks the rim along its normal.
          const normal = pointer.vx * Math.cos(a) + pointer.vy * Math.sin(a);
          lens.velocity[i] += normal * w * 0.012;
        }
      }
      lens.velocity[i] = (lens.velocity[i] + (target - lens.offset[i]) * STIFF) * DAMP;
      lens.offset[i] += lens.velocity[i];
    }

    const r = rest + lens.offset[i];
    pts.push([c + Math.cos(a) * r, c + Math.sin(a) * r * ASPECT]);
  }

  const d = curve(pts);
  lens.glass.style.clipPath = `path("${d}")`;
  lens.shadowPath.setAttribute("d", d);
  lens.shade.setAttribute("d", d);
  lens.line.setAttribute("d", d);

  // Glints ride the upper-left and lower-right of the live outline.
  const g = pts[Math.round(POINTS * 0.62) % POINTS];
  const g2 = pts[Math.round(POINTS * 0.12) % POINTS];
  lens.glint.setAttribute("cx", (c + (g[0] - c) * 0.72).toFixed(1));
  lens.glint.setAttribute("cy", (c + (g[1] - c) * 0.72).toFixed(1));
  lens.glint.setAttribute("rx", (R * 0.2).toFixed(1));
  lens.glint.setAttribute("ry", (R * 0.065).toFixed(1));
  lens.glint.setAttribute("transform", `rotate(-28 ${lens.glint.getAttribute("cx")} ${lens.glint.getAttribute("cy")})`);
  lens.glint2.setAttribute("cx", (c + (g2[0] - c) * 0.78).toFixed(1));
  lens.glint2.setAttribute("cy", (c + (g2[1] - c) * 0.78).toFixed(1));
  lens.glint2.setAttribute("rx", (R * 0.09).toFixed(1));
  lens.glint2.setAttribute("ry", (R * 0.03).toFixed(1));

  // The whole drop leans a little toward the pointer when it is close.
  if (animate) {
    const pull = near ? 0.05 : 0;
    lens.dx += (px * pull - lens.dx) * DRIFT_EASE;
    lens.dy += (py * pull - lens.dy) * DRIFT_EASE;
    lens.lean = Math.max(-1, Math.min(1, lens.dx / 80)) * 5;
    lens.el.style.setProperty("--lx", `${lens.dx.toFixed(1)}px`);
    lens.el.style.setProperty("--ly", `${(lens.dy + lens.lift).toFixed(1)}px`);
    lens.el.style.setProperty("--lr", `${(lens.baseTilt + lens.lean).toFixed(2)}deg`);
  }
}

let last = 0;
function tick(now) {
  frame = requestAnimationFrame(tick);
  const dt = Math.min(0.05, (now - (last || now)) / 1000);
  last = now;
  lenses.forEach((lens) => { if (lens.visible) step(lens, dt); });
  // Pointer speed decays between events, so a stopped pointer stops kicking.
  pointer.vx *= 0.8;
  pointer.vy *= 0.8;
}

function onPointer(event) {
  const now = performance.now();
  const dt = Math.max(8, now - pointer.t);
  if (pointer.t) {
    pointer.vx = ((event.clientX - pointer.x) / dt) * 16;
    pointer.vy = ((event.clientY - pointer.y) / dt) * 16;
  }
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.t = now;
}

const onResize = () => lenses.forEach(measure);

export function init(root = document) {
  const els = Array.from(root.querySelectorAll("[data-lens]"));
  if (!els.length) return () => {};
  if (!CSS.supports("clip-path", 'path("M0 0")')) return () => {};

  animate = motionAllowed();
  lenses = els.map(build);
  lenses.forEach(measure);
  window.addEventListener("resize", onResize, { passive: true });

  if (!animate) {
    lenses.forEach((lens) => step(lens, 0));
    return destroy;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      lenses.forEach((l) => { if (l.host === entry.target) l.visible = entry.isIntersecting; });
    });
  });
  lenses.forEach((lens) => observer.observe(lens.host));

  unsubscribe = onScroll(() => {
    const vh = window.innerHeight;
    lenses.forEach((lens) => {
      if (!lens.visible) return;
      const rect = lens.anchor.getBoundingClientRect();
      const centred = rect.top + rect.height / 2 - vh / 2;
      lens.lift = Math.max(-vh, Math.min(vh, centred)) * SCROLL_LIFT;
    });
  });

  if (hasFinePointer()) window.addEventListener("pointermove", onPointer, { passive: true });
  frame = requestAnimationFrame(tick);

  return () => {
    observer.disconnect();
    destroy();
  };
}

export function destroy() {
  cancelAnimationFrame(frame);
  unsubscribe?.();
  unsubscribe = null;
  window.removeEventListener("pointermove", onPointer);
  window.removeEventListener("resize", onResize);
  lenses.forEach(({ el, shadow, glass, rim }) => {
    shadow.remove(); glass.remove(); rim.remove();
    el.classList.remove("lens--live");
    ["--lx", "--ly", "--lr"].forEach((p) => el.style.removeProperty(p));
  });
  lenses = [];
}
