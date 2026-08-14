const { test } = require("node:test");
const assert = require("node:assert/strict");
const { sitemapXml, robotsTxt, pageTitle, absoluteUrl } = require("../lib/seo");
const { rooms } = require("../lib/rooms");

test("absolute URLs and titles are unique and readable", () => {
  assert.equal(absoluteUrl("https://chat.example", "/chennai-chat-rooms/"), "https://chat.example/chennai-chat-rooms/");
  assert.match(pageTitle("Chennai Chat Room"), /Chennai Chat Room/);
  assert.notEqual(pageTitle("Chennai Chat Room"), pageTitle("Tamil Chat Room"));
});

test("sitemap lists the home page and every chat room", () => {
  const xml = sitemapXml("https://chat.example", rooms);
  assert.match(xml, /<urlset/);
  assert.match(xml, /https:\/\/chat\.example\/<\/loc>/);
  assert.match(xml, /https:\/\/chat\.example\/chennai-chat-rooms\/<\/loc>/);
  assert.match(xml, /https:\/\/chat\.example\/india-chat-rooms\/<\/loc>/);
  assert.equal((xml.match(/<url>/g) || []).length >= rooms.length + 1, true);
});

test("robots.txt allows crawlers and points to the sitemap", () => {
  const txt = robotsTxt("https://chat.example");
  assert.match(txt, /User-agent: \*/);
  assert.match(txt, /Allow: \//);
  assert.match(txt, /Sitemap: https:\/\/chat\.example\/sitemap\.xml/);
});
