/**
 * dev-server.js — a static file server with no dependencies.
 *
 * The site itself has no build step, so its dev server shouldn't drag in a
 * node_modules tree either. Node's own http and fs are enough.
 *
 *   node dev-server.js [port]
 *
 * Runs build.js first, and again whenever a file in partials/ changes.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const { build, PARTIALS } = require("./build");

const ROOT = __dirname;
const PORT = Number(process.argv[2]) || 5173;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

function resolve(pathname) {
  // Refuse anything that tries to climb out of the project directory.
  const decoded = decodeURIComponent(pathname);
  const safe = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  let filePath = path.join(ROOT, safe);

  if (!filePath.startsWith(ROOT)) return null;

  // Directory URLs resolve to their index.html, so /work/aros-auto/ works
  // exactly as it will once deployed.
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  return fs.existsSync(filePath) ? filePath : null;
}

const server = http.createServer((req, res) => {
  const { pathname } = url.parse(req.url);
  const filePath = resolve(pathname);

  if (!filePath) {
    const notFound = path.join(ROOT, "404.html");
    res.writeHead(404, { "Content-Type": MIME[".html"] });
    res.end(fs.existsSync(notFound) ? fs.readFileSync(notFound) : "404 — not found");
    return;
  }

  res.writeHead(200, {
    "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  fs.createReadStream(filePath).pipe(res);
});

// Shared parts are built into the pages on start, and again whenever a
// partial changes.
build();
fs.watch(PARTIALS, () => build());

server.listen(PORT, () => {
  console.log(`Milton Winroth portfolio → http://localhost:${PORT}`);
});
