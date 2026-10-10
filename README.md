# Milton Winroth · Portfolio

The portfolio site of Milton Winroth, designer in Stockholm. Plain HTML, CSS
and JavaScript modules, with no build step and no framework.

## Run it locally

```bash
node dev-server.js
```

Serves the site at <http://localhost:5173>. The server has no dependencies.
It resolves directory URLs to their `index.html` and answers unknown paths
with `404.html`, the same way the production host does.

## Shared parts

The head, topbar, menu and footer live once, in `partials/`. Each page
holds a copy between markers:

```html
<!-- include: footer -->
…
<!-- /include -->
```

Edit the partial, never the copy, then run:

```bash
node build.js
```

The dev server runs the build on start and again whenever a partial
changes. The built pages are committed, so the host serves plain HTML with
no build step. `<!-- include: topbar variant="light" -->` gives a page the
light topbar, and the current page's topbar link gets `aria-current`.

## Structure

```
build.js                Copies partials/ into the pages
partials/               head, topbar, menu, footer

index.html              Home
about/                  About me
contact/                Contact
work/aros-auto/         Case study
brand/                  Brand book (linked from the footer tagline)
404.html                Not found

assets/
  css/
    main.css            Entry point: declares the cascade layers, imports the rest
    fonts.css           @font-face for the self-hosted fonts
    reset.css
    tokens.css          Every raw value in the project: colour, type, space, motion
    base.css            Element defaults and the type classes (.t-*)
    layout.css          .shell, .section, grid, stacks and rows
    components/         One file per component or page part
    utilities.css
  js/
    main.js             Boots every module in order
    vendor.js           Motion and Lenis, re-exported
    modules/            One module per behaviour
  fonts/                woff2 files and their licences
  media/                Images, client logos
```

## How the CSS is organised

- **Cascade layers.** `main.css` declares
  `reset, tokens, base, layout, components, utilities` once, so a later layer
  always wins regardless of specificity.
- **Tokens are the only raw values.** Colours, sizes, spacing, radii,
  durations and easings live in `tokens.css`. Components reference them. The
  one exception is a client's own palette, scoped to its case page
  (`--aa-*` in `case.css`).
- **Grounds.** A section declares `data-ground="light"` or `"dark"`. The
  semantic tokens (`--bg`, `--text`, `--line`, `--c-accent`, the glass
  values) resolve per ground, so components never need to know where they
  sit.
- **Naming.** Block, element, modifier: `.case__title`, `.media--hero`.
  State lives mostly in attributes (`[data-inview]`, `[aria-current]`),
  with a few `is-*` classes where a script toggles a whole page state.
- **Motion** reads custom properties written by scripts (`--progress`,
  `--p`). Every effect has a resting state, and `prefers-reduced-motion`
  lands on it.

## How the JavaScript is organised

Each file in `assets/js/modules/` exports `init(root)` and `destroy()`,
except `motion-prefs.js`, a shared helper the others import.
`main.js` runs them in order. Modules find their elements by `data-*`
attributes, never by layout classes, and do nothing on a page without them.

| Hook | Module |
|---|---|
| `data-scene` | `scene.js` writes `--progress` while a section crosses the screen |
| `data-reveal` | `reveal.js` and `split.js` reveal lines, words and media |
| `data-fit`, `data-bleed` | `fit.js` sizes the giant words to a share of the screen |
| `data-particles` | `particles.js` draws the dot field behind a section |
| `data-dock`, `data-menu` | `nav.js`, `menu.js` |
| `data-clients` | `logos.js` runs the logo and tools ribbons |
| `data-masonry` | `masonry.js` builds the creative wall's columns |
| `data-projects` | `projects.js` runs the WebGL project carousel |
| `data-ai-flow` | `ai-flow.js` drives the AI drawings |
| `data-brand` | `brand.js` reads the tokens into the brand book |

Scroll handlers read all layout first and write afterwards, and they write a
custom property only when its value changes.

## Fonts

Self-hosted, all under the SIL Open Font License (licences in
`assets/fonts/`):

- **Bricolage Grotesque** for the giant headlines and the wordmark
- **Plus Jakarta Sans** for everything else
- **Instrument Serif** for the italic signature word
- **Lato** for Aros Auto's brand board on its case page only

## Brand book

`/brand/` documents the visual identity and the tone of voice. Its token
lists, swatches and contrast checks are read from the live stylesheet, so
it stays in step with `tokens.css`.
