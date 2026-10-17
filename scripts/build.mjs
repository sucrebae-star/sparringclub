import { cp, mkdir, rm, writeFile, readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { pathToFileURL, fileURLToPath } from "node:url";
import path from "node:path";
process.chdir(fileURLToPath(new URL("..", import.meta.url)));
// The existing Pages workflow invokes npm run build without an install step.
// Honor its unchanged interface, using only the checked-in dependency lockfile.
try {
  await import("esbuild");
  await import("@tailwindcss/postcss");
  await import("react-dom/server");
} catch (error) {
  if (error.code !== "ERR_MODULE_NOT_FOUND") throw error;
  execFileSync(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["ci", "--include=dev", "--ignore-scripts"],
    { stdio: "inherit" },
  );
}
const { build } = await import("esbuild");
const { default: postcss } = await import("postcss");
const { default: tailwind } = await import("@tailwindcss/postcss");
const files = [
  "club.html",
  "academy.js",
  "booking.js",
  "booking-admin.html",
  "booking-admin.js",
  "style.css",
  "club.css",
  "club-ui.js",
  "manifest.json",
  "robots.txt",
  "sitemap.xml",
  "icon-192.png",
  "icon-512.png",
  "assets",
];
await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
for (const file of files) await cp(file, `dist/${file}`, { recursive: true });
await mkdir("artifacts/build", { recursive: true });
await build({
  entryPoints: ["src/academy/render.jsx"],
  outfile: "artifacts/build/render.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
  jsx: "automatic",
});
const { render } = await import(
  pathToFileURL(path.resolve("artifacts/build/render.mjs")) +
    "?build=" +
    Date.now()
);
const template = await readFile("index.html", "utf8");
if (!template.includes("<!--academy-root-->"))
  throw Error("Homepage template marker missing");
await writeFile(
  "dist/index.html",
  template.replace("<!--academy-root-->", render()),
);
await build({
  entryPoints: ["src/academy/client.jsx"],
  outfile: "dist/academy-app.js",
  bundle: true,
  minify: true,
  platform: "browser",
  format: "iife",
  target: ["es2020"],
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  legalComments: "eof",
});
const css = await postcss([tailwind({ optimize: true })]).process(
  await readFile("academy.css", "utf8"),
  {
    from: path.resolve("academy.css"),
    to: path.resolve("dist/academy.css"),
    map: false,
  },
);
await writeFile("dist/academy.css", css.css);
// Cache versions track the rendered page, CSS and React bundle together.
const digest = createHash("sha256");
for (const file of [
  "index.html",
  "academy.css",
  "academy-app.js",
  "academy.js",
  "club.html",
  "club.css",
  "club-ui.js",
  "style.css",
])
  digest.update(await readFile(`dist/${file}`));
const version = digest.digest("hex").slice(0, 16);
const versioned = {
  "academy.css": `academy.${version}.css`,
  "academy-app.js": `academy-app.${version}.js`,
  "academy.js": `academy-routing.${version}.js`,
};
let html = await readFile("dist/index.html", "utf8");
for (const [source, target] of Object.entries(versioned)) {
  await cp(`dist/${source}`, `dist/${target}`);
  html = html.replace(`"${source}"`, `"${target}"`);
}
await writeFile("dist/index.html", html);
let worker = await readFile("sw.js", "utf8");
worker = worker.replace("academy-local-build", version).replace(
  "/* ACADEMY_BUNDLE */",
  Object.values(versioned)
    .map((file) => `'/${file}',`)
    .join(" "),
);
await writeFile("dist/sw.js", worker);
// Keep the existing static artifact and API route conventions unchanged.
await writeFile(
  "dist/_headers",
  "/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n/sw.js\n  Cache-Control: no-cache\n/*.html\n  Cache-Control: no-cache\n",
);
await writeFile(
  "dist/_routes.json",
  JSON.stringify({ version: 1, include: ["/api/*"], exclude: [] }, null, 2) +
    "\n",
);
console.log(
  "Static homepage rendered with React + Tailwind; preserved club and booking files in dist/.",
);
