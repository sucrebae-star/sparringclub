import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import vm from "node:vm";
import { schedule, contact, programs } from "../../src/academy/content.mjs";
const read = (file) => readFileSync(file, "utf8");
const html = read("dist/index.html");
test("static HTML delivers every requested section without waiting for React", () => {
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  const ids = [
    "about",
    "programs",
    "space",
    "schedule",
    "guide",
    "reservation",
  ];
  const positions = ids.map((id) => html.indexOf(`id="${id}"`));
  assert.ok(
    positions.every(
      (position, i) => position > 0 && (!i || position > positions[i - 1]),
    ),
  );
  for (const [time, program] of schedule) {
    assert.ok(html.includes(`<time>${time}</time>`));
    assert.ok(html.includes(`<td>${program}</td>`));
  }
  for (const program of programs) assert.ok(html.includes(program.name));
  assert.ok(!html.includes("피지컬사관학교"));
  assert.ok(!html.includes("연동 예정"));
  assert.ok(!html.includes("<form"));
  assert.ok(
    html.includes("실제 회원이나 시설을 촬영한 사진이 아닌 AI 콘셉트 이미지"),
  );
  assert.ok(!html.includes("<!--academy-root-->"));
});
test("all images have alternatives and explicit dimensions, with only the hero eager", () => {
  const images = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  assert.equal(images.length, 8);
  for (const image of images) {
    assert.match(image, /alt="[^"]+"/);
    assert.match(image, /width="\d+"/);
    assert.match(image, /height="\d+"/);
    const src = image.match(/src="([^"]+)"/)[1];
    assert.ok(existsSync("dist/" + src), src);
  }
  assert.match(images[0], /fetchPriority="high"/i);
  assert.match(images[0], /loading="eager"/);
  assert.ok(images.slice(1).every((image) => image.includes('loading="lazy"')));
  assert.match(
    html,
    /<source[^>]+media="\(max-width: 700px\)"[^>]+hero-mobile.webp/,
  );
  assert.equal(
    (
      html.match(
        /href="assets\/academy-generated-v1\/boxing-logo-original.png"/g,
      ) || []
    ).length,
    3,
  );
  const facilities = html.split('id="space"')[1].split("</section>")[0];
  assert.ok(facilities.includes("샤워실 · 탈의실 구비"));
  assert.ok(!facilities.includes("<img"));
});
test("real booking, shared club entry and external contact links remain usable without JS", () => {
  const links = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g)].map(
    (m) => ({ tag: m[0], href: m[1] }),
  );
  assert.ok(links.filter((l) => l.href === contact.booking).length >= 4);
  assert.ok(links.some((l) => l.href === "club.html"));
  assert.ok(links.some((l) => l.href === contact.telephone));
  for (const link of links) {
    if (link.href.startsWith("#"))
      assert.ok(html.includes(`id="${link.href.slice(1)}"`), link.href);
    if (link.tag.includes('target="_blank"'))
      assert.ok(link.tag.includes("noopener noreferrer"));
  }
  assert.match(html, /<details class="mobile-menu"/);
});
test("existing club, authentication, booking and install assets are copied byte for byte", () => {
  for (const file of [
    "club.html",
    "club-ui.js",
    "club.css",
    "style.css",
    "booking.js",
    "booking-admin.html",
    "booking-admin.js",
    "manifest.json",
    "icon-192.png",
    "icon-512.png",
  ]) {
    assert.deepEqual(readFileSync("dist/" + file), readFileSync(file), file);
  }
  assert.equal(JSON.parse(read("dist/manifest.json")).start_url, "club.html");
});
test("versioned React/CSS/routing assets and offline shell share one build version", async () => {
  const assets = [
    ...html.matchAll(/(?:src|href)="(academy[^"/]+\.(?:css|js))"/g),
  ].map((m) => m[1]);
  assert.equal(assets.length, 3);
  const versions = assets.map(
    (file) => file.match(/\.([a-f0-9]{16})\.(css|js)$/)?.[1],
  );
  assert.ok(versions.every(Boolean));
  assert.equal(new Set(versions).size, 1);
  for (const file of assets) assert.ok(existsSync("dist/" + file));
  const callbacks = {};
  let precache;
  vm.runInNewContext(read("dist/sw.js"), {
    self: {
      location: { href: "https://example.test/sparringclub/sw.js" },
      addEventListener: (name, callback) => (callbacks[name] = callback),
      skipWaiting() {},
    },
    caches: {
      open: async () => ({
        addAll: async (files) => {
          precache = files;
        },
      }),
    },
    URL,
    Set,
  });
  await new Promise((resolve) =>
    callbacks.install({
      waitUntil: async (promise) => {
        await promise;
        resolve();
      },
    }),
  );
  for (const file of assets)
    assert.ok(precache.includes("/sparringclub/" + file));
  for (const file of precache)
    assert.ok(existsSync("dist/" + file.replace("/sparringclub/", "")), file);
  assert.ok(read("dist/sw.js").includes(versions[0]));
});
