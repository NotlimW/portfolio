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
 *
 * Links and assets are written root-absolute (/about/, /assets/…) in the
 * partials and pages, and the build turns every one into a path relative to
 * its page. The site then works wherever it is hosted, including under a
 * sub-path such as username.github.io/portfolio/. 404.html, which a host
 * serves at any depth, resolves against a <base> set by its own head script.
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

/** Turns href="/x" and src="/x" into paths relative to the page. */
function relativize(html, page) {
  const depth = page.split("/").length - 1;
  const up = "../".repeat(depth);
  return html.replace(/\b(href|src)="\/(?!\/)([^"]*)"/g, (m, attr, rest) => {
    const to = depth ? up + rest : rest || "./";
    return `${attr}="${to}"`;
  });
}

const parseAttrs = (text) =>
  Object.fromEntries([...text.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));

function build() {
  let changed = 0;
  for (const page of PAGES) {
    const file = path.join(ROOT, page);
    const source = fs.readFileSync(file, "utf8");
    const built = relativize(source.replace(MARKER, (match, name, attrText) => {
      const open = match.slice(0, match.indexOf("-->") + 3);
      return `${open}\n${render(name, parseAttrs(attrText), page)}\n<!-- /include -->`;
    }), page);
    if (built !== source) {
      fs.writeFileSync(file, built);
      changed++;
    }
  }
  console.log(`build: ${changed} of ${PAGES.length} pages updated`);
}

if (require.main === module) build();

module.exports = { build, PARTIALS };
