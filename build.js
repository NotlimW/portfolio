/**
 * build.js — fills the shared parts of every page from partials/.
 *
 *   node build.js
 *
 * The head, topbar, menu and footer are written once, in partials/, and
 * copied into each page between a pair of markers:
 *
 *   <!-- include: footer -->
 *   …replaced on every build…
 *   <!-- /include -->
 *
 * The pages stay plain static HTML, so the host serves them as they are.
 * Options go on the opening marker:
 *
 *   <!-- include: topbar variant="light" -->   adds .topbar--light
 *
 * The topbar link for the current page gets aria-current="page".
 */

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PARTIALS = path.join(ROOT, "partials");
const PAGES = [
  "index.html",
  "about/index.html",
  "contact/index.html",
  "work/aros-auto/index.html",
  "brand/index.html",
  "404.html",
];

const MARKER = /<!-- include: ([\w-]+)((?:\s+[\w-]+="[^"]*")*) -->[\s\S]*?<!-- \/include -->/g;

/** The URL a page is served at: about/index.html → /about/. */
const urlOf = (page) => "/" + page.replace(/index\.html$/, "");

function render(name, attrs, page) {
  let html = fs.readFileSync(path.join(PARTIALS, `${name}.html`), "utf8").trimEnd();

  if (name === "topbar") {
    if (attrs.variant) html = html.replace('class="topbar"', `class="topbar topbar--${attrs.variant}"`);
    const here = urlOf(page);
    html = html.replace(
      new RegExp(`(<a class="topbar__link" href="${here}")`),
      '$1 aria-current="page"'
    );
  }

  return html;
}

const parseAttrs = (text) =>
  Object.fromEntries([...text.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));

function build() {
  let changed = 0;
  for (const page of PAGES) {
    const file = path.join(ROOT, page);
    const source = fs.readFileSync(file, "utf8");
    const built = source.replace(MARKER, (match, name, attrText) => {
      const open = match.slice(0, match.indexOf("-->") + 3);
      return `${open}\n${render(name, parseAttrs(attrText), page)}\n<!-- /include -->`;
    });
    if (built !== source) {
      fs.writeFileSync(file, built);
      changed++;
    }
  }
  console.log(`build: ${changed} of ${PAGES.length} pages updated`);
}

if (require.main === module) build();

module.exports = { build, PARTIALS };
