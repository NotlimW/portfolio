/**
 * brand.js — the brand book page (brand/), made live.
 *
 * Nothing on that page is typed in twice. Token lists are read straight
 * from the stylesheet's :root rules, so the book can never drift from the
 * site: change tokens.css and the page changes with it.
 *
 *   [data-tokens="--sp-"]          every token with that prefix, or a comma
 *   [data-kind="swatch|..."]       list of exact names, drawn as `kind`
 *   [data-token="--grid-max"]      one value, as text
 *   [data-swatch="--c-ink"]        a big colour card: codes, click to copy
 *   [data-contrast="--a on --b"]   a WCAG contrast check, worked out live
 *   [data-tester]                  the Bricolage tester and its sliders
 *   [data-grid-toggle]             lays the 12 column grid over the page
 *   [data-voice-input]             the voice checker
 *
 * Only runs where [data-brand] is on the page.
 */

import { motionAllowed } from "./motion-prefs.js";

const cleanups = [];
const on = (el, type, fn, opts) => {
  el.addEventListener(type, fn, opts);
  cleanups.push(() => el.removeEventListener(type, fn, opts));
};

/* ---- Reading the tokens ---------------------------------------------- */

/** Every custom property declared on :root, in source order. */
function rootTokens() {
  const names = [];
  const walk = (rules) => {
    for (const rule of rules) {
      if (rule.styleSheet) { try { walk(rule.styleSheet.cssRules); } catch { /* blocked */ } }   // @import
      if (rule.cssRules && !rule.selectorText) walk(rule.cssRules);   // @layer, @media
      if (rule.selectorText === ":root" && !rule.parentRule?.media) {
        for (const prop of rule.style) if (prop.startsWith("--") && !names.includes(prop)) names.push(prop);
      }
    }
  };
  for (const sheet of document.styleSheets) {
    try { walk(sheet.cssRules); } catch { /* cross-origin sheet */ }
  }
  return names;
}

const value = (name, el = document.documentElement) => getComputedStyle(el).getPropertyValue(name).trim();

/** Any CSS colour to [r, g, b, a]. The browser resolves it (var(), color-mix,
 *  oklab and all) and paints one pixel, and the pixel is read back. */
const probe = document.createElement("span");
const canvas = document.createElement("canvas");
canvas.width = canvas.height = 1;
const ctx = canvas.getContext("2d", { willReadFrequently: true });
function rgba(colour, context = document.body) {
  probe.style.color = "";
  probe.style.color = colour;
  context.append(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = "#000";
  ctx.fillStyle = resolved;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b, Math.round((a / 255) * 100) / 100];
}

const hex = ([r, g, b]) => "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();

function cmyk([r, g, b]) {
  const [R, G, B] = [r, g, b].map((v) => v / 255);
  const k = 1 - Math.max(R, G, B);
  if (k >= 1) return [0, 0, 0, 100];
  return [R, G, B].map((v) => Math.round(((1 - v - k) / (1 - k)) * 100)).concat(Math.round(k * 100));
}

function luminance([r, g, b]) {
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

const ratio = (a, b) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

/* ---- Drawing the token lists ----------------------------------------- */

const label = (name) => name.replace(/^--/, "");

function render(box, all) {
  const kind = box.dataset.kind;
  const spec = box.dataset.tokens;
  const skip = (box.dataset.skip || "").split(",").filter(Boolean);
  const names = spec.includes(",")
    ? spec.split(",").map((s) => s.trim())
    : all.filter((n) => n.startsWith(spec) && !skip.includes(n));

  // A box inside a ground reads the values that ground resolves to.
  const context = box;
  box.innerHTML = "";

  names.forEach((name) => {
    const v = value(name, context);
    if (!v) return;
    const row = document.createElement("div");
    row.className = `bb-tok bb-tok--${kind}`;

    if (kind === "swatch" || kind === "swatch-row") {
      const c = rgba(v, box);
      row.innerHTML = `<button type="button" class="bb-tok__chip" style="background:${v}" data-copy-value="${hex(c)}" aria-label="Copy ${hex(c)}"></button>
        <span class="bb-tok__name">${label(name)}</span><span class="bb-tok__val">${hex(c)}${c[3] < 1 ? ` · ${Math.round(c[3] * 100)}%` : ""}</span>`;
    } else if (kind === "space") {
      row.innerHTML = `<span class="bb-tok__name">${label(name)}</span><i class="bb-tok__bar" style="width:${v}"></i><span class="bb-tok__val">${v} · ${Math.round(parseFloat(v) * 16)}px</span>`;
    } else if (kind === "radius") {
      row.innerHTML = `<i class="bb-tok__box" style="border-radius:${v}"></i><span class="bb-tok__name">${label(name)}</span><span class="bb-tok__val">${v}</span>`;
    } else if (kind === "type") {
      if (!/fs-/.test(name)) return;
      const sample = name.includes("bleed") || name.includes("display") ? "Giant" : "The quick brown fox";
      const face = name.includes("bleed") || name.includes("display") ? "bb-tok__sample--display" : "";
      row.innerHTML = `<span class="bb-tok__name">${label(name)}</span><span class="bb-tok__sample ${face}" style="font-size:${v}">${sample}</span><span class="bb-tok__val">${v}</span>`;
    } else if (kind === "ease") {
      const nums = v.match(/-?[\d.]+/g)?.map(Number);
      if (!nums || nums.length !== 4) return;
      const [x1, y1, x2, y2] = nums;
      const P = (x, y) => `${(10 + x * 100).toFixed(1)} ${(110 - y * 100).toFixed(1)}`;
      row.innerHTML = `<button type="button" class="bb-curve" data-ease="${v}" aria-label="Play ${label(name)}">
          <svg viewBox="0 -20 120 160" aria-hidden="true"><path class="bb-curve__axis" d="M 10 110 H 110 M 10 110 V 10"/><path class="bb-curve__handle" d="M ${P(0,0)} L ${P(x1,y1)} M ${P(1,1)} L ${P(x2,y2)}"/><path class="bb-curve__line" d="M ${P(0,0)} C ${P(x1,y1)}, ${P(x2,y2)}, ${P(1,1)}"/></svg>
          <span class="bb-curve__track"><i></i></span>
        </button>
        <span class="bb-tok__name">${label(name)}</span><span class="bb-tok__val">${v}</span>`;
    } else {
      row.innerHTML = `<span class="bb-tok__name">${label(name)}</span><span class="bb-tok__val">${v}</span>`;
    }
    box.append(row);
  });
}

/* ---- Copy to clipboard, with a small confirmation ------------------- */

async function copy(text, el) {
  try { await navigator.clipboard.writeText(text); } catch { return; }
  el.dataset.copied = "";
  clearTimeout(el._t);
  el._t = setTimeout(() => delete el.dataset.copied, 1400);
}

/* ---- The voice checker ----------------------------------------------- */

const TELLS = [
  [/[—–]/g, "A dash. Use a full stop, comma or colon."],
  [/\s-\s/g, "A hyphen used as a dash."],
  [/\bnot (just|only)\b/gi, "\"Not just\": the classic setup line."],
  [/\b(leverag\w*|unlock\w*|elevat\w*|seamless\w*|journey\w*|synerg\w*|robust|empower\w*|harness\w*|delv\w*|tapestry|game[- ]?chang\w*|cutting[- ]edge|next[- ]level|innovative)\b/gi, "A buzzword."],
  [/\bin today's\b/gi, "\"In today's ...\": an opener nobody needs."],
  [/!/g, "An exclamation mark. Let the words carry it."],
];

function checkVoice(text, out) {
  out.innerHTML = "";
  const found = [];
  TELLS.forEach(([re, why]) => {
    const hits = text.match(re);
    if (hits) found.push(`<li><b>${[...new Set(hits.map((h) => h.trim() || "·"))].slice(0, 4).join(", ")}</b><span>${why}</span></li>`);
  });
  const sentences = text.split(/[.!?]+\s/).filter((s) => s.trim());
  const long = sentences.filter((s) => s.split(/\s+/).length > 26).length;
  if (long) found.push(`<li><b>${long} long sentence${long > 1 ? "s" : ""}</b><span>Over 26 words. Split it.</span></li>`);
  out.innerHTML = found.length
    ? found.join("")
    : text.trim() ? `<li class="bb-checker__ok"><b>Sounds like Milton.</b><span>Nothing sticks out.</span></li>` : "";
}

/* ---- Init ------------------------------------------------------------- */

export function init(root = document) {
  const page = root.querySelector("[data-brand]");
  if (!page) return () => {};

  const all = rootTokens();
  page.querySelectorAll("[data-tokens]").forEach((box) => render(box, all));
  page.querySelectorAll("[data-token]").forEach((el) => { el.textContent = value(el.dataset.token); });

  // Big swatches: their codes, and click to copy the hex.
  page.querySelectorAll("[data-swatch]").forEach((card) => {
    const c = rgba(value(card.dataset.swatch));
    const [C, M, Y, K] = cmyk(c);
    card.querySelector("[data-codes]").innerHTML =
      `<span>HEX ${hex(c)}</span><span>RGB ${c.slice(0, 3).map(Math.round).join(" ")}</span><span>CMYK ${C} ${M} ${Y} ${K}</span><span class="bb-swatch__copied">Copied</span>`;
    on(card, "click", () => copy(hex(c), card));
  });
  on(page, "click", (e) => {
    const chip = e.target.closest("[data-copy-value]");
    if (chip) copy(chip.dataset.copyValue, chip);
  });

  // Contrast checks.
  page.querySelectorAll("[data-contrast]").forEach((el) => {
    const [fg, bg] = el.dataset.contrast.split(" on ").map((s) => s.trim());
    const a = rgba(value(fg)), b = rgba(value(bg));
    const r = ratio(a, b);
    const grade = r >= 7 ? "AAA" : r >= 4.5 ? "AA" : r >= 3 ? "AA large" : "Fail";
    el.className = `bb-check bb-check--${grade === "Fail" ? "fail" : "pass"}`;
    el.style.setProperty("--fg", hex(a));
    el.style.setProperty("--bgc", hex(b));
    el.innerHTML = `<span class="bb-check__sample">Aa</span><span class="bb-check__pair">${label(fg)} on ${label(bg)}</span><span class="bb-check__ratio">${r.toFixed(1)}:1</span><span class="bb-check__grade">${grade}</span>`;
  });

  // The type tester.
  const tester = page.querySelector("[data-tester]");
  if (tester) {
    const axes = { wdth: 82, wght: 800, opsz: 12 };
    const apply = () => {
      tester.style.fontVariationSettings = `"opsz" ${axes.opsz}, "wdth" ${axes.wdth}`;
      tester.style.fontWeight = axes.wght;
    };
    page.querySelectorAll("[data-axis]").forEach((input) => {
      on(input, "input", () => {
        axes[input.dataset.axis] = Number(input.value);
        const out = page.querySelector(`[data-out="${input.dataset.axis}"]`);
        if (out) out.textContent = input.value;
        apply();
      });
    });
    apply();
  }

  // Easing curves: press to run a dot along the track with that curve.
  on(page, "click", (e) => {
    const btn = e.target.closest("[data-ease]");
    if (!btn) return;
    const dot = btn.querySelector(".bb-curve__track i");
    const duration = motionAllowed() ? 900 : 1;
    dot.getAnimations().forEach((a) => a.cancel());
    dot.animate([{ left: "0%" }, { left: "calc(100% - 0.75rem)" }],
      { duration, easing: btn.dataset.ease, fill: "forwards" });
  });

  // Grid overlay.
  const toggle = page.querySelector("[data-grid-toggle]");
  if (toggle) {
    on(toggle, "click", () => {
      const onNow = document.documentElement.classList.toggle("bb-show-grid");
      toggle.setAttribute("aria-pressed", String(onNow));
      toggle.firstChild.textContent = onNow ? "Hide the grid" : "Show the grid on this page";
    });
    cleanups.push(() => document.documentElement.classList.remove("bb-show-grid"));
  }

  // Voice checker.
  const input = page.querySelector("[data-voice-input]");
  const output = page.querySelector("[data-voice-output]");
  if (input && output) {
    const run = () => checkVoice(input.value, output);
    on(input, "input", run);
    run();
  }

  return destroy;
}

export function destroy() {
  cleanups.forEach((fn) => fn());
  cleanups.length = 0;
}
