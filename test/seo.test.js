const { test } = require("node:test");
const assert = require("node:assert/strict");
const { sitemapXml, robotsTxt, pageTitle, absoluteUrl, jsonLd, rssFeed, webmasterTags } = require("../lib/seo");
const { rooms, getRoom } = require("../lib/rooms");
const pages = require("../lib/html");

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
  assert.match(xml, /<lastmod>/);
  assert.match(xml, /<changefreq>hourly<\/changefreq>/);
  assert.equal((xml.match(/<url>/g) || []).length >= rooms.length + 1, true);
});

test("robots.txt allows Google, Bing, and search pages", () => {
  const txt = robotsTxt("https://chat.example");
  assert.match(txt, /User-agent: \*/);
  assert.match(txt, /User-agent: Googlebot/);
  assert.match(txt, /User-agent: Bingbot/);
  assert.match(txt, /Allow: \//);
  assert.match(txt, /Allow: \/search/);
  assert.doesNotMatch(txt, /Disallow: \/search/);
  assert.match(txt, /Host: chat\.example/);
  assert.match(txt, /Sitemap: https:\/\/chat\.example\/sitemap\.xml/);
  assert.match(txt, /Sitemap: https:\/\/chat\.example\/feed\.xml/);
});

test("structured data includes search, FAQ, and breadcrumbs", () => {
  const data = jsonLd({
    base: "https://chat.example",
    path: "/",
    title: "Free online chat rooms | chat",
    description: "Free rooms",
    type: "WebSite",
    crumbs: [{ href: "/", label: "Home" }],
    faqs: [{ q: "Is it free?", a: "Yes." }],
    items: [{ name: "Tamil", href: "/tamil-chat-rooms/" }]
  });
  const raw = JSON.stringify(data);
  assert.match(raw, /SearchAction/);
  assert.match(raw, /FAQPage/);
  assert.match(raw, /BreadcrumbList/);
  assert.match(raw, /ItemList/);
  assert.match(raw, /WebApplication/);
});

test("room pages have crawlable headings and related links", () => {
  const html = pages.roomPage(getRoom("tamil"));
  assert.match(html, /<h1>Tamil chat room<\/h1>/);
  assert.match(html, /<link rel="canonical"/);
  assert.match(html, /og:image/);
  assert.match(html, /Related chat rooms/);
  assert.match(html, /googlebot/);
  assert.match(html, /bingbot/);
});

test("RSS feed lists rooms and webmaster tags stay empty by default", () => {
  const xml = rssFeed("https://chat.example", rooms);
  assert.match(xml, /<rss version="2.0">/);
  assert.match(xml, /tamil-chat-rooms/);
  assert.equal(webmasterTags(), "");
});
