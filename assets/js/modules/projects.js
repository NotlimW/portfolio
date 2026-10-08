/**
 * projects.js — previous work on a flowing ribbon (WebGL).
 *
 * Large cards laid side by side on one band, standing on the page's own
 * dot field (the canvas is transparent). The band is the thing that moves,
 * not the cards: every displacement is a function of where a point sits
 * along the WHOLE band, so neighbouring cards always share one shape and
 * the carousel flows as one ribbon. Idea from jesperlandberg.com, rebuilt
 * here from scratch.
 *
 * How it moves
 *   The section is tall and its stage is sticky, so the page scroll is the
 *   input: progress through the section maps to a position along the band.
 *   The band eases toward that position; the gap between where it is and
 *   where it is going is its speed, and speed
 *     - bows the whole band into one long curve, trailing the way it moves,
 *     - swells a slow wave that always runs through the band,
 *     - draws the cards in a touch, the way a strip tightens when pulled,
 *     - and slides each picture inside its frame (parallax), so the image
 *       lags behind the card that carries it.
 *   The pointer touches the band rather than lighting up a card: where it
 *   rests the band gives way like cloth under a fingertip and a ripple
 *   runs out from it, and moving it sideways drags the whole band along a
 *   little, the same way a scroll does.
 *   The swell rises quickly and lets go slowly, so the band keeps moving a
 *   beat after the scroll stops. At rest it still breathes. The band is a
 *   loop: positions wrap, with the far ends faded out, so there are cards
 *   on both sides from the first frame and the last hands back to the first.
 *   Dragging the canvas moves the page scroll, so drag and scroll are one
 *   input, never two that disagree.
 *
 * How it is drawn
 *   One plane per card, 64 × 24 segments. Each card has two faces painted
 *   from its <li>: the picture (or a flat tone with the title set large),
 *   and an overlay with the shade, number, tags, title and arrow. The
 *   picture is sampled zoomed in, so it has room to slide; the overlay is
 *   not, so the type stays put while the image moves under it. Rounded
 *   corners are cut in the fragment shader with a rounded-box distance.
 *
 * Content
 *   The <ol> in the markup is the source of truth. The canvas is
 *   aria-hidden decoration over it; the list stays in the tab order, and
 *   focusing a link scrolls its card to the middle. If three.js fails to
 *   load, the section simply keeps showing the list.
 */

import { onScroll, scrollTo } from "./smooth-scroll.js";
import { prefersReducedMotion } from "./motion-prefs.js";
import { refresh as refreshParticles } from "./particles.js";

const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

// Phones get portrait cards: on a tall screen a wide card is a thin strip
// across the middle. Decided once, at load (the geometry, the shader and the
// textures are all built to these proportions).
const PORTRAIT = window.matchMedia("(max-width: 47.99rem)").matches;
const CARD_W = PORTRAIT ? 3.6 : 6;
const CARD_H = PORTRAIT ? 4.8 : 3.15;   // phones 3 : 4, wide screens about 1.9 : 1
const GAP = 0.24;
const STEP = CARD_W + GAP;
const VIEW = 8;            // camera distance in front of the band
const CORNER = 0.13;       // corner radius, world units
const GLOW = 0.7;          // room around each card for its hover glow
const ZOOM = 1.16;         // how far the picture is zoomed in, for room to slide
const EASE = 0.058;        // how quickly the band catches the scroll — low = glides
const RISE = 0.22;         // how quickly the swell answers speed
const SETTLE = 0.045;      // how slowly it lets go
const TEX_W = PORTRAIT ? 960 : 1280;
const TEX_H = Math.round(TEX_W * (CARD_H / CARD_W));

let section, stage, canvas, items;
let THREE, renderer, scene, camera, cards = [];
let current = 0, target = 0, speed = 0, swell = 0;
let edge = 10;             // half the visible width of the band, world units
let calm = 1;              // 1 on wide screens, less where one card fills the width
let pxPerUnit = 100;       // CSS px per world unit at the band, for the dot field
const DOTS_DEPTH = 0.6;    // the dot field slides at this share of the cards' speed — it sits behind them
let frame = 0, visible = false, unsubscribe = null, observer = null;
// The band's own clock. It only runs while something is moving, so a band
// at rest is not redrawn sixty times a second for a ripple nobody can see —
// and picks up exactly where it stopped, with no jump.
let clock = 0, lastNow = 0, needsRender = true;
let pointer = { x: 0, y: 0, inside: false, down: false, startX: 0, startScroll: 0, moved: 0 };
let hovered = -1;
let touch = 0;                         // eased 0 … 1 while the pointer is over the band
const touchAt = { x: 0, y: 0 };        // where, on the band's plane
let pointerLastX = 0, pointerPush = 0; // sideways pointer movement, as a push
const cleanups = [];

/** Run in the browser's idle time — one piece of work per idle period. */
const idle = window.requestIdleCallback
  ? (cb) => requestIdleCallback(cb, { timeout: 2000 })
  : (cb) => setTimeout(cb, 60);

/** How long the hero's entrance runs (components/hero.css), plus a margin. */
const AFTER_INTRO = 2600;

/* ---- Card faces --------------------------------------------------------- */

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
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

function surface() {
  const c = document.createElement("canvas");
  c.width = TEX_W;
  c.height = TEX_H;
  return [c, c.getContext("2d")];
}

/** The picture layer: the image (cover), or a flat tone. */
async function paintPicture(item, title) {
  const [c, ctx] = surface();
  const w = TEX_W, h = TEX_H;
  const ink = cssVar("--c-ink") || "#17120E";
  const paper = cssVar("--c-paper") || "#FBFAF7";
  const sun = cssVar("--c-sun") || "#FFD900";
  const tone = item.dataset.tone;
  const img = item.dataset.image ? await loadImage(item.dataset.image) : null;

  if (img) {
    const s = Math.max(w / img.width, h / img.height);
    const iw = img.width * s, ih = img.height * s;
    ctx.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih);
  } else {
    // A flat field carrying the page's own dot grid; the title is set
    // large on the overlay, which does not zoom or slide.
    ctx.fillStyle = tone === "sun" ? sun : "#1E1813";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = tone === "sun" ? "rgba(23,18,14,0.14)" : "rgba(251,250,247,0.09)";
    const step = Math.round(h * 0.06);
    for (let y = step / 2; y < h; y += step) {
      for (let x = step / 2; x < w; x += step) {
        ctx.beginPath();
        ctx.arc(x, y, h * 0.0035, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  return c;
}

/** The overlay: everything that should NOT slide with the picture. */
function paintOverlay(item, title, index, total) {
  const [c, ctx] = surface();
  const w = TEX_W, h = TEX_H;
  // Type unit: the card's height on a wide card (as before), its width on a
  // tall one — so a long title still fits across a portrait card.
  const u = Math.min(h, w * 0.525);
  const pad = PORTRAIT ? w * 0.06 : w * 0.04;
  const ink = cssVar("--c-ink") || "#17120E";
  const paper = cssVar("--c-paper") || "#FBFAF7";
  const sun = cssVar("--c-sun") || "#FFD900";
  const onSun = item.dataset.tone === "sun";
  const hasPicture = Boolean(item.dataset.image);
  const fg = onSun ? ink : paper;
  const radius = (CORNER / CARD_W) * w;

  // A light shade at the foot and a lighter one at the head, only on
  // pictures — enough for the type, not enough to dull the image.
  if (hasPicture) {
    const foot = ctx.createLinearGradient(0, h * 0.55, 0, h);
    foot.addColorStop(0, "rgba(12,9,7,0)");
    foot.addColorStop(1, "rgba(12,9,7,0.5)");
    ctx.fillStyle = foot;
    ctx.fillRect(0, 0, w, h);
    const head = ctx.createLinearGradient(0, 0, 0, h * 0.2);
    head.addColorStop(0, "rgba(12,9,7,0.22)");
    head.addColorStop(1, "rgba(12,9,7,0)");
    ctx.fillStyle = head;
    ctx.fillRect(0, 0, w, h);
  }

  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";

  // Head, left: the label the site uses — a small sun dot, then the tags.
  const label = Math.round(u * (PORTRAIT ? 0.075 : 0.042));
  ctx.textBaseline = "middle";
  const headY = pad + label * 0.55;
  ctx.fillStyle = onSun ? ink : sun;
  ctx.beginPath();
  ctx.arc(pad + label * 0.22, headY, label * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.font = `500 ${label}px Satoshi, sans-serif`;
  ctx.fillText(item.dataset.tags || "", pad + label * 0.75, headY);

  // Head, right: the index, in mono.
  ctx.textAlign = "right";
  ctx.font = `400 ${label}px "JetBrains Mono", monospace`;
  ctx.globalAlpha = 0.85;
  ctx.fillText(`${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`, w - pad, headY);
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";

  // Cards without a picture: the title set large, the way the site sets its
  // giants, closed with a sun full stop.
  if (!hasPicture) {
    const size = Math.round(u * 0.17);
    ctx.font = `800 ${size}px "Bricolage Grotesque", sans-serif`;
    if ("letterSpacing" in ctx) ctx.letterSpacing = `${-size * 0.02}px`;
    ctx.textBaseline = "alphabetic";
    const words = title.split(" ");
    const top = h - pad * 1.2 - (words.length - 1) * size * 0.95;
    words.forEach((word, i) => {
      const y = top + i * size * 0.95;
      ctx.fillStyle = fg;
      ctx.fillText(word, pad, y);
      if (i === words.length - 1) {
        ctx.fillStyle = onSun ? ink : sun;
        ctx.fillText(".", pad + ctx.measureText(word).width, y);
      }
    });
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
  } else {
    // Pictures: the title at the foot, large and light.
    const size = Math.round(u * (PORTRAIT ? 0.16 : 0.105));
    ctx.font = `500 ${size}px Satoshi, sans-serif`;
    if ("letterSpacing" in ctx) ctx.letterSpacing = `${-size * 0.03}px`;
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = fg;
    if (PORTRAIT) {
      // Tall card: the title gets its own lines above "View case", wrapped
      // to the card's width and stacked up from the foot.
      const max = w - pad * 2;
      const lines = [];
      title.split(" ").forEach((word) => {
        const lineNow = lines[lines.length - 1];
        if (lineNow && ctx.measureText(`${lineNow} ${word}`).width <= max) lines[lines.length - 1] = `${lineNow} ${word}`;
        else lines.push(word);
      });
      const foot = h - pad * 1.15 - u * 0.075 * 2.2;
      lines.forEach((line, i) => {
        ctx.fillText(line, pad, foot - (lines.length - 1 - i) * size * 1.0);
      });
    } else {
      ctx.fillText(title, pad, h - pad * 1.15);
    }
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
  }

  // Foot, right: "View case" as a quiet text link — the label face, a
  // hairline under it and a small arrow, no button.
  const ctaSize = Math.round(u * (PORTRAIT ? 0.075 : 0.042));
  ctx.font = `500 ${ctaSize}px Satoshi, sans-serif`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "right";
  const arrow = ctaSize * 0.7;
  const baseX = w - pad - arrow - ctaSize * 0.4;
  const baseY = h - pad * 1.15;
  ctx.fillStyle = fg;
  ctx.fillText("View case", baseX, baseY);
  const textW = ctx.measureText("View case").width;
  ctx.textAlign = "left";
  ctx.strokeStyle = fg;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(baseX - textW, baseY + ctaSize * 0.35);
  ctx.lineTo(w - pad, baseY + ctaSize * 0.35);
  ctx.stroke();
  ctx.globalAlpha = 1;
  // ↗ in the sun (ink on the sun card).
  const ax = w - pad - arrow, ay = baseY - ctaSize * 0.15;
  ctx.strokeStyle = onSun ? ink : sun;
  ctx.lineWidth = ctaSize * 0.12;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(ax + arrow, ay - arrow);
  ctx.moveTo(ax + arrow * 0.35, ay - arrow);
  ctx.lineTo(ax + arrow, ay - arrow);
  ctx.lineTo(ax + arrow, ay - arrow * 0.35);
  ctx.stroke();

  // A hairline just inside the edge, following the rounded corners.
  ctx.strokeStyle = onSun ? "rgba(23,18,14,0.12)" : "rgba(251,250,247,0.16)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(1.5, 1.5, w - 3, h - 3, radius);
  ctx.stroke();

  return c;
}

/* ---- Shaders ------------------------------------------------------------ */

const vertex = /* glsl */ `
  uniform float uX;        // card centre along the band, minus the band offset
  uniform float uSwell;    // signed speed, -1 … 1
  uniform float uTime;
  uniform float uCalm;
  uniform float uEdge;
  uniform vec2 uPointer;   // the pointer on the band's plane, world units
  uniform float uTouch;    // 0 … 1, eased in while the pointer is over the band
  varying vec2 vUv;
  varying float vFade;

  void main() {
    vUv = uv;
    vec3 p = position;
    float s = uSwell * uCalm;
    float drift = abs(s);

    // Pulled cards draw in a touch.
    p.xy *= 1.0 - drift * 0.03;

    // Where this point sits along the whole band.
    float x = uX + p.x;
    float u = x / uEdge;                 // -1 … 1 across the screen

    float y = p.y;
    float z = 0.0;

    // At rest: a very shallow dish, and a slow wave breathing through it.
    z -= 0.55 * u * u;
    y += 0.025 * uCalm * sin(x * 0.32 - uTime * 0.55);
    z += 0.06 * uCalm * sin(x * 0.26 - uTime * 0.4 + 1.3);

    // In motion: the whole band bows into one curve, its ends trailing the
    // way it travels, and the wave swells and quickens.
    y -= s * 0.37 * u * u;
    z -= drift * 0.45 * u * u;
    y += drift * 0.1 * sin(x * 0.42 - uTime * 1.5);
    z += drift * 0.16 * sin(x * 0.34 - uTime * 1.2 + 0.7);
    // …and leans, tops first, like the giant headlines.
    x += s * 0.09 * (p.y / ${(CARD_H / 2).toFixed(3)});

    // The pointer: the band gives way under it and a ripple runs out.
    vec2 toPointer = vec2(x, y) - uPointer;
    float dist = length(toPointer);
    float press = exp(-dist * dist / 2.6) * uTouch;
    z -= press * 0.22;
    z += uTouch * 0.035 * exp(-dist * 0.45) * sin(dist * 2.4 - uTime * 2.4);
    y += press * 0.025 * sin(dist * 2.0 - uTime * 2.0);

    vFade = 1.0 - smoothstep(0.82, 1.18, abs(u));
    gl_Position = projectionMatrix * viewMatrix * vec4(x, y, z, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D uPicture;
  uniform sampler2D uOverlay;
  uniform vec2 uSize;
  uniform float uCorner;
  uniform float uShift;    // how far the picture has slid inside its frame
  uniform float uHover;    // 0 … 1, eased, while the pointer is on this card
  uniform vec3 uSun;
  uniform float uReady;
  varying vec2 vUv;
  varying float vFade;

  float roundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    // The plane is larger than the card by GLOW on every side, so the glow
    // has somewhere to fall. cuv is the card's own 0 … 1.
    vec2 full = uSize + 2.0 * ${GLOW.toFixed(3)};
    vec2 p = (vUv - 0.5) * full;
    vec2 cuv = p / uSize + 0.5;
    float d = roundBox(p, uSize * 0.5, uCorner);
    float edge = fwidth(d);
    float card = 1.0 - smoothstep(-edge, edge, d);

    // The picture, zoomed in and slid sideways: it lags the card.
    float zoom = ${ZOOM.toFixed(3)} + uHover * 0.05;   // a touch closer on hover
    vec2 puv = (cuv - 0.5) / zoom + 0.5 + vec2(uShift, 0.0);
    vec3 color = texture2D(uPicture, puv).rgb;
    color *= 1.0 + uHover * 0.06;

    vec4 over = texture2D(uOverlay, cuv);
    color = mix(color, over.rgb, over.a);

    // Hover: a soft, warm glow behind the card, falling off outside it.
    float outside = max(d, 0.0);
    float glow = exp(-outside / 0.12) * (1.0 - card) * uHover * 0.16;

    vec3 rgb = mix(uSun, color, card);
    float alpha = max(card, glow);
    gl_FragColor = vec4(rgb, alpha * vFade * uReady);
    #include <colorspace_fragment>
  }
`;

/* ---- Scene -------------------------------------------------------------- */

function size() {
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h, false);
  needsRender = true;
  camera.aspect = w / h;
  // The middle card takes about 40 % of a wide screen and most of a narrow
  // one; the field of view is worked back from that.
  // Portrait cards are tall, so a slightly smaller share keeps the captions
  // above and below them clear of the menu button and the dock.
  const share = camera.aspect >= 1 ? 0.4 : PORTRAIT ? 0.72 : 0.86;
  const halfWidth = CARD_W / share / 2;
  const fovH = 2 * Math.atan(halfWidth / VIEW);
  camera.fov = (2 * Math.atan(Math.tan(fovH / 2) / camera.aspect) * 180) / Math.PI;
  camera.updateProjectionMatrix();
  edge = halfWidth + CARD_W * 0.35;
  pxPerUnit = w / (2 * halfWidth);
  // The card's height on screen, so the captions can sit just outside the
  // band on a tall phone screen instead of out in its far corners.
  section.style.setProperty("--band-h", `${Math.round(CARD_H * pxPerUnit)}px`);
  calm = Math.min(1, Math.max(0.4, camera.aspect / 1.4));
  cards.forEach(({ material }) => {
    material.uniforms.uEdge.value = edge;
    material.uniforms.uCalm.value = calm;
  });
}

function makeRenderer() {
  // A full-screen WebGL surface at 3× (or even 2×) on a phone is a lot of
  // fill for photos that are already soft from the zoom; 1.25 reads the
  // same, and the high pixel ratio makes multisampling redundant there.
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  renderer = new THREE.WebGLRenderer({ canvas, antialias: !coarse, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarse ? 1 : 2));

}

function build() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, VIEW);
  camera.lookAt(0, 0, 0);

  const geometry = new THREE.PlaneGeometry(CARD_W + GLOW * 2, CARD_H + GLOW * 2, 72, 28);

  cards = items.map((item, i) => {
    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uPicture: { value: null },
        uOverlay: { value: null },
        uX: { value: 0 },
        uSwell: { value: 0 },
        uTime: { value: 0 },
        uCalm: { value: 1 },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uTouch: { value: 0 },
        uEdge: { value: edge },
        uShift: { value: 0 },
        uHover: { value: 0 },
        uSun: { value: new THREE.Color(cssVar("--c-sun") || "#FFD900").convertSRGBToLinear() },
        uReady: { value: 0 },
        uSize: { value: new THREE.Vector2(CARD_W, CARD_H) },
        uCorner: { value: CORNER },
      },
      extensions: { derivatives: true },
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);

    const title = item.querySelector("a").textContent.trim();
    const texture = (face) => {
      const t = new THREE.CanvasTexture(face);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      // Upload now, while nothing is scrolling, rather than on the first
      // frame the card is drawn.
      renderer.initTexture(t);
      return t;
    };
    idle(() => {
      material.uniforms.uOverlay.value = texture(paintOverlay(item, title, i, items.length));
      needsRender = true;
    });
    // Each picture is painted and uploaded in an idle period of its own:
    // five 1280px canvases drawn and sent to the GPU in one go was a 50ms+
    // frame on its own.
    paintPicture(item, title).then((face) => idle(() => {
      material.uniforms.uPicture.value = texture(face);
      material.uniforms.uReady.value = 1;
      needsRender = true;
    }));

    return { item, mesh, material, base: i * STEP, hover: 0 };
  });
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

/*
 * The band's position along the pin, from the share of it scrolled: even
 * pace through the middle, with a gentle run-up as the section locks and a
 * run-out before it lets go. Linear, the cards started at full speed the
 * moment the pin caught and stopped dead at its end. Same curve as
 * scene.js's data-scene-ease="soft".
 */
const EDGE = 0.14;
const SOFT_V = 1 / (1 - EDGE);
function softEnds(t) {
  if (t < EDGE) return (SOFT_V * t * t) / (2 * EDGE);
  if (t > 1 - EDGE) return 1 - (SOFT_V * (1 - t) ** 2) / (2 * EDGE);
  return SOFT_V * (t - EDGE / 2);
}
/** Inverse of softEnds, for jumping the scroll to put a given card in front. */
function softEndsInverse(y) {
  const a = (SOFT_V * EDGE) / 2;               // value at t = EDGE
  if (y < a) return Math.sqrt((2 * EDGE * y) / SOFT_V);
  if (y > 1 - a) return 1 - Math.sqrt((2 * EDGE * (1 - y)) / SOFT_V);
  return y / SOFT_V + EDGE / 2;
}
const bandProgress = () => softEnds(progressFromScroll());

function scrollToProgress(p, immediate = true) {
  const y = section.getBoundingClientRect().top + window.scrollY + p * travel();
  if (document.documentElement.classList.contains("lenis")) {
    scrollTo(y, { immediate, offset: 0 });
  } else {
    window.scrollTo(0, y);
  }
}

/** Which card is under the pointer: project each card's resting corners. */
function hitTest() {
  if (!pointer.inside) return -1;
  const rect = canvas.getBoundingClientRect();
  const nx = ((pointer.x - rect.left) / rect.width) * 2 - 1;
  const ny = -((pointer.y - rect.top) / rect.height) * 2 + 1;
  const v = new THREE.Vector3();
  for (let i = 0; i < cards.length; i++) {
    const x = wrap(cards[i].base - current);
    if (Math.abs(x) > edge) continue;
    const z = (u) => -0.55 * (u / edge) ** 2;
    const left = v.set(x - CARD_W / 2, 0, z(x - CARD_W / 2)).project(camera).x;
    const right = v.set(x + CARD_W / 2, 0, z(x + CARD_W / 2)).project(camera).x;
    const top = v.set(x, CARD_H / 2, z(x)).project(camera).y;
    const bottom = v.set(x, -CARD_H / 2, z(x)).project(camera).y;
    if (nx > left && nx < right && ny < top && ny > bottom) return i;
  }
  return -1;
}

/* ---- The site cursor ----------------------------------------------------
   The cards are drawn in a canvas, so the cursor (modules/cursor.js) cannot
   tell a card from the space between them. While a card is under the
   pointer, the canvas carries the same markers a link to a case would:
   data-cursor-hover and data-cursor-label="Case". When that changes under
   a still pointer (the band slid a card in or out), a pointermove is
   replayed on the canvas so the cursor updates without waiting for the
   mouse. */
let cursorOnCard = false;

function syncCursor() {
  const on = hovered >= 0 && !pointer.down;
  if (on === cursorOnCard) return;
  cursorOnCard = on;
  if (on) {
    canvas.dataset.cursorHover = "";
    canvas.dataset.cursorLabel = "Case";
  } else {
    delete canvas.dataset.cursorHover;
    delete canvas.dataset.cursorLabel;
  }
  // Ask the cursor to look again at what is under it. It keeps the real
  // pointer position itself; sending it a made-up pointermove with our own
  // remembered coordinates sent the dot to stale spots, or to 0,0.
  window.dispatchEvent(new Event("cursor:refresh"));
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
  // Sleep while the section is far away; the observer wakes the loop again.
  if (!visible) { frame = 0; return; }
  frame = requestAnimationFrame(tick);

  const reduced = prefersReducedMotion();
  const now = performance.now();
  const dt = Math.min(0.064, (now - (lastNow || now)) / 1000);
  lastNow = now;
  // Read the scroll every frame rather than only on scroll events, so a
  // jump (anchor link, resize, restored position) can never strand the band.
  target = bandProgress() * maxOffset();
  const prev = current;
  current += (target - current) * (reduced ? 1 : EASE);
  const v = reduced ? 0 : current - prev;
  // Rises fast, lets go slowly: the band keeps flowing a beat after the
  // scroll has stopped, which is most of what reads as "flowing".
  speed += (v - speed) * (Math.abs(v) > Math.abs(speed) ? RISE : SETTLE);
  // Moving the pointer sideways over the band drags it along a little.
  pointerPush *= 0.9;
  const goal = Math.max(-1, Math.min(1, speed * 4 + pointerPush));
  swell += (goal - swell) * 0.12;

  hovered = pointer.down ? hovered : hitTest();
  canvas.dataset.hover = String(hovered >= 0);
  syncCursor();

  // At rest — band caught up, no swell, no pointer, no hover fading — the
  // last frame is still correct. Skip the redraw.
  const active = pointer.inside || touch > 0.003
    || Math.abs(target - current) > 0.0005 || Math.abs(speed) > 0.00002 || Math.abs(swell) > 0.002
    || cards.some((card, i) => Math.abs((i === hovered && !pointer.down ? 1 : 0) - card.hover) > 0.002);
  if (!active && !needsRender) return;
  needsRender = false;
  if (!reduced) clock += dt;
  const time = reduced ? 0 : clock;

  // Where the pointer meets the band's plane (z = 0), in world units.
  if (pointer.inside) {
    const rect = canvas.getBoundingClientRect();
    // Scrolled out from under a still mouse: no pointerleave fires for
    // that, so check the last known position against the canvas itself.
    if (pointer.y < rect.top || pointer.y > rect.bottom || pointer.x < rect.left || pointer.x > rect.right) {
      pointer.inside = false;
    }
  }
  if (pointer.inside) {
    const rect = canvas.getBoundingClientRect();
    const nx = ((pointer.x - rect.left) / rect.width) * 2 - 1;
    const ny = -((pointer.y - rect.top) / rect.height) * 2 + 1;
    const halfH = Math.tan((camera.fov * Math.PI) / 360) * VIEW;
    const px = nx * halfH * camera.aspect, py = ny * halfH;
    touchAt.x += (px - touchAt.x) * 0.18;
    touchAt.y += (py - touchAt.y) * 0.18;
  }
  touch += ((pointer.inside && !reduced ? 1 : 0) - touch) * 0.06;

  cards.forEach((card, i) => {
    const x = wrap(card.base - current);
    const u = card.material.uniforms;
    card.hover += ((i === hovered && !pointer.down ? 1 : 0) - card.hover) * 0.12;
    card.mesh.renderOrder = card.hover > 0.01 ? -1 : 0;   // glowing card first, under its neighbours
    u.uHover.value = card.hover;
    u.uX.value = x;
    u.uSwell.value = swell;
    u.uTime.value = time;
    u.uPointer.value.set(touchAt.x, touchAt.y);
    u.uTouch.value = touch * calm;
    // The picture slides against the card's own position on screen, plus
    // a little more against its speed — it lags what carries it.
    const room = (1 - 1 / ZOOM) / 2;
    u.uShift.value = Math.max(-room, Math.min(room, (x / edge) * room * 0.85 + swell * room * 0.35));
  });

  // The section's dot field travels sideways with the band, a little slower,
  // so the ground the cards stand on moves too.
  // While the section is pinned the page still scrolls under it; hold the
  // dots still vertically so they only travel sideways.
  const shift = current * pxPerUnit * DOTS_DEPTH;
  const hold = Math.min(travel(), Math.max(0, -section.getBoundingClientRect().top));
  if (Math.abs(shift - (section.particleShiftX || 0)) > 0.25 || hold !== section.particleHoldY) {
    section.particleShiftX = shift;
    section.particleHoldY = hold;
    refreshParticles();
  }

  const n = cards.length;
  updateHud(((Math.round(current / STEP) % n) + n) % n);
  renderer.render(scene, camera);
}

/* ---- Input bindings ------------------------------------------------------ */

function bindInput() {
  const onMove = (e) => {
    if (pointer.inside && !pointer.down) {
      pointerPush += Math.max(-0.18, Math.min(0.18, -(e.clientX - pointerLastX) * 0.0015));
      pointerPush = Math.max(-0.22, Math.min(0.22, pointerPush));
    }
    pointerLastX = e.clientX;
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
  const onEnter = (e) => { pointer.inside = true; pointerLastX = e.clientX; pointer.x = e.clientX; pointer.y = e.clientY; };
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
      scrollToProgress(softEndsInverse(i / cards.length), false);
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

  // Load three.js once the page has settled after load — in idle time, so
  // it costs the hero nothing and is warm (shaders compiled, textures on
  // the GPU) before anyone scrolls to it. Booting it only on approach put
  // all of that in the middle of a scroll. Approaching first still starts it.
  let started = false;
  // Not straight after load, though: locally and on a fast connection load
  // fires within a fraction of a second, which put the whole boot inside the
  // hero's entrance animation. Wait out the intro first.
  const boot = () => { if (!started) { started = true; start(); } };
  const later = () => setTimeout(() => idle(boot), AFTER_INTRO);
  if (document.readyState === "complete") later();
  else window.addEventListener("load", later, { once: true });
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      visible = entry.isIntersecting;
      if (visible && !started) {
        boot();
      } else if (visible && renderer && !frame) {
        frame = requestAnimationFrame(tick);
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
    // One step per idle period: loading, building and compiling in a single
    // go was an 80ms frame.
    // Through a frame first, so two steps never share one idle period.
    const nextIdle = () => new Promise((resolve) => requestAnimationFrame(() => idle(resolve)));
    await nextIdle();
    makeRenderer();
    await nextIdle();
    build();
    await nextIdle();
    size();
    await nextIdle();
    // Compile every shader now instead of on the first visible frame.
    renderer.compile(scene, camera);
  } catch (error) {
    console.warn("[projects] WebGL track unavailable, showing the list:", error);
    return;
  }

  section.dataset.gl = "ready";
  bindInput();

  unsubscribe = onScroll(() => {
    target = bandProgress() * maxOffset();
  });
  target = bandProgress() * maxOffset();
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
    material.uniforms.uPicture.value?.dispose();
    material.uniforms.uOverlay.value?.dispose();
    material.dispose();
  });
  renderer?.dispose();
  cards = [];
}
