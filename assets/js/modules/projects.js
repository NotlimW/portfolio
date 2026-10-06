/**
 * projects.js — previous work on a curved track (WebGL).
 *
 * The cards stand on the inside of a large cylinder with the camera at its
 * centre: the card in front of you bows away, and the ones to the side
 * swing round to face you and fade into the page. There is no stage of its
 * own — the canvas is transparent over the section's dot field, so the
 * track stands on the same ground as everything else. Idea from
 * jesperlandberg.com, rebuilt here from scratch.
 *
 * How it moves
 *   The section is tall and its stage is sticky, so the page scroll is the
 *   input: progress through the section maps to a position along the
 *   track. The track eases toward that position, and the gap between where
 *   it is and where it is going — its speed — bows the cards further and
 *   leans them, so a fast flick reads as momentum. The cards behave like
 *   cloth rather than board: edges trail the middle, the bottom trails the
 *   top, speed sends a wave through them, the bend lets go slowly after
 *   the track stops, and at rest they still breathe. The track is a loop:
 *   positions wrap round the cylinder, so there are cards on both sides
 *   from the first frame and the last card hands back to the first.
 *   Dragging the canvas
 *   moves the page scroll, so drag and scroll are one input, never two
 *   that disagree.
 *
 * How it is drawn
 *   One plane per card, 48 segments wide. The vertex shader wraps it onto
 *   the cylinder, so the curve is real geometry rather than a CSS trick.
 *   Each card's face is a 2D canvas painted from its <li>: the image (or a
 *   flat tone), a shade, the title and an arrow. Rounded corners are cut in
 *   the fragment shader with a rounded-box distance field.
 *
 * Content
 *   The <ol> in the markup is the source of truth. The canvas is
 *   aria-hidden decoration over it; the list stays in the tab order, and
 *   focusing a link scrolls its card to the middle. If three.js fails to
 *   load, the section simply keeps showing the list.
 */

import { onScroll, scrollTo } from "./smooth-scroll.js";
import { prefersReducedMotion } from "./motion-prefs.js";

const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const CARD_W = 4.2;
const CARD_H = 2.75;
const GAP = 0.5;
const STEP = CARD_W + GAP;
const RADIUS = 6.2;        // of the cylinder the cards stand on
const CORNER = 0.16;       // corner radius, world units
const EASE = 0.05;         // how quickly the track catches the scroll — low = glides
const BEND = 0.85;         // how much speed bows a card
const SETTLE = 0.06;       // how slowly the bend lets go once the track slows
const TEX_W = 1024;

let section, stage, canvas, items;
let THREE, renderer, scene, camera, cards = [];
let current = 0, target = 0, speed = 0;
let frame = 0, visible = false, unsubscribe = null, observer = null;
let pointer = { x: 0, y: 0, inside: false, down: false, startX: 0, startScroll: 0, moved: 0 };
let hovered = -1;
const cleanups = [];

/* ---- Card faces --------------------------------------------------------- */

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Paints one card face: picture (or tone), shade, title, arrow. */
async function paint(item) {
  const w = TEX_W;
  const h = Math.round(TEX_W * (CARD_H / CARD_W));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");

  const ink = cssVar("--c-ink") || "#17120E";
  const paper = cssVar("--c-paper") || "#FBFAF7";
  const sun = cssVar("--c-sun") || "#FFD21A";
  const tone = item.dataset.tone;
  const title = item.querySelector("a").textContent.trim();
  const img = item.dataset.image ? await loadImage(item.dataset.image) : null;

  if (img) {
    // object-fit: cover
    const s = Math.max(w / img.width, h / img.height);
    const iw = img.width * s, ih = img.height * s;
    ctx.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih);
    const shade = ctx.createLinearGradient(0, h * 0.45, 0, h);
    shade.addColorStop(0, "rgba(0,0,0,0)");
    shade.addColorStop(1, "rgba(0,0,0,0.6)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, w, h);
  } else {
    // No picture: the card is a poster in its own right — a flat field and
    // the title set large, the way the rest of the site sets its giants.
    ctx.fillStyle = tone === "sun" ? sun : "#241C15";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = tone === "sun" ? ink : paper;
    ctx.font = `800 ${Math.round(h * 0.2)}px "Bricolage Grotesque", sans-serif`;
    ctx.textBaseline = "top";
    const words = title.split(" ");
    words.forEach((word, i) => ctx.fillText(word, w * 0.06, h * 0.08 + i * h * 0.19));
  }

  const onTone = tone === "sun" ? ink : paper;

  // Title, bottom left — the body face, like every other subhead.
  ctx.fillStyle = onTone;
  ctx.font = `500 ${Math.round(h * 0.075)}px Satoshi, sans-serif`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(title, w * 0.05, h * 0.9);

  // Arrow button, bottom right.
  const r = h * 0.055;
  const cx = w - w * 0.05 - r, cy = h * 0.9 - r * 0.35;
  ctx.fillStyle = tone === "sun" ? ink : sun;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = tone === "sun" ? sun : ink;
  ctx.lineWidth = r * 0.14;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.38, cy);
  ctx.lineTo(cx + r * 0.38, cy);
  ctx.moveTo(cx + r * 0.08, cy - r * 0.3);
  ctx.lineTo(cx + r * 0.38, cy);
  ctx.lineTo(cx + r * 0.08, cy + r * 0.3);
  ctx.stroke();

  return c;
}

/* ---- Shaders ------------------------------------------------------------ */

const vertex = /* glsl */ `
  uniform float uX;        // card centre along the track, minus the track offset
  uniform float uRadius;
  uniform float uBend;     // speed-driven bow, signed
  uniform float uHover;
  uniform float uTime;
  uniform float uPhase;    // per card, so no two cards wave in step
  varying vec2 vUv;
  varying float vSide;

  void main() {
    vUv = uv;
    vec3 p = position;
    p.xy *= 1.0 + uHover * 0.035;

    float across = p.x / ${(CARD_W / 2).toFixed(3)};   // -1 … 1, left to right
    float down = p.y / ${(CARD_H / 2).toFixed(3)};     // -1 … 1, bottom to top
    float drift = abs(uBend);

    // Cloth, not board. In motion the middle of the card leads and its
    // edges trail behind it, and the bottom trails further than the top —
    // the way a hung sheet moves when it is carried.
    float x = uX + p.x;
    x -= uBend * 0.38 * (1.0 - across * across);
    x += uBend * 0.22 * (1.0 - down) * 0.5;

    // Distance along the track becomes an angle round the cylinder.
    float theta = x / uRadius;
    vec3 w = vec3(uRadius * sin(theta), p.y, -uRadius * cos(theta));

    // Speed bows the card toward the camera across its width, and sends a
    // wave running through it in the direction of travel.
    w.z += drift * (1.0 - across * across) * 1.1;
    w.z += drift * 0.32 * sin(across * 3.2 - uTime * 5.0 + uPhase);
    w.y += uBend * 0.1 * sin(across * 2.4 + uTime * 3.6 + uPhase);
    w.y += uBend * across * 0.12;

    // At rest the cards still breathe — a slow swell across each one.
    w.z += 0.07 * sin(uTime * 0.7 + uPhase + across * 1.6 + down * 0.6);
    w.y += 0.035 * sin(uTime * 0.55 + uPhase * 1.3 + across * 1.2);

    vSide = clamp(abs(theta) / 0.9, 0.0, 1.0);
    gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec2 uSize;
  uniform float uCorner;
  uniform float uHover;
  uniform float uReady;
  varying vec2 vUv;
  varying float vSide;

  float roundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    vec2 p = (vUv - 0.5) * uSize;
    float d = roundBox(p, uSize * 0.5, uCorner);
    float edge = fwidth(d);
    float alpha = 1.0 - smoothstep(-edge, edge, d);

    vec3 color = texture2D(uMap, vUv).rgb;
    color *= 0.94 + uHover * 0.06;
    // Cards fade into the page as they swing away from the middle.
    alpha *= mix(1.0, 0.25, smoothstep(0.3, 1.0, vSide));

    gl_FragColor = vec4(color, alpha * uReady);
    #include <colorspace_fragment>
  }
`;

/* ---- Scene -------------------------------------------------------------- */

function size() {
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  // On wide screens the height sets the framing. On narrow ones the card
  // has to fit across: work back from the horizontal angle the centre
  // card needs (plus a margin) to the vertical field of view three wants.
  const across = Math.atan((CARD_W / 2) / RADIUS) / 0.8;
  const fitWidth = (2 * Math.atan(Math.tan(across) / camera.aspect) * 180) / Math.PI;
  camera.fov = Math.max(42, fitWidth);
  camera.updateProjectionMatrix();
}

function build() {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0.55, 0);
  camera.lookAt(0, -0.15, -RADIUS);

  // Segmented both ways: the waves and the trailing bottom edge bend the
  // card vertically as well as across.
  const geometry = new THREE.PlaneGeometry(CARD_W, CARD_H, 48, 24);

  cards = items.map((item, i) => {
    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uMap: { value: null },
        uX: { value: 0 },
        uRadius: { value: RADIUS },
        uBend: { value: 0 },
        uHover: { value: 0 },
        uTime: { value: 0 },
        uPhase: { value: i * 1.7 },
        uReady: { value: 0 },
        uSize: { value: new THREE.Vector2(CARD_W, CARD_H) },
        uCorner: { value: CORNER },
      },
      extensions: { derivatives: true },
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);

    paint(item).then((face) => {
      const texture = new THREE.CanvasTexture(face);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      material.uniforms.uMap.value = texture;
      material.uniforms.uReady.value = 1;
    });

    return { item, mesh, material, base: i * STEP, hover: 0 };
  });

  size();
}

/* ---- Input -------------------------------------------------------------- */

const travel = () => section.offsetHeight - window.innerHeight;
/* One full loop over the section: the first card is centred at the top of
   the section and comes round to the centre again at the bottom. */
const loopLength = () => cards.length * STEP;
const maxOffset = loopLength;

/** Distance from the centre, wrapped into one turn of the loop. */
function wrap(x) {
  const L = loopLength();
  return ((((x + L / 2) % L) + L) % L) - L / 2;
}

function progressFromScroll() {
  const rect = section.getBoundingClientRect();
  const t = travel();
  return t > 0 ? Math.min(1, Math.max(0, -rect.top / t)) : 0;
}

function scrollToProgress(p, immediate = true) {
  const y = section.getBoundingClientRect().top + window.scrollY + p * travel();
  if (document.documentElement.classList.contains("lenis")) {
    scrollTo(y, { immediate, offset: 0 });
  } else {
    window.scrollTo(0, y);
  }
}

/** Which card is under the pointer: project each card's edges to screen. */
function hitTest() {
  if (!pointer.inside) return -1;
  const rect = canvas.getBoundingClientRect();
  const nx = ((pointer.x - rect.left) / rect.width) * 2 - 1;
  const ny = -((pointer.y - rect.top) / rect.height) * 2 + 1;
  const v = new THREE.Vector3();
  for (let i = 0; i < cards.length; i++) {
    const x = wrap(cards[i].base - current);
    const a0 = (x - CARD_W / 2) / RADIUS, a1 = (x + CARD_W / 2) / RADIUS;
    if (Math.abs(x) > RADIUS * 1.4) continue;
    const left = v.set(RADIUS * Math.sin(a0), 0, -RADIUS * Math.cos(a0)).project(camera).x;
    const right = v.set(RADIUS * Math.sin(a1), 0, -RADIUS * Math.cos(a1)).project(camera).x;
    const top = v.set(RADIUS * Math.sin(x / RADIUS), CARD_H / 2, -RADIUS * Math.cos(x / RADIUS)).project(camera).y;
    const bottom = v.set(RADIUS * Math.sin(x / RADIUS), -CARD_H / 2, -RADIUS * Math.cos(x / RADIUS)).project(camera).y;
    if (nx > left && nx < right && ny < top && ny > bottom) return i;
  }
  return -1;
}

function bindInput() {
  const onMove = (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    if (pointer.down) {
      const dx = e.clientX - pointer.startX;
      pointer.moved = Math.max(pointer.moved, Math.abs(dx));
      // Dragging left moves the track forward. One card per ~third of the
      // screen width, mapped back into page scroll.
      const perCard = 1 / cards.length;
      const p = pointer.startScroll - (dx / (window.innerWidth / 3)) * perCard;
      scrollToProgress(Math.min(1, Math.max(0, p)));
    }
  };
  const onEnter = () => { pointer.inside = true; };
  const onLeave = () => { pointer.inside = false; };
  const onDown = (e) => {
    pointer.down = true;
    pointer.moved = 0;
    pointer.startX = e.clientX;
    pointer.startScroll = progressFromScroll();
    canvas.dataset.drag = "true";
    canvas.setPointerCapture?.(e.pointerId);
  };
  const onUp = () => {
    if (pointer.down && pointer.moved < 6 && hovered >= 0) {
      window.location.href = cards[hovered].item.querySelector("a").href;
    }
    pointer.down = false;
    canvas.dataset.drag = "false";
  };

  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerenter", onEnter);
  canvas.addEventListener("pointerleave", onLeave);
  canvas.addEventListener("pointerdown", onDown);
  window.addEventListener("pointerup", onUp);

  // Keyboard: focusing a link in the (hidden) list brings its card round.
  items.forEach((item, i) => {
    item.querySelector("a").addEventListener("focus", () => {
      scrollToProgress(i / cards.length, false);
    });
  });

  window.addEventListener("resize", size);

  cleanups.push(() => {
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerenter", onEnter);
    canvas.removeEventListener("pointerleave", onLeave);
    canvas.removeEventListener("pointerdown", onDown);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("resize", size);
  });
}

/* ---- Loop --------------------------------------------------------------- */

const hud = {};
let shown = -1;

function updateHud(index) {
  if (index === shown) return;
  shown = index;
  const item = items[index];
  hud.index.textContent = String(index + 1).padStart(2, "0");
  hud.current.textContent = item.querySelector("a").textContent.trim();
  hud.tags.textContent = item.dataset.tags || "";
}

function tick() {
  frame = requestAnimationFrame(tick);
  if (!visible) return;

  const reduced = prefersReducedMotion();
  const now = performance.now() / 1000;
  const prev = current;
  current += (target - current) * (reduced ? 1 : EASE);
  const v = current - prev;
  // Rises fast, lets go slowly: the cloth keeps moving a beat after the
  // track has stopped, which is most of what reads as "flowing".
  const k = Math.abs(v) > Math.abs(speed) ? 0.25 : SETTLE;
  speed += ((reduced ? 0 : v) - speed) * k;
  const bend = Math.max(-1, Math.min(1, speed * 12)) * BEND;
  const time = reduced ? 0 : now;

  hovered = pointer.down ? hovered : hitTest();
  canvas.dataset.hover = String(hovered >= 0);

  cards.forEach((card, i) => {
    card.hover += ((i === hovered ? 1 : 0) - card.hover) * 0.15;
    card.material.uniforms.uX.value = wrap(card.base - current);
    card.material.uniforms.uBend.value = bend;
    card.material.uniforms.uHover.value = card.hover;
    card.material.uniforms.uTime.value = time;
  });

  const n = cards.length;
  updateHud(((Math.round(current / STEP) % n) + n) % n);
  renderer.render(scene, camera);
}

/* ---- Lifecycle ---------------------------------------------------------- */

export function init(root = document) {
  section = root.querySelector("[data-projects]");
  if (!section) return () => {};

  stage = section.querySelector(".projects__sticky");
  canvas = section.querySelector(".projects__canvas");
  items = Array.from(section.querySelectorAll(".projects__item"));
  hud.index = section.querySelector("[data-projects-index]");
  hud.current = section.querySelector("[data-projects-current]");
  hud.tags = section.querySelector("[data-projects-tags]");
  section.querySelector("[data-projects-total]").textContent = String(items.length).padStart(2, "0");

  // Load three.js only once the section is close, so it costs the hero
  // nothing.
  let started = false;
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      visible = entry.isIntersecting;
      if (visible && !started) {
        started = true;
        start();
      }
    });
  }, { rootMargin: "100% 0px" });
  observer.observe(section);

  return destroy;
}

async function start() {
  try {
    THREE = await import(THREE_URL);
    await document.fonts?.ready;
    build();
  } catch (error) {
    console.warn("[projects] WebGL track unavailable, showing the list:", error);
    return;
  }

  section.dataset.gl = "ready";
  bindInput();

  unsubscribe = onScroll(() => {
    target = progressFromScroll() * maxOffset();
  });
  target = progressFromScroll() * maxOffset();
  current = target;
  frame = requestAnimationFrame(tick);
}

export function destroy() {
  cancelAnimationFrame(frame);
  unsubscribe?.();
  observer?.disconnect();
  cleanups.forEach((fn) => fn());
  cleanups.length = 0;
  cards.forEach(({ material }) => {
    material.uniforms.uMap.value?.dispose();
    material.dispose();
  });
  renderer?.dispose();
  cards = [];
}
