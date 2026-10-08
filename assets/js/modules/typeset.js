/**
 * typeset.js — no orphans.
 *
 * The last line of a paragraph or subhead never holds just one or two
 * words: the final three words are tied together with non-breaking spaces,
 * so they always wrap as a group. This is the typesetter's fix, and unlike
 * CSS text-wrap: pretty (which still allows a two-word last line, and is
 * not supported everywhere) it holds in every browser.
 *
 * Runs before split.js and statement.js, so the lines they build from the
 * layout already respect it. Only plain running text is touched: the
 * giants, labels, tags, logos and anything inside SVG are left alone.
 */

const TARGETS = "main p, main li, main dd, main h2, main h3, footer p, footer h2";
const SKIP = "[data-fit], [aria-hidden='true'], .t-label, .case__tags, .logo, nav, svg, button";
const TIE = 2;          // spaces to tie, counted from the end: 2 = last three words
const MIN_WORDS = 6;    // shorter than this and the line is usually whole anyway

const NBSP = " ";
const changed = [];

function tie(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let node;
  while ((node = walker.nextNode())) nodes.push(node);

  const words = nodes.reduce((n, t) => n + (t.data.match(/\S+/g)?.length ?? 0), 0);
  if (words < MIN_WORDS) return;

  // Walk back from the end, replacing the last TIE breaking spaces. Trailing
  // whitespace (source indentation before the closing tag) does not count.
  let left = TIE;
  let seenWord = false;
  for (let i = nodes.length - 1; i >= 0 && left > 0; i--) {
    const t = nodes[i];
    const before = t.data;
    const chars = before.split("");
    for (let j = chars.length - 1; j >= 0 && left > 0; j--) {
      if (/\s/.test(chars[j]) && chars[j] !== NBSP) {
        if (!seenWord) continue;
        // Collapse a run of whitespace (a source line break) into one space.
        let k = j;
        while (k > 0 && /\s/.test(chars[k - 1]) && chars[k - 1] !== NBSP) k--;
        chars.splice(k, j - k + 1, NBSP);
        j = k;
        left--;
      } else {
        seenWord = true;
      }
    }
    const after = chars.join("");
    if (after !== before) {
      changed.push({ node: t, before });
      t.data = after;
    }
  }
}

export function init(root = document) {
  root.querySelectorAll(TARGETS).forEach((el) => {
    if (el.closest(SKIP)) return;
    tie(el);
  });
  return destroy;
}

export function destroy() {
  changed.forEach(({ node, before }) => { node.data = before; });
  changed.length = 0;
}
